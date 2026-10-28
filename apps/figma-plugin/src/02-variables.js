// متغیرها (Variables)، استایل‌های متن و افکت — همه از روی توکن‌های @kashi-ui/tokens

let existingVars = null;
let existingCollections = null;

async function getCollection(name, modes) {
  existingCollections = existingCollections || (await figma.variables.getLocalVariableCollectionsAsync());
  let c = existingCollections.find((x) => x.name === name);
  if (!c) c = figma.variables.createVariableCollection(name);
  // نام mode ها را یکی می‌کند و mode های کم را می‌سازد
  const ids = {};
  modes.forEach((m, i) => {
    if (c.modes[i]) {
      if (c.modes[i].name !== m) c.renameMode(c.modes[i].modeId, m);
      ids[m] = c.modes[i].modeId;
    } else {
      // پلن رایگان فیگما فقط یک mode دارد؛ بقیه را بی‌صدا رد می‌کنیم
      try { ids[m] = c.addMode(m); } catch (e) { S.limitedModes = true; }
    }
  });
  S.collections[name] = { node: c, modes: ids };
  return { c, ids };
}

/** مقدار برای mode؛ اگر mode ساخته نشده باشد (پلن رایگان) رد می‌شود */
function setVal(v, ids, mode, value) {
  if (ids[mode]) v.setValueForMode(ids[mode], value);
}

async function getVariable(c, name, type, scopes) {
  existingVars = existingVars || (await figma.variables.getLocalVariablesAsync());
  let v = existingVars.find((x) => x.name === name && x.variableCollectionId === c.id);
  if (!v) {
    v = figma.variables.createVariable(name, c, type);
    existingVars.push(v);
  }
  if (scopes) v.scopes = scopes;
  S.varById[v.id] = v;
  S.stats.variables++;
  return v;
}

const COLOR_SCOPES = {
  bg: ["FRAME_FILL", "SHAPE_FILL"],
  text: ["TEXT_FILL"],
  border: ["STROKE_COLOR"],
};
const rgbaObj = ([r, g, b, a]) => ({ r, g, b, a });

async function buildVariables() {
  existingVars = null;
  existingCollections = null;

  // ---- پالت
  const prim = await getCollection("Kashi · Primitives", ["Value"]);
  for (const [scale, steps] of Object.entries(TOKENS.palette)) {
    for (const [step, hex] of Object.entries(steps)) {
      const v = await getVariable(prim.c, `color/${scale}/${step}`, "COLOR", ["ALL_SCOPES"]);
      v.setValueForMode(prim.ids.Value, rgbaObj(hexToRgba(hex)));
      S.vars[`color/${scale}/${step}`] = v;
    }
  }
  // brand فقط نام مستعار است؛ برای عوض کردن رنگ برند این‌ها را به پالت دیگری وصل کنید
  for (const step of Object.keys(TOKENS.palette[TOKENS.brandScale])) {
    const v = await getVariable(prim.c, `color/brand/${step}`, "COLOR", ["ALL_SCOPES"]);
    v.setValueForMode(prim.ids.Value, figma.variables.createVariableAlias(S.vars[`color/${TOKENS.brandScale}/${step}`]));
    v.description = "رنگ برند — برای تغییر برند، این را به یک رنگ دیگر از پالت وصل کنید";
    S.vars[`color/brand/${step}`] = v;
  }

  // ---- تم تیره و روشن
  const theme = await getCollection("Kashi · Theme", S.theme === "light" ? ["Light", "Dark"] : ["Dark", "Light"]);
  for (const token of Object.keys(TOKENS.themes.dark)) {
    const scopes = COLOR_SCOPES[token.split("-")[0]] || ["ALL_SCOPES"];
    const v = await getVariable(theme.c, token.replace(/^(bg|text|border)-/, "$1/"), "COLOR", scopes);
    for (const [mode, key] of [["Dark", "dark"], ["Light", "light"]]) {
      const val = TOKENS.themes[key][token];
      setVal(v, theme.ids, mode, val.alias ? figma.variables.createVariableAlias(S.vars[`color/${val.alias[0]}/${val.alias[1]}`]) : rgbaObj(val.rgba));
    }
    S.vars[token] = v;
  }

  // ---- گردی گوشه‌ها با چهار حالت (همان --k-radius-factor)
  const radius = await getCollection("Kashi · Radius", ["Default", "Sharp", "Soft", "Round"]);
  const factors = { Default: 1, Sharp: 0, Soft: 0.5, Round: 1.75 };
  const radii = Object.assign({}, TOKENS.radius, { checkbox: 5 });
  for (const [k, base] of Object.entries(radii)) {
    const v = await getVariable(radius.c, `radius/${k}`, "FLOAT", ["CORNER_RADIUS"]);
    for (const [mode, f] of Object.entries(factors)) setVal(v, radius.ids, mode, k === "full" ? 9999 : base * f);
    S.vars[`radius/${k}`] = v;
    S.numbers[`radius/${k}`] = base;
  }

  // ---- فاصله‌ها
  const space = await getCollection("Kashi · Spacing", ["Value"]);
  for (const [k, val] of Object.entries(TOKENS.space)) {
    const v = await getVariable(space.c, `space/${k.replace(".", "_")}`, "FLOAT", ["GAP", "WIDTH_HEIGHT"]);
    v.setValueForMode(space.ids.Value, val);
    S.vars[`space/${k}`] = v;
  }

  // ---- تراکم: ارتفاع و فاصلهٔ داخلی کنترل‌ها (همان --k-density)
  const density = await getCollection("Kashi · Density", ["Default", "Compact", "Comfortable"]);
  const dens = { Default: 1, Compact: 0.875, Comfortable: 1.125 };
  const controls = {
    "control/height/xs": 28, "control/height/sm": 36, "control/height/md": 40, "control/height/lg": 44, "control/height/xl": 48,
    "control/padding/xs": 8, "control/padding/sm": 12, "control/padding/md": 14, "control/padding/lg": 18, "control/padding/xl": 20,
    "input/height/sm": 36, "input/height/md": 40, "input/height/lg": 44, "input/padding": 14,
    "card/padding/sm": 16, "card/padding/md": 24, "card/padding/lg": 32,
    "menu/item-height": 36, "tab/height": 40, "alert/padding": 16,
  };
  for (const [k, base] of Object.entries(controls)) {
    const v = await getVariable(density.c, k, "FLOAT", [k.includes("height") ? "WIDTH_HEIGHT" : "GAP"]);
    for (const [mode, f] of Object.entries(dens)) setVal(v, density.ids, mode, Math.round(base * f));
    S.vars[k] = v;
    S.numbers[k] = base;
  }

  // ---- تایپوگرافی؛ فونت دلخواه (حتی فونت پولی) با عوض کردن یک متغیر
  const typo = await getCollection("Kashi · Typography", ["Default", "Compact", "Large"]);
  const scales = { Default: 1, Compact: 0.9375, Large: 1.125 };
  const fam = await getVariable(typo.c, "font/family/sans", "STRING", ["FONT_FAMILY"]);
  const disp = await getVariable(typo.c, "font/family/display", "STRING", ["FONT_FAMILY"]);
  for (const mode of Object.keys(typo.ids)) {
    setVal(fam, typo.ids, mode, S.family);
    setVal(disp, typo.ids, mode, S.family);
  }
  fam.description = "نام فونت متن؛ هر فونتی که روی سیستم نصب است (مثل IRANSans یا Yekan Bakh)";
  S.vars["font/family/sans"] = fam;
  S.vars["font/family/display"] = disp;
  for (const w of WEIGHTS) {
    const v = await getVariable(typo.c, `font/weight/${w}`, "STRING", ["FONT_STYLE"]);
    for (const mode of Object.keys(typo.ids)) setVal(v, typo.ids, mode, S.fonts[w].style);
    S.vars[`font/weight/${w}`] = v;
  }
  for (const [k, size] of Object.entries(TOKENS.font.size)) {
    const v = await getVariable(typo.c, `font/size/${k}`, "FLOAT", ["FONT_SIZE"]);
    for (const [mode, f] of Object.entries(scales)) setVal(v, typo.ids, mode, Math.round(size * f));
    S.vars[`font/size/${k}`] = v;
    for (const [kind, leading] of [["text", TOKENS.font.leading.normal], ["display", TOKENS.font.leading.tight]]) {
      const lh = await getVariable(typo.c, `font/line-height/${kind}-${k}`, "FLOAT", ["LINE_HEIGHT"]);
      for (const [mode, f] of Object.entries(scales)) setVal(lh, typo.ids, mode, Math.round(size * f * leading));
      S.vars[`font/line-height/${kind}-${k}`] = lh;
    }
  }
  // خط ثابت متن کنار چک‌باکس، رادیو و سوییچ (1.25rem در CSS)
  const ctl = await getVariable(typo.c, "font/line-height/control", "FLOAT", ["LINE_HEIGHT"]);
  for (const [mode, f] of Object.entries(scales)) setVal(ctl, typo.ids, mode, Math.round(20 * f));
  S.vars["font/line-height/control"] = ctl;

  await buildEffectVariables();
}

// ---------- سایه‌ها به شکل متغیر ----------
/**
 * هر لایهٔ سایه پنج متغیر در مجموعهٔ تم دارد (رنگ، x، y، محو، گسترش) تا در تیره و روشن فرق کند.
 * لایه‌ای که در یک تم نیست، با رنگ شفاف پر می‌شود.
 */
async function buildEffectVariables() {
  const theme = S.collections["Kashi · Theme"];
  const tokens = Object.keys(TOKENS.effects.dark);
  for (const token of tokens) {
    const dark = TOKENS.effects.dark[token] || [];
    const light = TOKENS.effects.light[token] || [];
    const n = Math.max(dark.length, light.length);
    EFFECT_LAYERS[token] = [];
    for (let i = 0; i < n; i++) {
      const pickLayer = (mode) => (mode === "dark" ? dark : light)[i] || null;
      const type = (dark[i] || light[i]).type;
      const base = `effect/${token}/${i + 1}`;
      const vars = {
        color: await getVariable(theme.node, `${base}/color`, "COLOR", ["EFFECT_COLOR"]),
        x: await getVariable(theme.node, `${base}/x`, "FLOAT", ["EFFECT_FLOAT"]),
        y: await getVariable(theme.node, `${base}/y`, "FLOAT", ["EFFECT_FLOAT"]),
        blur: await getVariable(theme.node, `${base}/blur`, "FLOAT", ["EFFECT_FLOAT"]),
        spread: await getVariable(theme.node, `${base}/spread`, "FLOAT", ["EFFECT_FLOAT"]),
      };
      for (const [mode, key] of [["Dark", "dark"], ["Light", "light"]]) {
        const l = pickLayer(key) || { x: 0, y: 0, blur: 0, spread: 0, rgba: [0, 0, 0, 0] };
        setVal(vars.color, theme.modes, mode, rgbaObj(l.rgba));
        setVal(vars.x, theme.modes, mode, l.x);
        setVal(vars.y, theme.modes, mode, l.y);
        setVal(vars.blur, theme.modes, mode, l.blur);
        setVal(vars.spread, theme.modes, mode, l.spread);
      }
      EFFECT_LAYERS[token].push({
        type,
        vars,
        value: (mode) => {
          const l = pickLayer(mode) || { x: 0, y: 0, blur: 0, spread: 0, rgba: [0, 0, 0, 0] };
          return { color: rgbaObj(l.rgba), x: l.x, y: l.y, blur: l.blur, spread: l.spread };
        },
      });
    }
  }
}

/** استایل‌هایی که نسخه‌های قبلی پلاگین ساخته بودند؛ حالا همه‌چیز Variable است */
async function removeLegacyStyles() {
  let removed = 0;
  for (const st of await figma.getLocalTextStylesAsync()) {
    if (/^(Display|Text) [0-9a-z]+\/(Regular|Medium|Semibold|Bold)$/.test(st.name)) { st.remove(); removed++; }
  }
  for (const st of await figma.getLocalEffectStylesAsync()) {
    if (/^(Dark|Light)\/(Shadow\/|Focus ring\/|Skeuomorphic|Button|Input|Elevated|Popover)/.test(st.name)) { st.remove(); removed++; }
  }
  return removed;
}
