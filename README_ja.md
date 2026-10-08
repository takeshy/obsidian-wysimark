# Wysimark Editor for Obsidian

Obsidian用のモダンなWYSIWYG Markdownエディタプラグインです。リッチテキストインターフェースでノートを編集しながら、純粋なMarkdownを保持します。

![Screenshot](screenshot.png)

## 機能

### リッチテキスト編集

Markdownファイルを視覚的に編集できます。エディタはMarkdownとリッチテキスト形式を自動的に変換します。

### Markdownの保存

内包エディターに `wysimark-lite 1.0.0` の保存処理の修正を反映しています。繰り返し保存しても、コード内URL、表の内容、改行、脚注、内部リンク、リスト項目内の段落・コードを保持します。編集用の補助段落は保存せず、空行は不可視文字ではなく通常の改行で保存します。表の区切りやリストのインデントは正規化されることがあります。

### テキスト書式

- **太字** (`Ctrl/Cmd + B`)
- *斜体* (`Ctrl/Cmd + I`)
- ~~取り消し線~~ (`Cmd + Option + K` / `Ctrl + Shift + K`)
- `インラインコード` (`Ctrl/Cmd + J`)
- <u>下線</u> (`Ctrl/Cmd + U`)

狭いサイドバーでも書式ボタンを表示し、カーソル位置や選択範囲で有効な書式を強調します。エディタにフォーカスがある間は、書式ショートカットがObsidianの通常コマンドより優先されます。

### 見出し

- 見出し1 (`Cmd + Option + 1` / `Ctrl + Shift + 1`)
- 見出し2 (`Cmd + Option + 2` / `Ctrl + Shift + 2`)
- 見出し3 (`Cmd + Option + 3` / `Ctrl + Shift + 3`)
- 通常の段落 (`Cmd + Option + 0` / `Ctrl + Shift + 0`)

### リスト

- 箇条書き (`Cmd + Option + 8` / `Ctrl + Shift + 8`)
- 番号付きリスト (`Cmd + Option + 7` / `Ctrl + Shift + 7`)
- タスク/チェックリスト (`Cmd + Option + 9` / `Ctrl + Shift + 9`)
- インデント増加 (`Tab`)
- インデント減少 (`Shift + Tab`)

### ブロック要素

- 引用 (`Cmd + Option + .` / `Ctrl + Shift + .`)
- シンタックスハイライト付きコードブロック（`Cmd/Ctrl + Shift + N`、同じキーで解除）
- HTMLブロック（iframe、動画埋め込みなど） - 読み取り専用ブロックとして表示され、生HTMLとして保持されます
- コールアウト（`> [!note]`、`> [!warning]` など）をアイコンと色付きで表示
- Mermaidのコードブロックをライブダイアグラムとしてプレビュー表示

![コールアウトとMermaidソースの編集](edit_callout_mermaid.png)

### 表

- ツールバーから表を挿入
- `Tab` / `Shift+Tab` でセル間を移動
- `Enter`: セル内で改行
- `Shift+Enter`: 次のセルに移動（最後のセルでは新しい行を追加）
- 最後のセルで `Tab`: 表を抜ける

### リンクと画像

- リンクを挿入 (`Cmd + Option + K` / `Ctrl + Shift + K`) - テキストとツールチップも設定可能
- 既存のリンクを編集（URL、テキスト、ツールチップ）
- 選択したテキストが自動的にリンクテキストになります
- URLから画像を挿入
- ローカルファイルから画像を挿入（vaultに保存）
- vault内の既存画像を検索可能なファイルピッカーから挿入

![vault内の画像を選択](link_vault.png)

### その他の機能

- **フロントマターサポート**: ファイル先頭のYAMLフロントマター（プロパティ）は保持されますが、エディタには表示されません
- **自動保存**: 変更は1秒のデバウンスで自動保存されます
- **取り込みボタン**: 📥 ボタンをクリックするとObsidianからファイルを再読み込みできます（外部でファイルが変更された場合に便利）

## インストール

### Obsidianコミュニティプラグインから（推奨）

1. Obsidianの設定を開く
2. コミュニティプラグインに移動し、セーフモードを無効にする
3. 「Browse」をクリックして「Wysimark Editor」を検索
4. インストールしてプラグインを有効にする

プラグインページ: https://community.obsidian.md/plugins/wysimark-editor

### 手動インストール

1. GitHubから最新リリースをダウンロード
2. ファイルをvaultの `.obsidian/plugins/wysimark-editor/` フォルダに展開
3. Obsidianを再読み込み
4. 設定 > コミュニティプラグインでプラグインを有効にする

## 使い方

1. 設定 > コミュニティプラグインで「Wysimark Editor」を有効にします（インストールだけでは有効になりません）
2. Markdownファイルを開き、左のリボンの鉛筆アイコン「Wysimark editor」をクリックすると、右サイドバーにエディタが表示されます。コマンドパレットの「Wysimark Editor: Toggle sidebar」からも開けます
3. ツールバーまたはキーボードショートカットを使用してコンテンツを編集します
4. 変更は自動的に保存されます

アイコンが見当たらない場合は、リボンの表示と、リボンの右クリックメニューで「Wysimark editor」が非表示になっていないか確認してください。

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
