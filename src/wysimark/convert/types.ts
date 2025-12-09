import { AnchorElement } from "../anchor-plugin"
import type { Element, Text } from "../entry"
import { ImageInlineElement } from "../image-plugin/types"

export { Element, Text }
export type Segment = Text | AnchorElement | ImageInlineElement

export type MarkProps = Omit<Text, "text">
export type MarkKey = keyof MarkProps
