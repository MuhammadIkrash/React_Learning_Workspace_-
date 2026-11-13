/**
 * @file logger.js
 * A single, gated logging surface. Every module logs through this instead of
 * calling console.* directly, so DEBUG can be flipped globally (see section 37
 * of the spec: "When disabled: No console spam.").
 */

const PREFIX = '[CleanWeb]';

let debugEnabled = false;

/** Enable/disable verbose logging at runtime (driven by settings.debugMode). */
export function setDebugEnabled(value) {
  debugEnabled = Boolean(value);
}

export function isDebugEnabled() {
  return debugEnabled;
}

function format(args) {
  return [PREFIX, ...args];
}

export const logger = {
  debug(...args) {
    if (debugEnabled) console.debug(...format(args));
  },
  info(...args) {
    if (debugEnabled) console.info(...format(args));
  },
  warn(...args) {
    // Warnings surface even when debug is off — they indicate a feature
    // degraded and failed safely, which is useful signal for support requests.
    console.warn(...format(args));
  },
  error(...args) {
    console.error(...format(args));
  }
};
