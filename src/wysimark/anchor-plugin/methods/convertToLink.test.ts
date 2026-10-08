import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createEditor } from "slate"

import { wikiEmbedUrl, wikiLinkHref } from "../../convert/obsidian-links"
import { convertToLink } from "./convertToLink"

function createEditorWithInlineElements() {
  const editor = createEditor()
  const { isInline, isVoid } = editor
  editor.isInline = (element) =>
    element.type === "anchor" ||
    element.type === "image-inline" ||
    isInline(element)
  editor.isVoid = (element) =>
    element.type === "image-inline" || isVoid(element)
  return editor
}

describe("convertToLink", () => {
  it("replaces an inline wiki embed image with an anchor", () => {
    const editor = createEditorWithInlineElements()
    editor.children = [
      {
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
      },
    ]

    const result = convertToLink(editor, "Project|Preview", { at: [0, 1] })

    assert.ok(result)
    const [anchor, path] = result
    assert.deepEqual(path, [0, 1])
    assert.equal(anchor.href, wikiLinkHref("Project|Preview"))
    assert.deepEqual(editor.children[0], {
      type: "paragraph",
      children: [
        { text: "See " },
        {
          type: "anchor",
          href: wikiLinkHref("Project|Preview"),
          children: [{ text: "Preview" }],
        },
        { text: " today" },
      ],
    })
  })

  it("wraps a block wiki embed image in a paragraph anchor", () => {
    const editor = createEditorWithInlineElements()
    editor.children = [
      {
        type: "image-block",
        url: wikiEmbedUrl("diagram.png|640x480"),
        alt: "diagram.png|640x480",
        children: [{ text: "" }],
      },
    ]

    const result = convertToLink(editor, "diagram.png|640x480", { at: [0] })

    assert.ok(result)
    const [anchor, path] = result
    assert.deepEqual(path, [0, 1])
    assert.equal(anchor.href, wikiLinkHref("diagram.png|640x480"))
    assert.deepEqual(editor.children[0], {
      type: "paragraph",
      children: [
        { text: "" },
        {
          type: "anchor",
          href: wikiLinkHref("diagram.png|640x480"),
          children: [{ text: "640x480" }],
        },
        { text: "" },
      ],
    })
  })
})
