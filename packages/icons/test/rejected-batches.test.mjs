import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { icons } from "../dist/index.js";

// The unpublished batch was rejected for repeating existing base concepts.
// Keep the canonical alternatives available without reintroducing its aliases.
test("rejected alternate drawings stay out of the catalog", () => {
  const audit = JSON.parse(readFileSync(new URL("../audits/rejected-7500-batch.json", import.meta.url), "utf8"));
  assert.equal(audit.records.length, audit.removedCount);
  for (const { removed, retained } of audit.records) {
    assert.ok(!Object.hasOwn(icons, removed), `${removed} was rejected`);
    assert.ok(Object.hasOwn(icons, retained), `${retained} is the retained alternative`);
  }
});
