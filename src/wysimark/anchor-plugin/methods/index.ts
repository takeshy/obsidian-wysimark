import { Editor } from "slate"

import { curryOne } from "../../sink"

import { convertToEmbed } from "./convertToEmbed"
import { convertToLink } from "./convertToLink"
import { editLink } from "./editLink"
import { insertLink } from "./insertLink"
import { removeLink } from "./removeLink"

export function createAnchorMethods(editor: Editor) {
  return {
    insertLink: curryOne(insertLink, editor),
    removeLink: curryOne(removeLink, editor),
    editLink: curryOne(editLink, editor),
    convertToEmbed: curryOne(convertToEmbed, editor),
    convertToLink: curryOne(convertToLink, editor),
  }
}
