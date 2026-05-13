import { createPortal } from "react-dom"

/**
 * Portal to the active document body.
 *
 * NOTE:
 * Consider creating a version of Portal with a Reset in it.
 *
 * The reason is that when showing a portal, it will carry the baggage of
 * any styling from `<html>` and `<body>` element.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  if (typeof activeDocument === "undefined" || !activeDocument.body) return null
  return createPortal(children, activeDocument.body)
}
