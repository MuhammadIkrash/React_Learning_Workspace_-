/**
 * @file youtube-shorts.js (classic script — see shared/namespace.js)
 */
(function () {
  const { guard } = window.CWP.shared.utils;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;

  const ID = 'youtube-shorts';

  function getActiveShortVideo() {
    const videos = [...document.querySelectorAll('ytd-shorts video, #shorts-player video')];
    return videos.find((v) => !v.paused) || videos[0] || null;
  }

  function clickNav(direction) {
    const selector =
      direction === 'next'
        ? '#navigation-button-down button, #navigation-button-down a'
        : '#navigation-button-up button, #navigation-button-up a';
    const btn = document.querySelector(selector);
    if (btn) guard(() => btn.click(), () => {});
  }

  function togglePlayPause() {
    const video = getActiveShortVideo();
    if (!video) return;
    guard(() => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    }, () => {});
  }

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  function onKeydown(event) {
    if (isTypingTarget(event.target)) return;
    switch (event.key.toLowerCase()) {
      case 'j':
        clickNav('previous');
        break;
      case 'k':
        togglePlayPause();
        break;
      case 'l':
        clickNav('next');
        break;
      default:
        return;
    }
    event.stopPropagation();
  }

  async function init(ctx) {
    document.addEventListener('keydown', onKeydown, true);
    document.documentElement.classList.toggle('cwp-shorts-cleanup', Boolean(ctx.settings.features.shortsTools));

    registerCleanup(ID, () => {
      document.removeEventListener('keydown', onKeydown, true);
      document.documentElement.classList.remove('cwp-shorts-cleanup');
      unregisterCleanup(ID);
    });

    return { active: true };
  }

  function destroy() {
    document.removeEventListener('keydown', onKeydown, true);
    document.documentElement.classList.remove('cwp-shorts-cleanup');
    unregisterCleanup(ID);
  }

  window.CWP.youtube.shorts = { init, destroy };
})();
