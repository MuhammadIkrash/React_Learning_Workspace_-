/**
 * @file theme-apply.js
 * Resolves the user's "dark" | "light" | "system" preference to a concrete
 * data-theme value and keeps it in sync with the OS setting live when
 * "system" is selected. Shared by popup.js, dashboard.js, and options.js.
 */

let mediaQuery = null;
let listener = null;

export function applyTheme(root, themePreference) {
  const resolved = resolveTheme(themePreference);
  root.setAttribute('data-theme', resolved);
}

export function resolveTheme(themePreference) {
  if (themePreference === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return themePreference === 'light' ? 'light' : 'dark';
}

/** Call once; keeps applying the resolved theme live if the OS theme changes while "system" is selected. */
export function watchSystemTheme(root, getThemePreference) {
  if (mediaQuery && listener) {
    mediaQuery.removeEventListener('change', listener);
  }
  mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  listener = () => {
    if (getThemePreference() === 'system') {
      applyTheme(root, 'system');
    }
  };
  mediaQuery.addEventListener('change', listener);
}
