import type { Heading } from "mdast"
import { Descendant } from "slate"

import { InternalLinkOptions } from "../obsidian-links"
import { Element } from "../types"
import { parsePhrasingContents } from "./parse-phrasing-content/parse-phrasing-content"

export function parseHeading(
  content: Heading,
  options: InternalLinkOptions = {}
): Element[] {
  return [
    {
      type: "heading",
      level: content.depth,
      children: parsePhrasingContents(content.children, {}, options) as Descendant[],
    },
  ]
}
