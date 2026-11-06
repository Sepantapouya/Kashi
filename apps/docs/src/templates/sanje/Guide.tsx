import { Badge, Button } from '@kashi-ui/react';
import { Icon } from '@kashi-ui/icons/react';
import { SanjeFooter, SanjeHeader } from './Shell';
import { sanje } from './content';
const steps = [
  ['chart','نمای کلی را بخوانید','۷ روز آخر را با کل ماه مقایسه کنید. کارت‌های بالای پیشخوان و نمودار از یک بازه استفاده می‌کنند.','dashboard','باز کردن پیشخوان'],
  ['funnel','مرحلهٔ ریزش را پیدا کنید','در قیف خرید، تعداد نشست‌ها و درصد عبور از هر مرحله را ببینید. روی رویدادهای همان مرحله بزنید تا جزئیات را بخوانید.','funnel','بررسی قیف خرید'],
  ['compass','کانال‌ها را مقایسه کنید','جدول کانال‌ها را بر اساس درآمد یا نرخ تبدیل مرتب کنید. کانالی با ورودی بیشتر لزوماً فروش بیشتری ندارد.','channels','مقایسهٔ کانال‌ها'],
  ['layers','یک نشست را دنبال کنید','در صفحهٔ رویدادها، شناسهٔ یک نشست را جستجو کنید تا قدم‌های همان بازدید کنار هم دیده شوند.','events','جستجو در رویدادها'],
] as const;
export default function Guide(){return <div className="ln sj"><SanjeHeader current={sanje.base+'guide/'}/><main id="sanje-main" className="ln-wrap sj-guide"><header className="sj-room-top"><div><span className="sj-overline"><i/> راهنمای سنجه</span><h1>اولین گزارش شما، در چهار قدم.</h1><p>از دیدن تصویر کلی شروع کنید و به رفتار یک نشست برسید.</p></div><Badge tone="brand">مسیر پیشنهادی</Badge></header><ol className="sj-guide-steps">{steps.map(([icon,title,desc,path,cta],i)=><li key={path}><div className="sj-guide-number"><Icon name={icon} size={24}/><small>قدم {['اول','دوم','سوم','چهارم'][i]}</small></div><div><h2>{title}</h2><p>{desc}</p><Button href={sanje.base+path+'/'} variant="secondary" size="sm">{cta} ←</Button></div></li>)}</ol></main><SanjeFooter/></div>}
