/**
 * @file youtube-pip.js (classic script — see shared/namespace.js)
 */
(function () {
  const { notify } = window.CWP.core.notificationManager;
  const { guard } = window.CWP.shared.utils;
  const { logger } = window.CWP.shared.logger;

  function getVideoEl() {
    return document.querySelector('#movie_player video, video.html5-main-video');
  }

  function isPiPSupported() {
    return Boolean(document.pictureInPictureEnabled);
  }

  function isPiPActive() {
    return Boolean(document.pictureInPictureElement);
  }

  let notifyEnabled = true;

  async function enterPiP() {
    if (!isPiPSupported()) {
      if (notifyEnabled) notify('Picture-in-Picture is not available here', { icon: '🎥' });
      return false;
    }
    const video = getVideoEl();
    if (!video) return false;
    return guard(async () => {
      await video.requestPictureInPicture();
      if (notifyEnabled) notify('Picture-in-Picture on', { icon: '🎥' });
      return true;
    }, (err) => {
      logger.warn('PiP request failed', err);
      if (notifyEnabled) notify('Picture-in-Picture unavailable for this video', { icon: '🎥' });
      return false;
    })();
  }

  async function exitPiP() {
    if (!isPiPActive()) return false;
    return guard(async () => {
      await document.exitPictureInPicture();
      return true;
    }, (err) => {
      logger.warn('Exit PiP failed', err);
      return false;
    })();
  }

  async function togglePiP() {
    if (isPiPActive()) return exitPiP();
    return enterPiP();
  }

  async function init(ctx) {
    notifyEnabled = Boolean(ctx.settings.features.smartNotifications);
    return { supported: isPiPSupported() };
  }

  function destroy() {}

  window.CWP.youtube.pip = { isPiPSupported, isPiPActive, enterPiP, exitPiP, togglePiP, init, destroy };
})();
