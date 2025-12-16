import type { HTML } from "mdast"

import { Element } from "../types"

export function parseHTML(content: HTML): Element[] {
  return [
    {
      type: "html-block",
      html: content.value,
      children: [{ text: "" }],
    },
  ]
}
