import styled from "@emotion/styled"

export const $HtmlBlock = styled("div")`
  position: relative;
  background-color: var(--shade-100);
  border: 1px solid var(--shade-300);
  border-radius: 0.5em;
  padding: 2em 1em 1em 1em;
  margin: 1em 0;
  font-family: "andale mono", AndaleMono, monospace;
  font-size: 0.875em;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--shade-700);
  overflow-x: auto;

  &.--selected {
    outline: 2px solid var(--select-color);
  }
`

export const $HtmlBlockLabel = styled("span")`
  position: absolute;
  top: 0.25em;
  right: 0.5em;
  font-size: 0.625em;
  color: var(--shade-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`
