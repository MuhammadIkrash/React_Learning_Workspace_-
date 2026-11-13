# Changelog

All notable changes to CleanWeb Pro are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [1.0.1] — Content-script loading fix

### Fixed
- **Critical: ad blocking and every other content-script feature did
  nothing, silently.** The original content-script bootstrap used dynamic
  `import()` from a classic script to load an ES module orchestrator. This
  fails in practice once that module has its own relative imports (`Failed
  to fetch dynamically imported module`, `chrome-extension://invalid/`),
  and Chrome does not surface this as an error anywhere the average user
  would see it. Fixed by converting every file under `src/content/` to a
  classic script (no `import`/`export`) communicating through one global
  `window.CWP` namespace, with every file listed explicitly and in
  dependency order in `manifest.json`'s `content_scripts`. See the
  README's "Content script loading" section for the full explanation.
  Background and popup/dashboard/options were unaffected (they use real ES
  modules via `type: "module"`, which does work reliably) and required no
  changes.
- Removed a dead settings flag (`features.googleReadingMode`) that gated a
  feature the dashboard had no control for; Google Reading Mode is now
  controlled solely by `googleSearchOptions.readingMode`, which the
  dashboard's "Reading mode" toggle already wrote to.

## [1.0.0] — Initial release

### Added
- YouTube ad protection: multi-signal ad state machine (IDLE → AD_DETECTED
  → SKIP_ATTEMPT → AD_ACTIVE → AD_FINISHED → RESTORE_PLAYER), auto-skip,
  overlay/companion ad cleanup, feed/masthead ad hiding.
- YouTube Player Control Center: speed (0.25x–4x), quality quick-select,
  volume boost (100–200%), Picture-in-Picture, Theater mode, Cinema mode,
  screenshot tool.
- YouTube Shorts tools: J/K/L navigation, speed/volume reuse, UI cleanup.
- YouTube power features: disable autoplay, auto-pause on hidden tab,
  remember playback position, hide end-screen recs/annotations, compact
  comments, hide live chat, focus mode.
- Google Search cleaner: sponsored result hiding, compact layout, hide
  shopping/related-questions/panels, one-click Reading Mode.
- Element Zapper 2.0: hover highlight, stable selector generation
  (id → class → semantic attribute → bounded path), Undo/Redo, per-site
  rule persistence, Clear current/Clear all.
- Custom Filter Engine: domain + CSS selector + hide/remove, validated
  before save.
- Whitelist system (hostname-based) with declarativeNetRequest
  session-rule bypass for network-level blocking.
- Per-site profile scaffolding (`site-profiles` storage).
- Statistics engine: Today / 7 days / 30 days / All time, local only.
- Full settings dashboard: Overview, YouTube, Google, Zapper, Filters,
  Privacy, Appearance, Shortcuts, Statistics, Advanced.
- Popup: protection toggle, current site, quick actions, stats summary.
- Theme engine: Dark / Light / System via CSS custom properties.
- Import/Export and Backup/Restore (validated JSON, no code execution).
- Debug logging system, gated behind a single `debugMode` flag.
- Keyboard shortcut manager with dashboard-editable bindings.
- Accessibility: ARIA labels/roles on interactive controls, visible focus
  states, `prefers-reduced-motion` handling.

### Architecture
- Manifest V3, minimum-necessary permissions.
- declarativeNetRequest for network-layer blocking (static, packaged
  rule JSON only).
- Single background message router; content scripts never touch
  `chrome.storage` directly.
- Per-feature `init()`/`destroy()` lifecycle with independent failure
  isolation and centralized cleanup on SPA navigation.
