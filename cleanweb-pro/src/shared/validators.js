/**
 * @file validators.js
 * Defensive validation for anything that crosses a trust boundary: user-typed
 * domains/selectors, and imported JSON. Nothing here ever evaluates code.
 */

const HOSTNAME_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i;

/** A conservative CSS selector character allow-list. Rejects anything that looks like it could break out of a rule or embed script-like content. */
const SELECTOR_SAFE_RE = /^[a-zA-Z0-9\s\-_.#>*~^$|=\[\]'":(),+]+$/;
const DANGEROUS_SELECTOR_TOKENS = ['<script', 'javascript:', 'expression(', 'onerror=', 'onload='];

export function isValidHostname(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim().toLowerCase();
  if (v.length === 0 || v.length > 253) return false;
  if (v === 'localhost') return true;
  return HOSTNAME_RE.test(v);
}

/**
 * Validates a CSS selector is syntactically parseable and free of anything
 * resembling script injection. Never returns true for values that would let
 * a saved rule execute code — the zapper and custom filters only ever
 * hide/remove elements via CSS-selector-driven DOM APIs.
 */
export function isValidSelector(selector) {
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

export function isValidFilterAction(action) {
  return action === 'hide' || action === 'remove';
}

export function isValidCustomFilter(filter) {
  return (
    filter &&
    typeof filter === 'object' &&
    isValidHostname(filter.domain) &&
    isValidSelector(filter.selector) &&
    isValidFilterAction(filter.action)
  );
}

/**
 * Validates the top-level shape of an imported settings-export JSON blob
 * before it's ever merged into storage. Rejects anything with unexpected
 * executable-looking content. This is a structural check, not a schema
 * version negotiator — storage-schema.js deep-merges known keys only.
 */
export function isValidImportPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  if (!('cwp_export_version' in payload)) return false;
  const allowedTopLevel = new Set([
    'cwp_export_version',
    'exportedAt',
    'settings',
    'whitelist',
    'customFilters',
    'zapperRules',
    'siteProfiles',
    'statistics'
  ]);
  for (const key of Object.keys(payload)) {
    if (!allowedTopLevel.has(key)) return false;
  }
  if (payload.whitelist && !Array.isArray(payload.whitelist)) return false;
  if (payload.customFilters && !Array.isArray(payload.customFilters)) return false;
  if (payload.customFilters) {
    for (const f of payload.customFilters) {
      if (!isValidCustomFilter(f)) return false;
    }
  }
  return true;
}
