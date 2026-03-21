// ==================== THEME MODULE ====================
// Theme switching, persistence, and initialization

import { state } from './state.js';

/**
 * Apply a theme by name. 'green' is the default (no data-theme attribute).
 * Saves to localStorage, closes the theme menu, and rebuilds charts if dashboard is visible.
 */
export function setTheme(theme) {
    if (theme === 'green') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Update active state on theme option elements
    document.querySelectorAll('.theme-option').forEach(function(opt) {
        opt.classList.toggle('active', opt.dataset.theme === theme);
    });

    // Save preference
    localStorage.setItem('salah_tracker_theme', theme);

    // Close menu
    var themeOptions = document.getElementById('themeOptions');
    if (themeOptions) {
        themeOptions.classList.remove('show');
    }

    // Rebuild charts if dashboard is visible
    try {
        var currentSection = state.currentSection;
        var dashView = document.getElementById(currentSection + 'DashboardView');
        if (dashView && dashView.classList.contains('active')) {
            if (typeof window.updateCharts === 'function') {
                window.updateCharts(currentSection);
            }
        }
    } catch(e) {}
}

/**
 * Toggle the visibility of the theme picker menu.
 */
export function toggleThemeMenu() {
    var themeOptions = document.getElementById('themeOptions');
    if (themeOptions) {
        themeOptions.classList.toggle('show');
    }
}

/**
 * Load the saved theme from localStorage and apply it.
 * Called on page load.
 */
export function loadTheme() {
    var saved = localStorage.getItem('salah_tracker_theme');
    if (saved && saved !== 'green') {
        setTheme(saved);
    }
}

// Close theme menu on outside click
document.addEventListener('click', function(e) {
    if (!e.target.closest('.theme-options') && !e.target.closest('.shell-btn') && !e.target.closest('.theme-toggle-btn')) {
        var themeOptions = document.getElementById('themeOptions');
        if (themeOptions) {
            themeOptions.classList.remove('show');
        }
    }
});

// Expose on window for inline onclick handlers
window.setTheme = setTheme;
window.toggleThemeMenu = toggleThemeMenu;
window.loadTheme = loadTheme;
