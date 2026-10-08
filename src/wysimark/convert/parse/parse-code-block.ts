import type { Code } from "mdast"

import { Element } from "../types"
import { restoreEscapedWikiLinks } from "../obsidian-links"

export function parseCodeBlock(content: Code): Element[] {
  const codeLines = restoreEscapedWikiLinks(content.value, true).split("\n")
  return [
    {
      type: "code-block",
      language: content.lang || "",
      ...(content.meta ? { meta: content.meta } : {}),
      children: codeLines.map((codeLine) => ({
        type: "code-block-line",
        children: [{ text: codeLine }],
      })),
    },
  ]
}
