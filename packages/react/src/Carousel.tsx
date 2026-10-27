import { Children, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface CarouselProps {
  /** هر فرزند یک اسلاید */
  children: ReactNode;
  /** نام اسلایدر، مثل «محصولات پیشنهادی» (الزامی) */
  label: string;
  /** تعداد اسلاید در هر نما @default 1 */
  perView?: number;
  /** نمایش نقطه‌ها @default true */
  dots?: boolean;
  className?: string;
  labels?: { prev?: string; next?: string; slide?: (n: number, total: number) => string };
}

const Arrow = ({ next }: { next?: boolean }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-k-mirror="">
    <path d={next ? "m8 5 5 5-5 5" : "m12 5-5 5 5 5"} />
  </svg>
);

/**
 * اسلایدر روی scroll-snap بومی: با کشیدن، چرخ موس، دکمه‌ها و کلیدهای جهت کار می‌کند.
 * چرخش خودکار ندارد، چون خواندن را برای همه سخت می‌کند (WCAG 2.2.2).
 */
export function Carousel({ children, label, perView = 1, dots = true, className, labels = {} }: CarouselProps) {
  const id = useId();
  const { prev = "قبلی", next = "بعدی", slide = (n, t) => `${toFaDigits(n)} از ${toFaDigits(t)}` } = labels;
  const slides = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const pages = Math.max(1, slides.length - perView + 1);

  // اسلاید فعال از روی موقعیت اسکرول
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const items = [...el.children] as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting && e.intersectionRatio > 0.6).map((e) => items.indexOf(e.target as HTMLElement));
        if (vis.length) setIndex(Math.min(...vis));
      },
      { root: el, threshold: [0.6, 1] },
    );
    items.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [slides.length]);

  const go = (i: number) => {
    const n = Math.max(0, Math.min(pages - 1, i));
    const el = track.current?.children[n] as HTMLElement | undefined;
    if (!el || !track.current) return;
    // scrollIntoView صفحه را هم اسکرول می‌کند؛ فقط خود ریل را جابه‌جا می‌کنیم
    const t = track.current;
    const rtl = getComputedStyle(t).direction === "rtl";
    const offset = rtl ? -(t.getBoundingClientRect().right - el.getBoundingClientRect().right) + t.scrollLeft : el.getBoundingClientRect().left - t.getBoundingClientRect().left + t.scrollLeft;
    t.scrollTo({ left: offset });
    setIndex(n);
  };

  return (
    <section className={cx("k-carousel", className)} aria-roledescription="اسلایدر" aria-label={label} style={{ "--k-carousel-per-view": perView } as CSSProperties}>
      <div
        ref={track}
        className="k-carousel__track"
        tabIndex={0}
        aria-live="polite"
        onKeyDown={(e) => {
          const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
          const step = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[e.key];
          if (step) {
            e.preventDefault();
            go(index + step);
          } else if (e.key === "Home") go(0);
          else if (e.key === "End") go(pages - 1);
        }}
      >
        {slides.map((s, i) => (
          <div key={i} className="k-carousel__slide" role="group" aria-roledescription="اسلاید" aria-label={slide(i + 1, slides.length)} id={`${id}-s${i}`}>
            {s}
          </div>
        ))}
      </div>
      {pages > 1 && (
        <div className="k-carousel__bar">
          {dots ? (
            <ul className="k-carousel__dots" aria-label={`اسلایدهای ${label}`}>
              {Array.from({ length: pages }, (_, i) => (
                <li key={i}>
                  <button type="button" className="k-carousel__dot" aria-label={slide(i + 1, pages)} aria-current={i === index} aria-controls={`${id}-s${i}`} onClick={() => go(i)} />
                </li>
              ))}
            </ul>
          ) : <span />}
          <div className="k-carousel__nav">
            <button type="button" className="k-btn k-btn--secondary k-btn--icon k-btn--sm" aria-label={prev} disabled={index === 0} onClick={() => go(index - 1)}><Arrow /></button>
            <button type="button" className="k-btn k-btn--secondary k-btn--icon k-btn--sm" aria-label={next} disabled={index >= pages - 1} onClick={() => go(index + 1)}><Arrow next /></button>
          </div>
        </div>
      )}
    </section>
  );
}
