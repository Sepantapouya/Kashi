// آمار زندهٔ مخزن: ستاره و فورک لحظه‌ای از API عمومی گیت‌هاب؛ کلون‌ها (که گیت‌هاب روزانه حساب می‌کند) از stats.json
// که GitHub Action در شاخهٔ stats می‌نویسد. زمان‌بندی Action در گیت‌هاب گاهی ساعت‌ها عقب می‌افتد، پس ستاره به آن وابسته نیست.
// هر عنصری با data-gh="stars|forks|clones|uniques|updated" پر می‌شود و [data-gh-chart] نمودار کلون روزانه را می‌گیرد.
import { STATS_URL, clonesChart, faNum as fa, type GithubStats } from "../data/github-stats";

const REPO = "Sepantapouya/Kashi";
const KEY = "kashi-gh-stats";

function ago(iso: string) {
  const min = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (min < 1) return "همین الان";
  if (min < 60) return `${fa(min)} دقیقه پیش`;
  const h = Math.round(min / 60);
  return h < 24 ? `${fa(h)} ساعت پیش` : `${fa(Math.round(h / 24))} روز پیش`;
}

async function load(): Promise<GithubStats | null> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (cached && Date.now() - cached.at < 10 * 60000) return cached.stats;
  } catch { /* حافظهٔ مرورگر در دسترس نیست */ }
  // نشانی هر ساعت عوض می‌شود تا کش CDN گیت‌هاب عدد کهنه ندهد
  const hour = Math.floor(Date.now() / 3600000);
  const [file, live] = await Promise.all([
    fetch(`${STATS_URL}?h=${hour}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    fetch(`https://api.github.com/repos/${REPO}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  let stats: GithubStats | null = file;
  if (live) stats = Object.assign({}, file, { stars: live.stargazers_count, forks: live.forks_count, updated: new Date().toISOString() });
  if (stats) {
    try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), stats })); } catch { /* */ }
  }
  return stats;
}

const els = document.querySelectorAll<HTMLElement>("[data-gh]");
const charts = document.querySelectorAll<HTMLElement>("[data-gh-chart]");
if (els.length || charts.length) {
  load().then((s) => {
    if (!s) return;
    const c = s.clones;
    const values: Record<string, string | null> = {
      stars: fa(s.stars),
      forks: fa(s.forks),
      clones: c && c.total ? fa(c.total) : null,
      uniques: c && c.last14 ? fa(c.last14.uniques) : null,
      updated: ago(s.updated),
    };
    for (const el of els) {
      const v = values[el.dataset.gh || ""];
      if (v == null) continue;
      el.textContent = v;
      el.closest<HTMLElement>("[data-gh-wait]")?.removeAttribute("data-gh-wait");
    }
    const svg = c ? clonesChart(c.daily) : "";
    if (svg) for (const el of charts) el.innerHTML = svg;
  });
}
