import { Editor, Transforms } from "slate"

import { curryOne } from "../../sink"

import { parse } from "../../convert"

function pasteMarkdown(editor: Editor, markdown: string) {

  const fragment = parse(markdown)
  for (const element of fragment) {
    delete element.__markdownLeadingNewlines
    delete element.__markdownTrailingNewlines
  }
  Transforms.insertNodes(editor, fragment)
}

export function createPasteMarkdownMethods(editor: Editor) {
  return {
    pasteMarkdown: curryOne(pasteMarkdown, editor),
  }
}
