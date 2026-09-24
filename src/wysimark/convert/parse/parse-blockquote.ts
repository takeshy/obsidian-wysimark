import type { Blockquote } from "mdast"
import { Descendant } from "slate"

import { Element } from "../types"
import { parseContents } from "./parse-content"

/** Split a physical line without losing marks or inline element children. */
function splitFirstLine(
  children: Descendant[]
): [Descendant[], Descendant[]] | null {
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if ("text" in child) {
      const newline = child.text.indexOf("\n")
      if (newline < 0) continue
      return [
        [...children.slice(0, i), { ...child, text: child.text.slice(0, newline) }],
        [{ ...child, text: child.text.slice(newline + 1) }, ...children.slice(i + 1)],
      ]
    }
    const split = splitFirstLine(child.children)
    if (split) {
      return [
        [...children.slice(0, i), { ...child, children: split[0] } as Descendant],
        [{ ...child, children: split[1] } as Descendant, ...children.slice(i + 1)],
      ]
    }
  }
  return null
}

function splitCalloutMarker(elements: Element[]): Element[] {
  const first = elements[0]
  if (!first || first.type !== "paragraph") return elements

  const firstChild = first.children[0]
  if (!firstChild || !("text" in firstChild)) return elements
  if (!/^\[![A-Za-z0-9_-]+\][+-]?/.test(firstChild.text)) return elements

  const split = splitFirstLine(first.children)
  if (!split) return elements

  return [
    { ...first, children: split[0] },
    { ...first, children: split[1] },
    ...elements.slice(1),
  ]
}

export function parseBlockquote(content: Blockquote): Element[] {
  return [{
    type: "block-quote",
    children: splitCalloutMarker(parseContents(content.children)),
  }]
}
