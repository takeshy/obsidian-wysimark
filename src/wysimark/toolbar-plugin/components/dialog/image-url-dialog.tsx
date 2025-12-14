import { useState, useRef, CSSProperties, useEffect, useCallback } from "react"
import { useSlateStatic } from "slate-react"

import { CloseMask } from "../../../shared-overlays"
import { positionInside, useAbsoluteReposition } from "../../../use-reposition"
import { t } from "../../../utils/translations"

import { $FileDialog } from "../../styles/file-dialog-styles"
import { DraggableHeader } from "./DraggableHeader"

type ImageSource = "url" | "file"

export function ImageUrlDialog({
    dest,
    close,
}: {
    dest: HTMLElement
    close: () => void
}) {
    const editor = useSlateStatic()
    const ref = useRef<HTMLDivElement>(undefined) as unknown as HTMLDivElement
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

    const handleDrag = useCallback((deltaX: number, deltaY: number) => {
        setDragOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
    }, [])

    // Persist dialog values in editor.wysimark so they survive dialog close/reopen
    const savedState = editor.wysimark?.imageDialogState
    const hasOnImageSave = !!editor.wysimark?.onImageSave

    const [url, setUrl] = useState(savedState?.url ?? "")
    const [alt, setAlt] = useState(savedState?.alt ?? "")
    const [title, setTitle] = useState(savedState?.title ?? "")
    const [titleManuallyEdited, setTitleManuallyEdited] = useState(false)
    const [imageSource, setImageSource] = useState<ImageSource>(savedState?.imageSource ?? (hasOnImageSave ? "file" : "url"))
    const [vaultPath, setVaultPath] = useState(savedState?.vaultPath ?? "")
    const [selectedFile, setSelectedFile] = useState<File | undefined>(savedState?.selectedFile)
    const [isSaving, setIsSaving] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // Handlers for alt and title with sync
    const handleAltChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newAlt = e.target.value
        setAlt(newAlt)
        // Sync title with alt if title hasn't been manually edited
        if (!titleManuallyEdited) {
            setTitle(newAlt)
        }
    }, [titleManuallyEdited])

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
        setTitleManuallyEdited(true)
    }, [])

    // Create preview URL when file is selected
    useEffect(() => {
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile)
            setPreviewUrl(url)
            return () => URL.revokeObjectURL(url)
        } else {
            setPreviewUrl(null)
        }
    }, [selectedFile])

    // Save state to editor when values change
    useEffect(() => {
        if (editor.wysimark) {
            editor.wysimark.imageDialogState = { url, alt, title, imageSource, vaultPath, selectedFile }
        }
    }, [url, alt, title, imageSource, vaultPath, selectedFile])

    // Clear state on successful submit or cancel
    const clearState = () => {
        if (editor.wysimark) {
            editor.wysimark.imageDialogState = undefined
        }
    }

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
    ) as CSSProperties

    const style = {
        ...baseStyle,
        left: (baseStyle.left as number) + dragOffset.x,
        top: (baseStyle.top as number) + dragOffset.y,
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (imageSource === "file" && selectedFile && editor.wysimark?.onImageSave) {
            if (vaultPath.trim() === "") return

            setIsSaving(true)
            try {
                const resultPath = await editor.wysimark.onImageSave(selectedFile, vaultPath)
                editor.image.insertImageFromUrl(resultPath, alt, title)
                clearState()
                close()
            } finally {
                setIsSaving(false)
            }
        } else if (imageSource === "url") {
            if (url.trim() === "") return
            editor.image.insertImageFromUrl(url, alt, title)
            clearState()
            close()
        }
    }

    function handleCancel() {
        clearState()
        close()
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setSelectedFile(file)
        // Suggest a default path based on filename
        if (!vaultPath) {
            setVaultPath(`attachments/${file.name}`)
        }
    }

    function handleSelectFileClick() {
        fileInputRef.current?.click()
    }

    const isSubmitDisabled = imageSource === "file"
        ? !selectedFile || vaultPath.trim() === "" || isSaving
        : url.trim() === ""

    return (
        <>
            <CloseMask close={close} />
            <$FileDialog ref={ref as unknown as React.RefObject<HTMLDivElement>} style={style}>
                <DraggableHeader onDrag={handleDrag} />
                <form onSubmit={(e) => void handleSubmit(e)} style={{ padding: "8px" }}>
                    {hasOnImageSave && (
                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "inline-flex", alignItems: "center", marginRight: "16px", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="imageSource"
                                    value="file"
                                    checked={imageSource === "file"}
                                    onChange={() => setImageSource("file")}
                                    style={{ marginRight: "4px" }}
                                />
                                {t("imageSourceFile")}
                            </label>
                            <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                                <input
                                    type="radio"
                                    name="imageSource"
                                    value="url"
                                    checked={imageSource === "url"}
                                    onChange={() => setImageSource("url")}
                                    style={{ marginRight: "4px" }}
                                />
                                {t("imageSourceUrl")}
                            </label>
                        </div>
                    )}

                    {imageSource === "url" ? (
                        <div style={{ marginBottom: "8px" }}>
                            <label style={{ display: "block", marginBottom: "4px" }}>
                                {t("imageUrlRequired")}
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "6px",
                                    boxSizing: "border-box",
                                    border: "1px solid var(--shade-300)",
                                    borderRadius: "4px",
                                    backgroundColor: "var(--shade-50)",
                                    color: "var(--shade-700)"
                                }}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    ) : (
                        <div style={{ marginBottom: "8px" }}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: "none" }}
                            />
                            <button
                                type="button"
                                onClick={handleSelectFileClick}
                                disabled={isSaving}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: isSaving ? "#ccc" : "#0078d4",
                                    color: isSaving ? "#666" : "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: isSaving ? "not-allowed" : "pointer",
                                    marginBottom: "8px",
                                    fontWeight: "bold"
                                }}
                            >
                                {t("selectFile")}
                            </button>

                            {selectedFile && (
                                <div style={{ marginTop: "8px" }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "8px",
                                        backgroundColor: "var(--shade-100)",
                                        borderRadius: "4px",
                                        marginBottom: "8px"
                                    }}>
                                        {previewUrl && (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: "60px",
                                                    maxHeight: "60px",
                                                    objectFit: "contain",
                                                    borderRadius: "4px"
                                                }}
                                            />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: "bold",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}>
                                                {selectedFile.name}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "var(--shade-500)" }}>
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                    </div>

                                    <label style={{ display: "block", marginBottom: "4px" }}>
                                        {t("vaultPath")}
                                    </label>
                                    <input
                                        type="text"
                                        value={vaultPath}
                                        onChange={(e) => setVaultPath(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "6px",
                                            boxSizing: "border-box",
                                            border: "1px solid var(--shade-300)",
                                            borderRadius: "4px",
                                            backgroundColor: "var(--shade-50)",
                                            color: "var(--shade-700)"
                                        }}
                                        placeholder="attachments/image.png"
                                    />
                                    <div style={{ fontSize: "12px", color: "var(--shade-500)", marginTop: "4px" }}>
                                        {t("vaultPathHint")}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginBottom: "8px" }}>
                        <label style={{ display: "block", marginBottom: "4px" }}>
                            {t("altText")}
                        </label>
                        <input
                            type="text"
                            value={alt}
                            onChange={handleAltChange}
                            style={{
                                width: "100%",
                                padding: "6px",
                                boxSizing: "border-box",
                                border: "1px solid var(--shade-300)",
                                borderRadius: "4px",
                                backgroundColor: "var(--shade-50)",
                                color: "var(--shade-700)"
                            }}
                            placeholder={t("imageDescription")}
                        />
                    </div>

                    <div style={{ marginBottom: "8px" }}>
                        <label style={{ display: "block", marginBottom: "4px" }}>
                            {t("title")}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            style={{
                                width: "100%",
                                padding: "6px",
                                boxSizing: "border-box",
                                border: "1px solid var(--shade-300)",
                                borderRadius: "4px",
                                backgroundColor: "var(--shade-50)",
                                color: "var(--shade-700)"
                            }}
                            placeholder={t("imageTitle")}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            type="submit"
                            disabled={isSubmitDisabled}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "8px 16px",
                                backgroundColor: isSubmitDisabled ? "#ccc" : "#0078d4",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isSubmitDisabled ? "not-allowed" : "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            {isSaving ? t("saving") : t("register")}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "var(--shade-100)",
                                color: "var(--shade-700)",
                                border: "1px solid var(--shade-300)",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            {t("cancel")}
                        </button>
                    </div>
                </form>
            </$FileDialog>
        </>
    )
}
