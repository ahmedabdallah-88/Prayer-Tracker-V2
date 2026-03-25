/**
 * svg-charts.js — Custom SVG Chart Library for Prayer Tracker
 * Replaces Chart.js with lightweight, themed SVG visualizations.
 */
window.App = window.App || {};
window.App.SVGCharts = (function() {

    var NS = 'http://www.w3.org/2000/svg';

    function el(tag, attrs, children) {
        var e = document.createElementNS(NS, tag);
        if (attrs) Object.keys(attrs).forEach(function(k) { e.setAttribute(k, attrs[k]); });
        if (children) {
            if (typeof children === 'string') e.textContent = children;
            else if (Array.isArray(children)) children.forEach(function(c) { if (c) e.appendChild(c); });
        }
        return e;
    }

    function svg(w, h, vb, children) {
        var s = el('svg', { width: '100%', height: h, viewBox: vb || ('0 0 ' + w + ' ' + h), preserveAspectRatio: 'xMidYMid meet' });
        s.style.overflow = 'visible';
        if (children) children.forEach(function(c) { if (c) s.appendChild(c); });
        return s;
    }

    function isRTL() { return document.dir === 'rtl' || document.documentElement.dir === 'rtl'; }

    // ==================== 1. ORBITAL PROGRESS (Ring chart) ====================

    function orbitalProgress(container, data) {
        container.innerHTML = '';
        var size = 180, cx = 90, cy = 90;
        var completionPct = data.completionPct || 0;
        var congPct = data.congPct || 0;
        var isAr = data.lang === 'ar';

        // --- Build SVG ---
        var children = [];

        // Outer track (الإنجاز)
        children.push(el('circle', { cx: cx, cy: cy, r: 72, fill: 'none', stroke: 'rgba(0,0,0,0.03)', 'stroke-width': 10 }));
        // Inner track (الجماعة)
        if (data.isFard) {
            children.push(el('circle', { cx: cx, cy: cy, r: 56, fill: 'none', stroke: 'rgba(0,0,0,0.03)', 'stroke-width': 8 }));
        }

        // Outer ring (الإنجاز): r=72, strokeWidth=10, green
        var outerCirc = 2 * Math.PI * 72;
        var outerOffset = outerCirc * (1 - completionPct / 100);
        var outerArc = el('circle', { cx: cx, cy: cy, r: 72, fill: 'none', stroke: '#40916C', 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-dasharray': outerCirc, 'stroke-dashoffset': outerOffset, transform: 'rotate(-90 ' + cx + ' ' + cy + ')' });
        outerArc.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
        children.push(outerArc);

        // Inner ring (الجماعة): r=56, strokeWidth=8, gold
        if (data.isFard) {
            var innerCirc = 2 * Math.PI * 56;
            var innerOffset = innerCirc * (1 - congPct / 100);
            var innerArc = el('circle', { cx: cx, cy: cy, r: 56, fill: 'none', stroke: '#D4A03C', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-dasharray': innerCirc, 'stroke-dashoffset': innerOffset, transform: 'rotate(-90 ' + cx + ' ' + cy + ')' });
            innerArc.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            children.push(innerArc);
        }

        // Center text
        children.push(el('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', fill: '#2B2D42', 'font-size': '36', 'font-weight': '800', 'font-family': 'Rubik, sans-serif' }, completionPct + ''));
        children.push(el('text', { x: cx, y: cy + 14, 'text-anchor': 'middle', fill: '#8D99AE', 'font-size': '12', 'font-weight': '600', 'font-family': 'Rubik, sans-serif' }, '%'));

        var s = svg(size, size, '0 0 ' + size + ' ' + size, children);
        s.style.flexShrink = '0';
        s.style.width = size + 'px';
        s.style.height = size + 'px';

        // --- Build layout: SVG left + legend right ---
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;align-items:center;gap:20px;';

        wrapper.appendChild(s);

        // Right side legend
        var legend = document.createElement('div');
        legend.style.cssText = 'flex:1;';

        var title = isAr ? 'التقدم السنوي' : 'Yearly Progress';
        var completionLabel = isAr ? 'الإنجاز' : 'Completion';
        var congLabel = isAr ? 'الجماعة' : 'Congregation';
        var congSuffix = isAr ? ' صلاة' : ' prayers';

        legend.innerHTML =
            '<div style="font-size:16px;font-weight:700;color:#2B2D42;margin-bottom:14px;font-family:\'Noto Kufi Arabic\',sans-serif;">' + title + '</div>' +
            // Item 1: الإنجاز
            '<div style="margin-bottom:12px;">' +
                '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">' +
                    '<span style="width:10px;height:10px;border-radius:3px;background:#40916C;flex-shrink:0;"></span>' +
                    '<span style="font-size:12px;color:#8D99AE;font-weight:600;">' + completionLabel + '</span>' +
                '</div>' +
                '<div style="font-size:11px;color:#8D99AE;font-weight:500;margin-bottom:2px;margin-inline-start:16px;">' + data.completed + ' / ' + data.total + '</div>' +
                '<div style="font-size:16px;font-weight:800;color:#40916C;font-family:\'Rubik\',sans-serif;margin-inline-start:16px;">' + completionPct + '%</div>' +
            '</div>' +
            // Item 2: الجماعة (fard only)
            (data.isFard ?
            '<div>' +
                '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">' +
                    '<span style="width:10px;height:10px;border-radius:3px;background:#D4A03C;flex-shrink:0;"></span>' +
                    '<span style="font-size:12px;color:#8D99AE;font-weight:600;">' + congLabel + '</span>' +
                '</div>' +
                '<div style="font-size:11px;color:#8D99AE;font-weight:500;margin-bottom:2px;margin-inline-start:16px;">' + data.congCount + congSuffix + '</div>' +
                '<div style="font-size:16px;font-weight:800;color:#D4A03C;font-family:\'Rubik\',sans-serif;margin-inline-start:16px;">' + congPct + '%</div>' +
            '</div>' : '');

        wrapper.appendChild(legend);
        container.appendChild(wrapper);
    }

    // ==================== 2. STREAK FLAME BARS ====================

    function streakFlameBars(container, data) {
        container.innerHTML = '';
        var prayers = data.prayers || [];
        var maxBest = Math.max.apply(null, prayers.map(function(p) { return Math.max(p.best, 1); }));
        var topStreak = prayers.reduce(function(a, b) { return a.current > b.current ? a : b; }, prayers[0]);

        // Gradient map by color
        var gradients = {
            '#D4A0A7': 'linear-gradient(135deg, #E8B4B8, #D4A0A7)',
            '#E8B84A': 'linear-gradient(135deg, #F0C75E, #E8B84A)',
            '#D4943A': 'linear-gradient(135deg, #E8A849, #D4943A)',
            '#B0664A': 'linear-gradient(135deg, #C47A5A, #B0664A)',
            '#4A5A7A': 'linear-gradient(135deg, #5B6B8A, #4A5A7A)'
        };

        // --- Flame bars area ---
        var barsRow = document.createElement('div');
        barsRow.style.cssText = 'display:flex;align-items:flex-end;justify-content:center;gap:12px;height:200px;padding:20px 8px 0;position:relative;overflow:visible;';

        // Horizontal guide lines
        [0.25, 0.5, 0.75, 1].forEach(function(pct) {
            var line = document.createElement('div');
            line.style.cssText = 'position:absolute;left:0;right:0;bottom:' + (pct * 100) + '%;height:1px;background:rgba(0,0,0,0.03);pointer-events:none;';
            barsRow.appendChild(line);
        });

        prayers.forEach(function(p, i) {
            var currentH = maxBest > 0 ? (p.current / maxBest) * 100 : 0;
            var bestH = maxBest > 0 ? (p.best / maxBest) * 100 : 0;
            var isAtBest = p.current === p.best && p.current > 0;
            var isTop = topStreak && p.name === topStreak.name;

            var col = document.createElement('div');
            col.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;position:relative;overflow:visible;';

            // Ghost (best) bar
            if (p.best > 0) {
                var ghost = document.createElement('div');
                ghost.style.cssText = 'position:absolute;bottom:0;width:70%;max-width:40px;height:' + bestH + '%;border-radius:12px 12px 6px 6px;background:' + p.color + '10;border:2px dashed ' + p.color + ';border-bottom:none;overflow:visible;transition:height 0.8s cubic-bezier(0.4,0,0.2,1);transition-delay:' + (i * 80) + 'ms;';
                // Best label on top
                var bestLbl = document.createElement('div');
                bestLbl.style.cssText = 'position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:700;color:' + p.color + ';font-family:Rubik,sans-serif;white-space:nowrap;';
                bestLbl.textContent = p.best;
                ghost.appendChild(bestLbl);
                col.appendChild(ghost);
            }

            // Current flame bar
            if (currentH > 0) {
                var flame = document.createElement('div');
                var minH = currentH > 0 ? Math.max(currentH, 10) : 0;
                var shadow = isTop
                    ? '0 -8px 24px ' + p.color + '50, 0 4px 12px ' + p.color + '30'
                    : '0 4px 12px ' + p.color + '25';
                flame.style.cssText = 'position:relative;z-index:1;width:70%;max-width:40px;height:' + minH + '%;min-height:20px;border-radius:14px 14px 6px 6px;background:linear-gradient(180deg,' + p.color + 'ee,' + p.color + ');box-shadow:' + shadow + ';transition:height 1s cubic-bezier(0.4,0,0.2,1);transition-delay:' + (i * 100) + 'ms;overflow:visible;';

                // Flame tip glow
                if (currentH > 15) {
                    var glow = document.createElement('div');
                    glow.style.cssText = 'position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:60%;height:12px;border-radius:50%;background:radial-gradient(ellipse,' + p.color + '40,transparent);filter:blur(4px);';
                    flame.appendChild(glow);
                }

                // Current number inside bar
                var numWrap = document.createElement('div');
                var numTop = currentH > 30 ? '8px' : '-22px';
                numWrap.style.cssText = 'position:absolute;top:' + numTop + ';left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;';
                if (isAtBest) {
                    var fireIcon = document.createElement('span');
                    fireIcon.className = 'material-symbols-rounded';
                    fireIcon.style.cssText = 'font-size:14px;color:' + (currentH > 30 ? '#fff' : '#D4A03C') + ';font-variation-settings:"FILL" 1,"wght" 500;margin-bottom:1px;';
                    fireIcon.textContent = 'local_fire_department';
                    numWrap.appendChild(fireIcon);
                }
                var numSpan = document.createElement('span');
                numSpan.style.cssText = 'font-size:15px;font-weight:800;color:' + (currentH > 30 ? '#fff' : '#2B2D42') + ';font-family:Rubik,sans-serif;line-height:1;' + (currentH > 30 ? 'text-shadow:0 1px 3px rgba(0,0,0,0.2);' : '');
                numSpan.textContent = p.current;
                numWrap.appendChild(numSpan);
                flame.appendChild(numWrap);
                col.appendChild(flame);
            } else {
                // No current bar — show "0" in prayer color below ghost bar
                var zeroLbl = document.createElement('div');
                zeroLbl.style.cssText = 'position:relative;z-index:1;font-size:15px;font-weight:800;color:' + p.color + ';font-family:Rubik,sans-serif;line-height:1;margin-bottom:4px;';
                zeroLbl.textContent = '0';
                col.appendChild(zeroLbl);
            }

            barsRow.appendChild(col);
        });

        container.appendChild(barsRow);

        // --- Prayer icons row ---
        var iconsRow = document.createElement('div');
        iconsRow.style.cssText = 'display:flex;justify-content:center;gap:12px;margin-top:12px;';

        prayers.forEach(function(p) {
            var iconCol = document.createElement('div');
            iconCol.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;';

            // Gradient square background
            var iconBg = document.createElement('div');
            var grad = gradients[p.color] || ('linear-gradient(135deg, ' + p.color + ', ' + p.color + ')');
            iconBg.style.cssText = 'width:30px;height:30px;border-radius:9px;background:' + grad + ';display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px ' + p.color + '25;';
            var icon = document.createElement('span');
            icon.className = 'material-symbols-rounded';
            icon.style.cssText = 'font-size:15px;color:#fff;font-variation-settings:"FILL" 1,"wght" 500;';
            icon.textContent = p.icon;
            iconBg.appendChild(icon);
            iconCol.appendChild(iconBg);

            // Prayer name
            var nameSpan = document.createElement('span');
            nameSpan.style.cssText = 'font-size:10px;font-weight:700;color:#2B2D42;font-family:"Noto Kufi Arabic",sans-serif;';
            nameSpan.textContent = p.name;
            iconCol.appendChild(nameSpan);

            iconsRow.appendChild(iconCol);
        });

        container.appendChild(iconsRow);

        // --- Legend ---
        if (data.legendLabels) {
            var leg = document.createElement('div');
            leg.style.cssText = 'display:flex;justify-content:center;gap:16px;margin-top:12px;padding:6px 0;';
            leg.innerHTML =
                '<div style="display:flex;align-items:center;gap:5px;"><div style="width:14px;height:10px;border-radius:4px;background:linear-gradient(180deg,#40916C,#52B788);"></div><span style="font-size:10px;color:#8D99AE;font-weight:600;">' + (data.legendLabels.current || 'الحالية') + '</span></div>' +
                '<div style="display:flex;align-items:center;gap:5px;"><div style="width:14px;height:10px;border-radius:4px;background:rgba(0,0,0,0.04);border:1px dashed rgba(0,0,0,0.1);"></div><span style="font-size:10px;color:#8D99AE;font-weight:600;">' + (data.legendLabels.best || 'الأفضل') + '</span></div>' +
                '<div style="display:flex;align-items:center;gap:5px;"><span class="material-symbols-rounded" style="font-size:12px;color:#D4A03C;font-variation-settings:\'FILL\' 1,\'wght\' 500;">local_fire_department</span><span style="font-size:10px;color:#8D99AE;font-weight:600;">' + (data.legendLabels.record || 'رقم قياسي') + '</span></div>';
            container.appendChild(leg);
        }
    }

    // ==================== 3. MOUNTAIN LANDSCAPE (area chart) ====================

    function mountainChart(container, data) {
        container.innerHTML = '';
        var months = data.labels || [];
        var values = data.values || [];
        var values2 = data.values2 || null;
        var currentIdx = data.currentMonth !== undefined ? data.currentMonth - 1 : -1;

        // --- Bars container ---
        var barsWrap = document.createElement('div');
        barsWrap.style.cssText = 'display:flex;align-items:flex-end;gap:4px;height:160px;padding:0 2px;';

        months.forEach(function(label, i) {
            var v = values[i] || 0;
            var v2 = values2 ? (values2[i] || 0) : 0;
            var isCurrent = i === currentIdx;
            var isFuture = currentIdx >= 0 && i > currentIdx;

            var col = document.createElement('div');
            col.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;' + (isFuture ? 'opacity:0.25;' : '');

            // Percentage label above bar
            if (v > 0) {
                var pctLbl = document.createElement('div');
                pctLbl.style.cssText = 'font-size:7px;font-weight:700;color:#8D99AE;font-family:Rubik,sans-serif;margin-bottom:2px;';
                pctLbl.textContent = v + '%';
                col.appendChild(pctLbl);
            }

            // Bar container (relative for stacking green + gold)
            var barOuter = document.createElement('div');
            barOuter.style.cssText = 'width:100%;max-width:26px;position:relative;border-radius:8px 8px 4px 4px;overflow:hidden;';
            var greenH = v;
            barOuter.style.height = Math.max(greenH, 0) + '%';
            barOuter.style.minHeight = v > 0 ? '4px' : '0';

            // Green fill (الإنجاز)
            var greenBar = document.createElement('div');
            var greenBg = isCurrent
                ? 'linear-gradient(180deg, #2D6A4F, #40916C)'
                : 'linear-gradient(180deg, #40916C, #52B788)';
            greenBar.style.cssText = 'position:absolute;inset:0;background:' + greenBg + ';border-radius:8px 8px 4px 4px;';
            barOuter.appendChild(greenBar);

            // Gold fill (الجماعة) — from bottom, height relative to bar
            if (values2 && v2 > 0 && v > 0) {
                var goldH = (v2 / v) * 100;
                var goldBar = document.createElement('div');
                goldBar.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:' + goldH + '%;background:linear-gradient(180deg, #D4A03C, #E8B84A);border-radius:0 0 4px 4px;';
                barOuter.appendChild(goldBar);
            }

            col.appendChild(barOuter);

            // Month label below
            var mLbl = document.createElement('div');
            mLbl.style.cssText = 'font-size:7px;font-weight:' + (isCurrent ? '700' : '500') + ';color:' + (isCurrent ? '#2D6A4F' : '#8D99AE') + ';font-family:"Noto Kufi Arabic",sans-serif;margin-top:4px;white-space:nowrap;';
            mLbl.textContent = label;
            col.appendChild(mLbl);

            barsWrap.appendChild(col);
        });

        container.appendChild(barsWrap);

        // Legend
        if (data.legend) {
            var leg = document.createElement('div');
            leg.style.cssText = 'display:flex;justify-content:center;gap:14px;margin-top:10px;padding:4px 0;';
            leg.innerHTML =
                '<div style="display:flex;align-items:center;gap:5px;"><div style="width:12px;height:8px;border-radius:3px;background:linear-gradient(180deg,#40916C,#52B788);"></div><span style="font-size:10px;color:#8D99AE;font-weight:600;">' + (data.legend[0] ? data.legend[0].label : '') + '</span></div>' +
                (data.legend[1] ? '<div style="display:flex;align-items:center;gap:5px;"><div style="width:12px;height:8px;border-radius:3px;background:linear-gradient(180deg,#D4A03C,#E8B84A);"></div><span style="font-size:10px;color:#8D99AE;font-weight:600;">' + data.legend[1].label + '</span></div>' : '');
            container.appendChild(leg);
        }
    }

    // ==================== 4. PRAYER RADAR (Pentagon/Spider) ====================

    function prayerRadar(container, data) {
        container.innerHTML = '';
        var prayers = data.prayers || []; // [{name, completion, congregation, color}]
        var n = prayers.length;
        if (n < 3) return;

        var size = 220, cx = 110, cy = 110, R = 85;
        var children = [];

        // Grid rings (circles instead of polygons for cleaner look)
        [25, 50, 75, 100].forEach(function(pct) {
            var r = (pct / 100) * R;
            children.push(el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: 'rgba(0,0,0,0.04)', 'stroke-width': 1 }));
        });

        // Axis lines
        for (var i = 0; i < n; i++) {
            var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            children.push(el('line', { x1: cx, y1: cy, x2: cx + R * Math.cos(angle), y2: cy + R * Math.sin(angle), stroke: 'rgba(0,0,0,0.04)', 'stroke-width': 1 }));
        }

        function makePoly(vals, color, fillOpacity, strokeWidth) {
            var pts = vals.map(function(v, i) {
                var r = (v / 100) * R;
                var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                return (cx + r * Math.cos(angle)).toFixed(1) + ',' + (cy + r * Math.sin(angle)).toFixed(1);
            });
            children.push(el('polygon', { points: pts.join(' '), fill: color, 'fill-opacity': fillOpacity, stroke: color, 'stroke-width': strokeWidth, 'stroke-linejoin': 'round' }));
        }

        // Congregation polygon (gold, behind)
        if (data.showCongregation) {
            makePoly(prayers.map(function(p) { return p.congregation || 0; }), '#D4A03C', 0.1, 1.5);
        }
        // Completion polygon (green)
        makePoly(prayers.map(function(p) { return p.completion || 0; }), '#40916C', 0.12, 2);

        // Data points on completion polygon
        prayers.forEach(function(p, i) {
            var v = p.completion || 0;
            var r = (v / 100) * R;
            var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            var px = cx + r * Math.cos(angle);
            var py = cy + r * Math.sin(angle);
            children.push(el('circle', { cx: px, cy: py, r: 4, fill: '#40916C', stroke: '#fff', 'stroke-width': 2 }));
        });

        // Labels
        prayers.forEach(function(p, i) {
            var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            var lx = cx + (R + 22) * Math.cos(angle);
            var ly = cy + (R + 22) * Math.sin(angle);
            children.push(el('text', { x: lx, y: ly - 6, 'text-anchor': 'middle', fill: '#2B2D42', 'font-size': '11', 'font-weight': '700', 'font-family': 'Noto Kufi Arabic, sans-serif' }, p.name));
            children.push(el('text', { x: lx, y: ly + 8, 'text-anchor': 'middle', fill: '#40916C', 'font-size': '10', 'font-weight': '700', 'font-family': 'Rubik, sans-serif' }, p.completion + '%'));
        });

        var s = svg(size, size, '0 0 ' + size + ' ' + size, children);
        container.appendChild(s);
    }

    // ==================== 5. PRAYER LOLLIPOP (horizontal bars) ====================

    function prayerLollipop(container, data) {
        container.innerHTML = '';
        var prayers = data.prayers || []; // [{name, icon, color, completion, congregation, congCount}]
        var showCong = data.showCongregation !== false;
        var barH = 20, rowH = 60, labelW = 80, barMaxW = 220;
        var W = labelW + barMaxW + 40, H = prayers.length * rowH + 10;
        var children = [];

        prayers.forEach(function(p, i) {
            var y = 10 + i * rowH;
            var compW = (p.completion / 100) * barMaxW;
            var congW = showCong ? ((p.congregation || 0) / 100) * barMaxW : 0;

            // Prayer icon
            children.push(el('text', { x: 10, y: y + 16, fill: p.color, 'font-size': '20', 'font-family': 'Material Symbols Rounded' }, p.icon));
            // Prayer name
            children.push(el('text', { x: 36, y: y + 16, fill: 'var(--text-primary)', 'font-size': '11', 'font-weight': '600', 'font-family': 'Noto Kufi Arabic' }, p.name));

            var barY = y + 26;
            // Track
            children.push(el('rect', { x: labelW, y: barY, width: barMaxW, height: barH, rx: 10, fill: 'var(--border, rgba(0,0,0,0.04))' }));
            // Congregation bar (behind)
            if (showCong && congW > 0) {
                children.push(el('rect', { x: labelW, y: barY, width: congW, height: barH, rx: 10, fill: 'var(--gold)', opacity: '0.5' }));
            }
            // Completion bar
            if (compW > 0) {
                var gradId = 'lolGrad' + i;
                var grad = el('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '1', y2: '0' });
                grad.appendChild(el('stop', { offset: '0%', 'stop-color': p.color }));
                grad.appendChild(el('stop', { offset: '100%', 'stop-color': p.color + 'cc' }));
                children.push(el('defs', {}, [grad]));
                children.push(el('rect', { x: labelW, y: barY, width: compW, height: barH, rx: 10, fill: 'url(#' + gradId + ')' }));
                // Lollipop dot
                children.push(el('circle', { cx: labelW + compW, cy: barY + barH / 2, r: 6, fill: p.color, stroke: 'white', 'stroke-width': 2 }));
            }
            // Completion % text
            children.push(el('text', { x: labelW + barMaxW + 8, y: barY + 14, fill: 'var(--text-primary)', 'font-size': '12', 'font-weight': '700', 'font-family': 'Rubik' }, p.completion + '%'));

            // Congregation info below bar
            if (showCong && p.congCount !== undefined) {
                children.push(el('text', { x: labelW, y: barY + barH + 14, fill: 'var(--text-muted)', 'font-size': '9', 'font-family': 'Noto Kufi Arabic' }, 'جماعة: ' + (p.congregation || 0) + '% (' + p.congCount + ')'));
            }
        });

        var s = svg(W, H, '0 0 ' + W + ' ' + H, children);
        container.appendChild(s);
    }

    // ==================== 6. WEEKLY RHYTHM (Radial chart) ====================

    function weeklyRhythm(container, data) {
        container.innerHTML = '';
        var days = data.days || []; // [{name, value}] 7 items
        if (days.length !== 7) return;

        var size = 180, cx = 90, cy = 90, R = 80, innerR = 30;
        var children = [];

        // Center circle
        var avg = Math.round(days.reduce(function(s, d) { return s + d.value; }, 0) / 7);
        children.push(el('circle', { cx: cx, cy: cy, r: innerR - 2, fill: '#F5F3EF' }));
        children.push(el('text', { x: cx, y: cy - 3, 'text-anchor': 'middle', fill: '#8D99AE', 'font-size': '8', 'font-weight': '600', 'font-family': 'Noto Kufi Arabic, sans-serif' }, 'متوسط'));
        children.push(el('text', { x: cx, y: cy + 10, 'text-anchor': 'middle', fill: '#2B2D42', 'font-size': '14', 'font-weight': '800', 'font-family': 'Rubik, sans-serif' }, avg + '%'));

        var segAngle = (2 * Math.PI) / 7;
        days.forEach(function(d, i) {
            var startAngle = segAngle * i - Math.PI / 2;
            var endAngle = startAngle + segAngle;
            var midAngle = startAngle + segAngle / 2;
            var segR = innerR + ((d.value / 100) * (R - innerR));

            var color = d.value >= 90 ? '#2D6A4F' : d.value >= 75 ? '#40916C' : d.value >= 60 ? '#D4A03C' : '#C1574E';

            // Segment path
            var x1i = cx + innerR * Math.cos(startAngle);
            var y1i = cy + innerR * Math.sin(startAngle);
            var x1o = cx + segR * Math.cos(startAngle);
            var y1o = cy + segR * Math.sin(startAngle);
            var x2i = cx + innerR * Math.cos(endAngle);
            var y2i = cy + innerR * Math.sin(endAngle);
            var x2o = cx + segR * Math.cos(endAngle);
            var y2o = cy + segR * Math.sin(endAngle);

            // Track (full extent)
            var tx1o = cx + R * Math.cos(startAngle + 0.04);
            var ty1o = cy + R * Math.sin(startAngle + 0.04);
            var tx2o = cx + R * Math.cos(endAngle - 0.04);
            var ty2o = cy + R * Math.sin(endAngle - 0.04);
            var tx1i = cx + innerR * Math.cos(startAngle + 0.04);
            var ty1i = cy + innerR * Math.sin(startAngle + 0.04);
            var tx2i = cx + innerR * Math.cos(endAngle - 0.04);
            var ty2i = cy + innerR * Math.sin(endAngle - 0.04);
            var trackPath = 'M' + tx1i + ',' + ty1i + ' L' + tx1o + ',' + ty1o +
                ' A' + R + ',' + R + ' 0 0,1 ' + tx2o + ',' + ty2o +
                ' L' + tx2i + ',' + ty2i +
                ' A' + innerR + ',' + innerR + ' 0 0,0 ' + tx1i + ',' + ty1i + 'Z';
            children.push(el('path', { d: trackPath, fill: 'rgba(0,0,0,0.02)' }));

            // Value sector
            var vx1o = cx + segR * Math.cos(startAngle + 0.04);
            var vy1o = cy + segR * Math.sin(startAngle + 0.04);
            var vx2o = cx + segR * Math.cos(endAngle - 0.04);
            var vy2o = cy + segR * Math.sin(endAngle - 0.04);
            var path = 'M' + tx1i + ',' + ty1i + ' L' + vx1o + ',' + vy1o +
                ' A' + segR + ',' + segR + ' 0 0,1 ' + vx2o + ',' + vy2o +
                ' L' + tx2i + ',' + ty2i +
                ' A' + innerR + ',' + innerR + ' 0 0,0 ' + tx1i + ',' + ty1i + 'Z';

            children.push(el('path', { d: path, fill: color, opacity: '0.7' }));

            // Label
            var lR = R + 14;
            var lx = cx + lR * Math.cos(midAngle);
            var ly = cy + lR * Math.sin(midAngle);
            children.push(el('text', { x: lx, y: ly - 4, 'text-anchor': 'middle', fill: '#2B2D42', 'font-size': '9', 'font-weight': '700', 'font-family': 'Noto Kufi Arabic, sans-serif' }, d.name));
            children.push(el('text', { x: lx, y: ly + 7, 'text-anchor': 'middle', fill: color, 'font-size': '9', 'font-weight': '700', 'font-family': 'Rubik, sans-serif' }, d.value + '%'));
        });

        var s = svg(size, size, '0 0 ' + size + ' ' + size, children);
        container.appendChild(s);
    }

    // ==================== 7. CONGREGATION HEATMAP ====================

    function congregationHeatmap(container, data) {
        container.innerHTML = '';
        var grid = data.grid || []; // [{day, dow, count}] — day entries for ~70 days (10 weeks)
        var dayNames = data.dayNames || ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
        var maxCount = data.maxPrayers || 5;

        var cellSize = 14, gap = 3, labelW = 50, padT = 5;
        var weeks = Math.ceil(grid.length / 7);
        var W = labelW + weeks * (cellSize + gap) + 20;
        var H = 7 * (cellSize + gap) + padT + 30;
        var children = [];

        // Day labels
        dayNames.forEach(function(name, i) {
            children.push(el('text', { x: labelW - 6, y: padT + i * (cellSize + gap) + cellSize / 2 + 4, 'text-anchor': 'end', fill: 'var(--text-muted)', 'font-size': '9', 'font-family': 'Noto Kufi Arabic' }, name));
        });

        // Cells
        grid.forEach(function(cell, idx) {
            var week = Math.floor(idx / 7);
            var dow = idx % 7;
            var x = labelW + week * (cellSize + gap);
            var y = padT + dow * (cellSize + gap);
            var intensity = cell.count / maxCount;
            var color = intensity === 0 ? 'rgba(0,0,0,0.03)'
                : intensity <= 0.2 ? 'rgba(45,106,79,0.15)'
                : intensity <= 0.4 ? 'rgba(45,106,79,0.3)'
                : intensity <= 0.6 ? 'rgba(45,106,79,0.5)'
                : intensity <= 0.8 ? 'rgba(45,106,79,0.7)'
                : '#2D6A4F';

            children.push(el('rect', { x: x, y: y, width: cellSize, height: cellSize, rx: 3, fill: color }));
        });

        // Scale legend at bottom
        var scaleY = H - 18;
        var scaleLabels = data.scaleLabels || ['أقل', 'أكثر'];
        children.push(el('text', { x: labelW, y: scaleY, fill: 'var(--text-muted)', 'font-size': '9', 'font-family': 'Noto Kufi Arabic' }, scaleLabels[0]));
        [0, 0.25, 0.5, 0.75, 1].forEach(function(v, i) {
            var c = v === 0 ? 'rgba(0,0,0,0.03)' : v <= 0.25 ? 'rgba(45,106,79,0.2)' : v <= 0.5 ? 'rgba(45,106,79,0.4)' : v <= 0.75 ? 'rgba(45,106,79,0.65)' : '#2D6A4F';
            children.push(el('rect', { x: labelW + 24 + i * (cellSize + 2), y: scaleY - 12, width: cellSize, height: 12, rx: 3, fill: c }));
        });
        children.push(el('text', { x: labelW + 24 + 5 * (cellSize + 2) + 4, y: scaleY, fill: 'var(--text-muted)', 'font-size': '9', 'font-family': 'Noto Kufi Arabic' }, scaleLabels[1]));

        var s = svg(W, H, '0 0 ' + W + ' ' + H, children);
        container.appendChild(s);
    }

    // ==================== 8. SIMPLE BAR CHART (for Qada, Fasting, etc.) ====================

    function barChart(container, data) {
        container.innerHTML = '';
        var items = data.items || []; // [{label, value, color}]
        var maxVal = data.maxVal || Math.max.apply(null, items.map(function(i) { return i.value; })) || 1;

        var barW = 32, gap = 12, padL = 10, padR = 10, padT = 25, padB = 40;
        var W = padL + items.length * (barW + gap) - gap + padR;
        var H = 180;
        var plotH = H - padT - padB;
        var children = [];

        items.forEach(function(item, i) {
            var x = padL + i * (barW + gap);
            var h = (item.value / maxVal) * plotH;
            var y = padT + plotH - h;

            // Bar
            var gradId = 'barG' + i;
            var grad = el('linearGradient', { id: gradId, x1: '0', y1: '1', x2: '0', y2: '0' });
            grad.appendChild(el('stop', { offset: '0%', 'stop-color': item.color + 'aa' }));
            grad.appendChild(el('stop', { offset: '100%', 'stop-color': item.color }));
            children.push(el('defs', {}, [grad]));
            children.push(el('rect', { x: x, y: y, width: barW, height: h, rx: 6, fill: 'url(#' + gradId + ')' }));

            // Value above
            if (item.value > 0) {
                children.push(el('text', { x: x + barW / 2, y: y - 5, 'text-anchor': 'middle', fill: 'var(--text-primary)', 'font-size': '11', 'font-weight': '700', 'font-family': 'Rubik' }, '' + item.value));
            }

            // Label below
            children.push(el('text', { x: x + barW / 2, y: H - 10, 'text-anchor': 'middle', fill: 'var(--text-muted)', 'font-size': '9', 'font-family': 'Noto Kufi Arabic' }, item.label));
        });

        var s = svg(W, H, '0 0 ' + W + ' ' + H, children);
        container.appendChild(s);
    }

    // ==================== PUBLIC API ====================

    return {
        orbitalProgress: orbitalProgress,
        streakFlameBars: streakFlameBars,
        mountainChart: mountainChart,
        prayerRadar: prayerRadar,
        prayerLollipop: prayerLollipop,
        weeklyRhythm: weeklyRhythm,
        congregationHeatmap: congregationHeatmap,
        barChart: barChart
    };
})();
