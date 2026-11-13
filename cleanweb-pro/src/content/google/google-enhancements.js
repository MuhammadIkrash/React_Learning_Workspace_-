/**
 * @file google-enhancements.js (classic script — see shared/namespace.js)
 */
(function () {
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;

  const ID = 'google-enhancements';
  const CLASS_NAME = 'cwp-google-reading-mode';

  async function init(ctx) {
    const enabled = Boolean(ctx.settings.googleSearchOptions?.readingMode);
    document.documentElement.classList.toggle(CLASS_NAME, enabled);

    registerCleanup(ID, () => {
      document.documentElement.classList.remove(CLASS_NAME);
      unregisterCleanup(ID);
    });

    return { enabled };
  }

  function destroy() {
    document.documentElement.classList.remove(CLASS_NAME);
    unregisterCleanup(ID);
  }

  window.CWP.google.enhancements = { init, destroy };
})();
