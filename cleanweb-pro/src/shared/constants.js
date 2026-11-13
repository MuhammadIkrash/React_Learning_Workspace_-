/**
 * @file constants.js
 * Centralized constant values shared across background, content, and UI code.
 * Keeping strings here (rather than scattered as literals) is also what makes
 * the extension i18n-ready later — every user-facing string funnels through
 * one place before it ever reaches a template.
 */

export const EXTENSION_NAME = 'CleanWeb Pro';
export const EXTENSION_VERSION = '1.0.0';

/** Central debug flag. Flip via storage key `debugMode`, read at runtime. */
export const DEBUG_STORAGE_KEY = 'debugMode';

/** chrome.storage.local top-level keys. Keeping these as constants avoids typo bugs. */
export const STORAGE_KEYS = Object.freeze({
  SETTINGS: 'cwp_settings',
  SITE_PROFILES: 'cwp_site_profiles',
  WHITELIST: 'cwp_whitelist',
  CUSTOM_FILTERS: 'cwp_custom_filters',
  ZAPPER_RULES: 'cwp_zapper_rules',
  STATISTICS: 'cwp_statistics',
  THEME: 'cwp_theme'
});

/** Message actions used between content scripts, popup, dashboard, and the service worker. */
export const MSG = Object.freeze({
  GET_SETTINGS: 'GET_SETTINGS',
  SET_SETTINGS: 'SET_SETTINGS',
  GET_SITE_STATE: 'GET_SITE_STATE',
  TOGGLE_PROTECTION: 'TOGGLE_PROTECTION',
  WHITELIST_ADD: 'WHITELIST_ADD',
  WHITELIST_REMOVE: 'WHITELIST_REMOVE',
  WHITELIST_GET: 'WHITELIST_GET',
  STATS_INCREMENT: 'STATS_INCREMENT',
  STATS_GET: 'STATS_GET',
  STATS_RESET: 'STATS_RESET',
  FILTERS_GET: 'FILTERS_GET',
  FILTERS_SET: 'FILTERS_SET',
  ZAPPER_RULES_GET: 'ZAPPER_RULES_GET',
  ZAPPER_RULES_SET: 'ZAPPER_RULES_SET',
  SITE_PROFILE_GET: 'SITE_PROFILE_GET',
  SITE_PROFILE_SET: 'SITE_PROFILE_SET',
  IMPORT_SETTINGS: 'IMPORT_SETTINGS',
  EXPORT_SETTINGS: 'EXPORT_SETTINGS',
  RESET_ALL: 'RESET_ALL',
  NOTIFY: 'NOTIFY',
  OPEN_DASHBOARD: 'OPEN_DASHBOARD',
  PLAYER_ACTION: 'PLAYER_ACTION',
  PING: 'PING'
});

/** Recognized site identifiers, produced by site-detector.js */
export const SITES = Object.freeze({
  YOUTUBE: 'youtube',
  GOOGLE_SEARCH: 'google_search',
  GENERIC: 'generic'
});

/** Ad state machine states for the YouTube ad engine. */
export const AD_STATE = Object.freeze({
  IDLE: 'IDLE',
  AD_DETECTED: 'AD_DETECTED',
  SKIP_ATTEMPT: 'SKIP_ATTEMPT',
  AD_ACTIVE: 'AD_ACTIVE',
  AD_FINISHED: 'AD_FINISHED',
  RESTORE_PLAYER: 'RESTORE_PLAYER'
});

/** Statistics counter keys. */
export const STAT_KEYS = Object.freeze({
  VIDEO_ADS: 'videoAds',
  OVERLAY_ADS: 'overlayAds',
  FEED_ADS: 'feedAds',
  GOOGLE_ADS: 'googleAds',
  ELEMENTS_ZAPPED: 'elementsZapped',
  CUSTOM_FILTER_HITS: 'customFilterHits',
  SESSIONS_PROTECTED: 'sessionsProtected'
});

export const PLAYBACK_SPEEDS = Object.freeze([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4]);

export const QUALITY_LEVELS = Object.freeze([
  { value: 'auto', label: 'Auto' },
  { value: 'tiny', label: '144p' },
  { value: 'small', label: '240p' },
  { value: 'medium', label: '360p' },
  { value: 'large', label: '480p' },
  { value: 'hd720', label: '720p HD' },
  { value: 'hd1080', label: '1080p FHD' },
  { value: 'hd1440', label: '1440p 2K' },
  { value: 'hd2160', label: '2160p 4K' }
]);

export const VOLUME_BOOST_LEVELS = Object.freeze([100, 125, 150, 175, 200]);

export const THEMES = Object.freeze(['dark', 'light', 'system']);

export const NOTIFICATION_DURATION_MS = 2600;
export const MAX_NOTIFICATION_QUEUE = 3;
