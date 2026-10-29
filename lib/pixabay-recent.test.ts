import assert from "node:assert/strict";
import test from "node:test";

import { rememberIcon, readRecentIcons, type RecentIcon } from "./pixabay-recent";

const arrow: RecentIcon = {
  id: "195893",
  name: "Arrow",
  previewUrl: "https://cdn.pixabay.com/photo/arrow_150.jpg",
  pageUrl: "https://pixabay.com/en/arrow-195893/",
  type: "vector",
};

test("rememberIcon moves a repeat to the front and caps the list", () => {
  const first = rememberIcon([], arrow);
  const second = rememberIcon(first, { ...arrow, id: "2", name: "Box" });
  const again = rememberIcon(second, arrow);
  assert.deepEqual(
    again.map((item) => item.id),
    ["195893", "2"],
  );
});

test("readRecentIcons drops malformed rows", () => {
  const raw = JSON.stringify([arrow, { id: "x" }, { ...arrow, id: "3", type: "poster" }]);
  assert.deepEqual(readRecentIcons(raw), [arrow]);
});
