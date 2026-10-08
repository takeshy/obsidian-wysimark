import type { Root, TopLevelContent } from "mdast"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"

import { Element } from "../types"
import { customRemarkGfm } from "./custom-gfm"
import {
  InternalLinkOptions,
  protectEscapedWikiLinks,
} from "../obsidian-links"
import { parseContents } from "./parse-content"
import { transformInlineLinks } from "./transform-inline-links"
import { getLineEnding, withLineEnding } from "../line-endings"

const parser = unified().use(remarkParse).use(customRemarkGfm())

export function parseToAst(
  markdown: string,
  options: InternalLinkOptions = { enableInternalLinks: true }
) {
  const source = options.enableInternalLinks ? protectEscapedWikiLinks(markdown) : markdown
  const ast = parser.parse(source) as Root
  visit(ast, "definition", (node) => {
    const start = node.position?.start.offset
    const end = node.position?.end.offset
    if (start !== undefined && end !== undefined) {
      node.data = { ...node.data, rawMarkdown: source.slice(start, end) }
    }
  })
  visit(ast, "link", (node) => {
    const start = node.position?.start.offset
    const end = node.position?.end.offset
    if (start === undefined || end === undefined) return
    const raw = source.slice(start, end)
    if (!raw.startsWith("[") && node.children.length === 1 && node.children[0].type === "text") {
      node.data = { ...node.data, markdownSyntax: raw.startsWith("<") ? "autolink" : "literal" }
    }
  })
  /**
   * Takes linkReference and imageReference and turns them into link and image.
   */
  transformInlineLinks(ast)
  return ast
}

/**
 * Takes a Markdown string as input and returns a remarkParse AST
 */
export function parse(
  markdown: string,
  options: InternalLinkOptions = { enableInternalLinks: true }
): Element[] {
  const lineEnding = getLineEnding(markdown)
  markdown = withLineEnding(markdown, "\n")
  const ast = parseToAst(markdown, options)
  /**
   * If there is no content, remark returns a root ast with no children (i.e.
   * no paragraphs) but for Slate, we need it to return an empty paragraph.
   *
   * So when this happens, we just generate an empty paragraph and return that
   * s he result.
   */
  if (ast.children.length === 0) {
    const empty = Array.from({ length: (markdown.match(/\n/g)?.length || 0) + 1 }, () => ({
      type: "paragraph", children: [{ text: "" }],
    })) as Element[]
    if (lineEnding !== "\n") empty[0].__markdownLineEnding = lineEnding
    return empty
  }

  const elements = parseContents(ast.children as TopLevelContent[], options)
  if (lineEnding !== "\n" && elements.length) elements[0].__markdownLineEnding = lineEnding
  const leading = markdown.match(/^\n+/)?.[0].length || 0
  const trailing = markdown.match(/\n+$/)?.[0].length || 0
  // Source boundary whitespace is not an additional editable paragraph.
  if (leading && elements.length) elements[0].__markdownLeadingNewlines = leading
  if (trailing && elements.length) elements[elements.length - 1].__markdownTrailingNewlines = trailing
  return elements
}
