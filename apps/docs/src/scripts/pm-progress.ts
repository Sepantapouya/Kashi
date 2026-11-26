// پیشرفت دورهٔ مدیریت محصول؛ فقط در localStorage همین مرورگر
const KEY = "kashi-pm-progress-v1";
interface State { done: string[]; acts: Record<string, true> }

const fa = (n: number) => n.toLocaleString("fa-IR");

function load(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "");
    return { done: Array.isArray(s.done) ? s.done : [], acts: s.acts && typeof s.acts === "object" ? s.acts : {} };
  } catch {
    return { done: [], acts: {} };
  }
}
function save(s: State) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

function setBar(el: Element | null, pct: number) {
  if (!el) return;
  el.setAttribute("aria-valuenow", String(Math.round(pct)));
  el.querySelector<HTMLElement>(".k-progress__bar")?.style.setProperty("--k-value", `${pct}%`);
}

export function initProgress() {
  const root = document.querySelector<HTMLElement>("[data-pm]");
  if (!root) return;
  const total = Number(root.dataset.total) || 1;
  let state = load();

  const render = () => {
    const done = new Set(state.done);
    const pct = (done.size / total) * 100;
    document.querySelectorAll("[data-pm-done]").forEach((el) => (el.textContent = fa(done.size)));
    document.querySelectorAll("[data-pm-pct]").forEach((el) => (el.textContent = `${fa(Math.round(pct))}٪`));
    document.querySelectorAll("[data-pm-bar]").forEach((el) => setBar(el, pct));
    document.querySelectorAll<HTMLElement>("[data-lesson-link]").forEach((a) => a.toggleAttribute("data-done", done.has(a.dataset.lessonLink!)));

    // کارت‌های صفحهٔ دوره
    document.querySelectorAll<HTMLElement>("[data-lesson-card]").forEach((card) => {
      const slug = card.dataset.lessonCard!;
      const acts = Number(card.dataset.acts) || 0;
      const checked = Object.keys(state.acts).filter((k) => k.startsWith(`${slug}:`)).length;
      card.toggleAttribute("data-done", done.has(slug));
      const status = card.querySelector<HTMLElement>("[data-card-status]");
      if (status) status.textContent = done.has(slug) ? "خوانده شد" : checked ? `${fa(checked)} از ${fa(acts)} کار` : "";
    });

    // دکمهٔ «ادامه»: اولین درسی که تمام نشده
    const next = [...document.querySelectorAll<HTMLAnchorElement>("[data-lesson-link]")].find((a) => !done.has(a.dataset.lessonLink!));
    document.querySelectorAll<HTMLAnchorElement>("[data-pm-continue]").forEach((btn) => {
      if (next) {
        btn.href = next.href;
        btn.querySelector("[data-continue-label]")!.textContent = done.size ? "ادامهٔ دوره" : "شروع دوره";
      } else {
        btn.querySelector("[data-continue-label]")!.textContent = "دوره تمام شد؛ مرور از اول";
      }
    });

    // دکمهٔ «تمام کردم» پایین هر درس
    document.querySelectorAll<HTMLButtonElement>("[data-complete]").forEach((btn) => {
      const on = done.has(btn.dataset.complete!);
      btn.setAttribute("aria-pressed", String(on));
      btn.classList.toggle("k-btn--primary", !on);
      btn.classList.toggle("k-btn--secondary", on);
      btn.querySelector("[data-complete-label]")!.textContent = on ? "خوانده شد" : "این درس را تمام کردم";
    });

    // چک‌لیست کارها
    document.querySelectorAll<HTMLElement>("[data-actions]").forEach((box) => {
      const lesson = box.dataset.actions!;
      const inputs = [...box.querySelectorAll<HTMLInputElement>("[data-act]")];
      let n = 0;
      for (const input of inputs) {
        input.checked = Boolean(state.acts[`${lesson}:${input.dataset.act}`]);
        if (input.checked) n++;
      }
      box.querySelector("[data-actions-count]")!.textContent = `${fa(n)} از ${fa(inputs.length)} انجام شده`;
      setBar(box.querySelector("[data-actions-bar]"), inputs.length ? (n / inputs.length) * 100 : 0);
      box.toggleAttribute("data-complete-all", inputs.length > 0 && n === inputs.length);
    });
  };

  document.addEventListener("change", (e) => {
    const input = (e.target as HTMLElement).closest<HTMLInputElement>("[data-act]");
    const box = input?.closest<HTMLElement>("[data-actions]");
    if (!input || !box) return;
    const key = `${box.dataset.actions}:${input.dataset.act}`;
    if (input.checked) state.acts[key] = true;
    else delete state.acts[key];
    save(state);
    render();
  });

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest<HTMLButtonElement>("[data-complete]");
    if (btn) {
      const slug = btn.dataset.complete!;
      state.done = state.done.includes(slug) ? state.done.filter((s) => s !== slug) : [...state.done, slug];
      save(state);
      render();
      btn.toggleAttribute("data-pop", true);
      setTimeout(() => btn.removeAttribute("data-pop"), 500);
    }
    if (target.closest("[data-pm-reset]") && confirm("پیشرفت همهٔ درس‌ها و تیک کارها از این مرورگر پاک شود؟")) {
      state = { done: [], acts: {} };
      save(state);
      render();
    }
  });

  // تغییر در تب دیگر
  addEventListener("storage", (e) => {
    if (e.key === KEY) { state = load(); render(); }
  });

  // منوی موبایل بعد از انتخاب درس بسته شود
  document.querySelectorAll<HTMLDetailsElement>(".pm-mnav").forEach((d) => d.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) d.open = false;
  }));

  render();
  root.dataset.ready = "";
}
