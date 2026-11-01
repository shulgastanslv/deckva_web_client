import assert from "node:assert/strict";
import { test } from "node:test";
import {
  activateFor,
  chromeRole,
  isPinnedRole,
  objectRole,
  skipsInsightText,
} from "./roles";

test("shared chrome is only the corner blocks", () => {
  assert.equal(chromeRole("number"), "number");
  assert.equal(chromeRole("handle"), "handle");
  assert.equal(chromeRole("swipe"), "swipe");
  for (const other of [
    "split",
    "frame",
    "social",
    "cue",
    "code",
    "caption",
    "arrow",
    "progress",
    "cta",
  ]) {
    assert.equal(chromeRole(other), null, other);
  }
  assert.equal(chromeRole(null), null);
});

test("insight text skips chrome labels and keeps body copy", () => {
  for (const role of ["number", "handle", "swipe", "cue", "social", "cta"]) {
    assert.equal(skipsInsightText(role), true, role);
  }
  assert.equal(skipsInsightText("caption"), false);
  assert.equal(skipsInsightText("split"), false);
  assert.equal(skipsInsightText(""), false);
  assert.equal(skipsInsightText(undefined), false);
});

test("double-click and pinning come from the role catalog", () => {
  assert.equal(activateFor("split"), "split");
  assert.equal(activateFor("frame"), "frame");
  assert.equal(activateFor("number"), null);
  assert.equal(activateFor(null), null);
  assert.equal(isPinnedRole({ swibpRole: "split" }), true);
  assert.equal(isPinnedRole({ swibpRole: "frame" }), false);
  assert.equal(isPinnedRole(null), false);
  assert.equal(objectRole("not-a-role"), null);
  assert.equal(objectRole("code"), "code");
});
