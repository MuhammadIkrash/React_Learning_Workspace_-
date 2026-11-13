/**
 * @file utils.js (content-script classic-script build)
 * Mirrors src/shared/utils.js — see constants.js in this folder for why this
 * is duplicated rather than imported.
 */
(function () {
  function debounce(fn, wait) {
    let timer = null;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function throttle(fn, wait) {
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

  function hostnameFromUrl(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }

  function hostnameMatches(hostname, pattern) {
    if (!hostname || !pattern) return false;
    const h = hostname.replace(/^www\./, '').toLowerCase();
    const p = pattern.replace(/^www\./, '').toLowerCase();
    return h === p || h.endsWith(`.${p}`);
  }

  function generateId(prefix = 'id') {
    const rand = Math.random().toString(36).slice(2, 9);
    return `${prefix}_${Date.now().toString(36)}_${rand}`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatSpeed(speed) {
    return `${speed.toFixed(2)}x`;
  }

  function safeJsonParse(text, fallback = null) {
    try {
      return JSON.parse(text);
    } catch {
      return fallback;
    }
  }

  function waitForElement(selector, { root = document, timeout = 8000, interval = 150 } = {}) {
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

  function createEl(tag, { className, attrs, text, children } = {}) {
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

  function guard(fn, onError) {
    try {
      return fn();
    } catch (err) {
      if (onError) onError(err);
      return undefined;
    }
  }

  async function guardAsync(fn, onError) {
    try {
      return await fn();
    } catch (err) {
      if (onError) onError(err);
      return undefined;
    }
  }

  function sendMessage(type, payload) {
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

  window.CWP.shared.utils = {
    debounce,
    throttle,
    hostnameFromUrl,
    hostnameMatches,
    generateId,
    clamp,
    formatSpeed,
    safeJsonParse,
    waitForElement,
    createEl,
    guard,
    guardAsync,
    sendMessage
  };
})();
