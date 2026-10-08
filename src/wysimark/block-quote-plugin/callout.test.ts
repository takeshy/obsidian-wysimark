import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createEditor, Editor } from "slate"

import { parse } from "../convert/parse"
import { serialize } from "../convert/serialize"
import { createSink } from "../sink"
import { BlockQuotePlugin, type BlockQuoteElement } from "."
import { getCalloutInfo, isCalloutBlockQuote } from "./callout"

function blockQuote(marker: string): BlockQuoteElement {
  return {
    type: "block-quote",
    children: [
      {
        type: "paragraph",
        children: [{ text: marker }],
      },
      {
        type: "paragraph",
        children: [{ text: "Body" }],
      },
    ],
  }
}

describe("getCalloutInfo", () => {
  it("parses Obsidian callout marker title", () => {
    assert.deepEqual(getCalloutInfo(blockQuote("[!tip] Custom title")), {
      type: "tip",
      displayType: "tip",
      title: "Custom title",
      fold: undefined,
      icon: "⚑",
    })
  })

  it("normalizes aliases and fold markers", () => {
    assert.deepEqual(getCalloutInfo(blockQuote("[!faq]- Question")), {
      type: "question",
      displayType: "faq",
      title: "Question",
      fold: "closed",
      icon: "?",
    })
  })

  it("uses Obsidian title defaults and note fallback", () => {
    assert.deepEqual(getCalloutInfo(blockQuote("[!custom-type]")), {
      type: "note",
      displayType: "custom-type",
      title: "Custom Type",
      fold: undefined,
      icon: "i",
    })
  })

  it("ignores ordinary blockquotes", () => {
    assert.equal(getCalloutInfo(blockQuote("Not a callout")), null)
    assert.equal(isCalloutBlockQuote(blockQuote("Not a callout")), false)
  })

  it("splits marker line from body when parsing Obsidian blockquote syntax", () => {
    const [element] = parse(
      "> [!tip] Title\n> First body line\n> Second body line\n"
    ) as BlockQuoteElement[]

    assert.equal(element.type, "block-quote")
    assert.equal(element.children.length, 2)
    assert.deepEqual(getCalloutInfo(element), {
      type: "tip",
      displayType: "tip",
      title: "Title",
      fold: undefined,
      icon: "⚑",
    })
    assert.equal(serialize([element]).trimEnd(), [
      "> [!tip] Title",
      "> First body line",
      "> Second body line",
    ].join("\n"))
  })

  it("keeps adjacent callouts separate during normalization", () => {
    const { withSink } = createSink([BlockQuotePlugin])
    const editor = withSink(createEditor(), {} as never)
    editor.children = parse(
      "> [!info] One\n> Body one\n\n> [!example] Two\n> Body two\n"
    ) as BlockQuoteElement[]

    Editor.normalize(editor, { force: true })

    assert.equal(editor.children.length, 2)
    assert.equal(isCalloutBlockQuote(editor.children[0]), true)
    assert.equal(isCalloutBlockQuote(editor.children[1]), true)
    assert.equal(serialize(editor.children as BlockQuoteElement[]).trimEnd(), [
      "> [!info] One",
      "> Body one",
      "",
      "> [!example] Two",
      "> Body two",
    ].join("\n"))
  })

  it("keeps adjacent ordinary blockquotes separate during normalization", () => {
    const { withSink } = createSink([BlockQuotePlugin])
    const editor = withSink(createEditor(), {} as never)
    editor.children = parse("> First\n\n> Second\n") as BlockQuoteElement[]

    Editor.normalize(editor, { force: true })

    assert.equal(editor.children.length, 2)
    assert.equal(isCalloutBlockQuote(editor.children[0]), false)
    assert.equal(serialize(editor.children as BlockQuoteElement[]).trimEnd(), [
      "> First",
      "",
      "> Second",
    ].join("\n"))
  })
})
