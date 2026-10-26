// آیکون‌های داخلی کوچک — همه aria-hidden هستند
const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const InfoIcon = () => (
  <svg {...base}><circle cx="10" cy="10" r="7.5" /><path d="M10 13.5V9.5M10 6.5h.01" /></svg>
);
export const SuccessIcon = () => (
  <svg {...base}><circle cx="10" cy="10" r="7.5" /><path d="m6.75 10 2.25 2.25 4.25-4.5" /></svg>
);
export const WarningIcon = () => (
  <svg {...base}><path d="M8.6 3.4 2.4 14a1.6 1.6 0 0 0 1.4 2.4h12.4a1.6 1.6 0 0 0 1.4-2.4L11.4 3.4a1.6 1.6 0 0 0-2.8 0Z" /><path d="M10 7.5v3.25M10 13.5h.01" /></svg>
);
export const ErrorIcon = () => (
  <svg {...base}><circle cx="10" cy="10" r="7.5" /><path d="M10 6.5v4M10 13.5h.01" /></svg>
);
export const CloseIcon = () => (
  <svg {...base}><path d="m5 5 10 10M15 5 5 15" /></svg>
);
