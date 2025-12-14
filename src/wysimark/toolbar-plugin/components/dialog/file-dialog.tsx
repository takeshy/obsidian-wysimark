import { useRef, useState, useCallback } from "react"
import { useSlateStatic } from "slate-react"

import { CloseMask } from "../../../shared-overlays"
import { stopEvent } from "../../../sink"
import { positionInside, useAbsoluteReposition } from "../../../use-reposition"

import * as Icon from "../../icons"
import { $DialogButton, $DialogHint } from "../../styles/dialog-shared-styles"
import { $FileDialog } from "../../styles/file-dialog-styles"
import { DraggableHeader } from "./DraggableHeader"

export function FileDialog({
  dest,
  close,
  icon,
  buttonCaption,
  buttonHint,
}: {
  dest: HTMLElement
  close: () => void
  icon: React.ReactNode
  buttonCaption: string
  buttonHint: string
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
          left: dest.left - 16,
          top: dest.top + dest.height,
        },
        { margin: 16 }
      )
    }
  )

  const style = {
    ...baseStyle,
    left: (baseStyle.left as number) + dragOffset.x,
    top: (baseStyle.top as number) + dragOffset.y,
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files == null || e.target.files.length === 0) return
    stopEvent(e)
    const { files } = e.target
    for (const file of files) {
      editor.upload.upload(file)
    }
    close()
  }

  return (
    <>
      <CloseMask close={close} />
      <$FileDialog ref={ref} style={style}>
        <DraggableHeader onDrag={handleDrag} />
        <div style={{ padding: "1em" }}>
          <label>
            <input
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={onChange}
            />
            <$DialogButton>
              {icon}

              <span style={{ marginLeft: "0.5em" }}>{buttonCaption}</span>
            </$DialogButton>
          </label>
          <$DialogHint>{buttonHint}</$DialogHint>
        </div>
      </$FileDialog>
    </>
  )
}

export function AttachmentDialog({
  dest,
  close,
}: {
  dest: HTMLElement
  close: () => void
}) {
  return (
    <FileDialog
      dest={dest}
      close={close}
      icon={<Icon.FileUpload />}
      buttonCaption="Select files..."
      buttonHint="Select files to insert as attachments"
    />
  )
}

export function ImageDialog({
  dest,
  close,
}: {
  dest: HTMLElement
  close: () => void
}) {
  return (
    <FileDialog
      dest={dest}
      close={close}
      icon={<Icon.PhotoUp />}
      buttonCaption="Select images..."
      buttonHint="Select image files to upload and insert into the editor"
    />
  )
}
