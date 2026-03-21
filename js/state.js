// ==================== CENTRAL STATE MODULE ====================
// Shared application state that all modules import from

export const state = {
    currentYear: null,
    currentMonth: null,
    currentSection: 'fard',
    currentHijriYear: null,
    currentHijriMonth: null,
    fardData: {},
    sunnahData: {},
    charts: { fard: {}, sunnah: {}, fasting: null, fardCong: null, fardWeekly: null, fardHeatmap: null, fardQada: null },
    activeProfile: null,
    exemptMode: { fard: false, sunnah: false },
    selectedGender: '',
    congregationMode: false,
    currentLang: localStorage.getItem('salah_lang') || 'ar',
    // Prayer times state
    prayerTimesData: null,
    prayerTimesDate: '',
    notificationsEnabled: localStorage.getItem('salah_notif_enabled') === 'true',
    userLocation: null,
    notifSentToday: {},
    prayerTimesCheckInterval: null,
    // Reminder state
    reminderDismissed: {},
    // Swipe state
    touchStartX: 0,
    touchEndX: 0,
    // Weekly view state
    trackerViewMode: 'month',
    currentWeekStart: 0,
    // Fasting state
    fastingExemptModeOn: false,
    fastingMonth: null,
    fastingYear: null,
    // PWA install prompt
    deferredPrompt: null
};

export const SWIPE_THRESHOLD = 60;

export const fardPrayers = [
    { id: 'fajr', name: 'الفجر', icon: '🌙', class: 'fajr', color: '#2c5aa0' },
    { id: 'dhuhr', name: 'الظهر', icon: '☀️', class: 'dhuhr', color: '#d4af37' },
    { id: 'asr', name: 'العصر', icon: '🕌', class: 'asr', color: '#2d7a4f' },
    { id: 'maghrib', name: 'المغرب', icon: '🌅', class: 'maghrib', color: '#c44536' },
    { id: 'isha', name: 'العشاء', icon: '⭐', class: 'isha', color: '#4a3674' }
];

export const sunnahPrayers = [
    { id: 'tahajjud', name: 'التهجد', icon: '🌃', class: 'tahajjud', color: '#1e3a8a' },
    { id: 'sunnah-fajr', name: 'سنة الفجر', icon: '🌙', class: 'sunnah-fajr', color: '#4169e1' },
    { id: 'duha', name: 'الضحى', icon: '🌤️', class: 'duha', color: '#f59e0b' },
    { id: 'sunnah-dhuhr', name: 'سنة الظهر', icon: '☀️', class: 'sunnah-dhuhr', color: '#fbbf24' },
    { id: 'sunnah-asr', name: 'سنة العصر', icon: '🕌', class: 'sunnah-asr', color: '#10b981' },
    { id: 'sunnah-maghrib', name: 'سنة المغرب', icon: '🌅', class: 'sunnah-maghrib', color: '#f97316' },
    { id: 'sunnah-isha', name: 'سنة العشاء', icon: '⭐', class: 'sunnah-isha', color: '#9333ea' },
    { id: 'witr', name: 'الوتر', icon: '🌟', class: 'witr', color: '#8b4789' }
];

export const monthNames = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

export const PRAYER_REMINDER_TIMES = {
    'fajr':    { start: 4, end: 7, name_key: 'prayer_fajr' },
    'dhuhr':   { start: 12, end: 14, name_key: 'prayer_dhuhr' },
    'asr':     { start: 15, end: 17, name_key: 'prayer_asr' },
    'maghrib': { start: 18, end: 20, name_key: 'prayer_maghrib' },
    'isha':    { start: 21, end: 23, name_key: 'prayer_isha' }
};

// Prayer ID to Aladhan mapping
export const PRAYER_API_MAP = {
    'Fajr': 'fajr',
    'Dhuhr': 'dhuhr',
    'Asr': 'asr',
    'Maghrib': 'maghrib',
    'Isha': 'isha'
};
