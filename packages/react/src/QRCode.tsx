"use client";

import { useMemo, type ReactNode } from "react";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";
import { encodeQr, type QrLevel } from "./qr.js";

export interface QRCodeProps {
  /** متن یا نشانی؛ فارسی هم با UTF-8 پشتیبانی می‌شود */
  value: string;
  /** اندازه به پیکسل @default 160 */
  size?: number;
  /** سطح تصحیح خطا؛ با logo همیشه H @default "M" */
  level?: QrLevel;
  /** حاشیهٔ خالی دور کد به تعداد خانه (استاندارد ۴) @default 4 */
  margin?: number;
  /** لوگو یا آیکون وسط کد */
  logo?: ReactNode;
  /** گوشه‌های گرد خانه‌ها و نشانگرها @default true */
  rounded?: boolean;
  /** نام دسترس‌پذیر؛ بدون آن «کد QR برای …» */
  "aria-label"?: string;
  className?: string;
}

/**
 * کد QR بدون کتابخانهٔ جانبی، به شکل SVG: رنگ از currentColor و پس‌زمینه از --k-qr-bg می‌آید.
 * کد همیشه تیره روی روشن است تا همهٔ دوربین‌ها بخوانندش، حتی در تم تیره.
 */
export function QRCode({ value, size = 160, level = "M", margin = 4, logo, rounded = true, "aria-label": ariaLabel, className }: QRCodeProps) {
  const { messages: M } = useKashi();
  const lvl = logo ? "H" : level;
  const matrix = useMemo(() => encodeQr(value, lvl), [value, lvl]);
  if (!matrix) return <p className="k-hint k-hint--error">{M.qr.tooLong}</p>;
  const n = matrix.length;
  const full = n + margin * 2;
  // خانه‌های نشانگر جدا کشیده می‌شوند تا گرد شوند
  const inFinder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  // جای لوگو خالی می‌ماند (حدود ۲۰٪ عرض؛ سطح H تا ۳۰٪ آسیب را جبران می‌کند)
  const hole = logo ? Math.ceil(n * 0.22) | 1 : 0;
  const h0 = (n - hole) / 2;
  const inHole = (x: number, y: number) => hole > 0 && x >= h0 - 0.5 && x < h0 + hole - 0.5 && y >= h0 - 0.5 && y < h0 + hole - 0.5;
  let d = "";
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (matrix[y][x] && !inFinder(x, y) && !inHole(x, y)) d += `M${x + margin} ${y + margin}h1v1h-1z`;
  const r = rounded ? 1 : 0;
  const finder = (fx: number, fy: number) => {
    const x = fx + margin, y = fy + margin;
    return (
      <g key={`${fx}-${fy}`}>
        <path fillRule="evenodd" d={`M${x + r * 1.6} ${y}h${7 - r * 3.2}a${r * 1.6} ${r * 1.6} 0 0 1 ${r * 1.6} ${r * 1.6}v${7 - r * 3.2}a${r * 1.6} ${r * 1.6} 0 0 1 -${r * 1.6} ${r * 1.6}h-${7 - r * 3.2}a${r * 1.6} ${r * 1.6} 0 0 1 -${r * 1.6} -${r * 1.6}v-${7 - r * 3.2}a${r * 1.6} ${r * 1.6} 0 0 1 ${r * 1.6} -${r * 1.6}zM${x + 1} ${y + 1}v5h5v-5z`} />
        <rect x={x + 2} y={y + 2} width={3} height={3} rx={r * 0.8} />
      </g>
    );
  };
  return (
    <span className={cx("k-qr", className)} style={{ inlineSize: size, blockSize: size }}>
      <svg viewBox={`0 0 ${full} ${full}`} width={size} height={size} role="img" aria-label={ariaLabel ?? M.qr.label(value)} shapeRendering={rounded ? undefined : "crispEdges"}>
        <rect width={full} height={full} className="k-qr__bg" rx={rounded ? 2 : 0} />
        <g className="k-qr__fg">
          <path d={d} />
          {finder(0, 0)}
          {finder(n - 7, 0)}
          {finder(0, n - 7)}
        </g>
      </svg>
      {logo && <span className="k-qr__logo" style={{ inlineSize: `${(hole / full) * 100 * 0.9}%` }}>{logo}</span>}
    </span>
  );
}
