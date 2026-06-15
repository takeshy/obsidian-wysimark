/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from "node:test"
import assert from "node:assert"
import { parse } from "../parse"
import { serialize } from "../serialize"

describe("task list round-trip", () => {
  it("parses GFM task list items as task-list-item elements", () => {
    const parsed = parse("- [x] Completed\n- [ ] Pending")

    assert.deepStrictEqual(parsed, [
      {
        type: "task-list-item",
        depth: 0,
        checked: true,
        children: [{ text: "Completed" }],
      },
      {
        type: "task-list-item",
        depth: 0,
        checked: false,
        children: [{ text: "Pending" }],
      },
    ])
  })

  it("serializes task list items back to GFM checkbox syntax", () => {
    const input = "- [x] Completed\n- [ ] Pending"

    assert.strictEqual(serialize(parse(input)), input)
  })
})
