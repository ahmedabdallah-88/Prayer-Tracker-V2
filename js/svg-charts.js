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
        var NS = 'http://www.w3.org/2000/svg';
        var R = 38, SW = 7, W = 100, H = 60;
        var halfCirc = Math.PI * R;
        var cx = 50, cy = 52;

        var gradients = {
            '#D4A0A7': 'linear-gradient(135deg, #E8B4B8, #D4A0A7)',
            '#E8B84A': 'linear-gradient(135deg, #F0C75E, #E8B84A)',
            '#D4943A': 'linear-gradient(135deg, #E8A849, #D4943A)',
            '#B0664A': 'linear-gradient(135deg, #C47A5A, #B0664A)',
            '#4A5A7A': 'linear-gradient(135deg, #5B6B8A, #4A5A7A)'
        };

        function buildGauge(p) {
            var card = document.createElement('div');
            card.style.cssText = 'padding:10px 4px 8px;border-radius:14px;background:' + p.color + '0F;display:flex;flex-direction:column;align-items:center;';

            var pct = p.best > 0 ? Math.min(p.current / p.best, 1) : 0;
            var bestOffset = 0;
            var curOffset = halfCirc * (1 - pct);

            // SVG half-circle
            var s = document.createElementNS(NS, 'svg');
            s.setAttribute('width', W);
            s.setAttribute('height', H);
            s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
            s.style.overflow = 'visible';

            // Track arc
            var track = document.createElementNS(NS, 'path');
            var arcD = 'M ' + (cx - R) + ' ' + cy + ' A ' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + cy;
            track.setAttribute('d', arcD);
            track.setAttribute('fill', 'none');
            track.setAttribute('stroke', 'rgba(0,0,0,0.05)');
            track.setAttribute('stroke-width', SW);
            track.setAttribute('stroke-linecap', 'round');
            s.appendChild(track);

            // Best arc (full half-circle at 25% opacity)
            if (p.best > 0) {
                var bestArc = document.createElementNS(NS, 'path');
                bestArc.setAttribute('d', arcD);
                bestArc.setAttribute('fill', 'none');
                bestArc.setAttribute('stroke', p.color);
                bestArc.setAttribute('stroke-opacity', '0.25');
                bestArc.setAttribute('stroke-width', SW);
                bestArc.setAttribute('stroke-linecap', 'round');
                bestArc.setAttribute('stroke-dasharray', halfCirc);
                bestArc.setAttribute('stroke-dashoffset', bestOffset);
                s.appendChild(bestArc);
            }

            // Current arc
            if (p.current > 0) {
                var curArc = document.createElementNS(NS, 'path');
                curArc.setAttribute('d', arcD);
                curArc.setAttribute('fill', 'none');
                curArc.setAttribute('stroke', p.color);
                curArc.setAttribute('stroke-width', SW);
                curArc.setAttribute('stroke-linecap', 'round');
                curArc.setAttribute('stroke-dasharray', halfCirc);
                curArc.setAttribute('stroke-dashoffset', curOffset);
                curArc.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)';
                s.appendChild(curArc);
            }

            // Center number
            var numEl = document.createElementNS(NS, 'text');
            numEl.setAttribute('x', cx);
            numEl.setAttribute('y', cy - 8);
            numEl.setAttribute('text-anchor', 'middle');
            numEl.setAttribute('fill', p.current > 0 ? p.color : '#B8BCC8');
            numEl.setAttribute('font-size', '18');
            numEl.setAttribute('font-weight', '800');
            numEl.setAttribute('font-family', 'Rubik, sans-serif');
            numEl.textContent = p.current;
            s.appendChild(numEl);

            card.appendChild(s);

            // Gradient icon square
            var iconBg = document.createElement('div');
            var grad = gradients[p.color] || ('linear-gradient(135deg,' + p.color + ',' + p.color + ')');
            iconBg.style.cssText = 'width:24px;height:24px;border-radius:7px;background:' + grad + ';display:flex;align-items:center;justify-content:center;margin-top:2px;';
            var icon = document.createElement('span');
            icon.className = 'material-symbols-rounded';
            icon.style.cssText = 'font-size:13px;color:#fff;font-variation-settings:"FILL" 1,"wght" 500;';
            icon.textContent = p.icon;
            iconBg.appendChild(icon);
            card.appendChild(iconBg);

            // Prayer name
            var name = document.createElement('div');
            name.style.cssText = 'font-size:10px;font-weight:700;color:#2B2D42;font-family:"Noto Kufi Arabic",sans-serif;margin-top:3px;';
            name.textContent = p.name;
            card.appendChild(name);

            // Best line
            var bestLine = document.createElement('div');
            bestLine.style.cssText = 'font-size:9px;font-weight:600;color:#8D99AE;font-family:Rubik,sans-serif;margin-top:2px;display:flex;align-items:center;gap:2px;';
            if (p.current > 0 && p.current >= p.best) {
                var fire = document.createElement('span');
                fire.className = 'material-symbols-rounded';
                fire.style.cssText = 'font-size:11px;color:#D4A03C;font-variation-settings:"FILL" 1,"wght" 500;';
                fire.textContent = 'local_fire_department';
                bestLine.appendChild(fire);
            }
            var bestText = document.createTextNode('\u0623\u0641\u0636\u0644: ' + p.best);
            bestLine.appendChild(bestText);
            card.appendChild(bestLine);

            return card;
        }

        // Row 1: 3 gauges (فجر، ظهر، عصر)
        var row1 = document.createElement('div');
        row1.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';
        for (var i = 0; i < 3 && i < prayers.length; i++) {
            var g = buildGauge(prayers[i]);
            g.style.flex = '1';
            row1.appendChild(g);
        }
        container.appendChild(row1);

        // Row 2: 2 gauges centered (مغرب، عشاء)
        if (prayers.length > 3) {
            var row2 = document.createElement('div');
            row2.style.cssText = 'display:flex;gap:8px;justify-content:center;';
            for (var j = 3; j < prayers.length; j++) {
                var g2 = buildGauge(prayers[j]);
                g2.style.flex = '0 1 calc(33.33% - 4px)';
                row2.appendChild(g2);
            }
            container.appendChild(row2);
        }
    }

    // ==================== 3. MOUNTAIN LANDSCAPE (area chart) ====================

    function mountainChart(container, data) {
        container.innerHTML = '';
        var months = data.labels || [];
        var values = data.values || [];       // total completion %
        var values2 = data.values2 || null;   // congregation % (optional)
        var currentIdx = data.currentMonth !== undefined ? data.currentMonth - 1 : -1;

        var W = 360, H = 200, padL = 10, padR = 10, padT = 25, padB = 45;
        var plotW = W - padL - padR, plotH = H - padT - padB;
        var maxVal = 100;
        var children = [];

        // Grid lines
        [25, 50, 75, 100].forEach(function(v) {
            var y = padT + plotH - (v / maxVal) * plotH;
            children.push(el('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: 'rgba(0,0,0,0.03)', 'stroke-width': 1 }));
            children.push(el('text', { x: W - padR + 4, y: y + 3, 'text-anchor': 'start', fill: '#C8CBD0', 'font-size': '8', 'font-family': 'Rubik, sans-serif' }, String(v)));
        });

        function buildPath(vals, close) {
            if (!vals || vals.length === 0) return '';
            var pts = vals.map(function(v, i) {
                return { x: padL + (i / (vals.length - 1)) * plotW, y: padT + plotH - (v / maxVal) * plotH };
            });
            // Smooth bezier
            var d = 'M' + pts[0].x + ',' + pts[0].y;
            for (var i = 1; i < pts.length; i++) {
                var cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * 0.4;
                var cp2x = pts[i].x - (pts[i].x - pts[i - 1].x) * 0.4;
                d += ' C' + cp1x + ',' + pts[i - 1].y + ' ' + cp2x + ',' + pts[i].y + ' ' + pts[i].x + ',' + pts[i].y;
            }
            if (close) {
                d += ' L' + pts[pts.length - 1].x + ',' + (padT + plotH) + ' L' + pts[0].x + ',' + (padT + plotH) + ' Z';
            }
            return d;
        }

        // Configurable colors (default: green for primary, gold for secondary)
        var color1 = data.color1 || 'var(--green-deep)';
        var color2 = data.color2 || 'var(--gold)';

        // Gradients
        var gradG = el('linearGradient', { id: 'mtnPrimary', x1: '0', y1: '0', x2: '0', y2: '1' });
        gradG.appendChild(el('stop', { offset: '0%', 'stop-color': '#40916C', 'stop-opacity': '0.5' }));
        gradG.appendChild(el('stop', { offset: '40%', 'stop-color': '#52B788', 'stop-opacity': '0.3' }));
        gradG.appendChild(el('stop', { offset: '100%', 'stop-color': '#52B788', 'stop-opacity': '0.05' }));
        children.push(el('defs', {}, [gradG]));

        // Primary area (total)
        children.push(el('path', { d: buildPath(values, true), fill: 'url(#mtnPrimary)', stroke: 'none' }));
        children.push(el('path', { d: buildPath(values, false), fill: 'none', stroke: color1, 'stroke-width': 2.5 }));

        // Secondary area if provided
        if (values2) {
            var gradSec = el('linearGradient', { id: 'mtnSecondary', x1: '0', y1: '0', x2: '0', y2: '1' });
            gradSec.appendChild(el('stop', { offset: '0%', 'stop-color': '#D4A03C', 'stop-opacity': '0.45' }));
            gradSec.appendChild(el('stop', { offset: '50%', 'stop-color': '#E8B84A', 'stop-opacity': '0.2' }));
            gradSec.appendChild(el('stop', { offset: '100%', 'stop-color': '#E8B84A', 'stop-opacity': '0.03' }));
            children.push(el('defs', {}, [gradSec]));
            children.push(el('path', { d: buildPath(values2, true), fill: 'url(#mtnSecondary)', stroke: 'none' }));
            children.push(el('path', { d: buildPath(values2, false), fill: 'none', stroke: color2, 'stroke-width': 2, 'stroke-dasharray': '6 3' }));
        }

        // Dots and labels (only show % on peaks >= 95 to avoid overlap)
        values.forEach(function(v, i) {
            var x = padL + (i / (values.length - 1)) * plotW;
            var y = padT + plotH - (v / maxVal) * plotH;
            var isHighlight = v >= 95;
            children.push(el('circle', { cx: x, cy: y, r: isHighlight ? 5 : 3.5, fill: color1, stroke: 'white', 'stroke-width': 2 }));
            if (isHighlight) {
                children.push(el('circle', { cx: x, cy: y, r: 8, fill: color1, opacity: '0.15' }));
                var labelY = (i % 2 === 0) ? y - 10 : y - 18;
                children.push(el('text', { x: x, y: labelY, 'text-anchor': 'middle', fill: 'var(--text-secondary)', 'font-size': '9', 'font-weight': '600', 'font-family': 'Rubik' }, v + '%'));
            }
        });

        // Current month indicator
        if (currentIdx >= 0 && currentIdx < values.length) {
            var cx2 = padL + (currentIdx / (values.length - 1)) * plotW;
            children.push(el('line', { x1: cx2, y1: padT, x2: cx2, y2: padT + plotH, stroke: 'var(--green-mid)', 'stroke-width': 1, 'stroke-dasharray': '3 2', opacity: '0.6' }));
        }

        // Month labels
        months.forEach(function(m, i) {
            var x = padL + (i / (months.length - 1)) * plotW;
            var isCurrent = i === currentIdx;
            children.push(el('text', { x: x, y: H - 8, 'text-anchor': 'middle', fill: isCurrent ? 'var(--green-deep)' : 'var(--text-muted)', 'font-size': '8', 'font-weight': isCurrent ? '700' : '400', 'font-family': 'Noto Kufi Arabic' }, m));
        });

        var s = svg(W, H, '0 0 ' + W + ' ' + H, children);
        container.appendChild(s);

        // Legend
        if (data.legend) {
            var leg = document.createElement('div');
            leg.className = 'svg-chart-legend';
            data.legend.forEach(function(item) {
                var dotStyle = item.dashed ? 'background:transparent;border:2px dashed ' + item.color : 'background:' + item.color;
                leg.innerHTML += '<div class="svg-legend-item"><span class="svg-legend-dot" style="' + dotStyle + '"></span><span class="svg-legend-label">' + item.label + '</span></div>';
            });
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
