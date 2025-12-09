import { Editor } from "slate"

import { curryOne } from "../../sink"

function noop(editor: Editor) {
  editor
}

export function create__VarName__Methods(editor: Editor) {
  return {
    noop: curryOne(noop, editor),
  }
}
