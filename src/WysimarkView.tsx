import { ItemView, WorkspaceLeaf, TFile, normalizePath, Plugin } from 'obsidian';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Editable, useEditor, OnImageSaveHandler } from './wysimark/entry';

export const VIEW_TYPE_WYSIMARK = 'wysimark-view';

// Frontmatter regex: matches YAML frontmatter at the start of the file
const FRONTMATTER_REGEX = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/**
 * Extract frontmatter from markdown content
 * Returns the frontmatter (including delimiters) and the body separately
 */
function extractFrontmatter(content: string): { frontmatter: string; body: string } {
  const match = content.match(FRONTMATTER_REGEX);
  if (match) {
    return {
      frontmatter: match[0],
      body: content.slice(match[0].length),
    };
  }
  return {
    frontmatter: '',
    body: content,
  };
}

/**
 * Combine frontmatter and body back into full content
 */
function combineFrontmatter(frontmatter: string, body: string): string {
  if (!frontmatter) {
    return body;
  }
  return frontmatter + body;
}

// Empty state component when no file is selected
function EmptyState() {
  return (
    <div className="wysimark-empty-state">
      <div className="wysimark-empty-state-icon">📝</div>
      <div className="wysimark-empty-state-text">
        Open a Markdown file to edit
      </div>
      <div className="wysimark-empty-state-hint">
        Select a .md file from the file explorer
      </div>
    </div>
  );
}

// Header component showing current file
function FileHeader({ fileName, onReload }: { fileName: string; onReload: () => void }) {
  return (
    <div className="wysimark-header">
      <span className="wysimark-header-filename">{fileName}</span>
      <button className="wysimark-header-reload" onClick={onReload} title="Reload from Obsidian">
        📥
      </button>
    </div>
  );
}

// React component for the editor
function WysimarkEditorComponent({
  initialValue,
  onChange,
  fileName,
  onReload,
  onImageSave,
}: {
  initialValue: string;
  onChange: (markdown: string) => void;
  fileName: string;
  onReload: () => void;
  onImageSave?: OnImageSaveHandler;
}) {
  const editor = useEditor({});
  // Use initialValue only on mount, manage internally afterwards
  const [value] = React.useState(initialValue);

  const handleChange = React.useCallback((markdown: string) => {
    onChange(markdown);
  }, [onChange]);

  return (
    <div className="wysimark-editor-wrapper">
      <FileHeader fileName={fileName} onReload={onReload} />
      <div className="wysimark-editor-container">
        <Editable
          editor={editor}
          value={value}
          onChange={handleChange}
          placeholder="Start writing..."
          className="wysimark-editor"
          style={{}}
          onImageSave={onImageSave}
        />
      </div>
    </div>
  );
}

// Main container component
function WysimarkContainer({
  file,
  content,
  onChange,
  onReload,
  onImageSave,
  reloadKey,
}: {
  file: TFile | null;
  content: string;
  onChange: (markdown: string) => void;
  onReload: () => void;
  onImageSave?: OnImageSaveHandler;
  reloadKey: number;
}) {
  if (!file) {
    return <EmptyState />;
  }

  return (
    <WysimarkEditorComponent
      key={`${file.path}-${reloadKey}`}
      initialValue={content}
      onChange={onChange}
      fileName={file.basename}
      onReload={onReload}
      onImageSave={onImageSave}
    />
  );
}

export class WysimarkView extends ItemView {
  plugin: Plugin;
  root: Root | null = null;
  currentFile: TFile | null = null;
  fileContent: string = '';
  private frontmatter: string = '';  // Store frontmatter separately
  private bodyContent: string = '';  // Store body content (without frontmatter)
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private isDirty: boolean = false;
  private reactContainer: HTMLElement | null = null;
  private reloadKey: number = 0;  // Used to force React component remount on reload

  constructor(leaf: WorkspaceLeaf, plugin: Plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_WYSIMARK;
  }

  getDisplayText(): string {
    return this.currentFile ? `Wysimark: ${this.currentFile.basename}` : 'Wysimark Editor';
  }

  getIcon(): string {
    return 'edit-3';
  }

  async onOpen(): Promise<void> {
    await super.onOpen();
    // Get the content container
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('wysimark-container');

    // Create a div for React to render into
    this.reactContainer = contentEl.createDiv({ cls: 'wysimark-react-root' });

    // Create React root
    this.root = createRoot(this.reactContainer);
    this.renderEditor();
  }

  async onClose() {
    // Clear any pending save timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    // Save before closing
    await this.saveFile();

    if (this.root) {
      this.root.unmount();
      this.root = null;
    }

    await super.onClose();
  }

  async setState(state: { file?: string }, result: { history: boolean }) {
    if (state.file) {
      const file = this.app.vault.getAbstractFileByPath(state.file);
      if (file instanceof TFile) {
        await this.loadFile(file);
      }
    }
    await super.setState(state, result);
  }

  getState() {
    return {
      file: this.currentFile?.path
    };
  }

  async loadFile(file: TFile) {
    // Don't reload if same file
    if (this.currentFile?.path === file.path) {
      return;
    }

    // Save previous file before switching
    if (this.currentFile && this.isDirty) {
      await this.saveFile();
    }

    this.currentFile = file;
    const rawContent = await this.app.vault.cachedRead(file);

    // Extract frontmatter and body
    const { frontmatter, body } = extractFrontmatter(rawContent);
    this.frontmatter = frontmatter;
    this.bodyContent = body;
    this.fileContent = rawContent;
    this.isDirty = false;

    this.renderEditor();
  }

  // Reload the current file from Obsidian (discard any unsaved changes)
  async reloadFile() {
    if (!this.currentFile) {
      return;
    }

    // Clear any pending save timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    // Read fresh content from disk
    const rawContent = await this.app.vault.read(this.currentFile);

    // Extract frontmatter and body
    const { frontmatter, body } = extractFrontmatter(rawContent);
    this.frontmatter = frontmatter;
    this.bodyContent = body;
    this.fileContent = rawContent;
    this.isDirty = false;

    // Increment reloadKey to force React component remount
    this.reloadKey++;

    this.renderEditor();
  }

  async saveFile(): Promise<void> {
    if (this.currentFile && this.isDirty) {
      const content = this.fileContent;
      await this.app.vault.process(this.currentFile, () => content);
      this.isDirty = false;
    }
  }

  handleChange = (markdown: string) => {
    // Update body content and combine with frontmatter for full file content
    this.bodyContent = markdown;
    this.fileContent = combineFrontmatter(this.frontmatter, markdown);
    this.isDirty = true;

    // Auto-save with debounce (1 second delay)
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      void this.saveFile();
    }, 1000);
  }

  /**
   * Handle saving an image file to the vault
   * @param file - The image file to save
   * @param path - The path within the vault to save the file
   * @returns The URL to use for displaying the image in the editor
   */
  handleImageSave: OnImageSaveHandler = async (file: File, path: string) => {
    // Normalize the path
    const normalizedPath = normalizePath(path);

    // Create parent directories if they don't exist
    const parentDir = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
    if (parentDir) {
      const existingFolder = this.app.vault.getAbstractFileByPath(parentDir);
      if (!existingFolder) {
        await this.app.vault.createFolder(parentDir);
      }
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Check if file already exists
    let savedFile: TFile;
    const existingFile = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (existingFile instanceof TFile) {
      // Overwrite existing file
      await this.app.vault.modifyBinary(existingFile, arrayBuffer);
      savedFile = existingFile;
    } else {
      // Create new file
      savedFile = await this.app.vault.createBinary(normalizedPath, arrayBuffer);
    }

    // Return the Obsidian resource URL for displaying in the editor
    // This URL format works within Obsidian's app environment
    return this.app.vault.getResourcePath(savedFile);
  }

  handleReload = () => {
    void this.reloadFile();
  }

  renderEditor() {
    if (!this.root) return;

    this.root.render(
      <WysimarkContainer
        file={this.currentFile}
        content={this.bodyContent}  // Pass only body content (without frontmatter)
        onChange={this.handleChange}
        onReload={this.handleReload}
        onImageSave={this.handleImageSave}
        reloadKey={this.reloadKey}
      />
    );
  }
}
