import { Element, Segment } from "../types"
import { assertUnreachable } from "../utils"
import { serializeElements } from "./serialize-elements"
import { serializeCodeBlock } from "./serialize-code-block"
import { serializeImageBlock } from "./serialize-image-block"
import { serializeLine } from "./serialize-line"
import { serializeTable } from "./serialize-table"

const LIST_INDENT_SIZE = 4

export function serializeElement(element: Element, orders: number[]): string {
  switch (element.type) {
    case "anchor":
      return `[${serializeLine(element.children as Segment[])}](${element.href
        })`
    case "block-quote": {
      const lines = serializeElements(element.children as Element[])
      return `${lines
        .split("\n")
        .map((line) => (line ? `> ${line}` : ">"))
        .join("\n")}\n\n`
    }
    case "heading":
      return `${"#".repeat(element.level)} ${serializeLine(
        element.children as Segment[]
      )}\n\n`
    case "horizontal-rule":
      return "---\n\n"
    case "paragraph":
      return `${serializeLine(element.children as Segment[])}\n\n`
    /**
     * Table
     */
    case "table":
      return serializeTable(element)
    case "table-row":
    case "table-cell":
    case "table-content":
      throw new Error(
        `Table elements should only be present as children of table which should be handled by serializeTable. Got ${element.type} may indicate an error in normalization.`
      )
    /**
     * List
     */
    case "unordered-list-item": {
      const indent = " ".repeat(element.depth * LIST_INDENT_SIZE)
      return `${indent}- ${serializeLine(element.children as Segment[])}\n`
    }
    case "ordered-list-item": {
      const indent = " ".repeat(element.depth * LIST_INDENT_SIZE)
      return `${indent}${orders[element.depth]}. ${serializeLine(
        element.children as Segment[]
      )}\n`
    }
    case "task-list-item": {
      const indent = " ".repeat(element.depth * LIST_INDENT_SIZE)
      let line = serializeLine(element.children as Segment[])
      if (line.trim() === "") {
        line = "&#32;"
      }
      return `${indent}- [${element.checked ? "x" : " "}] ${line}\n`
    }
    case "image-block":
      return serializeImageBlock(element)
    case "code-block":
      return serializeCodeBlock(element)
    case "code-block-line":
      throw new Error(
        `Code block line elements should only be present as children of code-block which should be handled by serializeCodeBlock. Got code-block-line may indicate an error in normalization.`
      )
    case "html-block":
      return `${element.html}\n\n`
    case "image-inline":
      return `![${element.alt || ""}](${element.url})`
  }
  assertUnreachable(element)
}
