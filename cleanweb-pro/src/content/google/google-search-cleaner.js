/**
 * @file google-search-cleaner.js (classic script — see shared/namespace.js)
 */
(function () {
  const { registerHandler, unregisterHandler } = window.CWP.core.observerManager;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;
  const { guard } = window.CWP.shared.utils;

  const ID = 'google-search-cleaner';

  const CLASS_MAP = {
    compactSearchLayout: 'cwp-google-compact',
    hideShoppingBlocks: 'cwp-google-hide-shopping',
    hideRelatedQuestions: 'cwp-google-hide-paa',
    hideUnwantedPanels: 'cwp-google-hide-panels'
  };

  function readOptionFlags(settings) {
    return {
      compactSearchLayout: Boolean(settings.features.googleSearchCleaner) && Boolean(settings.googleSearchOptions?.compact),
      hideShoppingBlocks: Boolean(settings.googleSearchOptions?.hideShopping),
      hideRelatedQuestions: Boolean(settings.googleSearchOptions?.hideRelatedQuestions),
      hideUnwantedPanels: Boolean(settings.googleSearchOptions?.hidePanels)
    };
  }

  function applyClasses(settings) {
    const flags = readOptionFlags(settings);
    const root = document.documentElement;
    for (const [flagKey, className] of Object.entries(CLASS_MAP)) {
      root.classList.toggle(className, Boolean(flags[flagKey]));
    }
  }

  async function init(ctx) {
    applyClasses(ctx.settings);

    registerHandler(ID, () => {
      guard(() => applyClasses(ctx.settings), () => {});
    });

    registerCleanup(ID, () => {
      unregisterHandler(ID);
      for (const className of Object.values(CLASS_MAP)) document.documentElement.classList.remove(className);
      unregisterCleanup(ID);
    });

    return { applied: true };
  }

  function destroy() {
    unregisterHandler(ID);
    for (const className of Object.values(CLASS_MAP)) document.documentElement.classList.remove(className);
    unregisterCleanup(ID);
  }

  window.CWP.google.searchCleaner = { init, destroy };
})();
