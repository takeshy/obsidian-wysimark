import { BaseEditor, BaseText } from "slate"
import { HistoryEditor } from "slate-history"
import { ReactEditor } from "slate-react"

import { AnchorPlugin } from "../anchor-plugin"
import { AtomicDeletePlugin } from "../atomic-delete-plugin"
import { ImagePlugin } from "../image-plugin"
import { BlockQuotePlugin } from "../block-quote-plugin"
import { CodeBlockPlugin } from "../code-block-plugin"
import { HtmlBlockPlugin } from "../html-block-plugin"
import { CollapsibleParagraphPlugin } from "../collapsible-paragraph-plugin"
import { ConvertElementPlugin } from "../convert-element-plugin"
import { HeadingPlugin } from "../heading-plugin"
import { HorizontalRulePlugin } from "../horizontal-rule-plugin"
import { InlineCodePlugin } from "../inline-code-plugin"
import { ListPlugin } from "../list-plugin"
import { MarksPlugin } from "../marks-plugin"
import { NormalizeAfterDeletePlugin } from "../normalize-after-delete-plugin"
import { ExtractCustomTypes } from "../sink"
import { TablePlugin } from "../table-plugin"
import { ThemePlugin } from "../theme-plugin"
import { ToolbarPlugin } from "../toolbar-plugin"
import { TrailingBlockPlugin } from "../trailing-block-plugin"
import { PasteMarkdownPlugin } from "../paste-markdown-plugin"
import { PlaceholderPlugin } from "../placeholder-plugin"
import { WysimarkEditor } from "./types"

export const plugins = [
  PasteMarkdownPlugin,
  ConvertElementPlugin,
  AnchorPlugin,
  HeadingPlugin,
  MarksPlugin,
  InlineCodePlugin,
  BlockQuotePlugin,
  CodeBlockPlugin,
  HtmlBlockPlugin,
  TablePlugin,
  HorizontalRulePlugin,
  TrailingBlockPlugin,
  ListPlugin,
  AtomicDeletePlugin,
  NormalizeAfterDeletePlugin,
  CollapsibleParagraphPlugin,
  ThemePlugin,
  ToolbarPlugin,
  ImagePlugin,
  PlaceholderPlugin,
]

export type PluginTypes = ExtractCustomTypes<typeof plugins>

type CustomEditor = PluginTypes["Editor"]
type CustomElement = PluginTypes["Element"]
type CustomText = PluginTypes["Text"]

export type OptionsType = PluginTypes["Options"]
export type Element = CustomElement
export type Text = CustomText

declare module "slate" {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  interface CustomTypes {
    Editor: BaseEditor &
      ReactEditor &
      HistoryEditor &
      CustomEditor &
      WysimarkEditor
    Element: CustomElement
    Text: BaseText & CustomText
  }
}
