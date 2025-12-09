import { Editor, Transforms } from "slate"
import { ReactEditor } from "slate-react"

import { curryOne } from "../../sink"
import { ImageBlockElement} from "../types"

function noop(editor: Editor) {
  editor
}

function insertImageFromUrl(
  editor: Editor,
  url: string,
  alt?: string,
  title?: string,
) {
  const { selection } = editor
  
  Transforms.insertNodes(editor, {
    type: "image-block",
    url,
    alt: alt || "",
    title: title || "",
    width: 320,
    height: 240,
    children: [{ text: "" }],
  } as ImageBlockElement)

  /**
   * If there is no selection the element is inserted at the bottom of the
   * editor. When this happens, the insertion point may not be visible and
   * so this code scrolls to the bottom of the editor. We don't do this if
   * there is a selection because if the user made a selection, it is
   * likely already in view.
   */
  if (!selection) {
    const lastPos = Editor.end(editor, [])
    Transforms.select(editor, lastPos)
    ReactEditor.focus(editor)
  }
}

export function createImageMethods(editor: Editor) {
  return {
    noop: curryOne(noop, editor),
    insertImageFromUrl: curryOne(insertImageFromUrl, editor),
  }
}
