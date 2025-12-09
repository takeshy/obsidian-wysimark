import { Editor, Element } from "slate"
import { findElementUp, isStartOfElement } from "../../sink"
import { isListItem } from ".."
import { ListItemElement } from "../types"

const MAX_DEPTH = 2

export function getListDepth(editor: Editor): number {
  const listItem = findElementUp<ListItemElement>(editor, isListItem)
  if (!listItem) return 0
  return listItem[0].depth
}

export function canIncreaseDepth(editor: Editor): boolean {
  if (!isStartOfElement(editor, isListItem)) return false
  const depth = getListDepth(editor)
  return depth < MAX_DEPTH
}

export function canDecreaseDepth(editor: Editor): boolean {
  if (!isStartOfElement(editor, isListItem)) return false
  const depth = getListDepth(editor)
  return depth > 0
}

export function increaseDepth(editor: Editor): void {
  if (!canIncreaseDepth(editor)) return
  editor.list.indent()
}

export function decreaseDepth(editor: Editor): void {
  if (!canDecreaseDepth(editor)) return
  editor.list.outdent()
}
