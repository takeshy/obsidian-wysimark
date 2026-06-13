import { MarkKey } from "../../../../types"

export const MARK_KEY_TO_OPEN_TOKEN = {
  bold: "**",
  italic: "_",
  // ins: "++",
  strike: "~~",
  highlight: "<mark>",
  /**
   * IMPORTANT!
   *
   * We noop `code` here.
   *
   * We accept the `code` mark so as not to throw an error if it is found. We do
   * this because we handle `code` text specially because of the way it needs to
   * be escaped.
   *
   * This is handled in the `serializeLine` code.
   */
  code: "",
} as Record<MarkKey, string>

export const MARK_KEY_TO_CLOSE_TOKEN = {
  bold: "**",
  italic: "_",
  // ins: "++",
  strike: "~~",
  highlight: "</mark>",
  code: "",
} as Record<MarkKey, string>

/**
 * @deprecated Use MARK_KEY_TO_OPEN_TOKEN instead
 */
export const MARK_KEY_TO_TOKEN = MARK_KEY_TO_OPEN_TOKEN

/**
 * Convert a single mark to its opening symbol/tag
 */
function convertMarkToOpenSymbol(mark: MarkKey): string {
  if (mark in MARK_KEY_TO_OPEN_TOKEN) return MARK_KEY_TO_OPEN_TOKEN[mark]
  throw new Error(
    `Could not find mark ${JSON.stringify(mark)} in MARK_KEY_TO_OPEN_TOKEN lookup`
  )
}

/**
 * Convert a single mark to its closing symbol/tag
 */
function convertMarkToCloseSymbol(mark: MarkKey): string {
  if (mark in MARK_KEY_TO_CLOSE_TOKEN) return MARK_KEY_TO_CLOSE_TOKEN[mark]
  throw new Error(
    `Could not find mark ${JSON.stringify(mark)} in MARK_KEY_TO_CLOSE_TOKEN lookup`
  )
}

/**
 * Convert an array of marks to opening symbols/tags
 */
export function convertMarksToOpenSymbols(marks: MarkKey[]) {
  return marks.map(convertMarkToOpenSymbol).join("")
}

/**
 * Convert an array of marks to closing symbols/tags
 */
export function convertMarksToCloseSymbols(marks: MarkKey[]) {
  return marks.map(convertMarkToCloseSymbol).join("")
}

/**
 * Convert an array of marks to a string
 * @deprecated Use convertMarksToOpenSymbols or convertMarksToCloseSymbols instead
 */
export function convertMarksToSymbolsExceptCode(marks: MarkKey[]) {
  return marks.map(convertMarkToOpenSymbol).join("")
}
