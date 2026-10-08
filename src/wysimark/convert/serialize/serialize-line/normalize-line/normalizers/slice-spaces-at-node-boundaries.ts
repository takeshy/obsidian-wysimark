import { Text } from "../../../../types"
import { isPlainSpace, isText } from "../../utils"
import { NormalizeOptions } from "../types"

/**
 * If a Text Node has spaces at the very start, or at the very end, we slice
 * those spaces into their own nodes.
 *
 * This is to help us later with the serialize process because we need spaces
 * to be isolated so that when we apple tokens like `**bold**` we are able
 * to place the tokens so that they are always against the non-space characters.
 *
 * For example, `** bold**` would not bold the text because the `**` is not
 * touching the word `bold` on the left.
 *
 * The algorithm here works by looking for a RegExp match on spaces on the
 * left or the right. If either are found, then it splits it into three parts
 * (left space, middle and right space) and then filteres out any zero length
 * spaces at the end. In this way, we handle left and right spaces in one
 * pass.
 */
export function sliceSpacesAtNodeBoundaries({
  node,
  nodes,
  index,
}: NormalizeOptions): boolean {
  if (!isText(node)) return false
  if (isPlainSpace(node)) return false
  /**
   * The content of Inline Code is literal so don't move the spaces out of it.
   */
  if (node.code) return false
  if (node.html || node.footnote) return false
  // A soft break must stay one leaf with its marks so it serializes as a bare newline.
  if (node.softBreak) return false
  const match = node.text.match(/^(\s*)([\s\S]*?)(\s*)$/)
  if (!match) return false
  /**
   * A whitespace-only node (e.g. a lone line break) has nothing to slice off;
   * splitting it would recreate the same node forever.
   */
  if (match[2] === "") return false
  if (match[1].length === 0 && match[3].length === 0) return false
  const nextSegments: Text[] = [
    { text: match[1] },
    { ...node, text: match[2] },
    { text: match[3] },
  ].filter((text) => text.text !== "")
  nodes.splice(index, 1, ...nextSegments)
  return true
}
