// ==================== UI UTILITIES MODULE ====================
import { state, SWIPE_THRESHOLD, PRAYER_REMINDER_TIMES, fardPrayers } from './state.js';
import {
    getHijriMonthName, getHijriDaysInMonth, hijriToGregorianDay1,
    getHijriOverrides, saveHijriOverrides, clearHijriDay1Cache,
    _hijriDay1Cache
} from './hijri-calendar.js';

// ==================== TOAST NOTIFICATIONS ====================

export function showToast(msg, type = 'info', duration = 2500) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
    }, duration);
}

// ==================== CONFIRMATION DIALOG ====================

export function showConfirm(msg) {
    return new Promise(resolve => {
        var t = window.t || function(k) { return k; };
        // Prevent stacking
        const existing = document.querySelector('.confirm-overlay');
        if (existing) { resolve(false); return; }
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-box">
                <div class="confirm-msg">${msg}</div>
                <div class="confirm-buttons">
                    <button class="confirm-btn yes" id="_cfYes">${t('yes')}</button>
                    <button class="confirm-btn no" id="_cfNo">${t('no_word')}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => overlay.classList.add('show'));
        });

        const cleanup = (result) => {
            overlay.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => overlay.remove(), 250);
            resolve(result);
        };

        // Lock body scroll
        document.body.style.overflow = 'hidden';

        overlay.querySelector('#_cfYes').onclick = () => cleanup(true);
        overlay.querySelector('#_cfNo').onclick = () => cleanup(false);
        overlay.onclick = (e) => { if (e.target === overlay) cleanup(false); };
    });
}

// ==================== HAPTIC FEEDBACK ====================

export function hapticFeedback(type) {
    // type: 'light', 'medium', 'success'
    try {
        if (navigator.vibrate) {
            if (type === 'light') navigator.vibrate(10);
            else if (type === 'medium') navigator.vibrate(25);
            else if (type === 'success') navigator.vibrate([15, 50, 15]);
            else navigator.vibrate(15);
        }
    } catch(e) {}

    // Also try AudioContext for a subtle click sound
    try {
        if (type === 'success' || type === 'medium') {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = type === 'success' ? 880 : 660;
            gain.gain.value = 0.03; // Very subtle
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.stop(ctx.currentTime + 0.08);
        }
    } catch(e) {}
}

// ==================== PRAYER REMINDER HELPERS ====================

export function scrollToUnmarkedPrayer() {
    // Scroll to the first unmarked prayer section
    var getDataObject = window.getDataObject;
    var getPrayersArray = window.getPrayersArray;
    if (!getDataObject || !getPrayersArray) return;

    const now = new Date();
    const todayDay = now.getDate();
    const dataObj = getDataObject('fard');

    for (const [id, times] of Object.entries(PRAYER_REMINDER_TIMES)) {
        if (now.getHours() >= times.end) {
            const isMarked = dataObj[state.currentMonth][id] && dataObj[state.currentMonth][id][todayDay];
            if (!isMarked) {
                // Find and scroll to this prayer section
                const sections = document.querySelectorAll('#fardTrackerPrayersContainer .prayer-section');
                const prayers = getPrayersArray('fard');
                const idx = prayers.findIndex(p => p.id === id);
                if (idx >= 0 && sections[idx]) {
                    sections[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    sections[idx].style.transition = 'box-shadow 0.3s';
                    sections[idx].style.boxShadow = '0 0 20px rgba(245,158,11,0.5)';
                    setTimeout(() => { sections[idx].style.boxShadow = ''; }, 2000);
                    break;
                }
            }
        }
    }
}

export function dismissReminder() {
    const now = new Date();
    const todayDay = now.getDate();
    // Dismiss all current reminders for today
    for (const id of Object.keys(PRAYER_REMINDER_TIMES)) {
        state.reminderDismissed[`${id}_${todayDay}`] = true;
    }
    hideReminder();
}

function hideReminder() {
    const bar = document.getElementById('prayerReminder');
    if (bar) bar.style.display = 'none';
}

// ==================== MONTH DAYS TOGGLE (29/30) ====================

export function toggleMonthDays() {
    var hYear = state.currentHijriYear;
    var hMonth = state.currentHijriMonth;
    var daysKey = 'salah_hijri_days_' + hYear + '_' + hMonth;

    var currentDays = getHijriDaysInMonth(hYear, hMonth);
    var newDays = currentDays === 30 ? 29 : 30;

    localStorage.setItem(daysKey, String(newDays));

    // Clear day 30 data if switching to 29
    if (newDays === 29) {
        var getStorageKey = window.getStorageKey;
        if (getStorageKey) {
            ['fard', 'sunnah'].forEach(function(type) {
                var key = getStorageKey(type, hMonth, hYear);
                var stored = localStorage.getItem(key);
                if (stored) {
                    var data = JSON.parse(stored);
                    var changed = false;
                    Object.keys(data).forEach(function(prayerId) {
                        if (data[prayerId] && data[prayerId]['30']) {
                            delete data[prayerId]['30'];
                            changed = true;
                        }
                    });
                    if (changed) localStorage.setItem(key, JSON.stringify(data));
                }
            });
        }
    }

    // Refresh views
    clearHijriDay1Cache();
    var updateTrackerView = window.updateTrackerView;
    if (updateTrackerView) {
        updateTrackerView(state.currentSection === 'sunnah' ? 'sunnah' : 'fard');
    }

    var monthName = getHijriMonthName(hMonth - 1);
    showToast(monthName + ' ' + hYear + ': ' + newDays + ' ' + (state.currentLang === 'ar' ? 'يوم' : 'days'), 'success');
}

export function updateMonthDaysButton() {
    var btn = document.getElementById('monthDaysToggleBtn');
    if (!btn) return;
    var days = getHijriDaysInMonth(state.currentHijriYear, state.currentHijriMonth);
    btn.textContent = days;
    btn.style.background = localStorage.getItem('salah_hijri_days_' + state.currentHijriYear + '_' + state.currentHijriMonth)
        ? 'rgba(201,162,39,0.25)' : 'var(--primary-light)';
}

// ==================== HIJRI OVERRIDE DIALOG ====================

export function showHijriOverrideDialog() {
    var hYear = state.currentHijriYear;
    var hMonth = state.currentHijriMonth;
    var key = hYear + '_' + hMonth;
    var overrides = getHijriOverrides();
    var currentOverride = overrides[key] || '';
    var currentDay1 = hijriToGregorianDay1(hYear, hMonth);
    var isoStr = currentDay1.getFullYear() + '-' + String(currentDay1.getMonth()+1).padStart(2,'0') + '-' + String(currentDay1.getDate()).padStart(2,'0');

    // Build overlay
    var overlay = document.createElement('div');
    overlay.id = 'hijriOverrideOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;';

    var monthLabel = getHijriMonthName(hMonth - 1) + ' ' + hYear;

    overlay.innerHTML = `
        <div style="background:var(--bg-card);border-radius:20px;padding:24px;max-width:360px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.2);font-family:'Cairo',sans-serif;direction:rtl;">
            <h3 style="margin:0 0 12px;color:var(--primary-dark);font-size:1.1em;">⚙️ تعديل بداية الشهر الهجري</h3>
            <p style="color:var(--text-muted);font-size:0.85em;margin:0 0 16px;">
                ${state.currentLang === 'ar' ? 'حدد التاريخ الميلادي لأول يوم من' : 'Set the Gregorian date for the 1st of'} <strong>${monthLabel}</strong>
            </p>
            <div style="margin-bottom:16px;">
                <label style="display:block;margin-bottom:6px;font-size:0.85em;color:var(--text-body);">${state.currentLang === 'ar' ? 'أول يوم ميلادي:' : 'First Gregorian day:'}</label>
                <input type="date" id="hijriOverrideDateInput" value="${isoStr}" style="width:100%;padding:10px;border:1px solid var(--accent-border);border-radius:10px;font-size:16px;font-family:'Cairo',sans-serif;box-sizing:border-box;">
            </div>
            ${currentOverride ? '<p style="font-size:0.75em;color:var(--accent-dark);">✏️ ' + (state.currentLang === 'ar' ? 'تم تعديل هذا الشهر مسبقاً' : 'This month has a manual override') + '</p>' : ''}
            <div style="display:flex;gap:8px;margin-top:8px;">
                <button type="button" id="hijriOverrideSaveBtn" style="flex:1;padding:10px;background:var(--primary-dark);color:var(--text-on-dark);border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:'Cairo',sans-serif;">${state.currentLang === 'ar' ? 'حفظ' : 'Save'}</button>
                ${currentOverride ? '<button type="button" id="hijriOverrideResetBtn" style="padding:10px 16px;background:#fee2e2;color:#dc2626;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-family:\'Cairo\',sans-serif;">' + (state.currentLang === 'ar' ? 'إعادة تعيين' : 'Reset') + '</button>' : ''}
                <button type="button" id="hijriOverrideCancelBtn" style="padding:10px 16px;background:#f3f4f6;color:var(--text-body);border:none;border-radius:10px;font-weight:600;cursor:pointer;font-family:'Cairo',sans-serif;">${state.currentLang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('hijriOverrideSaveBtn').onclick = function() {
        var dateVal = document.getElementById('hijriOverrideDateInput').value;
        if (!dateVal) return;
        overrides[key] = dateVal;
        saveHijriOverrides(overrides);
        clearHijriDay1Cache();
        document.body.removeChild(overlay);
        var updateTrackerView = window.updateTrackerView;
        if (updateTrackerView) updateTrackerView(state.currentSection === 'sunnah' ? 'sunnah' : 'fard');
        showToast(state.currentLang === 'ar' ? 'تم تعديل بداية الشهر الهجري ✓' : 'Hijri month start updated ✓', 'success');
    };

    var resetBtn = document.getElementById('hijriOverrideResetBtn');
    if (resetBtn) {
        resetBtn.onclick = function() {
            delete overrides[key];
            saveHijriOverrides(overrides);
            clearHijriDay1Cache();
            document.body.removeChild(overlay);
            var updateTrackerView = window.updateTrackerView;
            if (updateTrackerView) updateTrackerView(state.currentSection === 'sunnah' ? 'sunnah' : 'fard');
            showToast(state.currentLang === 'ar' ? 'تم إعادة التعيين ✓' : 'Reset to default ✓', 'info');
        };
    }

    document.getElementById('hijriOverrideCancelBtn').onclick = function() {
        document.body.removeChild(overlay);
    };

    overlay.onclick = function(e) {
        if (e.target === overlay) document.body.removeChild(overlay);
    };
}

// ==================== SWIPE GESTURE HANDLING ====================

export function initSwipeHandlers() {
    document.addEventListener('touchstart', function(e) {
        state.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        state.touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const diff = state.touchStartX - state.touchEndX;

    // Ignore small movements
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;

    // Don't swipe if user is interacting with inputs/selects
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT' || active.tagName === 'TEXTAREA')) return;

    // Determine which section/view is active
    if (state.currentSection === 'fard' || state.currentSection === 'sunnah') {
        const trackerView = document.getElementById(`${state.currentSection}TrackerView`);
        if (trackerView && trackerView.classList.contains('active')) {
            if (diff > 0) {
                // Swipe left -> next month
                swipeMonth(state.currentSection, 1);
            } else {
                // Swipe right -> prev month
                swipeMonth(state.currentSection, -1);
            }
        }
    } else if (state.currentSection === 'fasting') {
        const volView = document.getElementById('fastingVoluntaryView');
        if (volView && volView.classList.contains('active')) {
            var changeFastingMonth = window.changeFastingMonth;
            if (changeFastingMonth) {
                if (diff > 0) {
                    changeFastingMonth(1);
                    animateSwipe('left');
                } else {
                    changeFastingMonth(-1);
                    animateSwipe('right');
                }
            }
        }
    }
}

function swipeMonth(type, delta) {
    var changeTrackerMonth = window.changeTrackerMonth;
    if (changeTrackerMonth) {
        changeTrackerMonth(type, delta);
        animateSwipe(delta > 0 ? 'left' : 'right');
    }
}

export function animateSwipe(direction) {
    // Find the active prayers container
    const containers = document.querySelectorAll('.prayers-container, #voluntaryFastingGrid');
    containers.forEach(c => {
        if (c.offsetParent !== null) { // visible
            c.classList.remove('swipe-slide-left', 'swipe-slide-right');
            void c.offsetWidth; // force reflow
            c.classList.add(direction === 'left' ? 'swipe-slide-left' : 'swipe-slide-right');
            setTimeout(() => c.classList.remove('swipe-slide-left', 'swipe-slide-right'), 300);
        }
    });
}

// ==================== DAY-BOX CLICK ANIMATION ====================

export function initDayBoxAnimation() {
    document.addEventListener('click', function(e) {
        const dayBox = e.target.closest('.day-box:not(.disabled)');
        if (dayBox) {
            animateDayBox(dayBox);
        }
    });
}

function animateDayBox(element) {
    element.classList.remove('pop', 'ripple');
    void element.offsetWidth; // force reflow
    element.classList.add('pop', 'ripple');
    setTimeout(() => element.classList.remove('pop', 'ripple'), 500);
}

// ==================== iOS SAFARI FIX ====================

export function initIOSSafariFix() {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.addEventListener('touchend', function(e) {
            const target = e.target.closest('[role="button"], .profile-card, .gender-option, .day-box, .month-card, .theme-option, .add-profile-btn, .form-btn');
            if (target && !target.disabled) {
                target.style.cursor = 'pointer';
            }
        }, { passive: true });
    }
}

// ==================== OFFLINE DETECTION ====================

export function initOfflineDetection() {
    function updateOnlineStatus() {
        const bar = document.getElementById('offlineBar');
        if (bar) {
            bar.classList.toggle('show', !navigator.onLine);
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
}

// Expose on window
window.showToast = showToast;
window.showConfirm = showConfirm;
window.hapticFeedback = hapticFeedback;
window.scrollToUnmarkedPrayer = scrollToUnmarkedPrayer;
window.dismissReminder = dismissReminder;
window.toggleMonthDays = toggleMonthDays;
window.updateMonthDaysButton = updateMonthDaysButton;
window.showHijriOverrideDialog = showHijriOverrideDialog;
window.animateSwipe = animateSwipe;
