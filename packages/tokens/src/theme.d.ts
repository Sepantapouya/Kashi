export declare function brandScale(color: string): Record<number, string>;
export declare const FALLBACK_SANS: string;
/** «IRANSans» را به فهرست کامل با فونت‌های جایگزین تبدیل می‌کند */
export declare function fontStack(family: string, fallback?: string): string;

export interface FontFaceSource {
  url: string;
  /** "woff2" | "woff" | "truetype" | "opentype" */
  format: string;
}

export interface FontFaceOptions {
  /** نام خانوادهٔ فونت، همان که در fontFamily استفاده می‌کنید */
  family: string;
  /** آدرس فایل؛ قالب از پسوند تشخیص داده می‌شود */
  src: string | Array<string | FontFaceSource>;
  /** وزن ثابت (400) یا بازه برای فونت متغیر ("100 900") @default "400" */
  weight?: string | number;
  /** @default "normal" */
  style?: string;
  /** @default "swap" */
  display?: string;
  unicodeRange?: string;
}

/** قاعدهٔ @font-face برای فونت خودمیزبان (رایگان یا خریداری‌شده) */
export declare function fontFace(options: FontFaceOptions): string;

export interface ThemeOptions {
  /** رنگ پایهٔ برند (پلهٔ ۵۰۰) یا طیف کامل ۵۰ تا ۹۵۰ */
  brand?: string | Record<number, string>;
  /** ضریب گردی گوشه‌ها — 0 تیز، 1 پیش‌فرض */
  radius?: number;
  /** ضریب تراکم — 0.875 فشرده، 1 عادی، 1.125 جادار */
  density?: number;
  /** فونت متن؛ نام تنها («IRANSans») خودکار با فونت‌های جایگزین کامل می‌شود */
  fontFamily?: string;
  /** فونت عنوان‌ها (h1 تا h6)؛ پیش‌فرض همان fontFamily */
  displayFontFamily?: string;
  /** فونت کد */
  monoFontFamily?: string;
  /** ضریب اندازهٔ همهٔ متن‌ها؛ مثلاً 0.95 برای فونتی که درشت‌تر دیده می‌شود */
  textScale?: number;
  /** فایل‌های فونت برای ساخت @font-face */
  fonts?: FontFaceOptions[];
  /** پیش‌فرض ":root" */
  selector?: string;
}
export declare function createTheme(options?: ThemeOptions): string;
