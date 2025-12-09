import { Editor } from "slate"

import { VoidActionReturn } from "../../../sink"

import { autocompleteMark } from "./autocomplete-mark"

export function insertText(editor: Editor, text: string): VoidActionReturn {
  // Apply active marks to inserted text if they exist
  if (editor.activeMarks && Object.keys(editor.activeMarks).length > 0) {
    const { insertText: defaultInsertText } = editor
    defaultInsertText(text)
    const { activeMarks } = editor
    if (activeMarks.bold) Editor.addMark(editor, 'bold', true)
    if (activeMarks.italic) Editor.addMark(editor, 'italic', true)
    if (activeMarks.underline) Editor.addMark(editor, 'underline', true)
    if (activeMarks.strike) Editor.addMark(editor, 'strike', true)
    return true
  }

  return (
    autocompleteMark(editor, text, {
      triggerMarker: "`",
      regexp: /([`])([^`]+)([`])$/,
      mark: "code",
    }) ||
    autocompleteMark(editor, text, {
      triggerMarker: "*",
      regexp: /([*][*])([^*]+)([*][*])$/,
      mark: "bold",
    }) ||
    autocompleteMark(editor, text, {
      triggerMarker: "~",
      regexp: /(~~)([^~]+)(~~)$/,
      mark: "bold",
    }) ||
    autocompleteMark(editor, text, {
      triggerMarker: "*",
      regexp: /(?:[^*]|^)([*])([^*]+)([*])$/,
      mark: "italic",
    }) ||
    autocompleteMark(editor, text, {
      triggerMarker: "~",
      regexp: /(?:[^~]|^)(~)([^~]+)(~)$/,
      mark: "italic",
    })
  )
}
