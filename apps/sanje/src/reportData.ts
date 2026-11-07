// یک ماه دادهٔ ساختگی و ثابت. هر نشست فقط یک بار از هر مرحله عبور می‌کند.
export const stages = ['بازدید محصول', 'افزودن به سبد', 'شروع پرداخت', 'خرید موفق'] as const;
export const channels = { search: 'جستجو', direct: 'ورود مستقیم', social: 'شبکه‌های اجتماعی', email: 'ایمیل' } as const;
export type Channel = keyof typeof channels;
export const channelIds = Object.keys(channels) as Channel[];
const fa = new Intl.NumberFormat('fa-IR', {maximumFractionDigits:1});
export const num = (n:number) => fa.format(n);
export const rate = (n:number,total:number) => total ? num(100*n/total)+'٪' : '—';

function sampleSessions() {
  let seed = 41;
  const draw = () => { seed = (Math.imul(1664525, seed)+1013904223)>>>0; return seed/4294967296; };
  return Array.from({length:30},(_,i)=>Array.from({length:12+Math.floor(draw()*18)},(_,j)=>{
    const channel = channelIds[Math.floor(draw()*4)];
    const depth = draw()<0.46 ? 1 : draw()<0.35 ? 2 : draw()<(channel==='email'?0.18:0.38) ? 3 : 4;
    const amount = depth===4 ? 50000*(2+Math.floor(draw()*14)) : 0;
    return { id:`SJ-${String(i+1).padStart(2,'0')}${String(j+1).padStart(2,'0')}`,day:i+1,channel,depth,amount,minute:480+j*23 };
  })).flat();
}
export const sessions = sampleSessions();
export type Session = typeof sessions[number];
export function summary(rows:Session[]) {
  const purchases = rows.filter(s=>s.depth===4);
  return { visits:rows.length, orders:purchases.length, revenue:purchases.reduce((t,s)=>t+s.amount,0),
    counts:stages.map((_,index)=>rows.filter(s=>s.depth>index).length) };
}
