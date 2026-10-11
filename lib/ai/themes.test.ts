import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseThemesResult, THEMES_COUNT } from "./themes";

describe("parseThemesResult", () => {
  it("keeps title/prompt and assigns set locally", () => {
    const themes = parseThemesResult({
      themes: [
        { title: "Cold email", prompt: "Five cold email tips that get replies" },
        { title: "x", prompt: "no" },
        { title: "Morning habits", prompt: "Simple habits to start the day" },
        { title: "Extra", prompt: "Should be truncated by count limit if over" },
        { title: "More", prompt: "Another one beyond the cap" },
      ],
    });
    assert.equal(themes.length, THEMES_COUNT);
    assert.equal(themes[0]!.title, "Cold email");
    assert.ok(themes[0]!.setId);
    assert.equal(themes[0]!.slides, 5);
  });
});
