import { useEffect, useState } from "react";
import type { Bank } from "@kashi-ui/persian";

/** لوگوی بانک را فقط هنگام نیاز بارگذاری می‌کند (code-split)، تا حجم اولیهٔ برنامه زیاد نشود */
function useBankLogo(slug: string | undefined, enabled: boolean): string | null {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    if (!slug || !enabled) {
      setUri(null);
      return;
    }
    let alive = true;
    import("@kashi-ui/bank-logos")
      .then((m) => alive && setUri(m.bankLogoDataUri(slug)))
      .catch(() => alive && setUri(null));
    return () => {
      alive = false;
    };
  }, [slug, enabled]);
  return uri;
}

/** نام و لوگوی بانک داخل فیلد؛ نام با id به فیلد متصل می‌شود و لوگو تزئینی است */
export function BankBadge({ bank, id, showLogo }: { bank: Bank | null; id: string; showLogo: boolean }) {
  const logo = useBankLogo(bank?.slug, showLogo);
  if (!bank) return null;
  return (
    <span className="k-bank" id={id}>
      {logo && <img className="k-bank__logo" src={logo} alt="" width={24} height={24} />}
      {bank.name}
    </span>
  );
}
