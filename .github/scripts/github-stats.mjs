// آمار مخزن (ستاره، فورک، کلون) را از API گیت‌هاب می‌گیرد و در stats.json جمع می‌کند.
// گیت‌هاب کلون‌ها را فقط برای ۱۴ روز اخیر می‌دهد؛ برای همین آمار هر روز نگه داشته می‌شود تا جمع کل از همان روز اول بماند.
// TRAFFIC_TOKEN (توکن با دسترسی Administration: read) برای کلون‌ها لازم است؛ بدون آن فقط ستاره و فورک به‌روز می‌شود.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const [, , file = "stats.json"] = process.argv;
const repo = process.env.GITHUB_REPOSITORY || "Sepantapouya/Kashi";
const api = (path, token) =>
  fetch(`https://api.github.com/repos/${repo}${path}`, {
    headers: Object.assign({ Accept: "application/vnd.github+json", "User-Agent": "kashi-stats" }, token ? { Authorization: `Bearer ${token}` } : {}),
  }).then(async (r) => {
    if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
    return r.json();
  });

const prev = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
const daily = Object.assign({}, prev.clones && prev.clones.daily);

const info = await api("", process.env.GITHUB_TOKEN);
let traffic = null;
if (process.env.TRAFFIC_TOKEN) {
  try {
    traffic = await api("/traffic/clones", process.env.TRAFFIC_TOKEN);
    // روز جاری هنوز کامل نشده؛ مقدار تازه‌تر همیشه جایگزین قبلی می‌شود
    for (const d of traffic.clones) daily[d.timestamp.slice(0, 10)] = { count: d.count, uniques: d.uniques };
  } catch (e) {
    console.warn("clones skipped:", e.message);
  }
} else {
  console.warn("TRAFFIC_TOKEN is not set; clones are not updated");
}

const days = Object.keys(daily).sort();
const stats = {
  updated: new Date().toISOString(),
  stars: info.stargazers_count,
  forks: info.forks_count,
  watchers: info.subscribers_count,
  clones: {
    total: days.reduce((a, d) => a + daily[d].count, 0),
    since: days[0] || null,
    // کلون‌کنندهٔ یکتا را نمی‌شود روی چند بازه جمع زد؛ عدد ۱۴ روزهٔ خود گیت‌هاب
    last14: traffic ? { count: traffic.count, uniques: traffic.uniques } : prev.clones ? prev.clones.last14 : null,
    daily,
  },
};
writeFileSync(file, JSON.stringify(stats, null, 1) + "\n");
console.log(`stars ${stats.stars}, forks ${stats.forks}, clones ${stats.clones.total} since ${stats.clones.since}`);
