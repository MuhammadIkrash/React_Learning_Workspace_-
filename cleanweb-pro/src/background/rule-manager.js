/**
 * @file rule-manager.js
 * Enables/disables the packaged declarativeNetRequest rulesets based on user
 * settings (protection toggle, per-feature toggles, whitelist). The rulesets
 * themselves live in /rules/*.json and are validated JSON only — this module
 * never constructs or downloads executable rules (section 36).
 */

import { logger } from '../shared/logger.js';
import { guardAsync } from '../shared/utils.js';

const RULESET_IDS = {
  YOUTUBE: 'youtube_rules',
  GOOGLE: 'google_rules',
  NETWORK: 'network_rules'
};

/**
 * Applies the enabled/disabled state of each ruleset from current settings.
 * @param {object} settings hydrated settings object
 */
export async function syncRulesets(settings) {
  await guardAsync(async () => {
    const protectionOn = settings.features.protectionEnabled;
    const wantEnabled = [];
    const wantDisabled = [];

    const youtubeOn = protectionOn && settings.features.youtubeAds;
    const googleOn = protectionOn && settings.features.googleAds;
    // Network-level rules (tracking pixels, third-party ad networks) follow
    // the master protection toggle only.
    const networkOn = protectionOn;

    (youtubeOn ? wantEnabled : wantDisabled).push(RULESET_IDS.YOUTUBE);
    (googleOn ? wantEnabled : wantDisabled).push(RULESET_IDS.GOOGLE);
    (networkOn ? wantEnabled : wantDisabled).push(RULESET_IDS.NETWORK);

    const current = await chrome.declarativeNetRequest.getEnabledRulesets();
    const enableRulesetIds = wantEnabled.filter((id) => !current.includes(id));
    const disableRulesetIds = wantDisabled.filter((id) => current.includes(id));

    if (enableRulesetIds.length || disableRulesetIds.length) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds,
        disableRulesetIds
      });
      logger.debug('Rulesets synced', { enableRulesetIds, disableRulesetIds });
    }
  }, (err) => logger.error('Failed to sync declarativeNetRequest rulesets', err));
}

/**
 * Applies (or removes) a per-tab dynamic allow rule so whitelisted sites
 * bypass network-level blocking entirely, not just DOM-level cleanup.
 * Uses session-scoped dynamic rules so they never persist beyond the browser
 * session and never require broad host permissions to construct.
 */
export async function applyWhitelistSessionRules(whitelistHostnames) {
  await guardAsync(async () => {
    const existing = await chrome.declarativeNetRequest.getSessionRules();
    const existingIds = existing.map((r) => r.id);
    if (existingIds.length) {
      await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: existingIds });
    }
    if (!whitelistHostnames.length) return;

    const newRules = whitelistHostnames.slice(0, 5000).map((hostname, index) => ({
      id: index + 1,
      priority: 100,
      action: { type: 'allowAllRequests' },
      condition: {
        requestDomains: [hostname],
        resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest', 'image', 'media', 'other']
      }
    }));

    await chrome.declarativeNetRequest.updateSessionRules({ addRules: newRules });
    logger.debug('Whitelist session rules applied', newRules.length);
  }, (err) => logger.error('Failed to apply whitelist session rules', err));
}
