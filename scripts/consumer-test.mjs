// تست مصرف‌کننده: کاشیِ تازه‌بیلدشده را همان‌طور که کاربر نصب می‌کند در یک پروژهٔ Next.js نصب و بیلد می‌کند.
// پیش از هر انتشار اجرا شود (npm run release و CI این کار را می‌کنند): خطاهایی را می‌گیرد که تست‌های خود پکیج‌ها نمی‌بینند،
// مثل کامپوننتی که در صفحهٔ سرور App Router خراب می‌شود یا آیتم رجیستری shadcn که وابستگی‌اش جا افتاده است.
//
// مراحل:
//   ۱. یک رجیستری npm موقت (verdaccio) روی localhost؛ هر ۸ پکیج @kashi-ui در آن منتشر می‌شوند تا نسخهٔ منتشرنشده هم نصب شود
//   ۲. سایت مستندات با رجیستری shadcn روی localhost بیلد و سرو می‌شود
//   ۳. tests/consumer در پوشهٔ موقت کپی و از همان رجیستری npm نصب می‌شود
//   ۴. همهٔ آیتم‌های رجیستری با `shadcn add …/r/all.json` اضافه می‌شوند
//   ۵. `next build` (با بررسی TypeScript): صفحهٔ سرور با import از پکیج و صفحهٔ کلاینت با کدهای کپی‌شده
//
// پیش‌نیاز: `npm run build`. اجرا: `npm run test:consumer` (KEEP=1 پوشهٔ موقت را نگه می‌دارد)
import { spawn } from "node:child_process";
import { cpSync, createReadStream, existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const PACKAGES = ["tokens", "persian", "bank-logos", "icons", "css", "react", "tailwind", "mcp"];
const NPM_PORT = 4873;
const SITE_PORT = 4401;
const NPM = `http://localhost:${NPM_PORT}`;
const SITE = `http://localhost:${SITE_PORT}`;
const version = JSON.parse(readFileSync(join(root, "packages/react/package.json"), "utf8")).version;

const work = mkdtempSync(join(tmpdir(), "kashi-consumer-"));
// بیرون از پوشه‌های کاری؛ npx خودِ verdaccio را باید از npm واقعی بگیرد، نه از رجیستری‌ای که هنوز بالا نیامده
const npmrc = join(work, "npm-config");
// verdaccio برای انتشار بی‌نام هم یک توکن می‌خواهد؛ مقدارش مهم نیست
writeFileSync(npmrc, `registry=${NPM}/\n//localhost:${NPM_PORT}/:_authToken=consumer-test\n`);
const env = {
  ...process.env,
  npm_config_registry: `${NPM}/`,
  npm_config_userconfig: npmrc,
  npm_config_audit: "false",
  npm_config_fund: "false",
  npm_config_update_notifier: "false",
  NEXT_TELEMETRY_DISABLED: "1",
};

const children = [];
let server;
const t0 = Date.now();
const step = (msg) => console.log(`\n▸ ${msg}`);

/** اجرای یک دستور؛ خروجی فقط در صورت خطا چاپ می‌شود */
function run(cmd, args, { cwd = root, extraEnv = {} } = {}) {
  return new Promise((ok, fail) => {
    const p = spawn(cmd, args, { cwd, env: { ...env, ...extraEnv }, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (code) => {
      if (code === 0) return ok(out);
      const tail = out.trim().split("\n").slice(-40).join("\n");
      fail(new Error(`${cmd} ${args.join(" ")} (در ${cwd}) با کد ${code} شکست خورد:\n${tail}`));
    });
  });
}

async function waitFor(url, what) {
  // بار اول npx خودِ verdaccio را دانلود می‌کند
  for (let i = 0; i < 360; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${what} روی ${url} بالا نیامد`);
}

function startRegistry() {
  const config = join(work, "verdaccio.yaml");
  writeFileSync(
    config,
    [
      `storage: ${join(work, "storage")}`,
      "max_body_size: 300mb",
      "uplinks:",
      "  npmjs:",
      "    url: https://registry.npmjs.org/",
      "    timeout: 60s",
      "packages:",
      // پکیج‌های کاشی فقط از همین رجیستری؛ نسخه‌های npm واقعی دیده نمی‌شوند
      "  '@kashi-ui/*':",
      "    access: $all",
      "    publish: $all",
      "  '**':",
      "    access: $all",
      "    proxy: npmjs",
      "log: { type: stdout, format: pretty, level: error }",
      "",
    ].join("\n"),
  );
  const p = spawn("npx", ["-y", "verdaccio@6", "--config", config, "--listen", String(NPM_PORT)], {
    cwd: root,
    env: { ...process.env, npm_config_registry: "https://registry.npmjs.org/" },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  let log = "";
  p.stdout.on("data", (d) => (log += d));
  p.stderr.on("data", (d) => (log += d));
  p.on("exit", (code) => code && console.error(log.slice(-2000)));
  children.push(p);
  return waitFor(`${NPM}/-/ping`, "رجیستری npm موقت");
}

function serveSite(dir) {
  const types = { ".json": "application/json; charset=utf-8", ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8" };
  server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, SITE).pathname);
    let file = join(dir, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!file.startsWith(dir) || !existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(SITE_PORT, ok));
}

function cleanup() {
  server?.close();
  for (const p of children) {
    try {
      process.kill(-p.pid, "SIGTERM");
    } catch {}
  }
  if (!process.env.KEEP) rmSync(work, { recursive: true, force: true });
  else console.log(`پوشهٔ موقت نگه داشته شد: ${work}`);
}
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});

try {
  for (const p of PACKAGES)
    if (!existsSync(join(root, "packages", p, "dist"))) throw new Error(`packages/${p}/dist نیست؛ اول npm run build را اجرا کنید`);

  step(`رجیستری npm موقت روی ${NPM}`);
  await startRegistry();

  step(`انتشار ${PACKAGES.length} پکیج @kashi-ui نسخهٔ ${version} در رجیستری موقت`);
  for (const p of PACKAGES) await run("npm", ["publish", "--ignore-scripts", "--tag", "latest"], { cwd: join(root, "packages", p) });

  step(`بیلد سایت مستندات با رجیستری shadcn روی ${SITE}`);
  await run("npx", ["astro", "build"], { cwd: join(root, "apps/docs"), extraEnv: { KASHI_REGISTRY_ORIGIN: SITE } });
  const all = JSON.parse(readFileSync(join(root, "apps/docs/dist/r/all.json"), "utf8"));
  if (!all.registryDependencies?.every((u) => u.startsWith(SITE))) throw new Error("آدرس وابستگی‌های رجیستری به سایت محلی اشاره نمی‌کند");
  await serveSite(join(root, "apps/docs/dist"));

  step("نصب پروژهٔ Next.js آزمایشی (tests/consumer)");
  const app = join(work, "app");
  cpSync(join(root, "tests/consumer"), app, { recursive: true, filter: (src) => !/node_modules|\.next/.test(src) });
  const pkg = JSON.parse(readFileSync(join(app, "package.json"), "utf8"));
  for (const name of Object.keys(pkg.dependencies)) if (name.startsWith("@kashi-ui/")) pkg.dependencies[name] = version;
  writeFileSync(join(app, "package.json"), JSON.stringify(pkg, null, 2));
  await run("npm", ["install"], { cwd: app });

  step(`افزودن همهٔ ${all.registryDependencies.length} کامپوننت با shadcn از ${SITE}/r/all.json`);
  await run("npx", ["-y", "shadcn@4", "add", `${SITE}/r/all.json`, "-y", "--overwrite"], { cwd: app });
  const copied = join(app, "src/components/kashi/AddressForm.tsx");
  if (!existsSync(copied)) throw new Error("shadcn فایل‌ها را در src/components/kashi کپی نکرد");

  step("next build: صفحهٔ سرور با @kashi-ui/react و صفحهٔ کلاینت با کدهای کپی‌شده");
  await run("npx", ["next", "build"], { cwd: app });

  console.log(`\n✓ تست مصرف‌کننده رد شد (${Math.round((Date.now() - t0) / 1000)} ثانیه)`);
  cleanup();
} catch (err) {
  console.error(`\n✗ تست مصرف‌کننده شکست خورد\n${err.message}`);
  cleanup();
  process.exit(1);
}
