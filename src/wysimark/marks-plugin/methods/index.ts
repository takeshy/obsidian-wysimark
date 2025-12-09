import { Editor } from "slate"

import { curryOne } from "../../sink"

import { removeMarks } from "./removeMarks"
import { toggleMark } from "./toggle-mark"

export function createMarksMethods(editor: Editor) {
  return {
    removeMarks: curryOne(removeMarks, editor),
    toggleMark: curryOne(toggleMark, editor),
    toggleBold: () => toggleMark(editor, "bold"),
    toggleItalic: () => toggleMark(editor, "italic"),
    toggleUnderline: () => toggleMark(editor, "underline"),
    toggleStrike: () => toggleMark(editor, "strike"),
  }
}
