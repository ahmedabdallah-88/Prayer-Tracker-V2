// ==================== DASHBOARD MODULE ====================
import { state, fardPrayers, sunnahPrayers } from './state.js';
import { getHijriDaysInMonth, getHijriMonthName, getHijriMonthNames, getGregorianSpanForHijriMonth, formatHijriMonthHeader } from './hijri-calendar.js';
import { getPrayersArray, getDataObject, loadAllData, getMonthStats, getYearStats, getPrayerName } from './prayer-data.js';
import { getCongregationData, isCongregation } from './congregation.js';
import { renderStreaks } from './streaks.js';
import { renderQadaReport } from './qada.js';
import { renderAdvancedCharts } from './advanced-charts.js';
import { t } from './i18n.js';
import { renderMonthDetail } from './tracker.js';

// ==================== DASHBOARD ====================

export function updateDashboard(type) {
    state.currentHijriYear = parseInt(document.getElementById(type + 'DashboardYear').value);
    state.currentYear = state.currentHijriYear;
    loadAllData(type);

    var yearStats = getYearStats(type, state.currentYear);
    document.getElementById(type + 'YearTotalCompleted').textContent = yearStats.completed;
    document.getElementById(type + 'YearTotalPossible').textContent = yearStats.total;
    document.getElementById(type + 'YearCompletionRate').textContent = yearStats.percentage + '%';

    // Find best month
    var bestMonth = { month: 0, percentage: 0 };
    for (var month = 1; month <= 12; month++) {
        var stats = getMonthStats(type, month, state.currentYear);
        if (stats.percentage > bestMonth.percentage) {
            bestMonth = { month: month, percentage: stats.percentage };
        }
    }
    var bestMonthEl = document.getElementById(type + 'BestMonth');
    var bestMonthRateEl = document.getElementById(type + 'BestMonthRate');
    if (bestMonthEl) bestMonthEl.textContent = bestMonth.month > 0 ? getHijriMonthName(bestMonth.month - 1) : '-';
    if (bestMonthRateEl) bestMonthRateEl.textContent = bestMonth.percentage + '%';

    // Find best prayer
    var prayers = getPrayersArray(type);
    var dataObj = getDataObject(type);
    var prayerStats = {};
    prayers.forEach(function(prayer) {
        var completed = 0;
        var total = 0;
        for (var m = 1; m <= 12; m++) {
            var days = getHijriDaysInMonth(state.currentHijriYear, m);
            total += days;
            if (dataObj[m] && dataObj[m][prayer.id]) {
                completed += Object.values(dataObj[m][prayer.id]).filter(function(v) { return v; }).length;
            }
        }
        prayerStats[prayer.id] = {
            name: getPrayerName(prayer.id),
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    });

    var bestPrayer = Object.entries(prayerStats).reduce(function(best, entry) {
        return entry[1].percentage > best.percentage ? entry[1] : best;
    }, { name: '-', percentage: 0 });

    var bestPrayerEl = document.getElementById(type + 'BestPrayer');
    var bestPrayerRateEl = document.getElementById(type + 'BestPrayerRate');
    if (bestPrayerEl) bestPrayerEl.textContent = bestPrayer.name;
    if (bestPrayerRateEl) bestPrayerRateEl.textContent = bestPrayer.percentage + '%';

    updateCharts(type);
    renderStreaks(type);

    // Congregation yearly stats (fard only)
    if (type === 'fard') {
        var yearCong = 0, yearCompleted = 0;
        var congMonthlyData = [];

        for (var mo = 1; mo <= 12; mo++) {
            var congData = getCongregationData(state.currentHijriYear, mo);
            var fPrayers = getPrayersArray('fard');
            var fDataObj = getDataObject('fard');
            var monthCong = 0, monthCompleted = 0;

            fPrayers.forEach(function(prayer) {
                if (fDataObj[mo] && fDataObj[mo][prayer.id]) {
                    var completedDays = Object.keys(fDataObj[mo][prayer.id]).filter(function(d) { return fDataObj[mo][prayer.id][d]; });
                    monthCompleted += completedDays.length;
                    completedDays.forEach(function(d) {
                        if (isCongregation(congData, prayer.id, parseInt(d))) monthCong++;
                    });
                }
            });

            yearCong += monthCong;
            yearCompleted += monthCompleted;
            congMonthlyData.push(monthCompleted > 0 ? Math.round((monthCong / monthCompleted) * 100) : 0);
        }

        var congRate = yearCompleted > 0 ? Math.round((yearCong / yearCompleted) * 100) : 0;
        var congRateEl = document.getElementById('fardYearCongRate');
        var congCountEl = document.getElementById('fardYearCongCount');
        if (congRateEl) congRateEl.textContent = congRate + '%';
        if (congCountEl) congCountEl.textContent = yearCong + ' ' + t('congregation') + ' / ' + yearCompleted;

        // Congregation chart
        if (state.charts.fardCong) state.charts.fardCong.destroy();
        var congCtx = document.getElementById('fardCongregationChart');
        renderAdvancedCharts();
        if (congCtx) {
            state.charts.fardCong = new Chart(congCtx, {
                type: 'bar',
                data: {
                    labels: getHijriMonthNames(),
                    datasets: [{
                        label: t('cong_rate'),
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
                    scales: { y: { beginAtZero: true, max: 100, ticks: { callback: function(v) { return v + '%'; } } } }
                }
            });
        }
    }

    // Render period history in fard dashboard for females
    if (type === 'fard' && state.activeProfile && state.activeProfile.gender === 'female' && state.activeProfile.age >= 12) {
        var fardPeriodDash = document.getElementById('fardPeriodDashboard');
        if (fardPeriodDash) fardPeriodDash.style.display = '';
        renderPeriodHistoryDashboard();
    }

    // Render Qada report (fard only)
    if (type === 'fard') {
        renderQadaReport();
    }
}

function renderPeriodHistoryDashboard() {
    var container = document.getElementById('fardPeriodHistoryContainer');
    if (!container) return;

    var year = parseInt(document.getElementById('fardDashboardYear').value) || state.currentYear;
    var stored = localStorage.getItem('salah_periods_' + (state.activeProfile ? state.activeProfile.id + '_' : '') + 'h' + year);
    var periods = stored ? JSON.parse(stored) : [];

    if (periods.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0633\u062c\u0644\u0629. \u062d\u062f\u062f\u064a \u0623\u064a\u0627\u0645 \u0627\u0644\u0625\u0639\u0641\u0627\u0621 \u0645\u0646 \u0627\u0644\u0645\u062a\u062a\u0628\u0639 \u0627\u0644\u0634\u0647\u0631\u064a.</p>';
        return;
    }

    container.innerHTML = '';
    periods.forEach(function(p) {
        var entry = document.createElement('div');
        entry.className = 'period-entry';
        entry.innerHTML = '<div class="dates">\ud83d\udcc5\ufe0f ' + p.start + ' ' + getHijriMonthName(p.month - 1) + ' \u2192 ' + p.end + ' ' + getHijriMonthName(p.month - 1) + ' ' + year + '</div>' +
            '<div class="duration">' + p.duration + ' \u064a\u0648\u0645</div>';
        container.appendChild(entry);
    });
}

// ==================== CHARTS ====================

export function updateCharts(type) {
    var prayers = getPrayersArray(type);
    var dataObj = getDataObject(type);
    var hYear = state.currentHijriYear;

    // Monthly Progress Chart
    var monthlyData = [];
    for (var month = 1; month <= 12; month++) {
        monthlyData.push(getMonthStats(type, month, hYear).percentage);
    }

    if (state.charts[type].monthlyProgress) state.charts[type].monthlyProgress.destroy();
    var monthlyCtx = document.getElementById(type + 'MonthlyProgressChart');
    if (monthlyCtx) {
        state.charts[type].monthlyProgress = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: getHijriMonthNames(),
                datasets: [{
                    label: t('chart_percentage'),
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
    }

    // Prayer Type Chart
    var prayerTypeData;
    var prayerTypeLabel;

    if (type === 'fard') {
        prayerTypeData = prayers.map(function(prayer) {
            var congCount = 0;
            for (var m = 1; m <= 12; m++) {
                var congData = getCongregationData(hYear, m);
                if (congData[prayer.id]) {
                    congCount += Object.values(congData[prayer.id]).filter(function(v) { return v; }).length;
                }
            }
            return congCount;
        });
        prayerTypeLabel = t('congregation');
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
        prayerTypeLabel = t('chart_sunnah_count');
    }

    if (state.charts[type].prayerType) state.charts[type].prayerType.destroy();
    var ptCtx = document.getElementById(type + 'PrayerTypeChart');
    if (ptCtx) {
        state.charts[type].prayerType = new Chart(ptCtx, {
            type: 'bar',
            data: {
                labels: prayers.map(function(p) { return getPrayerName(p.id); }),
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
    }

    // Completion Pie Chart
    var yearStats = getYearStats(type, hYear);
    if (state.charts[type].completionPie) state.charts[type].completionPie.destroy();
    var pieCtx = document.getElementById(type + 'CompletionPieChart');
    if (pieCtx) {
        state.charts[type].completionPie = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: [t('chart_completed_label'), t('chart_remaining_label')],
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
    }

    // Prayer Comparison Chart
    var comparisonData = prayers.map(function(prayer) {
        var completed = 0;
        var total = 0;
        for (var m = 1; m <= 12; m++) {
            var days = getHijriDaysInMonth(hYear, m);
            total += days;
            if (dataObj[m] && dataObj[m][prayer.id]) {
                completed += Object.values(dataObj[m][prayer.id]).filter(function(v) { return v; }).length;
            }
        }
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    });

    if (state.charts[type].prayerComparison) state.charts[type].prayerComparison.destroy();
    var radarCtx = document.getElementById(type + 'PrayerComparisonChart');
    if (radarCtx) {
        state.charts[type].prayerComparison = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: prayers.map(function(p) { return getPrayerName(p.id); }),
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
                        ticks: { callback: function(value) { return value + '%'; } }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}

// ==================== YEARLY VIEW ====================

export function updateYearlyView(type) {
    state.currentHijriYear = parseInt(document.getElementById(type + 'YearlyYear').value);
    state.currentYear = state.currentHijriYear;
    loadAllData(type);

    var grid = document.getElementById(type + 'MonthsGrid');
    grid.innerHTML = '';

    for (var month = 1; month <= 12; month++) {
        var stats = getMonthStats(type, month, state.currentHijriYear);
        var card = document.createElement('div');
        card.className = 'month-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        (function(m) {
            card.onclick = function() { openMonth(type, m); };
        })(month);

        // Calculate congregation stats for fard
        var congHtml = '';
        if (type === 'fard') {
            var congData = getCongregationData(state.currentHijriYear, month);
            var fPrayers = getPrayersArray('fard');
            var fDataObj = getDataObject('fard');
            var monthCong = 0, monthCompleted = 0;

            fPrayers.forEach(function(prayer) {
                if (fDataObj[month] && fDataObj[month][prayer.id]) {
                    var completedDays = Object.keys(fDataObj[month][prayer.id]).filter(function(d) { return fDataObj[month][prayer.id][d]; });
                    monthCompleted += completedDays.length;
                    completedDays.forEach(function(d) {
                        if (isCongregation(congData, prayer.id, parseInt(d))) monthCong++;
                    });
                }
            });

            var congRate = monthCompleted > 0 ? Math.round((monthCong / monthCompleted) * 100) : 0;
            congHtml = '<div class="month-stat" style="grid-column: 1 / -1;">' +
                '<div class="label">\ud83d\udd4c ' + t('congregation') + '</div>' +
                '<div class="value">' + congRate + '%</div>' +
                '</div>';
        }

        var hijriLabel = getHijriMonthName(month - 1);
        var gregSpan = getGregorianSpanForHijriMonth(state.currentHijriYear, month);

        card.innerHTML = '<h3>' + hijriLabel + ' ' + state.currentHijriYear + '</h3>' +
            '<div class="month-greg-ref" style="font-size:0.75em;color:var(--text-muted);margin-top:-6px;margin-bottom:8px;">' + gregSpan + '</div>' +
            '<div class="month-progress"><div class="progress-bar"><div class="progress-fill" style="width: ' + stats.percentage + '%">' + stats.percentage + '%</div></div></div>' +
            '<div class="month-stats">' +
            '<div class="month-stat"><div class="label">' + (type === 'fard' ? t('completed_word') : t('performed')) + '</div><div class="value">' + stats.completed + '</div></div>' +
            '<div class="month-stat"><div class="label">' + t('remaining_word') + '</div><div class="value">' + (stats.total - stats.completed) + '</div></div>' +
            congHtml + '</div>';

        grid.appendChild(card);
    }
}

export function openMonth(type, month) {
    state.currentMonth = month;
    state.currentHijriMonth = month;
    var titleEl = document.getElementById(type + 'CurrentMonthTitle');
    if (titleEl) titleEl.textContent = formatHijriMonthHeader(state.currentHijriYear, month);

    document.getElementById(type + 'YearlyView').classList.remove('active');
    document.getElementById(type + 'MonthlyView').classList.add('active');

    renderMonthDetail(type);
}

export function backToYearly(type) {
    document.getElementById(type + 'MonthlyView').classList.remove('active');
    document.getElementById(type + 'YearlyView').classList.add('active');
    updateYearlyView(type);
}

// Expose on window
window.updateDashboard = updateDashboard;
window.updateCharts = updateCharts;
window.updateYearlyView = updateYearlyView;
window.backToYearly = backToYearly;
