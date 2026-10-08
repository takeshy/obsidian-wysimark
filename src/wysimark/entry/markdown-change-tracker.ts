/** Compare edits with the normalized document without rewriting source on load. */
export class MarkdownChangeTracker {
  private previous: string

  constructor(private source: string, private initial: string) {
    this.previous = initial
  }

  next(markdown: string): string | undefined {
    if (markdown === this.previous) return undefined
    this.previous = markdown
    return markdown === this.initial ? this.source : markdown
  }
}
