/**
 * @file site-detector.js (classic script — see shared/namespace.js)
 */
(function () {
  const SITES = window.CWP.shared.constants.SITES;

  function detectSite() {
    const host = location.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      return SITES.YOUTUBE;
    }
    if (host === 'google.com' || /\.google\.[a-z.]+$/.test(host)) {
      if (location.pathname.startsWith('/search')) return SITES.GOOGLE_SEARCH;
    }
    return SITES.GENERIC;
  }

  const YOUTUBE_PAGE = Object.freeze({
    HOME: 'home',
    WATCH: 'watch',
    SHORTS: 'shorts',
    SEARCH: 'search',
    CHANNEL: 'channel',
    PLAYLIST: 'playlist',
    OTHER: 'other'
  });

  function detectYouTubePage() {
    const path = location.pathname;
    if (path === '/' || path === '') return YOUTUBE_PAGE.HOME;
    if (path.startsWith('/watch')) return YOUTUBE_PAGE.WATCH;
    if (path.startsWith('/shorts/')) return YOUTUBE_PAGE.SHORTS;
    if (path.startsWith('/results')) return YOUTUBE_PAGE.SEARCH;
    if (path.startsWith('/playlist')) return YOUTUBE_PAGE.PLAYLIST;
    if (path.startsWith('/channel') || path.startsWith('/c/') || path.startsWith('/@')) return YOUTUBE_PAGE.CHANNEL;
    return YOUTUBE_PAGE.OTHER;
  }

  function isLiveVideo() {
    return Boolean(document.querySelector('.ytp-live') || document.querySelector('[class*="ytp-live-badge"]'));
  }

  function getCurrentHostname() {
    return location.hostname.replace(/^www\./, '');
  }

  function onNavigate(callback) {
    let lastUrl = location.href;

    const check = () => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        callback(lastUrl);
      }
    };

    window.addEventListener('yt-navigate-finish', check, { passive: true });
    window.addEventListener('popstate', check, { passive: true });

    const originalPushState = history.pushState;
    history.pushState = function patchedPushState(...args) {
      const result = originalPushState.apply(this, args);
      check();
      return result;
    };
    const originalReplaceState = history.replaceState;
    history.replaceState = function patchedReplaceState(...args) {
      const result = originalReplaceState.apply(this, args);
      check();
      return result;
    };

    const intervalId = setInterval(check, 1000);

    return function unregister() {
      window.removeEventListener('yt-navigate-finish', check);
      window.removeEventListener('popstate', check);
      clearInterval(intervalId);
    };
  }

  window.CWP.core.siteDetector = {
    detectSite,
    YOUTUBE_PAGE,
    detectYouTubePage,
    isLiveVideo,
    getCurrentHostname,
    onNavigate
  };
})();
