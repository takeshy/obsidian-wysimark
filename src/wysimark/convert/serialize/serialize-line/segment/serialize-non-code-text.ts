import { Text } from "../../../types"
import { escapeText } from "../utils"

export function serializeNonCodeText(text: Text): string {
  const escaped = escapeText(text.text)
  // Convert soft breaks (\n) to markdown line breaks (two trailing spaces + newline)
  // so they render as <br> in markdown preview.
  return escaped.replace(/\n/g, "  \n")
}
