/**
 * fasting-tracker.js — Fasting Tracker UI & Logic
 * Extracted from index.html (lines 3431-3694, 4782-4795)
 */
window.App = window.App || {};
window.App.Fasting = (function() {
    // ==================== STATE ====================
    var fastingExemptModeOn = false;
    var fastingMonth, fastingYear;

    // ==================== HELPERS (delegate to Storage) ====================

    function getFastingKey(year) {
        return window.App.Storage.getFastingKey(year);
    }

    function getFastingData(year) {
        return window.App.Storage.getFastingData(year);
    }

    function saveFastingData(year, data) {
        window.App.Storage.saveFastingData(year, data);
    }

    function getVolFastingKey(year, month) {
        return window.App.Storage.getVolFastingKey(year, month);
    }

    function getVolFastingData(year, month) {
        return window.App.Storage.getVolFastingData(year, month);
    }

    function saveVolFastingData(year, month, data) {
        window.App.Storage.saveVolFastingData(year, month, data);
    }

    // ==================== FASTING VIEW SWITCH (MERGED with Fiori override) ====================

    function switchFastingView(view) {
        document.querySelectorAll('#fastingSection .view').forEach(function(v) { v.classList.remove('active'); });
        document.querySelectorAll('#fastingSection .toggle-btn').forEach(function(b) { b.classList.remove('active'); });

        if (view === 'voluntary') {
            document.getElementById('fastingVoluntaryView').classList.add('active');
            try { document.querySelector('#fastingSection .toggle-btn:nth-child(1)').classList.add('active'); } catch(e) {}
            updateVoluntaryFasting();
        } else if (view === 'ramadan') {
            document.getElementById('fastingRamadanView').classList.add('active');
            try { document.querySelector('#fastingSection .toggle-btn:nth-child(2)').classList.add('active'); } catch(e) {}
            updateFastingView();
        } else if (view === 'dashboard') {
            document.getElementById('fastingDashboardView').classList.add('active');
            try { document.querySelector('#fastingSection .toggle-btn:nth-child(3)').classList.add('active'); } catch(e) {}
            document.getElementById('fastingDashboardYear').value = window.App.Storage.getCurrentYear();
            updateFastingDashboard();
        }

        // Fiori sub-tab active state management
        var subTabs = document.getElementById('fastingSubTabs');
        if (subTabs) {
            subTabs.querySelectorAll('.sub-tab').forEach(function(tab, i) {
                tab.classList.remove('active');
                if ((view === 'voluntary' && i === 0) || (view === 'ramadan' && i === 1) || (view === 'dashboard' && i === 2)) {
                    tab.classList.add('active');
                }
            });
        }
    }

    // ==================== VOLUNTARY FASTING ====================

    function updateVoluntaryFasting() {
        fastingMonth = parseInt(document.getElementById('fastingMonthSelect').value);
        fastingYear = parseInt(document.getElementById('fastingYearVoluntary').value);
        var daysInMonth = window.App.Storage.getDaysInMonth(fastingMonth, fastingYear);
        var data = getVolFastingData(fastingYear, fastingMonth);
        var isFemale = window.App.Storage.getActiveProfile() && window.App.Storage.getActiveProfile().gender === 'female' && window.App.Storage.getActiveProfile().age >= 12;
        var exemptData = isFemale ? window.App.Female.getExemptDays(fastingYear, fastingMonth) : {};

        // Update compact month nav label
        var monthLabel = document.getElementById('fastingMonthLabel');
        if (monthLabel && window.App.Hijri) {
            monthLabel.textContent = window.App.Hijri.getHijriMonthName(fastingMonth - 1) + ' ' + fastingYear;
        }
        var daysPill = document.getElementById('fastingMonthDaysPill');
        if (daysPill) daysPill.textContent = daysInMonth;

        var grid = document.getElementById('voluntaryFastingGrid');
        grid.innerHTML = '';

        var fasted = 0, exemptCount = 0;

        for (var day = 1; day <= daysInMonth; day++) {
            var dayBox = document.createElement('div');
            dayBox.className = 'day-box';

            if (window.App.Storage.isFutureDate(day, fastingMonth, fastingYear)) {
                dayBox.appendChild(window.App.Hijri.createDualDayNum(day, fastingYear, fastingMonth));
                dayBox.classList.add('disabled');
                dayBox.style.opacity = '0.3';
            } else if (isFemale && fastingExemptModeOn) {
                dayBox.appendChild(window.App.Hijri.createDualDayNum(day, fastingYear, fastingMonth));

                // Check if any prayer is exempt on this day (reuse prayer exempt data)
                var dayExempt = exemptData[day] && Object.values(exemptData[day]).some(function(v) { return v; });
                if (dayExempt) {
                    dayBox.classList.add('exempt');
                    exemptCount++;
                }
                dayBox.style.cursor = 'default';
                dayBox.title = window.App.I18n.t('exempt_linked_prayer');
            } else {
                dayBox.appendChild(window.App.Hijri.createDualDayNum(day, fastingYear, fastingMonth));

                // Check if exempt day for female
                var dayExempt2 = isFemale && exemptData[day] && Object.values(exemptData[day]).some(function(v) { return v; });
                if (dayExempt2) {
                    dayBox.classList.add('exempt');
                    exemptCount++;
                } else if (data[day]) {
                    dayBox.classList.add('checked');
                    fasted++;
                }

                if (!dayExempt2) {
                    (function(d) {
                        dayBox.onclick = function() {
                            var volData = getVolFastingData(fastingYear, fastingMonth);
                            volData[d] = !volData[d];
                            window.App.UI.hapticFeedback(volData[d] ? 'success' : 'light');
                            if (!volData[d]) delete volData[d];
                            saveVolFastingData(fastingYear, fastingMonth, volData);
                            updateVoluntaryFasting();
                        };
                    })(day);
                }
            }

            grid.appendChild(dayBox);
        }

        document.getElementById('volFastedCount').textContent = fasted;
        document.getElementById('volExemptCount').textContent = exemptCount;
        var possible = daysInMonth - exemptCount;
        var rate = possible > 0 ? Math.round((fasted / possible) * 100) : 0;
        document.getElementById('volFastRate').textContent = rate + '%';
        document.getElementById('volFastingCounter').textContent = fasted + ' / ' + daysInMonth;
    }

    function changeFastingMonth(delta) {
        fastingMonth = parseInt(document.getElementById('fastingMonthSelect').value);
        fastingYear = parseInt(document.getElementById('fastingYearVoluntary').value);
        fastingMonth += delta;
        if (fastingMonth > 12) { fastingMonth = 1; fastingYear++; }
        else if (fastingMonth < 1) { fastingMonth = 12; fastingYear--; }
        document.getElementById('fastingMonthSelect').value = fastingMonth;
        document.getElementById('fastingYearVoluntary').value = fastingYear;
        updateVoluntaryFasting();
    }

    function resetVoluntaryFasting() {
        return window.App.UI.showConfirm(window.App.I18n.t('confirm_clear')).then(function(confirmed) {
            if (!confirmed) return;
            fastingMonth = parseInt(document.getElementById('fastingMonthSelect').value);
            fastingYear = parseInt(document.getElementById('fastingYearVoluntary').value);
            localStorage.removeItem(getVolFastingKey(fastingYear, fastingMonth));
            updateVoluntaryFasting();
        });
    }

    // ==================== FASTING DASHBOARD ====================

    function updateFastingDashboard() {
        var year = parseInt(document.getElementById('fastingDashboardYear').value) || window.App.Hijri.getCurrentHijriYear();

        var totalVol = 0;
        var bestMonth = { month: 0, days: 0 };
        var monthlyVol = [];

        for (var month = 1; month <= 12; month++) {
            var data = getVolFastingData(year, month);
            var count = Object.values(data).filter(function(v) { return v; }).length;
            totalVol += count;
            monthlyVol.push(count);
            if (count > bestMonth.days) {
                bestMonth = { month: month, days: count };
            }
        }

        document.getElementById('fastDashVolTotal').textContent = totalVol;
        document.getElementById('fastDashBestMonth').textContent = bestMonth.month > 0 ? window.App.Hijri.getHijriMonthName(bestMonth.month - 1) : '-';
        document.getElementById('fastDashBestMonthDays').textContent = bestMonth.days + ' \u064A\u0648\u0645';
        document.getElementById('fastDashAvg').textContent = Math.round(totalVol / 12);

        // Ramadan stats
        var ramadanData = getFastingData(year);
        var ramadanDays = window.App.Hijri.getHijriDaysInMonth(year, 9);
        var ramadanFasted = 0;
        Object.values(ramadanData).forEach(function(v) { if (v === 'fasted') ramadanFasted++; });
        document.getElementById('fastDashRamadan').textContent = ramadanFasted + '/' + ramadanDays;
        document.getElementById('fastDashRamadanRate').textContent = Math.round((ramadanFasted / ramadanDays) * 100) + '%';

        // Monthly chart (SVG bar chart)
        var chartContainer = document.getElementById('fastingMonthlyChart');
        if (chartContainer && window.App.SVGCharts) {
            var monthLabels = window.App.Dashboard.getHijriMonthNamesShort();
            var items = monthlyVol.map(function(v, i) {
                return { label: monthLabels[i], value: v, color: '#059669' };
            });
            window.App.SVGCharts.barChart(chartContainer, { items: items });
        }
    }

    // ==================== RAMADAN FASTING VIEW ====================

    function updateFastingView() {
        var year = parseInt(document.getElementById('fastingYearInput').value) || window.App.Hijri.getCurrentHijriYear();
        var data = getFastingData(year);
        var grid = document.getElementById('fastingGrid');
        grid.innerHTML = '';

        // Ramadan is always Hijri month 9 - get its days
        var ramadanDays = window.App.Hijri.getHijriDaysInMonth(year, 9);

        // Show Gregorian reference
        var refEl = document.getElementById('ramadanHijriRef');
        if (refEl) {
            refEl.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px;vertical-align:middle;">nights_stay</span> ' + window.App.Hijri.getHijriMonthName(8) + ' ' + year + ' (' + window.App.Hijri.getGregorianSpanForHijriMonth(year, 9) + ')';
        }

        var fasted = 0, exempt = 0, missed = 0;

        for (var day = 1; day <= ramadanDays; day++) {
            var box = document.createElement('div');
            box.className = 'fasting-day-box';

            box.appendChild(window.App.Hijri.createDualDayNum(day, year, 9));

            var status = data[day] || '';

            if (status === 'fasted') { box.classList.add('fasted'); fasted++; }
            else if (status === 'exempt') { box.classList.add('exempt-fast'); exempt++; }
            else if (status === 'missed') { box.classList.add('missed'); missed++; }

            (function(d) {
                box.onclick = function() { cycleFastingDay(year, d); };
            })(day);
            grid.appendChild(box);
        }

        document.getElementById('fastingDaysFasted').textContent = fasted;
        document.getElementById('fastingDaysExempt').textContent = exempt;
        document.getElementById('fastingDaysMissed').textContent = missed;
        var isFemaleRamadan = window.App.Storage.getActiveProfile() && window.App.Storage.getActiveProfile().gender === 'female' && window.App.Storage.getActiveProfile().age >= 12;
        document.getElementById('fastingDaysOwed').textContent = isFemaleRamadan ? (exempt + missed) : missed;
        document.getElementById('fastingCounter').textContent = fasted + ' / ' + ramadanDays;
    }

    function cycleFastingDay(year, day) {
        var data = getFastingData(year);
        var current = data[day] || '';
        var isFemale = window.App.Storage.getActiveProfile() && window.App.Storage.getActiveProfile().gender === 'female' && window.App.Storage.getActiveProfile().age >= 12;

        var cycle = isFemale
            ? { '': 'fasted', 'fasted': 'exempt', 'exempt': 'missed', 'missed': '' }
            : { '': 'fasted', 'fasted': 'missed', 'missed': '' };
        data[day] = cycle[current];

        window.App.UI.hapticFeedback(data[day] === 'fasted' ? 'success' : 'light');

        if (!data[day]) delete data[day];

        saveFastingData(year, data);
        updateFastingView();
    }

    function resetFasting() {
        return window.App.UI.showConfirm(window.App.I18n.t('confirm_clear_fasting')).then(function(confirmed) {
            if (!confirmed) return;
            var year = parseInt(document.getElementById('fastingYearInput').value) || window.App.Storage.getCurrentYear();
            localStorage.removeItem(getFastingKey(year));
            updateFastingView();
        });
    }

    // ==================== STATE ACCESSORS ====================

    function getFastingExemptModeOn() {
        return fastingExemptModeOn;
    }

    function setFastingExemptModeOn(val) {
        fastingExemptModeOn = val;
    }

    // ==================== PUBLIC API ====================

    return {
        switchFastingView: switchFastingView,
        updateVoluntaryFasting: updateVoluntaryFasting,
        changeFastingMonth: changeFastingMonth,
        resetVoluntaryFasting: resetVoluntaryFasting,
        updateFastingDashboard: updateFastingDashboard,
        updateFastingView: updateFastingView,
        cycleFastingDay: cycleFastingDay,
        resetFasting: resetFasting,
        getFastingExemptModeOn: getFastingExemptModeOn,
        setFastingExemptModeOn: setFastingExemptModeOn
    };
})();

// Backward compat globals
window.switchFastingView = window.App.Fasting.switchFastingView;
window.updateVoluntaryFasting = window.App.Fasting.updateVoluntaryFasting;
window.changeFastingMonth = window.App.Fasting.changeFastingMonth;
window.resetVoluntaryFasting = window.App.Fasting.resetVoluntaryFasting;
window.updateFastingView = window.App.Fasting.updateFastingView;
window.resetFasting = window.App.Fasting.resetFasting;
window.updateFastingDashboard = window.App.Fasting.updateFastingDashboard;
window.fastingExemptModeOn = false; // Also expose as global for inline HTML
