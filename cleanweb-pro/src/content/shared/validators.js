/**
 * @file validators.js (content-script classic-script build)
 * Mirrors src/shared/validators.js.
 */
(function () {
  const HOSTNAME_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i;
  const SELECTOR_SAFE_RE = /^[a-zA-Z0-9\s\-_.#>*~^$|=\[\]'":(),+]+$/;
  const DANGEROUS_SELECTOR_TOKENS = ['<script', 'javascript:', 'expression(', 'onerror=', 'onload='];

  function isValidHostname(value) {
    if (typeof value !== 'string') return false;
    const v = value.trim().toLowerCase();
    if (v.length === 0 || v.length > 253) return false;
    if (v === 'localhost') return true;
    return HOSTNAME_RE.test(v);
  }

  function isValidSelector(selector) {
    if (typeof selector !== 'string' || selector.trim().length === 0) return false;
    const lower = selector.toLowerCase();
    if (DANGEROUS_SELECTOR_TOKENS.some((tok) => lower.includes(tok))) return false;
    if (!SELECTOR_SAFE_RE.test(selector)) return false;
    try {
      document.createDocumentFragment().querySelector(selector);
      return true;
    } catch {
      return false;
    }
  }

  function isValidFilterAction(action) {
    return action === 'hide' || action === 'remove';
  }

  function isValidCustomFilter(filter) {
    return (
      filter &&
      typeof filter === 'object' &&
      isValidHostname(filter.domain) &&
      isValidSelector(filter.selector) &&
      isValidFilterAction(filter.action)
    );
  }

  window.CWP.shared.validators = {
    isValidHostname,
    isValidSelector,
    isValidFilterAction,
    isValidCustomFilter
  };
})();
