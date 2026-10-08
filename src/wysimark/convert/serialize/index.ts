import { Element } from "../types"
import { InternalLinkOptions } from "../obsidian-links"
import { normalizeElementListDepths } from "./normalize/normalizeElementListDepths"
import { serializeElements } from "./serialize-elements"
import { withLineEnding } from "../line-endings"

export function serialize(
  elements: Element[],
  options: InternalLinkOptions = { enableInternalLinks: true }
): string {
  const normalizedElements = normalizeElementListDepths(elements)
  const lineEnding = elements.find((element) => element.__markdownLineEnding)?.__markdownLineEnding || "\n"
  return withLineEnding(serializeElements(normalizedElements, options), lineEnding)
}
