import { Rect } from "../types"

/**
 * Takes a source Rect of the Element you are trying to position and makes
 * sure it is inside the container Rect.
 *
 * The source Rect can be `null` (e.g. when the `ref` hasn't been set yet) and
 * while it is, the item is positioned far off to the left of the screen.
 *
 * Can specify an optional `margin` as well.
 */
export function positionInside(
  src: Rect | null,
  container: Rect,
  pos: { left: number; top: number },
  { margin = 0 }: { margin?: number } = {}
) {
  if (src == null) return { ...pos, left: -1024 }

  const { top } = pos
  let { left } = pos

  const containerWidth = container.right - container.left - margin * 2

  // If modal is wider than container, align to left edge
  if (src.width >= containerWidth) {
    left = container.left + margin
  } else {
    // Check if it goes beyond right edge
    const right = left + src.width
    if (right > container.right - margin) {
      left = container.right - src.width - margin
    }

    // Check if it goes beyond left edge
    if (left < container.left + margin) {
      left = container.left + margin
    }
  }

  return { left, top }
}
