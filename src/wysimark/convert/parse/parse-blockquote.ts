import type { Blockquote } from "mdast"
import { Descendant } from "slate"

import { Element } from "../types"
import { parseContents } from "./parse-content"

function splitCalloutMarker(elements: Element[]): Element[] {
  const first = elements[0]
  if (!first || first.type !== "paragraph") return elements

  const firstChild = first.children[0]
  if (!firstChild || !("text" in firstChild)) return elements

  const match = firstChild.text.match(
    /^(\[![A-Za-z0-9_-]+\][+-]?(?:[^\n]*))(?:\n([\s\S]*))?$/
  )
  if (!match) return elements

  const markerParagraph: Element = {
    type: "paragraph",
    children: [{ ...firstChild, text: match[1] }] as Descendant[],
  }
  const rest = match[2]
  if (!rest) return [markerParagraph, ...elements.slice(1)]

  const restParagraph: Element = {
    ...first,
    children: [
      { ...firstChild, text: rest },
      ...first.children.slice(1),
    ] as Descendant[],
  }
  return [markerParagraph, restParagraph, ...elements.slice(1)]
}

export function parseBlockquote(content: Blockquote): Element[] {
  return [{
    type: "block-quote",
    children: splitCalloutMarker(parseContents(content.children)),
  }]
}
