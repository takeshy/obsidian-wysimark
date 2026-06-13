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

    it("does not escape underscores that cannot form an emphasis pair", () => {
      assert.strictEqual(escapeText("foo _"), "foo _")
      assert.strictEqual(escapeText("_ foo"), "_ foo")
      assert.strictEqual(escapeText("_foo_bar"), "_foo_bar")
      assert.strictEqual(escapeText("foo_bar_"), "foo_bar_")
      assert.strictEqual(escapeText("path/_file"), "path/_file")
      assert.strictEqual(escapeText("path_/file"), "path_/file")
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
    it("does not escape unpaired intraword tildes", () => {
      assert.strictEqual(escapeText("foo~bar"), "foo~bar")
    })

    it("escapes tildes that could form strikethrough", () => {
      assert.strictEqual(escapeText("~strike~"), "\\~strike\\~")
      assert.strictEqual(escapeText("hello ~world~"), "hello \\~world\\~")
      assert.strictEqual(escapeText("~~strike~~"), "\\~\\~strike\\~\\~")
      assert.strictEqual(escapeText("~foo~bar"), "\\~foo\\~bar")
      assert.strictEqual(escapeText("foo~bar~"), "foo\\~bar\\~")
      assert.strictEqual(escapeText("foo~bar~baz"), "foo\\~bar\\~baz")
    })

    it("does not escape tildes that cannot form a strikethrough pair", () => {
      assert.strictEqual(escapeText("foo ~"), "foo ~")
      assert.strictEqual(escapeText("~ foo"), "~ foo")
      assert.strictEqual(escapeText("path/~file"), "path/~file")
      assert.strictEqual(escapeText("path~/file"), "path~/file")
    })
  })

  describe("backslash", () => {
    it("does not escape backslashes before non-punctuation", () => {
      assert.strictEqual(escapeText("C:\\Users\\name"), "C:\\Users\\name")
      assert.strictEqual(escapeText("a\\b"), "a\\b")
    })

    it("escapes backslashes before ASCII punctuation", () => {
      // the `*` itself stays literal because it cannot pair
      assert.strictEqual(escapeText("a\\*b"), "a\\\\*b")
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

  describe("asterisk", () => {
    it("does not escape asterisks that cannot form an emphasis pair", () => {
      assert.strictEqual(escapeText("2 * 3 = 6"), "2 * 3 = 6")
      assert.strictEqual(escapeText("use the * operator"), "use the * operator")
      assert.strictEqual(escapeText("foo*bar"), "foo*bar")
      assert.strictEqual(escapeText("foo *"), "foo *")
    })

    it("escapes asterisks that could open/close emphasis", () => {
      assert.strictEqual(escapeText("*italic*"), "\\*italic\\*")
      assert.strictEqual(escapeText("hello *world*"), "hello \\*world\\*")
      assert.strictEqual(escapeText("**bold**"), "\\*\\*bold\\*\\*")
      // unlike `_`, `*` can form intraword emphasis
      assert.strictEqual(escapeText("foo*bar*baz"), "foo\\*bar\\*baz")
    })
  })

  describe("backtick", () => {
    it("does not escape a lone backtick (cannot form a code span)", () => {
      assert.strictEqual(escapeText("back`tick"), "back`tick")
      assert.strictEqual(escapeText("don`t"), "don`t")
    })

    it("escapes backticks that could pair into a code span", () => {
      assert.strictEqual(escapeText("a `b` c"), "a \\`b\\` c")
      assert.strictEqual(escapeText("a ` b ` c"), "a \\` b \\` c")
    })

    it("escapes a lone backtick when the line context requires it", () => {
      assert.strictEqual(
        escapeText("a`b", { escapeBackticks: true }),
        "a\\`b"
      )
    })
  })

  describe("brackets", () => {
    it("does not escape brackets that cannot form a link", () => {
      assert.strictEqual(escapeText("[TODO] check this"), "[TODO] check this")
      assert.strictEqual(escapeText("array[0] = 1"), "array[0] = 1")
      assert.strictEqual(escapeText("a] b [c"), "a] b [c")
      assert.strictEqual(escapeText("x](y"), "x](y")
    })

    it("escapes bracket pairs that could form a link or image", () => {
      assert.strictEqual(escapeText("[a](b)"), "\\[a\\](b)")
      assert.strictEqual(escapeText("![a](b)"), "!\\[a\\](b)")
      assert.strictEqual(escapeText("see [docs](#x) now"), "see \\[docs\\](#x) now")
    })

    it("escapes `[` that could start a footnote reference", () => {
      assert.strictEqual(escapeText("[^1]"), "\\[^1]")
    })

    it("escapes all brackets inside an anchor label", () => {
      assert.strictEqual(
        escapeText("a]b[c", { inAnchorLabel: true }),
        "a\\]b\\[c"
      )
    })
  })

  describe("pipe", () => {
    it("does not escape pipes outside of tables", () => {
      assert.strictEqual(escapeText("a | b"), "a | b")
      assert.strictEqual(escapeText("foo|bar"), "foo|bar")
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
      assert.strictEqual(escapeText("* item"), "\\* item")
      assert.strictEqual(escapeText("> quote"), "\\> quote")
    })
  })
})
