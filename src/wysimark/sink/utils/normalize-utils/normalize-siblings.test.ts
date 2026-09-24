import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createEditor, Descendant } from "slate"

import { normalizeSiblings } from "./normalize-siblings"

const paragraph = (text: string): Descendant => ({ type: "paragraph", children: [{ text }] })

describe("normalizeSiblings", () => {
  it("ignores missing and reassigned paths left over from mount effects", () => {
    const editor = createEditor()
    const previous = paragraph("Old")
    editor.children = [paragraph("New")]
    const unexpected = () => { assert.fail("must not normalize stale siblings") }
    assert.equal(normalizeSiblings(editor, [previous, [84, 1]], unexpected), false)
    assert.equal(normalizeSiblings(editor, [previous, [0]], unexpected), false)
  })

  it("still normalizes the current siblings", () => {
    const editor = createEditor()
    const before = paragraph("Before")
    const current = paragraph("Current")
    editor.children = [before, current]
    let calls = 0
    assert.equal(normalizeSiblings(editor, [current, [1]], (a, b) => {
      assert.equal(a[0], before)
      assert.equal(b[0], current)
      calls++
      return true
    }), true)
    assert.equal(calls, 1)
  })
})
