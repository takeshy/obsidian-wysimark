import { describe, it } from "node:test"
import assert from "node:assert"
import { unescapeMarkdown } from "../utils"

describe("unescapeMarkdown", () => {
  it("unescapes backslash-escaped inline characters", () => {
    assert.strictEqual(unescapeMarkdown("\\*bold\\*"), "*bold*")
    assert.strictEqual(unescapeMarkdown("\\_italic\\_"), "_italic_")
    assert.strictEqual(unescapeMarkdown("\\~strike\\~"), "~strike~")
    assert.strictEqual(unescapeMarkdown("\\`code\\`"), "`code`")
    assert.strictEqual(unescapeMarkdown("\\[link\\]"), "[link]")
    assert.strictEqual(unescapeMarkdown("\\|pipe\\|"), "|pipe|")
    assert.strictEqual(unescapeMarkdown("\\<html>"), "<html>")
  })

  it("unescapes escaped backslashes", () => {
    assert.strictEqual(unescapeMarkdown("\\\\"), "\\")
    assert.strictEqual(unescapeMarkdown("a\\\\b"), "a\\b")
  })

  it("does not remove backslashes before non-target characters", () => {
    assert.strictEqual(unescapeMarkdown("\\n"), "\\n")
    assert.strictEqual(unescapeMarkdown("\\a"), "\\a")
    assert.strictEqual(unescapeMarkdown("C:\\Users"), "C:\\Users")
  })

  it("handles consecutive escaped characters", () => {
    assert.strictEqual(unescapeMarkdown("\\*\\*bold\\*\\*"), "**bold**")
  })

  it("returns plain text unchanged", () => {
    assert.strictEqual(unescapeMarkdown("hello world"), "hello world")
    assert.strictEqual(unescapeMarkdown(""), "")
  })
})
