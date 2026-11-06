import { useState } from 'react';
import { Button } from '@kashi-ui/react';
import { Icon } from '@kashi-ui/icons/react';
import { sanje } from './content';
export function SanjeMark() {
  return <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" className="ln-mark"><path d="M16 1 11.61 5.39H5.39v6.22L1 16l4.39 4.39v6.22h6.22L16 31l4.39-4.39h6.22v-6.22L31 16l-4.39-4.39V5.39h-6.22Z" fill="currentColor"/><path d="M10.5 20.5v-3M16 20.5v-7M21.5 20.5v-10" stroke="var(--k-text-on-brand)" strokeWidth="2.4" strokeLinecap="round"/></svg>;
}
const links = [['محصول',sanje.home],['پیشخوان',sanje.base+'dashboard/'],['راهنما',sanje.base+'guide/'],['قیمت‌ها',`${sanje.base}pricing/`],['نوشته‌ها',`${sanje.base}blog/`],['تماس',`${sanje.base}contact/`]];
export function SanjeHeader({current=''}:{current?:string}) {
  const [open,setOpen]=useState(false);
  return <header className="ln-top"><div className="ln-wrap ln-top__in"><a href={sanje.home} className="ln-logo" aria-label="سنجه، صفحهٔ اصلی"><SanjeMark/><span>سنجه</span></a><nav className="ln-nav" id="sanje-nav" aria-label="اصلی" data-open={open||undefined}>{links.map(([label,href])=><a key={href} href={href} aria-current={current===href?'page':undefined} onClick={()=>setOpen(false)}>{label}</a>)}</nav><div className="ln-top__end"><Button href={`${sanje.base}login/`} variant="tertiary" size="sm">ورود</Button><Button href={`${sanje.base}signup/`} variant="primary" size="sm">شروع کنید</Button><Button className="ln-menu-toggle" variant="secondary" size="sm" shape="square" aria-expanded={open} aria-controls="sanje-nav" aria-label={open?'بستن فهرست':'باز کردن فهرست'} onClick={()=>setOpen(!open)}><Icon name={open?'x':'menu'} size={20}/></Button></div></div></header>;
}
export function SanjeFooter(){return <footer className="sj-footer ln-wrap"><div><a href={sanje.home} className="ln-logo"><SanjeMark/>سنجه</a><p>{sanje.tagline}</p></div><nav aria-label="پانویس سنجه">{links.map(([label,href])=><a href={href} key={href}>{label}</a>)}<a href={sanje.base+'login/'}>ورود</a><a href="/pro/">دربارهٔ این قالب</a></nav><small>نمونهٔ کاشی پرو · داده‌ها و سرویس‌ها نمایشی‌اند.</small></footer>}
