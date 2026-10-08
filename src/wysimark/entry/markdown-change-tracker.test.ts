import assert from "node:assert/strict"
import { it } from "node:test"
import { MarkdownChangeTracker } from "./markdown-change-tracker"

it("does not save normalization or repeated cursor notifications", () => {
  const tracker = new MarkdownChangeTracker("# Heading\ntext", "# Heading\n\ntext")
  assert.equal(tracker.next("# Heading\n\ntext"), undefined)
  assert.equal(tracker.next("# Heading\n\ntext"), undefined)
})

it("saves the first edit and restores the exact source on undo", () => {
  const tracker = new MarkdownChangeTracker("# Heading\ntext", "# Heading\n\ntext")
  assert.equal(tracker.next("# Heading\n\ntext!"), "# Heading\n\ntext!")
  assert.equal(tracker.next("# Heading\n\ntext!"), undefined)
  assert.equal(tracker.next("# Heading\n\ntext"), "# Heading\ntext")
})
