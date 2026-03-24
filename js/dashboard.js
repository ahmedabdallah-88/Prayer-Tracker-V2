/**
 * dashboard.js — Dashboard, Charts & Advanced Visualizations
 * Extracted from index.html
 */
window.App = window.App || {};
window.App.Dashboard = (function() {
    // ==================== MODULE REFERENCES ====================
    var Storage = window.App.Storage;
    var Hijri   = window.App.Hijri;
    var I18n    = window.App.I18n;
    var Config  = window.App.Config;

    // ==================== LOCAL HELPERS ====================

    function getHijriMonthNames() {
        var lang = I18n.getCurrentLang();
        return lang === 'ar' ? Config.hijriMonthNamesAr : Config.hijriMonthNamesEn;
    }

    function getHijriMonthNamesShort() {
        var lang = I18n.getCurrentLang();
        return lang === 'ar'
            ? ['\u0645\u062d\u0631\u0645', '\u0635\u0641\u0631', '\u0631\u0628\u064a\u0639\u0661', '\u0631\u0628\u064a\u0639\u0662', '\u062c\u0645\u0627\u062f\u0649\u0661', '\u062c\u0645\u0627\u062f\u0649\u0662', '\u0631\u062c\u0628', '\u0634\u0639\u0628\u0627\u0646', '\u0631\u0645\u0636\u0627\u0646', '\u0634\u0648\u0627\u0644', '\u0630\u0648 \u0627\u0644\u0642\u0639\u062f\u0629', '\u0630\u0648 \u0627\u0644\u062d\u062c\u0629']
            : ['Muh', 'Saf', 'Rb1', 'Rb2', 'Jm1', 'Jm2', 'Raj', 'Sha', 'Ram', 'Shw', 'DhQ', 'DhH'];
    }

    // ==================== DASHBOARD ====================

    function updateDashboard(type) {
        var currentHijriYear = parseInt(document.getElementById(type + 'DashboardYear').value);
        var currentYear = currentHijriYear;
        Storage.setCurrentYear(currentYear);
        Storage.loadAllData(type);

        var yearStats = Storage.getYearStats(type, currentYear);
        document.getElementById(type + 'YearTotalCompleted').textContent = yearStats.completed;
        document.getElementById(type + 'YearTotalPossible').textContent = yearStats.total;
        document.getElementById(type + 'YearCompletionRate').textContent = yearStats.percentage + '%';

        // Find best month
        var bestMonth = { month: 0, percentage: 0 };
        var monthNames = Config.monthNames;
        for (var month = 1; month <= 12; month++) {
            var stats = Storage.getMonthStats(type, month, currentYear);
            if (stats.percentage > bestMonth.percentage) {
                bestMonth = { month: month, percentage: stats.percentage };
            }
        }
        document.getElementById(type + 'BestMonth').textContent = bestMonth.month > 0 ? monthNames[bestMonth.month - 1] : '-';
        document.getElementById(type + 'BestMonthRate').textContent = bestMonth.percentage + '%';

        // Find best prayer
        var prayers = Storage.getPrayersArray(type);
        var dataObj = Storage.getDataObject(type);
        var prayerStats = {};
        prayers.forEach(function(prayer) {
            var completed = 0;
            var total = 0;
            for (var m = 1; m <= 12; m++) {
                var days = Hijri.getHijriDaysInMonth(currentHijriYear, m);
                total += days;
                if (dataObj[m] && dataObj[m][prayer.id]) {
                    completed += Object.values(dataObj[m][prayer.id]).filter(function(v) { return v; }).length;
                }
            }
            prayerStats[prayer.id] = {
                name: I18n.getPrayerName(prayer.id),
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        });

        var bestPrayer = Object.entries(prayerStats).reduce(function(best, entry) {
            var stats = entry[1];
            return stats.percentage > best.percentage ? stats : best;
        }, { name: '-', percentage: 0 });

        document.getElementById(type + 'BestPrayer').textContent = bestPrayer.name;
        document.getElementById(type + 'BestPrayerRate').textContent = bestPrayer.percentage + '%';

        updateCharts(type);
        if (typeof window.renderStreaks === 'function') window.renderStreaks(type);

        // Congregation yearly stats (fard only)
        if (type === 'fard') {
            var yearCong = 0, yearCompleted = 0;
            var congMonthlyData = [];
            var charts = Storage.getCharts();

            for (var cm = 1; cm <= 12; cm++) {
                var congData = Storage.getCongregationData(currentHijriYear, cm);
                var fardPrayers = Storage.getPrayersArray('fard');
                var fardDataObj = Storage.getDataObject('fard');
                var monthCong = 0, monthCompleted = 0;

                fardPrayers.forEach(function(prayer) {
                    if (fardDataObj[cm] && fardDataObj[cm][prayer.id]) {
                        var completedDays = Object.keys(fardDataObj[cm][prayer.id]).filter(function(d) {
                            return fardDataObj[cm][prayer.id][d];
                        });
                        monthCompleted += completedDays.length;
                        completedDays.forEach(function(d) {
                            if (window.isCongregation(congData, prayer.id, parseInt(d))) monthCong++;
                        });
                    }
                });

                yearCong += monthCong;
                yearCompleted += monthCompleted;
                congMonthlyData.push(monthCompleted > 0 ? Math.round((monthCong / monthCompleted) * 100) : 0);
            }

            var congRate = yearCompleted > 0 ? Math.round((yearCong / yearCompleted) * 100) : 0;
            document.getElementById('fardYearCongRate').textContent = congRate + '%';
            document.getElementById('fardYearCongCount').textContent = yearCong + ' ' + I18n.t('congregation') + ' / ' + yearCompleted;

            // Congregation chart
            if (charts.fardCong) charts.fardCong.destroy();
            var congCtx = document.getElementById('fardCongregationChart');
            renderAdvancedCharts();
            if (congCtx) {
                charts.fardCong = new Chart(congCtx, {
                    type: 'bar',
                    data: {
                        labels: getHijriMonthNamesShort(),
                        datasets: [{
                            label: I18n.t('cong_rate'),
                            data: congMonthlyData,
                            backgroundColor: 'rgba(37, 99, 235, 0.6)',
                            borderColor: '#2563eb',
                            borderWidth: 2,
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, max: 100, ticks: { callback: function(v) { return v + '%'; } } },
                            x: { ticks: { maxRotation: 45, minRotation: 0, font: { size: 10 } } }
                        }
                    }
                });
            }
        }

        // Render period history in fard dashboard for females
        var activeProfile = Storage.getActiveProfile();
        if (type === 'fard' && activeProfile && activeProfile.gender === 'female' && activeProfile.age >= 12) {
            var fardPeriodDash = document.getElementById('fardPeriodDashboard');
            if (fardPeriodDash) fardPeriodDash.style.display = '';
            renderPeriodHistoryDashboard();
        }

        // Render Qada report (fard only)
        if (type === 'fard') {
            if (typeof window.renderQadaReport === 'function') window.renderQadaReport();
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
            entry.innerHTML = '<div class="dates">\uD83D\uDCC5 ' + p.start + ' ' + I18n.getHijriMonthName(p.month - 1) + ' \u2192 ' + p.end + ' ' + I18n.getHijriMonthName(p.month - 1) + ' ' + year + '</div>' +
                '<div class="duration">' + p.duration + ' \u064a\u0648\u0645</div>';
            container.appendChild(entry);
        });
    }

    // ==================== CHARTS ====================

    function updateCharts(type) {
        var prayers = Storage.getPrayersArray(type);
        var dataObj = Storage.getDataObject(type);
        var hYear = Hijri.getCurrentHijriYear();
        var charts = Storage.getCharts();

        // Monthly Progress Chart
        var monthlyData = [];
        for (var month = 1; month <= 12; month++) {
            monthlyData.push(Storage.getMonthStats(type, month, hYear).percentage);
        }

        if (charts[type].monthlyProgress) charts[type].monthlyProgress.destroy();
        charts[type].monthlyProgress = new Chart(document.getElementById(type + 'MonthlyProgressChart'), {
            type: 'line',
            data: {
                labels: getHijriMonthNamesShort(),
                datasets: [{
                    label: I18n.t('chart_percentage'),
                    data: monthlyData,
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100, ticks: { callback: function(value) { return value + '%'; } } } }
            }
        });

        // Prayer Type Chart
        var prayerTypeData;
        var prayerTypeLabel;

        if (type === 'fard') {
            prayerTypeData = prayers.map(function(prayer) {
                var congCount = 0;
                for (var m = 1; m <= 12; m++) {
                    var congData = Storage.getCongregationData(hYear, m);
                    if (congData[prayer.id]) {
                        congCount += Object.values(congData[prayer.id]).filter(function(v) { return v; }).length;
                    }
                }
                return congCount;
            });
            prayerTypeLabel = I18n.t('congregation');
        } else {
            prayerTypeData = prayers.map(function(prayer) {
                var completed = 0;
                for (var m = 1; m <= 12; m++) {
                    if (dataObj[m] && dataObj[m][prayer.id]) {
                        completed += Object.values(dataObj[m][prayer.id]).filter(function(v) { return v; }).length;
                    }
                }
                return completed;
            });
            prayerTypeLabel = I18n.t('chart_sunnah_count');
        }

        if (charts[type].prayerType) charts[type].prayerType.destroy();
        charts[type].prayerType = new Chart(document.getElementById(type + 'PrayerTypeChart'), {
            type: 'bar',
            data: {
                labels: prayers.map(function(p) { return I18n.getPrayerName(p.id); }),
                datasets: [{
                    label: prayerTypeLabel,
                    data: prayerTypeData,
                    backgroundColor: prayers.map(function(p) { return p.color; }),
                    borderColor: prayers.map(function(p) { return p.color; }),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });

        // Completion Pie Chart
        var yearStats = Storage.getYearStats(type, hYear);
        if (charts[type].completionPie) charts[type].completionPie.destroy();
        charts[type].completionPie = new Chart(document.getElementById(type + 'CompletionPieChart'), {
            type: 'doughnut',
            data: {
                labels: [I18n.t('chart_completed_label'), I18n.t('chart_remaining_label')],
                datasets: [{
                    data: [yearStats.completed, yearStats.total - yearStats.completed],
                    backgroundColor: ['#2d7a4f', '#e0e0e0'],
                    borderWidth: 3,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });

        // Prayer Comparison Chart
        var comparisonData = prayers.map(function(prayer) {
            var completed = 0;
            var total = 0;
            for (var m = 1; m <= 12; m++) {
                var days = Hijri.getHijriDaysInMonth(hYear, m);
                total += days;
                if (dataObj[m] && dataObj[m][prayer.id]) {
                    completed += Object.values(dataObj[m][prayer.id]).filter(function(v) { return v; }).length;
                }
            }
            return total > 0 ? Math.round((completed / total) * 100) : 0;
        });

        if (charts[type].prayerComparison) charts[type].prayerComparison.destroy();
        charts[type].prayerComparison = new Chart(document.getElementById(type + 'PrayerComparisonChart'), {
            type: 'radar',
            data: {
                labels: prayers.map(function(p) { return I18n.getPrayerName(p.id); }),
                datasets: [{
                    label: '\u0646\u0633\u0628\u0629 \u0627\u0644\u0625\u0646\u062c\u0627\u0632 %',
                    data: comparisonData,
                    backgroundColor: 'rgba(15, 76, 58, 0.2)',
                    borderColor: '#0f4c3a',
                    borderWidth: 2,
                    pointBackgroundColor: prayers.map(function(p) { return p.color; }),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) { return value + '%'; }
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // ==================== ADVANCED VISUALIZATIONS ====================

    function renderAdvancedCharts() {
        renderWeeklyPattern();
        renderYearlyHeatmap();
    }

    function renderWeeklyPattern() {
        var ctx = document.getElementById('fardWeeklyPatternChart');
        if (!ctx) return;

        var prayers = Storage.getPrayersArray('fard');
        var dataObj = Storage.getDataObject('fard');
        var currentLang = I18n.getCurrentLang();
        var dayNames = Config.T['day_names'][currentLang];
        var currentHijriYear = Hijri.getCurrentHijriYear();
        var charts = Storage.getCharts();

        // Count CONGREGATION by day of week for each prayer
        var weekData = {};
        prayers.forEach(function(p) { weekData[p.id] = [0,0,0,0,0,0,0]; });
        var weekTotals = [0,0,0,0,0,0,0];

        for (var month = 1; month <= 12; month++) {
            var congData = Storage.getCongregationData(currentHijriYear, month);
            var daysInMonth = Hijri.getHijriDaysInMonth(currentHijriYear, month);
            for (var day = 1; day <= daysInMonth; day++) {
                // Convert Hijri date to Gregorian to get day of week
                var date = Hijri.hijriToGregorian(currentHijriYear, month, day);
                var dow = date.getDay();
                weekTotals[dow]++;
                prayers.forEach(function(p) {
                    if (congData[p.id] && congData[p.id][day]) {
                        weekData[p.id][dow]++;
                    }
                });
            }
        }

        var datasets = prayers.map(function(p) {
            return {
                label: I18n.getPrayerName(p.id),
                data: weekData[p.id].map(function(count, i) {
                    return weekTotals[i] > 0 ? Math.round((count / weekTotals[i]) * 100) : 0;
                }),
                backgroundColor: p.color + '88',
                borderColor: p.color,
                borderWidth: 2
            };
        });

        if (charts.fardWeekly) charts.fardWeekly.destroy();
        charts.fardWeekly = new Chart(ctx, {
            type: 'bar',
            data: { labels: dayNames, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 10 } } }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { callback: function(v) { return v + '%'; } } },
                    x: { stacked: false }
                }
            }
        });
    }

    function renderYearlyHeatmap() {
        var ctx = document.getElementById('fardHeatmapChart');
        if (!ctx) return;

        var prayers = Storage.getPrayersArray('fard');
        var dataObj = Storage.getDataObject('fard');
        var mNames = getHijriMonthNames();
        var currentHijriYear = Hijri.getCurrentHijriYear();
        var charts = Storage.getCharts();

        // Build monthly CONGREGATION rates
        var heatData = [];
        var labels = [];

        for (var month = 1; month <= 12; month++) {
            var congData = Storage.getCongregationData(currentHijriYear, month);
            var totalCompleted = 0, totalCong = 0;

            prayers.forEach(function(p) {
                if (dataObj[month] && dataObj[month][p.id]) {
                    var completedDays = Object.keys(dataObj[month][p.id]).filter(function(d) {
                        return dataObj[month][p.id][d];
                    });
                    totalCompleted += completedDays.length;
                    completedDays.forEach(function(d) {
                        if (congData[p.id] && congData[p.id][parseInt(d)]) totalCong++;
                    });
                }
            });

            heatData.push(totalCompleted > 0 ? Math.round((totalCong / totalCompleted) * 100) : 0);
            labels.push(mNames[month - 1]);
        }

        var colors = heatData.map(function(v) {
            if (v >= 80) return '#1d4ed8';
            if (v >= 60) return '#3b82f6';
            if (v >= 40) return '#60a5fa';
            if (v >= 20) return '#93c5fd';
            if (v > 0) return '#bfdbfe';
            return '#e5e7eb';
        });

        if (charts.fardHeatmap) charts.fardHeatmap.destroy();
        charts.fardHeatmap = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: I18n.t('cong_rate'),
                    data: heatData,
                    backgroundColor: colors,
                    borderColor: colors.map(function(c) { return c === '#e5e7eb' ? '#d1d5db' : c; }),
                    borderWidth: 2,
                    borderRadius: 4,
                    barPercentage: 0.9
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipCtx) { return tooltipCtx.parsed.x + '%'; }
                        }
                    }
                },
                scales: {
                    x: { beginAtZero: true, max: 100, ticks: { callback: function(v) { return v + '%'; } } },
                    y: { grid: { display: false } }
                }
            }
        });
    }

    // ==================== PUBLIC API ====================

    return {
        updateDashboard: updateDashboard,
        updateCharts: updateCharts,
        renderAdvancedCharts: renderAdvancedCharts,
        renderWeeklyPattern: renderWeeklyPattern,
        renderYearlyHeatmap: renderYearlyHeatmap,
        renderPeriodHistoryDashboard: renderPeriodHistoryDashboard,
        getHijriMonthNamesShort: getHijriMonthNamesShort
    };
})();

// Backward compat
window.updateDashboard = window.App.Dashboard.updateDashboard;
window.updateCharts = window.App.Dashboard.updateCharts;
window.renderAdvancedCharts = window.App.Dashboard.renderAdvancedCharts;
