/**
 * dashboard.js — Dashboard using custom SVG visualizations
 * All Chart.js usage replaced with window.App.SVGCharts
 */
window.App = window.App || {};
window.App.Dashboard = (function() {
    var Storage = window.App.Storage;
    var Hijri   = window.App.Hijri;
    var I18n    = window.App.I18n;
    var Config  = window.App.Config;

    function getHijriMonthNamesShort() {
        var lang = I18n.getCurrentLang();
        return lang === 'ar'
            ? ['\u0645\u062d\u0631\u0645', '\u0635\u0641\u0631', '\u0631\u0628\u064a\u0639\u0661', '\u0631\u0628\u064a\u0639\u0662', '\u062c\u0645\u0627\u062f\u0649\u0661', '\u062c\u0645\u0627\u062f\u0649\u0662', '\u0631\u062c\u0628', '\u0634\u0639\u0628\u0627\u0646', '\u0631\u0645\u0636\u0627\u0646', '\u0634\u0648\u0627\u0644', '\u0630\u0648 \u0627\u0644\u0642\u0639\u062f\u0629', '\u0630\u0648 \u0627\u0644\u062d\u062c\u0629']
            : ['Muh', 'Saf', 'Rb1', 'Rb2', 'Jm1', 'Jm2', 'Raj', 'Sha', 'Ram', 'Shw', 'DhQ', 'DhH'];
    }

    // ==================== SHARED DATA GATHERERS ====================

    function gatherPrayerStats(type, hYear) {
        var prayers = Storage.getPrayersArray(type);
        var dataObj = Storage.getDataObject(type);
        var results = [];

        prayers.forEach(function(prayer) {
            var completed = 0, total = 0, congCount = 0;
            for (var m = 1; m <= 12; m++) {
                var days = Hijri.getHijriDaysInMonth(hYear, m);
                total += days;
                if (dataObj[m] && dataObj[m][prayer.id]) {
                    var cDays = Object.keys(dataObj[m][prayer.id]).filter(function(d) { return dataObj[m][prayer.id][d]; });
                    completed += cDays.length;
                    if (type === 'fard') {
                        var congData = Storage.getCongregationData(hYear, m);
                        cDays.forEach(function(d) {
                            if (congData[prayer.id] && congData[prayer.id][parseInt(d)]) congCount++;
                        });
                    }
                }
            }
            var pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            var congPct = completed > 0 ? Math.round((congCount / completed) * 100) : 0;
            results.push({
                id: prayer.id,
                name: I18n.getPrayerName(prayer.id),
                icon: prayer.icon || prayer.materialIcon,
                color: prayer.color,
                completed: completed,
                total: total,
                completion: pct,
                congregation: congPct,
                congCount: congCount
            });
        });
        return results;
    }

    function gatherMonthlyData(type, hYear) {
        var completionData = [];
        var congData = [];
        for (var m = 1; m <= 12; m++) {
            completionData.push(Storage.getMonthStats(type, m, hYear).percentage);
            if (type === 'fard') {
                var prayers = Storage.getPrayersArray('fard');
                var dataObj = Storage.getDataObject('fard');
                var cd = Storage.getCongregationData(hYear, m);
                var monthComp = 0, monthCong = 0;
                prayers.forEach(function(p) {
                    if (dataObj[m] && dataObj[m][p.id]) {
                        var cDays = Object.keys(dataObj[m][p.id]).filter(function(d) { return dataObj[m][p.id][d]; });
                        monthComp += cDays.length;
                        cDays.forEach(function(d) {
                            if (cd[p.id] && cd[p.id][parseInt(d)]) monthCong++;
                        });
                    }
                });
                congData.push(monthComp > 0 ? Math.round((monthCong / monthComp) * 100) : 0);
            }
        }
        return { completion: completionData, congregation: congData };
    }

    function gatherWeeklyData(hYear) {
        var prayers = Storage.getPrayersArray('fard');
        var currentLang = I18n.getCurrentLang();
        var dayNames = Config.T['day_names'][currentLang];
        var weekTotals = [0,0,0,0,0,0,0];
        var weekCong = [0,0,0,0,0,0,0];

        for (var month = 1; month <= 12; month++) {
            var cd = Storage.getCongregationData(hYear, month);
            var daysInMonth = Hijri.getHijriDaysInMonth(hYear, month);
            for (var day = 1; day <= daysInMonth; day++) {
                var date = Hijri.hijriToGregorian(hYear, month, day);
                var dow = date.getDay();
                weekTotals[dow]++;
                var dayCong = 0;
                prayers.forEach(function(p) {
                    if (cd[p.id] && cd[p.id][day]) dayCong++;
                });
                weekCong[dow] += dayCong;
            }
        }

        return dayNames.map(function(name, i) {
            var maxPossible = weekTotals[i] * prayers.length;
            return { name: name, value: maxPossible > 0 ? Math.round((weekCong[i] / maxPossible) * 100) : 0 };
        });
    }

    function gatherHeatmapData(hYear) {
        var prayers = Storage.getPrayersArray('fard');
        var dataObj = Storage.getDataObject('fard');
        var grid = [];
        var todayH = Hijri.getTodayHijri();

        // Build last ~10 weeks of data (70 days back from current date)
        var today = new Date();
        var startDate = new Date(today.getTime() - 69 * 86400000);

        for (var i = 0; i < 70; i++) {
            var d = new Date(startDate.getTime() + i * 86400000);
            var h = Hijri.gregorianToHijri(d);
            var congData = Storage.getCongregationData(h.year, h.month);
            var count = 0;
            prayers.forEach(function(p) {
                if (congData[p.id] && congData[p.id][h.day]) count++;
            });
            grid.push({ count: count });
        }
        return grid;
    }

    // ==================== MAIN DASHBOARD UPDATE ====================

    function updateDashboard(type) {
        var Charts = window.App.SVGCharts;
        var hYear = parseInt(document.getElementById(type + 'DashboardYear').value);
        Storage.setCurrentYear(hYear);
        Storage.loadAllData(type);

        var yearStats = Storage.getYearStats(type, hYear);
        var prayerStats = gatherPrayerStats(type, hYear);
        var monthlyData = gatherMonthlyData(type, hYear);
        var monthLabels = getHijriMonthNamesShort();
        var currentLang = I18n.getCurrentLang();
        var todayH = Hijri.getTodayHijri();

        // --- Update stat cards ---
        document.getElementById(type + 'YearTotalCompleted').textContent = yearStats.completed;
        document.getElementById(type + 'YearTotalPossible').textContent = yearStats.total;
        document.getElementById(type + 'YearCompletionRate').textContent = yearStats.percentage + '%';

        var bestMonth = { month: 0, percentage: 0 };
        for (var m = 1; m <= 12; m++) {
            var ms = Storage.getMonthStats(type, m, hYear);
            if (ms.percentage > bestMonth.percentage) bestMonth = { month: m, percentage: ms.percentage };
        }
        document.getElementById(type + 'BestMonth').textContent = bestMonth.month > 0 ? Config.monthNames[bestMonth.month - 1] : '-';
        document.getElementById(type + 'BestMonthRate').textContent = bestMonth.percentage + '%';

        var bestPrayer = prayerStats.reduce(function(best, p) { return p.completion > best.completion ? p : best; }, { name: '-', completion: 0 });
        document.getElementById(type + 'BestPrayer').textContent = bestPrayer.name;
        document.getElementById(type + 'BestPrayerRate').textContent = bestPrayer.completion + '%';

        // Congregation stats (fard only)
        if (type === 'fard') {
            var yearCong = 0, yearComp = 0;
            prayerStats.forEach(function(p) { yearCong += p.congCount; yearComp += p.completed; });
            var congRate = yearComp > 0 ? Math.round((yearCong / yearComp) * 100) : 0;
            document.getElementById('fardYearCongRate').textContent = congRate + '%';
            document.getElementById('fardYearCongCount').textContent = yearCong + ' ' + I18n.t('congregation') + ' / ' + yearComp;
        }

        // --- RENDER SVG CHARTS ---

        // 1. Orbital Progress
        var orbitalEl = document.getElementById(type + 'OrbitalProgress');
        if (orbitalEl) {
            var rings = [{ value: yearStats.completed, max: yearStats.total, color: '#2D6A4F', label: currentLang === 'ar' ? 'الإنجاز' : 'Completion' }];
            var legend = [{ color: '#2D6A4F', label: currentLang === 'ar' ? 'الإنجاز' : 'Completion', value: yearStats.percentage + '%' }];
            if (type === 'fard') {
                var yCong = 0, yComp = 0;
                prayerStats.forEach(function(p) { yCong += p.congCount; yComp += p.completed; });
                rings.push({ value: yCong, max: yComp || 1, color: '#D4A03C', label: currentLang === 'ar' ? 'الجماعة' : 'Congregation' });
                legend.push({ color: '#D4A03C', label: currentLang === 'ar' ? 'الجماعة' : 'Congregation', value: (yComp > 0 ? Math.round((yCong / yComp) * 100) : 0) + '%' });
            }
            Charts.orbitalProgress(orbitalEl, {
                rings: rings,
                centerText: yearStats.percentage + '%',
                centerSub: currentLang === 'ar' ? 'الإنجاز السنوي' : 'Yearly',
                legend: legend
            });
        }

        // 2. Streak Flame Bars
        var streakEl = document.getElementById(type + 'StreakFlame');
        if (streakEl && window.App.Jamaah) {
            var streakData = prayerStats.map(function(p) {
                var streak = window.App.Jamaah.calculateStreak(type, p.id);
                return { name: p.name, icon: p.icon, color: p.color, current: streak.current, best: streak.best };
            });
            Charts.streakFlameBars(streakEl, {
                prayers: streakData,
                legendLabels: {
                    current: currentLang === 'ar' ? 'الحالية' : 'Current',
                    best: currentLang === 'ar' ? 'الأفضل' : 'Best',
                    record: currentLang === 'ar' ? 'رقم قياسي' : 'Record'
                }
            });
        }

        // 3. Mountain Landscape
        var mtnEl = document.getElementById(type + 'MountainChart');
        if (mtnEl) {
            var mtnData = {
                labels: monthLabels,
                values: monthlyData.completion,
                currentMonth: todayH.year === hYear ? todayH.month : undefined
            };
            if (type === 'fard') {
                mtnData.values2 = monthlyData.congregation;
                mtnData.legend = [
                    { color: 'var(--green-deep)', label: currentLang === 'ar' ? 'الإنجاز الكلي' : 'Total' },
                    { color: 'var(--gold)', label: currentLang === 'ar' ? 'الجماعة' : 'Congregation', dashed: true }
                ];
            }
            Charts.mountainChart(mtnEl, mtnData);
        }

        // 4. Prayer Radar
        var radarEl = document.getElementById(type + 'RadarChart');
        if (radarEl) {
            Charts.prayerRadar(radarEl, {
                prayers: prayerStats,
                showCongregation: type === 'fard'
            });
        }

        // 5. Prayer Lollipop
        var lolEl = document.getElementById(type + 'LollipopChart');
        if (lolEl) {
            Charts.prayerLollipop(lolEl, {
                prayers: prayerStats,
                showCongregation: type === 'fard'
            });
        }

        // 6. Weekly Rhythm (fard only)
        var weeklyEl = document.getElementById(type + 'WeeklyRhythm');
        if (weeklyEl && type === 'fard') {
            var weeklyData = gatherWeeklyData(hYear);
            Charts.weeklyRhythm(weeklyEl, { days: weeklyData });
        }

        // 7. Congregation Heatmap (fard only)
        var heatEl = document.getElementById(type + 'Heatmap');
        if (heatEl && type === 'fard') {
            var heatGrid = gatherHeatmapData(hYear);
            var heatDayNames = (Config.T['day_names'][currentLang] || []).slice(0, 7);
            Charts.congregationHeatmap(heatEl, {
                grid: heatGrid,
                dayNames: heatDayNames,
                maxPrayers: 5
            });
        }

        // Qada report (fard only)
        if (type === 'fard' && typeof window.renderQadaReport === 'function') {
            window.renderQadaReport();
        }

        // Period history (females)
        var activeProfile = Storage.getActiveProfile();
        if (type === 'fard' && activeProfile && activeProfile.gender === 'female' && activeProfile.age >= 12) {
            var fardPeriodDash = document.getElementById('fardPeriodDashboard');
            if (fardPeriodDash) fardPeriodDash.style.display = '';
            renderPeriodHistoryDashboard();
        }
    }

    // ==================== PERIOD HISTORY (DASHBOARD) ====================

    function renderPeriodHistoryDashboard() {
        var container = document.getElementById('fardPeriodHistoryContainer');
        if (!container) return;

        var currentYear = Storage.getCurrentYear();
        var year = parseInt(document.getElementById('fardDashboardYear').value) || currentYear;
        var stored = localStorage.getItem('salah_periods_' + Storage.getProfilePrefix() + 'h' + year);
        var periods = stored ? JSON.parse(stored) : [];

        if (periods.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0633\u062c\u0644\u0629. \u062d\u062f\u062f\u064a \u0623\u064a\u0627\u0645 \u0627\u0644\u0625\u0639\u0641\u0627\u0621 \u0645\u0646 \u0627\u0644\u0645\u062a\u062a\u0628\u0639 \u0627\u0644\u0634\u0647\u0631\u064a.</p>';
            return;
        }

        container.innerHTML = '';
        periods.forEach(function(p) {
            var entry = document.createElement('div');
            entry.className = 'period-entry';
            entry.innerHTML = '<div class="dates"><span class="material-symbols-rounded" style="font-size:16px;vertical-align:middle;">calendar_month</span> ' + p.start + ' ' + I18n.getHijriMonthName(p.month - 1) + ' \u2192 ' + p.end + ' ' + I18n.getHijriMonthName(p.month - 1) + ' ' + year + '</div>' +
                '<div class="duration">' + p.duration + ' \u064a\u0648\u0645</div>';
            container.appendChild(entry);
        });
    }

    // ==================== PUBLIC API ====================

    return {
        updateDashboard: updateDashboard,
        renderPeriodHistoryDashboard: renderPeriodHistoryDashboard,
        getHijriMonthNamesShort: getHijriMonthNamesShort
    };
})();

// Backward compat
window.updateDashboard = window.App.Dashboard.updateDashboard;
