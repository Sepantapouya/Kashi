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

const geoms = new Map();

/**
 * هندسهٔ یک عنصر: زیرمسیرها به شکل چندخطی (منحنی‌ها و کمان‌ها نمونه‌برداری می‌شوند) و طولش؛
 * برای تشخیص این‌که جزئیات واقعاً داخل شکل‌اند یا بیرون یا از آن رد می‌شوند
 */
function geom(el) {
  if (geoms.has(el)) return geoms.get(el);
  const num = (k) => Number(new RegExp(`\\b${k}="([-\\d.]+)"`).exec(el)?.[1] || 0);
  const polys = [];
  if (el.startsWith("<circle")) {
    const cx = num("cx"), cy = num("cy"), r = num("r");
    polys.push(Array.from({ length: 25 }, (_, k) => [cx + r * Math.cos(k * Math.PI / 12), cy + r * Math.sin(k * Math.PI / 12)]));
  } else {
    const d = /\bd="([^"]+)"/.exec(el)?.[1] || "";
    const toks = d.match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/g) || [];
    let x = 0, y = 0, sx = 0, sy = 0, cx2 = 0, cy2 = 0, prev = "", cmd = "", i = 0, poly = null;
    const to = (nx, ny) => { x = nx; y = ny; poly.push([x, y]); };
    const bez = (p) => {
      for (let k = 1; k <= 8; k++) {
        const t = k / 8, u = 1 - t;
        if (p.length === 2) to(u * u * x0 + 2 * u * t * p[0][0] + t * t * p[1][0], u * u * y0 + 2 * u * t * p[0][1] + t * t * p[1][1]);
        else to(u ** 3 * x0 + 3 * u * u * t * p[0][0] + 3 * u * t * t * p[1][0] + t ** 3 * p[2][0], u ** 3 * y0 + 3 * u * u * t * p[0][1] + 3 * u * t * t * p[1][1] + t ** 3 * p[2][1]);
      }
    };
    let x0 = 0, y0 = 0;
    while (i < toks.length) {
      if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
      const C = cmd.toUpperCase(), rel = cmd !== C, a = toks.slice(i, i + ARGS[C]).map(Number);
      i += ARGS[C];
      if (C === "Z") { if (poly) to(sx, sy); prev = C; continue; }
      if (a.some(isNaN) || a.length < ARGS[C]) break;
      const ox = rel ? x : 0, oy = rel ? y : 0;
      x0 = x; y0 = y;
      if (C === "M") { x = a[0] + ox; y = a[1] + oy; sx = x; sy = y; poly = [[x, y]]; polys.push(poly); cmd = rel ? "l" : "L"; }
      else if (C === "L") to(a[0] + ox, a[1] + oy);
      else if (C === "H") to(a[0] + ox, y);
      else if (C === "V") to(x, a[0] + oy);
      else if (C === "C") { bez([[a[0] + ox, a[1] + oy], [a[2] + ox, a[3] + oy], [a[4] + ox, a[5] + oy]]); cx2 = a[2] + ox; cy2 = a[3] + oy; }
      else if (C === "S") {
        const r = /[CS]/.test(prev) ? [2 * x0 - cx2, 2 * y0 - cy2] : [x0, y0];
        bez([r, [a[0] + ox, a[1] + oy], [a[2] + ox, a[3] + oy]]); cx2 = a[0] + ox; cy2 = a[1] + oy;
      } else if (C === "Q") { bez([[a[0] + ox, a[1] + oy], [a[2] + ox, a[3] + oy]]); cx2 = a[0] + ox; cy2 = a[1] + oy; }
      else if (C === "T") {
        const r = /[QT]/.test(prev) ? [2 * x0 - cx2, 2 * y0 - cy2] : [x0, y0];
        bez([r, [a[0] + ox, a[1] + oy]]); cx2 = r[0]; cy2 = r[1];
      } else if (C === "A") {
        // کمان: تبدیل نقطهٔ ابتدا و انتها به مرکز و زاویه
        const ex = a[5] + ox, ey = a[6] + oy, fa = a[3], fs = a[4];
        let rx = Math.abs(a[0]), ry = Math.abs(a[1]);
        const phi = a[2] * Math.PI / 180, cp = Math.cos(phi), sp = Math.sin(phi);
        const dx = (x0 - ex) / 2, dy = (y0 - ey) / 2, x1 = cp * dx + sp * dy, y1 = -sp * dx + cp * dy;
        const lam = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
        if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
        const num2 = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
        const co = (fa === fs ? -1 : 1) * Math.sqrt(Math.max(0, num2 / (rx * rx * y1 * y1 + ry * ry * x1 * x1)));
        const ccx = co * rx * y1 / ry, ccy = -co * ry * x1 / rx;
        const mx = cp * ccx - sp * ccy + (x0 + ex) / 2, my = sp * ccx + cp * ccy + (y0 + ey) / 2;
        const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
        const t1 = ang(1, 0, (x1 - ccx) / rx, (y1 - ccy) / ry);
        let dt = ang((x1 - ccx) / rx, (y1 - ccy) / ry, (-x1 - ccx) / rx, (-y1 - ccy) / ry);
        if (!fs && dt > 0) dt -= 2 * Math.PI;
        if (fs && dt < 0) dt += 2 * Math.PI;
        if (!rx || !ry) to(ex, ey);
        else for (let k = 1; k <= 12; k++) {
          const t = t1 + dt * k / 12;
          to(mx + rx * Math.cos(t) * cp - ry * Math.sin(t) * sp, my + rx * Math.cos(t) * sp + ry * Math.sin(t) * cp);
        }
        x = ex; y = ey;
      }
      prev = C;
    }
  }
  let len = 0;
  for (const p of polys) for (let k = 1; k < p.length; k++) len += Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]);
  const g = { polys, len, pts: polys.flat() };
  geoms.set(el, g);
  return g;
}

const size = (els) => els.reduce((s, e) => s + geom(e).len, 0);

/** نقطه‌های هم‌فاصله روی خط‌های یک عنصر */
function samples(el) {
  const out = [];
  for (const p of geom(el).polys) {
    out.push(p[0]);
    for (let k = 1; k < p.length; k++) {
      const [ax, ay] = p[k - 1], [bx, by] = p[k], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 0.5));
      for (let j = 1; j <= n; j++) out.push([ax + (bx - ax) * j / n, ay + (by - ay) * j / n]);
    }
  }
  return out;
}

/** فاصلهٔ نقطه از لبهٔ شکل و این‌که داخل آن است (زوج-فرد روی همهٔ زیرمسیرها) */
function probe(shapeEl, [px, py]) {
  let inside = false, dist = Infinity;
  for (const p of geom(shapeEl).polys) {
    for (let k = 0, j = p.length - 1; k < p.length; j = k++) {
      const [ax, ay] = p[j], [bx, by] = p[k];
      if ((ay > py) !== (by > py) && px < ax + (bx - ax) * (py - ay) / (by - ay)) inside = !inside;
      const vx = bx - ax, vy = by - ay, l = vx * vx + vy * vy;
      const t = l ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l)) : 0;
      dist = Math.min(dist, Math.hypot(px - ax - t * vx, py - ay - t * vy));
    }
  }
  return { inside, dist };
}

/** شکل‌هایی که کامل داخل شکل دیگری‌اند */
const nestedIn = (shape) => shape.filter((s) => shape.some((t) => t !== s && samples(s).every((pt) => probe(t, pt).inside)));

/**
 * جای هر جزئیات نسبت به شکل‌ها:
 * inner کامل داخل یک شکل (یا روی لبه‌اش)، crossing بخش زیادی‌اش در عمق شکل است ولی بیرون هم می‌رود، outer بقیه
 */
function classify(shape, detail) {
  const inner = [], crossing = [], outer = [];
  for (const el of detail) {
    const pts = samples(el);
    let isInner = false, deep = 0;
    for (const s of shape) {
      const pr = pts.map((pt) => probe(s, pt));
      if (pr.every((r) => r.inside || r.dist <= 0.8) && pr.some((r) => r.inside)) isInner = true;
      deep = Math.max(deep, pr.filter((r) => r.inside && r.dist > 1).length);
    }
    if (isInner) inner.push(el);
    else if (deep >= Math.max(2, pts.length * 0.3)) crossing.push(el);
    else outer.push(el);
  }
  return { inner, crossing, outer };
}

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
  const { inner, crossing, outer: rest } = classify(shape, detail), outer = [...crossing, ...rest];
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
      // در دوتُن و حجمی نشان گوشه یکدست پررنگ می‌ماند؛ نیمه‌کم‌رنگ شدن «+» یا «×» معنایش را می‌گیرد
      + `<g mask="url(#${uid}-c)">${renderBody(cut[2], variant, { uid: `${uid}b`, sw })}</g>${renderBody(cut[3], variant === "two-tone" || variant === "bulk" ? "light" : variant, { uid: `${uid}g`, sw })}`;
  }
  if (variant === "light" || !variants.includes(variant)) return plain(body);
  const { shape, detail } = parts(body, variant === "curved");
  const S = shape.join(""), D = detail.join("");
  switch (variant) {
    case "curved":
      return S + D;
    case "bold": {
      const heavy = (els) => (els.length ? `<g stroke-width="${n(sw * 1.4)}">${els.join("").replace(/<circle\b/g, '<circle fill="currentColor"')}</g>` : "");
      if (!S) return heavy(detail);
      // فقط جزئیاتی که کامل داخل شکل‌اند سوراخ می‌شوند؛ بقیه هم‌وزن شکل پر و بی‌برش کشیده می‌شوند
      // تا جای اتصالشان به شکل شکاف سفید نیفتد. خطی که از شکل رد می‌شود (روبان کادو، خط ممنوع) با فاصله‌ای
      // دورش از شکل جدا می‌شود؛ خطی که فقط به لبهٔ شکل می‌رسد (سقف خودرو) بی‌فاصله به آن می‌چسبد
      // شکلی که کامل داخل شکل دیگری است (دایرهٔ ضبط داخل قاب) فقط دورش بریده می‌شود تا در توپر گم نشود
      const nested = nestedIn(shape);
      const top = shape.filter((s) => !nested.includes(s));
      const { inner, crossing } = classify(top, detail), outer = detail.filter((d) => !inner.includes(d));
      const holes = nested.join("") + inner.join("").replace(/<circle\b/g, '<circle fill="#000"')
        + (crossing.length ? `<g stroke-width="${n(sw * 1.4 + 1.5)}">${crossing.join("").replace(/<circle\b/g, '<circle fill="#000"')}</g>` : "");
      const fill = holes
        ? `<defs><mask id="${uid}-a" ${box}>${bg}<g stroke="#000">${holes}</g></mask></defs><g fill="currentColor" mask="url(#${uid}-a)">${S}</g>`
        : `<g fill="currentColor">${S}</g>`;
      return fill + heavy(outer);
    }
    case "bulk": {
      if (!S) return twoToneOpen(detail);
      // شکلِ داخل شکل دیگر (سپر روی ساختمان، دکمهٔ پخش) در سایهٔ کم‌رنگ گم نشود و دورش کشیده شود
      const inset = nestedIn(shape).join("");
      // خطی که از شکل رد می‌شود (خط ممنوع) دورش از سایهٔ کم‌رنگ هم بریده می‌شود تا خوانا بماند
      const { crossing } = classify(shape, detail);
      if (!crossing.length) return `<g fill="currentColor" stroke="none" opacity="0.4">${S}</g>` + (D ? D + inset : S);
      return `<defs><mask id="${uid}-a" ${box}>${bg}<g stroke="#000" stroke-width="${n(sw + 1.5)}">${crossing.join("")}</g></mask></defs>`
        + `<g fill="currentColor" stroke="none" opacity="0.4" mask="url(#${uid}-a)">${S}</g>` + D + inset;
    }
    case "two-tone":
      if (!S) return twoToneOpen(detail);
      return twoToneShaped(shape, detail);
    case "broken": {
      const cut = (el) => el.replace(/\/>$/, ' pathLength="100" stroke-dasharray="64 8 100"/>');
      if (S) return shape.map(cut).join("") + D;
      // آیکون بدون شکل بسته: بلندترین خط منحنی، اگر بلند و از بقیه آشکارا بلندتر است، شکسته می‌شود؛
      // خط صاف (ساقهٔ فلش) و حرف‌های هم‌اندازه (AB، Aa) دست نمی‌خورند چون شکستنشان خط‌چین به نظر می‌رسد
      const lens = detail.map((u) => (/stroke-width/.test(u) || !/\bd="[^"]*[CcSsQqAa]/.test(u) ? 0 : geom(u).len));
      const max = Math.max(0, ...lens), second = Math.max(0, ...detail.map((u, i) => (lens[i] === max ? 0 : geom(u).len)));
      return detail.map((u, i) => (max >= 16 && max >= second * 1.3 && lens[i] === max ? cut(u) : u)).join("");
    }
  }
}
