// Obsidian supplies this module at runtime; its npm package contains only types.
// Keep these substitutes restricted to the Node test process.
const Module = require("node:module")
const load = Module._load
const obsidian = {
  Platform: {
    get isMacOS() { return /Mac/i.test(globalThis.window?.navigator?.platform || "") },
  },
  getLanguage: () => "en",
}
Module._load = function(request, parent, isMain) {
  if (request === "obsidian") return obsidian
  return load.call(this, request, parent, isMain)
}
