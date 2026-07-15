import { Descendant } from "slate"
import type { ReactNode } from "react"

/**
 * Handler for saving image files to vault
 * @param file - The file to save
 * @param path - The path within the vault to save the file
 * @returns The final path/reference to use in markdown
 */
export type OnImageSaveHandler = (file: File, path: string) => Promise<string>
export type RenderInternalLinkPreview = (target: string) => ReactNode
export type RenderInternalEmbed = (spec: string) => ReactNode
export type OpenInternalLinkHandler = (target: string) => void | Promise<void>
export type GetVaultImagePathsHandler = () => string[]
export type GetVaultFilePathsHandler = () => string[]

export type ImageDialogState = {
  imageSource: "file" | "url" | "vault"
  url: string
  alt: string
  title: string
  vaultPath: string
  vaultImagePath: string
  selectedFile?: File
}

export type WysimarkEditor = {
  /**
   * Private state for the wysimark editor.
   */
  wysimark: {
    prevValue?: {
      markdown: string
      children: Descendant[]
    }

    /**
     * Handler for saving image to vault
     */
    onImageSave?: OnImageSaveHandler

    /**
     * Get the current image paths available in the host vault.
     */
    getVaultImagePaths?: GetVaultImagePathsHandler

    /**
     * Get the current file paths available in the host vault.
     */
    getVaultFilePaths?: GetVaultFilePathsHandler

    /**
     * Handler for image change (drag/drop)
     */
    onImageChange?: (file: File) => Promise<string>

    /**
     * Persisted state for the image dialog
     */
    imageDialogState?: ImageDialogState

    /**
     * Render preview content for an internal link target.
     */
    renderInternalLinkPreview?: RenderInternalLinkPreview

    /**
     * Render inline content for an internal embed (`![[spec]]`).
     */
    renderInternalEmbed?: RenderInternalEmbed

    /**
     * Open an internal link target.
     */
    openInternalLink?: OpenInternalLinkHandler
  }
  /**
   * Public methods for the wysimark editor.
   */
  getMarkdown: () => string
  setMarkdown: (markdown: string) => void
}
