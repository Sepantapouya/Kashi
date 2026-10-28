// آیکون‌ها (۲۰×۲۰، خط ۱٫۷ مثل آیکون‌های داخلی کاشی) و لوگوی بانک‌ها

const ICONS = {
  info: '<circle cx="10" cy="10" r="7.5"/><path d="M10 13.5V9.5M10 6.5h.01"/>',
  success: '<circle cx="10" cy="10" r="7.5"/><path d="m6.75 10 2.25 2.25 4.25-4.5"/>',
  warning: '<path d="M8.6 3.4 2.4 14a1.6 1.6 0 0 0 1.4 2.4h12.4a1.6 1.6 0 0 0 1.4-2.4L11.4 3.4a1.6 1.6 0 0 0-2.8 0Z"/><path d="M10 7.5v3.25M10 13.5h.01"/>',
  error: '<circle cx="10" cy="10" r="7.5"/><path d="M10 6.5v4M10 13.5h.01"/>',
  close: '<path d="m5 5 10 10M15 5 5 15"/>',
  check: '<path d="m4.5 10.5 3.5 3.5 7.5-8"/>',
  "chevron-down": '<path d="m6 8 4 4 4-4"/>',
  "chevron-up": '<path d="m6 12 4-4 4 4"/>',
  "chevron-left": '<path d="m12 6-4 4 4 4"/>',
  "chevron-right": '<path d="m8 6 4 4-4 4"/>',
  "arrow-left": '<path d="M16 10H4M8.5 5.5 4 10l4.5 4.5"/>',
  "arrow-right": '<path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5"/>',
  search: '<circle cx="9" cy="9" r="5.5"/><path d="m13 13 3.5 3.5"/>',
  plus: '<path d="M10 4.5v11M4.5 10h11"/>',
  minus: '<path d="M4.5 10h11"/>',
  calendar: '<rect x="3" y="4" width="14" height="13" rx="2.5"/><path d="M3 8.5h14M7 2.5v3M13 2.5v3"/>',
  clock: '<circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l2.5 2"/>',
  user: '<circle cx="10" cy="7" r="3.25"/><path d="M3.75 17c.8-3 3.3-4.75 6.25-4.75s5.45 1.75 6.25 4.75"/>',
  users: '<circle cx="7.5" cy="7.5" r="2.75"/><path d="M2.5 16.5c.6-2.6 2.6-4 5-4s4.4 1.4 5 4M13 4.9a2.75 2.75 0 0 1 0 5.2M14.5 12.7c1.6.5 2.7 1.8 3 3.8"/>',
  home: '<path d="M3.5 8.5 10 3.5l6.5 5V16a1 1 0 0 1-1 1H12v-5H8v5H4.5a1 1 0 0 1-1-1Z"/>',
  settings: '<path d="M4 6h7M15 6h1M4 14h1M9 14h7"/><circle cx="13" cy="6" r="2"/><circle cx="7" cy="14" r="2"/>',
  bell: '<path d="M5.5 8a4.5 4.5 0 0 1 9 0c0 4.5 2 5.5 2 5.5h-13s2-1 2-5.5ZM8.5 16.5a1.6 1.6 0 0 0 3 0"/>',
  mail: '<rect x="2.5" y="4.5" width="15" height="11" rx="2"/><path d="m3 5.5 7 5.5 7-5.5"/>',
  phone: '<rect x="5.5" y="2.5" width="9" height="15" rx="2"/><path d="M9 14.5h2"/>',
  landline: '<path d="M6.5 3h-2A1.5 1.5 0 0 0 3 4.6C3.3 11.3 8.7 16.7 15.4 17a1.5 1.5 0 0 0 1.6-1.5v-2l-3.5-1.5-1.8 1.8a10 10 0 0 1-4.5-4.5L9 7.5 7.5 4Z"/>',
  lock: '<rect x="4" y="9" width="12" height="8.5" rx="2"/><path d="M6.75 9V6.5a3.25 3.25 0 0 1 6.5 0V9"/>',
  eye: '<path d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z"/><circle cx="10" cy="10" r="2.5"/>',
  "eye-off": '<path d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z"/><circle cx="10" cy="10" r="2.5"/><path d="m3 3 14 14"/>',
  upload: '<path d="M10 13V3.5M6.5 7 10 3.5 13.5 7M3.5 13v2.5A1.5 1.5 0 0 0 5 17h10a1.5 1.5 0 0 0 1.5-1.5V13"/>',
  download: '<path d="M10 3.5V13M6.5 9.5 10 13l3.5-3.5M3.5 13v2.5A1.5 1.5 0 0 0 5 17h10a1.5 1.5 0 0 0 1.5-1.5V13"/>',
  file: '<path d="M11.5 2.5H6A1.5 1.5 0 0 0 4.5 4v12A1.5 1.5 0 0 0 6 17.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5ZM11.5 2.5v4h4"/>',
  trash: '<path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 5.5l.8 10.6a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4L15 5.5"/>',
  edit: '<path d="M13.5 3.5a1.8 1.8 0 0 1 2.5 2.5L7 15l-3.5 1 1-3.5Z"/>',
  copy: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>',
  filter: '<path d="M3 4.5h14l-5.5 6.5v5l-3 1.5v-6.5Z"/>',
  more: '<path d="M5 10h.01M10 10h.01M15 10h.01" stroke-width="2.6"/>',
  "more-vertical": '<path d="M10 5h.01M10 10h.01M10 15h.01" stroke-width="2.6"/>',
  grip: '<path d="M7.5 5h.01M12.5 5h.01M7.5 10h.01M12.5 10h.01M7.5 15h.01M12.5 15h.01" stroke-width="2.4"/>',
  star: '<path d="m10 2.8 2.2 4.6 5 .7-3.6 3.5.9 5L10 14.2l-4.5 2.4.9-5-3.6-3.5 5-.7Z"/>',
  heart: '<path d="M10 16.5S3 12.5 3 7.5A3.5 3.5 0 0 1 10 6a3.5 3.5 0 0 1 7 1.5c0 5-7 9-7 9Z"/>',
  "credit-card": '<rect x="2.5" y="4.5" width="15" height="11" rx="2"/><path d="M2.5 8.5h15M5.5 12.5h3"/>',
  bank: '<path d="M3 8 10 3.5 17 8ZM4.5 8v6.5M8 8v6.5M12 8v6.5M15.5 8v6.5M3 16.5h14"/>',
  wallet: '<rect x="3" y="5.5" width="14" height="11" rx="2"/><path d="M13 11h1.5M5 5.5l7-2.5 1 2.5"/>',
  chart: '<path d="M3.5 16.5h13M6 13.5V9M10 13.5V5M14 13.5v-6"/>',
  "map-pin": '<path d="M10 17.5s5.5-5 5.5-9.5a5.5 5.5 0 0 0-11 0c0 4.5 5.5 9.5 5.5 9.5Z"/><circle cx="10" cy="8" r="2"/>',
  link: '<path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9"/>',
  refresh: '<path d="M16 10a6 6 0 1 1-1.8-4.3M16 3.5V7h-3.5"/>',
  logout: '<path d="M8 17H5a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 5 3h3M13 13.5 16.5 10 13 6.5M16.5 10H8"/>',
  menu: '<path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13"/>',
  folder: '<path d="M2.5 6A1.5 1.5 0 0 1 4 4.5h3.5l1.5 2h7A1.5 1.5 0 0 1 17.5 8v7a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 15Z"/>',
  image: '<rect x="2.5" y="3.5" width="15" height="13" rx="2"/><circle cx="7" cy="8" r="1.5"/><path d="m17.5 13-4-4-8.5 7.5"/>',
  sun: '<circle cx="10" cy="10" r="3.5"/><path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.3 4.3l1.1 1.1M14.6 14.6l1.1 1.1M4.3 15.7l1.1-1.1M14.6 5.4l1.1-1.1"/>',
  moon: '<path d="M16.5 12A7 7 0 1 1 8 3.5a5.5 5.5 0 0 0 8.5 8.5Z"/>',
  globe: '<circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2 2.2 3 4.7 3 7.5s-1 5.3-3 7.5c-2-2.2-3-4.7-3-7.5s1-5.3 3-7.5Z"/>',
  shield: '<path d="M10 2.5 16 5v4.5c0 4-2.6 6.7-6 8-3.4-1.3-6-4-6-8V5Z"/>',
  sparkle: '<path d="m10 2.5 1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4L4 8.5l4.4-1.6Z"/>',
  grid: '<rect x="3" y="3" width="5.5" height="5.5" rx="1"/><rect x="11.5" y="3" width="5.5" height="5.5" rx="1"/><rect x="3" y="11.5" width="5.5" height="5.5" rx="1"/><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1"/>',
  list: '<path d="M7.5 5.5h9M7.5 10h9M7.5 14.5h9M3.5 5.5h.01M3.5 10h.01M3.5 14.5h.01"/>',
  cart: '<path d="M2.5 3h2l2 10h9l1.5-7H5.5"/><circle cx="8" cy="16.5" r="1"/><circle cx="14.5" cy="16.5" r="1"/>',
  tag: '<path d="M3 3h6.5l7.5 7.5-6.5 6.5L3 9.5Z"/><path d="M6.5 6.5h.01" stroke-width="2.4"/>',
  inbox: '<path d="M2.5 11h4l1.5 2.5h4l1.5-2.5h4M4.5 4.5h11l2 6.5v4.5a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5V11Z"/>',
  send: '<path d="M17.5 2.5 9 11M17.5 2.5 12 17.5l-3-6.5-6.5-3Z"/>',
  receipt: '<path d="M5 2.5h10v15l-2-1.5-1.5 1.5L10 16l-1.5 1.5L7 16l-2 1.5ZM7.5 7h5M7.5 10h5"/>',
  building: '<path d="M4 17.5V4a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 13 4v13.5M13 8h2.5A1.5 1.5 0 0 1 17 9.5v8M2.5 17.5h15M7 6h2M7 9.5h2M7 13h2"/>',
  "id-card": '<rect x="2.5" y="4" width="15" height="12" rx="2"/><circle cx="7" cy="9" r="1.75"/><path d="M4.5 13.5c.4-1.3 1.3-2 2.5-2s2.1.7 2.5 2M11.5 8.5h4M11.5 11.5h3"/>',
  car: '<path d="M4 12.5 5.5 7.5A1.5 1.5 0 0 1 7 6.5h6a1.5 1.5 0 0 1 1.4 1l1.6 5M3 12.5h14v3H3ZM5.5 15.5v1.5M14.5 15.5v1.5"/>',
  keyboard: '<rect x="2" y="5" width="16" height="10" rx="2"/><path d="M5 8.5h.01M8 8.5h.01M11 8.5h.01M14 8.5h.01M6 12h8"/>',
  percent: '<path d="M15 5 5 15"/><circle cx="6" cy="6" r="1.75"/><circle cx="14" cy="14" r="1.75"/>',
  sidebar: '<rect x="2.5" y="3.5" width="15" height="13" rx="2"/><path d="M12.5 3.5v13"/>',
  command: '<path d="M7.5 7.5h5v5h-5ZM7.5 7.5V5.5a2 2 0 1 0-2 2Zm5 0V5.5a2 2 0 1 1 2 2Zm0 5v2a2 2 0 1 0 2-2Zm-5 0v2a2 2 0 1 1-2-2Z"/>',
};

const svgOf = (inner, color = "#000") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

/** صفحه‌های آیکون و لوگو؛ هر کدام کامپوننت با کلید ثابت تا در به‌روزرسانی‌ها instance ها وصل بمانند */
function buildAssets() {
  const root = kitPage("🧩", "Assets", "آیکون‌ها و لوگوها", "");
  section(root, "Icons · آیکون‌ها", `${fa(Object.keys(ICONS).length)} آیکون ۲۰×۲۰ با خط ۱٫۷، هم‌شکل آیکون‌های داخلی کاشی. در طرح‌ها با Instance swap عوض می‌شوند.`, buildIcons);
  section(root, "Bank logos · لوگوی بانک‌ها", `${fa(BANKS.length)} لوگوی بانک و درگاه پرداخت از @kashi-ui/bank-logos.`, buildBankLogos);
}

function buildIcons(holder) {
  for (const [name, inner] of Object.entries(ICONS)) {
    const node = figma.createNodeFromSvg(svgOf(inner));
    node.name = `Icon / ${name}`;
    const comp = upsertComponent(`Icon / ${name}`, node);
    comp.name = `Icon / ${name}`;
    comp.fills = [];
    comp.clipsContent = false;
    for (const n of comp.findAll(() => true)) {
      if ("constraints" in n) n.constraints = { horizontal: "SCALE", vertical: "SCALE" };
      if ("strokes" in n && n.strokes.length) n.strokes = [paint("text-secondary")];
    }
    comp.description = `آیکون ${name} — ۲۰×۲۰`;
    add(holder, F({ name, dir: "V", gap: 8, p: 12, cross: "center", w: 96, radius: "radius/md", stroke: "border-secondary", fill: "bg-secondary" }, [
      comp,
      T(name, { style: "Text xs/Regular", color: "text-tertiary", align: "center", ltr: true }),
    ]));
    S.icons[name] = comp;
  }
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
