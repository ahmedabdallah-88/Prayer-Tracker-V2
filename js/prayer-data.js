// ==================== PRAYER DATA MODULE ====================
// Data utility functions for loading, saving, and querying prayer data
import { state, fardPrayers, sunnahPrayers, monthNames } from './state.js';
import {
    getHijriDaysInMonth, getHijriMonthName, getHijriMonthNames,
    getTodayHijri, isFutureDateHijri, gregorianToHijri
} from './hijri-calendar.js';

// ==================== BASIC HELPERS ====================

export function getDaysInMonth(month, year) {
    // Safety: if year looks Gregorian (>2000), convert to Hijri first
    if (year > 2000) {
        try {
            var midDate = new Date(year, month - 1, 15);
            var h = gregorianToHijri(midDate);
            console.warn('getDaysInMonth called with Gregorian year ' + year + ', converting to Hijri ' + h.year + '/' + h.month);
            return getHijriDaysInMonth(h.year, h.month);
        } catch(e) {}
    }
    return getHijriDaysInMonth(year, month);
}

export function isFutureDate(day, month, year) {
    // Now compares in Hijri
    return isFutureDateHijri(day, month, year);
}

export function getPrayersArray(type) {
    return type === 'fard' ? fardPrayers : sunnahPrayers;
}

export function getDataObject(type) {
    return type === 'fard' ? state.fardData : state.sunnahData;
}

// ==================== PROFILE HELPERS ====================

export function getProfilePrefix() {
    return state.activeProfile ? state.activeProfile.id + '_' : '';
}

// ==================== STORAGE KEYS ====================

export function getStorageKey(type, month, year) {
    return `salah_tracker_${getProfilePrefix()}${type}_h${year}_${month}`;
}

export function getCongregationKey(year, month) {
    return `salah_cong_${getProfilePrefix()}h${year}_${month}`;
}

export function getQadaKey(year, month) {
    return `salah_qada_${getProfilePrefix()}h${year}_${month}`;
}

export function getExemptKey(year, month) {
    return `salah_exempt_${getProfilePrefix()}h${year}_${month}`;
}

// ==================== DATA LOAD / SAVE ====================

export function loadAllData(type) {
    const dataObj = type === 'fard' ? state.fardData : state.sunnahData;
    const prayers = getPrayersArray(type);

    for (let month = 1; month <= 12; month++) {
        const key = getStorageKey(type, month, state.currentHijriYear);
        const stored = localStorage.getItem(key);
        if (stored) {
            dataObj[month] = JSON.parse(stored);
        } else {
            dataObj[month] = {};
            prayers.forEach(prayer => {
                dataObj[month][prayer.id] = {};
            });
        }
    }
}

export function saveMonthData(type, month) {
    const dataObj = getDataObject(type);
    const key = getStorageKey(type, month, state.currentHijriYear);
    try {
        localStorage.setItem(key, JSON.stringify(dataObj[month]));
    } catch(e) {
        if (typeof window.showToast === 'function' && typeof window.t === 'function') {
            window.showToast(window.t('storage_full'), 'error');
        }
        console.error('Storage full:', e);
    }
}

// ==================== CONGREGATION DATA ====================

export function getCongregationData(year, month) {
    const stored = localStorage.getItem(getCongregationKey(year, month));
    return stored ? JSON.parse(stored) : {};
}

export function saveCongregationData(year, month, data) {
    try { localStorage.setItem(getCongregationKey(year, month), JSON.stringify(data)); }
    catch(e) {
        if (typeof window.showToast === 'function' && typeof window.t === 'function') {
            window.showToast(window.t('storage_full'), 'error');
        }
    }
}

export function isCongregation(congData, prayerId, day) {
    return congData[prayerId] && congData[prayerId][day];
}

// ==================== QADA DATA ====================

export function getQadaData(year, month) {
    const stored = localStorage.getItem(getQadaKey(year, month));
    return stored ? JSON.parse(stored) : {};
}

export function saveQadaData(year, month, data) {
    try { localStorage.setItem(getQadaKey(year, month), JSON.stringify(data)); }
    catch(e) {
        if (typeof window.showToast === 'function' && typeof window.t === 'function') {
            window.showToast(window.t('storage_full'), 'error');
        }
    }
}

// ==================== EXEMPT (PERIOD) DATA ====================

export function getExemptDays(year, month) {
    const stored = localStorage.getItem(getExemptKey(year, month));
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    // Migration: if old format {day: true}, convert to new {day: {allPrayers: true}}
    const firstVal = Object.values(parsed)[0];
    if (typeof firstVal === 'boolean') {
        // Old format - migrate
        const newData = {};
        Object.keys(parsed).forEach(day => {
            if (parsed[day]) {
                newData[day] = {};
                fardPrayers.forEach(p => { newData[day][p.id] = true; });
                sunnahPrayers.forEach(p => { newData[day][p.id] = true; });
            }
        });
        return newData;
    }
    return parsed;
}

export function saveExemptDays(year, month, data) {
    try { localStorage.setItem(getExemptKey(year, month), JSON.stringify(data)); }
    catch(e) {
        if (typeof window.showToast === 'function' && typeof window.t === 'function') {
            window.showToast(window.t('storage_full'), 'error');
        }
    }
}

export function isPrayerExempt(exemptData, prayerId, day) {
    return exemptData[day] && exemptData[day][prayerId];
}

export function getExemptCountForPrayer(year, month, prayerId) {
    const exempt = getExemptDays(year, month);
    let count = 0;
    Object.keys(exempt).forEach(day => {
        if (exempt[day] && exempt[day][prayerId]) count++;
    });
    return count;
}

// ==================== STATS ====================

export function getMonthStats(type, month, year) {
    const dataObj = getDataObject(type);
    const prayers = getPrayersArray(type);
    const daysInMonth = getDaysInMonth(month, year);
    const isFemale = state.activeProfile && state.activeProfile.gender === 'female' && state.activeProfile.age >= 12;
    let completed = 0;
    let total = 0;

    prayers.forEach(prayer => {
        const exemptCount = isFemale ? getExemptCountForPrayer(year, month, prayer.id) : 0;
        total += daysInMonth - exemptCount;
        if (dataObj[month] && dataObj[month][prayer.id]) {
            completed += Object.values(dataObj[month][prayer.id]).filter(v => v).length;
        }
    });

    return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
}

export function getYearStats(type, year) {
    let totalCompleted = 0;
    let totalPossible = 0;

    for (let month = 1; month <= 12; month++) {
        const stats = getMonthStats(type, month, year);
        totalCompleted += stats.completed;
        totalPossible += stats.total;
    }

    return {
        completed: totalCompleted,
        total: totalPossible,
        percentage: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
    };
}

// ==================== PRAYER NAME ====================

export function getPrayerName(id) {
    const map = {
        'fajr': 'prayer_fajr', 'dhuhr': 'prayer_dhuhr', 'asr': 'prayer_asr',
        'maghrib': 'prayer_maghrib', 'isha': 'prayer_isha',
        'tahajjud': 'prayer_tahajjud', 'sunnah-fajr': 'prayer_sunnah_fajr',
        'duha': 'prayer_duha', 'sunnah-dhuhr': 'prayer_sunnah_dhuhr',
        'sunnah-asr': 'prayer_sunnah_asr', 'sunnah-maghrib': 'prayer_sunnah_maghrib',
        'sunnah-isha': 'prayer_sunnah_isha', 'witr': 'prayer_witr'
    };
    // Use the global t() translation function
    const t = window.t || function(key) { return key; };
    return map[id] ? t(map[id]) : id;
}

// ==================== EXPOSE ON WINDOW ====================

window.getDaysInMonth = getDaysInMonth;
window.isFutureDate = isFutureDate;
window.getPrayersArray = getPrayersArray;
window.getDataObject = getDataObject;
window.getProfilePrefix = getProfilePrefix;
window.getStorageKey = getStorageKey;
window.loadAllData = loadAllData;
window.saveMonthData = saveMonthData;
window.getMonthStats = getMonthStats;
window.getYearStats = getYearStats;
window.getPrayerName = getPrayerName;
window.getCongregationKey = getCongregationKey;
window.getCongregationData = getCongregationData;
window.saveCongregationData = saveCongregationData;
window.isCongregation = isCongregation;
window.getQadaKey = getQadaKey;
window.getQadaData = getQadaData;
window.saveQadaData = saveQadaData;
window.getExemptKey = getExemptKey;
window.getExemptDays = getExemptDays;
window.saveExemptDays = saveExemptDays;
window.isPrayerExempt = isPrayerExempt;
window.getExemptCountForPrayer = getExemptCountForPrayer;
