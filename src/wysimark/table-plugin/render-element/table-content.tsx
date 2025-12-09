import { ConstrainedRenderElementProps } from "../../sink"

import { TableContentElement } from "../types"
import { $TableContent } from "./styles"

export function TableContent({
  attributes,
  children,
}: ConstrainedRenderElementProps<TableContentElement>) {
  return <$TableContent {...attributes}>{children}</$TableContent>
}
