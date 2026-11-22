// English header: Kashi's own Navbar, wrapped so the Astro layout only passes plain data
import { Navbar, type NavbarLink } from "@kashi-ui/react";

export default function EnNav({ version, fa, links, pages = [] }: { version: string; fa: string; links: NavbarLink[]; pages?: NavbarLink[] }) {
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
      menuFooter={
        <div className="en-menu">
          {pages.length > 0 && (
            <nav className="en-menu-pages" aria-label="Documentation pages">
              <ul role="list">
                {pages.map((p) => <li key={p.href}><a href={p.href} aria-current={p.current ? "page" : undefined}>{p.label}</a></li>)}
              </ul>
            </nav>
          )}
          <a className="k-btn k-btn--secondary" href={fa} hrefLang="fa" lang="fa" style={{ inlineSize: "100%" }}>فارسی</a>
        </div>
      }
    />
  );
}
