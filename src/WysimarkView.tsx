import { ItemView, WorkspaceLeaf, TFile, normalizePath, Plugin, App, MarkdownRenderer, Component, Scope } from 'obsidian';
import type { Editor } from 'slate';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Editable, useEditor, OnImageSaveHandler } from './wysimark/entry';
import { wikiLinkTarget } from './wysimark/convert/obsidian-links';
import { getLineEnding, withLineEnding, LineEnding } from './wysimark/convert/line-endings';
import { handleScopedHotkey } from './wysimark/entry/scoped-hotkeys';

export const VIEW_TYPE_WYSIMARK = 'wysimark-view';

// Frontmatter regex: matches YAML frontmatter at the start of the file
const FRONTMATTER_REGEX = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const IMAGE_EXTENSIONS = new Set(['avif', 'bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp']);

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

function linkPathFromInternalTarget(target: string): string {
  const hashIndex = target.indexOf('#');
  return (hashIndex >= 0 ? target.slice(0, hashIndex) : target).trim();
}

function InternalLinkPreview({
  app,
  sourcePath,
  target,
}: {
  app: App;
  sourcePath: string;
  target: string;
}) {
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    const previewEl = previewRef.current;
    if (!previewEl) return;

    // Use a short-lived Component as the render lifecycle owner instead of the
    // plugin instance, so the rendered markdown's children are cleaned up when
    // this preview unmounts.
    const component = new Component();
    component.load();

    previewEl.empty();
    previewEl.setText('Loading preview...');

    const render = async () => {
      const linkPath = linkPathFromInternalTarget(target);
      const sourceFile = app.vault.getAbstractFileByPath(sourcePath);
      const targetFile = linkPath
        ? app.metadataCache.getFirstLinkpathDest(linkPath, sourcePath)
        : sourceFile;

      if (!(targetFile instanceof TFile)) {
        if (!cancelled) previewEl.setText(`Not found: ${target}`);
        return;
      }

      if (IMAGE_EXTENSIONS.has(targetFile.extension.toLowerCase())) {
        if (cancelled) return;
        previewEl.empty();
        const image = previewEl.createEl('img', {
          attr: { src: app.vault.getResourcePath(targetFile), alt: targetFile.basename },
        });
        image.setCssStyles({ display: 'block', maxWidth: '100%', height: 'auto' });
        return;
      }

      if (targetFile.extension.toLowerCase() !== 'md') {
        if (!cancelled) previewEl.setText(`Preview unavailable: ${targetFile.path}`);
        return;
      }

      const markdown = await app.vault.cachedRead(targetFile);
      if (!markdown.trim()) {
        if (!cancelled) previewEl.setText('Empty note');
        return;
      }
      if (cancelled) return;

      previewEl.empty();
      await MarkdownRenderer.render(app, markdown, previewEl, targetFile.path, component);
    };

    void render();

    return () => {
      cancelled = true;
      component.unload();
      previewEl.empty();
    };
  }, [app, sourcePath, target]);

  return <div ref={previewRef} />;
}

function InternalEmbedView({
  app,
  sourcePath,
  spec,
}: {
  app: App;
  sourcePath: string;
  spec: string;
}) {
  const target = wikiLinkTarget(spec);
  const normalizedTarget = normalizePath(target);
  const exactTarget = app.vault.getAbstractFileByPath(normalizedTarget);
  const targetFile = exactTarget instanceof TFile
    ? exactTarget
    : app.metadataCache.getFirstLinkpathDest(target, sourcePath);
  const targetExtension = normalizedTarget.includes('.')
    ? normalizedTarget.slice(normalizedTarget.lastIndexOf('.') + 1).toLowerCase()
    : '';
  const targetsImage = IMAGE_EXTENSIONS.has(targetExtension);
  const imageFile = targetFile instanceof TFile && IMAGE_EXTENSIONS.has(targetFile.extension.toLowerCase())
    ? targetFile
    : null;
  const embedRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (imageFile || targetsImage) return;
    let cancelled = false;
    const embedEl = embedRef.current;
    if (!embedEl) return;

    // Use a short-lived Component as the render lifecycle owner so the
    // embedded note's children are cleaned up when this embed unmounts.
    const component = new Component();
    component.load();

    embedEl.empty();

    // Render the literal `![[spec]]` so Obsidian resolves the embed itself
    // (note transclusion, image, PDF, etc.) using the source file's context.
    void MarkdownRenderer.render(
      app,
      `![[${spec}]]`,
      embedEl,
      sourcePath,
      component
    ).then(() => {
      if (cancelled) embedEl.empty();
    });

    return () => {
      cancelled = true;
      component.unload();
      embedEl.empty();
    };
  }, [app, imageFile, sourcePath, spec, targetsImage]);

  if (imageFile) {
    return (
      <img
        src={app.vault.getResourcePath(imageFile)}
        alt={imageFile.basename}
        className="wysimark-internal-embed-image"
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      />
    );
  }

  if (targetsImage) {
    return <span className="wysimark-internal-embed-missing">Image not found: {target}</span>;
  }

  return <div ref={embedRef} className="wysimark-internal-embed" />;
}

function MermaidPreview({
  app,
  sourcePath,
  code,
}: {
  app: App;
  sourcePath: string;
  code: string;
}) {
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    const previewEl = previewRef.current;
    if (!previewEl) return;

    const component = new Component();
    component.load();
    previewEl.empty();
    previewEl.setText('Rendering diagram...');

    void MarkdownRenderer.render(
      app,
      `\`\`\`mermaid\n${code}\n\`\`\``,
      previewEl,
      sourcePath,
      component
    ).then(() => {
      if (cancelled) previewEl.empty();
    }).catch((error: unknown) => {
      if (!cancelled) {
        previewEl.setText(error instanceof Error ? error.message : 'Invalid Mermaid diagram');
      }
    });

    return () => {
      cancelled = true;
      component.unload();
      previewEl.empty();
    };
  }, [app, code, sourcePath]);

  return <div ref={previewRef} className="wysimark-mermaid-preview" />;
}

// React component for the editor
function WysimarkEditorComponent({
  initialValue,
  onChange,
  plugin,
  file,
  fileName,
  onReload,
  onImageSave,
  connectEditor,
}: {
  initialValue: string;
  onChange: (markdown: string) => void;
  plugin: Plugin;
  file: TFile;
  fileName: string;
  onReload: () => void;
  onImageSave?: OnImageSaveHandler;
  connectEditor: (editor: Editor) => () => void;
}) {
  const openInternalLink = React.useCallback(async (target: string) => {
    await plugin.app.workspace.openLinkText(target, file.path, false, {
      active: true,
    });
  }, [file.path, plugin.app.workspace]);

  const renderInternalLinkPreview = React.useCallback((target: string) => {
    return (
      <InternalLinkPreview
        app={plugin.app}
        sourcePath={file.path}
        target={target}
      />
    );
  }, [file.path, plugin.app]);

  const renderInternalEmbed = React.useCallback((spec: string) => {
    return (
      <InternalEmbedView
        app={plugin.app}
        sourcePath={file.path}
        spec={spec}
      />
    );
  }, [file.path, plugin.app]);

  const renderMermaidPreview = React.useCallback((code: string) => {
    return <MermaidPreview app={plugin.app} sourcePath={file.path} code={code} />;
  }, [file.path, plugin.app]);

  const getVaultImagePaths = React.useCallback(() => {
    return plugin.app.vault
      .getFiles()
      .filter((vaultFile) => IMAGE_EXTENSIONS.has(vaultFile.extension.toLowerCase()))
      .map((vaultFile) => vaultFile.path)
      .sort((a, b) => a.localeCompare(b));
  }, [plugin.app.vault]);

  const getVaultFilePaths = React.useCallback(() => {
    return plugin.app.vault
      .getFiles()
      .map((vaultFile) => vaultFile.path)
      .sort((a, b) => a.localeCompare(b));
  }, [plugin.app.vault]);

  const editor = useEditor({
    openInternalLink,
    renderInternalLinkPreview,
    renderInternalEmbed,
    renderMermaidPreview,
  });
  React.useEffect(() => connectEditor(editor), [connectEditor, editor]);
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
          getVaultImagePaths={getVaultImagePaths}
          getVaultFilePaths={getVaultFilePaths}
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
  plugin,
  connectEditor,
}: {
  file: TFile | null;
  content: string;
  onChange: (markdown: string) => void;
  onReload: () => void;
  onImageSave?: OnImageSaveHandler;
  reloadKey: number;
  plugin: Plugin;
  connectEditor: (editor: Editor) => () => void;
}) {
  if (!file) {
    return <EmptyState />;
  }

  return (
    <WysimarkEditorComponent
      key={`${file.path}-${reloadKey}`}
      initialValue={content}
      onChange={onChange}
      plugin={plugin}
      connectEditor={connectEditor}
      file={file}
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
  private lineEnding: LineEnding = '\n';
  private saveTimeout: number | null = null;
  private isDirty: boolean = false;
  private reactContainer: HTMLElement | null = null;
  private reloadKey: number = 0;  // Used to force React component remount on reload
  private editor: Editor | null = null;

  private connectEditor = (editor: Editor) => {
    this.editor = editor;
    return () => {
      if (this.editor === editor) this.editor = null;
    };
  };

  constructor(leaf: WorkspaceLeaf, plugin: Plugin) {
    super(leaf);
    this.plugin = plugin;
    this.scope = new Scope(this.app.scope);
    this.scope.register(null, null, (event) => {
      const target = event.target as HTMLElement | null;
      if (!this.editor || !target?.closest?.('[data-slate-editor="true"]') ||
        !this.reactContainer?.contains(target)) return;
      if (handleScopedHotkey(this.editor, event)) return false;
    });
  }

  getViewType(): string {
    return VIEW_TYPE_WYSIMARK;
  }

  getDisplayText(): string {
    return this.currentFile ? `Wysimark: ${this.currentFile.basename}` : 'Wysimark Editor';
  }

  getIcon(): string {
    return 'pencil';
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
      window.clearTimeout(this.saveTimeout);
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
    this.lineEnding = getLineEnding(rawContent);
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
      window.clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    // Read fresh content from disk
    const rawContent = await this.app.vault.read(this.currentFile);

    // Extract frontmatter and body
    const { frontmatter, body } = extractFrontmatter(rawContent);
    this.frontmatter = frontmatter;
    this.bodyContent = body;
    this.fileContent = rawContent;
    this.lineEnding = getLineEnding(rawContent);
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
    markdown = withLineEnding(markdown, this.lineEnding);
    if (markdown === this.bodyContent) return;
    // Update body content and combine with frontmatter for full file content
    this.bodyContent = markdown;
    this.fileContent = combineFrontmatter(this.frontmatter, markdown);
    this.isDirty = true;

    // Auto-save with debounce (1 second delay)
    if (this.saveTimeout) {
      window.clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = window.setTimeout(() => {
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
        plugin={this.plugin}
        connectEditor={this.connectEditor}
      />
    );
  }
}
