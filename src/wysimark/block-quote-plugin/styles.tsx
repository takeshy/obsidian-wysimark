import styled from "@emotion/styled"

export const $BlockQuote = styled("blockquote")`
  position: relative;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  border-left: 0.25em solid rgba(0, 0, 0, 0.075);
  padding-left: 1.5em;
`

export const $Callout = styled("blockquote")`
  --callout-color: 8, 109, 221;
  position: relative;
  margin: 1em 0;
  border: 0;
  border-radius: 0.375em;
  background: rgba(var(--callout-color), 0.1);
  padding: 0.75em 1em;
  overflow: hidden;

  &[data-callout="abstract"] { --callout-color: 8, 145, 178; }
  &[data-callout="info"], &[data-callout="todo"] { --callout-color: 8, 109, 221; }
  &[data-callout="tip"] { --callout-color: 0, 191, 188; }
  &[data-callout="success"] { --callout-color: 68, 207, 110; }
  &[data-callout="question"], &[data-callout="warning"] { --callout-color: 236, 117, 0; }
  &[data-callout="failure"], &[data-callout="danger"], &[data-callout="bug"] { --callout-color: 233, 49, 71; }
  &[data-callout="example"] { --callout-color: 124, 58, 237; }
  &[data-callout="quote"] { --callout-color: 82, 82, 91; }
  &[data-callout-fold="closed"] .wysimark-callout-body { display: none; }
  > :first-of-type:not(.wysimark-callout-title) { display: none; }
`

export const $CalloutTitle = styled("div")`
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5em;
  color: rgb(var(--callout-color));
  font-weight: 700;
  line-height: 1.35;
  &[data-fold="closed"] { margin-bottom: 0; }
`

export const $CalloutIcon = styled("span")`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25em;
  height: 1.25em;
  border-radius: 999px;
  color: white;
  background: rgb(var(--callout-color));
  font-size: 0.75em;
  line-height: 1;
  flex: 0 0 auto;
`

export const $CalloutFoldIcon = styled("span")`
  color: rgb(var(--callout-color));
  flex: 0 0 auto;
`

export const $CalloutBody = styled("div")`
  color: inherit;
  > :first-child { display: none; }
  > :last-child { margin-bottom: 0; }
`

export const $CalloutTitleText = styled("span")`
  flex: 1 1 auto;
`
