import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup as render } from "react-dom/server";
import { getMessages } from "@kashi-ui/persian";
import * as K from "../dist/index.js";

const fa = getMessages("fa");
const resolve = (m) => (typeof m === "function" ? m(fa, String) : m);

test("Drawer: dialog with side, size, title and close button", () => {
  const html = render(h(K.Drawer, { open: false, onOpenChange() {}, title: "فیلترها", side: "start", size: "lg", footer: h("button", null, "اعمال") }, "محتوا"));
  assert.match(html, /<dialog[^>]+class="k-dialog k-drawer k-dialog--start k-drawer--lg"/);
  assert.match(html, /aria-labelledby="[^"]+-title"/);
  assert.match(html, /aria-label="بستن"/);
  assert.match(html, /k-drawer__footer/);
});

test("BottomSheet: snap points set the height and the handle is a button", () => {
  const html = render(h(K.BottomSheet, { open: false, onOpenChange() {}, title: "مرتب‌سازی", snapPoints: [0.4, 0.9] }, "x"));
  assert.match(html, /k-dialog--bottom k-sheet k-sheet--snap/);
  assert.match(html, /--k-sheet-height:40dvh/);
  assert.match(html, /<button type="button" class="k-sheet__handle" aria-label="باز کردن کامل برگه" aria-expanded="false"/);
  const plain = render(h(K.BottomSheet, { open: false, onOpenChange() {}, title: "T", hideTitle: true }, "x"));
  assert.match(plain, /<span class="k-sheet__handle" aria-hidden="true">/);
  assert.match(plain, /k-sr-only/);
});

test("Navbar: links, current page, menu button and drawer", () => {
  const html = render(h(K.Navbar, { brand: "کاشی", links: [{ href: "/", label: "خانه", current: true }, { href: "/docs", label: "مستندات", badge: "جدید" }], actions: h("a", { href: "/in" }, "ورود") }));
  assert.match(html, /<header class="k-navbar k-navbar--sticky k-navbar--collapse-md"/);
  assert.match(html, /<nav class="k-navbar__nav" aria-label="ناوبری اصلی">/);
  assert.match(html, /class="k-navbar__link" aria-current="page"/);
  assert.match(html, /aria-label="باز کردن منو" aria-haspopup="dialog" aria-expanded="false"/);
  assert.match(html, /k-navbar__badge">جدید/);
  assert.doesNotMatch(render(h(K.Navbar, { brand: "B" })), /k-navbar__menu/);
  const v = render(h(K.Navbar, { brand: "B", variant: "pill", centered: true, floating: true, transparent: true, sticky: false, links: [{ href: "/", label: "A" }] }));
  assert.match(v, /class="k-navbar k-navbar--pill k-navbar--centered k-navbar--floating k-navbar--transparent k-navbar--collapse-md"/);
});

test("EmptyState: presets fill text and icon; props override", () => {
  const html = render(h(K.EmptyState, { preset: "noResults", size: "sm", bordered: true }));
  assert.match(html, /class="k-empty k-empty--sm k-empty--bordered" data-preset="noResults"/);
  assert.match(html, /نتیجه‌ای پیدا نشد/);
  assert.match(html, /<svg/);
  assert.match(render(h(K.EmptyState, { preset: "error", title: "سفارش‌ها نیامد" })), /role="status".*سفارش‌ها نیامد/);
  assert.match(render(h(K.EmptyState, { title: "خالی" })), /^<div class="k-empty">/);
});

test("DataTable virtual: renders a window of rows with spacers and row counts", () => {
  const rows = Array.from({ length: 5000 }, (_, i) => ({ id: String(i), name: `ردیف ${i}` }));
  const html = render(h(K.DataTable, { caption: "c", rows, getRowId: (r) => r.id, columns: [{ key: "name", header: "نام" }], virtual: { rowHeight: 40 } }));
  const count = (html.match(/data-row=""/g) ?? []).length;
  assert.ok(count > 5 && count < 60, `rendered ${count} rows`);
  assert.match(html, /aria-rowcount="5001"/);
  assert.match(html, /k-table__spacer/);
  assert.match(html, /aria-rowindex="2"/);
  assert.match(html, /max-block-size:28rem/);
});

test("rules: Persian validators, empty values and messages", () => {
  const { rules } = K;
  assert.equal(resolve(rules.required()("")), fa.form.required);
  assert.equal(resolve(rules.required()("  ")), fa.form.required);
  assert.equal(rules.required()("x"), null);
  assert.equal(rules.nationalId()(""), null, "empty is required's job");
  assert.equal(rules.nationalId()("۰۰۱۲۳۴۵۶۷۹"), null, "Persian digits accepted");
  assert.equal(resolve(rules.nationalId()("1234567890")), fa.invalid.nationalId);
  assert.equal(rules.mobile()("۰۹۱۲۱۲۳۴۵۶۷"), null);
  assert.equal(resolve(rules.minLength(3)("ab")), fa.form.minLength("3"));
  assert.equal(resolve(rules.email()("a@b")), fa.form.email);
  assert.equal(rules.email()("a@b.ir"), null);
  assert.equal(resolve(rules.match("p")("1", { p: "2" })), fa.form.match);
  assert.equal(rules.custom((v) => v === "ok", "نه")("bad"), "نه");
  assert.equal(rules.min(10, "کم")("۹"), "کم");
});

test("useForm: field bindings for text, value and checkbox fields", () => {
  let form;
  const Probe = () => {
    form = K.useForm({ defaultValues: { name: "سارا", id: "", agree: true }, rules: { name: [K.rules.required()], id: [K.rules.nationalId()] } });
    return h("form", null, h(K.Input, { label: "نام", ...form.field("name") }), h(K.NationalIdInput, { label: "کد ملی", ...form.field("id", { type: "value" }) }));
  };
  const html = render(h(Probe));
  assert.match(html, /value="سارا"/);
  const text = form.field("name");
  assert.equal(text.required, true);
  assert.equal(typeof text.onChange, "function");
  assert.equal(form.field("id", { type: "value" }).onChange, undefined, "Persian inputs get onValueChange only");
  assert.equal(form.field("agree", { type: "checkbox" }).checked, true);
  assert.equal(form.isDirty, false);
  assert.equal(form.summary, undefined);
});
