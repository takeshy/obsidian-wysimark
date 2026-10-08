import type { FootnoteDefinition } from "mdast"

import { InternalLinkOptions } from "../obsidian-links"
import { Element } from "../types"
import { parseContents } from "./parse-content"

/** Preserve the definition as editable blocks with its original identifier. */
export function parseFootnoteDefinition(
  footnote: FootnoteDefinition,
  options: InternalLinkOptions = {}
): Element[] {
  return [
    {
      type: "block-quote",
      footnoteIdentifier: footnote.identifier,
      children: parseContents(footnote.children, options),
    },
  ]
}
