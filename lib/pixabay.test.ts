import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPixabaySearchUrl,
  isPixabayId,
  isPixabayUrl,
  readPixabayAsset,
  readPixabayPage,
  sanitizeIconSvg,
} from "./pixabay";

test("isPixabayUrl keeps pixabay hosts", () => {
  assert.equal(isPixabayUrl("https://cdn.pixabay.com/photo/a.jpg"), true);
  assert.equal(isPixabayUrl("https://pixabay.com/get/x.jpg"), true);
  assert.equal(isPixabayUrl("https://evil.example/x.jpg"), false);
});

test("isPixabayId accepts numeric ids", () => {
  assert.equal(isPixabayId("195893"), true);
  assert.equal(isPixabayId("abc"), false);
});

test("buildPixabaySearchUrl encodes query and type", () => {
  const url = buildPixabaySearchUrl({
    key: "secret",
    query: "yellow flower",
    page: 2,
    imageType: "vector",
    order: "latest",
  });
  assert.match(url, /key=secret/);
  assert.match(url, /q=yellow\+flower|q=yellow%20flower/);
  assert.match(url, /image_type=vector/);
  assert.match(url, /page=2/);
  assert.match(url, /order=latest/);
  assert.match(url, /safesearch=true/);
});

test("readPixabayPage maps hits and pagination", () => {
  const page = readPixabayPage(
    {
      total: 1000,
      totalHits: 500,
      hits: [
        {
          id: 195893,
          pageURL: "https://pixabay.com/en/blossom-195893/",
          type: "vector",
          tags: "blossom, bloom, flower",
          previewURL: "https://cdn.pixabay.com/photo/2013/10/15/09/12/flower-195893_150.jpg",
          webformatURL: "https://pixabay.com/get/35bbf209e13e39d2_640.jpg",
        },
        {
          id: 2,
          tags: "bad",
          previewURL: "https://evil.example/x.jpg",
        },
      ],
    },
    2,
    24,
  );

  assert.equal(page.page, 2);
  assert.equal(page.lastPage, Math.ceil(500 / 24));
  assert.equal(page.total, 500);
  assert.deepEqual(page.items, [
    {
      id: "195893",
      name: "Blossom",
      previewUrl: "https://cdn.pixabay.com/photo/2013/10/15/09/12/flower-195893_150.jpg",
      pageUrl: "https://pixabay.com/en/blossom-195893/",
      type: "vector",
    },
  ]);
});

test("readPixabayAsset prefers vectorURL when present", () => {
  const asset = readPixabayAsset({
    hits: [
      {
        id: 10,
        pageURL: "https://pixabay.com/en/icon-10/",
        type: "vector",
        tags: "icon, arrow",
        previewURL: "https://cdn.pixabay.com/photo/icon-10_150.jpg",
        largeImageURL: "https://pixabay.com/get/icon-10_1280.jpg",
        vectorURL: "https://cdn.pixabay.com/photo/icon-10.svg",
      },
    ],
  });
  assert.equal(asset?.vectorUrl, "https://cdn.pixabay.com/photo/icon-10.svg");
  assert.equal(asset?.imageUrl, "https://pixabay.com/get/icon-10_1280.jpg");
  assert.equal(asset?.name, "Icon");
});

test("sanitizeIconSvg drops scripts and keeps the drawing", () => {
  const svg = sanitizeIconSvg(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><path d="M0 0"/></svg>`);
  assert.equal(svg?.includes("<script"), false);
  assert.equal(svg?.includes("<path"), true);
  assert.equal(sanitizeIconSvg("not svg"), null);
});
