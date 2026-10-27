import type { CSSProperties } from "react";
import { cx } from "./cx.js";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  /** شکل دایره، مثل جای آواتار */
  circle?: boolean;
  /** چند خط متن */
  lines?: number;
  className?: string;
}

const size = (v?: string | number) => (typeof v === "number" ? `${v}px` : v);

/** جای خالی هنگام بارگذاری؛ تزئینی است — روی ظرف والد aria-busy="true" بگذارید */
export function Skeleton({ width, height, circle, lines, className }: SkeletonProps) {
  const style = { "--k-skeleton-width": size(width), "--k-skeleton-height": size(height ?? (circle ? width : undefined)) } as CSSProperties;
  if (lines) {
    return (
      <span className={cx("k-skeleton-group", className)} aria-hidden="true" style={style}>
        {Array.from({ length: lines }, (_, i) => <span key={i} className="k-skeleton k-skeleton--text" />)}
      </span>
    );
  }
  return <span className={cx("k-skeleton", circle && "k-skeleton--circle", className)} aria-hidden="true" style={style} />;
}
