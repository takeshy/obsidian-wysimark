import type { TopLevelContent } from "mdast"

import { Element } from "../types"
import { assertUnreachable } from "../utils"
import { parseBlockquote } from "./parse-blockquote"
import { parseCodeBlock } from "./parse-code-block"
import { parseFootnoteDefinition } from "./parse-footnote-definition"
import { parseHeading } from "./parse-heading"
import { parseHTML } from "./parse-html"
import { parseList } from "./parse-list"
import { parseParagraph } from "./parse-paragraph"
import { parseTable } from "./parse-table"
import { parseThematicBreak } from "./parse-thematic-break"

export function parseContents(contents: TopLevelContent[]): Element[] {
  const elements: Element[] = []
  for (let i = 0; i < contents.length; i++) {
    /**
     * Detect extra blank lines between MDAST nodes using position info.
     * remark-parse collapses consecutive blank lines, but we can recover
     * them by comparing the end line of the previous node with the start
     * line of the current node. A standard block separation is 1 blank line
     * (gap === 1). Each additional blank line gets an empty paragraph.
     */
    if (i > 0) {
      const prev = contents[i - 1]
      const curr = contents[i]
      if (prev.position && curr.position) {
        const gap = curr.position.start.line - prev.position.end.line - 1
        for (let b = 1; b < gap; b++) {
          elements.push({
            type: "paragraph",
            children: [{ text: "" }],
          } as Element)
        }
      }
    }
    elements.push(...parseContent(contents[i]))
  }
  return elements
}

export function parseContent(content: TopLevelContent): Element[] {
  switch (content.type) {
    case "blockquote":
      return parseBlockquote(content)
    case "code":
      return parseCodeBlock(content)
    case "definition":
      /**
       * A `definition` is used by a `linkRef` or `imageRef`; however, we inline
       * these with our `./remark-inline-links`
       */
      throw new Error(`The type "definition" should not exist. See comments`)
    case "footnoteDefinition":
      return parseFootnoteDefinition(content)
    case "heading":
      return parseHeading(content)
    case "html":
      return parseHTML(content)
    case "list":
      return parseList(content)
    case "paragraph":
      /**
       * Returns a `paragraph` or an `image-block` Element.
       */
      return parseParagraph(content)
    case "table":
      return parseTable(content)
    case "thematicBreak":
      return parseThematicBreak()
    case "yaml":
      /**
       * YAML FrontMatter is not used in Wysimark.
       */
      return []
  }
  assertUnreachable(content)
}
