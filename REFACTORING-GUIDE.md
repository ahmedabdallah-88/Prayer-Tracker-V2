# Prayer Tracker PWA — Complete Refactoring Guide for Claude Code

## Context

I have a Prayer Tracker Progressive Web App (متتبع الصلاة) currently deployed on GitHub Pages.
The original production repo (`prayer-tracker`) must NOT be touched. All work happens in this mirror repo (`prayer-tracker-v2`). The original repo stays as-is until I manually decide to replace it.

The entire app lives in a single `index.html` file — **~9,500 lines (~365KB)** containing all HTML, CSS, and JavaScript inline. It has **194 functions**, **103 localStorage calls**, **9 Chart.js instances**, and **9 monkey-patched function overrides**. It works perfectly but has become very hard to maintain and extend.

**Tech stack:** Vanilla JS, CSS, Chart.js (CDN), Google Fonts (Cairo + Amiri), localStorage for data, PWA with service worker + manifest.

**Deployment:** GitHub Pages (static files, no build step).

---

## Goal

Refactor the monolithic `index.html` into a clean, modular file structure while:

1. **Preserving ALL existing functionality** — nothing should break
2. **Keeping it a static PWA** — no frameworks, no build tools
3. **Maintaining offline capability** — service worker must cache all new files + preserve notification handlers + background sync
4. **Keeping localStorage data intact** — all keys must continue to work with exact same format (see Key Map below)
5. **Keeping RTL/Arabic support** working perfectly
6. **Preserving Hijri calendar engine** — all date conversions, overrides, 29/30 toggles, remapping logic

---

## ⚠️ CRITICAL: Monkey-Patching Pattern

The current code defines base functions, then REDEFINES them later with enhanced versions using `_orig*` references. During refactoring, these **MUST be merged into single clean implementations**. Do NOT preserve the monkey-patching pattern:

| Override Variable | Original Function | What the override adds |
|---|---|---|
| `_originalGetStorageKey` | `getStorageKey` | Profile-scoped key prefixes |
| `_origSwitchSection` | `switchSection` | Fiori shell bar update |
| `_origRenderTrackerMonth` | `renderTrackerMonth` | Exempt mode, dual calendar, qada state, congregation state, weekly view |
| `_origUpdateTrackerStats` | `updateTrackerStats` | Female exempt day adjustment |
| `_origExportData` | `exportData` | Profile metadata, theme, all key patterns |
| `_origInit` | `init` | Profile system loading, Gregorian→Hijri migration |
| `_origApplyProfileUI` | `applyProfileUI` | Fiori shell bar profile display |
| `_origSwitchView` | `switchView` | Sub-tabs UI update |
| `_origSwitchFastingViewFiori` | `switchFastingView` | Sub-tabs UI update |

**How to handle:** Read BOTH the original and override versions, understand what each adds, then write ONE merged function that does everything.

---

## Complete localStorage Key Map

Every key pattern below MUST remain exactly the same — existing users have data stored with these patterns:

| Key Pattern | Used By | Description |
|------------|---------|-------------|
| `salah_tracker_{pid}_{type}_h{year}_{month}` | storage | Fard/Sunnah prayer data |
| `salah_cong_{pid}_h{year}_{month}` | storage | Congregation data |
| `salah_qada_{pid}_h{year}_{month}` | storage | Qada (makeup) data |
| `salah_exempt_{pid}_h{year}_{month}` | female | Exemption data (per-prayer per-day) |
| `salah_fasting_{pid}_h{year}` | fasting | Ramadan fasting data |
| `salah_vol_fasting_{pid}_h{year}_{month}` | fasting | Voluntary fasting data |
| `salah_periods_{pid}h{year}` | female | Period history |
| `salah_hijri_overrides` | hijri | Hijri month start date overrides |
| `salah_hijri_days_{year}_{month}` | hijri | 29/30 day count override per month |
| `salah_profiles` | profiles | Array of profile objects |
| `salah_active_profile` | profiles | Currently active profile ID |
| `salah_tracker_theme` | themes | Selected theme name |
| `salah_lang` | i18n | Language ('ar' / 'en') |
| `salah_location_cache` | prayer-times | GPS coordinates + timestamp (7-day cache) |
| `salah_city_name` | prayer-times | Reverse geocoded city name + coords |
| `salah_prayer_times_{date}` | prayer-times | Cached prayer times for a date |
| `salah_notif_enabled` | notifications | Notification toggle state |
| `pwa_install_dismissed` | ui-utils | Install banner dismissed state |

---

## Target File Structure

```
prayer-tracker-v2/
├── index.html                  # Slim shell (~80 lines): meta, fonts, CSS links, root divs, script tags
├── css/
│   ├── main.css               # Layout, typography, RTL, responsive, base components
│   ├── themes.css             # All 7 theme definitions (CSS custom properties)
│   └── dashboard.css          # Dashboard, charts, stats styling
├── js/
│   ├── config.js              # Constants + translations
│   ├── storage.js             # localStorage wrapper + key generation
│   ├── hijri-calendar.js      # Hijri engine (conversions, overrides, 29/30)
│   ├── ui-utils.js            # Toast, confirm, swipe, haptic, animations, install banner
│   ├── i18n.js                # Language switching
│   ├── themes.js              # Theme switching
│   ├── profiles.js            # Profile CRUD + switching
│   ├── female-features.js     # Exemptions, adjusted stats, period history
│   ├── fard-tracker.js        # Fard grid, 4-state cycle, Mark All, weekly/monthly
│   ├── sunnah-tracker.js      # Sunnah grid, 3-state cycle
│   ├── jamaah-tracker.js      # Congregation mode, streaks
│   ├── fasting-tracker.js     # Voluntary + Ramadan fasting
│   ├── prayer-times.js        # GPS, Aladhan API, prayer times bar, countdown
│   ├── notifications.js       # Permission flow, before/after notifications, SW scheduling
│   ├── qada-report.js         # Qada summary report
│   ├── dashboard.js           # Stats cards, 9 Chart.js charts
│   ├── year-overview.js       # 12 monthly cards, drill-down
│   ├── weekly-view.js         # Weekly view mode (7-day display)
│   ├── data-io.js             # Export/import JSON, migration
│   └── app.js                 # Init, routing, section switching, SW registration
├── manifest.json              # Keep as-is
├── service-worker.js          # UPDATE: new cache list + preserve notification handlers
└── icons/                     # Keep as-is
```

---

## Module Communication Pattern

Use global namespace (NOT ES modules — simpler for PWA/service worker):

```javascript
// Each module attaches to window.App
window.App = window.App || {};
window.App.Storage = { getData, setData, ... };
window.App.Hijri = { gregorianToHijri, getHijriDaysInMonth, ... };
window.App.Profiles = { create, switch, delete, ... };
// etc.
```

### Script Loading Order (dependency-aware):

```html
<script src="js/config.js"></script>
<script src="js/storage.js"></script>
<script src="js/hijri-calendar.js"></script>   <!-- Before trackers — they depend on Hijri -->
<script src="js/ui-utils.js"></script>
<script src="js/i18n.js"></script>
<script src="js/themes.js"></script>
<script src="js/profiles.js"></script>
<script src="js/female-features.js"></script>   <!-- Before trackers — they check exemptions -->
<script src="js/fard-tracker.js"></script>
<script src="js/sunnah-tracker.js"></script>
<script src="js/jamaah-tracker.js"></script>
<script src="js/weekly-view.js"></script>
<script src="js/fasting-tracker.js"></script>
<script src="js/prayer-times.js"></script>
<script src="js/notifications.js"></script>
<script src="js/qada-report.js"></script>
<script src="js/dashboard.js"></script>
<script src="js/year-overview.js"></script>
<script src="js/data-io.js"></script>
<script src="js/app.js"></script>               <!-- Last: initializes everything -->
```

---

## Refactoring Plan — 3 Milestones

**You only test 3 times.** Claude Code handles all internal steps on its own — extracting files one by one, verifying no syntax errors after each file, and only asking you to test at each milestone.

**INSTRUCTION FOR CLAUDE CODE:** Work through each milestone by extracting one JS/CSS file at a time internally. After creating each file, run a quick syntax check (`node --check js/filename.js`). Do NOT ask the user to test until you reach a milestone boundary. When you hit a milestone, tell the user "Milestone X complete — please test now" and list what to verify.

---

### 🟢 MILESTONE 1: Extract all CSS + foundation JS modules

**What Claude Code does (internally, no user testing between steps):**

1. Create `css/main.css` — extract ALL `<style>` content
2. Separate theme CSS variables into `css/themes.css`
3. Extract dashboard styles into `css/dashboard.css`
4. Replace `<style>` blocks with `<link>` tags in index.html
5. Create `js/config.js` — extract constants + translations (see Module Reference below)
6. Create `js/storage.js` — extract localStorage operations + key generation (merge `_originalGetStorageKey`)
7. Create `js/hijri-calendar.js` — extract entire Hijri engine (see Module Reference)
8. Create `js/ui-utils.js` — toasts, confirm, swipe, haptic, animations, install banner
9. Create `js/i18n.js` — language switching
10. Create `js/themes.js` — theme switching
11. Create `js/profiles.js` — profile CRUD (merge `_origApplyProfileUI`)
12. Create `js/female-features.js` — exemptions, period history
13. Update `index.html` — replace extracted code with `<script>` tags
14. Verify: `node --check` on every JS file, open in browser to confirm no errors

**User tests at Milestone 1:**
- App opens correctly
- Can switch between Arabic/English
- Can switch themes
- Profiles work (create, switch, delete)
- Hijri dates display correctly
- Month navigation works

---

### 🟡 MILESTONE 2: Extract all feature + view modules

**What Claude Code does internally:**

15. Create `js/fard-tracker.js` — fard grid, 4-state cycle, Mark All, section/view switching (merge `_origRenderTrackerMonth`, `_origUpdateTrackerStats`, `_origSwitchSection`, `_origSwitchView`)
16. Create `js/sunnah-tracker.js` — sunnah grid, 3-state cycle (shared functions with fard)
17. Create `js/jamaah-tracker.js` — congregation mode, streak calculation
18. Create `js/weekly-view.js` — weekly view mode
19. Create `js/fasting-tracker.js` — voluntary + Ramadan (merge `_origSwitchFastingViewFiori`)
20. Create `js/prayer-times.js` — GPS, Aladhan API, prayer bar, countdown
21. Create `js/notifications.js` — permission, before/after notifications, SW scheduling
22. Create `js/qada-report.js` — qada summary
23. Create `js/dashboard.js` — stats, 9 Chart.js charts
24. Create `js/year-overview.js` — 12 monthly cards, drill-down
25. Create `js/data-io.js` — export/import, migration (merge `_origExportData`)
26. Create `js/app.js` — init, routing, SW registration (merge `_origInit`)
27. Slim `index.html` to shell only (~80 lines of HTML + script tags)
28. Verify all JS files, open in browser

**User tests at Milestone 2:**
- All prayer tracking works (fard + sunnah)
- Click cycle: empty → prayed → congregation → qada → empty
- Weekly view toggle
- Fasting (voluntary + Ramadan)
- Dashboard with all charts
- Year overview with drill-down
- Streaks display
- Qada report
- Export/import data
- Swipe navigation
- Prayer times bar + notifications
- Female exempt features

---

### 🔴 MILESTONE 3: Update Service Worker + final verification

**What Claude Code does internally:**

29. Update `service-worker.js`:
    - Bump cache version (e.g., `salah-tracker-v40`)
    - Add ALL new CSS/JS files to `urlsToCache`:
      ```
      './', './index.html', './manifest.json',
      './css/main.css', './css/themes.css', './css/dashboard.css',
      './js/config.js', './js/storage.js', './js/hijri-calendar.js',
      './js/ui-utils.js', './js/i18n.js', './js/themes.js',
      './js/profiles.js', './js/female-features.js',
      './js/fard-tracker.js', './js/sunnah-tracker.js',
      './js/jamaah-tracker.js', './js/weekly-view.js',
      './js/fasting-tracker.js', './js/prayer-times.js',
      './js/notifications.js', './js/qada-report.js',
      './js/dashboard.js', './js/year-overview.js',
      './js/data-io.js', './js/app.js',
      './icons/icon-72x72.png', './icons/icon-192x192.png',
      './icons/icon-512x512.png', './icons/maskable-512x512.png',
      'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
      'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&display=swap'
      ```
    - **PRESERVE** notification handlers: `message`, `notificationclick`, `periodicsync` events
    - Network-first for Aladhan + Nominatim API calls
    - Cache-first for static assets
    - `self.skipWaiting()` + `self.clients.claim()`
30. Final syntax check on all files
31. Verify complete file structure matches target

**User tests at Milestone 3:**
- Test locally by opening index.html in browser
- Optionally enable GitHub Pages on prayer-tracker-v2 to test as PWA
- Install as PWA on Android (from v2 URL)
- Test offline mode (airplane mode)
- Verify old data loads after clearing cache
- Test notifications
- **Do NOT touch the original prayer-tracker repo**

---

## Module Reference — Functions per File

**The milestones above tell Claude Code WHEN to extract each module. This section tells it WHAT goes in each module.**

---

### js/config.js — Constants + Translations

| What to extract | Details |
|---|---|
| `fardPrayers[]` | 5 objects: `{id, name, nameEn, icon, color, cssClass}` |
| `sunnahPrayers[]` | 8 objects: same structure |
| `monthNames[]` | Gregorian month names (Arabic) |
| `hijriMonthNamesAr[]` | 12 Hijri month names in Arabic |
| `hijriMonthNamesEn[]` | 12 Hijri month names in English |
| `PRAYER_API_MAP` | Maps prayer IDs → Aladhan API field names |
| `PRAYER_REMINDER_TIMES` | Maps prayers → `{start, end}` hour ranges |
| `T` | Large bilingual translation object: `T['key'][lang]` |

---

### js/storage.js — localStorage + Key Generation

Merge `_originalGetStorageKey` + override into one function.

| Function | Description |
|---|---|
| `getProfilePrefix()` | Returns `{profileId}_` or empty string |
| `getStorageKey(type, month, year)` | Returns `salah_tracker_{prefix}{type}_h{year}_{month}` — **merged version** |
| `getCongregationKey(year, month)` | Returns `salah_cong_{prefix}h{year}_{month}` |
| `getQadaKey(year, month)` | Returns `salah_qada_{prefix}h{year}_{month}` |
| `getExemptKey(year, month)` | Returns `salah_exempt_{prefix}h{year}_{month}` |
| `getFastingKey(year)` | Returns `salah_fasting_{prefix}h{year}` (Ramadan) |
| `getVolFastingKey(year, month)` | Returns `salah_vol_fasting_{prefix}h{year}_{month}` |
| `getDataObject(type)` | Returns `fardData` or `sunnahData` reference |
| `loadAllData(type, year)` | Loads all 12 months from localStorage into memory |
| `saveMonthData(type, month)` | Saves single month to localStorage |
| `getDaysInMonth(month, year)` | Delegates to `getHijriDaysInMonth` |
| `getCongregationData(year, month)` | Loads congregation data |
| `saveCongregationData(year, month, data)` | Saves congregation data |
| `getQadaData(year, month)` | Loads qada data |
| `saveQadaData(year, month, data)` | Saves qada data |
| `getPrayersArray(type)` | Returns `fardPrayers` or `sunnahPrayers` |

**State variables:** `currentYear`, `currentMonth`, `fardData {}`, `sunnahData {}`, `charts {}`, `currentSection`

---

### js/hijri-calendar.js — ⚠️ CRITICAL: All trackers depend on this

| Function | Description |
|---|---|
| `getHijriMonthNames()` | 12 names in current language |
| `getHijriMonthNamesShort()` | Short/abbreviated names |
| `getHijriMonthName(index)` | Single name by 0-based index |
| `gregorianToHijri(date)` | Uses `Intl.DateTimeFormat('en-u-ca-islamic-umalqura')` → `{year, month, day}` |
| `getTodayHijri()` | Today's Hijri date |
| `hijriToGregorianDay1(hYear, hMonth)` | Binary search + `_hijriDay1Cache` |
| `hijriToGregorian(hYear, hMonth, hDay)` | Specific Hijri → Gregorian |
| `getHijriDaysInMonth(hYear, hMonth)` | 29 or 30. Priority: manual override → start override → Intl |
| `getHijriOverrides()` | Reads `salah_hijri_overrides` |
| `saveHijriOverrides(overrides)` | Saves + clears cache |
| `isFutureDateHijri(hYear, hMonth, hDay)` | Future date check |
| `getGregorianSpanForHijriMonth(hYear, hMonth)` | "فبراير-مارس ٢٠٢٦" |
| `getGregorianDayForHijri(hYear, hMonth, hDay)` | Gregorian day number |
| `formatHijriMonthHeader(hYear, hMonth)` | "رمضان ١٤٤٧ (فبراير-مارس ٢٠٢٦)" |
| `createDualDayNum(hDay, gDay, isToday)` | DOM fragment: Hijri (large) + Gregorian (small gold) |
| `toggleMonthDays()` | 29↔30 toggle. Clears day-30 data if switching to 29 |
| `showHijriOverrideDialog()` | Modal for custom Hijri month start date |
| `cleanGhostDaysForMonth(hYear, hMonth)` | Removes data for days beyond month length |
| `cleanAllGhostDays()` | Cleans ghost days across all months |
| `updateMonthDaysButton()` | Updates 29/30 button label |

**State:** `currentHijriYear`, `currentHijriMonth`, `_hijriDay1Cache`

---

### js/ui-utils.js — Toast, Confirm, Swipe, Haptic, Install Banner

| Function | Description |
|---|---|
| `showToast(msg, type)` | Bottom toast, auto-dismiss 3s |
| `showConfirm(msg, onConfirm, onCancel)` | Confirmation dialog |
| `handleSwipe(type)` | Swipe event handler |
| `swipeMonth(type, direction)` | Navigate month by swipe |
| `animateSwipe(container, direction, callback)` | CSS slide animation |
| `updateOnlineStatus()` | Shows/hides offline bar |
| `animateDayBox(dayBox, state)` | Pulse animation on state change |
| `hapticFeedback(type)` | `navigator.vibrate()` + Web Audio. Types: 'light', 'success', 'error' |
| `cleanup()` | Destroy charts, clear intervals |
| PWA install banner | `beforeinstallprompt` → `deferredPrompt`, `installApp()`, `dismissInstall()` |

**State:** `touchStartX`, `touchEndX`, `SWIPE_THRESHOLD`, `deferredPrompt`

---

### js/i18n.js — Language Switching

| Function | Description |
|---|---|
| `t(key)` | Returns `T[key][currentLang]` |
| `getMonthName(index)` | Gregorian month name in current language |
| `getMonthNames()` | All 12 Gregorian month names |
| `getPrayerName(prayerId)` | Searches fard + sunnah arrays |
| `toggleLang()` | Switches 'ar' ↔ 'en' |
| `applyLang()` | Applies to all elements with `data-t` attribute |

**State:** `currentLang` ('ar' | 'en')

---

### js/themes.js — 7 Color Themes

| Function | Description |
|---|---|
| `toggleThemeMenu()` | Shows/hides 🎨 picker |
| `setTheme(theme)` | Applies CSS class + saves |
| `loadTheme()` | Loads saved theme on startup |

---

### js/profiles.js — Profile System

Merge `_origApplyProfileUI` + original into one function.

| Function | Description |
|---|---|
| `getProfiles()` | From `salah_profiles` |
| `saveProfiles(profiles)` | Save array |
| `getActiveProfileId()` / `setActiveProfileId(id)` | Active profile |
| `generateProfileId()` | `profile_{timestamp}_{random}` |
| `showProfileScreen()` / `hideProfileScreen()` | Profile overlay |
| `renderProfilesList()` | Profile cards |
| `showProfileForm(editProfile)` / `hideProfileForm()` | Create/edit form |
| `saveProfile()` | Validates, saves, handles pending import |
| `editProfile(id)` / `deleteProfile(id)` | Edit/delete |
| `selectProfile(id)` | Switch active, reload data |
| `selectGender(gender)` | Gender in form |
| `applyProfileUI()` | **Merged** — header badge + female features + shell bar |

**State:** `activeProfile`, `selectedGender`

---

### js/female-features.js — Exemptions + Period History

| Function | Description |
|---|---|
| `getExemptDays(year, month)` | Handles old + new format |
| `saveExemptDays(year, month, data)` | Save |
| `toggleExemptMode(type)` | Toggle `exemptMode[type]` |
| `toggleExemptPrayer(type, prayerId, day)` | Mark/unmark prayer exempt |
| `isPrayerExempt(exemptData, prayerId, day)` | Check (both formats) |
| `getExemptCountForPrayer(exemptData, prayerId, daysInMonth)` | Count per prayer |
| `getExemptCountForMonth(year, month)` | Total unique exempt days |
| `updateExemptInfo(type)` | Update display |
| `savePeriodHistory(year, month)` | Auto-generate from exempt data |
| `renderPeriodHistory()` | In fasting section |
| `renderPeriodHistoryDashboard()` | In dashboard |

**State:** `exemptMode { fard: false, sunnah: false }`

---

### js/fard-tracker.js — Main Prayer Tracker

**Merge** `_origRenderTrackerMonth`, `_origUpdateTrackerStats`, `_origSwitchSection`, `_origSwitchView`.

| Function | Description |
|---|---|
| `renderTrackerMonth(type)` | **Merged** — grid + dual calendar + 4-state + exempt + congregation + weekly |
| `toggleTrackerDay(type, prayerId, day)` | Delegates to handleDayClick |
| `handleDayClick(type, prayerId, day, dayBox)` | 4-state: empty→prayed→congregation→qada→empty + haptic |
| `updateTrackerStats(type)` | **Merged** — stats bar + female exempt adjustment |
| `changeTrackerMonth(type, delta)` | ◄/► Hijri month |
| `resetTrackerMonth(type)` | Clear month (with confirm) |
| `updateTrackerView(type)` | Refresh header + grid + stats |
| `batchMarkPrayer(type, prayerId)` | "Mark All" toggle |
| `switchSection(section)` | **Merged** — fard/sunnah/fasting + shell bar |
| `switchView(type, view)` | **Merged** — tracker/yearly/dashboard + sub-tabs |
| `isFutureDate(day, month, year)` | Future check |
| `isCurrentMonth(hYear, hMonth)` | Current month check |

---

### js/sunnah-tracker.js

Shares functions with fard-tracker using `type='sunnah'`. 3-state cycle (no congregation). May be very thin.

---

### js/jamaah-tracker.js — Congregation + Streaks

| Function | Description |
|---|---|
| `toggleCongregation()` | Toggle `congregationMode` |
| `isCongregation(congData, prayerId, day)` | Check |
| `updateCongregationStats()` | Stats panel: total, alone, rate % |
| `calculateStreak(type, prayerId)` | Backward scan through Hijri months → `{current, best}` |
| `renderStreaks(type)` | 🔥 streak cards grid |
| Inside calculateStreak: `isOverflowDay()`, `isDayChecked()` | Helpers |

**State:** `congregationMode`

---

### js/weekly-view.js — Weekly View Mode

| Function | Description |
|---|---|
| `setTrackerViewMode(mode)` | 'month' ↔ 'week' |
| `changeWeek(delta)` | ◄/► weeks |
| `getWeekDays()` | Array of 7 Hijri day numbers |
| `updateWeekLabel()` | "٣ - ٩ رمضان ١٤٤٧ (21/2 - 27/2)" |
| `getWeekDayHeaders()` | `{label, isToday}` for Arabic day names |
| `daysBack(checkDate, today)` | Days between dates |

**State:** `trackerViewMode`, `currentWeekStart`

---

### js/fasting-tracker.js — Voluntary + Ramadan

Merge `_origSwitchFastingViewFiori` into `switchFastingView`.

| Function | Description |
|---|---|
| `getFastingData(year)` / `saveFastingData(year, data)` | Ramadan data |
| `updateFastingView()` | Ramadan grid (29/30 days) |
| `cycleFastingDay(year, day)` | empty→fasted→[exempt]→missed→empty |
| `resetFasting()` | Clear year |
| `switchFastingView(view)` | **Merged** — views + sub-tabs |
| `getVolFastingData(year, month)` / `saveVolFastingData(year, month, data)` | Voluntary data |
| `updateVoluntaryFasting()` | Monthly grid + stats |
| `changeFastingMonth(delta)` / `resetVoluntaryFasting()` | Navigation + reset |
| `updateFastingDashboard()` | Stats + monthly bar chart |

**State:** `fastingMonth`, `fastingYear`, `fastingExemptModeOn`

---

### js/prayer-times.js — GPS + Aladhan API

| Function | Description |
|---|---|
| `getPrayerTimesFromStorage()` / `savePrayerTimesToStorage(data)` | Cache |
| `getUserLocation()` | GPS + 7-day cache |
| `reverseGeocode(lat, lng)` | Nominatim → city name |
| `getPrayerMethod(countryCode)` | Country → Aladhan method (15+ mappings) |
| `fetchPrayerTimes()` | Aladhan API → store → render |
| `parseTimeToMinutes(timeStr)` / `formatTime12h(timeStr)` | Time helpers |
| `getCurrentPrayerState()` | `{active, next}` |
| `renderPrayerTimes()` | 5-box bar + countdown |
| `refreshPrayerTimes()` | Clear caches + re-fetch |

**State:** `prayerTimesData`, `prayerTimesDate`, `userLocation`

---

### js/notifications.js — Prayer Notifications

| Function | Description |
|---|---|
| `updateNotifButton()` | 🔔/🔕 state |
| `togglePrayerNotifications()` | Permission + enable/disable |
| `sendPrayerNotification(type, prayerName, prayerId)` | Via Notification API or SW |
| `playNotificationSound()` / `playTone(freq, dur, vol)` | Web Audio API |
| `checkPrayerTimeNotifications()` | 20min before / 30min after |
| `startPrayerTimesMonitor()` | 60-second interval |
| `scheduleSWNotifications()` | `postMessage` to SW |
| `checkPrayerReminders()` / `hideReminder()` / `dismissReminder()` | Legacy reminders |
| `scrollToUnmarkedPrayer()` | Scroll to missed prayer |

**State:** `notificationsEnabled`, `notifSentToday {}`, `prayerTimesCheckInterval`, `reminderDismissed {}`

---

### js/qada-report.js

| Function | Description |
|---|---|
| `renderQadaReport()` | Stats grid, breakdown bars, Chart.js donut, per-prayer totals |

---

### js/dashboard.js — Stats + 9 Charts

| Function | Description |
|---|---|
| `updateDashboard(type)` | Year stats, best month/prayer, congregation rate, streaks |
| `updateCharts(type)` | 6 charts (monthly, prayer comparison, donut, congregation) |
| `renderAdvancedCharts()` | Additional charts |
| `renderWeeklyPattern()` | Weekly congregation pattern |
| `renderYearlyHeatmap()` | Yearly heatmap |
| `getMonthStats(type, month, year)` | `{completed, total}` |
| `getYearStats(type, year)` | Full year stats |

**Chart canvas IDs:** `fardMonthlyChart`, `sunnahMonthlyChart`, `fardPrayerChart`, `sunnahPrayerChart`, `fardCompletionChart`, `sunnahCompletionChart`, `fardCongChart`, `fardWeeklyPatternChart`, `fardHeatmapChart`, `fastingMonthlyChart`, `fardQadaChart`

---

### js/year-overview.js — 12 Monthly Cards

| Function | Description |
|---|---|
| `updateYearlyView(type)` | 12 cards with progress bars |
| `openMonth(type, month)` / `backToYearly(type)` | Drill-down + back |
| `renderMonthDetail(type, month)` | Day-by-day detail |

---

### js/data-io.js — Export/Import + Migration

Merge `_origExportData` override.

| Function | Description |
|---|---|
| `exportData()` | **Merged** — all data + metadata → JSON download |
| `downloadFallback(blob, fileName)` | Fallback download |
| `importData(event)` / `handleImport(data)` / `handleImportOnProfile(event)` | Import flow |
| `isGregorianKey(key)` | Detect old format |
| `importAndConvertToHijri(imported, profileId)` | Gregorian → Hijri |
| `mergeAndSave(newData, oldData, finalKey)` | Merge imported data |
| `migrateGregorianToHijri(profileId)` | One-time migration |
| `migrateExistingData()` / `exportOldData()` | Migration + safety backup |

---

### js/app.js — Init + Routing

Merge `_origInit` override.

| Function | Description |
|---|---|
| `init()` | **Merged** — profile → Hijri date → migrate → load → render → prayer times |
| `applyUpdate()` | Force SW update + reload |
| `switchTab(type)` | Bottom tab bar |
| `updateShellBar()` | Fiori header with profile |

**Event listeners (15):** DOMContentLoaded, touchstart/end, visibilitychange, beforeinstallprompt, appinstalled, online/offline, button handlers

---

### Fard Section (`#fardSection`)
- `#fardTrackerView` → `#fardTrackerPrayersContainer`
- `#fardYearlyView` → `#fardMonthsGrid` → `#fardPrayersContainer`
- `#fardDashboardView` → Charts + `#fardStreakSection` → `#fardStreakGrid` + `#fardQadaStatsGrid` + `#fardPeriodDashboard` → `#fardPeriodHistoryContainer`
- `#fardSubTabs`, `#fardExemptBar`, `#fardCongStats`

### Sunnah Section (`#sunnahSection`)
- `#sunnahTrackerView` → `#sunnahTrackerPrayersContainer`
- `#sunnahYearlyView` → `#sunnahMonthsGrid` → `#sunnahPrayersContainer`
- `#sunnahDashboardView` + `#sunnahStreakSection` → `#sunnahStreakGrid`
- `#sunnahSubTabs`, `#sunnahExemptBar`

### Fasting Section (`#fastingSection`)
- `#fastingRamadanView` → `#fastingGrid`
- `#fastingVoluntaryView` → `#voluntaryFastingGrid`
- `#fastingDashboardView`
- `#fastingSubTabs`, `#fastingExemptBar`

### Shell & Global
- `#shellBar` (Fiori header with profile badge)
- `#tabBar` (bottom navigation: فرائض / سنن / صيام)
- `#prayerTimesBar` → `#prayerTimesGrid`
- `#toastContainer`, `#offlineBar`, `#prayerReminder`

---

## How to Start

```bash
# Create a NEW mirror repo (one-time copy, original stays untouched forever)
git clone https://github.com/ahmedabdallah-88/prayer-tracker.git prayer-tracker-v2
cd prayer-tracker-v2

# Point remote to the NEW v2 repo (create prayer-tracker-v2 on GitHub first)
git remote set-url origin https://github.com/ahmedabdallah-88/prayer-tracker-v2.git
git push -u origin main

# ⚠️ ALL work happens here in prayer-tracker-v2
# NEVER touch the original prayer-tracker repo
```

**Prompt for Claude Code:**
```
Read the file refactoring-guide.md in this repo, then read index.html fully.
Work through Milestone 1 — extract CSS + all foundation JS modules.
Do NOT ask me to test between individual files. Run syntax checks yourself after each file.
When Milestone 1 is fully done, tell me so I can test.
```

After you confirm Milestone 1 works, tell Claude Code:
```
Milestone 1 confirmed working. Proceed to Milestone 2.
```

After Milestone 2, same thing, then Milestone 3.

---

## Success Criteria (What to Test at Each Milestone)

### Milestone 1 — Foundation
- [ ] App opens without console errors
- [ ] Arabic/English toggle works
- [ ] All 7 themes work + persist
- [ ] Profile create/switch/delete works
- [ ] Hijri dates display correctly with dual Gregorian
- [ ] Month ◄/► navigation works
- [ ] 29/30 toggle works
- [ ] Override dialog (⚙️) works

### Milestone 2 — All Features
- [ ] Fard 4-state: empty → prayed → congregation → qada → empty
- [ ] Sunnah 3-state: empty → performed → qada → empty
- [ ] "Mark All" batch works
- [ ] Future dates disabled
- [ ] Stats bar correct (with female exempt adjustment)
- [ ] Weekly view: 7-day, day headers, today highlighted, ◄/► weeks
- [ ] Congregation mode toggle + streaks (🔥 current + best)
- [ ] Voluntary fasting grid (Hijri)
- [ ] Ramadan fasting (29/30, male/female cycles, owed days)
- [ ] Prayer times bar + next countdown + 🔄 refresh
- [ ] GPS → city name display
- [ ] 🔔 notification toggle
- [ ] All 9+ charts render with Hijri month names
- [ ] Qada report with totals
- [ ] Year overview: 12 cards, click → drill-down
- [ ] Swipe month navigation
- [ ] Haptic feedback (Android vibration)
- [ ] Export/Import works
- [ ] Female per-prayer exemption + period history

### Milestone 3 — PWA & Deployment
- [ ] Installs as PWA on Android
- [ ] Offline mode works (airplane mode)
- [ ] Existing data loads after cache clear
- [ ] Notification handlers work (before/after prayer)
- [ ] Service worker updates correctly
