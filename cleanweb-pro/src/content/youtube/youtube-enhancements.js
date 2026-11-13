/**
 * @file youtube-enhancements.js (classic script — see shared/namespace.js)
 */
(function () {
  const { registerHandler, unregisterHandler } = window.CWP.core.observerManager;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;
  const { guard } = window.CWP.shared.utils;

  const ID = 'youtube-enhancements';

  const CLASS_MAP = {
    hideEndScreenRecs: 'cwp-hide-endscreen',
    hideAnnotations: 'cwp-hide-annotations',
    compactComments: 'cwp-compact-comments',
    hideLiveChat: 'cwp-hide-livechat',
    focusMode: 'cwp-focus-mode',
    feedCleaner: 'cwp-feed-cleaner'
  };

  function applyClasses(features) {
    const root = document.documentElement;
    for (const [featureKey, className] of Object.entries(CLASS_MAP)) {
      root.classList.toggle(className, Boolean(features[featureKey]));
    }
  }

  async function init(ctx) {
    applyClasses(ctx.settings.features);

    registerHandler(ID, () => {
      guard(() => applyClasses(ctx.settings.features), () => {});
    });

    registerCleanup(ID, () => {
      unregisterHandler(ID);
      for (const className of Object.values(CLASS_MAP)) {
        document.documentElement.classList.remove(className);
      }
      unregisterCleanup(ID);
    });

    return { applied: true };
  }

  function destroy() {
    unregisterHandler(ID);
    for (const className of Object.values(CLASS_MAP)) {
      document.documentElement.classList.remove(className);
    }
    unregisterCleanup(ID);
  }

  window.CWP.youtube.enhancements = { init, destroy };
})();
