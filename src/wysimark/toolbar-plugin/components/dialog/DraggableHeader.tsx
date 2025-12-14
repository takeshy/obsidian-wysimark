import { useRef, useCallback } from "react"
import styled from "@emotion/styled"

const $DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  cursor: grab;
  background: linear-gradient(to bottom, #f8f8f8, #e8e8e8);
  border-bottom: 1px solid #ddd;
  border-radius: 4px 4px 0 0;
  user-select: none;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`

const $DragIndicator = styled.div`
  width: 32px;
  height: 4px;
  background: #ccc;
  border-radius: 2px;
`

interface DraggableHeaderProps {
  onDrag: (deltaX: number, deltaY: number) => void
}

export function DraggableHeader({ onDrag }: DraggableHeaderProps) {
  const startPos = useRef<{ x: number; y: number } | null>(null)

  const handleStart = useCallback((clientX: number, clientY: number) => {
    startPos.current = { x: clientX, y: clientY }
  }, [])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!startPos.current) return
    const deltaX = clientX - startPos.current.x
    const deltaY = clientY - startPos.current.y
    startPos.current = { x: clientX, y: clientY }
    onDrag(deltaX, deltaY)
  }, [onDrag])

  const handleEnd = useCallback(() => {
    startPos.current = null
  }, [])

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }
    const onMouseUp = () => {
      handleEnd()
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }, [handleStart, handleMove, handleEnd])

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }, [handleStart])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }, [handleMove])

  const onTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  return (
    <$DragHandle
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <$DragIndicator />
    </$DragHandle>
  )
}
