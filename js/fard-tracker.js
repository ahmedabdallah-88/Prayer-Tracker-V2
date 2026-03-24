/**
 * fard-tracker.js - Prayer Tracker Module
 * Handles tracker view rendering, day clicking (4-state cycle),
 * section/view switching, stats, batch marking, and year overview.
 *
 * Part of window.App.Tracker IIFE.
 */
window.App = window.App || {};
window.App.Tracker = (function() {
    'use strict';

    // ==================== HELPER REFERENCES ====================

    function _getStorage()  { return window.App.Storage; }
    function _getHijri()    { return window.App.Hijri; }
    function _getFemale()   { return window.App.Female; }
    function _getUI()       { return window.App.UI; }
    function _getI18n()     { return window.App.I18n; }

    // ==================== PRIVATE HELPERS ====================

    function createDualDayNum(hijriDay, hYear, hMonth) {
        var frag = document.createDocumentFragment();
        var dayNum = document.createElement('span');
        dayNum.className = 'day-number';
        dayNum.textContent = hijriDay;
        frag.appendChild(dayNum);

        try {
            var gDate = _getHijri().hijriToGregorian(hYear, hMonth, hijriDay);
            var gregSpan = document.createElement('span');
            gregSpan.className = 'day-greg';
            gregSpan.textContent = gDate.getDate();
            frag.appendChild(gregSpan);
        } catch(e) {}

        // Hidden Material icon (shown by CSS for congregation/qada)
        var iconSpan = document.createElement('span');
        iconSpan.className = 'day-icon material-symbols-rounded';
        iconSpan.style.display = 'none';
        iconSpan.style.fontSize = '13px';
        iconSpan.textContent = 'mosque';
        frag.appendChild(iconSpan);

        return frag;
    }

    function isCongregation(congData, prayerId, day) {
        return congData[prayerId] && congData[prayerId][day];
    }

    // ==================== switchSection (merged: base + fasting + Fiori) ====================

    function switchSection(section) {
        var Storage = _getStorage();
        var Hijri = _getHijri();

        Storage.setCurrentSection(section);

        document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
        document.querySelectorAll('.main-toggle-btn').forEach(function(b) { b.classList.remove('active'); });

        if (section === 'azkar') {
            // Azkar section
            var azkarSec = document.getElementById('azkarSection');
            if (azkarSec) azkarSec.classList.add('active');
            var azkarBtn = document.getElementById('azkarToggleBtn');
            if (azkarBtn) azkarBtn.classList.add('active');

            var todayHA = Hijri.getTodayHijri();
            var azMonthEl = document.getElementById('azkarTrackerMonth');
            var azYearEl = document.getElementById('azkarTrackerYear');
            if (azMonthEl) azMonthEl.value = todayHA.month;
            if (azYearEl) azYearEl.value = todayHA.year;
            var azDashYear = document.getElementById('azkarDashboardYear');
            if (azDashYear) azDashYear.value = todayHA.year;
            var azYearlyYear = document.getElementById('azkarYearlyYear');
            if (azYearlyYear) azYearlyYear.value = todayHA.year;

            if (typeof window.switchAzkarView === 'function') {
                window.switchAzkarView('tracker');
            }
        } else if (section === 'fasting') {
            // Fasting override branch
            document.getElementById('fastingSection').classList.add('active');
            document.getElementById('fastingToggleBtn').classList.add('active');

            var todayH = Hijri.getTodayHijri();
            document.getElementById('fastingYearInput').value = Hijri.getCurrentHijriYear();
            document.getElementById('fastingMonthSelect').value = todayH.month;
            document.getElementById('fastingYearVoluntary').value = Hijri.getCurrentHijriYear();

            if (typeof window.switchFastingView === 'function') {
                window.switchFastingView('voluntary');
            }
        } else if (section === 'fard') {
            document.getElementById('fardSection').classList.add('active');
            try { document.querySelector('.main-toggle-btn:nth-child(1)').classList.add('active'); } catch(e) {}
            var todayHF = Hijri.getTodayHijri();
            var hMonth = parseInt(document.getElementById('fardTrackerMonthSelect').value) || todayHF.month;
            var hYear  = parseInt(document.getElementById('fardTrackerYearInput').value) || todayHF.year;
            Hijri.setCurrentHijriMonth(hMonth);
            Hijri.setCurrentHijriYear(hYear);
            Storage.setCurrentMonth(hMonth);
            Storage.setCurrentYear(hYear);
            Storage.loadAllData('fard');
            updateTrackerView('fard');
        } else {
            // sunnah
            document.getElementById('sunnahSection').classList.add('active');
            try { document.querySelector('.main-toggle-btn:nth-child(2)').classList.add('active'); } catch(e) {}
            var todayHS = Hijri.getTodayHijri();
            var hMonthS = parseInt(document.getElementById('sunnahTrackerMonthSelect').value) || todayHS.month;
            var hYearS  = parseInt(document.getElementById('sunnahTrackerYearInput').value) || todayHS.year;
            Hijri.setCurrentHijriMonth(hMonthS);
            Hijri.setCurrentHijriYear(hYearS);
            Storage.setCurrentMonth(hMonthS);
            Storage.setCurrentYear(hYearS);
            Storage.loadAllData('sunnah');
            updateTrackerView('sunnah');
        }

        // Fard-specific: delayed reminder check
        if (section === 'fard') {
            setTimeout(function() { _getUI().checkPrayerReminders(); }, 300);
        }

        // Fiori: update shell bar
        if (typeof window.updateShellBar === 'function') {
            window.updateShellBar();
        }
    }

    // ==================== switchView (merged: base + Fiori sub-tabs) ====================

    function switchView(type, view) {
        var Storage = _getStorage();
        var Hijri = _getHijri();
        var prefix = type;

        document.querySelectorAll('#' + prefix + 'Section .view').forEach(function(v) { v.classList.remove('active'); });
        document.querySelectorAll('#' + prefix + 'Section .toggle-btn').forEach(function(b) { b.classList.remove('active'); });

        if (view === 'tracker') {
            document.getElementById(prefix + 'TrackerView').classList.add('active');
            try { document.querySelector('#' + prefix + 'Section .toggle-btn:nth-child(1)').classList.add('active'); } catch(e) {}
            var todayH = Hijri.getTodayHijri();
            var hMonth = parseInt(document.getElementById(prefix + 'TrackerMonthSelect').value) || todayH.month;
            var hYear  = parseInt(document.getElementById(prefix + 'TrackerYearInput').value) || todayH.year;
            Hijri.setCurrentHijriMonth(hMonth);
            Hijri.setCurrentHijriYear(hYear);
            Storage.setCurrentMonth(hMonth);
            Storage.setCurrentYear(hYear);
            document.getElementById(prefix + 'TrackerMonthSelect').value = hMonth;
            document.getElementById(prefix + 'TrackerYearInput').value = hYear;
            Storage.loadAllData(type);
            updateTrackerView(type);
        } else if (view === 'yearly') {
            document.getElementById(prefix + 'YearlyView').classList.add('active');
            try { document.querySelector('#' + prefix + 'Section .toggle-btn:nth-child(2)').classList.add('active'); } catch(e) {}
            var yearlyYear = parseInt(document.getElementById(prefix + 'YearlyYear').value);
            Hijri.setCurrentHijriYear(yearlyYear);
            Storage.setCurrentYear(yearlyYear);
            Storage.loadAllData(type);
            if (typeof window.updateYearlyView === 'function') {
                window.updateYearlyView(type);
            }
        } else if (view === 'dashboard') {
            document.getElementById(prefix + 'DashboardView').classList.add('active');
            try { document.querySelector('#' + prefix + 'Section .toggle-btn:nth-child(3)').classList.add('active'); } catch(e) {}
            var dashYear = parseInt(document.getElementById(prefix + 'DashboardYear').value);
            Hijri.setCurrentHijriYear(dashYear);
            Storage.setCurrentYear(dashYear);
            Storage.loadAllData(type);
            if (typeof window.updateDashboard === 'function') {
                window.updateDashboard(type);
            }
        }

        // Fiori: update sub-tab active state
        var subTabs = document.getElementById(prefix + 'SubTabs');
        if (subTabs) {
            var tabs = subTabs.querySelectorAll('.sub-tab');
            for (var i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove('active');
                if ((view === 'tracker' && i === 0) || (view === 'yearly' && i === 1) || (view === 'dashboard' && i === 2)) {
                    tabs[i].classList.add('active');
                }
            }
        }
    }

    // ==================== updateTrackerView ====================

    function updateTrackerView(type) {
        var Hijri = _getHijri();
        var Storage = _getStorage();

        var hMonth = parseInt(document.getElementById(type + 'TrackerMonthSelect').value);
        var hYear  = parseInt(document.getElementById(type + 'TrackerYearInput').value);
        Hijri.setCurrentHijriMonth(hMonth);
        Hijri.setCurrentHijriYear(hYear);
        Storage.setCurrentMonth(hMonth);
        Storage.setCurrentYear(hYear);

        // Update header with Hijri display
        var headerEl = document.getElementById(type + 'TrackerHijriHeader');
        if (headerEl) {
            var textEl = document.getElementById(type + 'TrackerHijriHeaderText');
            if (textEl) {
                textEl.textContent = Hijri.formatHijriMonthHeader(hYear, hMonth);
            } else {
                headerEl.textContent = Hijri.formatHijriMonthHeader(hYear, hMonth);
            }
        }

        // Update month days button
        if (typeof window.updateMonthDaysButton === 'function') {
            window.updateMonthDaysButton();
        }

        Storage.loadAllData(type);
        renderTrackerMonth(type);
        updateTrackerStats(type);
        if (typeof window.renderStreaks === 'function') {
            window.renderStreaks(type);
        }
    }

    // ==================== renderTrackerMonth (final override version with all features) ====================

    function renderTrackerMonth(type) {
        var Storage = _getStorage();
        var Hijri   = _getHijri();
        var Female  = _getFemale();
        var I18n    = _getI18n();

        var container = document.getElementById(type + 'TrackerPrayersContainer');
        container.innerHTML = '';

        var prayers     = Storage.getPrayersArray(type);
        var dataObj     = Storage.getDataObject(type);
        var hYear       = Hijri.getCurrentHijriYear();
        var hMonth      = Hijri.getCurrentHijriMonth();
        var daysInMonth = Hijri.getHijriDaysInMonth(hYear, hMonth);
        var profile     = Storage.getActiveProfile();
        var isFemale    = profile && profile.gender === 'female' && profile.age >= 12;
        var exemptData  = isFemale ? Female.getExemptDays(hYear, hMonth) : {};
        var isExemptModeOn = Female.getExemptMode()[type];
        var currentLang = I18n.getCurrentLang();

        prayers.forEach(function(prayer) {
            var section = document.createElement('div');
            section.className = 'prayer-section ' + prayer.class;

            var completed = 0;
            var exemptCount = isFemale ? Female.getExemptCountForPrayer(hYear, hMonth, prayer.id) : 0;
            if (dataObj[hMonth] && dataObj[hMonth][prayer.id]) {
                completed = Object.values(dataObj[hMonth][prayer.id]).filter(function(v) { return v; }).length;
            }

            var adjustedTotal = daysInMonth - exemptCount;

            var header = document.createElement('div');
            header.className = 'prayer-header';

            var nameDiv = document.createElement('div');
            nameDiv.className = 'prayer-name';
            nameDiv.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px;">' + prayer.icon + '</span><span>' + I18n.getPrayerName(prayer.id) + '</span>';

            var counter = document.createElement('div');
            counter.className = 'prayer-counter';
            counter.textContent = completed + ' / ' + adjustedTotal;

            // Batch select button
            if (!isExemptModeOn && !(type === 'fard' && window.congregationMode)) {
                var batchBtn = document.createElement('button');
                batchBtn.className = 'batch-btn';
                batchBtn.textContent = I18n.t('mark_all');
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

            // Get today's Hijri for "today" highlighting
            var todayH = Hijri.getTodayHijri();
            var isCurrentMonth = (todayH.year === hYear && todayH.month === hMonth);

            // Weekday headers
            var dayLabels = currentLang === 'ar'
                ? ['أحد', 'إثن', 'ثلث', 'أرب', 'خمس', 'جمع', 'سبت']
                : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            dayLabels.forEach(function(lbl) {
                var hdr = document.createElement('div');
                hdr.className = 'weekday-header';
                hdr.textContent = lbl;
                grid.appendChild(hdr);
            });

            // Calculate day-of-week offset for day 1
            var day1Greg = Hijri.hijriToGregorian(hYear, hMonth, 1);
            var startDow = day1Greg.getDay(); // 0=Sun

            // Add empty cells for offset
            for (var _e = 0; _e < startDow; _e++) {
                var emptyCell = document.createElement('div');
                emptyCell.className = 'day-box empty-cell';
                grid.appendChild(emptyCell);
            }

            // Render each day
            for (var day = 1; day <= daysInMonth; day++) {
                var dayBox = document.createElement('div');
                dayBox.className = 'day-box';

                dayBox.appendChild(createDualDayNum(day, hYear, hMonth));

                // Tooltip
                try {
                    var gDate = Hijri.hijriToGregorian(hYear, hMonth, day);
                    dayBox.title = gDate.getDate() + '/' + (gDate.getMonth() + 1) + '/' + gDate.getFullYear();
                } catch(e) {}

                // Today marker
                var isDayToday = isCurrentMonth && todayH.day === day;
                if (isDayToday) {
                    dayBox.classList.add('today-box');
                    var gregEl = dayBox.querySelector('.day-greg');
                    if (gregEl) gregEl.textContent = currentLang === 'ar' ? 'اليوم' : 'TODAY';
                }

                if (Female.isPrayerExempt(exemptData, prayer.id, day)) {
                    dayBox.classList.add('exempt');
                    if (isExemptModeOn) {
                        dayBox.onclick = (function(pId, d) {
                            return function() { Female.toggleExemptPrayer(pId, d); };
                        })(prayer.id, day);
                        dayBox.title = I18n.t('click_remove_exempt');
                    }
                } else if (Hijri.isFutureDateHijri(day, hMonth, hYear)) {
                    dayBox.classList.add('disabled');
                } else {
                    if (isExemptModeOn) {
                        dayBox.onclick = (function(pId, d) {
                            return function() { Female.toggleExemptPrayer(pId, d); };
                        })(prayer.id, day);
                        dayBox.title = I18n.t('click_mark_exempt');
                        dayBox.style.cursor = 'crosshair';
                    } else {
                        if (dataObj[hMonth][prayer.id] && dataObj[hMonth][prayer.id][day]) {
                            dayBox.classList.add('checked');
                            if (type === 'fard') {
                                var congData = Storage.getCongregationData(hYear, hMonth);
                                if (isCongregation(congData, prayer.id, day)) {
                                    dayBox.classList.add('congregation');
                                    dayBox.classList.remove('checked');
                                    var ico = dayBox.querySelector('.day-icon');
                                    if (ico) ico.textContent = 'mosque';
                                }
                            }
                            var qadaData = Storage.getQadaData(hYear, hMonth);
                            if (qadaData[prayer.id] && qadaData[prayer.id][day]) {
                                dayBox.classList.remove('checked', 'congregation');
                                dayBox.classList.add('qada');
                                var ico2 = dayBox.querySelector('.day-icon');
                                if (ico2) ico2.textContent = 'schedule';
                            }
                        }
                        dayBox.onclick = (function(t, pId, d) {
                            return function() { handleDayClick(t, pId, d); };
                        })(type, prayer.id, day);
                    }
                }

                grid.appendChild(dayBox);
            }

            section.appendChild(header);
            section.appendChild(grid);

            // Add legend under each prayer
            var legend = document.createElement('div');
            legend.className = 'prayer-legend';
            if (type === 'fard') {
                legend.innerHTML =
                    '<div class="legend-item"><div class="legend-dot" style="background:var(--green-deep,#2D6A4F);"><span class="material-symbols-rounded" style="font-size:12px;color:white;">check</span></div><span>' + (currentLang === 'ar' ? 'منفرد' : 'ALONE') + '</span></div>' +
                    '<div class="legend-item"><div class="legend-dot" style="background:var(--gold,#D4A03C);"><span class="material-symbols-rounded" style="font-size:12px;color:white;">mosque</span></div><span>' + (currentLang === 'ar' ? 'جماعة' : 'CONGREGATION') + '</span></div>' +
                    '<div class="legend-item"><div class="legend-dot" style="background:var(--red,#C1574E);"><span class="material-symbols-rounded" style="font-size:12px;color:white;">schedule</span></div><span>' + (currentLang === 'ar' ? 'قضاء' : 'QADA') + '</span></div>';
            } else {
                legend.innerHTML =
                    '<div class="legend-item"><div class="legend-dot" style="background:var(--green-deep,#2D6A4F);"><span class="material-symbols-rounded" style="font-size:12px;color:white;">check</span></div><span>' + (currentLang === 'ar' ? 'مؤداة' : 'DONE') + '</span></div>' +
                    '<div class="legend-item"><div class="legend-dot" style="background:var(--red,#C1574E);"><span class="material-symbols-rounded" style="font-size:12px;color:white;">schedule</span></div><span>' + (currentLang === 'ar' ? 'قضاء' : 'QADA') + '</span></div>';
            }
            section.appendChild(legend);

            container.appendChild(section);
        });
    }

    // ==================== toggleTrackerDay ====================

    function toggleTrackerDay(type, prayerId, day) {
        var Storage = _getStorage();
        var Hijri   = _getHijri();

        if (Storage.isFutureDate(day, Storage.getCurrentMonth(), Storage.getCurrentYear())) {
            _getUI().showToast(_getI18n().t('future_date'), 'warning');
            return;
        }

        var dataObj = Storage.getDataObject(type);
        var currentMonth = Storage.getCurrentMonth();

        if (!dataObj[currentMonth][prayerId]) {
            dataObj[currentMonth][prayerId] = {};
        }

        dataObj[currentMonth][prayerId][day] = !dataObj[currentMonth][prayerId][day];
        Storage.saveMonthData(type, currentMonth);
        renderTrackerMonth(type);
        updateTrackerStats(type);
        if (typeof window.renderStreaks === 'function') {
            window.renderStreaks(type);
        }
        if (type === 'fard') {
            if (typeof window.updateCongregationStats === 'function') window.updateCongregationStats();
            _getUI().checkPrayerReminders();
        }
    }

    // ==================== updateTrackerStats (final override with exempt adjustment) ====================

    function updateTrackerStats(type) {
        var Storage = _getStorage();
        var Hijri   = _getHijri();
        var Female  = _getFemale();

        var prayers     = Storage.getPrayersArray(type);
        var dataObj     = Storage.getDataObject(type);
        var hYear       = Hijri.getCurrentHijriYear();
        var hMonth      = Hijri.getCurrentHijriMonth();
        var daysInMonth = Hijri.getHijriDaysInMonth(hYear, hMonth);
        var profile     = Storage.getActiveProfile();
        var isFemale    = profile && profile.gender === 'female' && profile.age >= 12;

        var totalCompleted = 0;
        var totalPossible  = 0;

        prayers.forEach(function(prayer) {
            var exemptCount  = isFemale ? Female.getExemptCountForPrayer(hYear, hMonth, prayer.id) : 0;
            var adjustedDays = daysInMonth - exemptCount;
            totalPossible += adjustedDays;

            var completed = 0;
            if (dataObj[hMonth] && dataObj[hMonth][prayer.id]) {
                completed = Object.values(dataObj[hMonth][prayer.id]).filter(function(v) { return v; }).length;
            }
            totalCompleted += completed;
        });

        document.getElementById(type + 'TrackerTotalCompleted').textContent = totalCompleted;
        document.getElementById(type + 'TrackerTotalRemaining').textContent = Math.max(0, totalPossible - totalCompleted);

        var rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        document.getElementById(type + 'TrackerCompletionRate').textContent = rate + '%';
    }

    // ==================== changeTrackerMonth ====================

    function changeTrackerMonth(type, delta) {
        var Hijri   = _getHijri();
        var Storage = _getStorage();

        var hMonth = Hijri.getCurrentHijriMonth() + delta;
        var hYear  = Hijri.getCurrentHijriYear();

        if (hMonth > 12) {
            hMonth = 1;
            hYear++;
        } else if (hMonth < 1) {
            hMonth = 12;
            hYear--;
        }

        Hijri.setCurrentHijriMonth(hMonth);
        Hijri.setCurrentHijriYear(hYear);
        Storage.setCurrentMonth(hMonth);
        Storage.setCurrentYear(hYear);

        // Reset week start for weekly view
        if (window.trackerViewMode === 'week') {
            if (delta > 0) {
                window.currentWeekStart = 1;
            } else {
                window.currentWeekStart = Math.max(1, Hijri.getHijriDaysInMonth(hYear, hMonth) - 6);
            }
            if (typeof window.updateWeekLabel === 'function') {
                window.updateWeekLabel();
            }
        }

        document.getElementById(type + 'TrackerMonthSelect').value = hMonth;
        document.getElementById(type + 'TrackerYearInput').value = hYear;
        Storage.loadAllData(type);
        updateTrackerView(type);
    }

    // ==================== resetTrackerMonth ====================

    function resetTrackerMonth(type) {
        var Storage = _getStorage();
        var currentMonth = Storage.getCurrentMonth();

        _getUI().showConfirm(_getI18n().t('confirm_clear')).then(function(confirmed) {
            if (confirmed) {
                var dataObj = Storage.getDataObject(type);
                var prayers = Storage.getPrayersArray(type);

                dataObj[currentMonth] = {};
                prayers.forEach(function(prayer) {
                    dataObj[currentMonth][prayer.id] = {};
                });
                Storage.saveMonthData(type, currentMonth);
                renderTrackerMonth(type);
                updateTrackerStats(type);
                if (typeof window.renderStreaks === 'function') {
                    window.renderStreaks(type);
                }
            }
        });
    }

    // ==================== handleDayClick (4-state cycle) ====================

    function handleDayClick(type, prayerId, day) {
        var Storage = _getStorage();
        var Hijri   = _getHijri();
        var UI      = _getUI();
        var I18n    = _getI18n();

        var currentMonth = Storage.getCurrentMonth();
        var currentYear  = Storage.getCurrentYear();

        if (Storage.isFutureDate(day, currentMonth, currentYear)) {
            UI.showToast(I18n.t('future_date'), 'warning');
            return;
        }

        var dataObj = Storage.getDataObject(type);
        if (!dataObj[currentMonth]) dataObj[currentMonth] = {};
        if (!dataObj[currentMonth][prayerId]) dataObj[currentMonth][prayerId] = {};

        var isChecked = dataObj[currentMonth][prayerId][day];
        var congData  = (type === 'fard') ? Storage.getCongregationData(currentYear, currentMonth) : null;
        var isCong    = congData && congData[prayerId] && congData[prayerId][day];
        var qadaData  = Storage.getQadaData(currentYear, currentMonth);
        var isQada    = qadaData[prayerId] && qadaData[prayerId][day];

        if (!isChecked) {
            // State 0 -> State 1: Mark as prayed (alone)
            dataObj[currentMonth][prayerId][day] = true;
            UI.hapticFeedback('success');
        } else if (isChecked && !isCong && !isQada) {
            // State 1 -> State 2: Mark as congregation
            UI.hapticFeedback('medium');
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
            UI.hapticFeedback('light');
            if (congData[prayerId]) {
                delete congData[prayerId][day];
                if (Object.keys(congData[prayerId]).length === 0) delete congData[prayerId];
            }
            if (!qadaData[prayerId]) qadaData[prayerId] = {};
            qadaData[prayerId][day] = true;
        } else if (isQada) {
            // State 3 -> State 0: Remove everything
            UI.hapticFeedback('light');
            dataObj[currentMonth][prayerId][day] = false;
            if (qadaData[prayerId]) {
                delete qadaData[prayerId][day];
                if (Object.keys(qadaData[prayerId]).length === 0) delete qadaData[prayerId];
            }
            if (congData && congData[prayerId]) { delete congData[prayerId][day]; }
        }

        Storage.saveMonthData(type, currentMonth);
        if (type === 'fard' && congData) Storage.saveCongregationData(currentYear, currentMonth, congData);
        Storage.saveQadaData(currentYear, currentMonth, qadaData);
        renderTrackerMonth(type);
        updateTrackerStats(type);
        if (typeof window.renderStreaks === 'function') {
            window.renderStreaks(type);
        }
        if (type === 'fard') {
            if (typeof window.updateCongregationStats === 'function') window.updateCongregationStats();
            UI.checkPrayerReminders();
        }
    }

    // ==================== batchMarkPrayer ====================

    function batchMarkPrayer(type, prayerId) {
        var Storage = _getStorage();
        var Hijri   = _getHijri();
        var Female  = _getFemale();
        var UI      = _getUI();
        var I18n    = _getI18n();

        var dataObj     = Storage.getDataObject(type);
        var hYear       = Hijri.getCurrentHijriYear();
        var hMonth      = Hijri.getCurrentHijriMonth();
        var daysInMonth = Hijri.getHijriDaysInMonth(hYear, hMonth);
        var profile     = Storage.getActiveProfile();
        var isFemaleUser = profile && profile.gender === 'female' && profile.age >= 12;
        var exemptData  = isFemaleUser ? Female.getExemptDays(hYear, hMonth) : {};

        if (!dataObj[hMonth][prayerId]) dataObj[hMonth][prayerId] = {};

        // Count current state
        var markedCount = 0;
        for (var day = 1; day <= daysInMonth; day++) {
            if (Hijri.isFutureDateHijri(day, hMonth, hYear)) continue;
            if (Female.isPrayerExempt(exemptData, prayerId, day)) continue;
            if (dataObj[hMonth][prayerId][day]) markedCount++;
        }

        // Count available days
        var availableDays = 0;
        for (var day2 = 1; day2 <= daysInMonth; day2++) {
            if (Hijri.isFutureDateHijri(day2, hMonth, hYear)) continue;
            if (Female.isPrayerExempt(exemptData, prayerId, day2)) continue;
            availableDays++;
        }

        // Toggle: if most are marked, unmark all. Otherwise mark all.
        var shouldMark = markedCount < availableDays / 2;

        for (var day3 = 1; day3 <= daysInMonth; day3++) {
            if (Hijri.isFutureDateHijri(day3, hMonth, hYear)) continue;
            if (Female.isPrayerExempt(exemptData, prayerId, day3)) continue;
            dataObj[hMonth][prayerId][day3] = shouldMark;
        }

        Storage.saveMonthData(type, hMonth);
        renderTrackerMonth(type);
        updateTrackerStats(type);
        if (typeof window.renderStreaks === 'function') {
            window.renderStreaks(type);
        }
        if (type === 'fard') {
            if (typeof window.updateCongregationStats === 'function') window.updateCongregationStats();
        }

        var pName = I18n.getPrayerName(prayerId);
        UI.showToast(pName + ': ' + availableDays, 'success', 1500);
    }

    // ==================== toggleDay (year overview variant) ====================

    function toggleDay(type, prayerId, day) {
        var Storage = _getStorage();
        var UI      = _getUI();
        var I18n    = _getI18n();

        if (Storage.isFutureDate(day, Storage.getCurrentMonth(), Storage.getCurrentYear())) {
            UI.showToast(I18n.t('future_date'), 'warning');
            return;
        }

        var dataObj = Storage.getDataObject(type);
        var currentMonth = Storage.getCurrentMonth();

        if (!dataObj[currentMonth][prayerId]) {
            dataObj[currentMonth][prayerId] = {};
        }

        dataObj[currentMonth][prayerId][day] = !dataObj[currentMonth][prayerId][day];
        Storage.saveMonthData(type, currentMonth);
        renderMonthDetail(type);
    }

    // ==================== resetMonth (year overview variant) ====================

    function resetMonth(type) {
        var Storage = _getStorage();
        var UI      = _getUI();
        var I18n    = _getI18n();
        var currentMonth = Storage.getCurrentMonth();

        UI.showConfirm(I18n.t('confirm_clear')).then(function(confirmed) {
            if (confirmed) {
                var dataObj = Storage.getDataObject(type);
                var prayers = Storage.getPrayersArray(type);

                dataObj[currentMonth] = {};
                prayers.forEach(function(prayer) {
                    dataObj[currentMonth][prayer.id] = {};
                });
                Storage.saveMonthData(type, currentMonth);
                renderMonthDetail(type);
            }
        });
    }

    // ==================== renderMonthDetail (year overview month detail) ====================

    function renderMonthDetail(type) {
        var Storage = _getStorage();
        var Hijri   = _getHijri();
        var Female  = _getFemale();
        var I18n    = _getI18n();

        var container = document.getElementById(type + 'PrayersContainer');
        container.innerHTML = '';

        var prayers     = Storage.getPrayersArray(type);
        var dataObj     = Storage.getDataObject(type);
        var hYear       = Hijri.getCurrentHijriYear();
        var hMonth      = Hijri.getCurrentHijriMonth();
        var daysInMonth = Hijri.getHijriDaysInMonth(hYear, hMonth);
        var profile     = Storage.getActiveProfile();
        var isFemale    = profile && profile.gender === 'female' && profile.age >= 12;
        var exemptData  = isFemale ? Female.getExemptDays(hYear, hMonth) : {};

        prayers.forEach(function(prayer) {
            var section = document.createElement('div');
            section.className = 'prayer-section ' + prayer.class;

            var completed = 0;
            var exemptCount = isFemale ? Female.getExemptCountForPrayer(hYear, hMonth, prayer.id) : 0;
            if (dataObj[hMonth] && dataObj[hMonth][prayer.id]) {
                completed = Object.values(dataObj[hMonth][prayer.id]).filter(function(v) { return v; }).length;
            }
            var adjustedTotal = daysInMonth - exemptCount;

            section.innerHTML =
                '<div class="prayer-header">' +
                    '<div class="prayer-name">' +
                        '<span class="material-symbols-rounded" style="font-size:18px;">' + prayer.icon + '</span>' +
                        '<span>' + I18n.getPrayerName(prayer.id) + '</span>' +
                    '</div>' +
                    '<div class="prayer-counter">' + completed + ' / ' + adjustedTotal + '</div>' +
                '</div>' +
                '<div class="days-grid" id="' + type + '-grid-' + prayer.id + '"></div>';

            container.appendChild(section);

            var grid = document.getElementById(type + '-grid-' + prayer.id);
            for (var day = 1; day <= daysInMonth; day++) {
                var dayBox = document.createElement('div');
                dayBox.className = 'day-box';

                if (Female.isPrayerExempt(exemptData, prayer.id, day)) {
                    dayBox.appendChild(createDualDayNum(day, hYear, hMonth));
                    dayBox.classList.add('exempt');
                } else if (Hijri.isFutureDateHijri(day, hMonth, hYear)) {
                    dayBox.appendChild(createDualDayNum(day, hYear, hMonth));
                    dayBox.classList.add('disabled');
                    dayBox.style.opacity = '0.3';
                } else {
                    dayBox.appendChild(createDualDayNum(day, hYear, hMonth));

                    if (dataObj[hMonth][prayer.id] && dataObj[hMonth][prayer.id][day]) {
                        dayBox.classList.add('checked');
                        // Show congregation for fard
                        if (type === 'fard') {
                            var congData = Storage.getCongregationData(hYear, hMonth);
                            if (isCongregation(congData, prayer.id, day)) {
                                dayBox.classList.add('congregation');
                                dayBox.classList.remove('checked');
                            }
                        }
                        // Show qada
                        var qadaData = Storage.getQadaData(hYear, hMonth);
                        if (qadaData[prayer.id] && qadaData[prayer.id][day]) {
                            dayBox.classList.remove('checked', 'congregation');
                            dayBox.classList.add('qada');
                        }
                    }

                    dayBox.onclick = (function(t, pId, d) {
                        return function() { handleDayClick(t, pId, d); };
                    })(type, prayer.id, day);
                }

                grid.appendChild(dayBox);
            }
        });
    }

    // ==================== PUBLIC API ====================

    return {
        switchSection:      switchSection,
        switchView:         switchView,
        updateTrackerView:  updateTrackerView,
        renderTrackerMonth: renderTrackerMonth,
        toggleTrackerDay:   toggleTrackerDay,
        updateTrackerStats: updateTrackerStats,
        changeTrackerMonth: changeTrackerMonth,
        resetTrackerMonth:  resetTrackerMonth,
        handleDayClick:     handleDayClick,
        batchMarkPrayer:    batchMarkPrayer,
        toggleDay:          toggleDay,
        resetMonth:         resetMonth,
        renderMonthDetail:  renderMonthDetail
    };
})();

// ==================== BACKWARD COMPAT GLOBALS ====================
window.switchSection      = window.App.Tracker.switchSection;
window.switchView         = window.App.Tracker.switchView;
window.renderTrackerMonth = window.App.Tracker.renderTrackerMonth;
window.updateTrackerStats = window.App.Tracker.updateTrackerStats;
window.updateTrackerView  = window.App.Tracker.updateTrackerView;
window.changeTrackerMonth = window.App.Tracker.changeTrackerMonth;
window.resetTrackerMonth  = window.App.Tracker.resetTrackerMonth;
window.handleDayClick     = window.App.Tracker.handleDayClick;
window.batchMarkPrayer    = window.App.Tracker.batchMarkPrayer;
window.toggleDay          = window.App.Tracker.toggleDay;
window.resetMonth         = window.App.Tracker.resetMonth;
window.renderMonthDetail  = window.App.Tracker.renderMonthDetail;
