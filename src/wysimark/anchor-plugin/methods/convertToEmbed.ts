import { Editor, Transforms } from "slate"

import { BetterAt, findElementUp } from "../../sink"
import { wikiEmbedUrl } from "../../convert/obsidian-links"

/**
 * Replace the anchor at `at` with an internal embed (`![[spec]]`), rendered as
 * an inline image element whose url is a `wysimark:wiki-embed:` URL.
 */
export function convertToEmbed(
  editor: Editor,
  spec: string,
  { at }: { at?: BetterAt }
) {
  const link = findElementUp(editor, "anchor", { at })
  if (!link) return false
  const [, path] = link
  Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, { at: path })
    Transforms.insertNodes(
      editor,
      {
        type: "image-inline",
        url: wikiEmbedUrl(spec),
        alt: spec,
        children: [{ text: "" }],
      },
      { at: path }
    )
  })
  return true
}
