import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createEditor } from "slate"

import { wikiEmbedUrl } from "../../convert/obsidian-links"
import { convertToEmbed } from "./convertToEmbed"

function createEditorWithInlineImages() {
  const editor = createEditor()
  const { isInline, isVoid } = editor
  editor.isInline = (element) =>
    element.type === "image-inline" || isInline(element)
  editor.isVoid = (element) =>
    element.type === "image-inline" || isVoid(element)
  return editor
}

describe("convertToEmbed", () => {
  it("replaces an anchor with an inline wiki embed image", () => {
    const editor = createEditorWithInlineImages()
    editor.children = [
      {
        type: "paragraph",
        children: [
          { text: "See " },
          {
            type: "anchor",
            href: "wysimark:wiki-link:Project",
            children: [{ text: "Project" }],
          },
          { text: " today" },
        ],
      },
    ]

    const converted = convertToEmbed(editor, "Project|Preview", { at: [0, 1] })

    assert.equal(converted, true)
    assert.deepEqual(editor.children[0], {
      type: "paragraph",
      children: [
        { text: "See " },
        {
          type: "image-inline",
          url: wikiEmbedUrl("Project|Preview"),
          alt: "Project|Preview",
          children: [{ text: "" }],
        },
        { text: " today" },
      ],
    })
  })

  it("returns false when no anchor exists at the target", () => {
    const editor = createEditor()
    editor.children = [
      {
        type: "paragraph",
        children: [{ text: "plain text" }],
      },
    ]

    assert.equal(convertToEmbed(editor, "Project", { at: [0, 0] }), false)
  })
})
