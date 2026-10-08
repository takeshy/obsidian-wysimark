import { Element } from "../types"
import { Node } from "slate"
import { InternalLinkOptions } from "../obsidian-links"
import { serializeElement } from "./serialize-element"

export function serializeElements(
  elements: Element[],
  options: InternalLinkOptions = {}
): string {
  elements = elements.filter((element) =>
    !(element.type === "paragraph" && element.__collapsible && Node.string(element) === "")
  )
  const segments: string[] = []

  /**
   * The orders array keeps track of the number of ordered list items at each
   * depth. This is used to generate the number for each ordered list item.
   */
  let orders: number[] = []

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const nextElement = i < elements.length - 1 ? elements[i + 1] : null;

    if (element.type === "ordered-list-item") {
      /**
       * When we're at an ordered list item, we increment the order at the
       * current depth level and we remove any orders at a deeper depth level.
       */
      orders[element.depth] = element.start ?? (orders[element.depth] || 0) + 1
      orders = orders.slice(0, element.depth + 1)
    } else if (
      element.type === "unordered-list-item" ||
      element.type === "task-list-item"
    ) {
      /**
       * When we're at an unordered list item, we slice the orders array to
       * remove any orders at a deeper depth level.
       */
      orders = orders.slice(0, element.depth)
    } else {
      /**
       * When we're at any other element, we reset the orders array because
       * we're no longer in a list.
       */
      orders = []
    }

    // Get the serialized element
    let serialized = serializeElement(element, orders, options);

    // If this is a list item and the next element is not a list item,
    // add an extra newline to create proper spacing between list and paragraph
    if ((element.type === "ordered-list-item" ||
      element.type === "unordered-list-item" ||
      element.type === "task-list-item") &&
      (!nextElement ||
        (nextElement.type !== "ordered-list-item" &&
          nextElement.type !== "unordered-list-item" &&
          nextElement.type !== "task-list-item"))) {
      serialized = serialized.replace(/\n$/, "\n\n");
    }

    if (nextElement && element.__markdownCompactAfter) {
      serialized = serialized.replace(/\n\n$/, "\n")
    }
    segments.push(serialized);
  }
  /**
   * NOTE:
   *
   * We remove trailing whitespace because we want minimum viable markdown.
   * It also makes it easier to test.
   */
  const joined = segments.join("") //.trim()

  // Empty documents stay empty; user-created blank paragraphs use newlines.
  if (joined.replace(/[\t\n\r ]/g, "") === "") return "\n".repeat(Math.max(0, elements.length - 1))

  // Strip block separators, then restore intentional source boundary newlines.
  let trailingEmpty = 0
  for (let i = elements.length - 1; i >= 0; i--) {
    if (elements[i].type !== "paragraph" || Node.string(elements[i]) !== "") break
    trailingEmpty++
  }
  return "\n".repeat(elements[0]?.__markdownLeadingNewlines || 0) +
    joined.replace(/[\t\n\r ]+$/, "") +
    "\n".repeat(trailingEmpty + (elements[elements.length - 1]?.__markdownTrailingNewlines || 0))
}
