import type { Table, TableCell, TableRow } from "mdast"
import { Descendant } from "slate"

import { InternalLinkOptions } from "../obsidian-links"
import {
  TableCellElement,
  TableElement,
  TableRowElement,
} from "../../table-plugin"

import { parsePhrasingContents } from "./parse-phrasing-content/parse-phrasing-content"

export function parseTable(
  table: Table,
  options: InternalLinkOptions = {}
): [TableElement] {
  if (table.align == null)
    throw new Error(`Expected an array of AlignType for table.align`)
  return [
    {
      type: "table",
      columns: table.align.map((align) => ({
        align: align || "left",
      })),
      children: table.children.map((row) => parseTableRow(row, options)),
    },
  ]
}

function parseTableRow(
  row: TableRow,
  options: InternalLinkOptions
): TableRowElement {
  if (row.type !== "tableRow") throw new Error(`Expected a tableRow`)
  return {
    type: "table-row",
    children: row.children.map((cell) => parseTableCell(cell, options)),
  }
}

function parseTableCell(
  cell: TableCell,
  options: InternalLinkOptions
): TableCellElement {
  if (cell.type !== "tableCell") throw new Error(`Expected a tableCell`)
  return {
    type: "table-cell",
    children: [
      {
        type: "table-content",
        children: parsePhrasingContents(cell.children, {}, options) as Descendant[],
      },
    ],
  }
}
