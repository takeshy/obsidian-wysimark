import { MenuItemData } from "../../shared-overlays/types"

import * as Icon from "../icons"
import { t } from "../../utils/translations"

const listDepthItems: MenuItemData[] = [
  {
    icon: Icon.IncreaseDepth,
    title: t("increaseDepth"),
    hotkey: "tab",
    action: (editor) => editor.list.increaseDepth(),
    active: (editor) => editor.list.canIncreaseDepth(),
  },
  {
    icon: Icon.DecreaseDepth,
    title: t("decreaseDepth"),
    hotkey: "shift+tab",
    action: (editor) => editor.list.decreaseDepth(),
    active: (editor) => editor.list.canDecreaseDepth(),
  },
]

const blockItems: MenuItemData[] = [
  {
    icon: Icon.Normal,
    title: t("normal"),
    hotkey: "super+0",
    action: (editor) => {
      editor.collapsibleParagraph.convertParagraph()
    },
  },
  {
    icon: Icon.H1,
    title: t("heading1"),
    hotkey: "super+1",
    action: (editor) => editor.heading.convertHeading(1, true),
    active: (editor) => editor.heading.isHeadingActive(1),
  },
  {
    icon: Icon.H2,
    title: t("heading2"),
    hotkey: "super+2",
    action: (editor) => editor.heading.convertHeading(2, true),
    active: (editor) => editor.heading.isHeadingActive(2),
  },
  {
    icon: Icon.H3,
    title: t("heading3"),
    hotkey: "super+3",
    action: (editor) => editor.heading.convertHeading(3, true),
    active: (editor) => editor.heading.isHeadingActive(3),
  },
]

export const expandedBlockItems: MenuItemData[] = [...blockItems]

export const compactBlockItems: MenuItemData[] = [
  {
    icon: Icon.H,
    title: t("paragraphStyle"),
    more: true,
    children: blockItems,
  }
]

// Export listDepthItems so they can be used in list-items.tsx
export { listDepthItems }
