import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCarouselResult } from "./carousel-parse";

describe("parseCarouselResult", () => {
  it("maps headings into cover/point/cta slides with centered layout", () => {
    const result = parseCarouselResult(
      {
        title: "Morning habits",
        slides: [
          { heading: "Start early", body: "Wake before seven. Open a window." },
          { heading: "Move first", body: "Do ten minutes. Keep it simple." },
          { heading: "Try it", body: "Pick one habit. Start tomorrow." },
        ],
      },
      3,
      { includeCta: true },
    );
    assert.equal(result.title, "Morning habits");
    assert.equal(result.slides.length, 3);
    assert.equal(result.slides[0]!.role, "cover");
    assert.equal(result.slides[1]!.role, "point");
    assert.equal(result.slides[2]!.role, "cta");
    assert.ok(result.slides.every((slide) => slide.layout === "center"));
  });

  it("keeps the last slide as a tip when CTA is off", () => {
    const result = parseCarouselResult(
      {
        title: "Tips",
        slides: [
          { heading: "One", body: "A." },
          { heading: "Two", body: "B." },
        ],
      },
      2,
      { includeCta: false },
    );
    assert.equal(result.slides[1]!.role, "point");
  });
});
