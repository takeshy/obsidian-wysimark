import { Editor, Node, Transforms } from "slate"

import { BetterAt, findElementUp } from "../../sink"
import { AnchorElement } from ".."

export function editLink(
  editor: Editor,
  { href, title, text }: { href: string; title?: string; text?: string },
  { at }: { at?: BetterAt }
) {
  const link = findElementUp(editor, "anchor", { at })
  if (!link) return false
  const [element, path] = link

  // Update href and title
  Transforms.setNodes<AnchorElement>(editor, { href, title }, { at: path })

  // Update text if provided and different from current
  if (text !== undefined) {
    const currentText = Node.string(element)
    if (text !== currentText) {
      // Remove all children and insert new text
      Editor.withoutNormalizing(editor, () => {
        const childCount = element.children.length
        for (let i = childCount - 1; i >= 0; i--) {
          Transforms.removeNodes(editor, { at: [...path, i] })
        }
        Transforms.insertNodes(editor, { text }, { at: [...path, 0] })
      })
    }
  }

  return true
}
