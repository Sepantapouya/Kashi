// جستجوی سایت با CommandPalette خود کاشی (Ctrl+K / ⌘K)
import { useState } from "react";
import { CommandPalette, type CommandItem } from "@kashi-ui/react";
import { nav } from "../data/nav";

const items: CommandItem[] = nav.flatMap((g) =>
  g.items.map((i) => ({ id: i.href, label: i.title, group: g.title, href: i.href, keywords: [i.href.split("/").filter(Boolean).pop() ?? ""] })),
);

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="search-btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="m13.5 13.5 3 3" /></svg>
        <span className="search-btn__text">جستجو در مستندات…</span>
        <kbd className="search-btn__kbd" aria-hidden="true">⌘K</kbd>
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} placeholder="جستجوی کامپوننت یا راهنما…" />
    </>
  );
}
