import { Node, Path } from "slate"
import { ReactEditor, useSlate } from "slate-react"

export function useIsElementSelectionInside(element: Node): boolean {
  const editor = useSlate()
  const { selection } = editor
  if (!selection) return false

  try {
    const path = ReactEditor.findPath(editor, element)
    const anchorPath = selection.anchor.path
    const focusPath = selection.focus.path
    return (
      Path.equals(path, anchorPath) ||
      Path.equals(path, focusPath) ||
      Path.isAncestor(path, anchorPath) ||
      Path.isAncestor(path, focusPath)
    )
  } catch {
    return false
  }
}
