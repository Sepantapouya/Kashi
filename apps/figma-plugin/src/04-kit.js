// ابزار ساخت Component Set و صفحه‌های کیت

/** حاصل‌ضرب دکارتی ویژگی‌ها: { Size: ["sm","md"], State: [...] } → [{Size, State}, ...] */
function combos(axes) {
  return Object.entries(axes).reduce(
    (acc, [k, values]) => acc.flatMap((a) => values.map((v) => Object.assign({}, a, { [k]: v }))),
    [{}],
  );
}

/** صفحهٔ کیت: یک ستون عمودی با سربرگ */
function kitPage(name, title, description) {
  // صفحه را main از قبل ساخته و فعال کرده (documentAccess: dynamic-page)
  const page = S.nextPage || figma.createPage();
  S.nextPage = null;
  page.name = name;
  const root = F({ name: "Kashi · " + title, dir: "V", gap: 72, p: 64, fill: "bg-primary", w: 1440 }, [
    F({ name: "Header", dir: "V", gap: 8, w: "fill" }, [
      T("Kashi UI · کاشی", { style: "Text sm/Semibold", color: "text-brand" }),
      T(title, { style: "Display 3xl/Semibold", color: "text-primary" }),
      description && T(description, { style: "Text md/Regular", color: "text-tertiary", w: 760 }),
    ]),
  ]);
  page.appendChild(root);
  setThemeMode(root);
  return { page, root };
}

function setThemeMode(node) {
  const theme = S.collections["Kashi · Theme"];
  if (!theme) return;
  const mode = theme.modes[S.theme === "dark" ? "Dark" : "Light"];
  if (!mode) return;
  try { node.setExplicitVariableModeForCollection(theme.node, mode); } catch (e) { /* API قدیمی */ }
}

/**
 * ساخت یک کامپوننت با variant ها.
 * opts: { axes, build(props) → Frame, text: {Prop: [nodeName, default]}, bools: {Prop: [nodeName, default]}, cols, description, docs }
 */
function componentSet(section, name, opts) {
  const list = opts.axes ? combos(opts.axes) : [{}];
  const comps = [];
  for (const props of list) {
    const frame = opts.build(props);
    const comp = figma.createComponentFromNode(frame);
    const entries = Object.entries(props);
    comp.name = entries.length ? entries.map(([k, v]) => `${k}=${v}`).join(", ") : name;
    section.appendChild(comp);
    comps.push(comp);
    S.stats.components++;
  }
  let node;
  if (comps.length > 1 || opts.axes) {
    node = figma.combineAsVariants(comps, section);
    node.name = name;
    node.layoutMode = "HORIZONTAL";
    node.layoutWrap = "WRAP";
    node.itemSpacing = pick(opts.gap, 24);
    node.counterAxisSpacing = pick(opts.gap, 24);
    node.paddingTop = node.paddingBottom = node.paddingLeft = node.paddingRight = 32;
    node.counterAxisAlignItems = "MIN";
    // RTL: ردیف‌ها از راست شروع شوند
    node.primaryAxisAlignItems = "MAX";
    const widest = Math.max(...comps.map((c) => c.width));
    const cols = opts.cols || Math.max(1, Math.min(comps.length, Math.floor(1200 / (widest + 24))));
    node.primaryAxisSizingMode = "FIXED";
    node.counterAxisSizingMode = "AUTO";
    node.resize(Math.min(1312, cols * widest + (cols - 1) * (pick(opts.gap, 24)) + 64), node.height);
    // RTL: هر ردیف از راست شروع شود؛ ترتیب variant ها در هر ردیف برعکس می‌شود
    for (let r = 0; r < comps.length; r += cols) {
      for (const c of comps.slice(r, r + cols).reverse()) node.appendChild(c);
    }
    node.fills = [paint("bg-secondary")];
    node.strokes = [paint("border-secondary")];
    node.dashPattern = [6, 4];
    node.cornerRadius = 16;
    S.stats.sets++;
  } else {
    node = comps[0];
  }
  node.description = opts.description || "";
  if (opts.docs) node.documentationLinks = [{ uri: `https://kashi.sepantapouya.com/components/${opts.docs}` }];

  // ویژگی‌های متنی و بولی که در همهٔ variant ها مشترک‌اند
  const owner = node;
  const wire = (map, type, field) => {
    for (const [prop, [nodeName, def]] of Object.entries(map || {})) {
      let key;
      try { key = owner.addComponentProperty(prop, type, def); } catch (e) { continue; }
      for (const c of comps) {
        for (const n of c.findAll((x) => x.name === nodeName)) {
          try { n.componentPropertyReferences = Object.assign({}, n.componentPropertyReferences, { [field]: key }); } catch (e) { /* داخل instance */ }
        }
      }
    }
  };
  wire(opts.text, "TEXT", "characters");
  wire(opts.bools, "BOOLEAN", "visible");
  return node;
}

/** بخش هر کامپوننت روی صفحه: عنوان، توضیح و خود component set */
function section(root, title, description, build) {
  const box = F({ name: title, dir: "V", gap: 20, w: "fill" }, [
    F({ name: "Heading", dir: "V", gap: 4, w: "fill" }, [
      T(title, { style: "Text xl/Semibold", color: "text-primary" }),
      description && T(description, { style: "Text sm/Regular", color: "text-tertiary", w: 760 }),
    ]),
  ]);
  root.appendChild(box);
  applySizing(box);
  const holder = F({ name: "Components", dir: "H", wrap: true, gap: 32, rowGap: 32, w: "fill", cross: "start" });
  box.appendChild(holder);
  applySizing(holder);
  build(holder);
  return box;
}

/** ساخت ایمن: خطای یک کامپوننت کل کیت را خراب نکند */
function safe(label, fn) {
  try { fn(); } catch (e) {
    S.errors = S.errors || [];
    S.errors.push(`${label}: ${e && e.message ? e.message : e}`);
  }
}
