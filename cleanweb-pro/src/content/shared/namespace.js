/**
 * @file namespace.js
 * MUST be the first content-script file loaded. Defines the single global
 * namespace every other content-script file attaches to.
 *
 * Why this exists: MV3 content scripts declared in manifest.json always run
 * as classic (non-module) scripts, so they cannot use `import`/`export`.
 * Loading modules via dynamic import() from a content script is unreliable
 * in practice (relative imports inside the dynamically-imported module can
 * fail to resolve against a valid base URL — see CHANGELOG "1.0.1"). The
 * fix is the same pattern browsers used before ES modules existed: every
 * file is a classic script wrapped in an IIFE, and files communicate through
 * one shared global object instead of import/export.
 */
(function () {
  if (window.CWP) return; // idempotent if injected twice
  window.CWP = {
    shared: {},
    core: {},
    youtube: {},
    google: {},
    zapper: {},
    filters: {}
  };
})();
