// ==================== FIORI SHELL MODULE ====================
import { state } from './state.js';

// Switch between main tab bar tabs (Fard, Sunnah, Fasting)
export function switchTab(tab) {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    // Delegate to the main switchSection function
    var switchSection = window.switchSection;
    if (switchSection) switchSection(tab);
}

// Update shell bar profile info (name + avatar)
export function updateShellBar() {
    if (!state.activeProfile) {
        var shellProfile = document.getElementById('shellProfile');
        if (shellProfile) shellProfile.style.display = 'none';
        return;
    }
    const shell = document.getElementById('shellProfile');
    if (!shell) return;
    shell.style.display = 'flex';

    const isChild = state.activeProfile.age < 12;
    let avatarIcon;
    if (state.activeProfile.gender === 'female') {
        avatarIcon = isChild ? '👧' : '👩';
    } else {
        avatarIcon = isChild ? '👦' : '👨';
    }

    var shellAvatar = document.getElementById('shellAvatar');
    var shellName = document.getElementById('shellName');
    if (shellAvatar) shellAvatar.textContent = avatarIcon;
    if (shellName) shellName.textContent = state.activeProfile.name;
}

// Override applyProfileUI to also update shell bar
// This sets up a wrapper that calls the original + updateShellBar
export function initFioriProfileUIOverride() {
    var origApplyProfileUI = window.applyProfileUI;
    if (origApplyProfileUI) {
        window.applyProfileUI = function() {
            origApplyProfileUI();
            updateShellBar();
        };
    }
}

// Override switchView to update sub-tabs
export function initFioriSwitchViewOverride() {
    var origSwitchView = window.switchView;
    if (origSwitchView) {
        window.switchView = function(type, view) {
            origSwitchView(type, view);
            // Update sub-tab active state
            const subTabs = document.getElementById(`${type}SubTabs`);
            if (subTabs) {
                subTabs.querySelectorAll('.sub-tab').forEach((t, i) => {
                    t.classList.remove('active');
                    if ((view === 'tracker' && i === 0) || (view === 'yearly' && i === 1) || (view === 'dashboard' && i === 2)) {
                        t.classList.add('active');
                    }
                });
            }
        };
    }
}

// Override switchFastingView to update sub-tabs
export function initFioriFastingViewOverride() {
    var origSwitchFastingView = window.switchFastingView;
    if (origSwitchFastingView) {
        window.switchFastingView = function(view) {
            origSwitchFastingView(view);
            const subTabs = document.getElementById('fastingSubTabs');
            if (subTabs) {
                subTabs.querySelectorAll('.sub-tab').forEach((t, i) => {
                    t.classList.remove('active');
                    if ((view === 'voluntary' && i === 0) || (view === 'ramadan' && i === 1) || (view === 'dashboard' && i === 2)) {
                        t.classList.add('active');
                    }
                });
            }
        };
    }
}

// Initialize all Fiori overrides
export function initFiori() {
    initFioriProfileUIOverride();
    initFioriSwitchViewOverride();
    initFioriFastingViewOverride();
}

// Expose on window
window.switchTab = switchTab;
window.updateShellBar = updateShellBar;
