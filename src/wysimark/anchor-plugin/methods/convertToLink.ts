import { Editor, Transforms } from "slate"

import { BetterAt, findElementUp } from "../../sink"
import { wikiLinkDisplayText, wikiLinkHref } from "../../convert/obsidian-links"
import { AnchorElement } from ".."
import { ImageBlockElement, ImageInlineElement } from "../../image-plugin/types"

/**
 * Replace the internal embed with an internal link anchor (`[[spec]]`), then
 * select it so the anchor edit dialog flow can take over.
 */
export function convertToLink(
  editor: Editor,
  spec: string,
  { at }: { at?: BetterAt }
) {
  const entry = findElementUp<ImageInlineElement | ImageBlockElement>(
    editor,
    ["image-inline", "image-block"],
    { at }
  )
  if (!entry) return false
  const [element, path] = entry
  const display = wikiLinkDisplayText(spec)
  const anchor: AnchorElement = {
    type: "anchor",
    href: wikiLinkHref(spec),
    children: [{ text: display }],
  }

  if (element.type === "image-block") {
    Editor.withoutNormalizing(editor, () => {
      Transforms.removeNodes(editor, { at: path })
      Transforms.insertNodes(
        editor,
        {
          type: "paragraph",
          children: [{ text: "" }, anchor, { text: "" }],
        },
        { at: path }
      )
    })
    const anchorPath = [...path, 1]
    Transforms.select(editor, anchorPath)
    return [anchor, anchorPath] as const
  }

  Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, { at: path })
    Transforms.insertNodes(editor, anchor, { at: path })
  })
  Transforms.select(editor, path)
  return [anchor, path] as const
}
