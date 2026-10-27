import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { Progress } from "./Progress.js";

export type FileStatus = "uploading" | "done" | "error";
export interface FileItem { id: string; file: File; status: FileStatus; progress: number; error?: string }

/** حجم فایل به فارسی: ۱٫۲ مگابایت */
export function formatBytes(bytes: number): string {
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const n = i === 0 ? String(v) : v.toFixed(v < 10 ? 1 : 0).replace(/\.0$/, "");
  return `${toFaDigits(n).replace(".", "٫")} ${units[i]}`;
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
  name?: string;
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
export function FileUpload({ accept, multiple = true, maxSize, maxFiles, uploader, onFilesChange, hint, disabled, name, className, labels = {} }: FileUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<FileItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [announce, setAnnounce] = useState("");
  const {
    browse = "انتخاب فایل", drop = "یا فایل را اینجا رها کنید", remove = (n) => `حذف ${n}`,
    tooBig = (m) => `حجم فایل بیشتر از ${m} است.`, wrongType = "این نوع فایل پذیرفته نیست.",
    tooMany = (n) => `حداکثر ${toFaDigits(n)} فایل.`, done = "بارگذاری شد", uploading = "در حال بارگذاری",
  } = labels;

  const update = (fn: (list: FileItem[]) => FileItem[]) =>
    setItems((prev) => {
      const next = fn(prev);
      onFilesChange?.(next);
      return next;
    });

  const add = (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, multiple ? undefined : 1);
    const added: FileItem[] = list.map((file, i) => {
      const fid = `${Date.now()}-${i}-${file.name}`;
      let err: string | undefined;
      if (!accepts(file, accept)) err = wrongType;
      else if (maxSize && file.size > maxSize) err = tooBig(formatBytes(maxSize));
      else if (maxFiles && items.length + i >= maxFiles) err = tooMany(maxFiles);
      return { id: fid, file, status: err ? "error" : uploader ? "uploading" : "done", progress: err ? 0 : uploader ? 0 : 100, error: err };
    });
    update((prev) => (multiple ? [...prev, ...added] : added));
    setAnnounce(added.map((a) => `${a.file.name}: ${a.error ?? (uploader ? uploading : done)}`).join("، "));
    for (const it of added) {
      if (it.status !== "uploading" || !uploader) continue;
      uploader(it.file, (p) => update((l) => l.map((x) => (x.id === it.id ? { ...x, progress: p } : x))))
        .then(() => {
          update((l) => l.map((x) => (x.id === it.id ? { ...x, status: "done", progress: 100 } : x)));
          setAnnounce(`${it.file.name}: ${done}`);
        })
        .catch((e: unknown) => {
          const msg = e instanceof Error ? e.message : "خطا در بارگذاری";
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
          name={name}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            if (e.target.files?.length) add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {items.length > 0 && (
        <ul className="k-file-list" role="list">
          {items.map((it) => (
            <li key={it.id} className="k-file" data-status={it.status}>
              <span className="k-file__icon" aria-hidden="true">{ext(it.file.name)}</span>
              <span className="k-file__name" title={it.file.name}>{it.file.name}</span>
              <button
                type="button"
                className={cx("k-btn k-btn--tertiary k-btn--icon k-btn--sm k-file__remove")}
                aria-label={remove(it.file.name)}
                onClick={() => {
                  update((l) => l.filter((x) => x.id !== it.id));
                  setAnnounce(`${it.file.name} حذف شد`);
                }}
              >
                <TrashIcon />
              </button>
              <span className="k-file__meta">
                {it.error ?? `${formatBytes(it.file.size)}${it.status === "uploading" ? ` · ${toFaDigits(Math.round(it.progress))}٪` : it.status === "done" ? ` · ${done}` : ""}`}
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
