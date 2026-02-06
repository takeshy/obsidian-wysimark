import { Plugin, WorkspaceLeaf, TFile, MarkdownView } from 'obsidian';
import { WysimarkView, VIEW_TYPE_WYSIMARK } from "./WysimarkView";

export default class WysimarkEditorPlugin extends Plugin {
  async onload(): Promise<void> {
    await super.onload();

    // Register the Wysimark view
    this.registerView(VIEW_TYPE_WYSIMARK, (leaf) => new WysimarkView(leaf, this));

    // Add ribbon icon to show/toggle the view
    this.addRibbonIcon('edit-3', 'Wysimark editor', () => {
      void this.activateWysimarkView();
    });

    // Add command to toggle sidebar
    this.addCommand({
      id: 'toggle-sidebar',
      name: 'Toggle sidebar',
      callback: () => {
        void this.activateWysimarkView();
      },
    });

    // Listen for active file changes
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', (leaf) => {
        if (leaf) {
          const view = leaf.view;
          if (view instanceof MarkdownView) {
            const file = view.file;
            if (file && file.extension === 'md') {
              void this.updateWysimarkView(file);
            }
          }
        }
      })
    );
  }

  onunload(): void {
    // Views, events, and commands registered via registerView/registerEvent/addCommand
    // are automatically cleaned up by Obsidian's plugin system.
    // Do NOT call detachLeavesOfType here to preserve user's layout during plugin updates.
  }

  // Activate/reveal the Wysimark view
  async activateWysimarkView(): Promise<void> {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;

    const existingLeaves = workspace.getLeavesOfType(VIEW_TYPE_WYSIMARK);
    if (existingLeaves.length > 0) {
      leaf = existingLeaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_WYSIMARK, active: true });
      }
    }

    if (leaf) {
      void workspace.revealLeaf(leaf);

      // Load the current active file
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile && activeFile.extension === 'md') {
        const view = leaf.view as WysimarkView;
        if (view && view.loadFile) {
          await view.loadFile(activeFile);
        }
      }
    }
  }

  // Update the Wysimark view with a new file
  async updateWysimarkView(file: TFile): Promise<void> {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WYSIMARK);
    if (leaves.length > 0) {
      const view = leaves[0].view as WysimarkView;
      if (view && view.loadFile) {
        await view.loadFile(file);
      }
    }
  }

  // Reload the current file from Obsidian (discard Wysimark changes)
  async reloadWysimarkView(): Promise<void> {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WYSIMARK);
    if (leaves.length > 0) {
      const view = leaves[0].view as WysimarkView;
      if (view && view.reloadFile) {
        await view.reloadFile();
      }
    }
  }

}
