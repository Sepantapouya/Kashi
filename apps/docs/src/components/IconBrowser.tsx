// مرورگر آیکون‌های کاشی: جستجو، دسته‌بندی و نحوهٔ استفادهٔ هر آیکون
import { useMemo, useState } from "react";
import { Badge, ChipGroup, CopyButton, Dialog, EmptyState, Input } from "@kashi-ui/react";
import { categories, icons, iconSvg, searchIcons, type IconName } from "@kashi-ui/icons";
import { Icon } from "@kashi-ui/icons/react";
import { toFaDigits } from "@kashi-ui/persian";
import "../styles/icons.css";

type Category = keyof typeof categories;
const all = Object.keys(icons) as IconName[];

function Snippet({ label, code, lang }: { label: string; code: string; lang: string }) {
  return (
    <div className="ib-snippet">
      <div className="ib-snippet__head">
        <span>{label}</span>
        <CopyButton value={code} size="xs" variant="tertiary" />
      </div>
      <pre dir="ltr" data-lang={lang}><code>{code}</code></pre>
    </div>
  );
}

export function IconBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string[]>(["all"]);
  const [selected, setSelected] = useState<IconName | null>(null);

  const found = useMemo(() => {
    const hits = new Set(searchIcons(query));
    return all.filter((n) => hits.has(n) && (category[0] === "all" || !category[0] || icons[n].category === category[0]));
  }, [query, category]);

  const counts = useMemo(() => {
    const hits = new Set(searchIcons(query));
    const c: Record<string, number> = {};
    for (const n of all) if (hits.has(n)) c[icons[n].category] = (c[icons[n].category] || 0) + 1;
    return c;
  }, [query]);

  const options = [
    { value: "all", label: "همه", count: Object.values(counts).reduce((a, b) => a + b, 0) },
    ...(Object.keys(categories) as Category[]).map((c) => ({ value: c, label: categories[c], count: counts[c] || 0 })),
  ];

  const icon = selected ? icons[selected] : null;

  return (
    <div className="ib">
      <div className="ib-tools">
        <Input
          aria-label="جستجوی آیکون"
          placeholder="جستجو: «حذف»، «کارت»، «search»…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          clearable
          onClear={() => setQuery("")}
          addonStart={<Icon name="search" />}
        />
        <ChipGroup aria-label="دسته‌بندی" single options={options} value={category} onChange={(v) => setCategory(v.length ? v : ["all"])} />
      </div>

      <p className="ib-count" aria-live="polite">{toFaDigits(found.length)} آیکون</p>

      {found.length === 0 ? (
        <EmptyState title="آیکونی پیدا نشد" description={`برای «${query}» نتیجه‌ای نبود. با کلمهٔ دیگری، فارسی یا انگلیسی، جستجو کنید.`} />
      ) : (
        <ul className="ib-grid" role="list">
          {found.map((n) => (
            <li key={n}>
              <button type="button" className="ib-cell" onClick={() => setSelected(n)} aria-label={`${icons[n].title} (${n})، نمایش نحوهٔ استفاده`}>
                <Icon name={n} size={24} />
                <span className="ib-cell__title">{icons[n].title}</span>
                <span className="ib-cell__name" dir="ltr">{n}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        size="lg"
        icon={selected ? <Icon name={selected} size={24} /> : undefined}
        title={icon ? `${icon.title} · ${selected}` : ""}
        description={icon ? `دسته: ${categories[icon.category as Category]} — کامپوننت ${icon.component}` : undefined}
      >
        {selected && icon && (
          <div className="ib-detail">
            <div className="ib-sizes" aria-label="اندازه‌ها">
              {[16, 20, 24, 32, 48].map((s) => (
                <figure key={s}>
                  <Icon name={selected} size={s} />
                  <figcaption>{toFaDigits(s)}</figcaption>
                </figure>
              ))}
            </div>
            {icon.directional && (
              <p className="ib-note">
                <Badge tone="warning" size="sm">جهت‌دار</Badge> این آیکون جهت دارد. در رابط راست‌به‌چپ «بعدی» به چپ اشاره می‌کند؛ اگر طرح شما دوجهته است، با <code dir="ltr">mirror</code> قرینه‌اش کنید.
              </p>
            )}
            <Snippet label="React" lang="tsx" code={`import { ${icon.component} } from "@kashi-ui/icons/react";\n\n<${icon.component} />\n<${icon.component} size={24} title="${icon.title}" />`} />
            <Snippet label="React با نام" lang="tsx" code={`import { Icon } from "@kashi-ui/icons/react";\n\n<Icon name="${selected}" />`} />
            <Snippet label="HTML (کد SVG)" lang="html" code={iconSvg(selected) ?? ""} />
            <Snippet label="HTML با اسپرایت" lang="html" code={`<svg width="20" height="20" aria-hidden="true"><use href="/sprite.svg#k-${selected}" /></svg>`} />
            <Snippet label="JavaScript (Vue، Svelte و …)" lang="js" code={`import { iconSvg } from "@kashi-ui/icons";\n\nel.innerHTML = iconSvg("${selected}", { size: 20 });`} />
            <Snippet label="فایل SVG" lang="txt" code={`@kashi-ui/icons/svg/${selected}.svg`} />
            <Snippet label="فیگما" lang="txt" code={`Icon / ${selected}`} />
          </div>
        )}
      </Dialog>
    </div>
  );
}
