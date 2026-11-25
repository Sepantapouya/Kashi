// کج شدن سه‌بعدی کارت‌ها با نشانگر، روی همهٔ صفحه‌ها.
// فقط با موس (pointer: fine) و وقتی کاربر کاهش حرکت نخواسته باشد.
const SELECTOR = [
  ".gcard", ".pager__link", ".tile", ".ent__item", ".quality__item", ".step",
  ".adopt", ".author", ".support", ".home-pro", "[data-tilt3d]",
].join(",");
const MAX = 6; // درجه

const calm = matchMedia("(prefers-reduced-motion: reduce)");
const fine = matchMedia("(pointer: fine)");

function bind(el: HTMLElement) {
  if (el.dataset.tiltBound) return;
  el.dataset.tiltBound = "";
  el.setAttribute("data-tilt3d", "");
  // کارت‌های بزرگ کمتر کج می‌شوند تا متنشان خوانا بماند
  const strength = () => Math.max(0.35, Math.min(1, 360 / Math.max(el.offsetWidth, 1)));
  let raf = 0;
  el.addEventListener("pointermove", (e) => {
    if (calm.matches || !fine.matches) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const k = MAX * strength();
      el.style.setProperty("--rx", `${((0.5 - y) * k).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((x - 0.5) * k).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      el.setAttribute("data-tilting", "");
    });
  });
  el.addEventListener("pointerleave", () => {
    cancelAnimationFrame(raf);
    el.removeAttribute("data-tilting");
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
  });
}

function scan(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>(SELECTOR).forEach(bind);
}

scan();
// کارت‌هایی که بعداً رندر می‌شوند (مثل جزیره‌های React)
new MutationObserver((list) => {
  for (const m of list) m.addedNodes.forEach((n) => n instanceof HTMLElement && (n.matches(SELECTOR) ? bind(n) : scan(n)));
}).observe(document.body, { childList: true, subtree: true });
