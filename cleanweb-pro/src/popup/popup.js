/**
 * @file popup.js
 * Popup controller. Talks to the background via the shared message
 * vocabulary and, for quick actions, sends a message directly to the active
 * tab's content script (see bootstrap.js's PLAYER_ACTION handler).
 */

import { MSG, SITES } from '../shared/constants.js';
import { sendMessage, hostnameFromUrl, guardAsync } from '../shared/utils.js';
import { applyTheme } from '../shared/theme-apply.js';

const els = {
  root: document.querySelector('.popup'),
  statusLabel: document.getElementById('statusLabel'),
  currentSite: document.getElementById('currentSite'),
  protectionToggle: document.getElementById('protectionToggle'),
  whitelistBtn: document.getElementById('whitelistBtn'),
  dashboardBtn: document.getElementById('dashboardBtn'),
  openDashboardBtn: document.getElementById('openDashboardBtn'),
  statToday: document.getElementById('statToday'),
  statAllTime: document.getElementById('statAllTime'),
  actionsHint: document.getElementById('actionsHint'),
  actionButtons: [...document.querySelectorAll('.action-btn')]
};

let state = {
  settings: null,
  whitelist: [],
  hostname: null,
  tabId: null,
  isYouTubeWatch: false
};

function sumStat(obj) {
  if (!obj) return 0;
  return Object.values(obj).reduce((a, b) => a + (Number(b) || 0), 0);
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

function renderProtectionUI() {
  const protectionOn = Boolean(state.settings?.features?.protectionEnabled);
  const whitelisted = state.hostname ? state.whitelist.includes(state.hostname) : false;
  const effectivelyProtected = protectionOn && !whitelisted;

  els.protectionToggle.checked = protectionOn;
  els.statusLabel.textContent = effectivelyProtected ? 'Protected' : whitelisted ? 'Whitelisted' : 'Paused';
  els.statusLabel.classList.toggle('is-off', !effectivelyProtected);
  els.whitelistBtn.textContent = whitelisted ? 'Remove from whitelist' : 'Whitelist this site';
}

function renderSiteInfo() {
  els.currentSite.textContent = state.hostname || 'No active site';
}

function renderActionAvailability() {
  const enabled = state.isYouTubeWatch;
  for (const btn of els.actionButtons) {
    btn.disabled = !enabled;
  }
  els.actionsHint.style.display = enabled ? 'none' : 'block';
}

async function renderStats() {
  const summary = await guardAsync(() => sendMessage(MSG.STATS_GET), () => null);
  if (!summary) return;
  els.statToday.textContent = String(sumStat(summary.today));
  els.statAllTime.textContent = String(sumStat(summary.allTime));
}

async function loadState() {
  const [settings, whitelist, tab] = await Promise.all([
    sendMessage(MSG.GET_SETTINGS),
    sendMessage(MSG.WHITELIST_GET),
    getActiveTab()
  ]);

  state.settings = settings;
  state.whitelist = whitelist;
  state.tabId = tab?.id ?? null;
  state.hostname = tab?.url ? hostnameFromUrl(tab.url) : null;
  state.isYouTubeWatch = Boolean(tab?.url && /^https:\/\/(www\.)?youtube\.com\/watch/.test(tab.url));

  applyTheme(els.root, settings.appearance.theme);
  els.root.classList.toggle('cwp-no-animations', !settings.appearance.animations);
}

async function refresh() {
  await loadState();
  renderProtectionUI();
  renderSiteInfo();
  renderActionAvailability();
  await renderStats();
}

function sendPlayerAction(action) {
  if (!state.tabId) return;
  chrome.tabs.sendMessage(state.tabId, { type: MSG.PLAYER_ACTION, action }).catch(() => {
    // No content script listening (e.g. non-YouTube tab) — ignore.
  });
}

els.protectionToggle.addEventListener('change', async () => {
  const next = els.protectionToggle.checked;
  await guardAsync(
    () => sendMessage(MSG.SET_SETTINGS, { features: { protectionEnabled: next } }),
    () => {
      els.protectionToggle.checked = !next; // revert on failure
    }
  );
  await refresh();
});

els.whitelistBtn.addEventListener('click', async () => {
  if (!state.hostname) return;
  const whitelisted = state.whitelist.includes(state.hostname);
  await guardAsync(
    () =>
      sendMessage(whitelisted ? MSG.WHITELIST_REMOVE : MSG.WHITELIST_ADD, { hostname: state.hostname }),
    () => {}
  );
  await refresh();
});

els.dashboardBtn.addEventListener('click', () => {
  sendMessage(MSG.OPEN_DASHBOARD, {});
  window.close();
});

els.openDashboardBtn.addEventListener('click', () => {
  sendMessage(MSG.OPEN_DASHBOARD, {});
  window.close();
});

const ACTION_MAP = {
  zapper: 'zapper',
  speed: 'speed-up',
  quality: 'quality-cycle',
  volume: 'volume-cycle',
  pip: 'pip',
  cinema: 'cinema'
};

for (const btn of els.actionButtons) {
  btn.addEventListener('click', () => {
    const key = btn.dataset.action;
    const action = ACTION_MAP[key];
    if (action) sendPlayerAction(action);
    if (key === 'zapper') window.close();
  });
}

refresh();
