// Set the browser platform before is-hotkey evaluates its platform-specific aliases.
Object.defineProperty(globalThis, "window", {
  value: { navigator: { userAgent: "Macintosh; Intel Mac OS X", platform: "MacIntel" } },
  configurable: true,
})

export {}
