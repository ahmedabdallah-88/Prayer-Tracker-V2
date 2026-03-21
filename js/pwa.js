// ==================== PWA MODULE ====================
import { state } from './state.js';
import { gregorianToHijri } from './hijri-calendar.js';

// ==================== SERVICE WORKER REGISTRATION ====================

export function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(async function(reg) {
                console.log('SW registered:', reg.scope);

                // Listen for notification clicks from SW
                navigator.serviceWorker.addEventListener('message', function(event) {
                    if (event.data && event.data.type === 'notification-click') {
                        window.focus();
                        // Scroll to the prayer that was notified
                        if (event.data.tag && event.data.tag.includes('prayer-after-')) {
                            try {
                                if (window.scrollToUnmarkedPrayer) window.scrollToUnmarkedPrayer();
                            } catch(e) {}
                        }
                    }
                });

                // Check for SW update
                reg.addEventListener('updatefound', function() {
                    var newWorker = reg.installing;
                    newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available - show update bar
                            var updateBar = document.createElement('div');
                            updateBar.id = 'updateBar';
                            updateBar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#059669,#047857);color:white;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;z-index:10001;font-family:Cairo,sans-serif;font-size:0.9em;direction:rtl;box-shadow:0 4px 15px rgba(0,0,0,0.2);';
                            updateBar.innerHTML = '<span>🔄 ' + (state.currentLang === 'ar' ? 'تحديث جديد متاح' : 'Update available') + '</span>' +
                                '<button type="button" onclick="applyUpdate()" style="background:white;color:#047857;border:none;padding:6px 16px;border-radius:8px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif;">' +
                                (state.currentLang === 'ar' ? 'تحديث الآن' : 'Update now') + '</button>';
                            document.body.appendChild(updateBar);
                        }
                    });
                });

                // Register periodic background sync (Chrome Android 80+)
                if ('periodicSync' in reg) {
                    try {
                        var status = await navigator.permissions.query({ name: 'periodic-background-sync' });
                        if (status.state === 'granted') {
                            await reg.periodicSync.register('prayer-check', {
                                minInterval: 15 * 60 * 1000 // 15 minutes
                            });
                            console.log('Periodic sync registered');
                        }
                    } catch(e) {
                        console.log('Periodic sync not available:', e);
                    }
                }
            })
            .catch(err => console.log('SW failed:', err));
    });
}

// ==================== APPLY UPDATE ====================

export function applyUpdate() {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(function(reg) {
            if (reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        });
        // Reload after a small delay for the SW to activate
        setTimeout(function() { window.location.reload(); }, 500);
    } else {
        window.location.reload();
    }
}

// ==================== INSTALL PROMPT HANDLING ====================

export function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        state.deferredPrompt = e;
        // Also set on window for inline handlers
        window.deferredPrompt = e;

        if (!localStorage.getItem('pwa_install_dismissed')) {
            const banner = document.createElement('div');
            banner.id = 'installBanner';
            banner.innerHTML = `
                <div style="position:fixed;bottom:0;left:0;right:0;background:linear-gradient(135deg,var(--primary-dark),var(--primary-medium));
                    padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;
                    z-index:10000;box-shadow:0 -4px 20px rgba(0,0,0,0.3);border-top:3px solid var(--accent);direction:rtl;">
                    <div style="color:white;font-family:'Cairo',sans-serif;flex:1;">
                        <div style="font-size:1.1em;font-weight:700;color:var(--accent);">🕌 تثبيت التطبيق</div>
                        <div style="font-size:0.85em;opacity:0.9;margin-top:4px;">أضف متتبع الصلاة إلى شاشتك الرئيسية</div>
                    </div>
                    <button onclick="deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>{deferredPrompt=null;document.getElementById('installBanner').remove();})"
                        style="background:var(--accent);color:var(--primary-dark);border:none;padding:10px 24px;border-radius:8px;font-weight:700;font-size:1em;cursor:pointer;font-family:'Cairo',sans-serif;">تثبيت</button>
                    <button onclick="document.getElementById('installBanner').remove();localStorage.setItem('pwa_install_dismissed','true');"
                        style="background:none;border:none;color:rgba(255,255,255,0.7);font-size:1.5em;cursor:pointer;padding:5px 8px;">✕</button>
                </div>`;
            document.body.appendChild(banner);
        }
    });
}

// ==================== VISIBILITY CHANGE LISTENERS ====================

export function initVisibilityListeners() {
    // Re-check prayer times when app becomes visible again
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible' && state.activeProfile) {
            if (window.renderPrayerTimes) window.renderPrayerTimes();
            if (window.checkPrayerTimeNotifications) window.checkPrayerTimeNotifications();
        }
    });

    // Schedule next prayer notifications via SW when app goes to background
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden' && state.notificationsEnabled && state.prayerTimesData && state.prayerTimesData.timings) {
            scheduleSWNotifications();
        }
    });
}

// ==================== SCHEDULE SW NOTIFICATIONS ====================

function scheduleSWNotifications() {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
    if (!state.prayerTimesData || !state.prayerTimesData.timings) return;

    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var timings = state.prayerTimesData.timings;

    var todayH = gregorianToHijri(now);
    var getDataObject = window.getDataObject;
    var getPrayerName = window.getPrayerName || function(id) { return id; };
    var dataObj = getDataObject ? getDataObject('fard') : {};

    var parseTimeToMinutes = window.parseTimeToMinutes || function(timeStr) {
        if (!timeStr) return 0;
        var clean = timeStr.replace(/\s*\(.*\)/, '').trim();
        var parts = clean.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    var prayers = [
        { id: 'fajr', time: parseTimeToMinutes(timings.fajr) },
        { id: 'dhuhr', time: parseTimeToMinutes(timings.dhuhr) },
        { id: 'asr', time: parseTimeToMinutes(timings.asr) },
        { id: 'maghrib', time: parseTimeToMinutes(timings.maghrib) },
        { id: 'isha', time: parseTimeToMinutes(timings.isha) }
    ];

    prayers.forEach(function(p) {
        var prayerName = getPrayerName(p.id);

        // Schedule "before" notification (20 min before)
        var beforeMin = p.time - 20;
        if (beforeMin > nowMin) {
            var delayMs = (beforeMin - nowMin) * 60000;
            navigator.serviceWorker.controller.postMessage({
                type: 'SCHEDULE_NOTIFICATION',
                title: '🕌 ' + (state.currentLang === 'ar' ? 'قرب وقت الصلاة' : 'Prayer approaching'),
                body: (state.currentLang === 'ar' ? 'يقترب وقت صلاة ' + prayerName + ' — استعد!' : prayerName + ' in ~20 minutes'),
                tag: 'prayer-before-' + p.id,
                delay: delayMs
            });
        }

        // Schedule "after" notification (30 min after) - only if NOT marked
        var afterMin = p.time + 30;
        if (afterMin > nowMin) {
            var isMarked = dataObj && dataObj[todayH.month] && dataObj[todayH.month][p.id] && dataObj[todayH.month][p.id][todayH.day];
            if (!isMarked) {
                var delayMs2 = (afterMin - nowMin) * 60000;
                navigator.serviceWorker.controller.postMessage({
                    type: 'SCHEDULE_NOTIFICATION',
                    title: '⏰ ' + (state.currentLang === 'ar' ? 'هل صليت؟' : 'Did you pray?'),
                    body: (state.currentLang === 'ar' ? 'مرّ وقت صلاة ' + prayerName + ' — سجّل صلاتك' : prayerName + ' time passed — log it'),
                    tag: 'prayer-after-' + p.id,
                    delay: delayMs2
                });
            }
        }
    });
}

// ==================== INIT ALL PWA FEATURES ====================

export function initPWA() {
    registerServiceWorker();
    initInstallPrompt();
    initVisibilityListeners();
}

// Expose on window
window.applyUpdate = applyUpdate;
