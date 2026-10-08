import { Editor, Node, Path, Point, Transforms } from "slate"

import { findElementUp } from "../../sink"
import type { CodeBlockElement } from "../types"

export function convertCodeBlockToParagraph(editor: Editor): boolean {
  const entry = findElementUp<CodeBlockElement>(editor, "code-block")
  if (!entry) return false
  const [block, path] = entry
  const lines = block.children.map((line) => Node.string(line))
  const mapPoint = (point: Point): Point => {
    if (!Path.isAncestor(path, point.path)) return point
    const lineIndex = point.path[path.length]
    const linePath = [...path, lineIndex]
    const offset = lines.slice(0, lineIndex)
      .reduce((sum, line) => sum + line.length + 1, 0)
      + Editor.string(editor, { anchor: Editor.start(editor, linePath), focus: point }).length
    return { path: [...path, 0], offset }
  }
  const selection = editor.selection && {
    anchor: mapPoint(editor.selection.anchor),
    focus: mapPoint(editor.selection.focus),
  }
  Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, { at: path })
    Transforms.insertNodes(
      editor,
      { type: "paragraph", children: [{ text: lines.join("\n") }] },
      { at: path }
    )
    if (selection) Transforms.select(editor, selection)
  })
  return true
}
