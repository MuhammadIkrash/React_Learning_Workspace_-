/**
 * @file custom-filters.js (classic script — see shared/namespace.js)
 */
(function () {
  const MSG = window.CWP.shared.constants.MSG;
  const STAT_KEYS = window.CWP.shared.constants.STAT_KEYS;
  const { guard, hostnameMatches, sendMessage } = window.CWP.shared.utils;
  const { applyRules } = window.CWP.filters.filterEngine;
  const { registerHandler, unregisterHandler } = window.CWP.core.observerManager;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;
  const { logger } = window.CWP.shared.logger;

  const ID = 'custom-filters';

  function currentHostname() {
    return location.hostname.replace(/^www\./, '');
  }

  async function loadMatchingFilters() {
    const all = await guard(() => sendMessage(MSG.FILTERS_GET), () => []);
    const host = currentHostname();
    return (all || []).filter((f) => f.enabled !== false && hostnameMatches(host, f.domain));
  }

  async function init() {
    const filters = await loadMatchingFilters();
    if (filters.length === 0) {
      return { filters: [] };
    }

    const initial = applyRules(filters);
    if (initial > 0) {
      guard(() => sendMessage(MSG.STATS_INCREMENT, { key: STAT_KEYS.CUSTOM_FILTER_HITS, amount: initial }), () => {});
    }

    registerHandler(ID, () => {
      const count = applyRules(filters);
      if (count > 0) {
        guard(() => sendMessage(MSG.STATS_INCREMENT, { key: STAT_KEYS.CUSTOM_FILTER_HITS, amount: count }), (err) =>
          logger.error('Failed to report custom filter stat', err)
        );
      }
    });

    registerCleanup(ID, () => {
      unregisterHandler(ID);
      unregisterCleanup(ID);
    });

    return { filters, initial };
  }

  function destroy() {
    unregisterHandler(ID);
    unregisterCleanup(ID);
  }

  window.CWP.filters.customFilters = { init, destroy };
})();
