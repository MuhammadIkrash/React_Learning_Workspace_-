/**
 * @file youtube-dom-cleaner.js (classic script — see shared/namespace.js)
 */
(function () {
  const STAT_KEYS = window.CWP.shared.constants.STAT_KEYS;
  const MSG = window.CWP.shared.constants.MSG;
  const { registerHandler, unregisterHandler } = window.CWP.core.observerManager;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;
  const { guard, sendMessage } = window.CWP.shared.utils;
  const { logger } = window.CWP.shared.logger;

  const HIDE_CLASS = 'cwp-hidden';
  const HANDLER_ID = 'youtube-dom-cleaner';

  const AD_SELECTORS = [
    'ytd-display-ad-renderer',
    'ytd-promoted-sparkles-web-renderer',
    'ytd-promoted-video-renderer',
    'ytd-companion-slot-renderer',
    'ytd-action-companion-ad-renderer',
    'ytd-in-feed-ad-layout-renderer',
    'ytd-banner-promo-renderer',
    'ytd-statement-banner-renderer',
    'masthead-ad',
    '#masthead-ad',
    'ytd-ad-slot-renderer',
    'yt-mealbar-promo-renderer'
  ];

  function hideMatches(root = document) {
    let newlyHidden = 0;
    for (const selector of AD_SELECTORS) {
      const nodes = guard(() => root.querySelectorAll(selector), () => []);
      for (const node of nodes || []) {
        if (!node.classList.contains(HIDE_CLASS)) {
          node.classList.add(HIDE_CLASS);
          newlyHidden++;
        }
      }
    }
    return newlyHidden;
  }

  async function init() {
    const initial = hideMatches();
    if (initial > 0) {
      guard(() => sendMessage(MSG.STATS_INCREMENT, { key: STAT_KEYS.FEED_ADS, amount: initial }), () => {});
    }

    registerHandler(HANDLER_ID, () => {
      const count = hideMatches();
      if (count > 0) {
        guard(() => sendMessage(MSG.STATS_INCREMENT, { key: STAT_KEYS.FEED_ADS, amount: count }), (err) =>
          logger.error('Failed to report feed ad stat', err)
        );
      }
    });

    registerCleanup(HANDLER_ID, () => {
      unregisterHandler(HANDLER_ID);
      unregisterCleanup(HANDLER_ID);
    });

    return { initial };
  }

  function destroy() {
    unregisterHandler(HANDLER_ID);
    unregisterCleanup(HANDLER_ID);
  }

  window.CWP.youtube.domCleaner = { init, destroy };
})();
