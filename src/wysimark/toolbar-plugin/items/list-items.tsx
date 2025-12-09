import { MenuItemData } from "../../shared-overlays"

import * as Icon from "../icons"
import { t } from "../../utils/translations"
import { listDepthItems } from "./block-items"

export const listItems: MenuItemData[] = [
  {
    icon: Icon.BulletList,
    title: t("bulletList"),
    hotkey: "super+8",
    action: (editor) => editor.list.convertUnorderedList(true),
  },
  {
    icon: Icon.ListNumbers,
    title: t("numberedList"),
    hotkey: "super+7",
    action: (editor) => editor.list.convertOrderedList(true),
  },
  {
    icon: Icon.ListCheck,
    title: t("checkList"),
    hotkey: "super+9",
    action: (editor) => editor.list.convertTaskList(true),
  },
]

export const expandedListItems: MenuItemData[] = [...listItems, "divider", ...listDepthItems]

export const compactListItems: MenuItemData[] = [
  {
    icon: Icon.ListNumbers,
    title: t("list"),
    more: true,
    children: [...listItems, "divider", ...listDepthItems],
  },
]
