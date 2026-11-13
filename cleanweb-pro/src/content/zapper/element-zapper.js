/**
 * @file element-zapper.js (classic script — see shared/namespace.js)
 */
(function () {
  const STAT_KEYS = window.CWP.shared.constants.STAT_KEYS;
  const MSG = window.CWP.shared.constants.MSG;
  const { guard, sendMessage } = window.CWP.shared.utils;
  const { notify } = window.CWP.core.notificationManager;
  const { logger } = window.CWP.shared.logger;
  const { registerCleanup, unregisterCleanup } = window.CWP.core.cleanupManager;
  const {
    highlightElement,
    clearHighlight,
    removeHighlight,
    setZapperCursor,
    renderToolbar,
    removeToolbar,
    generateSelectorForElement
  } = window.CWP.zapper.overlay;
  const { saveRuleForCurrentSite, removeRuleForCurrentSite, clearRulesForCurrentSite, applySavedRules } = window.CWP.zapper.storage;

  const ID = 'element-zapper';

  let active = false;
  let undoStack = [];
  let redoStack = [];
  let notifyEnabled = true;

  function isZapperUI(el) {
    return Boolean(el.closest('.cwp-zap-toolbar, .cwp-zap-highlight, .cwp-zap-label'));
  }

  function onMouseOver(event) {
    const el = event.target;
    if (!el || isZapperUI(el)) return;
    highlightElement(el);
  }

  function onMouseOut() {
    clearHighlight();
  }

  async function onClick(event) {
    const el = event.target;
    if (!el || isZapperUI(el)) return;
    event.preventDefault();
    event.stopPropagation();

    const selector = generateSelectorForElement(el);
    if (!selector) {
      notify('Could not build a safe selector for that element', { icon: '⚡' });
      return;
    }

    await guard(async () => {
      const rule = await saveRuleForCurrentSite({ selector, action: 'hide' });
      el.classList.add('cwp-zapped');
      undoStack.push(rule);
      redoStack = [];
      clearHighlight();
      if (notifyEnabled) notify('Element removed', { icon: '⚡' });
      await sendMessage(MSG.STATS_INCREMENT, { key: STAT_KEYS.ELEMENTS_ZAPPED });
    }, (err) => {
      logger.error('Failed to save zapper rule', err);
      notify('Could not save that rule', { icon: '⚡' });
    });
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      deactivateZapperMode();
    }
  }

  async function handleUndo() {
    const rule = undoStack.pop();
    if (!rule) return;
    await guard(async () => {
      await removeRuleForCurrentSite(rule.id);
      for (const node of document.querySelectorAll(rule.selector)) {
        node.classList.remove('cwp-zapped');
      }
      redoStack.push(rule);
      notify('Undo: element restored', { icon: '↩️' });
    }, (err) => logger.error('Undo failed', err));
  }

  async function handleRedo() {
    const rule = redoStack.pop();
    if (!rule) return;
    await guard(async () => {
      await saveRuleForCurrentSite({ selector: rule.selector, action: rule.action });
      for (const node of document.querySelectorAll(rule.selector)) {
        node.classList.add('cwp-zapped');
      }
      undoStack.push(rule);
      notify('Redo: element removed again', { icon: '↪️' });
    }, (err) => logger.error('Redo failed', err));
  }

  async function handleClearCurrent() {
    return handleUndo();
  }

  async function handleClearAll() {
    const confirmed = window.confirm('Remove all CleanWeb Pro Zapper rules for this site?');
    if (!confirmed) return;
    await guard(async () => {
      await clearRulesForCurrentSite();
      for (const node of document.querySelectorAll('.cwp-zapped')) {
        node.classList.remove('cwp-zapped');
      }
      undoStack = [];
      redoStack = [];
      notify('All Zapper rules cleared for this site', { icon: '🗑️' });
    }, (err) => logger.error('Clear all failed', err));
  }

  function activateZapperMode() {
    if (active) return;
    active = true;
    setZapperCursor(true);
    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeydown, true);
    renderToolbar({
      onUndo: handleUndo,
      onRedo: handleRedo,
      onClearCurrent: handleClearCurrent,
      onClearAll: handleClearAll,
      onDisable: deactivateZapperMode
    });
  }

  function deactivateZapperMode() {
    if (!active) return;
    active = false;
    setZapperCursor(false);
    clearHighlight();
    removeToolbar();
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('mouseout', onMouseOut, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeydown, true);
  }

  function isZapperActive() {
    return active;
  }

  async function init(ctx) {
    notifyEnabled = Boolean(ctx.settings.features.smartNotifications);
    const affected = await applySavedRules();

    registerCleanup(ID, () => {
      deactivateZapperMode();
      removeHighlight();
      unregisterCleanup(ID);
    });

    return { affected };
  }

  function destroy() {
    deactivateZapperMode();
    removeHighlight();
    unregisterCleanup(ID);
  }

  window.CWP.zapper.elementZapper = { activateZapperMode, deactivateZapperMode, isZapperActive, init, destroy };
})();
