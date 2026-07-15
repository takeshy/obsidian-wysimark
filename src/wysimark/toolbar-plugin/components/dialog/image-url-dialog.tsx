import { CSSProperties, useCallback, useEffect, useRef, useState } from "react"
import { useSlateStatic } from "slate-react"

import { wikiEmbedUrl } from "../../../convert/obsidian-links"
import { CloseMask } from "../../../shared-overlays"
import { positionInside, useAbsoluteReposition } from "../../../use-reposition"
import { t } from "../../../utils/translations"
import { $FileDialog } from "../../styles/file-dialog-styles"
import { DraggableHeader } from "./DraggableHeader"

type ImageSource = "file" | "url" | "vault"

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "6px",
  boxSizing: "border-box",
  border: "1px solid var(--shade-300)",
  borderRadius: "4px",
  backgroundColor: "var(--shade-50)",
  color: "var(--shade-700)",
}

export function ImageUrlDialog({ dest, close }: { dest: HTMLElement; close: () => void }) {
  const editor = useSlateStatic()
  const saved = editor.wysimark.imageDialogState
  const ref = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [source, setSource] = useState<ImageSource>(saved?.imageSource ?? "file")
  const [url, setUrl] = useState(saved?.url ?? "")
  const [alt, setAlt] = useState(saved?.alt ?? "")
  const [title, setTitle] = useState(saved?.title ?? "")
  const [vaultPath, setVaultPath] = useState(saved?.vaultPath ?? "")
  const [vaultImagePath, setVaultImagePath] = useState(saved?.vaultImagePath ?? "")
  const [selectedFile, setSelectedFile] = useState<File | undefined>(saved?.selectedFile)
  const [isSaving, setIsSaving] = useState(false)
  const vaultImagePaths = editor.wysimark.getVaultImagePaths?.() ?? []

  const handleDrag = useCallback((deltaX: number, deltaY: number) => {
    setDragOffset((previous) => ({ x: previous.x + deltaX, y: previous.y + deltaY }))
  }, [])

  useEffect(() => {
    editor.wysimark.imageDialogState = {
      imageSource: source,
      url,
      alt,
      title,
      vaultPath,
      vaultImagePath,
      selectedFile,
    }
  }, [editor, source, url, alt, title, vaultPath, vaultImagePath, selectedFile])

  const baseStyle = useAbsoluteReposition(
    { src: ref, dest },
    ({ src, dest }, viewport) =>
      positionInside(src, viewport, {
        left: dest.left - 16,
        top: dest.top + dest.height,
      }, { margin: 16 })
  ) as CSSProperties
  const style = {
    ...baseStyle,
    left: (baseStyle.left as number) + dragOffset.x,
    top: (baseStyle.top as number) + dragOffset.y,
  }

  function finish() {
    editor.wysimark.imageDialogState = undefined
    close()
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (source === "vault") {
      const path = vaultImagePath.trim()
      if (!path) return
      editor.image.insertImageFromUrl(wikiEmbedUrl(path), path)
      finish()
      return
    }
    if (source === "url") {
      if (!url.trim()) return
      editor.image.insertImageFromUrl(url.trim(), alt, title)
      finish()
      return
    }
    if (!selectedFile || !vaultPath.trim() || !editor.wysimark.onImageSave) return
    setIsSaving(true)
    try {
      const resultPath = await editor.wysimark.onImageSave(selectedFile, vaultPath.trim())
      editor.image.insertImageFromUrl(resultPath, alt, title)
      finish()
    } finally {
      setIsSaving(false)
    }
  }

  const disabled = isSaving || (source === "vault"
    ? !vaultImagePath.trim()
    : source === "url"
      ? !url.trim()
      : !selectedFile || !vaultPath.trim())

  return (
    <>
      <CloseMask close={close} />
      <$FileDialog ref={ref} style={style}>
        <DraggableHeader onDrag={handleDrag} />
        <form onSubmit={(event) => void handleSubmit(event)} style={{ padding: "8px" }}>
          <div style={{ display: "flex", flexWrap: "nowrap", gap: "4px", marginBottom: "12px" }}>
            {(["file", "url", "vault"] as const).map((value) => (
              <label key={value} style={{ flex: "1 1 0", minWidth: 0, whiteSpace: "nowrap", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="imageSource"
                  checked={source === value}
                  onChange={() => setSource(value)}
                  style={{ marginRight: "3px" }}
                />
                {value === "file" ? t("imageSourceFile") : value === "url" ? t("imageSourceUrl") : "Vault"}
              </label>
            ))}
          </div>

          {source === "vault" ? (
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "4px" }}>{t("vaultImageRequired")}</label>
              <input
                type="text"
                list="wysimark-vault-images"
                value={vaultImagePath}
                onChange={(event) => setVaultImagePath(event.target.value)}
                style={inputStyle}
                placeholder={t("vaultImagePlaceholder")}
              />
              <datalist id="wysimark-vault-images">
                {vaultImagePaths.map((path) => <option key={path} value={path} />)}
              </datalist>
            </div>
          ) : source === "url" ? (
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "4px" }}>{t("imageUrlRequired")}</label>
              <input type="text" value={url} onChange={(event) => setUrl(event.target.value)} style={inputStyle} />
            </div>
          ) : (
            <div style={{ marginBottom: "8px" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  setSelectedFile(file)
                  if (!vaultPath) setVaultPath(`attachments/${file.name}`)
                }}
                style={{ display: "none" }}
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
                {selectedFile?.name ?? t("selectFile")}
              </button>
              <label style={{ display: "block", margin: "8px 0 4px" }}>{t("vaultPath")}</label>
              <input type="text" value={vaultPath} onChange={(event) => setVaultPath(event.target.value)} style={inputStyle} />
            </div>
          )}

          {source !== "vault" ? (
            <>
              <label style={{ display: "block", marginBottom: "4px" }}>{t("altText")}</label>
              <input type="text" value={alt} onChange={(event) => setAlt(event.target.value)} style={inputStyle} />
              <label style={{ display: "block", margin: "8px 0 4px" }}>{t("title")}</label>
              <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} style={inputStyle} />
            </>
          ) : null}

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button type="submit" disabled={disabled}>{isSaving ? t("saving") : t("insert")}</button>
            <button type="button" onClick={finish}>{t("cancel")}</button>
          </div>
        </form>
      </$FileDialog>
    </>
  )
}
