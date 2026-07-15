import { Descendant, Element } from "slate"

import { Segment } from "../../../types"
import { normalizeNodes } from "./normalize-nodes"
import { LineElement } from "./types"

/**
 * A very focused duplicate function that only duplicates the `children` of
 * `anchor` elements.
 *
 * It's designed this way to be fast and to avoid duplicating the entire tree
 * as only anchors have children that will be manipulated.
 */
const duplicateChildren = (children: Descendant[]): Descendant[] => {
  return children.map((child) => {
    if (Element.isElement(child) && child.type === "anchor") {
      return { ...child, children: duplicateChildren(child.children) }
    }
    return child
  })
}

const duplicateSegments = (segments: Segment[]): Segment[] => {
  return segments.map((segment) => {
    if (Element.isElement(segment) && segment.type === "anchor") {
      return {
        ...segment,
        children: duplicateChildren(segment.children),
      }
    } else {
      return segment
    }
  })
}

/**
 * Entry Point for normalizing
 */
export function normalizeLine(segments: Segment[]) {
  /**
   * We need to duplicate `segments` because `normalizeNodes` will manipulate the
   * array but the original array coming from Slate will be readOnly.
   */
  const line: LineElement = {
    type: "line",
    children: duplicateSegments(segments),
  }
  normalizeNodes([line], undefined)
  return line.children
}
