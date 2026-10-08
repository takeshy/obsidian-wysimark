import { Text as SlateText } from "slate"

import { Segment } from "../../../types"
import { assertUnreachable } from "../../../utils"
import { serializeImageShared } from "../../serialize-image-shared"
import { EscapeTextOptions } from "../utils"
import { serializeCodeText } from "../segment/serialize-code-text"
import { serializeAnchor } from "./serialize-anchor"
import { serializeNonCodeText } from "./serialize-non-code-text"

export function serializeSegment(
  segment: Segment,
  options?: EscapeTextOptions
): string {
  if (SlateText.isText(segment)) {
    if (segment.html) return segment.text
    if (segment.footnote) return `[^${segment.footnote}]`
    /**
     * If the segment is a `code` segment, we need to use a different strategy
     * for escaping the `code` segment. This is why it needs a separate
     * serializing function.
     */
    if (segment.code) return serializeCodeText(segment, options)
    /**
     * Otherwise, we use the standard text escaping code.
     */
    return serializeNonCodeText(segment, options)
  }
  switch (segment.type) {
    case "anchor": {
      return serializeAnchor(segment, options)
    }
    case "image-inline":
      return serializeImageShared(segment, options)
    default:
      assertUnreachable(segment)
  }
}
