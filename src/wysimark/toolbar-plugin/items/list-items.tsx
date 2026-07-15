import { MenuItemData } from "../../shared-overlays"
import { findElementUp } from "../../sink"

import * as Icon from "../icons"
import { t } from "../../utils/translations"
import { listDepthItems } from "./block-items"

const listItemTypes = ["unordered-list-item", "ordered-list-item", "task-list-item"]

export const listItems: MenuItemData[] = [
  {
    icon: Icon.BulletList,
    title: t("bulletList"),
    hotkey: "super+8",
    action: (editor) => editor.list.convertUnorderedList(true),
    active: (editor) => !!findElementUp(editor, "unordered-list-item"),
  },
  {
    icon: Icon.ListNumbers,
    title: t("numberedList"),
    hotkey: "super+7",
    action: (editor) => editor.list.convertOrderedList(true),
    active: (editor) => !!findElementUp(editor, "ordered-list-item"),
  },
  {
    icon: Icon.ListCheck,
    title: t("checkList"),
    hotkey: "super+9",
    action: (editor) => editor.list.convertTaskList(true),
    active: (editor) => !!findElementUp(editor, "task-list-item"),
  },
]

export const expandedListItems: MenuItemData[] = [...listItems, "divider", ...listDepthItems]

export const compactListItems: MenuItemData[] = [
  {
    icon: Icon.ListNumbers,
    title: t("list"),
    more: true,
    active: (editor) => !!findElementUp(editor, listItemTypes),
    children: [...listItems, "divider", ...listDepthItems],
  },
]
