import { useState, useEffect, type FormEvent } from 'react';
import { Button, Input, Textarea, Badge } from '@kashi-ui/react';
import { Icon } from '@kashi-ui/icons/react';
import type { IconName } from '@kashi-ui/icons';
import { SanjeHeader, SanjeFooter, SanjeMark } from './Shell';
import { articles, sanje } from './content';
import { Pricing } from '../Landing';
export type PageKind = 'pricing'|'blog'|'contact'|'login'|'signup'|'reset';
const title:Record<PageKind,string>={pricing:'قیمت‌ها',blog:'یادداشت‌هایی برای تصمیم‌های بهتر.',contact:'از همین‌جا گفتگو را شروع کنیم.',login:'دوباره خوش آمدید.',signup:'شروع یک نگاه روشن‌تر.',reset:'بازیابی رمز عبور'};
function DemoForm({kind}:{kind:'contact'|'login'|'signup'|'reset'}) {
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [done,setDone]=useState(false);
  const [selection,setSelection]=useState('');
  useEffect(()=>{
    const q=new URLSearchParams(location.search), names:Record<string,string>={basic:'پایه',growth:'رشد',enterprise:'سازمانی'};
    const plan=q.get('plan')||'';
    if(Object.hasOwn(names,plan)&&(kind==='signup'||kind==='contact'))setSelection('پلن '+names[plan]+(plan==='growth'?' · پرداخت '+(q.get('cycle')==='yearly'?'سالانه':'ماهانه'):''));
  },[kind]);
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); const form=e.currentTarget; const data=new FormData(form); const next:Record<string,string>={};
    const email=String(data.get('email')||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))next.email='یک ایمیل معتبر وارد کنید؛ مثلاً name@example.com';
    if((kind==='contact'||kind==='signup')&&!String(data.get('name')||'').trim())next.name='نامتان را وارد کنید.';
    if(kind==='contact'&&String(data.get('message')||'').trim().length<10)next.message='پیامتان را در دست‌کم ۱۰ نویسه بنویسید.';
    if((kind==='login'||kind==='signup')&&String(data.get('password')||'').length<8)next.password='رمز نمونه باید دست‌کم ۸ نویسه داشته باشد.';
    setErrors(next);
    if(Object.keys(next).length){requestAnimationFrame(()=>form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());return;}
    form.reset();setDone(true);
  }
  if(done)return <div className="sj-form-done" role="status" tabIndex={-1} ref={node=>node?.focus()}><span className="sj-form-icon"><Icon name="check" size={28}/></span><h2>فرم نمونه کامل شد.</h2><p>{kind==='reset'?'ایمیل بازیابی ارسال نشد.':kind==='contact'?'پیامی ارسال یا ذخیره نشد.':'حسابی ساخته نشد و ورود واقعی انجام نشد.'} این نسخه برای بررسی تجربهٔ قالب است.</p><Button href={`${sanje.base}dashboard/`} variant="primary">کاوش در پیشخوان نمونه</Button><Button variant="tertiary" onClick={()=>{setDone(false);setErrors({});}}>بازگشت به فرم</Button></div>;
  return <form onSubmit={submit} method="post" noValidate><fieldset disabled={!ready} className="sj-form sj-form-fields">
    {selection&&<p className="sj-plan-choice"><Badge tone="brand">{selection}</Badge><a href={sanje.base+"pricing/"}>تغییر پلن ←</a></p>}
    <div className="sj-form-notice"><Icon name="info" size={16}/><span>فرم نمایشی است. از اطلاعات و رمز واقعی استفاده نکنید؛ داده‌ای ارسال یا ذخیره نمی‌شود.</span></div>
    {(kind==='contact'||kind==='signup')&&<Input label="نام شما" name="name" autoComplete="off" placeholder="نام نمونه" required error={errors.name}/>}
    <Input label="ایمیل" name="email" type="email" dir="ltr" autoComplete="off" placeholder="name@example.com" required error={errors.email}/>
    {(kind==='login'||kind==='signup')&&<Input label="رمز عبور نمونه" name="password" type="password" dir="ltr" autoComplete="off" required hint="دست‌کم ۸ نویسه؛ فقط برای آزمایش فرم" error={errors.password} labelEnd={kind==='login'?<a href={`${sanje.base}reset/`}>رمز را فراموش کرده‌اید؟</a>:undefined}/>}
    {kind==='contact'&&<Textarea label="دربارهٔ چه چیزی صحبت کنیم؟" name="message" rows={5} maxLength={1000} showCount required error={errors.message} placeholder="کمی دربارهٔ محصول و نیازتان بنویسید…"/>}
    <Button type="submit" variant="primary" size="lg" block>{kind==='contact'?'آزمایش ارسال پیام':kind==='reset'?'آزمایش بازیابی رمز':kind==='signup'?'آزمایش ثبت‌نام':'آزمایش ورود'}<Icon name="arrow-left" size={18}/></Button>
    {kind==='login'&&<p className="sj-form-switch">تازه به سنجه آمده‌اید؟ <a href={`${sanje.base}signup/`}>ساخت حساب نمونه</a></p>}
    {kind==='signup'&&<p className="sj-form-switch">حساب دارید؟ <a href={`${sanje.base}login/`}>ورود به نمونه</a></p>}
    {kind==='reset'&&<a className="sj-form-switch" href={`${sanje.base}login/`}>بازگشت به ورود</a>}
  </fieldset></form>;
}
export function ArticleCards(){
 const [topic,setTopic]=useState('همه');
 const visible=articles.filter(a=>topic==='همه'||a.tag===topic);
 return <><div className="sj-topic-bar" role="group" aria-label="موضوع نوشته‌ها">{['همه',...new Set(articles.map(a=>a.tag))].map(t=><Button key={t} size="sm" aria-pressed={t===topic} variant={t===topic?'primary':'tertiary'} onClick={()=>setTopic(t)}>{t}</Button>)}</div><div className="sj-articles">{visible.map(a=><article key={a.slug}><a href={`${sanje.base}articles/${a.slug}/`}><div className={`sj-article-art sj-article-art--${articles.indexOf(a)}`}><span>{['۰۱','۰۲','۰۳'][articles.indexOf(a)]}</span><Icon name={a.icon} size={64}/><div className="sj-art-grid"/></div><div className="sj-article-meta"><Badge size="sm" tone="brand">{a.tag}</Badge><span>{a.read} مطالعه</span></div><h2>{a.title}</h2><p>{a.description}</p><span className="sj-read">خواندن نوشته <Icon name="arrow-left" size={16}/></span></a></article>)}</div></>}
export default function SanjePage({kind}:{kind:PageKind}){
  const auth=kind==='login'||kind==='signup'||kind==='reset';
  return <div className="ln sj"><SanjeHeader current={`${sanje.base}${kind}/`}/><main id="sanje-main">
    {auth?<section className="sj-auth ln-wrap"><aside className="sj-auth-story"><SanjeMark/><span className="ln-kicker">برای تصمیم‌های فردا</span><h2>هر عدد،<br/>شروع یک سؤال بهتر.</h2><p>با یک تصویر مشترک از رفتار کاربران، تیم را به تصمیم بعدی نزدیک‌تر کنید.</p><div className="sj-auth-graphic" aria-hidden="true">{[30,45,40,65,58,80,92].map((height,i)=><i key={i} style={{height:`${height}%`}}/>)}</div><small>این صفحه بخشی از قالب نمایشی سنجه است.</small></aside><div className="sj-auth-content"><Badge tone="brand" size="sm">پیش‌نمایش رابط کاربری</Badge><h1>{title[kind]}</h1><p>{kind==='reset'?'مسیر بازیابی را با یک ایمیل نمونه بررسی کنید.':'فرم را امتحان کنید و تجربهٔ قالب را ببینید.'}</p><DemoForm kind={kind}/></div></section>:
    kind==='pricing'?<><Pricing/><section className="sj-price-note ln-wrap"><Icon name="info" size={20}/><div><h2>قیمت‌های این صفحه نمونه‌اند.</h2><p>سنجه سرویس اشتراکی واقعی نیست. این صفحه، طراحی انتخاب پلن برای محصول شما را نمایش می‌دهد.</p></div><Button href="/pro/" variant="secondary">قالب در کاشی پرو</Button></section></>:
    kind==='contact'?<section className="sj-contact ln-wrap"><div className="sj-contact-copy"><span className="ln-kicker">تماس با سنجه</span><h1>{title.contact}</h1><p>یک فرم ساده برای شناخت نیازهای مشتری؛ آماده برای اتصال به سرویس ارتباطی محصول شما.</p><div className="sj-contact-topics">{[['message-circle','سؤال دربارهٔ محصول','امکانات، کاربردها و شروع کار'],['layers','نیازهای تیم شما','انتخاب پلن و راه‌اندازی'],['code','همکاری فنی','اتصال ابزارها و شخصی‌سازی']].map(([icon,t,d])=><div key={t}><Icon name={icon as IconName} size={22}/><span><b>{t}</b><small>{d}</small></span></div>)}</div></div><div className="sj-contact-form"><DemoForm kind="contact"/></div></section>:
    <section className="ln-wrap sj-blog"><div className="sj-page-heading"><span className="ln-kicker">یادداشت‌های سنجه</span><h1>{title.blog}</h1><p>از تعریف یک رویداد تا پیدا کردن قدم بعدی رشد؛ چند راهنمای کوتاه برای تیم محصول.</p></div><ArticleCards/></section>}
  </main><SanjeFooter/></div>;
}
export function SanjeArticle({slug}:{slug:string}){
 const article=articles.find(a=>a.slug===slug)!;
 return <div className="ln sj"><SanjeHeader/><main id="sanje-main" className="sj-article-page ln-wrap"><a className="sj-back" href={`${sanje.base}blog/`}><Icon name="arrow-right" size={16}/>همهٔ نوشته‌ها</a><header><Badge tone="brand">{article.tag}</Badge><h1>{article.title}</h1><p>{article.description}</p><span>تحریریهٔ قالب سنجه · {article.read} مطالعه</span></header><div className="sj-reading-layout"><aside><b>در این نوشته</b><nav aria-label="فهرست مقاله">{article.sections.map(([t],i)=><a key={t} href={`#section-${i}`}>{t}</a>)}</nav></aside><article>{article.sections.map(([t,text],i)=><section key={t} id={`section-${i}`}><h2>{t}</h2><p>{text}</p></section>)}<div className="sj-reading-next"><span className="sj-overline">نوشتهٔ بعدی</span><a href={sanje.base+"articles/"+articles[(articles.indexOf(article)+1)%articles.length].slug+"/"}>{articles[(articles.indexOf(article)+1)%articles.length].title} ←</a></div><div className="sj-reading-cta"><h2>از خواندن، به دیدن.</h2><p>نمونهٔ پیشخوان سنجه را باز کنید و بازه‌های گزارش را مقایسه کنید.</p><Button href={`${sanje.base}dashboard/`} variant="primary">دیدن پیشخوان</Button></div></article></div></main><SanjeFooter/></div>;
}
