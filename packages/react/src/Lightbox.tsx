"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { cx } from "./cx.js";
import { isRtl } from "./dnd.js";
import { useKashi } from "./KashiProvider.js";
import { useModalDialog } from "./modal.js";

export interface LightboxImage {
  src: string;
  /** متن جایگزین؛ برای صفحه‌خوان و برچسب دکمهٔ تصویر کوچک */
  alt: string;
  /** زیرنویس زیر تصویر بزرگ */
  caption?: string;
  /** تصویر کوچک گالری؛ بدون آن همان src */
  thumb?: string;
  width?: number;
  height?: number;
}

export interface LightboxProps {
  images: LightboxImage[];
  /** اندیس تصویر باز؛ null یعنی بسته */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  /** نوار تصویرهای کوچک پایین @default true */
  thumbnails?: boolean;
  /** از آخر به اول برگردد @default false */
  loop?: boolean;
  className?: string;
}

const svg = (d: string, w = 1.8) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

/**
 * نمایش تمام‌صفحهٔ تصویر روی <dialog> بومی: فلش‌ها (در راست‌به‌چپ، چپ یعنی بعدی)، Home و End، کشیدن انگشت،
 * بزرگ‌نمایی با کلیک یا دوبار ضربه، و برگشت فوکوس به تصویر کوچک پس از بستن.
 */
export function Lightbox({ images, index, onIndexChange, thumbnails = true, loop = false, className }: LightboxProps) {
  const { messages: M, n } = useKashi();
  const L = M.lightbox;
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  const { restoreFocus } = useModalDialog(ref, open);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const [dx, setDx] = useState(0);
  const titleId = useId();
  const last = useRef(0);
  if (index !== null) last.current = index;
  const i = index ?? last.current;
  const img = images[i];
  const count = images.length;

  const go = (to: number) => {
    if (!count) return;
    const next = loop ? (to + count) % count : Math.max(0, Math.min(count - 1, to));
    if (next === i) return;
    setDir(next > i ? 1 : -1);
    setZoom(null);
    onIndexChange(next);
  };

  // پیش‌بارگذاری تصویرهای کناری
  useEffect(() => {
    if (!open) return;
    for (const j of [i - 1, i + 1]) {
      const s = images[(j + count) % count]?.src;
      if (s && typeof Image === "function") new Image().src = s;
    }
  }, [open, i, images, count]);

  useEffect(() => {
    if (!open) setZoom(null);
  }, [open]);

  // تصویر کوچک فعلی در نوار دیده شود
  useEffect(() => {
    if (!open) return;
    ref.current?.querySelector<HTMLElement>(`[data-thumb="${i}"]`)?.scrollIntoView?.({ block: "nearest", inline: "center" });
  }, [open, i]);

  const onKey = (e: KeyboardEvent) => {
    const rtl = isRtl(ref.current);
    if (e.key === "ArrowRight") go(i + (rtl ? -1 : 1));
    else if (e.key === "ArrowLeft") go(i + (rtl ? 1 : -1));
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(count - 1);
    else return;
    e.preventDefault();
  };

  const canPrev = loop || i > 0;
  const canNext = loop || i < count - 1;

  return (
    <dialog
      ref={ref}
      className={cx("k-lightbox", className)}
      aria-labelledby={titleId}
      onKeyDown={onKey}
      onClose={() => {
        if (open) onIndexChange(null);
        restoreFocus();
      }}
      onCancel={(e) => {
        e.preventDefault();
        if (zoom) setZoom(null);
        else onIndexChange(null);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("k-lightbox__stage")) onIndexChange(null);
      }}
    >
      <h2 className="k-sr-only" id={titleId}>{L.label}</h2>
      <div className="k-lightbox__bar">
        <span className="k-lightbox__counter" aria-live="polite">{L.counter(n(i + 1), n(count))}</span>
        <button type="button" className="k-lightbox__btn" aria-label={zoom ? L.zoomOut : L.zoomIn} aria-pressed={!!zoom} onClick={() => setZoom(zoom ? null : { x: 50, y: 50 })}>
          {zoom ? svg("M8.5 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM17 17l-4.2-4.2M6 8.5h5") : svg("M8.5 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM17 17l-4.2-4.2M6 8.5h5M8.5 6v5")}
        </button>
        <button type="button" className="k-lightbox__btn" aria-label={L.close} onClick={() => onIndexChange(null)} autoFocus>
          {svg("M5 5l10 10M15 5 5 15")}
        </button>
      </div>
      <div
        className="k-lightbox__stage"
        onPointerDown={(e) => {
          if (zoom || (e.target as HTMLElement).closest("button")) return;
          swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        }}
        onPointerMove={(e) => swipe.current?.id === e.pointerId && setDx(e.clientX - swipe.current.x)}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          setDx(0);
          if (!s || s.id !== e.pointerId) return;
          const d = e.clientX - s.x;
          if (Math.abs(d) > 60 && Math.abs(d) > Math.abs(e.clientY - s.y)) {
            // کشیدن به سمت شروع خط یعنی بعدی
            const rtl = isRtl(ref.current);
            go(i + ((d < 0) !== rtl ? 1 : -1));
          }
        }}
        onPointerCancel={() => {
          swipe.current = null;
          setDx(0);
        }}
      >
        {img && (
          <figure className="k-lightbox__figure" key={i} data-dir={dir > 0 ? "next" : "prev"} style={dx ? ({ translate: `${dx}px 0`, transition: "none" } as CSSProperties) : undefined}>
            <img
              className="k-lightbox__img"
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              draggable={false}
              data-zoom={zoom ? "" : undefined}
              style={zoom ? ({ transformOrigin: `${zoom.x}% ${zoom.y}%` } as CSSProperties) : undefined}
              onClick={(e) => {
                if (Math.abs(dx) > 4) return;
                const r = e.currentTarget.getBoundingClientRect();
                setZoom(zoom ? null : { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
              onPointerMove={(e) => {
                if (!zoom || e.pointerType === "touch") return;
                const r = e.currentTarget.getBoundingClientRect();
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
            />
            {img.caption && <figcaption className="k-lightbox__caption" dir="auto">{img.caption}</figcaption>}
          </figure>
        )}
        {count > 1 && (
          <>
            <button type="button" className="k-lightbox__nav k-lightbox__nav--prev" aria-label={L.prev} disabled={!canPrev} onClick={() => go(i - 1)}>
              {svg("m8 5 5 5-5 5")}
            </button>
            <button type="button" className="k-lightbox__nav k-lightbox__nav--next" aria-label={L.next} disabled={!canNext} onClick={() => go(i + 1)}>
              {svg("m12 5-5 5 5 5")}
            </button>
          </>
        )}
      </div>
      {thumbnails && count > 1 && (
        <div className="k-lightbox__thumbs">
          {images.map((t, j) => (
            <button key={j} type="button" className="k-lightbox__thumb" data-thumb={j} aria-label={t.alt} aria-current={j === i ? "true" : undefined} onClick={() => go(j)}>
              <img src={t.thumb ?? t.src} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </dialog>
  );
}

export interface GalleryProps {
  images: LightboxImage[];
  /** تعداد ستون؛ بدون آن خودکار بر اساس عرض */
  columns?: number;
  /** نسبت تصویرهای کوچک @default "1 / 1" */
  aspect?: string;
  /** ستون‌های بیشتر از این تعداد با «+n» جمع می‌شوند */
  max?: number;
  loop?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** شبکهٔ تصویرهای کوچک که هر کدام با کلیک در نمایش تمام‌صفحه باز می‌شود */
export function Gallery({ images, columns, aspect = "1 / 1", max, loop, "aria-label": ariaLabel, className }: GalleryProps) {
  const { messages: M, n } = useKashi();
  const [open, setOpen] = useState<number | null>(null);
  const shown = max && images.length > max ? images.slice(0, max) : images;
  const rest = images.length - shown.length;
  return (
    <>
      <ul className={cx("k-gallery", className)} aria-label={ariaLabel ?? M.lightbox.gallery} style={{ ...(columns ? { "--k-gallery-cols": columns } : {}), "--k-gallery-aspect": aspect } as CSSProperties}>
        {shown.map((img, j) => (
          <li key={j}>
            <button type="button" className="k-gallery__item" aria-label={rest > 0 && j === shown.length - 1 ? `${M.lightbox.open(img.alt)} +${n(rest)}` : M.lightbox.open(img.alt)} onClick={() => setOpen(j)}>
              <img src={img.thumb ?? img.src} alt="" loading="lazy" width={img.width} height={img.height} />
              {rest > 0 && j === shown.length - 1 && <span className="k-gallery__more" aria-hidden="true">+{n(rest)}</span>}
            </button>
          </li>
        ))}
      </ul>
      <Lightbox images={images} index={open} onIndexChange={setOpen} loop={loop} />
    </>
  );
}
