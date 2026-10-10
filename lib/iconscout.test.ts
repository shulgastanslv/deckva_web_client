import assert from "node:assert/strict";
import test from "node:test";

import { readIconScoutDownloadUrl, readIconScoutHits, readIconScoutPage, sanitizeIconSvg } from "./iconscout";

test("readIconScoutHits keeps iconscout previews and drops the rest", () => {
  const hits = readIconScoutHits({
    response: {
      items: {
        data: [
          {
            uuid: "a",
            name: "Arrow",
            urls: { png_256: "https://cdn.iconscout.com/icon/free/png-256/arrow.png" },
          },
          {
            uuid: "b",
            name: "Remote",
            urls: { png_256: "https://evil.example/arrow.png" },
          },
          { name: "Missing id", urls: { png_256: "https://cdn.iconscout.com/x.png" } },
          {
            uuid: "c",
            name: "Vintage camera",
            urls: { thumb: "https://cdn3d.iconscout.com/3d/premium/thumb/camera.png" },
          },
        ],
      },
    },
  });

  assert.deepEqual(hits, [
    { id: "a", name: "Arrow", previewUrl: "https://cdn.iconscout.com/icon/free/png-256/arrow.png" },
    { id: "c", name: "Vintage camera", previewUrl: "https://cdn3d.iconscout.com/3d/premium/thumb/camera.png" },
  ]);
});

test("readIconScoutPage reads the result window", () => {
  const page = readIconScoutPage({
    response: {
      items: {
        current_page: 2,
        last_page: 8,
        total: 1500,
        data: [{ uuid: "a", name: "Arrow", urls: { png_256: "https://cdn.iconscout.com/icon/free/png-256/arrow.png" } }],
      },
    },
  });
  assert.equal(page.page, 2);
  assert.equal(page.lastPage, 8);
  assert.equal(page.total, 1500);
  assert.equal(page.items.length, 1);
});

test("readIconScoutDownloadUrl keeps signed iconscout hosts", () => {
  const url = readIconScoutDownloadUrl({
    response: { download: { download_url: "https://download.services.iconscout.com/file.svg" } },
  });
  assert.equal(url, "https://download.services.iconscout.com/file.svg");
  assert.equal(
    readIconScoutDownloadUrl({ response: { download: { download_url: "https://evil.example/file.svg" } } }),
    null,
  );
});

test("sanitizeIconSvg drops scripts and keeps the drawing", () => {
  const svg = sanitizeIconSvg(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><path d="M0 0"/></svg>`);
  assert.equal(svg?.includes("<script"), false);
  assert.equal(svg?.includes("<path"), true);
  assert.equal(sanitizeIconSvg("not svg"), null);
});
