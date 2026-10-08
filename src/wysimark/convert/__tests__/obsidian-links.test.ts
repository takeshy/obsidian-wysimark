import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { Text as SlateText } from "slate"

import type { AnchorElement } from "../../anchor-plugin"
import { parse } from "../parse"
import { serialize } from "../serialize"
import { normalizeWikiLinkInput } from "../obsidian-links"
import type { Element, Segment } from "../types"

const internalLinks = { enableInternalLinks: true }

function findAnchor(children: Segment[]): AnchorElement {
  const anchor = children.find(
    (child): child is AnchorElement => "type" in child && child.type === "anchor"
  )
  assert.ok(anchor)
  return anchor
}

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

  it("keeps wiki-link-looking text literal when disabled", () => {
    const input = "See [[Project plan]] for details."
    assert.equal(serialize(parse(input, { enableInternalLinks: false }), { enableInternalLinks: false }).trimEnd(), input)
  })

  it("round-trips an internal wiki link", () => {
    const input = "See [[Project plan]] for details."
    assert.equal(
      serialize(parse(input, internalLinks), internalLinks).trimEnd(),
      input
    )
  })

  it("round-trips adjacent internal wiki links", () => {
    const input = "[[L1]][[L2]]"
    assert.equal(
      serialize(parse(input, internalLinks), internalLinks).trimEnd(),
      input
    )
  })

  it("round-trips a heading link", () => {
    const input = "See [[Project plan#Milestones]]."
    assert.equal(
      serialize(parse(input, internalLinks), internalLinks).trimEnd(),
      input
    )
  })

  it("round-trips same-note heading and nested heading links", () => {
    const input =
      "See [[#Local heading]] and [[Help#Questions#Report bugs]]."
    assert.equal(
      serialize(parse(input, internalLinks), internalLinks).trimEnd(),
      input
    )
  })

  it("round-trips heading and block searches", () => {
    const input = "Search [[## team]] and [[^^quote-of-the-day]]."
    assert.equal(
      serialize(parse(input, internalLinks), internalLinks).trimEnd(),
      input
    )
  })

  it("round-trips a block link", () => {
    const input = "See [[2023-01-01#^quote-of-the-day]]."
    assert.equal(
      serialize(parse(input, internalLinks), internalLinks).trimEnd(),
      input
    )
  })

  it("round-trips custom display text", () => {
    const input = "See [[Project plan#Milestones|the milestones]]."
    assert.equal(
      serialize(parse(input, internalLinks), internalLinks).trimEnd(),
      input
    )
  })

  it("serializes edited display text as a custom display name", () => {
    const parsed = parse("[[Project plan#Milestones]]", internalLinks)
    const paragraph = parsed[0] as Element
    const link = paragraph.children[1] as Extract<
      (typeof paragraph.children)[number],
      { type: "anchor" }
    >
    link.children = [{ text: "the milestones" }]

    assert.equal(
      serialize(parsed, internalLinks).trimEnd(),
      "[[Project plan#Milestones|the milestones]]"
    )
  })

  it("round-trips embeds as image blocks", () => {
    const input = "![[diagram.png|640x480]]"
    assert.equal(
      serialize(parse(input, internalLinks), internalLinks).trimEnd(),
      input
    )
  })

  it("does not parse wiki links inside inline code", () => {
    const input = "`[[Project plan]]`"
    assert.equal(
      serialize(parse(input, internalLinks), internalLinks).trimEnd(),
      input
    )
  })

  it("keeps escaped wiki links literal inside inline code when disabled", () => {
    const input = "`\\[[code]]`"
    assert.equal(serialize(parse(input)).trimEnd(), input)
  })

  it("serializes edited display text over the original wiki display", () => {
    const parsed = parse("[[Page|Old Label]]", internalLinks)
    const paragraph = parsed[0] as Element
    const link = findAnchor(paragraph.children as Segment[])
    link.children = [{ text: "New Label" }]

    assert.equal(
      serialize(parsed, internalLinks).trimEnd(),
      "[[Page|New Label]]"
    )
  })

  it("escapes wiki link label brackets when serializing", () => {
    const tree: Element[] = [
      {
        type: "paragraph",
        children: [
          {
            type: "anchor",
            href: "wysimark:wiki-link:Page",
            children: [{ text: "label [[nested]]" }],
          },
        ],
      },
    ]

    const markdown = serialize(tree, internalLinks).trimEnd()
    const reparsed = parse(markdown, internalLinks)
    const paragraph = reparsed[0] as Element
    const link = findAnchor(paragraph.children as Segment[])
    const label = link.children[0]

    assert.equal(markdown, "[[Page|label \\[\\[nested\\]\\]]]")
    assert.ok(SlateText.isText(label))
    assert.equal(label.text, "label [[nested]]")
    assert.equal(serialize(reparsed, internalLinks).trimEnd(), markdown)
  })

  it("escapes literal wiki-link-looking text when serializing", () => {
    const tree: Element[] = [
      { type: "paragraph", children: [{ text: "[[Project plan]]" }] },
    ]
    const markdown = serialize(tree, internalLinks).trimEnd()
    assert.equal(markdown, "\\[[Project plan]]")
    assert.deepEqual(parse(markdown, internalLinks), tree)
  })
})
