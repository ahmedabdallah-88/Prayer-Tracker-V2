// ==================== QADA (MISSED PRAYERS) REPORT MODULE ====================
import { state, fardPrayers } from './state.js';
import { getHijriMonthName, getHijriDaysInMonth } from './hijri-calendar.js';

// Qada data storage
export function getQadaKey(year, month) {
    var prefix = state.activeProfile ? state.activeProfile.id + '_' : '';
    return `salah_qada_${prefix}h${year}_${month}`;
}

export function getQadaData(year, month) {
    const stored = localStorage.getItem(getQadaKey(year, month));
    return stored ? JSON.parse(stored) : {};
}

export function saveQadaData(year, month, data) {
    try { localStorage.setItem(getQadaKey(year, month), JSON.stringify(data)); }
    catch(e) {
        if (window.showToast) window.showToast(window.t ? window.t('storage_full') : 'Storage full!', 'error');
    }
}

export function renderQadaReport() {
    var statsGrid = document.getElementById('fardQadaStatsGrid');
    var breakdown = document.getElementById('fardQadaMonthlyBreakdown');
    var chartCanvas = document.getElementById('fardQadaChart');
    if (!statsGrid || !breakdown) return;

    var year = state.currentHijriYear;
    var prayers = fardPrayers;
    var t = window.t || function(k) { return k; };
    var getPrayerName = window.getPrayerName || function(id) { return id; };

    // Collect qada data for all months
    var qadaByPrayer = {};
    var qadaByMonth = [];
    var totalQada = 0;

    prayers.forEach(function(p) { qadaByPrayer[p.id] = 0; });

    for (var month = 1; month <= 12; month++) {
        var qadaData = getQadaData(year, month);
        var monthTotal = 0;

        prayers.forEach(function(p) {
            if (qadaData[p.id]) {
                var count = Object.values(qadaData[p.id]).filter(function(v) { return v; }).length;
                qadaByPrayer[p.id] += count;
                monthTotal += count;
                totalQada += count;
            }
        });

        qadaByMonth.push(monthTotal);
    }

    // Stats cards
    var worstPrayer = { id: '', count: 0 };
    var worstMonth = { month: 0, count: 0 };

    prayers.forEach(function(p) {
        if (qadaByPrayer[p.id] > worstPrayer.count) {
            worstPrayer = { id: p.id, count: qadaByPrayer[p.id] };
        }
    });

    qadaByMonth.forEach(function(count, i) {
        if (count > worstMonth.count) {
            worstMonth = { month: i + 1, count: count };
        }
    });

    statsGrid.innerHTML = '' +
        '<div class="stat-card" style="border-right:3px solid #dc2626;">' +
            '<div class="label">' + (state.currentLang === 'ar' ? 'إجمالي صلوات القضاء' : 'Total Qada Prayers') + '</div>' +
            '<div class="value" style="color:#dc2626;">' + totalQada + '</div>' +
            '<div class="sublabel">' + (state.currentLang === 'ar' ? 'هذه السنة الهجرية' : 'This Hijri year') + '</div>' +
        '</div>' +
        '<div class="stat-card" style="border-right:3px solid #f97316;">' +
            '<div class="label">' + (state.currentLang === 'ar' ? 'أكثر صلاة قضاءً' : 'Most Qada Prayer') + '</div>' +
            '<div class="value" style="color:#f97316;">' + (worstPrayer.id ? getPrayerName(worstPrayer.id) : '-') + '</div>' +
            '<div class="sublabel">' + worstPrayer.count + ' ' + (state.currentLang === 'ar' ? 'مرة' : 'times') + '</div>' +
        '</div>' +
        '<div class="stat-card" style="border-right:3px solid #eab308;">' +
            '<div class="label">' + (state.currentLang === 'ar' ? 'أسوأ شهر' : 'Worst Month') + '</div>' +
            '<div class="value" style="color:#eab308;">' + (worstMonth.month > 0 ? getHijriMonthName(worstMonth.month - 1) : '-') + '</div>' +
            '<div class="sublabel">' + worstMonth.count + ' ' + (state.currentLang === 'ar' ? 'صلاة قضاء' : 'qada prayers') + '</div>' +
        '</div>';

    // Monthly breakdown bars
    var maxMonthQada = Math.max.apply(null, qadaByMonth) || 1;
    var breakdownHtml = '';

    for (var m = 0; m < 12; m++) {
        if (qadaByMonth[m] > 0) {
            var pct = Math.round((qadaByMonth[m] / maxMonthQada) * 100);
            breakdownHtml += '<div class="qada-month-row">' +
                '<span class="qm-month">' + getHijriMonthName(m) + '</span>' +
                '<div class="qm-bar"><div class="qm-bar-fill" style="width:' + pct + '%"></div></div>' +
                '<span class="qm-count">' + qadaByMonth[m] + '</span>' +
            '</div>';
        }
    }

    if (!breakdownHtml) {
        breakdownHtml = '<p style="text-align:center;color:var(--text-muted);padding:16px;font-size:0.9em;">' +
            (state.currentLang === 'ar' ? '🎉 لا توجد صلوات قضاء هذه السنة — أحسنت!' : '🎉 No qada prayers this year — great job!') + '</p>';
    }
    breakdown.innerHTML = breakdownHtml;

    // Chart - Qada by prayer type
    if (state.charts.fardQada) state.charts.fardQada.destroy();
    if (chartCanvas && totalQada > 0) {
        var prayerLabels = prayers.map(function(p) { return getPrayerName(p.id); });
        var prayerQadaCounts = prayers.map(function(p) { return qadaByPrayer[p.id]; });
        var prayerColors = prayers.map(function(p) { return p.color + 'cc'; });

        state.charts.fardQada = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: prayerLabels,
                datasets: [{
                    label: state.currentLang === 'ar' ? 'صلوات القضاء' : 'Qada Prayers',
                    data: prayerQadaCounts,
                    backgroundColor: prayerColors,
                    borderColor: prayers.map(function(p) { return p.color; }),
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
}

// Expose on window
window.getQadaData = getQadaData;
window.saveQadaData = saveQadaData;
window.getQadaKey = getQadaKey;
window.renderQadaReport = renderQadaReport;
