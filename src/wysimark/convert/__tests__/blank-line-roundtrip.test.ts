/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from "node:test"
import assert from "node:assert"
import { parse } from "../parse"
import { serialize } from "../serialize"
import type { Element } from "../types"

describe("blank line round-trip", () => {
  it("preserves a single blank line between paragraphs (NBSP marker)", () => {
    const input = "text A\n\n\u00A0\n\ntext B"
    const parsed = parse(input)
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, input)
  })

  it("preserves multiple blank lines between paragraphs (NBSP markers)", () => {
    const input = "text A\n\n\u00A0\n\n\u00A0\n\ntext B"
    const parsed = parse(input)
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, input)
  })

  it("preserves blank lines via MDAST position gaps (no NBSP)", () => {
    // "text A\n\n\n\ntext B" = 4 newlines between content
    // Gap between textA(end line1) and textB(start line5) = 5-1-1 = 3
    // Extra blank lines = 3-1 = 2, so 2 empty paragraphs inserted
    const input = "text A\n\n\n\ntext B"
    const parsed = parse(input)
    assert.strictEqual(parsed.length, 4) // textA + 2 empty + textB
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, "text A\n\n\u00A0\n\n\u00A0\n\ntext B")
  })

  it("preserves a single extra blank line via MDAST position gap", () => {
    // "text A\n\n\ntext B" = 3 newlines
    // Gap = 4-1-1 = 2, extra = 2-1 = 1 empty paragraph
    const input = "text A\n\n\ntext B"
    const parsed = parse(input)
    assert.strictEqual(parsed.length, 3) // textA + 1 empty + textB
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, "text A\n\n\u00A0\n\ntext B")
  })

  it("preserves blank line at start of document (NBSP marker)", () => {
    const input = "\u00A0\n\ntext A"
    const parsed = parse(input)
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, input)
  })

  it("preserves blank line at end of document (NBSP marker)", () => {
    const input = "text A\n\n\u00A0"
    const parsed = parse(input)
    const serialized = serialize(parsed)
    assert.strictEqual(serialized, input)
  })

  it("round-trip: empty paragraph in Slate tree serializes to NBSP and parses back", () => {
    // Simulate what happens when user enters a blank line in WYSIWYG
    const slateTree: Element[] = [
      { type: "paragraph", children: [{ text: "text A" }] },
      { type: "paragraph", children: [{ text: "" }] }, // blank line
      { type: "paragraph", children: [{ text: "text B" }] },
    ] as Element[]
    const serialized = serialize(slateTree)
    assert.strictEqual(serialized, "text A\n\n\u00A0\n\ntext B")
    const parsed = parse(serialized)
    assert.strictEqual(parsed.length, 3)
    assert.deepStrictEqual(parsed[0], { type: "paragraph", children: [{ text: "text A" }] })
    assert.deepStrictEqual(parsed[1], { type: "paragraph", children: [{ text: "" }] })
    assert.deepStrictEqual(parsed[2], { type: "paragraph", children: [{ text: "text B" }] })
  })

  it("soft break serializes as two trailing spaces + newline", () => {
    // Simulate Shift+Enter (soft break within a paragraph)
    const slateTree: Element[] = [
      { type: "paragraph", children: [{ text: "line1\nline2" }] },
    ] as Element[]
    const serialized = serialize(slateTree)
    // \n within text should become "  \n" (two trailing spaces + newline)
    assert.strictEqual(serialized, "line1  \nline2")
  })

  it("soft break round-trip: two trailing spaces + newline parses back to \\n", () => {
    const input = "line1  \nline2"
    const parsed = parse(input)
    assert.strictEqual(parsed.length, 1)
    // remark-parse creates break node → parse converts to \n → Slate merges text
    const children = parsed[0].children as { text: string }[]
    const fullText = children.map((c) => c.text).join("")
    assert.strictEqual(fullText, "line1\nline2")
  })
})
