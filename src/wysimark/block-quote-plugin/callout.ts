import { Element, Node } from "slate"

import type { BlockQuoteElement } from "."

export type CalloutInfo = {
  type: string
  displayType: string
  title: string
  fold?: "open" | "closed"
  icon: string
}

const supportedTypes = new Set([
  "note", "abstract", "info", "todo", "tip", "success", "question",
  "warning", "failure", "danger", "bug", "example", "quote",
])

const aliases: Record<string, string> = {
  summary: "abstract", tldr: "abstract", hint: "tip", important: "tip",
  check: "success", done: "success", help: "question", faq: "question",
  caution: "warning", attention: "warning", fail: "failure",
  missing: "failure", error: "danger", cite: "quote",
}

const icons: Record<string, string> = {
  note: "i", abstract: "≡", info: "i", todo: "✓", tip: "⚑",
  success: "✓", question: "?", warning: "!", failure: "×", danger: "!",
  bug: "●", example: "□", quote: "“",
}

function titleCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ")
}

export function getCalloutInfo(element: BlockQuoteElement): CalloutInfo | null {
  const firstChild = element.children[0]
  if (!Element.isElement(firstChild) || firstChild.type !== "paragraph") return null

  const marker = Node.string(firstChild).split("\n", 1)[0].trim()
  const match = marker.match(/^\[!([A-Za-z0-9_-]+)\]([+-])?(?:\s+(.*))?$/)
  if (!match) return null

  const rawType = match[1].toLowerCase()
  const normalizedType = aliases[rawType] || rawType
  const type = supportedTypes.has(normalizedType) ? normalizedType : "note"
  return {
    type,
    displayType: rawType,
    title: match[3]?.trim() || titleCase(rawType),
    fold: match[2] === "+" ? "open" : match[2] === "-" ? "closed" : undefined,
    icon: icons[type] || icons.note,
  }
}
