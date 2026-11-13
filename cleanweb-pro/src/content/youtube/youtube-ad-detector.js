/**
 * @file youtube-ad-detector.js (classic script — see shared/namespace.js)
 */
(function () {
  const AD_STATE = window.CWP.shared.constants.AD_STATE;
  const { logger } = window.CWP.shared.logger;
  const { guard } = window.CWP.shared.utils;

  function hasAdSignal(playerEl) {
    if (!playerEl) return false;
    return guard(() => {
      if (playerEl.classList.contains('ad-showing') || playerEl.classList.contains('ad-interrupting')) return true;
      if (playerEl.querySelector('.ytp-ad-player-overlay')) return true;
      if (playerEl.querySelector('.video-ads .ytp-ad-module')?.childElementCount) return true;
      const skipBtn = playerEl.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
      if (skipBtn) return true;
      if (playerEl.querySelector('.ytp-ad-preview-container')) return true;
      return false;
    }, () => false) || false;
  }

  function getSkipButton(playerEl) {
    return playerEl?.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button') || null;
  }

  function getAdOverlayCloseButtons(playerEl) {
    if (!playerEl) return [];
    return [...playerEl.querySelectorAll('.ytp-ad-overlay-close-button, .ytp-ad-overlay-close-icon')];
  }

  function createAdDetector({ getPlayerEl, onStateChange, pollMs = 300 }) {
    let state = AD_STATE.IDLE;
    let timer = null;

    function setState(next) {
      if (next === state) return;
      logger.debug('Ad state change', state, '->', next);
      state = next;
      guard(() => onStateChange(next), (err) => logger.error('onStateChange handler threw', err));
    }

    function tick() {
      const playerEl = guard(getPlayerEl, () => null);
      const adActive = hasAdSignal(playerEl);

      switch (state) {
        case AD_STATE.IDLE:
          if (adActive) setState(AD_STATE.AD_DETECTED);
          break;
        case AD_STATE.AD_DETECTED:
          setState(AD_STATE.SKIP_ATTEMPT);
          break;
        case AD_STATE.SKIP_ATTEMPT:
          setState(AD_STATE.AD_ACTIVE);
          break;
        case AD_STATE.AD_ACTIVE:
          if (!adActive) setState(AD_STATE.AD_FINISHED);
          break;
        case AD_STATE.AD_FINISHED:
          setState(AD_STATE.RESTORE_PLAYER);
          break;
        case AD_STATE.RESTORE_PLAYER:
          setState(AD_STATE.IDLE);
          break;
        default:
          setState(AD_STATE.IDLE);
      }
    }

    return {
      start() {
        if (timer) return;
        timer = setInterval(tick, pollMs);
        logger.debug('Ad detector started');
      },
      stop() {
        if (timer) clearInterval(timer);
        timer = null;
        state = AD_STATE.IDLE;
      },
      getState: () => state,
      getSkipButton: () => getSkipButton(guard(getPlayerEl, () => null)),
      getOverlayCloseButtons: () => getAdOverlayCloseButtons(guard(getPlayerEl, () => null))
    };
  }

  window.CWP.youtube.adDetector = { createAdDetector };
})();
