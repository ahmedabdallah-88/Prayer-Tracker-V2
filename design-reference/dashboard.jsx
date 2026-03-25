import { useState, useEffect, useRef } from "react";

const M = ({ icon, size = 20, weight = 400, fill = 0, color = "inherit", style = {} }) => (
  <span className="material-symbols-rounded" style={{
    fontSize: size,
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
    color, lineHeight: 1, verticalAlign: "middle", ...style,
  }}>{icon}</span>
);

const PRAYERS = [
  { id: "fajr", name: "الفجر", icon: "wb_twilight", gradient: "linear-gradient(135deg, #E8B4B8, #D4A0A7)", color: "#D4A0A7" },
  { id: "dhuhr", name: "الظهر", icon: "wb_sunny", gradient: "linear-gradient(135deg, #F0C75E, #E8B84A)", color: "#E8B84A" },
  { id: "asr", name: "العصر", icon: "partly_cloudy_day", gradient: "linear-gradient(135deg, #E8A849, #D4943A)", color: "#D4943A" },
  { id: "maghrib", name: "المغرب", icon: "wb_twilight", gradient: "linear-gradient(135deg, #C47A5A, #B0664A)", color: "#B0664A" },
  { id: "isha", name: "العشاء", icon: "dark_mode", gradient: "linear-gradient(135deg, #5B6B8A, #4A5A7A)", color: "#4A5A7A" },
];

const HIJRI_MONTHS_SHORT = ["محرم", "صفر", "ربيع١", "ربيع٢", "جمادى١", "جمادى٢", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
const MONTH_DATA = [85, 92, 78, 95, 88, 72, 90, 96, 100, 82, 0, 0];
const CONG_DATA = [68, 75, 60, 82, 71, 55, 78, 85, 95, 70, 0, 0];
const PRAYER_RATES = { fajr: 72, dhuhr: 91, asr: 85, maghrib: 95, isha: 88 };
const PRAYER_CONG = { fajr: 45, dhuhr: 78, asr: 62, maghrib: 88, isha: 75 };
const DAY_NAMES = ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];
const WEEKLY_CONG = [82, 65, 70, 68, 72, 85, 95]; // sat-fri congregation %

// ==================== INNOVATIVE CHART COMPONENTS ====================

// 1. RADIAL PROGRESS — Annual completion as orbital rings
function OrbitalProgress({ total, completed, congCount }) {
  const rate = Math.round((completed / total) * 100);
  const congRate = Math.round((congCount / completed) * 100);
  const size = 180;
  const cx = size / 2, cy = size / 2;

  const arc = (r, pct, color, width) => {
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={width}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />
    );
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
      borderRadius: 24, padding: "20px", border: "1px solid rgba(0,0,0,0.04)",
      display: "flex", alignItems: "center", gap: 20,
    }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track rings */}
          <circle cx={cx} cy={cy} r={72} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth={10} />
          <circle cx={cx} cy={cy} r={56} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth={8} />
          {/* Data rings */}
          {arc(72, rate, "#40916C", 10)}
          {arc(56, congRate, "#D4A03C", 8)}
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontSize: 36, fontWeight: 800, color: "#2B2D42",
            fontFamily: "'Rubik', sans-serif", lineHeight: 1,
          }}>{rate}</span>
          <span style={{
            fontSize: 12, color: "#8D99AE", fontWeight: 600, marginTop: 2,
          }}>%</span>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#2B2D42", marginBottom: 14 }}>
          التقدم السنوي
        </div>
        {[
          { label: "الإنجاز", value: `${rate}%`, color: "#40916C", sub: `${completed} / ${total}` },
          { label: "الجماعة", value: `${congRate}%`, color: "#D4A03C", sub: `${congCount} صلاة` },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: i < 2 ? 10 : 0,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              background: item.color,
              boxShadow: `0 2px 6px ${item.color}40`,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#2B2D42" }}>{item.label}</div>
              <div style={{ fontSize: 10, color: "#8D99AE", marginTop: 1 }}>{item.sub}</div>
            </div>
            <span style={{
              fontSize: 16, fontWeight: 800, color: item.color,
              fontFamily: "'Rubik', sans-serif",
            }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. RADAR CHART — Prayer balance spider web
function PrayerRadar() {
  const size = 220, cx = size / 2, cy = size / 2, maxR = 85;
  const angles = PRAYERS.map((_, i) => (i * 2 * Math.PI / 5) - Math.PI / 2);
  const rates = Object.values(PRAYER_RATES);
  const congRates = Object.values(PRAYER_CONG);

  const polygon = (values, max) => {
    return values.map((v, i) => {
      const r = (v / max) * maxR;
      return `${cx + r * Math.cos(angles[i])},${cy + r * Math.sin(angles[i])}`;
    }).join(" ");
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
      borderRadius: 24, padding: "16px", border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{
        fontSize: 14, fontWeight: 700, color: "#2B2D42", marginBottom: 4,
        display: "flex", alignItems: "center", gap: 6, padding: "0 4px",
      }}>
        <M icon="pentagon" size={18} color="#2D6A4F" weight={500} />
        توازن الصلوات
      </div>
      <div style={{ fontSize: 11, color: "#8D99AE", fontWeight: 500, marginBottom: 12, padding: "0 4px" }}>
        مقارنة أداء كل صلاة — كلما اكتمل الشكل كان الأداء أفضل
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={size} height={size}>
          {/* Grid rings */}
          {[25, 50, 75, 100].map(pct => {
            const r = (pct / 100) * maxR;
            return <circle key={pct} cx={cx} cy={cy} r={r} fill="none"
              stroke="rgba(0,0,0,0.04)" strokeWidth={1} />;
          })}
          {/* Axis lines */}
          {angles.map((a, i) => (
            <line key={i} x1={cx} y1={cy}
              x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)}
              stroke="rgba(0,0,0,0.04)" strokeWidth={1} />
          ))}
          {/* Congregation polygon */}
          <polygon points={polygon(congRates, 100)}
            fill="rgba(212,160,60,0.1)" stroke="#D4A03C" strokeWidth={1.5}
            strokeLinejoin="round" style={{ transition: "all 0.8s ease" }} />
          {/* Completion polygon */}
          <polygon points={polygon(rates, 100)}
            fill="rgba(64,145,108,0.12)" stroke="#40916C" strokeWidth={2}
            strokeLinejoin="round" style={{ transition: "all 0.8s ease" }} />
          {/* Data points */}
          {rates.map((v, i) => {
            const r = (v / 100) * maxR;
            return <circle key={i} cx={cx + r * Math.cos(angles[i])}
              cy={cy + r * Math.sin(angles[i])} r={4}
              fill="#40916C" stroke="#fff" strokeWidth={2} />;
          })}
          {/* Labels */}
          {PRAYERS.map((p, i) => {
            const lr = maxR + 22;
            const lx = cx + lr * Math.cos(angles[i]);
            const ly = cy + lr * Math.sin(angles[i]);
            return (
              <g key={i}>
                <text x={lx} y={ly - 6} textAnchor="middle" style={{
                  fontSize: 11, fontWeight: 700, fill: "#2B2D42",
                  fontFamily: "'Noto Kufi Arabic', sans-serif",
                }}>{p.name}</text>
                <text x={lx} y={ly + 8} textAnchor="middle" style={{
                  fontSize: 10, fontWeight: 700, fill: "#40916C",
                  fontFamily: "'Rubik', sans-serif",
                }}>{rates[i]}%</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 20, marginTop: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 16, height: 3, borderRadius: 2, background: "#40916C" }} />
          <span style={{ fontSize: 11, color: "#8D99AE", fontWeight: 600 }}>الإنجاز</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 16, height: 3, borderRadius: 2, background: "#D4A03C" }} />
          <span style={{ fontSize: 11, color: "#8D99AE", fontWeight: 600 }}>الجماعة</span>
        </div>
      </div>
    </div>
  );
}

// 3. MOUNTAIN LANDSCAPE — Monthly progress with dual terrain layers
function WaveChart() {
  const w = 380, h = 200, padX = 8, padY = 24;
  const dataW = w - padX * 2;
  const dataH = h - padY * 2 - 20;
  const max = 100;
  const baseY = padY + dataH;

  const getX = (i) => padX + (i / 11) * dataW;
  const getY = (v) => padY + dataH - (v / max) * dataH;

  // Smooth bezier through points
  const smoothPath = (values, close = false) => {
    const pts = values.map((v, i) => ({ x: getX(i), y: getY(v) }));
    const activePts = pts.filter((_, i) => values[i] > 0 || (i > 0 && values[i - 1] > 0));

    if (activePts.length < 2) return "";

    let d = `M ${activePts[0].x},${activePts[0].y}`;
    for (let i = 1; i < activePts.length; i++) {
      const prev = activePts[i - 1];
      const cur = activePts[i];
      const tension = 0.3;
      const cp1x = prev.x + (cur.x - prev.x) * tension;
      const cp2x = cur.x - (cur.x - prev.x) * tension;
      d += ` C ${cp1x},${prev.y} ${cp2x},${cur.y} ${cur.x},${cur.y}`;
    }

    if (close) {
      const last = activePts[activePts.length - 1];
      const first = activePts[0];
      d += ` L ${last.x},${baseY} L ${first.x},${baseY} Z`;
    }
    return d;
  };

  // Filter active months
  const activeCompletion = MONTH_DATA.map((v, i) => v > 0 ? v : (i > 0 && MONTH_DATA[i-1] > 0 ? 0 : -1));
  const activeCong = CONG_DATA.map((v, i) => MONTH_DATA[i] > 0 ? v : -1);

  return (
    <div style={{
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
      borderRadius: 24, padding: "16px 10px 12px", border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{
        fontSize: 14, fontWeight: 700, color: "#2B2D42",
        display: "flex", alignItems: "center", gap: 6, padding: "0 8px", marginBottom: 4,
      }}>
        <M icon="landscape" size={18} color="#2D6A4F" weight={500} />
        المسار الشهري
      </div>
      <div style={{
        fontSize: 11, color: "#8D99AE", fontWeight: 500, padding: "0 8px", marginBottom: 8,
      }}>
        أداء كل شهر — المنطقة الخضراء الإنجاز الكلي والذهبية صلاة الجماعة
      </div>

      <svg width="100%" viewBox={`0 0 ${w} ${h + 16}`} style={{ overflow: "visible" }}>
        <defs>
          {/* Completion gradient */}
          <linearGradient id="mountainGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#40916C" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#52B788" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#52B788" stopOpacity="0.05" />
          </linearGradient>
          {/* Congregation gradient */}
          <linearGradient id="mountainGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4A03C" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#E8B84A" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#E8B84A" stopOpacity="0.03" />
          </linearGradient>
          {/* Snow cap glow for peaks */}
          <filter id="peakGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle horizontal grid */}
        {[25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={padX} y1={getY(v)} x2={w - padX} y2={getY(v)}
              stroke="rgba(0,0,0,0.03)" strokeWidth={1} />
            <text x={w - padX + 4} y={getY(v) + 3} textAnchor="start" style={{
              fontSize: 8, fill: "#C8CBD0", fontFamily: "'Rubik', sans-serif",
            }}>{v}</text>
          </g>
        ))}

        {/* Baseline */}
        <line x1={padX} y1={baseY} x2={w - padX} y2={baseY}
          stroke="rgba(0,0,0,0.06)" strokeWidth={1} />

        {/* COMPLETION MOUNTAIN — filled area */}
        <path d={smoothPath(MONTH_DATA, true)} fill="url(#mountainGreen)" />
        {/* Completion ridge line */}
        <path d={smoothPath(MONTH_DATA, false)} fill="none"
          stroke="#40916C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* CONGREGATION MOUNTAIN — filled area (overlaid) */}
        <path d={smoothPath(CONG_DATA, true)} fill="url(#mountainGold)" />
        {/* Congregation ridge line */}
        <path d={smoothPath(CONG_DATA, false)} fill="none"
          stroke="#D4A03C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="6 3" />

        {/* Peak dots + values for completion */}
        {MONTH_DATA.map((v, i) => {
          if (v === 0) return null;
          const x = getX(i);
          const y = getY(v);
          const isPeak = v >= 95;
          return (
            <g key={`c-${i}`}>
              {/* Dot */}
              <circle cx={x} cy={y} r={isPeak ? 5 : 3.5}
                fill="#40916C" stroke="#fff" strokeWidth={2}
                filter={isPeak ? "url(#peakGlow)" : undefined} />
              {/* Value label */}
              <text x={x} y={y - 10} textAnchor="middle" style={{
                fontSize: isPeak ? 10 : 8,
                fontWeight: isPeak ? 800 : 600,
                fill: isPeak ? "#2D6A4F" : "#5A7D5B",
                fontFamily: "'Rubik', sans-serif",
              }}>{v}%</text>
            </g>
          );
        })}

        {/* Congregation dots */}
        {CONG_DATA.map((v, i) => {
          if (v === 0 || MONTH_DATA[i] === 0) return null;
          const x = getX(i);
          const y = getY(v);
          return (
            <circle key={`g-${i}`} cx={x} cy={y} r={3}
              fill="#D4A03C" stroke="#fff" strokeWidth={1.5} />
          );
        })}

        {/* Month labels along bottom */}
        {HIJRI_MONTHS_SHORT.map((m, i) => {
          const x = getX(i);
          const isActive = MONTH_DATA[i] > 0;
          return (
            <text key={i} x={x} y={baseY + 16} textAnchor="middle" style={{
              fontSize: 8, fontWeight: 600,
              fill: isActive ? "#5A5D6E" : "#C8CBD0",
              fontFamily: "'Noto Kufi Arabic', sans-serif",
            }}>{m}</text>
          );
        })}

        {/* Current month indicator */}
        {MONTH_DATA.map((v, i) => {
          if (i !== 9) return null; // شوال = current
          const x = getX(i);
          return (
            <g key="current">
              <line x1={x} y1={getY(v) + 8} x2={x} y2={baseY}
                stroke="#2D6A4F" strokeWidth={1} strokeDasharray="3 3" opacity={0.3} />
              <circle cx={x} cy={baseY + 16} r={2} fill="#2D6A4F" />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 18,
        marginTop: 6, padding: "4px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{
            width: 18, height: 8, borderRadius: 3,
            background: "linear-gradient(135deg, #40916C, #52B788)",
          }} />
          <span style={{ fontSize: 10, color: "#8D99AE", fontWeight: 600 }}>الإنجاز الكلي</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{
            width: 18, height: 6, borderRadius: 3,
            background: "linear-gradient(135deg, #D4A03C, #E8B84A)",
            border: "1px dashed #D4A03Caa",
          }} />
          <span style={{ fontSize: 10, color: "#8D99AE", fontWeight: 600 }}>الجماعة</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#40916C", border: "1.5px solid #fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }} />
          <span style={{ fontSize: 10, color: "#8D99AE", fontWeight: 600 }}>قمة</span>
        </div>
      </div>
    </div>
  );
}

// 4. HEATMAP — Congregation consistency (GitHub style but Islamic)
function CongregationHeatmap() {
  const weeks = 10;
  const data = Array.from({ length: weeks * 7 }, () =>
    Math.random() > 0.15 ? Math.floor(Math.random() * 5) + 1 : 0
  );
  const getColor = (v) => {
    if (v === 0) return "rgba(0,0,0,0.03)";
    if (v <= 1) return "rgba(45,106,79,0.15)";
    if (v <= 2) return "rgba(45,106,79,0.3)";
    if (v <= 3) return "rgba(45,106,79,0.5)";
    if (v <= 4) return "rgba(45,106,79,0.7)";
    return "#2D6A4F";
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
      borderRadius: 24, padding: "16px", border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{
        fontSize: 14, fontWeight: 700, color: "#2B2D42",
        display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
      }}>
        <M icon="grid_on" size={18} color="#2D6A4F" weight={500} />
        خريطة المواظبة
      </div>
      <div style={{ fontSize: 11, color: "#8D99AE", fontWeight: 500, marginBottom: 12 }}>
        كل مربع = يوم — اللون الأغمق = صلوات جماعة أكثر
      </div>

      {/* Day labels */}
      <div style={{ display: "flex", gap: 3, paddingRight: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginLeft: 4, flexShrink: 0, width: 28 }}>
          {DAY_NAMES.map((d, i) => (
            <div key={i} style={{
              height: 14, fontSize: 8, color: "#B8BCC8", fontWeight: 600,
              display: "flex", alignItems: "center",
              fontFamily: "'Noto Kufi Arabic', sans-serif",
            }}>{d}</div>
          ))}
        </div>
        <div style={{
          display: "flex", gap: 3, flex: 1,
        }}>
          {Array.from({ length: weeks }, (_, w) => (
            <div key={w} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {Array.from({ length: 7 }, (_, d) => (
                <div key={d} style={{
                  width: 14, height: 14, borderRadius: 3,
                  background: getColor(data[w * 7 + d]),
                  transition: "background 0.3s ease",
                  transitionDelay: `${(w * 7 + d) * 8}ms`,
                }} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "flex-end",
        gap: 4, marginTop: 10,
      }}>
        <span style={{ fontSize: 9, color: "#B8BCC8" }}>أقل</span>
        {[0, 1, 2, 3, 4, 5].map(v => (
          <div key={v} style={{
            width: 12, height: 12, borderRadius: 3,
            background: getColor(v),
          }} />
        ))}
        <span style={{ fontSize: 9, color: "#B8BCC8" }}>أكثر</span>
      </div>
    </div>
  );
}

// 5. WEEKLY RHYTHM — Circular week visualization
function WeeklyRhythm() {
  const size = 180, cx = size / 2, cy = size / 2;

  return (
    <div style={{
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
      borderRadius: 24, padding: "16px", border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{
        fontSize: 14, fontWeight: 700, color: "#2B2D42",
        display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
      }}>
        <M icon="timelapse" size={18} color="#D4A03C" weight={500} />
        إيقاع الأسبوع
      </div>
      <div style={{ fontSize: 11, color: "#8D99AE", fontWeight: 500, marginBottom: 10 }}>
        نسبة صلاة الجماعة حسب اليوم — الجمعة الأعلى دائماً
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={size} height={size}>
          {/* Background arcs */}
          {DAY_NAMES.map((day, i) => {
            const angle = (i / 7) * 2 * Math.PI - Math.PI / 2;
            const nextAngle = ((i + 1) / 7) * 2 * Math.PI - Math.PI / 2;
            const midAngle = (angle + nextAngle) / 2;
            const r = 30 + (WEEKLY_CONG[i] / 100) * 50;
            const maxR = 80;

            // Sector path
            const x1 = cx + 30 * Math.cos(angle + 0.04);
            const y1 = cy + 30 * Math.sin(angle + 0.04);
            const x2 = cx + r * Math.cos(angle + 0.04);
            const y2 = cy + r * Math.sin(angle + 0.04);
            const x3 = cx + r * Math.cos(nextAngle - 0.04);
            const y3 = cy + r * Math.sin(nextAngle - 0.04);
            const x4 = cx + 30 * Math.cos(nextAngle - 0.04);
            const y4 = cy + 30 * Math.sin(nextAngle - 0.04);

            const largeArc = 0;
            const pct = WEEKLY_CONG[i];
            const color = pct >= 90 ? "#2D6A4F" : pct >= 75 ? "#40916C" : pct >= 60 ? "#D4A03C" : "#C1574E";

            // Track
            const tx2 = cx + maxR * Math.cos(angle + 0.04);
            const ty2 = cy + maxR * Math.sin(angle + 0.04);
            const tx3 = cx + maxR * Math.cos(nextAngle - 0.04);
            const ty3 = cy + maxR * Math.sin(nextAngle - 0.04);

            const labelR = maxR + 14;
            const lx = cx + labelR * Math.cos(midAngle);
            const ly = cy + labelR * Math.sin(midAngle);

            return (
              <g key={i}>
                {/* Track */}
                <path d={`M ${x1} ${y1} L ${tx2} ${ty2} A ${maxR} ${maxR} 0 ${largeArc} 1 ${tx3} ${ty3} L ${x4} ${y4} A 30 30 0 ${largeArc} 0 ${x1} ${y1}`}
                  fill="rgba(0,0,0,0.02)" />
                {/* Value */}
                <path d={`M ${x1} ${y1} L ${x2} ${y2} A ${r} ${r} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A 30 30 0 ${largeArc} 0 ${x1} ${y1}`}
                  fill={color} opacity={0.7}
                  style={{ transition: "all 0.6s ease", transitionDelay: `${i * 80}ms` }} />
                {/* Label */}
                <text x={lx} y={ly - 4} textAnchor="middle" style={{
                  fontSize: 9, fontWeight: 700, fill: "#2B2D42",
                  fontFamily: "'Noto Kufi Arabic', sans-serif",
                }}>{day}</text>
                <text x={lx} y={ly + 7} textAnchor="middle" style={{
                  fontSize: 9, fontWeight: 700, fill: color,
                  fontFamily: "'Rubik', sans-serif",
                }}>{pct}%</text>
              </g>
            );
          })}
          {/* Center */}
          <circle cx={cx} cy={cy} r={28} fill="#F5F3EF" />
          <text x={cx} y={cy - 3} textAnchor="middle" style={{
            fontSize: 8, fontWeight: 600, fill: "#8D99AE",
            fontFamily: "'Noto Kufi Arabic', sans-serif",
          }}>متوسط</text>
          <text x={cx} y={cy + 10} textAnchor="middle" style={{
            fontSize: 14, fontWeight: 800, fill: "#2B2D42",
            fontFamily: "'Rubik', sans-serif",
          }}>{Math.round(WEEKLY_CONG.reduce((a, b) => a + b) / 7)}%</text>
        </svg>
      </div>
    </div>
  );
}

// 6. PRAYER PERFORMANCE — Horizontal lollipop chart
function PrayerLollipop() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
      borderRadius: 24, padding: "16px", border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{
        fontSize: 14, fontWeight: 700, color: "#2B2D42",
        display: "flex", alignItems: "center", gap: 6, marginBottom: 14,
      }}>
        <M icon="compare_arrows" size={18} color="#2D6A4F" weight={500} />
        أداء كل صلاة
      </div>

      {PRAYERS.map((p, i) => {
        const rate = PRAYER_RATES[p.id];
        const cong = PRAYER_CONG[p.id];
        return (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: i < 4 ? 14 : 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: p.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 2px 8px ${p.color}30`,
            }}>
              <M icon={p.icon} size={16} fill={1} color="#fff" weight={500} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 5,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#2B2D42" }}>{p.name}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{
                    fontSize: 14, fontWeight: 800, color: "#40916C",
                    fontFamily: "'Rubik', sans-serif",
                  }}>{rate}%</span>
                </div>
              </div>

              {/* Double bar */}
              <div style={{ position: "relative", height: 16 }}>
                {/* Track */}
                <div style={{
                  position: "absolute", top: 2, left: 0, right: 0, height: 4,
                  borderRadius: 2, background: "rgba(0,0,0,0.04)",
                }} />
                {/* Congregation bar (behind) */}
                <div style={{
                  position: "absolute", top: 0, left: 0,
                  width: `${cong}%`, height: 8, borderRadius: 4,
                  background: "rgba(212,160,60,0.2)",
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDelay: `${i * 80}ms`,
                }} />
                {/* Completion bar (front) */}
                <div style={{
                  position: "absolute", top: 2, left: 0,
                  width: `${rate}%`, height: 4, borderRadius: 2,
                  background: `linear-gradient(90deg, ${p.color}, ${p.color}cc)`,
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDelay: `${i * 80}ms`,
                }} />
                {/* Lollipop dot */}
                <div style={{
                  position: "absolute", top: -1, left: `${rate}%`,
                  width: 10, height: 10, borderRadius: "50%",
                  background: p.color, border: "2px solid #fff",
                  boxShadow: `0 2px 6px ${p.color}40`,
                  transform: "translateX(-50%)",
                  transition: "left 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDelay: `${i * 80}ms`,
                }} />
                {/* Congregation marker */}
                <div style={{
                  position: "absolute", top: 10, left: `${cong}%`,
                  transform: "translateX(-50%)",
                  fontSize: 8, fontWeight: 700, color: "#D4A03C",
                  fontFamily: "'Rubik', sans-serif",
                  transition: "left 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDelay: `${i * 80}ms`,
                }}>
                  <M icon="mosque" size={8} fill={1} color="#D4A03C" weight={500} /> {cong}%
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 7. STREAK CARD — Vertical flame bars per prayer
function StreakTimeline() {
  const prayerStreaks = [
    { id: "fajr", name: "الفجر", icon: "wb_twilight", gradient: "linear-gradient(135deg, #E8B4B8, #D4A0A7)", color: "#D4A0A7", current: 23, best: 45 },
    { id: "dhuhr", name: "الظهر", icon: "wb_sunny", gradient: "linear-gradient(135deg, #F0C75E, #E8B84A)", color: "#E8B84A", current: 56, best: 89 },
    { id: "asr", name: "العصر", icon: "partly_cloudy_day", gradient: "linear-gradient(135deg, #E8A849, #D4943A)", color: "#D4943A", current: 41, best: 67 },
    { id: "maghrib", name: "المغرب", icon: "wb_twilight", gradient: "linear-gradient(135deg, #C47A5A, #B0664A)", color: "#B0664A", current: 56, best: 56 },
    { id: "isha", name: "العشاء", icon: "dark_mode", gradient: "linear-gradient(135deg, #5B6B8A, #4A5A7A)", color: "#4A5A7A", current: 34, best: 72 },
  ];

  const maxBest = Math.max(...prayerStreaks.map(p => p.best));
  const topStreak = prayerStreaks.reduce((a, b) => a.current > b.current ? a : b);

  return (
    <div style={{
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
      borderRadius: 24, padding: "16px 14px", border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginBottom: 16, padding: "0 4px",
      }}>
        <M icon="local_fire_department" size={18} fill={1} color="#D4A03C" weight={500} />
        <span style={{ fontSize: 14, fontWeight: 700, color: "#2B2D42" }}>سلسلة المواظبة</span>
      </div>

      {/* Flame bars */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        gap: 12, height: 200, padding: "0 8px",
        position: "relative",
      }}>
        {/* Horizontal guide lines */}
        {[0.25, 0.5, 0.75, 1].map((pct, i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0,
            bottom: `${pct * 100}%`,
            height: 1, background: "rgba(0,0,0,0.03)",
            pointerEvents: "none",
          }} />
        ))}

        {prayerStreaks.map((p, i) => {
          const currentH = maxBest > 0 ? (p.current / maxBest) * 100 : 0;
          const bestH = maxBest > 0 ? (p.best / maxBest) * 100 : 0;
          const isAtBest = p.current === p.best;
          const isTop = p.id === topStreak.id;

          return (
            <div key={p.id} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "flex-end",
              height: "100%", position: "relative",
            }}>
              {/* Best streak ghost bar */}
              <div style={{
                position: "absolute", bottom: 0,
                width: "70%", maxWidth: 40,
                height: `${bestH}%`,
                borderRadius: "12px 12px 6px 6px",
                background: "rgba(0,0,0,0.03)",
                border: "1px dashed rgba(0,0,0,0.06)",
                borderBottom: "none",
                transition: "height 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                transitionDelay: `${i * 80}ms`,
              }}>
                {/* Best label on top */}
                <div style={{
                  position: "absolute", top: -16, left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 9, fontWeight: 600, color: "#B8BCC8",
                  fontFamily: "'Rubik', sans-serif",
                  whiteSpace: "nowrap",
                }}>{p.best}</div>
              </div>

              {/* Current streak flame bar */}
              <div style={{
                position: "relative", zIndex: 1,
                width: "70%", maxWidth: 40,
                height: `${currentH}%`,
                minHeight: currentH > 0 ? 20 : 0,
                borderRadius: "14px 14px 6px 6px",
                background: `linear-gradient(180deg, ${p.color}ee, ${p.color})`,
                boxShadow: isTop
                  ? `0 -8px 24px ${p.color}50, 0 4px 12px ${p.color}30`
                  : `0 4px 12px ${p.color}25`,
                transition: "height 1s cubic-bezier(0.4, 0, 0.2, 1)",
                transitionDelay: `${i * 100}ms`,
                overflow: "visible",
              }}>
                {/* Flame tip glow */}
                {currentH > 15 && (
                  <div style={{
                    position: "absolute", top: -6, left: "50%",
                    transform: "translateX(-50%)",
                    width: "60%", height: 12,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse, ${p.color}40, transparent)`,
                    filter: "blur(4px)",
                  }} />
                )}

                {/* Current number inside bar */}
                <div style={{
                  position: "absolute", top: currentH > 30 ? 8 : -22,
                  left: "50%", transform: "translateX(-50%)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center",
                }}>
                  {isAtBest && (
                    <M icon="local_fire_department" size={14} fill={1}
                      color={currentH > 30 ? "#fff" : "#D4A03C"} weight={500}
                      style={{ marginBottom: 1 }} />
                  )}
                  <span style={{
                    fontSize: 15, fontWeight: 800,
                    color: currentH > 30 ? "#fff" : "#2B2D42",
                    fontFamily: "'Rubik', sans-serif",
                    lineHeight: 1,
                    textShadow: currentH > 30 ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                  }}>{p.current}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prayer icons row */}
      <div style={{
        display: "flex", justifyContent: "center",
        gap: 12, marginTop: 12,
      }}>
        {prayerStreaks.map((p, i) => (
          <div key={p.id} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: 4,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: p.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 2px 6px ${p.color}25`,
            }}>
              <M icon={p.icon} size={15} fill={1} color="#fff" weight={500} />
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#2B2D42",
              fontFamily: "'Noto Kufi Arabic', sans-serif",
            }}>{p.name}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 16,
        marginTop: 12, padding: "6px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{
            width: 14, height: 10, borderRadius: 4,
            background: "linear-gradient(180deg, #40916C, #52B788)",
          }} />
          <span style={{ fontSize: 10, color: "#8D99AE", fontWeight: 600 }}>الحالية</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{
            width: 14, height: 10, borderRadius: 4,
            background: "rgba(0,0,0,0.04)",
            border: "1px dashed rgba(0,0,0,0.1)",
          }} />
          <span style={{ fontSize: 10, color: "#8D99AE", fontWeight: 600 }}>الأفضل</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <M icon="local_fire_department" size={12} fill={1} color="#D4A03C" weight={500} />
          <span style={{ fontSize: 10, color: "#8D99AE", fontWeight: 600 }}>رقم قياسي</span>
        </div>
      </div>
    </div>
  );
}

// 8. QADA REPORT — Visual debt tracker
function QadaReport() {
  const qada = [
    { id: "fajr", name: "الفجر", count: 12, icon: "wb_twilight", color: "#D4A0A7" },
    { id: "dhuhr", name: "الظهر", count: 3, icon: "wb_sunny", color: "#E8B84A" },
    { id: "asr", name: "العصر", count: 7, icon: "partly_cloudy_day", color: "#D4943A" },
    { id: "maghrib", name: "المغرب", count: 2, icon: "wb_twilight", color: "#B0664A" },
    { id: "isha", name: "العشاء", count: 5, icon: "dark_mode", color: "#4A5A7A" },
  ];
  const total = qada.reduce((s, q) => s + q.count, 0);
  const max = Math.max(...qada.map(q => q.count));

  return (
    <div style={{
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
      borderRadius: 24, padding: "16px", border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: "#2B2D42",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <M icon="assignment_late" size={18} color="#C1574E" weight={500} />
          تقرير القضاء
        </div>
        <div style={{
          padding: "4px 10px", borderRadius: 8,
          background: "rgba(193,87,78,0.08)",
          fontSize: 13, fontWeight: 800, color: "#C1574E",
          fontFamily: "'Rubik', sans-serif",
        }}>{total}</div>
      </div>

      {/* Proportional blocks */}
      <div style={{
        display: "flex", gap: 3, marginBottom: 14, height: 32, borderRadius: 10, overflow: "hidden",
      }}>
        {qada.map((q, i) => (
          <div key={i} style={{
            flex: q.count, background: q.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            minWidth: q.count > 0 ? 24 : 0,
            transition: "flex 0.6s ease",
            transitionDelay: `${i * 60}ms`,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#fff",
              fontFamily: "'Rubik', sans-serif",
            }}>{q.count}</span>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      {qada.map((q, i) => (
        <div key={q.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 4px",
          borderBottom: i < qada.length - 1 ? "1px solid rgba(0,0,0,0.03)" : "none",
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: 3, background: q.color,
            boxShadow: `0 2px 4px ${q.color}40`,
          }} />
          <span style={{
            flex: 1, fontSize: 13, fontWeight: 600, color: "#2B2D42",
          }}>{q.name}</span>
          {/* Mini bar */}
          <div style={{
            width: 80, height: 4, borderRadius: 2,
            background: "rgba(0,0,0,0.04)", overflow: "hidden",
          }}>
            <div style={{
              width: `${(q.count / max) * 100}%`, height: "100%", borderRadius: 2,
              background: q.color,
              transition: "width 0.6s ease",
            }} />
          </div>
          <span style={{
            fontSize: 14, fontWeight: 800, color: "#C1574E",
            fontFamily: "'Rubik', sans-serif", width: 24, textAlign: "left",
          }}>{q.count}</span>
        </div>
      ))}
    </div>
  );
}

// ==================== MAIN DASHBOARD ====================

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const link1 = document.createElement("link");
    link1.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";
    link1.rel = "stylesheet";
    document.head.appendChild(link1);
    const link2 = document.createElement("link");
    link2.href = "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Rubik:wght@400;500;600;700;800&display=swap";
    link2.rel = "stylesheet";
    document.head.appendChild(link2);
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);
    setTimeout(() => setMounted(true), 200);
    return () => { document.head.removeChild(link1); document.head.removeChild(link2); document.head.removeChild(style); };
  }, []);

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: "#F5F3EF",
      fontFamily: "'Noto Kufi Arabic', 'Rubik', sans-serif",
      direction: "rtl", position: "relative",
      opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease",
    }}>
      <div style={{
        position: "absolute", top: -40, right: -30, width: 160, height: 160,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(45,106,79,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ padding: "20px 16px", paddingBottom: 40 }}>
        {/* Header */}
        <div style={{
          marginBottom: 18, padding: "0 4px",
          animation: "fadeUp 0.35s ease",
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#2B2D42" }}>لوحة التحكم</div>
          <div style={{
            fontSize: 13, color: "#8D99AE", fontWeight: 500, marginTop: 3,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <M icon="date_range" size={15} color="#8D99AE" weight={400} />
            الفرائض — ١٤٤٧ هـ
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* 1. Orbital Progress */}
          <div style={{ animation: "fadeUp 0.4s ease 0.05s both" }}>
            <OrbitalProgress total={1420} completed={1235} congCount={950} />
          </div>

          {/* 2. Streak Timeline */}
          <div style={{ animation: "fadeUp 0.4s ease 0.1s both" }}>
            <StreakTimeline />
          </div>

          {/* 3. Wave Chart */}
          <div style={{ animation: "fadeUp 0.4s ease 0.15s both" }}>
            <WaveChart />
          </div>

          {/* 4. Prayer Radar */}
          <div style={{ animation: "fadeUp 0.4s ease 0.2s both" }}>
            <PrayerRadar />
          </div>

          {/* 5. Prayer Lollipop */}
          <div style={{ animation: "fadeUp 0.4s ease 0.25s both" }}>
            <PrayerLollipop />
          </div>

          {/* 6. Weekly Rhythm */}
          <div style={{ animation: "fadeUp 0.4s ease 0.3s both" }}>
            <WeeklyRhythm />
          </div>

          {/* 7. Heatmap */}
          <div style={{ animation: "fadeUp 0.4s ease 0.35s both" }}>
            <CongregationHeatmap />
          </div>

          {/* 8. Qada Report */}
          <div style={{ animation: "fadeUp 0.4s ease 0.4s both" }}>
            <QadaReport />
          </div>
        </div>
      </div>
    </div>
  );
}
