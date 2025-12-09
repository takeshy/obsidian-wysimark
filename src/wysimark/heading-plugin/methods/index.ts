import { Editor } from "slate"

import { curryOne } from "../../sink"

import { HeadingElement } from "../types"

function convertHeading(
  editor: Editor,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  allowToggle: boolean
) {
  editor.convertElement.convertElements<HeadingElement>(
    (element) => element.type === "heading" && element.level == level,
    { type: "heading", level },
    allowToggle
  )
}

function isHeadingActive(editor: Editor, level: 1 | 2 | 3 | 4 | 5 | 6) {
  const [match] = Editor.nodes(editor, {
    match: n => {
      return (
        'type' in n &&
        'level' in n &&
        n.type === 'heading' &&
        n.level === level
      )
    },
  })
  return !!match
}

export function createHeadingMethods(editor: Editor) {
  return {
    convertHeading: curryOne(convertHeading, editor),
    isHeadingActive: curryOne(isHeadingActive, editor),
  }
}
