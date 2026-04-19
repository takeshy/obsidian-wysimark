/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from "node:test"
import assert from "node:assert"
import { parse } from "../parse"
import { serialize } from "../serialize"
import type { TableElement } from "../../table-plugin"

describe("<br> in table cells round-trip", () => {
  it("parses <br> in a cell into a single table-content with embedded \\n", () => {
    const input = "|A|B|\n|---|---|\n|line1<br>line2|plain|"
    const parsed = parse(input)
    const table = parsed[0] as TableElement
    assert.strictEqual(table.type, "table")
    const firstBodyRow = table.children[1]
    const firstCell = firstBodyRow.children[0]
    // Invariant: table-cell has exactly one table-content child
    assert.strictEqual(firstCell.children.length, 1)
    assert.strictEqual(firstCell.children[0].type, "table-content")
    const segments = firstCell.children[0].children
    const joinedText = segments
      .map((s) => ("text" in s ? s.text : ""))
      .join("")
    assert.strictEqual(joinedText, "line1\nline2")
  })

  it("serializes a cell with \\n back to <br> on a single row", () => {
    const input = "|A|B|\n|---|---|\n|line1<br>line2|plain|"
    assert.strictEqual(serialize(parse(input)), input)
  })

  it("round-trips multiple <br> in one cell", () => {
    const input = "|A|\n|---|\n|a<br>b<br>c|"
    assert.strictEqual(serialize(parse(input)), input)
  })

  it("round-trips <br/> and <br /> variants back to <br>", () => {
    const canonical = "|A|\n|---|\n|a<br>b|"
    assert.strictEqual(serialize(parse("|A|\n|---|\n|a<br/>b|")), canonical)
    assert.strictEqual(serialize(parse("|A|\n|---|\n|a<br />b|")), canonical)
  })

  it("preserves cells without <br> unchanged", () => {
    const input = "|A|B|\n|---|---|\n|x|y|"
    assert.strictEqual(serialize(parse(input)), input)
  })
})
