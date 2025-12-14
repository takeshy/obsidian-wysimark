import styled from "@emotion/styled"

import { $Panel } from "../../shared-overlays/styles/$Panel"

export const $AnchorDialog = styled($Panel)`
  width: 24em;
  padding: 0;
  overflow: hidden;
`
export const $AnchorDialogInputLine = styled("div")`
  display: flex;
  gap: 0.5em;
`

export const $AnchorDialogInput = styled("input")`
  flex: 1 1 auto;
  padding: 0.5em 0.75em;
  border-radius: 0.25em;
  color: var(--shade-700);
  background: var(--shade-50);
  border: 1px solid var(--shade-300);
  font-size: 0.9375em;
  &:focus {
    outline: 2px solid var(--blue-200);
  }
`
