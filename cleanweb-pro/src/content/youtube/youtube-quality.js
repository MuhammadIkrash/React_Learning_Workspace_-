/**
 * @file youtube-quality.js (classic script — see shared/namespace.js)
 */
(function () {
  const QUALITY_LEVELS = window.CWP.shared.constants.QUALITY_LEVELS;
  const MSG = window.CWP.shared.constants.MSG;
  const { guard, sendMessage } = window.CWP.shared.utils;
  const { notify } = window.CWP.core.notificationManager;
  const { logger } = window.CWP.shared.logger;

  function getPlayer() {
    const el = document.querySelector('#movie_player');
    return el && typeof el.getAvailableQualityLevels === 'function' ? el : null;
  }

  function getAvailableQualities() {
    const player = getPlayer();
    if (!player) return [];
    return guard(() => player.getAvailableQualityLevels() || [], () => []);
  }

  function getCurrentQuality() {
    const player = getPlayer();
    if (!player) return 'auto';
    return guard(() => player.getPlaybackQuality() || 'auto', () => 'auto');
  }

  function isQualityAvailable(qualityValue) {
    if (qualityValue === 'auto') return true;
    return getAvailableQualities().includes(qualityValue);
  }

  let notifyEnabled = true;

  function setQuality(qualityValue) {
    const player = getPlayer();
    const meta = QUALITY_LEVELS.find((q) => q.value === qualityValue);
    const label = meta?.label || qualityValue;

    if (!player) {
      return { applied: 'auto', requested: qualityValue, wasAvailable: false };
    }

    if (qualityValue !== 'auto' && !isQualityAvailable(qualityValue)) {
      if (notifyEnabled) notify(`${label} unavailable — falling back`, { icon: '📺' });
      return { applied: getCurrentQuality(), requested: qualityValue, wasAvailable: false };
    }

    guard(() => {
      player.setPlaybackQualityRange(qualityValue, qualityValue);
    }, (err) => logger.error('setPlaybackQualityRange failed', err));

    if (notifyEnabled) notify(`Quality set to ${label}`, { icon: '📺' });
    return { applied: qualityValue, requested: qualityValue, wasAvailable: true };
  }

  function applySmartQuality(preferredTier) {
    const available = getAvailableQualities();
    const priorityOrder = ['hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small', 'tiny'];
    const tierIndex = priorityOrder.indexOf(preferredTier);
    const candidates = tierIndex >= 0 ? priorityOrder.slice(tierIndex) : priorityOrder;
    const best = candidates.find((q) => available.includes(q));
    if (best && best !== getCurrentQuality()) {
      return setQuality(best);
    }
    return { applied: getCurrentQuality(), requested: preferredTier, wasAvailable: Boolean(best) };
  }

  async function init(ctx) {
    notifyEnabled = Boolean(ctx.settings.features.smartNotifications);
    const preferred = ctx.settings.player.preferredQuality || 'auto';

    if (preferred !== 'auto') {
      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        const player = getPlayer();
        if (player) {
          clearInterval(timer);
          if (ctx.settings.features.smartQuality) {
            applySmartQuality(preferred);
          } else {
            setQuality(preferred);
          }
        } else if (attempts > 30) {
          clearInterval(timer);
        }
      }, 400);
    }

    return { preferred };
  }

  function destroy() {}

  async function persistPreferredQuality(qualityValue) {
    await guard(() => sendMessage(MSG.SET_SETTINGS, { player: { preferredQuality: qualityValue } }), (err) =>
      logger.error('Failed to persist preferred quality', err)
    );
  }

  window.CWP.youtube.quality = {
    getAvailableQualities,
    getCurrentQuality,
    isQualityAvailable,
    setQuality,
    applySmartQuality,
    init,
    destroy,
    persistPreferredQuality
  };
})();
