import { Text, Transforms } from "slate"
import { createPlugin, findElementUp, isCollapsed, TypedPlugin } from "../sink"

export type LinkDefinitionElement = {
  type: "link-definition"
  markdown: string
  children: Text[]
}

type LinkDefinitionTypes = {
  Name: "link-definition"
  Editor: Record<string, never>
  Element: LinkDefinitionElement
}

export const LinkDefinitionPlugin = createPlugin<LinkDefinitionTypes>(
  (editor, _options, { createPolicy }) => {
    const onDelete = () => {
      if (!isCollapsed(editor.selection)) return false
      const entry = findElementUp(editor, "link-definition")
      if (!entry) return false
      Transforms.removeNodes(editor, { at: entry[1] })
      return true
    }
    return createPolicy({
      name: "link-definition",
      editor: {
        deleteBackward: onDelete,
        deleteForward: onDelete,
        isInline: (element) => element.type === "link-definition" ? false : undefined,
        isVoid: (element) => element.type === "link-definition" ? true : undefined,
        isMaster: (element) => element.type === "link-definition" ? true : undefined,
      },
      editableProps: {
        renderElement: ({ element, attributes, children }) => {
          if (element.type !== "link-definition") return
          return <div {...attributes}>
            <pre contentEditable={false}>{element.markdown}</pre>
            {children}
          </div>
        },
      },
    })
  }
) as TypedPlugin<LinkDefinitionTypes>
