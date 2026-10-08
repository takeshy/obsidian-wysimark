import { Text } from "../../../types"
import type { EscapeTextOptions } from "../utils"

export function serializeCodeText(text: Text, options?: EscapeTextOptions): string {
  // Backslashes are literal in code spans, but an odd backslash before a
  // pipe cannot survive the table's cell splitting. HTML entities avoid
  // changing either the code text or the number of cells.
  if (options?.inTable && /\\\|/.test(text.text)) {
    return `<code>${text.text.replace(/[&<>\\|*_~[\]`]/g,
      (char) => `&#${char.codePointAt(0)};`)}</code>`
  }
  let max = 0
  for (const match of text.text.matchAll(/[`]+/g)) {
    max = Math.max(max, match[0].length)
  }
  const fence = "`".repeat(max + 1)
  const pad = text.text.startsWith("`") || text.text.endsWith("`") ||
    (/^ .* $/.test(text.text) && /[^ ]/.test(text.text))
  return `${fence}${pad ? " " : ""}${text.text}${pad ? " " : ""}${fence}`
}
