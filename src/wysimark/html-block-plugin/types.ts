import { Text } from "slate"

/**
 * HTML block element for preserving raw HTML content
 */
export type HtmlBlockElement = {
  type: "html-block"
  /**
   * The raw HTML content
   */
  html: string
  children: Text[]
}

export type HtmlBlockPluginCustomTypes = {
  Name: "html-block"
  Editor: Record<string, never>
  Element: HtmlBlockElement
}
