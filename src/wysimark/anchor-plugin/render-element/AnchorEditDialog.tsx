import styled from "@emotion/styled"
import { useCallback, useRef, useState } from "react"
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

const $AnchorEditDialog = styled($Panel)`
  position: absolute;
  width: 20em;
  padding: 1em;
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
  const style = useAbsoluteReposition(
    { destAnchor, destStartEdge },
    ({ destAnchor, destStartEdge }) => {
      return {
        left: destStartEdge.left,
        top: destAnchor.top + destAnchor.height,
      }
    }
  )

  const editor = useSlateStatic()

  const [href, setHref] = useState<string>(element.href)
  const [title, setTitle] = useState<string>(element.title || "")

  const formRef = useRef({ href, title })
  formRef.current = { href, title }

  const handleHrefChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((e) => {
    setHref(e.target.value)
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
    const { href, title } = formRef.current
    editor.anchor.editLink({ href, title }, { at: element })
    openAnchorDialog()
  }, [openAnchorDialog])

  return (
    <$AnchorEditDialog contentEditable={false} style={style}>
      <$FormGroup>
        <$FormCaption>{t("linkUrl")}</$FormCaption>
        <$Textarea as="textarea" value={href} onChange={handleHrefChange} />
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
    </$AnchorEditDialog>
  )
}
