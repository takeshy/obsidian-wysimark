export type ThrottledFunction = (() => void) & {
  flush: () => void
  cancel: () => void
}

export function throttle(
  fn: () => void,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): ThrottledFunction {
  const leading = options.leading ?? true
  const trailing = options.trailing ?? true
  let timeout: number | null = null
  let lastCallTime = 0
  let pending = false

  const invoke = () => {
    lastCallTime = Date.now()
    pending = false
    fn()
  }

  const clearPendingTimeout = () => {
    if (timeout !== null) {
      window.clearTimeout(timeout)
      timeout = null
    }
  }

  const throttled = (() => {
    const now = Date.now()

    if (!lastCallTime && !leading) {
      lastCallTime = now
    }

    const remaining = wait - (now - lastCallTime)
    pending = true

    if (remaining <= 0 || remaining > wait) {
      clearPendingTimeout()
      invoke()
      return
    }

    if (trailing && timeout === null) {
      timeout = window.setTimeout(() => {
        timeout = null
        if (pending) {
          invoke()
        }
      }, remaining)
    }
  }) as ThrottledFunction

  throttled.flush = () => {
    if (!pending) return
    clearPendingTimeout()
    invoke()
  }

  throttled.cancel = () => {
    clearPendingTimeout()
    pending = false
  }

  return throttled
}
