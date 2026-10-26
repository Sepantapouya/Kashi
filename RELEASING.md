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
npm publish -w @kashi-ui/css
npm publish -w @kashi-ui/react
```

ترتیب مهم است: `css` به `tokens` وابسته است و `react` به `css`.

### ۳. انتشار خودکار از GitHub

روش پیشنهادی **Trusted Publishing** است و به هیچ توکنی نیاز ندارد:

1. در npmjs.com برای هر سه پکیج: Settings ← Trusted Publisher ← GitHub Actions
   - Organization or user: `Sepantapouya`
   - Repository: `Kashi`
   - Workflow filename: `release.yml`
2. در GitHub: Settings ← Actions ← General ← گزینهٔ **Allow GitHub Actions to create and approve pull requests** را فعال کنید.
3. در GitHub: Settings ← Secrets and variables ← Actions ← Variables، متغیر `NPM_PUBLISH` را با مقدار `true` بسازید.

(روش جایگزین: یک Granular Access Token در npm بسازید و آن را با نام `NPM_TOKEN` در Secrets ذخیره کنید.)

## هر بار: انتشار نسخهٔ جدید

1. همراه هر تغییر، یک changeset بسازید:
   ```bash
   npx changeset
   ```
2. پس از ادغام در `main`، گردش کار Release یک PR با عنوان «نسخهٔ جدید کاشی» می‌سازد که نسخه‌ها و CHANGELOG را به‌روز می‌کند.
3. با ادغام آن PR، هر سه پکیج با یک نسخهٔ یکسان روی npm منتشر می‌شوند، همراه با provenance که نشان می‌دهد پکیج دقیقاً از همین مخزن ساخته شده است.
