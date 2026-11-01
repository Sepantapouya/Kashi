// آمار زندهٔ مخزن: GitHub Action هر ساعت stats.json را در شاخهٔ stats می‌نویسد و این‌جا خوانده می‌شود.
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
  let stats: GithubStats | null = null;
  try {
    const r = await fetch(`${STATS_URL}?h=${hour}`);
    if (r.ok) stats = await r.json();
  } catch { /* شاخهٔ stats در دسترس نیست */ }
  if (!stats) {
    // پشتیبان: ستاره و فورک مستقیم از API عمومی گیت‌هاب
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}`);
      if (r.ok) {
        const d = await r.json();
        stats = { updated: new Date().toISOString(), stars: d.stargazers_count, forks: d.forks_count };
      }
    } catch { /* آفلاین */ }
  }
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
