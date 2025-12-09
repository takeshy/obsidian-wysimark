# Wysimark Editor for Obsidian

A modern WYSIWYG Markdown editor plugin for Obsidian. Edit your notes with a rich text interface while keeping pure Markdown.

![Screenshot](screenshot.png)

## Features

### Rich Text Editing

Edit your Markdown files visually with a familiar word processor-like interface. The editor automatically converts between Markdown and rich text format.

### Text Formatting

- **Bold** (`Ctrl/Cmd + B`)
- *Italic* (`Ctrl/Cmd + I`)
- ~~Strikethrough~~ (`Ctrl/Cmd + K`)
- `Inline Code` (`Ctrl/Cmd + J`)
- <u>Underline</u> (`Ctrl/Cmd + U`)

### Headings

- Heading 1 (`Ctrl/Cmd + Alt + 1`)
- Heading 2 (`Ctrl/Cmd + Alt + 2`)
- Heading 3 (`Ctrl/Cmd + Alt + 3`)
- Normal paragraph (`Ctrl/Cmd + Alt + 0`)

### Lists

- Bullet lists (`Ctrl/Cmd + Alt + 8`)
- Numbered lists (`Ctrl/Cmd + Alt + 7`)
- Task/Check lists (`Ctrl/Cmd + Alt + 9`)
- Increase indent (`Tab`)
- Decrease indent (`Shift + Tab`)

### Block Elements

- Block quotes (`Ctrl/Cmd + Alt + .`)
- Code blocks with syntax highlighting
- Tables

### Links and Images

- Insert links (`Ctrl/Cmd + K`)
- Insert images from URL
- Insert images from local files (saved to vault)

### Other Features

- **Frontmatter Support**: YAML frontmatter (properties) at the beginning of files is preserved but hidden from the editor
- **Auto-save**: Changes are automatically saved with a 1-second debounce
- **Manual save**: Click the save button for immediate saving

## Installation

### From Obsidian Community Plugins (Recommended)

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Wysimark Editor"
4. Install and enable the plugin

### Manual Installation

1. Download the latest release from GitHub
2. Extract the files to your vault's `.obsidian/plugins/wysimark-editor/` folder
3. Reload Obsidian
4. Enable the plugin in Settings > Community Plugins

## Usage

1. After enabling the plugin, a Wysimark panel will appear in the right sidebar
2. Click on any Markdown file in your vault to open it in the Wysimark editor
3. Edit your content using the toolbar or keyboard shortcuts
4. Changes are saved automatically

## Development

### Build Commands

```bash
# Development mode with watch (auto-rebuilds on changes)
npm run dev

# Production build with TypeScript type checking and minification
npm run build
```

### Technology Stack

- **Editor**: Wysimark (built on Slate.js + React)
- **UI Framework**: React 19 with Emotion for styling
- **Build**: esbuild

## Credits

This plugin is built using [Wysimark](https://github.com/portive/wysimark), an excellent open-source WYSIWYG Markdown editor. Special thanks to [@thesunny](https://github.com/thesunny) for creating and maintaining this fantastic library. Wysimark is licensed under the MIT License.

## License

MIT

## Author

takeshy
