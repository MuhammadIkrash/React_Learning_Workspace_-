/**
 * @file tab-manager.js
 * Tracks which tabs are on a recognized site and updates the action (toolbar)
 * icon/badge to reflect protection state. Keeps no browsing-history log —
 * only the currently-open tab's hostname is held in memory, and only to
 * render the popup's "Current Site" field.
 */

import { hostnameFromUrl } from '../shared/utils.js';
import { logger } from '../shared/logger.js';
import { guardAsync } from '../shared/utils.js';

/** In-memory only: tabId -> hostname. Cleared automatically as tabs close. */
const activeTabHosts = new Map();

export function getTabHostname(tabId) {
  return activeTabHosts.get(tabId) || null;
}

export async function refreshBadgeForTab(tabId, isProtected, isWhitelisted) {
  await guardAsync(async () => {
    if (!isProtected) {
      await chrome.action.setBadgeText({ tabId, text: '' });
      return;
    }
    if (isWhitelisted) {
      await chrome.action.setBadgeText({ tabId, text: 'OFF' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#8a8f98' });
    } else {
      await chrome.action.setBadgeText({ tabId, text: '' });
    }
  }, (err) => logger.error('Badge update failed', err));
}

export function registerTabListeners({ onTabUpdated } = {}) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      const host = hostnameFromUrl(changeInfo.url);
      if (host) activeTabHosts.set(tabId, host);
      else activeTabHosts.delete(tabId);
    }
    if (changeInfo.status === 'complete' && onTabUpdated) {
      guardAsync(() => onTabUpdated(tab), (err) => logger.error('onTabUpdated handler failed', err));
    }
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    activeTabHosts.delete(tabId);
  });
}

export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}
