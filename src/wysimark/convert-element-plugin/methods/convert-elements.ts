import { Editor, Element, Node, Path, Point, Range, Transforms } from "slate"

import { rewrapElement, TargetElement } from "../../sink"

/**
 * Calculates the character offset of a point within an element.
 * Returns -1 if the point is not within the element.
 */
function getOffsetInElement(
  editor: Editor,
  point: Point,
  elementPath: Path
): number {
  try {
    const elementStart = Editor.start(editor, elementPath)
    const elementEnd = Editor.end(editor, elementPath)

    // Check if point is within element
    if (Point.isBefore(point, elementStart) || Point.isAfter(point, elementEnd)) {
      return -1
    }

    // Calculate offset from element start to point
    const range = { anchor: elementStart, focus: point }
    return Editor.string(editor, range).length
  } catch {
    return -1
  }
}

/**
 * Restores the selection to a specific offset within an element.
 */
function restoreSelectionInElement(
  editor: Editor,
  elementPath: Path,
  offset: number
): void {
  try {
    const element = Node.get(editor, elementPath)
    if (!Element.isElement(element)) return

    const text = Node.string(element)
    const safeOffset = Math.min(offset, text.length)

    // Find the exact point at the offset
    const elementStart = Editor.start(editor, elementPath)
    let currentOffset = 0
    let targetPath = elementStart.path
    let targetOffset = 0

    // Traverse through text nodes to find the correct position
    for (const [node, path] of Node.texts(element)) {
      const nodeLength = node.text.length
      if (currentOffset + nodeLength >= safeOffset) {
        targetPath = [...elementPath, ...path.slice(elementPath.length)]
        targetOffset = safeOffset - currentOffset
        break
      }
      currentOffset += nodeLength
    }

    const point: Point = { path: targetPath, offset: targetOffset }
    Transforms.select(editor, { anchor: point, focus: point })
  } catch {
    // If restoration fails, don't crash
  }
}

/**
 * A type with generic for `convertElements` (below) to be used with the curry
 * method. TypeScript, unfortunately, cannot automatically curry generics for
 * us so we have to do it manually.
 */
export type CurriedConvertElements = <T extends Element = Element>(
  matchForToggle: (element: Element) => boolean,
  targetElement: TargetElement<T>,
  allowToggle: boolean
) => void

/**
 * Checks if an element contains newline characters in its text content
 */
function elementContainsNewlines(element: Element): boolean {
  const text = Node.string(element)
  return text.includes("\n")
}

/**
 * Given a selection range and an element, determines which line indices are selected.
 * Returns an object with startLineIndex and endLineIndex.
 */
function getSelectedLineIndices(
  editor: Editor,
  element: Element,
  elementPath: Path,
  selection: Range
): { startLineIndex: number; endLineIndex: number } {
  const text = Node.string(element)
  const lines = text.split("\n")

  // Get the start and end points relative to this element
  const elementStart = Editor.start(editor, elementPath)
  const elementEnd = Editor.end(editor, elementPath)

  // Clamp selection to element boundaries
  const start = Point.isBefore(selection.anchor, elementStart)
    ? elementStart
    : Point.isAfter(selection.anchor, elementEnd)
      ? elementEnd
      : selection.anchor
  const end = Point.isBefore(selection.focus, elementStart)
    ? elementStart
    : Point.isAfter(selection.focus, elementEnd)
      ? elementEnd
      : selection.focus

  // Calculate offsets from element start
  const startOffset = Math.min(
    Editor.string(editor, { anchor: elementStart, focus: start }).length,
    text.length
  )
  const endOffset = Math.min(
    Editor.string(editor, { anchor: elementStart, focus: end }).length,
    text.length
  )

  const minOffset = Math.min(startOffset, endOffset)
  const maxOffset = Math.max(startOffset, endOffset)

  // Find which lines contain these offsets
  let currentOffset = 0
  let startLineIndex = 0
  let endLineIndex = lines.length - 1

  for (let i = 0; i < lines.length; i++) {
    const lineEnd = currentOffset + lines[i].length
    if (currentOffset <= minOffset && minOffset <= lineEnd) {
      startLineIndex = i
    }
    if (currentOffset <= maxOffset && maxOffset <= lineEnd) {
      endLineIndex = i
      break
    }
    currentOffset = lineEnd + 1 // +1 for newline
  }

  return { startLineIndex, endLineIndex }
}

/**
 * Splits an element at cursor/selection line boundaries.
 * Only splits out the lines that are selected, keeping other lines in original element.
 * Returns the path of the selected line(s) block.
 */
function splitElementAtSelectedLines(
  editor: Editor,
  element: Element,
  path: Path,
  selection: Range
): Path {
  const text = Node.string(element)
  if (!text.includes("\n")) {
    return path
  }

  const lines = text.split("\n")
  if (lines.length <= 1) {
    return path
  }

  const { startLineIndex, endLineIndex } = getSelectedLineIndices(
    editor,
    element,
    path,
    selection
  )

  // Lines before selection, selected lines, and lines after selection
  const beforeLines = lines.slice(0, startLineIndex)
  const selectedLines = lines.slice(startLineIndex, endLineIndex + 1)
  const afterLines = lines.slice(endLineIndex + 1)

  // If all lines are selected, no need to split
  if (beforeLines.length === 0 && afterLines.length === 0) {
    return path
  }

  Editor.withoutNormalizing(editor, () => {
    const basePath = path.slice(0, -1)
    const baseIndex = path[path.length - 1]

    // Insert after lines as new element (if any) - do this first as it goes after
    if (afterLines.length > 0) {
      const afterText = afterLines.join("\n")
      const afterElement: Element = {
        ...element,
        children: [{ text: afterText }],
      } as Element
      Transforms.insertNodes(editor, afterElement, {
        at: [...basePath, baseIndex + 1],
      })
    }

    // Update original element to contain only before lines + selected lines
    const childrenCount = element.children.length
    for (let j = childrenCount - 1; j >= 0; j--) {
      Transforms.removeNodes(editor, { at: [...path, j] })
    }

    if (beforeLines.length > 0) {
      // Original element keeps before lines
      Transforms.insertNodes(
        editor,
        { text: beforeLines.join("\n") },
        { at: [...path, 0] }
      )

      // Insert selected lines as new element after before lines
      const selectedText = selectedLines.join("\n")
      const selectedElement: Element = {
        type: "paragraph",
        children: [{ text: selectedText }],
      }
      Transforms.insertNodes(editor, selectedElement, {
        at: [...basePath, baseIndex + 1],
      })
    } else {
      // No before lines, original element becomes selected lines
      Transforms.insertNodes(
        editor,
        { text: selectedLines.join("\n") },
        { at: [...path, 0] }
      )
    }
  })

  // Return the path of the selected lines block
  if (beforeLines.length > 0) {
    return [...path.slice(0, -1), path[path.length - 1] + 1]
  }
  return path
}

/**
 * The `convertElements` takes a Block Element that has been identified as being
 * convertible and converts it into another type of Element.
 *
 * For example:
 *
 * - headings
 * - list items
 *
 * It also allows for toggling. In this scenario, if all the convertible
 * elements are already in the target state (e.g. we are converting to a heading
 * 2 and all the convertible elemtns are already a heading 2) then the elements
 * will convert back to a `paragraph` element.
 *
 * NOTE:
 *
 * Why is there an unusual signature?
 *
 * This method has a somewhat unusual and not-DRY signature which is in the form
 * of having a `matchForToggle` (which allows us to specify when an Element is
 * already matching the `targetElement`) and also an `allowToggle`; however, we
 * could make `matchForToggle` optional and only `allowToggle` if it is
 * specified.
 *
 * That being said, the signature is set up this way to reduce friction when
 * creating a specific convert function like `convertHeading`. In this scenario,
 * we can have the created `convertHeading` pass through the argument to
 * `allowToggle` and pass it through to this `convertElements` function making
 * that code easier to understand.
 */
export function convertElements<T extends Element = Element>(
  editor: Editor,
  matchForToggle: (element: Element) => boolean,
  targetElement: TargetElement<T>,
  allowToggle: boolean
): boolean {
  const { selection } = editor
  if (!selection) return false

  /**
   * Save the cursor position (anchor offset) within the first convertible element
   * so we can restore it after conversion
   */
  let savedAnchorOffset = -1
  let savedFocusOffset = -1
  let isCollapsed = Range.isCollapsed(selection)

  /**
   * Find convertible elements
   */
  const entries = Array.from(
    Editor.nodes<Element>(editor, {
      match: (node) =>
        Element.isElement(node) &&
        editor.convertElement.isConvertibleElement(node),
    })
  )

  /**
   * Save cursor offset relative to the first entry before any transformations
   */
  if (entries.length > 0) {
    const [, firstPath] = entries[0]
    savedAnchorOffset = getOffsetInElement(editor, selection.anchor, firstPath)
    savedFocusOffset = getOffsetInElement(editor, selection.focus, firstPath)
  }
  /**
   * If there aren't any convertible elements, there's nothing to do
   */
  if (entries.length === 0) return false

  /**
   * Split elements that contain newlines at selected line boundaries
   * Process in reverse order to maintain path validity
   */
  const allPaths: Path[] = []
  Editor.withoutNormalizing(editor, () => {
    for (let i = entries.length - 1; i >= 0; i--) {
      const [element, path] = entries[i]
      if (elementContainsNewlines(element)) {
        const splitPath = splitElementAtSelectedLines(
          editor,
          element,
          path,
          selection
        )
        allPaths.unshift(splitPath)
      } else {
        allPaths.unshift(path)
      }
    }
  })

  /**
   * Re-fetch all elements at the updated paths
   */
  const updatedEntries: [Element, Path][] = allPaths
    .map((path) => {
      try {
        const node = Node.get(editor, path)
        if (Element.isElement(node)) {
          return [node, path] as [Element, Path]
        }
        return null
      } catch {
        return null
      }
    })
    .filter((entry): entry is [Element, Path] => entry !== null)

  if (updatedEntries.length === 0) return false

  /**
   * If `allowToggle` is `true` and all of the convertible elements match the
   * `matchForToggle` (for example, if converting to a heading level 2, if all
   * the matching convertible elements are heading level 2) then we want to
   * toggle back to a paragraph.
   */
  const shouldToggle =
    allowToggle && updatedEntries.every((entry) => matchForToggle(entry[0]))

  if (shouldToggle) {
    /**
     * If all of the entries are already the target type, then revert them to
     * a paragraph
     */
    Editor.withoutNormalizing(editor, () => {
      for (const entry of updatedEntries) {
        rewrapElement(editor, { type: "paragraph" }, entry[1])
      }
    })
  } else {
    /**
     * If any of the entries aren't the target type, then convert them to the
     * target type.
     */
    Editor.withoutNormalizing(editor, () => {
      for (const entry of updatedEntries) {
        rewrapElement(editor, targetElement, entry[1])
      }
    })
  }

  /**
   * Restore cursor position after conversion.
   * Use the first updated entry's path to restore the cursor at the saved offset.
   */
  if (updatedEntries.length > 0 && savedAnchorOffset >= 0) {
    const [, firstPath] = updatedEntries[0]
    if (isCollapsed) {
      // For collapsed selection (cursor), just restore anchor position
      restoreSelectionInElement(editor, firstPath, savedAnchorOffset)
    } else if (savedFocusOffset >= 0) {
      // For expanded selection, restore both anchor and focus
      try {
        const element = Node.get(editor, firstPath)
        if (Element.isElement(element)) {
          const text = Node.string(element)
          const safeAnchorOffset = Math.min(savedAnchorOffset, text.length)
          const safeFocusOffset = Math.min(savedFocusOffset, text.length)

          const elementStart = Editor.start(editor, firstPath)

          // Calculate anchor point
          let anchorPath = elementStart.path
          let anchorOffset = safeAnchorOffset
          let currentOffset = 0
          for (const [node, path] of Node.texts(element)) {
            const nodeLength = node.text.length
            if (currentOffset + nodeLength >= safeAnchorOffset) {
              anchorPath = [...firstPath, ...path.slice(firstPath.length)]
              anchorOffset = safeAnchorOffset - currentOffset
              break
            }
            currentOffset += nodeLength
          }

          // Calculate focus point
          let focusPath = elementStart.path
          let focusOffset = safeFocusOffset
          currentOffset = 0
          for (const [node, path] of Node.texts(element)) {
            const nodeLength = node.text.length
            if (currentOffset + nodeLength >= safeFocusOffset) {
              focusPath = [...firstPath, ...path.slice(firstPath.length)]
              focusOffset = safeFocusOffset - currentOffset
              break
            }
            currentOffset += nodeLength
          }

          Transforms.select(editor, {
            anchor: { path: anchorPath, offset: anchorOffset },
            focus: { path: focusPath, offset: focusOffset },
          })
        }
      } catch {
        // Fall back to collapsed selection at anchor
        restoreSelectionInElement(editor, firstPath, savedAnchorOffset)
      }
    }
  }

  return true
}
