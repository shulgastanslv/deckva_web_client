import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fillTemplateSlide } from "./fill-template-slides";

describe("fillTemplateSlide", () => {
  it("replaces heading and body text while keeping layout", () => {
    const filled = fillTemplateSlide(
      {
        version: "6.0.0",
        background: "#fff",
        objects: [
          {
            type: "Textbox",
            text: "Old title",
            fontSize: 72,
            swibpStyle: "heading",
            left: 100,
            top: 200,
          },
          {
            type: "Textbox",
            text: "Old body",
            fontSize: 28,
            swibpStyle: "body",
            left: 100,
            top: 320,
          },
        ],
      },
      {
        index: 0,
        role: "cover",
        layout: "center",
        heading: "New title",
        body: "Fresh body copy.",
      },
    );

    const objects = filled.objects as Array<Record<string, unknown>>;
    assert.equal(objects[0]!.text, "New title");
    assert.equal(objects[1]!.text, "Fresh body copy.");
    assert.equal(objects[0]!.left, 100);
    assert.equal(filled.background, "#fff");
  });
});
