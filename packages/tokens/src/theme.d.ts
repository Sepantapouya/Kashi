export declare function brandScale(color: string): Record<number, string>;
export interface ThemeOptions {
  /** رنگ پایهٔ برند (پلهٔ ۵۰۰) یا طیف کامل ۵۰ تا ۹۵۰ */
  brand?: string | Record<number, string>;
  /** ضریب گردی گوشه‌ها — 0 تیز، 1 پیش‌فرض */
  radius?: number;
  /** ضریب تراکم — 0.875 فشرده، 1 عادی، 1.125 جادار */
  density?: number;
  fontFamily?: string;
  /** پیش‌فرض ":root" */
  selector?: string;
}
export declare function createTheme(options?: ThemeOptions): string;
