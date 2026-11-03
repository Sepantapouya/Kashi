// یک DOM در Node برای تست عنصرها؛ باید پیش از import پکیج اجرا شود
import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/" });
for (const key of [
  "window", "document", "HTMLElement", "HTMLInputElement", "HTMLButtonElement", "HTMLDialogElement", "Element", "Node", "customElements",
  "CustomEvent", "Event", "KeyboardEvent", "MouseEvent", "getComputedStyle", "navigator", "FormData",
  "HTMLAnchorElement", "HTMLSelectElement", "PointerEvent", "FocusEvent", "location", "innerWidth", "innerHeight", "matchMedia",
]) {
  Object.defineProperty(globalThis, key, { value: key === "window" ? window : window[key], configurable: true, writable: true });
}
for (const fn of ["addEventListener", "removeEventListener"]) globalThis[fn] = window[fn].bind(window);
document.documentElement.dir = "rtl";
// happy-dom جهت را از dir حساب نمی‌کند؛ مثل مرورگر با CSS راست‌به‌چپ می‌شود
document.head.insertAdjacentHTML("beforeend", "<style>html { direction: rtl; }</style>");

/** عنصر را با HTML داده‌شده در صفحه می‌گذارد و اولین فرزندش را برمی‌گرداند */
export function mount(html) {
  // مثل مرورگر: درخت کامل ساخته و بعد به صفحه وصل می‌شود
  const t = document.createElement("template");
  t.innerHTML = html;
  document.body.replaceChildren(t.content);
  return document.body.firstElementChild;
}

/** تایپ در فیلد: مقدار را می‌گذارد و رویداد input می‌فرستد */
export function type(input, text) {
  input.focus();
  input.value = text;
  input.setSelectionRange(text.length, text.length);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export const K = await import("../dist/index.js");
