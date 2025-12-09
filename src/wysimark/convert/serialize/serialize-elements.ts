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
   */
  if (joined.trim() === "") return ""

  /**
   * The following code replaces consecutive newlines with a single newline
   * with a bit of additional logic to handle newlines at the beginning.
   */
  return replaceConsecutiveNewlines(replaceLeadingNewlines(joined)).trim()
}

/**
 * Replace two leading newlines with a <br> tag to indicate a
 * paragraph that won't be collapsed.
 * Using <br> instead of &nbsp; for Obsidian compatibility.
 */
function replaceLeadingNewlines(input: string): string {
  return input.replace(/^\n\n/g, "<br>\n\n")
}

/**
 * In the rest of the Markdown, replace four or more consecutive newlines with
 * <br> tags and newlines to indicate a paragraph that won't be collapsed.
 * Using <br> instead of &nbsp; for Obsidian compatibility.
 */
function replaceConsecutiveNewlines(input: string): string {
  return input.replace(/(\n{4,})/g, (match) => {
    const newlineCount = match.length
    const count = Math.floor((newlineCount - 2) / 2)
    return "\n\n" + Array(count).fill("<br>").join("\n\n") + "\n\n"
  })
}
