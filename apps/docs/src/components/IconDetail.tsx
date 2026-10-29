// صفحهٔ هر آیکون: شبکهٔ طراحی، اندازه‌ها، ضخامت دلخواه، دانلود و کد استفاده
import { useState } from "react";
import { Badge, CopyButton, Slider, Tab, TabList, TabPanel, Tabs } from "@kashi-ui/react";
import { categories, icons, iconSvg, type IconName } from "@kashi-ui/icons";
import { Icon } from "@kashi-ui/icons/react";
import { toFaDigits } from "@kashi-ui/persian";
import "../styles/icons.css";

type Category = keyof typeof categories;
const fa = (n: number) => toFaDigits(String(n).replace(".", "٫"));

function Code({ code }: { code: string }) {
  return (
    <div className="ib-code">
      <pre dir="ltr"><code>{code}</code></pre>
      <CopyButton value={code} size="xs" variant="tertiary" iconOnly />
    </div>
  );
}

export function IconDetail({ name }: { name: IconName }) {
  const [stroke, setStroke] = useState(1.5);
  const icon = icons[name];
  const sw = stroke === 1.5 ? "" : ` strokeWidth={${stroke}}`;
  const svgCode = iconSvg(name, { size: 24, strokeWidth: stroke }) ?? "";

  return (
    <div className="ib-detail">
      <div className="ib-inspect">
        <div className="ib-stage" aria-hidden="true">
          <Icon name={name} size={160} strokeWidth={stroke} />
        </div>
        <div className="ib-meta">
          <div className="ib-meta__tags">
            <Badge size="sm">{categories[icon.category as Category]}</Badge>
            <Badge size="sm" tone="brand"><span dir="ltr">{icon.component}</span></Badge>
            {icon.directional && <Badge tone="warning" size="sm">جهت‌دار</Badge>}
          </div>
          <Slider label="ضخامت خط" min={1} max={2.25} step={0.25} value={stroke} onChange={setStroke} showValue format={fa} />
          <div className="ib-sizes" aria-label="اندازه‌ها">
            {[16, 20, 24, 32, 48].map((s) => (
              <figure key={s}>
                <Icon name={name} size={s} strokeWidth={stroke} />
                <figcaption>{fa(s)}</figcaption>
              </figure>
            ))}
          </div>
          {icon.keywords.length > 0 && <p className="ib-meta__keys"><span>کلیدواژه‌ها:</span> {icon.keywords.join("، ")}</p>}
          <div className="ib-actions">
            <CopyButton value={svgCode} size="sm" labels={{ copy: "کپی SVG", copied: "کپی شد" }} />
            <CopyButton value={`<${icon.component}${sw} />`} size="sm" labels={{ copy: "کپی JSX", copied: "کپی شد" }} />
            <a className="k-btn k-btn--secondary k-btn--sm" href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`} download={`${name}.svg`}>
              <Icon name="download" />دانلود SVG
            </a>
          </div>
        </div>
      </div>
      {icon.directional && (
        <p className="ib-note">در رابط راست‌به‌چپ «بعدی» به چپ اشاره می‌کند؛ اگر طرح شما دوجهته است، با <code dir="ltr">mirror</code> قرینه‌اش کنید.</p>
      )}
      <Tabs defaultValue="react" size="sm">
        <TabList aria-label="نحوهٔ استفاده">
          <Tab value="react">React</Tab>
          <Tab value="html">HTML</Tab>
          <Tab value="sprite">اسپرایت</Tab>
          <Tab value="js">JavaScript</Tab>
          <Tab value="figma">فیگما</Tab>
        </TabList>
        <TabPanel value="react"><Code code={`import { ${icon.component} } from "@kashi-ui/icons/react";\n\n<${icon.component}${sw} />\n<${icon.component} size={24} title="${icon.title}" />\n\n// یا با نام\nimport { Icon } from "@kashi-ui/icons/react";\n<Icon name="${name}" />`} /></TabPanel>
        <TabPanel value="html"><Code code={svgCode} /></TabPanel>
        <TabPanel value="sprite"><Code code={`<svg width="20" height="20" aria-hidden="true">\n  <use href="/sprite.svg#k-${name}" />\n</svg>\n\n<!-- فایل جدا: @kashi-ui/icons/svg/${name}.svg -->`} /></TabPanel>
        <TabPanel value="js"><Code code={`import { iconSvg } from "@kashi-ui/icons";\n\nel.innerHTML = iconSvg("${name}", { size: 24${stroke === 1.5 ? "" : `, strokeWidth: ${stroke}`} });`} /></TabPanel>
        <TabPanel value="figma"><Code code={`Icon / ${name}`} /></TabPanel>
      </Tabs>
    </div>
  );
}
