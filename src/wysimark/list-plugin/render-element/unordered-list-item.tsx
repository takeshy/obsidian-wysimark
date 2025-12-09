import { ConstrainedRenderElementProps } from "../../sink"

import { UnorderedListItemElement } from "../types"
import { BulletIcon } from "./list-icons"
import { $UnorderedListItem } from "./styles"

export function UnorderedListItem({
  element,
  attributes,
  children,
}: ConstrainedRenderElementProps<UnorderedListItemElement>) {
  const marginLeft = `${2 + element.depth * 2}em`
  return (
    <$UnorderedListItem {...attributes} style={{ marginLeft }}>
      <div className="--list-item-icon" contentEditable={false}>
        <BulletIcon />
      </div>
      {children}
    </$UnorderedListItem>
  )
}
