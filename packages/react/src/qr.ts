/**
 * سازندهٔ کد QR بدون وابستگی (استاندارد ISO/IEC 18004، حالت بایت با UTF-8، نسخهٔ ۱ تا ۴۰).
 * خروجی ماتریس مربعی است: true یعنی خانهٔ تیره.
 */

export type QrLevel = "L" | "M" | "Q" | "H";

// تعداد کدواژهٔ تصحیح خطا در هر بلوک و تعداد بلوک‌ها، برای هر سطح و نسخه (اندیس ۰ استفاده نمی‌شود)
const ECC: Record<QrLevel, number[]> = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const BLOCKS: Record<QrLevel, number[]> = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};
const FORMAT: Record<QrLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

const rawModules = (v: number) => {
  let r = (16 * v + 128) * v + 64;
  if (v >= 2) {
    const a = Math.floor(v / 7) + 2;
    r -= (25 * a - 10) * a - 55;
    if (v >= 7) r -= 36;
  }
  return r;
};
const dataCodewords = (v: number, l: QrLevel) => Math.floor(rawModules(v) / 8) - ECC[l][v] * BLOCKS[l][v];

// ضرب در میدان گالوا GF(2^8) با چندجمله‌ای 0x11D
const gmul = (x: number, y: number) => {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
};
const rsDivisor = (degree: number) => {
  const r = new Array(degree).fill(0);
  r[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = gmul(r[j], root);
      if (j + 1 < r.length) r[j] ^= r[j + 1];
    }
    root = gmul(root, 0x02);
  }
  return r;
};
const rsRemainder = (data: number[], div: number[]) => {
  const r = new Array(div.length).fill(0);
  for (const b of data) {
    const f = b ^ (r.shift() as number);
    r.push(0);
    div.forEach((c, i) => (r[i] ^= gmul(c, f)));
  }
  return r;
};

const alignment = (v: number) => {
  if (v === 1) return [];
  const n = Math.floor(v / 7) + 2;
  const step = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
  const r = [6];
  for (let p = v * 4 + 10; r.length < n; p -= step) r.splice(1, 0, p);
  return r;
};

const MASKS: ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

/** امتیاز جریمهٔ استاندارد برای انتخاب بهترین ماسک (کمتر بهتر) */
function penalty(m: boolean[][]): number {
  const n = m.length;
  let score = 0;
  const lines = (get: (a: number, b: number) => boolean) => {
    for (let a = 0; a < n; a++) {
      let run = 1;
      for (let b = 1; b <= n; b++) {
        if (b < n && get(a, b) === get(a, b - 1)) run++;
        else {
          if (run >= 5) score += run - 2;
          run = 1;
        }
      }
      // الگوی شبیه نشانگر: ۱:۱:۳:۱:۱ با چهار خانهٔ روشن کنارش
      for (let b = 0; b + 10 < n; b++) {
        const s = Array.from({ length: 11 }, (_, k) => get(a, b + k));
        const p1 = [true, false, true, true, true, false, true, false, false, false, false];
        if (s.every((v, k) => v === p1[k]) || s.every((v, k) => v === p1[10 - k])) score += 40;
      }
    }
  };
  lines((y, x) => m[y][x]);
  lines((x, y) => m[y][x]);
  let dark = 0;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (m[y][x]) dark++;
      if (x < n - 1 && y < n - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) score += 3;
    }
  const total = n * n;
  score += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
  return score;
}

/** متن را به ماتریس QR تبدیل می‌کند؛ اگر متن جا نشود null برمی‌گرداند */
export function encodeQr(text: string, level: QrLevel = "M"): boolean[][] | null {
  const bytes = Array.from(new TextEncoder().encode(text));
  let ver = 0;
  for (let v = 1; v <= 40; v++) {
    const cc = v <= 9 ? 8 : 16;
    if (4 + cc + bytes.length * 8 <= dataCodewords(v, level) * 8) {
      ver = v;
      break;
    }
  }
  if (!ver) return null;

  // رشتهٔ بیت‌ها: حالت بایت، طول، داده، پایان‌دهنده و پرکننده
  const bits: number[] = [];
  const put = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  put(0b0100, 4);
  put(bytes.length, ver <= 9 ? 8 : 16);
  for (const b of bytes) put(b, 8);
  const cap = dataCodewords(ver, level) * 8;
  put(0, Math.min(4, cap - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < cap; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));

  // بلوک‌ها، تصحیح خطا و درهم‌آمیختن
  const nb = BLOCKS[level][ver];
  const eccLen = ECC[level][ver];
  const raw = Math.floor(rawModules(ver) / 8);
  const short = nb - (raw % nb);
  const shortLen = Math.floor(raw / nb);
  const div = rsDivisor(eccLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < nb; i++) {
    const len = shortLen - eccLen + (i < short ? 0 : 1);
    const dat = data.slice(k, k + len);
    k += len;
    const ecc = rsRemainder(dat, div);
    if (i < short) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const all: number[] = [];
  for (let i = 0; i < blocks[0].length; i++)
    for (let j = 0; j < nb; j++) if (i !== shortLen - eccLen || j >= short) all.push(blocks[j][i]);

  // الگوهای ثابت
  const size = ver * 4 + 17;
  const m: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const fn: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => {
    m[y][x] = dark;
    fn[y][x] = true;
  };
  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]])
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const d = Math.max(Math.abs(dx), Math.abs(dy));
          set(x, y, d !== 2 && d !== 4);
        }
      }
  const al = alignment(ver);
  al.forEach((ax, i) =>
    al.forEach((ay, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }),
  );
  const drawFormat = (mask: number) => {
    const d = (FORMAT[level] << 3) | mask;
    let r = d;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((d << 10) | r) ^ 0x5412;
    const bit = (i: number) => ((b >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6));
    set(8, 8, bit(7));
    set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  drawFormat(0);
  if (ver >= 7) {
    let r = ver;
    for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
    const b = (ver << 12) | r;
    for (let i = 0; i < 18; i++) {
      const dark = ((b >>> i) & 1) === 1;
      const a = size - 11 + (i % 3), c = Math.floor(i / 3);
      set(a, c, dark);
      set(c, a, dark);
    }
  }

  // چیدن کدواژه‌ها به شکل زیگزاگ
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++)
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const up = ((right + 1) & 2) === 0;
        const y = up ? size - 1 - vert : vert;
        if (!fn[y][x] && i < all.length * 8) {
          m[y][x] = ((all[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
          i++;
        }
      }
  }

  // بهترین ماسک
  const apply = (k: number) => {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && MASKS[k](x, y)) m[y][x] = !m[y][x];
  };
  let best = 0, bestScore = Infinity;
  for (let k = 0; k < 8; k++) {
    apply(k);
    drawFormat(k);
    const s = penalty(m);
    if (s < bestScore) [best, bestScore] = [k, s];
    apply(k);
  }
  apply(best);
  drawFormat(best);
  return m;
}
