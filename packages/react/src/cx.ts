/** کلاس‌ها را به هم می‌چسباند و مقادیر خالی را نادیده می‌گیرد */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
