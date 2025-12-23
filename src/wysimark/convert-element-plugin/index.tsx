import { Element } from "slate"

import { createPlugin, TypedPlugin } from "../sink"

import { createConvertElementMethods } from "./methods"
import { CurriedConvertElements } from "./methods/convert-elements"

type ConvertElementMethods = {
  convertElementTypes: string[]
  addConvertElementType: (type: Element["type"] | Array<Element["type"]>) => void
  isConvertibleElement: (element: Element) => boolean
  convertElements: CurriedConvertElements
}

export type ConvertElementEditor = {
  convertElement: ConvertElementMethods
}

export type ConvertElementPluginCustomTypes = {
  Name: "convert-element"
  Editor: ConvertElementEditor
}

export const ConvertElementPlugin =
  createPlugin<ConvertElementPluginCustomTypes>((editor) => {
    editor.convertElement = createConvertElementMethods(editor)
    return {
      name: "convert-element",
    }
  }) as TypedPlugin<ConvertElementPluginCustomTypes>
