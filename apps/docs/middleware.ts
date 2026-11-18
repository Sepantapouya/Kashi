// Vercel Routing Middleware: پیش از آن‌که فایل ایستا از CDN داده شود اجرا می‌شود.
// ریشهٔ پروژهٔ ورسل apps/docs است، پس این فایل همین‌جا می‌ماند.
// رمز دوره: متغیر محیطی KASHI_PM_PASSWORD در تنظیمات پروژهٔ ورسل (Production و Preview).
import { pmGate } from "./src/lib/pm-gate";

export const config = { matcher: ["/learn", "/learn/:path*"] };

export default async function middleware(request: Request) {
  const res = await pmGate(request, process.env.KASHI_PM_PASSWORD);
  // بدون پاسخ، درخواست به فایل ایستای صفحه می‌رسد
  return res ?? undefined;
}
