// فهرست مقاله‌ها با جستجو، فیلتر دسته و برچسب و مرتب‌سازی.
// فهرست کامل روی سرور رندر می‌شود (برای موتور جستجو)؛ فیلترها در نشانی صفحه (?q=&c=&tag=&sort=) می‌مانند تا قابل اشتراک باشند.
import { useEffect, useMemo, useState } from "react";
import { Button, ChipGroup, EmptyState, Input, Select } from "@kashi-ui/react";
import { Icon } from "@kashi-ui/icons/react";

export interface ArticleCard {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string; // ISO
  dateFa: string;
  minutes: number;
  coverAlt: string;
}

type Sort = "new" | "old" | "short" | "long" | "title";
const SORTS: { value: Sort; label: string }[] = [
  { value: "new", label: "تازه‌ترین" },
  { value: "old", label: "قدیمی‌ترین" },
  { value: "short", label: "کوتاه‌ترین" },
  { value: "long", label: "مفصل‌ترین" },
  { value: "title", label: "الفبایی" },
];

const fa = (n: number) => n.toLocaleString("fa-IR");

/** یکسان‌سازی برای جستجو: ی/ک عربی، نیم‌فاصله، اعراب، ارقام و حروف کوچک */
export function normalize(s: string) {
  return s
    .replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[ۀة]/g, "ه").replace(/[أإآ]/g, "ا").replace(/ؤ/g, "و")
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[‌‏‎\s\-_]+/g, " ")
    .toLowerCase().trim();
}

function readParams() {
  if (typeof location === "undefined") return { q: "", c: "", tag: "", sort: "new" as Sort };
  const p = new URLSearchParams(location.search);
  const sort = p.get("sort") as Sort;
  return { q: p.get("q") ?? "", c: p.get("c") ?? "", tag: p.get("tag") ?? "", sort: SORTS.some((s) => s.value === sort) ? sort : "new" };
}

export default function ArticleBrowser({ articles, categories }: { articles: ArticleCard[]; categories: string[] }) {
  // حالت اولیه همیشه خالی است تا رندر سرور و مرورگر یکی باشند؛ پارامترهای نشانی بعد از بارگذاری خوانده می‌شوند
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = readParams();
    setQ(p.q); setCat(p.c); setTag(p.tag); setSort(p.sort); setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cat) p.set("c", cat);
    if (tag) p.set("tag", tag);
    if (sort !== "new") p.set("sort", sort);
    const qs = p.toString();
    history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
  }, [q, cat, tag, sort, ready]);

  const tags = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of articles) for (const t of a.tags) m.set(t, (m.get(t) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fa"));
  }, [articles]);

  const list = useMemo(() => {
    const words = normalize(q).split(" ").filter(Boolean);
    const out = articles.filter((a) => {
      if (cat && a.category !== cat) return false;
      if (tag && !a.tags.includes(tag)) return false;
      if (!words.length) return true;
      const hay = normalize([a.title, a.description, a.category, ...a.tags].join(" "));
      return words.every((w) => hay.includes(w));
    });
    const by: Record<Sort, (a: ArticleCard, b: ArticleCard) => number> = {
      new: (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "fa"),
      old: (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, "fa"),
      short: (a, b) => a.minutes - b.minutes,
      long: (a, b) => b.minutes - a.minutes,
      title: (a, b) => a.title.localeCompare(b.title, "fa"),
    };
    return out.sort(by[sort]);
  }, [articles, q, cat, tag, sort]);

  const counts = useMemo(() => Object.fromEntries(categories.map((c) => [c, articles.filter((a) => a.category === c).length])), [articles, categories]);
  const filtered = Boolean(q || cat || tag);
  const reset = () => { setQ(""); setCat(""); setTag(""); };

  return (
    <div className="ab">
      <div className="ab__bar" role="search">
        <Input
          type="search"
          aria-label="جستجو در مقاله‌ها"
          placeholder="جستجو: نیم‌فاصله، تقویم شمسی، RTL…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          addonStart={<Icon name="search" size={18} />}
          clearable
          onClear={() => setQ("")}
          fieldClassName="ab__search"
        />
        <Select aria-label="برچسب" value={tag} onChange={(e) => setTag(e.target.value)} fieldClassName="ab__tag"
          options={[{ value: "", label: "همهٔ برچسب‌ها" }, ...tags.map(([t, n]) => ({ value: t, label: `${t} (${fa(n)})` }))]} />
        <Select aria-label="مرتب‌سازی" value={sort} onChange={(e) => setSort(e.target.value as Sort)} fieldClassName="ab__sort" options={SORTS} />
      </div>
      <ChipGroup
        single
        aria-label="دسته"
        className="ab__cats"
        value={cat ? [cat] : []}
        onChange={(v) => setCat(v[0] ?? "")}
        options={categories.map((c) => ({ value: c, label: c, count: counts[c] }))}
      />
      <p className="ab__count" aria-live="polite">
        {filtered ? `${fa(list.length)} مقاله از ${fa(articles.length)}` : `${fa(articles.length)} مقاله`}
        {filtered && <Button variant="link" size="sm" onClick={reset}>پاک کردن فیلترها</Button>}
      </p>

      {list.length ? (
        <ul className="ab__grid" role="list">
          {list.map((a) => (
            <li key={a.slug}>
              <a className="ab-card" href={`/articles/${a.slug}/`}>
                <img src={`/articles/${a.slug}/cover.jpg`} alt={a.coverAlt} width={1200} height={630} loading="lazy" decoding="async" />
                <span className="ab-card__meta"><b>{a.category}</b><span>{a.dateFa}</span><span>{fa(a.minutes)} دقیقه</span></span>
                <h2>{a.title}</h2>
                <p>{a.description}</p>
                <span className="ab-card__tags">{a.tags.slice(0, 3).map((t) => <span key={t}>#{t}</span>)}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="ab__empty"
          icon={<Icon name="search" size={24} />}
          title="مقاله‌ای پیدا نشد"
          description="کلمهٔ دیگری امتحان کنید یا فیلترها را بردارید."
          actions={<Button variant="secondary" onClick={reset}>نمایش همهٔ مقاله‌ها</Button>}
        />
      )}
    </div>
  );
}
