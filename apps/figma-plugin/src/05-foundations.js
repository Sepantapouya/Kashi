// صفحهٔ پایه‌ها: رنگ، تایپوگرافی، فاصله، گردی و سایه

const SCALE_FA = { firoozeh: "فیروزه", lajvard: "لاجورد", zafaran: "زعفران", anar: "انار", pesteh: "پسته", shab: "شب" };

function hexLabel(rgba) {
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  return ("#" + h(rgba[0]) + h(rgba[1]) + h(rgba[2])).toUpperCase() + (rgba[3] < 1 ? ` · ${Math.round(rgba[3] * 100)}%` : "");
}

function buildFoundations() {
  const { page, root } = kitPage("🎨 Foundations", "پایه‌ها", "رنگ‌ها، تایپوگرافی، فاصله‌ها، گردی گوشه‌ها و سایه‌ها — همه به Variables و Styles وصل‌اند و با تغییر mode تیره/روشن، تراکم و گردی عوض می‌شوند.");

  safe("palette", () => section(root, "پالت رنگ", "رنگ‌های پایه با الهام از کاشی‌کاری ایرانی. کامپوننت‌ها مستقیم از این‌ها استفاده نمی‌کنند؛ از توکن‌های معنایی استفاده می‌کنند.", (h) => {
    for (const [scale, steps] of Object.entries(TOKENS.palette)) {
      const row = F({ name: scale, dir: "V", gap: 8, w: "fill" }, [
        T(`${SCALE_FA[scale] || scale} · ${scale}`, { style: "Text sm/Semibold", color: "text-secondary" }),
        F({ name: "Swatches", dir: "H", gap: 8, w: "fill" }, Object.keys(steps).map((step) =>
          F({ name: step, dir: "V", gap: 6, w: 72 }, [
            R({ w: 72, h: 56, radius: "radius/md", fill: `${scale}/${step}`, stroke: "border-secondary", name: "Swatch" }),
            T(step, { style: "Text xs/Semibold", color: "text-secondary", ltr: true }),
            T(steps[step].toUpperCase(), { style: "Text xs/Regular", color: "text-quaternary", ltr: true }),
          ]),
        )),
      ]);
      add(h, row);
      applySizing(row);
    }
  }));

  safe("semantic", () => section(root, "رنگ‌های معنایی", "این توکن‌ها در دو mode تیره و روشن مقدار دارند. برای دیدن تم روشن، فریم را انتخاب کنید و از پنل Appearance حالت Light را بزنید.", (h) => {
    const groups = { "پس‌زمینه": "bg-", "متن": "text-", "حاشیه": "border-" };
    for (const [label, prefix] of Object.entries(groups)) {
      const tokens = Object.keys(TOKENS.themes.dark).filter((k) => k.startsWith(prefix));
      const col = F({ name: label, dir: "V", gap: 8, w: 400 }, [
        T(label, { style: "Text sm/Semibold", color: "text-secondary" }),
        ...tokens.map((tk) =>
          F({ name: tk, dir: "H", gap: 12, w: "fill", p: 8, radius: "radius/md", stroke: "border-secondary" }, [
            R({ w: 36, h: 36, radius: "radius/sm", fill: tk, stroke: "border-secondary", name: "Swatch" }),
            F({ dir: "V", gap: 0, grow: true }, [
              T(tk, { style: "Text sm/Medium", color: "text-primary", ltr: true }),
              T(`Dark ${hexLabel(themeRgba(tk, "dark"))}  ·  Light ${hexLabel(themeRgba(tk, "light"))}`, { style: "Text xs/Regular", color: "text-tertiary", ltr: true }),
            ]),
          ]),
        ),
      ]);
      add(h, col);
    }
  }));

  safe("type", () => section(root, "تایپوگرافی", `فونت پیش‌فرض: ${S.family}. برای استفاده از فونت دیگر (حتی فونت پولی)، متغیر font/family/sans را در مجموعهٔ Kashi · Typography عوض کنید.`, (h) => {
    const col = F({ name: "Type scale", dir: "V", gap: 16, w: "fill" });
    add(h, col);
    applySizing(col);
    for (const name of Object.keys(S.textStyles).filter((n) => n.endsWith("/Semibold") || n.startsWith("Text") && n.endsWith("/Regular"))) {
      const spec = S.textStyles[name].spec;
      const row = F({ name, dir: "H", gap: 24, w: "fill", cross: "center", pb: 16, stroke: "border-secondary", sides: [0, 0, 1, 0] }, [
        F({ dir: "V", gap: 0, w: 200 }, [
          T(name, { style: "Text sm/Medium", color: "text-secondary", ltr: true }),
          T(`${spec.size}px / ${Math.round(spec.size * spec.leading)}px`, { style: "Text xs/Regular", color: "text-quaternary", ltr: true }),
        ]),
        T("کاشی، دیزاین‌سیستم فارسی ۱۴۰۵", { style: name, color: "text-primary", grow: true }),
      ]);
      add(col, row);
      applySizing(row);
    }
  }));

  safe("spacing", () => section(root, "فاصله‌ها", "مضرب‌های ۴ پیکسل. در auto layout به جای عدد از متغیرهای space استفاده کنید.", (h) => {
    const col = F({ name: "Spacing", dir: "V", gap: 8, w: 520 });
    add(h, col);
    for (const [k, v] of Object.entries(TOKENS.space).sort((a, b) => a[1] - b[1])) {
      if (!v) continue;
      add(col, F({ name: k, dir: "H", gap: 16, w: "fill" }, [
        T(`space/${k}`, { style: "Text sm/Medium", color: "text-secondary", ltr: true, w: 110 }),
        T(`${v}px`, { style: "Text sm/Regular", color: "text-tertiary", ltr: true, w: 60 }),
        R({ w: v, h: 16, radius: 2, fill: "bg-brand", name: "Bar" }),
      ]));
    }
  }));

  safe("radius", () => section(root, "گردی گوشه‌ها", "مجموعهٔ Kashi · Radius چهار mode دارد: Default، Sharp (تیز)، Soft و Round.", (h) => {
    for (const k of ["none", "sm", "md", "lg", "xl", "2xl", "full"]) {
      add(h, F({ name: k, dir: "V", gap: 8, cross: "center" }, [
        F({ w: 88, h: 88, radius: `radius/${k}`, fill: "bg-tertiary", stroke: "border-primary" }),
        T(`radius/${k}`, { style: "Text sm/Medium", color: "text-secondary", ltr: true }),
        T(k === "full" ? "9999" : `${TOKENS.radius[k]}px`, { style: "Text xs/Regular", color: "text-quaternary", ltr: true }),
      ]));
    }
  }));

  safe("shadow", () => section(root, "سایه‌ها", "سایه‌ها برای هر تم جدا تعریف شده‌اند؛ در تم تیره باید پررنگ‌تر باشند تا دیده شوند.", (h) => {
    for (const k of ["xs", "sm", "md", "lg", "xl", "2xl"]) {
      add(h, F({ name: k, dir: "V", gap: 12, cross: "center", p: 24 }, [
        F({ w: 120, h: 88, radius: "radius/lg", fill: "bg-elevated", stroke: "border-secondary", shadow: `Shadow/${k}` }),
        T(`Shadow/${k}`, { style: "Text sm/Medium", color: "text-secondary", ltr: true }),
      ]));
    }
    add(h, F({ name: "focus", dir: "V", gap: 12, cross: "center", p: 24 }, [
      F({ w: 120, h: 44, radius: "radius/md", fill: "bg-primary", stroke: "border-brand", shadow: "Input focus" }),
      T("Focus ring", { style: "Text sm/Medium", color: "text-secondary", ltr: true }),
    ]));
  }));
  return page;
}
