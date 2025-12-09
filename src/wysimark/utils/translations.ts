interface Translations {
  [key: string]: {
    bold: string;
    italic: string;
    strike: string;
    inlineCode: string;
    underline: string;
    increaseDepth: string;
    decreaseDepth: string;
    heading1: string;
    heading2: string;
    heading3: string;
    normal: string;
    paragraph: string;
    paragraphStyle: string;
    bulletList: string;
    numberedList: string;
    checkList: string;
    list: string;
    linkUrl: string;
    tooltipText: string;
    tooltipHint: string;
    apply: string;
    cancel: string;
    insertLink: string;
    quote: string;
    insertTable: string;
    insertImage: string;
    insertImageFromUrl: string;
    insert: string;
    format: string;
    imageUrlRequired: string;
    altText: string;
    title: string;
    imageDescription: string;
    imageTitle: string;
    switchToVisualEditor: string;
    switchToRawMarkdown: string;
    codeBlock: string;
    increaseQuoteDepth: string;
    register: string;
    imageSourceUrl: string;
    imageSourceFile: string;
    selectFile: string;
    uploading: string;
    saving: string;
    vaultPath: string;
    vaultPathHint: string;
  };
}

export const translations: Translations = {
  ja: {
    bold: "太字",
    italic: "斜体",
    strike: "取り消し線",
    inlineCode: "インラインコード",
    underline: "下線",
    increaseDepth: "階層を深くする",
    decreaseDepth: "階層を浅くする",
    heading1: "見出し1",
    heading2: "見出し2",
    heading3: "見出し3",
    normal: "標準",
    paragraph: "段落",
    paragraphStyle: "段落スタイル",
    bulletList: "箇条書き",
    numberedList: "番号付きリスト",
    checkList: "チェックリスト",
    list: "リスト",
    linkUrl: "リンクのURL",
    tooltipText: "ツールチップテキスト",
    tooltipHint: "マウスホバー時に表示されるツールチップ",
    apply: "適用",
    cancel: "キャンセル",
    insertLink: "リンク",
    quote: "引用",
    insertTable: "表",
    insertImage: "画像",
    insertImageFromUrl: "画像",
    insert: "挿入",
    format: "書式",
    imageUrlRequired: "画像URL（必須）：",
    altText: "代替テキスト：",
    title: "ツールチップ：",
    imageDescription: "画像の説明",
    imageTitle: "画像のツールチップ",
    switchToVisualEditor: "ビジュアルエディタに切り替え",
    switchToRawMarkdown: "マークダウン表示に切り替え",
    codeBlock: "コードブロック",
    increaseQuoteDepth: "引用を重ねる",
    register: "登録",
    imageSourceUrl: "URL",
    imageSourceFile: "ファイル",
    selectFile: "ファイルを選択",
    uploading: "アップロード中...",
    saving: "保存中...",
    vaultPath: "保存先パス：",
    vaultPathHint: "vault内の保存先パスを入力してください",
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
    uploading: "Uploading...",
    saving: "Saving...",
    vaultPath: "Save Path:",
    vaultPathHint: "Enter the path within the vault to save the file",
  },
};

export type TranslationKey = keyof Translations["en"];

const getLanguage = (): string => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.navigator) {
      return window.navigator.language.split("-")[0];
    }
  } catch {
    // Ignore any errors
  }
  // Default to 'en' in server environment
  return 'en';
};

export const t = (key: TranslationKey): string => {
  const lang = getLanguage();
  return translations[lang === "ja" ? "ja" : "en"][key];
};

export const r = (value: string): string => {
  const lang = getLanguage();
  // 値がvalueと一致するキーを取得
  const key = Object.keys(translations[lang === "ja" ? "ja" : "en"]).find(
    (k) => translations[lang === "ja" ? "ja" : "en"][k as TranslationKey] === value
  ) as TranslationKey;
  return key || "";
};
