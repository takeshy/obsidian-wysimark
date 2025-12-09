import { Descendant, Editor, Element, Node, Transforms } from "slate"

import {
  createHotkeyHandler,
  createPlugin,
  normalizeSiblings,
  TypedPlugin,
} from "../sink"

import { $BlockQuote } from "./styles"

export type BlockQuoteEditor = {
  supportsBlockQuote: true
  blockQuotePlugin: {
    indent: () => void
    outdent: () => void
    isActive: () => boolean
    increaseDepth: () => void
    decreaseDepth: () => void
    canIncreaseDepth: () => boolean
    canDecreaseDepth: () => boolean
  }
}

export type BlockQuoteElement = {
  type: "block-quote"
  children: Descendant[]
}

export type BlockQuotePluginCustomTypes = {
  Name: "block-quote"
  Editor: BlockQuoteEditor
  Element: BlockQuoteElement
}

function matchBlockQuoteSafe(node: Node) {
  return (
    Element.isElement(node) &&
    /**
     * TODO:
     *
     * This is probably:
     * Element.isElement(node) && !Element.isInline(node) &&
     * !Element.isDependant(node)
     */
    (node.type === "paragraph" ||
      node.type === "code-block" ||
      node.type === "table" ||
      node.type === "horizontal-rule" ||
      node.type === "task-list-item" ||
      node.type === "unordered-list-item" ||
      node.type === "ordered-list-item" ||
      node.type === "heading")
  )
}

const MAX_DEPTH = 2

export const BlockQuotePlugin = createPlugin<BlockQuotePluginCustomTypes>(
  (editor) => {
    editor.supportsBlockQuote = true
    editor.blockQuotePlugin = {
      indent: () => {
        Transforms.wrapNodes(
          editor,
          { type: "block-quote", children: [] },
          { match: matchBlockQuoteSafe }
        )
      },
      outdent: () => {
        Transforms.liftNodes(editor, {
          match: (node, path) => matchBlockQuoteSafe(node) && path.length > 1,
        })
      },
      isActive: () => {
        const [match] = Editor.nodes(editor, {
          match: (n: Node) => Element.isElement(n) && n.type === "block-quote",
        })
        return !!match
      },
      increaseDepth: () => {
        // Find the current block-quote
        const [match] = Editor.nodes(editor, {
          match: (n: Node) => Element.isElement(n) && n.type === "block-quote",
        })

        if (!match) return

        // Check if we're already at max depth
        if (!editor.blockQuotePlugin.canIncreaseDepth()) return

        const [, path] = match

        // Select all content inside the block-quote
        Transforms.select(editor, path)

        // Create a new block-quote wrapping the selected content
        Transforms.wrapNodes(
          editor,
          { type: "block-quote", children: [] },
          { at: path, split: false }
        )
      },
      decreaseDepth: () => {
        // Find the current block-quote
        const [match] = Editor.nodes(editor, {
          match: (n: Node) => Element.isElement(n) && n.type === "block-quote",
        })

        if (!match) return

        // Check if we can decrease depth
        if (!editor.blockQuotePlugin.canDecreaseDepth()) return

        const [node, path] = match

        // Get the children of the block-quote
        const children = (node as Element).children

        // Check if the first child is a block-quote
        if (
          children.length === 1 &&
          Element.isElement(children[0]) &&
          children[0].type === "block-quote"
        ) {
          // Unwrap the nested block-quote
          Transforms.unwrapNodes(editor, {
            at: [...path, 0], // Path to the nested block-quote
            match: (n) => Element.isElement(n) && n.type === "block-quote",
          })
        }
      },
      canIncreaseDepth: () => {
        // Find the current block-quote
        const [match] = Editor.nodes(editor, {
          match: (n: Node) => Element.isElement(n) && n.type === "block-quote",
        })

        if (!match) return false

        const [node] = match

        // Calculate the current depth
        let depth = 0
        let current = node

        while (
          (current as Element).children.length === 1 &&
          Element.isElement((current as Element).children[0]) &&
          (current as Element).children[0] &&
          (current as Element).children[0] &&
          ((current as Element).children[0] as Element).type === "block-quote"
        ) {
          depth++
          current = (current as Element).children[0]
        }

        return depth < MAX_DEPTH
      },
      canDecreaseDepth: () => {
        // Find the current block-quote
        const [match] = Editor.nodes(editor, {
          match: (n: Node) => Element.isElement(n) && n.type === "block-quote",
        })

        if (!match) return false

        const [node] = match

        // Check if the first child is a block-quote
        return (
          (node as Element).children.length === 1 &&
          Element.isElement((node as Element).children[0]) &&
          (node as Element).children[0] &&
          ((node as Element).children[0] as Element).type === "block-quote"
        )
      },
    }
    return {
      name: "block-quote",
      editor: {
        normalizeNode(entry) {
          const [node, path] = entry
          if (!Element.isElement(node)) return false
          if (node.type !== "block-quote") return false
          return normalizeSiblings<Element>(editor, [node, path], (a, b) => {
            if (
              Element.isElement(a[0]) &&
              Element.isElement(b[0]) &&
              a[0].type === "block-quote" &&
              b[0].type === "block-quote"
            ) {
              Transforms.mergeNodes(editor, { at: b[1] })
            }
            return true
          })
        },
      },
      editableProps: {
        renderElement: ({ element, attributes, children }) => {
          if (element.type === "block-quote") {
            return <$BlockQuote {...attributes}>{children}</$BlockQuote>
          }
        },
        onKeyDown: createHotkeyHandler({
          "super+.": editor.blockQuotePlugin.indent,
          "super+,": editor.blockQuotePlugin.outdent,
        }),
      },
    }
  }
) as TypedPlugin<BlockQuotePluginCustomTypes>
