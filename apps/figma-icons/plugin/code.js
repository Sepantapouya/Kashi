// Kashi Icons — این فایل خودکار ساخته شده است؛ src/ را ویرایش کنید و npm run figma-icons:build بزنید
// Kashi Icons — بخش فیگمای پلاگین (sandbox).
// پنل (ui.html) آیکون را با سبک، اندازه، ضخامت و رنگ انتخاب‌شده به SVG تبدیل می‌کند و اینجا فقط آن را در بوم می‌گذاریم.
// نحو را ساده نگه دارید (بدون ?. و ??)؛ محیط پلاگین فیگما همهٔ نحوهای تازه را اجرا نمی‌کند.

var UI_SIZES = { compact: [380, 600], normal: [520, 680], wide: [720, 720] };
var STORE_KEY = "kashi-icons:v1";

figma.showUI(__html__, { width: UI_SIZES.normal[0], height: UI_SIZES.normal[1], themeColors: true, title: "Kashi Icons" });

function containerFor(node) {
  // آیکون داخل فریم یا کامپوننت انتخاب‌شده می‌رود؛ وگرنه روی خود صفحه
  var n = node;
  while (n && n.type !== "PAGE") {
    if (n.type === "FRAME" || n.type === "COMPONENT" || n.type === "COMPONENT_SET" || n.type === "SECTION") return n;
    n = n.parent;
  }
  return figma.currentPage;
}

function makeNode(item) {
  var node = figma.createNodeFromSvg(item.svg);
  node.name = item.label || item.name;
  node.setPluginData("kashi-icon", JSON.stringify({ name: item.name, variant: item.variant, size: item.size }));
  // SVG با viewBox ۲۰ ساخته می‌شود و اندازهٔ واقعی را با resize می‌دهیم تا ضخامت خط به نسبت بماند
  if (node.width !== item.size) node.rescale(item.size / node.width);
  node.constrainProportions = true;
  return node;
}

function place(nodes, parent, x, y) {
  var gap = 16;
  var offset = 0;
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    parent.appendChild(node);
    node.x = Math.round(x + offset);
    node.y = Math.round(y);
    offset += node.width + gap;
  }
}

function insert(items) {
  var sel = figma.currentPage.selection;
  var parent = sel.length ? containerFor(sel[0]) : figma.currentPage;
  var nodes = items.map(makeNode);
  var total = nodes.reduce(function (s, n) { return s + n.width; }, 0) + (nodes.length - 1) * 16;
  var x, y;
  if (parent.type === "PAGE") {
    var c = figma.viewport.center;
    x = c.x - total / 2;
    y = c.y - nodes[0].height / 2;
  } else {
    x = (parent.width - total) / 2;
    y = (parent.height - nodes[0].height) / 2;
  }
  place(nodes, parent, x, y);
  figma.currentPage.selection = nodes;
  if (parent.type === "PAGE") figma.viewport.scrollAndZoomIntoView(nodes);
  return nodes.length;
}

// کشیدن از پنل و رها کردن روی بوم
figma.on("drop", function (event) {
  var meta = event.dropMetadata;
  if (!meta || !meta.kashi) return true;
  var parent = event.node && event.node.type !== "DOCUMENT" ? event.node : figma.currentPage;
  var nodes = meta.items.map(makeNode);
  var ax = parent.type === "PAGE" ? 0 : parent.absoluteTransform[0][2];
  var ay = parent.type === "PAGE" ? 0 : parent.absoluteTransform[1][2];
  place(nodes, parent, event.absoluteX - ax - nodes[0].width / 2, event.absoluteY - ay - nodes[0].height / 2);
  figma.currentPage.selection = nodes;
  figma.ui.postMessage({ type: "inserted", count: nodes.length });
  return false;
});

figma.ui.onmessage = function (msg) {
  if (msg.type === "insert") {
    var count = insert(msg.items);
    figma.notify(count === 1 ? "آیکون اضافه شد" : count + " آیکون اضافه شد", { timeout: 1600 });
    figma.ui.postMessage({ type: "inserted", count: count });
  } else if (msg.type === "notify") {
    figma.notify(msg.text, { timeout: 1600 });
  } else if (msg.type === "resize" && UI_SIZES[msg.size]) {
    figma.ui.resize(UI_SIZES[msg.size][0], UI_SIZES[msg.size][1]);
  } else if (msg.type === "save") {
    figma.clientStorage.setAsync(STORE_KEY, msg.state);
  } else if (msg.type === "ready") {
    figma.clientStorage.getAsync(STORE_KEY).then(function (state) {
      figma.ui.postMessage({ type: "state", state: state || null, inFigma: true });
    });
  }
};
