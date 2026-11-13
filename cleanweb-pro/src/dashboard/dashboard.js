/**
 * @file dashboard.js
 * Full settings dashboard controller. Every control reads from and writes to
 * settings via the shared message vocabulary — there is no direct
 * chrome.storage access here, keeping the background the single writer.
 */

import { MSG, PLAYBACK_SPEEDS, QUALITY_LEVELS, VOLUME_BOOST_LEVELS, STAT_KEYS } from '../shared/constants.js';
import { DEFAULT_SHORTCUTS } from '../shared/defaults.js';
import { sendMessage, guardAsync, formatSpeed } from '../shared/utils.js';
import { isValidHostname, isValidSelector } from '../shared/validators.js';
import { applyTheme, watchSystemTheme } from '../shared/theme-apply.js';

const root = document.getElementById('shell');
let settings = null;
let whitelist = [];
let customFilters = [];
let zapperRulesByHost = {};

// ---------------------------------------------------------------- Navigation
const navButtons = [...document.querySelectorAll('.nav-item')];
const panels = [...document.querySelectorAll('.panel')];

function showSection(section) {
  for (const btn of navButtons) btn.classList.toggle('active', btn.dataset.section === section);
  for (const panel of panels) panel.classList.toggle('hidden', panel.dataset.panel !== section);
  history.replaceState(null, '', `#${section}`);
}

for (const btn of navButtons) {
  btn.addEventListener('click', () => showSection(btn.dataset.section));
}

const initialSection = location.hash.replace('#', '') || 'overview';
if (navButtons.some((b) => b.dataset.section === initialSection)) {
  showSection(initialSection);
}

// ---------------------------------------------------------------- Helpers

function emptyState(text) {
  const el = document.createElement('div');
  el.className = 'empty-state';
  el.textContent = text;
  return el;
}

function toggleRow({ title, desc, checked, onChange }) {
  const wrap = document.createElement('div');
  wrap.className = 'toggle-item';
  const text = document.createElement('div');
  text.className = 'toggle-item-text';
  const titleEl = document.createElement('div');
  titleEl.className = 'toggle-item-title';
  titleEl.textContent = title;
  text.appendChild(titleEl);
  if (desc) {
    const descEl = document.createElement('div');
    descEl.className = 'toggle-item-desc';
    descEl.textContent = desc;
    text.appendChild(descEl);
  }

  const label = document.createElement('label');
  label.className = 'switch';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(checked);
  const track = document.createElement('span');
  track.className = 'switch-track';
  const thumb = document.createElement('span');
  thumb.className = 'switch-thumb';
  track.appendChild(thumb);
  label.append(input, track);

  input.addEventListener('change', () => onChange(input.checked));

  wrap.append(text, label);
  return wrap;
}

async function saveSettings(partial) {
  settings = await sendMessage(MSG.SET_SETTINGS, partial);
  renderProtectionBanner();
}

function renderProtectionBanner() {
  const banner = document.getElementById('protectionBanner');
  const text = document.getElementById('protectionBannerText');
  const on = Boolean(settings.features.protectionEnabled);
  banner.classList.toggle('is-off', !on);
  text.textContent = on ? 'PROTECTED' : 'PAUSED';
  document.getElementById('masterProtection').checked = on;
}

// ---------------------------------------------------------------- Overview

const FEATURE_LABELS = {
  youtubeAds: 'YouTube ad blocking',
  googleAds: 'Google ad blocking',
  elementZapper: 'Element Zapper',
  speedControl: 'Speed control',
  qualityControl: 'Quality control',
  volumeBoost: 'Volume boost',
  pictureInPicture: 'Picture-in-Picture',
  theaterMode: 'Theater mode',
  cinemaMode: 'Cinema mode',
  screenshotTool: 'Screenshot tool',
  focusMode: 'Focus mode',
  shortsTools: 'Shorts tools',
  customFilters: 'Custom filters'
};

function renderOverview() {
  document.getElementById('masterProtection').checked = Boolean(settings.features.protectionEnabled);
  document.getElementById('masterProtection').onchange = (e) =>
    saveSettings({ features: { protectionEnabled: e.target.checked } });

  const grid = document.getElementById('overviewToggleGrid');
  grid.textContent = '';
  for (const [key, label] of Object.entries(FEATURE_LABELS)) {
    grid.appendChild(
      toggleRow({
        title: label,
        checked: settings.features[key],
        onChange: (checked) => saveSettings({ features: { [key]: checked } })
      })
    );
  }
}

async function renderOverviewStats() {
  const summary = await guardAsync(() => sendMessage(MSG.STATS_GET), () => null);
  if (!summary) return;
  const all = summary.allTime || {};
  const totalAds = (all.videoAds || 0) + (all.overlayAds || 0) + (all.feedAds || 0) + (all.googleAds || 0);
  document.getElementById('ovAdsBlocked').textContent = totalAds;
  document.getElementById('ovVideoAds').textContent = all.videoAds || 0;
  document.getElementById('ovGoogleAds').textContent = all.googleAds || 0;
  document.getElementById('ovZapped').textContent = all.elementsZapped || 0;
}

// ---------------------------------------------------------------- YouTube

function renderYouTube() {
  const adToggles = document.getElementById('youtubeAdToggles');
  adToggles.textContent = '';
  adToggles.appendChild(
    toggleRow({
      title: 'YouTube ad blocking',
      desc: 'Skips and hides video ads using multiple detection signals.',
      checked: settings.features.youtubeAds,
      onChange: (v) => saveSettings({ features: { youtubeAds: v } })
    })
  );

  const playerToggles = document.getElementById('youtubePlayerToggles');
  playerToggles.textContent = '';
  const playerFeatures = [
    ['speedControl', 'Speed control', 'Up to 4x playback with the Control Center panel.'],
    ['qualityControl', 'Quality control', 'Quick quality selection, never forces unavailable resolutions.'],
    ['smartQuality', 'Smart Quality', 'Prefers your target tier when available, avoids unnecessary switches.'],
    ['volumeBoost', 'Volume boost', 'Up to 200% using a single Web Audio pipeline.'],
    ['pictureInPicture', 'Picture-in-Picture', 'Native browser PiP.'],
    ['theaterMode', 'Theater mode', 'Enlarges the player, preserves layout.'],
    ['cinemaMode', 'Cinema mode', 'Dims the page around the player.'],
    ['screenshotTool', 'Screenshot tool', 'Captures the current video frame.']
  ];
  for (const [key, title, desc] of playerFeatures) {
    playerToggles.appendChild(toggleRow({ title, desc, checked: settings.features[key], onChange: (v) => saveSettings({ features: { [key]: v } }) }));
  }

  const speedSelect = document.getElementById('preferredSpeed');
  speedSelect.textContent = '';
  for (const speed of PLAYBACK_SPEEDS) {
    const opt = document.createElement('option');
    opt.value = String(speed);
    opt.textContent = formatSpeed(speed);
    if (speed === settings.player.preferredSpeed) opt.selected = true;
    speedSelect.appendChild(opt);
  }
  speedSelect.onchange = () => saveSettings({ player: { preferredSpeed: Number(speedSelect.value) } });

  const qualitySelect = document.getElementById('preferredQuality');
  qualitySelect.textContent = '';
  for (const level of QUALITY_LEVELS) {
    const opt = document.createElement('option');
    opt.value = level.value;
    opt.textContent = level.label;
    if (level.value === settings.player.preferredQuality) opt.selected = true;
    qualitySelect.appendChild(opt);
  }
  qualitySelect.onchange = () => saveSettings({ player: { preferredQuality: qualitySelect.value } });

  const volumeSelect = document.getElementById('volumeBoostLevel');
  volumeSelect.textContent = '';
  for (const level of VOLUME_BOOST_LEVELS) {
    const opt = document.createElement('option');
    opt.value = String(level);
    opt.textContent = `${level}%`;
    if (level === settings.player.volumeBoostLevel) opt.selected = true;
    volumeSelect.appendChild(opt);
  }
  volumeSelect.onchange = () => saveSettings({ player: { volumeBoostLevel: Number(volumeSelect.value) } });

  const density = document.getElementById('controlsDensity');
  density.value = settings.player.controlsDensity;
  density.onchange = () => saveSettings({ player: { controlsDensity: density.value } });

  const visibility = document.getElementById('controlsVisibility');
  visibility.value = settings.player.controlsVisibility;
  visibility.onchange = () => saveSettings({ player: { controlsVisibility: visibility.value } });

  const cleanupToggles = document.getElementById('youtubeCleanupToggles');
  cleanupToggles.textContent = '';
  const cleanupFeatures = [
    ['feedCleaner', 'Feed cleaner', 'Hide promoted videos and Shorts shelves on the home feed.'],
    ['hideEndScreenRecs', 'Hide end-screen recommendations', ''],
    ['hideAnnotations', 'Hide annotations', ''],
    ['compactComments', 'Compact comments', ''],
    ['hideLiveChat', 'Hide live chat', ''],
    ['focusMode', 'Focus mode', 'Hides recommendations, comments, and side panels.']
  ];
  for (const [key, title, desc] of cleanupFeatures) {
    cleanupToggles.appendChild(toggleRow({ title, desc, checked: settings.features[key], onChange: (v) => saveSettings({ features: { [key]: v } }) }));
  }

  const powerToggles = document.getElementById('youtubePowerToggles');
  powerToggles.textContent = '';
  const powerFeatures = [
    ['disableAutoplay', 'Disable autoplay', 'Turns off YouTube\u2019s "up next" autoplay.'],
    ['autoPauseHiddenTab', 'Auto-pause on hidden tab', 'Pauses when you switch tabs, resumes when you return.']
  ];
  for (const [key, title, desc] of powerFeatures) {
    powerToggles.appendChild(toggleRow({ title, desc, checked: settings.features[key], onChange: (v) => saveSettings({ features: { [key]: v } }) }));
  }
  powerToggles.appendChild(
    toggleRow({
      title: 'Remember playback position',
      desc: 'Resumes where you left off on a video.',
      checked: settings.player.rememberPlaybackPosition,
      onChange: (v) => saveSettings({ player: { rememberPlaybackPosition: v } })
    })
  );
}

// ---------------------------------------------------------------- Google

function renderGoogle() {
  const wrap = document.getElementById('googleToggles');
  wrap.textContent = '';
  wrap.appendChild(
    toggleRow({
      title: 'Google ad blocking',
      desc: 'Hides sponsored results and ad blocks. Organic results are never touched.',
      checked: settings.features.googleAds,
      onChange: (v) => saveSettings({ features: { googleAds: v } })
    })
  );
  wrap.appendChild(
    toggleRow({
      title: 'Search cleaner',
      desc: 'Enables the layout options below.',
      checked: settings.features.googleSearchCleaner,
      onChange: (v) => saveSettings({ features: { googleSearchCleaner: v } })
    })
  );
  const options = [
    ['compact', 'Compact search layout', ''],
    ['hideShopping', 'Hide shopping blocks', ''],
    ['hideRelatedQuestions', 'Hide "People also ask"', ''],
    ['hidePanels', 'Hide unwanted side panels', '']
  ];
  for (const [key, title, desc] of options) {
    wrap.appendChild(
      toggleRow({
        title,
        desc,
        checked: settings.googleSearchOptions?.[key],
        onChange: (v) => saveSettings({ googleSearchOptions: { [key]: v } })
      })
    );
  }
  wrap.appendChild(
    toggleRow({
      title: 'Reading mode',
      desc: 'One-click simplified search page: search box, organic results, navigation only.',
      checked: settings.googleSearchOptions?.readingMode,
      onChange: (v) => saveSettings({ googleSearchOptions: { readingMode: v } })
    })
  );
}

// ---------------------------------------------------------------- Zapper

function renderZapperRuleGroups() {
  const list = document.getElementById('zapperRulesList');
  list.textContent = '';
  const hosts = Object.keys(zapperRulesByHost).filter((h) => zapperRulesByHost[h]?.length);
  if (hosts.length === 0) {
    list.appendChild(emptyState('No Zapper rules yet. Activate the Zapper on any page to start removing elements.'));
    return;
  }
  for (const host of hosts) {
    const groupTitle = document.createElement('div');
    groupTitle.className = 'rule-group-title';
    groupTitle.textContent = host;
    list.appendChild(groupTitle);
    for (const rule of zapperRulesByHost[host]) {
      list.appendChild(
        ruleItem({
          primary: rule.selector,
          meta: `${rule.action} · saved ${new Date(rule.createdAt).toLocaleDateString()}`,
          onRemove: async () => {
            const next = zapperRulesByHost[host].filter((r) => r.id !== rule.id);
            zapperRulesByHost[host] = next;
            await sendMessage(MSG.ZAPPER_RULES_SET, { hostname: host, rules: next });
            renderZapperRuleGroups();
          }
        })
      );
    }
  }
}

function ruleItem({ primary, meta, onRemove }) {
  const item = document.createElement('div');
  item.className = 'rule-item';
  const text = document.createElement('div');
  const primaryEl = document.createElement('div');
  primaryEl.className = 'rule-item-selector';
  primaryEl.textContent = primary;
  text.appendChild(primaryEl);
  if (meta) {
    const metaEl = document.createElement('div');
    metaEl.className = 'rule-item-meta';
    metaEl.textContent = meta;
    text.appendChild(metaEl);
  }
  const removeBtn = document.createElement('button');
  removeBtn.className = 'rule-item-remove';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', onRemove);
  item.append(text, removeBtn);
  return item;
}

function renderZapperSection() {
  document.getElementById('zapperEnabled').checked = Boolean(settings.features.elementZapper);
  document.getElementById('zapperEnabled').onchange = (e) => saveSettings({ features: { elementZapper: e.target.checked } });
  renderZapperRuleGroups();
}

// ---------------------------------------------------------------- Filters

function renderFilters() {
  const list = document.getElementById('filtersList');
  list.textContent = '';
  if (customFilters.length === 0) {
    list.appendChild(emptyState('No custom filters yet.'));
  } else {
    for (const filter of customFilters) {
      const item = ruleItem({
        primary: `${filter.domain} — ${filter.selector}`,
        meta: filter.action,
        onRemove: async () => {
          customFilters = customFilters.filter((f) => f.id !== filter.id);
          await sendMessage(MSG.FILTERS_SET, customFilters);
          renderFilters();
        }
      });
      list.appendChild(item);
    }
  }
}

document.getElementById('filterForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const domain = document.getElementById('filterDomain').value.trim().toLowerCase();
  const selector = document.getElementById('filterSelector').value.trim();
  const action = document.getElementById('filterAction').value;
  const errorEl = document.getElementById('filterFormError');
  errorEl.textContent = '';

  if (!isValidHostname(domain)) {
    errorEl.textContent = 'Enter a valid domain, e.g. example.com';
    return;
  }
  if (!isValidSelector(selector)) {
    errorEl.textContent = 'That selector looks invalid or unsafe.';
    return;
  }

  const newFilter = { id: `filter_${Date.now().toString(36)}`, domain, selector, action, enabled: true };
  customFilters = [...customFilters, newFilter];
  await guardAsync(
    () => sendMessage(MSG.FILTERS_SET, customFilters),
    () => {
      errorEl.textContent = 'Could not save filter.';
      customFilters = customFilters.filter((f) => f.id !== newFilter.id);
    }
  );
  document.getElementById('filterForm').reset();
  renderFilters();
});

// ---------------------------------------------------------------- Privacy

function renderPrivacy() {
  document.getElementById('debugMode').checked = Boolean(settings.debugMode);
  document.getElementById('debugMode').onchange = (e) => saveSettings({ debugMode: e.target.checked });
}

// ---------------------------------------------------------------- Appearance

function renderAppearance() {
  const themeSelect = document.getElementById('themeSelect');
  themeSelect.value = settings.appearance.theme;
  themeSelect.onchange = async () => {
    await saveSettings({ appearance: { theme: themeSelect.value } });
    applyTheme(root, settings.appearance.theme);
  };

  const controlPosition = document.getElementById('controlPosition');
  controlPosition.value = settings.appearance.controlPosition;
  controlPosition.onchange = () => saveSettings({ appearance: { controlPosition: controlPosition.value } });

  const compactUI = document.getElementById('compactUI');
  compactUI.checked = settings.appearance.compactUI;
  compactUI.onchange = async () => {
    await saveSettings({ appearance: { compactUI: compactUI.checked } });
    root.classList.toggle('cwp-compact-ui', compactUI.checked);
  };

  const animations = document.getElementById('animationsToggle');
  animations.checked = settings.appearance.animations;
  animations.onchange = async () => {
    await saveSettings({ appearance: { animations: animations.checked } });
    root.classList.toggle('cwp-no-animations', !animations.checked);
  };

  const notifications = document.getElementById('smartNotifications');
  notifications.checked = settings.features.smartNotifications;
  notifications.onchange = () => saveSettings({ features: { smartNotifications: notifications.checked } });
}

// ---------------------------------------------------------------- Shortcuts

function formatShortcut(str) {
  return str || '—';
}

function renderShortcuts() {
  const list = document.getElementById('shortcutsList');
  list.textContent = '';
  const labels = {
    speedUp: 'Increase speed',
    speedDown: 'Decrease speed',
    speedReset: 'Reset speed',
    toggleCinema: 'Toggle Cinema mode',
    toggleTheater: 'Toggle Theater mode',
    activateZapper: 'Activate Zapper',
    togglePiP: 'Toggle Picture-in-Picture',
    toggleFocusMode: 'Toggle Focus mode'
  };

  for (const [key, label] of Object.entries(labels)) {
    const row = document.createElement('div');
    row.className = 'shortcut-row';
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    const keyBtn = document.createElement('button');
    keyBtn.className = 'shortcut-key';
    keyBtn.type = 'button';
    keyBtn.textContent = formatShortcut(settings.shortcuts[key]);

    keyBtn.addEventListener('click', () => {
      keyBtn.textContent = 'Press keys…';
      keyBtn.classList.add('listening');
      const onKey = async (event) => {
        event.preventDefault();
        if (['Alt', 'Shift', 'Control', 'Meta'].includes(event.key)) return;
        const parts = [];
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.metaKey) parts.push('Meta');
        parts.push(event.key.length === 1 ? event.key : event.key);
        const combo = parts.join('+');
        keyBtn.textContent = combo;
        keyBtn.classList.remove('listening');
        document.removeEventListener('keydown', onKey, true);
        await saveSettings({ shortcuts: { [key]: combo } });
      };
      document.addEventListener('keydown', onKey, true);
    });

    row.append(labelEl, keyBtn);
    list.appendChild(row);
  }

  const resetRow = document.createElement('div');
  resetRow.className = 'shortcut-row';
  const resetBtn = document.createElement('button');
  resetBtn.className = 'text-btn';
  resetBtn.textContent = 'Reset shortcuts to defaults';
  resetBtn.addEventListener('click', async () => {
    await saveSettings({ shortcuts: DEFAULT_SHORTCUTS });
    renderShortcuts();
  });
  resetRow.appendChild(resetBtn);
  list.appendChild(resetRow);
}

// ---------------------------------------------------------------- Statistics

let currentRange = 'today';

function renderStatsGrid(summary) {
  const grid = document.getElementById('statsGrid');
  grid.textContent = '';
  const data = summary[currentRange] || {};
  const cards = [
    ['videoAds', 'Video ads'],
    ['overlayAds', 'Overlay ads'],
    ['feedAds', 'Feed ads'],
    ['googleAds', 'Google ads'],
    ['elementsZapped', 'Elements zapped'],
    ['customFilterHits', 'Custom filter hits']
  ];
  for (const [key, label] of cards) {
    const card = document.createElement('div');
    card.className = 'stat-card-lg';
    const value = document.createElement('span');
    value.className = 'stat-card-lg-value';
    value.textContent = data[key] || 0;
    const labelEl = document.createElement('span');
    labelEl.className = 'stat-card-lg-label';
    labelEl.textContent = label;
    card.append(value, labelEl);
    grid.appendChild(card);
  }
}

async function renderStatistics() {
  const summary = await guardAsync(() => sendMessage(MSG.STATS_GET), () => null);
  if (!summary) return;
  renderStatsGrid(summary);
}

for (const tab of document.querySelectorAll('.range-tab')) {
  tab.addEventListener('click', async () => {
    for (const t of document.querySelectorAll('.range-tab')) t.classList.remove('active');
    tab.classList.add('active');
    currentRange = tab.dataset.range;
    await renderStatistics();
  });
}

document.getElementById('resetStatsBtn').addEventListener('click', () => {
  confirmModal({
    title: 'Reset statistics?',
    body: 'This clears all local counters (today, 7-day, 30-day, and all-time). This cannot be undone.',
    onConfirm: async () => {
      await sendMessage(MSG.STATS_RESET, {});
      await renderStatistics();
      await renderOverviewStats();
    }
  });
});

// ---------------------------------------------------------------- Advanced

function renderAdvanced() {
  const enabledCount = Object.values(settings.features).filter(Boolean).length;
  document.getElementById('perfFeatures').textContent = `${enabledCount} enabled`;
  renderWhitelist();
}

function renderWhitelist() {
  const list = document.getElementById('whitelistList');
  list.textContent = '';
  if (whitelist.length === 0) {
    list.appendChild(emptyState('No whitelisted sites.'));
    return;
  }
  for (const host of whitelist) {
    list.appendChild(
      ruleItem({
        primary: host,
        onRemove: async () => {
          whitelist = await sendMessage(MSG.WHITELIST_REMOVE, { hostname: host });
          renderWhitelist();
        }
      })
    );
  }
}

document.getElementById('whitelistAddBtn').addEventListener('click', async () => {
  const input = document.getElementById('whitelistInput');
  const errorEl = document.getElementById('whitelistError');
  const hostname = input.value.trim().toLowerCase();
  errorEl.textContent = '';
  if (!isValidHostname(hostname)) {
    errorEl.textContent = 'Enter a valid domain, e.g. example.com';
    return;
  }
  whitelist = await guardAsync(() => sendMessage(MSG.WHITELIST_ADD, { hostname }), () => whitelist);
  input.value = '';
  renderWhitelist();
});

document.getElementById('exportBtn').addEventListener('click', async () => {
  const payload = await sendMessage(MSG.EXPORT_SETTINGS, { includeStatistics: false });
  downloadJson(payload, `cleanweb-pro-export-${Date.now()}.json`);
});

document.getElementById('backupBtn').addEventListener('click', async () => {
  const payload = await sendMessage(MSG.EXPORT_SETTINGS, { includeStatistics: true });
  downloadJson(payload, `cleanweb-pro-backup-${Date.now()}.json`);
});

function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function handleImportFile(inputEl, errorElId, successMessage) {
  inputEl.addEventListener('change', async () => {
    const file = inputEl.files?.[0];
    if (!file) return;
    const errorEl = document.getElementById(errorElId);
    errorEl.textContent = '';
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await sendMessage(MSG.IMPORT_SETTINGS, parsed);
      await bootstrap();
      errorEl.style.color = 'var(--cwp-success)';
      errorEl.textContent = successMessage;
    } catch (err) {
      errorEl.style.color = 'var(--cwp-danger)';
      errorEl.textContent = `Import failed: ${err.message}`;
    } finally {
      inputEl.value = '';
    }
  });
}

handleImportFile(document.getElementById('importInput'), 'importError', 'Settings imported successfully.');
handleImportFile(document.getElementById('restoreInput'), 'importError', 'Backup restored successfully.');

document.getElementById('resetAllBtn').addEventListener('click', () => {
  confirmModal({
    title: 'Reset all settings?',
    body: 'This clears every CleanWeb Pro setting, whitelist entry, custom filter, and Zapper rule, and restores factory defaults. This cannot be undone.',
    onConfirm: async () => {
      await sendMessage(MSG.RESET_ALL, {});
      await bootstrap();
    }
  });
});

// ---------------------------------------------------------------- Confirm modal

function confirmModal({ title, body, onConfirm }) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalBody').textContent = body;
  modal.classList.remove('hidden');

  const confirmBtn = document.getElementById('confirmModalConfirm');
  const cancelBtn = document.getElementById('confirmModalCancel');

  function close() {
    modal.classList.add('hidden');
    confirmBtn.removeEventListener('click', onConfirmClick);
    cancelBtn.removeEventListener('click', close);
  }
  async function onConfirmClick() {
    close();
    await onConfirm();
  }
  confirmBtn.addEventListener('click', onConfirmClick);
  cancelBtn.addEventListener('click', close);
}

// ---------------------------------------------------------------- Bootstrap

async function bootstrap() {
  const [settingsResult, whitelistResult, filtersResult, zapperResult] = await Promise.all([
    sendMessage(MSG.GET_SETTINGS),
    sendMessage(MSG.WHITELIST_GET),
    sendMessage(MSG.FILTERS_GET),
    sendMessage(MSG.ZAPPER_RULES_GET)
  ]);

  settings = settingsResult;
  whitelist = whitelistResult;
  customFilters = filtersResult;
  zapperRulesByHost = zapperResult;

  applyTheme(root, settings.appearance.theme);
  watchSystemTheme(root, () => settings.appearance.theme);
  root.classList.toggle('cwp-compact-ui', settings.appearance.compactUI);
  root.classList.toggle('cwp-no-animations', !settings.appearance.animations);

  renderProtectionBanner();
  renderOverview();
  renderOverviewStats();
  renderYouTube();
  renderGoogle();
  renderZapperSection();
  renderFilters();
  renderPrivacy();
  renderAppearance();
  renderShortcuts();
  renderStatistics();
  renderAdvanced();
}

bootstrap();
