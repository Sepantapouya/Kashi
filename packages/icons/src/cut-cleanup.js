// پاک‌سازی آیکون‌های نشان‌دار (<g data-cut="cx cy r">پایه</g>نشان).
// دایرهٔ زیر نشان از پایه بریده می‌شود؛ اگر یک خط پایه تقریباً کامل زیر این دایره برود،
// تکهٔ کوتاهی که بیرون می‌ماند کنار نشان مثل خرده‌خط بی‌معنا دیده می‌شود.
// این‌جا هر زیرمسیر پایه که بخشی از آن بریده شده و کمتر از MIN_VISIBLE واحد از آن پیدا می‌ماند حذف می‌شود.
// خط‌های بلندی که فقط سرشان بریده می‌شود (قاب، دایرهٔ کره و …) دست‌نخورده می‌مانند.

const MIN_VISIBLE = 1.6;
const NUMBER = /[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g;
const TOKEN = /[a-zA-Z]|[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g;
const r3 = (v) => +v.toFixed(3);

/** مسیر را به زیرمسیرهای مطلق می‌شکند؛ هر زیرمسیر: { d, points } (points نمونه‌برداری‌شده برای اندازه‌گیری) */
function subpaths(d) {
  const toks = d.match(TOKEN) || [];
  const out = [];
  let i = 0, cmd = "", x = 0, y = 0, sx = 0, sy = 0, cx = 0, cy = 0, qx = 0, qy = 0, cur = null;
  const num = () => Number(toks[i++]);
  const hasNum = () => i < toks.length && !/[a-zA-Z]/.test(toks[i]);
  const emit = (s) => { cur.d += s; };
  const pt = (px, py) => cur.points.push([px, py]);
  const cubic = (x0, y0, x1, y1, x2, y2, x3, y3) => {
    for (let t = 0.0625; t <= 1.0001; t += 0.0625) {
      const u = 1 - t;
      pt(u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3);
    }
  };
  const arcPoints = (x1, y1, rx, ry, phi, fa, fs, x2, y2) => {
    rx = Math.abs(rx); ry = Math.abs(ry);
    if (!rx || !ry) { pt(x2, y2); return; }
    const p = (phi * Math.PI) / 180, c = Math.cos(p), s = Math.sin(p);
    const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2, x1p = c * dx + s * dy, y1p = -s * dx + c * dy;
    const l = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (l > 1) { rx *= Math.sqrt(l); ry *= Math.sqrt(l); }
    const n = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
    let co = Math.sqrt(Math.max(0, n / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)));
    if (fa === fs) co = -co;
    const cxp = (co * rx * y1p) / ry, cyp = (-co * ry * x1p) / rx;
    const ccx = c * cxp - s * cyp + (x1 + x2) / 2, ccy = s * cxp + c * cyp + (y1 + y2) / 2;
    const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!fs && dt > 0) dt -= 2 * Math.PI;
    if (fs && dt < 0) dt += 2 * Math.PI;
    for (let k = 1; k <= 24; k++) {
      const t = t1 + (dt * k) / 24;
      pt(ccx + rx * Math.cos(t) * c - ry * Math.sin(t) * s, ccy + rx * Math.cos(t) * s + ry * Math.sin(t) * c);
    }
  };
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    else if (!cmd) return null;
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === "Z") {
      if (cur) { emit("Z"); pt(sx, sy); }
      x = sx; y = sy; cx = x; cy = y; qx = x; qy = y;
      continue;
    }
    if (!hasNum()) return null;
    if (C === "M") {
      x = ox + num(); y = oy + num(); sx = x; sy = y;
      cur = { d: `M${r3(x)} ${r3(y)}`, points: [[x, y]] }; out.push(cur);
      cmd = rel ? "l" : "L"; cx = x; cy = y; qx = x; qy = y;
      continue;
    }
    if (!cur) return null;
    if (C === "L") { x = ox + num(); y = oy + num(); emit(`L${r3(x)} ${r3(y)}`); pt(x, y); cx = x; cy = y; qx = x; qy = y; }
    else if (C === "H") { x = ox + num(); emit(`H${r3(x)}`); pt(x, y); cx = x; cy = y; qx = x; qy = y; }
    else if (C === "V") { y = oy + num(); emit(`V${r3(y)}`); pt(x, y); cx = x; cy = y; qx = x; qy = y; }
    else if (C === "C") {
      const a = [ox + num(), oy + num(), ox + num(), oy + num(), ox + num(), oy + num()];
      cubic(x, y, ...a); emit(`C${a.map(r3).join(" ")}`);
      cx = a[2]; cy = a[3]; x = a[4]; y = a[5]; qx = x; qy = y;
    } else if (C === "S") {
      const a = [ox + num(), oy + num(), ox + num(), oy + num()];
      const x1 = 2 * x - cx, y1 = 2 * y - cy;
      cubic(x, y, x1, y1, ...a); emit(`C${[x1, y1, ...a].map(r3).join(" ")}`);
      cx = a[0]; cy = a[1]; x = a[2]; y = a[3]; qx = x; qy = y;
    } else if (C === "Q") {
      const a = [ox + num(), oy + num(), ox + num(), oy + num()];
      cubic(x, y, x + (2 / 3) * (a[0] - x), y + (2 / 3) * (a[1] - y), a[2] + (2 / 3) * (a[0] - a[2]), a[3] + (2 / 3) * (a[1] - a[3]), a[2], a[3]);
      emit(`Q${a.map(r3).join(" ")}`);
      qx = a[0]; qy = a[1]; x = a[2]; y = a[3]; cx = x; cy = y;
    } else if (C === "T") {
      const x1 = 2 * x - qx, y1 = 2 * y - qy, ex = ox + num(), ey = oy + num();
      cubic(x, y, x + (2 / 3) * (x1 - x), y + (2 / 3) * (y1 - y), ex + (2 / 3) * (x1 - ex), ey + (2 / 3) * (y1 - ey), ex, ey);
      emit(`Q${[x1, y1, ex, ey].map(r3).join(" ")}`);
      qx = x1; qy = y1; x = ex; y = ey; cx = x; cy = y;
    } else if (C === "A") {
      const rx = num(), ry = num(), phi = num(), fa = num(), fs = num(), ex = ox + num(), ey = oy + num();
      arcPoints(x, y, rx, ry, phi, fa, fs, ex, ey);
      emit(`A${r3(rx)} ${r3(ry)} ${r3(phi)} ${fa} ${fs} ${r3(ex)} ${r3(ey)}`);
      x = ex; y = ey; cx = x; cy = y; qx = x; qy = y;
    } else return null;
  }
  return out;
}

/** طول پیدا (بیرون دایره) و پنهان (زیر دایره) یک چندخطی */
function visibility(points, ox, oy, r) {
  let visible = 0, hidden = 0;
  for (let k = 1; k < points.length; k++) {
    const [x0, y0] = points[k - 1], [x1, y1] = points[k];
    const len = Math.hypot(x1 - x0, y1 - y0), steps = Math.max(1, Math.ceil(len / 0.05));
    for (let j = 0; j < steps; j++) {
      const t = (j + 0.5) / steps;
      if (Math.hypot(x0 + (x1 - x0) * t - ox, y0 + (y1 - y0) * t - oy) > r) visible += len / steps;
      else hidden += len / steps;
    }
  }
  // نقطه‌ها (مسیر با طول تقریباً صفر) هم باید زیر دایره پنهان حساب شوند
  if (points.length && visible + hidden < 0.05) {
    if (Math.hypot(points[0][0] - ox, points[0][1] - oy) <= r) hidden = 1; else visible = 1;
  }
  return { visible, hidden };
}

const MIN_ISLAND = 1.2;

/**
 * تکه‌های پیدای یک زیرمسیر باز بیرون دایره، با نقطه‌های برخورد دقیق روی لبهٔ دایره.
 * خروجی: آرایه‌ای از چندخطی‌ها با طولشان
 */
function visibleRuns(points, ox, oy, r) {
  const out = (p) => Math.hypot(p[0] - ox, p[1] - oy) > r;
  // پارامترهای t برخورد پاره‌خط ab با دایره (حل معادلهٔ درجهٔ دو)؛ حتی وقتی هر دو سر بیرون‌اند
  const crossings = (a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], fx = a[0] - ox, fy = a[1] - oy;
    const A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - r * r;
    const disc = B * B - 4 * A * C;
    if (!A || disc <= 0) return [];
    const s = Math.sqrt(disc);
    return [(-B - s) / (2 * A), (-B + s) / (2 * A)].filter((t) => t > 0 && t < 1);
  };
  const runs = [];
  let cur = out(points[0]) ? [points[0]] : null;
  for (let k = 1; k < points.length; k++) {
    const a = points[k - 1], b = points[k];
    for (const t of crossings(a, b)) {
      const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      if (cur) { cur.push(p); runs.push(cur); cur = null; } else cur = [p];
    }
    if (cur) cur.push(b);
  }
  if (cur) runs.push(cur);
  return runs.map((pts) => ({ pts, len: pts.slice(1).reduce((s, p, k) => s + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0) }));
}

/** زیرمسیرهای تقریباً پنهان پایه را از یک آیکون نشان‌دار حذف می‌کند؛ بقیهٔ بدنه بی‌تغییر می‌ماند */
export function trimCutBody(body) {
  const m = /^<g data-cut="([^"]+)">([\s\S]*)<\/g>((?:(?!<\/g>)[\s\S])*)$/.exec(body);
  if (!m) return body;
  const [ox, oy, r] = m[1].match(NUMBER).map(Number);
  let changed = false;
  const subject = m[2].replace(/<path\b([^>]*?)\/>/g, (el, attrs) => {
    // قاب‌های data-sq و مسیرهای دارای نشانهٔ سبک را دست نمی‌زنیم
    if (/data-(?:sq|outline)/.test(attrs)) return el;
    const d = /\bd="([^"]+)"/.exec(attrs)?.[1];
    if (!d) return el;
    const parts = subpaths(d);
    if (!parts) return el;
    let edited = false;
    const kept = [];
    for (const part of parts) {
      const { visible, hidden } = visibility(part.points, ox, oy, r);
      // ۱) زیرمسیری که تقریباً کامل زیر نشان رفته، کامل حذف می‌شود
      if (hidden > 0.05 && visible < MIN_VISIBLE) { edited = true; continue; }
      // ۲) در خط باز، تکهٔ کوتاهی که دایره از بقیهٔ خط جدا کرده حذف می‌شود و تکه‌های بلند می‌مانند.
      // شکل بسته دست نمی‌خورد تا در سبک توپر همچنان پر شود.
      if (hidden > 0.05 && !/Z$/i.test(part.d)) {
        const runs = visibleRuns(part.points, ox, oy, r);
        const long = runs.filter((run) => run.len >= MIN_ISLAND);
        if (long.length < runs.length) {
          edited = true;
          for (const run of long) kept.push({ d: "M" + run.pts.map(([x, y]) => `${r3(x)} ${r3(y)}`).join("L") });
          continue;
        }
      }
      kept.push(part);
    }
    if (!edited) return el;
    changed = true;
    if (!kept.length) return "";
    return `<path${attrs.replace(/\bd="[^"]+"/, `d="${kept.map((p) => p.d).join("")}"`)}/>`;
  });
  return changed ? `<g data-cut="${m[1]}">${subject}</g>${m[3]}` : body;
}
