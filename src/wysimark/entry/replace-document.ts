import { Descendant, Editor, Transforms } from "slate"
import { HistoryEditor } from "slate-history"

/** Replace the document through operations so Slate can remap dirty paths. */
export function replaceDocument(editor: Editor, children: Descendant[]): void {
  const replace = () => {
    Editor.withoutNormalizing(editor, () => {
      editor.selection = null
      Transforms.removeNodes(editor, {
        at: [],
        match: (_node, path) => path.length === 1,
      })
      Transforms.insertNodes(editor, children, { at: [0] })
    })

    if (editor.children.length > 0) {
      Transforms.select(editor, Editor.start(editor, [0]))
    }
  }

  if (HistoryEditor.isHistoryEditor(editor)) {
    HistoryEditor.withoutSaving(editor, replace)
    editor.history.undos = []
    editor.history.redos = []
  } else {
    replace()
  }
}
