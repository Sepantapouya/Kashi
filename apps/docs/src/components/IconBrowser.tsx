// مرورگر یک دستهٔ آیکون، به‌علاوهٔ نوار مشخصات و اصول طراحی برای صفحهٔ راهنما
import { useRef, useState } from "react";
import { EmptyState, Input, Kbd, SegmentedControl, Slider } from "@kashi-ui/react";
import { IconGrid } from "./IconCatalog";
import { VariantPicker, fa, useSlash, useVariant } from "./iconShared";
import { categories, icons, searchIcons, type IconName } from "@kashi-ui/icons";
import { Icon } from "@kashi-ui/icons/react";
import "../styles/icons.css";

type Category = keyof typeof categories;
const all = Object.keys(icons) as IconName[];
const catKeys = Object.keys(categories) as Category[];

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

/** صفحهٔ یک دسته: جستجو در همان دسته و پیش‌نمایش زنده با سبک، اندازه و ضخامت دلخواه */
export function IconBrowser({ category }: { category: Category }) {
  const [query, setQuery] = useState("");
  const [variant, setVariant] = useVariant();
  const [size, setSize] = useState("24");
  const [stroke, setStroke] = useState(1.5);
  const searchRef = useRef<HTMLInputElement>(null);
  useSlash(searchRef);

  const inCat = all.filter((n) => icons[n].category === category);
  const hits = new Set(searchIcons(query));
  const found = inCat.filter((n) => hits.has(n));

  return (
    <div className="ib">
      <div className="ib-bar">
        <div className="ib-bar__search">
          <Input
            ref={searchRef}
            aria-label={`جستجو در ${categories[category]}`}
            placeholder={`جستجو در ${fa(inCat.length)} آیکون «${categories[category]}»…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            clearable
            onClear={() => setQuery("")}
            addonStart={<Icon name="search" />}
            addonEnd={query ? undefined : <Kbd>/</Kbd>}
          />
        </div>
        <div className="ib-bar__controls">
          <VariantPicker value={variant} onChange={setVariant} />
          <SegmentedControl size="sm" aria-label="اندازهٔ پیش‌نمایش" options={sizes.map((s) => ({ value: String(s), label: fa(s) }))} value={size} onChange={setSize} />
          <Slider className="ib-bar__stroke" label="ضخامت" min={1} max={2.25} step={0.25} value={stroke} onChange={setStroke} showValue format={fa} />
        </div>
      </div>

      <p className="ib-count" aria-live="polite">
        {query ? <>{fa(found.length)} نتیجه برای «{query}»</> : <>{fa(found.length)} آیکون</>}
      </p>

      {found.length === 0 ? (
        <EmptyState title="آیکونی پیدا نشد" description={`در این دسته برای «${query}» نتیجه‌ای نبود.`} />
      ) : (
        <IconGrid names={found} variant={variant} size={Number(size)} stroke={stroke} />
      )}
    </div>
  );
}
