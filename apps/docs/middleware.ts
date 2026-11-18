// Vercel Routing Middleware for the private product-management course (/learn/pm/).
// It runs before the static file is served from the CDN. The Vercel project root is apps/docs, so the file lives here.
// The course password comes from the KASHI_PM_PASSWORD env var (Production and Preview) and is never in the repo.
//
// On purpose this file has no imports at all (neither packages nor relative files), so nothing can fail
// when Vercel loads it. src/lib/pm-gate.ts re-exports from here for the Astro dev server.


export const PM_BASE = "/learn/pm/";
export const PM_LOGIN = "/learn/pm/login/";
export const PM_COOKIE = "kashi_pm";
const COOKIE_PATH = "/learn";
const MAX_AGE = 60 * 60 * 24 * 30; // سی روز
// با عوض شدن این برچسب یا رمز، همهٔ کوکی‌های قبلی باطل می‌شوند
const TOKEN_LABEL = "kashi-pm-course:v1";

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function token(password: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(TOKEN_LABEL)));
}

/** مقایسه با زمان ثابت؛ هر دو طرف اول هش می‌شوند تا طولشان هم چیزی لو ندهد */
async function same(a: string, b: string) {
  const [x, y] = await Promise.all([a, b].map(async (s) => new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)))));
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function readCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

/** فقط به صفحه‌های خود دوره برمی‌گردد؛ جلوی تغییر مسیر به سایت‌های دیگر را می‌گیرد */
function safeNext(value: unknown) {
  const s = typeof value === "string" ? value : "";
  return s.startsWith(PM_BASE) && !s.startsWith("//") && !s.includes("\\") && !s.startsWith(PM_LOGIN) ? s : PM_BASE;
}

function redirect(location: string, cookie?: string) {
  const headers = new Headers({ location, "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" });
  if (cookie) headers.append("set-cookie", cookie);
  return new Response(null, { status: 303, headers });
}

const cookie = (value: string, maxAge: number, secure: boolean) =>
  `${PM_COOKIE}=${value}; Path=${COOKIE_PATH}; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;

const loginUrl = (next: string, error?: string) => {
  const q = new URLSearchParams();
  if (next !== PM_BASE) q.set("next", next);
  if (error) q.set("error", error);
  const s = q.toString();
  return PM_LOGIN + (s ? `?${s}` : "");
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * درخواست را بررسی می‌کند. اگر پاسخی برگرداند همان را بفرستید؛ اگر null بود درخواست آزاد است و صفحه نمایش داده می‌شود.
 * بدون رمزِ تنظیم‌شده همه‌چیز بسته می‌ماند (fail closed).
 */
export async function pmGate(request: Request, password: string | undefined): Promise<Response | null> {
  const url = new URL(request.url);
  // نشانی بدون اسلش پایانی هم همان صفحه است
  const path = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  if (!path.startsWith("/learn/")) return null;
  const secure = url.protocol === "https:";

  if (path === PM_LOGIN) return null;

  if (path === `${PM_BASE}logout/`) return redirect(PM_LOGIN, cookie("", 0, secure));

  if (path === `${PM_BASE}unlock/`) {
    if (request.method !== "POST") return redirect(PM_LOGIN);
    let given = "";
    let next = PM_BASE;
    try {
      const form = await request.formData();
      given = String(form.get("password") ?? "");
      next = safeNext(form.get("next"));
    } catch {}
    if (!password) return redirect(loginUrl(next, "config"));
    if (given && (await same(given, password))) return redirect(next, cookie(await token(password), MAX_AGE, secure));
    // کمی مکث، تا حدس زدن پشت‌سرهم رمز کند شود
    await wait(700);
    return redirect(loginUrl(next, "wrong"));
  }

  const ok = password ? await same(readCookie(request, PM_COOKIE) ?? "", await token(password)) : false;
  if (ok) return null;
  return redirect(loginUrl(safeNext(path + url.search), password ? undefined : "config"));
}

/** Same as next() from @vercel/functions: lets the request through to the static page. */
const passThrough = () => new Response(null, { headers: { "x-middleware-next": "1" } });

export const config = { matcher: ["/learn", "/learn/:path*"] };

export default async function middleware(request: Request) {
  try {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    const res = await pmGate(request, env?.KASHI_PM_PASSWORD);
    return res ?? passThrough();
  } catch (err) {
    // fail closed: the course stays locked, and the error text is visible so it can be diagnosed
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error("[pm-gate]", err);
    return new Response(`pm-gate error\n${msg}\n`, { status: 503, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
  }
}
