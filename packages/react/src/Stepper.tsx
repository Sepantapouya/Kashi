import type { ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface Step { title: ReactNode; description?: ReactNode }

export interface StepperProps {
  steps: Step[];
  /** شمارهٔ مرحلهٔ فعلی از صفر */
  current: number;
  orientation?: "horizontal" | "vertical";
  /** @default "مراحل" */
  label?: string;
  labels?: { complete?: string; current?: string };
  className?: string;
}

const Check = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>
);

/** مراحل یک فرایند؛ مرحلهٔ فعلی با aria-current="step" و وضعیت هر مرحله برای صفحه‌خوان */
export function Stepper({ steps, current, orientation = "horizontal", label = "مراحل", labels = {}, className }: StepperProps) {
  const { complete = "انجام شده", current: currentLabel = "مرحلهٔ فعلی" } = labels;
  return (
    <ol className={cx("k-steps", orientation === "vertical" && "k-steps--vertical", className)} aria-label={label}>
      {steps.map((s, i) => {
        const status = i < current ? "complete" : i === current ? "current" : "upcoming";
        return (
          <li key={i} className="k-steps__step" data-status={status} aria-current={status === "current" ? "step" : undefined}>
            <span className="k-steps__marker" aria-hidden="true">{status === "complete" ? <Check /> : toFaDigits(i + 1)}</span>
            <span className="k-steps__title">
              {s.title}
              {status !== "upcoming" && <span className="k-sr-only">{`، ${status === "complete" ? complete : currentLabel}`}</span>}
            </span>
            {s.description && <span className="k-steps__description">{s.description}</span>}
          </li>
        );
      })}
    </ol>
  );
}
