// مرورگر آیکون‌های کاشی: جستجو، دسته‌بندی و پیش‌نمایش زنده با اندازه و ضخامت دلخواه؛ هر کارت به صفحهٔ همان آیکون می‌رود
import { useEffect, useMemo, useRef, useState } from "react";
import { ChipGroup, EmptyState, Input, Kbd, SegmentedControl, Slider } from "@kashi-ui/react";
import { categories, icons, searchIcons, type IconName } from "@kashi-ui/icons";
import { Icon } from "@kashi-ui/icons/react";
import { toFaDigits } from "@kashi-ui/persian";
import "../styles/icons.css";

type Category = keyof typeof categories;
const all = Object.keys(icons) as IconName[];
const catKeys = Object.keys(categories) as Category[];
const fa = (n: number) => toFaDigits(String(n).replace(".", "٫"));

/** نوار مشخصات بالای صفحه: نمونهٔ آیکون‌ها و اعداد کلیدی */
const showcase: IconName[] = ["home", "search", "calendar", "user", "bell", "wallet", "credit-card", "chart", "lock", "mail", "heart", "sparkle", "folder", "settings", "trash", "send"];
export function IconSpecs() {
  const stats = [
    [fa(all.length), "آیکون"],
    [fa(catKeys.length), "دسته"],
    ["۲۰×۲۰", "شبکه"],
    ["۱٫۵", "ضخامت خط"],
    ["MIT", "مجوز"],
  ];
  return (
    <div className="ib-specs">
      <div className="ib-specs__show" aria-hidden="true">
        {showcase.map((n) => <span key={n}><Icon name={n} size={28} /></span>)}
      </div>
      <dl className="ib-specs__stats">
        {stats.map(([v, l]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}
      </dl>
    </div>
  );
}

/** چهار اصل طراحی، هر کدام با یک نمونهٔ واقعی از مجموعه */
export function IconPrinciples() {
  const items: { icon: IconName; title: string; text: string }[] = [
    { icon: "image", title: "گوشهٔ پیوسته", text: "قاب‌ها به‌جای گردی سادهٔ دایره‌ای، انحنای پیوسته (squircle) دارند؛ نرم‌تر و هم‌خانواده با گوشه‌های کامپوننت‌ها." },
    { icon: "user", title: "شکل‌های بسته", text: "آدم‌ها، قلب و ستاره شکل بستهٔ نرم‌اند، نه چند خط جدا؛ در اندازهٔ کوچک هم خوانا می‌مانند." },
    { icon: "calendar", title: "جزئیات با نقطه", text: "جزئیات ریز با نقطه‌های هم‌ضخامت خط نشان داده می‌شوند و خط‌های داخلی از لبهٔ قاب فاصله می‌گیرند." },
    { icon: "warning", title: "خط ۱٫۵ روی شبکهٔ ۲۰", text: "یک ضخامت برای همه، سر و اتصال گرد و حاشیهٔ امن ۲٫۵ واحدی؛ با strokeWidth می‌شود ضخیم‌ترش کرد." },
  ];
  return (
    <ul className="ib-principles" role="list">
      {items.map((p) => (
        <li key={p.title}>
          <span className="ib-principles__art" aria-hidden="true"><Icon name={p.icon} size={40} /></span>
          <strong>{p.title}</strong>
          <p>{p.text}</p>
        </li>
      ))}
    </ul>
  );
}

const sizes = [16, 20, 24, 32];

export function IconBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string[]>(["all"]);
  const [size, setSize] = useState("24");
  const [stroke, setStroke] = useState(1.5);
  const searchRef = useRef<HTMLInputElement>(null);

  // «/» جستجو را فعال می‌کند، مثل بیشتر مرورگرهای آیکون
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const hits = useMemo(() => new Set(searchIcons(query)), [query]);
  const cat = category[0] && category[0] !== "all" ? (category[0] as Category) : null;
  const found = all.filter((n) => hits.has(n) && (!cat || icons[n].category === cat));

  const counts: Record<string, number> = {};
  for (const n of all) if (hits.has(n)) counts[icons[n].category] = (counts[icons[n].category] || 0) + 1;
  const options = [
    { value: "all", label: "همه", count: hits.size },
    ...catKeys.map((c) => ({ value: c, label: categories[c], count: counts[c] || 0 })),
  ];

  // بدون جستجو و فیلتر، آیکون‌ها زیر عنوان دسته‌شان می‌آیند
  const groups: [Category | null, IconName[]][] = !query && !cat
    ? catKeys.map((c) => [c, found.filter((n) => icons[n].category === c)] as [Category, IconName[]]).filter(([, l]) => l.length)
    : [[null, found]];

  const px = Number(size);

  return (
    <div className="ib" style={{ "--ib-size": `${px}px` } as React.CSSProperties}>
      <div className="ib-bar">
        <div className="ib-bar__search">
          <Input
            ref={searchRef}
            aria-label="جستجوی آیکون"
            placeholder={`جستجو در ${fa(all.length)} آیکون: «حذف»، «کارت»، «search»…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            clearable
            onClear={() => setQuery("")}
            addonStart={<Icon name="search" />}
            addonEnd={query ? undefined : <Kbd>/</Kbd>}
          />
        </div>
        <div className="ib-bar__controls">
          <SegmentedControl size="sm" aria-label="اندازهٔ پیش‌نمایش" options={sizes.map((s) => ({ value: String(s), label: fa(s) }))} value={size} onChange={setSize} />
          <Slider className="ib-bar__stroke" label="ضخامت" min={1} max={2.25} step={0.25} value={stroke} onChange={setStroke} showValue format={fa} />
        </div>
      </div>

      <div className="ib-filter">
        <ChipGroup aria-label="دسته‌بندی" single options={options} value={category} onChange={(v) => setCategory(v.length ? v : ["all"])} />
      </div>

      <p className="ib-count" aria-live="polite">
        {query ? <>{fa(found.length)} نتیجه برای «{query}»</> : <>{fa(found.length)} آیکون</>}
      </p>

      {found.length === 0 ? (
        <EmptyState title="آیکونی پیدا نشد" description={`برای «${query}» نتیجه‌ای نبود. با کلمهٔ دیگری، فارسی یا انگلیسی، جستجو کنید.`} />
      ) : (
        groups.map(([key, list]) => (
          <section key={key ?? "all"} id={key ?? undefined} className="ib-group" aria-label={key ? categories[key] : undefined}>
            {key && <h3 className="ib-group__title">{categories[key]}<span>{fa(list.length)}</span><a href={`#${key}`} aria-hidden="true" tabIndex={-1}>#</a></h3>}
            <ul className="ib-grid" role="list">
              {list.map((n) => (
                <li key={n}>
                  <a className="ib-cell" href={`/docs/icons/${n}/`} aria-label={`${icons[n].title} (${n})`}>
                    <span className="ib-cell__art"><Icon name={n} size={px} strokeWidth={stroke} /></span>
                    <span className="ib-cell__title">{icons[n].title}</span>
                    <span className="ib-cell__name" dir="ltr">{n}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

    </div>
  );
}
