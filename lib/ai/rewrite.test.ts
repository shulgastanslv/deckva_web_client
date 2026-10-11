import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseRewriteResult } from "./rewrite";

describe("parseRewriteResult", () => {
  it("returns rewritten texts in order", () => {
    const texts = parseRewriteResult({ texts: ["A", "B", "C"] }, 2);
    assert.deepEqual(texts, ["A", "B"]);
  });

  it("pads when model returns fewer strings", () => {
    const texts = parseRewriteResult({ texts: ["Only"] }, 3);
    assert.deepEqual(texts, ["Only", "Only", "Only"]);
  });
});
