/**
 * @file observer-manager.js (classic script — see shared/namespace.js)
 */
(function () {
  const { logger } = window.CWP.shared.logger;
  const { guard } = window.CWP.shared.utils;

  const handlers = new Map();
  let observer = null;
  let scheduled = false;

  function runHandlers(mutations) {
    for (const [id, entry] of handlers) {
      guard(() => entry.callback(mutations), (err) => logger.error(`Observer handler "${id}" failed`, err));
    }
  }

  function flush(mutations) {
    scheduled = false;
    runHandlers(mutations);
  }

  function onMutations(mutations) {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => flush(mutations));
  }

  function startObserving(root = document.body) {
    if (observer) return;
    observer = new MutationObserver(onMutations);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    logger.debug('Observer manager started');
  }

  function stopObserving() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
    logger.debug('Observer manager stopped');
  }

  function registerHandler(id, callback) {
    if (handlers.has(id)) {
      logger.warn(`Observer handler "${id}" already registered — replacing`);
    }
    handlers.set(id, { callback });
    return () => handlers.delete(id);
  }

  function unregisterHandler(id) {
    handlers.delete(id);
  }

  function unregisterAll() {
    handlers.clear();
  }

  window.CWP.core.observerManager = {
    startObserving,
    stopObserving,
    registerHandler,
    unregisterHandler,
    unregisterAll
  };
})();
