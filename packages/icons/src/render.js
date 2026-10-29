// ساخت شش سبک آیکون از روی همان طرح خطی.
// هر آیکون به «شکل» (مسیرهای بسته، قاب‌ها و دایره‌های بزرگ) و «جزئیات» (بقیهٔ خط‌ها) تقسیم می‌شود
// و هر سبک این دو را جور دیگری می‌کشد؛ پس آیکون تازه فقط یک بار، به شکل خطی، کشیده می‌شود.

/** سبک‌ها به ترتیب نمایش؛ light همان طرح اصلی است */
export const variants = ["light", "bold", "bulk", "two-tone", "broken", "curved"];

const n = (v) => +v.toFixed(2);

/** مستطیل با گوشهٔ پیوسته؛ در سبک curved گردی بزرگ‌تر و نرم‌تر است */
export function sqPath(x, y, w, h, r, curved = false) {
  if (curved) r = Math.min(r * 1.7, w / 2, h / 2);
  const k = r * (curved ? 0.12 : 0.2), X = n(x + w), Y = n(y + h);
  return `M${n(x + r)} ${y}H${n(X - r)}C${n(X - k)} ${y} ${X} ${n(y + k)} ${X} ${n(y + r)}V${n(Y - r)}C${X} ${n(Y - k)} ${n(X - k)} ${Y} ${n(X - r)} ${Y}H${n(x + r)}C${n(x + k)} ${Y} ${x} ${n(Y - k)} ${x} ${n(Y - r)}V${n(y + r)}C${x} ${n(y + k)} ${n(x + k)} ${y} ${n(x + r)} ${y}Z`;
}

/** بدنهٔ خطی بدون نشانهٔ data-sq، برای خروجی‌هایی که سبک ندارند */
export const plain = (body) => body.replace(/ data-sq="[^"]*"/g, "");

/** بدنه را به واحدهای «شکل» و «جزئیات» می‌شکند */
function parts(body, curved) {
  const shape = [], detail = [];
  for (const [el, tag, attrs] of body.matchAll(/<(circle|path)\b([^>]*?)\/>/g)) {
    if (tag === "circle") {
      const r = Number(/\br="([\d.]+)"/.exec(attrs)?.[1] || 0);
      (r >= 2.5 ? shape : detail).push(el);
      continue;
    }
    const sq = /data-sq="([^"]+)"/.exec(attrs);
    if (sq) {
      shape.push(`<path d="${sqPath(...sq[1].split(" ").map(Number), curved)}"/>`);
      continue;
    }
    const d = /\bd="([^"]+)"/.exec(attrs)[1];
    const rest = attrs.replace(/\s*\bd="[^"]+"/, "").trim();
    // خط‌هایی با ضخامت خودشان (نقطه‌ها) دست‌نخورده می‌مانند
    if (rest) { detail.push(el); continue; }
    const segs = d.split(/(?=[Mm])/).filter(Boolean);
    // m کوچک وسط مسیر به نقطهٔ قبلی وابسته است؛ چنین مسیری یکجا می‌ماند
    const units = segs.slice(1).some((s) => s[0] === "m") ? [d] : segs;
    for (const u of units) (/[Zz]\s*$/.test(u) ? shape : detail).push(`<path d="${u.trim()}"/>`);
  }
  return { shape, detail };
}

const box = 'maskUnits="userSpaceOnUse" x="-2" y="-2" width="24" height="24"';
const bg = '<rect x="-2" y="-2" width="24" height="24" fill="#fff"/>';

const faint = (s) => (s ? `<g opacity="0.4">${s}</g>` : "");

/** چند خط باز بدون شکل بسته (فلش، ضربدر، منو): خط آخر پررنگ و بقیه کم‌رنگ */
const twoToneOpen = (units) => (units.length < 2 ? units.join("") : faint(units.slice(0, -1).join("")) + units[units.length - 1]);

/**
 * بدنهٔ SVG یک سبک.
 * uid برای شناسهٔ ماسک‌های سبک bold است و باید در صفحه یکتا باشد؛ sw ضخامت خط است.
 */
export function renderBody(body, variant = "light", { uid = "k", sw = 1.5 } = {}) {
  // جابه‌جایی کل آیکون برای هم‌مرکز شدن؛ همهٔ سبک‌ها با هم جابه‌جا می‌شوند
  const shift = /^<g data-shift="([^"]+)">([\s\S]*)<\/g>$/.exec(body);
  if (shift) {
    const [dx, dy] = shift[1].split(" ");
    return `<g transform="translate(${dx} ${dy})">${renderBody(shift[2], variant, { uid, sw })}</g>`;
  }
  // آیکون ترکیبی: پایه داخل <g data-cut> و نشان گوشه بعد از آن؛ زیر نشان از پایه بریده می‌شود
  const cut = /^<g data-cut="([^"]+)">([\s\S]*)<\/g>([^<]*(?:<(?!\/g>)[^<]*)*)$/.exec(body);
  if (cut) {
    const [cx, cy, r] = cut[1].split(" ");
    return `<defs><mask id="${uid}-c" ${box}>${bg}<circle cx="${cx}" cy="${cy}" r="${r}" fill="#000" stroke="none"/></mask></defs>`
      + `<g mask="url(#${uid}-c)">${renderBody(cut[2], variant, { uid: `${uid}b`, sw })}</g>${renderBody(cut[3], variant, { uid: `${uid}g`, sw })}`;
  }
  if (variant === "light" || !variants.includes(variant)) return plain(body);
  const { shape, detail } = parts(body, variant === "curved");
  const S = shape.join(""), D = detail.join("");
  switch (variant) {
    case "curved":
      return S + D;
    case "bold": {
      if (!S) return `<g stroke-width="${n(sw * 1.4)}">${D}</g>`;
      if (!D) return `<g fill="currentColor">${S}</g>`;
      // جزئیات داخل شکل پر سوراخ می‌شوند و بیرون آن عادی کشیده می‌شوند
      const holes = D.replace(/<circle\b/g, '<circle fill="#000"');
      return `<defs><mask id="${uid}-a" ${box}>${bg}<g stroke="#000">${holes}</g></mask><mask id="${uid}-b" ${box}>${bg}<g fill="#000" stroke="#000">${S}</g></mask></defs>`
        + `<g fill="currentColor" mask="url(#${uid}-a)">${S}</g><g mask="url(#${uid}-b)">${D}</g>`;
    }
    case "bulk":
      if (!S) return twoToneOpen(detail);
      return `<g fill="currentColor" stroke="none" opacity="0.4">${S}</g>` + (D || S);
    case "two-tone":
      if (!S) return twoToneOpen(detail);
      return S + faint(D);
    case "broken":
      return shape.map((s) => s.replace(/\/>$/, ' pathLength="100" stroke-dasharray="64 8 100"/>')).join("") + D;
  }
}
