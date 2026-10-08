import { Editor, Node, Range } from "slate"

import { insertRootElement } from "../../sink"
import { convertCodeBlockToParagraph } from "./convertCodeBlockToParagraph"
import { createCodeBlock } from "./createCodeBlock"

export function toggleCodeBlock(editor: Editor) {
  if (convertCodeBlockToParagraph(editor)) return
  if (editor.selection && Range.isExpanded(editor.selection)) {
    // A fragment trims the boundary blocks to the selection. Join its leaf
    // blocks explicitly because Node.string omits separators between blocks.
    const text = Editor.fragment(editor, editor.selection)
      .flatMap((node) =>
        Array.from(Node.elements(node))
          .filter(([element]) =>
            Editor.isBlock(editor, element) && Editor.hasInlines(editor, element)
          )
          .map(([element]) => Node.string(element))
      )
      .join("\n")
    insertRootElement(editor, {
      type: "code-block",
      language: "text",
      children: text.split("\n").map((line) => ({
        type: "code-block-line",
        children: [{ text: line }],
      })),
    }, { select: true })
    return
  }
  createCodeBlock(editor, { language: "text" })
}
