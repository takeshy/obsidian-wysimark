/**
 * Characters that always need escaping in inline markdown text.
 */
const INLINE_ESCAPES = [
  "\\", // escape character
  "`", // inline code
  "*", // emphasis/bold
  "_", // emphasis/bold
  "[", // link start
  "]", // link end
  "~", // strikethrough (GFM)
  "|", // table cell (GFM)
  "<", // HTML tag
]

const INLINE_ESCAPES_REGEXP = new RegExp(
  `(${INLINE_ESCAPES.map((symbol) => `\\${symbol}`).join("|")})`,
  "g"
)

/**
 * Escape text that could have an ambiguous meaning in markdown.
 *
 * Only escapes characters that genuinely need escaping:
 * - Characters with special inline meaning (always escaped)
 * - Characters with special meaning at the start of a line (position-aware)
 */
export function escapeText(s: string) {
  // Escape characters that always have inline meaning
  let result = s.replace(INLINE_ESCAPES_REGEXP, (s: string) => `\\${s}`)

  // Escape characters that only have special meaning at the start of a line
  result = result.replace(/^(#{1,6})(\s)/m, "\\$1$2") // headings
  result = result.replace(/^(\d+)([.)]\s)/m, "$1\\$2") // ordered list
  result = result.replace(/^([-+>])\s/m, "\\$1 ") // list / blockquote

  return result
}
