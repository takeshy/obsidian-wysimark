import { Editor } from "slate"

import { curryOne } from "../../sink"

import {
  convertOrderedList,
  convertTaskList,
  convertUnorderedList,
} from "./convert-list-item"
import {
  getListDepth,
  canIncreaseDepth,
  canDecreaseDepth,
  increaseDepth,
  decreaseDepth,
} from "./depth"
import { indent } from "./indent"
import { insertBreak } from "./insert-break"
import { outdent } from "./outdent"
import { toggleTaskListItem } from "./toggleTaskListItem"

export function createListMethods(editor: Editor) {
  return {
    indent: curryOne(indent, editor),
    outdent: curryOne(outdent, editor),
    convertUnorderedList: curryOne(convertUnorderedList, editor),
    convertOrderedList: curryOne(convertOrderedList, editor),
    convertTaskList: curryOne(convertTaskList, editor),
    insertBreak: curryOne(insertBreak, editor),
    toggleTaskListItem: curryOne(toggleTaskListItem, editor),
    getListDepth: curryOne(getListDepth, editor),
    canIncreaseDepth: curryOne(canIncreaseDepth, editor),
    canDecreaseDepth: curryOne(canDecreaseDepth, editor),
    increaseDepth: curryOne(increaseDepth, editor),
    decreaseDepth: curryOne(decreaseDepth, editor),
  }
}
