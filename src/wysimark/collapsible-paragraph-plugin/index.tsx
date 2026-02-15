import { Descendant } from "slate"

import {
  createHotkeyHandler,
  createPlugin,
  curryOne,
  TypedPlugin,
} from "../sink"

import { normalizeNode } from "./normalize-node"
import { Paragraph } from "./render-element/paragraph"

export type CollapsibleParagraphEditor = {
  collapsibleParagraph: {
    convertParagraph: () => void
  }
}

export type ParagraphElement = {
  type: "paragraph"
  __collapsible?: true
  children: Descendant[]
}

export type CollapsibleParagraphPluginCustomTypes = {
  Name: "collapsible-paragraph"
  Editor: CollapsibleParagraphEditor
  Element: ParagraphElement
}

export const CollapsibleParagraphPlugin =
  createPlugin<CollapsibleParagraphPluginCustomTypes>((editor) => {
    const { insertBreak } = editor
    editor.insertBreak = () => {
      // Enter = new paragraph, Shift+Enter = soft break (handled in onKeyDown)
      insertBreak()
    }

    /**
     * Insert a soft break (line break within the same paragraph).
     * Called by Shift+Enter via onKeyDown.
     */
    editor.insertSoftBreak = () => {
      editor.insertText('\n')
    }

    editor.convertElement.addConvertElementType("paragraph")
    editor.collapsibleParagraph = {
      convertParagraph: () => {
        editor.convertElement.convertElements<ParagraphElement>(
          () => false,
          {
            type: "paragraph",
          },
          false
        )
      },
    }
    if (!editor.normalizeAfterDelete) {
      throw new Error(
        `The collapsible-paragraph-plugin has a dependency on the normalize-after-delete plugin. Please add that plugin before this one.`
      )
    }

    return {
      name: "collapsible-paragraph",
      editor: {
        normalizeNode: curryOne(normalizeNode, editor),
      },
      editableProps: {
        renderElement: ({ element, attributes, children }) => {
          switch (element.type) {
            case "paragraph": {
              return (
                <Paragraph element={element} attributes={attributes}>
                  {children}
                </Paragraph>
              )
            }
          }
        },
        onKeyDown: (e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault()
            if (e.shiftKey) {
              // Shift+Enter = soft break (line break within paragraph)
              editor.insertSoftBreak()
            } else {
              // Enter = new paragraph
              editor.insertBreak()
            }
            return true
          }
          return createHotkeyHandler({
            "super+0": editor.collapsibleParagraph.convertParagraph,
          })(e)
        },
      },
    }
  }) as TypedPlugin<CollapsibleParagraphPluginCustomTypes>
