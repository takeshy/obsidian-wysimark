import type { Plugin } from 'unified'
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table'
import { gfm } from 'micromark-extension-gfm'
import { gfmToMarkdown } from 'mdast-util-gfm'

/**
 * Custom wrapper around remark-gfm that ensures the data object is initialized
 * This fixes the "Cannot set properties of undefined (setting 'inTable')" error
 * that occurs when pasting tables
 */
export function customRemarkGfm(): Plugin {
  // Return a plugin function that initializes the data object
  return function(this: any) {
    // Make sure 'this' exists
    if (!this) {
      return;
    }
    
    // Initialize the data object on the processor
    // @ts-ignore - We're accessing internal properties to fix the issue
    if (!this.data) {
      // @ts-ignore
      this.data = {};
    } else if (typeof this.data === 'function') {
      // Call data() to ensure the data object is initialized
      this.data();
    }
    
    // Create a direct implementation of the remarkGfm plugin
    // This avoids calling the original plugin which might have issues
    
    // @ts-ignore - We're accessing internal properties
    const data = typeof this.data === 'function' ? this.data() : this.data;
    
    // Initialize the extensions arrays if they don't exist
    const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
    const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
    const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);
    
    // Add the GFM extensions
    // We're using the original extensions from remark-gfm
    // @ts-ignore - We're accessing internal properties
    micromarkExtensions.push(gfm());
    
    // Create a patched version of gfmTableFromMarkdown
    const patchedFromMarkdown = function() {
      const extension = gfmTableFromMarkdown();
      
      // Make sure enter exists
      if (extension.enter) {
        // Patch the enterTable function
        const originalEnterTable = extension.enter.table;
        if (originalEnterTable) {
          extension.enter.table = function(token) {
            // Make sure this.data exists before the original function is called
            if (!this.data) {
              this.data = {};
            }
            
            // Call the original function
            originalEnterTable.call(this, token);
            
            // Make sure inTable is set
            this.data.inTable = true;
          };
        }
      }
      
      // Make sure exit exists and patch the exitTable function
      if (extension.exit) {
        const originalExitTable = extension.exit.table;
        if (originalExitTable) {
          extension.exit.table = function(token) {
            // Make sure this.data exists before the original function is called
            if (!this.data) {
              this.data = {};
            }
            
            // Call the original function
            originalExitTable.call(this, token);
            
            // Make sure inTable is safely unset
            if (this.data) {
              this.data.inTable = undefined;
            }
          };
        }
      }
      
      return extension;
    };
    
    // Add our patched extensions
    fromMarkdownExtensions.push(patchedFromMarkdown());
    // @ts-ignore - We're accessing internal properties
    toMarkdownExtensions.push(gfmToMarkdown());
    
    return undefined; // Return undefined as the plugin doesn't need to return anything
  }
}
