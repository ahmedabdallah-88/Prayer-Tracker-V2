// ==================== TRACKER MODULE ====================
// Monthly tracker rendering, day toggling (3-state cycle), batch marking,
// stats, month navigation, and weekly view helpers.
import { state, fardPrayers, sunnahPrayers } from './state.js';
import {
    getHijriDaysInMonth, getHijriMonthName, getTodayHijri,
    isFutureDateHijri, formatHijriMonthHeader, hijriToGregorian,
    gregorianToHijri
} from './hijri-calendar.js';
import {
    getPrayersArray, getDataObject, loadAllData, saveMonthData,
    isFutureDate, getCongregationData, saveCongregationData,
    isCongregation, getQadaData, saveQadaData,
    getExemptDays, isPrayerExempt, getExemptCountForPrayer,
    getPrayerName
} from './prayer-data.js';
import { showToast, hapticFeedback, updateMonthDaysButton } from './ui-utils.js';

// ==================== DUAL DAY NUMBER DISPLAY ====================
// Creates a document fragment with Hijri primary + Gregorian secondary day numbers

function createDualDayNum(hijriDay, hYear, hMonth) {
    var frag = document.createDocumentFragment();
    var dayNum = document.createElement('span');
    dayNum.className = 'day-number';
    dayNum.textContent = hijriDay;
    frag.appendChild(dayNum);

    try {
        var gDate = hijriToGregorian(hYear, hMonth, hijriDay);
        var gregSpan = document.createElement('span');
        gregSpan.className = 'day-greg';
        gregSpan.textContent = gDate.getDate();
        frag.appendChild(gregSpan);
    } catch(e) {}

    return frag;
}

// ==================== TRACKER VIEW UPDATE ====================

function updateTrackerView(type) {
    state.currentHijriMonth = parseInt(document.getElementById(`${type}TrackerMonthSelect`).value);
    state.currentHijriYear = parseInt(document.getElementById(`${type}TrackerYearInput`).value);
    state.currentMonth = state.currentHijriMonth;
    state.currentYear = state.currentHijriYear;

    // Update header with Hijri display
    var headerEl = document.getElementById(`${type}TrackerHijriHeader`);
    if (headerEl) {
        // For fard, the text is in a child span
        var textEl = document.getElementById(`${type}TrackerHijriHeaderText`);
        if (textEl) {
            textEl.textContent = formatHijriMonthHeader(state.currentHijriYear, state.currentHijriMonth);
        } else {
            headerEl.textContent = formatHijriMonthHeader(state.currentHijriYear, state.currentHijriMonth);
        }
    }

    // Update month days button
    updateMonthDaysButton();

    loadAllData(type);
    renderTrackerMonth(type);
    updateTrackerStats(type);
    if (typeof window.renderStreaks === 'function') {
        window.renderStreaks(type);
    }
}

// ==================== RENDER TRACKER MONTH ====================
// Final override version that supports exempt days, congregation, qada, weekly view

function renderTrackerMonth(type) {
    var container = document.getElementById(`${type}TrackerPrayersContainer`);
    container.innerHTML = '';

    var prayers = getPrayersArray(type);
    var dataObj = getDataObject(type);
    // Use Hijri variables directly
    var hYear = state.currentHijriYear;
    var hMonth = state.currentHijriMonth;
    var daysInMonth = getHijriDaysInMonth(hYear, hMonth);
    var isFemale = state.activeProfile && state.activeProfile.gender === 'female' && state.activeProfile.age >= 12;
    var exemptData = isFemale ? getExemptDays(hYear, hMonth) : {};
    var isExemptModeOn = state.exemptMode[type];

    prayers.forEach(function(prayer) {
        var section = document.createElement('div');
        section.className = `prayer-section ${prayer.class}`;

        var completed = 0;
        var exemptCount = isFemale ? getExemptCountForPrayer(hYear, hMonth, prayer.id) : 0;
        if (dataObj[hMonth] && dataObj[hMonth][prayer.id]) {
            completed = Object.values(dataObj[hMonth][prayer.id]).filter(function(v) { return v; }).length;
        }

        var adjustedTotal = daysInMonth - exemptCount;

        var header = document.createElement('div');
        header.className = 'prayer-header';

        var nameDiv = document.createElement('div');
        nameDiv.className = 'prayer-name';
        nameDiv.innerHTML = `<span>${prayer.icon}</span><span>${getPrayerName(prayer.id)}</span>`;

        var counter = document.createElement('div');
        counter.className = 'prayer-counter';
        counter.textContent = `${completed} / ${adjustedTotal}`;

        // Batch select button
        var t = window.t || function(k) { return k; };
        if (!isExemptModeOn && !(type === 'fard' && state.congregationMode)) {
            var batchBtn = document.createElement('button');
            batchBtn.className = 'batch-btn';
            batchBtn.textContent = t('mark_all');
            batchBtn.onclick = (function(pId) {
                return function(e) {
                    e.stopPropagation();
                    batchMarkPrayer(type, pId);
                };
            })(prayer.id);
            header.appendChild(nameDiv);
            header.appendChild(batchBtn);
            header.appendChild(counter);
        } else {
            header.appendChild(nameDiv);
            header.appendChild(counter);
        }

        var grid = document.createElement('div');
        grid.className = 'days-grid';

        // Determine which days to show based on view mode
        var daysToShow = [];
        if (state.trackerViewMode === 'week') {
            daysToShow = getWeekDays();
        } else {
            for (var _d = 1; _d <= daysInMonth; _d++) daysToShow.push(_d);
        }

        // Add day-of-week headers for weekly view (only for first prayer in section)
        if (state.trackerViewMode === 'week' && prayer === prayers[0]) {
            var weekHeaders = getWeekDayHeaders();
            var headerRow = document.createElement('div');
            headerRow.className = 'week-day-header';
            weekHeaders.forEach(function(wh) {
                var lbl = document.createElement('div');
                lbl.className = 'week-day-label' + (wh.isToday ? ' today' : '');
                lbl.textContent = wh.dayName;
                headerRow.appendChild(lbl);
            });
            section.appendChild(header);
            section.appendChild(headerRow);
        } else {
            section.appendChild(header);
        }

        daysToShow.forEach(function(day) {
            var dayBox = document.createElement('div');
            dayBox.className = 'day-box';

            // Add Gregorian date reference as tooltip
            try {
                var gDate = hijriToGregorian(hYear, hMonth, day);
                dayBox.title = gDate.getDate() + '/' + (gDate.getMonth() + 1) + '/' + gDate.getFullYear();
            } catch(e) {}

            if (isPrayerExempt(exemptData, prayer.id, day)) {
                dayBox.appendChild(createDualDayNum(day, hYear, hMonth));
                dayBox.classList.add('exempt');

                if (isExemptModeOn) {
                    dayBox.onclick = (function(pId, d) {
                        return function() { if (typeof window.toggleExemptPrayer === 'function') window.toggleExemptPrayer(pId, d); };
                    })(prayer.id, day);
                    dayBox.title = t('click_remove_exempt');
                }
            } else if (isFutureDateHijri(day, hMonth, hYear)) {
                dayBox.appendChild(createDualDayNum(day, hYear, hMonth));
                dayBox.classList.add('disabled');
                dayBox.style.opacity = '0.3';
            } else {
                dayBox.appendChild(createDualDayNum(day, hYear, hMonth));

                if (isExemptModeOn) {
                    dayBox.onclick = (function(pId, d) {
                        return function() { if (typeof window.toggleExemptPrayer === 'function') window.toggleExemptPrayer(pId, d); };
                    })(prayer.id, day);
                    dayBox.title = t('click_mark_exempt');
                    dayBox.style.cursor = 'crosshair';

                } else {
                    if (dataObj[hMonth][prayer.id] && dataObj[hMonth][prayer.id][day]) {
                        dayBox.classList.add('checked');
                        // Show congregation icon if marked
                        if (type === 'fard') {
                            var congData = getCongregationData(hYear, hMonth);
                            if (isCongregation(congData, prayer.id, day)) {
                                dayBox.classList.add('congregation');
                                dayBox.classList.remove('checked');
                            }
                        }
                        // Show qada
                        var qadaData = getQadaData(hYear, hMonth);
                        if (qadaData[prayer.id] && qadaData[prayer.id][day]) {
                            dayBox.classList.remove('checked', 'congregation');
                            dayBox.classList.add('qada');
                        }
                    }
                    dayBox.onclick = (function(pId, d) {
                        return function() { handleDayClick(type, pId, d); };
                    })(prayer.id, day);
                }
            }

            grid.appendChild(dayBox);
        });

        section.appendChild(grid);
        container.appendChild(section);
    });
}

// ==================== 3-STATE CLICK SYSTEM ====================
// Each click cycles: empty -> checked (prayed) -> congregation -> qada -> empty

function handleDayClick(type, prayerId, day) {
    if (isFutureDate(day, state.currentMonth, state.currentYear)) {
        var t = window.t || function(k) { return k; };
        showToast(t('future_date'), 'warning');
        return;
    }

    var dataObj = getDataObject(type);
    if (!dataObj[state.currentMonth]) dataObj[state.currentMonth] = {};
    if (!dataObj[state.currentMonth][prayerId]) dataObj[state.currentMonth][prayerId] = {};

    var isChecked = dataObj[state.currentMonth][prayerId][day];
    var congData = (type === 'fard') ? getCongregationData(state.currentYear, state.currentMonth) : null;
    var isCong = congData && congData[prayerId] && congData[prayerId][day];
    var qadaData = getQadaData(state.currentYear, state.currentMonth);
    var isQada = qadaData[prayerId] && qadaData[prayerId][day];

    if (!isChecked) {
        // State 0 -> State 1: Mark as prayed (alone)
        dataObj[state.currentMonth][prayerId][day] = true;
        hapticFeedback('success');
    } else if (isChecked && !isCong && !isQada) {
        // State 1 -> State 2: Mark as congregation
        hapticFeedback('medium');
        if (type === 'fard' && congData) {
            if (!congData[prayerId]) congData[prayerId] = {};
            congData[prayerId][day] = true;
        } else {
            // For sunnah: skip congregation, go to qada
            if (!qadaData[prayerId]) qadaData[prayerId] = {};
            qadaData[prayerId][day] = true;
        }
    } else if (isCong) {
        // State 2 -> State 3: Mark as qada
        hapticFeedback('light');
        if (congData[prayerId]) { delete congData[prayerId][day]; if (Object.keys(congData[prayerId]).length === 0) delete congData[prayerId]; }
        if (!qadaData[prayerId]) qadaData[prayerId] = {};
        qadaData[prayerId][day] = true;
    } else if (isQada) {
        // State 3 -> State 0: Remove everything
        hapticFeedback('light');
        dataObj[state.currentMonth][prayerId][day] = false;
        if (qadaData[prayerId]) { delete qadaData[prayerId][day]; if (Object.keys(qadaData[prayerId]).length === 0) delete qadaData[prayerId]; }
        if (congData && congData[prayerId]) { delete congData[prayerId][day]; }
    }

    saveMonthData(type, state.currentMonth);
    if (type === 'fard' && congData) saveCongregationData(state.currentYear, state.currentMonth, congData);
    saveQadaData(state.currentYear, state.currentMonth, qadaData);
    renderTrackerMonth(type);
    updateTrackerStats(type);
    if (typeof window.renderStreaks === 'function') window.renderStreaks(type);
    if (type === 'fard') {
        if (typeof window.updateCongregationStats === 'function') window.updateCongregationStats();
        if (typeof window.checkPrayerReminders === 'function') window.checkPrayerReminders();
    }
}

// ==================== SIMPLE TOGGLE DAY (legacy) ====================

function toggleDay(type, prayerId, day) {
    // Validate that the date is not in the future
    if (isFutureDate(day, state.currentMonth, state.currentYear)) {
        var t = window.t || function(k) { return k; };
        showToast(t('future_date'), 'warning');
        return;
    }

    var dataObj = getDataObject(type);

    if (!dataObj[state.currentMonth][prayerId]) {
        dataObj[state.currentMonth][prayerId] = {};
    }

    dataObj[state.currentMonth][prayerId][day] = !dataObj[state.currentMonth][prayerId][day];
    saveMonthData(type, state.currentMonth);
    if (typeof window.renderMonthDetail === 'function') window.renderMonthDetail(type);
}

// ==================== TRACKER STATS ====================
// Override version that accounts for exempt days (per prayer)

function updateTrackerStats(type) {
    var prayers = getPrayersArray(type);
    var dataObj = getDataObject(type);
    var hYear = state.currentHijriYear;
    var hMonth = state.currentHijriMonth;
    var daysInMonth = getHijriDaysInMonth(hYear, hMonth);
    var isFemale = state.activeProfile && state.activeProfile.gender === 'female' && state.activeProfile.age >= 12;

    var totalCompleted = 0;
    var totalPossible = 0;

    prayers.forEach(function(prayer) {
        var exemptCount = isFemale ? getExemptCountForPrayer(hYear, hMonth, prayer.id) : 0;
        var adjustedDays = daysInMonth - exemptCount;
        totalPossible += adjustedDays;

        var completed = 0;
        if (dataObj[hMonth] && dataObj[hMonth][prayer.id]) {
            completed = Object.values(dataObj[hMonth][prayer.id]).filter(function(v) { return v; }).length;
        }
        totalCompleted += completed;
    });

    document.getElementById(`${type}TrackerTotalCompleted`).textContent = totalCompleted;
    document.getElementById(`${type}TrackerTotalRemaining`).textContent = Math.max(0, totalPossible - totalCompleted);

    var rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    document.getElementById(`${type}TrackerCompletionRate`).textContent = rate + '%';
}

// ==================== MONTH NAVIGATION ====================

function changeTrackerMonth(type, delta) {
    state.currentHijriMonth += delta;
    if (state.currentHijriMonth > 12) {
        state.currentHijriMonth = 1;
        state.currentHijriYear++;
    } else if (state.currentHijriMonth < 1) {
        state.currentHijriMonth = 12;
        state.currentHijriYear--;
    }
    state.currentMonth = state.currentHijriMonth;
    state.currentYear = state.currentHijriYear;

    // Reset week start for weekly view
    if (state.trackerViewMode === 'week') {
        if (delta > 0) {
            state.currentWeekStart = 1;
        } else {
            state.currentWeekStart = Math.max(1, getHijriDaysInMonth(state.currentHijriYear, state.currentHijriMonth) - 6);
        }
        updateWeekLabel();
    }

    document.getElementById(`${type}TrackerMonthSelect`).value = state.currentHijriMonth;
    document.getElementById(`${type}TrackerYearInput`).value = state.currentHijriYear;
    loadAllData(type);
    updateTrackerView(type);
}

// ==================== RESET TRACKER MONTH ====================

async function resetTrackerMonth(type) {
    var t = window.t || function(k) { return k; };
    if (await (window.showConfirm || showConfirm)(t('confirm_clear'))) {
        var dataObj = getDataObject(type);
        var prayers = getPrayersArray(type);

        dataObj[state.currentMonth] = {};
        prayers.forEach(function(prayer) {
            dataObj[state.currentMonth][prayer.id] = {};
        });
        saveMonthData(type, state.currentMonth);
        renderTrackerMonth(type);
        updateTrackerStats(type);
        if (typeof window.renderStreaks === 'function') window.renderStreaks(type);
    }
}

// ==================== RESET MONTH (yearly detail view) ====================

async function resetMonth(type) {
    var t = window.t || function(k) { return k; };
    if (await (window.showConfirm || showConfirm)(t('confirm_clear'))) {
        var dataObj = getDataObject(type);
        var prayers = getPrayersArray(type);

        dataObj[state.currentMonth] = {};
        prayers.forEach(function(prayer) {
            dataObj[state.currentMonth][prayer.id] = {};
        });
        saveMonthData(type, state.currentMonth);
        if (typeof window.renderMonthDetail === 'function') window.renderMonthDetail(type);
    }
}

// ==================== RENDER MONTH DETAIL (yearly view drilldown) ====================

function renderMonthDetail(type) {
    var container = document.getElementById(`${type}PrayersContainer`);
    container.innerHTML = '';

    var prayers = getPrayersArray(type);
    var dataObj = getDataObject(type);
    // Use Hijri variables directly
    var hYear = state.currentHijriYear;
    var hMonth = state.currentHijriMonth;
    var daysInMonth = getHijriDaysInMonth(hYear, hMonth);
    var isFemale = state.activeProfile && state.activeProfile.gender === 'female' && state.activeProfile.age >= 12;
    var exemptData = isFemale ? getExemptDays(hYear, hMonth) : {};

    prayers.forEach(function(prayer) {
        var section = document.createElement('div');
        section.className = `prayer-section ${prayer.class}`;

        var completed = 0;
        var exemptCount = isFemale ? getExemptCountForPrayer(hYear, hMonth, prayer.id) : 0;
        if (dataObj[hMonth] && dataObj[hMonth][prayer.id]) {
            completed = Object.values(dataObj[hMonth][prayer.id]).filter(function(v) { return v; }).length;
        }
        var adjustedTotal = daysInMonth - exemptCount;

        section.innerHTML = `
            <div class="prayer-header">
                <div class="prayer-name">
                    <span>${prayer.icon}</span>
                    <span>${getPrayerName(prayer.id)}</span>
                </div>
                <div class="prayer-counter">${completed} / ${adjustedTotal}</div>
            </div>
            <div class="days-grid" id="${type}-grid-${prayer.id}"></div>
        `;

        container.appendChild(section);

        var grid = document.getElementById(`${type}-grid-${prayer.id}`);
        for (var day = 1; day <= daysInMonth; day++) {
            var dayBox = document.createElement('div');
            dayBox.className = 'day-box';

            if (isPrayerExempt(exemptData, prayer.id, day)) {
                dayBox.appendChild(createDualDayNum(day, hYear, hMonth));
                dayBox.classList.add('exempt');
            } else if (isFutureDateHijri(day, hMonth, hYear)) {
                dayBox.appendChild(createDualDayNum(day, hYear, hMonth));
                dayBox.classList.add('disabled');
                dayBox.style.opacity = '0.3';
            } else {
                dayBox.appendChild(createDualDayNum(day, hYear, hMonth));

                if (dataObj[hMonth][prayer.id] && dataObj[hMonth][prayer.id][day]) {
                    dayBox.classList.add('checked');
                    // Show congregation for fard
                    if (type === 'fard') {
                        var congData = getCongregationData(hYear, hMonth);
                        if (isCongregation(congData, prayer.id, day)) {
                            dayBox.classList.add('congregation');
                            dayBox.classList.remove('checked');
                        }
                    }
                    // Show qada
                    var qadaData = getQadaData(hYear, hMonth);
                    if (qadaData[prayer.id] && qadaData[prayer.id][day]) {
                        dayBox.classList.remove('checked', 'congregation');
                        dayBox.classList.add('qada');
                    }
                }

                dayBox.onclick = (function(pId, d) {
                    return function() { handleDayClick(type, pId, d); };
                })(prayer.id, day);
            }

            grid.appendChild(dayBox);
        }
    });
}

// ==================== BATCH MARK PRAYER ====================

function batchMarkPrayer(type, prayerId) {
    var dataObj = getDataObject(type);
    var hYear = state.currentHijriYear;
    var hMonth = state.currentHijriMonth;
    var daysInMonth = getHijriDaysInMonth(hYear, hMonth);
    var isFemaleUser = state.activeProfile && state.activeProfile.gender === 'female' && state.activeProfile.age >= 12;
    var exemptData = isFemaleUser ? getExemptDays(hYear, hMonth) : {};

    if (!dataObj[hMonth][prayerId]) dataObj[hMonth][prayerId] = {};

    // Count current state
    var markedCount = 0;
    for (var day = 1; day <= daysInMonth; day++) {
        if (isFutureDateHijri(day, hMonth, hYear)) continue;
        if (isPrayerExempt(exemptData, prayerId, day)) continue;
        if (dataObj[hMonth][prayerId][day]) markedCount++;
    }

    // Count available days
    var availableDays = 0;
    for (var day = 1; day <= daysInMonth; day++) {
        if (isFutureDateHijri(day, hMonth, hYear)) continue;
        if (isPrayerExempt(exemptData, prayerId, day)) continue;
        availableDays++;
    }

    // Toggle: if most are marked, unmark all. Otherwise mark all.
    var shouldMark = markedCount < availableDays / 2;

    for (var day = 1; day <= daysInMonth; day++) {
        if (isFutureDateHijri(day, hMonth, hYear)) continue;
        if (isPrayerExempt(exemptData, prayerId, day)) continue;
        dataObj[hMonth][prayerId][day] = shouldMark;
    }

    saveMonthData(type, hMonth);
    renderTrackerMonth(type);
    updateTrackerStats(type);
    if (typeof window.renderStreaks === 'function') window.renderStreaks(type);
    if (type === 'fard' && typeof window.updateCongregationStats === 'function') window.updateCongregationStats();

    var pName = getPrayerName(prayerId);
    showToast(`${pName}: ${shouldMark ? '\u2705' : '\u21A9\uFE0F'} ${availableDays}`, 'success', 1500);
}

// ==================== WEEKLY VIEW HELPERS ====================

function setTrackerViewMode(mode) {
    state.trackerViewMode = mode;

    // Update toggle buttons
    var weekBtn = document.getElementById('weekViewBtn');
    var monthBtn = document.getElementById('monthViewBtn');
    var weekNav = document.getElementById('weekNavBar');
    var controls = document.querySelector('#fardTrackerView .controls');

    if (weekBtn) weekBtn.classList.toggle('active', mode === 'week');
    if (monthBtn) monthBtn.classList.toggle('active', mode === 'month');
    if (weekNav) weekNav.style.display = mode === 'week' ? 'block' : 'none';
    if (controls) controls.style.display = mode === 'week' ? 'none' : '';

    if (mode === 'week') {
        // Set current week to contain today's Hijri day
        var todayH = getTodayHijri();
        if (todayH.year === state.currentHijriYear && todayH.month === state.currentHijriMonth) {
            // Find the Saturday that starts this week (or day 1 if near start)
            var todayG = new Date();
            todayG.setHours(12, 0, 0, 0);
            var dow = todayG.getDay(); // 0=Sun
            // Go back to Saturday (dow 6)
            var daysBack = (dow + 1) % 7; // Sat=0, Sun=1, Mon=2...
            var satG = new Date(todayG.getTime() - daysBack * 86400000);
            var satH = gregorianToHijri(satG);
            if (satH.year === state.currentHijriYear && satH.month === state.currentHijriMonth) {
                state.currentWeekStart = satH.day;
            } else {
                state.currentWeekStart = 1;
            }
        } else {
            state.currentWeekStart = 1;
        }
    }

    updateWeekLabel();
    renderTrackerMonth(state.currentSection === 'sunnah' ? 'sunnah' : 'fard');
    updateTrackerStats(state.currentSection === 'sunnah' ? 'sunnah' : 'fard');
}

function changeWeek(delta) {
    var daysInMonth = getHijriDaysInMonth(state.currentHijriYear, state.currentHijriMonth);
    state.currentWeekStart += delta * 7;

    if (state.currentWeekStart < 1) {
        // Go to previous month
        changeTrackerMonth(state.currentSection === 'sunnah' ? 'sunnah' : 'fard', -1);
        var newDays = getHijriDaysInMonth(state.currentHijriYear, state.currentHijriMonth);
        state.currentWeekStart = Math.max(1, newDays - 6);
    } else if (state.currentWeekStart > daysInMonth) {
        // Go to next month
        changeTrackerMonth(state.currentSection === 'sunnah' ? 'sunnah' : 'fard', 1);
        state.currentWeekStart = 1;
    }

    updateWeekLabel();
    renderTrackerMonth(state.currentSection === 'sunnah' ? 'sunnah' : 'fard');
}

function getWeekDays() {
    var daysInMonth = getHijriDaysInMonth(state.currentHijriYear, state.currentHijriMonth);
    var days = [];
    for (var i = 0; i < 7; i++) {
        var d = state.currentWeekStart + i;
        if (d >= 1 && d <= daysInMonth) {
            days.push(d);
        }
    }
    return days;
}

function updateWeekLabel() {
    var label = document.getElementById('weekRangeLabel');
    if (!label) return;
    var days = getWeekDays();
    if (days.length === 0) return;

    var first = days[0];
    var last = days[days.length - 1];
    var monthName = getHijriMonthName(state.currentHijriMonth - 1);

    // Show day names for the week
    var firstG = hijriToGregorian(state.currentHijriYear, state.currentHijriMonth, first);
    var lastG = hijriToGregorian(state.currentHijriYear, state.currentHijriMonth, last);

    label.textContent = first + ' - ' + last + ' ' + monthName + ' (' + firstG.getDate() + '-' + lastG.getDate() + '/' + (lastG.getMonth()+1) + ')';
}

function getWeekDayHeaders() {
    var days = getWeekDays();
    var dayNamesShort = state.currentLang === 'ar'
        ? ['سبت', 'أحد', 'إثن', 'ثلث', 'أرب', 'خمس', 'جمع']
        : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    var todayH = getTodayHijri();
    var headers = [];

    days.forEach(function(hDay) {
        var gDate = hijriToGregorian(state.currentHijriYear, state.currentHijriMonth, hDay);
        var dow = gDate.getDay(); // 0=Sun
        // Remap: Sat=0 in our display
        var dayIdx = (dow + 1) % 7;
        var isToday = (todayH.year === state.currentHijriYear && todayH.month === state.currentHijriMonth && todayH.day === hDay);
        headers.push({
            hDay: hDay,
            gDay: gDate.getDate(),
            dayName: dayNamesShort[dayIdx],
            isToday: isToday
        });
    });

    return headers;
}

// ==================== TOGGLE TRACKER DAY (legacy simple toggle) ====================

function toggleTrackerDay(type, prayerId, day) {
    // Validate that the date is not in the future
    if (isFutureDate(day, state.currentMonth, state.currentYear)) {
        var t = window.t || function(k) { return k; };
        showToast(t('future_date'), 'warning');
        return;
    }

    var dataObj = getDataObject(type);

    if (!dataObj[state.currentMonth][prayerId]) {
        dataObj[state.currentMonth][prayerId] = {};
    }

    dataObj[state.currentMonth][prayerId][day] = !dataObj[state.currentMonth][prayerId][day];
    saveMonthData(type, state.currentMonth);
    renderTrackerMonth(type);
    updateTrackerStats(type);
    if (typeof window.renderStreaks === 'function') window.renderStreaks(type);
    if (type === 'fard') {
        if (typeof window.updateCongregationStats === 'function') window.updateCongregationStats();
        if (typeof window.checkPrayerReminders === 'function') window.checkPrayerReminders();
    }
}

// ==================== EXPORTS ====================

export {
    createDualDayNum,
    updateTrackerView,
    renderTrackerMonth,
    handleDayClick,
    toggleDay,
    toggleTrackerDay,
    updateTrackerStats,
    changeTrackerMonth,
    resetTrackerMonth,
    resetMonth,
    renderMonthDetail,
    batchMarkPrayer,
    setTrackerViewMode,
    changeWeek,
    getWeekDays,
    updateWeekLabel,
    getWeekDayHeaders
};

// ==================== EXPOSE ON WINDOW ====================

window.createDualDayNum = createDualDayNum;
window.updateTrackerView = updateTrackerView;
window.renderTrackerMonth = renderTrackerMonth;
window.handleDayClick = handleDayClick;
window.toggleDay = toggleDay;
window.toggleTrackerDay = toggleTrackerDay;
window.updateTrackerStats = updateTrackerStats;
window.changeTrackerMonth = changeTrackerMonth;
window.resetTrackerMonth = resetTrackerMonth;
window.resetMonth = resetMonth;
window.renderMonthDetail = renderMonthDetail;
window.batchMarkPrayer = batchMarkPrayer;
window.setTrackerViewMode = setTrackerViewMode;
window.changeWeek = changeWeek;
window.getWeekDays = getWeekDays;
window.updateWeekLabel = updateWeekLabel;
window.getWeekDayHeaders = getWeekDayHeaders;
