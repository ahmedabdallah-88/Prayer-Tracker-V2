// ==================== INTERNATIONALIZATION MODULE ====================
// Translation dictionary, language switching, and prayer name helpers

import { state } from './state.js';

const T = {
    // Header
    'app_title': { ar: '🕌 سجل قضاء الصلوات - الفرائض والسنن', en: '🕌 Prayer Tracker - Obligatory & Sunnah' },
    'quran_verse': { ar: 'إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَـٰبًۭا مَّوْقُوتًۭا', en: 'Indeed, prayer has been decreed upon the believers at specified times' },
    'verse_ref': { ar: '[سورة النساء: 103]', en: '[An-Nisa: 103]' },

    // Profile
    'choose_profile': { ar: 'اختر الملف الشخصي أو أنشئ واحداً جديداً', en: 'Choose a profile or create a new one' },
    'add_profile': { ar: '➕ إضافة ملف شخصي جديد', en: '➕ Add New Profile' },
    'name': { ar: 'الاسم', en: 'Name' },
    'age': { ar: 'العمر', en: 'Age' },
    'gender': { ar: 'الجنس', en: 'Gender' },
    'male': { ar: 'ذكر', en: 'Male' },
    'female': { ar: 'أنثى', en: 'Female' },
    'child_m': { ar: 'طفل', en: 'Boy' },
    'child_f': { ar: 'طفلة', en: 'Girl' },
    'save': { ar: '💾 حفظ', en: '💾 Save' },
    'cancel': { ar: 'إلغاء', en: 'Cancel' },
    'switch_profile': { ar: '⇄ تبديل', en: '⇄ Switch' },
    'enter_name': { ar: 'أدخل الاسم...', en: 'Enter name...' },
    'old_data_warning': { ar: '⚠️ تم اكتشاف بيانات قديمة — صدّرها أولاً قبل إنشاء ملف شخصي', en: '⚠️ Old data detected — export it before creating a profile' },
    'export_old': { ar: '💾 تصدير البيانات القديمة', en: '💾 Export Old Data' },
    'import_file': { ar: '📥 استيراد بيانات من ملف', en: '📥 Import Data from File' },
    'years_old': { ar: 'سنة', en: 'yrs' },

    // Main sections
    'fard_prayers': { ar: '🕌 الفرائض', en: '🕌 Obligatory' },
    'sunnah_prayers': { ar: '✨ السنن والرواتب', en: '✨ Sunnah' },
    'fasting_section': { ar: '🌙 الصيام', en: '🌙 Fasting' },

    // Views
    'monthly_tracker': { ar: '📝 المتتبع الشهري', en: '📝 Monthly Tracker' },
    'yearly_view': { ar: '📅 نظرة السنة', en: '📅 Yearly View' },
    'dashboard': { ar: '📊 لوحة التحكم', en: '📊 Dashboard' },

    // Fasting views
    'voluntary_fasting': { ar: '📝 صيام التطوع', en: '📝 Voluntary Fasting' },
    'ramadan_fasting': { ar: '🌙 صيام رمضان', en: '🌙 Ramadan Fasting' },

    // Controls
    'month': { ar: 'الشهر:', en: 'Month:' },
    'year': { ar: 'السنة:', en: 'Year:' },
    'prev_month': { ar: '◄ الشهر السابق', en: '◄ Previous' },
    'next_month': { ar: 'الشهر التالي ►', en: 'Next ►' },

    // Stats
    'total_completed': { ar: 'إجمالي الصلوات المقضية', en: 'Total Prayers Completed' },
    'total_remaining': { ar: 'إجمالي الصلوات المتبقية', en: 'Total Remaining' },
    'completion_rate': { ar: 'نسبة الإنجاز', en: 'Completion Rate' },
    'sunnah_completed': { ar: 'إجمالي السنن المؤداة', en: 'Total Sunnah Completed' },
    'sunnah_remaining': { ar: 'إجمالي السنن المتبقية', en: 'Total Remaining' },

    // Dashboard
    'yearly_rate': { ar: 'نسبة الإنجاز السنوية', en: 'Yearly Completion' },
    'best_month': { ar: 'أفضل شهر', en: 'Best Month' },
    'best_prayer': { ar: 'الصلاة الأكثر انتظاماً', en: 'Most Consistent Prayer' },
    'commitment_rate': { ar: 'معدل الالتزام', en: 'Commitment Rate' },
    'of_total': { ar: 'من أصل', en: 'out of' },
    'prayers_word': { ar: 'صلاة', en: 'prayers' },
    'monthly_progress': { ar: '📈 التقدم الشهري', en: '📈 Monthly Progress' },
    'by_type': { ar: '📊 السنن حسب النوع', en: '📊 Sunnah by Type' },
    'fard_by_type': { ar: '🕌 صلاة الجماعة حسب النوع', en: '🕌 Congregation by Prayer Type' },
    'completion_pie': { ar: '🎯 نسبة الإنجاز', en: '🎯 Completion Rate' },
    'comparison': { ar: '📉 مقارنة الصلوات', en: '📉 Prayer Comparison' },

    // Streaks
    'fard_streaks': { ar: '🔥 سلاسل المواظبة على صلاة الجماعة', en: '🔥 Congregation Prayer Streaks' },
    'sunnah_streaks': { ar: '🔥 سلاسل المواظبة على السنن', en: '🔥 Sunnah Prayer Streaks' },
    'consecutive_days': { ar: 'يوم متتالي', en: 'consecutive days' },
    'best_streak': { ar: '🏆 أفضل سلسلة:', en: '🏆 Best streak:' },
    'days_word': { ar: 'يوم', en: 'days' },

    // Actions
    'clear_month': { ar: '🔄 مسح بيانات الشهر', en: '🔄 Clear Month Data' },
    'print': { ar: '🖨️ طباعة', en: '🖨️ Print' },
    'export_data': { ar: '💾 تصدير البيانات', en: '💾 Export Data' },
    'import_data': { ar: '📥 استيراد البيانات', en: '📥 Import Data' },
    'back_to_year': { ar: '← العودة للسنة', en: '← Back to Year' },

    // Female features
    'exempt_mode': { ar: 'وضع تحديد الإعفاء (حيض/نفاس) — لكل صلاة على حدة', en: 'Exemption mode (menstruation) — per prayer' },
    'period_history': { ar: '🩸 سجل الدورة الشهرية', en: '🩸 Period History' },
    'exempt_prayers': { ar: 'صلوات معفاة:', en: 'Exempt prayers:' },
    'affected_days': { ar: 'أيام متأثرة:', en: 'Affected days:' },

    // Fasting
    'fasted': { ar: 'صامت ✓', en: 'Fasted ✓' },
    'period_mark': { ar: 'حيض 🩸', en: 'Period 🩸' },
    'broke_fast': { ar: 'أفطرت ✗', en: 'Missed ✗' },
    'not_set': { ar: 'لم يُحدد', en: 'Not set' },
    'fasting_days': { ar: 'أيام الصيام', en: 'Fasting Days' },
    'period_days': { ar: 'أيام الحيض', en: 'Period Days' },
    'missed_days': { ar: 'أيام الإفطار', en: 'Missed Days' },
    'owed_days': { ar: 'أيام للقضاء', en: 'Days Owed' },
    'ramadan_days': { ar: 'أيام رمضان', en: 'Ramadan Days' },
    'vol_fasting_title': { ar: 'صيام التطوع', en: 'Voluntary Fasting' },
    'fasting_exempt_mode': { ar: 'وضع تحديد أيام الحيض', en: 'Period marking mode' },
    'exempt_days': { ar: 'أيام الإعفاء', en: 'Exempt Days' },
    'fasting_rate': { ar: 'نسبة الصيام', en: 'Fasting Rate' },
    'clear_fasting': { ar: '🔄 مسح بيانات الصيام', en: '🔄 Clear Fasting Data' },

    // Fasting dashboard
    'vol_total': { ar: 'إجمالي أيام صيام التطوع', en: 'Total Voluntary Fasting Days' },
    'best_fasting_month': { ar: 'أفضل شهر صيام', en: 'Best Fasting Month' },
    'ramadan_stats': { ar: 'صيام رمضان', en: 'Ramadan Fasting' },
    'monthly_avg': { ar: 'معدل الصيام الشهري', en: 'Monthly Average' },
    'day_per_month': { ar: 'يوم/شهر', en: 'days/month' },
    'during_year': { ar: 'خلال السنة', en: 'During the year' },
    'vol_monthly_chart': { ar: '📈 صيام التطوع الشهري', en: '📈 Monthly Voluntary Fasting' },

    // Themes
    'green_gold': { ar: 'أخضر وذهبي', en: 'Green & Gold' },
    'navy_silver': { ar: 'كحلي وفضي', en: 'Navy & Silver' },
    'purple_gold': { ar: 'بنفسجي وذهبي', en: 'Purple & Gold' },
    'pink': { ar: 'وردي 🌸', en: 'Pink 🌸' },
    'sky_blue': { ar: 'أزرق سماوي', en: 'Sky Blue' },
    'dark_mode': { ar: 'دارك مود', en: 'Dark Mode' },
    'olive_cream': { ar: 'زيتوني', en: 'Olive' },

    // Months (Hijri)
    'months': {
        ar: ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],
        en: ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Thani','Rajab','Sha\'ban','Ramadan','Shawwal','Dhul Qi\'dah','Dhul Hijjah']
    },
    'hijri_year': { ar: 'السنة الهجرية:', en: 'Hijri Year:' },
    'hijri_month': { ar: 'الشهر الهجري:', en: 'Hijri Month:' },
    'hijri_override': { ar: 'تعديل بداية الشهر', en: 'Adjust month start' },
    'prayer_times': { ar: 'مواقيت الصلاة', en: 'Prayer Times' },
    'notif_enabled': { ar: 'التنبيهات مفعّلة', en: 'Notifications enabled' },
    'notif_disabled': { ar: 'التنبيهات متوقفة', en: 'Notifications disabled' },
    'qada_report': { ar: 'تقرير صلوات القضاء', en: 'Qada Prayers Report' },
    'total_qada': { ar: 'إجمالي صلوات القضاء', en: 'Total Qada Prayers' },
    'most_qada_prayer': { ar: 'أكثر صلاة قضاءً', en: 'Most Qada Prayer' },
    'worst_month': { ar: 'أسوأ شهر', en: 'Worst Month' },

    // Prayer names
    'prayer_fajr': { ar: 'الفجر', en: 'Fajr' },
    'prayer_dhuhr': { ar: 'الظهر', en: 'Dhuhr' },
    'prayer_asr': { ar: 'العصر', en: 'Asr' },
    'prayer_maghrib': { ar: 'المغرب', en: 'Maghrib' },
    'prayer_isha': { ar: 'العشاء', en: 'Isha' },
    'prayer_tahajjud': { ar: 'التهجد', en: 'Tahajjud' },
    'prayer_sunnah_fajr': { ar: 'سنة الفجر', en: 'Fajr Sunnah' },
    'prayer_duha': { ar: 'الضحى', en: 'Duha' },
    'prayer_sunnah_dhuhr': { ar: 'سنة الظهر', en: 'Dhuhr Sunnah' },
    'prayer_sunnah_asr': { ar: 'سنة العصر', en: 'Asr Sunnah' },
    'prayer_sunnah_maghrib': { ar: 'سنة المغرب', en: 'Maghrib Sunnah' },
    'prayer_sunnah_isha': { ar: 'سنة العشاء', en: 'Isha Sunnah' },
    'prayer_witr': { ar: 'الوتر', en: 'Witr' },

    'day_names': {
        ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    // Misc
    'completed_word': { ar: 'مقضية', en: 'Completed' },
    'remaining_word': { ar: 'متبقية', en: 'Remaining' },
    'performed': { ar: 'مؤداة', en: 'Performed' },
    'confirm_clear': { ar: 'هل أنت متأكد من مسح جميع البيانات لهذا الشهر؟', en: 'Are you sure you want to clear all data for this month?' },
    'confirm_delete_profile': { ar: 'هل أنت متأكد من حذف هذا الملف الشخصي وجميع بياناته؟', en: 'Are you sure you want to delete this profile and all its data?' },
    'enter_valid_name': { ar: 'الرجاء إدخال الاسم', en: 'Please enter a name' },
    'enter_valid_age': { ar: 'الرجاء إدخال عمر صحيح', en: 'Please enter a valid age' },
    'select_gender': { ar: 'الرجاء اختيار الجنس', en: 'Please select a gender' },
    'no_data': { ar: 'لا توجد بيانات للتصدير', en: 'No data to export' },
    'import_success': { ar: 'تم استيراد البيانات بنجاح!', en: 'Data imported successfully!' },
    'import_replace': { ar: 'سيتم استبدال بيانات المستخدم الحالي. هل تريد المتابعة؟', en: 'Current user data will be replaced. Continue?' },
    'congregation_mode': { ar: 'وضع تحديد صلاة الجماعة', en: 'Congregation mode' },
    'congregation': { ar: 'جماعة', en: 'Congregation' },
    'individual': { ar: 'منفرد', en: 'Individual' },
    'cong_rate': { ar: 'نسبة صلاة الجماعة', en: 'Congregation Rate' },
    'weekly_pattern': { ar: '🕌 نمط صلاة الجماعة الأسبوعي', en: '🕌 Weekly Congregation Pattern' },
    'prayer_heatmap': { ar: '🕌 خريطة الالتزام بصلاة الجماعة', en: '🕌 Congregation Commitment Heatmap' },
    'cong_chart_title': { ar: '🕌 صلاة الجماعة الشهرية', en: '🕌 Monthly Congregation Rate' },

    'select_profile_first': { ar: 'الرجاء اختيار ملف شخصي أولاً', en: 'Please select a profile first' },
    'export_success': { ar: 'تم تصدير البيانات بنجاح!', en: 'Data exported successfully!' },
    'pending_import_saved': { ar: 'تم حفظ البيانات. أنشئ ملفاً شخصياً لربطها.', en: 'Data saved. Create a profile to link it.' },
    'file_error': { ar: 'خطأ في قراءة الملف', en: 'Error reading file' },
    'confirm_clear_fasting': { ar: 'هل أنت متأكد من مسح بيانات الصيام؟', en: 'Are you sure you want to clear fasting data?' },
    'not_logged_yet': { ar: 'لم تُسجّل بعد:', en: 'Not yet logged:' },
    'app_title_short': { ar: 'متتبع الصلاة', en: 'Prayer Tracker' },
    'fard_short': { ar: 'الفرائض', en: 'Fard' },
    'sunnah_short': { ar: 'السنن', en: 'Sunnah' },
    'fasting_short': { ar: 'الصيام', en: 'Fasting' },
    'dashboard_short': { ar: 'لوحة التحكم', en: 'Dashboard' },
    'fiori_theme': { ar: 'كوارتز', en: 'Quartz' },
    'skip_to_content': { ar: 'تخطي إلى المحتوى', en: 'Skip to content' },
    'offline_msg': { ar: '⚡ أنت غير متصل — التطبيق يعمل بدون اتصال', en: '⚡ You are offline — app works without connection' },
    'swipe_hint': { ar: '⟵ اسحب للتنقل بين الأشهر ⟶', en: '⟵ Swipe to navigate months ⟶' },
    'ready_to_track': { ar: 'جاهز لتتبع هذا الشهر!', en: 'Ready to track this month!' },
    'select_all_day': { ar: 'تحديد اليوم', en: 'Select Day' },
    'mark_all': { ar: 'تحديد الكل', en: 'Mark All' },
    'yes': { ar: 'نعم', en: 'Yes' },
    'no_word': { ar: 'لا', en: 'No' },
    'duplicate_name': { ar: 'هذا الاسم مستخدم بالفعل', en: 'This name is already taken' },
    'profile_limit': { ar: 'الحد الأقصى ١٠ ملفات شخصية', en: 'Maximum 10 profiles allowed' },
    'storage_full': { ar: 'مساحة التخزين ممتلئة! صدّر بياناتك.', en: 'Storage full! Export your data.' },
    'qada_prayer': { ar: 'قضاء', en: 'Qada' },
    'prayed_alone': { ar: 'منفرد', en: 'Alone' },
    'click_hint': { ar: 'ضغطة=منفرد ، ضغطتين=جماعة ، ٣=قضاء', en: 'Tap=alone, 2=congregation, 3=qada' },
    'annual_consistency': { ar: 'نسبة الالتزام السنوية', en: 'Annual Consistency' },
    'total_prayers_word': { ar: 'إجمالي الصلوات', en: 'Total Prayers' },
    'future_date_short': { ar: 'لا يمكن التعليم في المستقبل', en: 'Cannot mark future dates' },
    'exempt_linked_prayer': { ar: 'أيام الإعفاء مربوطة ببيانات الصلاة', en: 'Exempt days linked to prayer data' },
    'click_remove_exempt': { ar: 'اضغط لإلغاء الإعفاء', en: 'Click to remove exemption' },
    'click_mark_exempt': { ar: 'اضغط لتحديد كإعفاء', en: 'Click to mark as exempt' },
    'future_date': { ar: '⚠️ لا يمكن تعليم صلاة في تاريخ مستقبلي!\nيمكنك فقط تعليم الصلوات حتى تاريخ اليوم.', en: '⚠️ Cannot mark a prayer on a future date!\nYou can only mark prayers up to today.' },
    'chart_percentage': { ar: 'نسبة الإنجاز %', en: 'Completion %' },
    'chart_prayers_count': { ar: 'عدد الصلوات', en: 'Prayer Count' },
    'chart_sunnah_count': { ar: 'عدد السنن', en: 'Sunnah Count' },
    'chart_completed_label': { ar: 'مقضية', en: 'Completed' },
    'chart_remaining_label': { ar: 'متبقية', en: 'Remaining' },
    'chart_sunnah_performed': { ar: 'مؤداة', en: 'Performed' },
    'fasting_days_chart': { ar: 'أيام الصيام', en: 'Fasting Days' },
    'no_period_data': { ar: 'حددي أيام الإعفاء من المتتبع الشهري لتظهر هنا', en: 'Mark exempt days in the monthly tracker to see them here' },
};

/**
 * Look up a translation key for the current language.
 * Falls back to Arabic, then returns the key itself.
 */
export function t(key) {
    if (T[key]) return T[key][state.currentLang] || T[key]['ar'];
    return key;
}

/**
 * Get a Hijri month name by 0-based index for the current language.
 */
export function getMonthName(index) {
    return T['months'][state.currentLang][index];
}

/**
 * Get the full array of Hijri month names for the current language.
 */
export function getMonthNames() {
    return T['months'][state.currentLang];
}

/**
 * Get a prayer's display name using its ID (e.g. 'fajr' -> 'Fajr' or 'الفجر').
 */
export function getPrayerName(id) {
    var map = {
        'fajr': 'prayer_fajr', 'dhuhr': 'prayer_dhuhr', 'asr': 'prayer_asr',
        'maghrib': 'prayer_maghrib', 'isha': 'prayer_isha',
        'tahajjud': 'prayer_tahajjud', 'sunnah-fajr': 'prayer_sunnah_fajr',
        'duha': 'prayer_duha', 'sunnah-dhuhr': 'prayer_sunnah_dhuhr',
        'sunnah-asr': 'prayer_sunnah_asr', 'sunnah-maghrib': 'prayer_sunnah_maghrib',
        'sunnah-isha': 'prayer_sunnah_isha', 'witr': 'prayer_witr'
    };
    return map[id] ? t(map[id]) : id;
}

/**
 * Toggle between Arabic and English, persist to localStorage, then re-apply.
 */
export function toggleLang() {
    state.currentLang = state.currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('salah_lang', state.currentLang);
    applyLang();
}

/**
 * Apply the current language to the entire page:
 *  - direction (RTL/LTR)
 *  - all [data-t] elements
 *  - month select options
 *  - monthNames array used by charts
 *  - re-renders the active view
 */
export function applyLang() {
    var currentLang = state.currentLang;
    var isAr = currentLang === 'ar';

    // Direction
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', currentLang);
    document.body.style.direction = isAr ? 'rtl' : 'ltr';

    // Button text
    var langBtn = document.getElementById('langBtn');
    if (langBtn) {
        langBtn.textContent = isAr ? 'EN' : 'عر';
        langBtn.title = isAr ? 'Switch to English' : 'التبديل للعربية';
    }

    // Apply all translations to elements with data-t attribute
    document.querySelectorAll('[data-t]').forEach(function(el) {
        var key = el.getAttribute('data-t');
        if (T[key]) {
            if (el.tagName === 'INPUT' && el.type !== 'number') {
                el.placeholder = T[key][currentLang];
            } else {
                el.textContent = T[key][currentLang];
            }
        }
    });

    // Update month selects with Hijri months
    document.querySelectorAll('select[id*="MonthSelect"], #fastingMonthSelect').forEach(function(select) {
        var months = getMonthNames();
        Array.from(select.options).forEach(function(opt, i) {
            opt.textContent = months[i];
        });
    });

    // Update monthNames array used by charts (now Hijri)
    var monthNamesArr = window.monthNames;
    if (monthNamesArr) {
        monthNamesArr.length = 0;
        getMonthNames().forEach(function(m) { monthNamesArr.push(m); });
    }

    // Update Hijri month name arrays for current language
    if (typeof window.hijriMonthNamesAr !== 'undefined') {
        window.hijriMonthNamesAr = ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
        window.hijriMonthNamesEn = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Thani','Rajab','Sha\'ban','Ramadan','Shawwal','Dhul Qi\'dah','Dhul Hijjah'];
    }

    // Re-render current view if loaded
    try {
        if (state.activeProfile) {
            var currentSection = state.currentSection;
            if (currentSection === 'fard' || currentSection === 'sunnah') {
                var trackerActive = document.getElementById(currentSection + 'TrackerView');
                var dashActive = document.getElementById(currentSection + 'DashboardView');
                var yearlyActive = document.getElementById(currentSection + 'YearlyView');

                if (trackerActive && trackerActive.classList.contains('active')) {
                    if (typeof window.renderTrackerMonth === 'function') window.renderTrackerMonth(currentSection);
                    if (typeof window.updateTrackerStats === 'function') window.updateTrackerStats(currentSection);
                    if (currentSection === 'fard' && typeof window.updateCongregationStats === 'function') window.updateCongregationStats();
                }
                if (dashActive && dashActive.classList.contains('active')) {
                    if (typeof window.updateDashboard === 'function') window.updateDashboard(currentSection);
                }
                if (yearlyActive && yearlyActive.classList.contains('active')) {
                    if (typeof window.updateYearlyView === 'function') window.updateYearlyView(currentSection);
                }
                if (typeof window.renderStreaks === 'function') window.renderStreaks(currentSection);
            } else if (currentSection === 'fasting') {
                var volView = document.getElementById('fastingVoluntaryView');
                if (volView && volView.classList.contains('active') && typeof window.updateVoluntaryFasting === 'function') window.updateVoluntaryFasting();
                var dashView = document.getElementById('fastingDashboardView');
                if (dashView && dashView.classList.contains('active') && typeof window.updateFastingDashboard === 'function') window.updateFastingDashboard();
            }
        }
    } catch(e) { console.log('Lang re-render:', e); }
    if (typeof window.updateShellBar === 'function') window.updateShellBar();
}

// Expose the translations dictionary for direct access if needed
export { T };

// Expose on window for inline onclick handlers
window.t = t;
window.T = T;
window.getMonthName = getMonthName;
window.getMonthNames = getMonthNames;
window.getPrayerName = getPrayerName;
window.toggleLang = toggleLang;
window.applyLang = applyLang;
