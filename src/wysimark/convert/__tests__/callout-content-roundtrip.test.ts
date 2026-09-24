import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { Node } from "slate"

import { parse } from "../parse"
import { serialize } from "../serialize"
import { BlockQuoteElement } from "../../block-quote-plugin"
import { getCalloutInfo } from "../../block-quote-plugin/callout"

describe("formatted callout content", () => {
  for (const separator of ["\n", "  \n"]) {
    it(`preserves a bold title and body across ${JSON.stringify(separator)}`, () => {
      const input = `> [!tip] **結論**${separator}> 本文 **重要** と続き`
      const [quote] = parse(input) as BlockQuoteElement[]
      assert.equal(getCalloutInfo(quote)?.title, "結論")
      assert.equal(Node.string(quote.children[1]), "本文 重要 と続き")
      const output = serialize([quote])
      assert.match(output, /\*\*結論\*\*/)
      assert.match(output, /本文 \*\*重要\*\* と続き/)
    })
  }

  it("preserves a formatted title without a body", () => {
    const input = "> [!tip] **結論**"
    const [quote] = parse(input) as BlockQuoteElement[]
    assert.equal(Node.string(quote.children[0]), "[!tip] 結論")
    assert.match(serialize([quote]), /^> \[!tip\] \*\*結論\*\*/)
  })

  it("preserves links and inline code in the title", () => {
    const input = "> [!note] [Link](https://example.com) and `code`\n> Body"
    const [quote] = parse(input) as BlockQuoteElement[]
    assert.equal(Node.string(quote.children[0]), "[!note] Link and code")
    assert.equal(Node.string(quote.children[1]), "Body")
    assert.match(serialize([quote]), /\[Link\]\(https:\/\/example.com\) and `code`/)
  })
})
