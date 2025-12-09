import { Plugin, WorkspaceLeaf, TFile, MarkdownView } from 'obsidian';
import { WysimarkView, VIEW_TYPE_WYSIMARK } from "src/WysimarkView";

let pluginInstance: WysimarkPlugin;

export class WysimarkPlugin extends Plugin {
  onload(): void {
    pluginInstance = this;

    // Register the Wysimark view
    this.registerView(VIEW_TYPE_WYSIMARK, (leaf) => new WysimarkView(leaf, this));

    // Ensure the view exists when layout is ready
    this.app.workspace.onLayoutReady(() => {
      void this.ensureWysimarkViewExists();
    });

    // Add ribbon icon to show/toggle the view
    this.addRibbonIcon('edit-3', 'Wysimark Editor', () => {
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

  // Ensure that the Wysimark view exists in the right sidebar
  async ensureWysimarkViewExists() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WYSIMARK);
    if (leaves.length === 0) {
      let leaf = this.app.workspace.getRightLeaf(false);
      if (!leaf) {
        leaf = this.app.workspace.getRightLeaf(true);
      }
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_WYSIMARK, active: false });
      }
    }
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
      workspace.revealLeaf(leaf);

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
  async updateWysimarkView(file: TFile) {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WYSIMARK);
    if (leaves.length > 0) {
      const view = leaves[0].view as WysimarkView;
      if (view && view.loadFile) {
        await view.loadFile(file);
      }
    }
  }

  onunload() {
    // Cleanup
  }
}

export function getPlugin(): WysimarkPlugin {
  if (!pluginInstance) throw new Error("Plugin instance not set yet");
  return pluginInstance;
}

export function getApp() {
  if (!pluginInstance) throw new Error("Plugin instance not set yet");
  return pluginInstance.app;
}
