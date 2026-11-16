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

function placeNodes(nodes) {
  var sel = figma.currentPage.selection;
  var parent = sel.length ? containerFor(sel[0]) : figma.currentPage;
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

function insert(items) {
  return placeNodes(items.map(makeNode));
}

// ---------- کامپوننت با سبک و اندازه ----------
// هر آیکون یک Component set در صفحهٔ «Kashi Icons» می‌شود با دو ویژگی Style (شش سبک) و Size (۱۶ تا ۳۲)،
// و یک instance از آن روی بوم می‌آید. رنگ همهٔ آیکون‌ها به متغیر رنگی «Kashi Icons / icon» وصل است.
var COMP_PAGE = "Kashi Icons";
var STYLE_NAMES = { light: "Light", bold: "Bold", bulk: "Bulk", "two-tone": "Two-tone", broken: "Broken", curved: "Curved" };

function iconInfo(node) {
  var raw = node.getPluginData("kashi-icon");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function componentPage() {
  var pages = figma.root.children;
  for (var i = 0; i < pages.length; i++) if (pages[i].name === COMP_PAGE) return pages[i];
  var page = figma.createPage();
  page.name = COMP_PAGE;
  return page;
}

function iconVariable() {
  if (!figma.variables) return Promise.resolve(null);
  function make(col) {
    var v = figma.variables.createVariable("icon", col, "COLOR");
    v.setValueForMode(col.modes[0].modeId, { r: 0, g: 0, b: 0, a: 1 });
    return v;
  }
  return figma.variables.getLocalVariableCollectionsAsync().then(function (cols) {
    var col = null;
    for (var i = 0; i < cols.length; i++) if (cols[i].name === COMP_PAGE) col = cols[i];
    if (!col) return make(figma.variables.createVariableCollection(COMP_PAGE));
    return figma.variables.getLocalVariablesAsync("COLOR").then(function (vars) {
      for (var j = 0; j < vars.length; j++) if (vars[j].variableCollectionId === col.id && vars[j].name === "icon") return vars[j];
      return make(col);
    });
  }).catch(function () { return null; });
}

// رنگ سیاه آیکون (نه ماسک‌ها و نه رنگ اصلی لوگوها) به متغیر وصل می‌شود
function bindColor(node, variable) {
  if (!variable || node.isMask) return;
  ["fills", "strokes"].forEach(function (key) {
    var paints = node[key];
    if (!paints || !paints.length || typeof paints === "symbol") return;
    var changed = false;
    var next = paints.map(function (p) {
      if (p.type !== "SOLID" || p.color.r > 0.01 || p.color.g > 0.01 || p.color.b > 0.01) return p;
      changed = true;
      return figma.variables.setBoundVariableForPaint(p, "color", variable);
    });
    if (changed) node[key] = next;
  });
  if (node.children) for (var i = 0; i < node.children.length; i++) bindColor(node.children[i], variable);
}

function variantName(variant, size) { return "Style=" + STYLE_NAMES[variant] + ", Size=" + size; }

function findSet(page, name) {
  var kids = page.children;
  for (var i = 0; i < kids.length; i++) if (kids[i].type === "COMPONENT_SET" && kids[i].getPluginData("kashi-set") === name) return kids[i];
  return null;
}

function buildSet(item, page, variable) {
  var comps = [];
  var gap = 16;
  var y = gap;
  var width = 0;
  item.styles.forEach(function (st) {
    var x = gap;
    item.sizes.forEach(function (size) {
      var frame = figma.createNodeFromSvg(st.svg);
      if (frame.width !== size) frame.rescale(size / frame.width);
      var comp = figma.createComponentFromNode(frame);
      comp.name = variantName(st.variant, size);
      comp.fills = [];
      bindColor(comp, variable);
      comp.x = x;
      comp.y = y + (32 - size) / 2;
      x += size + gap;
      comps.push(comp);
    });
    width = Math.max(width, x);
    y += 32 + gap;
  });
  var set = figma.combineAsVariants(comps, page);
  set.name = "Kashi Icon / " + item.name;
  set.description = item.title + " · " + item.name;
  set.setPluginData("kashi-set", item.name);
  set.resizeWithoutConstraints(width, y);
  // زیر آخرین آیکون ساخته‌شده در همین صفحه
  var bottom = 0;
  page.children.forEach(function (n) { if (n !== set && n.getPluginData("kashi-set")) bottom = Math.max(bottom, n.y + n.height + 40); });
  set.x = 0;
  set.y = bottom;
  return set;
}

function pickVariant(set, variant, size) {
  var want = variantName(variant, size);
  for (var i = 0; i < set.children.length; i++) if (set.children[i].name === want) return set.children[i];
  return set.defaultVariant || set.children[0];
}

function addComponents(items) {
  var page = componentPage();
  var ready = page.loadAsync ? page.loadAsync() : Promise.resolve();
  return ready.then(iconVariable).then(function (variable) {
    var made = 0;
    var instances = items.map(function (item) {
      var set = findSet(page, item.name);
      if (!set) { set = buildSet(item, page, variable); made++; }
      var inst = pickVariant(set, item.variant, item.size).createInstance();
      inst.name = "Kashi Icon / " + item.name;
      inst.setPluginData("kashi-icon", JSON.stringify({ name: item.name, variant: item.variant, size: item.size, component: true }));
      return inst;
    });
    placeNodes(instances);
    return { count: instances.length, made: made };
  });
}

// ---------- تغییر سبک و اندازهٔ آیکون‌های انتخاب‌شده روی بوم ----------
function reportSelection() {
  var list = [];
  figma.currentPage.selection.forEach(function (n) {
    var info = iconInfo(n);
    if (info) list.push({ id: n.id, name: info.name, kind: n.type === "INSTANCE" ? "instance" : "plain", variant: info.variant, size: info.size });
  });
  figma.ui.postMessage({ type: "selection", items: list });
}

function restyle(items) {
  var byId = {};
  figma.currentPage.selection.forEach(function (n) { byId[n.id] = n; });
  var done = [];
  var skipped = 0;
  items.forEach(function (it) {
    var old = byId[it.id];
    if (!old) return;
    var info = iconInfo(old) || { name: it.name };
    if (old.type === "INSTANCE") {
      try { old.setProperties({ Style: STYLE_NAMES[it.variant], Size: String(it.size) }); }
      catch (e) { skipped++; done.push(old); return; }
      info.variant = it.variant; info.size = it.size; info.component = true;
      old.setPluginData("kashi-icon", JSON.stringify(info));
      done.push(old);
    } else {
      var node = makeNode(it);
      var parent = old.parent;
      parent.insertChild(parent.children.indexOf(old), node);
      node.x = old.x + (old.width - node.width) / 2;
      node.y = old.y + (old.height - node.height) / 2;
      old.remove();
      done.push(node);
    }
  });
  figma.currentPage.selection = done;
  return { count: done.length - skipped, skipped: skipped };
}

figma.on("selectionchange", reportSelection);

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
  } else if (msg.type === "component") {
    addComponents(msg.items).then(function (r) {
      figma.notify(r.made ? "کامپوننت با سبک و اندازه در صفحهٔ «" + COMP_PAGE + "» ساخته شد" : "از کامپوننت موجود استفاده شد", { timeout: 2200 });
      figma.ui.postMessage({ type: "inserted", count: r.count, component: true });
    });
  } else if (msg.type === "restyle") {
    var r = restyle(msg.items);
    figma.notify(r.skipped ? r.skipped + " آیکون این اندازه را ندارد؛ کامپوننت‌ها ۱۶ تا ۳۲ دارند" : r.count + " آیکون عوض شد", { timeout: 1800 });
    reportSelection();
  } else if (msg.type === "notify") {
    figma.notify(msg.text, { timeout: 1600 });
  } else if (msg.type === "resize" && UI_SIZES[msg.size]) {
    figma.ui.resize(UI_SIZES[msg.size][0], UI_SIZES[msg.size][1]);
  } else if (msg.type === "save") {
    figma.clientStorage.setAsync(STORE_KEY, msg.state);
  } else if (msg.type === "ready") {
    figma.clientStorage.getAsync(STORE_KEY).then(function (state) {
      figma.ui.postMessage({ type: "state", state: state || null, inFigma: true });
      reportSelection();
    });
  }
};
