// Mock for Obsidian API in Storybook environment
export const Platform = {
  isFirefox: typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("firefox"),
  isMacOS: typeof navigator !== "undefined" && navigator.userAgent.includes("Mac"),
  isWin: typeof navigator !== "undefined" && navigator.userAgent.includes("Win"),
  isLinux: typeof navigator !== "undefined" && navigator.userAgent.includes("Linux"),
  isMobile: false,
  isDesktop: true,
  isDesktopApp: false,
  isMobileApp: false,
  isIosApp: false,
  isAndroidApp: false,
  isSafari: typeof navigator !== "undefined" && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome"),
}
