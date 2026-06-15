import type { Plugin, Processor } from 'unified'
import type { CompileContext, Extension, Handle } from 'mdast-util-from-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'

// Internal type for unified processor data
interface ProcessorData {
  micromarkExtensions?: unknown[];
  fromMarkdownExtensions?: unknown[];
  toMarkdownExtensions?: unknown[];
}

type PatchedCompileContext = Omit<CompileContext, "data"> & {
  data?: CompileContext["data"];
}

function wrapHandler(originalHandler: Handle): Handle {
  return function(this: CompileContext, token) {
    const context = this as PatchedCompileContext;
    context.data ||= {};

    originalHandler.call(context as CompileContext, token);
    return undefined;
  };
}

function patchFromMarkdownExtension(extension: Extension): Extension {
  const { enter, exit } = extension;

  if (enter) {
    for (const key of Object.keys(enter)) {
      enter[key] = wrapHandler(enter[key]);
    }
  }

  if (exit) {
    for (const key of Object.keys(exit)) {
      exit[key] = wrapHandler(exit[key]);
    }
  }

  return extension;
}

/**
 * Custom wrapper around remark-gfm that ensures the data object is initialized
 * This fixes the "Cannot set properties of undefined (setting 'inTable')" error
 * that occurs when pasting tables
 */
export function customRemarkGfm(): Plugin {
  // Return a plugin function that initializes the data object
  return function(this: Processor) {
    // Make sure 'this' exists
    if (!this) {
      return;
    }

    // Initialize the data object on the processor
    // Get the data object - unified processor's data() method returns the data object
    const data = this.data() as ProcessorData;
    
    // Initialize the extensions arrays if they don't exist
    const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
    const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
    const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);
    
    // Add the GFM extensions
    // We're using the original extensions from remark-gfm
    micromarkExtensions.push(gfm());

    // Add all GFM from-markdown extensions, including task list items.
    const patchedFromMarkdown = gfmFromMarkdown().map(patchFromMarkdownExtension);
    fromMarkdownExtensions.push(...patchedFromMarkdown);
    toMarkdownExtensions.push(gfmToMarkdown());
    
    return undefined; // Return undefined as the plugin doesn't need to return anything
  }
}
