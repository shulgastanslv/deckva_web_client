import assert from "node:assert/strict";
import { test } from "node:test";
import { cachedRead, forgetCachedRead } from "./read-cache";

test("concurrent reads share one call", async () => {
  forgetCachedRead("shared");
  let calls = 0;
  const load = () => {
    calls += 1;
    return Promise.resolve({ success: true, calls });
  };
  const [a, b] = await Promise.all([
    cachedRead("shared", 1000, load),
    cachedRead("shared", 1000, load),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
});

test("a second read inside the ttl does not call again", async () => {
  forgetCachedRead("ttl");
  let calls = 0;
  const load = () => {
    calls += 1;
    return Promise.resolve({ success: true, calls });
  };
  await cachedRead("ttl", 1000, load);
  await cachedRead("ttl", 1000, load);
  assert.equal(calls, 1);
});

test("a failed read is not reused", async () => {
  forgetCachedRead("fail");
  let calls = 0;
  const load = () => {
    calls += 1;
    return Promise.resolve({ success: false, calls });
  };
  await cachedRead("fail", 1000, load);
  await cachedRead("fail", 1000, load);
  assert.equal(calls, 2);
});

test("forgetting a key lets the next read through", async () => {
  forgetCachedRead("drop");
  let calls = 0;
  const load = () => {
    calls += 1;
    return Promise.resolve({ success: true, calls });
  };
  await cachedRead("drop", 10_000, load);
  forgetCachedRead("drop");
  await cachedRead("drop", 10_000, load);
  assert.equal(calls, 2);
});
