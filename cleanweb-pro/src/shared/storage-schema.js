/**
 * @file storage-schema.js
 * Describes the shape of everything CleanWeb Pro keeps in chrome.storage.local.
 * Nothing here is executable logic beyond simple deep-merge helpers; it exists
 * so every reader/writer agrees on structure, and so the Privacy page can be
 * generated straight from this file instead of drifting out of sync with it.
 *
 * chrome.storage.local layout:
 *
 *   cwp_settings        -> Settings            (see defaults.js DEFAULT_SETTINGS)
 *   cwp_site_profiles   -> { [hostname]: SiteProfile }
 *   cwp_whitelist       -> string[]            (hostnames)
 *   cwp_custom_filters  -> CustomFilter[]
 *   cwp_zapper_rules    -> { [hostname]: ZapperRule[] }
 *   cwp_statistics      -> Statistics           (see defaults.js DEFAULT_STATISTICS)
 *
 * CustomFilter = { id, domain, selector, action: 'hide'|'remove', enabled }
 * ZapperRule   = { id, selector, action: 'hide'|'remove', createdAt }
 */

import { DEFAULT_SETTINGS, DEFAULT_STATISTICS } from './defaults.js';

/**
 * Deep-merges `overrides` onto `base` without mutating either, so a partial
 * settings object saved in v1 still gets any new keys added in later versions.
 * @param {object} base
 * @param {object} overrides
 * @returns {object}
 */
export function deepMerge(base, overrides) {
  if (typeof overrides !== 'object' || overrides === null || Array.isArray(overrides)) {
    return overrides === undefined ? base : overrides;
  }
  const result = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(overrides)) {
    if (
      typeof base?.[key] === 'object' &&
      base[key] !== null &&
      !Array.isArray(base[key]) &&
      typeof overrides[key] === 'object' &&
      overrides[key] !== null &&
      !Array.isArray(overrides[key])
    ) {
      result[key] = deepMerge(base[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

export function hydrateSettings(stored) {
  return deepMerge(DEFAULT_SETTINGS, stored || {});
}

export function hydrateStatistics(stored) {
  return deepMerge(DEFAULT_STATISTICS, stored || {});
}
