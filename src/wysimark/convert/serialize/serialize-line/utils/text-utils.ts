/**
 * Characters that always need escaping in inline markdown text regardless
 * of surrounding context.
 */
const ALWAYS_ESCAPE = new Set(["`", "*", "[", "]", "|"])

// ASCII punctuation per CommonMark: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
// These are the only characters `\` can escape, so a `\` not followed by one
// of them is a literal backslash (e.g. Windows paths like `C:\Users`).
function isAsciiPunct(ch: string): boolean {
  return /[!-/:-@\[-`{-~]/.test(ch)
}

// `<` only starts an HTML tag or autolink when followed by a letter, `/`,
// `?`, or `!`. Otherwise (e.g. `a < b`, `a<5`) it is literal.
function isHtmlTagStart(ch: string): boolean {
  return /[a-zA-Z/?!]/.test(ch)
}

// A character is "word-like" for `_` / `~` flanking purposes when it is
// neither whitespace nor CommonMark punctuation. CommonMark classifies both
// Unicode P (punctuation) and S (symbol, e.g. `$`, `+`, `<`, `|`, `~`, `` ` ``)
// as punctuation for flanking. Start/end of string counts as whitespace-like
// (empty string fails all tests).
function isWordLike(ch: string): boolean {
  if (ch === "") return false
  if (/\s/.test(ch)) return false
  if (/[\p{P}\p{S}]/u.test(ch)) return false
  return true
}

/**
 * Escape text that could have an ambiguous meaning in markdown.
 *
 * Only escapes characters that genuinely need escaping:
 * - `` ` ``, `*`, `[`, `]`, `|` — always escaped
 * - `\` — escaped only when followed by an ASCII punctuation character
 * - `<` — escaped only when it could start an HTML tag or autolink
 * - `_`, `~` — escaped only when they could open/close emphasis/strikethrough
 *   (not between word-like characters)
 * - `#`, ordered list markers, `-`/`+`/`>` — escaped only at the start of a line
 */
export function escapeText(s: string) {
  let result = ""
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const prev = i > 0 ? s[i - 1] : ""
    const next = i + 1 < s.length ? s[i + 1] : ""

    if (ALWAYS_ESCAPE.has(ch)) {
      result += `\\${ch}`
    } else if (ch === "\\") {
      result += isAsciiPunct(next) ? "\\\\" : "\\"
    } else if (ch === "<") {
      result += isHtmlTagStart(next) ? "\\<" : "<"
    } else if (ch === "_" || ch === "~") {
      result += isWordLike(prev) && isWordLike(next) ? ch : `\\${ch}`
    } else {
      result += ch
    }
  }

  // Escape characters that only have special meaning at the start of a line
  result = result.replace(/^(#{1,6})(\s)/m, "\\$1$2") // headings
  result = result.replace(/^(\d+)([.)]\s)/m, "$1\\$2") // ordered list
  result = result.replace(/^([-+>])\s/m, "\\$1 ") // list / blockquote

  return result
}
