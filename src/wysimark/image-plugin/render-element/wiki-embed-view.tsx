import styled from "@emotion/styled"
import { useCallback, useEffect, useRef } from "react"
import { Transforms } from "slate"
import { ReactEditor, useSelected, useSlate } from "slate-react"

import { wikiEmbedSpecFromUrl, wikiLinkTarget } from "../../convert/obsidian-links"
import { AnchorDialog } from "../../anchor-plugin/render-element/AnchorDialog"
import { AnchorEditDialog } from "../../anchor-plugin/render-element/AnchorEditDialog"
import { useLayer } from "../../use-layer"
import { ImageBlockElement, ImageInlineElement } from "../types"

const $WikiEmbed = styled("span")`
  position: relative;
  display: inline-block;
`

/**
 * Renders a wiki embed (`![[spec]]`) using the host's `renderInternalEmbed`.
 * When the embed is selected, a small toolbar lets the user edit it (convert
 * back to a link so the anchor edit dialog can take over) or remove it.
 */
export function WikiEmbedView({
  element,
}: {
  element: ImageInlineElement | ImageBlockElement
}) {
  const editor = useSlate()
  const selected = useSelected()
  const dialog = useLayer("dialog")
  const embedRef = useRef<HTMLSpanElement>(null)
  const startEdgeRef = useRef<HTMLSpanElement>(null)
  const renderInternalEmbed = editor.wysimark.renderInternalEmbed
  const spec = wikiEmbedSpecFromUrl(element.url)

  const handleEdit = useCallback(() => {
    const fallbackAnchor = embedRef.current
    const fallbackStartEdge = startEdgeRef.current
    if (!fallbackAnchor || !fallbackStartEdge) return
    const at = ReactEditor.findPath(editor, element)
    const result = editor.anchor.convertToLink(spec, { at })
    if (!result) return
    const [anchor] = result
    window.setTimeout(() => {
      let anchorNode: HTMLElement = fallbackAnchor
      try {
        anchorNode = ReactEditor.toDOMNode(editor, anchor)
      } catch {
        /* Fall back to the embed position if React has not rendered the anchor yet. */
      }
      const startEdge =
        anchorNode.querySelector<HTMLElement>('[contenteditable="false"]') ||
        fallbackStartEdge
      dialog.open(() => (
        <AnchorEditDialog
          destAnchor={anchorNode}
          destStartEdge={startEdge}
          element={anchor}
          initialEmbed
          onCancel={() => {
            editor.anchor.convertToEmbed(spec, { at: anchor })
            dialog.close()
          }}
        />
      ))
    })
  }, [dialog, editor, element, spec])

  const handleRemove = useCallback(() => {
    const at = ReactEditor.findPath(editor, element)
    Transforms.removeNodes(editor, { at })
  }, [editor, element])

  useEffect(() => {
    const anchor = embedRef.current
    const startEdge = startEdgeRef.current
    if (!anchor || !startEdge) return
    const hasSelection =
      editor.selection &&
      editor.selection.anchor.offset !== editor.selection.focus.offset
    if (selected && !hasSelection) {
      window.setTimeout(() => {
        dialog.open(() => (
          <AnchorDialog
            destAnchor={anchor}
            destStartEdge={startEdge}
            embed={{
              target: wikiLinkTarget(spec),
              onEdit: handleEdit,
              onRemove: handleRemove,
            }}
          />
        ))
      })
    } else {
      dialog.close()
    }
  }, [selected, spec])

  return (
    <$WikiEmbed ref={embedRef} contentEditable={false}>
      <span ref={startEdgeRef} style={{ display: "none" }} />
      {renderInternalEmbed?.(spec)}
    </$WikiEmbed>
  )
}
