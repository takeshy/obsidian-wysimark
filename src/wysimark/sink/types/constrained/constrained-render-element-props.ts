import { BaseElement } from "slate"
import { ReactNode, Ref } from "react"

/**
 * Creates the RenderElementProps where the element argument coming in is
 * constrained to a specific element. This is useful during the creation of
 * a Plugin where we want to isolate the choice of `Element` to whatever is
 * available for that specific plugin.
 */
export type ConstrainedRenderElementProps<Element> = Element extends BaseElement
  ? {
      children: ReactNode
      element: Element
      attributes: {
        "data-slate-node": "element"
        "data-slate-inline"?: true
        "data-slate-void"?: true
        dir?: "rtl"
        ref: Ref<HTMLElement>
      }
    }
  : never
