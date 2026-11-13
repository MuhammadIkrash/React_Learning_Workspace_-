/**
 * @file service-worker.js
 * MV3 background entry point. Keeps almost no logic of its own — it wires
 * together storage, statistics, declarativeNetRequest rule syncing, tab
 * tracking, and message routing, each in its own module (section 1 of spec:
 * "no giant content-script", applies equally to the background).
 */

import { getSettings } from './storage-manager.js';
import { registerMessageRouter, isHostnameWhitelisted } from './message-router.js';
import { syncRulesets, applyWhitelistSessionRules } from './rule-manager.js';
import { registerTabListeners, refreshBadgeForTab, getTabHostname } from './tab-manager.js';
import { getWhitelist } from './storage-manager.js';
import { setDebugEnabled, logger } from '../shared/logger.js';
import { guardAsync } from '../shared/utils.js';

async function bootstrap() {
  await guardAsync(async () => {
    const settings = await getSettings();
    setDebugEnabled(settings.debugMode);
    await syncRulesets(settings);
    const whitelist = await getWhitelist();
    await applyWhitelistSessionRules(whitelist);
    logger.info('CleanWeb Pro service worker ready');
  }, (err) => logger.error('Bootstrap failed', err));
}

registerMessageRouter();

registerTabListeners({
  onTabUpdated: async (tab) => {
    if (!tab?.id) return;
    const settings = await getSettings();
    const hostname = getTabHostname(tab.id);
    const whitelisted = hostname ? await isHostnameWhitelisted(hostname) : false;
    await refreshBadgeForTab(tab.id, settings.features.protectionEnabled, whitelisted);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  await guardAsync(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    const actionMap = {
      'toggle-protection': 'TOGGLE_PROTECTION',
      'activate-zapper': 'ACTIVATE_ZAPPER',
      'toggle-theater': 'TOGGLE_THEATER',
      'toggle-cinema': 'TOGGLE_CINEMA'
    };
    const action = actionMap[command];
    if (!action) return;
    if (action === 'TOGGLE_PROTECTION') {
      const settings = await getSettings();
      const next = await import('./storage-manager.js').then((m) =>
        m.setSettings({ features: { ...settings.features, protectionEnabled: !settings.features.protectionEnabled } })
      );
      await syncRulesets(next);
    }
    chrome.tabs.sendMessage(tab.id, { type: 'COMMAND', command: action }).catch(() => {
      // No content script on this tab (e.g. chrome:// page) — safe to ignore.
    });
  }, (err) => logger.error('Command handling failed', err));
});

chrome.runtime.onInstalled.addListener((details) => {
  guardAsync(async () => {
    await bootstrap();
    if (details.reason === 'install') {
      await chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/dashboard.html#welcome') });
    }
  }, (err) => logger.error('onInstalled failed', err));
});

chrome.runtime.onStartup.addListener(() => {
  bootstrap();
});

// Service workers can be terminated and woken on demand; run bootstrap
// immediately too so rulesets are correct even if woken by an alarm/message
// rather than onInstalled/onStartup.
bootstrap();
