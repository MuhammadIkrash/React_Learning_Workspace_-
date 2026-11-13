/**
 * @file filter-engine.js (classic script — see shared/namespace.js)
 */
(function () {
  const { guard } = window.CWP.shared.utils;
  const { isValidSelector } = window.CWP.shared.validators;
  const { logger } = window.CWP.shared.logger;

  const HIDE_CLASS = 'cwp-filtered';

  function applyRules(rules, root = document) {
    let affected = 0;
    for (const rule of rules) {
      if (rule.enabled === false) continue;
      if (!isValidSelector(rule.selector)) continue;
      const nodes = guard(() => root.querySelectorAll(rule.selector), () => {
        logger.warn('Invalid selector skipped', rule.selector);
        return [];
      });
      for (const node of nodes || []) {
        if (rule.action === 'remove') {
          guard(() => node.remove(), () => {});
          affected++;
        } else if (!node.classList.contains(HIDE_CLASS)) {
          node.classList.add(HIDE_CLASS);
          affected++;
        }
      }
    }
    return affected;
  }

  window.CWP.filters.filterEngine = { applyRules };
})();
