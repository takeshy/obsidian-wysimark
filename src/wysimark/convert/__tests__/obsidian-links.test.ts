/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { normalizeWikiLinkInput } from "../obsidian-links"
import { parse } from "../parse"
import { serialize } from "../serialize"
import type { Element } from "../types"

describe("Obsidian wiki links", () => {
  it("normalizes wiki link input for dialogs", () => {
    assert.deepEqual(normalizeWikiLinkInput("[[Example|Custom]]"), {
      target: "Example",
      display: "Custom",
    })
    assert.deepEqual(normalizeWikiLinkInput("[[#Local heading]]"), {
      target: "#Local heading",
    })
    assert.deepEqual(normalizeWikiLinkInput("Project#Heading"), {
      target: "Project#Heading",
    })
  })

  it("round-trips an internal wiki link", () => {
    const input = "See [[Project plan]] for details."
    assert.equal(serialize(parse(input)).trimEnd(), input)
  })

  it("round-trips a heading link", () => {
    const input = "See [[Project plan#Milestones]]."
    assert.equal(serialize(parse(input)).trimEnd(), input)
  })

  it("round-trips same-note heading and nested heading links", () => {
    const input =
      "See [[#Local heading]] and [[Help#Questions#Report bugs]]."
    assert.equal(serialize(parse(input)).trimEnd(), input)
  })

  it("round-trips heading and block searches", () => {
    const input = "Search [[## team]] and [[^^quote-of-the-day]]."
    assert.equal(serialize(parse(input)).trimEnd(), input)
  })

  it("round-trips a block link", () => {
    const input = "See [[2023-01-01#^quote-of-the-day]]."
    assert.equal(serialize(parse(input)).trimEnd(), input)
  })

  it("round-trips custom display text", () => {
    const input = "See [[Project plan#Milestones|the milestones]]."
    assert.equal(serialize(parse(input)).trimEnd(), input)
  })

  it("serializes edited display text as a custom display name", () => {
    const parsed = parse("[[Project plan#Milestones]]")
    const paragraph = parsed[0]
    const link = paragraph.children[1] as Extract<
      (typeof paragraph.children)[number],
      { type: "anchor" }
    >
    link.children = [{ text: "the milestones" }]

    assert.equal(
      serialize(parsed).trimEnd(),
      "[[Project plan#Milestones|the milestones]]"
    )
  })

  it("round-trips embeds as image blocks", () => {
    const input = "![[diagram.png|640x480]]"
    assert.equal(serialize(parse(input)).trimEnd(), input)
  })

  it("does not parse wiki links inside inline code", () => {
    const input = "`[[Project plan]]`"
    assert.equal(serialize(parse(input)).trimEnd(), input)
  })

  it("escapes literal wiki-link-looking text when serializing", () => {
    const tree: Element[] = [
      { type: "paragraph", children: [{ text: "[[Project plan]]" }] },
    ]
    const markdown = serialize(tree).trimEnd()
    assert.equal(markdown, "\\[[Project plan]]")
    assert.deepEqual(parse(markdown), tree)
  })
})
