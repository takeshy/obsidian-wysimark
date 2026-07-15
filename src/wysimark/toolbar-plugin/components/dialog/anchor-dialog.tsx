import { isHotkey } from "is-hotkey"
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react"
import { Editor, Range } from "slate"
import { ReactEditor, useSlateStatic } from "slate-react"

import {
  normalizeWikiLinkInput,
  wikiLinkDisplayText,
  wikiLinkHref,
} from "../../../convert/obsidian-links"
import { positionInside, useAbsoluteReposition } from "../../../use-reposition"

import { CloseMask } from "../../../shared-overlays/components/CloseMask"
import { t } from "../../../utils/translations"
import * as Icon from "../../icons"
import {
  $AnchorDialog,
  $AnchorDialogInput,
  $AnchorDialogInputLine,
} from "../../styles"
import { $DialogButton, $DialogHint } from "../../styles/dialog-shared-styles"
import { DraggableHeader } from "./DraggableHeader"

const isEnter = isHotkey("enter")
type LinkMode = "external" | "internal"

export function AnchorDialog({
  dest,
  close,
}: {
  dest: HTMLElement
  close: () => void
}) {
  const editor = useSlateStatic()
  const ref = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleDrag = useCallback((deltaX: number, deltaY: number) => {
    setDragOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
  }, [])

  const baseStyle = useAbsoluteReposition(
    { src: ref, dest },
    ({ src, dest }, viewport) => {
      return positionInside(
        src,
        viewport,
        {
          left: dest.left - 12,
          top: dest.top + dest.height,
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

  // Get selected text as initial value for link text
  const initialText = useMemo(() => {
    const { selection } = editor
    if (selection && !Range.isCollapsed(selection)) {
      return Editor.string(editor, selection)
    }
    return ""
  }, [])

  const [url, setUrl] = useState("")
  const [target, setTarget] = useState("")
  const [text, setText] = useState(initialText)
  const [title, setTitle] = useState(initialText)
  const [mode, setMode] = useState<LinkMode>("external")
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false)
  const vaultFilePaths = editor.wysimark.getVaultFilePaths?.() ?? []

  const insertLink = () => {
    if (mode === "internal") {
      const trimmedTarget = target.trim()
      if (trimmedTarget === "") return
      const trimmedText = text.trim()
      const spec =
        trimmedText && trimmedText !== wikiLinkDisplayText(trimmedTarget)
          ? `${trimmedTarget}|${trimmedText}`
          : trimmedTarget
      editor.anchor.insertLink(
        wikiLinkHref(spec),
        trimmedText || wikiLinkDisplayText(trimmedTarget),
        { select: true }
      )
    } else {
      const linkText = text.trim() || url
      const linkTitle = title.trim() || undefined
      editor.anchor.insertLink(url, linkText, { select: true, title: linkTitle })
    }
    ReactEditor.focus(editor)
    close()
  }

  const onChangeUrl = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setUrl(e.currentTarget.value)
    },
    [setUrl]
  )

  const onChangeTarget = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const parsed = normalizeWikiLinkInput(e.currentTarget.value)
      setTarget(parsed.target)
      if (parsed.display !== undefined) {
        setText(parsed.display)
      }
    },
    [setTarget, setText]
  )

  const onChangeText = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newText = e.currentTarget.value
      setText(newText)
      // Sync title with text if title hasn't been manually edited
      if (!titleManuallyEdited) {
        setTitle(newText)
      }
    },
    [setText, setTitle, titleManuallyEdited]
  )

  const onChangeTitle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setTitle(e.currentTarget.value)
      setTitleManuallyEdited(true)
    },
    [setTitle]
  )

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isEnter(e)) return
    e.preventDefault()
    e.stopPropagation()
    insertLink()
  }

  return (
    <>
      <CloseMask close={close} />
      <$AnchorDialog ref={ref} style={style}>
        <DraggableHeader onDrag={handleDrag} />
        <div style={{ padding: "0.75em" }}>
          <$AnchorDialogInputLine>
            <div
              style={{
                display: "flex",
                gap: "0.25em",
                padding: "0.25em",
                borderRadius: "0.375em",
                background: "var(--shade-100)",
                width: "100%",
              }}
            >
              <button
                type="button"
                onClick={() => setMode("external")}
                style={{
                  flex: "1 1 0",
                  border: 0,
                  borderRadius: "0.25em",
                  padding: "0.375em 0.5em",
                  cursor: "pointer",
                  background: mode === "external" ? "white" : "transparent",
                  color:
                    mode === "external"
                      ? "var(--shade-700)"
                      : "var(--shade-500)",
                  boxShadow:
                    mode === "external"
                      ? "0 1px 2px rgb(0 0 0 / 12%)"
                      : "none",
                }}
              >
                {t("linkTypeExternal")}
              </button>
              <button
                type="button"
                onClick={() => setMode("internal")}
                style={{
                  flex: "1 1 0",
                  border: 0,
                  borderRadius: "0.25em",
                  padding: "0.375em 0.5em",
                  cursor: "pointer",
                  background: mode === "internal" ? "white" : "transparent",
                  color:
                    mode === "internal"
                      ? "var(--shade-700)"
                      : "var(--shade-500)",
                  boxShadow:
                    mode === "internal"
                      ? "0 1px 2px rgb(0 0 0 / 12%)"
                      : "none",
                }}
              >
                {t("linkTypeInternal")}
              </button>
            </div>
          </$AnchorDialogInputLine>
          <$AnchorDialogInputLine style={{ marginTop: "0.5em" }}>
            {mode === "internal" ? (
              <$AnchorDialogInput
                type="text"
                list="wysimark-vault-link-files"
                value={target}
                autoFocus
                placeholder={t("internalLinkTarget")}
                onChange={onChangeTarget}
                onKeyDown={onKeyDown}
              />
            ) : (
              <$AnchorDialogInput
                type="text"
                value={url}
                autoFocus
                placeholder={t("linkUrl")}
                onChange={onChangeUrl}
                onKeyDown={onKeyDown}
              />
            )}
          </$AnchorDialogInputLine>
          {mode === "internal" ? (
            <datalist id="wysimark-vault-link-files">
              {vaultFilePaths.map((path) => (
                <option key={path} value={path} />
              ))}
            </datalist>
          ) : null}
          <$AnchorDialogInputLine style={{ marginTop: "0.5em" }}>
            <$AnchorDialogInput
              type="text"
              value={text}
              placeholder={t("linkText")}
              onChange={onChangeText}
              onKeyDown={onKeyDown}
            />
          </$AnchorDialogInputLine>
          <$AnchorDialogInputLine style={{ marginTop: "0.5em" }}>
            {mode === "external" ? (
              <$AnchorDialogInput
                type="text"
                value={title}
                placeholder={t("tooltipText")}
                onChange={onChangeTitle}
                onKeyDown={onKeyDown}
              />
            ) : (
              <span style={{ flex: "1 1 auto" }} />
            )}
            <$DialogButton onClick={insertLink}>
              <Icon.Link />
              <Icon.LinkPlus />
            </$DialogButton>
            <$DialogButton onClick={close} style={{ marginLeft: "0.25em", background: "var(--shade-400)" }}>
              <Icon.Close />
            </$DialogButton>
          </$AnchorDialogInputLine>
          {mode === "external" ? (
            <$DialogHint>{t("tooltipHint")}</$DialogHint>
          ) : (
            <$DialogHint>{t("internalLinkTargetHint")}</$DialogHint>
          )}
        </div>
      </$AnchorDialog>
    </>
  )
}
