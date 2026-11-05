import {useEffect,useState} from 'react';
import {Badge,Button,SegmentedControl} from '@kashi-ui/react';
import {Icon} from '@kashi-ui/icons/react';
import {services,fresh,daily,validFeed} from '../../../../../scripts/status/model.mjs';
type Check={state:'up'|'down';ms:number};
type Sample={at:string;source:string;checks:Record<string,Check>};
type Feed={version:number;samples:Sample[]};
const url='https://raw.githubusercontent.com/Sepantapouya/Kashi/status/status.json';
const n=(v:number)=>v.toLocaleString('fa-IR',{maximumFractionDigits:1});
const stamp=(at:string)=>new Date(at).toLocaleString('fa-IR',{timeZone:'Asia/Tehran',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
export default function StatusDashboard({initial}:{initial:Feed}) {
 const [feed,setFeed]=useState(initial),[days,setDays]=useState('30'),[loading,setLoading]=useState(false),[error,setError]=useState(''),[now,setNow]=useState(Date.now());
 async function refresh(){setLoading(true);setError('');try{const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const data=await r.json();if(!validFeed(data))throw Error();setFeed(data);}catch{setError('دادهٔ تازه دریافت نشد. آخرین نتیجهٔ موجود نمایش داده می‌شود.');}finally{setLoading(false);setNow(Date.now());}}
 useEffect(()=>{refresh();const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer);},[]);
 const samples=feed.samples,latest=samples.at(-1),current=fresh(latest,now),up=latest?services.filter((s:any)=>latest.checks[s.id].state==='up').length:0;
 const state=!current?'unknown':up===services.length?'up':'down';
 const recent=samples.filter(s=>Date.parse(s.at)>=now-Number(days)*86400000);
 const failed=recent.filter(s=>services.some((v:any)=>s.checks[v.id].state==='down'));
 return <>
  <section className="radar-summary" data-state={state} aria-label="وضعیت کلی">
   <div className="radar-orbit" aria-hidden="true"><span/><span/><span/><Icon name="globe" size={34}/></div>
   <div className="radar-summary-copy"><Badge tone={state==='up'?'success':state==='down'?'warning':'neutral'} dot>{state==='up'?'بررسی موفق':state==='down'?'نیاز به بررسی':'در انتظار دادهٔ تازه'}</Badge>
   <h2>{state==='up'?'راه برای ساختن باز است.':state==='down'?'بعضی بررسی‌ها موفق نبودند.':'وضعیت را با داده می‌سنجیم.'}</h2>
   <p>{!latest?'پایش هنوز نتیجه‌ای ثبت نکرده است.':!current?'آخرین اندازه‌گیری قدیمی است؛ وضعیت فعلی مشخص نیست.':`${n(up)} سرویس از ${n(services.length)} سرویس، در آخرین بررسی در دسترس بودند.`}</p>
   </div><div className="radar-summary-meta"><span>آخرین اندازه‌گیری</span><strong>{latest?stamp(latest.at):'هنوز ثبت نشده'}</strong><small>به وقت تهران</small></div>
  </section>
  <div className="radar-toolbar"><div><h2>نبض سرویس‌ها</h2><p>هر خانه، نتیجهٔ بررسی‌های یک روز</p></div><SegmentedControl aria-label="بازهٔ تاریخچه" value={days} onChange={setDays} size="sm" options={[{value:'7',label:'۷ روز'},{value:'30',label:'۳۰ روز'},{value:'90',label:'۹۰ روز'}]}/></div>
  <section className="radar-services" aria-label="تاریخچهٔ سرویس‌ها">
   {services.map((service:any)=>{const check=latest?.checks[service.id],state=current?check?.state:'unknown';const ok=recent.filter(s=>s.checks[service.id].state==='up').length;return <article className="radar-service" key={service.id}>
    <header><div className="radar-service-name"><span className="radar-service-icon"><Icon name={service.icon} size={22}/></span><div><h3>{service.name}</h3><p>{service.description}</p></div></div><Badge dot tone={state==='up'?'success':state==='down'?'error':'neutral'}>{state==='up'?'در دسترس':state==='down'?'بررسی ناموفق':'نامشخص'}</Badge></header>
    <div className="radar-history" role="list" aria-label={`تاریخچهٔ ${service.name}`}>
     {daily(samples,service.id,Number(days),now).map((day:any)=>{const label=`${day.date}: ${!day.total?'بدون داده':`${n(day.ok)} بررسی موفق از ${n(day.total)}`}`;return <span key={day.date} role="listitem" tabIndex={0} aria-label={label} data-state={day.state}><span className="radar-day-tip">{label}</span></span>;})}
    </div><div className="radar-row-footer"><span>{n(Number(days))} روز گذشته</span><span>{recent.length?<><b>{n(ok/recent.length*100)}٪</b> بررسی موفق · {n(recent.length)} نمونه</>:'هنوز داده‌ای در این بازه نیست'}</span><span>امروز</span></div>
    <details className="radar-detail"><summary>جزئیات آخرین بررسی</summary><p>{check?`زمان کل بررسی: ${n(check.ms)} میلی‌ثانیه. `:''}این زمان، دریافت منابع را هم شامل می‌شود و معیار سرعت مرورگر شما نیست. {latest?.source==='local'?'این نمونه از رایانهٔ توسعه‌دهنده ثبت شده است.':'اندازه‌گیری از محیط GitHub Actions انجام می‌شود.'}</p></details>
   </article>;})}
  </section>
  <div className="radar-legend"><span><i data-state="up"/> موفق</span><span><i data-state="partial"/> بخشی ناموفق</span><span><i data-state="down"/> ناموفق</span><span><i/> بدون داده</span></div>
  <section className="radar-bottom"><div className="radar-events"><span className="radar-eyebrow">گزارش پایش</span><h2>آنچه ثبت شده است</h2>{!recent.length?<p>تاریخچه به‌مرور و با بررسی‌های واقعی شکل می‌گیرد.</p>:!failed.length?<div className="radar-no-events"><Icon name="shield-check" size={26}/><div><strong>در نمونه‌های این بازه خطایی ثبت نشده</strong><p>این به معنی پایش پیوسته یا تضمین نبود اختلال نیست.</p></div></div>:<ul>{failed.slice(-5).reverse().map(s=><li key={s.at}><time>{stamp(s.at)}</time><strong>{services.filter((v:any)=>s.checks[v.id].state==='down').map((v:any)=>v.name).join('، ')}</strong><span>بررسی ناموفق؛ علت قطعی مشخص نیست.</span></li>)}</ul>}</div>
  <aside><span className="radar-eyebrow">شفاف و قابل بررسی</span><h2>این اعداد چه می‌گویند؟</h2><p>زمان‌بندی پایش هر ۳۰ دقیقه است؛ اجرای GitHub ممکن است تأخیر داشته باشد. پس از ۲ ساعت، نتیجه قدیمی در نظر گرفته می‌شود.</p><p>درصدها نسبت بررسی‌های موفق به نمونه‌های ثبت‌شده‌اند، نه درصد زمان روشن‌بودن سرویس. خانهٔ خالی یعنی داده نداریم.</p><details><summary>محدوده و روش اندازه‌گیری</summary><p>بررسی از یک نقطه انجام می‌شود و وضعیت اتصال داخل ایران را نمایندگی نمی‌کند. سالم‌بودن ZIP، عملکرد پلاگین داخل فیگما را تأیید نمی‌کند. نصب‌های قبلی کاشی برای اجرا به آنلاین‌بودن سایت کاشی وابسته نیستند.</p><a href="https://github.com/Sepantapouya/Kashi/blob/main/scripts/status/collect.mjs">مشاهدهٔ کد پایش</a></details></aside></section>
  <div className="radar-refresh"><div role="status">{error||'دادهٔ اندازه‌گیری؛ بدون تاریخچهٔ ساختگی.'}</div><Button size="sm" variant="secondary" loading={loading} onClick={refresh}>دریافت آخرین نتیجه</Button></div>
 </>;
}
