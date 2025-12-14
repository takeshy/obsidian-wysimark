import styled from "@emotion/styled"
import { useCallback, useRef, useState } from "react"
import { Node } from "slate"
import { useSlateStatic } from "slate-react"

import { $Panel } from "../../shared-overlays"
import { t } from "../../utils/translations"
import {
  $CancelButton,
  $FormCaption,
  $FormGroup,
  $FormHint,
  $Input,
  $PrimaryButton,
  $Textarea,
} from "../../shared-styles"
import { useLayer } from "../../use-layer"
import { useAbsoluteReposition } from "../../use-reposition"
import { AnchorElement } from "../index"
import { AnchorDialog } from "./AnchorDialog"
import { DraggableHeader } from "../../toolbar-plugin/components/dialog/DraggableHeader"

const $AnchorEditDialog = styled($Panel)`
  position: absolute;
  width: 20em;
  padding: 0;
  overflow: hidden;
`

export function AnchorEditDialog({
  destAnchor,
  destStartEdge,
  element,
}: {
  destAnchor: HTMLAnchorElement
  destStartEdge: HTMLSpanElement
  element: AnchorElement
}) {
  const dialog = useLayer("dialog")
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleDrag = useCallback((deltaX: number, deltaY: number) => {
    setDragOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
  }, [])

  const baseStyle = useAbsoluteReposition(
    { destAnchor, destStartEdge },
    ({ destAnchor, destStartEdge }) => {
      return {
        left: destStartEdge.left,
        top: destAnchor.top + destAnchor.height,
      }
    }
  )

  const style = {
    ...baseStyle,
    left: (baseStyle.left as number) + dragOffset.x,
    top: (baseStyle.top as number) + dragOffset.y,
  }

  const editor = useSlateStatic()

  const [href, setHref] = useState<string>(element.href)
  const [text, setText] = useState<string>(Node.string(element))
  const [title, setTitle] = useState<string>(element.title || "")

  const formRef = useRef({ href, text, title })
  formRef.current = { href, text, title }

  const handleHrefChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((e) => {
    setHref(e.target.value)
  }, [])

  const handleTextChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((e) => {
    setText(e.target.value)
  }, [])

  const handleTitleChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((e) => {
    setTitle(e.target.value)
  }, [])

  const openAnchorDialog = useCallback(() => {
    dialog.open(() => (
      <AnchorDialog
        destAnchor={destAnchor}
        destStartEdge={destStartEdge}
        element={element}
      />
    ))
  }, [destAnchor, destStartEdge, element])

  const handleSubmit = useCallback(() => {
    const { href, text, title } = formRef.current
    editor.anchor.editLink({ href, text, title }, { at: element })
    openAnchorDialog()
  }, [openAnchorDialog])

  return (
    <$AnchorEditDialog contentEditable={false} style={style}>
      <DraggableHeader onDrag={handleDrag} />
      <div style={{ padding: "1em" }}>
        <$FormGroup>
          <$FormCaption>{t("linkUrl")}</$FormCaption>
          <$Textarea as="textarea" value={href} onChange={handleHrefChange} />
        </$FormGroup>
        <$FormGroup>
          <$FormCaption>{t("linkText")}</$FormCaption>
          <$Input type="text" value={text} onChange={handleTextChange} />
          <$FormHint>{t("linkTextHint")}</$FormHint>
        </$FormGroup>
        <$FormGroup>
          <$FormCaption>{t("tooltipText")}</$FormCaption>
          <$Input type="text" value={title} onChange={handleTitleChange} />
          <$FormHint>{t("tooltipHint")}</$FormHint>
        </$FormGroup>
        <$FormGroup>
          <$PrimaryButton onClick={handleSubmit}>{t("apply")}</$PrimaryButton>
        </$FormGroup>
        <$FormGroup>
          <$CancelButton onClick={openAnchorDialog}>{t("cancel")}</$CancelButton>
        </$FormGroup>
      </div>
    </$AnchorEditDialog>
  )
}
