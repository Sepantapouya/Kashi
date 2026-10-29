// صفحهٔ اصلی آیکون‌ها: فقط کارت دسته‌ها با پیش‌نمایش آیکون‌هایشان؛ با جستجو نتیجه‌ها جای کارت‌ها می‌آیند
import { useRef, useState } from "react";
import { EmptyState, Input, Kbd } from "@kashi-ui/react";
import { categories, icons, searchIcons, type IconName, type IconVariant } from "@kashi-ui/icons";
import { Icon } from "@kashi-ui/icons/react";
import { VariantPicker, fa, useSlash, useVariant, withVariant } from "./iconShared";
import "../styles/icons.css";

type Category = keyof typeof categories;
const all = Object.keys(icons) as IconName[];
const catKeys = Object.keys(categories) as Category[];

export function IconCatalog() {
  const [query, setQuery] = useState("");
  const [variant, setVariant] = useVariant();
  const searchRef = useRef<HTMLInputElement>(null);
  useSlash(searchRef);

  const found = query ? searchIcons(query) : [];

  return (
    <div className="ic">
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
        <VariantPicker value={variant} onChange={setVariant} />
      </div>

      {query ? (
        <>
          <p className="ib-count" aria-live="polite">{fa(found.length)} نتیجه برای «{query}»</p>
          {found.length === 0 ? (
            <EmptyState title="آیکونی پیدا نشد" description={`برای «${query}» نتیجه‌ای نبود. با کلمهٔ دیگری، فارسی یا انگلیسی، جستجو کنید.`} />
          ) : (
            <IconGrid names={found} variant={variant} />
          )}
        </>
      ) : (
        <ul className="ic-cats" role="list">
          {catKeys.map((c) => {
            const list = all.filter((n) => icons[n].category === c);
            return (
              <li key={c}>
                <a className="ic-cat" href={withVariant(`/docs/icons/category/${c}/`, variant)}>
                  <span className="ic-cat__preview" aria-hidden="true">
                    {list.slice(0, 15).map((n) => <Icon key={n} name={n} variant={variant} size={22} />)}
                  </span>
                  <span className="ic-cat__foot">
                    <span>
                      <span className="ic-cat__title">{categories[c]}</span>
                      <span className="ic-cat__count">{fa(list.length)} آیکون</span>
                    </span>
                    <span className="ic-cat__view">مشاهده<Icon name="arrow-left" size={14} /></span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** شبکهٔ آیکون‌ها؛ هر کارت به صفحهٔ همان آیکون می‌رود */
export function IconGrid({ names, variant, size = 24, stroke = 1.5 }: { names: IconName[]; variant: IconVariant; size?: number; stroke?: number }) {
  return (
    <ul className="ib-grid" role="list" style={{ "--ib-size": `${size}px` } as React.CSSProperties}>
      {names.map((n) => (
        <li key={n}>
          <a className="ib-cell" href={withVariant(`/docs/icons/${n}/`, variant)} aria-label={`${icons[n].title} (${n})`}>
            <span className="ib-cell__art"><Icon name={n} size={size} strokeWidth={stroke} variant={variant} /></span>
            <span className="ib-cell__title">{icons[n].title}</span>
            <span className="ib-cell__name" dir="ltr">{n}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
