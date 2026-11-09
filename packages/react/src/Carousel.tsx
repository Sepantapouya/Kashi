"use client";

import { Children, useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";

export interface CarouselProps {
  /** هر فرزند یک اسلاید */
  children: ReactNode;
  /** نام اسلایدر، مثل «محصولات پیشنهادی» (الزامی) */
  label: string;
  /** تعداد اسلاید در هر نما؛ با effect="fade" همیشه ۱ @default 1 */
  perView?: number;
  /** نمایش نقطه‌ها @default true */
  dots?: boolean;
  /**
   * «slide» ریل اسکرول بومی؛ «fade» محو شدن اسلایدها روی هم با opacity، برای عکس‌های بزرگ
   * (Safari لایه‌های بزرگِ دارای transform را تکه‌تکه و تکراری رسم می‌کند). کشیدن انگشت در هر دو کار می‌کند. @default "slide"
   */
  effect?: "slide" | "fade";
  /**
   * پخش خودکار؛ true یعنی هر ۵ ثانیه، عدد یعنی فاصله به میلی‌ثانیه. با hover، فوکوس، پنهان شدن زبانه و نمای بزرگ مکث می‌کند،
   * دکمهٔ توقف دارد (WCAG 2.2.2) و با prefers-reduced-motion متوقف شروع می‌شود.
   */
  autoplay?: boolean | number;
  /** نوار تصویرهای کوچک زیر اسلایدر؛ یکی برای هر اسلاید، معمولاً <img> کوچک */
  thumbnails?: ReactNode[];
  /** دکمهٔ «نمایش بزرگ» و باز شدن اسلاید با کلیک در پنجرهٔ تمام‌صفحه (Esc، کلیدهای جهت، فوکوس داخل پنجره) */
  lightbox?: boolean;
  /** بعد از عوض شدن اسلاید */
  onIndexChange?: (index: number) => void;
  className?: string;
  labels?: { prev?: string; next?: string; slide?: (n: number, total: number) => string; play?: string; pause?: string; expand?: string };
}

const Arrow = ({ next }: { next?: boolean }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-k-mirror="">
    <path d={next ? "m8 5 5 5-5 5" : "m12 5-5 5 5 5"} />
  </svg>
);
const PlayIcon = ({ playing }: { playing: boolean }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {playing ? <path d="M7.5 5v10M12.5 5v10" /> : <path d="M7 4.8v10.4a.6.6 0 0 0 .9.5l8-5.2a.6.6 0 0 0 0-1L7.9 4.3a.6.6 0 0 0-.9.5Z" />}
  </svg>
);
const ExpandIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5h4.5V8M8 16.5H3.5V12M16.5 3.5 11.5 8.5M3.5 16.5l5-5" /></svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="m5.5 5.5 9 9m0-9-9 9" /></svg>
);

/** inert در React 18 و 19 یکسان نوشته نمی‌شود؛ مستقیم روی DOM */
const inert = (on: boolean) => (el: HTMLElement | null) => {
  if (el) on ? el.setAttribute("inert", "") : el.removeAttribute("inert");
};

const isRtl = (el: Element) => getComputedStyle(el).direction === "rtl";

/** کشیدن انگشت یا قلم: در RTL اسلاید بعدی سمت چپ است، پس کشیدن به راست یعنی «بعدی» */
function useSwipe(onStep: (step: number) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.pointerType === "mouse") return;
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      onStep((dx < 0) !== isRtl(e.currentTarget) ? 1 : -1);
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}

/**
 * اسلایدر روی scroll-snap بومی (یا محو شدن با effect="fade"): کشیدن، چرخ موس، دکمه‌ها و کلیدهای جهت.
 * اختیاری: تصویرهای کوچک، پخش خودکار با نوار پیشرفت و دکمهٔ توقف، و نمای بزرگ تمام‌صفحه.
 */
export function Carousel({
  children, label, perView: perViewProp = 1, dots = true, effect = "slide", autoplay, thumbnails, lightbox, onIndexChange, className, labels = {},
}: CarouselProps) {
  const id = useId();
  const { messages: M, n: N } = useKashi();
  const {
    prev = M.common.prev, next = M.common.next, slide = (a: number, t: number) => M.carousel.slideOf(N(a), N(t)),
    play = M.carousel.play, pause = M.carousel.pause, expand = M.carousel.expand,
  } = labels;
  const fade = effect === "fade";
  const perView = fade ? 1 : perViewProp;
  const slides = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndexState] = useState(0);
  const [boxIndex, setBoxIndex] = useState<number | null>(null);
  const pages = Math.max(1, slides.length - perView + 1);

  const setIndex = (i: number) => {
    setIndexState((old) => {
      if (old !== i) onIndexChange?.(i);
      return i;
    });
  };

  // اسلاید فعال از روی موقعیت اسکرول (فقط در حالت slide)
  useEffect(() => {
    const el = track.current;
    if (!el || fade || typeof IntersectionObserver === "undefined") return;
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
  }, [slides.length, fade]);

  const go = (i: number, wrap = false) => {
    const n = wrap ? (i + pages) % pages : Math.max(0, Math.min(pages - 1, i));
    if (!fade) {
      const t = track.current;
      const el = t?.children[n] as HTMLElement | undefined;
      if (!el || !t) return;
      // scrollIntoView صفحه را هم اسکرول می‌کند؛ فقط خود ریل را جابه‌جا می‌کنیم
      const offset = isRtl(t) ? -(t.getBoundingClientRect().right - el.getBoundingClientRect().right) + t.scrollLeft : el.getBoundingClientRect().left - t.getBoundingClientRect().left + t.scrollLeft;
      t.scrollTo?.({ left: offset });
    }
    setIndex(n);
  };

  // تصویر کوچک فعال در نوار خودش دیده شود (بدون اسکرول صفحه)
  useEffect(() => {
    const strip = thumbs.current;
    const b = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !b) return;
    const s = strip.getBoundingClientRect(), r = b.getBoundingClientRect();
    if (r.left < s.left || r.right > s.right) strip.scrollTo?.({ left: strip.scrollLeft + (r.left + r.width / 2) - (s.left + s.width / 2) });
  }, [index]);

  // ---- پخش خودکار
  const interval = autoplay === true ? 5000 : typeof autoplay === "number" && autoplay > 0 ? autoplay : 0;
  const [playing, setPlaying] = useState(interval > 0);
  const [hold, setHold] = useState({ hover: false, focus: false, hidden: false });
  useEffect(() => {
    if (!interval) return;
    if (matchMedia?.("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
    const onVis = () => setHold((h) => ({ ...h, hidden: document.hidden }));
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [interval]);
  const running = interval > 0 && pages > 1 && playing && !hold.hover && !hold.focus && !hold.hidden && boxIndex === null;
  const left = useRef(interval);
  const startedAt = useRef(0);
  useEffect(() => {
    left.current = interval;
  }, [index, interval]);
  useEffect(() => {
    if (!running) return;
    startedAt.current = Date.now();
    const t = setTimeout(() => go(index + 1, true), left.current);
    return () => {
      clearTimeout(t);
      left.current = Math.max(0, left.current - (Date.now() - startedAt.current));
    };
  }, [running, index]);

  // ---- نمای بزرگ
  useEffect(() => {
    const d = dialog.current as (HTMLDialogElement & { showModal?: () => void }) | null;
    if (!d) return;
    if (boxIndex !== null && !d.open) d.showModal?.();
    if (boxIndex === null && d.open) d.close();
  }, [boxIndex !== null]);
  const openBox = (i: number) => lightbox && setBoxIndex(i);
  const boxGo = (i: number) => setBoxIndex((i + slides.length) % slides.length);
  const closeBox = () => {
    if (boxIndex !== null) go(Math.min(boxIndex, pages - 1));
    setBoxIndex(null);
  };

  const swipe = useSwipe((step) => go(index + step));
  const boxSwipe = useSwipe((step) => boxIndex !== null && boxGo(boxIndex + step));

  return (
    <section
      className={cx("k-carousel", fade && "k-carousel--fade", className)}
      aria-roledescription={M.carousel.slider}
      aria-label={label}
      data-lightbox={lightbox ? "" : undefined}
      style={{ "--k-carousel-per-view": perView } as CSSProperties}
      onMouseEnter={() => setHold((h) => ({ ...h, hover: true }))}
      onMouseLeave={() => setHold((h) => ({ ...h, hover: false }))}
      onFocus={() => setHold((h) => ({ ...h, focus: true }))}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHold((h) => ({ ...h, focus: false }))}
    >
      <div
        ref={track}
        className="k-carousel__track"
        tabIndex={0}
        // در پخش خودکار، اعلام هر اسلاید صفحه‌خوان را خسته می‌کند
        aria-live={running ? "off" : "polite"}
        {...(fade ? swipe : {})}
        onKeyDown={(e) => {
          const rtl = isRtl(e.currentTarget);
          const step = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[e.key];
          if (step) {
            e.preventDefault();
            go(index + step);
          } else if (e.key === "Home") go(0);
          else if (e.key === "End") go(pages - 1);
          else if (lightbox && e.key === "Enter" && e.target === e.currentTarget) openBox(index);
        }}
      >
        {slides.map((s, i) => {
          const off = fade && i !== index;
          return (
            <div
              key={i}
              className="k-carousel__slide"
              role="group"
              aria-roledescription={M.carousel.slide}
              aria-label={slide(i + 1, slides.length)}
              id={`${id}-s${i}`}
              data-active={fade ? (i === index ? "" : undefined) : undefined}
              aria-hidden={off || undefined}
              ref={inert(off)}
              onClick={lightbox ? (e) => !(e.target as Element).closest("a, button, input, select, textarea, [tabindex]") && openBox(i) : undefined}
            >
              {s}
            </div>
          );
        })}
      </div>
      {interval > 0 && pages > 1 && (
        <span className="k-carousel__progress" aria-hidden="true">
          <span key={`${index}-${playing}`} className="k-carousel__progress-bar" data-paused={running ? undefined : ""} style={{ "--_d": `${interval}ms` } as CSSProperties} />
        </span>
      )}
      {thumbnails && thumbnails.length > 0 && (
        <div ref={thumbs} className="k-carousel__thumbs" role="group" aria-label={M.carousel.thumbnails(label)}>
          {thumbnails.map((t, i) => (
            <button
              key={i}
              type="button"
              className="k-carousel__thumb"
              aria-label={slide(i + 1, slides.length)}
              aria-current={Math.min(i, pages - 1) === index && (perView === 1 || i === index)}
              aria-controls={`${id}-s${i}`}
              onClick={() => go(i)}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      {(pages > 1 || lightbox) && (
        <div className="k-carousel__bar">
          {dots && pages > 1 ? (
            <ul className="k-carousel__dots" aria-label={M.carousel.slides(label)}>
              {Array.from({ length: pages }, (_, i) => (
                <li key={i}>
                  <button type="button" className="k-carousel__dot" aria-label={slide(i + 1, pages)} aria-current={i === index} aria-controls={`${id}-s${i}`} onClick={() => go(i)} />
                </li>
              ))}
            </ul>
          ) : <span />}
          <div className="k-carousel__nav">
            {interval > 0 && pages > 1 && (
              <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm" aria-label={playing ? pause : play} aria-pressed={!playing} onClick={() => setPlaying((p) => !p)}>
                <PlayIcon playing={playing} />
              </button>
            )}
            {lightbox && (
              <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm" aria-label={expand} aria-haspopup="dialog" onClick={() => openBox(index)}><ExpandIcon /></button>
            )}
            {pages > 1 && (
              <>
                <button type="button" className="k-btn k-btn--secondary k-btn--icon k-btn--sm" aria-label={prev} disabled={index === 0} onClick={() => go(index - 1)}><Arrow /></button>
                <button type="button" className="k-btn k-btn--secondary k-btn--icon k-btn--sm" aria-label={next} disabled={index >= pages - 1} onClick={() => go(index + 1)}><Arrow next /></button>
              </>
            )}
          </div>
        </div>
      )}
      {lightbox && (
        <dialog
          ref={dialog}
          className="k-carousel__lightbox"
          aria-label={M.carousel.lightbox(label)}
          onClose={closeBox}
          onCancel={(e) => {
            e.preventDefault();
            closeBox();
          }}
          onClick={(e) => e.target === e.currentTarget && closeBox()}
          onKeyDown={(e) => {
            if (boxIndex === null) return;
            const rtl = isRtl(e.currentTarget);
            const step = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[e.key];
            if (step) {
              e.preventDefault();
              boxGo(boxIndex + step);
            }
          }}
        >
          {boxIndex !== null && (
            <>
              <div className="k-carousel__lightbox-head">
                <span className="k-carousel__lightbox-count" aria-live="polite">{slide(boxIndex + 1, slides.length)}</span>
                <button type="button" className="k-btn k-btn--tertiary k-btn--icon" aria-label={M.common.close} onClick={closeBox} autoFocus><CloseIcon /></button>
              </div>
              <div className="k-carousel__lightbox-stage" {...boxSwipe}>
                {slides.map((s, i) => (
                  <div key={i} className="k-carousel__lightbox-slide" data-active={i === boxIndex ? "" : undefined} aria-hidden={i !== boxIndex || undefined} ref={inert(i !== boxIndex)}>
                    {s}
                  </div>
                ))}
              </div>
              {slides.length > 1 && (
                <div className="k-carousel__lightbox-nav">
                  <button type="button" className="k-btn k-btn--secondary k-btn--icon" aria-label={prev} onClick={() => boxGo(boxIndex - 1)}><Arrow /></button>
                  <button type="button" className="k-btn k-btn--secondary k-btn--icon" aria-label={next} onClick={() => boxGo(boxIndex + 1)}><Arrow next /></button>
                </div>
              )}
            </>
          )}
        </dialog>
      )}
    </section>
  );
}
