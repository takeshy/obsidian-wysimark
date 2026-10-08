export type LineEnding = "\n" | "\r\n" | "\r"

export function getLineEnding(markdown: string): LineEnding {
  return (markdown.match(/\r\n|\r|\n/)?.[0] as LineEnding | undefined) || "\n"
}

export function withLineEnding(markdown: string, ending: LineEnding): string {
  return markdown.replace(/\r\n|\r|\n/g, ending)
}
