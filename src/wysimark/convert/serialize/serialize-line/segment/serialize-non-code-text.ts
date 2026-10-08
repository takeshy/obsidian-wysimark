import { Text } from "../../../types"
import { EscapeTextOptions, escapeText } from "../utils"

export function serializeNonCodeText(
  text: Text,
  options?: EscapeTextOptions
): string {
  const escaped = escapeText(text.text, options)
  // A leaf that is exactly a source soft break keeps its bare newline. Any
  // other newline is an explicit line break, so write it as a hard break (two
  // trailing spaces + newline) to keep it rendering as <br>.
  if (text.softBreak && text.text === "\n") return escaped
  return escaped.replace(/\n/g, "  \n")
}
