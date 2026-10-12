import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import {
  CAROUSEL_STYLES_PROMPT_PATH,
  clearCarouselPromptCache,
  extractPromptSection,
  loadCarouselStylesSystemPrompt,
} from "./carousel-prompt";

describe("carousel-prompt md loader", () => {
  it("extracts SYSTEM PROMPT from the docs file", async () => {
    clearCarouselPromptCache();
    const markdown = await readFile(CAROUSEL_STYLES_PROMPT_PATH, "utf8");
    const prompt = extractPromptSection(markdown, "## SYSTEM PROMPT");

    assert.match(prompt, /^You write Threads/);
    assert.match(prompt, /STYLE CATALOG \(20\)/);
    assert.match(prompt, /01_hook_ladder/);
    assert.match(prompt, /20_playbook/);
    assert.doesNotMatch(prompt, /```/);
  });

  it("caches the loaded system prompt", async () => {
    clearCarouselPromptCache();
    const first = await loadCarouselStylesSystemPrompt();
    const second = await loadCarouselStylesSystemPrompt();
    assert.equal(first, second);
    assert.match(first, /STYLE SELECTION/);
  });
});
