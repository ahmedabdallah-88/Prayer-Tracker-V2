# Prayer Tracker — Design Implementation Guide for Claude Code

## Overview

Apply a complete visual redesign + add new features to the refactored prayer-tracker-v2 codebase.
All work happens in the `prayer-tracker-v2` repo. NEVER touch the original `prayer-tracker` repo.

**Design Direction:** Modern minimal, Apple iOS native feel, warm neutral palette, glassmorphism cards, Google Material Symbols (NO emojis anywhere).

---

## Design System

### Fonts
```css
/* Import these in index.html <head> */
@import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Rubik:wght@400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

/* Usage */
font-family: 'Noto Kufi Arabic', sans-serif;  /* Arabic text, UI labels */
font-family: 'Rubik', sans-serif;              /* Numbers, percentages, stats */
font-family: 'Material Symbols Rounded';        /* Icons */
```

### Colors
```css
/* Primary */
--green-deep: #2D6A4F;      /* Primary brand, buttons, active states */
--green-mid: #40916C;        /* Gradients, progress bars */
--green-light: #52B788;      /* Gradient endpoints */

/* Accents */
--gold: #D4A03C;             /* Congregation, streaks */
--gold-light: #E8B84A;       /* Gold gradient endpoint */
--red: #C1574E;              /* Qada, danger, delete */
--red-light: #D4645B;        /* Red gradient endpoint */

/* Prayer Sky-Time Colors (each prayer has unique gradient) */
--fajr: #D4A0A7;             /* Dawn pink */
--dhuhr: #E8B84A;            /* Noon gold */
--asr: #D4943A;              /* Afternoon amber */
--maghrib: #B0664A;          /* Sunset terracotta */
--isha: #4A5A7A;             /* Night slate */

/* Neutrals */
--text-primary: #2B2D42;     /* Headings, primary text */
--text-secondary: #5A5D6E;   /* Body text */
--text-muted: #8D99AE;       /* Labels, subtitles */
--text-faint: #B8BCC8;       /* Placeholders, disabled */
--bg-main: #F5F3EF;          /* Page background (warm neutral) */
--card-bg: rgba(255,255,255,0.55);  /* Card backgrounds */
--border: rgba(0,0,0,0.04);  /* Card borders */

/* Female */
--purple: #8B5CF6;           /* Female profile, exemption features */
--purple-light: #A78BFA;

/* Info */
--blue: #0EA5E9;             /* Info badges, language */
```

### Card Style (apply to ALL cards)
```css
background: rgba(255,255,255,0.55);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border-radius: 20px;
border: 1px solid rgba(0,0,0,0.04);
```

### Icon Usage
```html
<!-- Material Symbols Rounded — NEVER use emojis -->
<span class="material-symbols-rounded" style="
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20;
  font-size: 20px;
">icon_name</span>

<!-- Filled variant -->
font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20;
```

### Icon Map (replace ALL emojis with these)
```
Prayer icons:
  الفجر    → wb_twilight (with dawn pink gradient)
  الظهر    → wb_sunny (with noon gold gradient)
  العصر    → partly_cloudy_day (with afternoon amber gradient)
  المغرب   → wb_twilight (with sunset terracotta gradient)
  العشاء   → dark_mode (with night slate gradient)

State icons (in day circle badges, top-right corner):
  منفرد    → check (white circle, green icon)
  جماعة    → mosque (gold rounded square, white icon)
  قضاء     → schedule (white circle, red icon)

Navigation:
  الفرائض  → mosque
  السنن    → auto_awesome
  الصيام   → nights_stay
  الأذكار  → menu_book (NEW)

UI icons:
  Profile       → person
  Notifications → notifications
  Settings      → settings (gear)
  Edit          → edit
  Delete        → delete_outline / delete_forever
  Export        → upload_file
  Import        → download
  Back          → arrow_forward (RTL)
  Next prayer   → hourglass_top
  Streak/fire   → local_fire_department
  Theme         → palette
  Language      → translate
  Add           → add_circle
  Close         → close
  Check         → check_circle
  Info          → info
  Warning       → warning
  Calendar      → calendar_today / date_range
  Year          → calendar_month
  Dashboard     → analytics
  Tracker       → grid_view
  Trending up   → trending_up
  Trophy        → emoji_events
  Gender male   → male
  Gender female → female
  Child face    → face
  Refresh       → refresh
  Location      → location_on
  Chevrons      → chevron_left / chevron_right
  Week view     → view_week
  Month view    → calendar_view_month
  Congregation  → mosque (filled)
  Morning       → light_mode (for morning azkar)
  Evening       → nights_stay (for evening azkar)
```

---

## Day Circle Design (CRITICAL — used everywhere)

Day circles ALWAYS show the Hijri day number + small Gregorian number, even when marked. The state is shown as a small badge in the top-right corner.

```
States:
  empty        → transparent bg, thin border, dark Hijri number + grey Gregorian
  empty+today  → green-tinted bg, green border, green text
  prayed       → green gradient bg, white text, white circle badge with green ✓
  congregation → green gradient bg, gold border + shadow, white text, gold square badge with white mosque
  qada         → red gradient bg, white text, white circle badge with red clock
  future       → same as empty but opacity 0.2, not clickable
  exempt       → (females) grey bg with purple tint, purple badge

Shape: borderRadius: 10px (rounded square, NOT full circle)
Size: 36x36px
Badge size: 14x14px, positioned top: -4, right: -4
```

---

## Screens to Implement

### SCREEN 1: Profile Selection (first screen users see)

**File:** `js/profiles.js` + new HTML in `index.html`

**First-time user (no profiles):**
- Centered mosque icon (120x120, green gradient, floating animation)
- App title "سجل الصلوات" + subtitle
- Quran verse card: ﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾
- Green CTA button: "ابدأ بإنشاء ملفك الشخصي" with person_add icon
- Secondary button: "استيراد بيانات سابقة" with download icon

**Returning user (existing profiles):**
- Header: mosque icon (64x64) + "اختر ملفك الشخصي"
- Profile cards: avatar (color-coded gradient by gender/age) + name + age/gender + chevron
  - Male adult: green gradient + person icon
  - Female adult: purple gradient + person icon
  - Boy (age<12): blue gradient + face icon
  - Girl (age<12): pink gradient + face icon
- Dashed "إضافة ملف شخصي جديد" button with add_circle icon
- Profile count: "٣ من ١٠ ملفات شخصية"

**Create/Edit profile form:**
- Live avatar preview (changes with gender/age selection)
- Name input (badge icon label)
- Age input (cake icon label) — shows child info banner if age<12
- Gender picker: two cards (male=green gradient, female=purple gradient) — shows female exemption info
- Save button: disabled (grey) until all fields filled, then green gradient

---

### SCREEN 2: Profile Settings (accessed via profile avatar in header)

**File:** New `js/profile-settings.js` or extend `js/profiles.js`

**Main settings view:**
- Close button (top right)
- Profile card (green gradient): avatar + name + age/gender + edit button
- NO stats in the profile card header
- Menu sections (grouped in glassmorphism cards):

  Section "الملف الشخصي":
  - edit → تعديل البيانات (sub: الاسم، العمر، الجنس)
  - swap_horiz → تبديل الملف الشخصي
  - person_add → إضافة ملف جديد

  Section "إدارة البيانات":
  - upload_file → تصدير البيانات (sub: حفظ نسخة احتياطية JSON)
  - download → استيراد البيانات (sub: استعادة من نسخة سابقة)

  Section "المظهر":
  - palette → الألوان والثيم (shows current theme color swatches as trailing element)
  - translate → اللغة (shows "العربية" or "English" badge as trailing element)

  Section "خيارات متقدمة":
  - notifications → الإشعارات (sub: تذكير الصلاة قبل وبعد الوقت)

  Section (danger, separate card):
  - delete_outline → حذف الملف الشخصي (sub: سيتم حذف جميع البيانات نهائياً) — RED color

  Footer: "سجل الصلوات — الإصدار ٢.٠"

**Edit profile sub-view:** Same form as create but pre-filled

**Theme picker sub-view:** 7 theme cards with color swatches, active = green border + animated checkmark

**Data management sub-view:**
- Export card: checklist of what gets exported + green "تصدير الآن" button + success state with filename
- Import card: merge warning (amber) + drag/drop zone
- Last export timestamp

**Delete confirmation:** Overlay modal with warning icon + profile name + إلغاء/حذف buttons

---

### SCREEN 3: Home Screen — Prayer Tracker (Fard + Sunnah)

**Files:** `css/main.css`, `css/themes.css`, `js/fard-tracker.js`, `js/sunnah-tracker.js`

**Header:**
- App title "سجل الصلوات" (24px, weight 800)
- Hijri date subtitle: "شوال ١٤٤٧ هـ — مارس ٢٠٢٦" with calendar_today icon
- Notification button (36x36, rounded square, transparent bg)
- Profile avatar button (38x38, green gradient, person icon) → opens Profile Settings

**View switcher (segmented control):**
- 3 segments: التتبع (grid_view) | السنة (calendar_month) | الإحصائيات (analytics)
- Active = white bg + shadow, inactive = transparent
- Material icon + label in each segment

**Prayer times bar:**
- 5 compact boxes, each with Material icon + prayer name + time
- Current prayer: green gradient bg, white text, shadow
- Past prayers: dimmed (opacity 0.45)
- Each prayer box uses its sky-time gradient icon

**Next prayer countdown card:**
- hourglass_top icon in green-tinted square
- "الصلاة القادمة" label + prayer name
- Countdown timer (large, green, Rubik font, tabular-nums)

**Month navigation:**
- ◄ ► buttons (rounded squares with chevron icons)
- "شوال ١٤٤٧" center label
- "30" days badge
- Settings gear icon (for Hijri override)

**Prayer grid (inside glassmorphism card):**
- 5 prayer rows (Fard) or 8 prayer rows (Sunnah)
- Each row has:
  - Prayer header bar: sky-time gradient icon square + prayer name + congregation count badge (gold) + completion % badge (color-coded)
  - Day circles grid: 29-30 circles using the Day Circle Design above
- Fard: 4-state click cycle (empty → prayed → congregation → qada)
- Sunnah: 3-state click cycle (empty → performed → qada)

**Legend bar:** 3 items with mini styled squares: منفرد / جماعة / قضاء

---

### SCREEN 4: Year Overview

**File:** `js/year-overview.js`

**Year view:**
- Header: "نظرة سنوية" + year navigation (◄ ١٤٤٧ ►)
- 3 summary cards: متوسط الإنجاز (verified) / متوسط الجماعة (mosque) / أفضل شهر (emoji_events)
- 12 month cards in 2-column grid:
  - Hijri month name + Gregorian reference
  - Progress bar (color-coded: green ≥90, orange ≥70, red <70)
  - Large percentage number
  - Congregation badge (mosque icon + %)
  - Fasting count badge (nights_stay icon + days) — if applicable
  - Current month: green dot indicator + green border
  - Future months: opacity 0.35

**Month drill-down (click card):**
- Back arrow + month name + "الشهر الحالي" badge
- 3 stat cards: completion / congregation / qada count
- Day-by-day grid: 5 prayers × 30 days, split into rows (1-15, 16-30)
- Per-prayer stats: horizontal progress bars with congregation and qada counts

---

### SCREEN 5: Dashboard (Fard)

**File:** `js/dashboard.js`, `css/dashboard.css`

**All charts are custom SVG — do NOT use Chart.js standard look. Implement these custom visualizations:**

**1. Orbital Progress (two rings, NOT three)**
- Outer ring (thick): الإنجاز (green)
- Inner ring: الجماعة (gold)
- NO fasting ring on fard dashboard
- Center: large percentage number
- Side: legend with values + sub-counts

**2. Streak Flame Bars (per prayer, 5 vertical bars)**
- Each prayer = one vertical bar, height = current streak
- Ghost dashed bar behind = best streak
- Prayer's sky-time color for each bar
- Fire icon on bars where current = best (personal record)
- Flame tip glow effect on tallest bar
- Prayer icons row below with gradient badges
- Legend: الحالية / الأفضل / رقم قياسي

**3. Mountain Landscape (monthly progress)**
- Two smooth bezier area charts overlaid:
  - Green mountain (taller) = total completion (جماعة + منفرد)
  - Gold mountain (shorter, dashed ridge) = congregation only
  - Gap between = منفرد
- Peak dots (larger + glow on months ≥95%)
- Percentage labels above peaks
- Hijri month names along bottom
- Current month vertical indicator
- Legend: الإنجاز الكلي / الجماعة / قمة

**4. Prayer Radar (spider/pentagon chart)**
- 5-axis pentagon, one per prayer
- Green polygon = completion rates
- Gold polygon = congregation rates
- Grid rings at 25/50/75/100%
- Prayer names + percentages at each vertex
- Legend: الإنجاز / الجماعة

**5. Prayer Lollipop (horizontal dual bars)**
- Each prayer: sky-time gradient icon + name
- Dual bar: gold bar behind (congregation), colored bar front (completion)
- Lollipop dot at end of completion bar
- Congregation % marker below bar
- Per prayer: mosque icon + congregation count

**6. Weekly Rhythm (circular/radial chart)**
- 7 radial segments (سبت → جمعة)
- Each segment extends outward based on congregation %
- Color: green ≥90, mid-green ≥75, gold ≥60, red <60
- Center: average % label
- Day names + percentages around edge

**7. Congregation Heatmap (GitHub-style grid)**
- 10 weeks × 7 days grid
- Color intensity = number of congregation prayers that day
- Day name labels on left (سبت → جمعة)
- Scale legend: أقل → أكثر

**8. Qada Report**
- Proportional color blocks (stacked horizontal bar showing distribution)
- Each prayer's sky-time color
- Per-prayer breakdown: color dot + name + mini bar + count
- Total count badge (red)

---

### SCREEN 6: Dashboard (Sunnah)

Same layout as Fard dashboard but:
- NO congregation-related charts (no radar congregation polygon, no weekly rhythm, no heatmap, no congregation lollipop layer)
- Streak bars use completion (not congregation)
- Orbital Progress: one ring only (completion)
- Mountain chart: one layer only (completion, no gold)
- Prayer Lollipop: single bar per prayer (no gold overlay)
- Keep: monthly mountain, prayer comparison, streak bars, qada report

---

### SCREEN 7: Fasting Section

**File:** `js/fasting-tracker.js`

Apply same design system. Three sub-views:
- رمضان: grid of 29/30 days, male cycle (empty→fasted→missed), female cycle (empty→fasted→exempt→missed)
- تطوع: monthly Hijri grid for voluntary fasting
- لوحة التحكم: fasting dashboard (total voluntary, Ramadan stats, monthly bar chart)

---

### SCREEN 8: Azkar Section (NEW FEATURE)

**Files:** New `js/azkar-tracker.js`, extend `js/app.js`, update bottom tab bar

**Bottom tab bar update:** Add 4th tab
```
mosque (الفرائض) | auto_awesome (السنن) | nights_stay (الصيام) | menu_book (الأذكار)
```

**Azkar tracker has two categories:**
1. أذكار الصباح (Morning Azkar) — icon: light_mode
2. أذكار المساء (Evening Azkar) — icon: nights_stay

**Sub-views (same segmented control pattern):**
- التتبع (tracker) | السنة (yearly) | لوحة التحكم (dashboard)

**Tracker view:**
- Toggle between أذكار الصباح and أذكار المساء (two buttons or segmented control)
- Monthly grid of 29-30 Hijri days (same Day Circle design)
- Two-state click cycle: empty → completed → empty
- Day circle when completed: blue gradient bg (#0EA5E9) with check badge
- Stats bar: completed / total / rate %
- "Mark All" batch button

**Data storage:**
```
Key: salah_azkar_{profileId}_h{hijriYear}_{hijriMonth}
Value: { morning: { day: true/false }, evening: { day: true/false } }
```

**Year overview:**
- 12 month cards same style as fard year overview
- Shows morning % and evening % separately

**Dashboard:**
- Completion stats (morning + evening separate)
- Monthly progress mountain chart (two layers: morning = blue, evening = indigo)
- Streak display (flame bars for morning and evening)
- Year total: days with both azkar completed
- Best month
- Consistency heatmap

---

## Implementation Plan — 3 Milestones

### 🟢 MILESTONE 1: Design System + Core Screens Restyling

1. Add Google Fonts + Material Symbols to `index.html` `<head>`
2. Update `css/main.css` with new design tokens (colors, fonts, card styles, backgrounds)
3. Update `css/themes.css` — keep 7 themes but update to new color system
4. Remove ALL emojis from the codebase — replace with Material Symbols using the Icon Map above
5. Restyle day circles to rounded squares with badge pattern (dates always visible)
6. Restyle bottom tab bar (4 tabs now: فرائض / سنن / صيام / أذكار)
7. Restyle header (app title, Hijri date, notification + profile buttons)
8. Restyle segmented control (view switcher)
9. Restyle prayer times bar with sky-time gradient icons
10. Restyle next prayer countdown card
11. Restyle month navigation
12. Restyle prayer grid rows (header + day circles)
13. Restyle legend bar
14. Add Profile Settings screen (new full-page view accessible from profile avatar)
15. Move Export/Import buttons from main UI to Profile Settings only
16. Update `service-worker.js` cache list with new font URLs

**Test after Milestone 1:**
- App opens with new design
- All prayers trackable with new day circles (dates visible in all states)
- Profile settings accessible and functional (edit, export, import, theme, delete)
- All Material Symbols render correctly
- No emojis remaining anywhere
- Bottom bar shows 4 tabs

---

### 🟡 MILESTONE 2: Dashboard + Charts Redesign

17. Replace ALL Chart.js usage with custom SVG visualizations
18. Implement Fard dashboard: Orbital Progress (2 rings) + Streak Flame Bars + Mountain Landscape + Prayer Radar + Prayer Lollipop + Weekly Rhythm + Congregation Heatmap + Qada Report
19. Implement Sunnah dashboard: same but without congregation charts (see Screen 6 spec above)
20. Implement Fasting dashboard with new design style
21. Restyle Year Overview (month cards + drill-down detail)
22. Remove Chart.js CDN dependency from `index.html` and `service-worker.js` if fully replaced

**Test after Milestone 2:**
- All dashboard charts render correctly as custom SVG
- Fard dashboard shows all 8 visualizations
- Sunnah dashboard shows appropriate subset
- Fasting dashboard works
- Year overview cards + drill-down works
- No Chart.js dependency remaining

---

### 🔴 MILESTONE 3: Azkar Feature + Final Polish

23. Create `js/azkar-tracker.js` module:
    - Data storage functions (get/save azkar data with Hijri keys)
    - Morning/evening toggle
    - Monthly grid rendering (same day circle pattern)
    - 2-state click cycle
    - Stats calculation
    - Year overview
    - Dashboard with charts (mountain chart, streaks, heatmap)
24. Update `js/app.js` — add azkar section routing, bottom tab handler
25. Update `js/config.js` — add azkar translations, constants
26. Update `js/storage.js` — add azkar key generation functions
27. Update `js/data-io.js` — include azkar data in export/import
28. Add azkar HTML containers to `index.html`
29. Update `service-worker.js` — add `js/azkar-tracker.js` to cache + bump version
30. Final check: animations, transitions, RTL alignment, responsive sizing
31. Test all features end-to-end

**Test after Milestone 3:**
- Azkar tab visible in bottom bar
- Morning/Evening toggle works
- Day tracking works with blue day circles
- Azkar dashboard renders
- Azkar data included in export/import
- All 4 sections fully functional
- PWA installs and works offline
- No console errors

---

## Important Technical Notes

1. **Material Symbols font must be cached** by service worker for offline use
2. **Custom SVG charts** — all chart data comes from the same data functions that Chart.js was using. Just change the rendering, not the data layer
3. **Azkar localStorage keys** follow the same pattern: `salah_azkar_{profileId}_h{year}_{month}`
4. **Day circles** — the badge approach means each day circle is a positioned container with the badge absolutely positioned at top-right. Make this a shared component/function used by fard, sunnah, fasting, and azkar
5. **Profile Settings** is a full-screen overlay (like the current profile selection screen), NOT a small dropdown
6. **Bottom tab bar** now has 4 items — ensure spacing works on narrow screens
7. **RTL direction** — all chevrons, arrows, and swipe directions must respect RTL
8. **Fonts**: Noto Kufi Arabic for all Arabic text, Rubik for numbers and Latin text

---

## How to Start

```
Read DESIGN-GUIDE.md fully.
Work through Milestone 1. Don't ask me to test between individual steps.
Run syntax checks after each file change.
Tell me when Milestone 1 is done so I can test.
```
