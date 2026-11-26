import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { icons } from "../dist/index.js";

test("visual review keeps distinct drawings and excludes very close duplicates", () => {
  const review = JSON.parse(readFileSync(new URL("../audits/reviewed-7500-batch.json", import.meta.url), "utf8"));
  assert.equal(review.restored.length, review.restoredCount);
  assert.equal(review.rejected.length, review.rejectedCount);
  assert.equal(review.restoredCount + review.rejectedCount, 300);
  for (const { name } of review.restored) assert.ok(Object.hasOwn(icons, name), `${name} has a distinct drawing`);
  for (const { name, retained } of review.rejected) {
    assert.ok(!Object.hasOwn(icons, name), `${name} was too close to ${retained}`);
    assert.ok(Object.hasOwn(icons, retained), `${retained} is retained`);
  }
});
