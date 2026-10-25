import assert from "node:assert/strict";
import { test } from "node:test";

import { listBuiltinTemplateSummaries, readBuiltinTemplate } from "./catalog";

test("templates 1-10 are readable carousels on different topics", async () => {
  const list = await listBuiltinTemplateSummaries();
  assert.deepEqual(
    list.map((item) => item.id),
    Array.from({ length: 10 }, (_, index) => `builtin:${index + 1}`),
  );

  const categories = new Set(list.map((item) => item.category));
  assert.equal(categories.size, 10);

  for (const item of list) {
    const detail = await readBuiltinTemplate(item.id);
    assert.ok(detail);
    assert.equal(detail.title, item.title);
    assert.equal(detail.aspectRatio, "4:5");
    assert.ok(detail.slides.length >= 3);
    assert.ok(detail.slides.every((slide) => Array.isArray(slide.objects) && slide.objects.length > 0));
  }
});
