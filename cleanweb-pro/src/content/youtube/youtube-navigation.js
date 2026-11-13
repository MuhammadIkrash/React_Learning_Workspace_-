/**
 * @file youtube-navigation.js (classic script — see shared/namespace.js)
 */
(function () {
  const { guard } = window.CWP.shared.utils;
  const { logger } = window.CWP.shared.logger;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;

  const ID = 'youtube-navigation';
  const POSITIONS_KEY_PREFIX = 'cwp_pos_';

  function getVideoEl() {
    return document.querySelector('#movie_player video, video.html5-main-video');
  }

  function getVideoId() {
    const params = new URLSearchParams(location.search);
    return params.get('v');
  }

  function disableAutoplayToggle() {
    const btn = document.querySelector('.ytp-autonav-toggle-button[aria-checked="true"]');
    if (btn) guard(() => btn.click(), () => {});
  }

  async function savePosition(videoId, time) {
    if (!videoId || !Number.isFinite(time)) return;
    await guard(
      () => chrome.storage.local.set({ [`${POSITIONS_KEY_PREFIX}${videoId}`]: { time, savedAt: Date.now() } }),
      (err) => logger.error('Failed to save playback position', err)
    );
  }

  async function loadPosition(videoId) {
    if (!videoId) return null;
    const key = `${POSITIONS_KEY_PREFIX}${videoId}`;
    const result = await guard(() => chrome.storage.local.get(key), () => ({}));
    return result?.[key]?.time ?? null;
  }

  async function init(ctx) {
    const features = ctx.settings.features;
    let autoplayInterval = null;
    let saveInterval = null;
    let visibilityHandler = null;
    let wasPlayingBeforeHide = false;

    if (features.disableAutoplay) {
      disableAutoplayToggle();
      autoplayInterval = setInterval(disableAutoplayToggle, 3000);
    }

    if (ctx.settings.player.rememberPlaybackPosition) {
      const videoId = getVideoId();
      const video = getVideoEl();
      if (video && videoId) {
        const savedTime = await loadPosition(videoId);
        if (savedTime && savedTime > 5 && video.duration && savedTime < video.duration - 10) {
          guard(() => {
            video.currentTime = savedTime;
          }, () => {});
        }
      }
      saveInterval = setInterval(() => {
        const v = getVideoEl();
        const id = getVideoId();
        if (v && id && !v.paused) savePosition(id, v.currentTime);
      }, 5000);
    }

    if (features.autoPauseHiddenTab) {
      visibilityHandler = () => {
        const video = getVideoEl();
        if (!video) return;
        if (document.hidden) {
          wasPlayingBeforeHide = !video.paused;
          if (wasPlayingBeforeHide) guard(() => video.pause(), () => {});
        } else if (wasPlayingBeforeHide) {
          guard(() => video.play().catch(() => {}), () => {});
          wasPlayingBeforeHide = false;
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }

    registerCleanup(ID, () => {
      if (autoplayInterval) clearInterval(autoplayInterval);
      if (saveInterval) clearInterval(saveInterval);
      if (visibilityHandler) document.removeEventListener('visibilitychange', visibilityHandler);
      unregisterCleanup(ID);
    });

    return { autoplayInterval, saveInterval, visibilityHandler };
  }

  function destroy(instance) {
    if (instance?.autoplayInterval) clearInterval(instance.autoplayInterval);
    if (instance?.saveInterval) clearInterval(instance.saveInterval);
    if (instance?.visibilityHandler) document.removeEventListener('visibilitychange', instance.visibilityHandler);
    unregisterCleanup(ID);
  }

  window.CWP.youtube.navigation = { init, destroy };
})();
