// اجرای پلاگین: پنل تنظیمات، ساخت یا به‌روزرسانی صفحه‌به‌صفحه و گزارش

// نام صفحه‌های نسخهٔ اول پلاگین (پیش از «هر کامپوننت یک صفحه»)
const LEGACY_PAGES = ["📕 Kashi UI Kit", "🎨 Foundations", "🧩 Assets", "🔘 Actions", "📝 Forms", "🇮🇷 Persian", "💬 Feedback", "📊 Data display", "🧭 Navigation"];
const DIVIDER = "———————————";

const progress = (text, pct) => figma.ui.postMessage({ type: "progress", text, pct });
const tick = () => new Promise((r) => setTimeout(r, 0));

const kitPages = () => {
  const map = {};
  for (const p of figma.root.children) {
    const id = p.getPluginData(KEY.page);
    if (id) map[id] = p;
  }
  return map;
};

/** صفحهٔ کیت با شناسهٔ ثابت؛ اگر نبود ساخته می‌شود */
function ensurePage(pages, id, name) {
  let p = pages[id];
  if (!p) {
    p = figma.createPage();
    p.setPluginData(KEY.page, id);
    pages[id] = p;
    S.stats.pages++;
  }
  p.name = name;
  return p;
}

async function removeLegacyPages() {
  const old = figma.root.children.filter((p) => LEGACY_PAGES.includes(p.name) && !p.getPluginData(KEY.page));
  if (!old.length) return 0;
  const keep = figma.root.children.find((p) => old.indexOf(p) < 0) || figma.createPage();
  await figma.setCurrentPageAsync(keep);
  for (const p of old) p.remove();
  return old.length;
}

async function run(opts) {
  const started = Date.now();
  S.theme = opts.theme === "light" ? "light" : "dark";
  S.errors = [];
  S.stats = { variables: 0, components: 0, sets: 0, pages: 0, added: 0, updated: 0 };

  progress("بارگذاری فونت…", 3);
  const family = await loadFonts((opts.font || "").trim() || TOKENS.font.family);
  if (family !== (opts.font || TOKENS.font.family)) figma.notify(`فونت «${opts.font}» پیدا نشد؛ از ${family} استفاده شد.`);

  progress("ساخت و به‌روزرسانی متغیرها (Variables)…", 8);
  await buildVariables();
  const removedStyles = await removeLegacyStyles();
  await tick();

  if (opts.components) {
    await removeLegacyPages();
    // ثبت همهٔ صفحه‌ها؛ ترتیب ثبت = ترتیب ساخت (آیکون‌ها قبل از کامپوننت‌ها)
    S.groups = [];
    S.queue = [];
    buildFoundations();
    buildAssets();
    buildActions();
    buildForms();
    buildPersian();
    buildFeedback();
    buildData();
    buildNavigation();

    const pages = kitPages();
    const order = [ensurePage(pages, "cover", "📕 Kashi UI Kit")];
    for (const g of S.groups) {
      order.push(ensurePage(pages, `divider/${g.key}`, DIVIDER));
      for (const item of S.queue.filter((q) => q.group === g)) order.push(ensurePage(pages, item.id, `${g.emoji} ${item.en}`));
    }

    let i = 0;
    for (const item of S.queue) {
      progress(`${item.group.title} · ${item.en}`, 12 + Math.round((i++ / S.queue.length) * 82));
      const page = pages[item.id];
      await figma.setCurrentPageAsync(page);
      if (page.loadAsync) await page.loadAsync();
      try { renderSection(item, page); } catch (e) { S.errors.push(`${item.en}: ${e && e.message ? e.message : e}`); }
      await tick();
    }

    progress("صفحهٔ جلد…", 96);
    const cover = pages.cover;
    await figma.setCurrentPageAsync(cover);
    if (cover.loadAsync) await cover.loadAsync();
    try { buildCover(cover); } catch (e) { S.errors.push(`cover: ${e.message || e}`); }

    // صفحه‌ای که در این نسخه دیگر وجود ندارد
    const wanted = new Set(order);
    for (const p of Object.values(pages)) if (!wanted.has(p)) p.remove();

    // ترتیب صفحه‌ها؛ صفحه‌های خود کاربر بعد از کیت می‌مانند
    order.forEach((p, idx) => figma.root.insertChild(idx, p));
    figma.viewport.scrollAndZoomIntoView(cover.children);
  }

  const secs = Math.round((Date.now() - started) / 1000);
  const summary = Object.assign({}, S.stats, { seconds: secs, family, errors: S.errors, removedStyles, limitedModes: !!S.limitedModes, version: TOKENS.version });
  figma.root.setPluginData("kashi-version", TOKENS.version);
  figma.ui.postMessage({ type: "done", summary });
  figma.notify(`کاشی ${TOKENS.version}: ${S.stats.added} مورد جدید، ${S.stats.updated} مورد به‌روز شد`);
}

figma.showUI(__html__, { width: 380, height: 600, themeColors: true, title: "Kashi UI Kit" });
figma.ui.postMessage({ type: "init", version: TOKENS.version, font: TOKENS.font.family, installed: figma.root.getPluginData("kashi-version") });
figma.ui.onmessage = async (msg) => {
  if (msg.type === "build") {
    try { await run(msg); } catch (e) {
      figma.ui.postMessage({ type: "error", message: String(e && e.message ? e.message : e) });
    }
  }
  if (msg.type === "close") figma.closePlugin();
};
