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

const isEnter = isHotkey("enter")

export function AnchorDialog({
  dest,
  close,
}: {
  dest: HTMLElement
  close: () => void
}) {
  const editor = useSlateStatic()
  const ref = useRef<HTMLDivElement>(null)
  const style = useAbsoluteReposition(
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

  // Get selected text as initial value for link text
  const initialText = useMemo(() => {
    const { selection } = editor
    if (selection && !Range.isCollapsed(selection)) {
      return Editor.string(editor, selection)
    }
    return ""
  }, [])

  const [url, setUrl] = useState("")
  const [text, setText] = useState(initialText)
  const [title, setTitle] = useState(initialText)
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false)

  const insertLink = () => {
    const linkText = text.trim() || url
    const linkTitle = title.trim() || undefined
    editor.anchor.insertLink(url, linkText, { select: true, title: linkTitle })
    ReactEditor.focus(editor)
    close()
  }

  const onChangeUrl = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setUrl(e.currentTarget.value)
    },
    [setUrl]
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
        <$AnchorDialogInputLine>
          <$AnchorDialogInput
            type="text"
            value={url}
            autoFocus
            placeholder={t("linkUrl")}
            onChange={onChangeUrl}
            onKeyDown={onKeyDown}
          />
        </$AnchorDialogInputLine>
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
          <$AnchorDialogInput
            type="text"
            value={title}
            placeholder={t("tooltipText")}
            onChange={onChangeTitle}
            onKeyDown={onKeyDown}
          />
          <$DialogButton onClick={insertLink}>
            <Icon.Link />
            <Icon.LinkPlus />
          </$DialogButton>
        </$AnchorDialogInputLine>
        <$DialogHint>{t("tooltipHint")}</$DialogHint>
      </$AnchorDialog>
    </>
  )
}
