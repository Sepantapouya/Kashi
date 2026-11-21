// صفحهٔ اصلی آیکون‌ها: معرفی با جستجو و نمونهٔ زندهٔ سبک‌ها، ویژهٔ ایران، پرش به گروه‌ها و کارت دسته‌ها.
// با جستجو، نتیجه‌ها جای گروه‌ها می‌آیند.
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { CopyButton, EmptyState, Input, Kbd, SegmentedControl } from "@kashi-ui/react";
import { categories, categoryGroups, icons, searchIcons, variants, type IconName, type IconVariant } from "@kashi-ui/icons";
import { Icon } from "@kashi-ui/icons/react";
import { fa, useSlash, useVariant, variantLabels, withVariant } from "./iconShared";
import { author } from "../data/author";
import "../styles/icons.css";

type Category = keyof typeof categories;
const all = Object.keys(icons) as IconName[];
const byCat = new Map<string, IconName[]>();
for (const n of all) {
  const c = icons[n].category;
  if (!byCat.has(c)) byCat.set(c, []);
  byCat.get(c)!.push(n);
}
const inCat = (c: string) => byCat.get(c) ?? [];
const faNum = (n: number) => n.toLocaleString("fa-IR");

const groupIcon: Record<string, IconName> = {
  interface: "layout", documents: "folder", communication: "chat", media: "play-circle", tech: "cpu",
  money: "wallet", place: "map-pin", home: "home", health: "heart-pulse", world: "leaf",
  culture: "sparkle", letters: "type", brands: "apps", crypto: "bitcoin", "iranian-brands": "bank",
};

const specimen: IconName[] = ["home", "search", "calendar", "user", "bell", "wallet", "credit-card", "chart", "lock", "mail", "heart", "settings"];
export const requestUrl = (q = "") => `${author.repo}/issues/new?template=icon_request.yml${q ? `&title=${encodeURIComponent(`[آیکون] ${q}`)}` : ""}`;
const popular = ["حذف", "کارت", "تقویم", "بانک", "arrow"];

/** نمونهٔ زنده: همان دوازده آیکون در شش سبک؛ تا کاربر سبکی انتخاب نکرده، خودکار می‌چرخد */
function Specimen({ variant, onPick }: { variant: IconVariant; onPick: (v: IconVariant) => void }) {
  const [auto, setAuto] = useState<IconVariant | null>(variant === "light" ? "light" : null);
  useEffect(() => {
    if (auto === null || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setAuto(variants[(variants.indexOf(auto) + 1) % variants.length]), 2400);
    return () => clearTimeout(t);
  }, [auto]);
  useEffect(() => { if (variant !== "light") setAuto(null); }, [variant]);
  const shown = auto ?? variant;
  return (
    <div className="ix-spec">
      <div className="ix-spec__stage" aria-hidden="true">
        <div key={shown} className="ix-spec__grid">
          {specimen.map((n, i) => <span key={n} style={{ "--i": i } as React.CSSProperties}><Icon name={n} size={28} variant={shown} /></span>)}
        </div>
      </div>
      <div className="ix-spec__picker" role="radiogroup" aria-label="سبک آیکون‌ها">
        {variants.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={auto === null ? variant === v : false}
            data-shown={shown === v || undefined}
            className="ix-style"
            onClick={() => { setAuto(null); onPick(v); }}
          >
            <Icon name="heart" size={20} variant={v} />
            <span>{variantLabels[v]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** آیکون‌های تازهٔ آخرین نسخه‌ای که آیکون اضافه کرده؛ از صفحهٔ astro می‌آید */
export interface FreshIcons { version: string; count: number; names: IconName[] }
const faVer = (v: string) => v.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

export function IconCatalog({ fresh }: { fresh?: FreshIcons }) {
  const [query, setQuery] = useState("");
  const [variant, setVariant] = useVariant();
  const [size, setSize] = useState("24");
  const [active, setActive] = useState(categoryGroups[0].id);
  const searchRef = useRef<HTMLInputElement>(null);
  const jumpRef = useRef<HTMLElement>(null);
  useSlash(searchRef);

  // نوشتن هیچ‌وقت منتظر رسم نتیجه‌ها نمی‌ماند؛ فهرست جستجو هم یک بار در زمان بیکاری ساخته می‌شود
  const q = useDeferredValue(query.trim());
  const found = useMemo(() => (q ? searchIcons(q) : []), [q]);
  useEffect(() => {
    const warm = () => searchIcons("آ");
    if ("requestIdleCallback" in window) requestIdleCallback(warm); else setTimeout(warm, 300);
  }, []);

  // گروهی که الان روی صفحه است، در نوار پرش روشن می‌شود
  useEffect(() => {
    if (q || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id.slice(2));
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll(".ix-group").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [q]);
  useEffect(() => {
    const chip = jumpRef.current?.querySelector<HTMLElement>(`[data-g="${active}"]`);
    const bar = jumpRef.current?.querySelector<HTMLElement>(".ix-jump__list");
    if (!chip || !bar) return;
    const left = chip.offsetLeft - bar.clientWidth / 2 + chip.offsetWidth / 2;
    bar.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  // ۱۳۴ کارت و نزدیک ۱۶۰۰ آیکون: فقط با تغییر سبک دوباره ساخته می‌شوند، نه با هر حرف جستجو
  const groupsView = useMemo(() => (
          <div className="ix-groups">
            {categoryGroups.map((g) => {
              const total = g.categories.reduce((n, c) => n + inCat(c).length, 0);
              return (
                <section key={g.id} id={`g-${g.id}`} className="ix-group" aria-labelledby={`gt-${g.id}`}>
                  <h2 id={`gt-${g.id}`} className="ix-h">
                    <span className="ix-h__icon" aria-hidden="true"><Icon name={groupIcon[g.id] ?? "grid"} size={18} /></span>
                    {g.title}
                    <span>{faNum(g.categories.length)} دسته · {faNum(total)} آیکون</span>
                  </h2>
                  <ul className="ix-cats" role="list">
                    {(g.categories as Category[]).map((c) => {
                      const list = inCat(c);
                      return (
                        <li key={c}>
                          <a className="ix-cat" href={withVariant(`/docs/icons/category/${c}/`, variant)}>
                            <span className="ix-cat__preview" aria-hidden="true">
                              {list.slice(0, 12).map((n, i) => <span key={n} style={{ "--i": i } as React.CSSProperties}><Icon name={n} variant={variant} size={22} /></span>)}
                            </span>
                            <span className="ix-cat__foot">
                              <span className="ix-cat__title">{categories[c]}</span>
                              <span className="ix-cat__count">{faNum(list.length)}</span>
                              <span className="ix-cat__arrow" aria-hidden="true"><Icon name="arrow-left" size={14} /></span>
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
  ), [variant]);

  const stats: [string, string][] = [
    [faNum(all.length), "آیکون"],
    [faNum(Object.keys(categories).length), "دسته"],
    [faNum(variants.length), "سبک"],
    ["۲۰×۲۰", "شبکهٔ طراحی"],
    ["MIT", "رایگان، حتی تجاری"],
  ];

  const iran: { cat: Category; title: string; text: string; size: number }[] = [
    { cat: "iran-banks" as Category, title: "بانک‌ها و برندهای ایرانی", text: "بانک، درگاه پرداخت، اپ و اپراتور", size: 26 },
    { cat: "persian-letters" as Category, title: "حروف و ارقام فارسی", text: "با قلم وزیرمتن، روی همان شبکه", size: 26 },
    { cat: "persian" as Category, title: "فرهنگ ایرانی", text: "استکان چای، فرش، انار، سفرهٔ هفت‌سین", size: 26 },
  ];

  return (
    <div className="ix">
      <section className="ix-hero" aria-label="جستجو و سبک آیکون‌ها">
        <div className="ix-hero__main">
          <span className="ix-pill"><Icon name="sparkle" size={14} />رایگان و متن‌باز</span>
          <h2 className="ix-hero__title">آیکون مناسب را <span className="ix-grad">در یک ثانیه</span> پیدا کنید</h2>
          <div className="ix-search">
            <Input
              ref={searchRef}
              size="lg"
              aria-label="جستجوی آیکون"
              placeholder="فارسی یا انگلیسی بنویسید…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              clearable
              onClear={() => setQuery("")}
              addonStart={<Icon name="search" />}
              addonEnd={query ? undefined : <Kbd>/</Kbd>}
            />
          </div>
          <p className="ix-popular">
            <span>مثلاً:</span>
            {popular.map((p) => <button key={p} type="button" className="ix-chip" onClick={() => { setQuery(p); searchRef.current?.focus(); }}><bdi>{p}</bdi></button>)}
          </p>
          <div className="ix-cmd">
            <code dir="ltr">npm i @kashi-ui/icons</code>
            <CopyButton value="npm i @kashi-ui/icons" size="xs" variant="tertiary" iconOnly />
          </div>
        </div>
        <Specimen variant={variant} onPick={setVariant} />
      </section>

      <dl className="ix-stats">
        {stats.map(([v, l]) => <div key={l}><dd>{v}</dd><dt>{l}</dt></div>)}
      </dl>

      {q && (
        <section className="ix-results" aria-label="نتیجه‌های جستجو">
          <div className="ix-results__bar">
            <p className="ib-count" aria-live="polite">{faNum(found.length)} نتیجه برای «{q}» در سبک {variantLabels[variant]}</p>
            <SegmentedControl size="sm" aria-label="اندازهٔ پیش‌نمایش" options={[16, 20, 24, 32].map((s) => ({ value: String(s), label: fa(s) }))} value={size} onChange={setSize} />
          </div>
          {found.length === 0 ? (
            <EmptyState
              preset="noResults"
              title="آیکونی پیدا نشد"
              description={`برای «${q}» نتیجه‌ای نبود. کلمهٔ دیگری، فارسی یا انگلیسی، امتحان کنید یا آن را درخواست بدهید.`}
              actions={<a className="k-btn k-btn--secondary k-btn--sm" href={requestUrl(q)} target="_blank" rel="noopener">درخواست این آیکون</a>}
              bordered
            />
          ) : (
            <IconGrid key={q} names={found} variant={variant} size={Number(size)} />
          )}
        </section>
      )}
      <div className="ix-browse" hidden={!!q}>
          {fresh && fresh.names.length > 0 && (
            <section id="new" className="ix-new" aria-labelledby="ix-new-title">
              <div className="ix-new__head">
                <h2 id="ix-new-title" className="ix-h">
                  <span className="ix-h__icon" aria-hidden="true"><Icon name="sparkle" size={18} /></span>
                  آیکون‌های تازه
                  <span>{faNum(fresh.count)} آیکون در نسخهٔ <bdi>{faVer(fresh.version)}</bdi></span>
                </h2>
                <a className="k-btn k-btn--secondary k-btn--sm ix-new__all" href="/docs/icons/new/">دیدن همه<Icon name="arrow-left" size={14} /></a>
              </div>
              <ul className="ix-new__list" role="list">
                {fresh.names.map((n, i) => (
                  <li key={n} style={{ "--i": i } as React.CSSProperties}>
                    <a className="ix-new__tile" href={withVariant(`/docs/icons/${n}/`, variant)} title={icons[n].title} aria-label={`${icons[n].title} (${n})`}>
                      <Icon name={n} size={22} variant={variant} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="ix-iran" aria-labelledby="ix-iran-title">
            <h2 id="ix-iran-title" className="ix-h">ویژهٔ ایران<span>آنچه در مجموعه‌های خارجی پیدا نمی‌کنید</span></h2>
            <ul className="ix-iran__list" role="list">
              {iran.map((f) => (
                <li key={f.cat}>
                  <a className="ix-feature" href={withVariant(`/docs/icons/category/${f.cat}/`, variant)}>
                    <span className="ix-feature__art" aria-hidden="true">
                      {inCat(f.cat).slice(0, 8).map((n, i) => <span key={n} style={{ "--i": i } as React.CSSProperties}><Icon name={n} size={f.size} variant={variant} /></span>)}
                    </span>
                    <span className="ix-feature__body">
                      <strong>{f.title}</strong>
                      <span>{f.text}</span>
                    </span>
                    <span className="ix-feature__go" aria-hidden="true"><Icon name="arrow-left" size={16} /></span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <nav ref={jumpRef} className="ix-jump" aria-label="پرش به گروه">
            <div className="ix-jump__list">
              {fresh && fresh.names.length > 0 && (
                <a href="#new" className="ix-jump__chip ix-jump__chip--new"><Icon name="sparkle" size={16} />تازه‌ها</a>
              )}
              {categoryGroups.map((g) => (
                <a key={g.id} data-g={g.id} href={`#g-${g.id}`} className="ix-jump__chip" aria-current={active === g.id ? "true" : undefined}>
                  <Icon name={groupIcon[g.id] ?? "grid"} size={16} />{g.title}
                </a>
              ))}
            </div>
          </nav>

          {groupsView}

          <ul className="ix-next" role="list">
            <li><a href="/docs/icons/usage/"><Icon name="book-open" size={22} /><span><strong>راهنمای نصب و استفاده</strong><span>React، HTML، اسپرایت و هر فریم‌ورک دیگر</span></span></a></li>
            <li><a href="/docs/figma/"><Icon name="pen-tool" size={22} /><span><strong>آیکون‌ها در فیگما</strong><span>همهٔ سبک‌ها با پلاگین کیت کاشی</span></span></a></li>
            <li><a href={requestUrl()} target="_blank" rel="noopener"><Icon name="chat-plus" size={22} /><span><strong>آیکونی کم است؟</strong><span>درخواست بدهید؛ هر دو هفته بررسی می‌شود</span></span></a></li>
            <li><a href="/docs/icons/compare/"><Icon name="scale" size={22} /><span><strong>مقایسه با مجموعه‌های دیگر</strong><span>Iconly و Lucide و Phosphor</span></span></a></li>
          </ul>
      </div>
    </div>
  );
}

const PAGE = 120;

/** شبکهٔ آیکون‌ها؛ هر کارت به صفحهٔ همان آیکون می‌رود.
 *  فقط ۱۲۰ تای اول رسم می‌شود و بقیه با رسیدن به پایین فهرست، دسته‌دسته اضافه می‌شوند تا صفحه با هزاران نتیجه کند نشود. */
export function IconGrid({ names, variant, size = 24, stroke = 1.5 }: { names: IconName[]; variant: IconVariant; size?: number; stroke?: number }) {
  const [limit, setLimit] = useState(PAGE);
  const more = useRef<HTMLButtonElement>(null);
  const shown = names.slice(0, limit);
  const rest = names.length - shown.length;
  useEffect(() => {
    const el = more.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setLimit((l) => l + PAGE); }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [rest > 0, limit]);
  return (
    <>
      <ul className="ib-grid" role="list" style={{ "--ib-size": `${size}px` } as React.CSSProperties}>
        {shown.map((n) => (
          <li key={n}>
            <a className="ib-cell" href={withVariant(`/docs/icons/${n}/`, variant)} aria-label={`${icons[n].title} (${n})`} title={`${icons[n].title}\n${n}`}>
              <span className="ib-cell__art"><Icon name={n} size={size} strokeWidth={stroke} variant={variant} /></span>
              <span className="ib-cell__title">{icons[n].title}</span>
              <span className="ib-cell__name" dir="ltr">{n}</span>
            </a>
          </li>
        ))}
      </ul>
      {rest > 0 && (
        <button ref={more} type="button" className="k-btn k-btn--secondary k-btn--sm ib-more" onClick={() => setLimit((l) => l + PAGE * 4)}>
          نمایش {faNum(Math.min(rest, PAGE * 4))} آیکون دیگر
          <span className="ib-more__rest">از {faNum(rest)}</span>
        </button>
      )}
    </>
  );
}
