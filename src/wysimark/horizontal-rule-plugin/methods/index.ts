import { Editor } from "slate"

import { curryOne, insertRootElement } from "../../sink"

function insertHorizontalRule(editor: Editor) {
  return insertRootElement(editor, {
    type: "horizontal-rule",
    children: [{ text: "" }],
  })
}

export function createHorizontalRuleMethods(editor: Editor) {
  return {
    insertHorizontalRule: curryOne(insertHorizontalRule, editor),
  }
}
