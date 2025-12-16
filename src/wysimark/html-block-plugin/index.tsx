import { Transforms } from "slate"

import { createPlugin, findElementUp, isCollapsed, TypedPlugin } from "../sink"

import { HtmlBlockPluginCustomTypes } from "./types"
import { HtmlBlock } from "./render-element"
export * from "./types"

export const HtmlBlockPlugin = createPlugin<HtmlBlockPluginCustomTypes>(
  (editor, _options, { createPolicy }) => {
    function onDelete(): boolean {
      const { selection } = editor
      if (!isCollapsed(selection)) return false
      const htmlBlockEntry = findElementUp(editor, "html-block")
      if (htmlBlockEntry == null) return false
      Transforms.removeNodes(editor, { at: htmlBlockEntry[1] })
      return true
    }

    return createPolicy({
      name: "html-block",
      editor: {
        deleteBackward: onDelete,
        deleteForward: onDelete,
        isInline(element) {
          if (element.type === "html-block") return false
        },
        isVoid(element) {
          if (element.type === "html-block") return true
        },
        isMaster(element) {
          if (element.type === "html-block") return true
        },
      },
      editableProps: {
        renderElement: ({ element, attributes, children }) => {
          if (element.type === "html-block") {
            return (
              <HtmlBlock element={element} attributes={attributes}>
                {children}
              </HtmlBlock>
            )
          }
        },
      },
    })
  }
) as TypedPlugin<HtmlBlockPluginCustomTypes>
