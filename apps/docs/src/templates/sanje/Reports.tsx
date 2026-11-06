import { useEffect, useState } from 'react';
import { Badge, Button, DataTable, Input, LineChart, SegmentedControl, Select, Sparkline } from '@kashi-ui/react';
import { Icon } from '@kashi-ui/icons/react';
import { SanjeMark } from './Shell';
import '../../styles/sanje-workspace.css';
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
const measures = {
  revenue: ['درآمد', 'تومان', 'credit-card'],
  orders: ['خرید موفق', 'خرید', 'shopping-bag'],
  visits: ['نشست‌ها', 'نشست', 'users'],
  conversion: ['نرخ تبدیل', 'درصد', 'target'],
} as const;
type Measure = keyof typeof measures;
const keys = Object.keys(measures) as Measure[];
function valueFor(s:ReturnType<typeof summary>, key:Measure) {
  return key==='conversion' ? (s.visits ? 100*s.orders/s.visits : 0) : s[key];
}
export default function Reports({page}:{page:Report}) {
  const [filters,setFilters]=useState<Filters>(defaults);
  const [measure,setMeasure]=useState<Measure>('revenue');
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
  const total=summary(rows);
  const daily=dayLabels.map(day=>summary(rows.filter(s=>s.day===day)));
  const previous=days===7 ? summary(sessions.filter(s=>s.day>16&&s.day<=23&&(filters.channel==='all'||s.channel===filters.channel))) : null;
  const ranked=[...breakdown].sort((a,b)=>b.revenue-a.revenue||b.orders-a.orders);
  const metrics=(key:Measure)=>daily.map(d=>valueFor(d,key));
  const fmt=(n:number,key:Measure)=>num(n)+(key==='conversion'?'٪':'');
  function comparison(key:Measure){
    if(!previous) return 'کل ماه · بدون دورهٔ مقایسه';
    const now=valueFor(total,key), then=valueFor(previous,key);
    if(!then) return 'بدون مبنای مقایسه';
    const diff=now-then;
    if(!diff) return 'بدون تغییر نسبت به هفتهٔ قبل';
    return (diff>0?'↑ ':'↓ ')+(key==='conversion'?num(Math.abs(diff))+' واحد درصد':rate(Math.abs(diff),then))+' نسبت به هفتهٔ قبل';
  }
  return <div className="ln sj sj-workbench">
    <header className="sw-bar"><a className="ln-logo" href={sanje.home}><SanjeMark/> سنجه</a><span className="sw-slash">/</span><span>فضای تحلیل</span><Badge tone="brand" size="sm">نسخهٔ نمایشی</Badge><a className="sw-exit" href={sanje.home}>معرفی سنجه <Icon name="arrow-up-left" size={15}/></a></header>
    <div className="sw-frame"><aside className="sw-sidebar"><div className="sw-store"><span><Icon name="shopping-bag" size={20}/></span><div><b>فروشگاه نمونه</b><small>فضای کاری فروش</small></div></div><small className="sw-group">تحلیل عملکرد</small>
    <nav aria-label="گزارش‌های سنجه">{pages.map(p=><a key={p} href={target(p,filters)} aria-current={p===page?'page':undefined}><Icon name={icons[p]} size={18}/>{reportPages[p][0]}</a>)}</nav>
    <div className="sw-assist"><Icon name="compass" size={22}/><b>از کجا شروع کنم؟</b><p>گزارش فروش را در چهار قدم بخوانید.</p><a href={sanje.base+'guide/'}>راهنمای سنجه ←</a></div></aside>
    <main id="sanje-main" className="sw-main">
    <div className="sw-breadcrumb">فضای کاری <span>/</span> گزارش‌ها <span>/</span> <b>{reportPages[page][0]}</b></div>
    <header className="sw-heading"><div><h1>{page==='dashboard'?'عملکرد فروشگاه':reportPages[page][0]}</h1><p>{page==='dashboard'?'روند فروش، کیفیت جذب و مسیر خرید در یک نگاه.':reportPages[page][1]}</p></div><span className="sw-dates"><Icon name="calendar" size={16}/>{num(31-days)} تا ۳۰ آبان ۱۴۰۵</span></header>
    <div className="sw-toolbar"><SegmentedControl aria-label="بازهٔ گزارش" size="sm" value={filters.days} onChange={days=>change({days})} options={[{value:'7',label:'۷ روز آخر'},{value:'30',label:'کل ماه'}]}/><Select aria-label="کانال جذب" size="sm" value={filters.channel} onChange={e=>change({channel:e.target.value as Filters['channel']})} options={[{value:'all',label:'همهٔ کانال‌ها'},...channelIds.map(c=>({value:c,label:channels[c]}))]}/></div>
    {page==='dashboard'&&<>
      <div className="sw-kpis" role="group" aria-label="انتخاب شاخص نمودار">{keys.map(key=><button type="button" key={key} aria-pressed={measure===key} onClick={()=>setMeasure(key)}><span className="sw-kpi-label"><Icon name={measures[key][2]} size={16}/>{measures[key][0]}</span><strong>{fmt(valueFor(total,key),key)} {key==='revenue'&&<small>تومان</small>}</strong><span className="sw-mini" aria-hidden="true"><Sparkline values={metrics(key)} area={false} tone={measure===key?'brand':'neutral'}/></span><small className="sw-delta">{comparison(key)}</small></button>)}</div>
      <div className="sw-grid">
      <section className="sw-panel sw-trend"><div className="sw-panel-head"><div><span className="sw-kicker">عملکرد روزانه</span><h2>روند {measures[measure][0]}</h2></div><span className="sw-legend"><i/>{measures[measure][1]}</span></div>
      <LineChart key={measure} title={'روند روزانهٔ '+measures[measure][0]} labels={dayLabels.map(d=>num(d)+' آبان')} series={[{name:measures[measure][0],values:metrics(measure)}]} format={n=>measure==='revenue'&&n>=1000000?num(n/1000000)+' میلیون':fmt(n,measure)} area height="13rem"/></section>
      <section className="sw-panel"><div className="sw-panel-head"><div><span className="sw-kicker">کانال‌های جذب</span><h2>سهم از درآمد</h2></div><Icon name="compass" size={20}/></div><ol className="sw-rank">{ranked.map(row=><li key={row.id}><div><a href={target('events',{...filters,channel:row.id,stage:'3'})}>{channels[row.id]}</a><b>{rate(row.revenue,revenue)}</b></div><div className="sw-rank-track"><i style={{width:(revenue?100*row.revenue/revenue:0)+'%'}}/></div></li>)}</ol><a className="sw-detail" href={target('channels',filters)}>مقایسهٔ کانال‌ها <Icon name="arrow-left" size={15}/></a></section>
      </div><section className="sw-insight"><span className="sw-insight-icon"><Icon name="funnel" size={22}/></span><div><span className="sw-kicker">نقطهٔ ریزش</span><h2>{num(losses[lossIndex])} نشست به مرحلهٔ «{stages[lossIndex+1]}» نرسیدند.</h2><p>بیشترین افت تعدادی بعد از «{stages[lossIndex]}» در بازهٔ انتخابی رخ داده است.</p></div><Button href={target('funnel',filters)} size="sm" variant="secondary">بررسی قیف خرید ←</Button></section></>}
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
  </main></div></div>;
}
