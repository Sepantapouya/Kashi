import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyTransform } from "../src/index.mjs";

const run = (code, file = "App.tsx") => applyTransform("toaster-position", code, file);

test("toaster-position: top و bottom به placement تبدیل می‌شوند", () => {
  const src = `import { Toaster } from "@kashi-ui/react";\nexport const A = () => <><Toaster position="top" max={3} /><Toaster position={"bottom"} /></>;\n`;
  const { code, changes } = run(src);
  assert.equal(changes, 2);
  assert.match(code, /<Toaster placement="top-end" max=\{3\} \/>/);
  assert.match(code, /<Toaster placement="bottom-end" \/>/);
});

test("toaster-position: بقیهٔ فایل (فاصله، کامنت، قالب) دست نمی‌خورد", () => {
  const src = `// comment\nimport {Toaster} from '@kashi-ui/react'\n\nfunction App(){\n    return (\n        <Toaster\n            position="top"   // جای اعلان‌ها\n            label="x"\n        />\n    )\n}\n`;
  const { code } = run(src, "App.jsx");
  assert.equal(code, src.replace('position="top"', 'placement="top-end"'));
});

test("toaster-position: نام مستعار و مسیر shadcn", () => {
  const src = `import { Toaster as Notifications } from "@/components/kashi/Toast";\n<Notifications position="top" />;\n`;
  assert.match(run(src).code, /<Notifications placement="top-end" \/>/);
});

test("toaster-position: Toaster کتابخانه‌های دیگر دست نمی‌خورد", () => {
  const src = `import { Toaster } from "sonner";\nimport { Button } from "@kashi-ui/react";\n<Toaster position="top-center" />;\n`;
  assert.equal(run(src).changes, 0);
});

test("toaster-position: اگر placement هست، position فقط حذف می‌شود", () => {
  const src = `import { Toaster } from "@kashi-ui/react";\n<Toaster placement="top-start" position="bottom" />;\n`;
  assert.match(run(src).code, /<Toaster placement="top-start" \/>/);
});

test("toaster-position: مقدار پویا با همان نگاشت کامپوننت", () => {
  const src = `import { Toaster } from "@kashi-ui/react";\n<Toaster position={isMobile ? "bottom" : "top"} />;\n`;
  assert.match(run(src).code, /placement=\{\(isMobile \? "bottom" : "top"\) === "top" \? "top-end" : "bottom-end"\}/);
});

test("toaster-position: مقدار ناشناخته هشدار می‌دهد و تغییر نمی‌کند", () => {
  const src = `import { Toaster } from "@kashi-ui/react";\n<Toaster position="middle" />;\n`;
  const r = run(src);
  assert.equal(r.changes, 0);
  assert.equal(r.warnings.length, 1);
  assert.equal(r.warnings[0].line, 2);
});

test("CLI: --dry چیزی نمی‌نویسد و بدون آن فایل عوض می‌شود", () => {
  const dir = mkdtempSync(join(tmpdir(), "kashi-codemod-"));
  try {
    const file = join(dir, "App.tsx");
    const src = `import { Toaster } from "@kashi-ui/react";\nexport default () => <Toaster position="top" />;\n`;
    writeFileSync(file, src);
    const cli = fileURLToPath(new URL("../src/cli.mjs", import.meta.url));
    const out = execFileSync(process.execPath, [cli, "v3", dir, "--dry"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    assert.equal(readFileSync(file, "utf8"), src);
    execFileSync(process.execPath, [cli, "v3", dir], { stdio: "ignore" });
    assert.match(readFileSync(file, "utf8"), /placement="top-end"/);
    assert.equal(typeof out, "string");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
