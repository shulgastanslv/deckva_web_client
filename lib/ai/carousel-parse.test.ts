import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCarouselResult } from "./carousel-parse";

describe("parseCarouselResult", () => {
  it("maps headings into cover/point/cta slides", () => {
    const result = parseCarouselResult(
      {
        title: "Morning habits",
        slides: [
          { heading: "Start early", body: "Wake before 7" },
          { heading: "Move first", body: "Ten minutes" },
          { heading: "Try it", body: "Tomorrow" },
        ],
      },
      3,
    );
    assert.equal(result.title, "Morning habits");
    assert.equal(result.slides.length, 3);
    assert.equal(result.slides[0]!.role, "cover");
    assert.equal(result.slides[1]!.role, "point");
    assert.equal(result.slides[2]!.role, "cta");
    assert.equal(result.slides[0]!.layout, "center");
  });
});
