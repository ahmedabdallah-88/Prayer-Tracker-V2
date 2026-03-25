# Prayer Tracker — Design Bug Fixes for Claude Code

## Context

We completed Milestone 1-3 from DESIGN-GUIDE.md but the implementation has significant differences from the designed screens. This document lists EVERY difference that needs fixing.

Read DESIGN-GUIDE.md first for reference, then fix ALL issues below.

---

## SECTION 1: HOME SCREEN (المتتبع الشهري) — CRITICAL FIXES

Compare current implementation with DESIGN-GUIDE.md "SCREEN 3: Home Screen"

### BUG 1.1 — Remove Quran verse from home screen
**Current:** Shows "سجل قضاء الصلوات - الفرائض والسنن" header with Quran verse ﴿إِنَّ الصَّلَاةَ...﴾ and [النساء: 103] on the home tracker view.
**Required:** Remove this entirely from the tracker view. The Quran verse should ONLY appear on the first-time welcome/profile screen (when no profiles exist). The home screen header should just be:
- "سجل الصلوات" (24px, weight 800) as app title
- "شوال ١٤٤٧ هـ — مارس ٢٠٢٦" as subtitle with calendar_today icon

### BUG 1.2 — Remove old profile bar from home screen
**Current:** Shows "Ahmed → تبديل" with profile icon in the header area.
**Required:** Remove this. Profile switching should ONLY be accessible through the profile avatar button (green circle, top-left with person icon). Clicking the avatar opens Profile Settings overlay.

### BUG 1.3 — View switcher (segmented control) is old style
**Current:** Old tab bar style with "المتتبع الشهري | نظرة السنة | لوحة التحكم" as plain text tabs.
**Required:** Modern pill-style segmented control with Material icons:
```
التتبع (grid_view) | السنة (calendar_month) | الإحصائيات (analytics)
```
- Background: rgba(43,45,66,0.06), borderRadius: 12, padding: 3
- Active segment: white bg, shadow, icon filled, text #2B2D42
- Inactive: transparent, icon outlined, text #8D99AE

### BUG 1.4 — Month navigation is old style
**Current:** Two full-width buttons "◄ الشهر السابق" and "الشهر التالي ►" on one row, plus separate "الشهر: شوال" dropdown and "السنة الهجرية: 1447" input on separate rows.
**Required:** Single compact row:
- Small circular ◄ ► buttons (30x30, borderRadius: 10)
- Center: "شوال ١٤٤٧" label (16px, weight 700)
- "30" days count badge (small pill)
- Small settings gear icon (⚙️ for Hijri override)
All on ONE line, not multiple rows.

### BUG 1.5 — Calendar grid is COMPLETELY WRONG (most critical)
**Current:** 7-column week-based grid with day-of-week headers (أحد، إثن، ثلث، أرب، خمس، جمع، سبت). Days arranged by weekday. Empty cells for days that don't start on Sunday.
**Required:** Flowing sequential grid — days 1 to 29/30 laid out sequentially in rows, wrapping naturally. NO day-of-week headers, NO week structure. Just a continuous flow of day circles:
```
1  2  3  4  5  6  7  8
9  10 11 12 13 14 15 16
17 18 19 20 21 22 23 24
25 26 27 28 29 30
```
Day circles: 36x36px, borderRadius: 10 (rounded square NOT circle), gap: 4-5px.

### BUG 1.6 — Day circle states are wrong
**Current:** Marked days show only the mosque icon badge and number, but the day circle styling doesn't match the design.
**Required:** Each day circle ALWAYS shows:
- Hijri day number (12px, bold, centered)
- Gregorian day number (7.5px, below Hijri, muted)
The STATE is shown ONLY via:
- Background color (green gradient for prayed/congregation, red gradient for qada)
- A small BADGE (14x14px) positioned at top-right corner (top: -4, right: -4):
  - Prayed alone: white circle badge with green check icon
  - Congregation: gold rounded-square badge with white mosque icon
  - Qada: white circle badge with red schedule/clock icon
- Text color: white on colored backgrounds, dark on empty

### BUG 1.7 — Prayer header row style
**Current:** Old style with text-based prayer name and icons.
**Required:** Each prayer row header should have:
- Sky-time gradient icon square (34x34, borderRadius: 10) with Material Symbol icon:
  - الفجر: wb_twilight on dawn pink gradient (#E8B4B8 → #D4A0A7)
  - الظهر: wb_sunny on noon gold gradient (#F0C75E → #E8B84A)
  - العصر: partly_cloudy_day on amber gradient (#E8A849 → #D4943A)
  - المغرب: wb_twilight on terracotta gradient (#C47A5A → #B0664A)
  - العشاء: dark_mode on slate gradient (#5B6B8A → #4A5A7A)
- Prayer name (15px, weight 700)
- Congregation count pill (gold bg, mosque icon + count)
- Completion % pill (color-coded: green ≥80, gold ≥50, red <50)

### BUG 1.8 — Prayer times bar style
**Current:** Old horizontal layout with "مواقيت الصلاة" header text and basic boxes.
**Required:** 5 compact boxes in a row, each with:
- Material icon for the prayer (sky-time colored)
- Prayer name (10px)
- Time (12px, Rubik font)
- Current prayer: green gradient bg (#2D6A4F → #40916C), white text, shadow
- Past prayers: opacity 0.45
- No "مواقيت الصلاة" header text

### BUG 1.9 — Missing next prayer countdown card
**Current:** Not visible or old style.
**Required:** Dedicated glassmorphism card:
- hourglass_top icon in green-tinted square
- "الصلاة القادمة" label + prayer name
- Countdown timer (20px, weight 800, green, Rubik font, tabular-nums)

### BUG 1.10 — Stats cards are old style
**Current:** Shows "نسبة الإنجاز 4%" / "إجمالي الصلوات المتبقية 139" / "إجمالي الصلوات المقضية 6" as separate old-style cards.
**Required:** Remove these separate stats cards from the tracker view. Stats are shown in the prayer row headers (per-prayer % pill) and in the dashboard view.

### BUG 1.11 — Legend placement and style
**Current:** Legend (منفرد / جماعة / قضاء) inside each prayer section at the bottom.
**Required:** ONE legend bar at the very bottom of the prayers container (after all 5 prayers), centered, with mini styled squares matching the badge design:
- Green rounded square with white check → منفرد
- Green rounded square with gold border + white mosque → جماعة
- Red rounded square with white clock → قضاء

### BUG 1.12 — Export/Import buttons still on main screen
**Current:** "Choose file" / "No file chosen" still visible at bottom of dashboard.
**Required:** Remove ALL export/import UI from the main screen. These are ONLY in Profile Settings → إدارة البيانات.

### BUG 1.13 — Reminder bar style
**Current:** Old yellow/beige bar "لم تُسجّل بعد: الفجر، الظهر، العصر، المغرب"
**Required:** Restyle to match the new design system — glassmorphism card with Material icon, muted colors, dismiss X button.

---

## SECTION 2: DASHBOARD (الإحصائيات / لوحة التحكم) — FIXES

### BUG 2.1 — Dashboard header
**Current:** Still shows "سجل قضاء الصلوات" with Quran verse and "Ahmed → تبديل" at top.
**Required:** Same clean header as home screen. No Quran verse, no profile bar. Just "سجل الصلوات" + Hijri date + avatar button.

### BUG 2.2 — Old summary cards still present
**Current:** Green card "إجمالي الانضباط 59% — 1041 / 1775" and "أفضل شهر: ربيع الأول" / "الصلاة الأكثر انتظاماً: الفجر" cards in old style.
**Required:** Replace with Orbital Progress (two rings only — الإنجاز green outer + الجماعة gold inner). No separate cards for best month/prayer — these can be small text items inside the orbital progress side panel.

### BUG 2.3 — Streak flame bars are EMPTY
**Current:** All 5 flame bars show only dashed ghost outlines with no filled bars. Looks like the current streak values are 0 or data mapping is broken.
**Required:** Debug the data flow. The streak bars should read from `calculateStreak()` which returns `{current, best}` per prayer. Check:
- Is `calculateStreak` being called with correct parameters?
- Is the returned data being passed to the flame bars component?
- Are the bar heights calculated correctly as `(current / maxBest) * 100%`?

### BUG 2.4 — Heatmap uses wrong colors
**Current:** Heatmap squares are black/dark instead of green gradient shades.
**Required:** Color scale should be:
- 0 prayers: rgba(0,0,0,0.03) (nearly invisible)
- 1 prayer: rgba(45,106,79,0.15)
- 2 prayers: rgba(45,106,79,0.3)
- 3 prayers: rgba(45,106,79,0.5)
- 4 prayers: rgba(45,106,79,0.7)
- 5 prayers: #2D6A4F (full green)

### BUG 2.5 — Missing Weekly Rhythm chart
**Current:** Not visible in screenshots.
**Required:** The circular/radial chart showing congregation % per day of week (سبت → جمعة). 7 radial segments extending outward. See DESIGN-GUIDE.md for spec.

### BUG 2.6 — Qada report is old style
**Current:** Shows old cards: "إجمالي صلوات القضاء 0" / "أكثر صلاة قضاءً -" / "أسوأ شهر -" with colored borders.
**Required:** Replace with new design:
- Proportional color blocks (stacked horizontal bar, each prayer's sky-time color)
- Per-prayer breakdown rows: color dot + name + mini bar + count
- Total count badge (red, top-right)
- "assignment_late" Material icon in header

### BUG 2.7 — Mountain chart percentage labels
**Current:** Mountain chart looks mostly correct but percentage labels at peaks may overlap.
**Required:** Only show percentage labels on peaks ≥95%. Show dots on all active months. Ensure labels don't overlap — offset alternating labels up/down if needed.

### BUG 2.8 — Radar chart shows same % for all prayers
**Current:** All 5 prayers showing "59%" — seems like it's using overall rate instead of per-prayer rate.
**Required:** Each prayer vertex should use its own individual completion rate. Check that `PRAYER_RATES` equivalent data is being calculated per prayer from actual data.

### BUG 2.9 — Lollipop chart missing congregation markers
**Current:** Shows prayer bars but congregation % marker below each bar may be missing or misaligned.
**Required:** Each prayer row should show:
- Sky-time gradient icon (28x28)
- Prayer name
- Dual bar: gold bar behind (congregation %), colored bar front (completion %)
- Lollipop dot at end of completion bar
- "mosque" icon + congregation % below the bar

---

## SECTION 3: AZKAR (الأذكار) — REBUILD

### BUG 3.1 — Azkar structure is wrong
**Current:** Described as "totally a mess"
**Required:** Clean rebuild with this structure:

**Azkar section should have TWO clear sub-sections:**
1. أذكار الصباح (Morning Azkar) — icon: light_mode
2. أذكار المساء (Evening Azkar) — icon: nights_stay

**Toggle between morning/evening:**
- Segmented control at top (same pill style as view switcher):
  ```
  أذكار الصباح (light_mode) | أذكار المساء (nights_stay)
  ```

**Calendar grid:** SAME style as Fard prayer tracker:
- Flowing sequential day circles (1-29/30), NOT week-based grid
- Same rounded square shape (36x36, borderRadius: 10)
- Same dual calendar (Hijri + Gregorian number)
- Only TWO states (simpler than Fard):
  - Empty: transparent bg, thin border, dark numbers
  - Completed: blue gradient bg (#0EA5E9 → #38BDF8), white numbers, white circle badge with check icon
- Today highlighted with blue border
- Future dates disabled

**Stats bar:** completed / total / rate % (same style as fard)
**"تحديد الكل" button:** Same as fard
**Month navigation:** Same compact style (◄ شوال ١٤٤٧ ► with days badge)

**Azkar sub-views (same segmented control):**
- التتبع (grid_view) — the calendar tracker
- السنة (calendar_month) — year overview with 12 month cards
- لوحة التحكم (analytics) — dashboard with morning/evening stats

**Data storage:**
```
Key: salah_azkar_{profileId}_h{hijriYear}_{hijriMonth}
Value: { morning: { "1": true, "2": true, ... }, evening: { "1": true, ... } }
```

---

## SECTION 4: GENERAL / GLOBAL FIXES

### BUG 4.1 — All glassmorphism cards
Every card in the app should use:
```css
background: rgba(255,255,255,0.55);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border-radius: 20px;
border: 1px solid rgba(0,0,0,0.04);
```

### BUG 4.2 — Page background
**Current:** May still be old color.
**Required:** #F5F3EF (warm neutral) with subtle radial gradient overlays:
```css
background: #F5F3EF;
/* Plus subtle positioned radial gradients for depth */
```

### BUG 4.3 — Font consistency
- ALL Arabic text: 'Noto Kufi Arabic', sans-serif
- ALL numbers/percentages: 'Rubik', sans-serif with font-variant-numeric: tabular-nums
- ALL icons: 'Material Symbols Rounded'
- NO system fonts (Arial, sans-serif, etc.)
- NO emoji characters anywhere

### BUG 4.4 — Bottom tab bar style
**Current:** Tab bar exists with 4 tabs but may not match design.
**Required:**
- Background: rgba(245,243,239,0.92) with backdrop blur
- Active tab: green gradient pill (48x28, borderRadius: 14) behind filled icon + green label
- Inactive tab: outlined icon + grey label
- Icons: mosque (الفرائض) | auto_awesome (السنن) | nights_stay (الصيام) | menu_book (الأذكار)

### BUG 4.5 — Sunnah section
Apply the same design changes as Fard:
- Same calendar grid style (flowing, not week-based)
- Same day circle design (rounded squares with badges)
- Same prayer header row style (with sky-time gradients for each sunnah prayer)
- Dashboard: same chart types but WITHOUT congregation charts (no radar gold polygon, no weekly rhythm, no heatmap, no congregation lollipop layer)
- Streaks based on completion not congregation

### BUG 4.6 — Fasting section
Apply the same design system:
- Same calendar grid style for Ramadan and voluntary fasting
- Same glassmorphism cards
- Same Material icons
- Same color system

---

## Implementation Order

**Do these in order. After EACH group, verify before moving to next.**

### Step 1: Fix Home Screen (Bugs 1.1 → 1.13)
This is the most critical — the calendar grid (1.5) and day circles (1.6) are completely wrong.

### Step 2: Fix Dashboard (Bugs 2.1 → 2.9)
Focus on data mapping bugs (streaks, radar, heatmap colors).

### Step 3: Rebuild Azkar (Bug 3.1)
Fresh implementation following the spec above.

### Step 4: Global fixes (Bugs 4.1 → 4.6)
Apply design system to Sunnah, Fasting, and remaining screens.

### Step 5: Update service-worker.js
Bump cache version after all changes.

---

## CRITICAL REMINDERS

- NEVER touch the original prayer-tracker repo
- The calendar grid MUST be flowing sequential (1,2,3,4,5...) NOT week-based
- Day circles ALWAYS show date numbers in ALL states
- States are shown via background color + small corner badge ONLY
- NO emojis anywhere — Material Symbols only
- Export/Import ONLY in Profile Settings, nowhere else
- Quran verse ONLY on first-time welcome screen, not on home/dashboard

---

## How to Start

```
Read DESIGN-FIX.md fully.
Process ALL steps (1 through 5) without stopping.
Do NOT ask me to test between steps.
Run syntax checks yourself after each file change.
Fix all 28 bugs across all 4 sections in one session.
When EVERYTHING is done, give me a summary of what was changed and tell me to test.
```
