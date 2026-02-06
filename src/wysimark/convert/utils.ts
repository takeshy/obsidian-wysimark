import { Element } from "./types"

/**
 * Function to escape forward slashes in URLs, but only for plain text URLs (not in markdown links or HTML blocks)
 * This is necessary because the markdown parser doesn't handle unescaped forward slashes in URLs correctly
 */
export function escapeUrlSlashes(text: string): string {
  // First, we need to identify markdown links to exclude them
  const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const placeholderPrefix = "\u0007WYSIMARK_";
  const linkPrefix = `${placeholderPrefix}LINK_`;
  const htmlPrefix = `${placeholderPrefix}HTML_`;
  const placeholderSuffix = "\u0007";

  // Store the markdown links to restore them later
  const links: string[] = [];
  let linkIndex = 0;

  // Replace markdown links with placeholders
  let result = text.replace(markdownLinkPattern, (match) => {
    links.push(match);
    return `${linkPrefix}${linkIndex++}${placeholderSuffix}`;
  });

  // Also exclude HTML blocks (tags plus their contents when a closing tag exists)
  const htmlBlocks: string[] = [];
  const masked = maskHtmlBlocks(result, htmlBlocks, htmlPrefix, placeholderSuffix);
  result = masked;

  // URL regex pattern to identify plain text URLs
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  // Escape forward slashes in plain text URLs
  result = result.replace(urlPattern, (url) => {
    return url.replace(/\//g, '\\/');
  });

  // Restore HTML blocks first (they may contain markdown links placeholders)
  for (let i = 0; i < htmlBlocks.length; i++) {
    result = result.replace(
      `${htmlPrefix}${i}${placeholderSuffix}`,
      htmlBlocks[i]
    );
  }

  // Restore the markdown links
  for (let i = 0; i < links.length; i++) {
    result = result.replace(
      `${linkPrefix}${i}${placeholderSuffix}`,
      links[i]
    );
  }

  return result;
}

/**
 * Function to unescape forward slashes in URLs that were previously escaped
 * This is used when switching to raw mode to display the unescaped markdown
 */
export function unescapeUrlSlashes(text: string): string {
  // Only unescape forward slashes that we previously escaped.
  return text.replace(/\\\//g, "/");
}

type TagInfo = {
  name: string | null
  endIndex: number
  isClosing: boolean
  isSelfClosing: boolean
}

const RAW_TEXT_TAGS = new Set(["script", "style"])

function maskHtmlBlocks(
  text: string,
  htmlBlocks: string[],
  htmlPrefix: string,
  placeholderSuffix: string
): string {
  let output = ""
  let index = 0

  while (index < text.length) {
    const ltIndex = text.indexOf("<", index)
    if (ltIndex === -1) {
      output += text.slice(index)
      break
    }

    output += text.slice(index, ltIndex)

    if (text.startsWith("<!--", ltIndex)) {
      const end = text.indexOf("-->", ltIndex + 4)
      if (end === -1) {
        output += text.slice(ltIndex)
        break
      }
      const block = text.slice(ltIndex, end + 3)
      htmlBlocks.push(block)
      output += `${htmlPrefix}${htmlBlocks.length - 1}${placeholderSuffix}`
      index = end + 3
      continue
    }

    if (text.startsWith("<![CDATA[", ltIndex)) {
      const end = text.indexOf("]]>", ltIndex + 9)
      if (end === -1) {
        output += text.slice(ltIndex)
        break
      }
      const block = text.slice(ltIndex, end + 3)
      htmlBlocks.push(block)
      output += `${htmlPrefix}${htmlBlocks.length - 1}${placeholderSuffix}`
      index = end + 3
      continue
    }

    const tag = parseTag(text, ltIndex)
    if (!tag) {
      output += "<"
      index = ltIndex + 1
      continue
    }

    const blockIndex = htmlBlocks.length
    const placeholder = `${htmlPrefix}${blockIndex}${placeholderSuffix}`

    if (!tag.name) {
      const block = text.slice(ltIndex, tag.endIndex + 1)
      htmlBlocks.push(block)
      output += placeholder
      index = tag.endIndex + 1
      continue
    }

    const tagName = tag.name.toLowerCase()

    if (tag.isClosing || tag.isSelfClosing) {
      const block = text.slice(ltIndex, tag.endIndex + 1)
      htmlBlocks.push(block)
      output += placeholder
      index = tag.endIndex + 1
      continue
    }

    if (RAW_TEXT_TAGS.has(tagName)) {
      const closeStart = text.toLowerCase().indexOf(`</${tagName}`, tag.endIndex + 1)
      if (closeStart !== -1) {
        const closeTag = parseTag(text, closeStart)
        if (closeTag) {
          const block = text.slice(ltIndex, closeTag.endIndex + 1)
          htmlBlocks.push(block)
          output += placeholder
          index = closeTag.endIndex + 1
          continue
        }
      }
    }

    const closingTagEnd = findClosingTagEnd(text, tagName, tag.endIndex + 1)
    if (closingTagEnd !== null) {
      const block = text.slice(ltIndex, closingTagEnd + 1)
      htmlBlocks.push(block)
      output += placeholder
      index = closingTagEnd + 1
      continue
    }

    const block = text.slice(ltIndex, tag.endIndex + 1)
    htmlBlocks.push(block)
    output += placeholder
    index = tag.endIndex + 1
  }

  return output
}

function parseTag(text: string, startIndex: number): TagInfo | null {
  if (text[startIndex] !== "<") return null
  const endIndex = findTagEnd(text, startIndex)
  if (endIndex === -1) return null

  let cursor = startIndex + 1
  if (cursor >= text.length) return null

  const firstChar = text[cursor]
  if (firstChar === "!" || firstChar === "?") {
    return {
      name: null,
      endIndex,
      isClosing: false,
      isSelfClosing: true,
    }
  }

  let isClosing = false
  if (firstChar === "/") {
    isClosing = true
    cursor += 1
  }

  const nameMatch = /^[A-Za-z][A-Za-z0-9-]*/.exec(text.slice(cursor))
  if (!nameMatch) return null

  const name = nameMatch[0]
  const tagText = text.slice(startIndex, endIndex + 1)
  const isSelfClosing = /\/\s*>$/.test(tagText)

  return {
    name,
    endIndex,
    isClosing,
    isSelfClosing,
  }
}

function findTagEnd(text: string, startIndex: number): number {
  let quote: "'" | '"' | null = null
  for (let i = startIndex + 1; i < text.length; i++) {
    const char = text[i]
    if (quote) {
      if (char === quote) {
        quote = null
      }
      continue
    }
    if (char === "'" || char === '"') {
      quote = char
      continue
    }
    if (char === ">") {
      return i
    }
  }
  return -1
}

function findClosingTagEnd(text: string, tagName: string, startIndex: number): number | null {
  let depth = 1
  let cursor = startIndex
  const lowerTag = tagName.toLowerCase()

  while (cursor < text.length) {
    const ltIndex = text.indexOf("<", cursor)
    if (ltIndex === -1) return null

    const tag = parseTag(text, ltIndex)
    if (!tag || !tag.name) {
      cursor = ltIndex + 1
      continue
    }

    if (tag.name.toLowerCase() === lowerTag) {
      if (tag.isClosing) {
        depth -= 1
      } else if (!tag.isSelfClosing) {
        depth += 1
      }
      if (depth === 0) {
        return tag.endIndex
      }
    }

    cursor = tag.endIndex + 1
  }

  return null
}

export function assert(pass: boolean, message: string) {
  if (!pass) throw new Error(`${message}`)
}

export function assertElementType(element: Element, type: Element["type"]) {
  if (element.type !== type)
    throw new Error(
      `Expected element to be of type ${JSON.stringify(
        element
      )} but is ${JSON.stringify(element, null, 2)}`
    )
}

export function assertUnreachable(x: never): never {
  throw new Error(
    `Didn't expect to get here with value ${JSON.stringify(x, null, 2)}`
  )
}
