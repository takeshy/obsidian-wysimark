// This Node-only test fixture sets the browser platform before is-hotkey evaluates its platform-specific aliases.
Object.defineProperty(global, "window", {
  value: { navigator: { userAgent: "Macintosh; Intel Mac OS X", platform: "MacIntel" } },
  configurable: true,
})

export {}
