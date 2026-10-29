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

const ARGS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

/** نقطه‌های یک عنصر (سر مسیرها و نقطه‌های کنترل) و طول تقریبی‌اش؛ برای تشخیص جای جزئیات نسبت به شکل */
function geom(el) {
  const num = (k) => Number(new RegExp(`\\b${k}="([-\\d.]+)"`).exec(el)?.[1] || 0);
  if (el.startsWith("<circle")) {
    const cx = num("cx"), cy = num("cy"), r = num("r");
    return { pts: [[cx - r, cy - r], [cx + r, cy + r]], len: 2 * Math.PI * r };
  }
  const d = /\bd="([^"]+)"/.exec(el)?.[1] || "";
  const toks = d.match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/g) || [];
  const pts = [];
  let x = 0, y = 0, sx = 0, sy = 0, len = 0, cmd = "", i = 0;
  const go = (nx, ny) => { len += Math.hypot(nx - x, ny - y); x = nx; y = ny; pts.push([x, y]); };
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    const C = cmd.toUpperCase(), rel = cmd !== C, a = toks.slice(i, i + ARGS[C]).map(Number);
    i += ARGS[C];
    if (C === "Z") { go(sx, sy); continue; }
    if (a.some(isNaN)) break;
    const ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === "M") { x = a[0] + ox; y = a[1] + oy; sx = x; sy = y; pts.push([x, y]); cmd = rel ? "l" : "L"; }
    else if (C === "H") go(a[0] + ox, y);
    else if (C === "V") go(x, a[0] + oy);
    else if (C === "A") go(a[5] + ox, a[6] + oy);
    else {
      for (let j = 0; j < a.length - 2; j += 2) pts.push([a[j] + ox, a[j + 1] + oy]);
      go(a[a.length - 2] + ox, a[a.length - 1] + oy);
    }
  }
  return { pts, len };
}

const bbox = (pts) => pts.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [Infinity, Infinity, -Infinity, -Infinity]);
const size = (els) => els.reduce((s, e) => s + geom(e).len, 0);

/** چند خط باز بدون شکل بسته: خط‌های بلند پررنگ و خط‌های کوتاه (جزئیات) کم‌رنگ؛ اگر همه هم‌اندازه‌اند، خط آخر پررنگ */
function twoToneOpen(units) {
  if (units.length < 2) return units.join("");
  const lens = units.map((u) => geom(u).len), max = Math.max(...lens);
  let main = units.filter((_, i) => lens[i] >= max * 0.6);
  if (main.length === units.length) main = [units[units.length - 1]];
  return faint(units.filter((u) => !main.includes(u)).join("")) + main.join("");
}

/** دوتُن با شکل: جزئیات داخل شکل کم‌رنگ؛ اگر جزئیاتی داخل نیست، گروه کوچک‌تر (شکل یا خط‌های بیرونی) کم‌رنگ می‌شود */
function twoToneShaped(shape, detail) {
  const boxes = shape.map((s) => bbox(geom(s).pts));
  const inside = (el) => {
    const [x0, y0, x1, y1] = bbox(geom(el).pts);
    return boxes.some((b) => x0 >= b[0] - 0.75 && y0 >= b[1] - 0.75 && x1 <= b[2] + 0.75 && y1 <= b[3] + 0.75);
  };
  const inner = detail.filter(inside), outer = detail.filter((d) => !inside(d));
  if (inner.length) return shape.join("") + outer.join("") + faint(inner.join(""));
  if (!outer.length) return shape.join("");
  return size(outer) > size(shape) ? faint(shape.join("")) + outer.join("") : shape.join("") + faint(outer.join(""));
}

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
      return twoToneShaped(shape, detail);
    case "broken":
      return shape.map((s) => s.replace(/\/>$/, ' pathLength="100" stroke-dasharray="64 8 100"/>')).join("") + D;
  }
}
