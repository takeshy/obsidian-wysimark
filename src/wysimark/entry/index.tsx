import throttle from "lodash.throttle"
import { useCallback, useRef } from "react"
import { Descendant, Editor, Element, Transforms } from "slate"
import { RenderLeafProps, Slate } from "slate-react"

import { parse, serialize, escapeUrlSlashes } from "../convert"
import { SinkEditable } from "./SinkEditable"
import { useEditor } from "./useEditor"

export type { Element, Text } from "./plugins"

export { useEditor }

function renderLeaf({ children, attributes }: RenderLeafProps) {
  return <span {...attributes}>{children}</span>
}

/**
 * Handler for saving image files to vault
 * @param file - The file to save
 * @param path - The path within the vault to save the file
 * @returns The final path/reference to use in markdown
 */
export type OnImageSaveHandler = (file: File, path: string) => Promise<string>

export type EditableProps = {
  // editor: BaseEditor & ReactEditor & HistoryEditor & SinkEditor & WysimarkEditor
  editor: Editor
  value: string
  onChange: (markdown: string) => void
  throttleInMs?: number
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  onImageSave?: OnImageSaveHandler
} // & Omit<React.TextareaHTMLAttributes<HTMLDivElement>, "onChange">

export function Editable({
  editor,
  value,
  onChange,
  throttleInMs = 1000,
  placeholder,
  className,
  style,
  onImageSave,
}: EditableProps) {
  const ignoreNextChangeRef = useRef<boolean>(false)

  /**
   * This is a temporary ref that is only used once to store the initial value
   * derived from the initial Markdown value.
   */
  const initialValueRef = useRef<Descendant[] | undefined>(undefined)

  /**
   * Track the previous value of the editor. This is used to determine if the
   * change from the editor resulted in a change in the contents of the editor
   * as opposed to just a cursor movement for example.
   */
  const prevValueRef = useRef<Descendant[] | undefined>(undefined)

  /**
   * Track the last value emitted via onChange. This is used to prevent
   * unnecessary reparsing when the parent component sets value to what
   * we just emitted.
   */
  const lastEmittedValueRef = useRef<string | undefined>(undefined)

  /**
   * Throttled version of `onChange` for the `Slate` component. This method gets
   * called on every change to the editor except for:
   *
   * - The first call to `onChange` when the component is mounted which would
   *   be in response to the initial normalization pass that is always run to
   *   make sure the content is in a good state.
   * - When the incoming value (markdown) to the editor is changed and we force
   *   the editor to update its value after doing a `parse` on the markdown.
   *   We don't want the `onChange` callback to be called for this because if
   *   the change came from an edit to a textarea, for example, it would
   *   serialize the editor and the value of the textarea would be updated with
   *   a slightly different value. This would cause the selection to jump. This
   *   is especially bad if the cursor is at the end of a line and the user
   *   presses the spacebar. This is because Markdown does not support spaces
   *   at the end of a line and the space would be removed and the cursor would
   *   have nowhere to be.
   */
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const onThrottledSlateChange = useCallback(
    throttle(
      () => {
        const markdown = serialize(editor.children as Element[])
        editor.wysimark.prevValue = {
          markdown,
          children: editor.children,
        }
        lastEmittedValueRef.current = markdown
        onChangeRef.current(markdown)
      },
      throttleInMs,
      { leading: false, trailing: true }
    ),
    [editor, throttleInMs]
  )

  /**
   * This handles the initial `onChange` event from the `Slate` component and
   * makes sure to ignore any change events that don't change the content of
   * the editor. For example, if the user just moves the cursor around, we
   * don't want to call the `onChange` callback.
   *
   * If it's neither, then it passes the call to the throttled `onChange` method.
   */
  const onSlateChange = useCallback(
    (nextValue: Descendant[]) => {
      if (ignoreNextChangeRef.current) {
        ignoreNextChangeRef.current = false
        prevValueRef.current = nextValue
        return
      }
      if (prevValueRef.current === nextValue) {
        return
      }
      prevValueRef.current = nextValue
      onThrottledSlateChange()
    },
    [onThrottledSlateChange]
  )

  /**
   * Handle the initial mounting of the component. This is where we set the
   * initial value of the editor. We also set the `prevValue` on the editor
   * which is used to determine if a change in the editor resulted in a change
   * in the contents of the editor vs just changing the cursor position for
   * example.
   *
   * We add a check for `initialValueRef.current` not being null because the
   * ref can be lost on a hot reload. This then reinitializes the editor with
   * the initial value.
   *
   * NOTE: This value hasn't been normalized yet.
   */
  if (editor.wysimark.prevValue == null || initialValueRef.current == null) {
    ignoreNextChangeRef.current = true
    const valueToProcess = escapeUrlSlashes(value);
    const children = parse(valueToProcess)
    editor.children = children
    prevValueRef.current = initialValueRef.current = children
    editor.wysimark.prevValue = {
      markdown: value, // Store the original unescaped value
      children,
    }
    lastEmittedValueRef.current = value
  } else {
    /**
     * Handle the case where the `value` differs from the last `markdown` value
     * set in the Wysimark editor. If it differs, that means the change came
     * from somewhere else and we need to set the editor value.
     *
     * Apart from setting `editor.children` we also need to set the selection
     * to the start of the document. This is because the selection may be set
     * to an invalid value based on the new document value.
     *
     * We also check against `lastEmittedValueRef.current` to prevent race
     * conditions during throttle delays. When throttled onChange fires, the
     * parent component receives the new value and passes it back as a prop.
     * However, `editor.wysimark.prevValue.markdown` may not be updated yet
     * due to the trailing throttle behavior. By also checking against the
     * last emitted value, we avoid unnecessary reparsing.
     */
    const diffFromPrevValue = value !== editor.wysimark.prevValue.markdown
    const diffFromLastEmitted = value !== lastEmittedValueRef.current
    if (diffFromPrevValue && diffFromLastEmitted) {
      ignoreNextChangeRef.current = true
      const valueToProcess = escapeUrlSlashes(value);
      const documentValue = parse(valueToProcess)
      editor.children = documentValue
      editor.selection = null
      Transforms.select(editor, Editor.start(editor, [0]))
    }
  }

  const onSinkeEditableMouseDown = useCallback(() => {
    /**
     * Obsidian runs on Electron (Chromium-based), so no Firefox workaround needed.
     * Focus the editor on mouse down to ensure consistent behavior.
     */
  }, [editor])

  /**
   * When the user exits the editor, we want to call the `onChange` callback
   * immediately.
   */
  const onBlur = useCallback(() => {
    onThrottledSlateChange.flush()
  }, [onThrottledSlateChange])

  // Set the onImageSave handler on the editor
  editor.wysimark.onImageSave = onImageSave;

  return (
    <Slate
      editor={editor}
      initialValue={initialValueRef.current ?? editor.children}
      onChange={onSlateChange}
    >
      <SinkEditable
        renderLeaf={renderLeaf}
        onMouseDown={onSinkeEditableMouseDown}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        style={style}
      />
    </Slate>
  )
}
