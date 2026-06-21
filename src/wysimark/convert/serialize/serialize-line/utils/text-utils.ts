// ASCII punctuation per CommonMark: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
// These are the only characters `\` can escape, so a `\` not followed by one
// of them is a literal backslash (e.g. Windows paths like `C:\Users`).
function isAsciiPunct(ch: string): boolean {
  return /[!-/:-@\[-`{-~]/.test(ch)
}

function isWhitespace(ch: string): boolean {
  return ch === "" || /\s/u.test(ch)
}

function isPunctOrSymbol(ch: string): boolean {
  return ch !== "" && /[\p{P}\p{S}]/u.test(ch)
}

// `<` only starts an HTML tag or autolink when followed by a letter, `/`,
// `?`, or `!`. Otherwise (e.g. `a < b`, `a<5`) it is literal.
function isHtmlTagStart(ch: string): boolean {
  return /[a-zA-Z/?!]/.test(ch)
}

// `_` cannot open/close emphasis between word characters, while `*` has no
// intraword restriction, so `*` only needs to be flanking to pair.
function getDelimitersThatCanPair(
  chars: string[],
  delimiter: string,
  intraword: boolean
): Set<number> {
  const escaped = new Set<number>()
  const openers: number[] = []

  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== delimiter) continue

    const prev = i > 0 ? chars[i - 1] : ""
    const next = i + 1 < chars.length ? chars[i + 1] : ""
    const leftFlanking =
      !isWhitespace(next) &&
      (!isPunctOrSymbol(next) || isWhitespace(prev) || isPunctOrSymbol(prev))
    const rightFlanking =
      !isWhitespace(prev) &&
      (!isPunctOrSymbol(prev) || isWhitespace(next) || isPunctOrSymbol(next))

    const canOpen =
      leftFlanking && (intraword || !rightFlanking || isPunctOrSymbol(prev))
    const canClose =
      rightFlanking && (intraword || !leftFlanking || isPunctOrSymbol(next))

    if (canClose && openers.length > 0) {
      escaped.add(openers.pop())
      escaped.add(i)
    }
    if (canOpen) openers.push(i)
  }

  return escaped
}

function getTildesThatCanPair(chars: string[]): Set<number> {
  const escaped = new Set<number>()
  const openers: number[] = []

  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== "~") continue

    const prev = i > 0 ? chars[i - 1] : ""
    const next = i + 1 < chars.length ? chars[i + 1] : ""
    const canOpen = !isWhitespace(next)
    const canClose = !isWhitespace(prev)

    if (canClose && openers.length > 0) {
      escaped.add(openers.pop())
      escaped.add(i)
    }
    if (canOpen) openers.push(i)
  }

  return escaped
}

// Brackets are literal unless they could produce a link, image, or footnote
// reference: a `[...]` pair whose `]` is directly followed by `(`, or a `[`
// directly followed by `^`. Shortcut reference links (`[foo]` alone) cannot
// resolve because parse inlines all reference links and drops definitions.
function getBracketsThatCanFormLinks(chars: string[]): Set<number> {
  const escaped = new Set<number>()
  const openers: number[] = []

  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === "[") {
      if (chars[i + 1] === "^") escaped.add(i)
      openers.push(i)
    } else if (chars[i] === "]") {
      const opener = openers.pop()
      if (opener !== undefined && chars[i + 1] === "(") {
        escaped.add(opener)
        escaped.add(i)
      }
    }
  }

  return escaped
}

export type EscapeTextOptions = {
  /**
   * Inside a `[label](url)` anchor, an unbalanced bracket in the label text
   * would change where the label ends, so brackets are always escaped there.
   */
  inAnchorLabel?: boolean
  /**
   * Whether backticks in this text could pair with another backtick run in
   * the same line (a sibling text node or a code mark) to form a code span.
   * Computed per line in `serializeLine`; when undefined, falls back to
   * "this text contains two or more backticks".
   */
  escapeBackticks?: boolean
}

/**
 * Escape text that could have an ambiguous meaning in markdown.
 *
 * Only escapes characters that genuinely need escaping:
 * - `` ` `` — escaped only when another backtick in the line could pair with
 *   it to form a code span
 * - `*`, `_`, `~` — escaped only when they could open/close
 *   emphasis/strikethrough
 * - `[`, `]` — escaped only when they could form a link/image (`](`) or a
 *   footnote reference (`[^`), or anywhere inside an anchor label
 * - `\` — escaped only when followed by an ASCII punctuation character
 * - `<` — escaped only when it could start an HTML tag or autolink
 * - `#`, ordered list markers, `-`/`+`/`*`/`>` — escaped only at the start
 *   of a line
 *
 * `|` is not escaped here at all; it only has meaning inside tables, where
 * `serializeTable` escapes every pipe in the serialized cell content.
 */
export function escapeText(s: string, options: EscapeTextOptions = {}) {
  const chars = Array.from(s)
  const emphasisUnderscores = getDelimitersThatCanPair(chars, "_", false)
  const emphasisAsterisks = getDelimitersThatCanPair(chars, "*", true)
  const strikethroughTildes = getTildesThatCanPair(chars)
  const linkBrackets = getBracketsThatCanFormLinks(chars)
  const escapeBackticks =
    options.escapeBackticks ?? chars.filter((c) => c === "`").length >= 2
  let result = ""
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    const next = i + 1 < chars.length ? chars[i + 1] : ""

    if (ch === "`") {
      result += escapeBackticks ? "\\`" : ch
    } else if (ch === "\\") {
      result += isAsciiPunct(next) ? "\\\\" : "\\"
    } else if (ch === "<") {
      result += isHtmlTagStart(next) ? "\\<" : "<"
    } else if (ch === "_") {
      result += emphasisUnderscores.has(i) ? `\\${ch}` : ch
    } else if (ch === "*") {
      result += emphasisAsterisks.has(i) ? `\\${ch}` : ch
    } else if (ch === "~") {
      result += strikethroughTildes.has(i) ? `\\${ch}` : ch
    } else if (ch === "[" || ch === "]") {
      result += options.inAnchorLabel || linkBrackets.has(i) ? `\\${ch}` : ch
    } else {
      result += ch
    }
  }

  // Escape characters that only have special meaning at the start of a line
  result = result.replace(/^(#{1,6})(\s)/m, "\\$1$2") // headings
  result = result.replace(/^(\d+)([.)]\s)/m, "$1\\$2") // ordered list
  result = result.replace(/^([-+*>])\s/m, "\\$1 ") // list / blockquote
  result = result.replace(/\[\[/g, "\\[[")

  return result
}
