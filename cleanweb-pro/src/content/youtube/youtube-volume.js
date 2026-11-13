/**
 * @file youtube-volume.js (classic script — see shared/namespace.js)
 */
(function () {
  const VOLUME_BOOST_LEVELS = window.CWP.shared.constants.VOLUME_BOOST_LEVELS;
  const MSG = window.CWP.shared.constants.MSG;
  const { guard, sendMessage } = window.CWP.shared.utils;
  const { notify } = window.CWP.core.notificationManager;
  const { logger } = window.CWP.shared.logger;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;

  let pipeline = null;
  let currentLevel = 100;
  let notifyEnabled = true;
  let watchTimer = null;

  function getVideoEl() {
    return document.querySelector('#movie_player video, video.html5-main-video');
  }

  function teardownPipeline() {
    if (!pipeline) return;
    guard(() => pipeline.source.disconnect(), () => {});
    guard(() => pipeline.gain.disconnect(), () => {});
    guard(() => pipeline.context.close(), () => {});
    pipeline = null;
  }

  function buildPipeline(videoEl) {
    teardownPipeline();
    if (!videoEl) return null;
    return guard(() => {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaElementSource(videoEl);
      const gain = context.createGain();
      source.connect(gain).connect(context.destination);
      pipeline = { context, source, gain, videoEl };
      return pipeline;
    }, (err) => {
      logger.error('Failed to build Web Audio pipeline for volume boost', err);
      return null;
    });
  }

  function applyGain(level) {
    currentLevel = level;
    if (level <= 100) {
      teardownPipeline();
      return;
    }
    const videoEl = getVideoEl();
    if (!videoEl) return;
    if (!pipeline || pipeline.videoEl !== videoEl) {
      buildPipeline(videoEl);
    }
    if (pipeline) {
      guard(() => {
        pipeline.gain.gain.value = level / 100;
      }, (err) => logger.error('Failed to set gain', err));
    }
  }

  function getBoostLevel() {
    return currentLevel;
  }

  function setBoostLevel(level) {
    const clamped = VOLUME_BOOST_LEVELS.includes(level) ? level : 100;
    applyGain(clamped);
    if (notifyEnabled) notify(`Volume boost ${clamped}%`, { icon: '🔊' });
    return currentLevel;
  }

  function cycleBoost() {
    const idx = VOLUME_BOOST_LEVELS.indexOf(currentLevel);
    const next = VOLUME_BOOST_LEVELS[(idx + 1) % VOLUME_BOOST_LEVELS.length];
    return setBoostLevel(next);
  }

  async function init(ctx) {
    notifyEnabled = Boolean(ctx.settings.features.smartNotifications);
    if (!ctx.settings.features.volumeBoost) {
      return { active: false };
    }
    const preferred = ctx.settings.player.volumeBoostLevel || 100;
    if (preferred > 100) {
      applyGain(preferred);
    } else {
      currentLevel = preferred;
    }

    watchTimer = setInterval(() => {
      if (currentLevel <= 100) return;
      const videoEl = getVideoEl();
      if (videoEl && pipeline && pipeline.videoEl !== videoEl) {
        buildPipeline(videoEl);
        if (pipeline) pipeline.gain.gain.value = currentLevel / 100;
      }
    }, 1500);

    registerCleanup('youtube-volume', () => {
      if (watchTimer) clearInterval(watchTimer);
      watchTimer = null;
      teardownPipeline();
      unregisterCleanup('youtube-volume');
    });

    return { active: true, level: currentLevel };
  }

  function destroy() {
    if (watchTimer) clearInterval(watchTimer);
    watchTimer = null;
    teardownPipeline();
    unregisterCleanup('youtube-volume');
  }

  async function persistBoostLevel(level) {
    await guard(() => sendMessage(MSG.SET_SETTINGS, { player: { volumeBoostLevel: level } }), (err) =>
      logger.error('Failed to persist volume boost level', err)
    );
  }

  window.CWP.youtube.volume = { getBoostLevel, setBoostLevel, cycleBoost, init, destroy, persistBoostLevel };
})();
