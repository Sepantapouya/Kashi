import { readFileSync, writeFileSync } from "node:fs";
import { icons } from "../src/icons.js";
import { identicalSvgVariants } from "../src/svg-deduplication.js";

const file = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(readFileSync(file, "utf8"));
const redirects = identicalSvgVariants(icons);
for (const key of Object.keys(pkg.exports)) {
  if (/^\.\/svg\/(?:curved|two-tone)\/[a-z0-9-]+\.svg$/.test(key)) delete pkg.exports[key];
}
Object.assign(pkg.exports, redirects);
writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
console.log(`Mapped ${Object.keys(redirects).length} identical SVG variants to their base files.`);
