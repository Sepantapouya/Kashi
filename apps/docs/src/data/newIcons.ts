// آیکون‌های تازهٔ هر نسخه، از packages/icons/releases.json (ساختهٔ scripts/releases.mjs از روی تگ‌های انتشار).
// نام‌های منسوخ به نام فعلی برگردانده می‌شوند تا پیوندها کار کنند.
import data from "../../../../packages/icons/releases.json";
import { icons, aliases } from "@kashi-ui/icons";

export interface IconRelease { version: string; date: string; total: number; added: string[] }

const current = (n: string): string | null => (n in icons ? n : (aliases as Record<string, string>)[n] && (aliases as Record<string, string>)[n] in icons ? (aliases as Record<string, string>)[n] : null);

/** نسخه‌هایی که آیکون تازه داشتند، تازه‌ترین اول */
export const iconReleases: IconRelease[] = (data.releases as IconRelease[])
  .filter((r) => r.added.length)
  .map((r) => ({ ...r, added: [...new Set(r.added.map(current).filter((n): n is string => !!n))] }));

export const latestIconRelease = iconReleases[0];

export const faVersion = (v: string) => v.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
export const faDate = (d: string) => new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "long" }).format(new Date(d + "T12:00:00Z"));
