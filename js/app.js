/* Prayer Tracker PWA — app.js (MUST load last) */
window.App = window.App || {};
window.App.Main = (function() {

    // ==================== MERGED INIT ====================
    // Combines: base init + _origInit (profile loading + migration)

    function init() {
        var Hijri = window.App.Hijri;
        var Storage = window.App.Storage;
        var Profiles = window.App.Profiles;
        var DataIO = window.App.DataIO;

        // --- Profile check (from _origInit) ---
        var profiles = Profiles.getProfiles();
        var activeId = Profiles.getActiveProfileId();

        if (profiles.length === 0) {
            Profiles.showProfileScreen();
            return;
        }

        var activeProfile = null;
        if (activeId) {
            activeProfile = profiles.find(function(p) { return p.id === activeId; });
        }
        if (!activeProfile && profiles.length > 0) {
            activeProfile = profiles[0];
            Profiles.setActiveProfileId(activeProfile.id);
        }

        if (activeProfile) {
            // Sync active profile to both Profiles and Storage modules
            Profiles.setActiveProfile(activeProfile);
            Storage.setActiveProfile(activeProfile);

            Profiles.hideProfileScreen();
            Profiles.applyProfileUI();
        }

        // --- Base init ---
        var todayH = Hijri.getTodayHijri();
        Hijri.setCurrentHijriMonth(todayH.month);
        Hijri.setCurrentHijriYear(todayH.year);
        Storage.setCurrentMonth(todayH.month);
        Storage.setCurrentYear(todayH.year);

        // Initialize all year/month inputs with Hijri values
        var el;
        el = document.getElementById('fardDashboardYear');    if (el) el.value = todayH.year;
        el = document.getElementById('fardYearlyYear');       if (el) el.value = todayH.year;
        el = document.getElementById('fardTrackerMonthSelect'); if (el) el.value = todayH.month;
        el = document.getElementById('fardTrackerYearInput');  if (el) el.value = todayH.year;

        el = document.getElementById('sunnahDashboardYear');   if (el) el.value = todayH.year;
        el = document.getElementById('sunnahYearlyYear');      if (el) el.value = todayH.year;
        el = document.getElementById('sunnahTrackerMonthSelect'); if (el) el.value = todayH.month;
        el = document.getElementById('sunnahTrackerYearInput'); if (el) el.value = todayH.year;

        el = document.getElementById('azkarTrackerMonth');     if (el) el.value = todayH.month;
        el = document.getElementById('azkarTrackerYear');      if (el) el.value = todayH.year;
        el = document.getElementById('azkarDashboardYear');    if (el) el.value = todayH.year;
        el = document.getElementById('azkarYearlyYear');       if (el) el.value = todayH.year;

        Storage.loadAllData('fard');
        Storage.loadAllData('sunnah');

        // Update shell bar date — show Hijri + Gregorian
        var shellDate = document.getElementById('shellDateText');
        if (shellDate) {
            var hijriMonthName = window.App.Config.hijriMonthNamesAr[todayH.month - 1] || '';
            var now = new Date();
            var gregMonthName = window.App.Config.gregorianMonthNamesAr[now.getMonth()] || '';
            shellDate.innerHTML = '<span class="material-symbols-rounded" style="font-size:12px;vertical-align:middle;">calendar_today</span> ' + hijriMonthName + ' ' + todayH.year + ' \u0647\u0640 \u2014 ' + gregMonthName + ' ' + now.getFullYear();
        }

        // Defer initial render to ensure DOM is fully ready
        setTimeout(function() {
            try {
                if (typeof window.updateTrackerView === 'function') {
                    window.updateTrackerView('fard');
                }
            } catch(e) {
                console.error('Initial render error:', e);
            }
        }, 0);

        // Prayer reminders (from _origInit)
        setTimeout(function() {
            if (window.App.UI && window.App.UI.checkPrayerReminders) {
                window.App.UI.checkPrayerReminders();
            }
        }, 1000);
    }

    // ==================== FIORI: switchTab ====================

    function switchTab(tab) {
        document.querySelectorAll('.tab-item').forEach(function(t) { t.classList.remove('active'); });
        var tabEl = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
        if (tabEl) tabEl.classList.add('active');
        if (typeof window.switchSection === 'function') {
            window.switchSection(tab);
        }
    }

    // ==================== FIORI: updateShellBar ====================

    function updateShellBar() {
        var activeProfile = window.App.Storage.getActiveProfile();
        var profileBtn = document.getElementById('shellProfileBtn');
        if (!activeProfile) {
            if (profileBtn) profileBtn.style.display = 'none';
            return;
        }
        if (profileBtn) profileBtn.style.display = 'flex';

        // Update profile settings card if visible
        var psName = document.getElementById('psName');
        var psDetails = document.getElementById('psDetails');
        if (psName) psName.textContent = activeProfile.name;
        if (psDetails) {
            var t = window.App.I18n ? window.App.I18n.t : function(k){return k;};
            var isChild = activeProfile.age < 12;
            var genderLabel = activeProfile.gender === 'female' ? (isChild ? t('child_f') : t('female')) : (isChild ? t('child_m') : t('male'));
            psDetails.textContent = genderLabel + ' \u00B7 ' + activeProfile.age + ' ' + t('years_old');
        }
    }

    function openProfileSettings() {
        var overlay = document.getElementById('profileSettingsOverlay');
        if (overlay) {
            overlay.classList.add('show');
            updateShellBar();
        }
    }

    function closeProfileSettings() {
        var overlay = document.getElementById('profileSettingsOverlay');
        if (overlay) overlay.classList.remove('show');
    }

    // ==================== applyUpdate ====================

    function applyUpdate() {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(function(reg) {
                if (reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            });
            setTimeout(function() { window.location.reload(); }, 500);
        } else {
            window.location.reload();
        }
    }

    // ==================== STARTUP SEQUENCE ====================

    function startup() {
        var DataIO = window.App.DataIO;

        // Run migrations before init
        if (DataIO && DataIO.migrateGregorianToHijri) {
            DataIO.migrateGregorianToHijri();
        }
        if (DataIO && DataIO.migrateExistingData) {
            DataIO.migrateExistingData();
        }

        // Load theme + language
        if (window.App.Themes && window.App.Themes.loadTheme) {
            window.App.Themes.loadTheme();
        }
        if (window.App.I18n && window.App.I18n.applyLang) {
            window.App.I18n.applyLang();
        }

        // Main init
        init();

        // Clamp year inputs to valid Hijri range (1400-1500)
        document.addEventListener('input', function(e) {
            var el = e.target;
            if (el.type === 'number' && (el.id.indexOf('Year') !== -1 || el.id.indexOf('year') !== -1)) {
                var val = parseInt(el.value);
                if (isNaN(val)) return;
                var minVal = parseInt(el.min) || 1400;
                var maxVal = parseInt(el.max) || 1500;
                if (val > maxVal) { el.value = maxVal; }
                if (val < minVal && el.value.length >= 4) { el.value = minVal; }
            }
        });

        // Start prayer times monitor
        setTimeout(function() {
            var activeProfile = window.App.Storage.getActiveProfile();
            if (activeProfile && typeof window.startPrayerTimesMonitor === 'function') {
                window.startPrayerTimesMonitor();
            }
        }, 1500);

        // PWA Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(function(reg) {
                        console.log('SW registered:', reg.scope);

                        // Listen for notification clicks from SW
                        navigator.serviceWorker.addEventListener('message', function(event) {
                            if (event.data && event.data.type === 'notification-click') {
                                window.focus();
                                if (event.data.tag && event.data.tag.indexOf('prayer-after-') !== -1) {
                                    try { if (typeof window.scrollToUnmarkedPrayer === 'function') window.scrollToUnmarkedPrayer(); } catch(e) {}
                                }
                            }
                        });

                        // Check for SW update
                        reg.addEventListener('updatefound', function() {
                            var newWorker = reg.installing;
                            newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    var currentLang = window.App.I18n ? window.App.I18n.getCurrentLang() : 'ar';
                                    var updateBar = document.createElement('div');
                                    updateBar.id = 'updateBar';
                                    updateBar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#059669,#047857);color:white;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;z-index:10001;font-family:Cairo,sans-serif;font-size:0.9em;direction:rtl;box-shadow:0 4px 15px rgba(0,0,0,0.2);';
                                    updateBar.innerHTML = '<span><span class="material-symbols-rounded" style="font-size:16px;vertical-align:middle;">refresh</span> ' +
                                        (currentLang === 'ar' ? '\u062A\u062D\u062F\u064A\u062B \u062C\u062F\u064A\u062F \u0645\u062A\u0627\u062D' : 'Update available') + '</span>' +
                                        '<button type="button" onclick="applyUpdate()" style="background:white;color:#047857;border:none;padding:6px 16px;border-radius:8px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif;">' +
                                        (currentLang === 'ar' ? '\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0622\u0646' : 'Update now') + '</button>';
                                    document.body.appendChild(updateBar);
                                }
                            });
                        });

                        // Register periodic background sync
                        if ('periodicSync' in reg) {
                            navigator.permissions.query({ name: 'periodic-background-sync' }).then(function(status) {
                                if (status.state === 'granted') {
                                    reg.periodicSync.register('prayer-check', {
                                        minInterval: 15 * 60 * 1000
                                    }).then(function() {
                                        console.log('Periodic sync registered');
                                    });
                                }
                            }).catch(function(e) {
                                console.log('Periodic sync not available:', e);
                            });
                        }
                    })
                    .catch(function(err) { console.log('SW failed:', err); });
            });
        }

        // Re-check prayer times when app becomes visible
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                var activeProfile = window.App.Storage.getActiveProfile();
                if (activeProfile) {
                    if (typeof window.renderPrayerTimes === 'function') window.renderPrayerTimes();
                    if (window.App.Notifications && window.App.Notifications.checkPrayerTimeNotifications) {
                        window.App.Notifications.checkPrayerTimeNotifications();
                    }
                }
            }
        });

        // Schedule SW notifications when app goes to background
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'hidden') {
                if (window.App.Notifications && window.App.Notifications.isEnabled()) {
                    if (window.App.Notifications.scheduleSWNotifications) {
                        window.App.Notifications.scheduleSWNotifications();
                    }
                }
            }
        });

        // PWA install banner
        if (window.App.UI && window.App.UI.initInstallBanner) {
            window.App.UI.initInstallBanner();
        }
    }

    return {
        init: init,
        startup: startup,
        switchTab: switchTab,
        updateShellBar: updateShellBar,
        openProfileSettings: openProfileSettings,
        closeProfileSettings: closeProfileSettings,
        applyUpdate: applyUpdate
    };
})();

// Backward compat globals
window.switchTab = window.App.Main.switchTab;
window.updateShellBar = window.App.Main.updateShellBar;
window.openProfileSettings = window.App.Main.openProfileSettings;
window.closeProfileSettings = window.App.Main.closeProfileSettings;
window.applyUpdate = window.App.Main.applyUpdate;

// ==================== RUN STARTUP ====================
window.App.Main.startup();
