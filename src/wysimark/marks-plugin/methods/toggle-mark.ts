import { Editor, Location, Point, Range, Text, Transforms } from "slate"

/**
 * Toggles a mark.
 *
 * Certain marks may not be able to co-exist with another mark. For example,
 * superscript and subscript cannot be applied at the same time. In these
 * cases, you can provide a final argument of `unsetKey` that when the mark
 * is toggled on, the `unsetKey` mark is toggled off automatically. When the
 * mark is toggled off, it will ignore the `unsetKey`
 */

export function toggleMark(
  editor: Editor,
  markKey: keyof Text,
  unsetKey?: keyof Text,
  { at = editor.selection }: { at?: Location | null } = {}
) {
  if (at == null) return

  // Check if selection is at end of line
  const point = Range.isRange(at as any) ? (at as Range).focus : at
  const isAtLineEnd = Point.isPoint(point) && (
    Editor.after(editor, point) === null || 
    Editor.isEnd(editor, point, Editor.end(editor, []))
  )

  const validMarkKey = markKey as 'bold' | 'italic' | 'underline' | 'strike'
  const marks = Editor.marks(editor) || {}
  const isActive = marks[validMarkKey] === true

  // Store mark state for next insert if at line end
  if (isAtLineEnd) {
    if (!isActive) {
      // Turning mark on
      editor.activeMarks = {
        ...editor.activeMarks,
        [validMarkKey]: true
      }
    } else {
      // Turning mark off
      const { [validMarkKey]: _, ...remainingMarks } = editor.activeMarks || {}
      editor.activeMarks = remainingMarks
    }
  }

  // Toggle mark in current selection
  if (isActive) {
    Editor.removeMark(editor, validMarkKey)
  } else {
    Editor.addMark(editor, validMarkKey, true)
  }

  // Handle unset key if provided
  if (typeof unsetKey === "string") {
    Editor.removeMark(editor, unsetKey)
  }
}
