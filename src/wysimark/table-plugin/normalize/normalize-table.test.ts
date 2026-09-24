import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createEditor, Node, Transforms } from "slate"

import { parse } from "../../convert/parse"
import { TableElement } from "../types"
import { normalizeTableIndexes } from "./normalize-table"

describe("normalizeTableIndexes", () => {
  it("finishes cell coordinates before normalization shifts the table", () => {
    const editor = createEditor()
    const [table] = parse("|A|B|\n|---|---|\n|a|b|") as TableElement[]
    editor.children = [table]
    const originalNormalize = editor.normalizeNode
    let shifted = false
    editor.normalizeNode = (entry) => {
      if (!shifted) {
        shifted = true
        Transforms.insertNodes(editor, {
          type: "paragraph", children: [{ text: "Before table" }],
        }, { at: [0] })
        return
      }
      originalNormalize(entry)
    }

    assert.equal(normalizeTableIndexes(editor, [table, [0]]), true)
    assert.equal(Node.string(editor.children[0]), "Before table")
    const movedTable = editor.children[1] as TableElement
    movedTable.children.forEach((row, y) => row.children.forEach((cell, x) => {
      assert.equal(cell.x, x)
      assert.equal(cell.y, y)
    }))
    assert.equal(normalizeTableIndexes(editor, [movedTable, [1]]), false)
  })

  it("ignores a mount effect whose table has moved", () => {
    const editor = createEditor()
    const [table] = parse("|A|\n|---|\n|a|") as TableElement[]
    editor.children = [{ type: "paragraph", children: [{ text: "Before" }] }, table]
    assert.equal(normalizeTableIndexes(editor, [table, [0]]), false)
    assert.equal(Node.string(editor.children[0]), "Before")
  })
})
