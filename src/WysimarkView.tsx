import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Editable, useEditor } from './vendor/wysimark/index.mjs';
import { WysimarkPlugin } from './plugin';

export const VIEW_TYPE_WYSIMARK = 'wysimark-view';

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
function FileHeader({ fileName, onSave }: { fileName: string; onSave: () => void }) {
  return (
    <div className="wysimark-header">
      <span className="wysimark-header-filename">{fileName}</span>
      <button className="wysimark-header-save" onClick={onSave} title="Save">
        💾
      </button>
    </div>
  );
}

// React component for the editor
function WysimarkEditorComponent({
  initialValue,
  onChange,
  fileName,
  onSave,
}: {
  initialValue: string;
  onChange: (markdown: string) => void;
  fileName: string;
  onSave: () => void;
}) {
  const editor = useEditor({
    authToken: undefined,
    height: undefined,
    minHeight: undefined,
    maxHeight: undefined,
  });
  const [value, setValue] = React.useState(initialValue);

  const handleChange = React.useCallback((markdown: string) => {
    setValue(markdown);
    onChange(markdown);
  }, [onChange]);

  // Update value when initialValue changes (file switch)
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="wysimark-editor-wrapper">
      <FileHeader fileName={fileName} onSave={onSave} />
      <div className="wysimark-editor-container">
        <Editable
          editor={editor}
          value={value}
          onChange={handleChange}
          placeholder="Start writing..."
          className="wysimark-editor"
          style={{}}
          onImageChange={undefined}
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
  onSave,
}: {
  file: TFile | null;
  content: string;
  onChange: (markdown: string) => void;
  onSave: () => void;
}) {
  if (!file) {
    return <EmptyState />;
  }

  return (
    <WysimarkEditorComponent
      key={file.path}
      initialValue={content}
      onChange={onChange}
      fileName={file.basename}
      onSave={onSave}
    />
  );
}

export class WysimarkView extends ItemView {
  plugin: WysimarkPlugin;
  root: Root | null = null;
  currentFile: TFile | null = null;
  fileContent: string = '';
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private isDirty: boolean = false;
  private reactContainer: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: WysimarkPlugin) {
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

  async onOpen() {
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
  }

  async setState(state: { file?: string }, result: { history: boolean }) {
    if (state.file) {
      const file = this.app.vault.getAbstractFileByPath(state.file);
      if (file instanceof TFile) {
        await this.loadFile(file);
      }
    }
    super.setState(state, result);
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
    this.fileContent = await this.app.vault.read(file);
    this.isDirty = false;

    // Update display text
    (this.leaf as any).updateHeader?.();

    this.renderEditor();
  }

  async saveFile() {
    if (this.currentFile && this.isDirty) {
      try {
        await this.app.vault.modify(this.currentFile, this.fileContent);
        this.isDirty = false;
      } catch (error) {
        console.error('Failed to save file:', error);
      }
    }
  }

  handleChange = (markdown: string) => {
    this.fileContent = markdown;
    this.isDirty = true;

    // Auto-save with debounce (1 second delay)
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveFile();
    }, 1000);
  }

  handleManualSave = () => {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.saveFile();
  }

  renderEditor() {
    if (!this.root) return;

    this.root.render(
      <WysimarkContainer
        file={this.currentFile}
        content={this.fileContent}
        onChange={this.handleChange}
        onSave={this.handleManualSave}
      />
    );
  }
}
