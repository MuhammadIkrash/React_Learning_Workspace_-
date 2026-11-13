/**
 * @file storage-manager.js
 * Wraps chrome.storage.local with hydration (defaults merge) and a small
 * in-memory cache so the service worker doesn't round-trip storage on every
 * message during a burst of activity (e.g. rapid ad-skip events).
 */

import { STORAGE_KEYS } from '../shared/constants.js';
import { DEFAULT_SETTINGS, DEFAULT_STATISTICS } from '../shared/defaults.js';
import { hydrateSettings, hydrateStatistics, deepMerge } from '../shared/storage-schema.js';
import { logger } from '../shared/logger.js';

const cache = new Map();

async function readRaw(key) {
  const result = await chrome.storage.local.get(key);
  return result[key];
}

async function writeRaw(key, value) {
  await chrome.storage.local.set({ [key]: value });
  cache.set(key, value);
}

export async function getSettings() {
  if (cache.has(STORAGE_KEYS.SETTINGS)) return cache.get(STORAGE_KEYS.SETTINGS);
  const stored = await readRaw(STORAGE_KEYS.SETTINGS);
  const hydrated = hydrateSettings(stored);
  cache.set(STORAGE_KEYS.SETTINGS, hydrated);
  return hydrated;
}

export async function setSettings(partialOrFull) {
  const current = await getSettings();
  const next = hydrateSettings(deepMerge(current, partialOrFull));
  await writeRaw(STORAGE_KEYS.SETTINGS, next);
  logger.debug('Settings updated', next);
  return next;
}

export async function getStatistics() {
  if (cache.has(STORAGE_KEYS.STATISTICS)) return cache.get(STORAGE_KEYS.STATISTICS);
  const stored = await readRaw(STORAGE_KEYS.STATISTICS);
  const hydrated = hydrateStatistics(stored);
  cache.set(STORAGE_KEYS.STATISTICS, hydrated);
  return hydrated;
}

export async function setStatistics(stats) {
  await writeRaw(STORAGE_KEYS.STATISTICS, stats);
  return stats;
}

export async function getWhitelist() {
  if (cache.has(STORAGE_KEYS.WHITELIST)) return cache.get(STORAGE_KEYS.WHITELIST);
  const stored = (await readRaw(STORAGE_KEYS.WHITELIST)) || [];
  cache.set(STORAGE_KEYS.WHITELIST, stored);
  return stored;
}

export async function setWhitelist(list) {
  await writeRaw(STORAGE_KEYS.WHITELIST, list);
  return list;
}

export async function getCustomFilters() {
  if (cache.has(STORAGE_KEYS.CUSTOM_FILTERS)) return cache.get(STORAGE_KEYS.CUSTOM_FILTERS);
  const stored = (await readRaw(STORAGE_KEYS.CUSTOM_FILTERS)) || [];
  cache.set(STORAGE_KEYS.CUSTOM_FILTERS, stored);
  return stored;
}

export async function setCustomFilters(filters) {
  await writeRaw(STORAGE_KEYS.CUSTOM_FILTERS, filters);
  return filters;
}

export async function getZapperRules() {
  if (cache.has(STORAGE_KEYS.ZAPPER_RULES)) return cache.get(STORAGE_KEYS.ZAPPER_RULES);
  const stored = (await readRaw(STORAGE_KEYS.ZAPPER_RULES)) || {};
  cache.set(STORAGE_KEYS.ZAPPER_RULES, stored);
  return stored;
}

export async function setZapperRules(rulesByHost) {
  await writeRaw(STORAGE_KEYS.ZAPPER_RULES, rulesByHost);
  return rulesByHost;
}

export async function getSiteProfiles() {
  if (cache.has(STORAGE_KEYS.SITE_PROFILES)) return cache.get(STORAGE_KEYS.SITE_PROFILES);
  const stored = (await readRaw(STORAGE_KEYS.SITE_PROFILES)) || {};
  cache.set(STORAGE_KEYS.SITE_PROFILES, stored);
  return stored;
}

export async function setSiteProfiles(profiles) {
  await writeRaw(STORAGE_KEYS.SITE_PROFILES, profiles);
  return profiles;
}

/** Clears everything and resets to factory defaults (section 33, Reset All Settings). */
export async function resetAll() {
  await chrome.storage.local.clear();
  cache.clear();
  await writeRaw(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  await writeRaw(STORAGE_KEYS.STATISTICS, DEFAULT_STATISTICS);
  await writeRaw(STORAGE_KEYS.WHITELIST, []);
  await writeRaw(STORAGE_KEYS.CUSTOM_FILTERS, []);
  await writeRaw(STORAGE_KEYS.ZAPPER_RULES, {});
  await writeRaw(STORAGE_KEYS.SITE_PROFILES, {});
}

/** Invalidate cache for a key (used when storage changes from another context). */
export function invalidate(key) {
  cache.delete(key);
}

// Keep the in-memory cache in sync if storage is changed from another
// extension surface (popup/dashboard writing directly is avoided in favor of
// message-passing, but this guards against drift regardless).
if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    for (const key of Object.keys(changes)) {
      cache.set(key, changes[key].newValue);
    }
  });
}
