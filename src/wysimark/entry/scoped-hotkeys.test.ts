import assert from "node:assert/strict"
import { it } from "node:test"
import { createEditor, Editor, Transforms } from "slate"
import { createSink } from "../sink"
import { plugins } from "./plugins"
import { handleScopedHotkey } from "./scoped-hotkeys"

function makeEditor(mac: boolean) {
  Object.defineProperty(globalThis, "window", {
    value: { navigator: { platform: mac ? "MacIntel" : "Win32" } }, configurable: true,
  })
  const base = createEditor()
  base.wysimark = {}
  const editor = createSink(plugins).withSink(base, { toolbar: {}, image: {} } as never)
  editor.children = [{ type: "paragraph", children: [{ text: "hello" }] }]
  Transforms.select(editor, Editor.range(editor, [0]))
  return editor
}

function press(editor: Editor, key: string, mac: boolean, composing = false) {
  let prevented = false
  let stopped = false
  const event = {
    key, which: key.toUpperCase().charCodeAt(0), metaKey: mac, ctrlKey: !mac,
    altKey: false, shiftKey: false, isComposing: composing,
    preventDefault: () => { prevented = true },
    stopPropagation: () => { stopped = true },
  }
  const handled = handleScopedHotkey(editor, event as unknown as KeyboardEvent)
  return { handled, prevented, stopped }
}

for (const mac of [true, false]) {
  for (const [key, mark] of [["b", "bold"], ["i", "italic"], ["u", "underline"]] as const) {
    it(`${mac ? "Cmd" : "Ctrl"}+${key} toggles ${mark} before global Obsidian commands`, () => {
      const editor = makeEditor(mac)
      assert.deepEqual(press(editor, key, mac), { handled: true, prevented: true, stopped: true })
      assert.equal(Editor.marks(editor)?.[mark], true)
      press(editor, key, mac)
      assert.equal(Editor.marks(editor)?.[mark], undefined)
    })
  }
}

it("leaves unknown shortcuts and IME composition to the host", () => {
  const editor = makeEditor(true)
  for (const [key, composing] of [["q", false], ["b", true]] as const) {
    assert.deepEqual(press(editor, key, true, composing), { handled: false, prevented: false, stopped: false })
  }
})
