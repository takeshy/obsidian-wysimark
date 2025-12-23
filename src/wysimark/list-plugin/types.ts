import { Descendant } from "slate"

import { BetterAt } from "../sink"

type ListMethods = {
  indent: () => boolean
  outdent: () => boolean
  convertUnorderedList: (allowToggle: boolean) => void
  convertOrderedList: (allowToggle: boolean) => void
  convertTaskList: (allowToggle: boolean) => void
  insertBreak: () => boolean
  toggleTaskListItem: (options?: { at?: BetterAt }) => boolean | undefined
  getListDepth: () => number
  canIncreaseDepth: () => boolean
  canDecreaseDepth: () => boolean
  increaseDepth: () => void
  decreaseDepth: () => void
}

/**
 * List Editor
 */

export type ListEditor = {
  list: ListMethods
}

/**
 * Ordered List Item Element
 */

export type OrderedListItemElement = {
  type: "ordered-list-item"
  depth: number
  __firstAtDepth?: boolean // used internally to reset counters
  children: Descendant[]
}

/**
 * Unordered List Item Element
 */

export type UnorderedListItemElement = {
  type: "unordered-list-item"
  depth: number
  __firstAtDepth?: boolean // used internally to reset counters
  children: Descendant[]
}

/**
 * Checkable Task List Item Element
 */

export type TaskListItemElement = {
  type: "task-list-item"
  depth: number
  __firstAtDepth?: boolean // used internally to reset counters
  checked: boolean
  children: Descendant[]
}

/**
 * Any List Item Element
 */

export type ListItemElement =
  | OrderedListItemElement
  | UnorderedListItemElement
  | TaskListItemElement

/**
 * List Plugins Custom Types
 */

export type ListPluginCustomTypes = {
  Name: "list"
  Editor: ListEditor
  Element:
    | OrderedListItemElement
    | UnorderedListItemElement
    | TaskListItemElement
}
