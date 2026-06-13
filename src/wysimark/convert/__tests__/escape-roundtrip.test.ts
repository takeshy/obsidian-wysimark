/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from "node:test"
import assert from "node:assert"
import { parse } from "../parse"
import { serialize } from "../serialize"
import type { Element } from "../types"

/**
 * Opening a markdown file and saving it without edits must not add escapes:
 * plain text that parses as literal characters has to serialize back to the
 * same markdown.
 */
describe("escape round-trip", () => {
  describe("parse -> serialize leaves plain text untouched", () => {
    const inputs = [
      "a | b",
      "foo|bar",
      "[TODO] check this",
      "array[0] = 1",
      "2 * 3 = 6",
      "use the * operator",
      "back`tick",
      "snake_case_name",
      "approx ~10 items",
      "a < b and c > d",
      "C:\\Users\\foo",
      "price is $5 (50% off!)",
    ]
    for (const input of inputs) {
      it(`preserves ${JSON.stringify(input)}`, () => {
        assert.strictEqual(serialize(parse(input)).trimEnd(), input)
      })
    }
  })

  describe("serialize -> parse keeps literal text literal", () => {
    const texts = [
      "[a](b)",
      "![a](b)",
      "[^1]",
      "*italic*",
      "**bold**",
      "a `b` c",
      "# heading",
      "* item",
      "- item",
      "1. item",
    ]
    for (const text of texts) {
      it(`does not let ${JSON.stringify(text)} become markup`, () => {
        const tree: Element[] = [{ type: "paragraph", children: [{ text }] }]
        const markdown = serialize(tree)
        const reparsed = parse(markdown)
        assert.strictEqual(reparsed.length, 1)
        const paragraph = reparsed[0]
        assert.strictEqual(paragraph.type, "paragraph")
        assert.deepStrictEqual(paragraph.children, [{ text }])
      })
    }
  })

  describe("tables", () => {
    it("escapes pipes inside table cells", () => {
      const tree: Element[] = [
        {
          type: "table",
          columns: [{ align: "left" }, { align: "left" }],
          children: [
            {
              type: "table-row",
              children: [
                {
                  type: "table-cell",
                  children: [
                    { type: "table-content", children: [{ text: "a|b" }] },
                  ],
                },
                {
                  type: "table-cell",
                  children: [
                    { type: "table-content", children: [{ text: "c" }] },
                  ],
                },
              ],
            },
            {
              type: "table-row",
              children: [
                {
                  type: "table-cell",
                  children: [
                    { type: "table-content", children: [{ text: "d" }] },
                  ],
                },
                {
                  type: "table-cell",
                  children: [
                    { type: "table-content", children: [{ text: "e" }] },
                  ],
                },
              ],
            },
          ],
        } as unknown as Element,
      ]
      const markdown = serialize(tree)
      assert.match(markdown, /a\\\|b/)
      const reparsed = parse(markdown)
      assert.strictEqual(reparsed[0].type, "table")
    })

    it("round-trips a table whose cell contains a pipe", () => {
      const input = "|a\\|b|c|\n|---|---|\n|d|e|"
      const serialized = serialize(parse(input)).trimEnd()
      assert.strictEqual(serialized, input)
    })
  })

  describe("anchors", () => {
    it("escapes brackets in link label text", () => {
      const tree: Element[] = [
        {
          type: "paragraph",
          children: [
            { text: "" },
            {
              type: "anchor",
              href: "https://example.com",
              children: [{ text: "a]b" }],
            },
            { text: "" },
          ],
        } as unknown as Element,
      ]
      const markdown = serialize(tree).trimEnd()
      assert.strictEqual(markdown, "[a\\]b](https://example.com)")
    })
  })

  describe("highlight", () => {
    it("round-trips inline mark tags as highlight text", () => {
      const input = "<mark>highlight</mark>"
      const parsed = parse(input)

      assert.deepStrictEqual(parsed, [
        {
          type: "paragraph",
          children: [{ text: "highlight", highlight: true }],
        },
      ])
      assert.strictEqual(serialize(parsed).trimEnd(), input)
    })
  })
})
