/**
 * @file zapper-overlay.js (classic script — see shared/namespace.js)
 */
(function () {
  const { createEl, guard } = window.CWP.shared.utils;
  const { generateSelector, describeElement } = window.CWP.zapper.selectorGenerator;

  let highlightBox = null;
  let labelEl = null;
  let toolbarEl = null;
  let cursorStyleEl = null;

  function ensureHighlightBox() {
    if (highlightBox && document.body.contains(highlightBox)) return highlightBox;
    highlightBox = createEl('div', { className: 'cwp-zap-highlight' });
    labelEl = createEl('div', { className: 'cwp-zap-label' });
    highlightBox.appendChild(labelEl);
    document.documentElement.appendChild(highlightBox);
    return highlightBox;
  }

  function highlightElement(el) {
    if (!el) return;
    const box = ensureHighlightBox();
    const rect = el.getBoundingClientRect();
    box.style.top = `${rect.top + window.scrollY}px`;
    box.style.left = `${rect.left + window.scrollX}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    box.classList.add('cwp-zap-highlight-visible');
    labelEl.textContent = describeElement(el);
  }

  function clearHighlight() {
    guard(() => highlightBox?.classList.remove('cwp-zap-highlight-visible'), () => {});
  }

  function removeHighlight() {
    guard(() => highlightBox?.remove(), () => {});
    highlightBox = null;
    labelEl = null;
  }

  function setZapperCursor(active) {
    if (active) {
      if (!cursorStyleEl) {
        cursorStyleEl = createEl('style', { attrs: { 'data-cwp': 'zapper-cursor' } });
        cursorStyleEl.textContent = '* { cursor: crosshair !important; }';
        document.head.appendChild(cursorStyleEl);
      }
    } else {
      guard(() => cursorStyleEl?.remove(), () => {});
      cursorStyleEl = null;
    }
  }

  function renderToolbar(handlers) {
    removeToolbar();
    toolbarEl = createEl('div', { className: 'cwp-zap-toolbar', attrs: { role: 'toolbar', 'aria-label': 'Element Zapper controls' } });

    const title = createEl('span', { className: 'cwp-zap-toolbar-title', text: '⚡ Zapper active — click an element to remove it' });

    const undoBtn = createEl('button', { className: 'cwp-zap-toolbar-btn', attrs: { type: 'button' }, text: 'Undo' });
    const redoBtn = createEl('button', { className: 'cwp-zap-toolbar-btn', attrs: { type: 'button' }, text: 'Redo' });
    const clearCurrentBtn = createEl('button', { className: 'cwp-zap-toolbar-btn', attrs: { type: 'button' }, text: 'Clear last' });
    const clearAllBtn = createEl('button', { className: 'cwp-zap-toolbar-btn cwp-zap-toolbar-btn-danger', attrs: { type: 'button' }, text: 'Clear all site rules' });
    const disableBtn = createEl('button', { className: 'cwp-zap-toolbar-btn', attrs: { type: 'button' }, text: 'Disable Zapper' });

    undoBtn.addEventListener('click', () => handlers.onUndo?.());
    redoBtn.addEventListener('click', () => handlers.onRedo?.());
    clearCurrentBtn.addEventListener('click', () => handlers.onClearCurrent?.());
    clearAllBtn.addEventListener('click', () => handlers.onClearAll?.());
    disableBtn.addEventListener('click', () => handlers.onDisable?.());

    toolbarEl.append(title, undoBtn, redoBtn, clearCurrentBtn, clearAllBtn, disableBtn);
    document.documentElement.appendChild(toolbarEl);

    return { toolbarEl, undoBtn, redoBtn };
  }

  function removeToolbar() {
    guard(() => toolbarEl?.remove(), () => {});
    toolbarEl = null;
  }

  function generateSelectorForElement(el) {
    return generateSelector(el);
  }

  window.CWP.zapper.overlay = {
    highlightElement,
    clearHighlight,
    removeHighlight,
    setZapperCursor,
    renderToolbar,
    removeToolbar,
    generateSelectorForElement
  };
})();
