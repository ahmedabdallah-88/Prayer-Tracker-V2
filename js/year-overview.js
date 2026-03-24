/* Prayer Tracker PWA — year-overview.js */
window.App = window.App || {};
window.App.YearOverview = (function() {

    function updateYearlyView(type) {
        var Hijri = window.App.Hijri;
        var Storage = window.App.Storage;
        var I18n = window.App.I18n;

        var yearVal = parseInt(document.getElementById(type + 'YearlyYear').value);
        Hijri.setCurrentHijriYear(yearVal);
        Storage.setCurrentYear(yearVal);
        Storage.loadAllData(type);

        var grid = document.getElementById(type + 'MonthsGrid');
        grid.innerHTML = '';

        for (var month = 1; month <= 12; month++) {
            var stats = Storage.getMonthStats(type, month, yearVal);
            var card = document.createElement('div');
            card.className = 'month-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.onclick = (function(t, m) {
                return function() { openMonth(t, m); };
            })(type, month);

            // Calculate congregation stats for fard
            var congHtml = '';
            if (type === 'fard') {
                var congData = Storage.getCongregationData(yearVal, month);
                var prayers = Storage.getPrayersArray('fard');
                var dataObj = Storage.getDataObject('fard');
                var monthCong = 0, monthCompleted = 0;

                prayers.forEach(function(prayer) {
                    if (dataObj[month] && dataObj[month][prayer.id]) {
                        var completedDays = Object.keys(dataObj[month][prayer.id]).filter(function(d) { return dataObj[month][prayer.id][d]; });
                        monthCompleted += completedDays.length;
                        completedDays.forEach(function(d) {
                            if (congData[prayer.id] && congData[prayer.id][parseInt(d)]) monthCong++;
                        });
                    }
                });

                var congRate = monthCompleted > 0 ? Math.round((monthCong / monthCompleted) * 100) : 0;
                congHtml =
                    '<div class="month-stat" style="grid-column: 1 / -1;">' +
                        '<div class="label"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">mosque</span> ' + I18n.t('congregation') + '</div>' +
                        '<div class="value">' + congRate + '%</div>' +
                    '</div>';
            }

            var hijriLabel = Hijri.getHijriMonthName(month - 1);
            var gregSpan = Hijri.getGregorianSpanForHijriMonth(yearVal, month);

            card.innerHTML =
                '<h3>' + hijriLabel + ' ' + yearVal + '</h3>' +
                '<div class="month-greg-ref" style="font-size:0.75em;color:var(--text-muted);margin-top:-6px;margin-bottom:8px;">' + gregSpan + '</div>' +
                '<div class="month-progress">' +
                    '<div class="progress-bar">' +
                        '<div class="progress-fill" style="width: ' + stats.percentage + '%">' +
                            stats.percentage + '%' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="month-stats">' +
                    '<div class="month-stat">' +
                        '<div class="label">' + (type === 'fard' ? I18n.t('completed_word') : I18n.t('performed')) + '</div>' +
                        '<div class="value">' + stats.completed + '</div>' +
                    '</div>' +
                    '<div class="month-stat">' +
                        '<div class="label">' + I18n.t('remaining_word') + '</div>' +
                        '<div class="value">' + (stats.total - stats.completed) + '</div>' +
                    '</div>' +
                    congHtml +
                '</div>';

            grid.appendChild(card);
        }
    }

    function openMonth(type, month) {
        var Hijri = window.App.Hijri;
        var Storage = window.App.Storage;

        Storage.setCurrentMonth(month);
        Hijri.setCurrentHijriMonth(month);
        document.getElementById(type + 'CurrentMonthTitle').textContent = Hijri.formatHijriMonthHeader(Hijri.getCurrentHijriYear(), month);

        document.getElementById(type + 'YearlyView').classList.remove('active');
        document.getElementById(type + 'MonthlyView').classList.add('active');

        renderMonthDetail(type);
    }

    function backToYearly(type) {
        document.getElementById(type + 'MonthlyView').classList.remove('active');
        document.getElementById(type + 'YearlyView').classList.add('active');
        updateYearlyView(type);
    }

    function renderMonthDetail(type) {
        var Storage = window.App.Storage;
        var Hijri = window.App.Hijri;
        var I18n = window.App.I18n;
        var Female = window.App.Female;

        var container = document.getElementById(type + 'PrayersContainer');
        container.innerHTML = '';

        var prayers = Storage.getPrayersArray(type);
        var dataObj = Storage.getDataObject(type);
        var hYear = Hijri.getCurrentHijriYear();
        var hMonth = Hijri.getCurrentHijriMonth();
        var daysInMonth = Hijri.getHijriDaysInMonth(hYear, hMonth);
        var activeProfile = Storage.getActiveProfile();
        var isFemale = activeProfile && activeProfile.gender === 'female' && activeProfile.age >= 12;
        var exemptData = isFemale ? Female.getExemptDays(hYear, hMonth) : {};

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
                        '<span>' + prayer.icon + '</span>' +
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

                    if (dataObj[hMonth] && dataObj[hMonth][prayer.id] && dataObj[hMonth][prayer.id][day]) {
                        dayBox.classList.add('checked');
                        // Show congregation for fard
                        if (type === 'fard') {
                            var congData = Storage.getCongregationData(hYear, hMonth);
                            if (congData[prayer.id] && congData[prayer.id][day]) {
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
                        return function() { window.handleDayClick(t, pId, d); };
                    })(type, prayer.id, day);
                }

                grid.appendChild(dayBox);
            }
        });
    }

    // Private helper — same as in fard-tracker
    function createDualDayNum(hijriDay, hYear, hMonth) {
        var Hijri = window.App.Hijri;
        var frag = document.createDocumentFragment();
        var dayNum = document.createElement('span');
        dayNum.className = 'day-number';
        dayNum.textContent = hijriDay;
        frag.appendChild(dayNum);

        try {
            var gDate = Hijri.hijriToGregorian(hYear, hMonth, hijriDay);
            var gregSpan = document.createElement('span');
            gregSpan.className = 'day-greg';
            gregSpan.textContent = gDate.getDate();
            frag.appendChild(gregSpan);
        } catch(e) {}

        var iconSpan = document.createElement('span');
        iconSpan.className = 'day-icon material-symbols-outlined';
        iconSpan.style.display = 'none';
        iconSpan.style.fontSize = '13px';
        iconSpan.textContent = 'mosque';
        frag.appendChild(iconSpan);

        return frag;
    }

    // Year overview toggle/reset day functions
    function toggleDay(type, prayerId, day) {
        var Storage = window.App.Storage;
        var Hijri = window.App.Hijri;

        var hMonth = Hijri.getCurrentHijriMonth();
        var hYear = Hijri.getCurrentHijriYear();

        if (Hijri.isFutureDateHijri(day, hMonth, hYear)) {
            window.App.UI.showToast(window.App.I18n.t('future_date'), 'warning');
            return;
        }

        var dataObj = Storage.getDataObject(type);
        if (!dataObj[hMonth]) dataObj[hMonth] = {};
        if (!dataObj[hMonth][prayerId]) dataObj[hMonth][prayerId] = {};
        dataObj[hMonth][prayerId][day] = !dataObj[hMonth][prayerId][day];
        Storage.saveMonthData(type, hMonth);
        renderMonthDetail(type);
    }

    function resetMonth(type) {
        var Storage = window.App.Storage;
        var hMonth = Hijri.getCurrentHijriMonth();

        window.App.UI.showConfirm(window.App.I18n.t('confirm_clear')).then(function(confirmed) {
            if (confirmed) {
                var dataObj = Storage.getDataObject(type);
                var prayers = Storage.getPrayersArray(type);
                dataObj[hMonth] = {};
                prayers.forEach(function(p) { dataObj[hMonth][p.id] = {}; });
                Storage.saveMonthData(type, hMonth);
                renderMonthDetail(type);
            }
        });
    }

    return {
        updateYearlyView: updateYearlyView,
        openMonth: openMonth,
        backToYearly: backToYearly,
        renderMonthDetail: renderMonthDetail,
        toggleDay: toggleDay,
        resetMonth: resetMonth
    };
})();

// Backward compat
window.updateYearlyView = window.App.YearOverview.updateYearlyView;
window.openMonth = window.App.YearOverview.openMonth;
window.backToYearly = window.App.YearOverview.backToYearly;
window.renderMonthDetail = window.App.YearOverview.renderMonthDetail;
