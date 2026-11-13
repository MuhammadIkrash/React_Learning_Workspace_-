/**
 * @file options.js
 * chrome://extensions requires an options_page entry, but CleanWeb Pro keeps
 * all settings in one full-tab dashboard (src/dashboard) rather than
 * duplicating every control here. This page just forwards to it. See
 * README.md "Architecture notes" for the reasoning.
 */

const dashboardUrl = chrome.runtime.getURL('src/dashboard/dashboard.html');

// A brief pause avoids a jarring instant-redirect if this ever opens inside
// an embedded options frame rather than a full tab.
setTimeout(() => {
  window.location.replace(dashboardUrl);
}, 150);

document.getElementById('dashboardLink').href = dashboardUrl;
