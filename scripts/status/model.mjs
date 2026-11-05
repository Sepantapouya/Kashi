export const services = [
  { id: 'site', name: 'سایت و مستندات', description: 'بازشدن صفحهٔ اصلی و راهنمای نصب', icon: 'globe' },
  { id: 'npm', name: 'پکیج‌های npm', description: 'دریافت نسخهٔ latest و فایل هر پکیج', icon: 'package' },
  { id: 'figma', name: 'دانلود پلاگین فیگما', description: 'دریافت فایل ZIP کیت طراحی', icon: 'pen-tool' },
];
export const fresh = (sample, now = Date.now()) => !!sample && now - Date.parse(sample.at) < 2 * 60 * 60 * 1000 && Date.parse(sample.at) <= now + 60000;
export function validFeed(feed) {
  return feed?.version === 1 && Array.isArray(feed.samples) && feed.samples.length <= 5000 && feed.samples.every(s => Number.isFinite(Date.parse(s.at)) && services.every(({id}) => ['up','down'].includes(s.checks?.[id]?.state) && Number.isFinite(s.checks[id].ms)));
}
export function daily(samples, id, days, now = Date.now()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'});
  const key = t => formatter.format(new Date(t));
  const groups = new Map();
  for (const sample of samples) {
    const date = key(sample.at), group = groups.get(date) || {total:0,ok:0};
    group.total++; if(sample.checks[id].state==='up') group.ok++;
    groups.set(date,group);
  }
  return Array.from({length:days},(_,i)=> {
    const date=key(now-(days-1-i)*86400000), {total,ok}=groups.get(date)||{total:0,ok:0};
    return {date,total,ok,state:!total?'unknown':ok===total?'up':ok===0?'down':'partial'};
  });
}
