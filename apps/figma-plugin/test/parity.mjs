// مقایسهٔ گره‌های فیگما با اندازه‌های واقعی CSS (test/css-metrics.json)
// هر گره‌ای که در پلاگین با css: "k-..." علامت خورده، با همان کلاس در مرورگر مقایسه می‌شود.

const TOL = 0.6;
const WEIGHTS = { thin: 100, extralight: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
const px = (s) => (s === "normal" || s === undefined ? null : parseFloat(s));

function parseColor(s) {
  if (!s) return null;
  let m = /rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/.exec(s);
  if (m) return [m[1] / 255, m[2] / 255, m[3] / 255, m[4] === undefined ? 1 : Number(m[4])];
  m = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(s);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
  return null;
}

export function createParity(figma) {
  const vars = figma._variables;
  const cols = figma._collections;
  const darkMode = (v) => {
    const c = cols.find((x) => x.id === v.variableCollectionId);
    const m = c.modes.find((x) => x.name === "Dark") || c.modes[0];
    return m.modeId;
  };
  const resolve = (id) => {
    let v = vars.find((x) => x.id === id);
    for (let i = 0; i < 6; i++) {
      const val = v.valuesByMode[darkMode(v)];
      if (val && val.type === "VARIABLE_ALIAS") v = vars.find((x) => x.id === val.id);
      else return val;
    }
    return null;
  };
  const num = (node, field, plain) => (node.boundVariables && node.boundVariables[field] ? resolve(node.boundVariables[field].id) : plain);
  const paintColor = (p) => {
    if (!p) return null;
    if (p.boundVariables && p.boundVariables.color) {
      const c = resolve(p.boundVariables.color.id);
      return [c.r, c.g, c.b, c.a * (p.opacity === undefined ? 1 : p.opacity)];
    }
    return [p.color.r, p.color.g, p.color.b, p.opacity === undefined ? 1 : p.opacity];
  };
  const sameColor = (a, b) => {
    if (!a && !b) return true;
    const ta = !a || a[3] < 0.01, tb = !b || b[3] < 0.01;
    if (ta || tb) return ta === tb;
    return a.every((v, i) => Math.abs(v - b[i]) < (i === 3 ? 0.03 : 3 / 255));
  };
  const fmt = (c) => (c ? `rgba(${c.slice(0, 3).map((v) => Math.round(v * 255)).join(",")},${(+c[3]).toFixed(2)})` : "none");

  return function check(node, metrics) {
    const tag = JSON.parse(node.getPluginData("css"));
    const m = metrics[tag.key];
    if (!m) return [`unknown css key "${tag.key}"`];
    const isText = node.type === "TEXT";
    const checks = tag.check || (isText ? ["font", "color"] : node.layoutMode && node.layoutMode !== "NONE" ? ["pad", "radius", "gap", "bg", "border"] : ["radius", "bg", "border"]);
    const errs = [];
    const cmp = (label, figmaVal, cssVal) => {
      if (cssVal === null || figmaVal === null || figmaVal === undefined) return;
      if (Math.abs(figmaVal - cssVal) > TOL) errs.push(`${label} figma=${+(+figmaVal).toFixed(2)} css=${cssVal}`);
    };
    for (const c of checks) {
      if (c === "pad") {
        cmp("padding-top", num(node, "paddingTop", node.paddingTop), px(m.pt));
        cmp("padding-bottom", num(node, "paddingBottom", node.paddingBottom), px(m.pb));
        cmp("padding-right(start)", num(node, "paddingRight", node.paddingRight), px(m.pr));
        cmp("padding-left(end)", num(node, "paddingLeft", node.paddingLeft), px(m.pl));
      } else if (c === "padx") {
        cmp("padding-right(start)", num(node, "paddingRight", node.paddingRight), px(m.pr));
        cmp("padding-left(end)", num(node, "paddingLeft", node.paddingLeft), px(m.pl));
      } else if (c === "gap") {
        if (px(m.gap) !== null) cmp("gap", num(node, "itemSpacing", node.itemSpacing), px(m.gap));
      } else if (c === "radius") {
        const r = num(node, "topLeftRadius", node.topLeftRadius !== undefined ? node.topLeftRadius : node.cornerRadius);
        const full = m.rad.endsWith("%") || px(m.rad) >= Math.min(m.w, m.h) / 2 - 0.5;
        if (node.type === "ELLIPSE") { if (!full) errs.push(`radius css=${m.rad} but figma is ellipse`); }
        else if (full) { if (!(r >= Math.min(node.width, node.height) / 2 - 0.5)) errs.push(`radius figma=${r} css=full`); }
        else cmp("radius", r || 0, px(m.rad));
      } else if (c === "bg") {
        const f = (node.fills || []).filter((p) => p.visible !== false && p.type === "SOLID")[0];
        const a = paintColor(f), b = parseColor(m.bg);
        if (!sameColor(a, b)) errs.push(`background figma=${fmt(a)} css=${m.bg}`);
      } else if (c === "border") {
        const [bt] = m.bw.split("/").map(parseFloat);
        const hasStroke = (node.strokes || []).length > 0;
        const w = hasStroke ? (node.strokeTopWeight !== undefined ? node.strokeTopWeight : node.strokeWeight) : 0;
        const bc = parseColor(m.bc);
        const visibleCss = bt > 0 && bc && bc[3] > 0.01;
        if (visibleCss !== (hasStroke && w > 0)) errs.push(`border figma=${hasStroke ? w : 0} css=${visibleCss ? bt : 0}`);
        else if (visibleCss) {
          cmp("border-width", w, bt);
          const sc = paintColor(node.strokes[0]);
          if (!sameColor(sc, bc)) errs.push(`border-color figma=${fmt(sc)} css=${m.bc}`);
        }
      } else if (c === "font") {
        cmp("font-size", num(node, "fontSize", node.fontSize), px(m.fs));
        const style = node.fontName.style.toLowerCase().replace(/\s/g, "");
        cmp("font-weight", WEIGHTS[style], Number(m.fw));
      } else if (c === "color") {
        const a = paintColor((node.fills || [])[0]), b = parseColor(m.color);
        if (!sameColor(a, b)) errs.push(`color figma=${fmt(a)} css=${m.color}`);
      } else if (c === "h") {
        cmp("height", num(node, "height", node.height), m.h);
      } else if (c === "w") {
        cmp("width", num(node, "width", node.width), m.w);
      }
    }
    return errs;
  };
}
