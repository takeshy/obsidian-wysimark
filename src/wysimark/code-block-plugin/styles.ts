import styled from "@emotion/styled"

export const $CodeBlock = styled("div")`
  position: relative;
  background: var(--code-block-bgcolor);
  margin: 1em 0;
  border-radius: 0.5em;
  border: 1px solid var(--code-block-border-color);
  /**
   * DO NOT REMOVE: Code for adding line numbering if enabled. See $CodeBlockLine
  * for more details.
   * counter-reset: line;
   */
  &.--selected {
    outline: 2px solid var(--select-color);
  }
  /**
   * NOTE: Required to make the border radius work on the first and last lines.
   * Otherwise they will be square.
   */
  overflow-x: hidden;
`

export const $CodeBlockActions = styled("div")`
  position: absolute;
  top: 0.25em;
  right: 0.25em;
  z-index: 2;
  display: flex;
  gap: 0.25em;
`

export const $CodeBlockActionButton = styled("button")`
  width: 2em;
  height: 2em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--shade-300);
  border-radius: 0.375em;
  color: var(--shade-700);
  background: var(--shade-100);
  font: inherit;
  line-height: 1;
  cursor: pointer;

  &:hover {
    color: var(--shade-900);
    background: var(--shade-200);
  }
`

export const $CodeBlockScroller = styled("div")`
  padding: 2.25em 1em 1.5em 1em;
  border-radius: 0.5em;
  overflow-x: auto;
`

export const $CodeBlockLanguage = styled("span")`
  cursor: pointer;
  position: absolute;
  top: 0.25em;
  right: 0.25em;
  width: 8em;
  display: flex;
  font-size: 0.75em;
  color: var(--shade-700);
  background: var(--shade-200);
  padding: 0.25em 0.5em;
  border-radius: 0.5em;
  align-items: center;
  gap: 0.25em;
  span {
    text-align: right;
    flex: 1 1 auto;
  }
  svg {
    flex: 0 0 auto;
    position: relative;
  }
  &:hover {
    color: var(--shade-800);
    background: var(--shade-300);
  }
`

export const $CodeBlockLine = styled("div")`
  white-space: pre;
  line-height: 1.5em;
  counter-increment: line;
  font-family: "andale mono", AndaleMono, monospace;
  font-size: 0.875em;
  /*
    DO NOT REMOVE: Code for adding line numbering.
    TODO: Make optional in future.
    */
  /* &:before {
    content: counter(line);
    color: rgba(0, 0, 0, 0.25);
    border-right: 1px solid rgba(0, 0, 0, 0.05);
    margin-right: 1em;
    padding: 0em 1em 0 0;
    text-align: right;
    display: inline-block;
    width: 2em;
  } */
`
