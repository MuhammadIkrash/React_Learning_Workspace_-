/**
 * @file youtube-ad-handler.js (classic script — see shared/namespace.js)
 */
(function () {
  const AD_STATE = window.CWP.shared.constants.AD_STATE;
  const STAT_KEYS = window.CWP.shared.constants.STAT_KEYS;
  const MSG = window.CWP.shared.constants.MSG;
  const { createAdDetector } = window.CWP.youtube.adDetector;
  const { logger } = window.CWP.shared.logger;
  const { guard, sendMessage } = window.CWP.shared.utils;
  const { notify } = window.CWP.core.notificationManager;

  function getPlayerEl() {
    return document.querySelector('#movie_player');
  }

  function getVideoEl(playerEl) {
    return playerEl?.querySelector('video') || document.querySelector('video.html5-main-video');
  }

  async function init(ctx) {
    let savedRate = null;
    let detector = null;

    async function bumpStat(key) {
      await guard(() => sendMessage(MSG.STATS_INCREMENT, { key }), (err) => logger.error('Stat bump failed', err));
    }

    detector = createAdDetector({
      getPlayerEl,
      pollMs: 250,
      onStateChange: (state) => {
        const playerEl = getPlayerEl();
        const videoEl = getVideoEl(playerEl);

        switch (state) {
          case AD_STATE.AD_DETECTED: {
            if (videoEl && savedRate === null) {
              savedRate = videoEl.playbackRate;
            }
            break;
          }
          case AD_STATE.SKIP_ATTEMPT: {
            const skipBtn = detector.getSkipButton();
            if (skipBtn) {
              guard(() => skipBtn.click(), (err) => logger.error('Skip click failed', err));
            }
            for (const closeBtn of detector.getOverlayCloseButtons()) {
              guard(() => closeBtn.click(), () => {});
            }
            break;
          }
          case AD_STATE.AD_ACTIVE: {
            bumpStat(STAT_KEYS.VIDEO_ADS);
            if (ctx.settings.features.smartNotifications) {
              notify('Ad blocked', { icon: '🛡️' });
            }
            break;
          }
          case AD_STATE.RESTORE_PLAYER: {
            if (videoEl && savedRate !== null) {
              guard(() => {
                videoEl.playbackRate = savedRate;
              }, () => {});
            }
            savedRate = null;
            break;
          }
          default:
            break;
        }
      }
    });

    detector.start();
    return { detector };
  }

  function destroy(instance) {
    instance?.detector?.stop();
  }

  window.CWP.youtube.adHandler = { init, destroy };
})();
