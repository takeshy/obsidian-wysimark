import { useCallback, useRef } from "react"
import { Editor, Node, Transforms } from "slate"
import { ReactEditor, useFocused, useSelected, useSlateStatic } from "slate-react"

import { Menu, MenuItemData } from "../../shared-overlays"
import { ConstrainedRenderElementProps } from "../../sink"
import { useLayer } from "../../use-layer"
import { ChevronDownIcon } from "../icons/ChevronDownIcon"
import { $CodeBlock, $CodeBlockLanguage, $CodeBlockScroller } from "../styles"
import { CodeBlockElement, LanguageList } from "../types"
import { CodeBlockActions } from "./CodeBlockActions"

export function CodeBlock({
  element,
  attributes,
  children,
}: ConstrainedRenderElementProps<CodeBlockElement>) {
  const ref = useRef<HTMLDivElement>(null)
  const editor = useSlateStatic()
  const selected = useSelected()
  const focused = useFocused()
  const dropdown = useLayer("code-block-dropdown")
  const onClick = useCallback(() => {
    if (dropdown.layer) dropdown.close()
    const dest = ref.current
    if (dest === null) return
    const items: MenuItemData[] = LanguageList.map((language) => {
      return {
        icon: () => <span />,
        title: language,
        action: (editor) => {
          editor.codeBlock.setCodeBlockLanguage(language, { at: element })
        },
      }
    })
    // Menu
    dropdown.open(() => (
      <Menu dest={dest} items={items} close={dropdown.close} />
    ))
  }, [element])

  const isMermaid = element.language.toLowerCase() === "mermaid"
  if (isMermaid && !(selected && focused) && editor.wysimark.renderMermaidPreview) {
    const code = element.children.map((line) => Node.string(line)).join("\n")
    return (
      <$CodeBlock
        {...attributes}
        onMouseDown={(event) => {
          event.preventDefault()
          const path = ReactEditor.findPath(editor, element)
          Transforms.select(editor, Editor.start(editor, path))
          ReactEditor.focus(editor)
        }}
      >
        <div contentEditable={false} style={{ padding: "1em", overflowX: "auto" }}>
          {editor.wysimark.renderMermaidPreview(code)}
        </div>
        <div aria-hidden="true" style={{ display: "none" }}>{children}</div>
      </$CodeBlock>
    )
  }

  return (
    <$CodeBlock className={selected ? "--selected" : ""} {...attributes}>
      {selected && focused ? <CodeBlockActions element={element} /> : null}
      <$CodeBlockLanguage contentEditable={false} onClick={onClick} ref={ref}>
        <span>{element.language}</span>
        <ChevronDownIcon />
      </$CodeBlockLanguage>
      <$CodeBlockScroller>{children}</$CodeBlockScroller>
    </$CodeBlock>
  )
}
