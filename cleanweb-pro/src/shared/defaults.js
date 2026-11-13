/**
 * @file defaults.js
 * Default, factory-reset values for every piece of persisted state.
 * `storage-manager.js` merges these under whatever is actually stored so
 * new fields introduced in later versions get sane values automatically.
 */

export const DEFAULT_FEATURES = Object.freeze({
  protectionEnabled: true,
  youtubeAds: true,
  googleAds: true,
  elementZapper: true,
  speedControl: true,
  qualityControl: true,
  smartQuality: false,
  volumeBoost: false,
  pictureInPicture: true,
  theaterMode: true,
  cinemaMode: true,
  screenshotTool: true,
  focusMode: false,
  shortsTools: true,
  feedCleaner: false,
  googleSearchCleaner: true,
  customFilters: true,
  smartNotifications: true,
  autoPauseHiddenTab: false,
  disableAutoplay: false,
  hideEndScreenRecs: false,
  hideAnnotations: false,
  compactComments: false,
  hideLiveChat: false
});

export const DEFAULT_APPEARANCE = Object.freeze({
  theme: 'system',
  accentStyle: 'teal',
  compactUI: false,
  animations: true,
  controlPosition: 'bottom-right',
  notificationStyle: 'toast'
});

export const DEFAULT_PLAYER_PREFS = Object.freeze({
  preferredSpeed: 1,
  preferredQuality: 'auto',
  volumeBoostLevel: 100,
  cinemaOpacity: 0.75,
  controlsVisibility: 'show',
  controlsDensity: 'expanded',
  rememberPlaybackPosition: false
});

export const DEFAULT_SHORTCUTS = Object.freeze({
  toggleProtection: 'Alt+Shift+P',
  speedUp: ']',
  speedDown: '[',
  speedReset: '\\',
  toggleCinema: 'Alt+Shift+C',
  toggleTheater: 'Alt+Shift+T',
  activateZapper: 'Alt+Shift+Z',
  togglePiP: 'Alt+Shift+I',
  toggleFocusMode: 'Alt+Shift+F'
});

export const DEFAULT_PRIVACY = Object.freeze({
  localOnly: true,
  shareStatistics: false
});

export const DEFAULT_GOOGLE_SEARCH_OPTIONS = Object.freeze({
  compact: false,
  hideShopping: false,
  hideRelatedQuestions: false,
  hidePanels: false,
  readingMode: false
});

export const DEFAULT_SETTINGS = Object.freeze({
  version: 1,
  features: DEFAULT_FEATURES,
  appearance: DEFAULT_APPEARANCE,
  player: DEFAULT_PLAYER_PREFS,
  shortcuts: DEFAULT_SHORTCUTS,
  privacy: DEFAULT_PRIVACY,
  googleSearchOptions: DEFAULT_GOOGLE_SEARCH_OPTIONS,
  debugMode: false
});

export const DEFAULT_STATISTICS = Object.freeze({
  videoAds: 0,
  overlayAds: 0,
  feedAds: 0,
  googleAds: 0,
  elementsZapped: 0,
  customFilterHits: 0,
  sessionsProtected: 0,
  dailyLog: {} // { 'YYYY-MM-DD': { videoAds, overlayAds, feedAds, googleAds, elementsZapped, customFilterHits } }
});

export function createEmptySiteProfile() {
  return {
    protectionEnabled: true,
    speed: 1,
    quality: 'auto',
    volumeBoost: 100,
    cinemaMode: false,
    theaterMode: false
  };
}
