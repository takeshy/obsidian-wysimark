import { Element } from "./types"

/**
 * Remove inline escape backslashes added by the serializer's escapeText.
 * Matches `\` followed by any of: \ ` * _ [ ] ~ | <
 * and replaces with just the character itself.
 */
export function unescapeMarkdown(text: string): string {
  return text.replace(/\\([\\`*_\[\]~|<])/g, '$1');
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
