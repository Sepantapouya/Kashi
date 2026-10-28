// شبیه‌ساز سخت‌گیر API فیگما برای تست پلاگین بدون باز کردن فیگما.
// مقادیر نامعتبر (enum اشتباه، رنگ با a، فیلد ناشناخته، اندازهٔ صفر، فونت بارگذاری‌نشده و ...) خطا می‌دهند.

let uid = 0;
const id = () => `${++uid}:0`;

const ENUMS = {
  layoutMode: ["NONE", "HORIZONTAL", "VERTICAL"],
  layoutWrap: ["NO_WRAP", "WRAP"],
  primaryAxisAlignItems: ["MIN", "CENTER", "MAX", "SPACE_BETWEEN"],
  counterAxisAlignItems: ["MIN", "CENTER", "MAX", "BASELINE"],
  primaryAxisSizingMode: ["FIXED", "AUTO"],
  counterAxisSizingMode: ["FIXED", "AUTO"],
  layoutSizingHorizontal: ["FIXED", "HUG", "FILL"],
  layoutSizingVertical: ["FIXED", "HUG", "FILL"],
  layoutPositioning: ["AUTO", "ABSOLUTE"],
  strokeAlign: ["INSIDE", "OUTSIDE", "CENTER"],
  textAlignHorizontal: ["LEFT", "CENTER", "RIGHT", "JUSTIFIED"],
  textAlignVertical: ["TOP", "CENTER", "BOTTOM"],
  textAutoResize: ["NONE", "WIDTH_AND_HEIGHT", "HEIGHT", "TRUNCATE"],
  textTruncation: ["DISABLED", "ENDING"],
  textDecoration: ["NONE", "UNDERLINE", "STRIKETHROUGH"],
};

const BINDABLE = new Set([
  "width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight", "itemSpacing", "counterAxisSpacing",
  "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius",
  "strokeWeight", "opacity", "visible", "characters",
]);
const TEXT_BINDABLE = new Set(["fontFamily", "fontSize", "fontStyle", "fontWeight", "lineHeight", "letterSpacing", "paragraphSpacing"]);

export const issues = [];
const fail = (msg) => { throw new Error(msg); };

const MIXED = Symbol("mixed");
function checkPaint(p) {
  if (!p || typeof p !== "object") fail("paint must be object");
  if (p.type === "IMAGE") { if (!p.imageHash) fail("image paint needs imageHash"); return; }
  if (p.type === "GRADIENT_LINEAR") { if (!Array.isArray(p.gradientTransform) || !p.gradientStops.length) fail("bad gradient"); for (const st of p.gradientStops) if (Object.keys(st.color).sort().join() !== "a,b,g,r") fail("gradient stop needs rgba"); return; }
  if (p.type !== "SOLID") fail(`paint type ${p.type}`);
  const keys = Object.keys(p.color || {});
  if (keys.sort().join() !== "b,g,r") fail(`SOLID color must have only r,g,b: ${keys}`);
  for (const k of ["r", "g", "b"]) if (!(p.color[k] >= 0 && p.color[k] <= 1)) fail(`color.${k} out of range: ${p.color[k]}`);
  if (p.opacity !== undefined && !(p.opacity >= 0 && p.opacity <= 1)) fail(`opacity out of range: ${p.opacity}`);
}
function checkEffect(e) {
  if (!["DROP_SHADOW", "INNER_SHADOW"].includes(e.type)) fail(`effect type ${e.type}`);
  for (const k of ["r", "g", "b", "a"]) if (!(e.color[k] >= 0 && e.color[k] <= 1)) fail(`effect color.${k}`);
  for (const k of ["offset", "radius", "visible", "blendMode"]) if (e[k] === undefined) fail(`effect missing ${k}`);
}

class Node {
  constructor(type) {
    this.type = type;
    this.id = id();
    this.name = type;
    this.children = [];
    this.parent = null;
    this.visible = true;
    this.removed = false;
    this.x = 0; this.y = 0;
    this._w = 100; this._h = 100;
    this.boundVariables = {};
    this.pluginData = {};
    this._props = {};
  }
  get width() { return layoutSize(this, "w"); }
  get height() { return layoutSize(this, "h"); }
  resize(w, h) {
    if (!(w >= 0.01) || !(h >= 0.01)) fail(`resize(${w}, ${h}) on ${this.name}: must be >= 0.01`);
    this._w = w; this._h = h;
    if (this.layoutMode && this.layoutMode !== "NONE") {
      // resize ثابت می‌کند
      if (this.layoutMode === "HORIZONTAL") { this.primaryAxisSizingMode = "FIXED"; this.counterAxisSizingMode = "FIXED"; }
      else { this.primaryAxisSizingMode = "FIXED"; this.counterAxisSizingMode = "FIXED"; }
    }
    if (this.type === "TEXT" && this.textAutoResize === "WIDTH_AND_HEIGHT") this.textAutoResize = "HEIGHT";
  }
  rescale(s) { if (!(s > 0)) fail(`rescale(${s})`); this._w *= s; this._h *= s; }
  appendChild(n) { return this.insertChild(this.children.length, n); }
  insertChild(i, n) {
    if (!(n instanceof Node)) fail("appendChild: not a node");
    if (n === this) fail("cannot append to itself");
    if ((n.type === "PAGE") !== (this.type === "DOCUMENT")) fail(`cannot put ${n.type} in ${this.type}`);
    if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1);
    this.children.splice(i, 0, n);
    n.parent = this;
    return n;
  }
  remove() {
    if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
    this.parent = null; this.removed = true;
  }
  findAll(fn = () => true) {
    const out = [];
    const walk = (n) => { for (const c of n.children) { if (fn(c)) out.push(c); walk(c); } };
    walk(this);
    return out;
  }
  findOne(fn) { return this.findAll(fn)[0] || null; }
  getPluginData(k) { return this.pluginData[k] || ""; }
  async loadAsync() {}
  setRangeFills(start, end, fills) {
    if (this.type !== "TEXT") fail("setRangeFills on non-text");
    if (!(start >= 0 && end <= this.characters.length && start < end)) fail(`setRangeFills range ${start}-${end}`);
    fills.forEach(checkPaint);
  }
  setBoundVariable(field, v) {
    if (v === null) { delete this.boundVariables[field]; return; }
    if (this.type === "TEXT" && TEXT_BINDABLE.has(field)) {
      const want = ["fontFamily", "fontStyle"].includes(field) ? "STRING" : "FLOAT";
      if (v.resolvedType !== want) fail(`text ${field} needs ${want}`);
      this.boundVariables[field] = { type: "VARIABLE_ALIAS", id: v.id };
      return;
    }
    if (!BINDABLE.has(field)) fail(`setBoundVariable: field ${field} not bindable on ${this.type}`);
    if (!v || !v.resolvedType) fail(`setBoundVariable(${field}): not a variable`);
    if (field === "visible" ? v.resolvedType !== "BOOLEAN" : field === "characters" ? v.resolvedType !== "STRING" : v.resolvedType !== "FLOAT") fail(`setBoundVariable(${field}): wrong type ${v.resolvedType}`);
    if (field === "width" || field === "height") { if (field === "width") this._w = v._value(); else this._h = v._value(); }
    this.boundVariables[field] = { type: "VARIABLE_ALIAS", id: v.id };
  }
  setExplicitVariableModeForCollection(c, modeId) {
    if (!c || !c.modes || !c.modes.some((m) => m.modeId === modeId)) fail("setExplicitVariableModeForCollection: bad args");
  }
  async setTextStyleIdAsync(sid) { if (this.type !== "TEXT") fail("setTextStyleIdAsync on non-text"); if (!STYLES.has(sid)) fail("unknown text style"); this.textStyleId = sid; }
  async setEffectStyleIdAsync(sid) { if (!STYLES.has(sid)) fail("unknown effect style"); this.effectStyleId = sid; }
  setPluginData(k, v) { if (typeof v !== "string") fail("pluginData must be string"); this.pluginData[k] = v; }
}

const PROPS = {
  common: ["name", "visible", "x", "y", "opacity", "fills", "strokes", "strokeWeight", "strokeAlign", "effects", "rotation", "constraints", "layoutSizingHorizontal", "layoutSizingVertical", "layoutGrow", "layoutPositioning", "layoutAlign", "description", "documentationLinks", "componentPropertyReferences", "dashPattern", "minWidth", "maxWidth", "minHeight", "locked", "expanded", "textStyleId", "effectStyleId"],
  frame: ["layoutMode", "layoutWrap", "itemSpacing", "counterAxisSpacing", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "primaryAxisAlignItems", "counterAxisAlignItems", "primaryAxisSizingMode", "counterAxisSizingMode", "clipsContent", "cornerRadius", "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius", "strokeTopWeight", "strokeBottomWeight", "strokeLeftWeight", "strokeRightWeight", "itemReverseZIndex"],
  rect: ["cornerRadius", "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius", "arcData"],
  text: ["fontName", "fontSize", "lineHeight", "letterSpacing", "characters", "textAlignHorizontal", "textAlignVertical", "textAutoResize", "textTruncation", "maxLines", "textDecoration"],
};
const allowed = {
  FRAME: [...PROPS.common, ...PROPS.frame],
  COMPONENT: [...PROPS.common, ...PROPS.frame],
  COMPONENT_SET: [...PROPS.common, ...PROPS.frame],
  INSTANCE: [...PROPS.common, ...PROPS.frame],
  RECTANGLE: [...PROPS.common, ...PROPS.rect],
  ELLIPSE: [...PROPS.common, "arcData"],
  VECTOR: [...PROPS.common],
  TEXT: [...PROPS.common, ...PROPS.text],
  PAGE: ["name"],
};

const LOADED = new Set();
const fontKey = (f) => `${f.family}::${f.style}`;

function strict(node) {
  return new Proxy(node, {
    set(t, k, v) {
      if (typeof k === "string" && !k.startsWith("_") && !(k in Node.prototype) && !["type", "id", "children", "parent", "removed", "boundVariables", "pluginData", "_props", "componentPropertyDefinitions", "addComponentProperty", "createInstance", "mainComponent", "_scopes"].includes(k)) {
        if (!allowed[t.type].includes(k)) fail(`${t.type}.${k} is not a settable property`);
        if (ENUMS[k] && !ENUMS[k].includes(v)) fail(`${t.type}.${k} = ${v} is not valid`);
        if ((k === "fills" || k === "strokes")) { if (!Array.isArray(v)) fail(`${k} must be array`); v.forEach(checkPaint); }
        if (k === "effects") { if (!Array.isArray(v)) fail("effects must be array"); v.forEach(checkEffect); }
        if (k === "counterAxisAlignItems" && v === "BASELINE" && t.layoutMode !== "HORIZONTAL") fail("BASELINE only in horizontal");
        if (k === "layoutWrap" && v === "WRAP" && t.layoutMode !== "HORIZONTAL") fail("wrap only in horizontal");
        if (k === "counterAxisSpacing" && t.layoutWrap !== "WRAP") fail("counterAxisSpacing needs wrap");
        if (k === "layoutSizingHorizontal" || k === "layoutSizingVertical") {
          const parentAL = t.parent && t.parent.layoutMode && t.parent.layoutMode !== "NONE";
          if (v === "FILL" && !parentAL) fail(`${k}=FILL needs auto-layout parent (${t.name})`);
          if (v === "HUG" && !(t.type === "TEXT" || (t.layoutMode && t.layoutMode !== "NONE"))) fail(`${k}=HUG needs auto-layout or text (${t.name})`);
        }
        if (k === "layoutGrow" && !(t.parent && t.parent.layoutMode !== "NONE")) fail("layoutGrow needs auto-layout parent");
        if (k === "layoutPositioning" && v === "ABSOLUTE" && !(t.parent && t.parent.layoutMode !== "NONE")) fail("absolute needs auto-layout parent");
        if (t.type === "TEXT") {
          if (k === "fontName" && !LOADED.has(fontKey(v))) fail(`font not loaded: ${fontKey(v)}`);
          if (k === "characters") { if (!t.fontName || !LOADED.has(fontKey(t.fontName))) fail("set fontName before characters"); if (typeof v !== "string") fail("characters must be string"); }
          if (k === "fontSize" && !(v >= 1)) fail(`fontSize ${v}`);
          if (k === "lineHeight" && !(v.unit && v.value >= 0)) fail("bad lineHeight");
        }
        if (k === "itemSpacing" && typeof v !== "number") fail("itemSpacing must be number");
        if (/^padding/.test(k) && !(v >= 0)) fail(`${k} must be >= 0 (${v})`);
        if (/Radius$/.test(k) && !(v >= 0)) fail(`${k} must be >= 0`);
        if (k === "componentPropertyReferences") {
          let p = t.parent, inInstance = false;
          while (p) { if (p.type === "INSTANCE") inInstance = true; p = p.parent; }
          if (inInstance) fail("cannot set references inside instance");
        }
      }
      t[k] = v;
      return true;
    },
  });
}

function make(type, extra = {}) {
  const n = strict(new Node(type));
  Object.assign(n, extra);
  if (type === "FRAME" || type === "COMPONENT") { n.layoutMode = "NONE"; n.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]; n.clipsContent = true; }
  return n;
}

/** اندازهٔ تقریبی auto layout تا تست‌ها به عرض و ارتفاع واقعی‌مانند برسند */
function layoutSize(n, axis) {
  if (n.type === "TEXT") {
    const lines = Math.max(1, (n.characters || "").split("\n").length);
    const lh = n.lineHeight && n.lineHeight.value ? n.lineHeight.value : (n.fontSize || 12) * 1.4;
    if (axis === "h") return lines * lh;
    if (n.textAutoResize === "WIDTH_AND_HEIGHT") return Math.max(1, Math.max(...(n.characters || "x").split("\n").map((l) => l.length)) * (n.fontSize || 12) * 0.55);
    return n._w;
  }
  if (!n.layoutMode || n.layoutMode === "NONE") return axis === "w" ? n._w : n._h;
  const horizontal = n.layoutMode === "HORIZONTAL";
  const primary = (horizontal && axis === "w") || (!horizontal && axis === "h");
  const sizing = primary ? n.primaryAxisSizingMode : n.counterAxisSizingMode;
  if (sizing === "FIXED") return axis === "w" ? n._w : n._h;
  const kids = n.children.filter((c) => c.visible !== false && c.layoutPositioning !== "ABSOLUTE");
  const pad = axis === "w" ? (n.paddingLeft || 0) + (n.paddingRight || 0) : (n.paddingTop || 0) + (n.paddingBottom || 0);
  const size = (c) => (axis === "w" ? c.width : c.height);
  if (primary) {
    if (n.layoutWrap === "WRAP") return Math.max(...kids.map(size), 0) + pad;
    return kids.reduce((a, c) => a + size(c), 0) + Math.max(0, kids.length - 1) * (n.itemSpacing || 0) + pad;
  }
  return Math.max(0, ...kids.map(size)) + pad;
}

const STYLES = new Map();

function svgNode(svg) {
  if (typeof svg !== "string" || !svg.includes("<svg")) fail("createNodeFromSvg: not svg");
  const f = make("FRAME");
  const vb = /viewBox="([\d.\s-]+)"/.exec(svg);
  const w = /width="([\d.]+)"/.exec(svg), h = /height="([\d.]+)"/.exec(svg);
  const [, , vw, vh] = vb ? vb[1].trim().split(/\s+/).map(Number) : [0, 0, 20, 20];
  f.resize(w ? Number(w[1]) : vw || 20, h ? Number(h[1]) : vh || 20);
  const shapes = svg.match(/<(path|circle|rect|ellipse|polygon|g)\b/g) || [];
  for (let i = 0; i < Math.max(1, shapes.length); i++) {
    const v = make("VECTOR");
    v.strokes = svg.includes("stroke=") ? [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }] : [];
    v.fills = [];
    f.appendChild(v);
  }
  return f;
}

function cloneTree(src, asInstance) {
  const n = make(asInstance ? "INSTANCE" : src.type);
  for (const [k, v] of Object.entries(src)) {
    if (["type", "id", "children", "parent", "removed", "boundVariables", "pluginData", "_props", "componentPropertyReferences", "componentPropertyDefinitions"].includes(k)) continue;
    if (k.startsWith("_")) { n[k] = v; continue; }
    if (allowed[n.type] && allowed[n.type].includes(k)) n[k] = v;
  }
  n._w = src.width; n._h = src.height;
  for (const c of src.children) n.appendChild(cloneTree(c, false));
  return n;
}

let currentPage;

export function createFigma({ fonts, maxModes = 4 }) {
  const root = strict(new Node("DOCUMENT"));
  const firstPage = make("PAGE", { name: "Page 1" });
  root.children.push(firstPage); firstPage.parent = root;
  currentPage = firstPage;
  const collections = [];
  const variables = [];
  const appendToPage = (n) => { currentPage.appendChild(n); return n; };

  const variablesApi = {
    async getLocalVariableCollectionsAsync() { return collections.slice(); },
    async getLocalVariablesAsync() { return variables.slice(); },
    createVariableCollection(name) {
      const c = { id: `VariableCollectionId:${id()}`, name, modes: [{ modeId: id(), name: "Mode 1" }],
        renameMode(mid, nm) { const m = this.modes.find((x) => x.modeId === mid); if (!m) fail("renameMode: no mode"); m.name = nm; },
        addMode(nm) { if (this.modes.length >= maxModes) fail(`collection ${name}: Limited to ${maxModes} modes only`); const mid = id(); this.modes.push({ modeId: mid, name: nm }); return mid; },
      };
      collections.push(c);
      return c;
    },
    createVariable(name, collection, type) {
      if (typeof collection === "string" || !collection || !collection.modes) fail("createVariable: pass the collection node");
      if (!["COLOR", "FLOAT", "STRING", "BOOLEAN"].includes(type)) fail(`bad var type ${type}`);
      if (variables.some((v) => v.name === name && v.variableCollectionId === collection.id)) fail(`duplicate variable ${name}`);
      if (/[.{}]/.test(name)) fail(`variable name has illegal char: ${name}`);
      const values = {};
      const v = {
        id: `VariableID:${id()}`, name, resolvedType: type, variableCollectionId: collection.id, valuesByMode: values, description: "", scopes: ["ALL_SCOPES"],
        setValueForMode(mid, val) {
          if (!collection.modes.some((m) => m.modeId === mid)) fail(`setValueForMode: unknown mode for ${name}`);
          if (val && val.type === "VARIABLE_ALIAS") {
            const target = variables.find((x) => x.id === val.id);
            if (!target) fail("alias to unknown variable");
            if (target.resolvedType !== type) fail(`alias type mismatch ${name}`);
          } else if (type === "COLOR") {
            if (Object.keys(val).sort().join() !== "a,b,g,r") fail(`COLOR value for ${name} needs r,g,b,a`);
          } else if (type === "FLOAT") { if (typeof val !== "number" || Number.isNaN(val)) fail(`FLOAT value for ${name}: ${val}`); }
          else if (type === "STRING") { if (typeof val !== "string") fail(`STRING value for ${name}`); }
          values[mid] = val;
        },
        _value() { const val = Object.values(values)[0]; return typeof val === "number" ? val : 10; },
      };
      Object.defineProperty(v, "scopes", {
        get() { return this._scopes || ["ALL_SCOPES"]; },
        set(s) {
          const ok = { COLOR: ["ALL_SCOPES", "ALL_FILLS", "FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR", "EFFECT_COLOR"], FLOAT: ["ALL_SCOPES", "CORNER_RADIUS", "TEXT_CONTENT", "WIDTH_HEIGHT", "GAP", "STROKE_FLOAT", "OPACITY", "EFFECT_FLOAT", "FONT_SIZE", "LINE_HEIGHT", "LETTER_SPACING", "PARAGRAPH_SPACING", "PARAGRAPH_INDENT", "FONT_WEIGHT"], STRING: ["ALL_SCOPES", "TEXT_CONTENT", "FONT_FAMILY", "FONT_STYLE"], BOOLEAN: ["ALL_SCOPES"] }[type];
          for (const x of s) if (!ok.includes(x)) fail(`scope ${x} not valid for ${type} (${name})`);
          this._scopes = s;
        },
      });
      variables.push(v);
      return v;
    },
    createVariableAlias(v) { if (!v || !v.id) fail("createVariableAlias: no variable"); return { type: "VARIABLE_ALIAS", id: v.id }; },
    setBoundVariableForEffect(e, field, v) {
      checkEffect(e);
      if (!["color", "radius", "spread", "offsetX", "offsetY"].includes(field)) fail(`effect field ${field}`);
      if (!v || v.resolvedType !== (field === "color" ? "COLOR" : "FLOAT")) fail(`effect ${field} variable type`);
      return Object.assign({}, e, { boundVariables: Object.assign({}, e.boundVariables, { [field]: { type: "VARIABLE_ALIAS", id: v.id } }) });
    },
    setBoundVariableForPaint(p, field, v) {
      checkPaint(p);
      if (field !== "color") fail("paint field must be color");
      if (!v || v.resolvedType !== "COLOR") fail("setBoundVariableForPaint: not a COLOR variable");
      return Object.assign({}, p, { boundVariables: { color: { type: "VARIABLE_ALIAS", id: v.id } } });
    },
  };

  const style = (kind) => {
    const s = { id: `S:${id()}`, type: kind, name: "", description: "", boundVariables: {}, remove() { const list = kind === "TEXT" ? textStyles : effectStyles; list.splice(list.indexOf(this), 1); STYLES.delete(this.id); } };
    if (kind === "TEXT") {
      return new Proxy(s, {
        set(t, k, v) {
          if (k === "fontName" && !LOADED.has(fontKey(v))) fail(`text style font not loaded: ${fontKey(v)}`);
          t[k] = v; return true;
        },
        get(t, k) {
          if (k === "setBoundVariable") return (field, v) => { if (!TEXT_BINDABLE.has(field)) fail(`text style bind ${field}`); const want = ["fontFamily", "fontStyle"].includes(field) ? "STRING" : "FLOAT"; if (v.resolvedType !== want) fail(`text style ${field} needs ${want}`); t.boundVariables[field] = v.id; };
          return t[k];
        },
      });
    }
    return new Proxy(s, { set(t, k, v) { if (k === "effects") v.forEach(checkEffect); t[k] = v; return true; } });
  };
  const textStyles = [], effectStyles = [];

  const figma = {
    mixed: MIXED,
    root,
    createImage(bytes) { if (!(bytes instanceof Uint8Array) || bytes.length < 100) fail("createImage: bad bytes"); return { hash: `img${id()}` }; },
    base64Decode(s) { return new Uint8Array(Buffer.from(s, "base64")); },
    get currentPage() { return currentPage; },
    async setCurrentPageAsync(p) { if (p.type !== "PAGE") fail("not a page"); currentPage = p; },
    createPage() { const p = make("PAGE"); root.children.push(p); p.parent = root; p.name = "Page"; return p; },
    createFrame() { return appendToPage(make("FRAME")); },
    createText() { const t = make("TEXT"); t.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]; t.textAutoResize = "WIDTH_AND_HEIGHT"; return appendToPage(t); },
    createRectangle() { return appendToPage(make("RECTANGLE", { fills: [] })); },
    createEllipse() { return appendToPage(make("ELLIPSE", { fills: [] })); },
    createComponent() { return appendToPage(make("COMPONENT")); },
    createNodeFromSvg(svg) { return appendToPage(svgNode(svg)); },
    createComponentFromNode(node) {
      if (!(node.type === "FRAME")) fail(`createComponentFromNode: ${node.type}`);
      const parent = node.parent, idx = parent ? parent.children.indexOf(node) : 0;
      const c = make("COMPONENT");
      for (const [k, v] of Object.entries(node)) {
        if (["type", "id", "children", "parent", "removed", "boundVariables", "pluginData", "_props"].includes(k)) continue;
        if (k.startsWith("_")) { c[k] = v; continue; }
        c[k] = v;
      }
      c._w = node._w; c._h = node._h;
      c.boundVariables = node.boundVariables;
      for (const ch of node.children.slice()) c.appendChild(ch);
      node.remove();
      if (parent) parent.insertChild(idx, c);
      c.componentPropertyDefinitions = {};
      c.addComponentProperty = function (nm, type, def) {
        if (this.parent && this.parent.type === "COMPONENT_SET") fail("addComponentProperty on a variant; use the set");
        return addProp(this, nm, type, def);
      };
      c.createInstance = function () {
        const inst = cloneTree(this, true);
        inst.mainComponent = this;
        return appendToPage(inst);
      };
      return c;
    },
    combineAsVariants(nodes, parent) {
      if (!nodes.length) fail("combineAsVariants: empty");
      const names = new Set();
      for (const n of nodes) {
        if (n.type !== "COMPONENT") fail("combineAsVariants: not component");
        if (!/^[^=,]+=[^=,]+(, [^=,]+=[^=,]+)*$/.test(n.name)) fail(`variant name not k=v: ${n.name}`);
        if (names.has(n.name)) fail(`duplicate variant ${n.name}`);
        names.add(n.name);
      }
      const set = make("COMPONENT_SET");
      set.layoutMode = "NONE";
      set.fills = [];
      parent.appendChild(set);
      for (const n of nodes) set.appendChild(n);
      set.componentPropertyDefinitions = {};
      set.addComponentProperty = function (nm, type, def) { return addProp(this, nm, type, def); };
      return set;
    },
    createTextStyle() { const s = style("TEXT"); textStyles.push(s); STYLES.set(s.id, s); return s; },
    createEffectStyle() { const s = style("EFFECT"); effectStyles.push(s); STYLES.set(s.id, s); return s; },
    async getLocalTextStylesAsync() { return textStyles.slice(); },
    async getLocalEffectStylesAsync() { return effectStyles.slice(); },
    async listAvailableFontsAsync() { return fonts.map(([family, style]) => ({ fontName: { family, style } })); },
    async loadFontAsync(f) { if (!fonts.some(([fa, st]) => fa === f.family && st === f.style)) fail(`font not available ${fontKey(f)}`); LOADED.add(fontKey(f)); },
    variables: variablesApi,
    viewport: { scrollAndZoomIntoView() {} },
    notify(msg) { figma._notes.push(msg); },
    _notes: [],
    _messages: [],
    showUI() {},
    ui: { postMessage(m) { figma._messages.push(m); }, onmessage: null },
    closePlugin() {},
    _collections: collections,
    _variables: variables,
  };
  return figma;
}

function addProp(owner, nm, type, def) {
  if (!["TEXT", "BOOLEAN", "INSTANCE_SWAP", "VARIANT"].includes(type)) fail(`prop type ${type}`);
  if (type === "TEXT" && typeof def !== "string") fail("TEXT default must be string");
  if (type === "BOOLEAN" && typeof def !== "boolean") fail("BOOLEAN default must be boolean");
  const key = `${nm}#${id()}`;
  owner.componentPropertyDefinitions[key] = { type, defaultValue: def };
  return key;
}
