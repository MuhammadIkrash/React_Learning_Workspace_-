# CleanWeb Pro

**A cleaner web. A smarter YouTube.**

CleanWeb Pro is a privacy-first Chromium (Manifest V3) extension: YouTube ad
protection, a full YouTube player Control Center, an Element Zapper, custom
filters, Google Search cleanup, and a professional settings dashboard —
all running locally, with nothing collected or transmitted.

---

## 1. Installation (Developer Mode)

1. Download/clone this folder (`cleanweb-pro/`).
2. Open `chrome://extensions` (or `edge://extensions` on Edge).
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `cleanweb-pro/` folder.
5. Pin the extension from the toolbar overflow menu for quick access.
6. Visit `youtube.com` or run a Google search to see it in action.

No build step is required — this is plain JavaScript/HTML/CSS, loaded
directly by Chrome.

---

## 2. Architecture

```
UI Layer            popup, dashboard, options
      ↓
Feature Controller   src/content/core/feature-manager.js + bootstrap.js
      ↓
Site Adapter         src/content/core/site-detector.js
      ↓
Detection/Filtering  youtube-ad-detector.js, google-ad-cleaner.js,
                      filter-engine.js, selector-generator.js
      ↓
Storage/Statistics   src/background/storage-manager.js,
                      statistics-manager.js
      ↓
Chrome MV3 APIs       storage, declarativeNetRequest, scripting, tabs, commands
```

**No giant content script.** Every feature (ad detection, speed, quality,
volume, PiP, theater, cinema, shorts, zapper, custom filters, Google
cleanup) lives in its own file under `src/content/*/` and is loaded on
demand by `bootstrap.js`, which acts as the single orchestrator that knows
about every feature. Each feature module exports `init(ctx)` /
`destroy(instance)`, and `feature-manager.js` guarantees one feature
crashing never takes down another (see section 38 of the original spec —
"each feature must fail independently").

### Content script loading (MV3 note — and a real bug this fixed)

MV3 static `content_scripts` entries always run as *classic* (non-module)
scripts. The first version of this extension tried to keep ES module
`import`/`export` in every content-script file by having a tiny classic
"loader" script call `import(chrome.runtime.getURL('.../bootstrap.js'))` at
runtime. **This does not reliably work**: when a dynamically-imported module
has its own relative `import` statements, Chrome can fail to resolve them
against a valid base URL (observed failure: `Failed to fetch dynamically
imported module` / `chrome-extension://invalid/`), and the entire content
script silently never runs — which looked like "ad blocking does nothing"
with no console errors pointing at the real cause.

The fix: every file under `src/content/` is a plain classic script (an IIFE,
no `import`/`export`), and `manifest.json` lists every one of them directly
in `content_scripts.js`, in dependency order. Files communicate through a
single global namespace, `window.CWP`, defined first by
`src/content/shared/namespace.js`:

```
window.CWP = { shared: {}, core: {}, youtube: {}, google: {}, zapper: {}, filters: {} };
```

Each file attaches its public API to a slot in that object, e.g.
`window.CWP.youtube.speed = { getSpeed, applySpeed, ... }`, and reads
whatever earlier-loaded files it depends on from the same object — the
same pattern used by pre-ES-module JavaScript. `src/content/core/bootstrap.js`
is always the **last** script in every `content_scripts` entry, since it's
the orchestrator that reads every other namespace and starts the
feature-manager.

Background (`src/background/*`) and the popup/dashboard/options pages are
**not** affected by this and still use real ES modules (`type: "module"`
service worker, `<script type="module">` in the HTML pages) — that loading
path works reliably; only content-script dynamic `import()` was the problem.
The `src/shared/*.js` ES-module files remain the source of truth for the
background and UI; `src/content/shared/*.js` are classic-script duplicates
of the same logic, kept in sync by hand (noted in each file's header).


### Directory structure

```
cleanweb-pro/
├── manifest.json
├── rules/                      declarativeNetRequest rule JSON (network-layer blocking)
├── src/
│   ├── background/             service worker + storage/statistics/rules/tabs/messages
│   ├── content/
│   │   ├── shared/               classic-script duplicates of shared/ for content scripts (namespace.js, constants.js, utils.js, logger.js, validators.js)
│   │   ├── core/                site detection, feature manager, observers, notifications, cleanup
│   │   ├── youtube/              ad engine, player controls, shorts, enhancements
│   │   ├── google/               search ad cleanup, layout options, reading mode
│   │   ├── zapper/               Element Zapper (selector generator, overlay, storage)
│   │   └── filters/               custom filter engine
│   ├── popup/                   toolbar popup (~360px)
│   ├── dashboard/                full settings dashboard (single page, sidebar nav)
│   ├── options/                  thin redirect to the dashboard (see note below)
│   └── shared/                   constants, defaults, schema, logger, utils, validators, theme
└── assets/icons/
```

### Structural note: `options/` vs `dashboard/`

The spec's structure lists both `dashboard/` and `options/` as full UIs.
CleanWeb Pro implements **one** full settings UI (`dashboard/`) and makes
`options/options.html` a thin redirect to it, because Chrome requires an
`options_page` entry in the manifest but duplicating every control in two
places would immediately drift out of sync. This is the one deliberate
structural deviation from the brief; every other listed file/folder is
present and implements real logic.

### Message-passing, not shared storage access

Popup, dashboard, and content scripts never call `chrome.storage` directly.
They all send messages (`src/shared/constants.js` → `MSG`) to the service
worker, which is the single reader/writer of `chrome.storage.local`
(`src/background/storage-manager.js`). This avoids race conditions between
multiple writers and keeps validation (domains, selectors, imported JSON)
in one place (`src/shared/validators.js`).

---

## 3. Privacy

See the in-app **Privacy** page (Dashboard → Privacy) for the full,
plain-language explanation. Summary:

- Settings, whitelist, custom filters, Zapper rules, and local statistics
  are stored in `chrome.storage.local` — on your device only.
- No analytics, no telemetry, no remote logging.
- No page content, browsing history, cookies, or passwords are ever read
  or transmitted.
- No remote JavaScript is ever fetched or executed — every script shipped
  is in this package, and `content_security_policy` in `manifest.json`
  disallows anything else.
- Statistics ("ads blocked", "elements zapped") are simple local counters,
  never sent anywhere.

---

## 4. Security

- No `eval()`, no `new Function()`, no inline event handlers.
- The Element Zapper and custom filters only ever store/apply **CSS
  selectors**, validated by `shared/validators.js` (`isValidSelector`)
  before they're saved or applied — never arbitrary code.
- Imported settings JSON is structurally validated
  (`isValidImportPayload`) before anything from it is written to storage.
- `declarativeNetRequest` rules are static, packaged JSON — the extension
  never downloads or constructs rules at runtime (rule-manager.js only
  toggles which packaged rulesets are enabled).
- Minimum necessary permissions — see `manifest.json`. No `cookies`,
  `history`, `webRequest`, or blanket `<all_urls>` host permission.

---

## 5. Testing checklist

**Browsers:** Chrome, Edge (both Chromium/MV3).

**YouTube:**
- [ ] Home feed loads, promoted content hidden when Feed Cleaner is on
- [ ] Search results page
- [ ] Watch page: normal video plays with no ads (best-effort — see
      Known Limitations)
- [ ] Watch page: video with a skippable/unskippable ad — playback rate is
      restored to your setting after the ad ends
- [ ] Shorts: J/K/L navigation, speed/volume unaffected on other pages
- [ ] Live video: Control Center appears, ad detection unaffected
- [ ] Playlists
- [ ] Fullscreen — Control Center does not cover native controls
- [ ] Theater mode toggle (CleanWeb's own, via Control Center or shortcut)
- [ ] Picture-in-Picture enter/exit
- [ ] Speed: cycle through 0.25x–4x via Control Center and `[`/`]`/`\`
- [ ] Quality: request 1080p/1440p/4K; verify graceful fallback + "Unavailable" label when not offered by the video
- [ ] Volume boost 100–200%, verify only one AudioContext is created (DevTools → Memory)

**Google:**
- [ ] Search results — sponsored blocks hidden, organic results untouched
- [ ] Images/News tabs — extension does not run (URL pattern excludes them by design)

**Cross-cutting:**
- [ ] Element Zapper: hover highlight, click to remove, Undo/Redo, Clear all, rule persists after reload
- [ ] Whitelist a site — protection badge shows "OFF", features stop applying
- [ ] Custom filter: add a domain + selector, verify it hides only on that domain
- [ ] Dark / Light / System theme in popup and dashboard
- [ ] Statistics: Today / 7 days / 30 days / All time all populate
- [ ] Import a previously exported settings file
- [ ] Export settings, verify valid JSON
- [ ] Reset All Settings — confirmation modal appears, storage clears
- [ ] Keyboard shortcuts (Alt+Shift+P/Z/T/C) — also check `chrome://extensions/shortcuts` for conflicts
- [ ] Popup renders correctly at ~360px
- [ ] Dashboard responsive down to ~700px width
- [ ] Service worker: `chrome://extensions` → "service worker" link shows no errors after each of the above

---

## 6. Known limitations

- **YouTube ad blocking is best-effort.** YouTube actively changes ad
  delivery. CleanWeb Pro uses multiple independent signals and a
  fail-safe design (never guesses), but it does not and cannot claim
  100% ad blocking forever.
- **4K/1440p availability depends on the video and your connection** —
  CleanWeb Pro requests but never unlocks unavailable resolutions.
- **Google ad-block selectors** are structural + a conservative text-label
  heuristic; because Google does not expose stable class names for ad
  slots, a redesign on Google's end may require a selector update.
- **Volume boost** uses `createMediaElementSource`, which requires
  CORS-compliant media; a small number of restricted embeds may not
  support it.
- Screenshot capture can fail for DRM-protected or otherwise
  canvas-tainted video frames — this fails safely with a notification
  rather than a broken image.

---

## 7. Future roadmap

- Versioned, signed JSON rule updates (infrastructure described in
  `rule-manager.js`; no remote code execution path is ever introduced).
- Additional locales (Urdu, Hindi) — string usage is already centralized
  to make this a translation-only change.
- Optional, fully transparent AI features (video summaries, chapters) —
  opt-in only, never on by default, never sending video content anywhere
  without explicit, informed consent at the time of use.
- Per-channel preference rules (a first pass exists in
  `youtube-navigation.js`'s position memory; a full per-channel profile
  system is a natural extension of `site-profiles` storage).

---

## 8. License

See `LICENSE`.
