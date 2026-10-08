import type { List } from "mdast"

import { InternalLinkOptions } from "../../obsidian-links"
import { Element } from "../../types"
import { parseListItem } from "./parse-list-item"

export function parseList(
  list: List,
  depth = 0,
  internalLinkOptions: InternalLinkOptions = {}
): Element[] {
  // console.log(JSON.stringify(list, null, 2))
  const elements: Element[] = []
  for (const listItem of list.children) {
    const firstIndex = elements.length
    elements.push(
      ...parseListItem(
        listItem,
        { depth, ordered: !!list.ordered },
        internalLinkOptions
      )
    )
    if (firstIndex === 0 && list.ordered && list.start != null && list.start !== 1) {
      const first = elements[firstIndex]
      if (first.type === "ordered-list-item") first.start = list.start
    }
  }
  return elements
}
