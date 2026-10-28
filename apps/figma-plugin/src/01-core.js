// هستهٔ پلاگین: وضعیت مشترک، رنگ، فونت و چیدمان راست‌به‌چپ

const S = {
  /** فونت هر وزن: { regular: {family, style}, ... } */
  fonts: {},
  family: TOKENS.font.family,
  /** متغیرها بر اساس نام کامل، مثل "bg-brand" یا "radius/md" */
  vars: {},
  collections: {},
  textStyles: {},
  effectStyles: {},
  /** استایل متن و افکت آخر کار به‌صورت async وصل می‌شوند */
  pendingText: [],
  pendingEffect: [],
  icons: {},
  bankLogos: {},
  theme: "dark",
  stats: { variables: 0, textStyles: 0, effectStyles: 0, components: 0, sets: 0 },
};

/** جایگزین ?? (محیط اجرای پلاگین فیگما همهٔ نحوهای جدید را ندارد) */
const pick = (a, b) => (a === undefined || a === null ? b : a);

// ---------- رنگ ----------
const rgb = ([r, g, b]) => ({ r, g, b });
const paletteHex = (scale, step) => TOKENS.palette[scale === "brand" ? TOKENS.brandScale : scale][step];
function hexToRgba(h) {
  const s = h.replace("#", "");
  const n = (i) => parseInt(s.slice(i, i + 2), 16) / 255;
  return [n(0), n(2), n(4), 1];
}
/** مقدار واقعی یک توکن معنایی در تم */
function themeRgba(token, mode = S.theme) {
  const v = TOKENS.themes[mode][token];
  if (!v) throw new Error(`Unknown color token: ${token}`);
  return v.rgba ? v.rgba : hexToRgba(paletteHex(v.alias[0], v.alias[1]));
}

/**
 * رنگ برای fills و strokes:
 * "bg-brand" → متغیر تم؛ "firoozeh/500" → متغیر پالت؛ "#fff" یا [r,g,b,a] → رنگ ثابت.
 * opacity اختیاری روی خود paint اعمال می‌شود.
 */
function paint(c, opacity) {
  let rgba, variable;
  if (Array.isArray(c)) rgba = c;
  else if (c.startsWith("#")) rgba = hexToRgba(c);
  else if (c.includes("/")) {
    const [scale, step] = c.split("/");
    rgba = hexToRgba(paletteHex(scale, step));
    variable = S.vars[`color/${scale}/${step}`];
  } else {
    rgba = themeRgba(c);
    variable = S.vars[c];
  }
  let p = { type: "SOLID", color: rgb(rgba), opacity: pick(opacity, 1) * rgba[3] };
  if (variable) {
    // وقتی رنگ به متغیر وصل است، آلفا از خود متغیر می‌آید
    p = figma.variables.setBoundVariableForPaint({ type: "SOLID", color: rgb(rgba), opacity: pick(opacity, 1) }, "color", variable);
  }
  return p;
}

// ---------- فونت ----------
const WEIGHTS = ["light", "regular", "medium", "semibold", "bold", "black"];
const STYLE_ALIASES = {
  light: ["light"],
  regular: ["regular", "normal", "book", "roman"],
  medium: ["medium"],
  semibold: ["semibold", "demibold", "demi"],
  bold: ["bold"],
  black: ["black", "heavy", "extrabold"],
};
const norm = (s) => s.toLowerCase().replace(/[\s_-]/g, "");

/** وزن‌های فونت انتخابی را پیدا و بارگذاری می‌کند؛ وزن ناموجود به نزدیک‌ترین وزن می‌افتد */
async function loadFonts(family) {
  const all = await figma.listAvailableFontsAsync();
  const pick = (fam) => {
    const styles = all.filter((f) => norm(f.fontName.family) === norm(fam)).map((f) => f.fontName);
    if (!styles.length) return null;
    const found = {};
    for (const w of WEIGHTS) {
      found[w] = styles.find((f) => STYLE_ALIASES[w].includes(norm(f.style)));
    }
    return found.regular ? found : null;
  };
  let found = pick(family);
  let usedFamily = family;
  if (!found) {
    found = pick("Vazirmatn") || pick("Inter");
    usedFamily = found ? found.regular.family : "Inter";
  }
  if (!found) throw new Error("No usable font found");
  const order = ["regular", "medium", "semibold", "bold", "black", "light"];
  for (const w of WEIGHTS) {
    if (!found[w]) {
      // نزدیک‌ترین وزن موجود
      const i = order.indexOf(w);
      found[w] = [...order.slice(0, i).reverse(), ...order.slice(i)].map((x) => found[x]).find(Boolean);
    }
  }
  await Promise.all(Object.values(found).map((f) => figma.loadFontAsync(f)));
  S.fonts = found;
  S.family = usedFamily;
  return usedFamily;
}

// ---------- چیدمان ----------
/** تنظیم اندازهٔ فرزند داخل auto layout؛ بعد از append قابل اعمال است */
const SIZING = new WeakMap();
const ALIGN = { start: "MAX", center: "CENTER", end: "MIN", between: "SPACE_BETWEEN" };
const ALIGN_V = { start: "MIN", center: "CENTER", end: "MAX", between: "SPACE_BETWEEN" };
const CROSS_H = { start: "MAX", center: "CENTER", end: "MIN", baseline: "BASELINE" };
const CROSS_V = { start: "MIN", center: "CENTER", end: "MAX", baseline: "BASELINE" };

function bindNum(node, field, value) {
  const v = typeof value === "string" ? S.vars[value] : null;
  if (v) {
    try { node.setBoundVariable(field, v); return; } catch (e) { /* فیلد پشتیبانی نمی‌شود */ }
  }
  node[field] = typeof value === "string" ? numOf(value) : value;
}
/** مقدار عددی "space/4" یا "radius/md" */
function numOf(name) {
  const [group, key] = name.split("/");
  if (group === "space") return TOKENS.space[key];
  if (group === "radius") return TOKENS.radius[key];
  if (S.numbers[name] !== undefined) return S.numbers[name];
  throw new Error(`Unknown number token: ${name}`);
}
S.numbers = {};

function setRadius(node, r) {
  if (r === undefined) return;
  if (Array.isArray(r)) {
    // [شروع-بالا, پایان-بالا, پایان-پایین, شروع-پایین] منطقی؛ شروع = راست
    const [ss, se, ee, es] = r;
    bindNum(node, "topRightRadius", ss);
    bindNum(node, "topLeftRadius", se);
    bindNum(node, "bottomLeftRadius", ee);
    bindNum(node, "bottomRightRadius", es);
    return;
  }
  for (const f of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) bindNum(node, f, r);
}

function effectStyle(node, name) {
  if (!name) return;
  const names = Array.isArray(name) ? name : [name];
  const list = names.map((n) => S.effectStyles[`${S.theme === "dark" ? "Dark" : "Light"}/${n}`] || S.effectStyles[n]).filter(Boolean);
  if (!list.length) return;
  if (list.length === 1) S.pendingEffect.push([node, list[0].id]);
  else node.effects = list.flatMap((s) => s.effects);
}

/**
 * فریم با auto layout راست‌به‌چپ.
 * o: { name, dir: "H"|"V"|"none", gap, p, px, py, pt, pb, ps, pe, w, h, align, cross, fill, stroke, sw, radius, shadow, clip, wrap, opacity }
 * w/h: عدد = ثابت، "fill" = پرکردن والد، "hug" = به اندازهٔ محتوا (پیش‌فرض)
 */
function F(o = {}, children = []) {
  const f = figma.createFrame();
  f.name = o.name || "Frame";
  f.fills = o.fill ? [paint(o.fill, o.fillOpacity)] : [];
  f.clipsContent = !!o.clip;
  const dir = o.dir || "H";
  if (dir !== "none") {
    f.layoutMode = dir === "H" ? "HORIZONTAL" : "VERTICAL";
    if (o.wrap) f.layoutWrap = "WRAP";
    if (o.gap !== undefined) bindNum(f, "itemSpacing", o.gap);
    if (o.wrap && o.rowGap !== undefined) bindNum(f, "counterAxisSpacing", o.rowGap);
    const pad = (k, v) => v !== undefined && bindNum(f, k, v);
    const px = pick(o.px, o.p), py = pick(o.py, o.p);
    pad("paddingTop", pick(o.pt, py));
    pad("paddingBottom", pick(o.pb, py));
    // RTL: شروع = راست
    pad("paddingRight", pick(o.ps, px));
    pad("paddingLeft", pick(o.pe, px));
    if (dir === "H") {
      f.primaryAxisAlignItems = ALIGN[o.align || "start"];
      f.counterAxisAlignItems = CROSS_V[o.cross || "center"];
    } else {
      f.primaryAxisAlignItems = ALIGN_V[o.align || "start"];
      f.counterAxisAlignItems = CROSS_H[o.cross || "start"];
    }
  }
  if (o.stroke) {
    f.strokes = [paint(o.stroke, o.strokeOpacity)];
    f.strokeAlign = o.strokeAlign || "INSIDE";
    if (o.sides) {
      const [t, r, b, l] = o.sides;
      f.strokeTopWeight = t; f.strokeRightWeight = r; f.strokeBottomWeight = b; f.strokeLeftWeight = l;
    } else f.strokeWeight = pick(o.sw, 1);
    if (o.dash) f.dashPattern = o.dash;
  }
  setRadius(f, o.radius);
  effectStyle(f, o.shadow);
  if (o.opacity !== undefined) f.opacity = o.opacity;

  // RTL: در فیگما ترتیب افقی چپ‌به‌راست است، پس فرزندان را برعکس می‌چینیم
  const kids = children.flat(Infinity).filter(Boolean);
  const ordered = dir === "H" ? kids.slice().reverse() : kids;
  for (const k of ordered) f.appendChild(k);
  sizeSelf(f, o, dir);
  if (dir !== "none") for (const k of kids) applySizing(k);
  else {
    // چیدمان آزاد: مختصات منطقی x از راست
    const W = typeof o.w === "number" ? o.w : 100;
    for (const k of kids) {
      const s = SIZING.get(k) || {};
      if (s.x !== undefined) k.x = W - s.x - k.width;
      if (s.y !== undefined) k.y = s.y;
    }
  }
  return f;
}

function sizeSelf(f, o, dir) {
  const W = o.w, H = o.h;
  if (dir === "none") {
    f.resize(typeof W === "number" ? W : 100, typeof H === "number" ? H : 100);
  } else {
    const fixedW = typeof W === "number" || (typeof W === "string" && S.vars[W]);
    const fixedH = typeof H === "number" || (typeof H === "string" && S.vars[H]);
    const horizontal = f.layoutMode === "HORIZONTAL";
    f.primaryAxisSizingMode = (horizontal ? fixedW : fixedH) ? "FIXED" : "AUTO";
    f.counterAxisSizingMode = (horizontal ? fixedH : fixedW) ? "FIXED" : "AUTO";
    if (fixedW || fixedH) {
      const w = typeof W === "number" ? W : fixedW ? numOf(W) : f.width;
      const h = typeof H === "number" ? H : fixedH ? numOf(H) : f.height;
      f.resize(Math.max(w, 0.01), Math.max(h, 0.01));
      if (typeof W === "string" && S.vars[W]) bindNum(f, "width", W);
      if (typeof H === "string" && S.vars[H]) bindNum(f, "height", H);
    }
    if (o.minW) f.minWidth = o.minW;
    if (o.maxW) f.maxWidth = o.maxW;
  }
  SIZING.set(f, { w: W, h: H, x: o.x, y: o.y, absolute: o.absolute, grow: o.grow });
}

function applySizing(k) {
  const s = SIZING.get(k);
  if (!s) return;
  const parent = k.parent;
  if (!parent || parent.layoutMode === "NONE") return;
  if (s.absolute) {
    k.layoutPositioning = "ABSOLUTE";
    if (s.x !== undefined) k.x = parent.width - s.x - k.width;
    if (s.y !== undefined) k.y = s.y;
    return;
  }
  try {
    if (s.w === "fill") k.layoutSizingHorizontal = "FILL";
    else if (s.w === "hug" && (k.type === "TEXT" || k.layoutMode !== "NONE")) k.layoutSizingHorizontal = "HUG";
    if (s.h === "fill") k.layoutSizingVertical = "FILL";
    if (s.grow) k.layoutGrow = 1;
  } catch (e) { /* نوع گره اجازه نمی‌دهد */ }
}

/** متن فارسی؛ s: { style: "Text sm/Medium", color, align, w, maxLines, name } */
function T(text, o = {}) {
  const t = figma.createText();
  const style = S.textStyles[o.style || "Text sm/Regular"];
  const spec = style ? style.spec : { size: TOKENS.font.size.sm, weight: "regular", leading: TOKENS.font.leading.normal };
  t.fontName = S.fonts[o.weight || spec.weight];
  t.fontSize = o.size || spec.size;
  t.lineHeight = { unit: "PIXELS", value: Math.round((o.size || spec.size) * (o.leading || spec.leading)) };
  t.characters = String(text);
  t.name = o.name || String(text).slice(0, 40);
  t.fills = [paint(o.color || "text-primary")];
  t.textAlignHorizontal = { start: "RIGHT", center: "CENTER", end: "LEFT", justify: "JUSTIFIED" }[o.align || "start"];
  if (o.ltr) t.textAlignHorizontal = o.align === "center" ? "CENTER" : "LEFT";
  t.textAutoResize = o.w === "fill" || typeof o.w === "number" ? "HEIGHT" : "WIDTH_AND_HEIGHT";
  if (typeof o.w === "number") t.resize(o.w, t.height);
  if (o.maxLines) { t.textTruncation = "ENDING"; t.maxLines = o.maxLines; }
  if (o.decoration) t.textDecoration = o.decoration;
  if (o.letterSpacing) t.letterSpacing = { unit: "PERCENT", value: o.letterSpacing };
  if (style && !o.size && !o.weight && !o.leading) S.pendingText.push([t, style.node.id]);
  SIZING.set(t, { w: o.w, h: o.h, x: o.x, y: o.y, absolute: o.absolute, grow: o.grow });
  return t;
}

/** مستطیل/بیضی ساده */
function R(o = {}) {
  const r = o.ellipse ? figma.createEllipse() : figma.createRectangle();
  r.name = o.name || (o.ellipse ? "Dot" : "Rect");
  r.resize(pick(o.w, 8), pick(o.h, 8));
  r.fills = o.fill ? [paint(o.fill, o.fillOpacity)] : [];
  if (o.stroke) { r.strokes = [paint(o.stroke)]; r.strokeWeight = pick(o.sw, 1); r.strokeAlign = "INSIDE"; }
  if (!o.ellipse) setRadius(r, o.radius);
  if (o.ellipse && o.arc) r.arcData = o.arc;
  if (o.rotation) r.rotation = o.rotation;
  effectStyle(r, o.shadow);
  SIZING.set(r, { w: o.fillW ? "fill" : undefined, h: o.fillH ? "fill" : undefined, x: o.x, y: o.y, absolute: o.absolute, grow: o.grow });
  return r;
}

/** جای خالی منعطف */
const Spacer = () => F({ name: "Spacer", grow: true, w: 1, h: 1 });

// ---------- ارقام فارسی ----------
const FA = "۰۱۲۳۴۵۶۷۸۹";
const fa = (v) => String(v).replace(/\d/g, (d) => FA[d]);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** افزودن فرزند به فریم موجود با رعایت RTL و اندازه‌دهی */
function add(parent, ...kids) {
  for (const k of kids.flat(Infinity)) {
    if (!k) continue;
    if (parent.layoutMode === "HORIZONTAL" && parent.layoutWrap !== "WRAP") parent.insertChild(0, k);
    else parent.appendChild(k);
    applySizing(k);
  }
  return parent;
}
