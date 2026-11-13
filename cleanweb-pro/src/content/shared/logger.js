/**
 * @file logger.js (content-script classic-script build)
 * Mirrors src/shared/logger.js.
 */
(function () {
  const PREFIX = '[CleanWeb]';
  let debugEnabled = false;

  function setDebugEnabled(value) {
    debugEnabled = Boolean(value);
  }

  function isDebugEnabled() {
    return debugEnabled;
  }

  function format(args) {
    return [PREFIX, ...args];
  }

  const logger = {
    debug(...args) {
      if (debugEnabled) console.debug(...format(args));
    },
    info(...args) {
      if (debugEnabled) console.info(...format(args));
    },
    warn(...args) {
      console.warn(...format(args));
    },
    error(...args) {
      console.error(...format(args));
    }
  };

  window.CWP.shared.logger = { logger, setDebugEnabled, isDebugEnabled };
})();
