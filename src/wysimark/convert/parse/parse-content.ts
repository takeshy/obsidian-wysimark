import type { TopLevelContent } from "mdast"

import { InternalLinkOptions } from "../obsidian-links"
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
import { serializeLinkDestination, serializeLinkTitle } from "../serialize/serialize-link-destination"

export function parseContents(
  contents: TopLevelContent[],
  options: InternalLinkOptions = {}
): Element[] {
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
        if (gap === 0 && (prev.type === "definition" || curr.type === "definition") && elements.length) {
          elements[elements.length - 1].__markdownCompactAfter = true
        }
        for (let b = 1; b < gap; b++) {
          elements.push({
            type: "paragraph",
            children: [{ text: "" }],
          } as Element)
        }
      }
    }
    elements.push(...parseContent(contents[i], options))
  }
  return elements
}

export function parseContent(
  content: TopLevelContent,
  options: InternalLinkOptions = {}
): Element[] {
  switch (content.type) {
    case "blockquote":
      return parseBlockquote(content, options)
    case "code":
      return parseCodeBlock(content)
    case "definition":
      return [{
        type: "link-definition",
        markdown: typeof content.data?.rawMarkdown === "string" ? content.data.rawMarkdown :
          `[${content.label || content.identifier}]: ${serializeLinkDestination(content.url)}${content.title ? ` "${serializeLinkTitle(content.title)}"` : ""}`,
        children: [{ text: "" }],
      }]
    case "footnoteDefinition":
      return parseFootnoteDefinition(content, options)
    case "heading":
      return parseHeading(content, options)
    case "html":
      return parseHTML(content)
    case "list":
      return parseList(content, 0, options)
    case "paragraph":
      /**
       * Returns a `paragraph` or an `image-block` Element.
       */
      return parseParagraph(content, options)
    case "table":
      return parseTable(content, options)
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
