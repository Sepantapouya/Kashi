"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx.js";
import { formatBytes } from "./FileUpload.js";
import { useKashi } from "./KashiProvider.js";
import { useIsomorphicLayoutEffect } from "./utils.js";

export interface ChatComposerSend {
  text: string;
  files: File[];
}

export interface ChatComposerProps {
  /** ارسال با Enter یا دکمه؛ متن بدون فاصلهٔ اول و آخر */
  onSend: (message: ChatComposerSend) => void;
  /** پاسخ در حال نوشتن است: دکمهٔ ارسال «توقف» می‌شود */
  streaming?: boolean;
  /** با دکمهٔ توقف */
  onStop?: () => void;
  /** متن کنترل‌شده */
  value?: string;
  onValueChange?: (value: string) => void;
  /** دکمهٔ پیوست؛ مقدار accept فایل‌ها، مثلاً "image/*,.pdf" یا true برای همه */
  attach?: boolean | string;
  /** حداکثر تعداد پیوست @default 5 */
  maxFiles?: number;
  /** حداکثر حجم هر فایل به بایت */
  maxSize?: number;
  /** حداکثر طول متن؛ شمارنده نزدیک سقف نشان داده می‌شود */
  maxLength?: number;
  /** بیشترین ارتفاع پیش از اسکرول، به ردیف @default 8 */
  maxRows?: number;
  placeholder?: string;
  /** @default "پیام" */
  label?: string;
  /** راهنمای کلیدها زیر کادر @default false */
  showHint?: boolean;
  /** دکمه‌های دلخواه کنار پیوست، مثل انتخاب مدل */
  tools?: ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const svg = (d: ReactNode) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const Clip = () => svg(<path d="m15.5 9.5-5.6 5.6a3.5 3.5 0 0 1-5-5l6-6a2.3 2.3 0 0 1 3.3 3.3l-6 6a1.2 1.2 0 0 1-1.7-1.7l5.5-5.5" />);
const Send = () => svg(<path d="M10 16V4m0 0L5 9m5-5 5 5" />);
const Stop = () => <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="6" y="6" width="8" height="8" rx="1.5" fill="currentColor" /></svg>;
const X = () => svg(<path d="M6 6l8 8M14 6l-8 8" />);
const Doc = () => svg(<><path d="M11.5 3H6a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 6 17h8a1.5 1.5 0 0 0 1.5-1.5V7z" /><path d="M11.5 3v4h4" /></>);

/**
 * کادر نوشتن پیام برای گفتگو و دستیار هوش مصنوعی: بلند شدن خودکار، Enter برای ارسال و Shift+Enter برای خط تازه
 * (هنگام تایپ با IME ارسال نمی‌کند)، پیوست با دکمه یا چسباندن تصویر، و دکمهٔ توقف هنگام پاسخ.
 */
export function ChatComposer({
  onSend, streaming, onStop, value, onValueChange, attach, maxFiles = 5, maxSize, maxLength, maxRows = 8,
  placeholder, label, showHint, tools, disabled, autoFocus, className,
}: ChatComposerProps) {
  const { messages: M, locale, n } = useKashi();
  const C = M.composer;
  const [inner, setInner] = useState("");
  const text = value ?? inner;
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const id = useId();
  const [urls, setUrls] = useState<string[]>([]);

  const setText = (t: string) => {
    if (value === undefined) setInner(t);
    onValueChange?.(t);
  };

  // بلند شدن خودکار تا maxRows
  useIsomorphicLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.blockSize = "auto";
    const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
    el.style.blockSize = `${Math.min(el.scrollHeight, line * maxRows + 2)}px`;
  }, [text, maxRows]);

  // پیش‌نمایش تصویرها
  useEffect(() => {
    const list = files.map((f) => (f.type.startsWith("image/") && typeof URL.createObjectURL === "function" ? URL.createObjectURL(f) : ""));
    setUrls(list);
    return () => list.forEach((u) => u && URL.revokeObjectURL(u));
  }, [files]);

  const add = (list: File[]) => {
    setError("");
    const ok: File[] = [];
    for (const f of list) {
      if (maxSize && f.size > maxSize) setError(C.tooLarge(f.name, formatBytes(maxSize, locale)));
      else ok.push(f);
    }
    const next = [...files, ...ok];
    if (next.length > maxFiles) setError(C.tooMany(n(maxFiles)));
    setFiles(next.slice(0, maxFiles));
  };

  const canSend = !disabled && !streaming && (text.trim().length > 0 || files.length > 0) && (!maxLength || text.length <= maxLength);
  const send = () => {
    if (!canSend) return;
    onSend({ text: text.trim(), files });
    setText("");
    setFiles([]);
    setError("");
    area.current?.focus();
  };

  const near = maxLength && text.length > maxLength * 0.8;
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;

  return (
    <div className={cx("k-composer", className)} data-disabled={disabled ? "" : undefined} data-invalid={error ? "" : undefined}>
      {files.length > 0 && (
        <ul className="k-composer__files" aria-label={C.attachments}>
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="k-composer__file">
              {urls[i] ? <img src={urls[i]} alt="" className="k-composer__thumb" /> : <span className="k-composer__thumb"><Doc /></span>}
              <span className="k-composer__file-text">
                <span className="k-composer__file-name" dir="auto">{f.name}</span>
                <span className="k-composer__file-size">{formatBytes(f.size, locale)}</span>
              </span>
              <button type="button" className="k-composer__remove" aria-label={C.removeAttachment(f.name)} onClick={() => setFiles(files.filter((_, j) => j !== i))}><X /></button>
            </li>
          ))}
        </ul>
      )}
      <textarea
        ref={area}
        className="k-composer__input"
        rows={1}
        dir="auto"
        value={text}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder ?? C.placeholder}
        aria-label={label ?? C.label}
        aria-describedby={[showHint ? hintId : "", error ? errId : ""].filter(Boolean).join(" ") || undefined}
        aria-invalid={maxLength && text.length > maxLength ? true : undefined}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
            e.preventDefault();
            send();
          }
        }}
        onPaste={(e) => {
          if (!attach) return;
          const pasted = Array.from(e.clipboardData.files);
          if (pasted.length) {
            e.preventDefault();
            add(pasted);
          }
        }}
      />
      <div className="k-composer__bar">
        {attach && (
          <>
            <button type="button" className="k-composer__tool" aria-label={C.attach} disabled={disabled || files.length >= maxFiles} onClick={() => picker.current?.click()}>
              <Clip />
            </button>
            <input
              ref={picker}
              type="file"
              hidden
              multiple={maxFiles > 1}
              accept={typeof attach === "string" ? attach : undefined}
              onChange={(e) => {
                add(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
          </>
        )}
        {tools}
        {near ? <span className="k-composer__count" data-over={text.length > maxLength! ? "" : undefined}>{n(text.length)}/{n(maxLength!)}</span> : null}
        {streaming ? (
          <button type="button" className="k-composer__send" data-stop="" aria-label={C.stop} onClick={onStop}><Stop /></button>
        ) : (
          <button type="button" className="k-composer__send" aria-label={C.send} disabled={!canSend} onClick={send}><Send /></button>
        )}
      </div>
      {error && <p className="k-hint k-hint--error k-composer__error" id={errId} role="alert">{error}</p>}
      {showHint && <p className="k-composer__hint" id={hintId}>{C.hint}</p>}
    </div>
  );
}
