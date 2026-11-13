/**
 * @file youtube-theater.js (classic script — see shared/namespace.js)
 */
(function () {
  const { notify } = window.CWP.core.notificationManager;
  const { guard } = window.CWP.shared.utils;

  const THEATER_CLASS = 'cwp-theater-active';
  let active = false;
  let notifyEnabled = true;

  function getFlexyEl() {
    return document.querySelector('ytd-watch-flexy');
  }

  function isTheaterActive() {
    return active;
  }

  function enableTheater() {
    const flexy = getFlexyEl();
    if (!flexy) return false;
    guard(() => flexy.classList.add(THEATER_CLASS), () => {});
    active = true;
    if (notifyEnabled) notify('Theater mode on', { icon: '🎬' });
    return true;
  }

  function disableTheater() {
    const flexy = getFlexyEl();
    guard(() => flexy?.classList.remove(THEATER_CLASS), () => {});
    active = false;
    return true;
  }

  function toggleTheater() {
    return active ? (disableTheater(), false) : enableTheater();
  }

  async function init(ctx) {
    notifyEnabled = Boolean(ctx.settings.features.smartNotifications);
    active = false;
    return { active };
  }

  function destroy() {
    guard(() => getFlexyEl()?.classList.remove(THEATER_CLASS), () => {});
    active = false;
  }

  window.CWP.youtube.theater = { isTheaterActive, enableTheater, disableTheater, toggleTheater, init, destroy };
})();
