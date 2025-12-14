# Wysimark Editor for Obsidian

Obsidian用のモダンなWYSIWYG Markdownエディタプラグインです。リッチテキストインターフェースでノートを編集しながら、純粋なMarkdownを保持します。

![Screenshot](screenshot.png)

## 機能

### リッチテキスト編集

Markdownファイルを視覚的に編集できます。エディタはMarkdownとリッチテキスト形式を自動的に変換します。

### テキスト書式

- **太字** (`Ctrl/Cmd + B`)
- *斜体* (`Ctrl/Cmd + I`)
- ~~取り消し線~~ (`Ctrl/Cmd + K`)
- `インラインコード` (`Ctrl/Cmd + J`)
- <u>下線</u> (`Ctrl/Cmd + U`)

### 見出し

- 見出し1 (`Ctrl/Cmd + Alt + 1`)
- 見出し2 (`Ctrl/Cmd + Alt + 2`)
- 見出し3 (`Ctrl/Cmd + Alt + 3`)
- 通常の段落 (`Ctrl/Cmd + Alt + 0`)

### リスト

- 箇条書き (`Ctrl/Cmd + Alt + 8`)
- 番号付きリスト (`Ctrl/Cmd + Alt + 7`)
- タスク/チェックリスト (`Ctrl/Cmd + Alt + 9`)
- インデント増加 (`Tab`)
- インデント減少 (`Shift + Tab`)

### ブロック要素

- 引用 (`Ctrl/Cmd + Alt + .`)
- シンタックスハイライト付きコードブロック

### 表

- ツールバーから表を挿入
- `Tab` / `Shift+Tab` でセル間を移動
- `Enter`: セル内で改行
- `Shift+Enter`: 次のセルに移動（最後のセルでは新しい行を追加）
- 最後のセルで `Tab`: 表を抜ける

### リンクと画像

- リンクを挿入 (`Ctrl/Cmd + K`) - テキストとツールチップも設定可能
- 既存のリンクを編集（URL、テキスト、ツールチップ）
- 選択したテキストが自動的にリンクテキストになります
- URLから画像を挿入
- ローカルファイルから画像を挿入（vaultに保存）

### その他の機能

- **フロントマターサポート**: ファイル先頭のYAMLフロントマター（プロパティ）は保持されますが、エディタには表示されません
- **自動保存**: 変更は1秒のデバウンスで自動保存されます
- **手動保存**: 保存ボタンで即座に保存できます

## インストール

### Obsidianコミュニティプラグインから（推奨）

1. Obsidianの設定を開く
2. コミュニティプラグインに移動し、セーフモードを無効にする
3. 「Browse」をクリックして「Wysimark Editor」を検索
4. インストールしてプラグインを有効にする

### 手動インストール

1. GitHubから最新リリースをダウンロード
2. ファイルをvaultの `.obsidian/plugins/wysimark-editor/` フォルダに展開
3. Obsidianを再読み込み
4. 設定 > コミュニティプラグインでプラグインを有効にする

## 使い方

1. プラグインを有効にすると、右サイドバーにWysimarkパネルが表示されます
2. vault内の任意のMarkdownファイルをクリックしてWysimarkエディタで開きます
3. ツールバーまたはキーボードショートカットを使用してコンテンツを編集します
4. 変更は自動的に保存されます

## 開発

### ビルドコマンド

```bash
# ウォッチ付き開発モード（変更時に自動再ビルド）
npm run dev

# TypeScript型チェックとミニファイ付きプロダクションビルド
npm run build
```

### 技術スタック

- **エディタ**: Wysimark (Slate.js + Reactベース)
- **UIフレームワーク**: React 19 + Emotion
- **ビルド**: esbuild

## クレジット

このプラグインは[Wysimark](https://github.com/portive/wysimark)を使用して構築されています。この素晴らしいオープンソースWYSIWYG Markdownエディタを作成・メンテナンスしてくださっている[@thesunny](https://github.com/thesunny)に感謝します。WysimarkはMITライセンスの下でライセンスされています。

## ライセンス

MIT

## 作者

takeshy
