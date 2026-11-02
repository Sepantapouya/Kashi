// فهرست شهرهای ایران به تفکیک استان از ویکی‌داده (CC0) می‌سازد: src/cities.ts
// اجرا: node scripts/build-cities.mjs
// ویکی‌داده هر شهر را با کلاس «شهر ایران» (Q56557504) و استان را با «استان ایران» (Q1344695) می‌شناسد.
import { writeFileSync } from "node:fs";

const QUERY = `SELECT ?c ?fa ?provFa WHERE {
  ?c wdt:P31 wd:Q56557504; rdfs:label ?fa. FILTER(LANG(?fa) = "fa")
  OPTIONAL { ?c wdt:P131+ ?prov. ?prov wdt:P31 wd:Q1344695; rdfs:label ?provFa. FILTER(LANG(?provFa) = "fa") }
}`;

// استان چند شهر در ویکی‌داده اشتباه یا دوگانه ثبت شده است
const PROVINCE_FIX = {
  "دهبارز": "هرمزگان", "رودبار": "گیلان", "فتح‌المبین": "خوزستان", "بینالود": "خراسان رضوی", "دژکرد": "فارس", "میداود": "خوزستان",
};
// برچسب‌هایی که شهر امروزی نیستند (مثلاً شهر باستانی)
const DROP = new Set(["شهر گور"]);
const RENAME = { "شهر فتحالمبین": "فتح‌المبین", "دوستمحمد": "دوست‌محمد", "محله چینیها": "محلهٔ چینی‌ها", "نسیمشهر": "نسیم‌شهر", "بندر بوشهر": "بوشهر" };
// حروفی که به حرف بعد می‌چسبند؛ قبل از «آباد» بعد از این‌ها نیم‌فاصله لازم است
const JOINING = /[بپتثجچحخسشصضطظعغفقکگلمنهیئ]/;

const res = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(QUERY)}`, {
  headers: { Accept: "application/sparql-results+json", "User-Agent": "KashiBot/1.0 (https://kashi.sepantapouya.com)" },
});
const rows = (await res.json()).results.bindings;

const clean = (raw) => {
  let name = RENAME[raw] ?? raw;
  name = name.replace(/\s*\([^)]*\)\s*$/, "").replace(/\(شهر\)$/, "").replace(/،.*$/, "").replace(/^شهرستان /, "").trim();
  name = name.replace(/(\S)آباد/g, (m, ch) => (JOINING.test(ch) ? `${ch}‌آباد` : m));
  // «هادی‌شهر»، «دره‌شهر»؛ نام‌هایی مثل «خرمشهر» و «ایرانشهر» سرهم نوشته می‌شوند
  if (!/(به|ماه)شهر$/.test(name)) name = name.replace(/([یه])شهر$/, "$1‌شهر");
  return name;
};

const cities = new Map(); // id → { name, provinces }
for (const r of rows) {
  if (DROP.has(r.fa.value)) continue;
  const c = cities.get(r.c.value) ?? { name: clean(r.fa.value), provinces: new Set() };
  if (r.provFa) c.provinces.add(r.provFa.value.replace(/^استان /, ""));
  cities.set(r.c.value, c);
}

const byProvince = {};
const problems = [];
for (const { name, provinces } of cities.values()) {
  // «خراسان» استان قدیمی است؛ اگر استان امروزی هم ثبت شده، همان می‌ماند
  if (provinces.size > 1) provinces.delete("خراسان");
  const province = PROVINCE_FIX[name] ?? (provinces.size === 1 ? [...provinces][0] : null);
  if (!province || province === "خراسان") { problems.push(`${name}: ${[...provinces].join("/") || "؟"}`); continue; }
  (byProvince[province] ??= new Set()).add(name);
}
if (problems.length) console.warn(`بدون استان مشخص (کنار گذاشته شد): ${problems.join(" | ")}`);

const sorted = Object.fromEntries(
  Object.entries(byProvince).sort(([a], [b]) => a.localeCompare(b, "fa")).map(([p, set]) => [p, [...set].sort((a, b) => a.localeCompare(b, "fa"))]),
);
const total = Object.values(sorted).reduce((n, l) => n + l.length, 0);
const today = new Date().toISOString().slice(0, 10);

writeFileSync(
  new URL("../src/cities.ts", import.meta.url),
  `// ساخته‌شده با scripts/build-cities.mjs از ویکی‌داده (CC0) در ${today}؛ دستی ویرایش نکنید.
// ${total} شهر در ${Object.keys(sorted).length} استان. شهرهای تازه‌تأسیس ممکن است هنوز در ویکی‌داده نباشند.
export const CITIES: Record<string, readonly string[]> = ${JSON.stringify(sorted, null, 2)};
`,
);
console.log(`${total} شهر در ${Object.keys(sorted).length} استان`);
