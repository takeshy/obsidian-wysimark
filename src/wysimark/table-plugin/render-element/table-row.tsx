import { ConstrainedRenderElementProps } from "../../sink"

import { TableRowElement } from "../types"
import { $TableRow } from "./styles"

export function TableRow({
  attributes,
  children,
}: ConstrainedRenderElementProps<TableRowElement>) {
  return <$TableRow {...attributes}>{children}</$TableRow>
}
