// تست بخش sandbox پلاگین با یک figma ساختگی: افزودن، جای‌گذاری داخل فریم، کشیدن و رها کردن، اندازهٔ پنل و ذخیرهٔ تنظیمات.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(here, "../plugin/code.js"), "utf8");
const ui = readFileSync(join(here, "../plugin/ui.html"), "utf8");

let nextId = 1;
function makeNode(type, props = {}) {
  const node = { id: String(nextId++), type, name: "", children: [], parent: null, x: 0, y: 0, width: 100, height: 100, data: {}, ...props };
  node.appendChild = (c) => { if (c.parent) c.parent.children.splice(c.parent.children.indexOf(c), 1); c.parent = node; node.children.push(c); };
  node.insertChild = (i, c) => { if (c.parent) c.parent.children.splice(c.parent.children.indexOf(c), 1); c.parent = node; node.children.splice(i, 0, c); };
  node.remove = () => { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); node.parent = null; };
  node.setPluginData = (k, v) => { node.data[k] = v; };
  node.getPluginData = (k) => node.data[k] || "";
  node.resizeWithoutConstraints = (w, h) => { node.width = w; node.height = h; };
  node.rescale = (s) => { node.width *= s; node.height *= s; };
  node.absoluteTransform = [[1, 0, props.ax || 0], [0, 1, props.ay || 0]];
  return node;
}

const page = makeNode("PAGE", { name: "Page 1" });
page.selection = [];
const root = makeNode("DOCUMENT");
root.appendChild(page);
const bound = [];
const sent = [], notes = [], resizes = [], store = {};
const handlers = {};
globalThis.__html__ = "<html></html>";
globalThis.figma = {
  currentPage: page,
  viewport: { center: { x: 500, y: 300 }, scrollAndZoomIntoView() {} },
  showUI(html, opts) { assert.ok(opts.width >= 380 && opts.themeColors); },
  ui: { postMessage: (m) => sent.push(m), resize: (w, h) => resizes.push([w, h]), onmessage: null },
  notify: (t) => notes.push(t),
  on: (ev, fn) => { handlers[ev] = fn; },
  clientStorage: { getAsync: async (k) => store[k], setAsync: async (k, v) => { store[k] = v; } },
  root,
  mixed: Symbol("mixed"),
  createPage() { const p = makeNode("PAGE"); p.selection = []; p.loadAsync = async () => {}; root.appendChild(p); return p; },
  createComponentFromNode(frame) {
    const c = makeNode("COMPONENT", { width: frame.width, height: frame.height, fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }] });
    const v = makeNode("VECTOR", { strokes: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }], fills: [] });
    const mask = makeNode("VECTOR", { isMask: true, fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }] });
    c.appendChild(v); c.appendChild(mask);
    c.createInstance = () => {
      const inst = makeNode("INSTANCE", { width: c.width, height: c.height, props: {} });
      inst.setProperties = (p) => { const [st, sz] = [p.Style, p.Size]; if (!["16", "20", "24", "32"].includes(sz)) throw new Error("bad size"); inst.props = p; };
      inst.main = c;
      return inst;
    };
    return c;
  },
  combineAsVariants(comps, parent) { const set = makeNode("COMPONENT_SET"); comps.forEach((c) => set.appendChild(c)); parent.appendChild(set); set.defaultVariant = comps[0]; return set; },
  variables: {
    collections: [], vars: [],
    async getLocalVariableCollectionsAsync() { return this.collections; },
    async getLocalVariablesAsync() { return this.vars; },
    createVariableCollection(name) { const c = { id: "c" + this.collections.length, name, modes: [{ modeId: "m1" }] }; this.collections.push(c); return c; },
    createVariable(name, col) { const v = { id: "v" + this.vars.length, name, variableCollectionId: col.id, values: {}, setValueForMode(m, val) { this.values[m] = val; } }; this.vars.push(v); return v; },
    setBoundVariableForPaint(p, field, v) { bound.push(v.name); return { ...p, boundVariables: { color: v.id } }; },
  },
  createNodeFromSvg(svg) {
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="(\d+)" height="\1" viewBox="0 0 20 20"/);
    const size = +svg.match(/width="(\d+)"/)[1];
    return makeNode("FRAME", { width: size, height: size });
  },
};
new Function(code)();
const send = (m) => figma.ui.onmessage(m);
const svg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 20 20" fill="none" stroke="#000000"><path d="M3 3h14"/></svg>`;
const item = (name, size = 24) => ({ name, label: `Kashi / ${name}`, variant: "light", size, svg: svg(size) });

// ۱) افزودن روی صفحه، وسط دید
send({ type: "insert", items: [item("heart")] });
assert.equal(page.children.length, 1);
const heart = page.children[0];
assert.equal(heart.name, "Kashi / heart");
assert.equal(heart.width, 24);
assert.equal(heart.x, 488); assert.equal(heart.y, 288);
assert.deepEqual(JSON.parse(heart.data["kashi-icon"]), { name: "heart", variant: "light", size: 24 });
assert.deepEqual(page.selection, [heart]);
assert.equal(sent.at(-1).type, "inserted");

// ۲) چند آیکون داخل فریم انتخاب‌شده، کنار هم و وسط فریم
const frame = makeNode("FRAME", { width: 200, height: 100 });
page.appendChild(frame);
const inner = makeNode("RECTANGLE"); frame.appendChild(inner);
page.selection = [inner];
send({ type: "insert", items: [item("a", 20), item("b", 20)] });
assert.equal(frame.children.length, 3);
const [a, b] = frame.children.slice(1);
assert.equal(a.x, 72); assert.equal(b.x, 108); assert.equal(a.y, 40);
assert.match(notes.at(-1), /۲|2/);

// ۳) کشیدن و رها کردن روی فریمی که جای دیگری از بوم است
const target = makeNode("FRAME", { width: 300, height: 300, ax: 1000, ay: 500 });
const keep = handlers.drop({ node: target, absoluteX: 1100, absoluteY: 600, dropMetadata: { kashi: true, items: [item("star", 32)] } });
assert.equal(keep, false);
assert.equal(target.children[0].x, 84); assert.equal(target.children[0].y, 84);
assert.equal(handlers.drop({ node: page, absoluteX: 0, absoluteY: 0, dropMetadata: { other: true } }), true, "drops from other plugins pass through");

// ۴) اندازهٔ پنل و تنظیمات ذخیره‌شده
send({ type: "resize", size: "wide" });
send({ type: "resize", size: "huge" });
assert.deepEqual(resizes, [[720, 720]]);
send({ type: "save", state: { variant: "bold", favs: ["heart"] } });
send({ type: "ready" });
await new Promise((r) => setTimeout(r, 0));
assert.deepEqual(sent.findLast((m) => m.type === "state"), { type: "state", state: { variant: "bold", favs: ["heart"] }, inFigma: true });
assert.equal(sent.at(-1).type, "selection", "the panel learns the canvas selection on start");

// ۵) پنل: داده و موتور سبک‌ها جاسازی شده و چیزی از شبکه خوانده نمی‌شود
assert.ok(ui.includes("var DATA = {") && ui.includes("var KashiRender"));
assert.ok(!/<script[^>]+src=|<link[^>]+href="http/.test(ui), "panel must not load anything from the network");
const manifest = JSON.parse(readFileSync(join(here, "../plugin/manifest.json"), "utf8"));
assert.deepEqual(manifest.networkAccess.allowedDomains, ["none"]);

// ۶) کامپوننت با Style و Size در صفحهٔ «Kashi Icons»، با متغیر رنگ؛ بار دوم از همان استفاده می‌شود
const styles = ["light", "bold", "bulk", "two-tone", "broken", "curved"];
const compItem = (name) => ({ name, title: "قلب", variant: "bold", size: 24, sizes: [16, 20, 24, 32], styles: styles.map((v) => ({ variant: v, svg: svg(20) })) });
page.selection = [];
page.children.length = 0;
send({ type: "component", items: [compItem("heart")] });
await new Promise((r) => setTimeout(r, 0));
const compPage = root.children.find((p) => p.name === "Kashi Icons");
assert.ok(compPage, "component page is created");
const set = compPage.children[0];
assert.equal(set.type, "COMPONENT_SET");
assert.equal(set.name, "Kashi Icon / heart");
assert.equal(set.children.length, 24);
assert.ok(set.children.some((c) => c.name === "Style=Two-tone, Size=16"));
assert.equal(set.children.find((c) => c.name === "Style=Light, Size=32").width, 32);
assert.equal(figma.variables.vars.length, 1, "one shared color variable");
assert.equal(figma.variables.vars[0].name, "icon");
assert.ok(set.children[0].children[0].strokes[0].boundVariables, "icon color bound to the variable");
assert.ok(!set.children[0].children[1].fills[0].boundVariables, "masks keep their own color");
assert.deepEqual(set.children[0].fills, [], "component has no background");
const inst = page.children[0];
assert.equal(inst.type, "INSTANCE");
assert.equal(inst.main.name, "Style=Bold, Size=24");
assert.deepEqual(page.selection, [inst]);
assert.equal(sent.at(-1).type, "inserted");
assert.equal(sent.at(-1).component, true);
send({ type: "component", items: [compItem("heart")] });
await new Promise((r) => setTimeout(r, 0));
assert.equal(compPage.children.length, 1, "the same set is reused");
assert.equal(figma.variables.vars.length, 1, "the variable is reused");

// ۷) گزارش انتخاب روی بوم و تغییر سبک و اندازه
page.selection = [inst, page.children[1]];
handlers.selectionchange();
const report = sent.at(-1);
assert.equal(report.type, "selection");
assert.equal(report.items.length, 2);
assert.equal(report.items[0].kind, "instance");
send({ type: "restyle", items: [{ id: inst.id, kind: "instance", name: "heart", variant: "curved", size: 16 }] });
assert.deepEqual(inst.props, { Style: "Curved", Size: "16" });
assert.equal(JSON.parse(inst.data["kashi-icon"]).variant, "curved");
// آیکون ساده با نسخهٔ تازه جایگزین می‌شود، همان‌جا و همان ترتیب
send({ type: "insert", items: [item("star", 24)] });
const plain = page.selection[0];
const at = page.children.indexOf(plain);
page.selection = [plain];
send({ type: "restyle", items: [{ ...item("star", 32), id: plain.id, kind: "plain", variant: "bulk" }] });
const fresh = page.children[at];
assert.notEqual(fresh, plain);
assert.equal(fresh.width, 32);
assert.equal(JSON.parse(fresh.data["kashi-icon"]).variant, "bulk");
assert.equal(fresh.x, plain.x - 4);
// اندازه‌ای که کامپوننت ندارد، دست نمی‌خورد و پیام می‌دهد
page.selection = [inst];
send({ type: "restyle", items: [{ id: inst.id, kind: "instance", name: "heart", variant: "light", size: 48 }] });
assert.deepEqual(inst.props, { Style: "Curved", Size: "16" });
assert.match(notes.at(-1), /۱۶ تا ۳۲/);
// پیام‌ها با زبان پنل
send({ type: "lang", lang: "en" });
send({ type: "restyle", items: [{ id: inst.id, kind: "instance", name: "heart", variant: "light", size: 48 }] });
assert.match(notes.at(-1), /sizes 16 to 32/);
send({ type: "lang", lang: "fa" });

// ۸) پنل دکمهٔ کامپوننت و نوار انتخاب دارد
assert.ok(ui.includes('id="as-comp"') && ui.includes('id="selbar"'));

console.log("✓ figma-icons plugin OK");
