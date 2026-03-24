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
        var size = 220, cx = 110, cy = 110, strokeW = 16;
        var rings = data.rings || []; // [{value, max, color, label}]
        var centerText = data.centerText || '';
        var centerSub = data.centerSub || '';

        var children = [];

        rings.forEach(function(ring, i) {
            var r = 85 - i * 24;
            var pct = ring.max > 0 ? Math.min(ring.value / ring.max, 1) : 0;
            var circ = 2 * Math.PI * r;
            var offset = circ * (1 - pct);

            // Track
            children.push(el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: ring.color + '22', 'stroke-width': strokeW }));
            // Value arc
            var arc = el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: ring.color, 'stroke-width': strokeW, 'stroke-linecap': 'round', 'stroke-dasharray': circ, 'stroke-dashoffset': offset, transform: 'rotate(-90 ' + cx + ' ' + cy + ')' });
            arc.style.transition = 'stroke-dashoffset 0.8s ease';
            children.push(arc);
        });

        // Center text
        children.push(el('text', { x: cx, y: cy - 8, 'text-anchor': 'middle', fill: 'var(--text-primary)', 'font-size': '32', 'font-weight': '800', 'font-family': 'Rubik, sans-serif' }, centerText));
        children.push(el('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', fill: 'var(--text-muted)', 'font-size': '12', 'font-family': 'Noto Kufi Arabic, sans-serif' }, centerSub));

        var s = svg(size, size, '0 0 ' + size + ' ' + size, children);
        container.appendChild(s);

        // Legend
        if (data.legend) {
            var leg = document.createElement('div');
            leg.className = 'svg-chart-legend';
            data.legend.forEach(function(item) {
                leg.innerHTML += '<div class="svg-legend-item"><span class="svg-legend-dot" style="background:' + item.color + '"></span><span class="svg-legend-label">' + item.label + '</span><span class="svg-legend-value">' + item.value + '</span></div>';
            });
            container.appendChild(leg);
        }
    }

    // ==================== 2. STREAK FLAME BARS ====================

    function streakFlameBars(container, data) {
        container.innerHTML = '';
        var prayers = data.prayers || []; // [{name, icon, color, current, best}]
        var maxBest = Math.max.apply(null, prayers.map(function(p) { return Math.max(p.best, 1); }));
        var barW = 36, gap = 16, chartH = 180, padBot = 60, padTop = 30;
        var totalW = prayers.length * (barW + gap) - gap + 40;
        var children = [];

        prayers.forEach(function(p, i) {
            var x = 20 + i * (barW + gap);
            var bestH = (p.best / maxBest) * (chartH - padTop);
            var curH = (p.current / maxBest) * (chartH - padTop);
            var bestY = chartH - bestH;
            var curY = chartH - curH;

            // Ghost (best) bar
            children.push(el('rect', { x: x, y: bestY, width: barW, height: bestH, rx: 8, fill: 'none', stroke: p.color + '44', 'stroke-width': 2, 'stroke-dasharray': '4 3' }));
            // Current bar
            var grad = el('linearGradient', { id: 'sg' + i, x1: '0', y1: '1', x2: '0', y2: '0' });
            grad.appendChild(el('stop', { offset: '0%', 'stop-color': p.color + 'cc' }));
            grad.appendChild(el('stop', { offset: '100%', 'stop-color': p.color }));
            children.push(el('defs', {}, [grad]));
            children.push(el('rect', { x: x, y: curY, width: barW, height: curH, rx: 8, fill: 'url(#sg' + i + ')' }));
            // Fire icon if current == best and > 0
            if (p.current > 0 && p.current >= p.best) {
                children.push(el('text', { x: x + barW / 2, y: curY - 4, 'text-anchor': 'middle', fill: '#ea580c', 'font-size': '16', 'font-family': 'Material Symbols Rounded' }, 'local_fire_department'));
            }
            // Value label
            children.push(el('text', { x: x + barW / 2, y: curY + curH / 2 + 5, 'text-anchor': 'middle', fill: 'white', 'font-size': '13', 'font-weight': '700', 'font-family': 'Rubik' }, '' + p.current));
            // Prayer icon + name below
            children.push(el('text', { x: x + barW / 2, y: chartH + 20, 'text-anchor': 'middle', fill: p.color, 'font-size': '18', 'font-family': 'Material Symbols Rounded' }, p.icon));
            children.push(el('text', { x: x + barW / 2, y: chartH + 38, 'text-anchor': 'middle', fill: 'var(--text-muted)', 'font-size': '9', 'font-family': 'Noto Kufi Arabic' }, p.name));
        });

        var s = svg(totalW, chartH + padBot, '0 0 ' + totalW + ' ' + (chartH + padBot), children);
        container.appendChild(s);

        // Legend
        if (data.legendLabels) {
            var leg = document.createElement('div');
            leg.className = 'svg-chart-legend';
            leg.innerHTML =
                '<div class="svg-legend-item"><span class="svg-legend-dot" style="background:var(--green-deep)"></span><span class="svg-legend-label">' + (data.legendLabels.current || 'الحالية') + '</span></div>' +
                '<div class="svg-legend-item"><span class="svg-legend-dot" style="background:transparent;border:2px dashed var(--text-muted)"></span><span class="svg-legend-label">' + (data.legendLabels.best || 'الأفضل') + '</span></div>' +
                '<div class="svg-legend-item"><span class="svg-legend-dot" style="background:#ea580c"></span><span class="svg-legend-label">' + (data.legendLabels.record || 'رقم قياسي') + '</span></div>';
            container.appendChild(leg);
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
            children.push(el('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: 'var(--border, rgba(0,0,0,0.06))', 'stroke-width': 1 }));
            children.push(el('text', { x: padL - 2, y: y + 3, 'text-anchor': 'end', fill: 'var(--text-faint)', 'font-size': '8', 'font-family': 'Rubik' }, v + '%'));
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
        gradG.appendChild(el('stop', { offset: '0%', 'stop-color': color1, 'stop-opacity': '0.4' }));
        gradG.appendChild(el('stop', { offset: '100%', 'stop-color': color1, 'stop-opacity': '0.05' }));
        children.push(el('defs', {}, [gradG]));

        // Primary area (total)
        children.push(el('path', { d: buildPath(values, true), fill: 'url(#mtnPrimary)', stroke: 'none' }));
        children.push(el('path', { d: buildPath(values, false), fill: 'none', stroke: color1, 'stroke-width': 2.5 }));

        // Secondary area if provided
        if (values2) {
            var gradSec = el('linearGradient', { id: 'mtnSecondary', x1: '0', y1: '0', x2: '0', y2: '1' });
            gradSec.appendChild(el('stop', { offset: '0%', 'stop-color': color2, 'stop-opacity': '0.3' }));
            gradSec.appendChild(el('stop', { offset: '100%', 'stop-color': color2, 'stop-opacity': '0.05' }));
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

        var size = 260, cx = 130, cy = 130, R = 95;
        var children = [];

        // Grid rings
        [25, 50, 75, 100].forEach(function(pct) {
            var r = (pct / 100) * R;
            var pts = [];
            for (var i = 0; i < n; i++) {
                var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                pts.push((cx + r * Math.cos(angle)).toFixed(1) + ',' + (cy + r * Math.sin(angle)).toFixed(1));
            }
            children.push(el('polygon', { points: pts.join(' '), fill: 'none', stroke: 'var(--border, rgba(0,0,0,0.08))', 'stroke-width': 1 }));
        });

        // Axis lines
        for (var i = 0; i < n; i++) {
            var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            children.push(el('line', { x1: cx, y1: cy, x2: cx + R * Math.cos(angle), y2: cy + R * Math.sin(angle), stroke: 'var(--border, rgba(0,0,0,0.06))', 'stroke-width': 1 }));
        }

        function makePoly(vals, color, opacity) {
            var pts = vals.map(function(v, i) {
                var r = (v / 100) * R;
                var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                return (cx + r * Math.cos(angle)).toFixed(1) + ',' + (cy + r * Math.sin(angle)).toFixed(1);
            });
            children.push(el('polygon', { points: pts.join(' '), fill: color, 'fill-opacity': opacity, stroke: color, 'stroke-width': 2 }));
        }

        // Congregation polygon (gold, behind)
        if (data.showCongregation) {
            makePoly(prayers.map(function(p) { return p.congregation || 0; }), 'var(--gold)', 0.15);
        }
        // Completion polygon (green)
        makePoly(prayers.map(function(p) { return p.completion || 0; }), 'var(--green-deep)', 0.2);

        // Labels
        prayers.forEach(function(p, i) {
            var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            var lx = cx + (R + 28) * Math.cos(angle);
            var ly = cy + (R + 28) * Math.sin(angle);
            children.push(el('text', { x: lx, y: ly - 6, 'text-anchor': 'middle', fill: 'var(--text-primary)', 'font-size': '10', 'font-weight': '600', 'font-family': 'Noto Kufi Arabic' }, p.name));
            children.push(el('text', { x: lx, y: ly + 8, 'text-anchor': 'middle', fill: p.color || 'var(--text-muted)', 'font-size': '11', 'font-weight': '700', 'font-family': 'Rubik' }, p.completion + '%'));
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

        var size = 260, cx = 130, cy = 130, R = 100, innerR = 35;
        var children = [];

        // Center circle
        var avg = Math.round(days.reduce(function(s, d) { return s + d.value; }, 0) / 7);
        children.push(el('circle', { cx: cx, cy: cy, r: innerR, fill: 'var(--card-bg, rgba(255,255,255,0.55))', stroke: 'var(--border)', 'stroke-width': 1 }));
        children.push(el('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', fill: 'var(--text-primary)', 'font-size': '20', 'font-weight': '800', 'font-family': 'Rubik' }, avg + '%'));
        children.push(el('text', { x: cx, y: cy + 12, 'text-anchor': 'middle', fill: 'var(--text-muted)', 'font-size': '9', 'font-family': 'Noto Kufi Arabic' }, 'المعدل'));

        var segAngle = (2 * Math.PI) / 7;
        days.forEach(function(d, i) {
            var startAngle = segAngle * i - Math.PI / 2;
            var endAngle = startAngle + segAngle;
            var midAngle = startAngle + segAngle / 2;
            var segR = innerR + ((d.value / 100) * (R - innerR));

            var color = d.value >= 90 ? 'var(--green-deep)' : d.value >= 75 ? 'var(--green-mid)' : d.value >= 60 ? 'var(--gold)' : 'var(--red)';

            // Segment path
            var x1i = cx + innerR * Math.cos(startAngle);
            var y1i = cy + innerR * Math.sin(startAngle);
            var x1o = cx + segR * Math.cos(startAngle);
            var y1o = cy + segR * Math.sin(startAngle);
            var x2i = cx + innerR * Math.cos(endAngle);
            var y2i = cy + innerR * Math.sin(endAngle);
            var x2o = cx + segR * Math.cos(endAngle);
            var y2o = cy + segR * Math.sin(endAngle);

            var path = 'M' + x1i + ',' + y1i + ' L' + x1o + ',' + y1o +
                ' A' + segR + ',' + segR + ' 0 0,1 ' + x2o + ',' + y2o +
                ' L' + x2i + ',' + y2i +
                ' A' + innerR + ',' + innerR + ' 0 0,0 ' + x1i + ',' + y1i + 'Z';

            children.push(el('path', { d: path, fill: color, opacity: '0.7', stroke: 'white', 'stroke-width': 1.5 }));

            // Label
            var lR = R + 18;
            var lx = cx + lR * Math.cos(midAngle);
            var ly = cy + lR * Math.sin(midAngle);
            children.push(el('text', { x: lx, y: ly - 4, 'text-anchor': 'middle', fill: 'var(--text-primary)', 'font-size': '10', 'font-weight': '600', 'font-family': 'Noto Kufi Arabic' }, d.name));
            children.push(el('text', { x: lx, y: ly + 9, 'text-anchor': 'middle', fill: color, 'font-size': '10', 'font-weight': '700', 'font-family': 'Rubik' }, d.value + '%'));
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

        var cellSize = 18, gap = 3, labelW = 50, padT = 5;
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

            children.push(el('rect', { x: x, y: y, width: cellSize, height: cellSize, rx: 4, fill: color }));
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
