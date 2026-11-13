/**
 * @file constants.js (content-script classic-script build)
 * Mirrors src/shared/constants.js. Duplicated rather than shared via import
 * because this file must load as a classic script (see namespace.js) while
 * src/shared/constants.js stays a real ES module for the background service
 * worker and the popup/dashboard/options pages, which don't have this
 * restriction. Keep the two in sync when adding new constants.
 */
(function () {
  const MSG = Object.freeze({
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

  const SITES = Object.freeze({
    YOUTUBE: 'youtube',
    GOOGLE_SEARCH: 'google_search',
    GENERIC: 'generic'
  });

  const AD_STATE = Object.freeze({
    IDLE: 'IDLE',
    AD_DETECTED: 'AD_DETECTED',
    SKIP_ATTEMPT: 'SKIP_ATTEMPT',
    AD_ACTIVE: 'AD_ACTIVE',
    AD_FINISHED: 'AD_FINISHED',
    RESTORE_PLAYER: 'RESTORE_PLAYER'
  });

  const STAT_KEYS = Object.freeze({
    VIDEO_ADS: 'videoAds',
    OVERLAY_ADS: 'overlayAds',
    FEED_ADS: 'feedAds',
    GOOGLE_ADS: 'googleAds',
    ELEMENTS_ZAPPED: 'elementsZapped',
    CUSTOM_FILTER_HITS: 'customFilterHits',
    SESSIONS_PROTECTED: 'sessionsProtected'
  });

  const PLAYBACK_SPEEDS = Object.freeze([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4]);

  const QUALITY_LEVELS = Object.freeze([
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

  const VOLUME_BOOST_LEVELS = Object.freeze([100, 125, 150, 175, 200]);
  const NOTIFICATION_DURATION_MS = 2600;
  const MAX_NOTIFICATION_QUEUE = 3;

  window.CWP.shared.constants = {
    MSG,
    SITES,
    AD_STATE,
    STAT_KEYS,
    PLAYBACK_SPEEDS,
    QUALITY_LEVELS,
    VOLUME_BOOST_LEVELS,
    NOTIFICATION_DURATION_MS,
    MAX_NOTIFICATION_QUEUE
  };
})();
