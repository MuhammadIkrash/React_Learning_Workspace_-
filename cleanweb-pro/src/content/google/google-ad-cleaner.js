/**
 * @file google-ad-cleaner.js (classic script — see shared/namespace.js)
 */
(function () {
  const STAT_KEYS = window.CWP.shared.constants.STAT_KEYS;
  const MSG = window.CWP.shared.constants.MSG;
  const { registerHandler, unregisterHandler } = window.CWP.core.observerManager;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;
  const { guard, sendMessage } = window.CWP.shared.utils;
  const { logger } = window.CWP.shared.logger;

  const ID = 'google-ad-cleaner';
  const HIDE_CLASS = 'cwp-hidden';

  const AD_CONTAINER_SELECTORS = [
    'div[data-text-ad]',
    '#tvcap',
    '#tadsb',
    '#bottomads',
    'div[data-hveid][data-ad-slot]',
    'div.uEierd',
    'div.commercial-unit-desktop-top'
  ];

  const SPONSORED_LABEL_RE = /^(ad|sponsored|anzeige|annonce|anuncio)$/i;

  function findLabeledAdBlocks(root) {
    const found = [];
    const spans = root.querySelectorAll('span, div');
    for (const el of spans) {
      const text = el.textContent?.trim();
      if (text && text.length <= 12 && SPONSORED_LABEL_RE.test(text)) {
        let node = el;
        let depth = 0;
        while (node && depth < 6) {
          if (node.matches?.('div[data-hveid], div.g, div.MjjYud')) {
            found.push(node);
            break;
          }
          node = node.parentElement;
          depth++;
        }
      }
    }
    return found;
  }

  function hideAds(root = document) {
    let count = 0;
    for (const selector of AD_CONTAINER_SELECTORS) {
      const nodes = guard(() => root.querySelectorAll(selector), () => []);
      for (const node of nodes || []) {
        if (!node.classList.contains(HIDE_CLASS)) {
          node.classList.add(HIDE_CLASS);
          count++;
        }
      }
    }
    return count;
  }

  function hideLabeledAds(root = document) {
    const blocks = guard(() => findLabeledAdBlocks(root), () => []);
    let count = 0;
    for (const node of blocks || []) {
      if (!node.classList.contains(HIDE_CLASS)) {
        node.classList.add(HIDE_CLASS);
        count++;
      }
    }
    return count;
  }

  async function init() {
    const initial = hideAds() + hideLabeledAds();
    if (initial > 0) {
      guard(() => sendMessage(MSG.STATS_INCREMENT, { key: STAT_KEYS.GOOGLE_ADS, amount: initial }), () => {});
    }

    registerHandler(ID, () => {
      const count = hideAds();
      if (count > 0) {
        guard(() => sendMessage(MSG.STATS_INCREMENT, { key: STAT_KEYS.GOOGLE_ADS, amount: count }), (err) =>
          logger.error('Failed to report Google ad stat', err)
        );
      }
    });

    const labelInterval = setInterval(() => {
      const count = hideLabeledAds();
      if (count > 0) {
        guard(() => sendMessage(MSG.STATS_INCREMENT, { key: STAT_KEYS.GOOGLE_ADS, amount: count }), () => {});
      }
    }, 2500);

    registerCleanup(ID, () => {
      unregisterHandler(ID);
      clearInterval(labelInterval);
      unregisterCleanup(ID);
    });

    return { hidden: initial, labelInterval };
  }

  function destroy(instance) {
    unregisterHandler(ID);
    if (instance?.labelInterval) clearInterval(instance.labelInterval);
    unregisterCleanup(ID);
  }

  window.CWP.google.adCleaner = { init, destroy };
})();
