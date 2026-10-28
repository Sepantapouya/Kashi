// متغیرها (Variables)، استایل‌های متن و افکت — همه از روی توکن‌های @kashi-ui/tokens

let existingVars = null;
let existingCollections = null;

async function getCollection(name, modes) {
  existingCollections = existingCollections || (await figma.variables.getLocalVariableCollectionsAsync());
  let c = existingCollections.find((x) => x.name === name);
  if (!c) c = figma.variables.createVariableCollection(name);
  // نام mode ها را یکی می‌کند و mode های کم را می‌سازد
  const ids = {};
  modes.forEach((m, i) => {
    if (c.modes[i]) {
      if (c.modes[i].name !== m) c.renameMode(c.modes[i].modeId, m);
      ids[m] = c.modes[i].modeId;
    } else {
      // پلن رایگان فیگما فقط یک mode دارد؛ بقیه را بی‌صدا رد می‌کنیم
      try { ids[m] = c.addMode(m); } catch (e) { S.limitedModes = true; }
    }
  });
  S.collections[name] = { node: c, modes: ids };
  return { c, ids };
}

/** مقدار برای mode؛ اگر mode ساخته نشده باشد (پلن رایگان) رد می‌شود */
function setVal(v, ids, mode, value) {
  if (ids[mode]) v.setValueForMode(ids[mode], value);
}

async function getVariable(c, name, type, scopes) {
  existingVars = existingVars || (await figma.variables.getLocalVariablesAsync());
  let v = existingVars.find((x) => x.name === name && x.variableCollectionId === c.id);
  if (!v) {
    v = figma.variables.createVariable(name, c, type);
    existingVars.push(v);
  }
  if (scopes) v.scopes = scopes;
  S.stats.variables++;
  return v;
}

const COLOR_SCOPES = {
  bg: ["FRAME_FILL", "SHAPE_FILL"],
  text: ["TEXT_FILL"],
  border: ["STROKE_COLOR"],
};
const rgbaObj = ([r, g, b, a]) => ({ r, g, b, a });

async function buildVariables() {
  existingVars = null;
  existingCollections = null;

  // ---- پالت
  const prim = await getCollection("Kashi · Primitives", ["Value"]);
  for (const [scale, steps] of Object.entries(TOKENS.palette)) {
    for (const [step, hex] of Object.entries(steps)) {
      const v = await getVariable(prim.c, `color/${scale}/${step}`, "COLOR", ["ALL_SCOPES"]);
      v.setValueForMode(prim.ids.Value, rgbaObj(hexToRgba(hex)));
      S.vars[`color/${scale}/${step}`] = v;
    }
  }
  // brand فقط نام مستعار است؛ برای عوض کردن رنگ برند این‌ها را به پالت دیگری وصل کنید
  for (const step of Object.keys(TOKENS.palette[TOKENS.brandScale])) {
    const v = await getVariable(prim.c, `color/brand/${step}`, "COLOR", ["ALL_SCOPES"]);
    v.setValueForMode(prim.ids.Value, figma.variables.createVariableAlias(S.vars[`color/${TOKENS.brandScale}/${step}`]));
    v.description = "رنگ برند — برای تغییر برند، این را به یک رنگ دیگر از پالت وصل کنید";
    S.vars[`color/brand/${step}`] = v;
  }

  // ---- تم تیره و روشن
  const theme = await getCollection("Kashi · Theme", S.theme === "light" ? ["Light", "Dark"] : ["Dark", "Light"]);
  for (const token of Object.keys(TOKENS.themes.dark)) {
    const scopes = COLOR_SCOPES[token.split("-")[0]] || ["ALL_SCOPES"];
    const v = await getVariable(theme.c, token.replace(/^(bg|text|border)-/, "$1/"), "COLOR", scopes);
    for (const [mode, key] of [["Dark", "dark"], ["Light", "light"]]) {
      const val = TOKENS.themes[key][token];
      setVal(v, theme.ids, mode, val.alias ? figma.variables.createVariableAlias(S.vars[`color/${val.alias[0]}/${val.alias[1]}`]) : rgbaObj(val.rgba));
    }
    S.vars[token] = v;
  }

  // ---- گردی گوشه‌ها با چهار حالت (همان --k-radius-factor)
  const radius = await getCollection("Kashi · Radius", ["Default", "Sharp", "Soft", "Round"]);
  const factors = { Default: 1, Sharp: 0, Soft: 0.5, Round: 1.75 };
  const radii = Object.assign({}, TOKENS.radius, { checkbox: 5 });
  for (const [k, base] of Object.entries(radii)) {
    const v = await getVariable(radius.c, `radius/${k}`, "FLOAT", ["CORNER_RADIUS"]);
    for (const [mode, f] of Object.entries(factors)) setVal(v, radius.ids, mode, k === "full" ? 9999 : base * f);
    S.vars[`radius/${k}`] = v;
    S.numbers[`radius/${k}`] = base;
  }

  // ---- فاصله‌ها
  const space = await getCollection("Kashi · Spacing", ["Value"]);
  for (const [k, val] of Object.entries(TOKENS.space)) {
    const v = await getVariable(space.c, `space/${k.replace(".", "_")}`, "FLOAT", ["GAP", "WIDTH_HEIGHT"]);
    v.setValueForMode(space.ids.Value, val);
    S.vars[`space/${k}`] = v;
  }

  // ---- تراکم: ارتفاع و فاصلهٔ داخلی کنترل‌ها (همان --k-density)
  const density = await getCollection("Kashi · Density", ["Default", "Compact", "Comfortable"]);
  const dens = { Default: 1, Compact: 0.875, Comfortable: 1.125 };
  const controls = {
    "control/height/xs": 28, "control/height/sm": 36, "control/height/md": 40, "control/height/lg": 44, "control/height/xl": 48,
    "control/padding/xs": 8, "control/padding/sm": 12, "control/padding/md": 14, "control/padding/lg": 18, "control/padding/xl": 20,
    "input/height/sm": 36, "input/height/md": 40, "input/height/lg": 44, "input/padding": 14,
    "card/padding/sm": 16, "card/padding/md": 24, "card/padding/lg": 32,
    "menu/item-height": 36, "tab/height": 40, "alert/padding": 16,
  };
  for (const [k, base] of Object.entries(controls)) {
    const v = await getVariable(density.c, k, "FLOAT", [k.includes("height") ? "WIDTH_HEIGHT" : "GAP"]);
    for (const [mode, f] of Object.entries(dens)) setVal(v, density.ids, mode, Math.round(base * f));
    S.vars[k] = v;
    S.numbers[k] = base;
  }

  // ---- تایپوگرافی؛ فونت دلخواه (حتی فونت پولی) با عوض کردن یک متغیر
  const typo = await getCollection("Kashi · Typography", ["Default", "Compact", "Large"]);
  const scales = { Default: 1, Compact: 0.9375, Large: 1.125 };
  const fam = await getVariable(typo.c, "font/family/sans", "STRING", ["FONT_FAMILY"]);
  const disp = await getVariable(typo.c, "font/family/display", "STRING", ["FONT_FAMILY"]);
  for (const mode of Object.keys(typo.ids)) {
    setVal(fam, typo.ids, mode, S.family);
    setVal(disp, typo.ids, mode, S.family);
  }
  fam.description = "نام فونت متن؛ هر فونتی که روی سیستم نصب است (مثل IRANSans یا Yekan Bakh)";
  S.vars["font/family/sans"] = fam;
  S.vars["font/family/display"] = disp;
  for (const w of WEIGHTS) {
    const v = await getVariable(typo.c, `font/weight/${w}`, "STRING", ["FONT_STYLE"]);
    for (const mode of Object.keys(typo.ids)) setVal(v, typo.ids, mode, S.fonts[w].style);
    S.vars[`font/weight/${w}`] = v;
  }
  for (const [k, size] of Object.entries(TOKENS.font.size)) {
    const v = await getVariable(typo.c, `font/size/${k}`, "FLOAT", ["FONT_SIZE"]);
    for (const [mode, f] of Object.entries(scales)) setVal(v, typo.ids, mode, Math.round(size * f));
    S.vars[`font/size/${k}`] = v;
    for (const [kind, leading] of [["text", TOKENS.font.leading.normal], ["display", TOKENS.font.leading.tight]]) {
      const lh = await getVariable(typo.c, `font/line-height/${kind}-${k}`, "FLOAT", ["LINE_HEIGHT"]);
      for (const [mode, f] of Object.entries(scales)) setVal(lh, typo.ids, mode, Math.round(size * f * leading));
      S.vars[`font/line-height/${kind}-${k}`] = lh;
    }
  }
}

// ---------- استایل متن ----------
const TEXT_WEIGHTS = { Regular: "regular", Medium: "medium", Semibold: "semibold", Bold: "bold" };

async function buildTextStyles() {
  const existing = await figma.getLocalTextStylesAsync();
  const make = async (name, sizeKey, weight, kind) => {
    let st = existing.find((s) => s.name === name);
    if (!st) st = figma.createTextStyle();
    st.name = name;
    const size = TOKENS.font.size[sizeKey];
    const leading = kind === "display" ? TOKENS.font.leading.tight : TOKENS.font.leading.normal;
    st.fontName = S.fonts[weight];
    st.fontSize = size;
    st.lineHeight = { unit: "PIXELS", value: Math.round(size * leading) };
    st.letterSpacing = { unit: "PERCENT", value: kind === "display" && size >= 36 ? -1 : 0 };
    st.description = `${size}px · ${weight} · line-height ${leading}`;
    const bind = (field, key) => { try { if (S.vars[key]) st.setBoundVariable(field, S.vars[key]); } catch (e) { /* قدیمی */ } };
    bind("fontFamily", kind === "display" ? "font/family/display" : "font/family/sans");
    bind("fontStyle", `font/weight/${weight}`);
    bind("fontSize", `font/size/${sizeKey}`);
    bind("lineHeight", `font/line-height/${kind}-${sizeKey}`);
    S.textStyles[name] = { node: st, spec: { size, weight, leading } };
    S.stats.textStyles++;
  };
  for (const sizeKey of ["6xl", "5xl", "4xl", "3xl", "2xl", "xl"]) {
    for (const [label, w] of Object.entries(TEXT_WEIGHTS)) await make(`Display ${sizeKey}/${label}`, sizeKey, w, "display");
  }
  for (const sizeKey of ["xl", "lg", "md", "sm", "xs"]) {
    for (const [label, w] of Object.entries(TEXT_WEIGHTS)) await make(`Text ${sizeKey}/${label}`, sizeKey, w, "text");
  }
}

// ---------- استایل افکت ----------
function toEffect(e) {
  const out = { type: e.type, color: rgbaObj(e.rgba), offset: { x: e.x, y: e.y }, radius: e.blur, spread: e.spread, visible: true, blendMode: "NORMAL" };
  if (e.type === "DROP_SHADOW") out.showShadowBehindNode = false;
  return out;
}

async function buildEffectStyles() {
  const existing = await figma.getLocalEffectStylesAsync();
  const make = (name, list, description) => {
    let st = existing.find((s) => s.name === name);
    if (!st) st = figma.createEffectStyle();
    st.name = name;
    st.effects = list.map(toEffect);
    if (description) st.description = description;
    S.effectStyles[name] = st;
    S.stats.effectStyles++;
  };
  for (const [mode, label] of [["dark", "Dark"], ["light", "Light"]]) {
    const E = TOKENS.effects[mode];
    for (const k of ["xs", "sm", "md", "lg", "xl", "2xl"]) make(`${label}/Shadow/${k}`, E[`shadow-${k}`]);
    make(`${label}/Focus ring/brand`, E["ring-brand"], "حلقهٔ فوکوس نرم (WCAG 2.4.7)");
    make(`${label}/Focus ring/error`, E["ring-error"]);
    make(`${label}/Skeuomorphic`, E["shadow-skeuomorphic"]);
    // ترکیب‌های آماده برای کامپوننت‌ها
    make(`${label}/Button`, [...E["shadow-xs"], ...E["shadow-skeuomorphic"]], "سایهٔ اسکئومورفیک دکمه");
    make(`${label}/Button focus`, [...E["shadow-xs"], ...E["shadow-skeuomorphic"], ...E["ring-brand"]]);
    make(`${label}/Button danger focus`, [...E["shadow-xs"], ...E["shadow-skeuomorphic"], ...E["ring-error"]]);
    make(`${label}/Input focus`, [...E["shadow-xs"], ...E["ring-brand"]]);
    make(`${label}/Input error focus`, [...E["shadow-xs"], ...E["ring-error"]]);
    make(`${label}/Elevated`, [...E["shadow-lg"], ...E.highlight]);
    make(`${label}/Popover`, [...E["shadow-xl"], ...E.highlight]);
  }
}
