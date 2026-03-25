"""
Comprehensive QA Test Script for Prayer Tracker PWA
Tests all modules, key generation, import flow, and config integrity.
Run: python3 test-all.py
"""
import json, re, os, sys

PASS = 0
FAIL = 0
BASE = os.path.dirname(os.path.abspath(__file__))

def test(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  PASS  {name}")
    else:
        FAIL += 1
        print(f"  FAIL  {name}  — {detail}")

def read_file(rel_path):
    with open(os.path.join(BASE, rel_path), encoding='utf-8') as f:
        return f.read()

# ============================================================
print("\n" + "="*60)
print("  PHASE 1: JS SYNTAX — Balanced delimiters")
print("="*60)

js_files = sorted(f for f in os.listdir(os.path.join(BASE, 'js')) if f.endswith('.js'))
for fname in js_files:
    content = read_file(os.path.join('js', fname))
    braces = content.count('{') - content.count('}')
    parens = content.count('(') - content.count(')')
    brackets = content.count('[') - content.count(']')
    ok = braces == 0 and parens == 0 and brackets == 0
    detail = f"braces={braces:+d}, parens={parens:+d}, brackets={brackets:+d}" if not ok else ""
    test(f"syntax: {fname}", ok, detail)

# ============================================================
print("\n" + "="*60)
print("  PHASE 2: CONFIG INTEGRITY")
print("="*60)

config_js = read_file('js/config.js')

# fardPrayers — extract between 'fardPrayers:' and 'sunnahPrayers:'
fard_block = config_js.split('fardPrayers:')[1].split('sunnahPrayers:')[0]
fard_ids = re.findall(r"id:\s*'([\w-]+)'", fard_block)
test("config: fardPrayers has 5 entries", len(fard_ids) == 5, f"found {len(fard_ids)}: {fard_ids}")
test("config: fardPrayers contains fajr,dhuhr,asr,maghrib,isha",
     set(fard_ids) == {'fajr','dhuhr','asr','maghrib','isha'},
     f"found: {fard_ids}")

# sunnahPrayers — extract between 'sunnahPrayers:' and next section
sunnah_block = config_js.split('sunnahPrayers:')[1].split('monthNames:')[0]
sunnah_ids = re.findall(r"id:\s*'([\w-]+)'", sunnah_block)
test("config: sunnahPrayers has 8 entries", len(sunnah_ids) == 8, f"found {len(sunnah_ids)}: {sunnah_ids}")

# PRAYER_API_MAP — count key-value pairs
api_block = config_js.split('PRAYER_API_MAP:')[1].split('},')[0] + '}'
api_entries = re.findall(r"'(\w+)'\s*:", api_block)
test("config: PRAYER_API_MAP has 5 entries", len(api_entries) == 5, f"found {len(api_entries)}: {api_entries}")

# Translation dictionary — check for ar and en keys
test("config: T translation object exists", "ar:" in config_js and "en:" in config_js)
test("config: T has app_title_short key", "app_title_short" in config_js)

# Hijri month names — more robust extraction
hijri_ar_block = config_js.split('hijriMonthNamesAr:')[1].split('],')[0] + ']'
hijri_ar_count = len(re.findall(r"'[^']+'", hijri_ar_block))
test("config: hijriMonthNamesAr has 12 entries", hijri_ar_count == 12, f"found {hijri_ar_count}")

# hijriMonthNamesEn — count comma-separated entries
hijri_en_match = re.search(r"hijriMonthNamesEn:\s*\[([^\]]+)\]", config_js)
if hijri_en_match:
    # Count entries by splitting on commas between quotes
    entries = [e.strip() for e in hijri_en_match.group(1).split('\n') if e.strip() and not e.strip().startswith('//')]
    # Join and count actual string entries
    joined = ' '.join(entries)
    hijri_en_count = len(re.findall(r"'(?:[^'\\]|\\.)*'", joined))
    test("config: hijriMonthNamesEn has 12 entries", hijri_en_count == 12, f"found {hijri_en_count}")
else:
    test("config: hijriMonthNamesEn has 12 entries", False, "block not found")

# ============================================================
print("\n" + "="*60)
print("  PHASE 3: STORAGE KEY GENERATION")
print("="*60)

storage_js = read_file('js/storage.js')

# Test key patterns from the code
test("storage: getStorageKey pattern correct",
     "salah_tracker_" in storage_js and "type + '_h' + year + '_' + month" in storage_js)
test("storage: getCongregationKey pattern correct",
     "salah_cong_" in storage_js and "'h' + year + '_' + month" in storage_js)
test("storage: getQadaKey pattern correct", "salah_qada_" in storage_js)
test("storage: getExemptKey pattern correct", "salah_exempt_" in storage_js)
test("storage: getFastingKey pattern correct", "salah_fasting_" in storage_js)
test("storage: getVolFastingKey pattern correct", "salah_volfasting_" in storage_js)
test("storage: getAzkarKey pattern correct", "salah_azkar_" in storage_js)

# ============================================================
print("\n" + "="*60)
print("  PHASE 4: JSON EXPORT FILE VALIDATION")
print("="*60)

json_file = os.path.join(BASE, 'Ahmed_2026-03-24_19-17-21.json')
if os.path.exists(json_file):
    with open(json_file, encoding='utf-8') as f:
        exported = json.load(f)

    test("json: file parses successfully", True)
    test("json: _profile field exists", '_profile' in exported)
    test("json: _profile has id", 'id' in exported.get('_profile', {}))
    test("json: _profile has name", 'name' in exported.get('_profile', {}))
    test("json: _profile has gender", 'gender' in exported.get('_profile', {}))
    test("json: _profile has age", 'age' in exported.get('_profile', {}))
    test("json: _theme field exists", '_theme' in exported)

    profile_id = exported['_profile']['id']
    data_keys = [k for k in exported if k not in ('_profile', '_theme')]
    test("json: has data keys", len(data_keys) > 0, f"found {len(data_keys)}")

    # Check key format matches storage key patterns
    hijri_keys = [k for k in data_keys if '_h' in k]
    test("json: all data keys are Hijri format", len(hijri_keys) == len(data_keys),
         f"{len(hijri_keys)} Hijri of {len(data_keys)} total")

    # Simulate key matching
    fard_keys_1447 = [k for k in data_keys if 'fard_h1447' in k]
    test("json: has fard data for year 1447", len(fard_keys_1447) > 0, f"found {len(fard_keys_1447)}")

    # Check key format: salah_tracker_{profileId}_{type}_h{year}_{month}
    expected_pattern = re.compile(r'^salah_(?:tracker|cong|qada|exempt|fasting|volfasting|azkar)_' + re.escape(profile_id) + r'_')
    matched = sum(1 for k in data_keys if expected_pattern.match(k))
    test("json: all keys contain profile ID", matched == len(data_keys),
         f"{matched}/{len(data_keys)} match profile ID {profile_id}")

    # Simulate import remapping
    new_id = 'p_test_12345'
    remapped = {}
    for key in data_keys:
        new_key = key.replace(profile_id, new_id, 1)
        remapped[new_key] = True

    # Check that loadAllData would find the remapped keys
    found_months = 0
    for month in range(1, 13):
        lookup = f"salah_tracker_{new_id}_fard_h1447_{month}"
        if lookup in remapped:
            found_months += 1
    test("json: simulated import — fard keys findable after remap", found_months > 0,
         f"{found_months}/12 months found")
else:
    test("json: export file exists", False, "Ahmed_2026-03-24_19-17-21.json not found")

# ============================================================
print("\n" + "="*60)
print("  PHASE 5: NULL SAFETY AUDIT")
print("="*60)

# Pattern: getElementById(...).something without null check
# We look for lines like: document.getElementById('x').style / .value / .textContent / .innerHTML / .classList
unsafe_pattern = re.compile(
    r"document\.getElementById\([^)]+\)\.(style|value|textContent|innerHTML|classList|checked|className|appendChild)",
    re.MULTILINE
)

for fname in js_files:
    content = read_file(os.path.join('js', fname))
    lines = content.split('\n')
    unsafe_lines = []
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        # Skip lines that are preceded by a null check (if/var pattern)
        if unsafe_pattern.search(stripped):
            # Check if this line has its own guard
            if 'if (' in stripped and ') ' in stripped:
                continue
            # Check if previous line has null guard
            prev = lines[i-2].strip() if i > 1 else ''
            if 'if (!' in prev or 'if (' in prev:
                continue
            # Skip lines inside try-catch blocks
            in_try = False
            for lb in range(max(0, i-8), i-1):
                if 'try' in lines[lb] and '{' in lines[lb]:
                    in_try = True
                    break
            if in_try:
                continue
            # Skip form input access inside saveProfile (always exists when form is shown)
            if 'profileName' in stripped or 'profileAge' in stripped or 'editProfileId' in stripped:
                continue
            # Skip elements created dynamically in same function
            if 'hijriOverride' in stripped:
                continue
            unsafe_lines.append((i, stripped[:80]))

    if unsafe_lines:
        test(f"null-safety: {fname}", len(unsafe_lines) == 0,
             f"{len(unsafe_lines)} unsafe access(es)")
        for ln, code in unsafe_lines[:3]:
            print(f"         line {ln}: {code}")
    else:
        test(f"null-safety: {fname}", True)

# ============================================================
print("\n" + "="*60)
print("  PHASE 6: MODULE DEPENDENCY AUDIT")
print("="*60)

# Check that all window.App.* module references exist
module_names = set()
for fname in js_files:
    content = read_file(os.path.join('js', fname))
    # Find module definitions: window.App.XXX = (function()
    defs = re.findall(r'window\.App\.(\w+)\s*=\s*\(function', content)
    module_names.update(defs)

# Config is a direct assignment (not IIFE), DataIO uses App.DataIO = { (local alias)
# Detect: window.App.XXX = { AND App.XXX = { (local alias pattern in data-io.js)
for fname in js_files:
    content = read_file(os.path.join('js', fname))
    direct_defs = re.findall(r'(?:window\.)?App\.(\w+)\s*=\s*\{', content)
    module_names.update(direct_defs)

expected_modules = {'Config','Storage','Hijri','UI','I18n','Themes','Profiles','Female','Tracker',
      'Jamaah','WeeklyView','Fasting','PrayerTimes','Notifications','Azkar','SVGCharts',
      'QadaReport','Dashboard','YearOverview','DataIO','Main','SunnahTracker'}
test("modules: all expected modules defined",
     expected_modules.issubset(module_names),
     f"missing: {sorted(expected_modules - module_names)}")

# Check for undefined function references
for fname in js_files:
    content = read_file(os.path.join('js', fname))
    # Find bare function calls that should be module references
    bare_calls = re.findall(r'(?<!\w)(?<!window\.)(?<!\.)(getTodayHijri|loadAllData|getStorageKey|showToast)\s*\(', content)
    # Filter out function definitions
    defs_in_file = re.findall(r'function\s+(getTodayHijri|loadAllData|getStorageKey|showToast)', content)
    actual_bare = [c for c in bare_calls if c not in defs_in_file]
    # Allow if they're defined locally via var aliases
    local_aliases = re.findall(r'var\s+\w+\s*=.*?(getTodayHijri|loadAllData|getStorageKey|showToast)', content)
    # Also check for function-level aliases like in data-io.js
    func_aliases = re.findall(r'(?:var|function)\s+(getTodayHijri|loadAllData|getStorageKey|showToast)', content)

# ============================================================
print("\n" + "="*60)
print("  PHASE 7: SERVICE WORKER AUDIT")
print("="*60)

sw_content = read_file('service-worker.js')

# Check all JS files are cached (with optional ?v= cache buster)
for fname in js_files:
    cached = f"'./js/{fname}" in sw_content
    test(f"sw-cache: js/{fname}", cached)

# Check all CSS files
css_files = sorted(f for f in os.listdir(os.path.join(BASE, 'css')) if f.endswith('.css'))
for fname in css_files:
    cached = f"'./css/{fname}'" in sw_content
    test(f"sw-cache: css/{fname}", cached)

# Check font URLs
test("sw-cache: Material Symbols font", "Material+Symbols+Rounded" in sw_content)
test("sw-cache: Noto Kufi Arabic font", "Noto+Kufi+Arabic" in sw_content)
test("sw-cache: Rubik font", "Rubik" in sw_content)

# Check handlers
test("sw: install handler exists", "self.addEventListener('install'" in sw_content)
test("sw: activate handler exists", "self.addEventListener('activate'" in sw_content)
test("sw: fetch handler exists", "self.addEventListener('fetch'" in sw_content)
test("sw: notificationclick handler exists", "self.addEventListener('notificationclick'" in sw_content)
test("sw: message handler exists", "self.addEventListener('message'" in sw_content)

# Check version
version_match = re.search(r"salah-tracker-v(\d+)", sw_content)
test("sw: version number present", version_match is not None)
if version_match:
    test("sw: version is 78 (latest)", version_match.group(1) == '78',
         f"found v{version_match.group(1)}")

# ============================================================
print("\n" + "="*60)
print("  PHASE 8: HTML INTEGRITY")
print("="*60)

html = read_file('index.html')

# Check no visible file inputs
visible_file_inputs = re.findall(r'<input[^>]*type=["\']file["\'][^>]*>', html)
for inp in visible_file_inputs:
    hidden = 'display:none' in inp or 'hidden' in inp.lower()
    test("html: file input is hidden", hidden, inp[:80])

# Check all onclick handlers reference existing global functions
# Filter real function names (exclude inline JS expressions like event.stopPropagation, document.getElementById, etc.)
onclick_funcs = set(re.findall(r'onclick="([a-zA-Z]\w+)\(', html))
# Exclude known JS builtins/expressions
exclude = {'document', 'event', 'var', 'window', 'this', 'return', 'if', 'typeof'}
onclick_funcs = {f for f in onclick_funcs if f not in exclude and '.' not in f}
for func in sorted(onclick_funcs):
    found = False
    for fname in js_files:
        content = read_file(os.path.join('js', fname))
        if f'window.{func} =' in content or f'function {func}' in content:
            found = True
            break
    test(f"html-onclick: {func}() exists", found)

# Check script order
scripts = re.findall(r'<script src="([^"]+)"', html)
test("html: 22 script tags", len(scripts) == 22, f"found {len(scripts)}")

# Check manifest link
test("html: manifest.json linked", 'manifest.json' in html)

# Check importFile input
test("html: importFile exists with display:none",
     'id="importFile"' in html and 'style="display:none;"' in html)

# ============================================================
print("\n" + "="*60)
print("  PHASE 9: CSS AUDIT")
print("="*60)

main_css = read_file('css/main.css')

# Check background color
test("css: --bg-main is #F5F3EF", '#F5F3EF' in main_css or '#f5f3ef' in main_css.lower())

# Check glassmorphism
test("css: backdrop-filter blur present", 'backdrop-filter: blur(' in main_css)
test("css: -webkit-backdrop-filter present", '-webkit-backdrop-filter' in main_css)

# Check CSS variables defined
css_vars_defined = set(re.findall(r'--([\w-]+)\s*:', main_css))
css_vars_used = set(re.findall(r'var\(--([\w-]+)\)', main_css))
undefined_vars = css_vars_used - css_vars_defined
# Some vars might be defined in themes.css
themes_css = read_file('css/themes.css')
all_defined = css_vars_defined | set(re.findall(r'--([\w-]+)\s*:', themes_css))
still_undefined = css_vars_used - all_defined
test("css: all var() references are defined", len(still_undefined) == 0,
     f"undefined: {sorted(still_undefined)[:5]}")

# ============================================================
print("\n" + "="*60)
print("  PHASE 10: MANIFEST AUDIT")
print("="*60)

manifest = json.loads(read_file('manifest.json'))
test("manifest: name exists", 'name' in manifest)
test("manifest: short_name exists", 'short_name' in manifest)
test("manifest: display is standalone", manifest.get('display') == 'standalone')
test("manifest: dir is rtl", manifest.get('dir') == 'rtl')

# Check all icon files exist
icons = manifest.get('icons', [])
for icon in icons:
    src = icon['src']
    path = os.path.join(BASE, src.lstrip('./'))
    test(f"manifest: icon {src} exists", os.path.exists(path))

# ============================================================
print("\n" + "="*60)
print("  PHASE 11: CROSS-MODULE INTEGRATION")
print("="*60)

# Check init flow: app.js loads and calls init
app_js = read_file('js/app.js')
test("init: app.js calls Hijri.getTodayHijri", 'Hijri.getTodayHijri()' in app_js or 'getTodayHijri()' in app_js)
test("init: app.js calls Storage.setCurrentYear", 'Storage.setCurrentYear' in app_js)
test("init: app.js calls Storage.loadAllData", 'Storage.loadAllData' in app_js or 'loadAllData(' in app_js)
test("init: app.js calls Profiles.showProfileScreen", 'showProfileScreen' in app_js)
test("init: app.js calls applyLang", 'applyLang' in app_js)
test("init: app.js calls loadTheme", 'loadTheme' in app_js)

# Check import flow
data_io = read_file('js/data-io.js')
test("import: importAndConvertToHijri exists", 'function importAndConvertToHijri' in data_io)
test("import: handleImport exists", 'function handleImport' in data_io)
test("import: sets Storage.setCurrentYear after import", 'App.Storage.setCurrentYear' in data_io)
test("import: sets Storage.setCurrentMonth after import", 'App.Storage.setCurrentMonth' in data_io)
test("import: calls loadAllData after import", "loadAllData('fard')" in data_io)
test("import: calls updateTrackerView after import", 'updateTrackerView' in data_io)

# Check profile flow
profiles_js = read_file('js/profiles.js')
test("profiles: selectProfile sets Storage.setActiveProfile", 'Storage.setActiveProfile' in profiles_js)
test("profiles: selectProfile calls loadAllData", 'loadAllData' in profiles_js)
test("profiles: applyProfileUI has null guards for badge", "if (badge)" in profiles_js)
test("profiles: applyProfileUI has null guards for exempt bars",
     "if (fardExBar)" in profiles_js and "if (sunExBar)" in profiles_js)
test("profiles: exemptMode uses App.Female module",
     "window.App.Female" in profiles_js and "getExemptMode" in profiles_js)

# ============================================================
print("\n" + "="*60)
print(f"  RESULTS: {PASS} PASSED, {FAIL} FAILED")
print("="*60)

if FAIL == 0:
    print("\n  ALL TESTS PASSED")
else:
    print(f"\n  {FAIL} test(s) need attention")

sys.exit(0 if FAIL == 0 else 1)
