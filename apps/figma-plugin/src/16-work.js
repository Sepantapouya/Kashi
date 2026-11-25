// گفتگو و هوش مصنوعی، کار و همکاری، ویرایشگر، گالری، کد QR و برنامهٔ زمانی؛ هم‌اندازه با CSSهای chat.css، code.css، sortable.css و…

/** حباب پیام (k-msg): کاربر با رنگ برند سمت پایان، دستیار خاکستری سمت شروع؛ گوشهٔ پایین سمت فرستنده تیزتر */
function chatBubble(text, { from = "assistant", time, status, w } = {}) {
  const user = from === "user";
  const bubble = F({ name: "Bubble", dir: "H", px: "space/4", py: 10, radius: "radius/xl", fill: user ? "bg-brand" : "bg-secondary", maxW: 300 }, [
    T(text, { style: "Text sm/Regular", color: user ? "text-on-brand" : "text-primary", w: w || undefined, leading: 1.9 }),
  ]);
  const meta = time || status ? F({ name: "Meta", dir: "H", gap: "space/1.5", px: "space/1", cross: "center" }, [
    time && T(time, { style: "Text xs/Regular", color: "text-quaternary" }),
    status && I(status === "failed" ? "alert-circle" : "check", 16, status === "read" ? "text-brand" : status === "failed" ? "text-error" : "text-tertiary"),
  ]) : null;
  return F({ name: user ? "Message · user" : "Message · assistant", dir: "V", gap: "space/1", cross: user ? "end" : "start", w: "fill" }, [bubble, meta]);
}

/** سه نقطهٔ «در حال نوشتن» (k-typing) */
function typingDots() {
  return F({ name: "Typing", dir: "H", gap: 4, px: "space/4", py: "space/3", radius: "radius/xl", fill: "bg-secondary", cross: "center" }, [0, 1, 2].map(() => R({ ellipse: true, w: 6.4, h: 6.4, fill: "text-tertiary", name: "Dot" })));
}

function buildWork() {
  const root = kitPage("🗂️", "Chat & work", "گفتگو و کار گروهی", "رابط گفتگو و دستیار هوش مصنوعی، کانبان و فهرست کشیدنی، ویرایشگر متن، گالری، اعلان‌ها، کد QR و برنامهٔ زمانی شمسی.");

  safe("Chat", () => section(root, "Chat · گفتگو", "حباب پیام کاربر و دستیار، جداکنندهٔ روز، وضعیت پیام و «در حال نوشتن».", (h) => {
    componentSet(h, "Chat", {
      axes: { State: ["Conversation", "Typing", "Failed"] },
      build: (p) => F({ name: "Chat", dir: "V", gap: "space/4", p: "space/4", w: 380, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary" }, [
        F({ name: "Divider", dir: "H", gap: "space/3", w: "fill", cross: "center" }, [R({ h: 1, w: 120, fill: "border-secondary", grow: true }), T("امروز", { style: "Text xs/Regular", color: "text-tertiary" }), R({ h: 1, w: 120, fill: "border-secondary", grow: true })]),
        chatBubble("کاشی را چطور در Next.js نصب کنم؟", { from: "user", time: "۶ دقیقه پیش", status: p.State === "Failed" ? "failed" : "read" }),
        chatBubble("پکیج React را نصب کنید و فایل CSS را یک بار در ریشهٔ برنامه وارد کنید.", { time: "۵ دقیقه پیش", w: 260 }),
        p.State !== "Failed" && F({ name: "Actions", dir: "H", gap: 2 }, ["copy", "refresh", "thumbs-up", "thumbs-down"].map((n) => F({ name: n, dir: "H", w: 28, h: 28, align: "center", cross: "center", radius: "radius/md" }, [I(n, 16, "text-tertiary")]))),
        p.State === "Typing" && typingDots(),
      ]),
      cols: 3,
      docs: "chat",
    });
  }));

  safe("ChatComposer", () => section(root, "Chat composer · کادر پیام", "Enter برای ارسال، پیوست و دکمهٔ توقف هنگام پاسخ.", (h) => {
    componentSet(h, "Chat composer", {
      axes: { State: ["Empty", "Typed", "Attachment", "Streaming"] },
      build: (p) => {
        const sendOn = p.State === "Typed" || p.State === "Attachment";
        return F({ name: "Composer", dir: "V", gap: "space/2", p: "space/2", w: 420, radius: "radius/2xl", fill: "bg-elevated", stroke: p.State === "Typed" ? "border-brand" : "border-primary", shadow: "Shadow/sm" }, [
          p.State === "Attachment" && F({ name: "File", dir: "H", gap: "space/2", p: "space/1", radius: "radius/lg", fill: "bg-secondary", stroke: "border-secondary", cross: "center" }, [
            F({ name: "Thumb", dir: "H", w: 36, h: 36, align: "center", cross: "center", radius: "radius/md", fill: "bg-tertiary" }, [I("file", 18, "text-tertiary")]),
            F({ name: "Text", dir: "V", gap: 0 }, [T("فاکتور-آبان.pdf", { style: "Text xs/Medium", color: "text-primary" }), T("۲۴۰ کیلوبایت", { style: "Text xs/Regular", color: "text-tertiary" })]),
            I("close", 14, "text-tertiary"),
          ]),
          F({ name: "Input", dir: "H", px: "space/3", py: "space/2", w: "fill", minH: 44 }, [
            T(p.State === "Empty" || p.State === "Attachment" ? "پیامتان را بنویسید…" : "یک نمونه کد برای نصب بده", { style: "Text sm/Regular", color: p.State === "Empty" || p.State === "Attachment" ? "text-quaternary" : "text-primary" }),
          ]),
          F({ name: "Bar", dir: "H", gap: "space/1", w: "fill", cross: "center" }, [
            F({ name: "Attach", dir: "H", w: 36, h: 36, align: "center", cross: "center", radius: "radius/full" }, [I("paperclip", 20, "text-tertiary")]),
            Spacer(),
            F({ name: p.State === "Streaming" ? "Stop" : "Send", dir: "H", w: 36, h: 36, align: "center", cross: "center", radius: "radius/full", fill: p.State === "Streaming" ? "text-primary" : sendOn ? "bg-brand" : "bg-tertiary" }, [
              p.State === "Streaming" ? R({ w: 8, h: 8, radius: 2, fill: "bg-primary", name: "Square" }) : I("arrow-up", 20, sendOn ? "text-on-brand" : "text-quaternary"),
            ]),
          ]),
        ]);
      },
      cols: 2,
      docs: "chat-composer",
    });
  }));

  safe("StreamingText", () => section(root, "Streaming text · متن کلمه‌به‌کلمه", "کلمه‌های تازه نرم ظاهر می‌شوند و نشانگر تا پایان پاسخ چشمک می‌زند.", (h) => {
    componentSet(h, "Streaming text", {
      axes: { State: ["Streaming", "Done"] },
      build: (p) => F({ name: "Streaming text", dir: "H", gap: 2, w: 340, cross: "end", wrap: true }, [
        T(p.State === "Done" ? "کاشی برای فارسی ساخته شده است، نه ترجمه شده." : "کاشی برای فارسی ساخته شده است، نه", { style: "Text sm/Regular", color: "text-primary" }),
        p.State === "Streaming" && R({ w: 7, h: 14, radius: 2, fill: "text-brand", name: "Cursor" }),
      ]),
      docs: "streaming-text",
    });
  }));

  safe("CodeBlock", () => section(root, "Code block · بلوک کد", "همیشه چپ‌به‌راست، با نام زبان، کپی و شمارهٔ خط.", (h) => {
    const line = (n, parts, marked) => F({ name: `Line ${n}`, dir: "H", gap: "space/4", px: "space/4", w: "fill", fill: marked ? "brand/500" : undefined, fillOpacity: marked ? 0.12 : undefined }, [
      LTR({ name: "Code", dir: "H", gap: 0, grow: true }, parts.map(([t, c]) => T(t, { style: "Text xs/Regular", color: c, ltr: true }))),
      T(String(n), { style: "Text xs/Regular", color: "text-quaternary", ltr: true }),
    ]);
    componentSet(h, "Code block", {
      axes: { Copy: ["Default", "Copied"] },
      build: (p) => F({ name: "Code block", dir: "V", gap: 0, w: 420, radius: "radius/lg", fill: "bg-secondary", stroke: "border-secondary", clip: true }, [
        F({ name: "Head", dir: "H", py: "space/1", ps: "space/3", pe: "space/1", w: "fill", cross: "center", sides: [0, 0, 1, 0], stroke: "border-secondary" }, [
          T("App.tsx", { style: "Text xs/Regular", color: "text-tertiary", ltr: true }),
          Spacer(),
          F({ name: "Copy", dir: "H", gap: "space/1", px: "space/2", h: 28, cross: "center", radius: "radius/md" }, [I(p.Copy === "Copied" ? "check" : "copy", 15, p.Copy === "Copied" ? "text-brand" : "text-tertiary"), T(p.Copy === "Copied" ? "کپی شد" : "کپی کد", { style: "Text xs/Regular", color: p.Copy === "Copied" ? "text-brand" : "text-tertiary" })]),
        ]),
        F({ name: "Pre", dir: "V", gap: 0, py: "space/3", w: "fill" }, [
          line(1, [["import", "chart-7"], [" { PersianInput } ", "text-primary"], ["from", "chart-7"], [' "@kashi-ui/react"', "chart-3"]]),
          line(2, [["export function ", "chart-7"], ["Form", "chart-1"], ["() {", "text-primary"]], true),
          line(3, [['  return <PersianInput kind="national-id" />;', "text-primary"]]),
          line(4, [["}", "text-primary"]]),
        ]),
      ]),
      docs: "code-block",
    });
  }));

  safe("Sortable", () => section(root, "Sortable list · فهرست کشیدنی", "از دستگیره بکشید یا با فاصله و کلیدهای جهت جابه‌جا کنید.", (h) => {
    componentSet(h, "Sortable list", {
      axes: { State: ["Default", "Dragging"] },
      build: (p) => F({ name: "Sortable", dir: "V", gap: "space/2", w: 300 }, ["طراحی صفحهٔ ورود", "اتصال درگاه پرداخت", "تست روی گوشی"].map((t, i) => {
        const drag = p.State === "Dragging" && i === 1;
        return F({ name: "Item", dir: "H", gap: "space/2", h: 48, ps: "space/1", pe: "space/3", w: "fill", cross: "center", radius: "radius/lg", fill: "bg-elevated", stroke: drag ? "border-brand" : "border-secondary", shadow: drag ? "Shadow/lg" : undefined }, [
          F({ name: "Handle", dir: "H", w: 28, h: 32, align: "center", cross: "center", radius: "radius/md", fill: drag ? "bg-brand-subtle" : undefined }, [I("drag-handle", 18, drag ? "text-brand" : "text-quaternary")]),
          T(t, { style: "Text sm/Regular", color: "text-primary" }),
        ]);
      })),
      docs: "sortable",
    });
  }));

  safe("Kanban", () => section(root, "Kanban · کانبان", "ستون‌های کار با شمار کارت و سقف؛ کارت‌ها بین ستون‌ها کشیده می‌شوند.", (h) => {
    const card = (t, tag, who, drag) => F({ name: "Card", dir: "H", gap: "space/1", p: "space/3", ps: "space/1", w: "fill", cross: "start", radius: "radius/lg", fill: "bg-elevated", stroke: drag ? "border-brand" : "border-secondary", shadow: drag ? "Shadow/lg" : "Shadow/xs" }, [
      F({ name: "Handle", dir: "H", w: 28, h: 32, align: "center", cross: "center" }, [I("drag-handle", 18, "text-quaternary")]),
      F({ name: "Body", dir: "V", gap: "space/2", grow: true, pt: 4 }, [T(t, { style: "Text sm/Regular", color: "text-primary" }), F({ name: "Meta", dir: "H", w: "fill", align: "between", cross: "center" }, [badge({ label: tag, dot: false, size: "sm" }), avatar({ size: "xs", initials: who })])]),
    ]);
    const col = (title, color, count, cards, limit) => F({ name: "Column", dir: "V", gap: "space/2", p: "space/3", w: 230, radius: "radius/xl", fill: "bg-secondary" }, [
      F({ name: "Head", dir: "H", gap: "space/2", px: "space/1", w: "fill", cross: "center" }, [R({ ellipse: true, w: 8, h: 8, fill: color }), T(title, { style: "Text sm/Semibold", color: "text-primary" }), Spacer(), F({ name: "Count", dir: "H", px: "space/2", h: 24, cross: "center", radius: "radius/full", fill: "bg-tertiary" }, [T(limit ? `${fa(count)}/${fa(limit)}` : fa(count), { style: "Text xs/Regular", color: "text-tertiary" })])]),
      ...cards,
      F({ name: "Add", dir: "H", gap: "space/1.5", px: "space/2", h: 36, cross: "center", radius: "radius/md" }, [I("plus", 16, "text-tertiary"), T("افزودن کارت", { style: "Text sm/Regular", color: "text-tertiary" })]),
    ]);
    componentSet(h, "Kanban", {
      axes: { State: ["Default", "Dragging"] },
      build: (p) => F({ name: "Kanban", dir: "H", gap: "space/3", cross: "start" }, [
        col("برای انجام", "chart-1", 2, [card("طراحی صفحهٔ ورود", "طراحی", "سم"), card("اتصال درگاه پرداخت", "فنی", "رک", p.State === "Dragging")]),
        col("در حال انجام", "chart-4", 1, [card("ترجمهٔ پیام‌های خطا", "محتوا", "ما")], 2),
        col("انجام شد", "chart-3", 1, [card("نصب کاشی", "فنی", "عر")]),
      ]),
      cols: 1,
      docs: "kanban",
    });
  }));

  safe("Gallery", () => section(root, "Gallery · گالری تصاویر", "شبکهٔ تصویرها و نمایش تمام‌صفحه با شمارنده، فلش‌ها و تصویرهای کوچک.", (h) => {
    const tile = (i, w, hgt) => R({ w, h: hgt, radius: "radius/lg", fill: ["firoozeh/700", "lajvard/700", "zafaran/600", "anar/700", "pesteh/700", "shab/700"][i % 6], name: "Image" });
    componentSet(h, "Gallery", {
      axes: { View: ["Grid", "Lightbox"] },
      build: (p) => p.View === "Grid"
        ? F({ name: "Gallery", dir: "H", gap: "space/2", w: 360, wrap: true, rowGap: "space/2" }, [0, 1, 2, 3, 4, 5].map((i) => tile(i, 114, 86)))
        : F({ name: "Lightbox", dir: "V", gap: "space/3", p: "space/4", w: 520, cross: "center", fill: "shab/1000", radius: "radius/lg" }, [
          F({ name: "Bar", dir: "H", w: "fill", cross: "center", gap: "space/1" }, [
            F({ name: "Close", dir: "H", w: 44, h: 44, align: "center", cross: "center", radius: "radius/full", fill: "shab/800" }, [I("close", 20, "shab/100")]),
            F({ name: "Zoom", dir: "H", w: 44, h: 44, align: "center", cross: "center", radius: "radius/full", fill: "shab/800" }, [I("search", 20, "shab/100")]),
            Spacer(),
            T("۲ از ۶", { style: "Text sm/Regular", color: "shab/300" }),
          ]),
          tile(1, 400, 280),
          T("شمسهٔ لاجوردی، از پالت رنگ‌های کاشی", { style: "Text sm/Regular", color: "shab/300" }),
          F({ name: "Thumbs", dir: "H", gap: "space/2" }, [0, 1, 2, 3, 4, 5].map((i) => { const t = tile(i, 48, 48); if (i !== 1) t.opacity = 0.5; return t; })),
        ]),
      cols: 2,
      docs: "gallery",
    });
  }));

  safe("RichText", () => section(root, "Rich text editor · ویرایشگر متن", "نوار ابزار با کیبورد، جهت هر بند، نیم‌فاصله با Shift+Space و شمار کلمه.", (h) => {
    componentSet(h, "Rich text editor", {
      axes: { State: ["Default", "Focus"] },
      build: (p) => field({
        label: "توضیحات محصول", w: 420,
        control: F({ name: "Editor", dir: "V", gap: 0, w: "fill", radius: "radius/lg", fill: "bg-elevated", stroke: p.State === "Focus" ? "border-brand" : "border-primary", shadow: p.State === "Focus" ? "Focus ring/brand" : "Shadow/xs", clip: true }, [
          F({ name: "Toolbar", dir: "H", gap: 2, p: "space/1", w: "fill", fill: "bg-secondary", sides: [0, 0, 1, 0], stroke: "border-secondary" },
            ["bold", "italic", "underline", null, "heading", "quote", "list", null, "link"].map((n, i) => n ? F({ name: n, dir: "H", w: 32, h: 32, align: "center", cross: "center", radius: "radius/md", fill: i === 0 ? "bg-brand-subtle" : undefined }, [I(n, 18, i === 0 ? "text-brand" : "text-tertiary")]) : R({ w: 1, h: 20, fill: "border-secondary", name: "Separator" }))),
          F({ name: "Area", dir: "V", gap: "space/2", px: "space/4", py: "space/3", w: "fill", minH: 110 }, [
            T("این کتاب دربارهٔ طراحی رابط فارسی است.", { style: "Text sm/Regular", color: "text-primary", w: "fill" }),
            T("• نیم‌فاصله با Shift+Space", { style: "Text sm/Regular", color: "text-primary", w: "fill" }),
          ]),
          F({ name: "Foot", dir: "H", gap: "space/1.5", px: "space/4", py: "space/1.5", w: "fill", sides: [1, 0, 0, 0], stroke: "border-secondary" }, [
            T("۱۲ کلمه · ۶۴ نویسه", { style: "Text xs/Regular", color: "text-quaternary" }), Spacer(), T("Shift+Space نیم‌فاصله می‌گذارد", { style: "Text xs/Regular", color: "text-quaternary" }),
          ]),
        ]),
      }),
      docs: "rich-text",
    });
  }));

  safe("Notifications", () => section(root, "Notification center · مرکز اعلان‌ها", "زنگ با شمار خوانده‌نشده و فهرست گروه‌بندی‌شده با زبانه‌ها.", (h) => {
    const item = (title, time, unread, icon) => F({ name: "Notification", dir: "H", gap: "space/3", p: "space/3", w: "fill", cross: "start", radius: "radius/lg", fill: unread ? "brand/500" : undefined, fillOpacity: unread ? 0.06 : undefined }, [
      icon,
      F({ name: "Text", dir: "V", gap: 2, grow: true }, [T(title, { style: "Text sm/Regular", color: unread ? "text-primary" : "text-secondary", w: "fill" }), T(time, { style: "Text xs/Regular", color: "text-quaternary" })]),
      unread && R({ ellipse: true, w: 8, h: 8, fill: "bg-brand", name: "Unread" }),
    ]);
    componentSet(h, "Notification center", {
      axes: { State: ["List", "Empty", "Bell"] },
      build: (p) => {
        if (p.State === "Bell") return F({ name: "Bell", dir: "none", w: 40, h: 40 }, [
          (() => { const b = F({ name: "Button", dir: "H", w: 40, h: 40, align: "center", cross: "center", radius: "radius/md" }, [I("bell", 20, "text-secondary")]); SIZING.set(b, { x: 0, y: 0 }); return b; })(),
          F({ name: "Badge", dir: "H", px: 4, h: 18, minW: 18, align: "center", cross: "center", radius: "radius/full", fill: "bg-error", stroke: "bg-primary", sw: 2, x: 0, y: 2 }, [T("۳", { style: "Text xs/Bold", color: "#ffffff", size: 11, weight: "bold" })]),
        ]);
        return F({ name: "Notifications", dir: "V", gap: 0, w: 360, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Shadow/lg", clip: true }, [
          F({ name: "Head", dir: "H", gap: "space/2", pt: "space/3", pb: "space/2", px: "space/4", w: "fill", cross: "center" }, [T("اعلان‌ها", { style: "Text md/Semibold", color: "text-primary" }), Spacer(), T("خواندن همه", { style: "Text xs/Medium", color: "text-brand" })]),
          F({ name: "Tabs", dir: "H", gap: "space/1", px: "space/4", pb: "space/2", w: "fill", sides: [0, 0, 1, 0], stroke: "border-secondary" }, [
            F({ name: "All", dir: "H", px: "space/3", h: 32, cross: "center", radius: "radius/full", fill: "bg-tertiary" }, [T("همه", { style: "Text sm/Medium", color: "text-primary" })]),
            F({ name: "Unread", dir: "H", gap: "space/1.5", px: "space/3", h: 32, cross: "center" }, [T("خوانده‌نشده", { style: "Text sm/Medium", color: "text-tertiary" }), p.State === "List" && F({ name: "Count", dir: "H", px: 5, h: 20, cross: "center", radius: "radius/full", fill: "bg-error" }, [T("۲", { style: "Text xs/Regular", color: "#ffffff" })])]),
          ]),
          p.State === "Empty"
            ? F({ name: "Empty", dir: "V", gap: "space/2", py: "space/8", w: "fill", cross: "center" }, [F({ name: "Icon", dir: "H", w: 48, h: 48, align: "center", cross: "center", radius: "radius/full", fill: "bg-tertiary" }, [I("bell", 24, "text-tertiary")]), T("اعلانی ندارید.", { style: "Text sm/Regular", color: "text-tertiary" })])
            : F({ name: "List", dir: "V", gap: 0, px: "space/2", pb: "space/2", w: "fill" }, [
              T("امروز", { style: "Text xs/Medium", color: "text-tertiary", name: "Group" }),
              item("سارا محمدی روی طرح شما نظر گذاشت", "۴ دقیقه پیش", true, avatar({ size: "sm", initials: "سم", tone: "Brand" })),
              item("سفارش #۱۲۸۴ ارسال شد", "۱ ساعت پیش", true, featuredIcon("package", "Brand", 36)),
              item("پرداخت با موفقیت انجام شد", "دیروز", false, featuredIcon("check", "Success", 36)),
            ]),
        ]);
      },
      cols: 3,
      docs: "notifications",
    });
  }));

  safe("QRCode", () => section(root, "QR code · کد QR", "همیشه تیره روی روشن تا همهٔ دوربین‌ها بخوانند؛ با لوگو سطح H.", (h) => {
    componentSet(h, "QR code", {
      axes: { Logo: ["None", "Logo"] },
      build: (p) => {
        const m = TOKENS.qrSample;
        const n = m.length, s = 4, q = 4, size = (n + q * 2) * s;
        let d = "";
        const hole = p.Logo === "Logo" ? Math.ceil(n * 0.22) | 1 : 0;
        const h0 = (n - hole) / 2;
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
          if (!m[y][x]) continue;
          if (hole && x >= h0 - 0.5 && x < h0 + hole - 0.5 && y >= h0 - 0.5 && y < h0 + hole - 0.5) continue;
          d += `M${(x + q) * s} ${(y + q) * s}h${s}v${s}h-${s}z`;
        }
        const svg = figma.createNodeFromSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="8" fill="#ffffff"/><path d="${d}" fill="#0d0e11"/></svg>`);
        svg.name = "QR";
        if (!hole) return svg;
        const logo = F({ name: "Logo", dir: "H", w: hole * s, h: hole * s, align: "center", cross: "center", radius: 8, fill: "#ffffff" }, [I("star", hole * s * 0.7, "text-brand")]);
        return F({ name: "QR code", dir: "none", w: size, h: size }, [
          (() => { SIZING.set(svg, { x: 0, y: 0 }); return svg; })(),
          (() => { SIZING.set(logo, { x: (size - hole * s) / 2, y: (size - hole * s) / 2 }); return logo; })(),
        ]);
      },
      cols: 2,
      docs: "qr-code",
    });
  }));

  safe("Scheduler", () => section(root, "Scheduler · برنامهٔ زمانی", "هفته از شنبه، رویدادهای هم‌پوشان کنار هم، خط «اکنون» و تعطیلی جمعه.", (h) => {
    const days = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
    const ev = (title, time, color, top, len, col = 0, cols = 1) => ({ title, time, color, top, len, col, cols });
    const events = { 0: [ev("جلسهٔ تیم", "۰۹:۰۰ تا ۱۰:۳۰", "chart-1", 1, 1.5)], 1: [ev("مشاوره", "۱۱:۰۰", "chart-3", 3, 1, 0, 2), ev("بازبینی", "۱۱:۳۰", "chart-7", 3.5, 1.5, 1, 2)], 2: [ev("ناهار", "۱۳:۰۰", "chart-4", 5, 1)], 3: [ev("دمو", "۱۵:۰۰", "chart-5", 7, 1.5)] };
    const HOUR = 44, COL = 70, HOURS = 9;
    componentSet(h, "Scheduler", {
      axes: { View: ["Week"] },
      build: () => F({ name: "Scheduler", dir: "V", gap: "space/3", w: 56 + COL * 7 + 2 }, [
        F({ name: "Bar", dir: "H", gap: "space/2", w: "fill", cross: "center" }, [
          I("chevron-right", 18, "text-secondary"), button({ label: "امروز", size: "sm" }), I("chevron-left", 18, "text-secondary"),
          T("آبان ۱۴۰۵", { style: "Text md/Semibold", color: "text-primary" }), Spacer(),
          F({ name: "Views", dir: "H", gap: 2, p: 3, radius: "radius/md", fill: "bg-muted" }, [F({ name: "Week", dir: "H", px: "space/3", h: 30, cross: "center", radius: "radius/sm", fill: "bg-elevated" }, [T("هفته", { style: "Text sm/Medium", color: "text-primary" })]), F({ name: "Day", dir: "H", px: "space/3", h: 30, cross: "center" }, [T("روز", { style: "Text sm/Medium", color: "text-tertiary" })])]),
        ]),
        F({ name: "Grid", dir: "H", gap: 0, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", clip: true, cross: "start" }, [
          F({ name: "Times", dir: "V", gap: 0, w: 56, pt: 52 }, Array.from({ length: HOURS }, (_, i) => F({ name: "Hour", dir: "H", w: 56, h: HOUR, pe: 8, align: "end" }, [T(i ? fa(`${String(8 + i).padStart(2, "0")}:۰۰`) : "", { style: "Text xs/Regular", color: "text-quaternary", size: 11 })]))),
          ...days.map((d, i) => F({ name: `Day ${d}`, dir: "V", gap: 0, w: COL, sides: [0, 0, 0, 1], stroke: "border-secondary", fill: i === 0 ? "brand/500" : undefined, fillOpacity: i === 0 ? 0.04 : undefined }, [
            F({ name: "Head", dir: "V", gap: 2, h: 52, w: "fill", cross: "center", align: "center", sides: [0, 0, 1, 0], stroke: "border-secondary" }, [
              T(d, { style: "Text xs/Regular", color: i === 6 ? "text-error" : "text-tertiary" }),
              F({ name: "Date", dir: "H", w: 28, h: 28, align: "center", cross: "center", radius: "radius/full", fill: i === 0 ? "bg-brand" : undefined }, [T(fa(16 + i), { style: "Text sm/Semibold", color: i === 0 ? "text-on-brand" : i === 6 ? "text-error" : "text-primary" })]),
            ]),
            F({ name: "Body", dir: "none", w: COL, h: HOUR * HOURS }, [
              ...Array.from({ length: HOURS }, (_, k) => R({ w: COL, h: 1, fill: "border-secondary", name: "Line", x: 0, y: k * HOUR })),
              ...(events[i] || []).map((e) => F({ name: "Event", dir: "V", gap: 1, px: 6, py: 4, w: (COL - 6) / e.cols - 2, h: e.len * HOUR - 2, radius: "radius/md", fill: e.color, fillOpacity: 0.18, sides: [0, 3, 0, 0], stroke: e.color, x: 3 + e.col * ((COL - 6) / e.cols), y: e.top * HOUR + 1 }, [
                T(e.title, { style: "Text xs/Semibold", color: "text-primary", size: 11, weight: "semibold", maxLines: 1, w: "fill" }),
                T(e.time, { style: "Text xs/Regular", color: "text-secondary", size: 10 }),
              ])),
              i === 0 && R({ w: COL, h: 2, fill: "text-error", name: "Now", x: 0, y: 2.3 * HOUR }),
            ].filter(Boolean)),
          ])),
        ]),
      ]),
      cols: 1,
      docs: "scheduler",
    });
  }));
}
