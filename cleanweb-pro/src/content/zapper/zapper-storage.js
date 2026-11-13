/**
 * @file zapper-storage.js (classic script — see shared/namespace.js)
 */
(function () {
  const MSG = window.CWP.shared.constants.MSG;
  const { generateId, guard, sendMessage } = window.CWP.shared.utils;
  const { isValidSelector } = window.CWP.shared.validators;
  const { logger } = window.CWP.shared.logger;

  function currentHostname() {
    return location.hostname.replace(/^www\./, '');
  }

  async function getRulesForCurrentSite() {
    const all = await guard(() => sendMessage(MSG.ZAPPER_RULES_GET), () => ({}));
    return (all && all[currentHostname()]) || [];
  }

  async function saveRuleForCurrentSite({ selector, action }) {
    if (!isValidSelector(selector)) throw new Error('Refusing to save an unsafe or invalid selector');
    const hostname = currentHostname();
    const existing = await getRulesForCurrentSite();
    const rule = { id: generateId('zap'), selector, action, createdAt: Date.now() };
    const next = [...existing, rule];
    await sendMessage(MSG.ZAPPER_RULES_SET, { hostname, rules: next });
    return rule;
  }

  async function removeRuleForCurrentSite(ruleId) {
    const hostname = currentHostname();
    const existing = await getRulesForCurrentSite();
    const next = existing.filter((r) => r.id !== ruleId);
    await sendMessage(MSG.ZAPPER_RULES_SET, { hostname, rules: next });
    return next;
  }

  async function clearRulesForCurrentSite() {
    const hostname = currentHostname();
    await sendMessage(MSG.ZAPPER_RULES_SET, { hostname, rules: [] });
  }

  async function applySavedRules() {
    const rules = await getRulesForCurrentSite();
    let affected = 0;
    for (const rule of rules) {
      if (!isValidSelector(rule.selector)) continue;
      const nodes = guard(() => document.querySelectorAll(rule.selector), () => []);
      for (const node of nodes || []) {
        if (rule.action === 'remove') {
          guard(() => node.remove(), () => {});
        } else {
          guard(() => node.classList.add('cwp-zapped'), () => {});
        }
        affected++;
      }
    }
    if (affected > 0) {
      logger.debug(`Zapper applied ${affected} saved rule matches`);
    }
    return affected;
  }

  window.CWP.zapper.storage = {
    getRulesForCurrentSite,
    saveRuleForCurrentSite,
    removeRuleForCurrentSite,
    clearRulesForCurrentSite,
    applySavedRules
  };
})();
