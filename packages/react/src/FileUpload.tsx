"use client";

import { useEffect, useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { getMessages, toFaDigits, type KashiLocale } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { Progress } from "./Progress.js";
import { useKashi } from "./KashiProvider.js";

export type FileStatus = "uploading" | "done" | "error";
export interface FileItem {
  id: string;
  /** فایلی که ارسال می‌شود؛ اگر resizeImages کوچکش کرده باشد، همان نسخهٔ کوچک */
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
  /** نشانی پیش‌نمایش (object URL) برای تصویرها */
  previewUrl?: string;
  /** توضیح کوتاه، مثل «کوچک شد به ۲۰۴۸×۱۵۳۶» */
  note?: string;
}

/** حجم فایل: ۱٫۲ مگابایت؛ با locale="en" ← «1.2 MB» */
export function formatBytes(bytes: number, locale: KashiLocale = "fa"): string {
  const en = locale === "en";
  const units = getMessages(locale).fileUpload.units;
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const n = i === 0 ? String(v) : v.toFixed(v < 10 ? 1 : 0).replace(/\.0$/, "");
  return `${en ? n : toFaDigits(n).replace(".", "٫")} ${units[i]}`;
}

export interface ImageResizeOptions {
  /** بلندترین ضلع تصویر بعد از کوچک شدن، به پیکسل */
  maxDimension: number;
  /** کیفیت JPEG/WebP بین ۰ و ۱ @default 0.85 */
  quality?: number;
  /** نوع خروجی؛ پیش‌فرض همان نوع فایل */
  type?: "image/jpeg" | "image/webp" | "image/png";
}

/**
 * عکس بزرگ را پیش از ارسال در مرورگر کوچک می‌کند (JPEG، PNG و WebP؛ GIF و SVG دست نمی‌خورند).
 * اگر عکس از maxDimension کوچک‌تر باشد یا خروجی سبک‌تر نشود، null برمی‌گرداند و همان فایل اصلی می‌ماند.
 */
export async function shrinkImage(file: File, { maxDimension, quality = 0.85, type }: ImageResizeOptions): Promise<{ file: File; width: number; height: number } | null> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || typeof createImageBitmap !== "function") return null;
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
  } catch {
    return null;
  }
  const scale = Math.min(1, maxDimension / Math.max(bmp.width, bmp.height));
  if (scale >= 1) {
    bmp.close?.();
    return null;
  }
  const width = Math.round(bmp.width * scale), height = Math.round(bmp.height * scale);
  const out = type ?? file.type;
  let blob: Blob | null = null;
  try {
    if (typeof OffscreenCanvas !== "undefined") {
      const c = new OffscreenCanvas(width, height);
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, 0, 0, width, height);
      blob = await c.convertToBlob({ type: out, quality });
    } else {
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, 0, 0, width, height);
      blob = await new Promise<Blob | null>((r) => c.toBlob(r, out, quality));
    }
  } finally {
    bmp.close?.();
  }
  if (!blob || blob.size >= file.size) return null;
  const name = out === file.type ? file.name : `${file.name.replace(/\.[^.]+$/, "")}.${out === "image/jpeg" ? "jpg" : out.split("/")[1]}`;
  return { file: new File([blob], name, { type: out, lastModified: file.lastModified }), width, height };
}

const ext = (name: string) => (name.split(".").pop() ?? "").slice(0, 4).toUpperCase();

function accepts(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(",").map((a) => a.trim().toLowerCase()).some((a) =>
    a.startsWith(".") ? file.name.toLowerCase().endsWith(a) : a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : file.type === a,
  );
}

export interface FileUploadProps {
  /** مثل "image/*,.pdf" */
  accept?: string;
  multiple?: boolean;
  /** بیشترین حجم هر فایل (بایت) */
  maxSize?: number;
  maxFiles?: number;
  /** آپلود هر فایل؛ onProgress با عدد ۰ تا ۱۰۰. بدون آن فایل‌ها فقط انتخاب می‌شوند */
  uploader?: (file: File, onProgress: (percent: number) => void) => Promise<void>;
  onFilesChange?: (files: FileItem[]) => void;
  /** متن راهنما، مثل «PNG یا PDF، حداکثر ۵ مگابایت» */
  hint?: ReactNode;
  disabled?: boolean;
  /**
   * نام فیلد در فرم: فایل‌های پذیرفته‌شده (بعد از کوچک شدن) در یک <input type="file" name> واقعی می‌مانند و با ارسال
   * معمولی فرم، FormData و Server Action فرستاده می‌شوند؛ uploader لازم نیست.
   */
  name?: string;
  /** با name: فرم بدون فایل ارسال نمی‌شود */
  required?: boolean;
  /** پیش‌نمایش کوچک برای تصویرها به جای پسوند فایل @default true */
  preview?: boolean;
  /** کوچک کردن عکس‌های بزرگ در مرورگر پیش از بررسی حجم و ارسال، مثل { maxDimension: 2048, quality: 0.85 } */
  resizeImages?: ImageResizeOptions;
  className?: string;
  labels?: { browse?: string; drop?: string; remove?: (n: string) => string; tooBig?: (max: string) => string; wrongType?: string; tooMany?: (n: number) => string; done?: string; uploading?: string };
}

const UploadIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13V3.5m-4 4 4-4 4 4M4 13v2.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V13" /></svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 5.5h13M8 5.5V4h4v1.5M5 5.5l.8 10.2a1.5 1.5 0 0 0 1.5 1.3h5.4a1.5 1.5 0 0 0 1.5-1.3L15 5.5" /></svg>
);

/** بارگذاری فایل با کشیدن و رها کردن یا دکمهٔ انتخاب؛ هر فایل وضعیت و پیشرفت خودش را دارد */
export function FileUpload({
  accept, multiple = true, maxSize, maxFiles, uploader, onFilesChange, hint, disabled, name, required, preview = true, resizeImages, className, labels = {},
}: FileUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<FileItem[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [dragging, setDragging] = useState(false);
  const [announce, setAnnounce] = useState("");
  const { messages: M, n: N, locale } = useKashi();
  const bytes = (b: number) => formatBytes(b, locale);
  const {
    browse = M.fileUpload.browse, drop = M.fileUpload.drop, remove = M.common.remove,
    tooBig = M.fileUpload.tooBig, wrongType = M.fileUpload.wrongType,
    tooMany = (x: number) => M.fileUpload.tooMany(N(x)), done = M.fileUpload.done, uploading = M.fileUpload.uploading,
  } = labels;

  const update = (fn: (list: FileItem[]) => FileItem[]) =>
    setItems((prev) => {
      const next = fn(prev);
      onFilesChange?.(next);
      return next;
    });

  // فیلد file واقعی فرم همیشه همان فایل‌های پذیرفته‌شدهٔ فهرست را دارد
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    try {
      const dt = new DataTransfer();
      for (const it of items) if (it.status !== "error") dt.items.add(it.file);
      el.files = dt.files;
      if (dt.files.length) inputRef.current?.closest(".k-dropzone")?.removeAttribute("data-invalid");
    } catch { /* مرورگر بدون DataTransfer */ }
  }, [items]);
  // نشانی‌های پیش‌نمایش با بسته شدن کامپوننت آزاد می‌شوند
  useEffect(() => () => itemsRef.current.forEach((it) => it.previewUrl && URL.revokeObjectURL(it.previewUrl)), []);

  const add = (files: FileList | File[]) => {
    const picked = Array.from(files).slice(0, multiple ? undefined : 1);
    if (!resizeImages) return accept_(picked.map((file) => ({ file, note: undefined as string | undefined })));
    // کوچک کردن عکس‌ها ناهمگام است؛ بدون resizeImages همه چیز هم‌زمان می‌ماند
    Promise.all(picked.map(async (file) => {
      const small = accepts(file, accept) ? await shrinkImage(file, resizeImages) : null;
      return small ? { file: small.file, note: M.fileUpload.resized(N(small.width), N(small.height)) } : { file, note: undefined };
    })).then(accept_);
  };

  const accept_ = (list: { file: File; note?: string }[]) => {
    const kept = multiple ? itemsRef.current.filter((x) => x.status !== "error").length : 0;
    const added: FileItem[] = list.map(({ file, note }, i) => {
      const fid = `${Date.now()}-${i}-${file.name}`;
      let err: string | undefined;
      if (!accepts(file, accept)) err = wrongType;
      else if (maxSize && file.size > maxSize) err = tooBig(bytes(maxSize));
      else if (maxFiles && kept + i >= maxFiles) err = tooMany(maxFiles);
      const previewUrl = preview && !err && file.type.startsWith("image/") && typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : undefined;
      return { id: fid, file, status: err ? "error" : uploader ? "uploading" : "done", progress: err ? 0 : uploader ? 0 : 100, error: err, previewUrl, note };
    });
    if (!multiple) itemsRef.current.forEach((it) => it.previewUrl && URL.revokeObjectURL(it.previewUrl));
    update((prev) => (multiple ? [...prev, ...added] : added));
    setAnnounce(added.map((a) => `${a.file.name}: ${a.error ?? (uploader ? uploading : done)}`).join(M.common.list));
    for (const it of added) {
      if (it.status !== "uploading" || !uploader) continue;
      uploader(it.file, (p) => update((l) => l.map((x) => (x.id === it.id ? { ...x, progress: p } : x))))
        .then(() => {
          update((l) => l.map((x) => (x.id === it.id ? { ...x, status: "done", progress: 100 } : x)));
          setAnnounce(`${it.file.name}: ${done}`);
        })
        .catch((e: unknown) => {
          const msg = e instanceof Error ? e.message : M.fileUpload.error;
          update((l) => l.map((x) => (x.id === it.id ? { ...x, status: "error", error: msg } : x)));
          setAnnounce(`${it.file.name}: ${msg}`);
        });
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled && e.dataTransfer.files.length) add(e.dataTransfer.files);
  };

  return (
    <div className={className}>
      <div
        className="k-dropzone"
        data-dragging={dragging ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={onDrop}
      >
        <span className="k-dropzone__icon" aria-hidden="true"><UploadIcon /></span>
        <p className="k-dropzone__title" style={{ margin: 0 }}>
          <button type="button" className="k-dropzone__browse" disabled={disabled} aria-describedby={hint ? `${id}-hint` : undefined} onClick={() => inputRef.current?.click()}>
            {browse}
          </button>{" "}
          <span>{drop}</span>
        </p>
        {hint && <p className="k-dropzone__hint" id={`${id}-hint`} style={{ margin: 0 }}>{hint}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            if (e.target.files?.length) add(e.target.files);
            e.target.value = "";
          }}
        />
        {name && (
          <input
            ref={formRef}
            type="file"
            className="k-dropzone__form"
            name={name}
            multiple={multiple}
            required={required}
            tabIndex={-1}
            aria-hidden="true"
            onInvalid={() => inputRef.current?.closest(".k-dropzone")?.setAttribute("data-invalid", "")}
            onChange={(e) => e.preventDefault()}
          />
        )}
      </div>
      {items.length > 0 && (
        <ul className="k-file-list" role="list">
          {items.map((it) => (
            <li key={it.id} className="k-file" data-status={it.status}>
              {it.previewUrl ? (
                <img className="k-file__thumb" src={it.previewUrl} alt="" />
              ) : (
                <span className="k-file__icon" aria-hidden="true">{ext(it.file.name)}</span>
              )}
              <span className="k-file__name" title={it.file.name}>{it.file.name}</span>
              <button
                type="button"
                className={cx("k-btn k-btn--tertiary k-btn--icon k-btn--sm k-file__remove")}
                aria-label={remove(it.file.name)}
                onClick={() => {
                  if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
                  update((l) => l.filter((x) => x.id !== it.id));
                  setAnnounce(M.common.removed(it.file.name));
                }}
              >
                <TrashIcon />
              </button>
              <span className="k-file__meta">
                {it.error ?? `${bytes(it.file.size)}${it.status === "uploading" ? ` · ${M.common.percent(N(Math.round(it.progress)))}` : it.status === "done" ? ` · ${done}` : ""}${it.note ? ` · ${it.note}` : ""}`}
              </span>
              {it.status === "uploading" && <Progress value={it.progress} size="sm" aria-label={`${uploading} ${it.file.name}`} />}
            </li>
          ))}
        </ul>
      )}
      <span className="k-sr-only" aria-live="polite">{announce}</span>
    </div>
  );
}
