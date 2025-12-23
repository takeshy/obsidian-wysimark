import { Element } from "./types"

/**
 * Function to escape forward slashes in URLs, but only for plain text URLs (not in markdown links)
 * This is necessary because the markdown parser doesn't handle unescaped forward slashes in URLs correctly
 */
export function escapeUrlSlashes(text: string): string {
  // First, we need to identify markdown links to exclude them
  const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  // Store the markdown links to restore them later
  const links: string[] = [];
  let linkIndex = 0;

  // Replace markdown links with placeholders
  const textWithoutLinks = text.replace(markdownLinkPattern, (match) => {
    links.push(match);
    return `__MARKDOWN_LINK_${linkIndex++}__`;
  });

  // URL regex pattern to identify plain text URLs
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  // Escape forward slashes in plain text URLs
  const textWithEscapedUrls = textWithoutLinks.replace(urlPattern, (url) => {
    return url.replace(/\//g, '\\/');
  });

  // Restore the markdown links
  let result = textWithEscapedUrls;
  for (let i = 0; i < links.length; i++) {
    result = result.replace(`__MARKDOWN_LINK_${i}__`, links[i]);
  }

  return result;
}

/**
 * Function to unescape forward slashes in URLs that were previously escaped
 * This is used when switching to raw mode to display the unescaped markdown
 */
export function unescapeUrlSlashes(text: string): string {
  // Unescape all escaped characters in the text
  return text.replace(/\\(.)/g, (_match: string, char: string) => {
    return char;
  });
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
