// آیکون‌های نشان‌دار نباید کنار نشان، خرده‌خطی از پایه داشته باشند (src/cut-cleanup.js)
import { test } from "node:test";
import assert from "node:assert/strict";
import { icons } from "../src/icons.js";
import { trimCutBody } from "../src/cut-cleanup.js";

const cut = (body) => `<g data-cut="15 15 4.55">${body}</g><path d="M15 14.5v3.2m0-5.8v.02"/>`;

test("a base stroke almost fully under the badge is dropped", () => {
  // «/» شمارنده تقریباً کامل زیر نشان می‌رود؛ خط‌های بالایی دست نمی‌خورند
  const out = trimCutBody(cut('<path d="M5.6 7.7h8.8m-8.8 2.7h4.45m.75 3.1 1.1-1.6m1.2 1.6h1.4" stroke-width="1.3"/>'));
  assert.equal(out, cut('<path d="M5.6 7.7H14.4M5.6 10.4H10.05" stroke-width="1.3"/>'));
});

test("a short island cut off from a long open stroke is dropped, the long part stays", () => {
  const out = trimCutBody(`<g data-cut="15 15 4.6"><path d="M2.75 10.1 10 13.95l7.25-3.85"/></g><path d="M15 12.5v5"/>`);
  const d = /<g data-cut="15 15 4.6"><path d="([^"]+)"/.exec(out)[1];
  assert.match(d, /^M2\.75 10\.1L10 13\.95L10\.6\d* 13\.6\d*$/);
});

test("strokes the cut only shortens, closed shapes and frames are left exactly as written", () => {
  const frame = '<path data-sq="2.75 3.95 14.5 12.1 2.35" d="M5.1 3.95H14.9C16.78 3.95 17.25 4.42 17.25 6.3V13.7C17.25 15.58 16.78 16.05 14.9 16.05H5.1C3.22 16.05 2.75 15.58 2.75 13.7V6.3C2.75 4.42 3.22 3.95 5.1 3.95Z"/>';
  const ring = '<circle cx="9.5" cy="10.5" r="6.75"/>';
  const long = '<path d="M3 15h12"/>';
  for (const body of [frame, ring, long, '<path d="M8 8h8l2 6H6Z"/>']) assert.equal(trimCutBody(cut(body)), cut(body));
});

test("the published catalog is already clean: trimming again changes nothing", () => {
  let checked = 0;
  for (const [name, icon] of Object.entries(icons)) {
    if (!icon.body.startsWith("<g data-cut=")) continue;
    assert.equal(trimCutBody(icon.body), icon.body, name);
    checked++;
  }
  assert.ok(checked > 1000, `checked ${checked}`);
});

test("input-character-limit-info keeps only its text lines next to the info badge", () => {
  assert.doesNotMatch(icons["input-character-limit-info"].body, /1\.1-1\.6|h1\.4/);
});
