import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"

describe("BlockQuotePlugin", () => {
  it("does not merge adjacent blockquotes during normalization", () => {
    const source = readFileSync(new URL("./index.tsx", import.meta.url), "utf8")

    assert.equal(source.includes("normalizeSiblings<Element>"), false)
    assert.equal(source.includes("Transforms.mergeNodes(editor, { at: b[1] })"), false)
  })
})
