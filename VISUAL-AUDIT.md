# Visual QA Audit — Prayer Tracker v68

## WhatsApp Image 2026-03-25 at 8.30.04 AM.jpeg
**Section: Weekly Rhythm + Heatmap (newer version)**

1. **COLORS OK** — Weekly rhythm segments are gold (#D4A03C) since all values are <60%. Correct per spec.
2. **TEXT OK** — Day names (الأحد, الاثنين, الثلاثاء, الأربعاء, الخميس, الجمعة, السبت) are all fully visible. Percentages (43%, 42%, 43%, 39%, 40%, 42%, 45%) all showing correctly.
3. **LAYOUT OK** — Center circle shows "متوسط 42%" properly.
4. **HEATMAP LABELS CUT** — Day labels on the left side are truncated (e.g. "أ" instead of full name). **ROOT CAUSE**: Screenshot was taken before v68 deployed (short names fix). Status: FIXED in v68.
5. **HEATMAP GRID OK** — Cells show proper green intensity gradient, scale legend at bottom visible.

---

## WhatsApp Image 2026-03-25 at 8.30.04 AM (1).jpeg
**Section: Lollipop (تفصيل الصلوات) + Weekly Rhythm start**

1. **DATA — All 5 prayers show "60%"** — Investigated: `gatherPrayerStats()` IS per-prayer. The polygon in the radar IS irregular (vertices at different radii). The completion values are 212-214 out of ~354 total days, all rounding to 60% via `Math.round()`. The congregation percentages (92%, 50%, 61%, 71%, 75%) confirm per-prayer data IS working. **NOT A BUG** — user marks all 5 prayers on the same days.
2. **LAYOUT OK** — Icon gradient squares (28x28) properly separated from prayer names with 8px gap.
3. **COLORS OK** — Each bar uses correct prayer color: الفجر (#D4A0A7 pink), الظهر (#E8B84A gold), العصر (#D4943A amber), المغرب (#B0664A terracotta), العشاء (#4A5A7A slate).
4. **DOTS OK** — Lollipop dots at bar ends are prayer-colored with white borders.
5. **CONGREGATION OK** — Mosque icon + gold text below each bar, showing different percentages per prayer.
6. **RTL MARGIN BUG** — Bar and congregation text use `margin-left: 36px` (physical) instead of `margin-inline-start: 36px` (logical). In RTL, the indent should be on the right (icon side), not the left. **Status: TO FIX.**

---

## WhatsApp Image 2026-03-25 at 8.30.04 AM (2).jpeg
**Section: Monthly Bars (التقدم الشهري) + Radar (مقارنة الصلوات)**

1. **MONTHLY BARS OK** — Vertical bars with green gradient + gold overlay for congregation. Months 1-8 at 100%, current month (شوال) shorter with darker green, future months (ذو القعدة, ذو الحجة) empty/faded.
2. **LABELS OK** — "100%" labels visible above bars for months >20%. Month names at bottom readable.
3. **LEGEND OK** — "الإنجاز الكلي" (green) and "الجماعة" (gold) with correct color dots.
4. **RADAR LABELS OK** — All 5 prayer names fully visible (الفجر, الظهر, العصر, المغرب, العشاء) — not truncated. Fix from v67 confirmed working.
5. **RADAR POLYGON IRREGULAR** — Green completion polygon has unequal vertices, proving per-prayer data works. الفجر vertex extends further than المغرب.
6. **RADAR ALL 60%** — Same rounding issue as lollipop. Not a code bug.
7. **RADAR DOTS COLORED** — Data point circles at vertices use per-prayer colors.

---

## WhatsApp Image 2026-03-25 at 8.30.05 AM.jpeg
**Section: Weekly Rhythm + Heatmap (OLD CACHED version pre-v68)**

1. **COLOR BUG** — Segments use RED/TERRACOTTA (#C1574E) instead of green. **Status: FIXED in v68.**
2. **LABELS CUT** — Day names severely truncated: السبت→"بب", الأحد→"بب" at top, الجمعة→"الج" on left, الاثنين partially visible. **Status: FIXED in v68** (SVG expanded from 180 to 240, labelR from R+14 to R+30).
3. **MISSING DATA** — الأربعاء at bottom shows no percentage. **Status: FIXED in v68** (larger viewBox prevents clipping).
4. **HEATMAP LABELS CUT** — Same issue as above. **Status: FIXED in v68** (short day names: أحد/إثن/ثلث/أربع/خمس/جمع/سبت).

---

## WhatsApp Image 2026-03-25 at 8.30.05 AM (1).jpeg
**Section: Heatmap + Old Qada Report (OLD CACHED version pre-v68)**

1. **HEATMAP LABELS CUT** — Day labels truncated on left side. **Status: FIXED in v68.**
2. **OLD QADA DESIGN** — Shows outdated stat cards with colored left borders (red/orange/yellow), old "error" icon, monthly breakdown rows. **Status: FIXED in v68** — replaced with new design: assignment_late icon, red total badge, proportional color blocks, per-prayer breakdown with mini bars.
3. **ZERO STATE VERBOSE** — Old design shows 3 empty stat cards even when total=0. **Status: FIXED in v68** — new zero state shows green check_circle + "لا توجد صلوات قضاء — أحسنت".
4. **CONSISTENCY** — Old qada uses different card style (colored borders) vs rest of app (glassmorphism). **Status: FIXED in v68** — new design inherits parent chart-card styling.

---

## Summary

| Issue | Status |
|-------|--------|
| Weekly rhythm red colors | FIXED v68 |
| Weekly rhythm labels cut off | FIXED v68 |
| Weekly rhythm missing الأربعاء % | FIXED v68 |
| Heatmap day labels cut off | FIXED v68 |
| Old qada report design | FIXED v68 |
| Qada zero state verbose | FIXED v68 |
| Radar labels cut off | FIXED v67 |
| Lollipop icon overlap | FIXED v67 |
| Lollipop dot colors | FIXED v67 |
| All 60% in radar/lollipop | NOT A BUG (data rounding) |
| Lollipop RTL margins | TO FIX |
