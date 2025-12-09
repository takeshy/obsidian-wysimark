# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run dev` - Start development mode with watch (auto-rebuilds on changes)
- `npm run build` - Production build with TypeScript type checking and minification

## Architecture

This is an Obsidian plugin that provides a WYSIWYG Markdown editor using the Wysimark library.

### Key Components

- `src/main.ts` - Plugin entry point, exports the WysimarkPlugin class
- `src/plugin.ts` - Main plugin logic: registers the view, handles file changes, manages sidebar
- `src/WysimarkView.tsx` - React-based ItemView that renders the Wysimark editor
- `src/vendor/wysimark/` - Vendored Wysimark editor library (Slate-based rich text editor)

### How It Works

1. The plugin registers a custom view type (`wysimark-view`) in the right sidebar
2. When the active file changes to a Markdown file, the view loads and displays its content
3. The React component uses Wysimark's `useEditor` hook and `Editable` component
4. Changes auto-save with 1-second debounce; manual save available via button

### Technology Stack

- **Editor**: Wysimark (built on Slate.js + React)
- **UI Framework**: React 19 with Emotion for styling
- **Build**: esbuild (configured in `esbuild.config.mjs`)
- **Target**: CommonJS format, ES2018 target for Obsidian compatibility

### Obsidian API Integration

- External modules (`obsidian`, `electron`, CodeMirror packages) are excluded from bundle
- Plugin uses `ItemView` for the sidebar panel, `TFile` for file operations
- State persistence handled via `setState`/`getState` methods
