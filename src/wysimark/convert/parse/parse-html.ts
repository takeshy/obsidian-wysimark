import type { HTML } from "mdast"

import { Element } from "../types"
import { restoreEscapedWikiLinks } from "../obsidian-links"

export function parseHTML(content: HTML): Element[] {
  return [
    {
      type: "html-block",
      html: restoreEscapedWikiLinks(content.value, true),
      children: [{ text: "" }],
    },
  ]
}
