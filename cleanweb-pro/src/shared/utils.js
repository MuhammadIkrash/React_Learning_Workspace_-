/**
 * @file utils.js
 * Small, dependency-free helpers shared across background/content/UI code.
 */

/** Debounce a function by `wait` ms. */
export function debounce(fn, wait) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/** Throttle a function so it runs at most once per `wait` ms. */
export function throttle(fn, wait) {
  let last = 0;
  let pendingArgs = null;
  let timer = null;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      last = now;
      fn.apply(this, args);
    } else {
      pendingArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          if (pendingArgs) fn.apply(this, pendingArgs);
          pendingArgs = null;
        }, remaining);
      }
    }
  };
}

/** Returns today's date as YYYY-MM-DD in local time, used as a statistics log key. */
export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Extracts a normalized hostname from a URL string, or null if invalid. */
export function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** Checks whether `hostname` matches or is a subdomain of `pattern`. */
export function hostnameMatches(hostname, pattern) {
  if (!hostname || !pattern) return false;
  const h = hostname.replace(/^www\./, '').toLowerCase();
  const p = pattern.replace(/^www\./, '').toLowerCase();
  return h === p || h.endsWith(`.${p}`);
}

/** Generates a short, sufficiently-unique id for local-only records. */
export function generateId(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

/** Clamp a number between min and max. */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Formats a playback speed like 1 -> "1.00x", 1.5 -> "1.50x". */
export function formatSpeed(speed) {
  return `${speed.toFixed(2)}x`;
}

/** Safe JSON parse that never throws — returns fallback on failure. */
export function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/** Waits for an element matching `selector` to appear, or times out. */
export function waitForElement(selector, { root = document, timeout = 8000, interval = 150 } = {}) {
  return new Promise((resolve) => {
    const existing = root.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const el = root.querySelector(selector);
      if (el) {
        clearInterval(timer);
        resolve(el);
      } else if (Date.now() - start > timeout) {
        clearInterval(timer);
        resolve(null);
      }
    }, interval);
  });
}

/** Creates a DOM element with attributes/children in one call, without innerHTML. */
export function createEl(tag, { className, attrs, text, children } = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined && value !== null) el.setAttribute(key, String(value));
    }
  }
  if (text !== undefined) el.textContent = text;
  if (children) {
    for (const child of children) {
      if (child) el.appendChild(child);
    }
  }
  return el;
}

/** Runs `fn` and swallows/report errors so one feature's crash can't break another (section 38). */
export function guard(fn, onError) {
  try {
    return fn();
  } catch (err) {
    if (onError) onError(err);
    return undefined;
  }
}

/** Async variant of guard(). */
export async function guardAsync(fn, onError) {
  try {
    return await fn();
  } catch (err) {
    if (onError) onError(err);
    return undefined;
  }
}

/**
 * Promise-wrapped chrome.runtime.sendMessage with a consistent
 * { success, data|error } envelope (see message-router.js).
 * @param {string} type one of MSG constants
 * @param {*} [payload]
 * @returns {Promise<*>} resolves with `data`, throws on failure
 */
export function sendMessage(type, payload) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ type, payload }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response) {
          reject(new Error('No response from background'));
          return;
        }
        if (response.success) resolve(response.data);
        else reject(new Error(response.error || 'Unknown error'));
      });
    } catch (err) {
      reject(err);
    }
  });
}
