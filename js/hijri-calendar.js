// ==================== HIJRI CALENDAR ENGINE ====================
import { state } from './state.js';

export var hijriMonthNamesAr = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];
export var hijriMonthNamesEn = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhul Qi\'dah', 'Dhul Hijjah'
];

export function getHijriMonthNames() {
    return state.currentLang === 'ar' ? hijriMonthNamesAr : hijriMonthNamesEn;
}

export function getHijriMonthName(index) {
    // index: 0-11
    return getHijriMonthNames()[index];
}

// Convert a Gregorian Date object to Hijri {year, month, day}
export function gregorianToHijri(gDate) {
    try {
        var fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
            year: 'numeric', month: 'numeric', day: 'numeric'
        });
        var parts = fmt.formatToParts(gDate);
        var hYear = 0, hMonth = 0, hDay = 0;
        parts.forEach(function(p) {
            if (p.type === 'year') hYear = parseInt(p.value);
            if (p.type === 'month') hMonth = parseInt(p.value);
            if (p.type === 'day') hDay = parseInt(p.value);
        });
        return { year: hYear, month: hMonth, day: hDay };
    } catch(e) {
        console.error('Hijri conversion error:', e);
        return { year: 1446, month: 1, day: 1 };
    }
}

// Get today's Hijri date
export function getTodayHijri() {
    return gregorianToHijri(new Date());
}

// Get Hijri overrides from localStorage
export function getHijriOverrides() {
    try {
        var stored = localStorage.getItem('salah_hijri_overrides');
        return stored ? JSON.parse(stored) : {};
    } catch(e) { return {}; }
}

export function saveHijriOverrides(overrides) {
    try { localStorage.setItem('salah_hijri_overrides', JSON.stringify(overrides)); }
    catch(e) { console.error('Save hijri overrides error:', e); }
}

// Get the number of days in a Hijri month
export function getHijriDaysInMonth(hYear, hMonth) {
    // Check direct days-count override first (user said 29 or 30)
    var daysOverrideKey = 'salah_hijri_days_' + hYear + '_' + hMonth;
    var daysOverride = localStorage.getItem(daysOverrideKey);
    if (daysOverride) {
        return parseInt(daysOverride);
    }

    var overrides = getHijriOverrides();
    var key = hYear + '_' + hMonth;
    var nextMonth = hMonth === 12 ? 1 : hMonth + 1;
    var nextYear = hMonth === 12 ? hYear + 1 : hYear;
    var nextKey = nextYear + '_' + nextMonth;

    // If we have overrides for both this and next month, use those
    if (overrides[key] && overrides[nextKey]) {
        var d1 = new Date(overrides[key]);
        var d2 = new Date(overrides[nextKey]);
        return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    }

    // Direct check: does day 30 exist in this Hijri month?
    try {
        var day1G = hijriToGregorianDay1(hYear, hMonth);
        // Day 30 would be 29 days after day 1
        var day30G = new Date(day1G.getTime() + 29 * 86400000);
        var h30 = gregorianToHijri(day30G);

        if (h30.year === hYear && h30.month === hMonth) {
            return 30;
        } else {
            return 29;
        }
    } catch(e) {
        // Fallback to difference method
        var startG = hijriToGregorianDay1(hYear, hMonth);
        var endG = hijriToGregorianDay1(nextYear, nextMonth);
        var diff = Math.round((endG - startG) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 30;
    }
}

// Cache for hijriToGregorianDay1 results
export var _hijriDay1Cache = {};

// Convert Hijri year/month/day=1 to approximate Gregorian Date
// Uses binary search with Intl as the oracle
export function hijriToGregorianDay1(hYear, hMonth) {
    var overrides = getHijriOverrides();
    var key = hYear + '_' + hMonth;
    if (overrides[key]) return new Date(overrides[key]);
    if (_hijriDay1Cache[key]) return new Date(_hijriDay1Cache[key]);

    // Approximate: Hijri year ≈ Gregorian year - 579 (rough)
    var approxDays = ((hYear - 1) * 354.36667) + ((hMonth - 1) * 29.53056);
    var epochGreg = new Date(622, 6, 19); // Hijri epoch approximate
    var guess = new Date(epochGreg.getTime() + approxDays * 86400000);

    // Binary search
    var low = new Date(guess.getTime() - 45 * 86400000);
    var high = new Date(guess.getTime() + 45 * 86400000);

    for (var i = 0; i < 60; i++) {
        var mid = new Date((low.getTime() + high.getTime()) / 2);
        var h = gregorianToHijri(mid);
        var midVal = h.year * 10000 + h.month * 100 + h.day;
        var targetVal = hYear * 10000 + hMonth * 100 + 1;

        if (midVal < targetVal) {
            low = new Date(mid.getTime() + 86400000);
        } else if (midVal > targetVal) {
            high = new Date(mid.getTime() - 86400000);
        } else {
            _hijriDay1Cache[key] = mid.getTime();
            return mid;
        }
    }

    // Fallback: walk from low
    for (var d = new Date(low); d <= high; d = new Date(d.getTime() + 86400000)) {
        var hh = gregorianToHijri(d);
        if (hh.year === hYear && hh.month === hMonth && hh.day === 1) {
            _hijriDay1Cache[key] = d.getTime();
            return d;
        }
    }
    _hijriDay1Cache[key] = guess.getTime();
    return guess;
}

// Convert Hijri date to Gregorian
export function hijriToGregorian(hYear, hMonth, hDay) {
    var day1 = hijriToGregorianDay1(hYear, hMonth);
    return new Date(day1.getTime() + (hDay - 1) * 86400000);
}

// Check if a Hijri date is in the future
export function isFutureDateHijri(hDay, hMonth, hYear) {
    var today = getTodayHijri();
    if (hYear > today.year) return true;
    if (hYear < today.year) return false;
    if (hMonth > today.month) return true;
    if (hMonth < today.month) return false;
    return hDay > today.day;
}

// Get Gregorian months that a Hijri month spans
export function getGregorianSpanForHijriMonth(hYear, hMonth) {
    var day1 = hijriToGregorianDay1(hYear, hMonth);
    var daysInMonth = getHijriDaysInMonth(hYear, hMonth);
    var lastDay = new Date(day1.getTime() + (daysInMonth - 1) * 86400000);

    var gMonthNames = state.currentLang === 'ar'
        ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
        : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    var m1 = gMonthNames[day1.getMonth()];
    var m2 = gMonthNames[lastDay.getMonth()];
    var y1 = day1.getFullYear();
    var y2 = lastDay.getFullYear();

    if (day1.getMonth() === lastDay.getMonth() && y1 === y2) {
        return m1 + ' ' + y1;
    } else if (y1 === y2) {
        return m1 + '-' + m2 + ' ' + y1;
    } else {
        return m1 + ' ' + y1 + ' - ' + m2 + ' ' + y2;
    }
}

// Get the Gregorian day number for a given Hijri day in a month
export function getGregorianDayForHijri(hYear, hMonth, hDay) {
    var gDate = hijriToGregorian(hYear, hMonth, hDay);
    return gDate.getDate();
}

// Format display header: "رمضان ١٤٤٧ (فبراير-مارس ٢٠٢٦)"
export function formatHijriMonthHeader(hYear, hMonth) {
    var monthName = getHijriMonthName(hMonth - 1);
    var gregSpan = getGregorianSpanForHijriMonth(hYear, hMonth);
    return monthName + ' ' + hYear + ' (' + gregSpan + ')';
}

// Function to clear the cache (needed by override dialog and toggleMonthDays)
export function clearHijriDay1Cache() {
    // Clear all entries
    for (var key in _hijriDay1Cache) {
        delete _hijriDay1Cache[key];
    }
}
