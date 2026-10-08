import { AnchorElement } from "../../../../anchor-plugin"
import { Text } from "slate"
import { isWikiLinkHref, serializeWikiLinkHref } from "../../../obsidian-links"

import { Segment } from "../../../types"
import { serializeLine } from "../serialize-line"
import { serializeLinkDestination, serializeLinkTitle } from "../../serialize-link-destination"
import { EscapeTextOptions, getCommonAnchorMarks } from "../utils"

export function serializeAnchor(
  anchor: AnchorElement,
  options?: EscapeTextOptions
): string {
  if (!anchor.title && anchor.markdownSyntax && anchor.children.length === 1 && Text.isText(anchor.children[0])) {
    const label = anchor.children[0].text
    if (anchor.href === label || anchor.href === `mailto:${label}` || anchor.href === `http://${label}`) {
      return anchor.markdownSyntax === "autolink" ? `<${label}>` : label
    }
  }
  if (options?.enableInternalLinks && isWikiLinkHref(anchor.href)) {
    const commonAnchorMarks = getCommonAnchorMarks(anchor.children as Segment[])
    const labelOptions: EscapeTextOptions = { ...options, inAnchorLabel: true }
    return serializeWikiLinkHref(
      anchor.href,
      serializeLine(
        anchor.children as Segment[],
        commonAnchorMarks,
        commonAnchorMarks,
        labelOptions
      )
    )
  }

  const commonAnchorMarks = getCommonAnchorMarks(anchor.children as Segment[])
  /**
   * An unbalanced bracket in the label text would change where the `[label]`
   * ends, so brackets inside the label are always escaped.
   */
  const labelOptions: EscapeTextOptions = { ...options, inAnchorLabel: true }
  if (anchor.href.startsWith("$"))
    return serializeLine(
      anchor.children as Segment[],
      commonAnchorMarks,
      commonAnchorMarks,
      options
    )
  if (typeof anchor.title === "string" && anchor.title.length > 0) {
    return (
      /**
       * TODO: Handle anchor children more elegantly in serializeAnchor.
       *
       * We type cast `children` as `Segment` here because the children of an
       * `anchor` is limited to be Inline types. There are two things to do
       * related to this though:
       *
       * - [ ] consider fixing the `anchor` type to actually limit the
       *   children as expected.
       * - [ ] consider expanding the definition of `Segment` to include
       *   inline images as that is an acceptable inline value which is
       *   currently not defined as part of Segment.
       */
      `[${serializeLine(
        anchor.children as Segment[],
        commonAnchorMarks,
        commonAnchorMarks,
        labelOptions
      )}](${serializeLinkDestination(anchor.href)} "${serializeLinkTitle(anchor.title)}")`
    )
  } else {
    return (
      /**
       * TODO: Handle anchor children more elegantly in serializeAnchor.
       *
       * We type cast `children` as `Segment` here because the children of an
       * `anchor` is limited to be Inline types. There are two things to do
       * related to this though:
       *
       * - [ ] consider fixing the `anchor` type to actually limit the
       *   children as expected.
       * - [ ] consider expanding the definition of `Segment` to include
       *   inline images as that is an acceptable inline value which is
       *   currently not defined as part of Segment.
       */
      `[${serializeLine(
        anchor.children as Segment[],
        commonAnchorMarks,
        commonAnchorMarks,
        labelOptions
      )}](${serializeLinkDestination(anchor.href)})`
    )
  }
}
