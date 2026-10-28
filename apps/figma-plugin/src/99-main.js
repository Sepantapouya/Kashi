// اجرای پلاگین: پنل تنظیمات، ساخت مرحله‌به‌مرحله و گزارش

const KIT_PAGES = ["📕 Kashi UI Kit", "🎨 Foundations", "🧩 Assets", "🔘 Actions", "📝 Forms", "🇮🇷 Persian", "💬 Feedback", "📊 Data display", "🧭 Navigation"];

const progress = (text, pct) => figma.ui.postMessage({ type: "progress", text, pct });
const tick = () => new Promise((r) => setTimeout(r, 0));

/** استایل‌های متن و افکت را که در ساخت جمع شده‌اند وصل می‌کند */
async function flushStyles() {
  for (const [node, id] of S.pendingText) {
    try { await node.setTextStyleIdAsync(id); } catch (e) { /* گره حذف شده */ }
  }
  for (const [node, id] of S.pendingEffect) {
    try { await node.setEffectStyleIdAsync(id); } catch (e) { /* گره حذف شده */ }
  }
  S.pendingText = [];
  S.pendingEffect = [];
}

async function removeOldPages() {
  const old = figma.root.children.filter((p) => KIT_PAGES.includes(p.name));
  if (!old.length) return;
  // صفحهٔ فعلی را نمی‌شود حذف کرد
  const keep = figma.root.children.find((p) => !KIT_PAGES.includes(p.name)) || figma.createPage();
  if (!keep.name) keep.name = "Page 1";
  await figma.setCurrentPageAsync(keep);
  for (const p of old) p.remove();
}

async function run(opts) {
  const started = Date.now();
  S.theme = opts.theme === "light" ? "light" : "dark";
  S.errors = [];
  S.stats = { variables: 0, textStyles: 0, effectStyles: 0, components: 0, sets: 0 };

  progress("بارگذاری فونت…", 3);
  const family = await loadFonts((opts.font || "").trim() || TOKENS.font.family);
  if (family !== (opts.font || TOKENS.font.family)) figma.notify(`فونت «${opts.font}» پیدا نشد؛ از ${family} استفاده شد.`);

  progress("ساخت متغیرها (Variables)…", 8);
  await buildVariables();
  await tick();
  progress("ساخت استایل‌های متن و سایه…", 15);
  await buildTextStyles();
  await buildEffectStyles();
  await tick();

  if (opts.components) {
    await removeOldPages();
    const steps = [
      ["پایه‌ها", buildFoundations],
      ["آیکون‌ها و لوگوی بانک‌ها", () => {
        const page = S.nextPage;
        S.nextPage = null;
        page.name = "🧩 Assets";
        const root = F({ name: "Kashi · Assets", dir: "V", gap: 48, p: 64, fill: "bg-primary", w: 1248 }, [
          T("آیکون‌ها", { style: "Display xl/Semibold", color: "text-primary" }),
        ]);
        page.appendChild(root);
        setThemeMode(root);
        add(root, buildIcons(page));
        add(root, T("لوگوی بانک‌ها و درگاه‌ها", { style: "Display xl/Semibold", color: "text-primary" }));
        add(root, buildBankLogos(page));
        return page;
      }],
      ["دکمه‌ها", buildActions],
      ["فرم‌ها", buildForms],
      ["کامپوننت‌های فارسی", buildPersian],
      ["بازخورد", buildFeedback],
      ["نمایش داده", buildData],
      ["ناوبری", buildNavigation],
    ];
    // آیکون‌ها قبل از همه لازم‌اند
    const order = [steps[1], steps[0], ...steps.slice(2)];
    let i = 0;
    for (const [label, fn] of order) {
      progress(`ساخت ${label}…`, 20 + Math.round((i++ / order.length) * 70));
      S.nextPage = figma.createPage();
      await figma.setCurrentPageAsync(S.nextPage);
      await tick();
      try { fn(); } catch (e) { S.errors.push(`${label}: ${e.message || e}`); }
      await flushStyles();
    }
    progress("صفحهٔ جلد…", 94);
    S.nextPage = figma.createPage();
    await figma.setCurrentPageAsync(S.nextPage);
    const cover = buildCover();
    await flushStyles();
    // ترتیب صفحه‌ها
    KIT_PAGES.forEach((name, idx) => {
      const p = figma.root.children.find((x) => x.name === name);
      if (p) figma.root.insertChild(idx, p);
    });
    await figma.setCurrentPageAsync(cover);
    figma.viewport.scrollAndZoomIntoView(cover.children);
  }

  const secs = Math.round((Date.now() - started) / 1000);
  const summary = Object.assign({}, S.stats, { seconds: secs, family, errors: S.errors });
  figma.ui.postMessage({ type: "done", summary });
  figma.notify(`کاشی آماده شد: ${S.stats.sets} کامپوننت، ${S.stats.components} variant، ${S.stats.variables} متغیر`);
}

figma.showUI(__html__, { width: 380, height: 560, themeColors: true, title: "Kashi UI Kit" });
figma.ui.postMessage({ type: "init", version: TOKENS.version, font: TOKENS.font.family });
figma.ui.onmessage = async (msg) => {
  if (msg.type === "build") {
    try { await run(msg); } catch (e) {
      figma.ui.postMessage({ type: "error", message: String(e && e.message ? e.message : e) });
    }
  }
  if (msg.type === "close") figma.closePlugin();
};
