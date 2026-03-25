# DESIGN-FIX-V2.md — Complete Fix List (Replace DESIGN-FIX.md)

## IMPORTANT: Read This First

The previous DESIGN-FIX.md was NOT implemented correctly. Many bugs remain and new ones were introduced. This document replaces it entirely.

**Rules:**
1. Read DESIGN-GUIDE.md to understand the target design
2. Fix ALL items below in one pass — do NOT stop between items
3. Run syntax checks after each file change
4. When ALL done, give a summary and tell me to test

---

## PRIORITY 0: CRITICAL FUNCTIONAL BUGS (Fix these BEFORE any design work)

### P0.1 — Prayer grid not rendering on first load
**Symptom:** When app opens on الفرائض → المتتبع الشهري, the prayer grid (all 5 prayer rows with day circles) is completely invisible. Only prayer times bar and action buttons are visible. If you switch to السنن tab and back to الفرائض, the grid magically appears.
**Root cause:** `renderTrackerMonth('fard')` is either not called during `init()`, or called before the DOM container `#fardTrackerPrayersContainer` is visible/mounted.
**Fix:** Ensure `init()` calls `renderTrackerMonth('fard')` AFTER the fard section container is visible and in the DOM. Add a small delay if needed, or ensure `switchSection('fard')` is called before rendering.

### P0.2 — Import data fails
**Symptom:** Import says success but no prayer data appears. Grids remain empty.
**Root cause:** The imported JSON keys don't match the refactored code's key generation. 
**Fix:** 
1. Read the actual JSON file in the repo to see the key format
2. Compare with what `getStorageKey()`, `getCongregationKey()`, `getQadaKey()` etc. generate
3. Fix the import function to map keys correctly
4. After import, call `loadAllData()` and `renderTrackerMonth()` to refresh

### P0.3 — Year overview shows "undefined NaN"
**Symptom:** Every month card shows "undefined NaN - undefined NaN" for the Gregorian date span. Year input field is EMPTY.
**Root cause:** `getGregorianSpanForHijriMonth()` is returning undefined. `currentHijriYear` is not set when year overview renders.
**Fix:**
1. Ensure `currentHijriYear` is initialized in `init()` BEFORE any view renders
2. Populate the year input field with `currentHijriYear` value
3. Debug `getGregorianSpanForHijriMonth(year, month)` — check that `hijriToGregorianDay1()` returns valid Date objects
4. The "0/145" denominator seems wrong — should be days × prayers (e.g., 30 × 5 = 150)

### P0.4 — Month name missing from navigation bar
**Symptom:** Navigation shows only "‹ ⚙️ 30 ›" without the Hijri month name.
**Fix:** The month navigation must show "شوال ١٤٤٧" (or whatever current month is) between the arrows. Check `formatHijriMonthHeader()` or the element that displays `currentHijriMonth` name.

---

## PRIORITY 1: HOME SCREEN DESIGN FIXES

### H1 — Remove Quran verse and old header from tracker view
**Current:** The tracker may still show "سجل قضاء الصلوات - الفرائض والسنن" with Quran verse and "Ahmed → تبديل".
**Required:** The home screen header should ONLY contain:
```
Right side: "متتبع الصلاة" title + mosque icon (this already exists and is fine)
Left side: EN button + theme button + profile avatar (green circle with person icon)
```
Below header: the subtitle should show Hijri date "شوال ١٤٤٧ هـ — مارس ٢٠٢٦" with calendar_today Material icon. NO Quran verse. NO "Ahmed → تبديل". NO old profile bar.

The Quran verse should ONLY appear on the first-time welcome screen (when no profiles exist).

### H2 — Remove calendar icon below mosque
**Current:** Small 📅 calendar icon appears below the mosque icon in the header.
**Required:** Remove it. The mosque icon alone is the app logo.

### H3 — Segmented control must have Material icons
**Current:** Plain text "المتتبع الشهري | نظرة السنة | لوحة التحكم"
**Required:** Pill-style segmented control:
```
التتبع (grid_view icon) | السنة (calendar_month icon) | الإحصائيات (analytics icon)
```
Style:
- Container: background rgba(43,45,66,0.06), borderRadius 12, padding 3
- Active tab: white background, box-shadow, filled icon, text color #2B2D42
- Inactive tab: transparent, outlined icon, text color #8D99AE
- Each tab shows Material icon + Arabic label

### H4 — Month navigation must show month name
**Current:** "‹ ⚙️ 30 ›" — missing month name
**Required:** Single row: `‹  شوال ١٤٤٧  30  ⚙️  ›`
- ‹ ► buttons: 30×30px rounded squares
- Center: month name + year (16px, bold)
- "30" days pill badge
- Small ⚙️ gear icon for Hijri override

### H5 — Remove "مسح بيانات الشهر" button from home
**Current:** Big red "مسح بيانات الشهر" button visible on main tracker screen.
**Required:** Move this to Profile Settings or hide behind a menu. It should NOT be a prominent button on the main screen.

### H6 — Remove "طباعة" button from home
**Current:** Big green "طباعة" button visible.
**Required:** Move to Profile Settings or remove entirely from main view.

### H7 — Remove "Choose file" / import from home
**Current:** "No file chosen / Choose file" still visible on main screen.
**Required:** Remove completely. Import is ONLY in Profile Settings → إدارة البيانات.

### H8 — Add next prayer countdown card
**Current:** Missing entirely.
**Required:** Glassmorphism card below prayer times bar:
- Left: hourglass_top icon in green-tinted square (36×36, borderRadius 10)
- Middle: "الصلاة القادمة" label + prayer name (e.g., "المغرب")
- Right: countdown timer "2:44:12" (20px, weight 800, green, Rubik font)

### H9 — Prayer header rows need sky-time gradient icons
**Current:** Prayer icons are circular with sky-time colors (this is partially done).
**Required:** Each prayer row header must have:
- Sky-time gradient square icon (34×34, borderRadius 10) — NOT circular
- Prayer name (15px, weight 700)
- Congregation count pill (gold bg, mosque icon + count)
- Completion % pill (color-coded)
The gradient squares should use:
- الفجر: wb_twilight on #E8B4B8→#D4A0A7
- الظهر: wb_sunny on #F0C75E→#E8B84A
- العصر: partly_cloudy_day on #E8A849→#D4943A
- المغرب: wb_twilight on #C47A5A→#B0664A
- العشاء: dark_mode on #5B6B8A→#4A5A7A

### H10 — Day circles must be rounded squares with badge pattern
**Current:** May still show old style circles or wrong badge placement.
**Required:** Each day circle:
- Size: 36×36px, borderRadius: 10 (rounded square NOT circle)
- ALWAYS shows Hijri day (12px, bold) + Gregorian day (7.5px, muted) — even when marked
- State badge at top-right corner (14×14px, position absolute top:-4 right:-4):
  - Prayed: white circle badge, green check icon inside
  - Congregation: gold rounded-square badge, white mosque icon inside
  - Qada: white circle badge, red schedule icon inside
- Background: green gradient for prayed/congregation, red gradient for qada, transparent for empty
- Text: white on colored bg, dark on empty

### H11 — Calendar must be flowing sequential grid
**Current:** If the calendar is rendering (after tab switch), verify it's NOT a 7-column week grid with day-of-week headers.
**Required:** Days 1 to 29/30 flow sequentially, wrapping naturally. NO day-of-week headers. NO week structure. Just:
```
1  2  3  4  5  6  7  8  9
10 11 12 13 14 15 16 17 18
19 20 21 22 23 24 25 26 27
28 29 30
```
Use flexbox with `flex-wrap: wrap` and `gap: 4px`.

---

## PRIORITY 2: YEAR OVERVIEW FIXES

### Y1 — Year input must show current year
**Current:** "السنة:" with empty input field.
**Required:** Input field populated with `currentHijriYear` (e.g., 1447). Add ◄ ► navigation buttons on either side.

### Y2 — Fix Gregorian span on month cards
**Current:** "undefined NaN - undefined NaN"
**Required:** Should show e.g., "يوليو ٢٠٢٥" or "فبراير-مارس ٢٠٢٦". Fix `getGregorianSpanForHijriMonth()`.

### Y3 — Fix denominator on month cards
**Current:** Shows "0/145"
**Required:** Should be total possible prayers = daysInMonth × 5 (for fard). So for a 30-day month: 0/150. For 29-day month: 0/145. Check the calculation.

### Y4 — Month cards missing design elements
**Current:** Plain cards with just month name, %, Gregorian span, and count.
**Required (per DESIGN-GUIDE):**
- Progress bar (color-coded: green ≥90%, gold ≥70%, red <70%)
- Congregation badge with mosque icon + percentage
- Current month: green dot indicator + subtle green border
- Future months: opacity 0.35

### Y5 — Summary cards style
**Current:** Basic cards for متوسط الإنجاز and متوسط الجماعة.
**Required:** Three summary cards in a row:
1. متوسط الإنجاز — verified icon (green)
2. متوسط الجماعة — mosque icon (gold)
3. أفضل شهر — emoji_events/trophy icon

Each card: glassmorphism style, Material icon on top, value below, label at bottom.

---

## PRIORITY 3: DASHBOARD FIXES

### D1 — Remove old header/profile from dashboard
Same as H1 — no Quran verse, no "Ahmed → تبديل" on dashboard view.

### D2 — Streak flame bars empty (data bug)
**Current:** All 5 flame bars show only dashed ghost outlines, no filled bars.
**Fix:** Debug data flow:
1. Check if `calculateStreak('fard', prayerId)` returns valid `{current, best}` objects
2. If returning 0 for current, check if streak calculation can find any congregation data
3. If data was not imported correctly (P0.2), fix import first, then streaks should populate
4. Verify the flame bar height calculation: `(current / maxBest) * 100%`

### D3 — Heatmap uses black/dark colors
**Current:** Heatmap squares are black instead of green shades.
**Fix:** Color scale must be:
```
0: rgba(0,0,0,0.03)
1: rgba(45,106,79,0.15)
2: rgba(45,106,79,0.3)
3: rgba(45,106,79,0.5)
4: rgba(45,106,79,0.7)
5: #2D6A4F
```

### D4 — Radar chart same % for all prayers
**Current:** All vertices show "59%"
**Fix:** Each prayer must use its own individual completion rate calculated from actual data. Not the overall average.

### D5 — Qada report old style
**Current:** Old cards with colored borders.
**Required:** New design per DESIGN-GUIDE: proportional color blocks + per-prayer breakdown with mini bars.

### D6 — Missing Weekly Rhythm chart
**Required:** Circular/radial chart showing congregation % per day of week.

---

## PRIORITY 4: AZKAR REBUILD

### A1 — Complete Azkar restructure
**Current:** Described as "totally a mess."
**Required structure:**

**Top:** Segmented control toggle:
```
أذكار الصباح (light_mode icon) | أذكار المساء (nights_stay icon)
```

**Calendar grid:** IDENTICAL to fard tracker calendar style:
- Flowing sequential grid (1-29/30), NOT week-based
- Same rounded square day circles (36×36, borderRadius 10)
- Hijri + Gregorian dual numbers always visible
- Only TWO states:
  - Empty: transparent bg, thin border
  - Completed: blue gradient bg (#0EA5E9 → #38BDF8), white text, white circle badge with check
- Today: blue border highlight
- Future: disabled (opacity 0.2)

**Stats bar:** completed / total / rate %
**"تحديد الكل" button**
**Month navigation:** Same compact style as fard

**Sub-views:** Same segmented control:
```
التتبع (grid_view) | السنة (calendar_month) | لوحة التحكم (analytics)
```

**Data key:** `salah_azkar_{profileId}_h{hijriYear}_{hijriMonth}`
**Value:** `{ morning: { "1": true, "2": true }, evening: { "1": true } }`

---

## PRIORITY 5: GLOBAL CONSISTENCY

### G1 — All cards use glassmorphism
```css
background: rgba(255,255,255,0.55);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border-radius: 20px;
border: 1px solid rgba(0,0,0,0.04);
```

### G2 — Page background
```css
background: #F5F3EF;
```

### G3 — Font consistency
- Arabic text: 'Noto Kufi Arabic'
- Numbers: 'Rubik' with font-variant-numeric: tabular-nums
- Icons: 'Material Symbols Rounded'
- NO emojis anywhere

### G4 — Apply same fixes to Sunnah section
All home screen fixes (H1-H11) apply equally to Sunnah. Same calendar style, same day circles, same header.

### G5 — Apply same fixes to Fasting section
Same design system for Ramadan and voluntary fasting grids.

### G6 — Update service-worker.js
Bump cache version after all changes.

---

## Process ALL fixes

```
Read DESIGN-FIX-V2.md fully.
Process ALL priorities (P0 through G6) without stopping.
Start with P0 (critical functional bugs) — the app must work before design matters.
Then apply all design fixes.
Do NOT ask me to test between items.
Run syntax checks after each file change.
When EVERYTHING is done, give me a complete summary of changes and tell me to test.
```
