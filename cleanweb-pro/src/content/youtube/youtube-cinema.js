/**
 * @file youtube-cinema.js (classic script — see shared/namespace.js)
 */
(function () {
  const MSG = window.CWP.shared.constants.MSG;
  const { clamp, createEl, guard, sendMessage } = window.CWP.shared.utils;
  const { notify } = window.CWP.core.notificationManager;
  const { logger } = window.CWP.shared.logger;

  let overlayEl = null;
  let active = false;
  let opacity = 0.75;
  let notifyEnabled = true;
  let resizeHandler = null;

  function getPlayerEl() {
    return document.querySelector('#movie_player');
  }

  function ensureOverlay() {
    if (overlayEl && document.body.contains(overlayEl)) return overlayEl;
    overlayEl = createEl('div', { className: 'cwp-cinema-overlay' });
    document.body.appendChild(overlayEl);
    return overlayEl;
  }

  function positionOverlay() {
    const player = getPlayerEl();
    const overlay = ensureOverlay();
    if (!player) return;
    const rect = player.getBoundingClientRect();
    overlay.style.setProperty('--cwp-cinema-top', `${Math.max(0, rect.top)}px`);
    overlay.style.setProperty('--cwp-cinema-left', `${Math.max(0, rect.left)}px`);
    overlay.style.setProperty('--cwp-cinema-width', `${rect.width}px`);
    overlay.style.setProperty('--cwp-cinema-height', `${rect.height}px`);
  }

  function isCinemaActive() {
    return active;
  }

  function setOpacity(value) {
    opacity = clamp(value, 0.2, 0.95);
    if (overlayEl) overlayEl.style.setProperty('--cwp-cinema-opacity', String(opacity));
    return opacity;
  }

  function enableCinema() {
    const overlay = ensureOverlay();
    overlay.style.setProperty('--cwp-cinema-opacity', String(opacity));
    overlay.classList.add('cwp-cinema-visible');
    positionOverlay();
    resizeHandler = () => positionOverlay();
    window.addEventListener('resize', resizeHandler, { passive: true });
    window.addEventListener('scroll', resizeHandler, { passive: true });
    active = true;
    if (notifyEnabled) notify('Cinema mode on', { icon: '🎥' });
    return true;
  }

  function disableCinema() {
    guard(() => overlayEl?.classList.remove('cwp-cinema-visible'), () => {});
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('scroll', resizeHandler);
      resizeHandler = null;
    }
    active = false;
    return true;
  }

  function toggleCinema() {
    return active ? (disableCinema(), false) : enableCinema();
  }

  async function init(ctx) {
    notifyEnabled = Boolean(ctx.settings.features.smartNotifications);
    opacity = ctx.settings.player.cinemaOpacity ?? 0.75;
    active = false;
    return { active };
  }

  function destroy() {
    disableCinema();
    guard(() => overlayEl?.remove(), () => {});
    overlayEl = null;
  }

  async function persistOpacity(value) {
    await guard(() => sendMessage(MSG.SET_SETTINGS, { player: { cinemaOpacity: value } }), (err) =>
      logger.error('Failed to persist cinema opacity', err)
    );
  }

  window.CWP.youtube.cinema = { isCinemaActive, setOpacity, enableCinema, disableCinema, toggleCinema, init, destroy, persistOpacity };
})();
