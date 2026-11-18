// Vercel Routing Middleware: پیش از آن‌که فایل ایستا از CDN داده شود اجرا می‌شود.
// ریشهٔ پروژهٔ ورسل apps/docs است، پس این فایل همین‌جا می‌ماند.
// رمز دوره: متغیر محیطی KASHI_PM_PASSWORD در تنظیمات پروژهٔ ورسل (Production و Preview).
import { next } from "@vercel/functions";
import { pmGate } from "./src/lib/pm-gate";

export const config = { matcher: ["/learn", "/learn/:path*"], runtime: "nodejs" };

export default async function middleware(request: Request) {
  const res = await pmGate(request, process.env.KASHI_PM_PASSWORD);
  // برای رسیدن به فایل ایستای صفحه باید next() برگردد؛ برگرداندن undefined در ورسل خطای MIDDLEWARE_INVOCATION_FAILED می‌دهد
  return res ?? next();
}
