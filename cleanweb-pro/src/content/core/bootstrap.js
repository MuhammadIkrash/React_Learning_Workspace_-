/**
 * @file bootstrap.js (classic script — see shared/namespace.js)
 * The orchestrator. Must be the LAST script listed in each manifest.json
 * content_scripts entry, since it reads window.CWP.* namespaces that every
 * previously-loaded file populates. Detects the site/page, loads settings +
 * whitelist state, builds the descriptor list of every feature applicable to
 * this context, and re-runs on SPA navigation.
 */
(function () {
  const MSG = window.CWP.shared.constants.MSG;
  const SITES = window.CWP.shared.constants.SITES;
  const { sendMessage, guardAsync } = window.CWP.shared.utils;
  const { setDebugEnabled, logger } = window.CWP.shared.logger;
  const { setNotificationsEnabled } = window.CWP.core.notificationManager;
  const { detectSite, detectYouTubePage, getCurrentHostname, onNavigate, YOUTUBE_PAGE } = window.CWP.core.siteDetector;
  const { startObserving, stopObserving } = window.CWP.core.observerManager;
  const { applyFeatures, destroyAllFeatures } = window.CWP.core.featureManager;
  const { runAllCleanups } = window.CWP.core.cleanupManager;

  /** Every feature the extension ships. `module` now points directly at an
   * already-loaded namespace object (see shared/namespace.js) rather than a
   * dynamic-import factory, since every file here is a synchronously-loaded
   * classic script by the time bootstrap.js runs. */
  function buildDescriptors() {
    const list = [
      { key: 'youtube-ad-handler', sites: [SITES.YOUTUBE], enabledKey: 'youtubeAds', module: window.CWP.youtube.adHandler },
      { key: 'youtube-dom-cleaner', sites: [SITES.YOUTUBE], enabledKey: 'youtubeAds', module: window.CWP.youtube.domCleaner },

      { key: 'youtube-player', sites: [SITES.YOUTUBE], page: YOUTUBE_PAGE.WATCH, enabledKey: 'speedControl', module: window.CWP.youtube.player },
      { key: 'youtube-speed', sites: [SITES.YOUTUBE], page: YOUTUBE_PAGE.WATCH, enabledKey: 'speedControl', module: window.CWP.youtube.speed },
      { key: 'youtube-quality', sites: [SITES.YOUTUBE], page: YOUTUBE_PAGE.WATCH, enabledKey: 'qualityControl', module: window.CWP.youtube.quality },
      { key: 'youtube-volume', sites: [SITES.YOUTUBE], page: YOUTUBE_PAGE.WATCH, enabledKey: 'volumeBoost', module: window.CWP.youtube.volume },
      { key: 'youtube-pip', sites: [SITES.YOUTUBE], page: YOUTUBE_PAGE.WATCH, enabledKey: 'pictureInPicture', module: window.CWP.youtube.pip },
      { key: 'youtube-theater', sites: [SITES.YOUTUBE], page: YOUTUBE_PAGE.WATCH, enabledKey: 'theaterMode', module: window.CWP.youtube.theater },
      { key: 'youtube-cinema', sites: [SITES.YOUTUBE], page: YOUTUBE_PAGE.WATCH, enabledKey: 'cinemaMode', module: window.CWP.youtube.cinema },
      { key: 'youtube-shortcuts', sites: [SITES.YOUTUBE], page: YOUTUBE_PAGE.WATCH, enabledKey: 'speedControl', module: window.CWP.youtube.shortcuts },
      { key: 'youtube-navigation', sites: [SITES.YOUTUBE], page: YOUTUBE_PAGE.WATCH, module: window.CWP.youtube.navigation },

      { key: 'youtube-shorts', sites: [SITES.YOUTUBE], page: YOUTUBE_PAGE.SHORTS, enabledKey: 'shortsTools', module: window.CWP.youtube.shorts },

      { key: 'youtube-enhancements', sites: [SITES.YOUTUBE], module: window.CWP.youtube.enhancements },

      { key: 'google-ad-cleaner', sites: [SITES.GOOGLE_SEARCH], enabledKey: 'googleAds', module: window.CWP.google.adCleaner },
      { key: 'google-search-cleaner', sites: [SITES.GOOGLE_SEARCH], enabledKey: 'googleSearchCleaner', module: window.CWP.google.searchCleaner },
      { key: 'google-enhancements', sites: [SITES.GOOGLE_SEARCH], module: window.CWP.google.enhancements },

      { key: 'element-zapper', sites: [SITES.YOUTUBE, SITES.GOOGLE_SEARCH, SITES.GENERIC], enabledKey: 'elementZapper', masterOnly: true, module: window.CWP.zapper.elementZapper },
      { key: 'custom-filters', sites: [SITES.YOUTUBE, SITES.GOOGLE_SEARCH, SITES.GENERIC], enabledKey: 'customFilters', masterOnly: true, module: window.CWP.filters.customFilters }
    ];
    // Filter out any descriptor whose module namespace wasn't loaded on this
    // page (e.g. YouTube-only files are absent on a generic <all_urls> page).
    return list.filter((d) => Boolean(d.module));
  }

  function filterDescriptorsForPage(descriptors, page) {
    return descriptors.filter((d) => !d.page || d.page === page);
  }

  async function loadContext() {
    const [settingsResult, whitelistResult] = await Promise.allSettled([
      sendMessage(MSG.GET_SETTINGS),
      sendMessage(MSG.WHITELIST_GET)
    ]);

    const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : null;
    const whitelist = whitelistResult.status === 'fulfilled' ? whitelistResult.value : [];

    if (!settings) {
      logger.warn('Could not load settings from background — CleanWeb Pro will stay idle on this page');
      return null;
    }

    return { settings, whitelist };
  }

  function activateZapperSafely() {
    guardAsync(async () => {
      window.CWP.zapper.elementZapper?.activateZapperMode?.();
    }, (err) => logger.error('Zapper activation failed', err));
  }

  async function runForCurrentPage(ctx) {
    const site = detectSite();
    const hostname = getCurrentHostname();
    const whitelisted = ctx.whitelist.includes(hostname);
    const page = site === SITES.YOUTUBE ? detectYouTubePage() : null;

    const applicable = filterDescriptorsForPage(buildDescriptors(), page);

    const featureCtx = {
      site,
      page,
      hostname,
      settings: ctx.settings,
      onActivateZapper: activateZapperSafely,
      onToggleFocusMode: () => {
        guardAsync(async () => {
          const next = !ctx.settings.features.focusMode;
          ctx.settings.features.focusMode = next;
          document.documentElement.classList.toggle('cwp-focus-mode', next);
          await sendMessage(MSG.SET_SETTINGS, { features: { focusMode: next } });
        }, (err) => logger.error('Focus mode shortcut failed', err));
      }
    };

    await applyFeatures(applicable, { site, settings: ctx.settings, whitelisted }, featureCtx);
  }

  async function main() {
    const ctx = await loadContext();
    if (!ctx) return;

    setDebugEnabled(ctx.settings.debugMode);
    setNotificationsEnabled(ctx.settings.features.smartNotifications);
    startObserving();

    logger.info('CleanWeb Pro content script active on', location.hostname);

    await guardAsync(() => runForCurrentPage(ctx), (err) => logger.error('Initial feature apply failed', err));

    let navTimer = null;
    const unregisterNav = onNavigate(async () => {
      clearTimeout(navTimer);
      navTimer = setTimeout(async () => {
        runAllCleanups();
        const freshCtx = await loadContext();
        if (freshCtx) {
          setDebugEnabled(freshCtx.settings.debugMode);
          setNotificationsEnabled(freshCtx.settings.features.smartNotifications);
          await guardAsync(() => runForCurrentPage(freshCtx), (err) => logger.error('Post-navigation feature apply failed', err));
        }
      }, 400);
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message?.type === 'COMMAND') {
        guardAsync(async () => {
          if (message.command === 'ACTIVATE_ZAPPER') activateZapperSafely();
          if (message.command === 'TOGGLE_THEATER') window.CWP.youtube.theater?.toggleTheater?.();
          if (message.command === 'TOGGLE_CINEMA') window.CWP.youtube.cinema?.toggleCinema?.();
        }, (err) => logger.error('Command dispatch failed', err));
      }

      if (message?.type === MSG.PLAYER_ACTION) {
        guardAsync(async () => {
          switch (message.action) {
            case 'zapper':
              activateZapperSafely();
              break;
            case 'speed-up':
              window.CWP.youtube.speed?.increaseSpeed?.();
              break;
            case 'quality-cycle': {
              const Quality = window.CWP.youtube.quality;
              if (!Quality) break;
              const levels = ['auto', 'hd1080', 'hd720', 'medium'];
              const current = Quality.getCurrentQuality();
              const next = levels[(levels.indexOf(current) + 1 + levels.length) % levels.length] || 'auto';
              Quality.setQuality(next);
              break;
            }
            case 'volume-cycle':
              window.CWP.youtube.volume?.cycleBoost?.();
              break;
            case 'pip':
              window.CWP.youtube.pip?.togglePiP?.();
              break;
            case 'cinema':
              window.CWP.youtube.cinema?.toggleCinema?.();
              break;
            default:
              logger.warn('Unknown PLAYER_ACTION', message.action);
          }
        }, (err) => logger.error('Player action dispatch failed', err));
      }
    });

    window.addEventListener('pagehide', () => {
      unregisterNav();
      stopObserving();
      destroyAllFeatures();
    });
  }

  main();
})();
