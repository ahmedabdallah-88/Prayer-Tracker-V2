// ==================== NAVIGATION MODULE ====================
// Functions for switching sections, views, and navigating between months
import { state } from './state.js';
import { loadAllData, getPrayersArray, getDataObject } from './prayer-data.js';
import { getTodayHijri, formatHijriMonthHeader } from './hijri-calendar.js';

// ==================== SECTION SWITCHING ====================

export function switchSection(section) {
    state.currentSection = section;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.main-toggle-btn').forEach(b => b.classList.remove('active'));

    if (section === 'fasting') {
        // Fasting section handling
        document.getElementById('fastingSection').classList.add('active');
        document.getElementById('fastingToggleBtn').classList.add('active');

        var todayH = getTodayHijri();
        document.getElementById('fastingYearInput').value = state.currentHijriYear;
        document.getElementById('fastingMonthSelect').value = todayH.month;
        document.getElementById('fastingYearVoluntary').value = state.currentHijriYear;

        if (typeof window.switchFastingView === 'function') {
            window.switchFastingView('voluntary');
        }
    } else if (section === 'fard') {
        document.getElementById('fardSection').classList.add('active');
        try { document.querySelector('.main-toggle-btn:nth-child(1)').classList.add('active'); } catch(e) {}
        var todayH = getTodayHijri();
        state.currentHijriMonth = parseInt(document.getElementById('fardTrackerMonthSelect').value) || todayH.month;
        state.currentHijriYear = parseInt(document.getElementById('fardTrackerYearInput').value) || todayH.year;
        state.currentMonth = state.currentHijriMonth;
        state.currentYear = state.currentHijriYear;
        loadAllData('fard');
        if (typeof window.updateTrackerView === 'function') {
            window.updateTrackerView('fard');
        }
    } else if (section === 'sunnah') {
        document.getElementById('sunnahSection').classList.add('active');
        try { document.querySelector('.main-toggle-btn:nth-child(2)').classList.add('active'); } catch(e) {}
        var todayH = getTodayHijri();
        state.currentHijriMonth = parseInt(document.getElementById('sunnahTrackerMonthSelect').value) || todayH.month;
        state.currentHijriYear = parseInt(document.getElementById('sunnahTrackerYearInput').value) || todayH.year;
        state.currentMonth = state.currentHijriMonth;
        state.currentYear = state.currentHijriYear;
        loadAllData('sunnah');
        if (typeof window.updateTrackerView === 'function') {
            window.updateTrackerView('sunnah');
        }
    }

    // Check prayer reminders when switching to fard
    if (section === 'fard') {
        setTimeout(function() {
            if (typeof window.checkPrayerReminders === 'function') {
                window.checkPrayerReminders();
            }
        }, 300);
    }
}

// ==================== VIEW SWITCHING ====================

export function switchView(type, view) {
    const prefix = type;
    document.querySelectorAll(`#${prefix}Section .view`).forEach(v => v.classList.remove('active'));
    document.querySelectorAll(`#${prefix}Section .toggle-btn`).forEach(b => b.classList.remove('active'));

    if (view === 'tracker') {
        document.getElementById(`${prefix}TrackerView`).classList.add('active');
        try { document.querySelector(`#${prefix}Section .toggle-btn:nth-child(1)`).classList.add('active'); } catch(e) {}
        var todayH = getTodayHijri();
        state.currentHijriMonth = parseInt(document.getElementById(`${prefix}TrackerMonthSelect`).value) || todayH.month;
        state.currentHijriYear = parseInt(document.getElementById(`${prefix}TrackerYearInput`).value) || todayH.year;
        state.currentMonth = state.currentHijriMonth;
        state.currentYear = state.currentHijriYear;
        document.getElementById(`${prefix}TrackerMonthSelect`).value = state.currentHijriMonth;
        document.getElementById(`${prefix}TrackerYearInput`).value = state.currentHijriYear;
        loadAllData(type);
        if (typeof window.updateTrackerView === 'function') {
            window.updateTrackerView(type);
        }
    } else if (view === 'yearly') {
        document.getElementById(`${prefix}YearlyView`).classList.add('active');
        try { document.querySelector(`#${prefix}Section .toggle-btn:nth-child(2)`).classList.add('active'); } catch(e) {}
        state.currentHijriYear = parseInt(document.getElementById(`${prefix}YearlyYear`).value);
        state.currentYear = state.currentHijriYear;
        loadAllData(type);
        if (typeof window.updateYearlyView === 'function') {
            window.updateYearlyView(type);
        }
    } else if (view === 'dashboard') {
        document.getElementById(`${prefix}DashboardView`).classList.add('active');
        try { document.querySelector(`#${prefix}Section .toggle-btn:nth-child(3)`).classList.add('active'); } catch(e) {}
        state.currentHijriYear = parseInt(document.getElementById(`${prefix}DashboardYear`).value);
        state.currentYear = state.currentHijriYear;
        loadAllData(type);
        if (typeof window.updateDashboard === 'function') {
            window.updateDashboard(type);
        }
    }
}

// ==================== MONTH NAVIGATION ====================

export function openMonth(type, month) {
    state.currentMonth = month;
    state.currentHijriMonth = month;
    document.getElementById(`${type}CurrentMonthTitle`).textContent = formatHijriMonthHeader(state.currentHijriYear, month);

    document.getElementById(`${type}YearlyView`).classList.remove('active');
    document.getElementById(`${type}MonthlyView`).classList.add('active');

    if (typeof window.renderMonthDetail === 'function') {
        window.renderMonthDetail(type);
    }
}

export function backToYearly(type) {
    document.getElementById(`${type}MonthlyView`).classList.remove('active');
    document.getElementById(`${type}YearlyView`).classList.add('active');
    if (typeof window.updateYearlyView === 'function') {
        window.updateYearlyView(type);
    }
}

// ==================== TAB SWITCHING (FIORI) ====================

export function switchTab(tab) {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    switchSection(tab);
}

// ==================== EXPOSE ON WINDOW ====================

window.switchSection = switchSection;
window.switchView = switchView;
window.openMonth = openMonth;
window.backToYearly = backToYearly;
window.switchTab = switchTab;
