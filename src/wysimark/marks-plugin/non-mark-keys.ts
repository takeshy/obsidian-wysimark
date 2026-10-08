/**
 * Text properties that record Markdown source structure rather than
 * formatting. They are not toggleable marks: they must never be serialized as
 * mark tokens, removed by "clear formatting", or carried into newly typed text.
 */
export const NON_MARK_TEXT_KEYS = ["softBreak", "html", "footnote"] as const

export type NonMarkTextKey = (typeof NON_MARK_TEXT_KEYS)[number]

export function isNonMarkTextKey(key: string): key is NonMarkTextKey {
  return (NON_MARK_TEXT_KEYS as readonly string[]).includes(key)
}

export function withoutNonMarkTextKeys<T extends object>(
  props: T
): Omit<T, NonMarkTextKey> {
  const result = { ...props } as Record<string, unknown>
  for (const key of NON_MARK_TEXT_KEYS) delete result[key]
  return result as Omit<T, NonMarkTextKey>
}
