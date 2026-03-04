import {
  TableCellElement,
  TableColumnAlign,
  TableContentElement,
  TableElement,
  TableRowElement,
} from "../../../table-plugin"

import { Segment } from "../../types"
import { assertElementType } from "../../utils"
import { serializeLine } from "../serialize-line"

export function serializeTable(element: TableElement): string {
  const lines: string[] = []
  lines.push(serializeTableRow(element.children[0]))
  lines.push(serializeColumns(element.columns))
  element.children.slice(1).forEach((row) => {
    lines.push(serializeTableRow(row))
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

function serializeTableRow(element: TableRowElement): string {
  assertElementType(element, "table-row")
  return `|${element.children.map(serializeTableCell).join("|")}|`
}

function serializeTableCell(element: TableCellElement): string {
  assertElementType(element, "table-cell")
  // Join multiple table-content children with <br> to keep the row on one line.
  return element.children.map(serializeTableContent).join("<br>")
}

function serializeTableContent(element: TableContentElement): string {
  assertElementType(element, "table-content")
  const line = serializeLine(element.children as Segment[])
  // Replace soft breaks (two trailing spaces + newline) and bare newlines
  // with <br> so the table row stays on a single line in GFM markdown.
  return line.replace(/ {2}\n/g, "<br>").replace(/\n/g, "<br>")
}
