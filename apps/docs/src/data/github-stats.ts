// آمار مخزن که GitHub Action هر ساعت در شاخهٔ stats می‌نویسد؛ هم موقع بیلد (عدد اولیه) و هم در مرورگر (عدد زنده) استفاده می‌شود
export const STATS_URL = "https://raw.githubusercontent.com/Sepantapouya/Kashi/stats/stats.json";

export interface GithubStats {
  updated: string;
  stars: number;
  forks: number;
  clones?: { total: number; since: string | null; last14: { count: number; uniques: number } | null; daily: Record<string, { count: number; uniques: number }> };
}

export const faNum = (n: number) => n.toLocaleString("fa-IR");

/** موقع بیلد؛ اگر شبکه نبود، صفحه بدون عدد اولیه ساخته می‌شود و مرورگر پرش می‌کند */
export async function fetchStats(): Promise<GithubStats | null> {
  try {
    const r = await fetch(STATS_URL, { signal: AbortSignal.timeout(4000) });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

/** نمودار کلون روزانه به شکل SVG؛ محور زمان از راست به چپ مثل متن فارسی */
export function clonesChart(daily: Record<string, { count: number; uniques: number }> | undefined, w = 640, h = 180) {
  // روزهای خالی پیش از اولین کلون (پیش از انتشار) نمایش داده نمی‌شوند
  const all = Object.keys(daily || {}).sort();
  const first = all.findIndex((d) => daily![d].count > 0);
  const days = first < 0 ? [] : all.slice(first);
  if (days.length < 2) return "";
  const pad = { t: 16, b: 28, x: 24 };
  const max = Math.max(...days.map((d) => daily![d].count), 1);
  const x = (i: number) => w - pad.x - (i * (w - pad.x * 2)) / (days.length - 1);
  const y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  const line = (k: "count" | "uniques") => days.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(daily![d][k]).toFixed(1)}`).join(" ");
  const base = h - pad.b;
  const label = (d: string) => new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "short" }).format(new Date(d));
  const every = Math.ceil(days.length / 7);
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="کلون روزانهٔ مخزن، بیشترین ${faNum(max)} در روز">
<defs><linearGradient id="gh-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".22"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
${[0, 0.5, 1].map((t) => `<line x1="0" x2="${w}" y1="${(pad.t + t * (base - pad.t)).toFixed(1)}" y2="${(pad.t + t * (base - pad.t)).toFixed(1)}" class="gh-grid"/>`).join("")}
<path d="${line("count")} L${x(days.length - 1).toFixed(1)} ${base} L${x(0).toFixed(1)} ${base}Z" fill="url(#gh-fill)"/>
<path d="${line("count")}" class="gh-line" vector-effect="non-scaling-stroke"/>
<path d="${line("uniques")}" class="gh-line gh-line--2" vector-effect="non-scaling-stroke"/>
${days.map((d, i) => (i % every === 0 || i === days.length - 1 ? `<text x="${x(i).toFixed(1)}" y="${h - 8}" text-anchor="middle" class="gh-tick">${label(d)}</text>` : "")).join("")}
</svg>`;
}
