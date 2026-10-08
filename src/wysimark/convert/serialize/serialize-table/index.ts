import {
  TableCellElement,
  TableColumnAlign,
  TableContentElement,
  TableElement,
  TableRowElement,
} from "../../../table-plugin"

import { InternalLinkOptions } from "../../obsidian-links"
import { Segment } from "../../types"
import { assert, assertElementType } from "../../utils"
import { serializeLine } from "../serialize-line"

export function serializeTable(
  element: TableElement,
  options: InternalLinkOptions = {}
): string {
  const lines: string[] = []
  lines.push(serializeTableRow(element.children[0], options))
  lines.push(serializeColumns(element.columns))
  element.children.slice(1).forEach((row) => {
    lines.push(serializeTableRow(row, options))
  })
  return `${lines.join("\n")}\n\n`
}

function serializeColumns(columns: TableElement["columns"]): string {
  const isAllLeft = columns.every((column) => column.align === "left")
  /**
   * If all of the columns are to the left, it looks nicer if we don't specify
   * column alignment in the markdown at all. Just use the default `---` to
   * specify each column.
   */
  if (isAllLeft) {
    return `|${columns.map(() => "---").join("|")}|`
  }
  /**
   * If one or more of the columns is not aligned left, let's add some clarity
   * and specify the alignment of all the columns including the `left` aligned
   * ones.
   */
  return `|${columns.map((column) => serializeAlign(column.align)).join("|")}|`
}

function serializeAlign(align: TableColumnAlign) {
  switch (align) {
    case "left":
      return ":---"
    case "center":
      return ":---:"
    case "right":
      return "---:"
  }
}

function serializeTableRow(
  element: TableRowElement,
  options: InternalLinkOptions
): string {
  assertElementType(element, "table-row")
  return `|${element.children.map((cell) => serializeTableCell(cell, options)).join("|")}|`
}

function serializeTableCell(
  element: TableCellElement,
  options: InternalLinkOptions
): string {
  assertElementType(element, "table-cell")
  assert(
    element.children.length === 1,
    `Expected table-cell to have one child but is ${JSON.stringify(
      element.children
    )}`
  )
  return element.children.map((child) => serializeTableContent(child, options)).join("")
}

function serializeTableContent(
  element: TableContentElement,
  options: InternalLinkOptions
): string {
  assertElementType(element, "table-content")
  const line = serializeLine(element.children as Segment[], [], [], { ...options, inTable: true })
  // GFM splits a row into cells on unescaped pipes before any inline parsing,
  // so every pipe in a cell (even inside code spans or URLs) must be escaped.
  // Pipes outside of tables are literal and `escapeText` leaves them alone.
  // Replace soft breaks (two trailing spaces + newline) and bare newlines
  // with <br> so the table row stays on a single line in GFM markdown.
  return line
    .replace(/\|/g, "\\|")
    .replace(/ {2}\n/g, "<br>")
    .replace(/\n/g, "<br>")
}
