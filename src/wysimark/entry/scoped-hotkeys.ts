import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import type { Editor } from "slate"

/** Run editor shortcuts before Obsidian's global commands consume them. */
export function handleScopedHotkey(editor: Editor, event: KeyboardEvent): boolean {
  if (event.isComposing || (!event.metaKey && !event.ctrlKey)) return false
  const synthetic = {
    nativeEvent: event,
    key: event.key,
    code: event.code,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    preventDefault: () => event.preventDefault(),
    stopPropagation: () => event.stopPropagation(),
  } as ReactKeyboardEvent<HTMLDivElement>
  for (const plugin of editor.sink.plugins) {
    if (plugin.editableProps?.onKeyDown?.(synthetic)) return true
  }
  return false
}
