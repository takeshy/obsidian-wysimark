import { Element } from "../types"
import { serializeElement } from "./serialize-element"

export function serializeElements(elements: Element[]): string {
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
      orders[element.depth] = (orders[element.depth] || 0) + 1
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
    let serialized = serializeElement(element, orders);

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

    segments.push(serialized);
  }
  /**
   * NOTE:
   *
   * We remove trailing whitespace because we want minimum viable markdown.
   * It also makes it easier to test.
   */
  const joined = segments.join("") //.trim()

  /**
   * If there is no content return an empty string for the Markdown.
   * Use a regex that only matches ASCII whitespace (not \u00A0) so that
   * documents consisting entirely of blank lines (NBSP paragraphs) are
   * preserved.
   */
  if (joined.replace(/[\t\n\r ]/g, "") === "") return ""

  /**
   * Remove leading newlines and trim trailing ASCII whitespace only.
   * We use a regex instead of .trim() because .trim() also removes
   * non-breaking space (\u00A0) which is used to represent empty
   * paragraphs (blank lines) in the serialized markdown.
   */
  return joined.replace(/^\n+/, "").replace(/[\t\n\r ]+$/, "")
}
