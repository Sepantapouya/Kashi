"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";

export interface CodeBlockProps {
  code: string;
  /** نام زبان؛ برچسب بالای کد و رنگ‌آمیزی ساده */
  language?: string;
  /** نام فایل به‌جای نام زبان */
  filename?: string;
  /** شمارهٔ خط‌ها @default false */
  lineNumbers?: boolean;
  /** خط‌هایی که برجسته می‌شوند (از ۱) */
  highlightLines?: number[];
  /** شکستن خط‌های بلند به‌جای اسکرول افقی؛ کاربر هم می‌تواند عوضش کند @default false */
  wrap?: boolean;
  /** رنگ‌آمیزی کلمه‌های کلیدی، رشته‌ها، عددها و توضیح‌ها @default true */
  highlight?: boolean;
  /** بیشترین ارتفاع پیش از اسکرول، مثل "20rem" */
  maxHeight?: string;
  className?: string;
}

const KEYWORDS = new Set(
  ("import export from default const let var function return if else for while do switch case break continue new class extends " +
    "async await try catch finally throw typeof instanceof in of interface type enum implements public private protected static readonly " +
    "def lambda pass elif with as yield None True False self print fn pub use mod impl struct match mut package func go defer select " +
    "true false null undefined void this super echo SELECT FROM WHERE INSERT INTO VALUES UPDATE SET DELETE JOIN ON AND OR NOT ORDER BY GROUP LIMIT").split(" "),
);
const TOKEN = /(\/\/[^\n]*|#(?![{\[])[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d[\d_.]*(?:e[+-]?\d+)?\b)|([A-Za-z_$][\w$]*)/g;

/** رنگ‌آمیزی سبک و بی‌وابستگی؛ برای کد کامل‌تر خروجی Shiki یا Prism را به children بدهید */
export function highlightCode(code: string, language = ""): ReactNode[] {
  const out: ReactNode[] = [];
  const hashComments = /^(py|python|sh|bash|shell|zsh|yaml|yml|toml|rb|ruby|r)$/i.test(language);
  let last = 0;
  let k = 0;
  for (const m of code.matchAll(TOKEN)) {
    const [t, comment, str, num, word] = m;
    const i = m.index ?? 0;
    if (comment && comment.startsWith("#") && !hashComments) continue;
    if (i > last) out.push(code.slice(last, i));
    const cls = comment ? "comment" : str ? "string" : num ? "number" : word && KEYWORDS.has(word) ? "keyword" : word && code[i + t.length] === "(" ? "fn" : "";
    out.push(cls ? <span key={k++} className={`k-code__t-${cls}`}>{t}</span> : t);
    last = i + t.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

const Copy = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /></svg>
);
const Check = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>;
const Wrap = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h14M3 10h11a3 3 0 0 1 0 6h-3m0 0 2-2m-2 2 2 2M3 15h4" /></svg>
);

/** نمایش کد در پاسخ دستیار یا مستندات: همیشه چپ‌به‌راست، با برچسب زبان، دکمهٔ کپی و شکستن خط */
export function CodeBlock({ code, language, filename, lineNumbers, highlightLines = [], wrap: wrapDefault = false, highlight = true, maxHeight, className }: CodeBlockProps) {
  const { messages: M, n } = useKashi();
  const B = M.codeBlock;
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(wrapDefault);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const text = code.replace(/\n$/, "");
  const lines = text.split("\n");
  const title = filename ?? language;
  const mark = new Set(highlightLines);
  const body = highlight ? highlightCode(text, language) : [text];

  // خط‌ها جدا رندر می‌شوند تا شماره و برجسته‌سازی ممکن باشد؛ رنگ‌آمیزی روی کل متن است و بعد به خط‌ها تقسیم می‌شود
  const perLine: ReactNode[][] = [[]];
  for (const part of body) {
    if (typeof part !== "string") {
      const s = String((part as { props: { children: string } }).props.children);
      if (!s.includes("\n")) {
        perLine[perLine.length - 1].push(part);
        continue;
      }
      const cls = (part as { props: { className: string } }).props.className;
      s.split("\n").forEach((seg, j) => {
        if (j) perLine.push([]);
        if (seg) perLine[perLine.length - 1].push(<span key={`${perLine.length}-${j}`} className={cls}>{seg}</span>);
      });
      continue;
    }
    part.split("\n").forEach((seg, j) => {
      if (j) perLine.push([]);
      if (seg) perLine[perLine.length - 1].push(seg);
    });
  }

  return (
    <figure className={cx("k-code", className)} data-wrap={wrap ? "" : undefined}>
      <figcaption className="k-code__head">
        <span className="k-code__lang" dir="ltr">{title ?? B.lines(n(lines.length))}</span>
        <span className="k-code__tools">
          <button type="button" className="k-code__btn" aria-label={B.wrap} aria-pressed={wrap} onClick={() => setWrap((w) => !w)}><Wrap /></button>
          <button
            type="button"
            className="k-code__btn"
            data-done={copied ? "" : undefined}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                clearTimeout(timer.current);
                timer.current = setTimeout(() => setCopied(false), 2000);
              } catch {
                /* کلیپ‌بورد در دسترس نیست */
              }
            }}
          >
            {copied ? <Check /> : <Copy />}
            <span>{copied ? B.copied : B.copy}</span>
          </button>
          <span className="k-sr-only" aria-live="polite">{copied ? B.copied : ""}</span>
        </span>
      </figcaption>
      <pre className="k-code__pre" dir="ltr" tabIndex={0} aria-label={language ? B.code(language) : undefined} style={maxHeight ? { maxBlockSize: maxHeight } : undefined}>
        <code>
          {perLine.map((parts, i) => (
            <span key={i} className="k-code__line" data-marked={mark.has(i + 1) ? "" : undefined}>
              {lineNumbers && <span className="k-code__num" aria-hidden="true">{i + 1}</span>}
              <span className="k-code__text">{parts.length ? parts : " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
