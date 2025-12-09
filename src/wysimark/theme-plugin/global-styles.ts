import { css } from "@emotion/react"

const blue = `
--blue-50: rgb(239 246 255);
--blue-100: rgb(219 234 254);
--blue-200: rgb(191 219 254);
--blue-300: rgb(147 197 253);
--blue-400: rgb(96 165 250);
--blue-500: rgb(59 130 246);
--blue-600: rgb(37 99 235);
--blue-700: rgb(29 78 216);
--blue-800: rgb(30 64 175);
--blue-900: rgb(30 58 138);
`

const zincShades = `
--shade-50: rgb(250 250 250);
--shade-100: rgb(244 244 245);
--shade-200: rgb(228 228 231);
--shade-300: rgb(212 212 216);
--shade-400: rgb(161 161 170);
--shade-500: rgb(113 113 122);
--shade-600: rgb(82 82 91);
--shade-700: rgb(63 63 70);
--shade-800: rgb(39 39 42);
--shade-900: rgb(24 24 27);
`

export const globalStyles = css`
  :root {
    /* Tailwind Colors */
    ${blue}
    ${zincShades}
    /* Select Colors */
    --select-color: var(--blue-400);
    --select-editor-color: var(--blue-200);
    --hover-color: var(--blue-200);
    /* Link Colors */
    --link-color: var(--blue-600);
    --link-hover-color: var(--blue-700);
    /* Code Block Colors */
    /* Inline Code Colors */
    --inline-code-bgcolor: var(--shade-100);
    --inline-code-border-color: var(--shade-200);
    /* Table Colors */
    --table-border-color: var(--shade-300);
    --table-row-border-color: var(--shade-300);
    --table-column-border-color: var(--shade-100);
    --table-head-bgcolor: var(--shade-50);
    --table-menu-bgcolor: var(--shade-100);
    --table-menu-hover-bgcolor: var(--shade-200);
    /* Horizontal Rule Colors */
    --hr-color: var(--shade-300);
  }
`
