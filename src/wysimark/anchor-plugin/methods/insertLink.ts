import { Editor, Element, Range, Text, Transforms } from "slate"

export function insertLink(
  editor: Editor,
  href: string,
  text: string = href,
  { select = true, title }: { select?: boolean; title?: string } = {}
) {
  /**
   * If there is no selection, we default by inserting at the start of document.
   */
  const selection = editor.selection || {
    anchor: Editor.start(editor, [0]),
    focus: Editor.start(editor, [0]),
  }
  if (Range.isCollapsed(selection)) {
    /**
     * Insert the node and select it if select is true
     */
    Transforms.insertNodes(
      editor,
      {
        type: "anchor",
        href,
        title,
        children: [{ text }],
      },
      { select, at: selection }
    )
    /**
     * If select is true then select the inserted link
     */
    if (select && editor.selection) {
      const entry = Editor.node(editor, editor.selection)
      Transforms.select(editor, entry[1])
    }
  } else {
    /**
     * If there is a selection, we wrap the selection with our anchor.
     */
    Transforms.wrapNodes(
      editor,
      { type: "anchor", href, title, children: [] },
      {
        split: true,
        match: (node) => Text.isText(node) || (Element.isElement(node) && Editor.isInline(editor, node)),
      }
    )
  }
}
