import styled from "@emotion/styled"
import { useCallback, useRef } from "react"
import type { MouseEvent } from "react"
import { Transforms } from "slate"
import { ReactEditor, useSelected, useSlateStatic } from "slate-react"

import { wikiEmbedSpecFromUrl } from "../../convert/obsidian-links"
import { CloseIcon, PencilIcon } from "../../anchor-plugin/render-element/icons"
import { AnchorEditDialog } from "../../anchor-plugin/render-element/AnchorEditDialog"
import { t } from "../../utils/translations"
import { useLayer } from "../../use-layer"
import { ImageBlockElement, ImageInlineElement } from "../types"

const $WikiEmbed = styled("span")`
  position: relative;
  display: inline-block;

  .--wiki-embed-toolbar {
    position: absolute;
    top: 0.25em;
    right: 0.25em;
    display: flex;
    gap: 0.125em;
    padding: 0.125em;
    border-radius: 0.25em;
    background: var(--shade-100);
    box-shadow: 0 1px 2px rgb(0 0 0 / 12%);
  }

  .--wiki-embed-toolbar button {
    display: flex;
    align-items: center;
    border: 0;
    border-radius: 0.1875em;
    padding: 0.1875em;
    color: var(--shade-500);
    background: transparent;
    cursor: pointer;
  }

  .--wiki-embed-toolbar button:hover {
    color: var(--shade-700);
    background: white;
  }
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
  const editor = useSlateStatic()
  const selected = useSelected()
  const dialog = useLayer("dialog")
  const embedRef = useRef<HTMLSpanElement>(null)
  const startEdgeRef = useRef<HTMLSpanElement>(null)
  const renderInternalEmbed = editor.wysimark.renderInternalEmbed
  const spec = wikiEmbedSpecFromUrl(element.url)

  const handleEdit = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const fallbackAnchor = embedRef.current
    const fallbackStartEdge = startEdgeRef.current
    if (!fallbackAnchor || !fallbackStartEdge) return
    const at = ReactEditor.findPath(editor, element)
    const result = editor.anchor.convertToLink(spec, { at })
    if (!result) return
    const [anchor] = result
    setTimeout(() => {
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

  const handleRemove = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const at = ReactEditor.findPath(editor, element)
    Transforms.removeNodes(editor, { at })
  }

  return (
    <$WikiEmbed ref={embedRef} contentEditable={false} onMouseDown={handleEdit}>
      <span ref={startEdgeRef} style={{ display: "none" }} />
      {renderInternalEmbed?.(spec)}
      {selected ? (
        <span className="--wiki-embed-toolbar">
          <button type="button" title={t("edit")} onMouseDown={handleEdit}>
            <PencilIcon width="1em" height="1em" />
          </button>
          <button type="button" title={t("remove")} onMouseDown={handleRemove}>
            <CloseIcon width="1em" height="1em" />
          </button>
        </span>
      ) : null}
    </$WikiEmbed>
  )
}
