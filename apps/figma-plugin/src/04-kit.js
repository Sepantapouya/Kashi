// ساختار کیت: هر کامپوننت یک صفحه، و به‌روزرسانی درجا در اجراهای بعدی
//
// هر صفحه، کامپوننت و آیکونی که پلاگین می‌سازد با pluginData علامت می‌خورد.
// در اجرای بعد (مثلاً با نسخهٔ جدید کاشی) همان گره‌ها پیدا و درجا به‌روز می‌شوند،
// پس instance هایی که در طرح‌ها گذاشته شده‌اند وصل می‌مانند؛ هر چیز جدید هم اضافه می‌شود.

const KEY = { page: "kashi-page", set: "kashi-set", root: "kashi-root" };

/** حاصل‌ضرب دکارتی ویژگی‌ها: { Size: ["sm","md"], State: [...] } → [{Size, State}, ...] */
function combos(axes) {
  return Object.entries(axes).reduce(
    (acc, [k, values]) => acc.flatMap((a) => values.map((v) => Object.assign({}, a, { [k]: v }))),
    [{}],
  );
}

// ---------- ثبت صفحه‌ها ----------
S.groups = [];
S.queue = [];

/** گروه صفحه‌ها (Actions، Forms، ...) که با یک جداکننده در فهرست صفحه‌ها از هم جدا می‌شوند */
function kitPage(emoji, title, titleFa, description) {
  const group = { key: slug(title), emoji, title, titleFa, description };
  S.groups.push(group);
  return group;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** هر بخش یک صفحهٔ جدا می‌شود: «🔘 Button» */
function section(group, title, description, build, opts) {
  const en = title.split(" · ")[0];
  S.queue.push({ id: `${group.key}/${slug(en)}`, group, title, en, description, build, opts: opts || {} });
}

function setThemeMode(node) {
  const theme = S.collections["Kashi · Theme"];
  if (!theme) return;
  const mode = theme.modes[S.theme === "dark" ? "Dark" : "Light"];
  if (!mode) return;
  try { node.setExplicitVariableModeForCollection(theme.node, mode); } catch (e) { /* API قدیمی */ }
}

/** محتوای یک صفحه را می‌سازد؛ کامپوننت‌های قبلی همان صفحه درجا به‌روز می‌شوند */
function renderSection(item, page) {
  // کامپوننت‌های موجود را کنار می‌گذاریم تا در ساخت تازه دوباره استفاده شوند
  S.existing = {};
  for (const n of page.findAll((x) => (x.type === "COMPONENT" || x.type === "COMPONENT_SET") && !!x.getPluginData(KEY.set))) {
    if (n.type === "COMPONENT" && n.parent && n.parent.type === "COMPONENT_SET") continue;
    S.existing[n.getPluginData(KEY.set)] = n;
  }
  for (const n of Object.values(S.existing)) page.appendChild(n);
  for (const n of page.children.slice()) if (n.getPluginData(KEY.root)) n.remove();

  const stack = !!item.opts.stack;
  const holder = F({ name: "Components", dir: stack ? "V" : "H", wrap: !stack, gap: 32, rowGap: stack ? undefined : 32, w: "fill", cross: "start" });
  const root = F({ name: item.en, dir: "V", gap: 40, p: 64, fill: "bg-primary", minW: 1440 }, [
    F({ name: "Header", dir: "V", gap: 8, w: "fill", pb: 32, stroke: "border-secondary", sides: [0, 0, 1, 0] }, [
      T(`Kashi UI · ${item.group.title}`, { style: "Text sm/Semibold", color: "text-brand" }),
      T(item.title, { style: "Display 3xl/Semibold", color: "text-primary" }),
      item.description && T(item.description, { style: "Text md/Regular", color: "text-tertiary", w: 760 }),
    ]),
    holder,
  ]);
  root.setPluginData(KEY.root, "1");
  page.appendChild(root);
  setThemeMode(root);
  item.build(holder);

  // کامپوننتی که در نسخهٔ جدید حذف شده
  for (const n of Object.values(S.existing)) n.remove();
  S.existing = {};
}

// ---------- به‌روزرسانی درجای کامپوننت ----------
const COPY_FIELDS = [
  "layoutWrap", "primaryAxisAlignItems", "counterAxisAlignItems", "itemSpacing", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
  "fills", "strokes", "strokeAlign", "effects", "clipsContent", "opacity", "dashPattern", "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius",
];
const BIND_FIELDS = ["width", "height", "itemSpacing", "counterAxisSpacing", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"];
const AUTO_LAYOUT_ONLY = /^(layoutWrap|primaryAxis|counterAxis|itemSpacing|padding)/;

/** ظاهر و فرزندان فریم تازه را به کامپوننت موجود منتقل می‌کند؛ شناسهٔ کامپوننت و instance ها می‌مانند */
/** تبدیل فریم به کامپوننت با حفظ برچسب CSS (pluginData در تبدیل حفظ نمی‌شود) */
function toComponent(frame) {
  const css = frame.getPluginData("css");
  const comp = figma.createComponentFromNode(frame);
  if (css) comp.setPluginData("css", css);
  return comp;
}

function updateComponent(comp, frame) {
  // اندازه را قبل از جابه‌جایی فرزندان می‌خوانیم؛ بعدش فریم خالی است
  const w = frame.width, h = frame.height;
  comp.setPluginData("css", frame.getPluginData("css"));
  for (const ch of comp.children.slice()) ch.remove();
  for (const f of BIND_FIELDS) {
    if (comp.boundVariables && comp.boundVariables[f]) { try { comp.setBoundVariable(f, null); } catch (e) { /* */ } }
  }
  comp.layoutMode = frame.layoutMode;
  for (const k of COPY_FIELDS) {
    if (frame.layoutMode === "NONE" && AUTO_LAYOUT_ONLY.test(k)) continue;
    const v = frame[k];
    if (v === figma.mixed || v === undefined) continue;
    try { comp[k] = v; } catch (e) { /* فیلد برای این حالت معنا ندارد */ }
  }
  if (frame.layoutWrap === "WRAP") comp.counterAxisSpacing = frame.counterAxisSpacing;
  if (frame.strokeWeight === figma.mixed) {
    for (const k of ["strokeTopWeight", "strokeRightWeight", "strokeBottomWeight", "strokeLeftWeight"]) comp[k] = frame[k];
  } else comp.strokeWeight = frame.strokeWeight;
  for (const ch of frame.children.slice()) comp.appendChild(ch);
  const sizing = frame.layoutMode !== "NONE" ? [frame.primaryAxisSizingMode, frame.counterAxisSizingMode] : null;
  comp.resize(w, h);
  if (sizing) { comp.primaryAxisSizingMode = sizing[0]; comp.counterAxisSizingMode = sizing[1]; }
  for (const f of BIND_FIELDS) {
    const b = frame.boundVariables && frame.boundVariables[f];
    const v = b && S.varById[b.id];
    if (v) { try { comp.setBoundVariable(f, v); } catch (e) { /* */ } }
  }
  frame.remove();
  return comp;
}

/** کامپوننت تکی با کلید ثابت (آیکون، لوگو): اگر هست درجا به‌روز می‌شود، وگرنه ساخته می‌شود */
function upsertComponent(key, frame) {
  const old = S.existing[key];
  let comp;
  if (old && old.type === "COMPONENT") {
    delete S.existing[key];
    S.stats.updated++;
    comp = updateComponent(old, frame);
  } else {
    comp = toComponent(frame);
    S.stats.added++;
  }
  comp.setPluginData(KEY.set, key);
  return comp;
}

/**
 * یک کامپوننت با variant ها.
 * opts: { axes, build(props) → Frame, text: {Prop: [nodeName, default]}, bools: {Prop: [nodeName, default]}, cols, description, docs }
 */
function componentSet(section, name, opts) {
  const list = opts.axes ? combos(opts.axes) : [{}];
  const variantName = (props) => Object.entries(props).map(([k, v]) => `${k}=${v}`).join(", ");
  const wantSet = !!opts.axes;
  let old = S.existing[name];
  if (old && (old.type === "COMPONENT_SET") !== wantSet) { old.remove(); old = null; }
  delete S.existing[name];

  let node;
  const comps = [];
  if (!wantSet) {
    const frame = opts.build({});
    if (old) { node = updateComponent(old, frame); S.stats.updated++; } else { node = toComponent(frame); S.stats.added++; }
    node.name = name;
    section.appendChild(node);
    comps.push(node);
    S.stats.components++;
  } else {
    const byName = {};
    if (old) for (const c of old.children) byName[c.name] = c;
    for (const props of list) {
      const frame = opts.build(props);
      const vn = variantName(props);
      let comp;
      if (byName[vn]) { comp = updateComponent(byName[vn], frame); delete byName[vn]; } else { comp = toComponent(frame); comp.name = vn; }
      comps.push(comp);
      S.stats.components++;
    }
    if (old) {
      node = old;
      section.appendChild(node);
      for (const c of comps) if (c.parent !== node) node.appendChild(c);
      for (const c of Object.values(byName)) c.remove();
      S.stats.updated++;
    } else {
      for (const c of comps) section.appendChild(c);
      node = figma.combineAsVariants(comps, section);
      S.stats.added++;
    }
    node.name = name;
    layoutVariantGrid(section, node, comps, list, opts);
    S.stats.sets++;
  }
  node.setPluginData(KEY.set, name);
  node.description = opts.description || "";
  if (opts.docs) node.documentationLinks = [{ uri: docsUrl(opts.docs) }];

  // ویژگی‌های متنی و بولی؛ کلید قبلی حفظ می‌شود تا override های instance ها بمانند
  const defs = node.componentPropertyDefinitions || {};
  const wire = (map, type, field) => {
    for (const [prop, [nodeName, def]] of Object.entries(map || {})) {
      let key = Object.keys(defs).find((k) => k.split("#")[0] === prop && defs[k].type === type);
      if (!key) { try { key = node.addComponentProperty(prop, type, def); } catch (e) { continue; } }
      for (const c of comps) {
        for (const n of c.findAll((x) => x.name === nodeName)) {
          try { n.componentPropertyReferences = Object.assign({}, n.componentPropertyReferences, { [field]: key }); } catch (e) { /* داخل instance */ }
        }
      }
    }
  };
  wire(opts.text, "TEXT", "characters");
  wire(opts.bools, "BOOLEAN", "visible");
  return node;
}

/**
 * چیدمان جدولی variant ها: یک ویژگی ستون‌ها (State، بعد Size) و بقیه ردیف‌ها؛
 * برچسب ستون‌ها بالا و برچسب ردیف‌ها سمت راست. ستون اول سمت راست است (RTL).
 */
function layoutVariantGrid(section, node, comps, list, opts) {
  const keys = Object.keys(opts.axes);
  const gap = pick(opts.gap, 24), pad = 32;
  const colKey = opts.colAxis || (keys.includes("State") ? "State" : keys.includes("Size") ? "Size" : keys[keys.length - 1]);
  const rowKeys = keys.filter((k) => k !== colKey);
  let cols, rowOf, colOf, rowLabels, colLabels;
  if (!rowKeys.length) {
    // یک ویژگی با مقدارهای زیاد (مثل بانک‌ها): چند ردیف بدون برچسب
    const widest = Math.max(...comps.map((c) => c.width));
    const n = Math.max(1, Math.min(comps.length, Math.floor((1312 - pad * 2 + gap) / (widest + gap))));
    cols = n;
    colOf = (i) => i % n;
    rowOf = (i) => Math.floor(i / n);
    rowLabels = [];
    colLabels = comps.length <= n ? opts.axes[colKey] : [];
  } else {
    const colValues = opts.axes[colKey];
    cols = colValues.length;
    const rowNames = [];
    rowOf = (i) => {
      const nm = rowKeys.map((k) => list[i][k]).join(" · ");
      let r = rowNames.indexOf(nm);
      if (r < 0) { rowNames.push(nm); r = rowNames.length - 1; }
      return r;
    };
    colOf = (i) => colValues.indexOf(list[i][colKey]);
    list.forEach((_, i) => rowOf(i));
    rowLabels = rowNames;
    colLabels = colValues;
  }
  const rows = Math.max(...comps.map((_, i) => rowOf(i))) + 1;
  const colW = Array(cols).fill(0), rowH = Array(rows).fill(0);
  comps.forEach((c, i) => { colW[colOf(i)] = Math.max(colW[colOf(i)], c.width); rowH[rowOf(i)] = Math.max(rowH[rowOf(i)], c.height); });
  const W = colW.reduce((a, b) => a + b, 0) + gap * (cols - 1) + pad * 2;
  const H = rowH.reduce((a, b) => a + b, 0) + gap * (rows - 1) + pad * 2;
  // x ستون از راست
  const colX = [], rowY = [];
  let x = W - pad;
  for (let c = 0; c < cols; c++) { x -= colW[c]; colX[c] = x; x -= gap; }
  let y = pad;
  for (let r = 0; r < rows; r++) { rowY[r] = y; y += rowH[r] + gap; }

  node.layoutMode = "NONE";
  node.resize(W, H);
  comps.forEach((c, i) => {
    if (c.parent !== node) node.appendChild(c);
    c.x = colX[colOf(i)] + colW[colOf(i)] - c.width;
    c.y = rowY[rowOf(i)] + (rowH[rowOf(i)] - c.height) / 2;
  });
  node.fills = [paint("bg-secondary")];
  node.strokes = [paint("border-secondary")];
  node.dashPattern = [6, 4];
  node.cornerRadius = 16;

  // قاب با برچسب‌ها
  const labelW = rowLabels.length ? 168 : 0;
  const headH = colLabels.length ? 32 : 0;
  const frame = F({ name: `${node.name} · grid`, dir: "none", w: W + labelW, h: H + headH });
  section.appendChild(frame);
  frame.appendChild(node);
  node.x = 0;
  node.y = headH;
  colLabels.forEach((v, c) => {
    const t = T(v, { style: "Text xs/Medium", color: "text-tertiary", ltr: true });
    frame.appendChild(t);
    t.x = colX[c] + colW[c] - t.width;
    t.y = 6;
  });
  rowLabels.forEach((v, r) => {
    const t = T(v, { style: "Text xs/Medium", color: "text-tertiary", ltr: true });
    frame.appendChild(t);
    t.x = W + 16;
    t.y = headH + rowY[r] + (rowH[r] - t.height) / 2;
  });
}

// نام‌هایی که در مستندات صفحهٔ دیگری دارند
const DOC_ALIASES = {
  chip: "chips", chart: "charts", stat: "stat-card", "data-table": "table", kbd: "divider", "relative-time": "persian/utilities",
  "card-number-input": "persian/input", "iban-input": "persian/input", "national-id-input": "persian/input", "mobile-input": "persian/input",
  "price-input": "persian/input", "plate-input": "persian/input", "persian-input": "persian/input", "time-input": "persian/input",
  "province-select": "persian/province", "payment-receipt": "persian/receipt", "bank-badge": "persian/bank-logos",
  calendar: "persian/date-picker", "date-picker": "persian/date-picker", "otp-input": "persian/otp",
};
function docsUrl(name) {
  const base = "https://kashi.sepantapouya.com/docs/";
  const target = DOC_ALIASES[name] || name;
  if (target.includes("/")) return `${base}${target}/`;
  if (TOKENS.docPages.components.includes(target)) return `${base}components/${target}/`;
  if (TOKENS.docPages.persian.includes(target)) return `${base}persian/${target}/`;
  return base;
}

/** ساخت ایمن: خطای یک کامپوننت کل کیت را خراب نکند */
function safe(label, fn) {
  try { fn(); } catch (e) {
    S.errors = S.errors || [];
    S.errors.push(`${label}: ${e && e.message ? e.message : e}`);
  }
}
