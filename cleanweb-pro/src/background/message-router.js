/**
 * @file message-router.js
 * Single entry point for chrome.runtime.onMessage. Content scripts, the
 * popup, and the dashboard all speak the same small message vocabulary
 * (see shared/constants.js MSG) instead of touching storage directly, which
 * keeps storage.local as the one source of truth and avoids race conditions
 * between multiple writers.
 */

import { MSG, STAT_KEYS } from '../shared/constants.js';
import {
  getSettings,
  setSettings,
  getWhitelist,
  setWhitelist,
  getCustomFilters,
  setCustomFilters,
  getZapperRules,
  setZapperRules,
  getSiteProfiles,
  setSiteProfiles,
  resetAll
} from './storage-manager.js';
import { incrementStat, getStatisticsSummary, resetStatistics } from './statistics-manager.js';
import { syncRulesets, applyWhitelistSessionRules } from './rule-manager.js';
import { isValidHostname, isValidCustomFilter, isValidImportPayload } from '../shared/validators.js';
import { hostnameMatches } from '../shared/utils.js';
import { logger, setDebugEnabled } from '../shared/logger.js';

function ok(data) {
  return { success: true, data };
}
function fail(error) {
  return { success: false, error: String(error && error.message ? error.message : error) };
}

export function registerMessageRouter() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender)
      .then(sendResponse)
      .catch((err) => {
        logger.error('Message handler error', message?.type, err);
        sendResponse(fail(err));
      });
    // Indicates we will respond asynchronously.
    return true;
  });
}

async function handleMessage(message, sender) {
  if (!message || typeof message !== 'object') return fail('Invalid message');
  const { type, payload } = message;

  switch (type) {
    case MSG.PING:
      return ok({ pong: true });

    case MSG.GET_SETTINGS: {
      const settings = await getSettings();
      setDebugEnabled(settings.debugMode);
      return ok(settings);
    }

    case MSG.SET_SETTINGS: {
      const settings = await setSettings(payload);
      setDebugEnabled(settings.debugMode);
      await syncRulesets(settings);
      return ok(settings);
    }

    case MSG.WHITELIST_GET:
      return ok(await getWhitelist());

    case MSG.WHITELIST_ADD: {
      const hostname = String(payload?.hostname || '').trim().toLowerCase();
      if (!isValidHostname(hostname)) return fail('Invalid hostname');
      const list = await getWhitelist();
      if (!list.includes(hostname)) list.push(hostname);
      await setWhitelist(list);
      await applyWhitelistSessionRules(list);
      return ok(list);
    }

    case MSG.WHITELIST_REMOVE: {
      const hostname = String(payload?.hostname || '').trim().toLowerCase();
      const list = (await getWhitelist()).filter((h) => h !== hostname);
      await setWhitelist(list);
      await applyWhitelistSessionRules(list);
      return ok(list);
    }

    case MSG.STATS_INCREMENT: {
      const key = payload?.key;
      if (!Object.values(STAT_KEYS).includes(key)) return fail('Unknown stat key');
      const stats = await incrementStat(key, payload?.amount ?? 1);
      return ok(stats);
    }

    case MSG.STATS_GET:
      return ok(await getStatisticsSummary());

    case MSG.STATS_RESET:
      await resetStatistics();
      return ok(true);

    case MSG.FILTERS_GET:
      return ok(await getCustomFilters());

    case MSG.FILTERS_SET: {
      const filters = Array.isArray(payload) ? payload : [];
      if (!filters.every(isValidCustomFilter)) return fail('One or more filters are invalid');
      await setCustomFilters(filters);
      return ok(filters);
    }

    case MSG.ZAPPER_RULES_GET:
      return ok(await getZapperRules());

    case MSG.ZAPPER_RULES_SET: {
      const hostname = payload?.hostname;
      const rules = payload?.rules;
      if (!isValidHostname(hostname) || !Array.isArray(rules)) return fail('Invalid zapper rules payload');
      const all = await getZapperRules();
      all[hostname] = rules;
      await setZapperRules(all);
      return ok(all[hostname]);
    }

    case MSG.SITE_PROFILE_GET: {
      const hostname = payload?.hostname;
      const all = await getSiteProfiles();
      return ok(all[hostname] || null);
    }

    case MSG.SITE_PROFILE_SET: {
      const hostname = payload?.hostname;
      if (!isValidHostname(hostname)) return fail('Invalid hostname');
      const all = await getSiteProfiles();
      all[hostname] = { ...(all[hostname] || {}), ...(payload?.profile || {}) };
      await setSiteProfiles(all);
      return ok(all[hostname]);
    }

    case MSG.EXPORT_SETTINGS: {
      const [settings, whitelist, customFilters, zapperRules, siteProfiles, statistics] = await Promise.all([
        getSettings(),
        getWhitelist(),
        getCustomFilters(),
        getZapperRules(),
        getSiteProfiles(),
        payload?.includeStatistics ? getStatisticsSummary() : Promise.resolve(null)
      ]);
      const exportPayload = {
        cwp_export_version: 1,
        exportedAt: new Date().toISOString(),
        settings,
        whitelist,
        customFilters,
        zapperRules,
        siteProfiles
      };
      if (statistics) exportPayload.statistics = statistics;
      return ok(exportPayload);
    }

    case MSG.IMPORT_SETTINGS: {
      if (!isValidImportPayload(payload)) return fail('Import file is not a valid CleanWeb Pro export');
      if (payload.settings) await setSettings(payload.settings);
      if (Array.isArray(payload.whitelist)) {
        const validHosts = payload.whitelist.filter(isValidHostname);
        await setWhitelist(validHosts);
        await applyWhitelistSessionRules(validHosts);
      }
      if (Array.isArray(payload.customFilters)) {
        await setCustomFilters(payload.customFilters.filter(isValidCustomFilter));
      }
      if (payload.zapperRules && typeof payload.zapperRules === 'object') {
        await setZapperRules(payload.zapperRules);
      }
      if (payload.siteProfiles && typeof payload.siteProfiles === 'object') {
        await setSiteProfiles(payload.siteProfiles);
      }
      const settings = await getSettings();
      await syncRulesets(settings);
      return ok(true);
    }

    case MSG.RESET_ALL: {
      await resetAll();
      const settings = await getSettings();
      await syncRulesets(settings);
      await applyWhitelistSessionRules([]);
      return ok(true);
    }

    case MSG.OPEN_DASHBOARD: {
      const url = chrome.runtime.getURL('src/dashboard/dashboard.html') + (payload?.section ? `#${payload.section}` : '');
      await chrome.tabs.create({ url });
      return ok(true);
    }

    case MSG.NOTIFY:
      // Notifications are rendered by the content script itself; the
      // background just acknowledges so callers can await consistently.
      return ok(true);

    default:
      return fail(`Unknown message type: ${type}`);
  }
}

/** Utility used by the service-worker bootstrap to check a hostname against the whitelist. */
export async function isHostnameWhitelisted(hostname) {
  const list = await getWhitelist();
  return list.some((entry) => hostnameMatches(hostname, entry));
}
