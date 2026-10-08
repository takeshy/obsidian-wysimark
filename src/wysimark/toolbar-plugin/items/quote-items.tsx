import { MenuItemData } from "../../shared-overlays"
import { findElementUp } from "../../sink"
import * as Icon from "../icons"
import { t } from "../../utils/translations"

const quoteItemsList: MenuItemData[] = [
  {
    icon: Icon.Quote,
    title: t("quote"),
    hotkey: "super+.",
    action: (editor) => {
      if (editor.blockQuotePlugin.isActive()) {
        editor.blockQuotePlugin.outdent()
      } else {
        editor.blockQuotePlugin.indent()
      }
    },
    active: (editor) => editor.blockQuotePlugin.isActive(),
  },
  {
    icon: Icon.DoubleQuote,
    title: t("increaseQuoteDepth"),
    action: (editor) => editor.blockQuotePlugin.increaseDepth(),
    active: (editor) => editor.blockQuotePlugin.canIncreaseDepth(),
  },
  {
    icon: Icon.CodeBlock,
    title: t("codeBlock"),
    hotkey: "mod+shift+n",
    action: (editor) => editor.codeBlock.toggleCodeBlock(),
    active: (editor) => !!findElementUp(editor, "code-block"),
  },
]

export const expandedQuoteItems: MenuItemData[] = quoteItemsList

export const compactQuoteItems: MenuItemData[] = [
  {
    icon: Icon.Quote,
    title: t("quote"),
    more: true,
    children: quoteItemsList,
  },
]

// For backward compatibility
export const quoteItems = expandedQuoteItems
