import { useSlateStatic } from "slate-react"

import { ConstrainedRenderElementProps } from "../../sink"

import { isWikiEmbedUrl } from "../../convert/obsidian-links"
import { $ImageInline } from "../styles/image-inline-styles"
import { ImageInlineElement } from "../types"
import { ImageWithControls } from "./image-with-controls"
import { WikiEmbedView } from "./wiki-embed-view"

export function ImageInline({
  element,
  attributes,
  children,
}: ConstrainedRenderElementProps<ImageInlineElement>) {
  const editor = useSlateStatic()
  if (isWikiEmbedUrl(element.url) && editor.wysimark.renderInternalEmbed) {
    return (
      <span {...attributes} style={{ display: "inline-block" }}>
        <WikiEmbedView element={element} />
        {children}
      </span>
    )
  }
  return (
    <span {...attributes} style={{ display: "inline-block" }}>
      <$ImageInline contentEditable={false}>
        <ImageWithControls
          element={element}
          presets={editor.image.imageInlinePresets}
        />
      </$ImageInline>
      {children}
    </span>
  )
}
