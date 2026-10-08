import { Editor } from "slate"

import { curryOne } from "../../sink"

import { createCodeBlock } from "./createCodeBlock"
import { setCodeBlockLanguage } from "./setCodeBlockLanguage"
import { convertCodeBlockToParagraph } from "./convertCodeBlockToParagraph"
import { toggleCodeBlock } from "./toggleCodeBlock"

export function createCodeBlockMethods(editor: Editor) {
  return {
    convertCodeBlockToParagraph: curryOne(convertCodeBlockToParagraph, editor),
    toggleCodeBlock: curryOne(toggleCodeBlock, editor),
    createCodeBlock: curryOne(createCodeBlock, editor),
    setCodeBlockLanguage: curryOne(setCodeBlockLanguage, editor),
  }
}
