// بررسی بستهٔ فونت: هر فایلی که CSS به آن اشاره می‌کند وجود دارد، و مجوز و اطلاعیه‌ها همراه بسته‌اند.
import { readFileSync, existsSync, statSync } from "node:fs";
import assert from "node:assert/strict";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
assert.equal(pkg.license, "OFL-1.1", "فونت فقط با مجوز OFL منتشر می‌شود");

let count = 0;
for (const css of ["kashi.css", "static.css"]) {
  for (const [, url] of readFileSync(css, "utf8").matchAll(/url\("(.+?)"\)/g)) {
    assert.ok(existsSync(url), `${css}: ${url} پیدا نشد`);
    assert.ok(statSync(url).size > 10_000, `${css}: ${url} خالی است`);
    count++;
  }
}

const ofl = readFileSync("OFL.txt", "utf8");
for (const line of ["Vazirmatn Project Authors", "Dastkhat Project Authors", "Kashi Project Authors", "SIL OPEN FONT LICENSE Version 1.1"]) {
  assert.ok(ofl.includes(line), `OFL.txt باید «${line}» را داشته باشد`);
}
for (const f of pkg.files) assert.ok(existsSync(f), `${f} در files هست ولی وجود ندارد`);

for (const build of ["Main/Kashi/", "FaNum/KashiFaNum/", "NoEn/KashiNoEn/"]) {
  const name = build.split("/")[1];
  assert.ok(existsSync(`fonts/${build}Variable/${name}[wdth,wght].ttf`), `${name}: فونت متغیر TTF نیست`);
  for (const w of ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold", "Black"]) {
    assert.ok(existsSync(`fonts/${build}TTF/${name}-${w}.ttf`), `${name}-${w}.ttf نیست`);
    const exp = name.replace("Kashi", "KashiExpanded");
    assert.ok(existsSync(`fonts/${build}TTF/${exp}-${w}.ttf`), `${exp}-${w}.ttf نیست`);
  }
}
console.log(`font: ${count} @font-face, ۳ ساخت × (متغیر + ۹ وزن در ۲ پهنا)، مجوز OFL`);
