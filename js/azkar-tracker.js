/**
 * azkar-tracker.js — Azkar (Morning/Evening Remembrance) Tracker
 * Handles tracker view, year overview, and dashboard for azkar section.
 */
window.App = window.App || {};
window.App.Azkar = (function() {
    var Storage = null;
    var Hijri = null;
    var I18n = null;
    var Config = null;

    function _init() {
        Storage = window.App.Storage;
        Hijri = window.App.Hijri;
        I18n = window.App.I18n;
        Config = window.App.Config;
    }

    // ==================== DATA STORAGE ====================

    function getAzkarKey(year, month) {
        return 'salah_azkar_' + Storage.getProfilePrefix() + 'h' + year + '_' + month;
    }

    function getAzkarData(year, month) {
        var key = getAzkarKey(year, month);
        var stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : { morning: {}, evening: {} };
    }

    function saveAzkarData(year, month, data) {
        localStorage.setItem(getAzkarKey(year, month), JSON.stringify(data));
    }

    // ==================== TRACKER VIEW ====================

    var currentCategory = 'morning'; // 'morning' or 'evening'

    function switchAzkarCategory(cat) {
        currentCategory = cat;
        document.querySelectorAll('#azkarCategoryToggle .toggle-btn').forEach(function(b) { b.classList.remove('active'); });
        var idx = cat === 'morning' ? 0 : 1;
        var btns = document.querySelectorAll('#azkarCategoryToggle .toggle-btn');
        if (btns[idx]) btns[idx].classList.add('active');
        updateAzkarTracker();
    }

    function updateAzkarTracker() {
        _init();
        var month = parseInt(document.getElementById('azkarTrackerMonth').value);
        var year = parseInt(document.getElementById('azkarTrackerYear').value);
        var daysInMonth = Hijri.getHijriDaysInMonth(year, month);
        var data = getAzkarData(year, month);
        var catData = data[currentCategory] || {};
        var currentLang = I18n.getCurrentLang();

        var grid = document.getElementById('azkarDaysGrid');
        grid.innerHTML = '';

        var todayH = Hijri.getTodayHijri();
        var isCurrentMonth = (todayH.year === year && todayH.month === month);

        var completed = 0;
        for (var day = 1; day <= daysInMonth; day++) {
            var dayBox = document.createElement('div');
            dayBox.className = 'day-box';

            dayBox.appendChild(Hijri.createDualDayNum(day, year, month));

            // Today highlight
            if (isCurrentMonth && todayH.day === day) {
                dayBox.classList.add('today-box');
            }

            if (Storage.isFutureDate(day, month, year)) {
                dayBox.classList.add('disabled');
            } else {
                if (catData[day]) {
                    dayBox.classList.add('checked');
                    dayBox.style.background = 'linear-gradient(135deg, #0EA5E9, #0284C7)';
                    dayBox.style.color = 'white';
                    completed++;
                }
                (function(d) {
                    dayBox.onclick = function() {
                        var azData = getAzkarData(year, month);
                        if (!azData[currentCategory]) azData[currentCategory] = {};
                        azData[currentCategory][d] = !azData[currentCategory][d];
                        if (!azData[currentCategory][d]) delete azData[currentCategory][d];
                        window.App.UI.hapticFeedback(azData[currentCategory][d] ? 'success' : 'light');
                        saveAzkarData(year, month, azData);
                        updateAzkarTracker();
                    };
                })(day);
            }
            grid.appendChild(dayBox);
        }

        var possible = daysInMonth;
        // Subtract future days
        var todayH = Hijri.getTodayHijri();
        if (todayH.year === year && todayH.month === month) {
            possible = todayH.day;
        } else if (Storage.isFutureDate(1, month, year)) {
            possible = 0;
        }
        var rate = possible > 0 ? Math.round((completed / possible) * 100) : 0;

        document.getElementById('azkarCompleted').textContent = completed;
        document.getElementById('azkarTotal').textContent = daysInMonth;
        document.getElementById('azkarRate').textContent = rate + '%';
        document.getElementById('azkarCounter').textContent = completed + ' / ' + daysInMonth;
    }

    function changeAzkarMonth(delta) {
        var month = parseInt(document.getElementById('azkarTrackerMonth').value);
        var year = parseInt(document.getElementById('azkarTrackerYear').value);
        month += delta;
        if (month > 12) { month = 1; year++; }
        else if (month < 1) { month = 12; year--; }
        document.getElementById('azkarTrackerMonth').value = month;
        document.getElementById('azkarTrackerYear').value = year;
        updateAzkarTracker();
    }

    function markAllAzkar() {
        _init();
        var month = parseInt(document.getElementById('azkarTrackerMonth').value);
        var year = parseInt(document.getElementById('azkarTrackerYear').value);
        var daysInMonth = Hijri.getHijriDaysInMonth(year, month);
        var data = getAzkarData(year, month);
        if (!data[currentCategory]) data[currentCategory] = {};

        var todayH = Hijri.getTodayHijri();
        var maxDay = daysInMonth;
        if (todayH.year === year && todayH.month === month) {
            maxDay = todayH.day;
        }

        for (var d = 1; d <= maxDay; d++) {
            data[currentCategory][d] = true;
        }
        saveAzkarData(year, month, data);
        window.App.UI.hapticFeedback('success');
        updateAzkarTracker();
    }

    function resetAzkar() {
        _init();
        return window.App.UI.showConfirm(I18n.t('confirm_clear')).then(function(confirmed) {
            if (!confirmed) return;
            var month = parseInt(document.getElementById('azkarTrackerMonth').value);
            var year = parseInt(document.getElementById('azkarTrackerYear').value);
            var data = getAzkarData(year, month);
            data[currentCategory] = {};
            saveAzkarData(year, month, data);
            updateAzkarTracker();
        });
    }

    // ==================== AZKAR VIEW SWITCH ====================

    function switchAzkarView(view) {
        document.querySelectorAll('#azkarSection .view').forEach(function(v) { v.classList.remove('active'); });

        var subTabs = document.getElementById('azkarSubTabs');
        if (subTabs) {
            subTabs.querySelectorAll('.sub-tab').forEach(function(tab) { tab.classList.remove('active'); });
        }

        if (view === 'tracker') {
            document.getElementById('azkarTrackerView').classList.add('active');
            if (subTabs) { var t = subTabs.querySelectorAll('.sub-tab'); if (t[0]) t[0].classList.add('active'); }
            updateAzkarTracker();
        } else if (view === 'yearly') {
            document.getElementById('azkarYearlyView').classList.add('active');
            if (subTabs) { var t2 = subTabs.querySelectorAll('.sub-tab'); if (t2[1]) t2[1].classList.add('active'); }
            updateAzkarYearly();
        } else if (view === 'dashboard') {
            document.getElementById('azkarDashboardView').classList.add('active');
            if (subTabs) { var t3 = subTabs.querySelectorAll('.sub-tab'); if (t3[2]) t3[2].classList.add('active'); }
            updateAzkarDashboard();
        }
    }

    // ==================== YEAR OVERVIEW ====================

    function updateAzkarYearly() {
        _init();
        var currentLang = I18n.getCurrentLang();
        var yearVal = parseInt(document.getElementById('azkarYearlyYear').value);
        var todayH = Hijri.getTodayHijri();
        var grid = document.getElementById('azkarMonthsGrid');
        grid.innerHTML = '';

        var summaryEl = document.getElementById('azkarYearlySummary');
        var totalMorn = 0, totalEve = 0, totalDays = 0, bestPct = 0, bestIdx = 0;

        for (var month = 1; month <= 12; month++) {
            var data = getAzkarData(yearVal, month);
            var daysInMonth = Hijri.getHijriDaysInMonth(yearVal, month);
            totalDays += daysInMonth;
            var mornCount = Object.values(data.morning || {}).filter(Boolean).length;
            var eveCount = Object.values(data.evening || {}).filter(Boolean).length;
            totalMorn += mornCount;
            totalEve += eveCount;

            var mornPct = daysInMonth > 0 ? Math.round((mornCount / daysInMonth) * 100) : 0;
            var evePct = daysInMonth > 0 ? Math.round((eveCount / daysInMonth) * 100) : 0;
            var avgPct = Math.round((mornPct + evePct) / 2);
            if (avgPct > bestPct) { bestPct = avgPct; bestIdx = month; }

            var isCurrent = todayH.year === yearVal && todayH.month === month;
            var isFuture = todayH.year === yearVal && month > todayH.month;

            var card = document.createElement('div');
            card.className = 'month-card' + (isCurrent ? ' current-month' : '');
            if (isFuture) card.style.opacity = '0.35';

            var barColor = avgPct >= 90 ? 'var(--green-deep)' : avgPct >= 70 ? 'var(--gold)' : 'var(--red, #dc2626)';
            var hijriLabel = Hijri.getHijriMonthName(month - 1);
            var gregSpan = Hijri.getGregorianSpanForHijriMonth(yearVal, month);

            card.innerHTML =
                '<div class="month-card-header">' +
                    '<h3>' + hijriLabel + (isCurrent ? ' <span class="current-dot"></span>' : '') + '</h3>' +
                    '<span class="month-pct">' + avgPct + '%</span>' +
                '</div>' +
                '<div class="month-greg-ref">' + gregSpan + '</div>' +
                '<div class="month-progress"><div class="progress-bar"><div class="progress-fill" style="width:' + avgPct + '%;background:' + barColor + '"></div></div></div>' +
                '<div class="month-stats">' +
                    '<span class="month-badge" style="color:#0EA5E9;background:rgba(14,165,233,0.1)"><span class="material-symbols-rounded" style="font-size:14px;vertical-align:middle;">light_mode</span> ' + mornPct + '%</span>' +
                    '<span class="month-badge" style="color:#6366F1;background:rgba(99,102,241,0.1)"><span class="material-symbols-rounded" style="font-size:14px;vertical-align:middle;">nights_stay</span> ' + evePct + '%</span>' +
                '</div>';

            grid.appendChild(card);
        }

        // Summary
        if (summaryEl) {
            var avgMorn = totalDays > 0 ? Math.round((totalMorn / totalDays) * 100) : 0;
            var avgEve = totalDays > 0 ? Math.round((totalEve / totalDays) * 100) : 0;
            var bestName = bestIdx > 0 ? Hijri.getHijriMonthName(bestIdx - 1) : '-';
            summaryEl.innerHTML =
                '<div class="dashboard-grid" style="margin-bottom:16px;">' +
                    '<div class="stat-card"><div class="label"><span class="material-symbols-rounded" style="font-size:16px;vertical-align:middle;">light_mode</span> ' + (currentLang === 'ar' ? 'أذكار الصباح' : 'Morning') + '</div><div class="value" style="color:#0EA5E9">' + avgMorn + '%</div></div>' +
                    '<div class="stat-card"><div class="label"><span class="material-symbols-rounded" style="font-size:16px;vertical-align:middle;">nights_stay</span> ' + (currentLang === 'ar' ? 'أذكار المساء' : 'Evening') + '</div><div class="value" style="color:#6366F1">' + avgEve + '%</div></div>' +
                    '<div class="stat-card"><div class="label"><span class="material-symbols-rounded" style="font-size:16px;vertical-align:middle;">emoji_events</span> ' + (currentLang === 'ar' ? 'أفضل شهر' : 'Best Month') + '</div><div class="value" style="font-size:1.2em;">' + bestName + '</div><div class="sublabel">' + bestPct + '%</div></div>' +
                '</div>';
        }
    }

    // ==================== DASHBOARD ====================

    function updateAzkarDashboard() {
        _init();
        var Charts = window.App.SVGCharts;
        var currentLang = I18n.getCurrentLang();
        var hYear = parseInt(document.getElementById('azkarDashboardYear').value);
        var todayH = Hijri.getTodayHijri();

        // Gather stats
        var totalMorn = 0, totalEve = 0, totalBoth = 0, totalDays = 0;
        var bestMonth = { month: 0, pct: 0 };
        var monthlyMorn = [], monthlyEve = [];

        for (var m = 1; m <= 12; m++) {
            var data = getAzkarData(hYear, m);
            var days = Hijri.getHijriDaysInMonth(hYear, m);
            totalDays += days;
            var morn = Object.values(data.morning || {}).filter(Boolean).length;
            var eve = Object.values(data.evening || {}).filter(Boolean).length;
            totalMorn += morn;
            totalEve += eve;

            // Count days where both completed
            for (var d = 1; d <= days; d++) {
                if ((data.morning || {})[d] && (data.evening || {})[d]) totalBoth++;
            }

            var mPct = days > 0 ? Math.round((morn / days) * 100) : 0;
            var ePct = days > 0 ? Math.round((eve / days) * 100) : 0;
            monthlyMorn.push(mPct);
            monthlyEve.push(ePct);

            var avg = Math.round((mPct + ePct) / 2);
            if (avg > bestMonth.pct) bestMonth = { month: m, pct: avg };
        }

        var mornRate = totalDays > 0 ? Math.round((totalMorn / totalDays) * 100) : 0;
        var eveRate = totalDays > 0 ? Math.round((totalEve / totalDays) * 100) : 0;

        // Stat cards
        document.getElementById('azkarDashMornRate').textContent = mornRate + '%';
        document.getElementById('azkarDashEveRate').textContent = eveRate + '%';
        document.getElementById('azkarDashBothCount').textContent = totalBoth;
        document.getElementById('azkarDashBestMonth').textContent = bestMonth.month > 0 ? Hijri.getHijriMonthName(bestMonth.month - 1) : '-';
        document.getElementById('azkarDashBestPct').textContent = bestMonth.pct + '%';

        // Mountain chart (two layers: morning=blue, evening=indigo)
        var mtnEl = document.getElementById('azkarMountainChart');
        if (mtnEl && Charts) {
            var monthLabels = window.App.Dashboard.getHijriMonthNamesShort();
            Charts.mountainChart(mtnEl, {
                labels: monthLabels,
                values: monthlyMorn,
                values2: monthlyEve,
                color1: '#0EA5E9',
                color2: '#6366F1',
                currentMonth: todayH.year === hYear ? todayH.month : undefined,
                legend: [
                    { color: '#0EA5E9', label: currentLang === 'ar' ? 'الصباح' : 'Morning' },
                    { color: '#6366F1', label: currentLang === 'ar' ? 'المساء' : 'Evening', dashed: true }
                ]
            });
        }

        // Streak flame bars (morning + evening)
        var streakEl = document.getElementById('azkarStreakFlame');
        if (streakEl && Charts) {
            var mornStreak = calculateAzkarStreak('morning');
            var eveStreak = calculateAzkarStreak('evening');
            Charts.streakFlameBars(streakEl, {
                prayers: [
                    { name: currentLang === 'ar' ? 'الصباح' : 'Morning', icon: 'light_mode', color: '#0EA5E9', current: mornStreak.current, best: mornStreak.best },
                    { name: currentLang === 'ar' ? 'المساء' : 'Evening', icon: 'nights_stay', color: '#6366F1', current: eveStreak.current, best: eveStreak.best }
                ],
                legendLabels: {
                    current: currentLang === 'ar' ? 'الحالية' : 'Current',
                    best: currentLang === 'ar' ? 'الأفضل' : 'Best',
                    record: currentLang === 'ar' ? 'رقم قياسي' : 'Record'
                }
            });
        }

        // Heatmap
        var heatEl = document.getElementById('azkarHeatmap');
        if (heatEl && Charts) {
            var heatGrid = gatherAzkarHeatmap(hYear);
            var dayNames = (Config.T['day_names'][currentLang] || []).slice(0, 7);
            Charts.congregationHeatmap(heatEl, {
                grid: heatGrid,
                dayNames: dayNames,
                maxPrayers: 2,
                scaleLabels: currentLang === 'ar' ? ['أقل', 'أكثر'] : ['Less', 'More']
            });
        }
    }

    function calculateAzkarStreak(category) {
        _init();
        var todayH = Hijri.getTodayHijri();
        var current = 0, best = 0, counting = true;

        // Walk backwards from today
        var year = todayH.year;
        var month = todayH.month;
        var day = todayH.day;

        for (var i = 0; i < 365; i++) {
            var data = getAzkarData(year, month);
            var catData = data[category] || {};

            if (catData[day]) {
                if (counting) current++;
                best = Math.max(best, counting ? current : 0);
            } else {
                if (counting) counting = false;
            }

            // Previous day
            day--;
            if (day < 1) {
                month--;
                if (month < 1) { month = 12; year--; }
                day = Hijri.getHijriDaysInMonth(year, month);
            }
        }

        // Also count consecutive streaks for best
        year = todayH.year; month = todayH.month; day = todayH.day;
        var streak = 0;
        for (var j = 0; j < 365; j++) {
            var d2 = getAzkarData(year, month);
            var c2 = d2[category] || {};
            if (c2[day]) {
                streak++;
                best = Math.max(best, streak);
            } else {
                streak = 0;
            }
            day--;
            if (day < 1) { month--; if (month < 1) { month = 12; year--; } day = Hijri.getHijriDaysInMonth(year, month); }
        }

        return { current: current, best: best };
    }

    function gatherAzkarHeatmap(hYear) {
        _init();
        var grid = [];
        var today = new Date();
        var startDate = new Date(today.getTime() - 69 * 86400000);

        for (var i = 0; i < 70; i++) {
            var d = new Date(startDate.getTime() + i * 86400000);
            var h = Hijri.gregorianToHijri(d);
            var data = getAzkarData(h.year, h.month);
            var count = 0;
            if ((data.morning || {})[h.day]) count++;
            if ((data.evening || {})[h.day]) count++;
            grid.push({ count: count });
        }
        return grid;
    }

    // ==================== PUBLIC API ====================

    return {
        getAzkarKey: getAzkarKey,
        getAzkarData: getAzkarData,
        saveAzkarData: saveAzkarData,
        switchAzkarCategory: switchAzkarCategory,
        updateAzkarTracker: updateAzkarTracker,
        changeAzkarMonth: changeAzkarMonth,
        markAllAzkar: markAllAzkar,
        resetAzkar: resetAzkar,
        switchAzkarView: switchAzkarView,
        updateAzkarYearly: updateAzkarYearly,
        updateAzkarDashboard: updateAzkarDashboard
    };
})();

// Backward compat globals
window.switchAzkarCategory = window.App.Azkar.switchAzkarCategory;
window.updateAzkarTracker = window.App.Azkar.updateAzkarTracker;
window.changeAzkarMonth = window.App.Azkar.changeAzkarMonth;
window.markAllAzkar = window.App.Azkar.markAllAzkar;
window.resetAzkar = window.App.Azkar.resetAzkar;
window.switchAzkarView = window.App.Azkar.switchAzkarView;
window.updateAzkarYearly = window.App.Azkar.updateAzkarYearly;
window.updateAzkarDashboard = window.App.Azkar.updateAzkarDashboard;
