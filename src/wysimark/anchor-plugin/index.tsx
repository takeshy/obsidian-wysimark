import { Descendant } from "slate"

import { BetterAt, createPlugin, curryOne } from "../sink"

import { TypedPlugin } from "../sink/types/plugin/plugin"
import { onPaste } from "./editable/on-paste"
import { createAnchorMethods } from "./methods"
import { normalizeNode } from "./normalize-node"
import { Anchor } from "./render-element/anchor"

type AnchorMethods = {
  insertLink: (
    href: string,
    text?: string,
    options?: { select?: boolean; title?: string }
  ) => void
  removeLink: (options: { at?: BetterAt }) => boolean
  editLink: (
    props: { href: string; title?: string; text?: string },
    options: { at?: BetterAt }
  ) => boolean
}

export type AnchorEditor = {
  anchor: AnchorMethods
}

export type AnchorElement = {
  type: "anchor"
  href: string
  target?: string
  title?: string
  children: Descendant[]
}

export type AnchorPluginCustomTypes = {
  Name: "anchor"
  Editor: AnchorEditor
  Element: AnchorElement
}

export const AnchorPlugin = createPlugin<AnchorPluginCustomTypes>(
  (editor, _options, { createPolicy }) => {
    editor.anchor = createAnchorMethods(editor)
    return createPolicy({
      name: "anchor",
      editor: {
        isInline(element) {
          if (element.type === "anchor") return true
        },
        normalizeNode: curryOne(normalizeNode, editor),
      },
      editableProps: {
        onPaste: curryOne(onPaste, editor),
        renderElement: ({ element, attributes, children }) => {
          if (element.type === "anchor") {
            return (
              <Anchor element={element} attributes={attributes}>
                {children}
              </Anchor>
            )
          }
        },
      },
    })
  }
) as TypedPlugin<AnchorPluginCustomTypes>
