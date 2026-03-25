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
        if (prayers.length === 0) return;
        var maxBest = Math.max.apply(null, prayers.map(function(p) { return Math.max(p.best, 1); }));

        var gradients = {
            '#D4A0A7': 'linear-gradient(135deg, #E8B4B8, #D4A0A7)',
            '#E8B84A': 'linear-gradient(135deg, #F0C75E, #E8B84A)',
            '#D4943A': 'linear-gradient(135deg, #E8A849, #D4943A)',
            '#B0664A': 'linear-gradient(135deg, #C47A5A, #B0664A)',
            '#4A5A7A': 'linear-gradient(135deg, #5B6B8A, #4A5A7A)'
        };

        var SVG_NS = 'http://www.w3.org/2000/svg';

        function createGauge(p) {
            var cell = document.createElement('div');
            cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;';

            var svgW = 90, svgH = 55;
            var cx = 45, cy = 48, R = 32;
            var halfCirc = Math.PI * R;

            var currentPct = maxBest > 0 ? Math.min((p.current / maxBest) * 100, 100) : 0;
            var bestPct = maxBest > 0 ? Math.min((p.best / maxBest) * 100, 100) : 0;

            var svgEl = document.createElementNS(SVG_NS, 'svg');
            svgEl.setAttribute('width', svgW);
            svgEl.setAttribute('height', svgH);
            svgEl.setAttribute('viewBox', '0 0 ' + svgW + ' ' + svgH);
            svgEl.style.overflow = 'hidden';
            svgEl.style.display = 'block';

            var arcD = 'M ' + (cx - R) + ' ' + cy + ' A ' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + cy;

            // Background track
            var track = document.createElementNS(SVG_NS, 'path');
            track.setAttribute('d', arcD);
            track.setAttribute('fill', 'none');
            track.setAttribute('stroke', 'rgba(0,0,0,0.06)');
            track.setAttribute('stroke-width', '5');
            track.setAttribute('stroke-linecap', 'round');
            svgEl.appendChild(track);

            // Best ghost arc (semi-transparent, behind current)
            if (p.best > 0 && bestPct > 0) {
                var bestArc = document.createElementNS(SVG_NS, 'path');
                bestArc.setAttribute('d', arcD);
                bestArc.setAttribute('fill', 'none');
                bestArc.setAttribute('stroke', p.color);
                bestArc.setAttribute('stroke-opacity', '0.18');
                bestArc.setAttribute('stroke-width', '5');
                bestArc.setAttribute('stroke-linecap', 'round');
                bestArc.setAttribute('stroke-dasharray', halfCirc.toFixed(1) + ' ' + halfCirc.toFixed(1));
                bestArc.setAttribute('stroke-dashoffset', (halfCirc * (1 - bestPct / 100)).toFixed(1));
                svgEl.appendChild(bestArc);
            }

            // Current progress arc (solid, on top)
            if (p.current > 0 && currentPct > 0) {
                var progArc = document.createElementNS(SVG_NS, 'path');
                progArc.setAttribute('d', arcD);
                progArc.setAttribute('fill', 'none');
                progArc.setAttribute('stroke', p.color);
                progArc.setAttribute('stroke-width', '6');
                progArc.setAttribute('stroke-linecap', 'round');
                progArc.setAttribute('stroke-dasharray', halfCirc.toFixed(1) + ' ' + halfCirc.toFixed(1));
                progArc.setAttribute('stroke-dashoffset', (halfCirc * (1 - currentPct / 100)).toFixed(1));
                svgEl.appendChild(progArc);
            }

            // Best number (inside gauge, near top of arc)
            if (p.best > 0) {
                var bestText = document.createElementNS(SVG_NS, 'text');
                bestText.setAttribute('x', cx);
                bestText.setAttribute('y', cy - R + 14);
                bestText.setAttribute('text-anchor', 'middle');
                bestText.setAttribute('font-size', '8');
                bestText.setAttribute('font-weight', '600');
                bestText.setAttribute('font-family', 'Rubik, sans-serif');
                bestText.setAttribute('fill', p.color);
                bestText.setAttribute('fill-opacity', '0.45');
                bestText.textContent = p.best;
                svgEl.appendChild(bestText);
            }

            // Current number (centered, large)
            var numText = document.createElementNS(SVG_NS, 'text');
            numText.setAttribute('x', cx);
            numText.setAttribute('y', cy - 10);
            numText.setAttribute('text-anchor', 'middle');
            numText.setAttribute('dominant-baseline', 'middle');
            numText.setAttribute('font-size', '17');
            numText.setAttribute('font-weight', '800');
            numText.setAttribute('font-family', 'Rubik, sans-serif');
            numText.setAttribute('fill', p.current > 0 ? p.color : '#8D99AE');
            numText.textContent = p.current;
            svgEl.appendChild(numText);

            cell.appendChild(svgEl);

            // Gradient icon below gauge
            var grad = gradients[p.color] || ('linear-gradient(135deg, ' + p.color + ', ' + p.color + ')');
            var iconBg = document.createElement('div');
            iconBg.style.cssText = 'width:22px;height:22px;border-radius:6px;background:' + grad + ';display:flex;align-items:center;justify-content:center;margin-top:2px;';
            var icon = document.createElement('span');
            icon.className = 'material-symbols-rounded';
            icon.style.cssText = 'font-size:12px;color:#fff;font-variation-settings:"FILL" 1,"wght" 500;';
            icon.textContent = p.icon;
            iconBg.appendChild(icon);
            cell.appendChild(iconBg);

            // Prayer name
            var nameSpan = document.createElement('span');
            nameSpan.style.cssText = 'font-size:8px;font-weight:700;color:#2B2D42;font-family:"Noto Kufi Arabic",sans-serif;margin-top:1px;';
            nameSpan.textContent = p.name;
            cell.appendChild(nameSpan);

            return cell;
        }

        // Row 1: first 3 prayers
        var row1 = document.createElement('div');
        row1.style.cssText = 'display:flex;justify-content:center;gap:6px;';
        for (var i = 0; i < Math.min(3, prayers.length); i++) {
            row1.appendChild(createGauge(prayers[i]));
        }
        container.appendChild(row1);

        // Row 2: remaining prayers, centered
        if (prayers.length > 3) {
            var row2 = document.createElement('div');
            row2.style.cssText = 'display:flex;justify-content:center;gap:6px;margin-top:6px;';
            for (var j = 3; j < prayers.length; j++) {
                var gaugeCell = createGauge(prayers[j]);
                gaugeCell.style.maxWidth = '60%';
                row2.appendChild(gaugeCell);
            }
            container.appendChild(row2);
        }

        // Legend
        if (data.legendLabels) {
            var leg = document.createElement('div');
            leg.style.cssText = 'display:flex;justify-content:center;gap:14px;margin-top:8px;padding:4px 0;';
            leg.innerHTML =
                '<div style="display:flex;align-items:center;gap:4px;"><div style="width:12px;height:4px;border-radius:2px;background:#40916C;"></div><span style="font-size:9px;color:#8D99AE;font-weight:600;">' + (data.legendLabels.current || 'الحالية') + '</span></div>' +
                '<div style="display:flex;align-items:center;gap:4px;"><div style="width:12px;height:4px;border-radius:2px;border:1px dashed rgba(0,0,0,0.15);background:rgba(0,0,0,0.04);"></div><span style="font-size:9px;color:#8D99AE;font-weight:600;">' + (data.legendLabels.best || 'الأفضل') + '</span></div>';
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
        var n = months.length;
        if (n === 0) return;

        var W = 360, H = 190;
        var padL = 8, padR = 8, padTop = 28, padBot = 24;
        var chartW = W - padL - padR;
        var chartH = H - padTop - padBot;
        var baseY = padTop + chartH;

        // Map values to points
        function toPoint(i, v) {
            var x = n === 1 ? padL + chartW / 2 : padL + (i / (n - 1)) * chartW;
            var y = baseY - (Math.min(v, 100) / 100) * chartH;
            return { x: x, y: y };
        }

        // Smooth bezier line path
        function smoothLine(pts) {
            if (pts.length === 0) return '';
            var d = 'M ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
            for (var i = 1; i < pts.length; i++) {
                var prev = pts[i - 1], cur = pts[i];
                var midX = (prev.x + cur.x) / 2;
                d += ' C ' + midX.toFixed(1) + ' ' + prev.y.toFixed(1) +
                     ' ' + midX.toFixed(1) + ' ' + cur.y.toFixed(1) +
                     ' ' + cur.x.toFixed(1) + ' ' + cur.y.toFixed(1);
            }
            return d;
        }

        // Smooth bezier area path (closed to baseline)
        function smoothArea(pts) {
            if (pts.length === 0) return '';
            var d = 'M ' + pts[0].x.toFixed(1) + ' ' + baseY;
            d += ' L ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
            for (var i = 1; i < pts.length; i++) {
                var prev = pts[i - 1], cur = pts[i];
                var midX = (prev.x + cur.x) / 2;
                d += ' C ' + midX.toFixed(1) + ' ' + prev.y.toFixed(1) +
                     ' ' + midX.toFixed(1) + ' ' + cur.y.toFixed(1) +
                     ' ' + cur.x.toFixed(1) + ' ' + cur.y.toFixed(1);
            }
            d += ' L ' + pts[pts.length - 1].x.toFixed(1) + ' ' + baseY + ' Z';
            return d;
        }

        // Build point arrays (only months with data or up to current)
        var greenPts = [], goldPts = [];
        for (var i = 0; i < n; i++) {
            var v = values[i] || 0;
            var v2 = values2 ? (values2[i] || 0) : 0;
            var isFuture = currentIdx >= 0 && i > currentIdx;
            if (isFuture && v === 0) continue;
            greenPts.push(toPoint(i, v));
            if (values2) goldPts.push(toPoint(i, v2));
        }

        var defs = '';
        // Glow filter for peak dots
        defs += '<filter id="glowF" x="-50%" y="-50%" width="200%" height="200%">';
        defs += '<feGaussianBlur stdDeviation="3" result="blur"/>';
        defs += '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>';
        defs += '</filter>';
        // Green gradient fill
        defs += '<linearGradient id="greenWaveFill" x1="0" y1="0" x2="0" y2="1">';
        defs += '<stop offset="0%" stop-color="#40916C" stop-opacity="0.25"/>';
        defs += '<stop offset="100%" stop-color="#40916C" stop-opacity="0.02"/>';
        defs += '</linearGradient>';
        // Gold gradient fill
        defs += '<linearGradient id="goldWaveFill" x1="0" y1="0" x2="0" y2="1">';
        defs += '<stop offset="0%" stop-color="#D4A03C" stop-opacity="0.15"/>';
        defs += '<stop offset="100%" stop-color="#D4A03C" stop-opacity="0.01"/>';
        defs += '</linearGradient>';

        var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block;" xmlns="http://www.w3.org/2000/svg">';
        svg += '<defs>' + defs + '</defs>';

        // Baseline
        svg += '<line x1="' + padL + '" y1="' + baseY + '" x2="' + (W - padR) + '" y2="' + baseY + '" stroke="rgba(0,0,0,0.06)" stroke-width="0.5"/>';

        // Green area + line
        if (greenPts.length > 1) {
            svg += '<path d="' + smoothArea(greenPts) + '" fill="url(#greenWaveFill)"/>';
            svg += '<path d="' + smoothLine(greenPts) + '" fill="none" stroke="#40916C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
        }

        // Gold area + dashed line
        if (goldPts.length > 1) {
            svg += '<path d="' + smoothArea(goldPts) + '" fill="url(#goldWaveFill)"/>';
            svg += '<path d="' + smoothLine(goldPts) + '" fill="none" stroke="#D4A03C" stroke-width="1.5" stroke-dasharray="4 3" stroke-linecap="round" stroke-linejoin="round"/>';
        }

        // Current month dashed vertical line
        if (currentIdx >= 0 && currentIdx < n) {
            var curPt = toPoint(currentIdx, values[currentIdx] || 0);
            svg += '<line x1="' + curPt.x.toFixed(1) + '" y1="' + curPt.y.toFixed(1) + '" x2="' + curPt.x.toFixed(1) + '" y2="' + baseY + '" stroke="#2D6A4F" stroke-width="1" stroke-dasharray="3 2" opacity="0.4"/>';
        }

        // Dots and labels for each month
        var gIdx = 0;
        for (var j = 0; j < n; j++) {
            var val = values[j] || 0;
            var val2 = values2 ? (values2[j] || 0) : 0;
            var isFut = currentIdx >= 0 && j > currentIdx;
            var hasData = val > 0 || (isFut === false);
            var pt = toPoint(j, val);

            // Month labels along baseline
            var lblColor = (j === currentIdx) ? '#2D6A4F' : (isFut ? '#C8C8C8' : '#8D99AE');
            var lblWeight = (j === currentIdx) ? '700' : '500';
            var lblX = pt.x;
            svg += '<text x="' + lblX.toFixed(1) + '" y="' + (baseY + 14) + '" text-anchor="middle" font-family="\'Noto Kufi Arabic\',sans-serif" font-size="7" font-weight="' + lblWeight + '" fill="' + lblColor + '">' + months[j] + '</text>';

            if (isFut && val === 0) continue;

            // Green dots
            var isPeak = val >= 95;
            var isLow = val > 0 && val < 30;
            var dotR = isPeak ? 5 : (isLow ? 4 : 3.5);
            var dotColor = isLow ? '#C1574E' : '#40916C';

            if (isPeak) {
                svg += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="' + dotR + '" fill="' + dotColor + '" filter="url(#glowF)"/>';
            } else {
                svg += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="' + dotR + '" fill="' + dotColor + '"/>';
            }
            // White inner ring
            svg += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="' + (dotR - 1.5) + '" fill="white"/>';
            svg += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="' + (dotR - 2.5) + '" fill="' + dotColor + '"/>';

            // Percentage label above dot (all months with data)
            if (val > 0) {
                var lblY = pt.y - dotR - 4;
                var pctColor = isLow ? '#C1574E' : (isPeak ? '#2D6A4F' : '#6B7B8D');
                var pctWeight = isPeak ? '700' : '600';
                var pctSize = isPeak ? '9' : '7.5';
                svg += '<text x="' + pt.x.toFixed(1) + '" y="' + lblY.toFixed(1) + '" text-anchor="middle" font-family="Rubik,sans-serif" font-size="' + pctSize + '" font-weight="' + pctWeight + '" fill="' + pctColor + '">' + val + '%</text>';
            }

            // Gold congregation dot
            if (values2 && val2 > 0) {
                var gPt = toPoint(j, val2);
                svg += '<circle cx="' + gPt.x.toFixed(1) + '" cy="' + gPt.y.toFixed(1) + '" r="2" fill="#D4A03C"/>';
                svg += '<circle cx="' + gPt.x.toFixed(1) + '" cy="' + gPt.y.toFixed(1) + '" r="0.8" fill="white"/>';
            }
        }

        svg += '</svg>';
        container.innerHTML = svg;

        // Legend
        if (data.legend) {
            var leg = document.createElement('div');
            leg.style.cssText = 'display:flex;justify-content:center;gap:16px;margin-top:8px;padding:4px 0;';
            var l1 = data.legend[0] ? data.legend[0].label : '';
            var l2 = data.legend[1] ? data.legend[1].label : '';
            leg.innerHTML =
                '<div style="display:flex;align-items:center;gap:5px;">' +
                '<svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke="#40916C" stroke-width="2.5" stroke-linecap="round"/></svg>' +
                '<span style="font-size:10px;color:#8D99AE;font-weight:600;">' + l1 + '</span></div>' +
                (l2 ? '<div style="display:flex;align-items:center;gap:5px;">' +
                '<svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke="#D4A03C" stroke-width="1.5" stroke-dasharray="4 3" stroke-linecap="round"/></svg>' +
                '<span style="font-size:10px;color:#8D99AE;font-weight:600;">' + l2 + '</span></div>' : '');
            container.appendChild(leg);
        }
    }

    // ==================== 4. PRAYER RADAR (Pentagon/Spider) ====================

    function prayerRadar(container, data) {
        container.innerHTML = '';
        var prayers = data.prayers || []; // [{name, completion, congregation, color}]
        var n = prayers.length;
        if (n < 3) return;

        var size = 280, cx = 140, cy = 140, R = 80;
        var labelR = R + 35;
        var children = [];

        // Grid rings
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
            var pts = vals.map(function(v, idx) {
                var r = (v / 100) * R;
                var angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
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

        // Data points — colored per prayer
        prayers.forEach(function(p, i) {
            var v = p.completion || 0;
            var r = (v / 100) * R;
            var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            var px = cx + r * Math.cos(angle);
            var py = cy + r * Math.sin(angle);
            children.push(el('circle', { cx: px, cy: py, r: 4, fill: p.color, stroke: '#fff', 'stroke-width': 2 }));
        });

        // Labels — per-prayer color + individual percentage
        prayers.forEach(function(p, i) {
            var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            var lx = cx + labelR * Math.cos(angle);
            var ly = cy + labelR * Math.sin(angle);
            children.push(el('text', { x: lx, y: ly - 6, 'text-anchor': 'middle', fill: '#2B2D42', 'font-size': '11', 'font-weight': '700', 'font-family': 'Noto Kufi Arabic, sans-serif' }, p.name));
            children.push(el('text', { x: lx, y: ly + 8, 'text-anchor': 'middle', fill: p.color, 'font-size': '10', 'font-weight': '700', 'font-family': 'Rubik, sans-serif' }, p.completion + '%'));
        });

        var s = svg(size, size, '0 0 ' + size + ' ' + size, children);
        container.appendChild(s);
    }

    // ==================== 5. PRAYER LOLLIPOP (horizontal bars) ====================

    function prayerLollipop(container, data) {
        container.innerHTML = '';
        var prayers = data.prayers || [];
        var showCong = data.showCongregation !== false;

        var gradients = {
            '#D4A0A7': ['#E8B4B8', '#D4A0A7'],
            '#E8B84A': ['#F0C75E', '#E8B84A'],
            '#D4943A': ['#E8A849', '#D4943A'],
            '#B0664A': ['#C47A5A', '#B0664A'],
            '#4A5A7A': ['#5B6B8A', '#4A5A7A']
        };

        var wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;gap:14px;padding:4px 0;';

        prayers.forEach(function(p) {
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

            // Top line: [icon] [name] ... [percentage]
            var topLine = document.createElement('div');
            topLine.style.cssText = 'display:flex;align-items:center;gap:8px;';

            // Gradient icon square
            var grad = gradients[p.color] || [[p.color, p.color]];
            var iconBg = document.createElement('div');
            iconBg.style.cssText = 'width:28px;height:28px;min-width:28px;border-radius:8px;background:linear-gradient(135deg,' + (grad[0] || p.color) + ',' + (grad[1] || p.color) + ');display:flex;align-items:center;justify-content:center;';
            var icon = document.createElement('span');
            icon.className = 'material-symbols-rounded';
            icon.style.cssText = 'font-size:14px;color:#fff;font-variation-settings:"FILL" 1,"wght" 500;';
            icon.textContent = p.icon;
            iconBg.appendChild(icon);
            topLine.appendChild(iconBg);

            // Prayer name
            var nameSpan = document.createElement('span');
            nameSpan.style.cssText = 'font-size:12px;font-weight:700;color:#2B2D42;font-family:"Noto Kufi Arabic",sans-serif;flex:1;';
            nameSpan.textContent = p.name;
            topLine.appendChild(nameSpan);

            // Percentage
            var pctSpan = document.createElement('span');
            pctSpan.style.cssText = 'font-size:13px;font-weight:800;color:' + p.color + ';font-family:Rubik,sans-serif;min-width:40px;text-align:left;';
            pctSpan.textContent = p.completion + '%';
            topLine.appendChild(pctSpan);

            row.appendChild(topLine);

            // Bar track + fill
            var barWrap = document.createElement('div');
            barWrap.style.cssText = 'position:relative;height:18px;border-radius:9px;background:rgba(0,0,0,0.04);overflow:visible;margin-inline-start:36px;margin-inline-end:4px;';

            // Congregation bar (behind, gold)
            if (showCong && (p.congregation || 0) > 0) {
                var congBar = document.createElement('div');
                congBar.style.cssText = 'position:absolute;top:0;inset-inline-start:0;height:100%;width:' + (p.congregation || 0) + '%;border-radius:9px;background:linear-gradient(90deg,#D4A03C,#E8B84A);opacity:0.4;';
                barWrap.appendChild(congBar);
            }

            // Completion bar
            var compW = p.completion || 0;
            if (compW > 0) {
                var compBar = document.createElement('div');
                compBar.style.cssText = 'position:absolute;top:0;inset-inline-start:0;height:100%;width:' + compW + '%;border-radius:9px;background:linear-gradient(90deg,' + p.color + ',' + p.color + 'cc);';
                barWrap.appendChild(compBar);

                // Lollipop dot — prayer color
                var dot = document.createElement('div');
                dot.style.cssText = 'position:absolute;top:50%;inset-inline-start:' + compW + '%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:' + p.color + ';border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.15);z-index:1;';
                barWrap.appendChild(dot);
            }

            row.appendChild(barWrap);

            // Congregation info below bar
            if (showCong && p.congCount !== undefined) {
                var congInfo = document.createElement('div');
                congInfo.style.cssText = 'display:flex;align-items:center;gap:4px;margin-inline-start:36px;margin-inline-end:4px;';
                congInfo.innerHTML = '<span class="material-symbols-rounded" style="font-size:12px;color:#D4A03C;font-variation-settings:\'FILL\' 1;">mosque</span><span style="font-size:10px;color:#D4A03C;font-weight:600;font-family:\'Noto Kufi Arabic\',sans-serif;">جماعة: ' + (p.congregation || 0) + '% (' + p.congCount + ')</span>';
                row.appendChild(congInfo);
            }

            wrap.appendChild(row);
        });

        container.appendChild(wrap);
    }

    // ==================== 6. WEEKLY RHYTHM (Radial chart) ====================

    function weeklyRhythm(container, data) {
        container.innerHTML = '';
        var days = data.days || []; // [{name, value}] 7 items
        if (days.length !== 7) return;

        var size = 240, cx = 120, cy = 120, R = 70, innerR = 26;
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

            var color = d.value >= 90 ? '#2D6A4F' : d.value >= 75 ? '#40916C' : d.value >= 60 ? '#52B788' : '#D4A03C';

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
            var lR = R + 30;
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
