/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from "node:test"
import assert from "node:assert"
import { escapeText } from "../text-utils"

describe("escapeText", () => {
  describe("underscore", () => {
    it("does not escape intraword underscores (CommonMark: not emphasis)", () => {
      assert.strictEqual(escapeText("foo_bar"), "foo_bar")
      assert.strictEqual(escapeText("foo_bar_baz"), "foo_bar_baz")
      assert.strictEqual(escapeText("my_var_name"), "my_var_name")
      assert.strictEqual(escapeText("python_3"), "python_3")
    })

    it("escapes underscores that could open/close emphasis", () => {
      assert.strictEqual(escapeText("_italic_"), "\\_italic\\_")
      assert.strictEqual(escapeText("hello _world_"), "hello \\_world\\_")
      assert.strictEqual(escapeText("a _b_ c"), "a \\_b\\_ c")
    })

    it("escapes trailing/leading underscores adjacent to whitespace", () => {
      assert.strictEqual(escapeText("foo _"), "foo \\_")
      assert.strictEqual(escapeText("_ foo"), "\\_ foo")
    })

    it("does not escape underscores between non-ASCII word-like characters", () => {
      assert.strictEqual(escapeText("あ_い"), "あ_い")
      assert.strictEqual(escapeText("変数_名"), "変数_名")
    })

    it("escapes underscores adjacent to Unicode symbols (CommonMark punctuation)", () => {
      // `$`, `+`, `<`, `|`, `~`, `` ` `` are Unicode S class — CommonMark
      // treats them as punctuation for emphasis flanking rules.
      assert.strictEqual(escapeText("a$_foo_$"), "a$\\_foo\\_$")
      assert.strictEqual(escapeText("a+_foo_+"), "a+\\_foo\\_+")
    })
  })

  describe("tilde", () => {
    it("does not escape intraword tildes (GFM: no strikethrough)", () => {
      assert.strictEqual(escapeText("foo~bar"), "foo~bar")
      assert.strictEqual(escapeText("a~b~c"), "a~b~c")
    })

    it("escapes tildes that could form strikethrough", () => {
      assert.strictEqual(escapeText("~strike~"), "\\~strike\\~")
      assert.strictEqual(escapeText("hello ~world~"), "hello \\~world\\~")
    })
  })

  describe("backslash", () => {
    it("does not escape backslashes before non-punctuation", () => {
      assert.strictEqual(escapeText("C:\\Users\\name"), "C:\\Users\\name")
      assert.strictEqual(escapeText("a\\b"), "a\\b")
    })

    it("escapes backslashes before ASCII punctuation", () => {
      assert.strictEqual(escapeText("a\\*b"), "a\\\\\\*b")
      assert.strictEqual(escapeText("a\\.b"), "a\\\\.b")
    })
  })

  describe("less-than", () => {
    it("does not escape `<` followed by non-tag characters", () => {
      assert.strictEqual(escapeText("a < b"), "a < b")
      assert.strictEqual(escapeText("a<5 && 5>b"), "a<5 && 5>b")
    })

    it("escapes `<` that could start an HTML tag or autolink", () => {
      assert.strictEqual(escapeText("a<div>"), "a\\<div>")
      assert.strictEqual(escapeText("<a>"), "\\<a>")
      assert.strictEqual(escapeText("</close>"), "\\</close>")
    })
  })

  describe("other inline escapes still work", () => {
    it("escapes asterisks", () => {
      assert.strictEqual(escapeText("foo*bar"), "foo\\*bar")
    })

    it("escapes backticks, brackets, and pipes", () => {
      assert.strictEqual(escapeText("`[]|"), "\\`\\[\\]\\|")
    })
  })

  describe("start-of-line escapes", () => {
    it("escapes heading markers", () => {
      assert.strictEqual(escapeText("# heading"), "\\# heading")
    })

    it("escapes ordered list markers", () => {
      assert.strictEqual(escapeText("1. item"), "1\\. item")
    })

    it("escapes list/blockquote markers", () => {
      assert.strictEqual(escapeText("- item"), "\\- item")
      assert.strictEqual(escapeText("> quote"), "\\> quote")
    })
  })
})
