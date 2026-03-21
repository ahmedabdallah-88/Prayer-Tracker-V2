// ==================== PRAYER TIMES API MODULE ====================
// Aladhan API integration, geolocation, rendering, and monitoring

import { state } from './state.js';
import { t, getPrayerName } from './i18n.js';
import { updateNotifButton, checkPrayerTimeNotifications } from './notifications.js';

/**
 * Retrieve cached prayer times from localStorage.
 * Returns the data object if it matches today's date, otherwise null.
 */
export function getPrayerTimesFromStorage() {
    try {
        var stored = localStorage.getItem('salah_prayer_times');
        if (stored) {
            var data = JSON.parse(stored);
            var todayStr = new Date().toISOString().split('T')[0];
            if (data.date === todayStr) {
                return data;
            }
        }
    } catch(e) {}
    return null;
}

/**
 * Save prayer times data to localStorage.
 */
export function savePrayerTimesToStorage(data) {
    try {
        localStorage.setItem('salah_prayer_times', JSON.stringify(data));
    } catch(e) {}
}

/**
 * Get the user's geolocation coordinates.
 * Uses a cached location (up to 7 days old) before requesting fresh coordinates.
 * Returns a Promise resolving to { lat, lng, timestamp }.
 */
export function getUserLocation() {
    return new Promise(function(resolve, reject) {
        // Check cached location
        try {
            var cached = localStorage.getItem('salah_user_location');
            if (cached) {
                var loc = JSON.parse(cached);
                // Use cached for up to 7 days
                if (loc.timestamp && (Date.now() - loc.timestamp) < 7 * 86400000) {
                    resolve(loc);
                    return;
                }
            }
        } catch(e) {}

        if (!navigator.geolocation) {
            reject('Geolocation not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function(pos) {
                var loc = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    timestamp: Date.now()
                };
                localStorage.setItem('salah_user_location', JSON.stringify(loc));
                resolve(loc);
            },
            function(err) {
                reject(err.message);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 3600000 }
        );
    });
}

/**
 * Reverse geocode coordinates to a city name and country code
 * using the Nominatim API. Caches the result (~5km tolerance).
 */
export async function reverseGeocode(lat, lng) {
    try {
        // Check cache
        var cached = localStorage.getItem('salah_city_name');
        if (cached) {
            var data = JSON.parse(cached);
            // Same location within ~5km? reuse
            if (Math.abs(data.lat - lat) < 0.05 && Math.abs(data.lng - lng) < 0.05) {
                return { city: data.city, countryCode: data.countryCode || '' };
            }
        }

        var url = 'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lng + '&format=json&accept-language=' + state.currentLang;
        var response = await fetch(url, { headers: { 'User-Agent': 'PrayerTrackerPWA/1.0' } });
        var json = await response.json();

        var city = '';
        var countryCode = '';
        if (json && json.address) {
            city = json.address.city || json.address.town || json.address.village || json.address.state || '';
            countryCode = (json.address.country_code || '').toUpperCase();
            if (json.address.country) {
                city = city ? (city + '\u060C ' + json.address.country) : json.address.country;
            }
        }

        if (city) {
            localStorage.setItem('salah_city_name', JSON.stringify({ lat: lat, lng: lng, city: city, countryCode: countryCode }));
        }
        return { city: city, countryCode: countryCode };
    } catch(e) {
        console.log('Reverse geocode error:', e);
        return { city: '', countryCode: '' };
    }
}

/**
 * Auto-detect the Aladhan prayer calculation method based on country code.
 * See https://aladhan.com/calculation-methods
 */
export function getPrayerMethod(countryCode) {
    var cc = (countryCode || '').toUpperCase();

    // Egypt
    if (cc === 'EG') return 5;
    // Saudi Arabia, Bahrain
    if (cc === 'SA' || cc === 'BH') return 4;
    // Kuwait
    if (cc === 'KW') return 9;
    // Qatar
    if (cc === 'QA') return 10;
    // UAE, Oman, Yemen
    if (cc === 'AE' || cc === 'OM' || cc === 'YE') return 8;
    // Turkey
    if (cc === 'TR') return 13;
    // Jordan, Palestine, Syria, Iraq, Libya, Sudan, Algeria, Morocco, Tunisia, Lebanon
    if (['JO','PS','SY','IQ','LY','SD','DZ','MA','TN','LB'].indexOf(cc) >= 0) return 3;
    // Pakistan, Afghanistan, Bangladesh
    if (cc === 'PK' || cc === 'AF' || cc === 'BD') return 1;
    // Singapore, Malaysia, Indonesia
    if (cc === 'SG' || cc === 'MY' || cc === 'ID') return 11;
    // France
    if (cc === 'FR') return 12;
    // Russia
    if (cc === 'RU') return 14;
    // North America
    if (cc === 'US' || cc === 'CA') return 2;
    // Default: Muslim World League
    return 3;
}

/**
 * Fetch prayer times from the Aladhan API.
 * If forceRefresh is falsy and cached data is available for today, uses cache.
 */
export async function fetchPrayerTimes(forceRefresh) {
    // Check cache first
    if (!forceRefresh) {
        var cached = getPrayerTimesFromStorage();
        if (cached) {
            state.prayerTimesData = cached;
            renderPrayerTimes();
            return;
        }
    }

    try {
        var loc = await getUserLocation();
        state.userLocation = loc;

        // Get city name and country code first
        var geoResult = await reverseGeocode(loc.lat, loc.lng);
        var countryCode = geoResult.countryCode || '';
        var cityName = geoResult.city || '';

        // Auto-detect calculation method based on country
        var method = getPrayerMethod(countryCode);

        var today = new Date();
        var dateStr = String(today.getDate()).padStart(2,'0') + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + today.getFullYear();

        // Aladhan API with auto-detected method
        var url = 'https://api.aladhan.com/v1/timings/' + dateStr + '?latitude=' + loc.lat + '&longitude=' + loc.lng + '&method=' + method;

        var response = await fetch(url);
        var json = await response.json();

        if (json.code === 200 && json.data && json.data.timings) {
            var timings = json.data.timings;

            var methodName = json.data.meta && json.data.meta.method ? json.data.meta.method.name : '';

            state.prayerTimesData = {
                date: today.toISOString().split('T')[0],
                timings: {
                    fajr: timings.Fajr,
                    sunrise: timings.Sunrise,
                    dhuhr: timings.Dhuhr,
                    asr: timings.Asr,
                    maghrib: timings.Maghrib,
                    isha: timings.Isha
                },
                location: cityName || (json.data.meta ? json.data.meta.timezone : ''),
                method: method,
                methodName: methodName,
                countryCode: countryCode,
                lat: loc.lat,
                lng: loc.lng
            };
            savePrayerTimesToStorage(state.prayerTimesData);
            renderPrayerTimes();
        }
    } catch(e) {
        console.log('Prayer times fetch error:', e);
        // Try to show cached data even if expired
        var cachedFallback = getPrayerTimesFromStorage();
        if (cachedFallback) {
            state.prayerTimesData = cachedFallback;
            renderPrayerTimes();
        } else {
            // Show error in the bar
            var nextInfo = document.getElementById('nextPrayerInfo');
            if (nextInfo) {
                nextInfo.textContent = state.currentLang === 'ar'
                    ? '\u26A0\uFE0F تعذر تحميل المواقيت — اضغط \uD83D\uDD04 أو فعّل الموقع'
                    : '\u26A0\uFE0F Could not load times — tap \uD83D\uDD04 or enable location';
                nextInfo.style.color = '#dc2626';
            }
        }
    }
}

/**
 * Parse a time string like "05:30 (EET)" to total minutes since midnight.
 */
export function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    // Handle "(EET)" or other timezone suffixes
    var clean = timeStr.replace(/\s*\(.*\)/, '').trim();
    var parts = clean.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

/**
 * Format a time string to 12-hour format with AM/PM (or Arabic equivalents).
 */
export function formatTime12h(timeStr) {
    if (!timeStr) return '--:--';
    var clean = timeStr.replace(/\s*\(.*\)/, '').trim();
    var parts = clean.split(':');
    var h = parseInt(parts[0]);
    var m = parts[1];
    var ampm = h >= 12 ? (state.currentLang === 'ar' ? '\u0645' : 'PM') : (state.currentLang === 'ar' ? '\u0635' : 'AM');
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return h + ':' + m + ' ' + ampm;
}

/**
 * Determine which prayer is currently active and which is next.
 * Returns { active, next, prayers, nowMin } or null.
 */
export function getCurrentPrayerState() {
    if (!state.prayerTimesData || !state.prayerTimesData.timings) return null;

    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var timings = state.prayerTimesData.timings;

    var prayers = [
        { id: 'fajr', time: parseTimeToMinutes(timings.fajr) },
        { id: 'dhuhr', time: parseTimeToMinutes(timings.dhuhr) },
        { id: 'asr', time: parseTimeToMinutes(timings.asr) },
        { id: 'maghrib', time: parseTimeToMinutes(timings.maghrib) },
        { id: 'isha', time: parseTimeToMinutes(timings.isha) }
    ];

    var active = null;
    var next = null;

    for (var i = 0; i < prayers.length; i++) {
        var nextIdx = (i + 1) < prayers.length ? i + 1 : null;
        var endTime = nextIdx !== null ? prayers[nextIdx].time : 1440;

        if (nowMin >= prayers[i].time && nowMin < endTime) {
            active = prayers[i].id;
            if (nextIdx !== null) next = prayers[nextIdx];
            break;
        }
    }

    // Before Fajr
    if (nowMin < prayers[0].time) {
        next = prayers[0];
    }

    return { active: active, next: next, prayers: prayers, nowMin: nowMin };
}

/**
 * Render the prayer times bar UI: grid of prayer times, next-prayer countdown, location.
 */
export function renderPrayerTimes() {
    var bar = document.getElementById('prayerTimesBar');
    var grid = document.getElementById('prayerTimesGrid');
    if (!bar || !grid || !state.prayerTimesData || !state.prayerTimesData.timings) return;

    grid.innerHTML = '';

    var prayerState = getCurrentPrayerState();
    var timings = state.prayerTimesData.timings;

    var prayersList = [
        { id: 'fajr', name: getPrayerName('fajr'), time: timings.fajr },
        { id: 'dhuhr', name: getPrayerName('dhuhr'), time: timings.dhuhr },
        { id: 'asr', name: getPrayerName('asr'), time: timings.asr },
        { id: 'maghrib', name: getPrayerName('maghrib'), time: timings.maghrib },
        { id: 'isha', name: getPrayerName('isha'), time: timings.isha }
    ];

    prayersList.forEach(function(p) {
        var item = document.createElement('div');
        item.className = 'pt-item';

        if (prayerState) {
            if (p.id === prayerState.active) {
                item.classList.add('active-prayer');
            } else {
                var pMin = parseTimeToMinutes(p.time);
                if (pMin < prayerState.nowMin && p.id !== prayerState.active) {
                    item.classList.add('passed-prayer');
                }
            }
        }

        item.innerHTML = '<div class="pt-name">' + p.name + '</div><div class="pt-time">' + formatTime12h(p.time) + '</div>';
        grid.appendChild(item);
    });

    // Next prayer countdown
    var nextInfo = document.getElementById('nextPrayerInfo');
    if (nextInfo && prayerState && prayerState.next) {
        var diff = prayerState.next.time - prayerState.nowMin;
        if (diff < 0) diff += 1440;
        var hrs = Math.floor(diff / 60);
        var mins = diff % 60;
        var nextName = getPrayerName(prayerState.next.id);
        var currentLang = state.currentLang;
        if (hrs > 0) {
            nextInfo.textContent = '\u23F3 ' + (currentLang === 'ar' ? '\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629: ' : 'Next: ') + nextName + ' ' + (currentLang === 'ar' ? '\u0628\u0639\u062F ' : 'in ') + hrs + (currentLang === 'ar' ? ' \u0633\u0627\u0639\u0629 \u0648 ' : 'h ') + mins + (currentLang === 'ar' ? ' \u062F\u0642\u064A\u0642\u0629' : 'm');
        } else {
            nextInfo.textContent = '\u23F3 ' + (currentLang === 'ar' ? '\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629: ' : 'Next: ') + nextName + ' ' + (currentLang === 'ar' ? '\u0628\u0639\u062F ' : 'in ') + mins + (currentLang === 'ar' ? ' \u062F\u0642\u064A\u0642\u0629' : ' min');
        }
    } else if (nextInfo) {
        nextInfo.textContent = '';
    }

    // Location display
    var locEl = document.getElementById('prayerTimesLocation');
    if (locEl && state.prayerTimesData.location) {
        locEl.textContent = '\uD83D\uDCCD ' + state.prayerTimesData.location;
    }

    // Update notification toggle button state
    updateNotifButton();
}

/**
 * Force-refresh prayer times by clearing all caches.
 */
export function refreshPrayerTimes() {
    localStorage.removeItem('salah_city_name');
    localStorage.removeItem('salah_user_location');
    localStorage.removeItem('salah_prayer_times');
    state.prayerTimesData = null;
    fetchPrayerTimes(true);
    if (typeof window.showToast === 'function') {
        window.showToast(state.currentLang === 'ar' ? '\u062C\u0627\u0631\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0648\u0627\u0642\u064A\u062A \u0648\u0627\u0644\u0645\u0648\u0642\u0639...' : 'Refreshing times & location...', 'info');
    }
}

/**
 * Start the prayer-times monitoring loop:
 *  - fetches times on start
 *  - re-renders every 30 seconds
 *  - checks notifications
 *  - re-fetches at midnight
 */
export function startPrayerTimesMonitor() {
    // Fetch prayer times
    fetchPrayerTimes(false);

    // Check every 30 seconds for notifications and refresh display
    if (state.prayerTimesCheckInterval) clearInterval(state.prayerTimesCheckInterval);
    state.prayerTimesCheckInterval = setInterval(function() {
        // Re-render to update active/next prayer
        renderPrayerTimes();

        // Check notifications
        checkPrayerTimeNotifications();

        // At midnight, reset and refetch
        var now = new Date();
        if (now.getHours() === 0 && now.getMinutes() < 1) {
            state.notifSentToday = {};
            fetchPrayerTimes(true);
        }
    }, 30000);
}

// Expose on window for inline onclick handlers
window.fetchPrayerTimes = fetchPrayerTimes;
window.getUserLocation = getUserLocation;
window.reverseGeocode = reverseGeocode;
window.getPrayerMethod = getPrayerMethod;
window.getPrayerTimesFromStorage = getPrayerTimesFromStorage;
window.savePrayerTimesToStorage = savePrayerTimesToStorage;
window.renderPrayerTimes = renderPrayerTimes;
window.refreshPrayerTimes = refreshPrayerTimes;
window.parseTimeToMinutes = parseTimeToMinutes;
window.formatTime12h = formatTime12h;
window.getCurrentPrayerState = getCurrentPrayerState;
window.startPrayerTimesMonitor = startPrayerTimesMonitor;
