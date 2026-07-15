import type { MouseEvent } from "react"
import { Descendant, Editor, Element, Node, Transforms } from "slate"
import { ReactEditor, useFocused, useSlateStatic } from "slate-react"

import {
  createHotkeyHandler,
  createPlugin,
  ConstrainedRenderElementProps,
  TypedPlugin,
  useIsElementSelectionInside,
} from "../sink"

import { getCalloutInfo } from "./callout"
import {
  $BlockQuote, $Callout, $CalloutBody, $CalloutFoldIcon, $CalloutIcon,
  $CalloutTitle, $CalloutTitleText,
} from "./styles"

function BlockQuote({
  element,
  attributes,
  children,
}: ConstrainedRenderElementProps<BlockQuoteElement>) {
  const editor = useSlateStatic()
  const callout = getCalloutInfo(element)
  const isEditing = useFocused() && useIsElementSelectionInside(element)

  function editBlock(event: MouseEvent) {
    const target = event.target
    if (target instanceof HTMLElement && target.closest(".wysimark-callout-body")) return
    event.preventDefault()
    const path = ReactEditor.findPath(editor, element)
    Transforms.select(editor, Editor.start(editor, path))
    ReactEditor.focus(editor)
  }

  if (callout && !isEditing) {
    return (
      <$Callout
        {...attributes}
        data-callout={callout.type}
        data-callout-source-type={callout.displayType}
        data-callout-fold={callout.fold}
        onMouseDown={editBlock}
      >
        <$CalloutTitle className="wysimark-callout-title" contentEditable={false} data-fold={callout.fold}>
          <$CalloutFoldIcon>
            {callout.fold === "closed" ? "›" : callout.fold === "open" ? "⌄" : null}
          </$CalloutFoldIcon>
          <$CalloutIcon>{callout.icon}</$CalloutIcon>
          <$CalloutTitleText>{callout.title}</$CalloutTitleText>
        </$CalloutTitle>
        <$CalloutBody className="wysimark-callout-body">{children}</$CalloutBody>
      </$Callout>
    )
  }

  return <$BlockQuote {...attributes}>{children}</$BlockQuote>
}

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
      editableProps: {
        renderElement: ({ element, attributes, children }) => {
          if (element.type === "block-quote") {
            return (
              <BlockQuote element={element} attributes={attributes}>
                {children}
              </BlockQuote>
            )
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
