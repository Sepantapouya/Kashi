// سرور را با یک کلاینت واقعی MCP (در حافظه) صدا می‌زند و خروجی هر ابزار را بررسی می‌کند
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { server } from "../dist/server.js";

const client = new Client({ name: "kashi-test", version: "0.0.0" });
const call = async (name, args = {}) => {
  const r = await client.callTool({ name, arguments: args });
  return { text: r.content.map((c) => c.text).join("\n"), isError: !!r.isError };
};

before(async () => {
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);
});
after(() => client.close());

test("instructions and the full tool list", async () => {
  assert.match(client.getInstructions(), /kashi_get_docs/);
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ["kashi_create_theme", "kashi_get_docs", "kashi_get_icon", "kashi_get_tokens", "kashi_list_docs", "kashi_persian", "kashi_search_docs", "kashi_search_icons"]);
  for (const t of tools) assert.ok(t.description.length > 40, `${t.name} needs a useful description`);
});

test("docs: list, get by component name and slug, helpful miss", async () => {
  const list = await call("kashi_list_docs");
  assert.match(list.text, /`components\/button`/);
  assert.match(list.text, /`persian\/date-picker`/);

  const button = await call("kashi_get_docs", { name: "Button" });
  assert.match(button.text, /^# دکمه \(Button\)/);
  assert.match(button.text, /\| variant \|/, "props table is included");
  assert.match(button.text, /```tsx\n<Button variant="primary">/, "live demos become code blocks");
  assert.doesNotMatch(button.text, /<Demo|<Props|^import Demo/m, "no MDX left over");

  assert.match((await call("kashi_get_docs", { name: "persian/input" })).text, /NationalIdInput|کد ملی/);
  assert.match((await call("kashi_get_docs", { name: "installation" })).text, /npm i @kashi-ui\/react @kashi-ui\/css/);
  assert.match((await call("kashi_get_docs", { name: "tailwind" })).text, /@import "@kashi-ui\/tailwind";\n@import "tailwindcss";/);

  const miss = await call("kashi_get_docs", { name: "datepickr" });
  assert.equal(miss.isError, true);
});

test("docs search in Persian and English", async () => {
  assert.match((await call("kashi_search_docs", { query: "شبا" })).text, /persian\/input/);
  assert.match((await call("kashi_search_docs", { query: "tooltip" })).text, /components\/tooltip/);
});

test("icons: search and get in another style", async () => {
  const s = await call("kashi_search_icons", { query: "calendar", limit: 5 });
  assert.match(s.text, /<IconCalendar \/>/);
  assert.match(s.text, /@kashi-ui\/icons\/react/);
  assert.match((await call("kashi_search_icons", { query: "سبد خرید" })).text, /cart|basket|shopping/);

  const g = await call("kashi_get_icon", { name: "heart", variant: "bold", size: 24 });
  assert.match(g.text, /<IconHeart variant="bold" size=\{24\} \/>/);
  assert.match(g.text, /<svg[^>]+width="24"/);
  assert.equal((await call("kashi_get_icon", { name: "no-such-icon" })).isError, true);
});

test("tokens and theme", async () => {
  assert.match((await call("kashi_get_tokens", { group: "theme" })).text, /"dark"/);
  const theme = await call("kashi_create_theme", { brand: "#3d5ef8", radius: 1.5 });
  assert.match(theme.text, /--k-/);
  assert.match(theme.text, /createTheme\(\{ brand: "#3d5ef8", radius: 1.5 \}\)/);
});

test("Persian utilities", async () => {
  assert.match((await call("kashi_persian", { action: "validate_national_id", value: "0013542419" })).text, /"valid": true/);
  assert.match((await call("kashi_persian", { action: "validate_national_id", value: "0013542418" })).text, /"valid": false/);
  assert.match((await call("kashi_persian", { action: "to_gregorian", value: "۱۴۰۵/۰۸/۱۰" })).text, /"gregorian": "2026-11-01"/);
  assert.match((await call("kashi_persian", { action: "to_jalali", value: "2026-11-01" })).text, /آبان/);
  assert.match((await call("kashi_persian", { action: "number_to_words", value: "۱۲۵۰۰" })).text, /دوازده هزار و پانصد/);
  assert.equal((await call("kashi_persian", { action: "to_gregorian", value: "نه" })).isError, true);
});

test("every docs page is a readable resource", async () => {
  const { resources } = await client.listResources();
  assert.ok(resources.length >= 60);
  const button = resources.find((r) => r.name === "components/button");
  const r = await client.readResource({ uri: button.uri });
  assert.match(r.contents[0].text, /# دکمه/);
});
