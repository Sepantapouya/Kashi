# انتشار نسخه

## یک‌بار: راه‌اندازی

### ۱. ساخت سازمان در npm

در [npmjs.com](https://www.npmjs.com) وارد شوید و سازمان `kashi-ui` را بسازید (Add Organization، پلن رایگان برای پکیج‌های عمومی).

### ۲. اولین انتشار (دستی)

Trusted Publishing فقط برای پکیجی قابل‌تنظیم است که از قبل روی npm وجود دارد؛ پس اولین نسخه را از سیستم خودتان منتشر کنید:

```bash
npm login
npm run build && npm test
npm publish -w @kashi-ui/tokens
npm publish -w @kashi-ui/persian
npm publish -w @kashi-ui/bank-logos
npm publish -w @kashi-ui/css
npm publish -w @kashi-ui/react
```

ترتیب مهم است: `css` به `tokens` وابسته است و `react` به `css`، `persian` و `bank-logos`.

> **نکته‌هایی که در اولین انتشار (۰.۲.۰) یاد گرفتیم:**
> - ورود دومرحله‌ای (2FA) حساب npm باید روی **Authorization and Publishing** فعال باشد؛ وگرنه npm خطای `E403` می‌دهد و کدی نمی‌پرسد. وضعیت را با `npm profile get` ببینید.
> - npm در اولین انتشار هر پکیج یک نسخهٔ موقت `0.0.0-stage` می‌سازد. این نسخه بی‌خطر است و هیچ نصب معمولی آن را انتخاب نمی‌کند.
> - پس از انتشار، چند دقیقه طول می‌کشد تا نسخهٔ جدید `latest` شود.
> - اگر npm نسخه را «staged» کرد، با `npm stage list` آن را ببینید و از تب Staged Packages در npmjs.com یا با `npm stage approve <stage-id>` تأیید کنید (به npm نسخهٔ ۱۱.۱۵ یا بالاتر نیاز دارد).

### ۳. انتشار خودکار از GitHub

روش پیشنهادی **Trusted Publishing** است و به هیچ توکنی نیاز ندارد:

1. در npmjs.com برای هر سه پکیج: Settings ← Trusted Publisher ← GitHub Actions
   - Organization or user: `Sepantapouya`
   - Repository: `Kashi`
   - Workflow filename: `release.yml`
2. در GitHub: Settings ← Actions ← General ← گزینهٔ **Allow GitHub Actions to create and approve pull requests** را فعال کنید.
3. در GitHub: Settings ← Secrets and variables ← Actions ← Variables، متغیر `NPM_PUBLISH` را با مقدار `true` بسازید.

(روش جایگزین: یک Granular Access Token در npm بسازید و آن را با نام `NPM_TOKEN` در Secrets ذخیره کنید.)

> **نکته‌ها:**
> - بدون متغیر `NPM_PUBLISH=true` گردش کار Release در هر push به `main` «skipped» می‌شود و هیچ نسخه‌ای منتشر نمی‌شود، حتی اگر نسخهٔ پکیج‌ها در مخزن بالا رفته باشد. وضعیت را در تب Actions ببینید.
> - توکن npm باید گزینهٔ **Bypass two-factor authentication** را داشته باشد؛ وگرنه انتشار از GitHub با `E403` رد می‌شود.
> - Trusted Publishing فقط برای پکیجی که از قبل روی npm هست کار می‌کند. پکیج تازه (مثل `@kashi-ui/codemod`) اولین بار با توکن یا دستی منتشر می‌شود و بعد می‌توان Trusted Publisher را برایش تنظیم کرد.

## هر بار: انتشار نسخهٔ جدید

بستهٔ آیکون‌ها پیش از انتشار با `npm run check:icon-package` بررسی می‌شود: شمار فایل‌ها باید کمتر از ۶۴۰۰۰ باشد و تمام مسیرهای عمومی SVG، اسپرایت‌ها و مجوزها در آرشیو موجود باشند. فایل SVG نشان‌های رسمی در سبک‌های مختلف یکسان است. نسخه‌های منحنی و دورنگِ عیناً یکسان با SVG پایه هم از طریق `exports` به فایل پایه اشاره می‌کنند. پس از تغییر هندسه یا موتور سبک‌ها، با `node packages/icons/scripts/update-svg-exports.mjs` نگاشت‌ها را به‌روز کنید.

> **آیکون‌های تازه:** پس از `npx changeset version` (یا در PR «نسخهٔ جدید کاشی»)، `node packages/icons/scripts/releases.mjs` را اجرا و `packages/icons/releases.json` را کامیت کنید. صفحهٔ «آیکون‌های تازه» (`/docs/icons/new/`) و نوار همان در صفحهٔ آیکون‌ها از این فایل می‌خوانند؛ تست `releases.test.mjs` اگر فایل با نسخهٔ بسته یکی نباشد شکست می‌خورد.

1. همراه هر تغییر، یک changeset بسازید:
   ```bash
   npx changeset
   ```
2. پس از ادغام در `main`، گردش کار Release یک PR با عنوان «نسخهٔ جدید کاشی» می‌سازد که نسخه‌ها و CHANGELOG را به‌روز می‌کند.
3. با ادغام آن PR، هر سه پکیج با یک نسخهٔ یکسان روی npm منتشر می‌شوند، همراه با provenance که نشان می‌دهد پکیج دقیقاً از همین مخزن ساخته شده است.

### GitHub Releases

پس از هر ادغام در `main` که نسخهٔ پکیج‌ها را بالا می‌برد، گردش کار `github-release.yml` برای همان نسخه یک Release با نام «Kashi X.Y.Z» و برچسب `vX.Y.Z` می‌سازد. یادداشت انتشار از CHANGELOG همهٔ پکیج‌ها جمع می‌شود و خط‌های «Updated dependencies» حذف می‌شوند. نسخه‌هایی که Release دارند رد می‌شوند، پس اجرای دوباره بی‌خطر است. پیش‌نمایش بدون ساختن چیزی:

```bash
node scripts/github-release.mjs --dry-run
```

### تست تصویری پیش از انتشار

تست تصویری فعلاً روی سیستم خود نگهدارنده اجرا می‌شود (عکس‌های مرجع به سیستم‌عامل و فونت وابسته‌اند و برای macOS ذخیره شده‌اند). پیش از هر انتشار:

```bash
npm run docs:build && npm run test:visual
```

اگر تفاوتی عمدی است (ظاهر کامپوننتی را خودتان عوض کرده‌اید)، گزارش را در `tests/visual/report` ببینید و بعد عکس‌های مرجع را تازه کنید: `npm run test:visual:update`. حالت‌های خطا، متن بلند و انگلیسی در صفحهٔ پنهان `/test/states/` (فایل `apps/docs/src/components/VisualStates.tsx`) هستند؛ حالت حساس تازه را همان‌جا اضافه کنید.

### تست مصرف‌کننده پیش از انتشار

`npm run release` پیش از `changeset publish` دستور `npm run test:consumer` را اجرا می‌کند و CI هم آن را روی هر کامیت `main` و هر PR اجرا می‌کند. اگر دستی منتشر می‌کنید (`npx changeset publish`)، اول همین را بزنید:

```bash
npm run build && npm run test:consumer
```

این تست ([scripts/consumer-test.mjs](scripts/consumer-test.mjs)) کاشیِ همین کامیت را مثل یک کاربر نصب می‌کند:

- هر ۸ پکیج در یک رجیستری npm موقت روی `localhost` (verdaccio) منتشر می‌شوند تا نسخهٔ منتشرنشده هم نصب شود؛
- پروژهٔ آزمایشی [tests/consumer](tests/consumer) (Next.js با App Router، React 19 و Tailwind 4) از همان رجیستری نصب می‌شود؛
- همهٔ آیتم‌های رجیستری shadcn از سایتِ همین کامیت با `shadcn add …/r/all.json` اضافه می‌شوند؛
- `next build` با بررسی TypeScript هم صفحهٔ سرور (import مستقیم از `@kashi-ui/react`) و هم صفحهٔ کلاینت (کدهای کپی‌شده) را می‌سازد.

حدود چند دقیقه طول می‌کشد و به اینترنت نیاز دارد (Next.js و وابستگی‌های دیگر از npm می‌آیند). با `KEEP=1` پوشهٔ موقت برای بررسی نگه داشته می‌شود.
