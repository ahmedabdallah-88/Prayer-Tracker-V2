// ==================== NOTIFICATIONS MODULE ====================
// Prayer notification system: toggle, send, check, and schedule via Service Worker

import { state } from './state.js';
import { getPrayerName } from './i18n.js';

/**
 * Update the notification toggle button's appearance based on current state.
 */
export function updateNotifButton() {
    var btn = document.getElementById('notifToggleBtn');
    if (!btn) return;
    var currentLang = state.currentLang;
    if (state.notificationsEnabled) {
        btn.textContent = '\uD83D\uDD14';
        btn.style.background = 'rgba(5,150,105,0.15)';
        btn.style.borderColor = '#059669';
        btn.title = currentLang === 'ar' ? '\u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0645\u0641\u0639\u0651\u0644\u0629 - \u0627\u0636\u063A\u0637 \u0644\u0625\u064A\u0642\u0627\u0641' : 'Notifications ON - tap to disable';
    } else {
        btn.textContent = '\uD83D\uDD15';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.title = currentLang === 'ar' ? '\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A' : 'Enable notifications';
    }
}

/**
 * Toggle prayer notifications on/off.
 * Handles iOS standalone detection, permission requests, and test notifications.
 */
export async function togglePrayerNotifications() {
    var currentLang = state.currentLang;

    if (state.notificationsEnabled) {
        // Disable
        state.notificationsEnabled = false;
        localStorage.setItem('salah_notif_enabled', 'false');
        if (typeof window.showToast === 'function') {
            window.showToast(currentLang === 'ar' ? '\uD83D\uDD15 \u062A\u0645 \u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A' : '\uD83D\uDD15 Notifications disabled', 'info');
        }
    } else {
        // Check iOS standalone mode
        var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        var isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

        if (isIOS && !isStandalone) {
            if (typeof window.showToast === 'function') {
                window.showToast(currentLang === 'ar'
                    ? '\uD83D\uDCF1 \u0644\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0639\u0644\u0649 iOS: \u0623\u0636\u0641 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0644\u0644\u0634\u0627\u0634\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0623\u0648\u0644\u0627\u064B (\u0645\u0634\u0627\u0631\u0643\u0629 \u2190 \u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0634\u0627\u0634\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629)'
                    : '\uD83D\uDCF1 For iOS notifications: Add to Home Screen first (Share \u2192 Add to Home Screen)', 'warning', 6000);
            }
            return;
        }

        // Request permission
        if (!('Notification' in window)) {
            if (typeof window.showToast === 'function') {
                window.showToast(currentLang === 'ar'
                    ? '\u0627\u0644\u0645\u062A\u0635\u0641\u062D \u0644\u0627 \u064A\u062F\u0639\u0645 \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u2014 \u062C\u0631\u0651\u0628 Chrome \u0623\u0648 \u0641\u0639\u0651\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0645\u0646 \u0627\u0644\u0634\u0627\u0634\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629'
                    : 'Notifications not supported \u2014 try Chrome or install as PWA', 'error', 5000);
            }
            return;
        }

        var permission = Notification.permission;
        if (permission === 'denied') {
            if (typeof window.showToast === 'function') {
                window.showToast(currentLang === 'ar' ? '\u062A\u0645 \u062D\u0638\u0631 \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u2014 \u0641\u0639\u0651\u0644\u0647\u0627 \u0645\u0646 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u0635\u0641\u062D' : 'Notifications blocked \u2014 enable in browser settings', 'error');
            }
            return;
        }

        if (permission !== 'granted') {
            permission = await Notification.requestPermission();
        }

        if (permission === 'granted') {
            state.notificationsEnabled = true;
            localStorage.setItem('salah_notif_enabled', 'true');
            if (typeof window.showToast === 'function') {
                window.showToast(currentLang === 'ar' ? '\uD83D\uDD14 \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A' : '\uD83D\uDD14 Notifications enabled', 'success');
            }

            // Show test notification via SW
            sendPrayerNotification(
                currentLang === 'ar' ? '\u0645\u062A\u062A\u0628\u0639 \u0627\u0644\u0635\u0644\u0627\u0629' : 'Prayer Tracker',
                'test'
            );
        } else {
            if (typeof window.showToast === 'function') {
                window.showToast(currentLang === 'ar' ? '\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0633\u0645\u0627\u062D \u0628\u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A' : 'Notification permission not granted', 'warning');
            }
        }
    }
    updateNotifButton();
}

/**
 * Send a prayer notification using the Service Worker (preferred) or the Notification API (fallback).
 * @param {string} prayerName - Display name of the prayer
 * @param {string} type - 'test', 'before', or 'after'
 */
export async function sendPrayerNotification(prayerName, type) {
    if (!state.notificationsEnabled) return;
    if (Notification.permission !== 'granted') return;

    var currentLang = state.currentLang;
    var title, body, tag;

    if (type === 'test') {
        title = '\uD83D\uDD4C ' + prayerName;
        body = currentLang === 'ar' ? '\u0633\u064A\u062A\u0645 \u062A\u0630\u0643\u064A\u0631\u0643 \u0642\u0628\u0644 \u0643\u0644 \u0635\u0644\u0627\u0629 \u0628\u0640 \u0662\u0660 \u062F\u0642\u064A\u0642\u0629' : 'You will be reminded 20 min before each prayer';
        tag = 'prayer-test';
    } else if (type === 'before') {
        title = '\uD83D\uDD4C ' + (currentLang === 'ar' ? '\u0642\u0631\u0628 \u0648\u0642\u062A \u0627\u0644\u0635\u0644\u0627\u0629' : 'Prayer time approaching');
        body = (currentLang === 'ar' ? '\u064A\u0642\u062A\u0631\u0628 \u0648\u0642\u062A \u0635\u0644\u0627\u0629 ' + prayerName + ' \u2014 \u0627\u0633\u062A\u0639\u062F!' : prayerName + ' is coming in ~20 minutes');
        tag = 'prayer-before-' + prayerName;
    } else {
        title = '\u23F0 ' + (currentLang === 'ar' ? '\u0647\u0644 \u0635\u0644\u064A\u062A\u061F' : 'Did you pray?');
        body = (currentLang === 'ar' ? '\u0645\u0631\u0651 \u0648\u0642\u062A \u0635\u0644\u0627\u0629 ' + prayerName + ' \u2014 \u0633\u062C\u0651\u0644 \u0635\u0644\u0627\u062A\u0643' : prayerName + ' time has passed \u2014 log your prayer');
        tag = 'prayer-after-' + prayerName;
    }

    try {
        // Try Service Worker notification first (works on mobile PWA)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            var reg = await navigator.serviceWorker.ready;
            await reg.showNotification(title, {
                body: body,
                icon: 'icons/icon-192x192.png',
                badge: 'icons/icon-72x72.png',
                tag: tag,
                renotify: true,
                vibrate: [200, 100, 200],
                requireInteraction: type !== 'test',
                data: { url: './' }
            });
            return;
        }

        // Fallback to regular Notification API (desktop)
        new Notification(title, {
            body: body,
            icon: 'icons/icon-192x192.png',
            tag: tag,
            renotify: true
        });
    } catch(e) {
        console.log('Notification error:', e);
        // Last resort: in-app toast
        if (typeof window.showToast === 'function') {
            window.showToast(title + ': ' + body, 'info', 5000);
        }
    }
}

/**
 * Check if any prayer time notification should be sent right now.
 * Called periodically by the monitor loop.
 *  - 20 min before prayer: "before" notification
 *  - 30 min after prayer (only if NOT marked): "after" notification
 */
export function checkPrayerTimeNotifications() {
    if (!state.notificationsEnabled || !state.prayerTimesData || !state.prayerTimesData.timings || !state.activeProfile) return;

    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var todayStr = now.toISOString().split('T')[0];
    var timings = state.prayerTimesData.timings;

    // Use gregorianToHijri from global scope (hijri-calendar.js)
    var todayH = (typeof window.gregorianToHijri === 'function') ? window.gregorianToHijri(now) : null;
    if (!todayH) return;

    var dataObj = (typeof window.getDataObject === 'function') ? window.getDataObject('fard') : null;

    var prayers = [
        { id: 'fajr', time: _parseTimeToMinutes(timings.fajr) },
        { id: 'dhuhr', time: _parseTimeToMinutes(timings.dhuhr) },
        { id: 'asr', time: _parseTimeToMinutes(timings.asr) },
        { id: 'maghrib', time: _parseTimeToMinutes(timings.maghrib) },
        { id: 'isha', time: _parseTimeToMinutes(timings.isha) }
    ];

    prayers.forEach(function(p) {
        var beforeKey = todayStr + '_before_' + p.id;
        var afterKey = todayStr + '_after_' + p.id;

        // 20 min before prayer
        var beforeMin = p.time - 20;
        if (nowMin >= beforeMin && nowMin < p.time && !state.notifSentToday[beforeKey]) {
            sendPrayerNotification(getPrayerName(p.id), 'before');
            state.notifSentToday[beforeKey] = true;
        }

        // 30 min after prayer - only if NOT marked
        var afterMin = p.time + 30;
        if (nowMin >= afterMin && nowMin < afterMin + 10 && !state.notifSentToday[afterKey]) {
            // Check if this prayer was marked today
            var isMarked = false;
            if (dataObj && dataObj[todayH.month] && dataObj[todayH.month][p.id] && dataObj[todayH.month][p.id][todayH.day]) {
                isMarked = true;
            }
            if (!isMarked) {
                sendPrayerNotification(getPrayerName(p.id), 'after');
            }
            state.notifSentToday[afterKey] = true;
        }
    });
}

/**
 * Schedule notifications via the Service Worker for when the app goes to background.
 * Sends SCHEDULE_NOTIFICATION messages for upcoming prayers.
 */
export function scheduleSWNotifications() {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
    if (!state.prayerTimesData || !state.prayerTimesData.timings) return;

    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var timings = state.prayerTimesData.timings;
    var currentLang = state.currentLang;

    var todayH = (typeof window.gregorianToHijri === 'function') ? window.gregorianToHijri(now) : null;
    var dataObj = (typeof window.getDataObject === 'function') ? window.getDataObject('fard') : null;

    var prayers = [
        { id: 'fajr', time: _parseTimeToMinutes(timings.fajr) },
        { id: 'dhuhr', time: _parseTimeToMinutes(timings.dhuhr) },
        { id: 'asr', time: _parseTimeToMinutes(timings.asr) },
        { id: 'maghrib', time: _parseTimeToMinutes(timings.maghrib) },
        { id: 'isha', time: _parseTimeToMinutes(timings.isha) }
    ];

    prayers.forEach(function(p) {
        var prayerName = getPrayerName(p.id);

        // Schedule "before" notification (20 min before)
        var beforeMin = p.time - 20;
        if (beforeMin > nowMin) {
            var delayMs = (beforeMin - nowMin) * 60000;
            navigator.serviceWorker.controller.postMessage({
                type: 'SCHEDULE_NOTIFICATION',
                title: '\uD83D\uDD4C ' + (currentLang === 'ar' ? '\u0642\u0631\u0628 \u0648\u0642\u062A \u0627\u0644\u0635\u0644\u0627\u0629' : 'Prayer approaching'),
                body: (currentLang === 'ar' ? '\u064A\u0642\u062A\u0631\u0628 \u0648\u0642\u062A \u0635\u0644\u0627\u0629 ' + prayerName + ' \u2014 \u0627\u0633\u062A\u0639\u062F!' : prayerName + ' in ~20 minutes'),
                tag: 'prayer-before-' + p.id,
                delay: delayMs
            });
        }

        // Schedule "after" notification (30 min after) - only if not marked
        var afterMin = p.time + 30;
        if (afterMin > nowMin) {
            var isMarked = false;
            if (todayH && dataObj && dataObj[todayH.month] && dataObj[todayH.month][p.id] && dataObj[todayH.month][p.id][todayH.day]) {
                isMarked = true;
            }
            if (!isMarked) {
                var delayMs2 = (afterMin - nowMin) * 60000;
                navigator.serviceWorker.controller.postMessage({
                    type: 'SCHEDULE_NOTIFICATION',
                    title: '\u23F0 ' + (currentLang === 'ar' ? '\u0647\u0644 \u0635\u0644\u064A\u062A\u061F' : 'Did you pray?'),
                    body: (currentLang === 'ar' ? '\u0645\u0631\u0651 \u0648\u0642\u062A \u0635\u0644\u0627\u0629 ' + prayerName + ' \u2014 \u0633\u062C\u0651\u0644 \u0635\u0644\u0627\u062A\u0643' : prayerName + ' time passed \u2014 log it'),
                    tag: 'prayer-after-' + p.id,
                    delay: delayMs2
                });
            }
        }
    });
}

// Internal helper - inline parseTimeToMinutes to avoid circular import
function _parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    var clean = timeStr.replace(/\s*\(.*\)/, '').trim();
    var parts = clean.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// Expose on window for inline onclick handlers
window.updateNotifButton = updateNotifButton;
window.togglePrayerNotifications = togglePrayerNotifications;
window.sendPrayerNotification = sendPrayerNotification;
window.checkPrayerTimeNotifications = checkPrayerTimeNotifications;
window.scheduleSWNotifications = scheduleSWNotifications;
