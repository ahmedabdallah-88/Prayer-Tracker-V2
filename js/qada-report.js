/* Prayer Tracker PWA — qada-report.js */
window.App = window.App || {};
window.App.QadaReport = (function() {

    function renderQadaReport() {
        var Storage = window.App.Storage;
        var Hijri = window.App.Hijri;
        var I18n = window.App.I18n;

        var statsGrid = document.getElementById('fardQadaStatsGrid');
        var breakdown = document.getElementById('fardQadaMonthlyBreakdown');
        var chartCanvas = document.getElementById('fardQadaChart');
        if (!statsGrid || !breakdown) return;

        var currentLang = I18n.getCurrentLang();
        var year = Hijri.getCurrentHijriYear();
        var prayers = Storage.getPrayersArray('fard');

        // Collect qada data for all months
        var qadaByPrayer = {};
        var qadaByMonth = [];
        var totalQada = 0;

        prayers.forEach(function(p) { qadaByPrayer[p.id] = 0; });

        for (var month = 1; month <= 12; month++) {
            var qadaData = Storage.getQadaData(year, month);
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

        statsGrid.innerHTML =
            '<div class="stat-card" style="border-right:3px solid #dc2626;padding:10px 12px;">' +
                '<div class="label" style="font-size:0.75em;">' + (currentLang === 'ar' ? '\u0625\u062C\u0645\u0627\u0644\u064A \u0635\u0644\u0648\u0627\u062A \u0627\u0644\u0642\u0636\u0627\u0621' : 'Total Qada Prayers') + '</div>' +
                '<div class="value" style="color:#dc2626;font-size:1.8em;">' + totalQada + '</div>' +
            '</div>' +
            '<div class="stat-card" style="border-right:3px solid #f97316;padding:10px 12px;">' +
                '<div class="label" style="font-size:0.75em;">' + (currentLang === 'ar' ? '\u0623\u0643\u062B\u0631 \u0635\u0644\u0627\u0629 \u0642\u0636\u0627\u0621\u064B' : 'Most Qada Prayer') + '</div>' +
                '<div class="value" style="color:#f97316;font-size:1.2em;">' + (worstPrayer.id ? I18n.getPrayerName(worstPrayer.id) : '-') + '</div>' +
                '<div class="sublabel">' + worstPrayer.count + ' ' + (currentLang === 'ar' ? '\u0645\u0631\u0629' : 'times') + '</div>' +
            '</div>' +
            '<div class="stat-card" style="border-right:3px solid #eab308;padding:10px 12px;">' +
                '<div class="label" style="font-size:0.75em;">' + (currentLang === 'ar' ? '\u0623\u0633\u0648\u0623 \u0634\u0647\u0631' : 'Worst Month') + '</div>' +
                '<div class="value" style="color:#eab308;font-size:1.2em;">' + (worstMonth.month > 0 ? Hijri.getHijriMonthName(worstMonth.month - 1) : '-') + '</div>' +
                '<div class="sublabel" style="font-size:0.7em;">' + worstMonth.count + ' ' + (currentLang === 'ar' ? '\u0635\u0644\u0627\u0629 \u0642\u0636\u0627\u0621' : 'qada prayers') + '</div>' +
            '</div>';

        // Monthly breakdown bars
        var maxMonthQada = Math.max.apply(null, qadaByMonth) || 1;
        var breakdownHtml = '';

        for (var m = 0; m < 12; m++) {
            if (qadaByMonth[m] > 0) {
                var pct = Math.round((qadaByMonth[m] / maxMonthQada) * 100);
                breakdownHtml += '<div class="qada-month-row">' +
                    '<span class="qm-month">' + Hijri.getHijriMonthName(m) + '</span>' +
                    '<div class="qm-bar"><div class="qm-bar-fill" style="width:' + pct + '%"></div></div>' +
                    '<span class="qm-count">' + qadaByMonth[m] + '</span>' +
                '</div>';
            }
        }

        if (!breakdownHtml) {
            breakdownHtml = '<p style="text-align:center;color:var(--text-muted);padding:16px;font-size:0.9em;">' +
                (currentLang === 'ar' ? '\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0644\u0648\u0627\u062A \u0642\u0636\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0633\u0646\u0629 \u2014 \u0623\u062D\u0633\u0646\u062A!' : 'No qada prayers this year \u2014 great job!') + '</p>';
        }
        breakdown.innerHTML = breakdownHtml;

        // Chart - Qada by prayer type (SVG bar chart)
        var chartContainer = document.getElementById('fardQadaChart');
        if (chartContainer && totalQada > 0 && window.App.SVGCharts) {
            var items = prayers.map(function(p) {
                return { label: I18n.getPrayerName(p.id), value: qadaByPrayer[p.id], color: p.color };
            });
            window.App.SVGCharts.barChart(chartContainer, { items: items });
        } else if (chartContainer) {
            chartContainer.innerHTML = '';
        }
    }

    return {
        renderQadaReport: renderQadaReport
    };
})();

// Backward compat
window.renderQadaReport = window.App.QadaReport.renderQadaReport;
