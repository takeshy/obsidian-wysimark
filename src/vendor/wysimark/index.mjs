"use client";

// src/index.tsx
import {
  createRef,
  useCallback as useCallback17,
  useImperativeHandle,
  useRef as useRef14,
  useState as useState13
} from "react";
import { createRoot } from "react-dom/client";

// src/entry/index.tsx
import throttle3 from "lodash.throttle";
import { useCallback as useCallback16, useRef as useRef13, useState as useState12 } from "react";
import { Editor as Editor64, Transforms as Transforms47 } from "slate";
import { ReactEditor as ReactEditor18, Slate as Slate2 } from "slate-react";

// src/convert/parse/index.ts
import remarkParse from "remark-parse";
import { unified } from "unified";

// node_modules/devlop/lib/default.js
function ok() {
}

// node_modules/mdast-util-gfm-table/lib/index.js
function gfmTableFromMarkdown() {
  return {
    enter: {
      table: enterTable,
      tableData: enterCell,
      tableHeader: enterCell,
      tableRow: enterRow
    },
    exit: {
      codeText: exitCodeText,
      table: exitTable,
      tableData: exit,
      tableHeader: exit,
      tableRow: exit
    }
  };
}
function enterTable(token) {
  const align = token._align;
  ok(align, "expected `_align` on table");
  this.enter(
    {
      type: "table",
      align: align.map(function(d) {
        return d === "none" ? null : d;
      }),
      children: []
    },
    token
  );
  this.data.inTable = true;
}
function exitTable(token) {
  this.exit(token);
  this.data.inTable = void 0;
}
function enterRow(token) {
  this.enter({ type: "tableRow", children: [] }, token);
}
function exit(token) {
  this.exit(token);
}
function enterCell(token) {
  this.enter({ type: "tableCell", children: [] }, token);
}
function exitCodeText(token) {
  let value = this.resume();
  if (this.data.inTable) {
    value = value.replace(/\\([\\|])/g, replace);
  }
  const node = this.stack[this.stack.length - 1];
  ok(node.type === "inlineCode");
  node.value = value;
  this.exit(token);
}
function replace($0, $1) {
  return $1 === "|" ? $1 : $0;
}

// src/convert/parse/custom-gfm.ts
import { gfm } from "micromark-extension-gfm";
import { gfmToMarkdown } from "mdast-util-gfm";
function customRemarkGfm() {
  return function() {
    if (!this) {
      return;
    }
    if (!this.data) {
      this.data = {};
    } else if (typeof this.data === "function") {
      this.data();
    }
    const data = typeof this.data === "function" ? this.data() : this.data;
    const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
    const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
    const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);
    micromarkExtensions.push(gfm());
    const patchedFromMarkdown = function() {
      const extension = gfmTableFromMarkdown();
      if (extension.enter) {
        const originalEnterTable = extension.enter.table;
        if (originalEnterTable) {
          extension.enter.table = function(token) {
            if (!this.data) {
              this.data = {};
            }
            originalEnterTable.call(this, token);
            this.data.inTable = true;
          };
        }
      }
      if (extension.exit) {
        const originalExitTable = extension.exit.table;
        if (originalExitTable) {
          extension.exit.table = function(token) {
            if (!this.data) {
              this.data = {};
            }
            originalExitTable.call(this, token);
            if (this.data) {
              this.data.inTable = void 0;
            }
          };
        }
      }
      return extension;
    };
    fromMarkdownExtensions.push(patchedFromMarkdown());
    toMarkdownExtensions.push(gfmToMarkdown());
    return void 0;
  };
}

// src/convert/utils.ts
function escapeUrlSlashes(text) {
  const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let linkIndex = 0;
  const textWithoutLinks = text.replace(markdownLinkPattern, (match) => {
    links.push(match);
    return `__MARKDOWN_LINK_${linkIndex++}__`;
  });
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const textWithEscapedUrls = textWithoutLinks.replace(urlPattern, (url) => {
    return url.replace(/\//g, "\\/");
  });
  let result = textWithEscapedUrls;
  for (let i = 0; i < links.length; i++) {
    result = result.replace(`__MARKDOWN_LINK_${i}__`, links[i]);
  }
  return result;
}
function unescapeUrlSlashes(text) {
  return text.replace(/\\(.)/g, (match, char) => {
    return char;
  });
}
function assert(pass, message) {
  if (!pass)
    throw new Error(`${message}`);
}
function assertElementType(element, type) {
  if (element.type !== type)
    throw new Error(
      `Expected element to be of type ${JSON.stringify(
        element
      )} but is ${JSON.stringify(element, null, 2)}`
    );
}
function assertUnreachable(x) {
  throw new Error(
    `Didn't expect to get here with value ${JSON.stringify(x, null, 2)}`
  );
}

// src/convert/parse/parse-blockquote.ts
function parseBlockquote(content) {
  return [{ type: "block-quote", children: parseContents(content.children) }];
}

// src/convert/parse/parse-code-block.ts
function parseCodeBlock(content) {
  const codeLines = content.value.split("\n");
  return [
    {
      type: "code-block",
      language: content.lang || "text",
      children: codeLines.map((codeLine) => ({
        type: "code-block-line",
        children: [{ text: codeLine }]
      }))
    }
  ];
}

// src/convert/parse/parse-footnote-definition.ts
function parseFootnoteDefinition(footnote) {
  return [
    {
      type: "block-quote",
      children: [
        /**
         * Insert an initial paragraph with the footnote identifier in square
         * brackets.
         */
        { type: "paragraph", children: [{ text: `[${footnote.identifier}]` }] },
        /**
         * The rest of the children are parsed as is and supports the full range
         * of element types like headings, lists and nested block quotes.
         */
        ...parseContents(footnote.children)
      ]
    }
  ];
}

// src/convert/parse/parse-phrasing-content/normalize-segments.ts
import { Text as SlateText3 } from "slate";

// src/convert/parse/parse-phrasing-content/normalize-segment.ts
import { Text as SlateText2 } from "slate";

// src/convert/serialize/serialize-line/utils/is-utils.ts
import * as Slate from "slate";
function isText(segment) {
  return Slate.Text.isText(segment);
}
function isElement(segment) {
  return Slate.Element.isElement(segment);
}
function isPlainSpace(segment) {
  return Slate.Text.isText(segment) && !!segment.text.match(/^\s+$/) && !segment.code;
}

// src/convert/serialize/serialize-line/utils/mark-utils/mark-convert-utils.ts
var MARK_KEY_TO_TOKEN = {
  bold: "**",
  italic: "_",
  // ins: "++",
  strike: "~~",
  /**
   * IMPORTANT!
   *
   * We noop `code` here.
   *
   * We accept the `code` mark so as not to throw an error if it is found. We do
   * this because we handle `code` text specially because of the way it needs to
   * be escaped.
   *
   * This is handled in the `serializeLine` code.
   */
  code: ""
};
function convertMarkToSymbol(mark) {
  if (mark in MARK_KEY_TO_TOKEN)
    return MARK_KEY_TO_TOKEN[mark];
  throw new Error(
    `Could not find mark ${JSON.stringify(mark)} in MARK_KEY_TO_TOKEN lookup`
  );
}
function convertMarksToSymbolsExceptCode(marks) {
  return marks.map(convertMarkToSymbol).join("");
}

// src/convert/serialize/serialize-line/utils/mark-utils/mark-get-utils.ts
import { Text as SlateText } from "slate";
function getMarksFromText(text) {
  const { text: _, ...marks } = text;
  return Object.keys(marks);
}
function getMarksFromSegment(segment) {
  if (SlateText.isText(segment)) {
    if (isPlainSpace(segment)) {
      throw new Error(
        `You probably didn't mean to do this. We should only be getting marks from segments that are not plain space segments.`
      );
    }
    return getMarksFromText(segment);
  } else if (segment.type === "anchor") {
    return getCommonAnchorMarks(segment.children);
  } else {
    throw new Error(`Unhandled type ${segment.type}`);
  }
}
function getCommonAnchorMarks(segments) {
  let commonMarks;
  for (const segment of segments) {
    if (!isText(segment)) {
      if (segment.type === "image-inline")
        continue;
      throw new Error(
        `Expected every segment in an anchor to be a Text segment`
      );
    }
    if (isPlainSpace(segment))
      continue;
    const currentMarks = getMarksFromText(segment);
    if (commonMarks === void 0) {
      commonMarks = currentMarks;
      continue;
    }
    commonMarks = commonMarks.filter(
      (commonMark) => currentMarks.includes(commonMark)
    );
  }
  if (commonMarks === void 0)
    throw new Error(
      `No text segments were found as children in this anchor which should not be possible`
    );
  return commonMarks;
}

// src/convert/serialize/serialize-line/utils/mark-utils/mark-order-utils.ts
var ORDERED_MARK_KEYS = [
  "bold",
  "italic",
  "underline",
  "strike",
  "code"
];
function sortMarks(marks) {
  return marks.slice().sort((a, b) => ORDERED_MARK_KEYS.indexOf(a) - ORDERED_MARK_KEYS.indexOf(b));
}

// src/convert/serialize/serialize-line/utils/text-utils.ts
var ESCAPES = [
  "\\",
  // escape
  "`",
  // code
  "*",
  // bold/italic/hr
  "_",
  // bold/italic/hr
  "[",
  // link/list
  "]",
  // link/list
  "(",
  // link
  ")",
  // link
  "#",
  // headings
  "+",
  // list
  "-",
  // hr/list
  ".",
  // numbered list
  "!",
  // image
  "|",
  // table
  "^",
  // sup
  "~",
  // sub/strikethrough
  "<",
  // link/html
  ">",
  // link/html
  /**
   * Includes all the characters in the list of Backslash escapes in the example
   * for GitHub Flavored Markdown.
   *
   * https://github.github.com/gfm/#backslash-escapes
   */
  "{",
  "}",
  "=",
  ":",
  ";",
  "$",
  "%",
  "&",
  "?",
  '"',
  "'",
  ",",
  "\\",
  "/",
  "@"
];
var ESCAPES_REGEXP = new RegExp(
  `(${ESCAPES.map((symbol) => `\\${symbol}`).join("|")})`,
  "g"
);
function escapeText(s) {
  return s.replace(ESCAPES_REGEXP, (s2) => `\\${s2}`);
}

// src/convert/parse/parse-phrasing-content/normalize-segment.ts
function areMarksEqual(a, b) {
  const marksA = getMarksFromText(a);
  const marksB = getMarksFromText(b);
  return marksA.length == marksB.length && marksA.every((v) => marksB.includes(v));
}
function normalizeSegment(segment, mutablePrevSegment) {
  const segmentIsText = SlateText2.isText(segment);
  const prevSegmentIsText = SlateText2.isText(mutablePrevSegment);
  if (mutablePrevSegment && !prevSegmentIsText && !segmentIsText) {
    return [{ text: "" }, segment];
  }
  if (!segmentIsText)
    return [segment];
  if (mutablePrevSegment === void 0 || !prevSegmentIsText)
    return [segment];
  const marksEqual = areMarksEqual(mutablePrevSegment, segment);
  if (marksEqual) {
    mutablePrevSegment.text = [mutablePrevSegment.text, segment.text].join("");
    return [];
  }
  return [segment];
}

// src/convert/parse/parse-phrasing-content/normalize-segments.ts
function normalizeSegments(segments) {
  const nextSegments = [];
  for (let i = 0; i < segments.length; i++) {
    const mutablePrevSegment = nextSegments[nextSegments.length - 1];
    nextSegments.push(...normalizeSegment(segments[i], mutablePrevSegment));
  }
  if (nextSegments.length === 0)
    nextSegments.push({ text: "" });
  if (!SlateText3.isText(nextSegments[0]))
    nextSegments.unshift({ text: "" });
  if (!SlateText3.isText(nextSegments[nextSegments.length - 1]))
    nextSegments.push({ text: "" });
  return nextSegments;
}

// src/convert/parse/parse-phrasing-content/parse-inline-image/parse-generic-image.ts
function parseGenericImage(image) {
  return {
    url: image.url,
    title: image.title || void 0,
    alt: image.alt || void 0
  };
}

// src/convert/parseUrl.ts
var URL_REGEX = /^(\/[^?#]*)(?:\?([^#]*))?(#.*)?$/;
function parseUrl(url) {
  try {
    const urlData = new URL(url);
    return {
      origin: urlData.origin,
      hostname: urlData.hostname,
      pathname: urlData.pathname,
      searchParams: urlData.searchParams,
      hash: urlData.hash
    };
  } catch (error) {
    const matchdata = url.match(URL_REGEX);
    if (matchdata === null)
      throw new Error(`Invalid format should not happen: ${url}`);
    const [_, pathname, searchParams, hash] = [...matchdata];
    return {
      origin: "",
      hostname: "",
      pathname: pathname || "",
      searchParams: new URLSearchParams(searchParams),
      hash: hash || ""
    };
  }
}

// src/convert/parse/parse-phrasing-content/parse-inline-image/parse-utils.ts
function parseSize(s) {
  if (typeof s !== "string")
    return null;
  const sizeMatch = s.match(/^(\d+)x(\d+)$/);
  if (sizeMatch === null)
    return null;
  return {
    width: parseInt(sizeMatch[1]),
    height: parseInt(sizeMatch[2])
  };
}

// src/convert/parse/parse-phrasing-content/parse-inline-image/parse-portive-image.ts
function parsePortiveImage(image) {
  const url = parseUrl(image.url);
  if (!url.hostname.match(/[.]portive[.]com$/i))
    return;
  const sizeParam = url.searchParams.get("size");
  if (sizeParam === null)
    return;
  const size = parseSize(sizeParam);
  if (size === null)
    return;
  const srcSizeMatch = url.pathname.match(/[-][-](\d+)x(\d+)[.][a-zA-Z]+$/);
  if (srcSizeMatch === null)
    return;
  return {
    url: `${url.origin}${url.pathname}`,
    title: image.title || void 0,
    alt: image.alt || void 0,
    width: size.width,
    height: size.height,
    srcWidth: parseInt(srcSizeMatch[1]),
    srcHeight: parseInt(srcSizeMatch[2])
  };
}

// src/convert/parse/parse-phrasing-content/parse-inline-image/parse-uncommon-mark-image.ts
function parseUncommonMarkImage(image) {
  const url = parseUrl(image.url);
  if (url.hash.length === 0)
    return;
  const params = new URLSearchParams(url.hash.slice(1));
  const size = parseSize(params.get("size"));
  const srcSize = parseSize(params.get("srcSize"));
  if (!size || !srcSize)
    return;
  return {
    url: `${url.origin}${url.pathname}`,
    title: image.title || void 0,
    alt: image.alt || void 0,
    width: size.width,
    height: size.height,
    srcWidth: srcSize.width,
    srcHeight: srcSize.height
  };
}

// src/convert/parse/parse-phrasing-content/parse-inline-image/image-parsers.ts
var imageParsers = [
  parsePortiveImage,
  parseUncommonMarkImage,
  parseGenericImage
];

// src/convert/parse/parse-phrasing-content/parse-inline-image/index.ts
function parseInlineImage(image) {
  for (const imageParser of imageParsers) {
    const imageData = imageParser(image);
    if (!imageData)
      continue;
    return [
      {
        type: "image-inline",
        ...imageData,
        children: [{ text: "" }]
      }
    ];
  }
  throw new Error(`Shouldn't get here because last parser always returns data`);
}

// src/convert/parse/parse-phrasing-content/parse-phrasing-content.ts
function parsePhrasingContents(phrasingContents, marks = {}) {
  const segments = [];
  for (const phrasingContent of phrasingContents) {
    segments.push(...parsePhrasingContent(phrasingContent, marks));
  }
  const nextInlines = normalizeSegments(segments);
  return nextInlines;
}
function parsePhrasingContent(phrasingContent, marks = {}) {
  switch (phrasingContent.type) {
    case "delete":
      return parsePhrasingContents(phrasingContent.children, {
        ...marks,
        strike: true
      });
    case "emphasis":
      return parsePhrasingContents(phrasingContent.children, {
        ...marks,
        italic: true
      });
    case "footnoteReference":
      return [{ text: `[${phrasingContent.identifier}]` }];
    case "html":
      return [{ text: phrasingContent.value, code: true }];
    case "image":
      return parseInlineImage(phrasingContent);
    case "inlineCode": {
      return [{ text: phrasingContent.value, ...marks, code: true }];
    }
    case "link":
      return [
        {
          type: "anchor",
          href: phrasingContent.url,
          title: (
            /**
             * Ensure that `title` is undefined if it's null.
             */
            phrasingContent.title == null ? void 0 : phrasingContent.title
          ),
          children: parsePhrasingContents(phrasingContent.children, marks)
        }
      ];
    case "strong":
      return parsePhrasingContents(phrasingContent.children, {
        ...marks,
        bold: true
      });
    case "text":
      return [{ text: phrasingContent.value, ...marks }];
    case "linkReference":
    case "imageReference":
      throw new Error(
        `linkReference and imageReference should be converted to link and image through our transformInlineLinks function`
      );
    case "break":
      return [{ text: "\n" }];
    case "footnote":
      throw new Error("footnote is not supported yet");
  }
  assertUnreachable(phrasingContent);
}

// src/convert/parse/parse-heading.ts
function parseHeading(content) {
  return [
    {
      type: "heading",
      level: content.depth,
      children: parsePhrasingContents(content.children)
    }
  ];
}

// src/convert/parse/parse-html.ts
function parseHTML(content) {
  return [
    {
      type: "code-block",
      language: "html",
      children: content.value.split("\n").map((line) => ({
        type: "code-block-line",
        children: [{ text: line }]
      }))
    }
  ];
}

// src/convert/parse/parse-list/parse-list-item-child.ts
function parseListItemChild(child, {
  depth,
  ordered,
  checked
}) {
  switch (child.type) {
    case "paragraph":
      if (checked === true || checked === false) {
        return [
          {
            type: "task-list-item",
            depth,
            checked,
            children: parsePhrasingContents(child.children)
          }
        ];
      } else if (ordered) {
        return [
          {
            type: "ordered-list-item",
            depth,
            children: parsePhrasingContents(child.children)
          }
        ];
      } else {
        return [
          {
            type: "unordered-list-item",
            depth,
            children: parsePhrasingContents(child.children)
          }
        ];
      }
    case "list":
      return parseList(child, depth + 1);
    default:
      return parseContent(child);
  }
}

// src/convert/parse/parse-list/parse-list-item.ts
function parseListItem(listItem, options) {
  const elements = [];
  for (const child of listItem.children) {
    elements.push(
      ...parseListItemChild(child, { ...options, checked: listItem.checked })
    );
  }
  return elements;
}

// src/convert/parse/parse-list/parse-list.ts
function parseList(list, depth = 0) {
  const elements = [];
  for (const listItem of list.children) {
    elements.push(
      ...parseListItem(listItem, { depth, ordered: !!list.ordered })
    );
  }
  return elements;
}

// src/convert/parse/parse-paragraph.ts
function isImageBlock(segments) {
  if (segments.length !== 3)
    return false;
  if (!("text" in segments[0]) || segments[0].text !== "")
    return false;
  if (!("text" in segments[2]) || segments[2].text !== "")
    return false;
  if (!("type" in segments[1]) || segments[1].type !== "image-inline")
    return false;
  return true;
}
var NBSP = "\xA0";
function isSingleNBSP(segments) {
  if (segments.length !== 1)
    return false;
  if (!("text" in segments[0]) || segments[0].text !== NBSP)
    return false;
  return true;
}
function parseParagraph(content) {
  const segments = parsePhrasingContents(content.children);
  if (isImageBlock(segments)) {
    const imageSegment = segments[1];
    const imageBlockElement = {
      ...imageSegment,
      type: "image-block"
    };
    return [imageBlockElement];
  }
  if (isSingleNBSP(segments)) {
    return [
      {
        type: "paragraph",
        children: [{ text: "" }]
      }
    ];
  }
  return [
    {
      type: "paragraph",
      children: segments
    }
  ];
}

// src/convert/parse/parse-table.ts
function parseTable(table) {
  if (table.align == null)
    throw new Error(`Expected an array of AlignType for table.align`);
  return [
    {
      type: "table",
      columns: table.align.map((align) => ({
        align: align || "left"
      })),
      children: table.children.map(parseTableRow)
    }
  ];
}
function parseTableRow(row) {
  if (row.type !== "tableRow")
    throw new Error(`Expected a tableRow`);
  return { type: "table-row", children: row.children.map(parseTableCell) };
}
function parseTableCell(cell) {
  if (cell.type !== "tableCell")
    throw new Error(`Expected a tableCell`);
  return {
    type: "table-cell",
    children: [
      {
        type: "table-content",
        children: parsePhrasingContents(cell.children)
      }
    ]
  };
}

// src/convert/parse/parse-thematic-break.ts
function parseThematicBreak() {
  return [
    {
      type: "horizontal-rule",
      children: [{ text: "" }]
    }
  ];
}

// src/convert/parse/parse-content.ts
function parseContents(contents) {
  const elements = [];
  for (const content of contents) {
    elements.push(...parseContent(content));
  }
  return elements;
}
function parseContent(content) {
  switch (content.type) {
    case "blockquote":
      return parseBlockquote(content);
    case "code":
      return parseCodeBlock(content);
    case "definition":
      throw new Error(`The type "definition" should not exist. See comments`);
    case "footnoteDefinition":
      return parseFootnoteDefinition(content);
    case "heading":
      return parseHeading(content);
    case "html":
      return parseHTML(content);
    case "list":
      return parseList(content);
    case "paragraph":
      return parseParagraph(content);
    case "table":
      return parseTable(content);
    case "thematicBreak":
      return parseThematicBreak();
    case "yaml":
      return [];
  }
  assertUnreachable(content);
}

// src/convert/parse/transform-inline-links.ts
import { definitions } from "mdast-util-definitions";
import { SKIP, visit } from "unist-util-visit";
function transformInlineLinks(tree) {
  const definition = definitions(tree);
  visit(tree, (n, index, p) => {
    const node = n;
    const parent = p;
    if (node.type === "definition" && parent !== null && typeof index === "number") {
      parent.children.splice(index, 1);
      return [SKIP, index];
    }
    if (node.type === "imageReference" || node.type === "linkReference") {
      const identifier = "identifier" in node && typeof node.identifier === "string" ? node.identifier : "";
      const def = definition(identifier);
      if (def && parent !== null && typeof index === "number") {
        const replacement = node.type === "imageReference" ? { type: "image", url: def.url, title: def.title, alt: node.alt } : {
          type: "link",
          url: def.url,
          title: def.title,
          children: node.children
        };
        parent.children[index] = replacement;
        return [SKIP, index];
      }
    }
  });
}

// src/convert/parse/index.ts
var parser = unified().use(remarkParse).use(customRemarkGfm());
function parseToAst(markdown) {
  const ast = parser.parse(markdown);
  transformInlineLinks(ast);
  return ast;
}
function parse(markdown) {
  const ast = parseToAst(markdown);
  if (ast.children.length === 0) {
    return [{ type: "paragraph", children: [{ text: "" }] }];
  }
  return parseContents(ast.children);
}

// src/convert/serialize/normalize/normalizeElementListDepths.ts
function isListItemElement(element) {
  return element.type === "ordered-list-item" || element.type === "unordered-list-item" || element.type === "task-list-item";
}
function normalizeElementListDepths(elements) {
  const normalizedElements = [];
  let previousDepth = -1;
  for (const element of elements) {
    if (!isListItemElement(element)) {
      normalizedElements.push(element);
      previousDepth = -1;
      continue;
    }
    const nextDepth = element.depth > previousDepth + 1 ? previousDepth + 1 : element.depth;
    normalizedElements.push({ ...element, depth: nextDepth });
    previousDepth = nextDepth;
  }
  return normalizedElements;
}

// src/convert/serialize/serialize-code-block/serialize-code-line.ts
function serializeCodeLine(codeLine) {
  if (codeLine.type !== "code-block-line")
    throw new Error(
      `Expected all children of code-block to be a codeline but is ${JSON.stringify(
        codeLine,
        null,
        2
      )}`
    );
  return codeLine.children.map((segment) => segment.text).join("");
}

// src/convert/serialize/serialize-code-block/index.ts
function serializeCodeBlock(codeBlock) {
  const lines = [];
  let backticks = 3;
  for (const codeLine of codeBlock.children) {
    const lineOfCode = serializeCodeLine(codeLine);
    const match = lineOfCode.match(/^([`]+)/);
    if (match)
      backticks = Math.max(backticks, match[1].length + 1);
    lines.push(lineOfCode);
  }
  lines.unshift(`${"`".repeat(backticks)}${codeBlock.language}`);
  lines.push(`${"`".repeat(backticks)}`);
  return `${lines.join("\n")}

`;
}

// src/convert/serialize/serialize-image-shared/serialize-generic-image-url.ts
function serializeGenericImageUrl(image) {
  return image.url;
}

// src/convert/serialize/serialize-image-shared/serialize-portive-image-url.ts
function serializePortiveImageUrl(image) {
  if (image.url.startsWith("$"))
    return "";
  const { hostname } = parseUrl(image.url);
  if (hostname.match(/[.]portive[.]com$/i) && image.width && image.height)
    return `${image.url}?size=${image.width}x${image.height}`;
}

// src/convert/serialize/serialize-image-shared/serialize-uncommonmark-image-url.ts
function serializeUncommonmarkImageUrl(image) {
  if (image.width && image.height && image.srcWidth && image.srcHeight)
    return `${image.url}#srcSize=${image.srcWidth}x${image.srcHeight}&size=${image.width}x${image.height}`;
}

// src/convert/serialize/serialize-image-shared/index.ts
var urlSerializers = [
  serializePortiveImageUrl,
  serializeUncommonmarkImageUrl,
  serializeGenericImageUrl
];
function serializeImageShared(image) {
  for (const urlSerializer of urlSerializers) {
    const url = urlSerializer(image);
    if (typeof url === "string") {
      if (url === "")
        return "";
      return `![${image.alt}](${url}${typeof image.title === "string" ? ` "${image.title}"` : ""})`;
    }
  }
  throw new Error(`Shouldn't get here`);
}

// src/convert/serialize/serialize-image-block/index.ts
function serializeImageBlock(element) {
  const imageMarkdown = serializeImageShared(element);
  return imageMarkdown ? `${imageMarkdown}

` : "";
}

// src/convert/serialize/serialize-line/serialize-line.ts
import { Element as SlateElement, Text as SlateText5 } from "slate";

// src/convert/serialize/serialize-line/diff-marks/find-marks-to-add.ts
function findMarksToAdd(orderedMarks, targetMarks) {
  const marksWeNeedToAdd = targetMarks.filter(
    (mark) => !orderedMarks.includes(mark)
  );
  const orderedMarksToAdd = sortMarks(marksWeNeedToAdd);
  return { orderedMarksToAdd };
}

// src/convert/serialize/serialize-line/diff-marks/find-marks-to-remove.ts
function findMarksToRemove(orderedMarks, targetMarks) {
  const nextOrderedMarks = [...orderedMarks];
  const marksWeNeedToRemove = orderedMarks.filter(
    (mark) => !targetMarks.includes(mark)
  );
  const orderedMarksToRemove = [];
  for (let i = 0; i < orderedMarks.length; i++) {
    if (marksWeNeedToRemove.length === 0)
      break;
    const markToRemove = nextOrderedMarks.pop();
    if (markToRemove === void 0) {
      throw new Error(
        `This shouldn't happen unless we made a mistake in the algorithm`
      );
    }
    orderedMarksToRemove.push(markToRemove);
    const index = marksWeNeedToRemove.indexOf(markToRemove);
    if (index !== -1) {
      marksWeNeedToRemove.splice(index, 1);
    }
  }
  return { orderedMarksToRemove, nextOrderedMarks };
}

// src/convert/serialize/serialize-line/diff-marks/index.ts
function diffMarks(orderedMarks, targetMarks) {
  const { orderedMarksToRemove, nextOrderedMarks } = findMarksToRemove(
    orderedMarks,
    targetMarks
  );
  const { orderedMarksToAdd } = findMarksToAdd(nextOrderedMarks, targetMarks);
  return {
    remove: orderedMarksToRemove,
    add: orderedMarksToAdd,
    nextOrderedMarks: [...nextOrderedMarks, ...orderedMarksToAdd]
  };
}

// src/convert/serialize/serialize-line/normalize-line/index.ts
import { Element as Element2 } from "slate";

// src/convert/serialize/serialize-line/normalize-line/normalizers/merge-adjacent-spaces.ts
function mergeAdjacentSpaces({
  node,
  nextNode,
  nodes,
  index
}) {
  if (!isText(node) || !isPlainSpace(node) || node.code)
    return false;
  if (!isText(nextNode) || !isPlainSpace(nextNode) || node.code)
    return false;
  nodes.splice(index, 2, { text: `${node.text}${nextNode.text}` });
  return true;
}

// src/convert/serialize/serialize-line/normalize-line/normalizers/move-spaces-out-of-anchors.ts
function moveSpacesAtStartOfAnchor({
  node,
  nodes,
  prevNode,
  index
}) {
  if (!isElement(node))
    return false;
  if (node.type !== "anchor")
    return false;
  node;
  const firstChild = node.children[0];
  if (isText(firstChild) && isPlainSpace(firstChild)) {
    node.children.splice(0, 1);
    if (isText(prevNode) && isPlainSpace(prevNode)) {
      prevNode.text = `${prevNode.text}${firstChild.text}`;
    } else {
      nodes.splice(index, 0, { text: firstChild.text });
    }
    return true;
  }
  return false;
}
function moveSpacesAtEndOfAnchor({
  node,
  nodes,
  nextNode,
  index
}) {
  if (!isElement(node))
    return false;
  if (node.type !== "anchor")
    return false;
  node;
  const lastChild = node.children[node.children.length - 1];
  if (isText(lastChild) && isPlainSpace(lastChild)) {
    node.children.splice(node.children.length - 1, 1);
    if (isText(nextNode) && isPlainSpace(nextNode)) {
      nextNode.text = `${lastChild.text}${nextNode.text}`;
    } else {
      nodes.splice(index + 1, 0, { text: lastChild.text });
    }
    return true;
  }
  return false;
}

// src/convert/serialize/serialize-line/normalize-line/normalizers/must-have-one-text-child.ts
function mustHaveOneTextChild({ node }) {
  if (!isElement(node))
    return false;
  if (node.type !== "line")
    return false;
  if (node.children.length > 0)
    return false;
  node.children.push({ text: "" });
  return true;
}

// src/convert/serialize/serialize-line/normalize-line/normalizers/slice-spaces-at-node-boundaries.ts
function sliceSpacesAtNodeBoundaries({
  node,
  nodes,
  index
}) {
  if (!isText(node))
    return false;
  if (isPlainSpace(node))
    return false;
  if (node.code)
    return false;
  const match = node.text.match(/^(\s*)(.*?)(\s*)$/);
  if (!match)
    return false;
  if (match[1].length === 0 && match[3].length === 0)
    return false;
  const nextSegments = [
    { text: match[1] },
    { ...node, text: match[2] },
    { text: match[3] }
  ].filter((text) => text.text !== "");
  nodes.splice(index, 1, ...nextSegments);
  return true;
}

// src/convert/serialize/serialize-line/normalize-line/normalizers/trim-spaces-at-end-of-line.ts
function trimSpaceAtEndOfLine({
  index,
  nodes,
  node,
  parent
}) {
  if (index !== nodes.length - 1)
    return false;
  if (nodes.length <= 1)
    return false;
  if (!isText(node))
    return false;
  if (!isPlainSpace(node))
    return false;
  if (parent && isElement(parent) && parent.type === "line") {
    nodes.splice(nodes.length - 1, 1);
    return true;
  }
  return false;
}

// src/convert/serialize/serialize-line/normalize-line/normalizers/trim-spaces-at-start-of-line.ts
function trimSpaceAtStartOfLine({
  index,
  nodes,
  node,
  parent
}) {
  if (index !== 0)
    return false;
  if (nodes.length === 0)
    return false;
  if (!isText(node))
    return false;
  if (!isPlainSpace(node))
    return false;
  if (parent && isElement(parent) && parent.type === "line") {
    nodes.splice(0, 1);
    return true;
  }
  return false;
}

// src/convert/serialize/serialize-line/normalize-line/normalizers/index.ts
var normalizers = [
  sliceSpacesAtNodeBoundaries,
  moveSpacesAtStartOfAnchor,
  moveSpacesAtEndOfAnchor,
  mergeAdjacentSpaces,
  trimSpaceAtStartOfLine,
  trimSpaceAtEndOfLine,
  mustHaveOneTextChild
];

// src/convert/serialize/serialize-line/normalize-line/run-normalizers-on-node.ts
function runNormalizersOnNode(normalizeOptions) {
  for (const normalizer of normalizers) {
    const isHandled = normalizer(normalizeOptions);
    if (isHandled) {
      return true;
    }
  }
  return false;
}

// src/convert/serialize/serialize-line/normalize-line/normalize-nodes.ts
var MAX_RERUNS = 72;
function normalizeNodes(nodes, parent) {
  let isAnyUpdated = false;
  let isUpdated;
  let runs = 0;
  const maxReruns = (nodes.length + 1) * MAX_RERUNS;
  do {
    isUpdated = false;
    runs = runs + 1;
    if (runs > maxReruns)
      throw new Error(
        `There have been ${runs} normalization passes (72x the number of nodes at this level). This likely indicates a bug in the code.`
      );
    segmentLoop:
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isElement(node)) {
          const isChildrenUpdated = normalizeNodes(
            node.children,
            node
          );
          if (isChildrenUpdated) {
            isUpdated = true;
            isAnyUpdated = true;
            break segmentLoop;
          }
        }
        const prevNode = nodes[i - 1];
        const nextNode = nodes[i + 1];
        const options = {
          parent,
          node,
          prevNode,
          nextNode,
          index: i,
          nodes
        };
        if (runNormalizersOnNode(options)) {
          isUpdated = true;
          isAnyUpdated = true;
          break segmentLoop;
        }
      }
  } while (isUpdated);
  return isAnyUpdated;
}

// src/convert/serialize/serialize-line/normalize-line/index.ts
var duplicateSegments = (segments) => {
  return segments.map((segment) => {
    if (Element2.isElement(segment) && segment.type === "anchor") {
      return {
        ...segment,
        children: duplicateSegments(segment.children)
      };
    } else {
      return segment;
    }
  });
};
function normalizeLine(segments) {
  const line = {
    type: "line",
    children: duplicateSegments(segments)
  };
  normalizeNodes([line], void 0);
  return line.children;
}

// src/convert/serialize/serialize-line/segment/serialize-segment.ts
import { Text as SlateText4 } from "slate";

// src/convert/serialize/serialize-line/segment/serialize-code-text.ts
function serializeCodeText(text) {
  let max = 0;
  for (const match of text.text.matchAll(/[`]+/g)) {
    max = Math.max(max, match[0].length);
  }
  if (max === 0)
    return `\`${text.text.replace(/[`]/g, "\\`")}\``;
  return `${"`".repeat(max + 1)} ${text.text} ${"`".repeat(max + 1)}`;
}

// src/convert/serialize/serialize-line/segment/serialize-anchor.ts
function escapeTitle(title) {
  return title.replace(/"/g, '\\"');
}
function serializeAnchor(anchor) {
  const commonAnchorMarks = getCommonAnchorMarks(anchor.children);
  if (anchor.href.startsWith("$"))
    return serializeLine(
      anchor.children,
      commonAnchorMarks,
      commonAnchorMarks
    );
  if (typeof anchor.title === "string" && anchor.title.length > 0) {
    return (
      /**
       * TODO: Handle anchor children more elegantly in serializeAnchor.
       *
       * We type cast `children` as `Segment` here because the children of an
       * `anchor` is limited to be Inline types. There are two things to do
       * related to this though:
       *
       * - [ ] consider fixing the `anchor` type to actually limit the
       *   children as expected.
       * - [ ] consider expanding the definition of `Segment` to include
       *   inline images as that is an acceptable inline value which is
       *   currently not defined as part of Segment.
       */
      `[${serializeLine(
        anchor.children,
        commonAnchorMarks,
        commonAnchorMarks
      )}](${anchor.href} "${escapeTitle(anchor.title)}")`
    );
  } else {
    return (
      /**
       * TODO: Handle anchor children more elegantly in serializeAnchor.
       *
       * We type cast `children` as `Segment` here because the children of an
       * `anchor` is limited to be Inline types. There are two things to do
       * related to this though:
       *
       * - [ ] consider fixing the `anchor` type to actually limit the
       *   children as expected.
       * - [ ] consider expanding the definition of `Segment` to include
       *   inline images as that is an acceptable inline value which is
       *   currently not defined as part of Segment.
       */
      `[${serializeLine(
        anchor.children,
        commonAnchorMarks,
        commonAnchorMarks
      )}](${anchor.href})`
    );
  }
}

// src/convert/serialize/serialize-line/segment/serialize-non-code-text.ts
function serializeNonCodeText(text) {
  return escapeText(text.text);
}

// src/convert/serialize/serialize-line/segment/serialize-segment.ts
function serializeSegment(segment) {
  if (SlateText4.isText(segment)) {
    if (segment.code)
      return serializeCodeText(segment);
    return serializeNonCodeText(segment);
  }
  switch (segment.type) {
    case "anchor": {
      return serializeAnchor(segment);
    }
    case "image-inline":
      return serializeImageShared(segment);
    default:
      assertUnreachable(segment);
  }
}

// src/convert/serialize/serialize-line/serialize-line.ts
function serializeLine(inputSegments, leadingMarks = [], trailingMarks = []) {
  const segments = normalizeLine(inputSegments);
  const substrings = [];
  let leadingDiff = diffMarks(leadingMarks, getMarksFromSegment(segments[0]));
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (SlateText5.isText(segment) && isPlainSpace(segment)) {
      substrings.push(segment.text);
      continue;
    }
    substrings.push(convertMarksToSymbolsExceptCode(leadingDiff.add));
    substrings.push(serializeSegment(segment));
    const nextMarks = getNextMarks(segments, i, trailingMarks);
    const trailingDiff = diffMarks(leadingDiff.nextOrderedMarks, nextMarks);
    substrings.push(convertMarksToSymbolsExceptCode(trailingDiff.remove));
    leadingDiff = trailingDiff;
  }
  return substrings.join("");
}
function getNextMarks(segments, index, trailingMarks) {
  for (let i = index + 1; i < segments.length; i++) {
    const segment = segments[i];
    if (isPlainSpace(segment))
      continue;
    if (SlateElement.isElement(segment)) {
      const element = segment;
      if (element.type === "image-inline")
        continue;
    }
    return getMarksFromSegment(segment);
  }
  return trailingMarks;
}

// src/convert/serialize/serialize-table/index.ts
function serializeTable(element) {
  const lines = [];
  lines.push(serializeTableRow(element.children[0]));
  lines.push(serializeColumns(element.columns));
  element.children.slice(1).forEach((row) => {
    lines.push(serializeTableRow(row));
  });
  return `${lines.join("\n")}

`;
}
function serializeColumns(columns) {
  const isAllLeft = columns.every((column) => column.align === "left");
  if (isAllLeft) {
    return `|${columns.map(() => "---").join("|")}|`;
  }
  return `|${columns.map((column) => serializeAlign(column.align)).join("|")}|`;
}
function serializeAlign(align) {
  switch (align) {
    case "left":
      return ":---";
    case "center":
      return ":---:";
    case "right":
      return "---:";
  }
}
function serializeTableRow(element) {
  assertElementType(element, "table-row");
  return `|${element.children.map(serializeTableCell).join("|")}|`;
}
function serializeTableCell(element) {
  assertElementType(element, "table-cell");
  assert(
    element.children.length === 1,
    `Expected table-cell to have one child but is ${JSON.stringify(
      element.children
    )}`
  );
  return element.children.map(serializeTableContent).join();
}
function serializeTableContent(element) {
  assertElementType(element, "table-content");
  return serializeLine(element.children);
}

// src/convert/serialize/serialize-element.ts
var LIST_INDENT_SIZE = 4;
function serializeElement(element, orders) {
  switch (element.type) {
    case "anchor":
      return `[${serializeLine(element.children)}](${element.href})`;
    case "block-quote": {
      const lines = serializeElements(element.children);
      return `${lines.split("\n").map((line) => `> ${line}`.trim()).join("\n")}

`;
    }
    case "heading":
      return `${"#".repeat(element.level)} ${serializeLine(
        element.children
      )}

`;
    case "horizontal-rule":
      return "---\n\n";
    case "paragraph":
      return `${serializeLine(element.children)}

`;
    case "table":
      return serializeTable(element);
    case "table-row":
    case "table-cell":
    case "table-content":
      throw new Error(
        `Table elements should only be present as children of table which should be handled by serializeTable. Got ${element.type} may indicate an error in normalization.`
      );
    case "unordered-list-item": {
      const indent2 = " ".repeat(element.depth * LIST_INDENT_SIZE);
      return `${indent2}- ${serializeLine(element.children)}
`;
    }
    case "ordered-list-item": {
      const indent2 = " ".repeat(element.depth * LIST_INDENT_SIZE);
      return `${indent2}${orders[element.depth]}. ${serializeLine(
        element.children
      )}
`;
    }
    case "task-list-item": {
      const indent2 = " ".repeat(element.depth * LIST_INDENT_SIZE);
      let line = serializeLine(element.children);
      if (line.trim() === "") {
        line = "&#32;";
      }
      return `${indent2}- [${element.checked ? "x" : " "}] ${line}
`;
    }
    case "image-block":
      return serializeImageBlock(element);
    case "code-block":
      return serializeCodeBlock(element);
    case "code-block-line":
      throw new Error(
        `Code block line elements should only be present as children of code-block which should be handled by serializeCodeBlock. Got code-block-line may indicate an error in normalization.`
      );
  }
  assertUnreachable(element);
}

// src/convert/serialize/serialize-elements.ts
function serializeElements(elements) {
  const segments = [];
  let orders = [];
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const nextElement = i < elements.length - 1 ? elements[i + 1] : null;
    if (element.type === "ordered-list-item") {
      orders[element.depth] = (orders[element.depth] || 0) + 1;
      orders = orders.slice(0, element.depth + 1);
    } else if (element.type === "unordered-list-item" || element.type === "task-list-item") {
      orders = orders.slice(0, element.depth);
    } else {
      orders = [];
    }
    let serialized = serializeElement(element, orders);
    if ((element.type === "ordered-list-item" || element.type === "unordered-list-item" || element.type === "task-list-item") && (!nextElement || nextElement.type !== "ordered-list-item" && nextElement.type !== "unordered-list-item" && nextElement.type !== "task-list-item")) {
      serialized = serialized.replace(/\n$/, "\n\n");
    }
    segments.push(serialized);
  }
  const joined = segments.join("");
  if (joined.trim() === "")
    return "";
  return replaceConsecutiveNewlines(replaceLeadingNewlines(joined)).trim();
}
function replaceLeadingNewlines(input) {
  return input.replace(/^\n\n/g, "&nbsp;\n\n");
}
function replaceConsecutiveNewlines(input) {
  return input.replace(/(\n{4,})/g, (match) => {
    const newlineCount = match.length;
    const count = Math.floor((newlineCount - 2) / 2);
    return "\n\n" + Array(count).fill("&nbsp;").join("\n\n") + "\n\n";
  });
}

// src/convert/serialize/index.ts
function serialize(elements) {
  const normalizedElements = normalizeElementListDepths(elements);
  return serializeElements(normalizedElements);
}

// src/utils/translations.ts
var translations = {
  ja: {
    bold: "\u592A\u5B57",
    italic: "\u659C\u4F53",
    strike: "\u53D6\u308A\u6D88\u3057\u7DDA",
    inlineCode: "\u30A4\u30F3\u30E9\u30A4\u30F3\u30B3\u30FC\u30C9",
    underline: "\u4E0B\u7DDA",
    increaseDepth: "\u968E\u5C64\u3092\u6DF1\u304F\u3059\u308B",
    decreaseDepth: "\u968E\u5C64\u3092\u6D45\u304F\u3059\u308B",
    heading1: "\u898B\u51FA\u30571",
    heading2: "\u898B\u51FA\u30572",
    heading3: "\u898B\u51FA\u30573",
    normal: "\u6A19\u6E96",
    paragraph: "\u6BB5\u843D",
    paragraphStyle: "\u6BB5\u843D\u30B9\u30BF\u30A4\u30EB",
    bulletList: "\u7B87\u6761\u66F8\u304D",
    numberedList: "\u756A\u53F7\u4ED8\u304D\u30EA\u30B9\u30C8",
    checkList: "\u30C1\u30A7\u30C3\u30AF\u30EA\u30B9\u30C8",
    list: "\u30EA\u30B9\u30C8",
    linkUrl: "\u30EA\u30F3\u30AF\u306EURL",
    tooltipText: "\u30C4\u30FC\u30EB\u30C1\u30C3\u30D7\u30C6\u30AD\u30B9\u30C8",
    tooltipHint: "\u30DE\u30A6\u30B9\u30DB\u30D0\u30FC\u6642\u306B\u8868\u793A\u3055\u308C\u308B\u30C4\u30FC\u30EB\u30C1\u30C3\u30D7",
    apply: "\u9069\u7528",
    cancel: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    insertLink: "\u30EA\u30F3\u30AF",
    quote: "\u5F15\u7528",
    insertTable: "\u8868",
    insertImage: "\u753B\u50CF",
    insertImageFromUrl: "\u753B\u50CF",
    insert: "\u633F\u5165",
    format: "\u66F8\u5F0F",
    imageUrlRequired: "\u753B\u50CFURL\uFF08\u5FC5\u9808\uFF09\uFF1A",
    altText: "\u4EE3\u66FF\u30C6\u30AD\u30B9\u30C8\uFF1A",
    title: "\u30C4\u30FC\u30EB\u30C1\u30C3\u30D7\uFF1A",
    imageDescription: "\u753B\u50CF\u306E\u8AAC\u660E",
    imageTitle: "\u753B\u50CF\u306E\u30C4\u30FC\u30EB\u30C1\u30C3\u30D7",
    switchToVisualEditor: "\u30D3\u30B8\u30E5\u30A2\u30EB\u30A8\u30C7\u30A3\u30BF\u306B\u5207\u308A\u66FF\u3048",
    switchToRawMarkdown: "\u30DE\u30FC\u30AF\u30C0\u30A6\u30F3\u8868\u793A\u306B\u5207\u308A\u66FF\u3048",
    codeBlock: "\u30B3\u30FC\u30C9\u30D6\u30ED\u30C3\u30AF",
    increaseQuoteDepth: "\u5F15\u7528\u3092\u91CD\u306D\u308B",
    register: "\u767B\u9332",
    imageSourceUrl: "URL",
    imageSourceFile: "\u30D5\u30A1\u30A4\u30EB",
    selectFile: "\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E",
    uploading: "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u4E2D..."
  },
  en: {
    bold: "Bold",
    italic: "Italic",
    strike: "Strikethrough",
    inlineCode: "Inline Code",
    underline: "Underline",
    increaseDepth: "Increase Depth",
    decreaseDepth: "Decrease Depth",
    heading1: "Heading 1",
    heading2: "Heading 2",
    heading3: "Heading 3",
    normal: "Normal",
    paragraph: "Paragraph",
    paragraphStyle: "Paragraph Style",
    bulletList: "Bullet List",
    numberedList: "Numbered List",
    checkList: "Check List",
    list: "List",
    linkUrl: "Link URL",
    tooltipText: "Tooltip Text",
    tooltipHint: "Tooltip shown on mouse hover",
    apply: "Apply",
    cancel: "Cancel",
    insertLink: "Link",
    quote: "Quote",
    insertTable: "Table",
    insertImage: "Image",
    insertImageFromUrl: "Image",
    insert: "Insert",
    format: "Format",
    imageUrlRequired: "Image URL (required):",
    altText: "Alt Text:",
    title: "tooltip:",
    imageDescription: "Description of the image",
    imageTitle: "tooltip",
    switchToVisualEditor: "Switch to visual editor",
    switchToRawMarkdown: "Switch to raw markdown",
    codeBlock: "Code Block",
    increaseQuoteDepth: "Increase Quote Depth",
    register: "Register",
    imageSourceUrl: "URL",
    imageSourceFile: "File",
    selectFile: "Select File",
    uploading: "Uploading..."
  }
};
var getLanguage = () => {
  try {
    if (typeof window !== "undefined" && window.navigator) {
      return window.navigator.language.split("-")[0];
    }
  } catch (e) {
  }
  return "en";
};
var t = (key2) => {
  const lang = getLanguage();
  return translations[lang === "ja" ? "ja" : "en"][key2];
};
var r = (value) => {
  const lang = getLanguage();
  const key2 = Object.keys(translations[lang === "ja" ? "ja" : "en"]).find(
    (k) => translations[lang === "ja" ? "ja" : "en"][k] === value
  );
  return key2 || "";
};

// src/sink/create-plugin/index.ts
var createPlugin = (fn) => {
  return { fn };
};

// src/sink/editable/index.tsx
import { useEffect, useMemo } from "react";
import { Editor } from "slate";
import { useSlateStatic } from "slate-react";

// src/sink/editable/utils.ts
function defined(value) {
  return !!value;
}

// src/sink/editable/create-decorate.ts
function createDecorate(originalFn, plugins2) {
  const fns = plugins2.map((plugin) => plugin.editableProps?.decorate).filter(defined);
  return function(entry) {
    const ranges = [];
    for (const fn of fns) {
      const resultRanges = fn(entry);
      ranges.push(...resultRanges);
    }
    if (originalFn)
      ranges.push(...originalFn(entry));
    return ranges;
  };
}

// src/sink/editable/create-editable.tsx
import { Editable } from "slate-react";
import { jsx } from "react/jsx-runtime";
function createEditable(plugins2) {
  const fns = plugins2.map((plugin) => plugin.renderEditable).filter(defined);
  let CurrentRenderEditable = (props) => /* @__PURE__ */ jsx(Editable, { ...props });
  for (const fn of fns) {
    const PrevRenderEditable = CurrentRenderEditable;
    CurrentRenderEditable = (props) => {
      return fn({
        attributes: props,
        Editable: PrevRenderEditable
      });
    };
  }
  return CurrentRenderEditable;
}

// src/sink/editable/create-handler.ts
function extractEditableFns(plugins2, key2) {
  const fns = [];
  for (const plugin of plugins2) {
    const maybeFn = plugin.editableProps?.[key2];
    if (maybeFn)
      fns.push(maybeFn);
  }
  return fns;
}
function createHandlerFn(fns, originalFn) {
  return function(event) {
    for (const fn of fns) {
      if (fn(event))
        return;
    }
    originalFn?.(event);
  };
}
var createOnKeyDown = (originalFn, plugins2) => {
  const fns = extractEditableFns(plugins2, "onKeyDown");
  return createHandlerFn(fns, originalFn);
};
var createOnKeyUp = (originalFn, plugins2) => {
  const fns = extractEditableFns(plugins2, "onKeyUp");
  return createHandlerFn(fns, originalFn);
};
var createOnPaste = (originalFn, plugins2) => {
  const fns = extractEditableFns(plugins2, "onPaste");
  return createHandlerFn(fns, originalFn);
};
var createOnDrop = (originalFn, plugins2) => {
  const fns = extractEditableFns(plugins2, "onDrop");
  return createHandlerFn(fns, originalFn);
};

// src/sink/editable/create-render-element.ts
function createRenderElement(originalFn, plugins2) {
  const fns = plugins2.map((plugin) => plugin.editableProps?.renderElement).filter(defined);
  return function renderElement5(renderElementProps) {
    for (const fn of fns) {
      const result = fn(renderElementProps);
      if (result)
        return result;
    }
    if (originalFn === void 0) {
      throw new Error(
        `Element with type ${renderElementProps.element.type} not handled. Note that renderElement is not defined on SinkEditable so this is only the result of checking the Sink Plugins.`
      );
    }
    return originalFn(renderElementProps);
  };
}

// src/sink/editable/create-render-leaf.ts
import { cloneElement } from "react";
function createRenderLeaf(originalFn, plugins2) {
  if (originalFn === void 0) {
    throw new Error(`renderLeaf was not defined on SinkEditable`);
  }
  const fns = plugins2.map((plugin) => plugin.editableProps?.renderLeaf).filter(defined).reverse();
  return function(renderLeafProps) {
    let value = originalFn({
      ...renderLeafProps,
      /**
       * We override this because `attributes` should only appear on the
       * uppermost leaf element if there are several nested ones and it's
       * possible that this won't be the uppermost leaf.
       *
       * We add attributes back on at the very end so no need to worry if
       * we omit it here.
       */
      attributes: {}
    });
    for (const fn of fns) {
      const possibleValue = fn({
        ...renderLeafProps,
        children: value
      });
      if (possibleValue) {
        value = possibleValue;
      }
    }
    value = cloneElement(value, renderLeafProps.attributes);
    return value;
  };
}

// src/sink/editable/create-render-placeholder.tsx
function createRenderPlaceholder(originalFn, plugins2) {
  if (originalFn)
    return originalFn;
  const fns = plugins2.map((plugin) => plugin.editableProps?.renderPlaceholder).filter(defined);
  if (fns.length === 0)
    return void 0;
  return function(renderPlaceholderProps) {
    if (fns.length > 1) {
      throw new Error(
        `Only one plugin can define renderPlaceholder but there are ${fns.length}`
      );
    }
    const fn = fns[0];
    if (fn == null)
      throw new Error(`Expected fn to be defined`);
    return fn(renderPlaceholderProps);
  };
}

// src/sink/editable/styles.tsx
import styled from "@emotion/styled";
var SinkReset = styled("div")`
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  box-sizing: border-box;
`;

// src/sink/editable/index.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function SinkEditable(originalProps) {
  const editor = useSlateStatic();
  useEffect(() => {
    Editor.normalize(editor, { force: true });
  }, []);
  const { plugins: plugins2 } = editor.sink;
  const nextProps = useMemo(
    () => ({
      ...originalProps,
      decorate: createDecorate(originalProps.decorate, plugins2),
      renderElement: createRenderElement(originalProps.renderElement, plugins2),
      renderLeaf: createRenderLeaf(originalProps.renderLeaf, plugins2),
      renderPlaceholder: createRenderPlaceholder(
        originalProps.renderPlaceholder,
        plugins2
      ),
      /**
       * NOTE: We skip `onKeyUp` as it is deprecated. If somebody needs it in new
       * code, we can add it back in.
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/Element/keypress_event
       */
      onKeyDown: createOnKeyDown(originalProps.onKeyDown, plugins2),
      onKeyUp: createOnKeyUp(originalProps.onKeyUp, plugins2),
      onPaste: createOnPaste(originalProps.onPaste, plugins2),
      onDrop: createOnDrop(originalProps.onDrop, plugins2)
    }),
    Object.values(originalProps)
  );
  const NextEditable = useMemo(() => createEditable(plugins2), [plugins2]);
  return /* @__PURE__ */ jsx2(NextEditable, { ...nextProps });
}

// src/sink/editor/create-boolean-action.ts
function createBooleanAction(editor, actionKey, plugins2) {
  const originalAction = editor[actionKey];
  const actionPlugins = plugins2.filter((plugin) => plugin.editor?.[actionKey]);
  return function nextBooleanAction(node) {
    for (const plugin of actionPlugins) {
      const result = plugin.editor?.[actionKey]?.(node);
      if (typeof result === "boolean")
        return result;
    }
    return originalAction(node);
  };
}

// src/sink/editor/create-void-action.ts
function createVoidAction(editor, actionKey, plugins2) {
  const originalAction = editor[actionKey];
  const actionPlugins = plugins2.filter((plugin) => plugin.editor?.[actionKey]);
  return function nextVoidAction(...args) {
    let isHandled = false;
    const afterHandledCallbacks = [];
    for (const plugin of actionPlugins) {
      const response = plugin.editor?.[actionKey]?.(...args);
      if (typeof response === "function") {
        afterHandledCallbacks.push(response);
      } else if (response === true) {
        isHandled = true;
        break;
      }
    }
    if (!isHandled) {
      originalAction(...args);
    }
    afterHandledCallbacks.forEach((callback) => callback());
  };
}

// src/sink/editor/index.ts
function createWithSink(pluginFns) {
  return (originalEditor, options) => {
    const editor = originalEditor;
    const plugins2 = pluginFns.map(
      (plugin) => plugin(editor, options, { createPolicy: (x) => x })
    );
    editor.sink = { plugins: plugins2 };
    editor.isMaster = "isMaster" in editor ? editor.isMaster : () => false;
    editor.isSlave = "isSlave" in editor ? editor.isSlave : () => false;
    editor.isStandalone = "isStandalone" in editor ? editor.isStandalone : () => false;
    Object.assign(editor, {
      /**
       * void
       */
      normalizeNode: createVoidAction(editor, "normalizeNode", plugins2),
      deleteBackward: createVoidAction(editor, "deleteBackward", plugins2),
      deleteForward: createVoidAction(editor, "deleteForward", plugins2),
      deleteFragment: createVoidAction(editor, "deleteFragment", plugins2),
      insertBreak: createVoidAction(editor, "insertBreak", plugins2),
      insertFragment: createVoidAction(editor, "insertFragment", plugins2),
      insertNode: createVoidAction(editor, "insertNode", plugins2),
      insertText: createVoidAction(editor, "insertText", plugins2),
      /**
       * boolean
       */
      isInline: createBooleanAction(editor, "isInline", plugins2),
      isVoid: createBooleanAction(editor, "isVoid", plugins2),
      isMaster: createBooleanAction(editor, "isMaster", plugins2),
      isSlave: createBooleanAction(editor, "isSlave", plugins2),
      isStandalone: createBooleanAction(editor, "isStandalone", plugins2)
    });
    return editor;
  };
}

// src/sink/create-sink/index.tsx
var createSink = (pluginFunctions) => {
  const fns = pluginFunctions.map((plugin) => plugin.fn);
  const withSink2 = createWithSink(fns);
  const returnValue = { withSink: withSink2, SinkEditable };
  return returnValue;
};

// src/sink/is-debug.ts
var isDebug = false;

// src/sink/utils/core-utils/better-at.ts
import { Element as Element3 } from "slate";
import { ReactEditor } from "slate-react";
function betterAt(editor, at) {
  if (!Element3.isElement(at))
    return at;
  return ReactEditor.findPath(editor, at);
}

// src/sink/utils/core-utils/curry.ts
function curryOne(fn, curriedArg) {
  return fn.bind(null, curriedArg);
}
function curryTwo(fn, arg1, arg2) {
  return fn.bind(null, arg1, arg2);
}

// src/sink/utils/core-utils/is-mac.ts
var IS_MAC_REGEX = /mac os x|macintosh/i;
var isMacValue = void 0;
function isMac() {
  if (isMacValue !== void 0)
    return isMacValue;
  try {
    const { userAgent } = window.navigator;
    isMacValue = IS_MAC_REGEX.test(userAgent);
  } catch {
    isMacValue = false;
  }
  return isMacValue;
}

// src/sink/utils/core-utils/stop-event.ts
function stopEvent(e) {
  e.preventDefault();
  e.stopPropagation();
}

// src/sink/utils/find-utils/find-element-up.ts
import { Editor as Editor3, Path } from "slate";

// src/sink/utils/standardize-utils/standardize-node-matcher.ts
import { Element as Element4 } from "slate";
function standardizeNodeMatcher(matchNode) {
  if (typeof matchNode === "function")
    return matchNode;
  if (typeof matchNode === "string")
    return (node) => Element4.isElement(node) && node.type === matchNode;
  if (Array.isArray(matchNode))
    return (node) => Element4.isElement(node) && matchNode.includes(node.type);
  throw new Error(
    `Expected matchNode to be a function, string or array but is ${matchNode}`
  );
}

// src/sink/utils/find-utils/find-element-up.ts
function findElementUp(editor, matchNode, { at = editor.selection } = {}) {
  if (at === null)
    return;
  const nextAt = betterAt(editor, at);
  const match = standardizeNodeMatcher(matchNode);
  if (Path.isPath(nextAt)) {
    const nodeEntryExactlyAt = Editor3.node(editor, nextAt);
    if (nodeEntryExactlyAt && match(nodeEntryExactlyAt[0])) {
      return nodeEntryExactlyAt;
    }
  }
  return Editor3.above(editor, { at: nextAt, match });
}
function findElementUpPath(...args) {
  const entry = findElementUp(...args);
  return entry?.[1];
}

// src/sink/utils/icon-utils/tabler-icon.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var TablerIcon = ({
  strokeWidth = 1.5,
  ...props
}) => /* @__PURE__ */ jsx3(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    strokeWidth,
    stroke: "currentColor",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
    ...props
  }
);

// src/sink/utils/is-utils/is-collapsed.ts
import { Range } from "slate";
function isCollapsed(selection) {
  if (selection == null)
    return false;
  return Range.isCollapsed(selection);
}

// src/sink/utils/is-utils/is-element-type.ts
import { Element as Element6 } from "slate";
function createIsElementType(type) {
  if (Array.isArray(type)) {
    return (node) => Element6.isElement(node) && type.includes(node.type);
  } else {
    return (node) => Element6.isElement(node) && type == node.type;
  }
}

// src/sink/utils/is-utils/is-end-of-element.ts
import { Editor as Editor4 } from "slate";
function isEndOfElement(editor, matchNode) {
  const { selection } = editor;
  if (!isCollapsed(selection))
    return false;
  const entry = findElementUp(editor, matchNode, { at: selection });
  return !!entry && Editor4.isEnd(editor, selection.anchor, entry[1]);
}

// src/sink/utils/is-utils/is-in-empty-element.ts
import { Editor as Editor5 } from "slate";

// src/sink/utils/is-utils/is-start-of-element.ts
import { Editor as Editor6 } from "slate";
function isStartOfElement(editor, matchNode) {
  const { selection } = editor;
  if (!isCollapsed(selection))
    return false;
  const entry = findElementUp(editor, matchNode, { at: selection });
  return !!entry && Editor6.isStart(editor, selection.anchor, entry[1]);
}

// src/sink/utils/key-utils/create-autocomplete-space-handler.tsx
import { isHotkey } from "is-hotkey";
import { Editor as Editor7, Element as SlateElement2, Range as Range2, Transforms } from "slate";
var isSpace = isHotkey(" ");
var isShiftSpace = isHotkey("SHIFT+SPACE");
function createAutocompleteSpaceHandler(editor, methods) {
  return (e) => {
    if (!isSpace(e.nativeEvent) && !isShiftSpace(e.nativeEvent))
      return false;
    const { selection } = editor;
    if (selection === null)
      return false;
    if (Range2.isExpanded(selection))
      return false;
    const convertibleBlockEntry = findElementUp(
      editor,
      (node) => (
        /**
         * NOTE: We alias to SlateElement because this page needs acces to both
         * the global Eleent and the Slate Element.
         */
        SlateElement2.isElement(node) && editor.convertElement.isConvertibleElement(node)
      )
    );
    if (!convertibleBlockEntry)
      return false;
    const range = {
      anchor: Editor7.start(editor, convertibleBlockEntry[1]),
      focus: selection.focus
    };
    const text = Editor7.string(editor, range);
    const method = methods[text];
    if (!method)
      return false;
    stopEvent(e);
    const deleteRange = {
      anchor: Editor7.start(editor, convertibleBlockEntry[1]),
      focus: selection.focus
    };
    Transforms.delete(editor, { at: deleteRange });
    method();
    return true;
  };
}

// src/sink/utils/key-utils/is-better-hotkey.ts
import { isHotkey as isHotkey2 } from "is-hotkey";
function isBetterHotkey(hotkey) {
  const modifiedHotkey = hotkey.replace(
    /\bsuper\b/g,
    isMac() ? "cmd+alt" : "ctrl+shift"
  );
  return isHotkey2(modifiedHotkey);
}

// src/sink/utils/key-utils/create-hotkey-handler.ts
function createHotkeyHandler(shortcutsObject) {
  let shortcuts = null;
  return function handleShortcuts(event) {
    if (shortcuts == null) {
      shortcuts = Object.entries(shortcutsObject).map(([shortcut, fn]) => [
        isBetterHotkey(shortcut),
        fn
      ]);
    }
    for (const [isShortcut, action] of shortcuts) {
      if (isShortcut(event.nativeEvent)) {
        const response = action();
        if (response === true || response === void 0) {
          event.preventDefault();
          event.stopPropagation();
          return true;
        }
      }
    }
    return false;
  };
}

// src/sink/utils/normalize-utils/force-normalize-path.ts
import { Editor as Editor8, Transforms as Transforms2 } from "slate";
function forceNormalizePath(editor, path) {
  Editor8.withoutNormalizing(editor, () => {
    Transforms2.setNodes(
      editor,
      // @ts-ignore
      { __DOESNT_MATTER_JUST_TO_START_NORMALIZING__: "123" },
      { at: path }
    );
    Transforms2.setNodes(
      editor,
      // @ts-ignore
      { __DOESNT_MATTER_JUST_TO_START_NORMALIZING__: null },
      { at: path }
    );
  });
}

// src/sink/utils/normalize-utils/normalize-siblings.ts
import { Editor as Editor9 } from "slate";
function normalizeSiblings(editor, entry, transform) {
  const [, path] = entry;
  const prevEntry = Editor9.previous(editor, { at: path });
  if (prevEntry && transform(prevEntry, entry))
    return true;
  const nextEntry = Editor9.next(editor, { at: path });
  if (nextEntry && transform(entry, nextEntry))
    return true;
  return false;
}

// src/sink/utils/select-utils/index.ts
import { Editor as Editor10, Transforms as Transforms3 } from "slate";
function selectStartOfElement(editor, path) {
  Transforms3.select(editor, Editor10.start(editor, path));
}
function selectEndOfElement(editor, path) {
  Transforms3.select(editor, Editor10.end(editor, path));
}

// src/sink/utils/standardize-utils/target-element.ts
function createTargetElement(srcElement, targetElement) {
  if (typeof targetElement !== "function")
    return targetElement;
  return targetElement(srcElement);
}

// src/sink/utils/transform-utils/insert-root-element.ts
import { Editor as Editor11, Element as Element7, Path as Path4, Transforms as Transforms4 } from "slate";
function insertRootElement(editor, element, { at = editor.selection } = {}) {
  if (at == null)
    return false;
  const entry = findElementUp(
    editor,
    (node) => Element7.isElement(node) && editor.isMaster(node)
  );
  if (entry == null) {
    const selection = editor.selection;
    Editor11.withoutNormalizing(editor, () => {
      Transforms4.insertNodes(editor, element, { at });
      if (selection) {
        Transforms4.select(editor, selection);
        Transforms4.move(editor);
      }
    });
  } else {
    const nextPath = Path4.next(entry[1]);
    Editor11.withoutNormalizing(editor, () => {
      Transforms4.insertNodes(editor, element, { at: nextPath });
      Transforms4.select(editor, Editor11.start(editor, nextPath));
    });
  }
  return true;
}

// src/sink/utils/transform-utils/rewrap-element.ts
import { Editor as Editor12, Transforms as Transforms5 } from "slate";
function rewrapElement(editor, targetElement, at) {
  Editor12.withoutNormalizing(editor, () => {
    const originalEntry = Editor12.node(editor, at);
    const nextElement = createTargetElement(originalEntry[0], targetElement);
    Transforms5.wrapNodes(editor, nextElement, { at });
    Transforms5.unwrapNodes(editor, { at: [...at, 0] });
  });
}

// src/sink/utils/transform-utils/set-nodes-dynamic.ts
import { Editor as Editor13, Transforms as Transforms6 } from "slate";
function setNodesDynamic(editor, convert, options) {
  const entries = Array.from(Editor13.nodes(editor, options));
  if (entries.length === 0)
    return false;
  for (const entry of entries) {
    const [node] = entry;
    Transforms6.setNodes(editor, convert(node), { at: entry[1] });
  }
  return true;
}

// src/anchor-plugin/editable/on-paste.tsx
function onPaste(editor, e) {
  const clipboardData = e.clipboardData;
  const { types } = clipboardData;
  if (types.length > 1)
    return false;
  if (types[0] !== "text/plain")
    return false;
  const text = clipboardData.getData("text/plain");
  if (!isUrl(text))
    return false;
  e.preventDefault();
  e.stopPropagation();
  editor.anchor.insertLink(text);
  return true;
}
function isUrl(s) {
  let url;
  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:";
}

// src/anchor-plugin/methods/editLink.ts
import { Transforms as Transforms7 } from "slate";
function editLink(editor, { href, title }, { at }) {
  const link = findElementUp(editor, "anchor", { at });
  if (!link)
    return false;
  Transforms7.setNodes(editor, { href, title }, { at: link[1] });
  return true;
}

// src/anchor-plugin/methods/insertLink.ts
import { Editor as Editor15, Range as Range3, Text as Text2, Transforms as Transforms8 } from "slate";
function insertLink(editor, href, text = href, { select = true } = {}) {
  const selection = editor.selection || {
    anchor: Editor15.start(editor, [0]),
    focus: Editor15.start(editor, [0])
  };
  if (Range3.isCollapsed(selection)) {
    Transforms8.insertNodes(
      editor,
      {
        type: "anchor",
        href,
        children: [{ text }]
      },
      { select, at: selection }
    );
    if (select && editor.selection) {
      const entry = Editor15.node(editor, editor.selection);
      Transforms8.select(editor, entry[1]);
    }
  } else {
    Transforms8.wrapNodes(
      editor,
      { type: "anchor", href, children: [] },
      {
        split: true,
        match: (node) => Text2.isText(node) || Editor15.isInline(editor, node)
      }
    );
  }
}

// src/anchor-plugin/methods/removeLink.ts
import { Transforms as Transforms9 } from "slate";
function removeLink(editor, { at }) {
  const link = findElementUp(editor, "anchor", { at });
  if (!link)
    return false;
  Transforms9.unwrapNodes(editor, { at: link[1] });
  return true;
}

// src/anchor-plugin/methods/index.ts
function createAnchorMethods(editor) {
  return {
    insertLink: curryOne(insertLink, editor),
    removeLink: curryOne(removeLink, editor),
    editLink: curryOne(editLink, editor)
  };
}

// src/anchor-plugin/normalize-node/index.ts
import { Element as Element9, Transforms as Transforms10 } from "slate";
function normalizeNode(editor, entry) {
  if (!Element9.isElement(entry[0]))
    return false;
  if (entry[0].type !== "anchor")
    return false;
  const children = entry[0].children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!Element9.isElement(child) || child.type !== "anchor")
      continue;
    Transforms10.unwrapNodes(editor, { at: [...entry[1], i] });
    return true;
  }
  return false;
}

// src/anchor-plugin/render-element/anchor.tsx
import { clsx } from "clsx";
import { useEffect as useEffect3, useRef as useRef4 } from "react";
import { useSelected, useSlate } from "slate-react";

// src/use-layer/layers.tsx
import { createContext, useState } from "react";

// src/use-layer/portal.tsx
import { createPortal } from "react-dom";
function Portal({ children }) {
  return createPortal(children, document.body);
}

// src/use-layer/layers.tsx
import { jsx as jsx4, jsxs } from "react/jsx-runtime";
var LayersContext = createContext(
  /**
   * This is set to an invalid value and then typecast as the correct type.
   *
   * This is okay though because in `LayersProvider` we set the value to the
   * proper type before they are used for the first time.
   */
  {}
);
var LayerContext = createContext({});
function Layers({ children }) {
  const [layers, setLayers] = useState({});
  function openLayer(layer) {
    setLayers((layers2) => {
      return {
        ...layers2,
        [layer.type]: layer
      };
    });
  }
  function closeLayer(layerType) {
    setLayers((layers2) => {
      const nextLayers = { ...layers2 };
      delete nextLayers[layerType];
      return nextLayers;
    });
  }
  return /* @__PURE__ */ jsxs(
    LayersContext.Provider,
    {
      value: { layers, setLayers, openLayer, closeLayer },
      children: [
        children,
        Object.entries(layers).map(([, layer]) => {
          return /* @__PURE__ */ jsx4(Portal, { children: /* @__PURE__ */ jsx4(LayerContext.Provider, { value: layer, children: /* @__PURE__ */ jsx4(layer.Component, {}) }) }, layer.type);
        })
      ]
    }
  );
}

// src/use-layer/use-layer.tsx
import { useContext } from "react";
function useLayer(type) {
  const { openLayer, closeLayer, layers } = useContext(LayersContext);
  function open(Component) {
    const layer = { type, Component };
    openLayer(layer);
  }
  function close() {
    closeLayer(type);
  }
  return {
    open,
    close,
    layer: layers[type],
    type
  };
}

// src/anchor-plugin/styles.tsx
import styled2 from "@emotion/styled";
var $Anchor = styled2("a")`
  /**
   * Link colors
   */
  color: var(--link-color, blue);
  &:hover {
    color: var(--link-hover-color, blue);
  }
  /**
   * When the cursor is in the anchor and not outside the anchor, we style the
   * anchor with a very light shade. This is enough to subtly intuit to the user
   * that when they type, it will appear inside the link. When the shade is
   * not present, they intuit they are just outside the link.
   */
  border-radius: 0.125em;
  transition: background-color 250ms;
  &.--selected {
    background: var(--blue-50);
  }
`;
var $Edge = styled2("span")`
  display: inline;
  padding: 0 1px 0 0;
`;
var $ProgressBar = styled2("span")`
  position: fixed;
  width: 100px;
  background: var(--shade-50);
  height: 8px;
  border-radius: 7px;
  border: 1px solid var(--shade-400);
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;
var $ProgressBarFill = styled2("span")`
  position: absolute;
  left: 0;
  top: 0;
  height: 14px;
  background: var(--blue-400);
  transition: width 100ms linear;
`;

// src/anchor-plugin/render-element/AnchorDialog.tsx
import styled14 from "@emotion/styled";
import { useCallback as useCallback4 } from "react";
import { useSlateStatic as useSlateStatic4 } from "slate-react";

// src/shared-overlays/components/CloseMask/index.tsx
import { useRef } from "react";

// src/shared-overlays/styles/$CloseMask.tsx
import styled3 from "@emotion/styled";
var $CloseMask = styled3("div")`
  position: fixed;
  user-select: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.01);
`;

// src/shared-overlays/components/CloseMask/index.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
function CloseMask({ close }) {
  const ref = useRef(null);
  return /* @__PURE__ */ jsx5($CloseMask, { ref, onClick: close });
}

// src/shared-overlays/components/Menu/formatHotkey.ts
var key = {
  cmd: "\u2318",
  ctrl: "\u2303",
  shift: "\u21E7",
  opt: "\u2325",
  enter: "\u23CE"
};
var MAC_KEYS = {
  shift: key.shift,
  opt: key.opt,
  alt: key.opt,
  ctrl: key.ctrl,
  mod: key.cmd,
  cmd: key.cmd,
  enter: key.enter,
  super: `${key.opt}${key.cmd}`
};
var PC_KEYS = {
  alt: "ALT",
  ctrl: "CTRL",
  opt: "ALT",
  shift: "SHIFT",
  mod: "CTRL",
  cmd: "CTRL",
  enter: key.enter,
  super: "CTRL+SHIFT"
};
function pull(arr, value) {
  const index = arr.findIndex((el) => el === value);
  if (index !== -1) {
    arr.splice(index, 1);
  }
}
function formatMac(segments) {
  const result = [];
  Object.entries(MAC_KEYS).forEach(([key2, symbol]) => {
    if (segments.includes(key2)) {
      result.push(symbol);
      pull(segments, key2);
    }
  });
  result.push(...segments.map((s) => s.toUpperCase()));
  return result.join("");
}
function formatPC(segments) {
  const result = [];
  Object.entries(PC_KEYS).forEach(([key2, symbol]) => {
    if (segments.includes(key2)) {
      result.push(symbol);
      pull(segments, key2);
    }
  });
  result.push(...segments.map((s) => s.toUpperCase()));
  return result.join("+");
}
function formatHotkey(shortcut) {
  const segments = shortcut.toLowerCase().split("+");
  if (isMac()) {
    return formatMac(segments);
  } else {
    return formatPC(segments);
  }
}

// src/shared-overlays/components/Menu/Menu.tsx
import { useRef as useRef2 } from "react";
import { useSlateStatic as useSlateStatic2 } from "slate-react";

// src/use-reposition/get-methods/get-fixed-rect.ts
function getFixedRect(domElement) {
  const bounds = domElement.getBoundingClientRect();
  return {
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom,
    left: bounds.left,
    width: bounds.width,
    height: bounds.height
  };
}

// src/use-reposition/get-methods/get-absolute-rect.ts
function getAbsoluteRect(domElement) {
  const rect = getFixedRect(domElement);
  const { scrollY } = window;
  return Object.assign(rect, {
    top: rect.top + scrollY,
    bottom: rect.bottom + scrollY
  });
}

// src/use-reposition/get-methods/get-fixed-viewport.ts
function getFixedViewport() {
  const width = document.documentElement.clientWidth || document.body.clientWidth;
  return {
    top: 0,
    right: width,
    bottom: window.innerHeight,
    left: 0,
    width,
    height: window.innerHeight
  };
}

// src/use-reposition/get-methods/get-absolute-viewport.ts
function getAbsoluteViewport() {
  const rect = getFixedViewport();
  return Object.assign(rect, {
    top: window.scrollY,
    bottom: window.scrollY + rect.height
  });
}

// node_modules/just-map-values/index.mjs
var objectMapValues = map;
function map(obj, predicate) {
  var result = {};
  var keys = Object.keys(obj);
  var len = keys.length;
  for (var i = 0; i < len; i++) {
    var key2 = keys[i];
    result[key2] = predicate(obj[key2], key2, obj);
  }
  return result;
}

// src/use-reposition/utils.ts
function mapHTMLElementLikeRecordToRectRecord(elementLikeRecord, converElementToRect) {
  const rectRecord = objectMapValues(elementLikeRecord, (value) => {
    const maybeHTMLElement = value instanceof HTMLElement ? value : value.current;
    const nextValue = maybeHTMLElement ? converElementToRect(maybeHTMLElement) : null;
    return nextValue;
  });
  return rectRecord;
}

// src/use-reposition/hooks/use-reposition.tsx
import { useEffect as useEffect2 } from "react";

// src/use-reposition/hooks/use-throttled-refresh.ts
import throttle from "lodash.throttle";
import { useState as useState2 } from "react";
function useThrottledRefresh(intervalInMs = 100) {
  const [counter, setState] = useState2(0);
  const refresh = throttle(
    () => {
      setState((counter2) => counter2 + 1);
    },
    intervalInMs,
    { trailing: true }
  );
  return Object.assign(refresh, { counter });
}

// src/use-reposition/hooks/use-reposition.tsx
function useReposition() {
  const refresh = useThrottledRefresh();
  useEffect2(() => {
    refresh();
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh);
    return () => {
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh);
    };
  }, []);
  return refresh;
}

// src/use-reposition/hooks/use-absolute-reposition.tsx
function useAbsoluteReposition(elementLikeRecord, fn) {
  const refresh = useReposition();
  const rectRecord = mapHTMLElementLikeRecordToRectRecord(
    elementLikeRecord,
    (element) => getAbsoluteRect(element)
  );
  return fn(rectRecord, getAbsoluteViewport(), refresh);
}

// src/use-reposition/position-methods/index.ts
function positionInside(src, container, pos, { margin = 0 } = {}) {
  if (src == null)
    return { ...pos, left: -1024 };
  const right = pos.left + src.width;
  if (right <= container.right - margin)
    return pos;
  return { ...pos, left: container.right - src.width - margin };
}

// src/toolbar-plugin/styles/anchor-dialog-styles.ts
import styled5 from "@emotion/styled";

// src/shared-overlays/styles/$Panel.ts
import styled4 from "@emotion/styled";
var $Panel = styled4(SinkReset)`
  position: absolute;
  z-index: 1000;
  border: 1px solid var(--table-border-color);
  border-radius: 0.5em;
  overflow: clip;
  filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))
    drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
  background: white;
  /**
   * If you are tempted to add the transitions back in, here's why we left
   * them off:
   *
   * - When we initially unhide the panel (by setting a negative 'left' pos)
   *   the panel slides in very quickly. So we'd need to fix this first which
   *   adds complexity.
   *
   * - Even if we fixed it, the browser window updates the scrolls and resizes
   *   in a stepped manner (i.e. like frames in an animation). Keeping the
   *   smooth animations makes the panel step in sync with the page refreshes
   *   and so actually looks better.
   *
   * In other words, there's a technical issue we'd still need to solve but
   * even if we did, it looks better this way.
   */
  /* transition: left 100ms, top 100ms; */
`;

// src/toolbar-plugin/styles/anchor-dialog-styles.ts
var $AnchorDialog = styled5($Panel)`
  padding: 1em;
  width: 24em;
`;
var $AnchorDialogInputLine = styled5("div")`
  display: flex;
  gap: 0.5em;
`;
var $AnchorDialogInput = styled5("input")`
  flex: 1 1 auto;
  padding: 0.5em 0.75em;
  border-radius: 0.25em;
  color: var(--shade-700);
  border: 1px solid var(--shade-300);
  font-size: 0.9375em;
  &:focus {
    outline: 2px solid var(--blue-200);
  }
`;

// src/toolbar-plugin/styles/layout-styles.ts
import styled7 from "@emotion/styled";

// src/shared-layout/index.ts
import styled6 from "@emotion/styled";
var $Container = styled6(SinkReset)`
  border: 1px solid var(--shade-300); /* shade-300 */
  border-radius: 0.5em;
  color: rgb(39 39 42); /* shade-800 */
  line-height: 1.5;
  /**
   * !important is required because of role="textbox" I think
   */
  outline: 2px solid transparent !important;
  transition: all 250ms;
  &.--focused {
    /**
     * !important is required because of role="textbox" I think
     */
    outline: 2px solid var(--select-editor-color) !important;
  }
`;

// src/toolbar-plugin/styles/layout-styles.ts
var $Editable = styled7("div")`
  padding: 2em;
`;
var $OuterContainer = styled7($Container)`
  /**
   * We use this to make sure the top of the container is rounded even though
   * the toolbar inside is square. We keep the toolbar square so that as the
   * toolbar hits the top when scrolling, it can become sticky. We can try to
   * round the toolbar, but it causes an issue where the part under the
   * rounded part is still visible (i.e. the edge of the container). We can
   * then try to put an absolutely positioned background on it with an opaque
   * color, but that doesn't work unless we know the color of the background
   * so... ultimately, it's not a good solution.
   *
   * NOTE:
   *
   * Using "overflow: hidden;" will break the "position: sticky;" and it will
   * not work. "overflow: clip;" does work though.
   *
   * https://stackoverflow.com/a/73051006
   */
  overflow-y: clip;
  display: flex;
  flex-direction: column;
`;

// src/toolbar-plugin/styles/menu-styles.ts
import styled8 from "@emotion/styled";
var $Menu = styled8($Panel)`
  position: absolute;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  transition: all 200ms;
  /**
   * Prevent clicks from stealing focus from the editor
   */
  user-select: none;
`;
var $MenuItem = styled8("div")`
  display: flex;
  z-index: 10;
  padding: 0 1em 0 1.5em;
  height: 2em;
  align-items: center;
  /**
   * Normally we don't do it this way but since each part of the MenuItem
   * is tightly related to the display: flex, this seemed the easiest way
   * to set this up.
   */
  .--icon {
    flex: 0 0;
    display: block;
    font-size: 1.25em;
    height: 1em;
    padding-right: 0.75em;
    color: var(--shade-400);
    svg {
      position: relative;
      stroke-width: 1.5px;
    }
  }
  .--title {
    flex: 1 0;
    font-size: 0.875em;
    color: var(--shade-800);
  }
  .--hotkey {
    flex: 0 0;
    font-size: 0.75em;
    padding-left: 1.5em;
    color: var(--shade-500);
  }
  background: white;
  cursor: pointer;
  &:hover {
    background: var(--blue-50);
  }
`;
var $MenuDivider = styled8("div")`
  height: 1px;
  background: var(--shade-200);
  margin-top: 0.25em;
  margin-bottom: 0.25em;
`;

// src/toolbar-plugin/styles/toolbar-styles.ts
import styled9 from "@emotion/styled";
var $ToolbarContainer = styled9("div")`
  /**
   * This flex rule applies to the "display: flex;" of the parent container.
   * Ensures the toolbar does not shrink or grow vertically.
   */
  flex: 0 0 auto;
  /**
   * If "position: sticky;" is not working, check the ancestor for "overflow:
   * hidden;" of any kind. This will stop sticky from working. A good workaround
   * is to use "overflow: clip;" instead.
   *
   * https://stackoverflow.com/a/73051006
   */
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--shade-50);
  /* font-size: 0.875em; */
  font-size: 0.9375em;
  padding: 0 0.5em;
  border-bottom: 1px solid var(--shade-300);
  /**
   * Prevent clicks from stealing focus from the editor
   */
  user-select: none;
  /**
   * Extreme attention to detail. When the sticky is ending and the toolbar
   * is stuck to the bottom of the editor, setting margin-bottom to -1px will
   * fix the 2px bottom border and make it the proper 1px.
   */
  margin-bottom: -1px;

  /**
   * NOTE: The space in the equation is significant
   */
  height: calc(
    3em + 1px
  ); // $ToolbarDivider height + border-bottom of 1px above
  overflow: hidden;
`;
var $Toolbar = styled9("div")`
  display: inline-block;
  height: calc(
    3em + 1px
  ); // $ToolbarDivider height + border-bottom of 1px above
`;
var $ToolbarDividerContainer = styled9("div")`
  display: inline-block;
  height: 3em;
  padding: 0 0.375em;
`;
var $ToolbarDivider = styled9("div")`
  display: inline-block;
  background: var(--shade-300);
  opacity: 50%;
  width: 1px;
  height: 3em;
`;
var $ToolbarButton = styled9("div")`
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  vertical-align: top;
  font-size: 1.25em;
  margin-top: 0.25em;
  height: 2em;
  padding: 0.375em 0.375em;
  border-radius: 0.25em;
  text-align: center;
  color: var(--shade-500);
  transition: all 100ms;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0);
  &.--disabled {
    opacity: 0.3;
    cursor: default;
    pointer-events: none;
  }
  &.--active {
    color: var(--shade-700);
    background: rgba(0, 0, 0, 0.05);
    svg {
      /* stroke-width: 2px; */
    }
  }
  svg {
    stroke-width: 1.5px;
  }
  @media (hover: hover) {
    &:not(.--disabled):hover {
      color: var(--shade-700);
      background: var(--blue-100);
      svg {
        /* stroke-width: 2px; */
      }
    }
  }

  &.--more {
    padding: 0.375em 0.5em;
  }
  .--more-icon {
    position: absolute;
    bottom: -0.2em;
    left: 50%;
    margin-left: -0.25em;
    opacity: 0.375;
  }
`;

// src/shared-overlays/components/Menu/MenuItem.tsx
import { useCallback } from "react";
import { ReactEditor as ReactEditor2 } from "slate-react";
import { Fragment, jsx as jsx6, jsxs as jsxs2 } from "react/jsx-runtime";
function MenuItem({
  editor,
  item,
  close,
  dest
}) {
  const menuLayer = useLayer("menu");
  const onClick = useCallback(() => {
    if (item.Component) {
      const Component = item.Component;
      menuLayer.open(() => /* @__PURE__ */ jsx6(Component, { dest, close: menuLayer.close }));
    } else if (item.action) {
      item.action(editor);
      ReactEditor2.focus(editor);
      close();
    }
  }, [editor, item]);
  return /* @__PURE__ */ jsx6(Fragment, { children: /* @__PURE__ */ jsxs2($MenuItem, { onClick, children: [
    /* @__PURE__ */ jsx6("div", { className: "--icon", children: /* @__PURE__ */ jsx6(item.icon, {}) }),
    /* @__PURE__ */ jsx6("div", { className: "--title", children: item.title }),
    /* @__PURE__ */ jsx6("div", { className: "--hotkey", children: item.hotkey ? formatHotkey(item.hotkey) : void 0 })
  ] }) });
}

// src/shared-overlays/components/Menu/Menu.tsx
import { Fragment as Fragment2, jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";
function Menu({
  dest,
  items,
  close
}) {
  const editor = useSlateStatic2();
  const ref = useRef2(null);
  const style = useAbsoluteReposition({ src: ref, dest }, ({ dest: dest2 }) => {
    return { left: dest2.left - 8, top: dest2.top + dest2.height };
  });
  return /* @__PURE__ */ jsxs3(Fragment2, { children: [
    /* @__PURE__ */ jsx7(CloseMask, { close }),
    /* @__PURE__ */ jsx7($Menu, { ref, style, children: items.map((item, index) => {
      if (item === "divider") {
        return /* @__PURE__ */ jsx7($MenuDivider, {}, index);
      } else if (item.show && !item.show(editor)) {
        return null;
      } else {
        return /* @__PURE__ */ jsx7(
          MenuItem,
          {
            editor,
            item,
            close,
            dest
          },
          index
        );
      }
    }) })
  ] });
}

// src/use-tooltip/index.tsx
import { useCallback as useCallback2 } from "react";

// src/use-tooltip/tooltip.tsx
import styled10 from "@emotion/styled";
import { jsx as jsx8, jsxs as jsxs4 } from "react/jsx-runtime";
function useRect(dest) {
  return dest.getBoundingClientRect();
}
var $Tooltip = styled10("div")`
  position: fixed;
  z-index: 10;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  color: white;
  font-size: 0.875em;
  line-height: 1.5em;
  padding: 0 0.5em;
  color: var(--shade-300);
  background: var(--shade-700);
  border-radius: 0.25em;
  white-space: nowrap;
`;
var $Hotkey = styled10("span")`
  margin-left: 0.75em;
  font-size: 0.875em;
  font-weight: 500;
  color: var(--shade-400);
`;
function Tooltip({
  title,
  hotkey,
  dest
}) {
  const rect = useRect(dest);
  return /* @__PURE__ */ jsxs4(
    $Tooltip,
    {
      style: {
        left: rect.left,
        top: `calc(${rect.top}px - 2em)`
      },
      children: [
        title,
        hotkey ? /* @__PURE__ */ jsx8($Hotkey, { children: hotkey }) : null
      ]
    }
  );
}

// src/use-tooltip/triangle.tsx
import styled11 from "@emotion/styled";
import { jsx as jsx9 } from "react/jsx-runtime";
var $Triangle = styled11("span")`
  position: fixed;
  z-index: 10;
  width: 0;
  height: 0;
  border-left: 0.375em solid transparent;
  border-right: 0.375em solid transparent;
  border-top: 0.375em solid var(--shade-700);
`;
function Triangle({ dest }) {
  const rect = useRect(dest);
  return /* @__PURE__ */ jsx9(
    $Triangle,
    {
      style: {
        left: `calc(${rect.left + rect.width / 2}px - 0.375em)`,
        top: `calc(${rect.top}px - 0.5em)`
      }
    }
  );
}

// src/use-tooltip/index.tsx
import { jsx as jsx10 } from "react/jsx-runtime";
function useTooltip({
  title,
  hotkey
}, deps = []) {
  const label = useLayer("tooltip-label");
  const triangle = useLayer("tooltip-triangle");
  const onMouseEnter = useCallback2((e) => {
    const dest = e.currentTarget;
    if (title !== void 0) {
      label.open(() => /* @__PURE__ */ jsx10(
        Tooltip,
        {
          title,
          hotkey: typeof hotkey === "function" ? hotkey() : hotkey,
          dest
        }
      ));
      triangle.open(() => /* @__PURE__ */ jsx10(Triangle, { dest }));
    }
  }, deps);
  const onMouseLeave = useCallback2(() => {
    label.close();
    triangle.close();
  }, deps);
  return { onMouseEnter, onMouseLeave };
}

// src/anchor-plugin/render-element/AnchorEditDialog.tsx
import styled13 from "@emotion/styled";
import { useCallback as useCallback3, useRef as useRef3, useState as useState3 } from "react";
import { useSlateStatic as useSlateStatic3 } from "slate-react";

// src/shared-styles/index.ts
import styled12 from "@emotion/styled";
var $FormGroup = styled12("div")`
  margin: 0.5em 0;
  &:first-of-type {
    margin-top: 0;
  }
  &:last-of-type {
    margin-bottom: 0;
  }
`;
var $FormCaption = styled12("div")`
  font-size: 0.9375em;
  margin-bottom: 0.25em;
  color: var(--shade-700);
`;
var $FormHint = styled12("div")`
  font-size: 0.875em;
  margin-top: 0.25em;
  color: var(--shade-500);
`;
var $Textarea = styled12("input")`
  box-sizing: border-box;
  width: 100%;
  height: 6em;
  padding: 0.5em 0.75em;
  border-radius: 0.25em;
  color: var(--shade-700);
  font-family: inherit;
  border: 1px solid var(--shade-300);
  font-size: 0.9375em;
  &:focus {
    outline: 2px solid var(--blue-200);
  }
`;
var $Input = styled12("input")`
  box-sizing: border-box;
  width: 100%;
  padding: 0.5em 0.75em;
  border-radius: 0.25em;
  color: var(--shade-700);
  border: 1px solid var(--shade-300);
  font-size: 0.9375em;
  &:focus {
    outline: 2px solid var(--blue-200);
  }
`;
var $BaseButton = styled12("div")`
  /* Center vertically and horizontally */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0.25em 0.75em;
  text-align: center;
  transition: all 100ms;
  border-radius: 0.25em;
  svg {
    font-size: 1.25em;
    stroke-width: 2px;
  }
`;
var $PrimaryButton = styled12($BaseButton)`
  color: var(--blue-50);
  background: var(--blue-500);
  outline: 0px solid white;
  &:hover {
    color: white;
    background: var(--blue-600);
    outline: 2px solid var(--blue-200);
  }
  svg {
    color: var(--blue-200);
  }
`;
var $CancelButton = styled12($BaseButton)`
  color: var(--shade-500);
  background: var(--shade-200);
  outline: 0px solid white;
  &:hover {
    color: var(--shade-600);
    background: var(--shade-300);
    outline: 2px solid var(--shade-200);
  }
  svg {
    color: var(--shade-400);
  }
`;

// src/anchor-plugin/render-element/AnchorEditDialog.tsx
import { jsx as jsx11, jsxs as jsxs5 } from "react/jsx-runtime";
var $AnchorEditDialog = styled13($Panel)`
  position: absolute;
  width: 20em;
  padding: 1em;
`;
function AnchorEditDialog({
  destAnchor,
  destStartEdge,
  element
}) {
  const dialog = useLayer("dialog");
  const style = useAbsoluteReposition(
    { destAnchor, destStartEdge },
    ({ destAnchor: destAnchor2, destStartEdge: destStartEdge2 }) => {
      return {
        left: destStartEdge2.left,
        top: destAnchor2.top + destAnchor2.height
      };
    }
  );
  const editor = useSlateStatic3();
  const [href, setHref] = useState3(element.href);
  const [title, setTitle] = useState3(element.title || "");
  const formRef = useRef3({ href, title });
  formRef.current = { href, title };
  const handleHrefChange = useCallback3((e) => {
    setHref(e.target.value);
  }, []);
  const handleTitleChange = useCallback3((e) => {
    setTitle(e.target.value);
  }, []);
  const openAnchorDialog = useCallback3(() => {
    dialog.open(() => /* @__PURE__ */ jsx11(
      AnchorDialog,
      {
        destAnchor,
        destStartEdge,
        element
      }
    ));
  }, [destAnchor, destStartEdge, element]);
  const handleSubmit = useCallback3(() => {
    const { href: href2, title: title2 } = formRef.current;
    editor.anchor.editLink({ href: href2, title: title2 }, { at: element });
    openAnchorDialog();
  }, [openAnchorDialog]);
  return /* @__PURE__ */ jsxs5($AnchorEditDialog, { contentEditable: false, style, children: [
    /* @__PURE__ */ jsxs5($FormGroup, { children: [
      /* @__PURE__ */ jsx11($FormCaption, { children: t("linkUrl") }),
      /* @__PURE__ */ jsx11($Textarea, { as: "textarea", value: href, onChange: handleHrefChange })
    ] }),
    /* @__PURE__ */ jsxs5($FormGroup, { children: [
      /* @__PURE__ */ jsx11($FormCaption, { children: t("tooltipText") }),
      /* @__PURE__ */ jsx11($Input, { type: "text", value: title, onChange: handleTitleChange }),
      /* @__PURE__ */ jsx11($FormHint, { children: t("tooltipHint") })
    ] }),
    /* @__PURE__ */ jsx11($FormGroup, { children: /* @__PURE__ */ jsx11($PrimaryButton, { onClick: handleSubmit, children: t("apply") }) }),
    /* @__PURE__ */ jsx11($FormGroup, { children: /* @__PURE__ */ jsx11($CancelButton, { onClick: openAnchorDialog, children: t("cancel") }) })
  ] });
}

// src/anchor-plugin/render-element/icons.tsx
import { jsx as jsx12 } from "react/jsx-runtime";
var ExternalLinkIcon = (props) => /* @__PURE__ */ jsx12(TablerIcon, { ...props, children: /* @__PURE__ */ jsx12("path", { d: "M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6M11 13l9-9M15 4h5v5" }) });
var LinkOffIcon = (props) => /* @__PURE__ */ jsx12(TablerIcon, { ...props, children: /* @__PURE__ */ jsx12("path", { d: "m9 15 3-3m2-2 1-1M11 6l.463-.536a5 5 0 0 1 7.071 7.072L18 13M3 3l18 18M13 18l-.397.534a5.068 5.068 0 0 1-7.127 0 4.972 4.972 0 0 1 0-7.071L6 11" }) });
var PencilIcon = (props) => /* @__PURE__ */ jsx12(TablerIcon, { ...props, children: /* @__PURE__ */ jsx12("path", { d: "M4 20h4L18.5 9.5a1.5 1.5 0 0 0-4-4L4 16v4M13.5 6.5l4 4" }) });

// src/anchor-plugin/render-element/AnchorDialog.tsx
import { jsx as jsx13, jsxs as jsxs6 } from "react/jsx-runtime";
var $AnchorDialog2 = styled14($Panel)`
  position: absolute;
  display: flex;
  width: 20em;
  z-index: 10;
  padding: 1em;
  color: var(--shade-400);

  .--icons {
    display: flex;
    overflow: hidden;
    flex: 0 0 6em;
  }

  .--link {
    text-decoration: none;
    display: flex;
    flex: 0 0 14em;
    overflow: hidden;
    color: var(--shade-400);
    &:hover {
      color: var(--blue-600);
    }
    transition: all 200ms;
  }

  .--url {
    margin-left: 0.5em;
    .--hostname {
      font-size: 0.875em;
      width: 14em;
      line-height: 1.5em;
      color: var(--blue-600);
      overflow-wrap: break-word;
      /* width: 13.5em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis; */
    }
    .--pathname {
      margin-top: 0.125em;
      font-size: 0.75em;
      width: 16.25em;
      line-height: 1.5em;
      overflow-wrap: break-word;
    }
    .--tooltip {
      box-sizing: border-box;
      position: relative;
      margin-top: 1em;
      font-size: 0.875em;
      width: 14em;
      line-height: 1.5em;
      background: var(--shade-200);
      border-radius: 0.5em;
      padding: 0.5em 0.75em;
      color: var(--shade-600);
      overflow-wrap: break-word;
    }
    .--tooltip::before {
      content: "";
      position: absolute;
      top: -0.5em; /* Height of the triangle */
      left: 0.5em; /* Position it on the left side */
      border-left: 0.5em solid transparent; /* Half the width of the triangle */
      border-right: 0.5em solid transparent; /* Half the width of the triangle */
      border-bottom: 0.5em solid var(--shade-200); /* Height and color of the triangle */
    }
  }

  .--icon {
    cursor: pointer;
    margin-left: 0.5em;
    &:hover {
      color: var(--blue-600);
    }
  }

  svg {
    flex: 0 0 auto;
    width: 1.25em;
    height: 1.25em;
    stroke-width: 1.5;
  }
`;
function parseUrl2(s) {
  try {
    const url = new URL(s);
    return { hostname: url.hostname, pathname: url.pathname };
  } catch (e) {
    return { hostname: "", pathname: "" };
  }
}
function AnchorDialog({
  destAnchor,
  destStartEdge,
  element
}) {
  const dialog = useLayer("dialog");
  const editor = useSlateStatic4();
  const url = parseUrl2(element.href);
  const style = useAbsoluteReposition(
    { destAnchor, destStartEdge },
    ({ destAnchor: destAnchor2, destStartEdge: destStartEdge2 }) => {
      return {
        left: destStartEdge2.left,
        top: destAnchor2.top + destAnchor2.height
      };
    }
  );
  const removeTooltip = useTooltip({ title: "\u30EA\u30F3\u30AF\u3092\u524A\u9664" });
  const editTooltip = useTooltip({ title: "\u30EA\u30F3\u30AF\u3092\u7DE8\u96C6" });
  const removeLink2 = useCallback4(() => {
    editor.anchor.removeLink({ at: element });
    dialog.close();
  }, [editor, dialog]);
  const openEditDialog = useCallback4(() => {
    editTooltip.onMouseLeave();
    dialog.open(() => {
      return /* @__PURE__ */ jsx13(
        AnchorEditDialog,
        {
          destAnchor,
          destStartEdge,
          element
        }
      );
    });
  }, [destAnchor, destStartEdge, element]);
  return /* @__PURE__ */ jsxs6($AnchorDialog2, { contentEditable: false, style, children: [
    /* @__PURE__ */ jsxs6(
      "a",
      {
        className: "--link",
        href: element.href,
        target: "_blank",
        rel: "noreferrer",
        children: [
          /* @__PURE__ */ jsx13(ExternalLinkIcon, {}),
          /* @__PURE__ */ jsxs6("div", { className: "--url", children: [
            /* @__PURE__ */ jsx13("div", { className: "--hostname", children: url.hostname }),
            url.pathname === "" || url.pathname === "/" ? null : /* @__PURE__ */ jsx13("div", { className: "--pathname", children: url.pathname }),
            element.title == null || element.title === "" ? null : /* @__PURE__ */ jsx13("div", { className: "--tooltip", children: element.title })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs6("span", { className: "--icons", children: [
      /* @__PURE__ */ jsx13(
        "span",
        {
          className: "--icon",
          onClick: removeLink2,
          onMouseEnter: removeTooltip.onMouseEnter,
          onMouseLeave: removeTooltip.onMouseLeave,
          children: /* @__PURE__ */ jsx13(LinkOffIcon, {})
        }
      ),
      /* @__PURE__ */ jsx13(
        "span",
        {
          className: "--icon",
          onMouseEnter: editTooltip.onMouseEnter,
          onMouseLeave: editTooltip.onMouseLeave,
          onClick: openEditDialog,
          children: /* @__PURE__ */ jsx13(PencilIcon, {})
        }
      )
    ] })
  ] });
}

// src/anchor-plugin/render-element/anchor.tsx
import { jsx as jsx14, jsxs as jsxs7 } from "react/jsx-runtime";
function Anchor({
  element,
  attributes,
  children
}) {
  const startEdgeRef = useRef4(null);
  const anchorRef = useRef4(null);
  const selected = useSelected();
  const editor = useSlate();
  const dialog = useLayer("dialog");
  useEffect3(() => {
    const anchor = anchorRef.current;
    const startEdge = startEdgeRef.current;
    if (!anchor || !startEdge)
      return;
    const hasSelection = editor.selection && editor.selection.anchor.offset !== editor.selection.focus.offset;
    if (selected && !hasSelection) {
      setTimeout(() => {
        dialog.open(() => /* @__PURE__ */ jsx14(
          AnchorDialog,
          {
            destAnchor: anchor,
            destStartEdge: startEdge,
            element
          }
        ));
      });
    } else {
      dialog.close();
    }
  }, [selected, element]);
  return /* @__PURE__ */ jsxs7(
    $Anchor,
    {
      className: clsx({ "--selected": selected }),
      href: element.href,
      target: element.target,
      ...attributes,
      ref: anchorRef,
      children: [
        /* @__PURE__ */ jsx14($Edge, { ref: startEdgeRef, contentEditable: false }),
        /* @__PURE__ */ jsx14("span", { children }),
        /* @__PURE__ */ jsx14($Edge, { contentEditable: false })
      ]
    }
  );
}

// src/anchor-plugin/index.tsx
import { jsx as jsx15 } from "react/jsx-runtime";
var AnchorPlugin = createPlugin(
  (editor, _options, { createPolicy }) => {
    editor.anchor = createAnchorMethods(editor);
    return createPolicy({
      name: "anchor",
      editor: {
        isInline(element) {
          if (element.type === "anchor")
            return true;
        },
        normalizeNode: curryOne(normalizeNode, editor)
      },
      editableProps: {
        onPaste: curryOne(onPaste, editor),
        renderElement: ({ element, attributes, children }) => {
          if (element.type === "anchor") {
            return /* @__PURE__ */ jsx15(Anchor, { element, attributes, children });
          }
        }
      }
    });
  }
);

// src/atomic-delete-plugin/index.ts
import { Editor as Editor19, Transforms as Transforms11 } from "slate";

// src/atomic-delete-plugin/is-safe-delete.ts
import { Element as Element10, Path as Path6 } from "slate";
function isSafeDelete(editor, a, b) {
  if (!a || !b)
    return true;
  if (Path6.equals(a[1], b[1]))
    return true;
  const masterEntryA = findElementUp(
    editor,
    (el) => Element10.isElement(el) && editor.isMaster(el),
    { at: a[1] }
  );
  const masterEntryB = findElementUp(
    editor,
    (el) => {
      return Element10.isElement(el) && editor.isMaster(el);
    },
    { at: b[1] }
  );
  if (!masterEntryA && !masterEntryB)
    return true;
  if (masterEntryA && masterEntryB && Path6.equals(masterEntryA[1], masterEntryB[1]))
    return true;
  return false;
}

// src/atomic-delete-plugin/index.ts
var AtomicDeletePlugin = createPlugin(
  (editor) => {
    editor.atomicDelete = true;
    return {
      name: "atomic-delete",
      editor: {
        deleteBackward() {
          if (editor.selection == null)
            return false;
          const entry = Editor19.node(editor, editor.selection);
          const prevEntry = Editor19.previous(editor, { mode: "lowest" });
          if (isSafeDelete(editor, entry, prevEntry))
            return false;
          Transforms11.move(editor, { unit: "character", reverse: true });
          return true;
        },
        deleteForward() {
          if (editor.selection == null)
            return false;
          const entry = Editor19.node(editor, editor.selection);
          const nextEntry = Editor19.next(editor, { mode: "lowest" });
          if (isSafeDelete(editor, entry, nextEntry))
            return false;
          Transforms11.move(editor, { unit: "character" });
          return true;
        }
      }
    };
  }
);

// src/image-plugin/index.tsx
import { Transforms as Transforms17 } from "slate";
import { ReactEditor as ReactEditor9 } from "slate-react";

// src/image-plugin/methods/index.ts
import { Editor as Editor20, Transforms as Transforms12 } from "slate";
import { ReactEditor as ReactEditor3 } from "slate-react";
function noop(editor) {
  editor;
}
function insertImageFromUrl(editor, url, alt, title) {
  const { selection } = editor;
  Transforms12.insertNodes(editor, {
    type: "image-block",
    url,
    alt: alt || "",
    title: title || "",
    width: 320,
    height: 240,
    children: [{ text: "" }]
  });
  if (!selection) {
    const lastPos = Editor20.end(editor, []);
    Transforms12.select(editor, lastPos);
    ReactEditor3.focus(editor);
  }
}
function createImageMethods(editor) {
  return {
    noop: curryOne(noop, editor),
    insertImageFromUrl: curryOne(insertImageFromUrl, editor)
  };
}

// src/image-plugin/normalize-node/index.ts
function normalizeNode2(editor, entry) {
  editor;
  entry;
  return false;
}

// src/image-plugin/render-element/image-block.tsx
import { useSlateStatic as useSlateStatic9 } from "slate-react";

// src/image-plugin/styles/image-block-styles.tsx
import styled15 from "@emotion/styled";
var $ImageBlock = styled15("div")`
  display: block;
  margin: 1em 0;
`;

// src/image-plugin/render-element/image-with-controls/index.tsx
import { clsx as clsx4 } from "clsx";
import { useState as useState4 } from "react";
import { useSelected as useSelected2 } from "slate-react";

// src/image-plugin/styles/image-with-controls-styles/image-with-controls-styles.tsx
import styled16 from "@emotion/styled";
var $ImageContainer = styled16("span")`
  /**
   * In order for this container to wrap tightly (without space), it needs to be
   * an "inline-block". If it's just an "inline" we end up with spacing
   * artificats related to how spacing is placed around text.
   */
  display: inline-block;
  /**
   * This wrapper's primary purpose (why we don't use the image by itself) is
   * so that we can place UI controls for the image in and around the image.
   */
  position: relative;
`;
var $Image = styled16("img")`
  /**
   * TODO:
   *
   * This is a bit of a hack but is a better experience than not anything.
   *
   * Constrains the maximum resize width of an image to 100% of the space
   * available. This prevents the image from stepping outside its boundaries.
   *
   * Problem:
   *
   * - The "height" is set to "auto" which likely conflicts with the height
   *   provided as an image attribute of "height" set by the application.
   *   Effectively, this means that the "height" is ignored which is fine
   *   except when the image hasn't been loaded yet, I think it's possible
   *   and perhaps likely that there may be a reflow that happens before/after
   *   the image is loaded.
   */
  max-width: 100%;
  height: auto;

  /**
   * Rounded borders are pretty and also help the selection outline look
   * pretty.
   */
  transition: border-radius 250ms;
  border-radius: 0.5em;
  .--small > & {
    border-radius: 1px;
  }
  display: block;

  /**
   * Selection border. We leave a space between the outline and the image so
   * that an image that is the same color as the selection border will still
   * look selected.
   */
  .--selected > & {
    outline: 2px solid var(--select-color);
    outline-offset: 1px;
  }
  /**
   * If the image isn't loaded yet, we want to have some color filling the space
   * that the image will eventually load into. This helps indicates to the user
   * the space that the image will fill into.
   *
   * Once the image is finished loading, we want to respect transparency so at
   * that point we hide the background shading.
   */
  .--loading > & {
    background: var(--shade-100);
  }

  /**
   * When we change the image via a preset, we want to animate the change;
   * however, when we are dragging to resize, a transition adds a janky delay
   * to the resize so we remove the transition during drag resizing.
   */
  transition: width 100ms, height 100ms;
  .--dragging > & {
    transition: border-radius 250ms;
  }
`;

// src/image-plugin/render-element/image-with-controls/image-resize-controls/image-resize-control.tsx
import { clsx as clsx2 } from "clsx";
import { useCallback as useCallback5 } from "react";
import { Transforms as Transforms13 } from "slate";
import { ReactEditor as ReactEditor5, useSlateStatic as useSlateStatic5 } from "slate-react";

// src/use-reposition/hooks/use-resize-browser.tsx
import { useEffect as useEffect4 } from "react";
function useResizeBrowser() {
  const refresh = useThrottledRefresh();
  useEffect4(() => {
    refresh();
    window.addEventListener("resize", refresh);
    return () => {
      window.removeEventListener("resize", refresh);
    };
  }, []);
  return refresh;
}

// src/image-plugin/styles/image-with-controls-styles/image-resize-handle-styles.tsx
import styled17 from "@emotion/styled";
var $ImageResizeInvisibleHandle = styled17("span")`
  position: absolute;
  display: block;
  /**
   * Prevent touch dragging from exhibiting a kind of scroll bounce behavior
   * when we just want the image to resize.
   */
  touch-action: none;
  background: rgba(127, 127, 127, 0.001);
  top: 0;
  right: calc(-1em - 2px);
  width: 2em;
  bottom: 0;
  &.--left {
    cursor: w-resize;
  }
  &.--center {
    cursor: ew-resize;
  }
  &.--right {
    cursor: e-resize;
  }
  &.--small {
    right: calc(-1.25em);
    /* background: green; */
    width: 1.25em;
  }
`;
var $ImageResizeHandle = styled17("span")`
  position: absolute;
  display: block;
  background: var(--select-color);
  top: 50%;
  margin-top: -1em;
  width: 1em;
  height: 2em;
  outline: 1px solid white;
  transition: all 250ms;
  /**
   * The handle is 3 visible states depending on whether the image is at
   * maximum size or minimum size.
   *
   * There are three indicators that let the user know which directions are
   * available (left, right or both) that the user can drag:
   *
   * - rounded corners on the side that are available to drag towards
   * - on larger size image, the handle is on the inside, middle or outside
   *   of the outline
   * - the cursor pointer indicates the direction available for resizing.
   */
  .--center > & {
    left: 0.5em;
    border-radius: 0.375em;
  }
  .--left > & {
    border-radius: 0.5em 0 0 0.5em;
    left: 1px;
  }
  .--right > & {
    border-radius: 0 0.5em 0.5em 0;
    left: calc(50% - 1px);
  }
  .--bar {
    position: absolute;
    background: var(--blue-200);
    width: 1px;
    top: 0.5em;
    bottom: 0.5em;
  }
  /**
   * Each of 3 bars is 1px wide and 3px apart
   */
  .--bar-left {
    left: calc(50% - 3.5px);
  }
  .--bar-center {
    left: calc(50% - 0.5px);
  }
  .--bar-right {
    left: calc(50% + 2.5px);
  }
  /**
   * When the image is small, we reduce the size of the handler and place it
   * outside the image. The reasons we do this:
   * 
   * - If the handle is not outside the image at small sizes, the handle
   *   obscures the image too much. At larger sizes, it works okay and the
   *   inside handle placement makes the available direction of the drags more
   *   intuitive.
   *
   * - Also, at small sizes, a large handle can overwhelm the image. That is,
   *   the handle can be twice as tall as the image itself which looks poor.
   *   It's still possible for the handle to be larger than the image at small
   *   sizes, but this is okay in that we don't want the handle to become so
   *   small that it is hard to see and hard to click.
   */
  .--small > & {
    /**
     * We opt to mainly adjust the size of the handle at smaller sizes by
     * adjusting the font-size. This is more efficient than changing all the
     * border-sizes because changing the font-size automatically changes the
     * size of the border, but we don't have to redo the different combinations
     * border-size and the corner that they need to display on.
     */
    font-size: 0.5em;
    width: 1.5em;
    left: 0.5em;
    margin-top: -1em;
  }
  /**
   * Each of 2 bars is 1px wide and 3px apart
   */
  .--small > & > .--bar-left {
    left: calc(50% - 2px);
  }
  .--small > & > .--bar-center {
    display: none;
  }
  .--small > & > .--bar-right {
    left: calc(50% + 1px);
  }
`;

// src/image-plugin/utils/min-max.ts
function minMax({
  value,
  min,
  max
}) {
  if (!(max >= min))
    throw new Error(`Expected max >= min but is not`);
  return Math.max(min, Math.min(max, value));
}

// src/image-plugin/utils/resize-utils.ts
import { ReactEditor as ReactEditor4 } from "slate-react";
function resizeToWidth(width, srcSize) {
  width = Math.round(width);
  const aspect = srcSize.width / srcSize.height;
  return { width, height: Math.round(width / aspect) };
}
function resizeToHeight(height, srcSize) {
  height = Math.round(height);
  const aspect = srcSize.width / srcSize.height;
  return { width: Math.round(height * aspect), height };
}
function resizeInBounds(size, bounds) {
  const aspect = size.width / size.height;
  const boundsAspect = bounds.width / bounds.height;
  if (aspect >= boundsAspect) {
    if (size.width > bounds.width) {
      return resizeToWidth(bounds.width, size);
    }
  } else {
    if (size.height > bounds.width) {
      return resizeToHeight(bounds.height, size);
    }
  }
  return size;
}
function resizeInPreset(size, srcSize, preset) {
  switch (preset.type) {
    case "bounds":
      return resizeInBounds(srcSize, preset);
    case "scale":
      return {
        width: Math.round(srcSize.width * preset.scale),
        height: Math.round(srcSize.height * preset.scale)
      };
  }
}
function getEditorWidth(editor) {
  const element = ReactEditor4.toDOMNode(editor, editor);
  const computed = getComputedStyle(element);
  const padding = parseInt(computed.paddingLeft) + parseInt(computed.paddingRight);
  return element.clientWidth - padding;
}

// src/image-plugin/render-element/image-with-controls/image-resize-controls/image-resize-control.tsx
import { Fragment as Fragment3, jsx as jsx16, jsxs as jsxs8 } from "react/jsx-runtime";
function getImageBoundsFromSlateElement(editor, element) {
  const imageContainerDOMNode = ReactEditor5.toDOMNode(editor, element);
  const imgDOMNode = imageContainerDOMNode.querySelector("img");
  if (!imgDOMNode)
    throw new Error(`Image Element could not be found but should exist`);
  return imgDOMNode.getBoundingClientRect();
}
function ImageResizeControl({
  element,
  srcSize,
  size,
  setSize,
  isDragging,
  setIsDragging
}) {
  const editor = useSlateStatic5();
  useResizeBrowser();
  const editorWidth = getEditorWidth(editor);
  const width = size.width;
  const maxWidth = Math.min(srcSize.width, editorWidth);
  const minWidth = Math.min(12, srcSize.width);
  const onMouseDown = useCallback5(
    (e) => {
      stopEvent(e);
      setIsDragging(true);
      const startX = e.clientX;
      const bounds = getImageBoundsFromSlateElement(editor, element);
      const startWidth = bounds.width;
      let nextSize = { ...size };
      const onDocumentMouseMove = (e2) => {
        const nextWidth = minMax({
          value: startWidth + e2.clientX - startX,
          min: minWidth,
          max: maxWidth
        });
        nextSize = resizeToWidth(nextWidth, srcSize);
        setSize(nextSize);
      };
      const onDocumentMouseUp = () => {
        document.removeEventListener("mousemove", onDocumentMouseMove);
        document.removeEventListener("mouseup", onDocumentMouseUp);
        const path = ReactEditor5.findPath(editor, element);
        const size2 = {
          width: nextSize.width,
          height: nextSize.height
        };
        setSize(size2);
        Transforms13.setNodes(editor, size2, { at: path });
        setIsDragging(false);
      };
      document.addEventListener("mousemove", onDocumentMouseMove);
      document.addEventListener("mouseup", onDocumentMouseUp);
    },
    [srcSize.width, srcSize.height, size.width, element]
  );
  const onTouchStart = useCallback5(
    (e) => {
      stopEvent(e);
      setIsDragging(true);
      const startX = e.changedTouches[0].clientX;
      const startWidth = size.width;
      let nextSize = { ...size };
      const onDocumentTouchMove = (te) => {
        const e2 = te.changedTouches[0];
        const nextWidth = minMax({
          value: startWidth + e2.clientX - startX,
          min: minWidth,
          max: maxWidth
        });
        nextSize = resizeToWidth(nextWidth, srcSize);
        setSize(nextSize);
      };
      const onDocumentTouchEnd = () => {
        document.removeEventListener("touchmove", onDocumentTouchMove);
        document.removeEventListener("touchend", onDocumentTouchEnd);
        const path = ReactEditor5.findPath(editor, element);
        Transforms13.setNodes(
          editor,
          { width: nextSize.width, height: nextSize.height },
          { at: path }
        );
        setIsDragging(false);
      };
      document.addEventListener("touchmove", onDocumentTouchMove);
      document.addEventListener("touchend", onDocumentTouchEnd);
    },
    [srcSize.width, srcSize.height, size.width, element]
  );
  const className = clsx2({
    "--center": width < maxWidth && width > minWidth,
    "--left": width >= maxWidth && width > minWidth,
    "--right": width <= minWidth && width < maxWidth,
    "--dragging": isDragging,
    "--small": width <= 64 || size.height <= 64
  });
  return /* @__PURE__ */ jsx16(Fragment3, { children: /* @__PURE__ */ jsx16(
    $ImageResizeInvisibleHandle,
    {
      className,
      onMouseDown,
      onTouchStart,
      children: /* @__PURE__ */ jsxs8($ImageResizeHandle, { children: [
        /* @__PURE__ */ jsx16("span", { className: "--bar --bar-left" }),
        /* @__PURE__ */ jsx16("span", { className: "--bar --bar-center" }),
        /* @__PURE__ */ jsx16("span", { className: "--bar --bar-right" })
      ] })
    }
  ) });
}

// src/image-plugin/styles/image-with-controls-styles/image-size-status-styles.tsx
import styled18 from "@emotion/styled";
var $ImageSizeStatus = styled18("span")`
  position: absolute;
  /**
   * The status appears with a 1px gap from the outline.
   *
   * - 1px for gap from image to outline
   * - 2px for outline width
   * - 1px more for the space to the status
   */
  bottom: calc(-2em - 4px);
  left: 0;
  font-size: 0.625em; /* 10px tiny */
  line-height: 2em;
  padding: 0 0.5em;
  color: var(--shade-100);
  background: var(--shade-600);
  outline: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 0.5em;
  white-space: nowrap;

  /* force numbers to be monospaced for better alignment */
  font-variant-numeric: tabular-nums;
`;

// src/image-plugin/render-element/image-with-controls/image-size-status/image-size-status.tsx
import { jsxs as jsxs9 } from "react/jsx-runtime";
function ImageSizeStatus({ size }) {
  return /* @__PURE__ */ jsxs9($ImageSizeStatus, { children: [
    size.width,
    " \xD7 ",
    size.height
  ] });
}

// src/image-plugin/styles/image-with-controls-styles/image-toolbar-styles.tsx
import styled19 from "@emotion/styled";
var $ImageToolbar = styled19("span")`
  position: absolute;
  /**
   * On top of the image +1 for space inside outline, +2 for outline,
   * +2 for space outside outline.
   *
   * DO NOT MOVE TO BOTTOM:
   *
   * This is a reminder not to move the preset to the bottom. Visually, it is
   * less obtrusive at the bottom; however, an issue is that when switching
   * between different presets, the preset UI moves up/down making it difficult
   * to switch between different presets. When kept at the top, the preset
   * UI doesn't move.
   */
  top: calc(-1.5em - 5px);
  /**
   * Align left to the outline: +1 for space inside outline, +2 for outline
   * width
   */
  left: -3px;
  /**
   * When we're resizing, the controls aren't usable and just add to visual
   * clutter so we hide it. The transition lets us do it smoothly and less
   * obtrusively.
   */
  transition: opacity 200ms;
  .--dragging & {
    opacity: 0;
  }
  display: flex;
  gap: 0.25em;
`;

// src/image-plugin/styles/image-with-controls-styles/image-buttons-styles.tsx
import styled20 from "@emotion/styled";
var $ImageButtonGroup = styled20("span")`
  /* font-size: 0.75em; */
  border-radius: 0.5em;
  display: flex;
  /**
   * So that inner Preset design shows within the rounded corners.
   */
  overflow: clip;
  /**
   * Let's the menu pop a little over other content. Without it, may be able to
   * see the border of the buttons.
   */
  outline: 1px solid white;
`;
var $ImageButton = styled20("span")`
  font-size: 0.75em;
  line-height: 2em;
  padding: 0 0.625em;
  &:last-child {
    border-right: none;
  }
  cursor: pointer;

  /**
   * We don't want it to wrap
   */
  white-space: nowrap;

  /**
   * Preset default colors
   */
  color: var(--shade-600);
  background: var(--shade-200);
  border-right: 1px solid var(--shade-100);
  /**
   * When preset is disabled, it is lighter in color and with elss contrast.
   */
  &.--disabled {
    cursor: default;
    color: var(--shade-300);
    background: var(--shade-100);
    &:hover {
      color: var(--shade-300);
      background: var(--shade-100);
    }
  }
  &.--selected {
    cursor: default;
    color: var(--blue-700);
    background: var(--blue-200);
    &:hover {
      color: var(--blue-700);
      background: var(--blue-200);
    }
  }
  /**
   * On hover, it is dark, and with higher contrast.
   */
  &:hover {
    color: var(--shade-700);
    background: var(--shade-300);
  }
  svg {
    position: relative;
    top: 0.25em;
    font-size: 1.33em;
    line-height: 1em;
  }
`;

// src/image-plugin/render-element/image-with-controls/image-toolbar/image-preset-buttons/image-preset-button.tsx
import { clsx as clsx3 } from "clsx";
import { useCallback as useCallback6 } from "react";
import { Transforms as Transforms14 } from "slate";
import { ReactEditor as ReactEditor6, useSlateStatic as useSlateStatic6 } from "slate-react";
import { jsx as jsx17 } from "react/jsx-runtime";
function ImagePresetButton({
  element,
  preset,
  size,
  setSize,
  srcSize
}) {
  const editor = useSlateStatic6();
  const presetSize = resizeInPreset(size, srcSize, preset);
  const tooltip = useTooltip({
    title: preset.title,
    hotkey: `${presetSize.width}x${presetSize.height}`
  });
  const onClick = useCallback6(() => {
    const path = ReactEditor6.findPath(editor, element);
    const nextSize = resizeInPreset(size, srcSize, preset);
    setSize(nextSize);
    Transforms14.setNodes(editor, nextSize, { at: path });
  }, [element, preset, size, srcSize]);
  const isEnabled = preset.type === "scale" ? true : preset.width <= srcSize.width || preset.height <= srcSize.height;
  const isDisabled = !isEnabled;
  const isSelected = size.width === presetSize.width && size.height === presetSize.height;
  const className = clsx3({
    "--disabled": isDisabled,
    "--selected": !isDisabled && isSelected
  });
  return /* @__PURE__ */ jsx17(
    $ImageButton,
    {
      className,
      onClick: isDisabled ? void 0 : onClick,
      onMouseEnter: tooltip.onMouseEnter,
      onMouseLeave: tooltip.onMouseLeave,
      children: preset.name
    }
  );
}

// src/image-plugin/render-element/image-with-controls/image-toolbar/image-preset-buttons/image-preset-button-group.tsx
import { jsx as jsx18 } from "react/jsx-runtime";
function ImagePresetButtonGroup({
  element,
  size,
  setSize,
  srcSize,
  presets
}) {
  return /* @__PURE__ */ jsx18($ImageButtonGroup, { children: presets.map((preset, i) => {
    return /* @__PURE__ */ jsx18(
      ImagePresetButton,
      {
        element,
        preset,
        size,
        setSize,
        srcSize
      },
      i
    );
  }) });
}

// src/image-plugin/render-element/image-with-controls/image-toolbar/image-type-buttons/block-image-type-button.tsx
import { useCallback as useCallback7 } from "react";
import { useSlateStatic as useSlateStatic7 } from "slate-react";

// src/image-plugin/render-element/icons.tsx
import { jsx as jsx19, jsxs as jsxs10 } from "react/jsx-runtime";
var BlockIcon = (props) => /* @__PURE__ */ jsxs10(TablerIcon, { ...props, children: [
  /* @__PURE__ */ jsx19("rect", { width: 6, height: 6, x: 4, y: 5, rx: 1 }),
  /* @__PURE__ */ jsx19("path", { d: "M4 15h16M4 19h16" })
] });
var InlineIcon = (props) => /* @__PURE__ */ jsxs10(TablerIcon, { ...props, children: [
  /* @__PURE__ */ jsx19("rect", { width: 6, height: 6, x: 9, y: 5, rx: 1 }),
  /* @__PURE__ */ jsx19("path", { d: "M4 7h1M4 11h1M19 7h1M19 11h1M4 15h16M4 19h16" })
] });

// src/image-plugin/render-element/image-with-controls/image-toolbar/image-type-buttons/convert-to-inline-image.tsx
import { Editor as Editor22, Transforms as Transforms15 } from "slate";
import { ReactEditor as ReactEditor7 } from "slate-react";
function convertToInlineImage(editor, element) {
  if (!element.width || !element.height || !element.srcWidth || !element.srcHeight)
    return;
  const size = { width: element.width, height: element.height };
  const srcSize = { width: element.srcWidth, height: element.srcHeight };
  const path = ReactEditor7.findPath(editor, element);
  Editor22.withoutNormalizing(editor, () => {
    const nextSize = resizeInPreset(size, srcSize, {
      name: "initial-inline-image",
      title: "",
      type: "bounds",
      width: 24,
      height: 24
    });
    Transforms15.setNodes(
      editor,
      { type: "image-inline", ...nextSize },
      { at: path }
    );
    Transforms15.wrapNodes(
      editor,
      { type: "paragraph", children: [] },
      { at: path }
    );
  });
}

// src/image-plugin/render-element/image-with-controls/image-toolbar/image-type-buttons/block-image-type-button.tsx
import { jsx as jsx20 } from "react/jsx-runtime";
function BlockImageTypeButton({
  element
}) {
  const editor = useSlateStatic7();
  const tooltip = useTooltip({
    title: "Inline Image",
    hotkey: "In a line with text"
  });
  const onClickInline = useCallback7(() => {
    if (element.type !== "image-block")
      return;
    convertToInlineImage(editor, element);
  }, [editor, element]);
  return /* @__PURE__ */ jsx20(
    $ImageButton,
    {
      className: element.type === "image-inline" ? "--selected" : "",
      onClick: element.type === "image-inline" ? void 0 : onClickInline,
      onMouseEnter: tooltip.onMouseEnter,
      onMouseLeave: tooltip.onMouseLeave,
      children: /* @__PURE__ */ jsx20(InlineIcon, {})
    }
  );
}

// src/image-plugin/render-element/image-with-controls/image-toolbar/image-type-buttons/inline-image-type-button.tsx
import { useCallback as useCallback8 } from "react";
import { useSlateStatic as useSlateStatic8 } from "slate-react";

// src/image-plugin/render-element/image-with-controls/image-toolbar/image-type-buttons/convert-to-block-image.tsx
import { Editor as Editor23, Text as Text3, Transforms as Transforms16 } from "slate";
import { ReactEditor as ReactEditor8 } from "slate-react";
function convertToBlockImage(editor, element) {
  if (!element.width || !element.height || !element.srcWidth || !element.srcHeight)
    return;
  const size = { width: element.width, height: element.height };
  const srcSize = { width: element.srcWidth, height: element.srcHeight };
  const path = ReactEditor8.findPath(editor, element);
  Editor23.withoutNormalizing(editor, () => {
    const nextSize = resizeInPreset(size, srcSize, {
      name: "initial-block-image",
      title: "",
      type: "bounds",
      width: 320,
      height: 320
    });
    Transforms16.setNodes(
      editor,
      { type: "image-block", ...nextSize },
      { at: path }
    );
    const parentEntry = findElementUp(
      editor,
      (node) => Editor23.isBlock(editor, node) && node.type !== "image-block"
    );
    if (!parentEntry)
      throw new Error("This shouldn't happen");
    const [parentElement, parentPath] = parentEntry;
    const siblings = parentElement.children;
    const siblingCount = parentElement.children.length;
    const index = path.slice(-1)[0];
    const lastSibling = siblings[siblingCount - 1];
    if (index === siblingCount - 2 && Text3.isText(lastSibling) && lastSibling.text === "") {
      Transforms16.removeNodes(editor, {
        at: [...parentPath, siblingCount - 1]
      });
    }
    const firstSibling = siblings[0];
    const removeFirstSibling = index === 1 && Text3.isText(firstSibling) && firstSibling.text === "";
    if (removeFirstSibling) {
      Transforms16.removeNodes(editor, { at: [...parentPath, 0] });
    }
    Transforms16.liftNodes(editor, {
      at: [...parentPath, removeFirstSibling ? index - 1 : index]
    });
  });
}

// src/image-plugin/render-element/image-with-controls/image-toolbar/image-type-buttons/inline-image-type-button.tsx
import { jsx as jsx21 } from "react/jsx-runtime";
function InlineImageTypeButton({
  element
}) {
  const editor = useSlateStatic8();
  const tooltip = useTooltip({
    title: "Block Image",
    hotkey: "On a line by itself"
  });
  const onClickBlock = useCallback8(() => {
    if (element.type !== "image-inline")
      return;
    convertToBlockImage(editor, element);
  }, [editor, element]);
  return /* @__PURE__ */ jsx21(
    $ImageButton,
    {
      className: element.type === "image-block" ? "--selected" : "",
      onClick: element.type === "image-block" ? void 0 : onClickBlock,
      onMouseEnter: tooltip.onMouseEnter,
      onMouseLeave: tooltip.onMouseLeave,
      children: /* @__PURE__ */ jsx21(BlockIcon, {})
    }
  );
}

// src/image-plugin/render-element/image-with-controls/image-toolbar/image-type-buttons/image-type-button-group.tsx
import { jsx as jsx22, jsxs as jsxs11 } from "react/jsx-runtime";
function ImageTypeButtonGroup({
  element
}) {
  return /* @__PURE__ */ jsxs11($ImageButtonGroup, { children: [
    /* @__PURE__ */ jsx22(InlineImageTypeButton, { element }),
    /* @__PURE__ */ jsx22(BlockImageTypeButton, { element })
  ] });
}

// src/image-plugin/render-element/image-with-controls/image-toolbar/image-toolbar.tsx
import { jsx as jsx23, jsxs as jsxs12 } from "react/jsx-runtime";
function ImageToolbar({
  element,
  size,
  setSize,
  srcSize,
  presets
}) {
  return /* @__PURE__ */ jsxs12($ImageToolbar, { children: [
    /* @__PURE__ */ jsx23(ImageTypeButtonGroup, { element }),
    /* @__PURE__ */ jsx23(
      ImagePresetButtonGroup,
      {
        element,
        size,
        setSize,
        srcSize,
        presets
      }
    )
  ] });
}

// src/image-plugin/render-element/image-with-controls/index.tsx
import { jsx as jsx24, jsxs as jsxs13 } from "react/jsx-runtime";
function ImageWithControls({
  element,
  presets
}) {
  const url = element.url;
  const selected = useSelected2();
  const [isDragging, setIsDragging] = useState4(false);
  const [size, setSize] = useState4(
    element.srcWidth && element.srcHeight && element.width && element.height ? { width: element.width, height: element.height } : null
  );
  const srcSize = element.srcWidth && element.srcHeight ? { width: element.srcWidth, height: element.srcHeight } : null;
  const showControls = selected && size && srcSize;
  const className = clsx4({
    "--selected": selected,
    "--dragging": isDragging,
    "--small": size && (size.width <= 64 || size.height <= 64)
  });
  return /* @__PURE__ */ jsxs13($ImageContainer, { className, children: [
    /* @__PURE__ */ jsx24($Image, { src: url, width: size?.width, height: size?.height }),
    showControls ? /* @__PURE__ */ jsx24(
      ImageToolbar,
      {
        element,
        size,
        setSize,
        srcSize,
        presets
      }
    ) : null,
    isDragging && size ? /* @__PURE__ */ jsx24(ImageSizeStatus, { size }) : null,
    showControls ? /* @__PURE__ */ jsx24(
      ImageResizeControl,
      {
        element,
        srcSize,
        isDragging,
        setIsDragging,
        size,
        setSize
      }
    ) : null
  ] });
}

// src/image-plugin/render-element/image-block.tsx
import { jsx as jsx25, jsxs as jsxs14 } from "react/jsx-runtime";
function ImageBlock({
  element,
  attributes,
  children
}) {
  const editor = useSlateStatic9();
  return /* @__PURE__ */ jsxs14("div", { ...attributes, children: [
    /* @__PURE__ */ jsx25($ImageBlock, { contentEditable: false, children: /* @__PURE__ */ jsx25(
      ImageWithControls,
      {
        element,
        presets: editor.image.imageBlockPresets
      }
    ) }),
    children
  ] });
}

// src/image-plugin/render-element/image-inline.tsx
import { useSlateStatic as useSlateStatic10 } from "slate-react";

// src/image-plugin/styles/image-inline-styles.tsx
import styled21 from "@emotion/styled";
var $ImageInline = styled21("span")`
  display: inline;
`;

// src/image-plugin/render-element/image-inline.tsx
import { jsx as jsx26, jsxs as jsxs15 } from "react/jsx-runtime";
function ImageInline({
  element,
  attributes,
  children
}) {
  const editor = useSlateStatic10();
  return /* @__PURE__ */ jsxs15("span", { ...attributes, style: { display: "inline-block" }, children: [
    /* @__PURE__ */ jsx26($ImageInline, { contentEditable: false, children: /* @__PURE__ */ jsx26(
      ImageWithControls,
      {
        element,
        presets: editor.image.imageInlinePresets
      }
    ) }),
    children
  ] });
}

// src/image-plugin/render-element/index.tsx
import { jsx as jsx27 } from "react/jsx-runtime";
function renderElement({
  element,
  attributes,
  children
}) {
  switch (element.type) {
    case "image-block":
      return /* @__PURE__ */ jsx27(ImageBlock, { element, attributes, children });
    case "image-inline":
      return /* @__PURE__ */ jsx27(ImageInline, { element, attributes, children });
  }
}

// src/image-plugin/index.tsx
function createOnDrop2(editor) {
  return (event) => {
    const { dataTransfer } = event;
    if (!dataTransfer.files || dataTransfer.files.length === 0) {
      return false;
    }
    const imageFiles = Array.from(dataTransfer.files).filter(
      (file) => file.type.startsWith("image/")
    );
    if (imageFiles.length === 0) {
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    const range = ReactEditor9.findEventRange(editor, event);
    if (range) {
      Transforms17.select(editor, range);
    }
    const onImageChange = editor.wysimark?.onImageChange;
    imageFiles.forEach(async (file) => {
      if (onImageChange) {
        try {
          const url = await onImageChange(file);
          if (url) {
            editor.image.insertImageFromUrl(url, file.name, "");
          }
        } catch (error) {
          console.error("Failed to upload image:", error);
        }
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          editor.image.insertImageFromUrl(dataUrl, file.name, "");
        };
        reader.readAsDataURL(file);
      }
    });
    return true;
  };
}
var DEFAULT_OPTIONS = {
  maxInitialInlineImageSize: { width: 64, height: 64 },
  maxInitialImageSize: { width: 320, height: 320 },
  maxImageSize: { width: 1024, height: 1024 },
  imageBlockPresets: [
    /**
     * Pixel Presets
     */
    { name: "S", title: "Small", type: "bounds", width: 160, height: 160 },
    { name: "M", title: "Medium", type: "bounds", width: 320, height: 320 },
    { name: "L", title: "Large", type: "bounds", width: 640, height: 640 },
    /**
     * Scale Presets
     */
    { name: "\u2153", title: "1/3 scale", type: "scale", scale: 1 / 3 },
    { name: "\xBD", title: "1/2 scale", type: "scale", scale: 0.5 },
    { name: "Full", title: "Full size", type: "scale", scale: 1 }
  ],
  imageInlinePresets: [
    /**
     * Pixel Presets
     */
    {
      name: "16",
      title: "16 pixels",
      type: "bounds",
      width: 16,
      height: 16
    },
    {
      name: "24",
      title: "24 pixels",
      type: "bounds",
      width: 24,
      height: 24
    },
    {
      name: "32",
      title: "32 pixels",
      type: "bounds",
      width: 32,
      height: 32
    },
    /**
     * Scale Presets
     */
    { name: "\u2153", title: "1/3 scale", type: "scale", scale: 1 / 3 },
    { name: "\xBD", title: "1/2 scale", type: "scale", scale: 0.5 },
    { name: "Full", title: "Full size", type: "scale", scale: 1 }
  ]
};
var ImagePlugin = (
  //({
  createPlugin(
    (editor, sinkOptions, { createPolicy }) => {
      const options = {
        ...DEFAULT_OPTIONS,
        ...sinkOptions.image
      };
      editor.image = {
        ...createImageMethods(editor),
        maxInitialInlineImageSize: options.maxInitialInlineImageSize,
        maxInitialImageSize: options.maxInitialImageSize,
        maxImageSize: options.maxImageSize,
        imageBlockPresets: options.imageBlockPresets,
        imageInlinePresets: options.imageInlinePresets
      };
      return createPolicy({
        name: "image",
        editor: {
          isVoid: (element) => {
            if (["image-block", "image-inline"].includes(element.type)) {
              return true;
            }
          },
          isInline: (element) => {
            if (element.type === "image-inline")
              return true;
          },
          normalizeNode: curryOne(normalizeNode2, editor)
        },
        editableProps: {
          renderElement,
          onDrop: createOnDrop2(editor)
        }
      });
    }
  )
);

// src/block-quote-plugin/index.tsx
import { Editor as Editor25, Element as Element11, Transforms as Transforms18 } from "slate";

// src/block-quote-plugin/styles.tsx
import styled22 from "@emotion/styled";
var $BlockQuote = styled22("blockquote")`
  position: relative;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  border-left: 0.25em solid rgba(0, 0, 0, 0.075);
  padding-left: 1.5em;
`;

// src/block-quote-plugin/index.tsx
import { jsx as jsx28 } from "react/jsx-runtime";
function matchBlockQuoteSafe(node) {
  return Element11.isElement(node) && /**
   * TODO:
   *
   * This is probably:
   * Element.isElement(node) && !Element.isInline(node) &&
   * !Element.isDependant(node)
   */
  (node.type === "paragraph" || node.type === "code-block" || node.type === "table" || node.type === "horizontal-rule" || node.type === "task-list-item" || node.type === "unordered-list-item" || node.type === "ordered-list-item" || node.type === "heading");
}
var MAX_DEPTH = 2;
var BlockQuotePlugin = createPlugin(
  (editor) => {
    editor.supportsBlockQuote = true;
    editor.blockQuotePlugin = {
      indent: () => {
        Transforms18.wrapNodes(
          editor,
          { type: "block-quote", children: [] },
          { match: matchBlockQuoteSafe }
        );
      },
      outdent: () => {
        Transforms18.liftNodes(editor, {
          match: (node, path) => matchBlockQuoteSafe(node) && path.length > 1
        });
      },
      isActive: () => {
        const [match] = Editor25.nodes(editor, {
          match: (n) => Element11.isElement(n) && n.type === "block-quote"
        });
        return !!match;
      },
      increaseDepth: () => {
        const [match] = Editor25.nodes(editor, {
          match: (n) => Element11.isElement(n) && n.type === "block-quote"
        });
        if (!match)
          return;
        if (!editor.blockQuotePlugin.canIncreaseDepth())
          return;
        const [, path] = match;
        Transforms18.select(editor, path);
        Transforms18.wrapNodes(
          editor,
          { type: "block-quote", children: [] },
          { at: path, split: false }
        );
      },
      decreaseDepth: () => {
        const [match] = Editor25.nodes(editor, {
          match: (n) => Element11.isElement(n) && n.type === "block-quote"
        });
        if (!match)
          return;
        if (!editor.blockQuotePlugin.canDecreaseDepth())
          return;
        const [node, path] = match;
        const children = node.children;
        if (children.length === 1 && Element11.isElement(children[0]) && children[0].type === "block-quote") {
          Transforms18.unwrapNodes(editor, {
            at: [...path, 0],
            // Path to the nested block-quote
            match: (n) => Element11.isElement(n) && n.type === "block-quote"
          });
        }
      },
      canIncreaseDepth: () => {
        const [match] = Editor25.nodes(editor, {
          match: (n) => Element11.isElement(n) && n.type === "block-quote"
        });
        if (!match)
          return false;
        const [node] = match;
        let depth = 0;
        let current = node;
        while (current.children.length === 1 && Element11.isElement(current.children[0]) && current.children[0] && current.children[0] && current.children[0].type === "block-quote") {
          depth++;
          current = current.children[0];
        }
        return depth < MAX_DEPTH;
      },
      canDecreaseDepth: () => {
        const [match] = Editor25.nodes(editor, {
          match: (n) => Element11.isElement(n) && n.type === "block-quote"
        });
        if (!match)
          return false;
        const [node] = match;
        return node.children.length === 1 && Element11.isElement(node.children[0]) && node.children[0] && node.children[0].type === "block-quote";
      }
    };
    return {
      name: "block-quote",
      editor: {
        normalizeNode(entry) {
          const [node, path] = entry;
          if (!Element11.isElement(node))
            return false;
          if (node.type !== "block-quote")
            return false;
          return normalizeSiblings(editor, [node, path], (a, b) => {
            if (Element11.isElement(a[0]) && Element11.isElement(b[0]) && a[0].type === "block-quote" && b[0].type === "block-quote") {
              Transforms18.mergeNodes(editor, { at: b[1] });
            }
            return true;
          });
        }
      },
      editableProps: {
        renderElement: ({ element, attributes, children }) => {
          if (element.type === "block-quote") {
            return /* @__PURE__ */ jsx28($BlockQuote, { ...attributes, children });
          }
        },
        onKeyDown: createHotkeyHandler({
          "super+.": editor.blockQuotePlugin.indent,
          "super+,": editor.blockQuotePlugin.outdent
        })
      }
    };
  }
);

// src/code-block-plugin/index.tsx
import { Editor as Editor28, Element as Element15, Transforms as Transforms21 } from "slate";

// src/code-block-plugin/decorate.tsx
import Prism from "prismjs";
import { Element as Element12, Node as Node6 } from "slate";
var { languages, tokenize } = Prism;
function getLineOffsets(lines) {
  let offset = 0;
  const lineOffsets = [];
  for (const line of lines) {
    lineOffsets.push(offset);
    offset = offset + line.length;
  }
  return lineOffsets;
}
function decorate(nodeEntry) {
  const [node, path] = nodeEntry;
  if (!Element12.isElement(node))
    return [];
  if (node.type !== "code-block")
    return [];
  const lang = languages[node.language];
  if (lang === void 0)
    return [];
  const codeLineElements = node.children;
  const textLines = codeLineElements.map((node2) => `${Node6.string(node2)}
`);
  const text = textLines.join("");
  const lineOffsets = getLineOffsets(textLines);
  function getPointFromOffset(offset2) {
    for (let i = lineOffsets.length; i >= 0; i--) {
      const lineOffset = lineOffsets[i];
      if (lineOffset <= offset2) {
        return {
          path: [...path, i],
          offset: offset2 - lineOffset
        };
      }
    }
    throw new Error("This shouldn't happen and indicates a bug in the logic");
  }
  const ranges = [];
  const tokens = tokenize(text, lang);
  let offset = 0;
  for (const token of tokens) {
    if (typeof token === "string") {
      offset += token.length;
    } else {
      const anchor = getPointFromOffset(offset);
      const focus = getPointFromOffset(offset + token.length);
      ranges.push({
        anchor,
        focus,
        prismToken: token.type
      });
      offset += token.length;
    }
  }
  return ranges;
}

// src/code-block-plugin/methods/createCodeBlock.ts
function createCodeBlock(editor, { language }) {
  insertRootElement(editor, {
    type: "code-block",
    language,
    children: [{ type: "code-block-line", children: [{ text: "" }] }]
  });
}

// src/code-block-plugin/methods/setCodeBlockLanguage.ts
import { Element as Element13, Transforms as Transforms19 } from "slate";
function setCodeBlockLanguage(editor, language, options = {}) {
  const entry = findElementUp(
    editor,
    (el) => Element13.isElement(el) && el.type === "code-block",
    { at: options.at }
  );
  if (!entry)
    return false;
  Transforms19.setNodes(editor, { language }, { at: entry[1] });
  return true;
}

// src/code-block-plugin/methods/index.ts
function createCodeBlockMethods(editor) {
  return {
    createCodeBlock: curryOne(createCodeBlock, editor),
    setCodeBlockLanguage: curryOne(setCodeBlockLanguage, editor)
  };
}

// src/code-block-plugin/prism-theme.ts
var commentStyle = { color: "#999988", fontStyle: "italic" };
var dimStyle = { opacity: "0.7" };
var stringStyle = { color: "#e3116c" };
var operatorStyle = { color: "#393a34" };
var valueStyle = { color: "#36acaa" };
var keywordStyle = { color: "#00a4db" };
var functionStyle = { color: "#9a050f" };
var tagStyle = { color: "#00009f" };
var boldStyle = { fontWeight: "bold" };
var italicStyle = { fontStyle: "italic" };
var tokenStyles = {
  comment: commentStyle,
  prolog: commentStyle,
  doctype: commentStyle,
  cdata: commentStyle,
  namespace: dimStyle,
  string: stringStyle,
  "attr-value": stringStyle,
  puncutation: operatorStyle,
  operator: operatorStyle,
  entity: valueStyle,
  url: valueStyle,
  symbol: valueStyle,
  number: valueStyle,
  boolean: valueStyle,
  variable: valueStyle,
  constant: valueStyle,
  property: valueStyle,
  regex: valueStyle,
  insert: valueStyle,
  atrule: keywordStyle,
  keyword: keywordStyle,
  "attr-name": keywordStyle,
  function: { ...functionStyle, ...boldStyle },
  delete: functionStyle,
  tag: tagStyle,
  selector: tagStyle,
  important: boldStyle,
  bold: boldStyle,
  italic: italicStyle
};

// src/code-block-plugin/types.tsx
var LanguageList = [
  "text",
  "html",
  "css",
  "svg",
  "javascript",
  "java",
  "c"
];

// src/code-block-plugin/normalizeNode.tsx
import { Element as Element14, Node as Node7, Transforms as Transforms20 } from "slate";
function normalizeNode3(editor, entry) {
  if (!Element14.isElement(entry[0]))
    return false;
  if (entry[0].type === "code-block-line") {
    for (const [child, path] of Node7.children(editor, entry[1])) {
      if (!Element14.isElement(child))
        continue;
      if (editor.isVoid(child)) {
        Transforms20.removeNodes(editor, { at: path });
        return true;
      } else {
        Transforms20.unwrapNodes(editor, { at: path });
        return true;
      }
    }
  }
  if (entry[0].type === "code-block") {
    for (const [child, path] of Node7.children(editor, entry[1])) {
      if (!Element14.isElement(child))
        continue;
      if (child.type === "code-block-line")
        continue;
      if (child.type === "code-block") {
        Transforms20.unwrapNodes(editor, { at: path });
        return true;
      } else if (editor.isVoid(child)) {
        Transforms20.removeNodes(editor, { at: path });
        return true;
      } else {
        Transforms20.removeNodes(editor, { at: path });
        Transforms20.insertNodes(editor, {
          type: "code-block-line",
          children: [{ text: Node7.string(child) }]
        });
        return true;
      }
    }
  }
  return false;
}

// src/code-block-plugin/render-element/CodeBlock.tsx
import { useCallback as useCallback9, useRef as useRef5 } from "react";
import { useSelected as useSelected3 } from "slate-react";

// src/code-block-plugin/icons/ChevronDownIcon.tsx
import { jsx as jsx29 } from "react/jsx-runtime";
var ChevronDownIcon = (props) => /* @__PURE__ */ jsx29(TablerIcon, { ...props, children: /* @__PURE__ */ jsx29("path", { d: "m6 9 6 6 6-6" }) });

// src/code-block-plugin/styles.ts
import styled23 from "@emotion/styled";
var $CodeBlock = styled23("div")`
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
`;
var $CodeBlockScroller = styled23("div")`
  padding: 2.25em 1em 1.5em 1em;
  border-radius: 0.5em;
  overflow-x: auto;
`;
var $CodeBlockLanguage = styled23("span")`
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
`;
var $CodeBlockLine = styled23("div")`
  white-space: pre;
  line-height: 1.5em;
  counter-increment: line;
  font-family: "andale mono", AndaleMono, monospace;
  font-size: 0.875em;
  &.--selected {
    background-color: var(--shade-100);
  }
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
`;

// src/code-block-plugin/render-element/CodeBlock.tsx
import { jsx as jsx30, jsxs as jsxs16 } from "react/jsx-runtime";
function CodeBlock({
  element,
  attributes,
  children
}) {
  const ref = useRef5(null);
  const selected = useSelected3();
  const dropdown = useLayer("code-block-dropdown");
  const onClick = useCallback9(() => {
    if (dropdown.layer)
      dropdown.close();
    const dest = ref.current;
    if (dest === null)
      return;
    const items = LanguageList.map((language) => {
      return {
        icon: () => /* @__PURE__ */ jsx30("span", {}),
        title: language,
        action: (editor) => {
          editor.codeBlock.setCodeBlockLanguage(language, { at: element });
        }
      };
    });
    dropdown.open(() => /* @__PURE__ */ jsx30(Menu, { dest, items, close: dropdown.close }));
  }, [element]);
  return /* @__PURE__ */ jsxs16($CodeBlock, { className: selected ? "--selected" : "", ...attributes, children: [
    /* @__PURE__ */ jsxs16($CodeBlockLanguage, { contentEditable: false, onClick, ref, children: [
      /* @__PURE__ */ jsx30("span", { children: element.language }),
      /* @__PURE__ */ jsx30(ChevronDownIcon, {})
    ] }),
    /* @__PURE__ */ jsx30($CodeBlockScroller, { children })
  ] });
}

// src/code-block-plugin/render-element/CodeBlockLine.tsx
import { useSelected as useSelected4 } from "slate-react";
import { jsx as jsx31 } from "react/jsx-runtime";
function CodeBlockLine({
  attributes,
  children
}) {
  const selected = useSelected4();
  return /* @__PURE__ */ jsx31(
    $CodeBlockLine,
    {
      className: selected ? "--selected" : "",
      ...attributes,
      spellCheck: "false",
      children
    }
  );
}

// src/code-block-plugin/render-element/index.tsx
import { jsx as jsx32 } from "react/jsx-runtime";
function renderElement2({
  element,
  attributes,
  children
}) {
  if (element.type === "code-block") {
    return /* @__PURE__ */ jsx32(CodeBlock, { element, attributes, children });
  } else if (element.type === "code-block-line") {
    return /* @__PURE__ */ jsx32(CodeBlockLine, { element, attributes, children });
  }
}

// src/code-block-plugin/index.tsx
import { jsx as jsx33 } from "react/jsx-runtime";
var CodeBlockPlugin = createPlugin(
  (editor, _options, { createPolicy }) => {
    editor.codeBlock = createCodeBlockMethods(editor);
    function onDelete() {
      const { selection } = editor;
      if (!isCollapsed(selection))
        return false;
      const codeBlockEntry = findElementUp(editor, "code-block");
      if (codeBlockEntry == null)
        return false;
      const codeBlockText = Editor28.string(editor, codeBlockEntry[1]);
      if (codeBlockText === "") {
        Transforms21.removeNodes(editor, { at: codeBlockEntry[1] });
        return true;
      }
      return false;
    }
    return createPolicy({
      name: "code-block",
      editor: {
        deleteBackward: onDelete,
        deleteForward: onDelete,
        isInline(element) {
          if (element.type === "code-block" || element.type === "code-block-line")
            return false;
        },
        isVoid(element) {
          if (element.type === "code-block" || element.type == "code-block-line")
            return false;
        },
        isMaster(element) {
          if (element.type === "code-block")
            return true;
        },
        normalizeNode: curryOne(normalizeNode3, editor)
      },
      editableProps: {
        decorate,
        onKeyDown: createHotkeyHandler({
          "super+`": () => editor.codeBlock.createCodeBlock({ language: "text" }),
          "mod+a": () => {
            const entry = findElementUp(
              editor,
              (el) => Element15.isElement(el) && el.type === "code-block"
            );
            if (!entry)
              return false;
            Transforms21.select(editor, entry[1]);
            return true;
          }
        }),
        renderElement: renderElement2,
        renderLeaf: ({ leaf, children }) => {
          const style = leaf.prismToken ? tokenStyles[leaf.prismToken] || null : null;
          if (style === null) {
            return children;
          } else {
            return /* @__PURE__ */ jsx33("span", { style, children });
          }
        }
      }
    });
  }
);

// src/collapsible-paragraph-plugin/index.tsx
import { Editor as Editor32 } from "slate";

// src/collapsible-paragraph-plugin/normalize-node/index.ts
import { Element as Element18 } from "slate";

// src/collapsible-paragraph-plugin/normalize-node/normalize-sibling-paragraphs.ts
import { Element as Element16, Transforms as Transforms22 } from "slate";
function isParagraph(node) {
  return Element16.isElement(node) && node.type === "paragraph";
}
function normalizeSiblingParagraphs(editor, entry) {
  return normalizeSiblings(editor, entry, (a, b) => {
    if (!isParagraph(a[0]) || !isParagraph(b[0]))
      return false;
    if (a[0].__collapsible && b[0].__collapsible) {
      Transforms22.removeNodes(editor, { at: a[1] });
      return true;
    }
    return false;
  });
}

// src/collapsible-paragraph-plugin/normalize-node/normalize-sibling-walls.ts
import { Element as Element17, Transforms as Transforms23 } from "slate";
function isWall(editor, node) {
  if (!Element17.isElement(node))
    return false;
  return editor.isVoid(node) || editor.isMaster(node);
}
function normalizeSiblingWalls(editor, entry) {
  if (!isWall(editor, entry[0]))
    return false;
  return normalizeSiblings(editor, entry, (a, b) => {
    if (!isWall(editor, a[0]) || !isWall(editor, b[0]))
      return false;
    Transforms23.insertNodes(
      editor,
      {
        type: "paragraph",
        __collapsible: true,
        children: [{ text: "" }]
      },
      { at: b[1] }
    );
    return true;
  });
}

// src/collapsible-paragraph-plugin/normalize-node/index.ts
function normalizeNode4(editor, entry) {
  const [node, path] = entry;
  if (!Element18.isElement(node))
    return false;
  if (normalizeSiblingWalls(editor, [node, path]))
    return true;
  if (normalizeSiblingParagraphs(editor, [node, path]))
    return true;
  return false;
}

// src/collapsible-paragraph-plugin/render-element/paragraph.tsx
import { clsx as clsx5 } from "clsx";
import { useSelected as useSelected5 } from "slate-react";

// src/collapsible-paragraph-plugin/render-element/styles.ts
import styled24 from "@emotion/styled";
var $Paragraph = styled24("p")`
  padding: 0;
  margin: 1em 0;
  &:first-child {
    margin-top: 0;
  }

  transition: background-color 200ms, margin-top 200ms, padding-top 200ms,
    margin-bottom 200ms, padding-bottom 200ms, font-size 200ms;

  &.--collapsible&.--empty {
    font-size: 0.25em; /* font-size is collapsed to 1/4 of regular em */
    margin: -4em 0; /* margin grows to 3/4 of regular em leaving space */
    padding: 1em 0; /* this is kind of eye-balling it */
    border-radius: 1em;
    &:hover {
      background: rgba(0, 127, 255, 0.1);
      cursor: pointer;
    }
  }
  &.--collapsible&.--empty&.--selected {
    font-size: 1em;
    padding: 0;
    margin: 1em 0;
    &:hover {
      background: none;
      cursor: default;
    }
    border-radius: 8px;
  }
`;

// src/collapsible-paragraph-plugin/render-element/utils.ts
import { Node as Node10 } from "slate";
function getIsEmpty(element) {
  return element.children.length === 1 && Node10.string(element.children[0]).length === 0;
}

// src/collapsible-paragraph-plugin/render-element/paragraph.tsx
import { jsx as jsx34 } from "react/jsx-runtime";
function Paragraph({
  element,
  attributes,
  children
}) {
  const selected = useSelected5();
  const isEmpty = getIsEmpty(element);
  return /* @__PURE__ */ jsx34(
    $Paragraph,
    {
      ...attributes,
      className: clsx5({
        "--selected": selected,
        "--empty": isEmpty,
        "--collapsible": !!element.__collapsible
      }),
      children
    }
  );
}

// src/collapsible-paragraph-plugin/index.tsx
import { jsx as jsx35 } from "react/jsx-runtime";
var CollapsibleParagraphPlugin = createPlugin((editor) => {
  const { insertBreak: insertBreak3 } = editor;
  editor.insertBreak = () => {
    const { selection } = editor;
    if (selection && selection.anchor.path[0] === selection.focus.path[0]) {
      const text = Editor32.string(editor, [selection.anchor.path[0]]);
      if (text.match(/\n$/) || text.match(/\n\n/)) {
        insertBreak3();
      } else {
        editor.insertText("\n");
      }
    } else {
      insertBreak3();
    }
  };
  editor.convertElement.addConvertElementType("paragraph");
  editor.collapsibleParagraph = {
    convertParagraph: () => {
      editor.convertElement.convertElements(
        () => false,
        {
          type: "paragraph"
        },
        false
      );
    }
  };
  if (!editor.normalizeAfterDelete) {
    throw new Error(
      `The collapsible-paragraph-plugin has a dependency on the normalize-after-delete plugin. Please add that plugin before this one.`
    );
  }
  return {
    name: "collapsible-paragraph",
    editor: {
      normalizeNode: curryOne(normalizeNode4, editor)
    },
    editableProps: {
      renderElement: ({ element, attributes, children }) => {
        switch (element.type) {
          case "paragraph": {
            return /* @__PURE__ */ jsx35(Paragraph, { element, attributes, children });
          }
        }
      },
      onKeyDown: createHotkeyHandler({
        "super+0": editor.collapsibleParagraph.convertParagraph
      })
    }
  };
});

// src/convert-element-plugin/methods/add-convert-element-type.ts
function addConvertElementType(editor, type) {
  if (Array.isArray(type)) {
    editor.convertElement.convertElementTypes.push(...type);
  } else {
    editor.convertElement.convertElementTypes.push(type);
  }
}

// src/convert-element-plugin/methods/convert-elements.ts
import { Editor as Editor33, Element as Element20, Node as Node11, Point, Transforms as Transforms24 } from "slate";
function elementContainsNewlines(element) {
  const text = Node11.string(element);
  return text.includes("\n");
}
function getSelectedLineIndices(editor, element, elementPath, selection) {
  const text = Node11.string(element);
  const lines = text.split("\n");
  const elementStart = Editor33.start(editor, elementPath);
  const elementEnd = Editor33.end(editor, elementPath);
  const start = Point.isBefore(selection.anchor, elementStart) ? elementStart : Point.isAfter(selection.anchor, elementEnd) ? elementEnd : selection.anchor;
  const end = Point.isBefore(selection.focus, elementStart) ? elementStart : Point.isAfter(selection.focus, elementEnd) ? elementEnd : selection.focus;
  const startOffset = Math.min(
    Editor33.string(editor, { anchor: elementStart, focus: start }).length,
    text.length
  );
  const endOffset = Math.min(
    Editor33.string(editor, { anchor: elementStart, focus: end }).length,
    text.length
  );
  const minOffset = Math.min(startOffset, endOffset);
  const maxOffset = Math.max(startOffset, endOffset);
  let currentOffset = 0;
  let startLineIndex = 0;
  let endLineIndex = lines.length - 1;
  for (let i = 0; i < lines.length; i++) {
    const lineEnd = currentOffset + lines[i].length;
    if (currentOffset <= minOffset && minOffset <= lineEnd) {
      startLineIndex = i;
    }
    if (currentOffset <= maxOffset && maxOffset <= lineEnd) {
      endLineIndex = i;
      break;
    }
    currentOffset = lineEnd + 1;
  }
  return { startLineIndex, endLineIndex };
}
function splitElementAtSelectedLines(editor, element, path, selection) {
  const text = Node11.string(element);
  if (!text.includes("\n")) {
    return path;
  }
  const lines = text.split("\n");
  if (lines.length <= 1) {
    return path;
  }
  const { startLineIndex, endLineIndex } = getSelectedLineIndices(
    editor,
    element,
    path,
    selection
  );
  const beforeLines = lines.slice(0, startLineIndex);
  const selectedLines = lines.slice(startLineIndex, endLineIndex + 1);
  const afterLines = lines.slice(endLineIndex + 1);
  if (beforeLines.length === 0 && afterLines.length === 0) {
    return path;
  }
  Editor33.withoutNormalizing(editor, () => {
    const basePath = path.slice(0, -1);
    const baseIndex = path[path.length - 1];
    if (afterLines.length > 0) {
      const afterText = afterLines.join("\n");
      const afterElement = {
        ...element,
        children: [{ text: afterText }]
      };
      Transforms24.insertNodes(editor, afterElement, {
        at: [...basePath, baseIndex + 1]
      });
    }
    const childrenCount = element.children.length;
    for (let j = childrenCount - 1; j >= 0; j--) {
      Transforms24.removeNodes(editor, { at: [...path, j] });
    }
    if (beforeLines.length > 0) {
      Transforms24.insertNodes(
        editor,
        { text: beforeLines.join("\n") },
        { at: [...path, 0] }
      );
      const selectedText = selectedLines.join("\n");
      const selectedElement = {
        type: "paragraph",
        children: [{ text: selectedText }]
      };
      Transforms24.insertNodes(editor, selectedElement, {
        at: [...basePath, baseIndex + 1]
      });
    } else {
      Transforms24.insertNodes(
        editor,
        { text: selectedLines.join("\n") },
        { at: [...path, 0] }
      );
    }
  });
  if (beforeLines.length > 0) {
    return [...path.slice(0, -1), path[path.length - 1] + 1];
  }
  return path;
}
function convertElements(editor, matchForToggle, targetElement, allowToggle) {
  const { selection } = editor;
  if (!selection)
    return false;
  const entries = Array.from(
    Editor33.nodes(editor, {
      match: (node) => Element20.isElement(node) && editor.convertElement.isConvertibleElement(node)
    })
  );
  if (entries.length === 0)
    return false;
  const allPaths = [];
  Editor33.withoutNormalizing(editor, () => {
    for (let i = entries.length - 1; i >= 0; i--) {
      const [element, path] = entries[i];
      if (elementContainsNewlines(element)) {
        const splitPath = splitElementAtSelectedLines(
          editor,
          element,
          path,
          selection
        );
        allPaths.unshift(splitPath);
      } else {
        allPaths.unshift(path);
      }
    }
  });
  const updatedEntries = allPaths.map((path) => {
    try {
      const node = Node11.get(editor, path);
      if (Element20.isElement(node)) {
        return [node, path];
      }
      return null;
    } catch {
      return null;
    }
  }).filter((entry) => entry !== null);
  if (updatedEntries.length === 0)
    return false;
  const shouldToggle = allowToggle && updatedEntries.every((entry) => matchForToggle(entry[0]));
  if (shouldToggle) {
    Editor33.withoutNormalizing(editor, () => {
      for (const entry of updatedEntries) {
        rewrapElement(editor, { type: "paragraph" }, entry[1]);
      }
    });
  } else {
    Editor33.withoutNormalizing(editor, () => {
      for (const entry of updatedEntries) {
        rewrapElement(editor, targetElement, entry[1]);
      }
    });
  }
  return true;
}

// src/convert-element-plugin/methods/is-convert-element.ts
function isConvertElement(editor, element) {
  return editor.convertElement.convertElementTypes.includes(element.type);
}

// src/convert-element-plugin/methods/index.ts
function createConvertElementMethods(editor) {
  return {
    convertElementTypes: [],
    addConvertElementType: curryOne(addConvertElementType, editor),
    isConvertibleElement: curryOne(isConvertElement, editor),
    convertElements: curryOne(
      convertElements,
      editor
    )
  };
}

// src/convert-element-plugin/index.tsx
var ConvertElementPlugin = createPlugin((editor) => {
  editor.convertElement = createConvertElementMethods(editor);
  return {
    name: "convert-element"
  };
});

// src/heading-plugin/insert-break.ts
import { Editor as Editor34, Path as Path9, Range as Range6, Transforms as Transforms25 } from "slate";
function insertBreak(editor) {
  const entry = findElementUp(editor, "heading");
  if (!entry)
    return false;
  if (!editor.selection)
    return false;
  if (Range6.isExpanded(editor.selection))
    return false;
  if (!Editor34.isEnd(editor, editor.selection.anchor, entry[1]))
    return false;
  const nextPath = Path9.next(entry[1]);
  Transforms25.insertNodes(
    editor,
    { type: "paragraph", children: [{ text: "" }] },
    { at: nextPath }
  );
  Transforms25.select(editor, {
    anchor: Editor34.start(editor, nextPath),
    focus: Editor34.start(editor, nextPath)
  });
  return true;
}

// src/heading-plugin/methods/index.ts
import { Editor as Editor35 } from "slate";
function convertHeading(editor, level, allowToggle) {
  editor.convertElement.convertElements(
    (element) => element.type === "heading" && element.level == level,
    { type: "heading", level },
    allowToggle
  );
}
function isHeadingActive(editor, level) {
  const [match] = Editor35.nodes(editor, {
    match: (n) => {
      return "type" in n && "level" in n && n.type === "heading" && n.level === level;
    }
  });
  return !!match;
}
function createHeadingMethods(editor) {
  return {
    convertHeading: curryOne(convertHeading, editor),
    isHeadingActive: curryOne(isHeadingActive, editor)
  };
}

// src/heading-plugin/styles.ts
import { css } from "@emotion/react";
import styled25 from "@emotion/styled";
var headingStyles = css`
  margin-top: 1em;
  &:first-child {
    margin-top: 0;
  }
  font-weight: bold;
`;
var $H1 = styled25("h1")`
  ${headingStyles}
  font-size: 2.25em;
  letter-spacing: -0.01em;
`;
var $H2 = styled25("h2")`
  ${headingStyles}
  font-size: 1.5em;
`;
var $H3 = styled25("h3")`
  ${headingStyles}
  font-size: 1.25em;
`;
var $H4 = styled25("h4")`
  ${headingStyles}
  font-size: 1em;
`;
var $H5 = styled25("h5")`
  ${headingStyles}
  font-size: 1em;
`;
var $H6 = styled25("h6")`
  ${headingStyles}
  font-size: 1em;
`;

// src/heading-plugin/index.tsx
import { jsx as jsx36 } from "react/jsx-runtime";
var HeadingPlugin = createPlugin(
  (editor) => {
    editor.convertElement.addConvertElementType("heading");
    editor.heading = createHeadingMethods(editor);
    const hotkeyHandler = createHotkeyHandler({
      "super+1": curryTwo(editor.heading.convertHeading, 1, true),
      "super+2": curryTwo(editor.heading.convertHeading, 2, true),
      "super+3": curryTwo(editor.heading.convertHeading, 3, true),
      "super+4": curryTwo(editor.heading.convertHeading, 4, true),
      "super+5": curryTwo(editor.heading.convertHeading, 5, true),
      "super+6": curryTwo(editor.heading.convertHeading, 6, true)
    });
    const autocompleteHandler = createAutocompleteSpaceHandler(editor, {
      "#": curryTwo(editor.heading.convertHeading, 1, false),
      "##": curryTwo(editor.heading.convertHeading, 2, false),
      "###": curryTwo(editor.heading.convertHeading, 3, false),
      "####": curryTwo(editor.heading.convertHeading, 4, false),
      "#####": curryTwo(editor.heading.convertHeading, 5, false),
      "######": curryTwo(editor.heading.convertHeading, 6, false)
    });
    return {
      name: "heading",
      editor: {
        insertBreak: curryOne(insertBreak, editor)
      },
      editableProps: {
        renderElement: ({ element, attributes, children }) => {
          if (element.type === "heading") {
            switch (element.level) {
              case 1:
                return /* @__PURE__ */ jsx36($H1, { ...attributes, children });
              case 2:
                return /* @__PURE__ */ jsx36($H2, { ...attributes, children });
              case 3:
                return /* @__PURE__ */ jsx36($H3, { ...attributes, children });
              case 4:
                return /* @__PURE__ */ jsx36($H4, { ...attributes, children });
              case 5:
                return /* @__PURE__ */ jsx36($H5, { ...attributes, children });
              case 6:
                return /* @__PURE__ */ jsx36($H6, { ...attributes, children });
              default:
                throw new Error(
                  `Expected element.level to be 1-6 but got ${element.level}`
                );
            }
          }
        },
        onKeyDown: (e) => {
          if (hotkeyHandler(e))
            return true;
          if (autocompleteHandler(e))
            return true;
          return false;
        }
      }
    };
  }
);

// src/horizontal-rule-plugin/horizontal-rule.tsx
import { useSelected as useSelected6 } from "slate-react";

// src/horizontal-rule-plugin/styles.tsx
import styled26 from "@emotion/styled";
var $HorizontalRule = styled26("hr")`
  position: relative;
  height: 1em;
  /* background-color: var(--hr-color); */
  margin: 1em 0;
  &::before {
    position: absolute;
    content: "";
    left: 0.125em;
    right: 0.125em;
    top: 50%;
    height: 1px;
    background-color: var(--hr-color);
    border-radius: 1px;
  }
  border-radius: 0.25em;
  cursor: pointer;
  border: none;
  &:hover {
    background-color: rgba(0, 127, 255, 0.1);
    /* &::before {
      outline: 2px solid var(--hover-color);
    } */
  }
  &.--selected {
    background: none;
    &::before {
      outline: 2px solid var(--select-color, blue);
    }
  }
`;

// src/horizontal-rule-plugin/horizontal-rule.tsx
import { jsx as jsx37, jsxs as jsxs17 } from "react/jsx-runtime";
function HorizontalRule({
  attributes,
  children
}) {
  const selected = useSelected6();
  return /* @__PURE__ */ jsxs17("div", { ...attributes, draggable: true, children: [
    children,
    /* @__PURE__ */ jsx37("div", { contentEditable: false, children: /* @__PURE__ */ jsx37($HorizontalRule, { className: selected ? "--selected" : "" }) })
  ] });
}

// src/horizontal-rule-plugin/methods/index.ts
function insertHorizontalRule(editor) {
  return insertRootElement(editor, {
    type: "horizontal-rule",
    children: [{ text: "" }]
  });
}
function createHorizontalRuleMethods(editor) {
  return {
    insertHorizontalRule: curryOne(insertHorizontalRule, editor)
  };
}

// src/horizontal-rule-plugin/index.tsx
import { jsx as jsx38 } from "react/jsx-runtime";
var HorizontalRulePlugin = createPlugin(
  (editor, _options, { createPolicy }) => {
    editor.horizontalRule = createHorizontalRuleMethods(editor);
    return createPolicy({
      name: "horizontal-rule",
      editor: {
        isVoid(element) {
          if (element.type === "horizontal-rule")
            return true;
        }
      },
      editableProps: {
        renderElement: (props) => {
          if (props.element.type === "horizontal-rule") {
            return /* @__PURE__ */ jsx38(HorizontalRule, { ...props });
          }
        },
        onKeyDown: createHotkeyHandler({
          "super+-": editor.horizontalRule.insertHorizontalRule
        })
      }
    });
  }
);

// src/inline-code-plugin/styles.ts
import styled27 from "@emotion/styled";
var $InlineCode = styled27("code")`
  color: var(--shade-600);
  background-color: var(--inline-code-bgcolor);
  border: 1px solid var(--inline-code-border-color);
  border-radius: 0.25em;
  padding: 0.1375em 0.125em;
  /**
   * Font Stack from
   * https://qwtel.com/posts/software/the-monospaced-system-ui-css-font-stack/
   */
  font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono",
    "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro",
    "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
  /**
   * This font size may seem smaller but any larger (including 0.875) means that
   * it messes up the line height of the normal text. Not sure why this happens
   * with the monospace font but seems to happen on both the default 'monospace'
   * font as well as the font stack above.
   */
  font-size: 0.75em;
  vertical-align: baseline;
`;
var $InvisibleSpan = styled27("span")`
  display: inline-block;
  opacity: 0;
  width: 1px;
  overflow: hidden;
`;

// src/inline-code-plugin/index.tsx
import { jsx as jsx39, jsxs as jsxs18 } from "react/jsx-runtime";
var InlineCodePlugin = createPlugin(
  (editor) => {
    if (!editor.marksPlugin)
      throw new Error(
        "InlineCodePlugin has a dependency on the MarksPlugin but the MarksPlugin has not been added or is added after the InlineCodePlugin"
      );
    editor.inlineCode = {
      toggleInlineCode: () => editor.marksPlugin.toggleMark("code")
    };
    return {
      name: "inline-code",
      editableProps: {
        renderLeaf: ({ leaf, children }) => {
          if (leaf.code) {
            return (
              /**
               * Disable spellCheck because it's computer code usually.
               */
              /* @__PURE__ */ jsxs18($InlineCode, { spellCheck: false, children: [
                /* @__PURE__ */ jsx39($InvisibleSpan, { contentEditable: false, children: "|" }),
                children,
                /* @__PURE__ */ jsx39($InvisibleSpan, { contentEditable: false, children: "|" })
              ] })
            );
          } else {
            return children;
          }
        },
        onKeyDown: createHotkeyHandler({
          "mod+j": () => editor.inlineCode.toggleInlineCode()
        })
      }
    };
  }
);

// src/list-plugin/index.tsx
import { Editor as Editor40, Path as Path10 } from "slate";

// src/list-plugin/methods/convert-list-item.ts
function convertOrderedList(editor, allowToggle) {
  return editor.convertElement.convertElements(
    (element) => element.type === "ordered-list-item",
    (element) => {
      return {
        type: "ordered-list-item",
        depth: "depth" in element ? element.depth : 0
      };
    },
    allowToggle
  );
}
function convertTaskList(editor, allowToggle) {
  return editor.convertElement.convertElements(
    (element) => element.type === "task-list-item",
    (element) => {
      return {
        type: "task-list-item",
        checked: "checked" in element ? element.checked : false,
        depth: "depth" in element ? element.depth : 0
      };
    },
    allowToggle
  );
}
function convertUnorderedList(editor, allowToggle) {
  return editor.convertElement.convertElements(
    (element) => element.type === "unordered-list-item",
    (element) => {
      return {
        type: "unordered-list-item",
        depth: "depth" in element ? element.depth : 0
      };
    },
    allowToggle
  );
}

// src/list-plugin/methods/depth.ts
var MAX_DEPTH2 = 2;
function getListDepth(editor) {
  const listItem = findElementUp(editor, isListItem);
  if (!listItem)
    return 0;
  return listItem[0].depth;
}
function canIncreaseDepth(editor) {
  if (!isStartOfElement(editor, isListItem))
    return false;
  const depth = getListDepth(editor);
  return depth < MAX_DEPTH2;
}
function canDecreaseDepth(editor) {
  if (!isStartOfElement(editor, isListItem))
    return false;
  const depth = getListDepth(editor);
  return depth > 0;
}
function increaseDepth(editor) {
  if (!canIncreaseDepth(editor))
    return;
  editor.list.indent();
}
function decreaseDepth(editor) {
  if (!canDecreaseDepth(editor))
    return;
  editor.list.outdent();
}

// src/list-plugin/methods/indent.ts
function indent(editor) {
  return setNodesDynamic(
    editor,
    (node) => ({ depth: node.depth + 1 }),
    {
      match: isListItem
    }
  );
}

// src/list-plugin/methods/insert-break.ts
import { Editor as Editor36, Transforms as Transforms26 } from "slate";
function insertBreak2(editor) {
  const entry = findElementUp(editor, isListItem);
  if (!entry)
    return false;
  const [element, path] = entry;
  if (Editor36.isEmpty(editor, element)) {
    if (element.depth > 0) {
      Transforms26.setNodes(editor, { depth: element.depth - 1 }, { at: path });
      return true;
    } else {
      rewrapElement(editor, { type: "paragraph" }, path);
      return true;
    }
  }
  Transforms26.splitNodes(editor, { always: true });
  const nextEntry = findElementUp(editor, isListItem);
  if (!nextEntry)
    return true;
  if (nextEntry[0].type === "task-list-item" && nextEntry[0].checked === true) {
    Transforms26.setNodes(editor, { checked: false }, { at: nextEntry[1] });
  }
  return true;
}

// src/list-plugin/methods/outdent.ts
import { Editor as Editor37 } from "slate";
function outdent(editor) {
  const entries = Array.from(
    Editor37.nodes(editor, {
      match: isListItem
    })
  );
  for (const entry of entries) {
    if (entry[0].depth === 0)
      return true;
  }
  return setNodesDynamic(
    editor,
    (node) => ({ depth: Math.max(0, node.depth - 1) }),
    {
      match: isListItem
    }
  );
}

// src/list-plugin/methods/toggleTaskListItem.ts
import { Transforms as Transforms27 } from "slate";
function toggleTaskListItem(editor, { at = editor.selection } = {}) {
  const taskListItem = findElementUp(
    editor,
    "task-list-item",
    { at }
  );
  if (!taskListItem)
    return false;
  const nextChecked = !taskListItem[0].checked;
  Transforms27.setNodes(
    editor,
    { checked: nextChecked },
    { at: taskListItem[1] }
  );
}

// src/list-plugin/methods/index.ts
function createListMethods(editor) {
  return {
    indent: curryOne(indent, editor),
    outdent: curryOne(outdent, editor),
    convertUnorderedList: curryOne(convertUnorderedList, editor),
    convertOrderedList: curryOne(convertOrderedList, editor),
    convertTaskList: curryOne(convertTaskList, editor),
    insertBreak: curryOne(insertBreak2, editor),
    toggleTaskListItem: curryOne(toggleTaskListItem, editor),
    getListDepth: curryOne(getListDepth, editor),
    canIncreaseDepth: curryOne(canIncreaseDepth, editor),
    canDecreaseDepth: curryOne(canDecreaseDepth, editor),
    increaseDepth: curryOne(increaseDepth, editor),
    decreaseDepth: curryOne(decreaseDepth, editor)
  };
}

// src/list-plugin/normalize-node/normalize-ordered-first-at-depth.ts
import { Element as Element21, Transforms as Transforms28 } from "slate";
var isOrderedListItem = createIsElementType([
  "ordered-list-item"
]);
function normalizeOrderedFirstAtDepth(editor, entry) {
  const [node, path] = entry;
  if (!Element21.isElement(node))
    return false;
  return normalizeSiblings(editor, [node, path], (a, b) => {
    if (!isOrderedListItem(b[0]))
      return false;
    const __firstAtDepth = isOrderedListItem(a[0]) ? b[0].depth > a[0].depth : isListItem(a[0]) ? b[0].depth > a[0].depth : true;
    if (b[0].__firstAtDepth !== __firstAtDepth) {
      Transforms28.setNodes(editor, { __firstAtDepth }, { at: b[1] });
      return true;
    }
    return false;
  });
}

// src/list-plugin/normalize-node/index.ts
function normalizeNode5(editor, entry) {
  const [node] = entry;
  if (!isListItem(node))
    return false;
  return normalizeOrderedFirstAtDepth(editor, entry);
}

// src/list-plugin/render-element/ordered-list-item.tsx
import { clsx as clsx6 } from "clsx";
import { useEffect as useEffect5 } from "react";
import { ReactEditor as ReactEditor10, useSlateStatic as useSlateStatic11 } from "slate-react";

// src/list-plugin/render-element/styles.ts
import styled28 from "@emotion/styled";
var $ListItem = styled28("li")`
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  list-style-position: outside;
  margin-left: calc(2em + var(--list-item-depth) * 2em);
`;
var $UnorderedListItem = styled28($ListItem)`
  position: relative;
  list-style-type: none;
  .--list-item-icon {
    position: absolute;
    top: 0.25em;
    left: -1.375em;
    line-height: 1.5em;
    color: var(--shade-600);
  }
`;
var $OrderedListItem = styled28($ListItem)`
  position: relative;
  list-style-type: none;
  counter-increment: var(--list-item-var);

  &.--first-at-depth {
    counter-reset: var(--list-item-var);
    /**
     * if isDebug is true, then show a highlight on list items that are marked
     * as the first at a given depth.
     */
    background: ${isDebug ? "rgba(0, 255, 0, 0.2)" : "inherit"};
  }

  &:before {
    position: absolute;
    content: counter(var(--list-item-var)) ".";
    top: 0;
    left: -2em;
    width: 1.5em;
    text-align: right;
    color: var(--shade-500);
    /* force numbers to be monospaced for better alignment */
    font-variant-numeric: tabular-nums;
  }
`;
var $TaskListItem = styled28($ListItem)`
  position: relative;
  list-style-type: none;
  .--list-item-icon {
    position: absolute;
    top: 0.25em;
    left: -1.5em;
    line-height: 1.5em;
    color: var(--shade-300);
    .--checkmark {
      color: green;
      stroke-width: 3px;
    }
  }
`;

// src/list-plugin/render-element/ordered-list-item.tsx
import { jsx as jsx40 } from "react/jsx-runtime";
function OrderedListItem({
  element,
  attributes,
  children
}) {
  const editor = useSlateStatic11();
  useEffect5(() => {
    const path = ReactEditor10.findPath(editor, element);
    normalizeOrderedFirstAtDepth(editor, [element, path]);
  }, []);
  const style = {
    "--list-item-depth": element.depth,
    "--list-item-var": `list-item-depth-${element.depth}`
  };
  const className = clsx6({ "--first-at-depth": element.__firstAtDepth });
  return /* @__PURE__ */ jsx40($OrderedListItem, { ...attributes, className, style, children });
}

// src/list-plugin/render-element/task-list-item.tsx
import { useCallback as useCallback10 } from "react";
import { useSlateStatic as useSlateStatic12 } from "slate-react";

// src/list-plugin/render-element/list-icons.tsx
import { jsx as jsx41, jsxs as jsxs19 } from "react/jsx-runtime";
var UncheckedIcon = (props) => /* @__PURE__ */ jsxs19(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    strokeWidth: 2,
    stroke: "currentColor",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
    ...props,
    children: [
      /* @__PURE__ */ jsx41("path", { d: "M0 0h24v24H0z", stroke: "none" }),
      /* @__PURE__ */ jsx41("rect", { x: 4, y: 4, width: 16, height: 16, rx: 2 })
    ]
  }
);
var CheckedIcon = (props) => /* @__PURE__ */ jsxs19(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    className: "icon icon-tabler icon-tabler-checkbox",
    width: "1em",
    height: "1em",
    strokeWidth: 2,
    stroke: "currentColor",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24",
    ...props,
    children: [
      /* @__PURE__ */ jsx41("path", { d: "M0 0h24v24H0z", stroke: "none" }),
      /* @__PURE__ */ jsx41("path", { d: "m9 11 3 3 8-8", className: "--checkmark" }),
      /* @__PURE__ */ jsx41("path", { d: "M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" })
    ]
  }
);
var BulletIcon = (props) => /* @__PURE__ */ jsx41(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    width: "1em",
    height: "1em",
    ...props,
    children: /* @__PURE__ */ jsx41("path", { d: "M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5z" })
  }
);

// src/list-plugin/render-element/task-list-item.tsx
import { jsx as jsx42, jsxs as jsxs20 } from "react/jsx-runtime";
function TaskListItem({
  element,
  attributes,
  children
}) {
  const editor = useSlateStatic12();
  const toggle = useCallback10(() => {
    editor.list.toggleTaskListItem({ at: element });
  }, [editor, element]);
  const style = { "--list-item-depth": element.depth };
  return /* @__PURE__ */ jsxs20($TaskListItem, { ...attributes, style, children: [
    /* @__PURE__ */ jsx42("div", { className: "--list-item-icon", contentEditable: false, children: element.checked ? /* @__PURE__ */ jsx42(CheckedIcon, { onClick: toggle, style: { cursor: "pointer" } }) : /* @__PURE__ */ jsx42(UncheckedIcon, { onClick: toggle, style: { cursor: "pointer" } }) }),
    children
  ] });
}

// src/list-plugin/render-element/unordered-list-item.tsx
import { jsx as jsx43, jsxs as jsxs21 } from "react/jsx-runtime";
function UnorderedListItem({
  element,
  attributes,
  children
}) {
  const style = { "--list-item-depth": element.depth };
  return /* @__PURE__ */ jsxs21($UnorderedListItem, { ...attributes, style, children: [
    /* @__PURE__ */ jsx43("div", { className: "--list-item-icon", contentEditable: false, children: /* @__PURE__ */ jsx43(BulletIcon, {}) }),
    children
  ] });
}

// src/list-plugin/render-element/index.tsx
import { jsx as jsx44 } from "react/jsx-runtime";
function renderElement3({
  element,
  attributes,
  children
}) {
  switch (element.type) {
    case "ordered-list-item":
      return /* @__PURE__ */ jsx44(OrderedListItem, { element, attributes, children });
    case "unordered-list-item":
      return /* @__PURE__ */ jsx44(UnorderedListItem, { element, attributes, children });
    case "task-list-item":
      return /* @__PURE__ */ jsx44(TaskListItem, { element, attributes, children });
  }
}

// src/list-plugin/index.tsx
var LIST_ITEM_TYPES = [
  "unordered-list-item",
  "ordered-list-item",
  "task-list-item"
];
var isListItem = createIsElementType(LIST_ITEM_TYPES);
var ListPlugin = createPlugin(
  (editor, _options, { createPolicy }) => {
    editor.convertElement.addConvertElementType(LIST_ITEM_TYPES);
    const list = editor.list = createListMethods(editor);
    const hotkeyHandler = createHotkeyHandler({
      tab: list.indent,
      "shift+tab": list.outdent,
      "super+7": curryOne(list.convertOrderedList, true),
      "super+8": curryOne(list.convertUnorderedList, true),
      "super+9": curryOne(list.convertTaskList, true)
    });
    return createPolicy({
      name: "list",
      editor: {
        normalizeNode: (entry) => normalizeNode5(editor, entry),
        insertBreak: list.insertBreak,
        deleteBackward: (unit) => {
          if (unit !== "character")
            return false;
          if (!isStartOfElement(editor, isListItem))
            return false;
          const listItem = findElementUp(editor, isListItem);
          if (!listItem)
            return false;
          const listItemPath = listItem[1];
          if (!Path10.hasPrevious(listItemPath)) {
            editor.collapsibleParagraph.convertParagraph();
            return true;
          }
          const prevElementPath = Path10.previous(listItemPath);
          const prevElementEntry = Editor40.node(editor, prevElementPath);
          if (isListItem(prevElementEntry[0]))
            return false;
          editor.collapsibleParagraph.convertParagraph();
          return true;
        }
      },
      editableProps: {
        renderElement: renderElement3,
        onKeyDown(e) {
          if (!Editor40.nodes(editor, { match: isListItem }))
            return false;
          return hotkeyHandler(e);
        }
      }
    });
  }
);

// src/marks-plugin/index.tsx
import { clsx as clsx7 } from "clsx";
import { Editor as Editor43, Point as Point3, Range as Range8 } from "slate";

// src/marks-plugin/methods/removeMarks.ts
import { Editor as Editor41, Text as Text4, Transforms as Transforms29 } from "slate";
function removeMarks(editor, { at = editor.selection } = {}) {
  if (at == null)
    return;
  const nodeEntries = [
    ...Editor41.nodes(editor, {
      match: (n) => Text4.isText(n),
      at
    })
  ];
  const setter = {};
  for (const [node] of nodeEntries) {
    for (const key2 of Object.keys(node)) {
      if (key2 === "text")
        continue;
      setter[key2] = null;
    }
  }
  Transforms29.setNodes(editor, setter, {
    match: (n) => Text4.isText(n),
    split: true,
    at
  });
}

// src/marks-plugin/methods/toggle-mark.ts
import { Editor as Editor42, Point as Point2, Range as Range7 } from "slate";
function toggleMark(editor, markKey, unsetKey, { at = editor.selection } = {}) {
  if (at == null)
    return;
  const point = Range7.isRange(at) ? at.focus : at;
  const isAtLineEnd = Point2.isPoint(point) && (Editor42.after(editor, point) === null || Editor42.isEnd(editor, point, Editor42.end(editor, [])));
  const validMarkKey = markKey;
  const marks = Editor42.marks(editor) || {};
  const isActive = marks[validMarkKey] === true;
  if (isAtLineEnd) {
    if (!isActive) {
      editor.activeMarks = {
        ...editor.activeMarks,
        [validMarkKey]: true
      };
    } else {
      const { [validMarkKey]: _, ...remainingMarks } = editor.activeMarks || {};
      editor.activeMarks = remainingMarks;
    }
  }
  if (isActive) {
    Editor42.removeMark(editor, validMarkKey);
  } else {
    Editor42.addMark(editor, validMarkKey, true);
  }
  if (typeof unsetKey === "string") {
    Editor42.removeMark(editor, unsetKey);
  }
}

// src/marks-plugin/methods/index.ts
function createMarksMethods(editor) {
  return {
    removeMarks: curryOne(removeMarks, editor),
    toggleMark: curryOne(toggleMark, editor),
    toggleBold: () => toggleMark(editor, "bold"),
    toggleItalic: () => toggleMark(editor, "italic"),
    toggleUnderline: () => toggleMark(editor, "underline"),
    toggleStrike: () => toggleMark(editor, "strike")
  };
}

// src/marks-plugin/styles.tsx
import styled29 from "@emotion/styled";
var $MarksSpan = styled29("span")`
  &.--bold {
    font-weight: bold;
  }
  &.--italic {
    font-style: italic;
  }
  &.--underline {
    text-decoration: underline;
  }
  &.--strike {
    text-decoration: line-through;
  }
  /**
   * Text decorations don't merge automatically so we make a special one
   * when there is both an underline and a strike through.
   */
  &.--underline.--strike {
    text-decoration: underline line-through;
  }
`;

// src/marks-plugin/index.tsx
import { jsx as jsx45 } from "react/jsx-runtime";
var MarksPlugin = createPlugin((editor) => {
  editor.marksPlugin = createMarksMethods(editor);
  editor.activeMarks = {};
  const hotkeyHandler = createHotkeyHandler({
    "mod+b": editor.marksPlugin.toggleBold,
    "mod+i": editor.marksPlugin.toggleItalic,
    "mod+u": editor.marksPlugin.toggleUnderline,
    "super+0": editor.marksPlugin.removeMarks,
    "super+k": editor.marksPlugin.toggleStrike
  });
  const { insertText: defaultInsertText } = editor;
  editor.insertText = (text) => {
    if (editor.activeMarks && Object.keys(editor.activeMarks).length > 0) {
      const { activeMarks } = editor;
      Object.entries(activeMarks).forEach(([mark, isActive]) => {
        if (isActive) {
          editor.addMark(mark, true);
        }
      });
    }
    defaultInsertText(text);
  };
  const { removeMarks: removeMarks2 } = editor.marksPlugin;
  editor.marksPlugin.removeMarks = () => {
    removeMarks2();
    if (editor.selection) {
      const point = Range8.isRange(editor.selection) ? editor.selection.focus : editor.selection;
      if (Point3.isPoint(point)) {
        const isAtLineEnd = Editor43.after(editor, point) === null || Editor43.isEnd(editor, point, Editor43.end(editor, []));
        if (isAtLineEnd) {
          editor.activeMarks = {};
        }
      }
    }
  };
  return {
    name: "marks",
    editableProps: {
      renderLeaf: ({ leaf, children }) => {
        return /* @__PURE__ */ jsx45(
          $MarksSpan,
          {
            className: clsx7({
              "--bold": leaf.bold,
              "--italic": leaf.italic,
              "--underline": leaf.underline,
              "--strike": leaf.strike
            }),
            children
          }
        );
      },
      onKeyDown: (e) => {
        if (hotkeyHandler(e))
          return true;
        return false;
      }
    }
  };
});

// src/normalize-after-delete-plugin/index.tsx
import { Editor as Editor44, Point as Point4 } from "slate";
function forceNormalizeNearestElement(editor) {
  if (!editor.selection)
    return;
  const entry = Editor44.parent(editor, editor.selection);
  forceNormalizePath(editor, entry[1]);
}
var NormalizeAfterDeletePlugin = createPlugin((editor) => {
  editor.normalizeAfterDelete = true;
  return {
    name: "normalize-after-delete",
    editor: {
      deleteBackward() {
        if (!editor.selection)
          return false;
        const entry = Editor44.parent(editor, editor.selection);
        const isStart = Point4.equals(
          Editor44.start(editor, entry[1]),
          editor.selection.anchor
        );
        if (!isStart)
          return false;
        return function() {
          forceNormalizeNearestElement(editor);
        };
      },
      deleteForward() {
        if (!editor.selection)
          return false;
        const entry = Editor44.parent(editor, editor.selection);
        const isEnd = Point4.equals(
          Editor44.end(editor, entry[1]),
          editor.selection.anchor
        );
        if (!isEnd)
          return false;
        return function() {
          forceNormalizeNearestElement(editor);
        };
      }
    },
    editableProps: {}
  };
});

// src/table-plugin/index.tsx
import { Element as Element23 } from "slate";

// src/table-plugin/delete-fragment/index.ts
import { Editor as Editor46, Path as Path12, Transforms as Transforms31 } from "slate";

// src/table-plugin/delete-fragment/get-reversed-delete-safe-ranges.ts
import { Editor as Editor45, Path as Path11 } from "slate";
function getReversedDeleteSafeRanges(editor, deleteRange, protectedTypes) {
  const positions = [...Editor45.positions(editor, { at: deleteRange })];
  const deleteSafeRanges = [];
  let startPos, prevPos, startTdPath;
  startPos = prevPos = positions[0];
  startTdPath = findElementUpPath(editor, protectedTypes, {
    at: startPos
  });
  for (const pos of positions) {
    const tdPath = findElementUpPath(editor, protectedTypes, {
      at: pos
    });
    if (startTdPath && tdPath && Path11.equals(startTdPath, tdPath) || startTdPath == void 0 && tdPath == void 0) {
      prevPos = pos;
    } else {
      const range2 = { anchor: startPos, focus: prevPos };
      deleteSafeRanges.push(range2);
      startPos = prevPos = pos;
      startTdPath = tdPath;
    }
  }
  const range = { anchor: startPos, focus: prevPos };
  deleteSafeRanges.push(range);
  deleteSafeRanges.reverse();
  return deleteSafeRanges;
}

// src/table-plugin/delete-fragment/index.ts
function deleteFragmentWithProtectedTypes(editor, protectedTypes) {
  if (editor.selection == null)
    return false;
  const [start, end] = Editor46.edges(editor, editor.selection);
  const startProtectedPath = findElementUpPath(editor, protectedTypes, {
    at: start
  });
  const endProtectedPath = findElementUpPath(editor, protectedTypes, {
    at: end
  });
  if (!startProtectedPath && !endProtectedPath) {
    return false;
  }
  if (startProtectedPath && endProtectedPath && Path12.equals(startProtectedPath, endProtectedPath)) {
    return false;
  }
  const reversedRanges = getReversedDeleteSafeRanges(
    editor,
    editor.selection,
    protectedTypes
  );
  Editor46.withoutNormalizing(editor, () => {
    for (const range of reversedRanges) {
      Transforms31.delete(editor, { at: range });
    }
    Transforms31.collapse(editor, { edge: "start" });
  });
  return true;
}

// src/table-plugin/methods/index.ts
import { Transforms as Transforms39 } from "slate";

// src/table-plugin/methods/get-table-info.ts
function getTableInfo(editor, { at = editor.selection } = {}) {
  if (at == null)
    return void 0;
  const cellMatch = findElementUp(editor, "table-cell", {
    at
  });
  if (!cellMatch)
    return void 0;
  const rowMatch = findElementUp(editor, "table-row", {
    at
  });
  if (!rowMatch)
    return void 0;
  const tableMatch = findElementUp(editor, "table", { at });
  if (!tableMatch)
    return void 0;
  const [tableElement, tablePath] = tableMatch;
  const [rowElement, rowPath] = rowMatch;
  const [cellElement, cellPath] = cellMatch;
  return {
    tableElement,
    tablePath,
    tableColumns: tableElement.columns,
    rowElement,
    rowPath,
    rowIndex: rowPath.slice(-1)[0],
    rowCount: tableElement.children.length,
    cellElement,
    cellPath,
    cellIndex: cellPath.slice(-1)[0],
    cellCount: rowElement.children.length
  };
}

// src/table-plugin/methods/insert-column.ts
import { Editor as Editor47, Transforms as Transforms32 } from "slate";

// src/table-plugin/methods/utils.ts
function createCell(index, children = [
  {
    type: "table-content",
    children: [{ text: "" }]
  }
]) {
  return {
    type: "table-cell",
    children
  };
}

// src/table-plugin/methods/insert-column.ts
function insertColumn(editor, { offset = 0, at = editor.selection } = {}) {
  const t2 = getTableInfo(editor, { at });
  if (t2 === void 0)
    return false;
  const { tableElement, tablePath, cellIndex } = t2;
  const nextCellIndex = cellIndex + offset;
  Editor47.withoutNormalizing(editor, () => {
    const { columns } = tableElement;
    const nextColumns = [...columns];
    nextColumns.splice(nextCellIndex, 0, columns[nextCellIndex]);
    Transforms32.setNodes(editor, { columns: nextColumns }, { at: tablePath });
    tableElement.children.forEach((rowElement, i) => {
      Transforms32.insertNodes(editor, createCell(nextCellIndex), {
        at: [...tablePath, i, nextCellIndex]
      });
    });
  });
  return true;
}

// src/table-plugin/methods/insert-row.ts
import { Transforms as Transforms33 } from "slate";
function createRow(columnCount) {
  return {
    type: "table-row",
    children: [...Array(columnCount).keys()].map((index) => createCell(index))
  };
}
function insertRow(editor, { at = editor.selection, offset = 0 } = {}) {
  const t2 = getTableInfo(editor, { at });
  if (!t2)
    return false;
  const nextRowElement = createRow(t2.tableElement.columns.length);
  Transforms33.insertNodes(editor, nextRowElement, {
    at: [...t2.tablePath, t2.rowIndex + offset]
  });
  return true;
}
function insertRowBelow(editor, { at } = {}) {
  return insertRow(editor, { at, offset: 1 });
}

// src/table-plugin/methods/insert-table.ts
import { Editor as Editor49, Element as Element22, Path as Path13, Transforms as Transforms34 } from "slate";
function createRange(size) {
  return [...Array(size).keys()];
}
function createColumns(columnCount) {
  return createRange(columnCount).map(() => ({ align: "left" }));
}
function createTable(columnCount, rowCount) {
  return {
    type: "table",
    columns: createColumns(columnCount),
    children: createRange(rowCount).map(() => createRow2(columnCount))
  };
}
function createRow2(columnCount) {
  return {
    type: "table-row",
    children: [...Array(columnCount).keys()].map((index) => createCell(index))
  };
}
function insertTable(editor, columnCount, rowCount, { at = editor.selection } = {}) {
  const table = createTable(columnCount, rowCount);
  return insertRootElement2(editor, table, { at });
}
function insertRootElement2(editor, element, { at = editor.selection } = {}) {
  if (at == null)
    return false;
  const entry = findElementUp(
    editor,
    (node) => Element22.isElement(node) && editor.isMaster(node)
  );
  if (entry == null) {
    const selection = editor.selection;
    Editor49.withoutNormalizing(editor, () => {
      Transforms34.insertNodes(editor, element, { at });
      if (selection) {
        Transforms34.select(editor, selection);
        Transforms34.move(editor);
      }
    });
  } else {
    const nextPath = Path13.next(entry[1]);
    Editor49.withoutNormalizing(editor, () => {
      Transforms34.insertNodes(editor, element, { at: nextPath });
      Transforms34.select(editor, Editor49.start(editor, nextPath));
    });
  }
  return true;
}

// src/table-plugin/methods/navigation/select-element.ts
import { Path as Path14 } from "slate";
function selectElementBelow(editor, t2) {
  const { cellIndex, rowIndex, rowCount, tablePath } = t2;
  if (rowIndex < rowCount - 1) {
    selectStartOfElement(editor, [...tablePath, rowIndex + 1, cellIndex]);
    return true;
  }
  try {
    selectStartOfElement(editor, Path14.next(tablePath));
    return true;
  } catch (e) {
    return false;
  }
}
function selectElementAbove(editor, t2) {
  const { cellIndex, rowIndex, tablePath } = t2;
  if (rowIndex > 0) {
    selectStartOfElement(editor, [...tablePath, rowIndex - 1, cellIndex]);
    return true;
  }
  try {
    selectEndOfElement(editor, Path14.previous(tablePath));
    return true;
  } catch (e) {
    return false;
  }
}

// src/table-plugin/methods/navigation/utils.ts
import { ReactEditor as ReactEditor11 } from "slate-react";
function getUnreliableSelectionRect() {
  const s = window.getSelection();
  if (!s)
    return null;
  const range = s.getRangeAt(0);
  return range.getBoundingClientRect();
}
function getElementRect(editor, element) {
  return ReactEditor11.toDOMNode(editor, element).getBoundingClientRect();
}
function checkIsInElement(editor, element) {
  const selectionRect = getUnreliableSelectionRect();
  if (!selectionRect)
    return false;
  const elementRect = getElementRect(editor, element);
  return selectionRect.right < elementRect.right && selectionRect.left > elementRect.left && selectionRect.bottom < elementRect.bottom && selectionRect.top > elementRect.top;
}

// src/table-plugin/methods/navigation/index.ts
function down(editor) {
  const t2 = getTableInfo(editor);
  if (!t2)
    return false;
  setTimeout(() => {
    if (!checkIsInElement(editor, t2.cellElement)) {
      selectElementBelow(editor, t2);
    }
  });
  return false;
}
function up(editor) {
  const t2 = getTableInfo(editor);
  if (!t2)
    return false;
  setTimeout(() => {
    if (!checkIsInElement(editor, t2.cellElement)) {
      selectElementAbove(editor, t2);
    }
  });
  return false;
}

// src/table-plugin/methods/remove-column.ts
import { Editor as Editor52, Transforms as Transforms36 } from "slate";

// src/table-plugin/methods/remove-table.ts
import { Transforms as Transforms35 } from "slate";
function removeTable(editor) {
  const t2 = editor.tablePlugin.getTableInfo();
  if (t2 === void 0)
    return false;
  Transforms35.removeNodes(editor, { at: t2.tablePath });
  return true;
}

// src/table-plugin/methods/remove-column.ts
function removeColumn(editor, { at = editor.selection } = {}) {
  const t2 = getTableInfo(editor, { at });
  if (!t2)
    return false;
  const { tableElement, tablePath, rowIndex, cellIndex, cellCount } = t2;
  if (cellCount === 1) {
    return removeTable(editor);
  }
  Editor52.withoutNormalizing(editor, () => {
    const columns = [...tableElement.columns];
    columns.splice(cellIndex, 1);
    Transforms36.setNodes(editor, { columns }, { at: tablePath });
    tableElement.children.forEach((rowElement, rowIndex2) => {
      Transforms36.removeNodes(editor, {
        at: [...tablePath, rowIndex2, cellIndex]
      });
    });
    const selection = Editor52.start(editor, [
      ...tablePath,
      rowIndex,
      Math.min(cellIndex, cellCount - 2)
    ]);
    Transforms36.select(editor, selection);
  });
}

// src/table-plugin/methods/remove-row.ts
import { Editor as Editor53, Transforms as Transforms37 } from "slate";
function removeRow(editor, { at = editor.selection } = {}) {
  const t2 = getTableInfo(editor, { at });
  if (t2 === void 0)
    return false;
  if (t2.rowCount === 1) {
    removeTable(editor);
    return true;
  }
  Editor53.withoutNormalizing(editor, () => {
    Transforms37.removeNodes(editor, { at: t2.rowPath });
    Transforms37.select(
      editor,
      Editor53.start(editor, [
        ...t2.tablePath,
        Math.min(t2.rowIndex, t2.rowCount - 2),
        t2.cellIndex
      ])
    );
  });
  return true;
}

// src/table-plugin/methods/setTableColumnAlign.ts
import { Transforms as Transforms38 } from "slate";
function setTableColumnAlign(editor, options) {
  const t2 = getTableInfo(editor);
  if (t2 === void 0)
    return false;
  const { tableElement, tablePath, cellIndex } = t2;
  const nextColumns = tableElement.columns.slice();
  nextColumns.splice(cellIndex, 1, { align: options.align });
  Transforms38.setNodes(editor, { columns: nextColumns }, { at: tablePath });
  return true;
}

// src/table-plugin/methods/tab.ts
function tabForward(editor) {
  const t2 = getTableInfo(editor);
  if (!t2)
    return false;
  const { cellIndex, cellCount, rowIndex, rowCount, tablePath } = t2;
  if (cellIndex < cellCount - 1) {
    selectStartOfElement(editor, [...tablePath, rowIndex, cellIndex + 1]);
    return true;
  }
  if (rowIndex < rowCount - 1) {
    selectStartOfElement(editor, [...tablePath, rowIndex + 1, 0]);
    return true;
  }
  insertRowBelow(editor);
  selectStartOfElement(editor, [...tablePath, rowIndex + 1, 0]);
  return true;
}
function tabBackward(editor) {
  const t2 = getTableInfo(editor);
  if (!t2)
    return false;
  const { cellIndex, cellCount, rowIndex, tablePath } = t2;
  if (cellIndex > 0) {
    selectStartOfElement(editor, [...tablePath, rowIndex, cellIndex - 1]);
    return true;
  }
  if (rowIndex > 0) {
    selectStartOfElement(editor, [...tablePath, rowIndex - 1, cellCount - 1]);
    return true;
  }
}

// src/table-plugin/methods/index.ts
function createTableMethods(editor) {
  return {
    getTableInfo: curryOne(getTableInfo, editor),
    insertTable: curryOne(insertTable, editor),
    insertColumn: curryOne(insertColumn, editor),
    insertRow: curryOne(insertRow, editor),
    removeTable: curryOne(removeTable, editor),
    removeColumn: curryOne(removeColumn, editor),
    removeRow: curryOne(removeRow, editor),
    tabForward: curryOne(tabForward, editor),
    tabBackward: curryOne(tabBackward, editor),
    selectCell: curryOne(selectCell, editor),
    down: curryOne(down, editor),
    up: curryOne(up, editor),
    setTableColumnAlign: curryOne(setTableColumnAlign, editor)
  };
}
function selectCell(editor, { at = editor.selection } = {}) {
  const t2 = getTableInfo(editor, { at });
  if (t2 === void 0)
    return false;
  const { cellPath } = t2;
  Transforms39.select(editor, cellPath);
  return true;
}

// src/table-plugin/normalize/normalize-table.ts
import { Transforms as Transforms40 } from "slate";
function normalizeTableIndexes(editor, entry) {
  let isTransformed = false;
  const rowElements = entry[0].children;
  rowElements.forEach((rowElement, y) => {
    const cellElements = rowElement.children;
    cellElements.forEach((cellElement, x) => {
      if (cellElement.x !== x || cellElement.y !== y) {
        Transforms40.setNodes(editor, { x, y }, { at: [...entry[1], y, x] });
        isTransformed = true;
      }
    });
  });
  return isTransformed;
}

// src/table-plugin/normalize/normalize-table-cell.ts
import { Editor as Editor57, Transforms as Transforms41 } from "slate";
function normalizeTableCell(editor, entry) {
  const [node, path] = entry;
  if (node.children.length === 1 && node.children[0].type === "table-content") {
    return false;
  }
  Editor57.withoutNormalizing(editor, () => {
    Transforms41.insertNodes(
      editor,
      {
        type: "table-content",
        children: [{ text: "X" }]
      },
      { at: [...entry[1], 0] }
    );
    for (let i = node.children.length; i >= 0; i--) {
      Transforms41.mergeNodes(editor, { at: [...path, i] });
    }
    Transforms41.delete(editor, {
      at: { path: [...path, 0, 0], offset: 0 },
      unit: "character"
    });
  });
  return true;
}

// src/table-plugin/render-element/table.tsx
import { useEffect as useEffect6 } from "react";
import { ReactEditor as ReactEditor12, useSelected as useSelected7, useSlateStatic as useSlateStatic13 } from "slate-react";

// src/table-plugin/render-element/styles/index.ts
import styled31 from "@emotion/styled";

// src/table-plugin/render-element/styles/table-menu-styles.ts
import styled30 from "@emotion/styled";
var $BaseMenu = styled30("div")`
  position: absolute;
  /**
   * very slightly shaded
   */
  background: rgba(0, 0, 0, 0.001);

  /**
   * hover 
   */
  &:hover {
    /**
     * needs to pop up so that it doesn't jump back and forth with neighbor
     * below
     */
    z-index: 1000;
    /**
     * Makes the visible tile get darker on hover over any part of the
     * menu including the invisible part
     */
    .--tile {
      background: rgba(0, 0, 0, 0.15);
    }
  }
`;
var $ColumnMenu = styled30($BaseMenu)`
  cursor: pointer;
  /**
   * hangs out on top
   */
  left: -1px;
  right: -1px;
  right: 0;
  height: 3em;
  top: -3em;
`;
var $RowMenu = styled30($BaseMenu)`
  /**
   * hangs out on left
   */
  top: -1px;
  bottom: -1px;
  width: 3em;
  left: -3em;
`;
var $MenuTile = styled30("div")`
  position: absolute;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 200ms;
  /**
   * NOTE: One of these should be overridden
   */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;
var $ColumnMenuTile = styled30($MenuTile)`
  top: 50%;
  border-bottom: none;
  border-right: none;
  bottom: 1px;
  td:first-of-type & {
    border-top-left-radius: 0.5em;
  }
  td:last-of-type & {
    border-top-right-radius: 0.5em;
    border-right: 1px solid rgba(0, 0, 0, 0.05);
    right: -1px;
  }
  svg {
    position: absolute;
    top: 0.1875em;
    left: 50%;
    margin-left: -0.5em;
    color: rgba(0, 0, 0, 0.2);
  }
  &:hover svg {
    color: rgba(0, 0, 0, 0.5);
  }

  /* border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em; */
`;
var $RowMenuTile = styled30($MenuTile)`
  left: 50%;
  border-right: none;
  border-bottom: none;
  right: 1px;
  tr:first-of-type & {
    border-top-left-radius: 0.5em;
  }
  tr:last-of-type & {
    border-bottom-left-radius: 0.5em;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    bottom: 0;
  }
  svg {
    position: absolute;
    left: 0.25em;
    top: 50%;
    margin-top: -0.5em;
    color: rgba(0, 0, 0, 0.2);
  }
  &:hover svg {
    color: rgba(0, 0, 0, 0.5);
  }

  /* border-top-left-radius: 0.5em;
  border-bottom-left-radius: 0.5em; */
`;
var $MenuButton = styled30("div")`
  position: absolute;
  font-size: 1.5em;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  svg {
    display: block;
  }
`;
var $AddMenuButton = styled30($MenuButton)`
  color: #c0c0c0;
  &:hover {
    color: royalblue;
  }
`;
var $RemoveMenuButton = styled30($MenuButton)`
  color: #c0c0c0;
  &:hover {
    color: firebrick;
  }
`;

// src/table-plugin/render-element/styles/index.ts
var $Table = styled31("table")`
  border-collapse: collapse;
  margin: 1em 0;
  ${({ columns }) => columns.map(
  (column, index) => `td:nth-of-type(${index + 1}) { text-align: ${column.align}; }`
).join("\n")}
`;
var $TableRow = styled31("tr")`
  position: relative;
  &:first-of-type {
    background: var(--table-head-bgcolor);
  }
`;
var $TableCell = styled31("td")`
  position: relative;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
  border-color: var(--table-row-border-color) var(--table-column-border-color);
  padding: 0.75em 1em;
  min-width: 2em;
  &.--selected {
    outline: 2px solid var(--select-color, blue);
  }
  /**
   * Stronger borders on the left and right edge
   */
  &:first-of-type {
    border-left-color: var(--table-border-color);
  }
  &:last-of-type {
    border-right-color: var(--table-border-color);
  }
`;
var $TableContent = styled31("div")`
  /**
   * Smaller font inside a table than outside of it
   */
  font-size: 0.9375em; /* 15px */
  /**
   * Even smaller font and dimmer for the heading row
   */
  tr:first-of-type & {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.875em; /* 14px */
  }
`;

// src/table-plugin/render-element/table-context.tsx
import { createContext as createContext2 } from "react";
var TableContext = createContext2({
  isSelected: false
});

// src/table-plugin/render-element/table.tsx
import { jsx as jsx46 } from "react/jsx-runtime";
function Table({
  element,
  attributes,
  children
}) {
  const editor = useSlateStatic13();
  const isSelected = useSelected7();
  useEffect6(() => {
    const path = ReactEditor12.findPath(editor, element);
    normalizeTableIndexes(editor, [element, path]);
  }, []);
  return /* @__PURE__ */ jsx46(TableContext.Provider, { value: { isSelected }, children: /* @__PURE__ */ jsx46($Table, { ...attributes, columns: element.columns, children: /* @__PURE__ */ jsx46("tbody", { children }) }) });
}

// src/table-plugin/render-element/table-cell/index.tsx
import { useContext as useContext2 } from "react";
import { useSelected as useSelected8 } from "slate-react";

// src/table-plugin/render-element/table-cell/column-menu/index.tsx
import { useCallback as useCallback11, useRef as useRef6, useState as useState5 } from "react";
import { useSlateStatic as useSlateStatic14 } from "slate-react";

// src/table-plugin/icons.tsx
import { jsx as jsx47 } from "react/jsx-runtime";
var PlusIcon = (props) => /* @__PURE__ */ jsx47(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: "1em",
    height: "1em",
    ...props,
    children: /* @__PURE__ */ jsx47(
      "path",
      {
        fillRule: "evenodd",
        d: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5z",
        clipRule: "evenodd"
      }
    )
  }
);
var MinusIcon = (props) => /* @__PURE__ */ jsx47(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: "1em",
    height: "1em",
    ...props,
    children: /* @__PURE__ */ jsx47(
      "path",
      {
        fillRule: "evenodd",
        d: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5z",
        clipRule: "evenodd"
      }
    )
  }
);
var BarsIcon = () => /* @__PURE__ */ jsx47(TablerIcon, { children: /* @__PURE__ */ jsx47("path", { d: "M4 6h16M4 12h16M4 18h16" }) });
var AlignLeft = () => /* @__PURE__ */ jsx47(TablerIcon, { children: /* @__PURE__ */ jsx47("path", { d: "M4 6h16M4 12h10M4 18h14" }) });
var AlignCenter = () => /* @__PURE__ */ jsx47(TablerIcon, { children: /* @__PURE__ */ jsx47("path", { d: "M4 6h16M8 12h8M6 18h12" }) });
var AlignRight = () => /* @__PURE__ */ jsx47(TablerIcon, { children: /* @__PURE__ */ jsx47("path", { d: "M4 6h16M10 12h10M6 18h14" }) });

// src/table-plugin/render-element/table-cell/column-menu/index.tsx
import { Fragment as Fragment4, jsx as jsx48, jsxs as jsxs22 } from "react/jsx-runtime";
function ColumnMenu({ cellElement }) {
  const editor = useSlateStatic14();
  const menu = useLayer("column-menu");
  const buttonRef = useRef6(null);
  const [hover, setHover] = useState5(false);
  const onMouseEnter = useCallback11(() => {
    setHover(true);
  }, []);
  const onMouseLeave = useCallback11(() => {
    setHover(false);
  }, []);
  const onClick = useCallback11(() => {
    if (menu.layer)
      menu.close();
    const dest = buttonRef.current;
    if (dest === null)
      return;
    const items = [
      {
        icon: AlignLeft,
        title: "\u5DE6\u63C3\u3048",
        action: () => {
          editor.tablePlugin.setTableColumnAlign({ align: "left" });
        }
      },
      {
        icon: AlignCenter,
        title: "\u4E2D\u592E\u63C3\u3048",
        action: () => {
          editor.tablePlugin.setTableColumnAlign({ align: "center" });
        }
      },
      {
        icon: AlignRight,
        title: "\u53F3\u63C3\u3048",
        action: () => {
          editor.tablePlugin.setTableColumnAlign({ align: "right" });
        }
      }
    ];
    menu.open(() => /* @__PURE__ */ jsx48(Menu, { dest, items, close: menu.close }));
  }, []);
  return /* @__PURE__ */ jsxs22(
    $ColumnMenu,
    {
      ref: buttonRef,
      contentEditable: false,
      onClick,
      onMouseEnter,
      onMouseLeave,
      children: [
        /* @__PURE__ */ jsx48($ColumnMenuTile, { className: "--tile", children: /* @__PURE__ */ jsx48(BarsIcon, {}) }),
        hover ? /* @__PURE__ */ jsxs22(Fragment4, { children: [
          /* @__PURE__ */ jsx48(
            $RemoveMenuButton,
            {
              style: {
                top: 0,
                left: "50%",
                marginLeft: "-0.5em"
              },
              onMouseDown: () => editor.tablePlugin.removeColumn({ at: cellElement }),
              children: /* @__PURE__ */ jsx48(MinusIcon, {})
            }
          ),
          /* @__PURE__ */ jsx48(
            $AddMenuButton,
            {
              style: { left: "-0.5em", top: 0 },
              onMouseDown: () => editor.tablePlugin.insertColumn({ at: cellElement }),
              children: /* @__PURE__ */ jsx48(PlusIcon, {})
            }
          ),
          /* @__PURE__ */ jsx48(
            $AddMenuButton,
            {
              style: { right: "-0.5em", top: 0 },
              onMouseDown: () => editor.tablePlugin.insertColumn({ at: cellElement, offset: 1 }),
              children: /* @__PURE__ */ jsx48(PlusIcon, {})
            }
          )
        ] }) : null
      ]
    }
  );
}

// src/table-plugin/render-element/table-cell/row-menu/index.tsx
import { useState as useState6 } from "react";
import { useSlateStatic as useSlateStatic15 } from "slate-react";
import { Fragment as Fragment5, jsx as jsx49, jsxs as jsxs23 } from "react/jsx-runtime";
function RowMenu({ cellElement }) {
  const editor = useSlateStatic15();
  const [hover, setHover] = useState6(false);
  return /* @__PURE__ */ jsxs23(
    $RowMenu,
    {
      contentEditable: false,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      children: [
        /* @__PURE__ */ jsx49($RowMenuTile, { className: "--tile", children: /* @__PURE__ */ jsx49(BarsIcon, {}) }),
        hover ? /* @__PURE__ */ jsxs23(Fragment5, { children: [
          /* @__PURE__ */ jsx49(
            $RemoveMenuButton,
            {
              style: {
                top: "50%",
                left: "0.5em",
                marginTop: "-0.5em"
              },
              onMouseDown: () => editor.tablePlugin.removeRow({ at: cellElement }),
              children: /* @__PURE__ */ jsx49(MinusIcon, {})
            }
          ),
          /* @__PURE__ */ jsx49(
            $AddMenuButton,
            {
              style: { top: "-0.5em", left: "0.5em" },
              onMouseDown: () => editor.tablePlugin.insertRow({ at: cellElement }),
              children: /* @__PURE__ */ jsx49(PlusIcon, {})
            }
          ),
          /* @__PURE__ */ jsx49(
            $AddMenuButton,
            {
              style: { bottom: "-0.5em", left: "0.5em" },
              onMouseDown: () => editor.tablePlugin.insertRow({ at: cellElement, offset: 1 }),
              children: /* @__PURE__ */ jsx49(PlusIcon, {})
            }
          )
        ] }) : null
      ]
    }
  );
}

// src/table-plugin/render-element/table-cell/table-menu/$table-menu.tsx
import styled32 from "@emotion/styled";
var $TableMenu = styled32("div")`
  position: absolute;
  /**
   * very slightly shaded
   */
  background: rgba(0, 0, 0, 0.001);

  /**
   * hangs out on left
   */
  top: -1.5em;
  left: -4em;
  height: 2.5em;
  width: 2.5em;

  /**
   * hover 
   */
  &:hover {
    /**
     * needs to pop up so that it doesn't jump back and forth with neighbor
     * below
     */
    z-index: 1000;
    /**
     * Makes the visible tile get darker on hover over any part of the
     * menu including the invisible part
     */
    .--row-menu-tile {
      background: rgba(0, 0, 0, 0.15);
    }
  }
`;
var $TableMenuTile = styled32("div")`
  position: absolute;
  left: 0;
  top: 0;
  width: 1.5em;
  height: 1.5em;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
`;

// src/table-plugin/render-element/table-cell/table-menu/index.tsx
import { jsx as jsx50 } from "react/jsx-runtime";
function TableMenu() {
  return /* @__PURE__ */ jsx50($TableMenu, { contentEditable: false, children: /* @__PURE__ */ jsx50($TableMenuTile, { className: "--table-menu-tile" }) });
}

// src/table-plugin/render-element/table-cell/index.tsx
import { jsx as jsx51, jsxs as jsxs24 } from "react/jsx-runtime";
function TableCell({
  element,
  attributes,
  children
}) {
  const tableContext = useContext2(TableContext);
  const selected = useSelected8();
  const showTableMenu = tableContext.isSelected && element.x === 0 && element.y === 0;
  const showRowMenu = tableContext.isSelected && element.x === 0;
  const showColumnMenu = tableContext.isSelected && element.y === 0;
  return /* @__PURE__ */ jsxs24(
    $TableCell,
    {
      className: selected ? "--selected" : "",
      ...attributes,
      "data-x": element.x,
      "data-y": element.y,
      children: [
        children,
        showTableMenu ? /* @__PURE__ */ jsx51(TableMenu, {}) : null,
        showRowMenu ? /* @__PURE__ */ jsx51(RowMenu, { cellElement: element }) : null,
        showColumnMenu ? /* @__PURE__ */ jsx51(ColumnMenu, { cellElement: element }) : null
      ]
    }
  );
}

// src/table-plugin/render-element/table-content.tsx
import { jsx as jsx52 } from "react/jsx-runtime";
function TableContent({
  attributes,
  children
}) {
  return /* @__PURE__ */ jsx52($TableContent, { ...attributes, children });
}

// src/table-plugin/render-element/table-row.tsx
import { jsx as jsx53 } from "react/jsx-runtime";
function TableRow({
  attributes,
  children
}) {
  return /* @__PURE__ */ jsx53($TableRow, { ...attributes, children });
}

// src/table-plugin/render-element/index.tsx
import { jsx as jsx54 } from "react/jsx-runtime";
function renderElement4({
  element,
  attributes,
  children
}) {
  switch (element.type) {
    case "table":
      return /* @__PURE__ */ jsx54(Table, { element, attributes, children });
    case "table-row":
      return /* @__PURE__ */ jsx54(TableRow, { element, attributes, children });
    case "table-cell":
      return /* @__PURE__ */ jsx54(TableCell, { element, attributes, children });
    case "table-content":
      return /* @__PURE__ */ jsx54(TableContent, { element, attributes, children });
  }
}

// src/table-plugin/index.tsx
var TablePlugin = createPlugin(
  (editor, _options, { createPolicy }) => {
    editor.supportsTable = true;
    editor.tablePlugin = createTableMethods(editor);
    return createPolicy({
      name: "table",
      editor: {
        deleteBackward: () => {
          return isStartOfElement(editor, "table-cell");
        },
        deleteForward: () => {
          return isEndOfElement(editor, "table-cell");
        },
        deleteFragment: () => deleteFragmentWithProtectedTypes(editor, ["table-cell"]),
        insertBreak: () => {
          const entry = findElementUp(editor, "table-cell");
          return !!entry;
        },
        isMaster(element) {
          if (element.type === "table")
            return true;
        },
        normalizeNode: (entry) => {
          const [node] = entry;
          if (!Element23.isElement(node))
            return false;
          switch (node.type) {
            case "table":
              return normalizeTableIndexes(
                editor,
                entry
              );
            case "table-cell": {
              return normalizeTableCell(
                editor,
                entry
              );
            }
          }
          return false;
        }
      },
      editableProps: {
        renderElement: renderElement4,
        onKeyDown: createHotkeyHandler({
          /**
           * navigation
           */
          tab: editor.tablePlugin.tabForward,
          "shift+tab": editor.tablePlugin.tabBackward,
          down: editor.tablePlugin.down,
          up: editor.tablePlugin.up,
          /**
           * selection
           */
          "mod+a": editor.tablePlugin.selectCell,
          /**
           * insert
           */
          "super+t": () => editor.tablePlugin.insertTable(3, 2),
          "mod+shift+enter": () => editor.tablePlugin.insertRow({ offset: 0 }),
          "mod+enter": () => editor.tablePlugin.insertRow({ offset: 1 }),
          "super+[": () => editor.tablePlugin.insertColumn({ offset: 0 }),
          "super+]": () => editor.tablePlugin.insertColumn({ offset: 1 }),
          /**
           * remove
           */
          "super+backspace": editor.tablePlugin.removeTable,
          "mod+backspace": editor.tablePlugin.removeRow,
          "mod+shift+backspace": editor.tablePlugin.removeColumn
        })
      }
    });
  }
);

// src/theme-plugin/index.tsx
import { Global } from "@emotion/react";

// src/theme-plugin/global-styles.ts
import { css as css2 } from "@emotion/react";
var blue = `
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
`;
var zincShades = `
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
`;
var globalStyles = css2`
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
`;

// src/theme-plugin/index.tsx
import { Fragment as Fragment6, jsx as jsx55, jsxs as jsxs25 } from "react/jsx-runtime";
var ThemePlugin = createPlugin((editor) => {
  editor.theme = true;
  return {
    name: "theme",
    editor: {},
    renderEditable: ({ attributes, Editable: Editable3 }) => {
      return /* @__PURE__ */ jsxs25(Fragment6, { children: [
        /* @__PURE__ */ jsx55(Global, { styles: globalStyles }),
        /* @__PURE__ */ jsx55(Editable3, { ...attributes })
      ] });
    },
    editableProps: {}
  };
});

// src/toolbar-plugin/render-editable/index.tsx
import { clsx as clsx10 } from "clsx";
import { useCallback as useCallback15, useRef as useRef12 } from "react";
import { Editor as Editor60, Transforms as Transforms43 } from "slate";
import { ReactEditor as ReactEditor16, useFocused, useSlateStatic as useSlateStatic21 } from "slate-react";

// src/toolbar-plugin/components/dialog/table-dialog.tsx
import { clsx as clsx8 } from "clsx";
import { useCallback as useCallback12, useRef as useRef7, useState as useState7 } from "react";
import { ReactEditor as ReactEditor13, useSlateStatic as useSlateStatic16 } from "slate-react";

// src/toolbar-plugin/styles/table-styles.ts
import styled33 from "@emotion/styled";
var $TableDialog = styled33($Panel)`
  padding: 0.5em;
`;
var $TableDialogGrid = styled33("div")`
  display: grid;
  grid-template-columns: repeat(5, 1.75em);
  grid-template-rows: 1.5em;
  /* grid-gap: 1px; */
`;
var $TableDialogGridCell = styled33("div")`
  background: var(--shade-100);
  height: 1.5em;
  border-radius: 0.125em;
  border-right: 1px solid white;
  border-top: 1px solid white;
  cursor: pointer;
  &.--selected {
    background: var(--blue-100);
  }
`;

// src/toolbar-plugin/components/dialog/table-dialog.tsx
import { Fragment as Fragment7, jsx as jsx56, jsxs as jsxs26 } from "react/jsx-runtime";
function createRange2(size) {
  return [...Array(size).keys()];
}
function TableDialog({
  dest,
  close
}) {
  const [hover, setHover] = useState7({ x: 0, y: 0 });
  const editor = useSlateStatic16();
  const ref = useRef7(null);
  const style = useAbsoluteReposition({ src: ref, dest }, ({ dest: dest2 }) => {
    return { left: dest2.left - 8, top: dest2.top + dest2.height };
  });
  const rows = createRange2(5).map((i) => i + 1);
  const cols = createRange2(5).map((i) => i + 1);
  const hoverCell = useCallback12(
    (x, y) => {
      setHover({ x, y });
    },
    [setHover]
  );
  const createTable2 = useCallback12(
    (x, y) => {
      editor.tablePlugin.insertTable(x, y);
      ReactEditor13.focus(editor);
      close();
    },
    [editor]
  );
  return /* @__PURE__ */ jsxs26(Fragment7, { children: [
    /* @__PURE__ */ jsx56(CloseMask, { close }),
    /* @__PURE__ */ jsx56($TableDialog, { ref, style, children: /* @__PURE__ */ jsx56($TableDialogGrid, { onMouseLeave: () => hoverCell(0, 0), children: rows.map((y) => {
      return cols.map((x) => {
        const selected = x <= hover.x && y <= hover.y;
        return /* @__PURE__ */ jsx56(
          $TableDialogGridCell,
          {
            className: clsx8({ "--selected": selected }),
            onMouseEnter: () => hoverCell(x, y),
            onClick: () => createTable2(x, y)
          },
          `${x},${y}`
        );
      });
    }) }) })
  ] });
}

// src/toolbar-plugin/components/toolbar/toolbar.tsx
import throttle2 from "lodash.throttle";
import { useEffect as useEffect8, useRef as useRef11, useState as useState10 } from "react";
import { useSlateStatic as useSlateStatic20 } from "slate-react";

// src/toolbar-plugin/icons.tsx
import { jsx as jsx57, jsxs as jsxs27 } from "react/jsx-runtime";
var H = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M7 12h10M7 5v14M17 5v14M15 19h4M15 5h4M5 19h4M5 5h4" }) });
var More = () => /* @__PURE__ */ jsx57(TablerIcon, { className: "--more-icon", width: "0.5em", viewBox: "0 0 12 24", children: /* @__PURE__ */ jsx57("path", { d: "m2 12 4 4 4-4" }) });
var LinkPlus = () => /* @__PURE__ */ jsx57(TablerIcon, { width: "0.5em", viewBox: "6 0 12 24", children: /* @__PURE__ */ jsx57("path", { d: "M9 12h6M12 9v6" }) });
var H1 = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M19 18v-8l-2 2M4 6v12M12 6v12M11 18h2M3 18h2M4 12h8M3 6h2M11 6h2" }) });
var H2 = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M17 12a2 2 0 1 1 4 0c0 .591-.417 1.318-.816 1.858L17 18.001h4M4 6v12M12 6v12M11 18h2M3 18h2M4 12h8M3 6h2M11 6h2" }) });
var H3 = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M19 14a2 2 0 1 0-2-2M17 16a2 2 0 1 0 2-2M4 6v12M12 6v12M11 18h2M3 18h2M4 12h8M3 6h2M11 6h2" }) });
var Normal = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M8 18V6h2l6 9V6h2v12h-2l-6-9v9H8z" }) });
var Bold = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M7 5h6a3.5 3.5 0 0 1 0 7H7zM13 12h1a3.5 3.5 0 0 1 0 7H7v-7" }) });
var Italic = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M11 5h6M7 19h6M14 5l-4 14" }) });
var Link = () => /* @__PURE__ */ jsxs27(TablerIcon, { children: [
  /* @__PURE__ */ jsx57("path", { d: "M10 14a3.5 3.5 0 0 0 5 0l4-4a3.5 3.5 0 0 0-5-5l-.5.5" }),
  /* @__PURE__ */ jsx57("path", { d: "M14 10a3.5 3.5 0 0 0-5 0l-4 4a3.5 3.5 0 0 0 5 5l.5-.5" })
] });
var Quote = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6c0 2.667-1.333 4.333-4 5M19 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6c0 2.667-1.333 4.333-4 5" }) });
var DoubleQuote = () => /* @__PURE__ */ jsxs27(TablerIcon, { children: [
  /* @__PURE__ */ jsx57("path", { d: "M10 9l4 3-4 3" }),
  /* @__PURE__ */ jsx57("path", { d: "M16 9l4 3-4 3" })
] });
var BulletList = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01" }) });
var Table2 = () => /* @__PURE__ */ jsxs27(TablerIcon, { children: [
  /* @__PURE__ */ jsx57("rect", { x: 4, y: 4, width: 16, height: 16, rx: 2 }),
  /* @__PURE__ */ jsx57("path", { d: "M4 10h16M10 4v16" })
] });
var Code = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "m7 8-4 4 4 4M17 8l4 4-4 4M14 4l-4 16" }) });
var CodeBlock2 = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M9 8L5 12L9 16M15 8L19 12L15 16" }) });
var Image = () => /* @__PURE__ */ jsxs27(TablerIcon, { children: [
  /* @__PURE__ */ jsx57("path", { d: "M15 8h.01" }),
  /* @__PURE__ */ jsx57("rect", { x: 4, y: 4, width: 16, height: 16, rx: 3 }),
  /* @__PURE__ */ jsx57("path", { d: "m4 15 4-4a3 5 0 0 1 3 0l5 5" }),
  /* @__PURE__ */ jsx57("path", { d: "m14 14 1-1a3 5 0 0 1 3 0l2 2" })
] });
var Plus = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M12 5v14M5 12h14" }) });
var Strikethrough = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M5 12h14M16 6.5A4 2 0 0 0 12 5h-1a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7h-1.5a4 2 0 0 1-4-1.5" }) });
var Underline = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M7 5v5a5 5 0 0 0 10 0V5M5 19h14" }) });
var ListCheck = () => /* @__PURE__ */ jsxs27(TablerIcon, { children: [
  /* @__PURE__ */ jsx57("path", { d: "m9 11 3 3 8-8" }),
  /* @__PURE__ */ jsx57("path", { d: "M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" })
] });
var ListNumbers = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M11 6h9M11 12h9M12 18h8M4 16a2 2 0 1 1 4 0c0 .591-.5 1-1 1.5L4 20h4M6 10V4L4 6" }) });
var IncreaseDepth = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M4 6h16M8 12h12M12 18h8M7 12l-3-3M7 12l-3 3" }) });
var DecreaseDepth = () => /* @__PURE__ */ jsx57(TablerIcon, { children: /* @__PURE__ */ jsx57("path", { d: "M4 6h16M8 12h12M12 18h8M4 12l3-3M4 12l3 3" }) });
var Markdown = () => /* @__PURE__ */ jsxs27(TablerIcon, { children: [
  /* @__PURE__ */ jsx57("path", { d: "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" }),
  /* @__PURE__ */ jsx57("path", { d: "M7 15V9l2 2 2-2v6M14 9v6h4M14 13h2" })
] });
var VisualEditor = () => /* @__PURE__ */ jsxs27(TablerIcon, { children: [
  /* @__PURE__ */ jsx57("path", { d: "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" }),
  /* @__PURE__ */ jsx57("path", { d: "M8 8h8M8 12h8M8 16h5" }),
  /* @__PURE__ */ jsx57("path", { d: "M16 16h1" })
] });

// src/toolbar-plugin/items/block-items.tsx
var listDepthItems = [
  {
    icon: IncreaseDepth,
    title: t("increaseDepth"),
    hotkey: "tab",
    action: (editor) => editor.list.increaseDepth(),
    active: (editor) => editor.list.canIncreaseDepth()
  },
  {
    icon: DecreaseDepth,
    title: t("decreaseDepth"),
    hotkey: "shift+tab",
    action: (editor) => editor.list.decreaseDepth(),
    active: (editor) => editor.list.canDecreaseDepth()
  }
];
var blockItems = [
  {
    icon: Normal,
    title: t("normal"),
    hotkey: "super+0",
    action: (editor) => {
      editor.collapsibleParagraph.convertParagraph();
    }
  },
  {
    icon: H1,
    title: t("heading1"),
    hotkey: "super+1",
    action: (editor) => editor.heading.convertHeading(1, true),
    active: (editor) => editor.heading.isHeadingActive(1)
  },
  {
    icon: H2,
    title: t("heading2"),
    hotkey: "super+2",
    action: (editor) => editor.heading.convertHeading(2, true),
    active: (editor) => editor.heading.isHeadingActive(2)
  },
  {
    icon: H3,
    title: t("heading3"),
    hotkey: "super+3",
    action: (editor) => editor.heading.convertHeading(3, true),
    active: (editor) => editor.heading.isHeadingActive(3)
  }
];
var expandedBlockItems = [...blockItems];
var compactBlockItems = [
  {
    icon: H,
    title: t("paragraphStyle"),
    more: true,
    children: blockItems
  }
];

// src/toolbar-plugin/components/dialog/image-url-dialog.tsx
import { useState as useState8, useRef as useRef8, useEffect as useEffect7 } from "react";
import { useSlateStatic as useSlateStatic17 } from "slate-react";

// src/toolbar-plugin/styles/file-dialog-styles.ts
import styled34 from "@emotion/styled";
var $FileDialog = styled34($Panel)`
  padding: 1em;
  width: 18em;
`;

// src/toolbar-plugin/components/dialog/image-url-dialog.tsx
import { Fragment as Fragment8, jsx as jsx58, jsxs as jsxs28 } from "react/jsx-runtime";
function ImageUrlDialog({
  dest,
  close
}) {
  const editor = useSlateStatic17();
  const ref = useRef8(void 0);
  const fileInputRef = useRef8(null);
  const savedState = editor.wysimark?.imageDialogState;
  const hasOnImageChange = !!editor.wysimark?.onImageChange;
  const [url, setUrl] = useState8(savedState?.url ?? "");
  const [alt, setAlt] = useState8(savedState?.alt ?? "");
  const [title, setTitle] = useState8(savedState?.title ?? "");
  const [imageSource, setImageSource] = useState8(savedState?.imageSource ?? (hasOnImageChange ? "file" : "url"));
  const [isUploading, setIsUploading] = useState8(false);
  const [uploadedUrl, setUploadedUrl] = useState8(savedState?.uploadedUrl ?? "");
  useEffect7(() => {
    if (editor.wysimark) {
      editor.wysimark.imageDialogState = { url, alt, title, imageSource, uploadedUrl };
    }
  }, [url, alt, title, imageSource, uploadedUrl]);
  const clearState = () => {
    if (editor.wysimark) {
      editor.wysimark.imageDialogState = void 0;
    }
  };
  const style = useAbsoluteReposition(
    { src: ref, dest },
    ({ src, dest: dest2 }) => {
      return positionInside(
        src,
        dest2,
        {
          left: dest2.left - 16,
          top: dest2.top + dest2.height
        },
        { margin: 16 }
      );
    }
  );
  function handleSubmit(e) {
    e.preventDefault();
    const finalUrl = imageSource === "file" ? uploadedUrl : url;
    if (finalUrl.trim() === "")
      return;
    editor.image.insertImageFromUrl(finalUrl, alt, title);
    clearState();
    close();
  }
  function handleCancel() {
    clearState();
    close();
  }
  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file || !editor.wysimark?.onImageChange)
      return;
    setIsUploading(true);
    try {
      const resultUrl = await editor.wysimark.onImageChange(file);
      setUploadedUrl(resultUrl);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  }
  function handleSelectFileClick() {
    fileInputRef.current?.click();
  }
  const isSubmitDisabled = imageSource === "file" ? uploadedUrl.trim() === "" || isUploading : url.trim() === "";
  return /* @__PURE__ */ jsxs28(Fragment8, { children: [
    /* @__PURE__ */ jsx58(CloseMask, { close }),
    /* @__PURE__ */ jsx58($FileDialog, { ref, style, children: /* @__PURE__ */ jsxs28("form", { onSubmit: handleSubmit, style: { padding: "8px" }, children: [
      hasOnImageChange && /* @__PURE__ */ jsxs28("div", { style: { marginBottom: "12px" }, children: [
        /* @__PURE__ */ jsxs28("label", { style: { display: "inline-flex", alignItems: "center", marginRight: "16px", cursor: "pointer" }, children: [
          /* @__PURE__ */ jsx58(
            "input",
            {
              type: "radio",
              name: "imageSource",
              value: "file",
              checked: imageSource === "file",
              onChange: () => setImageSource("file"),
              style: { marginRight: "4px" }
            }
          ),
          t("imageSourceFile")
        ] }),
        /* @__PURE__ */ jsxs28("label", { style: { display: "inline-flex", alignItems: "center", cursor: "pointer" }, children: [
          /* @__PURE__ */ jsx58(
            "input",
            {
              type: "radio",
              name: "imageSource",
              value: "url",
              checked: imageSource === "url",
              onChange: () => setImageSource("url"),
              style: { marginRight: "4px" }
            }
          ),
          t("imageSourceUrl")
        ] })
      ] }),
      imageSource === "url" ? /* @__PURE__ */ jsxs28("div", { style: { marginBottom: "8px" }, children: [
        /* @__PURE__ */ jsx58("label", { style: { display: "block", marginBottom: "4px" }, children: t("imageUrlRequired") }),
        /* @__PURE__ */ jsx58(
          "input",
          {
            type: "text",
            value: url,
            onChange: (e) => setUrl(e.target.value),
            style: {
              width: "100%",
              padding: "6px",
              boxSizing: "border-box",
              border: "1px solid #ccc",
              borderRadius: "4px"
            },
            placeholder: "https://example.com/image.jpg"
          }
        )
      ] }) : /* @__PURE__ */ jsxs28("div", { style: { marginBottom: "8px" }, children: [
        /* @__PURE__ */ jsx58(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: "image/*",
            onChange: handleFileSelect,
            style: { display: "none" }
          }
        ),
        /* @__PURE__ */ jsx58(
          "button",
          {
            type: "button",
            onClick: handleSelectFileClick,
            disabled: isUploading,
            style: {
              padding: "8px 16px",
              backgroundColor: isUploading ? "#ccc" : "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: isUploading ? "not-allowed" : "pointer",
              marginBottom: "8px"
            },
            children: isUploading ? t("uploading") : t("selectFile")
          }
        ),
        uploadedUrl && /* @__PURE__ */ jsxs28("div", { style: { marginTop: "8px" }, children: [
          /* @__PURE__ */ jsx58("label", { style: { display: "block", marginBottom: "4px" }, children: t("imageUrlRequired") }),
          /* @__PURE__ */ jsx58(
            "input",
            {
              type: "text",
              value: uploadedUrl,
              disabled: true,
              style: {
                width: "100%",
                padding: "6px",
                boxSizing: "border-box",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                color: "#666"
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs28("div", { style: { marginBottom: "8px" }, children: [
        /* @__PURE__ */ jsx58("label", { style: { display: "block", marginBottom: "4px" }, children: t("altText") }),
        /* @__PURE__ */ jsx58(
          "input",
          {
            type: "text",
            value: alt,
            onChange: (e) => setAlt(e.target.value),
            style: {
              width: "100%",
              padding: "6px",
              boxSizing: "border-box",
              border: "1px solid #ccc",
              borderRadius: "4px"
            },
            placeholder: t("imageDescription")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs28("div", { style: { marginBottom: "8px" }, children: [
        /* @__PURE__ */ jsx58("label", { style: { display: "block", marginBottom: "4px" }, children: t("title") }),
        /* @__PURE__ */ jsx58(
          "input",
          {
            type: "text",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            style: {
              width: "100%",
              padding: "6px",
              boxSizing: "border-box",
              border: "1px solid #ccc",
              borderRadius: "4px"
            },
            placeholder: t("imageTitle")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs28("div", { style: { display: "flex", gap: "8px" }, children: [
        /* @__PURE__ */ jsx58(
          "button",
          {
            type: "submit",
            disabled: isSubmitDisabled,
            style: {
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              backgroundColor: isSubmitDisabled ? "#ccc" : "#0078d4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isSubmitDisabled ? "not-allowed" : "pointer",
              fontWeight: "bold"
            },
            children: t("register")
          }
        ),
        /* @__PURE__ */ jsx58(
          "button",
          {
            type: "button",
            onClick: handleCancel,
            style: {
              padding: "8px 16px",
              backgroundColor: "#f0f0f0",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            },
            children: t("cancel")
          }
        )
      ] })
    ] }) })
  ] });
}

// src/toolbar-plugin/components/dialog/anchor-dialog.tsx
import { isHotkey as isHotkey3 } from "is-hotkey";
import {
  useCallback as useCallback13,
  useRef as useRef9,
  useState as useState9
} from "react";
import { ReactEditor as ReactEditor14, useSlateStatic as useSlateStatic18 } from "slate-react";

// src/toolbar-plugin/styles/dialog-shared-styles.ts
import styled35 from "@emotion/styled";
var $DialogButton = styled35("div")`
  /* Center vertically and horizontally */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /* font-size: 1.25em; */
  padding: 0.25em 0.75em;
  text-align: center;
  color: var(--blue-100);
  color: white;
  background: var(--blue-500);
  transition: all 100ms;
  &:hover {
    color: var(--blue-50);
    background: var(--blue-600);
    outline: 2px solid var(--blue-200);
  }
  border-radius: 0.25em;
  svg {
    color: var(--blue-200);
    font-size: 1.25em;
    stroke-width: 2px;
  }
`;
var $DialogHint = styled35("div")`
  font-size: 0.875em;
  margin-top: 0.5em;
  color: var(--shade-500);
  line-height: 1.375;
`;

// src/toolbar-plugin/components/dialog/anchor-dialog.tsx
import { Fragment as Fragment9, jsx as jsx59, jsxs as jsxs29 } from "react/jsx-runtime";
var isEnter = isHotkey3("enter");
function AnchorDialog2({
  dest,
  close
}) {
  const editor = useSlateStatic18();
  const ref = useRef9(null);
  const style = useAbsoluteReposition(
    { src: ref, dest },
    ({ src, dest: dest2 }, viewport) => {
      return positionInside(
        src,
        viewport,
        {
          left: dest2.left - 12,
          top: dest2.top + dest2.height
        },
        { margin: 16 }
      );
    }
  );
  const [url, setUrl] = useState9("");
  const insertLink2 = () => {
    editor.anchor.insertLink(url, url, { select: true });
    ReactEditor14.focus(editor);
    close();
  };
  const onChangeInput = useCallback13(
    (e) => {
      setUrl(e.currentTarget.value);
    },
    [setUrl]
  );
  const onKeyDown = (e) => {
    if (!isEnter(e))
      return;
    e.preventDefault();
    e.stopPropagation();
    insertLink2();
  };
  return /* @__PURE__ */ jsxs29(Fragment9, { children: [
    /* @__PURE__ */ jsx59(CloseMask, { close }),
    /* @__PURE__ */ jsxs29($AnchorDialog, { ref, style, children: [
      /* @__PURE__ */ jsxs29($AnchorDialogInputLine, { children: [
        /* @__PURE__ */ jsx59(
          $AnchorDialogInput,
          {
            type: "text",
            value: url,
            autoFocus: true,
            onChange: onChangeInput,
            onKeyDown
          }
        ),
        /* @__PURE__ */ jsxs29($DialogButton, { onClick: insertLink2, children: [
          /* @__PURE__ */ jsx59(Link, {}),
          /* @__PURE__ */ jsx59(LinkPlus, {})
        ] })
      ] }),
      /* @__PURE__ */ jsx59($DialogHint, { children: "Enter URL of link" })
    ] })
  ] });
}

// src/toolbar-plugin/items/dialogItems.tsx
var dialogItems = [
  {
    icon: Link,
    title: t("insertLink"),
    more: true,
    hotkey: "mod+k",
    Component: AnchorDialog2
  },
  {
    icon: Table2,
    title: t("insertTable"),
    more: true,
    Component: TableDialog
  },
  {
    icon: Image,
    title: t("insertImageFromUrl"),
    more: true,
    Component: ImageUrlDialog
  }
];
var expandedDialogItems = dialogItems;
var compactDialogItems = dialogItems;
var smallDialogItems = [
  {
    icon: Plus,
    title: t("insert"),
    more: true,
    children: dialogItems
  }
];

// src/toolbar-plugin/items/mark-items.tsx
import { Editor as Editor58 } from "slate";
function getMarks(editor) {
  const marks = Editor58.marks(editor);
  return {
    bold: marks?.bold || false,
    italic: marks?.italic || false,
    strike: marks?.strike || false,
    code: marks?.code || false,
    underline: marks?.underline || false
  };
}
var primaryMarkItems = [
  {
    icon: Bold,
    title: t("bold"),
    hotkey: "mod+b",
    action: (editor) => editor.marksPlugin.toggleBold(),
    active: (editor) => getMarks(editor).bold
  },
  {
    icon: Italic,
    title: t("italic"),
    hotkey: "mod+i",
    action: (editor) => editor.marksPlugin.toggleItalic(),
    active: (editor) => getMarks(editor).italic
  },
  {
    icon: Strikethrough,
    title: t("strike"),
    hotkey: "super+k",
    action: (editor) => editor.marksPlugin.toggleStrike(),
    active: (editor) => getMarks(editor).strike
  },
  {
    icon: Code,
    title: t("inlineCode"),
    hotkey: "mod+j",
    action: (editor) => editor.inlineCode.toggleInlineCode(),
    active: (editor) => getMarks(editor).code
  },
  {
    icon: Underline,
    title: t("underline"),
    hotkey: "mod+u",
    action: (editor) => editor.marksPlugin.toggleUnderline(),
    active: (editor) => getMarks(editor).underline
  }
];
var expandedMarkItems = primaryMarkItems;
var compactMarkItems = [
  {
    icon: Bold,
    title: t("format"),
    more: true,
    children: primaryMarkItems
  }
];

// src/toolbar-plugin/items/list-items.tsx
var listItems = [
  {
    icon: BulletList,
    title: t("bulletList"),
    hotkey: "super+8",
    action: (editor) => editor.list.convertUnorderedList(true)
  },
  {
    icon: ListNumbers,
    title: t("numberedList"),
    hotkey: "super+7",
    action: (editor) => editor.list.convertOrderedList(true)
  },
  {
    icon: ListCheck,
    title: t("checkList"),
    hotkey: "super+9",
    action: (editor) => editor.list.convertTaskList(true)
  }
];
var expandedListItems = [...listItems, "divider", ...listDepthItems];
var compactListItems = [
  {
    icon: ListNumbers,
    title: t("list"),
    more: true,
    children: [...listItems, "divider", ...listDepthItems]
  }
];

// src/toolbar-plugin/items/quote-items.tsx
import { Editor as Editor59, Transforms as Transforms42 } from "slate";
var quoteItemsList = [
  {
    icon: Quote,
    title: t("quote"),
    hotkey: "super+.",
    action: (editor) => {
      if (editor.blockQuotePlugin.isActive()) {
        editor.blockQuotePlugin.outdent();
      } else {
        editor.blockQuotePlugin.indent();
      }
    },
    active: (editor) => editor.blockQuotePlugin.isActive()
  },
  {
    icon: DoubleQuote,
    title: t("increaseQuoteDepth"),
    action: (editor) => editor.blockQuotePlugin.increaseDepth(),
    active: (editor) => editor.blockQuotePlugin.canIncreaseDepth()
  },
  {
    icon: CodeBlock2,
    title: t("codeBlock"),
    action: (editor) => {
      const { selection } = editor;
      const codeBlockEntry = findElementUp(editor, "code-block");
      if (codeBlockEntry) {
        const [codeBlock, path] = codeBlockEntry;
        const textContent = Editor59.string(editor, path);
        Transforms42.removeNodes(editor, { at: path });
        Transforms42.insertNodes(
          editor,
          {
            type: "paragraph",
            children: [{ text: textContent }]
          },
          { at: path }
        );
        return;
      }
      if (selection && JSON.stringify(selection.anchor.path) !== JSON.stringify(selection.focus.path)) {
        editor.codeBlock.createCodeBlock({ language: "text" });
        return;
      }
      if (selection && (selection.anchor.offset !== selection.focus.offset || JSON.stringify(selection.anchor.path) !== JSON.stringify(selection.focus.path))) {
        const selectedText = Editor59.string(editor, selection);
        Transforms42.delete(editor);
        Transforms42.insertNodes(
          editor,
          {
            type: "code-block",
            language: "text",
            children: [
              {
                type: "code-block-line",
                children: [{ text: selectedText }]
              }
            ]
          }
        );
        return;
      }
      editor.codeBlock.createCodeBlock({ language: "text" });
    },
    active: (editor) => !!findElementUp(editor, "code-block")
  }
];
var expandedQuoteItems = quoteItemsList;
var compactQuoteItems = [
  {
    icon: Quote,
    title: t("quote"),
    more: true,
    children: quoteItemsList
  }
];

// src/toolbar-plugin/items/raw-mode-item.tsx
var rawModeItem = {
  icon: Markdown,
  title: t("switchToRawMarkdown"),
  action: (editor) => {
    if (editor.wysimark && typeof editor.wysimark.toggleRawMode === "function") {
      editor.wysimark.toggleRawMode();
    }
  },
  // Only show in the toolbar when not in Raw mode
  show: (editor) => {
    return editor.wysimark && !editor.wysimark.isRawMode;
  },
  active: () => false
  // Never show as active in the toolbar
};
var visualModeItem = {
  icon: VisualEditor,
  title: t("switchToVisualEditor"),
  action: (editor) => {
    if (editor.wysimark && typeof editor.wysimark.toggleRawMode === "function") {
      editor.wysimark.toggleRawMode();
    }
  },
  // Only show in the toolbar when in Raw mode
  show: (editor) => {
    return !!(editor.wysimark && editor.wysimark.isRawMode);
  },
  active: () => false
  // Never show as active in the toolbar
};

// src/toolbar-plugin/items/index.tsx
var largeItems = [
  ...expandedBlockItems,
  "divider",
  ...expandedListItems,
  "divider",
  ...expandedMarkItems,
  "divider",
  ...expandedDialogItems,
  "divider",
  ...expandedQuoteItems,
  "divider",
  rawModeItem,
  visualModeItem
];
var mediumItems = [
  ...compactBlockItems,
  "divider",
  ...expandedListItems,
  "divider",
  ...expandedMarkItems,
  "divider",
  ...compactDialogItems,
  "divider",
  ...expandedQuoteItems,
  "divider",
  rawModeItem,
  visualModeItem
];
var smallItems = [
  ...compactBlockItems,
  "divider",
  ...compactListItems,
  "divider",
  ...compactMarkItems,
  "divider",
  ...smallDialogItems,
  "divider",
  ...compactQuoteItems,
  "divider",
  rawModeItem,
  visualModeItem
];
var initialItems = smallItems;
var itemSets = [largeItems, mediumItems, smallItems];

// src/toolbar-plugin/components/toolbar/toolbar-button.tsx
import { clsx as clsx9 } from "clsx";
import { useCallback as useCallback14, useRef as useRef10 } from "react";
import { ReactEditor as ReactEditor15, useSlate as useSlate2, useSlateStatic as useSlateStatic19 } from "slate-react";
import { jsx as jsx60, jsxs as jsxs30 } from "react/jsx-runtime";
function ToolbarButton({
  item
}) {
  const staticEditor = useSlateStatic19();
  const editor = useSlate2();
  const isActive = item.active ? item.active(editor) : false;
  const ref = useRef10(null);
  const tooltip = useTooltip({
    title: item.title,
    hotkey: () => item.hotkey ? formatHotkey(item.hotkey) : void 0
  });
  const menuLayer = useLayer("menu");
  const openMenu = useCallback14(() => {
    const dest = ref.current;
    const items = item.children;
    const Component = item.Component;
    if (!dest)
      return;
    if (items) {
      menuLayer.open(() => /* @__PURE__ */ jsx60(Menu, { dest, items, close: menuLayer.close }));
    } else if (Component) {
      menuLayer.open(() => /* @__PURE__ */ jsx60(Component, { dest, close: menuLayer.close }));
    }
  }, [item]);
  const onClick = useCallback14(() => {
    if (item.action) {
      item.action(staticEditor);
      ReactEditor15.focus(staticEditor);
      return;
    }
    if (menuLayer.layer) {
      menuLayer.close();
    } else {
      openMenu();
    }
  }, [menuLayer.layer, item]);
  const onMouseEnter = useCallback14(
    (e) => {
      tooltip.onMouseEnter(e);
      if (menuLayer.layer)
        openMenu();
    },
    [menuLayer.layer]
  );
  return /* @__PURE__ */ jsxs30(
    $ToolbarButton,
    {
      "data-item-type": "button",
      ref,
      onMouseEnter,
      onMouseLeave: tooltip.onMouseLeave,
      onClick,
      className: clsx9({
        "--active": isActive && !r(item?.title)?.includes("Depth"),
        "--more": item.more,
        "--disabled": !isActive && r(item?.title)?.includes("Depth")
      }),
      children: [
        /* @__PURE__ */ jsx60(item.icon, {}),
        item.more ? /* @__PURE__ */ jsx60(More, {}) : null
      ]
    }
  );
}

// src/toolbar-plugin/components/toolbar/toolbar.tsx
import { jsx as jsx61 } from "react/jsx-runtime";
function ToolbarItem({ item }) {
  const editor = useSlateStatic20();
  if (item === "divider") {
    return /* @__PURE__ */ jsx61($ToolbarDividerContainer, { "data-item-type": "divider", children: /* @__PURE__ */ jsx61($ToolbarDivider, {}) });
  }
  const show = item.show === void 0 ? true : item.show(editor);
  if (!show)
    return null;
  return /* @__PURE__ */ jsx61(ToolbarButton, { item });
}
function getWidths(toolbar) {
  const button = toolbar.querySelector(
    "[data-item-type=button]"
  );
  const divider = toolbar.querySelector(
    "[data-item-type=divider]"
  );
  if (!button || !divider)
    throw new Error("Button or divider not found");
  return {
    toolbar: toolbar.offsetWidth,
    button: button.offsetWidth,
    divider: divider.offsetWidth
  };
}
function measureItemSetWidth(items, buttonWidth, dividerWidth) {
  let width = 0;
  for (const item of items) {
    width += item === "divider" ? dividerWidth : buttonWidth;
  }
  return width;
}
var WIDTH_BUFFER_PX = 48;
function Toolbar() {
  const ref = useRef11(null);
  const [items, setItems] = useState10(initialItems);
  useEffect8(() => {
    const refresh = throttle2(
      () => {
        const toolbar = ref.current;
        if (!toolbar)
          throw new Error("Toolbar not found");
        const widths = getWidths(toolbar);
        for (let i = 0; i < itemSets.length - 1; i++) {
          const itemSetWidth = measureItemSetWidth(
            itemSets[i],
            widths.button,
            widths.divider
          );
          if (itemSetWidth < widths.toolbar - WIDTH_BUFFER_PX) {
            setItems(itemSets[i]);
            return;
          }
        }
        setItems(itemSets[itemSets.length - 1]);
      },
      100,
      { trailing: true }
    );
    const timeoutId = setTimeout(refresh, 0);
    window.addEventListener("resize", refresh);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", refresh);
    };
  }, []);
  return /* @__PURE__ */ jsx61($ToolbarContainer, { ref, children: /* @__PURE__ */ jsx61($Toolbar, { children: items.map((item, index) => /* @__PURE__ */ jsx61(
    ToolbarItem,
    {
      item
    },
    typeof item === "string" ? index : item.title
  )) }) });
}

// src/toolbar-plugin/render-editable/index.tsx
import { jsx as jsx62, jsxs as jsxs31 } from "react/jsx-runtime";
function renderEditable({ attributes, Editable: Editable3 }) {
  const outerContainerRef = useRef12(null);
  const editor = useSlateStatic21();
  const focused = useFocused();
  const onClickOuterContainer = useCallback15(
    (e) => {
      if (e.target !== e.currentTarget)
        return;
      Transforms43.select(editor, Editor60.end(editor, []));
      ReactEditor16.focus(editor);
    },
    [editor]
  );
  return /* @__PURE__ */ jsx62(Layers, { children: /* @__PURE__ */ jsxs31(
    $OuterContainer,
    {
      ref: outerContainerRef,
      className: clsx10({ "--focused": focused }),
      style: {
        height: editor.toolbar.height,
        minHeight: editor.toolbar.minHeight,
        maxHeight: editor.toolbar.maxHeight
      },
      onClick: onClickOuterContainer,
      children: [
        /* @__PURE__ */ jsx62(Toolbar, {}),
        /* @__PURE__ */ jsx62(
          Editable3,
          {
            as: $Editable,
            ...attributes,
            style: { overflowY: "auto" }
          }
        )
      ]
    }
  ) });
}

// src/toolbar-plugin/index.tsx
var ToolbarPlugin = createPlugin(
  (editor, options) => {
    editor.toolbar = {
      height: options.toolbar?.height,
      minHeight: options.toolbar?.minHeight,
      maxHeight: options.toolbar?.maxHeight,
      showUploadButtons: options.toolbar?.showUploadButtons ?? true
    };
    return {
      name: "toolbar",
      editor: {},
      renderEditable,
      editableProps: {}
    };
  }
);

// src/trailing-block-plugin/index.tsx
import { Editor as Editor61, Node as Node13, Path as Path15, Transforms as Transforms44 } from "slate";
var TrailingBlockPlugin = createPlugin(
  (editor) => {
    editor.allowTrailingBlock = true;
    return {
      name: "trailing-block",
      editor: {
        normalizeNode: (entry) => {
          if (!Editor61.isEditor(entry[0]))
            return false;
          const lastPath = [editor.children.length - 1];
          const lastElement = Node13.child(
            editor,
            editor.children.length - 1
          );
          if (Editor61.hasBlocks(editor, lastElement) || Editor61.isVoid(editor, lastElement)) {
            Transforms44.insertNodes(
              editor,
              { type: "paragraph", children: [{ text: "" }] },
              {
                at: Path15.next(lastPath)
              }
            );
          }
          return true;
        }
      }
    };
  }
);

// src/paste-markdown-plugin/methods/index.ts
import { Transforms as Transforms45 } from "slate";
function pasteMarkdown(editor, markdown) {
  const escapedMarkdown = escapeUrlSlashes(markdown);
  const fragment = parse(escapedMarkdown);
  Transforms45.insertNodes(editor, fragment);
}
function createPasteMarkdownMethods(editor) {
  return {
    pasteMarkdown: curryOne(pasteMarkdown, editor)
  };
}

// src/paste-markdown-plugin/index.tsx
var PasteMarkdownPlugin = createPlugin(
  (editor) => {
    editor.pasteMarkdown = createPasteMarkdownMethods(editor);
    return {
      name: "paste-markdown",
      editor: {},
      editableProps: {
        onPaste(e) {
          const { types } = e.clipboardData;
          if (types.length !== 1 || types[0] !== "text/plain") {
            return false;
          }
          const markdown = e.clipboardData.getData("text/plain");
          editor.pasteMarkdown.pasteMarkdown(markdown);
          stopEvent(e);
          return true;
        }
      }
    };
  }
);

// src/placeholder-plugin/index.tsx
import { jsx as jsx63 } from "react/jsx-runtime";
function renderPlaceholder(props) {
  const nextAttributes = {
    ...props.attributes,
    style: {
      ...props.attributes.style,
      width: void 0,
      maxWidth: void 0
    }
  };
  return /* @__PURE__ */ jsx63("span", { ...nextAttributes, children: props.children });
}
var PlaceholderPlugin = createPlugin(
  (editor, _options, { createPolicy }) => {
    editor.placeholder = {};
    return createPolicy({
      name: "placeholder",
      editableProps: {
        renderPlaceholder
      }
    });
  }
);

// src/entry/plugins.ts
var plugins = [
  PasteMarkdownPlugin,
  ConvertElementPlugin,
  AnchorPlugin,
  HeadingPlugin,
  MarksPlugin,
  InlineCodePlugin,
  BlockQuotePlugin,
  CodeBlockPlugin,
  TablePlugin,
  HorizontalRulePlugin,
  TrailingBlockPlugin,
  ListPlugin,
  AtomicDeletePlugin,
  NormalizeAfterDeletePlugin,
  CollapsibleParagraphPlugin,
  ThemePlugin,
  ToolbarPlugin,
  ImagePlugin,
  PlaceholderPlugin
];

// src/entry/SinkEditable.tsx
var Sink = createSink(plugins);
var { withSink, SinkEditable: SinkEditable2 } = Sink;

// src/entry/useEditor.tsx
import { useState as useState11 } from "react";
import { createEditor, Editor as Editor63, Transforms as Transforms46 } from "slate";
import { withHistory } from "slate-history";
import { withReact } from "slate-react";
function useEditor({
  authToken,
  height,
  minHeight,
  maxHeight
}) {
  const [editor] = useState11(() => {
    const editor2 = createEditor();
    const nextEditor = withSink(withReact(withHistory(editor2)), {
      toolbar: {
        height,
        minHeight,
        maxHeight,
        /**
         * If `authToken` is provided then show upload buttons.
         */
        showUploadButtons: !!authToken
      },
      image: {}
    });
    nextEditor.convertElement.addConvertElementType("paragraph");
    editor2.wysimark = {
      //   initialMarkdown,
      //   initialValue: parse(initialMarkdown),
    };
    editor2.getMarkdown = () => {
      return serialize(editor2.children);
    };
    editor2.setMarkdown = (markdown) => {
      const escapedMarkdown = escapeUrlSlashes(markdown);
      const documentValue = parse(escapedMarkdown);
      editor2.children = documentValue;
      editor2.selection = null;
      Transforms46.select(editor2, Editor63.start(editor2, [0]));
    };
    return nextEditor;
  });
  return editor;
}

// src/entry/index.tsx
import { jsx as jsx64, jsxs as jsxs32 } from "react/jsx-runtime";
function renderLeaf({ children, attributes }) {
  return /* @__PURE__ */ jsx64("span", { ...attributes, children });
}
function Editable2({
  editor,
  value,
  onChange,
  throttleInMs = 1e3,
  placeholder,
  className,
  style,
  onImageChange
}) {
  const [isRawMode, setIsRawMode] = useState12(false);
  const [rawText, setRawText] = useState12(value);
  const ignoreNextChangeRef = useRef13(false);
  const initialValueRef = useRef13(void 0);
  const prevValueRef = useRef13(void 0);
  const lastEmittedValueRef = useRef13(void 0);
  const onThrottledSlateChange = useCallback16(
    throttle3(
      () => {
        const markdown = serialize(editor.children);
        editor.wysimark.prevValue = {
          markdown,
          children: editor.children
        };
        lastEmittedValueRef.current = markdown;
        onChange(markdown);
      },
      throttleInMs,
      { leading: false, trailing: true }
    ),
    [editor, onChange, throttleInMs]
  );
  const onSlateChange = useCallback16(
    (nextValue) => {
      if (ignoreNextChangeRef.current) {
        ignoreNextChangeRef.current = false;
        prevValueRef.current = nextValue;
        return;
      }
      if (prevValueRef.current === nextValue) {
        return;
      }
      prevValueRef.current = nextValue;
      onThrottledSlateChange();
    },
    [onThrottledSlateChange]
  );
  if (editor.wysimark.prevValue == null || initialValueRef.current == null) {
    ignoreNextChangeRef.current = true;
    const valueToProcess = isRawMode ? value : escapeUrlSlashes(value);
    const children = parse(valueToProcess);
    editor.children = children;
    prevValueRef.current = initialValueRef.current = children;
    editor.wysimark.prevValue = {
      markdown: value,
      // Store the original unescaped value
      children
    };
    lastEmittedValueRef.current = value;
  } else {
    if (isRawMode) {
      editor.wysimark.prevValue.markdown = value;
      lastEmittedValueRef.current = value;
    } else {
      const diffFromPrevValue = value !== editor.wysimark.prevValue.markdown;
      const diffFromLastEmitted = value !== lastEmittedValueRef.current;
      if (diffFromPrevValue && diffFromLastEmitted) {
        ignoreNextChangeRef.current = true;
        const valueToProcess = escapeUrlSlashes(value);
        const documentValue = parse(valueToProcess);
        editor.children = documentValue;
        editor.selection = null;
        Transforms47.select(editor, Editor64.start(editor, [0]));
      }
    }
  }
  const onSinkeEditableMouseDown = useCallback16(() => {
    if (navigator.userAgent.toLowerCase().includes("firefox")) {
      ReactEditor18.focus(editor);
    }
  }, [editor]);
  const onBlur = useCallback16(() => {
    onThrottledSlateChange.flush();
  }, [onThrottledSlateChange]);
  const handleRawTextChange = (e) => {
    const newText = e.target.value;
    setRawText(newText);
    onChange(newText);
  };
  const applyRawTextToEditor = useCallback16(() => {
    if (rawText !== editor.getMarkdown()) {
      editor.setMarkdown(rawText);
    }
  }, [editor, rawText]);
  const updateRawTextFromEditor = useCallback16(() => {
    setRawText(value);
  }, [value]);
  const handleRawModeToggle = useCallback16(() => {
    if (isRawMode) {
      applyRawTextToEditor();
    } else {
      updateRawTextFromEditor();
    }
    setIsRawMode(!isRawMode);
  }, [isRawMode, applyRawTextToEditor, updateRawTextFromEditor]);
  editor.wysimark.isRawMode = isRawMode;
  editor.wysimark.toggleRawMode = handleRawModeToggle;
  editor.wysimark.onImageChange = onImageChange;
  return /* @__PURE__ */ jsxs32("div", { style: { position: "relative" }, children: [
    isRawMode && /* @__PURE__ */ jsx64("div", { style: { position: "absolute", top: "5px", right: "25px", zIndex: 10 }, children: /* @__PURE__ */ jsx64(
      "div",
      {
        onClick: handleRawModeToggle,
        style: {
          background: "none",
          border: "1px solid #4a90e2",
          cursor: "pointer",
          padding: "6px",
          borderRadius: "4px",
          backgroundColor: "rgba(74, 144, 226, 0.1)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease-in-out",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        title: t("switchToVisualEditor"),
        role: "button",
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleRawModeToggle();
            e.preventDefault();
          }
        },
        children: /* @__PURE__ */ jsx64("span", { style: { color: "#4a90e2", fontSize: "1.25em" }, children: /* @__PURE__ */ jsx64(VisualEditor, {}) })
      }
    ) }),
    /* @__PURE__ */ jsx64("div", { style: { display: isRawMode ? "block" : "none", textAlign: "center" }, children: /* @__PURE__ */ jsx64(
      "textarea",
      {
        value: unescapeUrlSlashes(rawText).replace(/&nbsp;/g, ""),
        onChange: handleRawTextChange,
        placeholder,
        className,
        style: {
          width: "calc(100% - 60px)",
          /* Full width minus 200px on each side */
          margin: "0 auto",
          /* Center the textarea */
          minHeight: "200px",
          padding: "20px",
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#333",
          lineHeight: "1.5",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "4px",
          ...style
        }
      }
    ) }),
    /* @__PURE__ */ jsx64("div", { style: { display: isRawMode ? "none" : "block" }, children: /* @__PURE__ */ jsx64(
      Slate2,
      {
        editor,
        initialValue: initialValueRef.current ?? editor.children,
        onChange: onSlateChange,
        children: /* @__PURE__ */ jsx64(
          SinkEditable2,
          {
            renderLeaf,
            onMouseDown: onSinkeEditableMouseDown,
            onBlur,
            placeholder,
            className,
            style
          }
        )
      }
    ) })
  ] });
}

// src/index.tsx
import { jsx as jsx65 } from "react/jsx-runtime";
function StandaloneEditor({
  standaloneOptions: { onChange, placeholder, className, ...options },
  standaloneMethodsRef
}) {
  const [markdown, setMarkdown] = useState13(options.initialMarkdown || "");
  const markdownRef = useRef14(markdown);
  const editor = useEditor(options);
  markdownRef.current = markdown;
  useImperativeHandle(
    standaloneMethodsRef,
    () => {
      return {
        getMarkdown() {
          return markdownRef.current;
        },
        setMarkdown(markdown2) {
          markdownRef.current = markdown2;
          setMarkdown(markdown2);
        }
      };
    },
    [markdownRef, setMarkdown]
  );
  const onChangeEditable = useCallback17(
    (markdown2) => {
      markdownRef.current = markdown2;
      setMarkdown(markdown2);
      onChange?.(markdown2);
    },
    [editor]
  );
  return /* @__PURE__ */ jsx65(
    Editable2,
    {
      editor,
      value: markdown,
      className: className || "",
      onChange: onChangeEditable,
      placeholder
    }
  );
}
function createWysimark(containerElement, options) {
  const standaloneMethodsRef = createRef();
  const root = createRoot(containerElement);
  root.render(
    /* @__PURE__ */ jsx65(
      StandaloneEditor,
      {
        standaloneMethodsRef,
        standaloneOptions: options
      }
    )
  );
  return {
    unmount() {
      try {
        root.unmount();
      } catch (e) {
      }
    },
    getMarkdown() {
      return standaloneMethodsRef.current?.getMarkdown() || "";
    },
    setMarkdown(markdown) {
      standaloneMethodsRef.current?.setMarkdown(markdown);
    }
  };
}
export {
  Editable2 as Editable,
  createWysimark,
  useEditor
};
//# sourceMappingURL=index.mjs.map