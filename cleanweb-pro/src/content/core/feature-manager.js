/**
 * @file feature-manager.js (classic script — see shared/namespace.js)
 * Note: unlike the original ES-module design, `descriptor.module` is now a
 * plain object (e.g. window.CWP.youtube.speed) that's already loaded by the
 * time bootstrap.js runs, since every file is a synchronously-loaded classic
 * script. No dynamic import is needed or used here anymore.
 */
(function () {
  const { logger } = window.CWP.shared.logger;
  const { guard, guardAsync } = window.CWP.shared.utils;

  const activeFeatures = new Map();

  async function initFeature(descriptor, ctx) {
    const { key, module } = descriptor;
    await guardAsync(async () => {
      const mod = typeof module === 'function' ? module() : module;
      if (!mod || typeof mod.init !== 'function') {
        logger.warn(`Feature "${key}" has no init() export — skipping`);
        return;
      }
      const instance = await mod.init(ctx);
      activeFeatures.set(key, { instance, destroy: mod.destroy });
      logger.debug(`Feature "${key}" initialized`);
    }, (err) => logger.error(`Feature "${key}" failed to initialize; disabling only this feature`, err));
  }

  function destroyFeature(key) {
    const entry = activeFeatures.get(key);
    if (!entry) return;
    guard(() => entry.destroy && entry.destroy(entry.instance), (err) => logger.error(`Feature "${key}" failed to destroy`, err));
    activeFeatures.delete(key);
  }

  function destroyAllFeatures() {
    for (const key of [...activeFeatures.keys()]) destroyFeature(key);
  }

  function isFeatureActive(key) {
    return activeFeatures.has(key);
  }

  function getFeatureInstance(key) {
    return activeFeatures.get(key)?.instance;
  }

  async function applyFeatures(descriptors, { site, settings, whitelisted }, ctx) {
    destroyAllFeatures();
    if (whitelisted) {
      logger.debug('Site is whitelisted — no features initialized');
      return;
    }
    for (const descriptor of descriptors) {
      if (!descriptor.sites.includes(site)) continue;
      const featureEnabled = descriptor.enabledKey ? Boolean(settings.features[descriptor.enabledKey]) : true;
      const masterEnabled = descriptor.masterOnly ? true : settings.features.protectionEnabled;
      if (!featureEnabled || !masterEnabled) continue;
      await initFeature(descriptor, ctx);
    }
  }

  window.CWP.core.featureManager = {
    initFeature,
    destroyFeature,
    destroyAllFeatures,
    isFeatureActive,
    getFeatureInstance,
    applyFeatures
  };
})();
