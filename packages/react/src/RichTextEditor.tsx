"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";

export type RichTextTool =
  | "bold" | "italic" | "underline" | "strike" | "heading" | "quote" | "bullet" | "ordered" | "link" | "direction" | "undo" | "clear" | "|";

export interface RichTextEditorProps {
  /** HTML کنترل‌شده؛ پیش از نمایش پاک‌سازی می‌شود */
  value?: string;
  defaultValue?: string;
  /** با هر تغییر: HTML پاک‌شده و متن ساده */
  onChange?: (html: string, text: string) => void;
  /** @default "ویرایشگر متن" */
  label?: string;
  /** نام دسترس‌پذیر وقتی برچسب دیداری ندارد */
  "aria-label"?: string;
  placeholder?: string;
  /** ابزارهای نوار و ترتیبشان؛ "|" جداکننده است */
  tools?: RichTextTool[];
  /** کمترین ارتفاع ناحیهٔ نوشتن @default "8rem" */
  minHeight?: string;
  /** شمارش کلمه و نویسه پایین ویرایشگر @default true */
  showCount?: boolean;
  /** با name، HTML در فرم ارسال می‌شود */
  name?: string;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_TOOLS: RichTextTool[] = ["bold", "italic", "underline", "strike", "|", "heading", "quote", "bullet", "ordered", "|", "link", "direction", "|", "undo", "clear"];
const ALLOWED = new Set(["P", "BR", "B", "STRONG", "I", "EM", "U", "S", "STRIKE", "DEL", "A", "UL", "OL", "LI", "H2", "H3", "BLOCKQUOTE", "DIV", "SPAN", "CODE"]);
const BLOCKS = "p, li, h2, h3, blockquote, div";

/** پاک‌سازی HTML: فقط برچسب‌های متنی مجاز، پیوندهای http، https و mailto، و ویژگی dir؛ بقیه حذف می‌شود */
export function sanitizeRichText(html: string): string {
  if (typeof document === "undefined") {
    // رندر سرور: همان قاعده‌ها با عبارت باقاعده؛ مرورگر دوباره با DOM پاک می‌کند
    return html
      .replace(/<(script|style|iframe|object|embed|template|svg|math|head|title)\b[\s\S]*?<\/\1\s*>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (tag, name: string, attrs: string) => {
        const t = name.toUpperCase();
        if (!ALLOWED.has(t)) return "";
        if (tag.startsWith("</")) return `</${name.toLowerCase()}>`;
        const keep: string[] = [];
        const dir = attrs.match(/\sdir\s*=\s*["']?(rtl|ltr|auto)\b/i);
        if (dir) keep.push(`dir="${dir[1].toLowerCase()}"`);
        if (t === "A") {
          const href = attrs.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
          const url = (href?.[1] ?? href?.[2] ?? href?.[3] ?? "").trim();
          if (/^(https?:|mailto:)/i.test(url)) keep.push(`href="${url.replace(/"/g, "&quot;")}"`, 'rel="noopener noreferrer nofollow"');
        }
        return `<${name.toLowerCase()}${keep.length ? " " + keep.join(" ") : ""}>`;
      });
  }
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 8) {
        child.remove();
        continue;
      }
      if (child.nodeType !== 1) continue;
      const el = child as HTMLElement;
      if (!ALLOWED.has(el.tagName)) {
        if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|TEMPLATE|SVG|MATH|HEAD|TITLE|META|LINK)$/.test(el.tagName)) el.remove();
        else {
          walk(el);
          el.replaceWith(...Array.from(el.childNodes));
        }
        continue;
      }
      for (const attr of Array.from(el.attributes)) {
        const keep = (attr.name === "dir" && /^(rtl|ltr|auto)$/.test(attr.value)) || (el.tagName === "A" && attr.name === "href" && /^(https?:|mailto:)/i.test(attr.value.trim()));
        if (!keep) el.removeAttribute(attr.name);
      }
      if (el.tagName === "A") {
        if (!el.hasAttribute("href")) {
          el.replaceWith(...Array.from(el.childNodes));
          continue;
        }
        el.setAttribute("rel", "noopener noreferrer nofollow");
      }
      walk(el);
    }
  };
  walk(tpl.content);
  return tpl.innerHTML;
}

const I = (d: ReactNode) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const ICONS: Record<Exclude<RichTextTool, "|" | "direction">, ReactNode> = {
  bold: I(<path d="M6 4h5a3 3 0 0 1 0 6H6zm0 6h6a3 3 0 0 1 0 6H6z" />),
  italic: I(<path d="M12 4H8.5M11.5 16H8M11 4 9 16" />),
  underline: I(<path d="M6 4v5a4 4 0 0 0 8 0V4M5 17h10" />),
  strike: I(<path d="M4 10h12M13.5 6.5c-.5-1.5-2-2.5-3.7-2.5C7.9 4 6.5 5.1 6.5 6.6c0 3.4 7 2 7 6.3 0 1.7-1.6 3.1-3.6 3.1-1.9 0-3.4-1-3.9-2.6" />),
  heading: I(<path d="M5 4v12M13 4v12M5 10h8M15.5 16v-5l-1.5 1" />),
  quote: I(<path d="M8 8H5v3h2.5c0 2-1 3-2.5 3.5M15 8h-3v3h2.5c0 2-1 3-2.5 3.5" />),
  bullet: I(<path d="M8 5.5h8M8 10h8M8 14.5h8M4.5 5.5h.01M4.5 10h.01M4.5 14.5h.01" />),
  ordered: I(<path d="M8 5.5h8M8 10h8M8 14.5h8M4 4.5l1-.5v3M4 12.5c0-.6.5-1 1-1s1 .4 1 1c0 .7-2 1.5-2 2.5h2" />),
  link: I(<path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2L10 5.8M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l1.1-1.1" />),
  undo: I(<path d="M7 5 4 8l3 3M4 8h8a4 4 0 0 1 0 8H9" />),
  clear: I(<path d="M5 4h10M10 4l-2.5 12M4 16l12-12" />),
};
const DIR_ICON = I(<path d="M9 4h6M13 4v12M9 4v8a3 3 0 0 1-3-3 3 3 0 0 1 3-3M4 14l2 2 2-2" />);

/** ویرایشگر متن غنی سبک و فارسی: جهت هر بند جدا، نیم‌فاصله با Shift+Space، چسباندن پاک‌شده و نوار ابزار با کیبورد */
export function RichTextEditor({
  value, defaultValue = "", onChange, label, "aria-label": ariaLabel, placeholder, tools = DEFAULT_TOOLS, minHeight = "8rem", showCount = true, name, hint, error, disabled, className,
}: RichTextEditorProps) {
  const { messages: M, n } = useKashi();
  const R = M.richText;
  const area = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const saved = useRef<Range | null>(null);
  const [html, setHtml] = useState(() => sanitizeRichText(value ?? defaultValue));
  // محتوای اولیه یک بار (و در رندر سرور) نوشته می‌شود؛ بعد از آن DOM دست خود کاربر است
  const initial = useRef(html);
  const [text, setText] = useState("");
  const [state, setState] = useState<Record<string, boolean>>({});
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("https://");
  const [focusTool, setFocusTool] = useState(0);
  const id = useId();

  // مقدار اولیه یا کنترل‌شده در DOM؛ اگر همان چیزی است که کاربر نوشته، دست نمی‌خورد تا مکان‌نما نپرد
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const next = sanitizeRichText(value ?? html);
    if (el.innerHTML !== next) el.innerHTML = next;
    setText(el.innerText ?? el.textContent ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!area.current) return;
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {
      /* مرورگر پشتیبانی نمی‌کند */
    }
    const update = () => {
      const sel = document.getSelection();
      if (!sel || !area.current?.contains(sel.anchorNode)) return;
      const block = (sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement)?.closest(BLOCKS);
      const q = (c: string) => {
        try {
          return document.queryCommandState(c);
        } catch {
          return false;
        }
      };
      setState({
        bold: q("bold"), italic: q("italic"), underline: q("underline"), strike: q("strikeThrough"),
        bullet: q("insertUnorderedList"), ordered: q("insertOrderedList"),
        heading: !!block?.closest("h2, h3"), quote: !!block?.closest("blockquote"),
        link: !!(sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement)?.closest("a"),
        ltr: (block as HTMLElement | null)?.dir === "ltr",
      });
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  const emit = () => {
    const el = area.current;
    if (!el) return;
    const out = sanitizeRichText(el.innerHTML === "<p><br></p>" || el.innerHTML === "<br>" ? "" : el.innerHTML);
    const plain = el.innerText ?? el.textContent ?? "";
    setHtml(out);
    setText(plain);
    onChange?.(out, plain.trim());
  };

  const exec = (cmd: string, arg?: string) => {
    area.current?.focus();
    if (saved.current) {
      const sel = document.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(saved.current);
      saved.current = null;
    }
    document.execCommand(cmd, false, arg);
    emit();
  };

  const currentBlock = () => {
    const sel = document.getSelection();
    const node = sel?.anchorNode;
    return (node instanceof Element ? node : node?.parentElement)?.closest<HTMLElement>(BLOCKS) ?? null;
  };

  const run = (tool: RichTextTool) => {
    switch (tool) {
      case "bold": return exec("bold");
      case "italic": return exec("italic");
      case "underline": return exec("underline");
      case "strike": return exec("strikeThrough");
      case "heading": return exec("formatBlock", state.heading ? "<p>" : "<h2>");
      case "quote": return exec("formatBlock", state.quote ? "<p>" : "<blockquote>");
      case "bullet": return exec("insertUnorderedList");
      case "ordered": return exec("insertOrderedList");
      case "undo": return exec("undo");
      case "clear": return exec("removeFormat");
      case "direction": {
        const b = currentBlock();
        if (b && area.current?.contains(b) && b !== area.current) {
          b.dir = b.dir === "ltr" ? "rtl" : "ltr";
          setState((s) => ({ ...s, ltr: b.dir === "ltr" }));
          emit();
        }
        return;
      }
      case "link": {
        if (state.link) return exec("unlink");
        const sel = document.getSelection();
        if (sel && sel.rangeCount && area.current?.contains(sel.anchorNode)) saved.current = sel.getRangeAt(0).cloneRange();
        setLinkOpen(true);
        return;
      }
    }
  };

  const buttons = tools.filter((t) => t !== "|");
  const onBarKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = e.key === "Home" ? -Infinity : e.key === "End" ? Infinity : (e.key === "ArrowLeft") === rtl ? 1 : -1;
    const next = Math.max(0, Math.min(buttons.length - 1, step === Infinity ? buttons.length - 1 : step === -Infinity ? 0 : focusTool + step));
    setFocusTool(next);
    bar.current?.querySelectorAll<HTMLButtonElement>(".k-rte__tool")[next]?.focus();
  };

  const label_ = (t: Exclude<RichTextTool, "|">) => (t === "direction" ? (state.ltr ? R.rtl : R.ltr) : t === "link" && state.link ? R.unlink : R[t]);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const empty = !text.trim() && !/<(img|li|blockquote)/.test(html);
  const helpId = `${id}-help`;
  let b = -1;

  return (
    <div className={cx("k-rte", className)} data-disabled={disabled ? "" : undefined} data-invalid={error ? "" : undefined}>
      {label && <label className="k-label k-rte__label" id={`${id}-label`} onClick={() => area.current?.focus()}>{label}</label>}
      <div className="k-rte__box">
        <div ref={bar} className="k-rte__bar" role="toolbar" aria-label={R.toolbar} aria-controls={id} onKeyDown={onBarKey}>
          {tools.map((t, k) => {
            if (t === "|") return <span key={k} className="k-rte__sep" aria-hidden="true" />;
            b++;
            const pressed = t === "direction" ? state.ltr : t === "link" || t === "undo" || t === "clear" ? undefined : !!state[t];
            const idx = b;
            return (
              <button
                key={k}
                type="button"
                className="k-rte__tool"
                tabIndex={idx === focusTool ? 0 : -1}
                aria-label={label_(t)}
                title={label_(t)}
                aria-pressed={pressed}
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setFocusTool(idx);
                  run(t);
                }}
              >
                {t === "direction" ? DIR_ICON : ICONS[t]}
              </button>
            );
          })}
        </div>
        {linkOpen && (
          <form
            className="k-rte__link"
            onSubmit={(e) => {
              e.preventDefault();
              setLinkOpen(false);
              if (/^(https?:\/\/|mailto:)\S+$/i.test(url.trim())) exec("createLink", url.trim());
            }}
          >
            <input
              className="k-rte__link-input"
              type="url"
              dir="ltr"
              aria-label={R.linkUrl}
              value={url}
              autoFocus
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setLinkOpen(false);
                  area.current?.focus();
                }
              }}
            />
            <button type="submit" className="k-btn k-btn--primary k-btn--xs">{R.apply}</button>
          </form>
        )}
        <div
          ref={area}
          id={id}
          className="k-rte__area"
          role="textbox"
          aria-multiline="true"
          aria-label={label ? undefined : ariaLabel ?? R.label}
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-describedby={helpId}
          aria-invalid={error ? true : undefined}
          aria-disabled={disabled || undefined}
          contentEditable={!disabled}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: initial.current }}
          dir="rtl"
          data-empty={empty ? "" : undefined}
          data-placeholder={placeholder ?? R.placeholder}
          style={{ minBlockSize: minHeight }}
          onInput={emit}
          onBlur={emit}
          onKeyDown={(e) => {
            // نیم‌فاصله
            if (e.key === " " && e.shiftKey) {
              e.preventDefault();
              document.execCommand("insertText", false, "‌");
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
              e.preventDefault();
              run("link");
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const rich = e.clipboardData.getData("text/html");
            if (rich) document.execCommand("insertHTML", false, sanitizeRichText(rich));
            else document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
            emit();
          }}
        />
        {showCount && (
          <div className="k-rte__foot">
            <span>{R.words(n(words))}</span>
            <span aria-hidden="true">·</span>
            <span>{R.chars(n(text.replace(/\n/g, "").length))}</span>
            <span className="k-rte__tip">{R.zwnj}</span>
          </div>
        )}
      </div>
      <div id={helpId} className="k-rte__help">
        {error ? <p className="k-hint k-hint--error">{error}</p> : hint ? <p className="k-hint">{hint}</p> : <span className="k-sr-only">{R.zwnj}</span>}
      </div>
      {name && <input type="hidden" name={name} value={html} />}
    </div>
  );
}
