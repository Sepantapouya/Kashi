// آیکون‌ها (از @kashi-ui/icons) و لوگوی بانک‌ها

// ICONS، ICON_TITLES، ICON_CATEGORIES و ICON_CATEGORY را build.mjs از packages/icons/src/icons.js می‌گذارد

const svgOf = (inner, color = "#000") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

/** صفحه‌های آیکون و لوگو؛ هر کدام کامپوننت با کلید ثابت تا در به‌روزرسانی‌ها instance ها وصل بمانند */
function buildAssets() {
  const root = kitPage("🧩", "Assets", "آیکون‌ها و لوگوها", "");
  section(root, "Icons · آیکون‌ها", `${fa(Object.keys(ICONS).length)} آیکون ۲۰×۲۰ با خط ۱٫۵ در ${fa(Object.keys(ICON_CATEGORIES).length)} دسته، هم‌شکل آیکون‌های داخلی کاشی. در پنل Assets هم پوشه‌بندی شده‌اند و در طرح‌ها با Instance swap عوض می‌شوند.`, buildIcons, { stack: true });
  section(root, "Bank logos · لوگوی بانک‌ها", `${fa(BANKS.length)} لوگوی بانک و درگاه پرداخت از @kashi-ui/bank-logos.`, buildBankLogos);
}

/** هر دسته یک بلوک با عنوان و شبکهٔ خودش؛ نام کامپوننت «Icon / دسته / نام» تا پنل Assets هم پوشه‌بندی شود */
function buildIcons(holder) {
  const byCat = {};
  for (const name of Object.keys(ICONS)) (byCat[ICON_CATEGORY[name]] = byCat[ICON_CATEGORY[name]] || []).push(name);
  for (const [cat, title] of Object.entries(ICON_CATEGORIES)) {
    const names = byCat[cat];
    if (!names) continue;
    const grid = F({ name: "Icons", dir: "H", wrap: true, gap: 12, rowGap: 12, w: "fill" });
    add(holder, F({ name: cat, dir: "V", gap: 16, w: "fill", pb: 32, stroke: "border-secondary", sides: [0, 0, 1, 0] }, [
      F({ name: "Title", dir: "H", gap: 12, cross: "center" }, [
        T(title, { style: "Text xl/Semibold", color: "text-primary" }),
        T(`${fa(names.length)} آیکون`, { style: "Text sm/Regular", color: "text-tertiary" }),
        T(cat, { style: "Text sm/Regular", color: "text-quaternary", ltr: true }),
      ]),
      grid,
    ]));
    for (const name of names) iconCell(grid, name, `Icon / ${title} / ${name}`);
  }
}

function iconCell(grid, name, label) {
  const node = figma.createNodeFromSvg(svgOf(ICONS[name]));
  node.name = label;
  // کلید بدون دسته می‌ماند تا فایل‌هایی که با نسخهٔ قبلی ساخته شده‌اند درجا به‌روز شوند
  const comp = upsertComponent(`Icon / ${name}`, node);
  comp.name = label;
  comp.fills = [];
  comp.clipsContent = false;
  for (const n of comp.findAll(() => true)) {
    if ("constraints" in n) n.constraints = { horizontal: "SCALE", vertical: "SCALE" };
    if ("strokes" in n && n.strokes.length) n.strokes = [paint("text-secondary")];
  }
  comp.description = `${ICON_TITLES[name]} — ${name} · @kashi-ui/icons`;
  add(grid, F({ name, dir: "V", gap: 8, p: 12, cross: "center", w: 96, radius: "radius/md", stroke: "border-secondary", fill: "bg-secondary" }, [
    comp,
    T(name, { style: "Text xs/Regular", color: "text-tertiary", align: "center", ltr: true }),
  ]));
  S.icons[name] = comp;
}

/** نمونهٔ آیکون با اندازه و رنگ دلخواه */
function I(name, size = 20, color = "text-tertiary") {
  const comp = S.icons[name] || S.icons.info;
  const inst = comp.createInstance();
  if (size !== 20) inst.rescale(size / 20);
  inst.name = name;
  for (const n of inst.findAll((x) => "strokes" in x && x.strokes.length)) n.strokes = [paint(color)];
  return inst;
}

/** لوگوی بانک‌ها به شکل کامپوننت؛ برای فیلد کارت، شبا و نشان بانک */
function buildBankLogos(holder) {
  for (const b of BANKS) {
    let node;
    try { node = figma.createNodeFromSvg(b.svg); } catch (e) { continue; }
    node.rescale(32 / Math.max(node.width, node.height));
    const comp = upsertComponent(`Bank / ${b.slug}`, node);
    comp.name = `Bank / ${b.slug}`;
    comp.description = b.name;
    comp.fills = [];
    add(holder, F({ name: b.slug, dir: "V", gap: 8, p: 12, cross: "center", w: 120, radius: "radius/md", stroke: "border-secondary", fill: "bg-secondary" }, [
      comp,
      T(b.name, { style: "Text xs/Regular", color: "text-secondary", align: "center", w: "fill" }),
    ]));
    S.bankLogos[b.slug] = comp;
  }
}

function bankLogo(slug, size = 20) {
  const comp = S.bankLogos[slug];
  if (!comp) return R({ w: size, h: size, radius: "radius/full", fill: "bg-tertiary", name: slug });
  const inst = comp.createInstance();
  inst.rescale(size / Math.max(comp.width, comp.height));
  return inst;
}
const bankName = (slug) => (BANKS.find((b) => b.slug === slug) || { name: slug }).name;
