/**
 * @file cleanup-manager.js (classic script — see shared/namespace.js)
 */
(function () {
  const { logger } = window.CWP.shared.logger;
  const { guard } = window.CWP.shared.utils;

  const cleanupFns = new Map();

  function registerCleanup(id, fn) {
    cleanupFns.set(id, fn);
  }

  function unregisterCleanup(id) {
    cleanupFns.delete(id);
  }

  function runAllCleanups() {
    for (const [id, fn] of cleanupFns) {
      guard(() => fn(), (err) => logger.error(`Cleanup "${id}" failed`, err));
    }
    cleanupFns.clear();
  }

  window.addEventListener('pagehide', runAllCleanups);

  window.CWP.core.cleanupManager = { registerCleanup, unregisterCleanup, runAllCleanups };
})();
