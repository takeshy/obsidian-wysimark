import { MouseEvent, useCallback } from "react"
import { Transforms } from "slate"
import { ReactEditor, useSlateStatic } from "slate-react"

import { serialize } from "../../convert"
import { $CodeBlockActionButton, $CodeBlockActions } from "../styles"
import { CodeBlockElement } from "../types"

type CodeBlockActionsProps = {
  element: CodeBlockElement
}

async function writeClipboardText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  throw new Error("Clipboard API is unavailable")
}

export function CodeBlockActions({ element }: CodeBlockActionsProps) {
  const editor = useSlateStatic()

  const copyBlock = useCallback(
    async (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      try {
        await writeClipboardText(serialize([element]).trimEnd())
      } catch {
        // The block remains selected so the user can use the browser shortcut.
      }
    },
    [element]
  )

  const cutBlock = useCallback(
    async (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      try {
        await writeClipboardText(serialize([element]).trimEnd())
      } catch {
        return
      }
      const path = ReactEditor.findPath(editor, element)
      Transforms.removeNodes(editor, { at: path })
      ReactEditor.focus(editor)
    },
    [editor, element]
  )

  return (
    <$CodeBlockActions contentEditable={false}>
      <$CodeBlockActionButton
        aria-label="Copy code block"
        title="Copy"
        type="button"
        onMouseDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onClick={copyBlock}
      >
        ⧉
      </$CodeBlockActionButton>
      <$CodeBlockActionButton
        aria-label="Cut code block"
        title="Cut"
        type="button"
        onMouseDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onClick={cutBlock}
      >
        ✂
      </$CodeBlockActionButton>
    </$CodeBlockActions>
  )
}
