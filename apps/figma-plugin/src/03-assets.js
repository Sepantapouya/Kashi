// آیکون‌ها (از @kashi-ui/icons) و لوگوی بانک‌ها

// ICONS، ICON_TITLES، ICON_CATEGORIES و ICON_CATEGORY را build.mjs از packages/icons/src/icons.js می‌گذارد

// ICON_RENDER موتور سبک‌های @kashi-ui/icons است؛ همان شش سبک سایت و پکیج npm
const STYLE_TITLES = { light: "Light", bold: "Bold", bulk: "Bulk", "two-tone": "Two-tone", broken: "Broken", curved: "Curved" };

const svgOf = (inner, sw) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#000" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner.replace(/currentColor/g, "#000")}</svg>`;

/**
 * تنظیمات آیکون از پنل: export = صفحهٔ کامل آیکون‌ها، styles = سبک‌ها (یک یا چند)، stroke = ضخامت خط.
 * سبک light همیشه ساخته می‌شود چون کامپوننت‌های کیت از آن استفاده می‌کنند؛ اگر export خاموش باشد
 * فقط آیکون‌هایی ساخته می‌شوند که خود کیت لازم دارد.
 */
function iconOptions() {
  const o = S.opts || {};
  const styles = (o.iconStyles && o.iconStyles.length ? o.iconStyles : ["light"]).filter((v) => STYLE_TITLES[v]);
  const stroke = Number(o.iconStroke) > 0 ? Number(o.iconStroke) : 1;
  return { exportAll: o.exportIcons !== false, styles: styles.length ? styles : ["light"], stroke };
}

/** صفحه‌های آیکون و لوگو؛ هر کدام کامپوننت با کلید ثابت تا در به‌روزرسانی‌ها instance ها وصل بمانند */
function buildAssets() {
  const root = kitPage("🧩", "Assets", "آیکون‌ها و لوگوها", "");
  const { exportAll, styles, stroke } = iconOptions();
  const count = exportAll ? Object.keys(ICONS).length : ICON_USED.length;
  const strokeFa = fa(String(stroke).replace(".", "٫"));
  // light همیشه اول؛ صفحهٔ «Icons» همان کلیدهای نسخه‌های قبلی را نگه می‌دارد
  const order = ["light"].concat(exportAll ? styles.filter((v) => v !== "light") : []);
  for (const style of order) {
    const title = style === "light" ? "Icons · آیکون‌ها" : `Icons ${STYLE_TITLES[style]} · آیکون‌ها، سبک ${STYLE_TITLES[style]}`;
    const desc = exportAll
      ? `${fa(count)} آیکون ۲۰×۲۰ با خط ${strokeFa} در ${fa(Object.keys(ICON_CATEGORIES).length)} دسته، سبک ${STYLE_TITLES[style]}. در پنل Assets هم پوشه‌بندی شده‌اند و در طرح‌ها با Instance swap عوض می‌شوند.`
      : `${fa(count)} آیکونی که کامپوننت‌های کیت به کار می‌برند. برای همهٔ ${fa(Object.keys(ICONS).length)} آیکون، «ساخت صفحهٔ آیکون‌ها» را در پنل پلاگین روشن کنید.`;
    section(root, title, desc, (holder) => buildIcons(holder, style, order.length > 1, exportAll, stroke), { stack: true });
  }
  section(root, "Bank logos · لوگوی بانک‌ها", `${fa(BANKS.length)} لوگوی بانک و درگاه پرداخت از @kashi-ui/bank-logos.`, buildBankLogos);
}

/** هر دسته یک بلوک با عنوان و شبکهٔ خودش؛ نام کامپوننت «Icon / [سبک /] دسته / نام» تا پنل Assets پوشه‌بندی شود */
function buildIcons(holder, style, multi, exportAll, stroke) {
  const names = exportAll ? Object.keys(ICONS) : ICON_USED;
  const byCat = {};
  for (const name of names) (byCat[ICON_CATEGORY[name]] = byCat[ICON_CATEGORY[name]] || []).push(name);
  for (const [cat, title] of Object.entries(ICON_CATEGORIES)) {
    const list = byCat[cat];
    if (!list) continue;
    const grid = F({ name: "Icons", dir: "H", wrap: true, gap: 12, rowGap: 12, w: "fill" });
    add(holder, F({ name: cat, dir: "V", gap: 16, w: "fill", pb: 32, stroke: "border-secondary", sides: [0, 0, 1, 0] }, [
      F({ name: "Title", dir: "H", gap: 12, cross: "center" }, [
        T(title, { style: "Text xl/Semibold", color: "text-primary" }),
        T(`${fa(list.length)} آیکون`, { style: "Text sm/Regular", color: "text-tertiary" }),
        T(cat, { style: "Text sm/Regular", color: "text-quaternary", ltr: true }),
      ]),
      grid,
    ]));
    const folder = multi ? `${STYLE_TITLES[style]} / ${title}` : title;
    for (const name of list) iconCell(grid, name, `Icon / ${folder} / ${name}`, style, stroke);
  }
}

function iconCell(grid, name, label, style, stroke) {
  const inner = ICON_RENDER.renderBody(ICONS[name], style, { uid: `k-${style}-${name}`, sw: stroke });
  const node = figma.createNodeFromSvg(svgOf(inner, stroke));
  node.name = label;
  // کلید light بدون نام سبک می‌ماند تا فایل‌هایی که با نسخه‌های قبلی ساخته شده‌اند درجا به‌روز شوند
  const comp = upsertComponent(style === "light" ? `Icon / ${name}` : `Icon / ${name} / ${style}`, node);
  comp.name = label;
  comp.fills = [];
  comp.clipsContent = false;
  for (const n of comp.findAll(() => true)) {
    if ("constraints" in n) n.constraints = { horizontal: "SCALE", vertical: "SCALE" };
    if ("strokes" in n && n.strokes.length) n.strokes = [paint("text-secondary")];
    // بخش‌های توپر سبک‌های bold و bulk همان رنگ خط را می‌گیرند؛ لایه‌های ماسک دست نمی‌خورند
    if (n.type !== "FRAME" && !n.isMask && "fills" in n && Array.isArray(n.fills) && n.fills.some((f) => f.type === "SOLID" && f.color.r < 0.5)) n.fills = [paint("text-secondary")];
  }
  comp.description = `${ICON_TITLES[name]} — ${name} · ${STYLE_TITLES[style]} · @kashi-ui/icons`;
  // نام‌های بلند (مثل calendar-check-clock) در دو خط می‌شکنند و بیشتر از آن با «…» کوتاه می‌شوند
  add(grid, F({ name, dir: "V", gap: 8, pt: 14, pb: 10, px: 8, cross: "center", w: 112, h: 92, radius: "radius/md", stroke: "border-secondary", fill: "bg-secondary" }, [
    comp,
    T(name.replace(/-/g, "-\u200b"), { style: "Text xs/Regular", color: "text-tertiary", align: "center", ltr: true, w: "fill", maxLines: 2, name: "Name" }),
  ]));
  if (style === "light") S.icons[name] = comp;
}

/** نمونهٔ آیکون با اندازه و رنگ دلخواه */
function I(name, size = 20, color = "text-tertiary") {
  const comp = S.icons[name] || S.icons.info;
  const inst = comp.createInstance();
  if (size !== 20) inst.rescale(size / 20);
  inst.name = name;
  // داخل کامپوننت‌ها ضخامت همان ۱٫۵ کد می‌ماند، هر ضخامتی که برای کتابخانهٔ آیکون انتخاب شده باشد
  const base = iconOptions().stroke;
  for (const n of inst.findAll((x) => "strokes" in x && x.strokes.length)) {
    n.strokes = [paint(color)];
    if (base !== 1.5 && typeof n.strokeWeight === "number") n.strokeWeight = (n.strokeWeight / base) * 1.5;
  }
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
