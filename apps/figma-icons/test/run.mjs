// تست بخش sandbox پلاگین با یک figma ساختگی: افزودن، جای‌گذاری داخل فریم، کشیدن و رها کردن، اندازهٔ پنل و ذخیرهٔ تنظیمات.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(here, "../plugin/code.js"), "utf8");
const ui = readFileSync(join(here, "../plugin/ui.html"), "utf8");

function makeNode(type, props = {}) {
  const node = { type, children: [], parent: null, x: 0, y: 0, width: 100, height: 100, data: {}, ...props };
  node.appendChild = (c) => { c.parent = node; node.children.push(c); };
  node.setPluginData = (k, v) => { node.data[k] = v; };
  node.rescale = (s) => { node.width *= s; node.height *= s; };
  node.absoluteTransform = [[1, 0, props.ax || 0], [0, 1, props.ay || 0]];
  return node;
}

const page = makeNode("PAGE");
page.selection = [];
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
assert.deepEqual(sent.at(-1), { type: "state", state: { variant: "bold", favs: ["heart"] }, inFigma: true });

// ۵) پنل: داده و موتور سبک‌ها جاسازی شده و چیزی از شبکه خوانده نمی‌شود
assert.ok(ui.includes("var DATA = {") && ui.includes("var KashiRender"));
assert.ok(!/<script[^>]+src=|<link[^>]+href="http/.test(ui), "panel must not load anything from the network");
const manifest = JSON.parse(readFileSync(join(here, "../plugin/manifest.json"), "utf8"));
assert.deepEqual(manifest.networkAccess.allowedDomains, ["none"]);

console.log("✓ figma-icons plugin OK");
