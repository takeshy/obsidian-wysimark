import { useState } from "react"
import { createEditor, Editor, Transforms } from "slate"
import { withHistory } from "slate-history"
import { ReactEditor, withReact } from "slate-react"

import { parse, serialize, escapeUrlSlashes } from "../convert"
import { Element } from "./plugins"
import { withSink } from "./SinkEditable"
import { OpenInternalLinkHandler, RenderInternalEmbed, RenderInternalLinkPreview, RenderMermaidPreview, WysimarkEditor } from "./types"

export function useEditor({
  authToken,
  height,
  minHeight,
  maxHeight,
  renderInternalLinkPreview,
  renderInternalEmbed,
  renderMermaidPreview,
  openInternalLink,
}: {
  authToken?: string
  height?: string | number
  minHeight?: string | number
  maxHeight?: string | number
  renderInternalLinkPreview?: RenderInternalLinkPreview
  renderInternalEmbed?: RenderInternalEmbed
  renderMermaidPreview?: RenderMermaidPreview
  openInternalLink?: OpenInternalLinkHandler
}): Editor & ReactEditor & WysimarkEditor {
  const [editor] = useState(() => {
    const editor = createEditor()
    editor.wysimark = {
      //   initialMarkdown,
      //   initialValue: parse(initialMarkdown),
      renderInternalLinkPreview,
      renderInternalEmbed,
      renderMermaidPreview,
      openInternalLink,
    }
    const nextEditor = withSink(withReact(withHistory(editor)), {
      toolbar: {
        height,
        minHeight,
        maxHeight,
        /**
         * If `authToken` is provided then show upload buttons.
         */
        showUploadButtons: !!authToken,
      },
      image: {}
    })
    nextEditor.convertElement.addConvertElementType("paragraph")
    editor.getMarkdown = () => {
      return serialize(editor.children as Element[])
    }
    editor.setMarkdown = (markdown: string) => {
      // Escape forward slashes in URLs before parsing
      const escapedMarkdown = escapeUrlSlashes(markdown);
      const documentValue = parse(escapedMarkdown)
      editor.children = documentValue
      editor.selection = null
      Transforms.select(editor, Editor.start(editor, [0]))
    }
    return nextEditor
  })

  return editor
}
