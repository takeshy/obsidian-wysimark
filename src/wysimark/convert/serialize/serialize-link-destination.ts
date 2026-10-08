/** Preserve destinations that cannot be represented safely without angle brackets. */
export function serializeLinkDestination(url: string): string {
  let depth = 0
  let balanced = true
  for (const char of url) {
    if (char === "(") depth++
    if (char === ")" && --depth < 0) balanced = false
  }
  if (!/[\s\\<>]/.test(url) && balanced && depth === 0) return url
  return `<${url.replace(/[\r\n\t]/g, (char) => encodeURIComponent(char))
    .replace(/[\\<>]/g, "\\$&")}>`
}

export function serializeLinkTitle(title: string): string {
  return title.replace(/[\\"]/g, "\\$&")
}
