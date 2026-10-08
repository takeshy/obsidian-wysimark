import { ImageBlockElement } from "../../../image-plugin/types"
import { InternalLinkOptions } from "../../obsidian-links"

import { serializeImageShared } from "../serialize-image-shared"

/**
 * Serialize an image block element to markdown.
 *
 * Block-level images require trailing newlines (\n\n) to properly separate
 * them from subsequent content. Without these newlines, content immediately
 * following an image (like headings) would be parsed as part of the same
 * paragraph, breaking the markdown structure.
 *
 * Example:
 *   Correct:   ![alt](url)\n\n# Heading
 *   Incorrect: ![alt](url)# Heading  <- heading becomes plain text
 */
export function serializeImageBlock(
  element: ImageBlockElement,
  options: InternalLinkOptions = {}
): string {
  const imageMarkdown = serializeImageShared(element, options)
  return imageMarkdown ? `${imageMarkdown}\n\n` : ""
}
