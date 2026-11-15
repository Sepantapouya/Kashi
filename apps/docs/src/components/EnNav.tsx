// English header: Kashi's own Navbar, wrapped so the Astro layout only passes plain data
import { Navbar, type NavbarLink } from "@kashi-ui/react";

export default function EnNav({ version, fa, links }: { version: string; fa: string; links: NavbarLink[] }) {
  return (
    <Navbar
      variant="pill"
      collapseBelow="md"
      aria-label="Main navigation"
      className="en-nav"
      brandHref="/en/docs/"
      brand={<span className="en-brand"><img src="/favicon.svg" alt="" width={24} height={24} />Kashi <span className="en-brand__ver">v{version}</span></span>}
      links={links}
      actions={<a className="k-btn k-btn--secondary k-btn--sm" href={fa} hrefLang="fa" lang="fa">فارسی</a>}
      menuFooter={<a className="k-btn k-btn--secondary" href={fa} hrefLang="fa" lang="fa" style={{ inlineSize: "100%" }}>فارسی</a>}
    />
  );
}
