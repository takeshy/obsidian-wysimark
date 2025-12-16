import { RenderElementProps } from "slate-react"
import { HtmlBlockElement } from "./types"
import { $HtmlBlock, $HtmlBlockLabel } from "./styles"
import { unescapeUrlSlashes } from "../convert/utils"

type HtmlBlockRenderElementProps = RenderElementProps & {
  element: HtmlBlockElement
}

export function HtmlBlock({
  attributes,
  children,
  element,
}: HtmlBlockRenderElementProps) {
  return (
    <$HtmlBlock {...attributes} contentEditable={false}>
      <$HtmlBlockLabel>HTML</$HtmlBlockLabel>
      <div>{unescapeUrlSlashes(element.html)}</div>
      {children}
    </$HtmlBlock>
  )
}
