/**
 * @file youtube-speed.js (classic script — see shared/namespace.js)
 */
(function () {
  const PLAYBACK_SPEEDS = window.CWP.shared.constants.PLAYBACK_SPEEDS;
  const MSG = window.CWP.shared.constants.MSG;
  const { clamp, formatSpeed, guard, sendMessage } = window.CWP.shared.utils;
  const { notify } = window.CWP.core.notificationManager;
  const { logger } = window.CWP.shared.logger;

  let currentSpeed = 1;
  let notifyEnabled = true;

  function getVideoEl() {
    return document.querySelector('#movie_player video, video.html5-main-video');
  }

  function isAdActive() {
    const player = document.querySelector('#movie_player');
    return Boolean(player?.classList.contains('ad-showing'));
  }

  function getSpeed() {
    return currentSpeed;
  }

  function applySpeed(speed, { silent = false } = {}) {
    const clamped = clamp(speed, PLAYBACK_SPEEDS[0], PLAYBACK_SPEEDS[PLAYBACK_SPEEDS.length - 1]);
    currentSpeed = clamped;
    if (isAdActive()) {
      return currentSpeed;
    }
    const video = getVideoEl();
    if (video) {
      guard(() => {
        video.playbackRate = clamped;
      }, (err) => logger.error('Failed to set playbackRate', err));
    }
    if (!silent && notifyEnabled) {
      notify(`Speed changed to ${formatSpeed(clamped)}`, { icon: '⏱️' });
    }
    return currentSpeed;
  }

  function increaseSpeed() {
    const idx = PLAYBACK_SPEEDS.indexOf(currentSpeed);
    const next = idx >= 0 && idx < PLAYBACK_SPEEDS.length - 1 ? PLAYBACK_SPEEDS[idx + 1] : Math.min(4, currentSpeed + 0.25);
    return applySpeed(next);
  }

  function decreaseSpeed() {
    const idx = PLAYBACK_SPEEDS.indexOf(currentSpeed);
    const next = idx > 0 ? PLAYBACK_SPEEDS[idx - 1] : Math.max(0.25, currentSpeed - 0.25);
    return applySpeed(next);
  }

  function resetSpeed() {
    return applySpeed(1);
  }

  async function init(ctx) {
    notifyEnabled = Boolean(ctx.settings.features.smartNotifications);
    const preferred = ctx.settings.player.preferredSpeed || 1;
    currentSpeed = preferred;

    const video = getVideoEl();
    if (video) {
      applySpeed(preferred, { silent: true });
    } else {
      const observer = new MutationObserver(() => {
        const v = getVideoEl();
        if (v) {
          applySpeed(preferred, { silent: true });
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 8000);
    }

    return { preferred };
  }

  function destroy() {
    // Nothing to tear down — playbackRate is left as-is for the user's session.
  }

  async function persistPreferredSpeed(speed) {
    await guard(() => sendMessage(MSG.SET_SETTINGS, { player: { preferredSpeed: speed } }), (err) =>
      logger.error('Failed to persist preferred speed', err)
    );
  }

  window.CWP.youtube.speed = { getSpeed, applySpeed, increaseSpeed, decreaseSpeed, resetSpeed, init, destroy, persistPreferredSpeed };
})();
