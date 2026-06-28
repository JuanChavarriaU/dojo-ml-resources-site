import { DEFAULT_THEME } from './constants.js';

/**
 * Initializes theme from localStorage or default.
 * Takes DOM refs to avoid global coupling.
 */
export function initTheme(themeDarkBtn, themeLightBtn) {
  const savedTheme = localStorage.getItem('theme') || DEFAULT_THEME;
  document.documentElement.className = savedTheme;

  updateThemeButtons(savedTheme, themeDarkBtn, themeLightBtn);
}

export function setTheme(themeName, themeDarkBtn, themeLightBtn) {
  document.documentElement.className = themeName;
  localStorage.setItem('theme', themeName);
  updateThemeButtons(themeName, themeDarkBtn, themeLightBtn);
}

function updateThemeButtons(themeName, themeDarkBtn, themeLightBtn) {
  if (!themeDarkBtn || !themeLightBtn) return;

  if (themeName === 'theme-light') {
    themeLightBtn.classList.add('active');
    themeDarkBtn.classList.remove('active');
  } else {
    themeDarkBtn.classList.add('active');
    themeLightBtn.classList.remove('active');
  }
}
