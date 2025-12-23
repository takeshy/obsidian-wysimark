import { Descendant } from "slate"

type HeadingMethods = {
  convertHeading: (level: 1 | 2 | 3 | 4 | 5 | 6, allowToggle: boolean) => void
  isHeadingActive: (level: 1 | 2 | 3 | 4 | 5 | 6) => boolean
}

export type HeadingEditor = {
  heading: HeadingMethods
}

export type HeadingElement = {
  type: "heading"
  /**
   * NOTE:
   *
   * Don't extract these into a new type. It's easier to just repeat this and
   * there's less indirection.
   */
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: Descendant[]
}

export type HeadingPluginCustomTypes = {
  Name: "heading"
  Editor: HeadingEditor
  Element: HeadingElement
}
