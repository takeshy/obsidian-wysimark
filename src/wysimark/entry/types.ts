import { Descendant } from "slate"

/**
 * Handler for saving image files to vault
 * @param file - The file to save
 * @param path - The path within the vault to save the file
 * @returns The final path/reference to use in markdown
 */
export type OnImageSaveHandler = (file: File, path: string) => Promise<string>

export type ImageDialogState = {
  url: string
  alt: string
  title: string
  imageSource: "url" | "file"
  vaultPath: string
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
     * Handler for image change (drag/drop)
     */
    onImageChange?: (file: File) => Promise<string>

    /**
     * Persisted state for the image dialog
     */
    imageDialogState?: ImageDialogState
  }
  /**
   * Public methods for the wysimark editor.
   */
  getMarkdown: () => string
  setMarkdown: (markdown: string) => void
}
