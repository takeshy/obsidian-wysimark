// import remarkParse from "remark-parse"
// import { unified } from "unified"

export { parse } from "./parse"
export { serialize } from "./serialize"
export { unescapeMarkdown } from "./utils"

/**
 * Takes a Markdown string as input and returns a remarkParse AST
 */
// export function parse(markdown: string) {
//   const value = unified().use(remarkParse).parse(markdown)
//   return value
// }
