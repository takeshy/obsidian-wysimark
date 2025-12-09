import * as react_jsx_runtime from 'react/jsx-runtime';
import * as slate from 'slate';
import { Descendant, Editor, Element as Element$1, BaseEditor, NodeEntry, BaseRange, Location, Path, Text, BaseText } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor, Editable as Editable$1 } from 'slate-react';
import { SetReturnType, SetOptional, UnionToIntersection, Simplify } from 'type-fest';
import react from 'react';
import { RenderElementProps, RenderLeafProps, RenderPlaceholderProps, EditableProps as EditableProps$1 } from 'slate-react/dist/components/editable';

type OnImageChangeHandler$1 = (file: File) => Promise<string>;
type ImageDialogState = {
    url: string;
    alt: string;
    title: string;
    imageSource: "url" | "file";
    uploadedUrl: string;
};
type WysimarkEditor = {
    /**
     * Private state for the wysimark editor.
     */
    wysimark: {
        prevValue?: {
            markdown: string;
            children: Descendant[];
        };
        /**
         * Whether the editor is in Raw mode
         */
        isRawMode?: boolean;
        /**
         * Function to toggle Raw mode
         */
        toggleRawMode?: () => void;
        /**
         * Handler for image file upload
         */
        onImageChange?: OnImageChangeHandler$1;
        /**
         * Persisted state for the image dialog
         */
        imageDialogState?: ImageDialogState;
    };
    /**
     * Public methods for the wysimark editor.
     */
    getMarkdown: () => string;
    setMarkdown: (markdown: string) => void;
};

declare function useEditor({ authToken, height, minHeight, maxHeight, }: {
    authToken?: string;
    height?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
}): Editor & ReactEditor & WysimarkEditor;

/**
 * SinkEditor just adds a `sink` object where we drop all of our sink
 * related data on.
 */
type SinkEditor = {
    /**
     * a master Element is one that has one or more elements that are depedant
     * on it. For example, a `table` Element. For clarity, a `table-row` Element
     * is not considered a master Element. Only the top-most element is.
     *
     * One use for identify a master is for adding a block quote. We want the
     * block quote to always surround the master Element. A block-quote that
     * surrounded a table-row, for example, would not make sense.
     */
    isMaster: (node: Element$1) => boolean;
    /**
     * a slave Element is one that is dependant on another Element. For example,
     * `table-row`, `table-cell` and `table-cotent` elements are all considered
     * slave elements.
     *
     * At the time of writing, I haven't figured out a use case for a slave
     * element actually...
     */
    isSlave: (node: Element$1) => boolean;
    isStandalone: (node: Element$1) => boolean;
    sink: {
        plugins: BasePluginPolicy[];
    };
};
type FullSinkEditor = SinkEditor & BaseEditor & ReactEditor & HistoryEditor;

/**
 * On the editor, there are several methods that return void that are used to
 * override default editor behaviors.
 *
 * These are referred to as Overrideable core actions in the docs.
 *
 * - deleteBackward
 * - deleteForward
 * - deleteFragment
 * - insertBreak
 * - insertFragment
 * - insertNode
 * - insertText
 * - normalizeNode
 *
 * When there are plugins, Sink tries to find a plugin to handle the event and
 * if it cannot, uses the previously defined handler. For example, the user may
 * have specified `editor.insertBreak` on the `editor` earlier and that will
 * be called after all the plugins have been searched.
 *
 * We search through the plugins from the first to the last plugin.
 *
 * In a plugin, we specify the functions like we don on the editor but the
 * return value informs us how the plugin should proceed after. The return
 * value generally indicates whether the plugin has handled the event with one
 * special case:
 *
 * - `true`: If the return type is `true` then the plugin has indicated it has
 *   handled the event and no further processing is required. The handlers in
 *   all remaining plugins are skipped.
 *
 * - `false`: If the return type is `false` then the plugin has indicated it has
 *   not handled the event and will continue through the rest of the plugins
 *   looking for a plugin to handle the event.
 *
 * - `() => void`: If the return tyep is a function, the plugin has indicated
 *   it has not handled the event, but that it would like to register another
 *   function that should execute after the actual event handler has been
 *   executed. In particular, this is used when in certain situations we may
 *   want a normalizer to execute after the event handler has triggered. This
 *   is used in the `normalize-after-delete-plugin` for example.
 *
 * NOTE:
 *
 * This seems like an unusual specification at first glance and a purist might
 * argue, this could be handled more succinctly with a `next` function passed
 * in as the final argument.
 *
 * Here's why I elected to go this route but it boils down to the fact that
 * `next` functions make the function difficult to reason about.
 *
 * - 99% of the true, we want to indicate whether we handled the function or
 *   not and for that use case, true/false is simple to understand and natural.
 *   In the case where we need something to happen after, returning a function
 *   is unusual, but still easy to reason about. Also, the exclusivity of
 *   the function return is nice in that it assumes that the event wasn't
 *   handled, and of course, the function return would only ever be used if the
 *   function indeed wasn't handled. For if it was handled, there would be no
 *   need to have the after function because that could just be in the original
 *   function handler.
 *
 * - To use this, you have to build nested contexts that are always hard to
 *   reason about because you are passing a set of contexts from inner child
 *   to outer parent. This created difficult to comprehend complexity in the
 *   old Slate plugins architecture and is probably why it was abandoned.
 *
 * - It's also harder to type properly and to reason about it. The argument
 *   list changes in length depending on the function; furthermore, in some
 *   cases it is natural to ignore the arguments but we'd have to accept blank
 *   arguments that are unused to access the `next` function.
 *
 * - It's hard to debug. The plugin system as it currently is designed to
 *   execute linearly, instead of in a nested fashion. This makes it easy to
 *   add debug code, and know what happens before and after each step.
 */
type VoidActionReturn = boolean | (() => void);

type RenderEditableProps = {
    attributes: EditableProps$1;
    Editable: typeof Editable$1;
};
type RenderEditable = (props: RenderEditableProps) => react.ReactElement;
/**
 * The return type of the BasePluginFn which specifies how the Plugin is
 * supposed to behave.
 */
type BasePluginPolicy = {
    name: string;
    editor?: {
        isInline?: (element: Element) => boolean | void;
        isVoid?: (element: Element) => boolean | void;
        isMaster?: (element: Element) => boolean | void;
        isSlave?: (element: Element) => boolean | void;
        isStandalone?: (element: Element) => boolean | void;
        deleteBackward?: (unit: "character" | "word" | "line" | "block") => VoidActionReturn;
        deleteForward?: (unit: "character" | "word" | "line" | "block") => VoidActionReturn;
        deleteFragment?: () => VoidActionReturn;
        insertBreak?: () => VoidActionReturn;
        insertFragment?: (fragment: Node[]) => VoidActionReturn;
        insertNode?: (node: Node) => VoidActionReturn;
        insertText?: (text: string) => VoidActionReturn;
        normalizeNode?: (entry: NodeEntry) => VoidActionReturn;
    };
    renderEditable?: RenderEditable;
    editableProps?: {
        decorate?: ((entry: NodeEntry) => BaseRange[]) | undefined;
        renderElement?: (props: RenderElementProps) => react.ReactElement | undefined;
        renderLeaf?: (props: RenderLeafProps) => react.ReactElement | undefined;
        renderPlaceholder?: (props: RenderPlaceholderProps) => react.ReactElement;
        onKeyDown?: EditableVoidToBooleanHandlerType<"onKeyDown">;
        onKeyUp?: EditableVoidToBooleanHandlerType<"onKeyDown">;
        onPaste?: EditableVoidToBooleanHandlerType<"onPaste">;
        onDrop?: EditableVoidToBooleanHandlerType<"onDrop">;
    };
};
type EditableVoidToBooleanHandlerType<K extends keyof EditableProps$1> = SetReturnType<NonNullable<EditableProps$1[K]>, boolean>;

/**
 * IMPORTANT!
 *
 * NEVER!
 *
 * refer to a type that is defined in the `slate` package. This is because
 * any reference to a Slate type will cause a circular reference type error that
 * is very hard to track down.
 *
 * NOTE: This kind of happens in that `Element` will often have a reference to
 * `Descendant` but it looks like this is okay; however, let's not tempt fate
 * by only using it where the definition is absolutely necessary.
 *
 * ALWAYS!
 *
 * Be explicity about return types. If they are inferred through the return
 * type, because we need to provide `Editor` as an argument in certain cases,
 * we don't want to accidentally have `Editor` be provided as a return type
 * or this will create the circular reference.
 */
type BasePluginSchema = {
    Name: string;
    Options: Record<string, unknown>;
    Editor: Record<string, unknown>;
    Element: {
        type: string;
    };
    Text: Record<string, unknown>;
};
/**
 * These are the PluginTypes that are accepted as inputs into `createPlugin`
 * which has the same basic signature as `BasePluginTypes` but some of the
 * types are optional.
 *
 * These `InputPluginTypes` need to have their optional types filled in with
 * defaults before they can be used.
 *
 * See `NormalizeInputPluginTypes`
 */
type InputPluginSchema = SetOptional<BasePluginSchema, "Options" | "Editor" | "Element" | "Text">;
/**
 * Takes an `InputPluginSchema` (that has some optional types) and turns them
 * into a regular PluginTypes with any missing types filled in with defaults.
 */
type NormalizeInputPluginSchema<T extends InputPluginSchema> = {
    Name: T["Name"];
    Options: T["Options"] extends object ? T["Options"] : {};
    Editor: T["Editor"] extends object ? T["Editor"] : {};
    Element: T["Element"] extends object ? T["Element"] : never;
    Text: T["Text"] extends object ? T["Text"] : {};
};

/**
 * Shape of a PluginFn (Plugin Function).
 */
type BasePluginFn = (editor: FullSinkEditor, options: {}, helpers: {
    createPolicy: (value: unknown) => unknown;
}) => BasePluginPolicy;

/**
 * IMPORTANT!
 *
 * NEVER!
 *
 * refer to a type that is defined in the `slate` package. This is because
 * any reference to a Slate type will cause a circular reference type error that
 * is very hard to track down.
 *
 * NOTE: This kind of happens in that `Element` will often have a reference to
 * `Descendant` but it looks like this is okay; however, let's not tempt fate
 * by only using it where the definition is absolutely necessary.
 *
 * ALWAYS!
 *
 * Be explicity about return types. If they are inferred through the return
 * type, because we need to provide `Editor` as an argument in certain cases,
 * we don't want to accidentally have `Editor` be provided as a return type
 * or this will create the circular reference.
 */

/**
 * When a Plugin is created using the `createPlugin` method, it returns a
 * Plugin.
 */
type BasePlugin = {
    fn: BasePluginFn;
    __types__: BasePluginSchema;
};
/**
 * When a Plugin is created using `createPlugin` we must
 */
type TypedPlugin<T extends InputPluginSchema> = {
    fn: BasePluginFn;
    __types__: NormalizeInputPluginSchema<T>;
};

type ExtractCustomTypes<TA extends Array<BasePlugin>> = 
/**
 * This code takes an array of types and merges them together into a union.
 */
TA extends Array<{
    __types__: infer U;
}> ? {
    Editor: SinkEditor & BaseEditor & ReactEditor & HistoryEditor & UnionToIntersection<U extends {
        Editor: infer E;
    } ? E : never>;
    Element: U extends {
        Element: infer E;
    } ? E : never;
    Text: Simplify<UnionToIntersection<U extends {
        Text: infer T;
    } ? T : never>>;
    Options: Simplify<UnionToIntersection<U extends {
        Options: infer T;
    } ? T : never>>;
} : never;

/**
 * Defines a value you'd find in a function's parameters as a replacement for
 * `at`. The benefit of using `BetterAt` is that it allows you to search
 * using an `Element`.
 */
type BetterAt = Location | Element$1 | null;

/**
 * The TargetElement can be specified either as the actual value or as a
 * function that takes a srcElement and returns the targetElement.
 */
type TargetElement<T extends Element$1 = Element$1> = Omit<T, "children"> | ((srcElement: Element$1) => Omit<T, "children">);

type PlaceholderEditor = {
    placeholder: {};
};
type PlaceholderPluginCustomTypes = {
    Name: "placeholder";
    Editor: PlaceholderEditor;
};

declare function createImageMethods(editor: Editor): {
    noop: () => void;
    insertImageFromUrl: (url: string, alt?: string | undefined, title?: string | undefined) => void;
};

type ImageSize = {
    width: number;
    height: number;
};
type ImageMethods = ReturnType<typeof createImageMethods>;
type ImagePluginConfig = {
    /**
     * When an image is uploaded, the plugin needs to decide whether the image
     * should be an inline image (like an icon that displays within a line of
     * text) or a block image (like a photo that appears as its own block).
     *
     * This setting is the maximum size of an image for it to be defaulted to an
     * inline image.
     *
     * NOTE:
     *
     * The user can convert an image from one image type to the other manually.
     */
    maxInitialInlineImageSize: ImageSize;
    /**
     * When an image is first uploaded, it may come in at a large size but for
     * some applications, you don't want the image to overwhelm the page,
     * like when the editor is visually a small size.
     *
     * This specifies the maximum initial size when an image is first uploaded
     * to the page. The user can resize to a larger size.
     *
     * If the value is null, the image will be displayed at full size.
     *
     * NOTE:
     *
     * This is the displayed image width. On retina displays, the actualy image
     * file delivered to the browser may be a multiple of the provided value.
     */
    maxInitialImageSize: ImageSize | null;
    /**
     * When an image is displayed at full size, you may still want to limit the
     * size of the image file.
     *
     * NOTE:
     *
     * This is the maximum visual image
     */
    maxImageSize: ImageSize;
    imageBlockPresets: ImageSizePreset[];
    imageInlinePresets: ImageSizePreset[];
};
type ImagePluginOptions = {
    image: Partial<ImagePluginConfig>;
};
type ImageEditor = {
    image: ImageMethods & ImagePluginConfig;
};
type ImageSharedElement = {
    /**
     * The `url` represents either
     *
     * - a `hashUrl` that begins with a `#` during the upload process which
     *   represents a unique id reference to a Zustand store where the actual
     *   information about the upload is kept.
     * - The actual `url` of the uploaded file. When the file is saved, the
     *   `hashUrl` will be converted to the actual `url` of the file.
     */
    url: string;
    title?: string;
    alt?: string;
    bytes?: number;
    /**
     * If the `maxWidth` and `maxHeight` are present, it indicates that the image
     * is resizable.
     *
     * If they are not present, it indicates that the `width` and `height` should
     * be used, but they cannot be resized.
     *
     * If the `width` and `height` are also not present, it indicates we are not
     * aware of the current size of the image, so just display it.
     */
    srcWidth?: number;
    srcHeight?: number;
    width?: number;
    height?: number;
    children: Descendant[];
};
/**
 * Default for larger images, over 48px
 *
 * Larger images can be converted to inline images though.
 */
type ImageBlockElement = {
    type: "image-block";
} & ImageSharedElement;
/**
 * Default for smaller images, 48px and less
 *
 * Smaller images can be converted to block images though.
 */
type ImagePluginCustomTypes = {
    Name: "image";
    Editor: ImageEditor;
    Element: ImageBlockElement;
    Options: ImagePluginOptions;
};
/**
 * A preset is defined either as a bound or as a scale:
 *
 * - bounds: The image will be placed within the bounds.
 * - scale: The image will be scaled to the given `scale` value. The max
 *   value should be `1`.
 */
type ImageSizePreset = {
    name: string;
    title: string;
    type: "bounds";
    width: number;
    height: number;
} | {
    name: string;
    title: string;
    type: "scale";
    scale: number;
};

type ToolbarEditor = {
    toolbar: {
        height?: string | number;
        minHeight?: string | number;
        maxHeight?: string | number;
        showUploadButtons?: boolean;
    };
};
type ToolbarOptions = {
    toolbar: {
        height?: string | number;
        minHeight?: string | number;
        maxHeight?: string | number;
        showUploadButtons?: boolean;
    };
};
type ToolbarPluginCustomTypes = {
    Name: "toolbar";
    Editor: ToolbarEditor;
    Options: ToolbarOptions;
};

type ThemeEditor = {
    theme: true;
};
type ThemePluginCustomTypes = {
    Name: "theme";
    Editor: ThemeEditor;
};

type CollapsibleParagraphEditor = {
    collapsibleParagraph: {
        convertParagraph: () => void;
    };
};
type ParagraphElement = {
    type: "paragraph";
    __collapsible?: true;
    children: Descendant[];
};
type CollapsibleParagraphPluginCustomTypes = {
    Name: "collapsible-paragraph";
    Editor: CollapsibleParagraphEditor;
    Element: ParagraphElement;
};

type NormalizeAfterDeleteEditor = {
    normalizeAfterDelete: true;
};
type NormalizeAfterDeletePluginCustomTypes = {
    Name: "normalize-after-delete";
    Editor: NormalizeAfterDeleteEditor;
};

type AtomicDeleteEditor = {
    atomicDelete: true;
};
type AtomicDeletePluginCustomTypes = {
    Name: "atomic-delete";
    Editor: AtomicDeleteEditor;
};

declare function createListMethods(editor: Editor): {
    indent: () => boolean;
    outdent: () => boolean;
    convertUnorderedList: (allowToggle: boolean) => void;
    convertOrderedList: (allowToggle: boolean) => void;
    convertTaskList: (allowToggle: boolean) => void;
    insertBreak: () => boolean;
    toggleTaskListItem: (args_0?: {
        at?: BetterAt | undefined;
    } | undefined) => false | undefined;
    getListDepth: () => number;
    canIncreaseDepth: () => boolean;
    canDecreaseDepth: () => boolean;
    increaseDepth: () => void;
    decreaseDepth: () => void;
};

/**
 * List Editor
 */
type ListEditor = {
    list: ReturnType<typeof createListMethods>;
};
/**
 * Ordered List Item Element
 */
type OrderedListItemElement = {
    type: "ordered-list-item";
    depth: number;
    __firstAtDepth?: boolean;
    children: Descendant[];
};
/**
 * Unordered List Item Element
 */
type UnorderedListItemElement = {
    type: "unordered-list-item";
    depth: number;
    __firstAtDepth?: boolean;
    children: Descendant[];
};
/**
 * Checkable Task List Item Element
 */
type TaskListItemElement = {
    type: "task-list-item";
    depth: number;
    __firstAtDepth?: boolean;
    checked: boolean;
    children: Descendant[];
};
/**
 * List Plugins Custom Types
 */
type ListPluginCustomTypes = {
    Name: "list";
    Editor: ListEditor;
    Element: OrderedListItemElement | UnorderedListItemElement | TaskListItemElement;
};

declare function createHorizontalRuleMethods(editor: Editor): {
    insertHorizontalRule: () => boolean;
};

type HorizontalRuleMethods = ReturnType<typeof createHorizontalRuleMethods>;
type HorizontalRuleEditor = {
    horizontalRule: HorizontalRuleMethods;
};
type HorizontalRuleElement = {
    type: "horizontal-rule";
    children: [{
        text: "";
    }];
};
type HorizontalRulePluginCustomTypes = {
    Name: "horizontal-rule";
    Editor: HorizontalRuleEditor;
    Element: HorizontalRuleElement;
};

/**
 * Alignment of Table Columns
 */
type TableColumnAlign = "left" | "center" | "right";
/**
 * Table Column values
 */
type TableColumn = {
    align: TableColumnAlign;
};
/**
 * Table Element
 */
type TableElement = {
    type: "table";
    columns: TableColumn[];
    children: TableRowElement[];
};
/**
 * Table Row Element
 */
type TableRowElement = {
    type: "table-row";
    children: TableCellElement[];
};
/**
 * Table Cell Element
 *
 * The children of a `TdElement` is exactly one `ParagraphElement`.
 *
 * This is a good choice for Slate because copying and pasting a range of
 * elements will split the lowest child element by default. If the child of
 * a `TdElement` is a leaf, then we split the `TdElement` which is never what
 * we want.
 *
 * Instead, by having a lower level element, the `ParagraphElement`, we allow
 * that to be split.
 *
 * But of course, insertion means we have many child elements in the `TdElement`
 * but these are easier to fix using normalization. We can keep iterating
 * through normalizations until we end up with a single Paragraph.
 */
type TableCellElement = {
    type: "table-cell";
    x?: number;
    y?: number;
    children: TableContentElement[];
};
type TableContentElement = {
    type: "table-content";
    children: Descendant[];
};

/**
 * The TableInfo object that includes quick access information starting from a
 * cell in a table including information about the row and the table.
 *
 * NOTE:
 *
 * This is flat and not nested because it makes destructuring easier, for
 * example, in the table methods.
 */
type TableInfo = {
    tableElement: TableElement;
    tablePath: Path;
    tableColumns: TableColumn[];
    rowElement: TableRowElement;
    rowPath: Path;
    rowIndex: number;
    rowCount: number;
    cellElement: TableCellElement;
    cellPath: Path;
    cellIndex: number;
    cellCount: number;
};

declare function createAnchorMethods(editor: Editor): {
    insertLink: (args_0: string, args_1?: string | undefined, args_2?: {
        select?: boolean | undefined;
    } | undefined) => void;
    removeLink: (args_0: {
        at?: BetterAt | undefined;
    }) => boolean;
    editLink: (args_0: {
        href: string;
        title?: string | undefined;
    }, args_1: {
        at?: BetterAt | undefined;
    }) => boolean;
};

type AnchorMethods = ReturnType<typeof createAnchorMethods>;
type AnchorEditor = {
    anchor: AnchorMethods;
};
type AnchorElement = {
    type: "anchor";
    href: string;
    target?: string;
    title?: string;
    children: Descendant[];
};
type AnchorPluginCustomTypes = {
    Name: "anchor";
    Editor: AnchorEditor;
    Element: AnchorElement;
};

declare function createHeadingMethods(editor: Editor): {
    convertHeading: (level: 1 | 2 | 3 | 4 | 5 | 6, allowToggle: boolean) => void;
    isHeadingActive: (level: 1 | 2 | 3 | 4 | 5 | 6) => boolean;
};

type HeadingEditor = {
    heading: ReturnType<typeof createHeadingMethods>;
};
type HeadingElement = {
    type: "heading";
    /**
     * NOTE:
     *
     * Don't extract these into a new type. It's easier to just repeat this and
     * there's less indirection.
     */
    level: 1 | 2 | 3 | 4 | 5 | 6;
    children: Descendant[];
};
type HeadingPluginCustomTypes = {
    Name: "heading";
    Editor: HeadingEditor;
    Element: HeadingElement;
};

type BlockQuoteEditor = {
    supportsBlockQuote: true;
    blockQuotePlugin: {
        indent: () => void;
        outdent: () => void;
        isActive: () => boolean;
        increaseDepth: () => void;
        decreaseDepth: () => void;
        canIncreaseDepth: () => boolean;
        canDecreaseDepth: () => boolean;
    };
};
type BlockQuoteElement = {
    type: "block-quote";
    children: Descendant[];
};
type BlockQuotePluginCustomTypes = {
    Name: "block-quote";
    Editor: BlockQuoteEditor;
    Element: BlockQuoteElement;
};

declare function createCodeBlockMethods(editor: Editor): {
    createCodeBlock: (args_0: {
        language: BuiltInLanguage;
    }) => void;
    setCodeBlockLanguage: (language: BuiltInLanguage, options?: {
        at?: BetterAt | undefined;
    } | undefined) => boolean;
};

type CodeBlockMethods = ReturnType<typeof createCodeBlockMethods>;
type BuiltInLanguage = "text" | "html" | "svg" | "markup" | "css" | "javascript" | "js" | "java" | "c" | "clike";
type CodeBlockEditor = {
    codeBlock: CodeBlockMethods;
};
/**
 * The code block element is the root element of a code block.
 */
type CodeBlockElement = {
    type: "code-block";
    /**
     * The language of the code block. Can accept any string because Markdown can
     * accept any string; however, the built-in Prism languages are defined in:
     * `BuiltInLanguage`
     */
    language: string;
    children: CodeBlockLineElement[];
};
type CodeBlockLineElement = {
    type: "code-block-line";
    children: Text[];
};
type CodeBlockPluginCustomTypes = {
    Name: "code-block";
    Editor: CodeBlockEditor;
    Element: CodeBlockElement | CodeBlockLineElement;
    Text: {
        text: string;
        prismToken?: string;
    };
};

declare function createTableMethods(editor: Editor): {
    getTableInfo: (args_0?: {
        at?: ImageBlockElement | ParagraphElement | OrderedListItemElement | UnorderedListItemElement | TaskListItemElement | HorizontalRuleElement | TableElement | TableRowElement | TableCellElement | TableContentElement | CodeBlockElement | CodeBlockLineElement | BlockQuoteElement | HeadingElement | AnchorElement | slate.Location | null | undefined;
    } | undefined) => TableInfo | undefined;
    insertTable: (args_0: number, args_1: number, args_2?: {
        at?: slate.Location | null | undefined;
    } | undefined) => boolean;
    insertColumn: (args_0?: {
        offset?: 0 | 1 | undefined;
        at?: BetterAt | undefined;
    } | undefined) => boolean;
    insertRow: (args_0?: {
        at?: BetterAt | undefined;
        offset?: 0 | 1 | undefined;
    } | undefined) => boolean;
    removeTable: () => boolean;
    removeColumn: (args_0?: {
        at?: BetterAt | undefined;
    } | undefined) => boolean | undefined;
    removeRow: (args_0?: {
        at?: BetterAt | undefined;
    } | undefined) => boolean;
    tabForward: () => boolean;
    tabBackward: () => boolean | undefined;
    selectCell: (args_0?: {
        at?: BetterAt | undefined;
    } | undefined) => boolean;
    down: () => boolean;
    up: () => boolean;
    setTableColumnAlign: (options: {
        align: "center" | "left" | "right";
    }) => boolean;
};

type TableEditor = {
    supportsTable: true;
    tablePlugin: ReturnType<typeof createTableMethods>;
};
type TablePluginCustomTypes = {
    Name: "table";
    Editor: TableEditor;
    Element: TableElement | TableRowElement | TableCellElement | TableContentElement;
};

type InlineCodeEditor = {
    inlineCode: {
        toggleInlineCode: () => void;
    };
};
type InlineCodeText = {
    text: string;
    code?: true;
};
type InlineCodePluginCustomTypes = {
    Name: "inline-code";
    Editor: InlineCodeEditor;
    Text: InlineCodeText;
};

declare function createMarksMethods(editor: Editor): {
    removeMarks: (args_0?: {
        at?: slate.Location | null | undefined;
    } | undefined) => void;
    toggleMark: (args_0: "bold" | "strike" | "text" | "prismToken" | "code" | "italic" | "underline", args_1?: "bold" | "strike" | "text" | "prismToken" | "code" | "italic" | "underline" | undefined, args_2?: {
        at?: slate.Location | null | undefined;
    } | undefined) => void;
    toggleBold: () => void;
    toggleItalic: () => void;
    toggleUnderline: () => void;
    toggleStrike: () => void;
};

type MarksEditor = {
    /**
     * IMPORTANT:
     *
     * This cannot be named `marks` because it conflicts with the `editor.marks`
     * built into the BaseEditor.j
     */
    marksPlugin: ReturnType<typeof createMarksMethods>;
    activeMarks?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strike?: boolean;
    };
};
type MarksText = {
    text: string;
    bold?: true;
    italic?: true;
    underline?: true;
    strike?: true;
};
type MarksPluginCustomTypes = {
    Name: "marks";
    Editor: MarksEditor;
    Text: MarksText;
};

/**
 * A type with generic for `convertElements` (below) to be used with the curry
 * method. TypeScript, unfortunately, cannot automatically curry generics for
 * us so we have to do it manually.
 */
type CurriedConvertElements = <T extends Element$1 = Element$1>(matchForToggle: (element: Element$1) => boolean, targetElement: TargetElement<T>, allowToggle: boolean) => void;

declare function createConvertElementMethods(editor: Editor): {
    convertElementTypes: string[];
    addConvertElementType: (type: "anchor" | "heading" | "block-quote" | "table" | "horizontal-rule" | "code-block" | "paragraph" | "image-block" | "ordered-list-item" | "unordered-list-item" | "task-list-item" | "table-row" | "table-cell" | "table-content" | "code-block-line" | ("anchor" | "heading" | "block-quote" | "table" | "horizontal-rule" | "code-block" | "paragraph" | "image-block" | "ordered-list-item" | "unordered-list-item" | "task-list-item" | "table-row" | "table-cell" | "table-content" | "code-block-line")[]) => void;
    isConvertibleElement: (element: ImageBlockElement | ParagraphElement | OrderedListItemElement | UnorderedListItemElement | TaskListItemElement | HorizontalRuleElement | TableElement | TableRowElement | TableCellElement | TableContentElement | CodeBlockElement | CodeBlockLineElement | BlockQuoteElement | HeadingElement | AnchorElement) => boolean;
    convertElements: CurriedConvertElements;
};

type ConvertElementEditor = {
    convertElement: ReturnType<typeof createConvertElementMethods>;
};
type ConvertElementPluginCustomTypes = {
    Name: "convert-element";
    Editor: ConvertElementEditor;
};

declare function createPasteMarkdownMethods(editor: Editor): {
    pasteMarkdown: (markdown: string) => void;
};

type PasteMarkdownMethods = ReturnType<typeof createPasteMarkdownMethods>;
type PasteMarkdownEditor = {
    pasteMarkdown: PasteMarkdownMethods;
};
type PasteMarkdownPluginCustomTypes = {
    Name: "paste-markdown";
    Editor: PasteMarkdownEditor;
};

declare const plugins: (TypedPlugin<PasteMarkdownPluginCustomTypes> | TypedPlugin<ConvertElementPluginCustomTypes> | TypedPlugin<AnchorPluginCustomTypes> | TypedPlugin<HeadingPluginCustomTypes> | TypedPlugin<MarksPluginCustomTypes> | TypedPlugin<InlineCodePluginCustomTypes> | TypedPlugin<BlockQuotePluginCustomTypes> | TypedPlugin<CodeBlockPluginCustomTypes> | TypedPlugin<TablePluginCustomTypes> | TypedPlugin<HorizontalRulePluginCustomTypes> | TypedPlugin<{
    Name: "trailing-block";
    Editor: {
        allowTrailingBlock: true;
    };
}> | TypedPlugin<ListPluginCustomTypes> | TypedPlugin<AtomicDeletePluginCustomTypes> | TypedPlugin<NormalizeAfterDeletePluginCustomTypes> | TypedPlugin<CollapsibleParagraphPluginCustomTypes> | TypedPlugin<ThemePluginCustomTypes> | TypedPlugin<ToolbarPluginCustomTypes> | TypedPlugin<ImagePluginCustomTypes> | TypedPlugin<PlaceholderPluginCustomTypes>)[];
type PluginTypes = ExtractCustomTypes<typeof plugins>;
type CustomEditor = PluginTypes["Editor"];
type CustomElement = PluginTypes["Element"];
type CustomText = PluginTypes["Text"];
declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor & CustomEditor & WysimarkEditor;
        Element: CustomElement;
        Text: BaseText & CustomText;
    }
}

type OnImageChangeHandler = (file: File) => Promise<string>;
type EditableProps = {
    editor: Editor;
    value: string;
    onChange: (markdown: string) => void;
    throttleInMs?: number;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    onImageChange?: OnImageChangeHandler;
};
declare function Editable({ editor, value, onChange, throttleInMs, placeholder, className, style, onImageChange, }: EditableProps): react_jsx_runtime.JSX.Element;

/**
 * The options passed into the standalone version of Wysimark.
 */
type StandaloneOptions = Parameters<typeof useEditor>[0] & {
    onChange?: (markdown: string) => void;
    placeholder?: string;
    initialMarkdown?: string;
    className?: string;
};
/**
 * The object returned by `createWysimark`
 */
type Wysimark = {
    unmount: () => void;
    getMarkdown: () => string;
    setMarkdown: (markdown: string) => void;
};
/**
 * The primary entry point for the standalone version of Wysimark.
 */
declare function createWysimark(containerElement: HTMLElement, options: StandaloneOptions): Wysimark;

export { Editable, OnImageChangeHandler, Wysimark, createWysimark, useEditor };
