const WIKI_LINK_PREFIX = "wysimark:wiki-link:"
const WIKI_EMBED_PREFIX = "wysimark:wiki-embed:"
const ESCAPED_WIKI_OPEN = "\uE000WYSIMARK_ESCAPED_WIKI_OPEN\uE000"

export function protectEscapedWikiLinks(markdown: string): string {
  return markdown.replace(/\\\[\[/g, ESCAPED_WIKI_OPEN)
}

export function restoreEscapedWikiLinks(text: string): string {
  return text.replace(new RegExp(ESCAPED_WIKI_OPEN, "g"), "[[")
}

export function wikiLinkHref(rawSpec: string): string {
  return `${WIKI_LINK_PREFIX}${encodeURIComponent(rawSpec)}`
}

export function wikiEmbedUrl(rawSpec: string): string {
  return `${WIKI_EMBED_PREFIX}${encodeURIComponent(rawSpec)}`
}

export function isWikiLinkHref(href: string): boolean {
  return href.startsWith(WIKI_LINK_PREFIX)
}

export function isWikiEmbedUrl(url: string): boolean {
  return url.startsWith(WIKI_EMBED_PREFIX)
}

export function wikiLinkSpecFromHref(href: string): string {
  return decodeURIComponent(href.slice(WIKI_LINK_PREFIX.length))
}

export function wikiEmbedSpecFromUrl(url: string): string {
  return decodeURIComponent(url.slice(WIKI_EMBED_PREFIX.length))
}

export function splitWikiSpec(rawSpec: string): {
  target: string
  display?: string
} {
  const pipeIndex = rawSpec.lastIndexOf("|")
  if (pipeIndex < 0) return { target: rawSpec.trim() }
  return {
    target: rawSpec.slice(0, pipeIndex).trim(),
    display: rawSpec.slice(pipeIndex + 1).trim(),
  }
}

export function wikiLinkTarget(rawSpec: string): string {
  return splitWikiSpec(rawSpec).target
}

export function normalizeWikiLinkInput(value: string): {
  target: string
  display?: string
} {
  const trimmed = value.trim()
  const wikiMatch = trimmed.match(/^!?\[\[([\s\S]+)\]\]$/)
  return splitWikiSpec(wikiMatch ? wikiMatch[1] : trimmed)
}

export function wikiLinkDisplayText(rawSpec: string): string {
  const { target, display } = splitWikiSpec(rawSpec)
  if (display) return display

  if (target.startsWith("##")) {
    return target.slice(2).trim() || "Headings"
  }

  if (target.startsWith("^^")) {
    return target.slice(2).trim() || "Blocks"
  }

  const hashIndex = target.indexOf("#")
  if (hashIndex < 0) return target

  const fileName = target.slice(0, hashIndex).trim()
  const subpaths = target
    .slice(hashIndex + 1)
    .split("#")
    .map((part) => part.trim())
    .filter(Boolean)
  if (!fileName) return subpaths.join(" > ")
  if (subpaths.length === 0) return fileName
  return [fileName, ...subpaths].join(" > ")
}

export function serializeWikiLinkHref(href: string, label: string): string {
  const rawSpec = wikiLinkSpecFromHref(href)
  const { target, display } = splitWikiSpec(rawSpec)
  if (display) return `[[${target}|${display}]]`

  const trimmedLabel = label.trim()
  const defaultLabel = wikiLinkDisplayText(target)
  if (trimmedLabel && trimmedLabel !== defaultLabel) {
    return `[[${target}|${trimmedLabel}]]`
  }
  return `[[${target}]]`
}

export function serializeWikiEmbedUrl(url: string): string {
  return `![[${wikiEmbedSpecFromUrl(url)}]]`
}
