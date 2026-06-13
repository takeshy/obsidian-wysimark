import { Text } from "../../../types"
import { EscapeTextOptions, escapeText } from "../utils"

export function serializeNonCodeText(
  text: Text,
  options?: EscapeTextOptions
): string {
  const escaped = escapeText(text.text, options)
  // Convert soft breaks (\n) to markdown line breaks (two trailing spaces + newline)
  // so they render as <br> in markdown preview.
  return escaped.replace(/\n/g, "  \n")
}
