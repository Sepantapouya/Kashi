import { useEffect, useState } from 'react';
import { Badge, Button, DataTable, Input, LineChart, SegmentedControl, Select } from '@kashi-ui/react';
import { Icon } from '@kashi-ui/icons/react';
import { SanjeHeader,SanjeFooter } from './Shell';
import { sanje } from './content';
import { channels,channelIds,reportPages,sessions,stages,summary,rate,num,type Channel,type Report } from './reportData';
const icons = {dashboard:'chart',funnel:'funnel',channels:'compass',events:'layers'} as const;
const pages = Object.keys(reportPages) as Report[];
type Filters = { days:string; channel:Channel|'all'; stage:string };
const defaults:Filters={days:'7',channel:'all',stage:'all'};
function filtersFromUrl():Filters {
  const q = new URLSearchParams(location.search), c=q.get('channel'), s=q.get('stage');
  return {days:q.get('days')==='30'?'30':'7',channel:channelIds.includes(c as Channel)?c as Channel:'all',stage:s&&['0','1','2','3'].includes(s)?s:'all'};
}
function target(page:Report,f:Filters) {
  const q=new URLSearchParams({days:f.days});
  if(f.channel!=='all')q.set('channel',f.channel);
  if(page==='events'&&f.stage!=='all')q.set('stage',f.stage);
  return sanje.base+page+'/?'+q;
}
export default function Reports({page}:{page:Report}) {
  const [filters,setFilters]=useState<Filters>(defaults);
  const [search,setSearch]=useState('');
  const [pageNo,setPageNo]=useState(0);
  useEffect(()=>{setFilters(filtersFromUrl());},[]);
  function change(patch:Partial<Filters>) {
    const next={...filters,...patch}; setFilters(next); setPageNo(0);
    history.replaceState(history.state,'',target(page,next));
  }
  const days=Number(filters.days);
  const rows=sessions.filter(s=>s.day>30-days&&(filters.channel==='all'||filters.channel===s.channel));
  const {visits,orders,revenue,counts}=summary(rows);
  const dayLabels=Array.from({length:days},(_,i)=>30-days+i+1);
  const recent=rows.flatMap(s=>stages.slice(0,s.depth).map((label,index)=>({
    id:s.id+'-'+index,session:s.id,day:s.day,time:s.minute+index*2,label,index,channel:channels[s.channel],
  }))).filter(e=>(filters.stage==='all'||e.index===Number(filters.stage))&&(!search.trim()||(e.session+' '+e.label+' '+e.channel).toLowerCase().includes(search.trim().toLowerCase()))).sort((a,b)=>b.day-a.day||b.time-a.time);
  const pageSize=12, last=Math.max(0,Math.ceil(recent.length/pageSize)-1), current=Math.min(pageNo,last);
  const breakdown=channelIds.map(id=>({id,...summary(rows.filter(s=>s.channel===id))})).filter(c=>c.visits>0);
  const losses=counts.slice(1).map((n,i)=>counts[i]-n);
  const lossIndex=losses.indexOf(Math.max(...losses));
  const time=(m:number)=>[Math.floor(m/60),m%60].map(n=>num(n).padStart(2,'۰')).join(':');
  return <div className="ln sj"><SanjeHeader current={sanje.base+'dashboard/'}/><main id="sanje-main" className="ln-wrap sj-room">
    <header className="sj-room-top"><div><span className="sj-overline"><i/> فضای تحلیل سنجه</span><h1>{reportPages[page][1]}</h1><p>فروشگاه نمونه <span> / </span> آبان ۱۴۰۵</p></div><Badge tone="brand" variant="outline">دادهٔ نمایشی</Badge></header>
    <nav className="sj-room-nav" aria-label="گزارش‌های سنجه">{pages.map(p=><a key={p} href={target(p,filters)} aria-current={p===page?'page':undefined}><Icon name={icons[p]} size={18}/>{reportPages[p][0]}</a>)}</nav>
    <div className="sj-report-tools"><SegmentedControl aria-label="بازهٔ گزارش" size="sm" value={filters.days} onChange={days=>change({days})} options={[{value:'7',label:'۷ روز آخر'},{value:'30',label:'کل ماه'}]}/><Select label="کانال جذب" size="sm" value={filters.channel} onChange={e=>change({channel:e.target.value as Filters['channel']})} options={[{value:'all',label:'همهٔ کانال‌ها'},...channelIds.map(c=>({value:c,label:channels[c]}))]}/></div>
    {page==='dashboard'&&<>
      <div className="sj-metrics">{[['نشست‌ها',num(visits)],['خریدهای موفق',num(orders)],['نرخ تبدیل',rate(orders,visits)],['درآمد (تومان)',num(revenue)]].map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
      <section className="sj-report-panel"><div className="sj-panel-heading"><div><span className="sj-overline">روند روزانه</span><h2>از ورود تا خرید</h2></div><span>{num(31-days)} تا ۳۰ آبان</span></div><LineChart title="نشست و خرید به تفکیک روز" labels={dayLabels.map(d=>num(d)+' آبان')} series={[{name:'نشست',values:dayLabels.map(d=>rows.filter(s=>s.day===d).length)},{name:'خرید',values:dayLabels.map(d=>rows.filter(s=>s.day===d&&s.depth===4).length)}]} height="15rem"/></section>
      <div className="sj-next-reports">{(['funnel','channels','events'] as const).map(p=><a key={p} href={target(p,filters)}><Icon name={icons[p]} size={22}/><div><b>{reportPages[p][0]}</b><small>{reportPages[p][1]}</small></div><Icon name="arrow-left" size={16}/></a>)}</div></>}
    {page==='funnel'&&<section className="sj-report-panel"><div className="sj-panel-heading"><div><span className="sj-overline">مسیر خرید</span><h2>چند نشست به مرحلهٔ بعد رسیدند؟</h2></div><Badge tone="brand">{rate(orders,visits)} تبدیل نهایی</Badge></div><ol className="sj-funnel">{stages.map((s,i)=><li key={s}><div><small>۰{num(i+1)}</small><b>{s}</b><span>{num(counts[i])} نشست</span></div><div className="sj-track"><i style={{width:(counts[i]/(visits||1)*100)+'%'}}/></div><div><small>{i===0?'نقطهٔ شروع':rate(counts[i],counts[i-1])+' عبور از مرحلهٔ قبل'}</small><a href={target('events',{...filters,stage:String(i)})}>مشاهدهٔ رویدادها ←</a></div></li>)}</ol><p className="sj-report-note">بیشترین ریزش تعدادی بین «{stages[lossIndex]}» و «{stages[lossIndex+1]}» است: {num(losses[lossIndex])} نشست.</p></section>}
    {page==='channels'&&<section className="sj-report-panel"><div className="sj-panel-heading"><div><span className="sj-overline">جذب مشتری</span><h2>عملکرد کانال‌ها</h2></div></div><DataTable caption="مقایسهٔ کانال‌های جذب" hideCaption rows={breakdown} getRowId={r=>r.id} columns={[
      {key:'id',header:'کانال',render:r=><a className="sj-data-link" href={target('events',{...filters,channel:r.id,stage:'all'})}>{channels[r.id]} ←</a>},
      {key:'visits',header:'نشست',sortable:true,render:r=>num(r.visits)},{key:'orders',header:'خرید',sortable:true,render:r=>num(r.orders)},
      {key:'conversion',header:'نرخ تبدیل',sortable:true,sortValue:r=>r.orders/r.visits,render:r=>rate(r.orders,r.visits)},{key:'revenue',header:'درآمد (تومان)',sortable:true,render:r=>num(r.revenue)}]}/><p className="sj-report-note">نرخ تبدیل، سهم نشست‌هایی است که به خرید رسیدند. نام هر کانال، رویدادهای همان کانال را باز می‌کند.</p></section>}
    {page==='events'&&<section className="sj-report-panel"><div className="sj-panel-heading"><div><span className="sj-overline">دفتر رویدادها</span><h2>تعامل‌ها به ترتیب زمان</h2></div></div>
      <div className="sj-event-tools"><Input label="جستجو" placeholder="شناسهٔ نشست یا نام رویداد" value={search} onChange={e=>{setSearch(e.target.value);setPageNo(0);}} clearable/><Select label="نوع رویداد" value={filters.stage} onChange={e=>change({stage:e.target.value})} options={[{value:'all',label:'همهٔ رویدادها'},...stages.map((s,i)=>({value:String(i),label:s}))]}/></div>
      <DataTable caption="رویدادهای ثبت‌شده در دادهٔ نمونه" hideCaption compact rows={recent.slice(current*pageSize,(current+1)*pageSize)} getRowId={r=>r.id} empty="رویدادی پیدا نشد؛ عبارت جستجو یا فیلتر را تغییر دهید." columns={[
        {key:'label',header:'رویداد'},{key:'session',header:'نشست',render:r=><bdi dir="ltr">{r.session}</bdi>},{key:'channel',header:'کانال'},{key:'time',header:'زمان',render:r=><span>{num(r.day)} آبان · <bdi>{time(r.time)}</bdi></span>}
      ]}/><div className="sj-pager"><small role="status">{num(recent.length)} رویداد {recent.length>0&&' · صفحهٔ '+num(current+1)+' از '+num(last+1)}</small><div><Button size="sm" disabled={!current} onClick={()=>setPageNo(current-1)}>قبلی</Button><Button size="sm" disabled={current>=last} onClick={()=>setPageNo(current+1)}>بعدی</Button></div></div></section>}
    <p className="sj-room-foot">این گزارش‌ها از یک مجموعه‌دادهٔ نمونه محاسبه می‌شوند. هر نشست یک بازدید از محصول دارد و ممکن است تا مرحلهٔ خرید پیش برود.</p>
  </main><SanjeFooter/></div>;
}
