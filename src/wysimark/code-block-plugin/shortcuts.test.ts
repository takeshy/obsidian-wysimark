import "./shortcut-test-environment"

import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createEditor, Editor, Node, Transforms } from "slate"

import { CodeBlockPlugin } from "."
import { CollapsibleParagraphPlugin } from "../collapsible-paragraph-plugin"
import { ConvertElementPlugin } from "../convert-element-plugin"
import { HeadingPlugin } from "../heading-plugin"
import { MarksPlugin } from "../marks-plugin"
import { NormalizeAfterDeletePlugin } from "../normalize-after-delete-plugin"
import { createSink } from "../sink"
import { createOnKeyDown } from "../sink/editable/create-handler"

function makeEditor(disableCodeBlock = false) {
  const { withSink } = createSink([
    ConvertElementPlugin, HeadingPlugin, MarksPlugin, CodeBlockPlugin,
    NormalizeAfterDeletePlugin, CollapsibleParagraphPlugin,
  ])
  const base = createEditor()
  base.wysimark = { disableCodeBlock }
  const editor = withSink(base, {} as never)
  editor.children = [{ type: "paragraph", children: [{ text: "hello" }] }]
  Transforms.select(editor, Editor.end(editor, [0]))
  return editor
}

function press(editor: Editor, key: string, which: number, modifiers: { altKey?: boolean; shiftKey?: boolean }) {
  let prevented = false
  const event = {
    nativeEvent: { key, which, metaKey: true, ctrlKey: false, altKey: false, shiftKey: false, ...modifiers },
    preventDefault: () => { prevented = true },
    stopPropagation: () => {},
  }
  createOnKeyDown(undefined, editor.sink.plugins)(event as never)
  return prevented
}

describe("Mac block shortcuts", () => {
  it("Cmd+Option+0 converts a heading to a paragraph and clears marks", () => {
    const editor = makeEditor()
    editor.children = [{ type: "heading", level: 2, children: [{ text: "hello", bold: true }] }]
    Transforms.select(editor, Editor.range(editor, [0]))

    assert.equal(press(editor, "0", 48, { altKey: true }), true)
    assert.deepEqual(editor.children, [{ type: "paragraph", children: [{ text: "hello" }] }])
  })

  for (const [key, which, modifiers] of [
    ["N", 78, { shiftKey: true }],
    ["`", 192, { altKey: true }],
  ] as const) {
    it(`toggles a code block off on a second ${key} shortcut`, () => {
      const editor = makeEditor()
      assert.equal(press(editor, key, which, modifiers), true)
      assert.equal(editor.children.filter((node) => "type" in node && node.type === "code-block").length, 1)
      assert.equal(press(editor, key, which, modifiers), true)
      assert.equal(editor.children.some((node) => "type" in node && node.type === "code-block"), false)
      assert.equal(Node.string(editor), "hello")
      assert.ok(editor.selection)
      assert.doesNotThrow(() => Editor.node(editor, editor.selection!.anchor.path))
    })
  }

  it("preserves lines and the cursor when toggling a nonempty code block off", () => {
    const editor = makeEditor()
    editor.children = [{ type: "code-block", language: "text", children: [
      { type: "code-block-line", children: [{ text: "first" }] },
      { type: "code-block-line", children: [{ text: "" }] },
      { type: "code-block-line", children: [{ text: "third" }] },
    ] }]
    Transforms.select(editor, { path: [0, 2, 0], offset: 2 })
    press(editor, "N", 78, { shiftKey: true })
    assert.deepEqual(editor.children, [{ type: "paragraph", children: [{ text: "first\n\nthird" }] }])
    assert.deepEqual(editor.selection?.anchor, { path: [0, 0], offset: 9 })
  })

  it("Cmd+Option+0 also restores a code block to a normal paragraph", () => {
    const editor = makeEditor()
    press(editor, "N", 78, { shiftKey: true })
    assert.equal(press(editor, "0", 48, { altKey: true }), true)
    assert.equal(editor.children.some((node) => "type" in node && node.type === "code-block"), false)
  })

  it("does not handle code shortcuts when code blocks are disabled", () => {
    const editor = makeEditor(true)
    assert.equal(press(editor, "N", 78, { shiftKey: true }), false)
    assert.equal(press(editor, "`", 192, { altKey: true }), false)
  })

  it("keeps selected text when applying and removing a code block", () => {
    const editor = makeEditor()
    Transforms.select(editor, Editor.range(editor, [0]))
    press(editor, "N", 78, { shiftKey: true })
    assert.equal(Node.string(editor), "hello")
    press(editor, "N", 78, { shiftKey: true })
    assert.equal(editor.children.some((node) => "type" in node && node.type === "code-block"), false)
    assert.equal(Node.string(editor), "hello")
  })

  for (const texts of [["first", "second"], ["first", "", "second"], ["first\nline", "second"]]) {
    it(`preserves selected paragraph boundaries for ${JSON.stringify(texts)}`, () => {
      const editor = makeEditor()
      editor.children = texts.map((text) => ({
        type: "paragraph", children: [{ text }],
      }))
      Transforms.select(editor, Editor.range(editor, []))

      press(editor, "N", 78, { shiftKey: true })
      const [block] = Editor.nodes(editor, {
        at: [], match: (node) => "type" in node && node.type === "code-block",
      })
      assert.ok(block)
      assert.deepEqual(block[0], {
        type: "code-block", language: "text",
        children: texts.join("\n").split("\n").map((text) => ({
          type: "code-block-line", children: [{ text }],
        })),
      })
      press(editor, "N", 78, { shiftKey: true })
      assert.equal(Node.string(editor), texts.join("\n"))
      assert.equal(editor.children.some((node) => "type" in node && node.type === "code-block"), false)
    })
  }

  it("preserves boundaries in a backwards selection across partial paragraphs", () => {
    const editor = makeEditor()
    editor.children = [
      { type: "paragraph", children: [{ text: "before first" }] },
      { type: "paragraph", children: [{ text: "second after" }] },
    ]
    Transforms.select(editor, {
      anchor: { path: [1, 0], offset: 6 },
      focus: { path: [0, 0], offset: 7 },
    })
    press(editor, "N", 78, { shiftKey: true })
    const [block] = Editor.nodes(editor, {
      at: [], match: (node) => "type" in node && node.type === "code-block",
    })
    assert.ok(block)
    assert.deepEqual(block[0], {
      type: "code-block", language: "text",
      children: [
        { type: "code-block-line", children: [{ text: "first" }] },
        { type: "code-block-line", children: [{ text: "second" }] },
      ],
    })
    assert.equal(Node.string(editor), "before firstsecond after")
  })
})
