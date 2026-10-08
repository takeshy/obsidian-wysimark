import { AnchorElement } from "../anchor-plugin"
import type { Element, Text } from "../entry"
import { ImageInlineElement } from "../image-plugin/types"
import type { NonMarkTextKey } from "../marks-plugin/non-mark-keys"

export { Element, Text }
export type Segment = Text | AnchorElement | ImageInlineElement

export type MarkProps = Omit<Text, "text" | NonMarkTextKey>
export type MarkKey = keyof MarkProps
