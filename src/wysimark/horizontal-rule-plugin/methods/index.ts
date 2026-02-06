import { Editor, Element, Path, Transforms } from "slate"

import { curryOne, findElementUp } from "../../sink"

function insertHorizontalRule(editor: Editor) {
  const { selection } = editor
  if (!selection) return false

  // Look for a parent that `isMaster`
  const entry = findElementUp(
    editor,
    (node) => Element.isElement(node) && editor.isMaster(node)
  )

  const hrElement = {
    type: "horizontal-rule" as const,
    children: [{ text: "" }] as [{ text: string }],
  }
  const paragraphElement = {
    type: "paragraph" as const,
    children: [{ text: "" }],
  }

  if (entry == null) {
    // Insert horizontal rule and a new paragraph after it
    Editor.withoutNormalizing(editor, () => {
      Transforms.insertNodes(editor, [hrElement, paragraphElement])
      // Move cursor to the new paragraph
      Transforms.move(editor)
    })
  } else {
    // If inside a master element (like table), insert after it
    const nextPath = Path.next(entry[1])
    Editor.withoutNormalizing(editor, () => {
      Transforms.insertNodes(editor, [hrElement, paragraphElement], { at: nextPath })
      // Select the start of the new paragraph
      const paragraphPath = Path.next(nextPath)
      Transforms.select(editor, Editor.start(editor, paragraphPath))
    })
  }
  return true
}

export function createHorizontalRuleMethods(editor: Editor) {
  return {
    insertHorizontalRule: curryOne(insertHorizontalRule, editor),
  }
}
