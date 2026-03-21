// ==================== ADVANCED CHARTS MODULE ====================
import { state, fardPrayers } from './state.js';
import {
    getHijriMonthNames, getHijriDaysInMonth, hijriToGregorian,
    gregorianToHijri
} from './hijri-calendar.js';

// Render both advanced charts
export function renderAdvancedCharts() {
    renderWeeklyPattern();
    renderYearlyHeatmap();
}

// Weekly congregation pattern chart
export function renderWeeklyPattern() {
    const ctx = document.getElementById('fardWeeklyPatternChart');
    if (!ctx) return;

    const prayers = fardPrayers;
    var t = window.t || function(k) { return k; };
    var getPrayerName = window.getPrayerName || function(id) { return id; };
    var getCongregationData = window.getCongregationData;
    if (!getCongregationData) return;

    var T = window.T || {};
    var dayNames = (T['day_names'] && T['day_names'][state.currentLang])
        ? T['day_names'][state.currentLang]
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Count CONGREGATION by day of week for each prayer
    const weekData = {};
    prayers.forEach(p => { weekData[p.id] = [0,0,0,0,0,0,0]; });
    const weekTotals = [0,0,0,0,0,0,0];

    for (let month = 1; month <= 12; month++) {
        const congData = getCongregationData(state.currentHijriYear, month);
        const daysInMonth = getHijriDaysInMonth(state.currentHijriYear, month);
        for (let day = 1; day <= daysInMonth; day++) {
            // Convert Hijri date to Gregorian to get day of week
            const date = hijriToGregorian(state.currentHijriYear, month, day);
            const dow = date.getDay();
            weekTotals[dow]++;
            prayers.forEach(p => {
                if (congData[p.id] && congData[p.id][day]) {
                    weekData[p.id][dow]++;
                }
            });
        }
    }

    const datasets = prayers.map(p => ({
        label: getPrayerName(p.id),
        data: weekData[p.id].map((count, i) => weekTotals[i] > 0 ? Math.round((count / weekTotals[i]) * 100) : 0),
        backgroundColor: p.color + '88',
        borderColor: p.color,
        borderWidth: 2
    }));

    if (state.charts.fardWeekly) state.charts.fardWeekly.destroy();
    state.charts.fardWeekly = new Chart(ctx, {
        type: 'bar',
        data: { labels: dayNames, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 10 } } }
            },
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } },
                x: { stacked: false }
            }
        }
    });
}

// Yearly congregation heatmap chart
export function renderYearlyHeatmap() {
    const ctx = document.getElementById('fardHeatmapChart');
    if (!ctx) return;

    const prayers = fardPrayers;
    var t = window.t || function(k) { return k; };
    var getCongregationData = window.getCongregationData;
    var getDataObject = window.getDataObject;
    if (!getCongregationData || !getDataObject) return;

    const dataObj = getDataObject('fard');
    const mNames = getHijriMonthNames();

    // Build monthly CONGREGATION rates
    const heatData = [];
    const labels = [];

    for (let month = 1; month <= 12; month++) {
        const congData = getCongregationData(state.currentHijriYear, month);
        let totalCompleted = 0, totalCong = 0;

        prayers.forEach(p => {
            if (dataObj[month] && dataObj[month][p.id]) {
                const completedDays = Object.keys(dataObj[month][p.id]).filter(d => dataObj[month][p.id][d]);
                totalCompleted += completedDays.length;
                completedDays.forEach(d => {
                    if (congData[p.id] && congData[p.id][parseInt(d)]) totalCong++;
                });
            }
        });

        heatData.push(totalCompleted > 0 ? Math.round((totalCong / totalCompleted) * 100) : 0);
        labels.push(mNames[month - 1]);
    }

    const colors = heatData.map(v => {
        if (v >= 80) return '#1d4ed8';
        if (v >= 60) return '#3b82f6';
        if (v >= 40) return '#60a5fa';
        if (v >= 20) return '#93c5fd';
        if (v > 0) return '#bfdbfe';
        return '#e5e7eb';
    });

    if (state.charts.fardHeatmap) state.charts.fardHeatmap.destroy();
    state.charts.fardHeatmap = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: t('cong_rate'),
                data: heatData,
                backgroundColor: colors,
                borderColor: colors.map(c => c === '#e5e7eb' ? '#d1d5db' : c),
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
                        label: (ctx) => `${ctx.parsed.x}%`
                    }
                }
            },
            scales: {
                x: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } },
                y: { grid: { display: false } }
            }
        }
    });
}

// Expose on window
window.renderAdvancedCharts = renderAdvancedCharts;
window.renderWeeklyPattern = renderWeeklyPattern;
window.renderYearlyHeatmap = renderYearlyHeatmap;
