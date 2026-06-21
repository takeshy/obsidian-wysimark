import { useEffect, useMemo, useRef } from "react"
import { Editor, Transforms } from "slate"
import { ReactEditor, useSlateStatic } from "slate-react"
import { EditableProps } from "slate-react/dist/components/editable"

import { SinkEditor } from "../types"
import { createDecorate } from "./create-decorate"
import { createEditable } from "./create-editable"
import {
  createOnDrop,
  createOnKeyDown,
  createOnKeyUp,
  createOnPaste,
} from "./create-handler"
import { createRenderElement } from "./create-render-element"
import { createRenderLeaf } from "./create-render-leaf"
import { createRenderPlaceholder } from "./create-render-placeholder"
export { SinkReset } from "./styles"

type DOMBeforeInputHandler = NonNullable<EditableProps["onDOMBeforeInput"]>
type InputHandler = NonNullable<EditableProps["onInput"]>

// Matches any non-ASCII character (code point above U+007F).
const hasNonAsciiText = (text: string): boolean =>
  /[\u{80}-\u{10FFFF}]/u.test(text)

function selectDOMTargetRange(editor: Editor, event: InputEvent): void {
  const [targetRange] = event.getTargetRanges()

  if (!targetRange) return

  try {
    const range = ReactEditor.toSlateRange(
      editor as unknown as ReactEditor,
      targetRange,
      {
        exactMatch: false,
        suppressThrow: false,
      }
    )
    Transforms.select(editor, range)
  } catch {
    // Keep the current Slate selection if the browser target range is stale.
  }
}

function createOnDOMBeforeInput(
  originalFn: DOMBeforeInputHandler | undefined,
  editor: Editor,
  skipInputTextRef: React.RefObject<string | null>
): DOMBeforeInputHandler {
  return (event) => {
    const originalResult = originalFn?.(event)

    if (originalResult != null || event.defaultPrevented) return originalResult
    if (event.inputType !== "insertText") return originalResult
    if (event.isComposing) return originalResult
    if (typeof event.data !== "string" || event.data.length === 0) {
      return originalResult
    }
    if (!hasNonAsciiText(event.data)) return originalResult

    selectDOMTargetRange(editor, event)
    event.preventDefault()
    Editor.insertText(editor, event.data)
    skipInputTextRef.current = event.data
    return true
  }
}

function createOnInput(
  originalFn: InputHandler | undefined,
  editor: Editor,
  skipInputTextRef: React.RefObject<string | null>
): InputHandler {
  return (event) => {
    const originalResult = originalFn?.(event)

    if (originalResult != null || event.defaultPrevented) return originalResult

    const nativeEvent = event.nativeEvent

    if (!nativeEvent.instanceOf(InputEvent)) return originalResult
    if (nativeEvent.inputType !== "insertText") return originalResult
    if (nativeEvent.isComposing) return originalResult
    if (
      typeof nativeEvent.data !== "string" ||
      nativeEvent.data.length === 0
    ) {
      return originalResult
    }
    if (!hasNonAsciiText(nativeEvent.data)) return originalResult

    if (skipInputTextRef.current === nativeEvent.data) {
      skipInputTextRef.current = null
      return originalResult
    }

    Editor.insertText(editor, nativeEvent.data)
    return originalResult
  }
}

/**
 * In Editable, we use the Slate context to grab the right things from
 * the editor.
 */
export function SinkEditable(originalProps: EditableProps): React.ReactElement {
  const editor = useSlateStatic() as unknown as Editor & SinkEditor
  const skipInputTextRef = useRef<string | null>(null)

  /**
   * We ask Slate to normalize the editor once at the very start.
   *
   * This is helpful for plugins that need to store some useful state in the
   * document and to add or fix certain parts of the document. Not all of
   * these values are stored in the saved documents.
   *
   * Some examples:
   *
   * - inserting collapsible paragraphs between void components. These should
   *   not be saved.
   *
   * - Add column and row indexes to help with rendering which should not
   *   be saved.
   *
   * Ideally, we wouldn't have to do any of this but pragmatically, it is
   * the most performant route.
   *
   * Once we normalize the document once, the document is kept up to date
   * through regular normalizing steps that are more performance because
   * they only check changed nodes.
   */
  useEffect(() => {
    Editor.normalize(editor, { force: true })
  }, [editor])

  const { plugins } = editor.sink

  const nextProps: EditableProps = useMemo(
    () => ({
      ...originalProps,
      decorate: createDecorate(originalProps.decorate, plugins),
      renderElement: createRenderElement(originalProps.renderElement, plugins),
      renderLeaf: createRenderLeaf(originalProps.renderLeaf, plugins),
      renderPlaceholder: createRenderPlaceholder(
        originalProps.renderPlaceholder,
        plugins
      ),
      /**
       * NOTE: We skip `onKeyUp` as it is deprecated. If somebody needs it in new
       * code, we can add it back in.
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/Element/keypress_event
       */
      onKeyDown: createOnKeyDown(originalProps.onKeyDown, plugins),
      onKeyUp: createOnKeyUp(originalProps.onKeyUp, plugins),
      onPaste: createOnPaste(originalProps.onPaste, plugins),
      onDrop: createOnDrop(originalProps.onDrop, plugins),
      onDOMBeforeInput: createOnDOMBeforeInput(
        originalProps.onDOMBeforeInput,
        editor,
        skipInputTextRef
      ),
      onInput: createOnInput(originalProps.onInput, editor, skipInputTextRef),
    }),
    [
      originalProps.decorate,
      originalProps.renderElement,
      originalProps.renderLeaf,
      originalProps.renderPlaceholder,
      originalProps.onKeyDown,
      originalProps.onKeyUp,
      originalProps.onPaste,
      originalProps.onDrop,
      originalProps.onDOMBeforeInput,
      originalProps.onInput,
      originalProps.placeholder,
      originalProps.className,
      editor,
      plugins,
    ]
  )

  const NextEditable = useMemo(() => createEditable(plugins), [plugins])

  /**
   * NOTE:
   *
   * The following code is used to see if we are getting unnecessary re-renders.
   *
   * Comment it out when we are happy.
   *
   * - We SHOULD see `SinkeEditable render` whenever the markdown is updated
   * - We SHOULD NOT see `SinkEditable mount` or unmount at each update
   */
  // console.log("SinkEditable render")

  // console.log(Object.values(nextProps))

  // useEffect(() => {
  //   console.log("SinkEditable mount")
  //   return () => {
  //     console.log("SinkEditable unmount")
  //   }
  // }, [NextEditable, nextProps])

  return <NextEditable {...nextProps} />
}
