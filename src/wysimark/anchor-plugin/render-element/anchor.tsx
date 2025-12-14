import { clsx } from "clsx"
import React from "react"
import { useCallback, useEffect, useRef } from "react"
import { useSelected, useSlate } from "slate-react"

import { ConstrainedRenderElementProps } from "../../sink"

import { useLayer } from "../../use-layer"
import { AnchorElement } from "../index"
import { $Anchor, $Edge } from "../styles"
import { AnchorDialog } from "./AnchorDialog"

export function Anchor({
  element,
  attributes,
  children,
}: ConstrainedRenderElementProps<AnchorElement>) {
  const startEdgeRef = useRef<HTMLSpanElement>(null)
  const anchorRef = useRef<HTMLAnchorElement>(null)
  const selected = useSelected()
  const editor = useSlate()
  const dialog = useLayer("dialog")

  // Open dialog on touch (for iOS)
  const openDialog = useCallback(() => {
    const anchor = anchorRef.current
    const startEdge = startEdgeRef.current
    if (!anchor || !startEdge) return

    dialog.open(() => (
      <AnchorDialog
        destAnchor={anchor}
        destStartEdge={startEdge}
        element={element}
      />
    ))
  }, [dialog, element])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Prevent default to avoid triggering click and navigation
    e.preventDefault()
    openDialog()
  }, [openDialog])

  /**
   * TODO:
   *
   * Finish implementing the anchor dialog.
   *
   * Stopped partway through because the entire document is being re-rendered
   * on every keypress.
   */

  useEffect(() => {
    const anchor = anchorRef.current
    const startEdge = startEdgeRef.current
    if (!anchor || !startEdge) return
    /**
     * NOTE: Do not use `focused && selected` here because when we click or
     * focus on the pop up dialogs themselves, this will cause the dialogs to
     * close.
     *
     * TODO: Figure out how to make the dialogs not close when clicking on them.
     *
     * It has to support these use cases:
     *
     * - Closes when user clicks somewhere in the document outside the link
     * - Stays open when user clicks on the dialog
     * - Stays open when user is in an input in the dialog
     * - Closes when the editor loses focus but stays open when the editor loses
     *   focus to the anchor dialog or the anchor edit dialog
     */
    // Only show dialog when the link is precisely selected (not part of a larger selection)
    const hasSelection = editor.selection &&
      editor.selection.anchor.offset !== editor.selection.focus.offset;

    if (selected && !hasSelection) {
      /**
       * The setTimeout delay is necessary when first clicking into the browser
       * and when switching from one link to another. Without it, the dialog
       * will not open.
       */
      setTimeout(() => {
        dialog.open(() => (
          <AnchorDialog
            destAnchor={anchor}
            destStartEdge={startEdge}
            element={element}
          />
        ))
      })
    } else {
      dialog.close()
    }
  }, [selected, element])

  return (
    <$Anchor
      className={clsx({ "--selected": selected })}
      href={element.href}
      target={element.target}
      {...attributes}
      ref={anchorRef}
      onTouchEnd={handleTouchEnd}
    >
      {/* Edge allow Chrome to differentiate in/out of the link */}
      <$Edge ref={startEdgeRef} contentEditable={false} />
      <span>{children}</span>
      {/* Edge allow Chrome to differentiate in/out of the link */}
      <$Edge contentEditable={false} />
    </$Anchor>
  )
}
