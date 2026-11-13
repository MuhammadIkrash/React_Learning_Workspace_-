/**
 * @file youtube-shortcuts.js (classic script — see shared/namespace.js)
 */
(function () {
  const { guard } = window.CWP.shared.utils;
  const { logger } = window.CWP.shared.logger;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;

  const ID = 'youtube-shortcuts';

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  function eventToShortcutString(event) {
    const parts = [];
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.metaKey) parts.push('Meta');
    const key = event.key;
    if (!['Alt', 'Shift', 'Control', 'Meta'].includes(event.key)) parts.push(key);
    return parts.join('+');
  }

  async function init(ctx) {
    const bindings = ctx.settings.shortcuts;
    const zapperCallback = ctx.onActivateZapper;
    const focusModeCallback = ctx.onToggleFocusMode;
    const Speed = window.CWP.youtube.speed;
    const Theater = window.CWP.youtube.theater;
    const Cinema = window.CWP.youtube.cinema;
    const PiP = window.CWP.youtube.pip;

    function onKeydown(event) {
      if (isTypingTarget(event.target)) return;
      const shortcut = eventToShortcutString(event);

      const actions = {
        [bindings.speedUp]: () => Speed.increaseSpeed(),
        [bindings.speedDown]: () => Speed.decreaseSpeed(),
        [bindings.speedReset]: () => Speed.resetSpeed(),
        [bindings.toggleTheater]: () => Theater.toggleTheater(),
        [bindings.toggleCinema]: () => Cinema.toggleCinema(),
        [bindings.togglePiP]: () => PiP.togglePiP(),
        [bindings.activateZapper]: () => zapperCallback && zapperCallback(),
        [bindings.toggleFocusMode]: () => focusModeCallback && focusModeCallback()
      };

      const action = actions[shortcut];
      if (action) {
        guard(() => action(), (err) => logger.error('Shortcut action failed', err));
        event.preventDefault();
        event.stopPropagation();
      }
    }

    document.addEventListener('keydown', onKeydown, true);

    registerCleanup(ID, () => {
      document.removeEventListener('keydown', onKeydown, true);
      unregisterCleanup(ID);
    });

    return { onKeydown };
  }

  function destroy(instance) {
    if (instance?.onKeydown) document.removeEventListener('keydown', instance.onKeydown, true);
    unregisterCleanup(ID);
  }

  window.CWP.youtube.shortcuts = { init, destroy };
})();
