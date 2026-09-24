import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createEditor, Descendant, Editor, Node, Transforms } from "slate"
import { withHistory } from "slate-history"

import { replaceDocument } from "./replace-document"

function paragraphs(count: number): Descendant[] {
  return Array.from({ length: count }, (_, index) => ({
    type: "paragraph",
    children: [{ text: `Paragraph ${index}` }],
  })) as Descendant[]
}

function documentWithNestedPath(): Descendant[] {
  return [
    ...paragraphs(12),
    {
      type: "block-quote",
      children: paragraphs(7),
    } as Descendant,
  ]
}

describe("replaceDocument", () => {
  it("replaces the tree and selects the beginning", () => {
    const editor = withHistory(createEditor())
    editor.children = paragraphs(13)
    Transforms.select(editor, Editor.end(editor, [12]))
    Transforms.insertText(editor, " edited")

    replaceDocument(editor, paragraphs(2))

    assert.equal(editor.children.length, 2)
    assert.equal(Node.string(editor.children[0]), "Paragraph 0")
    assert.deepEqual(editor.selection?.anchor, { path: [0, 0], offset: 0 })
    assert.equal(editor.history.undos.length, 0)
    assert.equal(editor.history.redos.length, 0)
  })

  it("can replace a document while normalization has dirty old paths", () => {
    const editor = createEditor()
    editor.children = documentWithNestedPath()

    assert.doesNotThrow(() => {
      Editor.withoutNormalizing(editor, () => {
        Transforms.insertText(editor, "dirty", {
          at: { path: [12, 6, 0], offset: 0 },
        })
        replaceDocument(editor, paragraphs(1))
      })
    })

    assert.equal(editor.children.length, 1)
  })
})
