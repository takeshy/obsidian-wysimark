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
import { positionInside, useAbsoluteReposition } from "../../use-reposition"
import { AnchorElement } from "../index"
import { AnchorDialog } from "./AnchorDialog"
import { DraggableHeader } from "../../toolbar-plugin/components/dialog/DraggableHeader"
import {
  isWikiLinkHref,
  normalizeWikiLinkInput,
  splitWikiSpec,
  wikiLinkDisplayText,
  wikiLinkHref,
  wikiLinkSpecFromHref,
} from "../../convert/obsidian-links"

const $AnchorEditDialog = styled($Panel)`
  position: absolute;
  width: 20em;
  padding: 0;
  overflow: hidden;

  .--link-type {
    display: flex;
    gap: 0.25em;
    padding: 0.25em;
    border-radius: 0.375em;
    background: var(--shade-100);
  }

  .--link-type button {
    flex: 1 1 0;
    border: 0;
    border-radius: 0.25em;
    padding: 0.375em 0.5em;
    color: var(--shade-500);
    background: transparent;
    cursor: pointer;
  }

  .--link-type button.--active {
    color: var(--shade-700);
    background: white;
    box-shadow: 0 1px 2px rgb(0 0 0 / 12%);
  }
`

type LinkMode = "external" | "internal"

export function AnchorEditDialog({
  destAnchor,
  destStartEdge,
  element,
  initialEmbed = false,
  onCancel,
}: {
  destAnchor: HTMLElement
  destStartEdge: HTMLElement
  element: AnchorElement
  initialEmbed?: boolean
  onCancel?: () => void
}) {
  const dialog = useLayer("dialog")
  const ref = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleDrag = useCallback((deltaX: number, deltaY: number) => {
    setDragOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
  }, [])

  const baseStyle = useAbsoluteReposition(
    { src: ref, destAnchor, destStartEdge },
    ({ src, destAnchor, destStartEdge }, viewport) => {
      return positionInside(
        src,
        viewport,
        {
          left: destStartEdge.left,
          top: destAnchor.top + destAnchor.height,
        },
        { margin: 16 }
      )
    }
  )

  const style = {
    ...baseStyle,
    left: baseStyle.left + dragOffset.x,
    top: baseStyle.top + dragOffset.y,
  }

  const editor = useSlateStatic()
  const isInitialInternal = isWikiLinkHref(element.href)
  const initialInternalSpec = isInitialInternal
    ? wikiLinkSpecFromHref(element.href)
    : ""
  const initialInternalParts = splitWikiSpec(initialInternalSpec)
  const initialInternalTarget = isInitialInternal
    ? initialInternalParts.target
    : ""

  const [mode, setMode] = useState<LinkMode>(
    isInitialInternal ? "internal" : "external"
  )
  const [embed, setEmbed] = useState<boolean>(initialEmbed)
  const [href, setHref] = useState<string>(element.href)
  const [target, setTarget] = useState<string>(initialInternalTarget)
  const [text, setText] = useState<string>(
    isInitialInternal
      ? initialInternalParts.display || Node.string(element)
      : Node.string(element)
  )
  const [title, setTitle] = useState<string>(element.title || "")

  const formRef = useRef({ href, target, text, title, mode, embed })
  formRef.current = { href, target, text, title, mode, embed }

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

  const handleTargetChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((e) => {
    const parsed = normalizeWikiLinkInput(e.target.value)
    setTarget(parsed.target)
    if (parsed.display !== undefined) {
      setText(parsed.display)
    }
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

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
      return
    }
    openAnchorDialog()
  }, [onCancel, openAnchorDialog])

  const handleSubmit = useCallback(() => {
    const { href, target, text, title, mode, embed } = formRef.current
    if (mode === "internal") {
      const trimmedTarget = target.trim()
      if (trimmedTarget === "") return
      const trimmedText = text.trim()
      const spec =
        trimmedText && trimmedText !== wikiLinkDisplayText(trimmedTarget)
          ? `${trimmedTarget}|${trimmedText}`
          : trimmedTarget
      if (embed) {
        // Replace the anchor with an inline embed (`![[spec]]`). The embed is
        // a void element, so there is no anchor dialog to reopen afterwards.
        editor.anchor.convertToEmbed(spec, { at: element })
        dialog.close()
        return
      }
      editor.anchor.editLink(
        {
          href: wikiLinkHref(spec),
          text: trimmedText || wikiLinkDisplayText(trimmedTarget),
          title: undefined,
        },
        { at: element }
      )
    } else {
      editor.anchor.editLink({ href, text, title }, { at: element })
    }
    openAnchorDialog()
  }, [editor, element, dialog, openAnchorDialog])

  return (
    <$AnchorEditDialog ref={ref} contentEditable={false} style={style}>
      <DraggableHeader onDrag={handleDrag} />
      <div style={{ padding: "1em" }}>
        <$FormGroup>
          <div className="--link-type">
            <button
              type="button"
              className={mode === "external" ? "--active" : undefined}
              onClick={() => setMode("external")}
            >
              {t("linkTypeExternal")}
            </button>
            <button
              type="button"
              className={mode === "internal" ? "--active" : undefined}
              onClick={() => setMode("internal")}
            >
              {t("linkTypeInternal")}
            </button>
          </div>
        </$FormGroup>
        {mode === "internal" ? (
          <>
            <$FormGroup>
              <$FormCaption>{t("internalLinkTarget")}</$FormCaption>
              <$Input type="text" value={target} onChange={handleTargetChange} />
              <$FormHint>{t("internalLinkTargetHint")}</$FormHint>
            </$FormGroup>
            <$FormGroup>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5em", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={embed}
                  onChange={(e) => setEmbed(e.target.checked)}
                />
                {t("internalLinkEmbed")}
              </label>
              <$FormHint>{t("internalLinkEmbedHint")}</$FormHint>
            </$FormGroup>
          </>
        ) : (
          <$FormGroup>
            <$FormCaption>{t("linkUrl")}</$FormCaption>
            <$Textarea as="textarea" value={href} onChange={handleHrefChange} />
          </$FormGroup>
        )}
        <$FormGroup>
          <$FormCaption>{t("linkText")}</$FormCaption>
          <$Input type="text" value={text} onChange={handleTextChange} />
          <$FormHint>{t("linkTextHint")}</$FormHint>
        </$FormGroup>
        {mode === "external" ? (
          <$FormGroup>
            <$FormCaption>{t("tooltipText")}</$FormCaption>
            <$Input type="text" value={title} onChange={handleTitleChange} />
            <$FormHint>{t("tooltipHint")}</$FormHint>
          </$FormGroup>
        ) : null}
        <$FormGroup>
          <$PrimaryButton onClick={handleSubmit}>{t("apply")}</$PrimaryButton>
        </$FormGroup>
        <$FormGroup>
          <$CancelButton onClick={handleCancel}>{t("cancel")}</$CancelButton>
        </$FormGroup>
      </div>
    </$AnchorEditDialog>
  )
}
