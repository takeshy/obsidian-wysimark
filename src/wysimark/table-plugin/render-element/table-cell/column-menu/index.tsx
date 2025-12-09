import React, { useCallback, useRef, useState } from "react"
import { useSlateStatic } from "slate-react"

import { Menu, MenuItemData } from "../../../../shared-overlays"
import { useLayer } from "../../../../use-layer"

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BarsIcon,
  MinusIcon,
  PlusIcon,
} from "../../../icons"
import { TableCellElement } from "../../../types"
import {
  $AddMenuButton,
  $ColumnMenu,
  $ColumnMenuTile,
  $RemoveMenuButton,
} from "../../styles"

export function ColumnMenu({ cellElement }: { cellElement: TableCellElement }) {
  const editor = useSlateStatic()
  const menu = useLayer("column-menu")
  const buttonRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)

  const onMouseEnter = useCallback(() => {
    setHover(true)
  }, [])

  const onMouseLeave = useCallback(() => {
    setHover(false)
  }, [])

  const onClick = useCallback(() => {
    if (menu.layer) menu.close()
    const dest = buttonRef.current
    if (dest === null) return
    const items: MenuItemData[] = [
      {
        icon: AlignLeft,
        title: "左揃え",
        action: () => {
          editor.tablePlugin.setTableColumnAlign({ align: "left" })
        },
      },
      {
        icon: AlignCenter,
        title: "中央揃え",
        action: () => {
          editor.tablePlugin.setTableColumnAlign({ align: "center" })
        },
      },
      {
        icon: AlignRight,
        title: "右揃え",
        action: () => {
          editor.tablePlugin.setTableColumnAlign({ align: "right" })
        },
      },
    ]
    // Menu
    menu.open(() => <Menu dest={dest} items={items} close={menu.close} />)
  }, [])

  return (
    <$ColumnMenu
      ref={buttonRef}
      contentEditable={false}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <$ColumnMenuTile className="--tile">
        <BarsIcon />
      </$ColumnMenuTile>
      {hover ? (
        <>
          <$RemoveMenuButton
            style={{
              top: 0,
              left: "50%",
              marginLeft: "-0.5em",
            }}
            onMouseDown={() =>
              editor.tablePlugin.removeColumn({ at: cellElement })
            }
          >
            <MinusIcon />
          </$RemoveMenuButton>

          <$AddMenuButton
            style={{ left: "-0.5em", top: 0 }}
            onMouseDown={() =>
              editor.tablePlugin.insertColumn({ at: cellElement })
            }
          >
            <PlusIcon />
          </$AddMenuButton>
          <$AddMenuButton
            style={{ right: "-0.5em", top: 0 }}
            onMouseDown={() =>
              editor.tablePlugin.insertColumn({ at: cellElement, offset: 1 })
            }
          >
            <PlusIcon />
          </$AddMenuButton>
        </>
      ) : null}
    </$ColumnMenu>
  )
}
