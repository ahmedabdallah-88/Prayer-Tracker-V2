import { useState, useEffect } from "react";

const M = ({ icon, size = 20, weight = 400, fill = 0, color = "inherit", style = {} }) => (
  <span className="material-symbols-rounded" style={{
    fontSize: size,
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
    color, lineHeight: 1, verticalAlign: "middle", ...style,
  }}>{icon}</span>
);

const DAYS = [
  { name: "الجمعة", short: "جمعة", pct: 95 },
  { name: "السبت", short: "سبت", pct: 82 },
  { name: "الأحد", short: "أحد", pct: 65 },
  { name: "الاثنين", short: "إثنين", pct: 70 },
  { name: "الثلاثاء", short: "ثلاثاء", pct: 68 },
  { name: "الأربعاء", short: "أربعاء", pct: 72 },
  { name: "الخميس", short: "خميس", pct: 85 },
];

const getColor = (pct) => {
  if (pct >= 90) return "#2D6A4F";
  if (pct >= 75) return "#40916C";
  if (pct >= 60) return "#D4A03C";
  return "#C1574E";
};

const avg = Math.round(DAYS.reduce((s, d) => s + d.pct, 0) / DAYS.length);

// ============ OPTION A: Horizontal bars sorted ============
function OptionA() {
  const sorted = [...DAYS].sort((a, b) => b.pct - a.pct);

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#8D99AE", marginBottom: 12, textAlign: "center" }}>
        Option A — أشرطة أفقية مرتبة
      </div>
      <div style={{
        background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
        borderRadius: 24, padding: "16px 14px", border: "1px solid rgba(0,0,0,0.04)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <M icon="date_range" size={18} color="#2D6A4F" weight={500} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2B2D42" }}>نمط الجماعة الأسبوعي</span>
          </div>
          <div style={{
            padding: "3px 10px", borderRadius: 8,
            background: "rgba(45,106,79,0.08)",
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#2D6A4F", fontFamily: "'Rubik', sans-serif" }}>{avg}%</span>
          </div>
        </div>

        {sorted.map((d, i) => {
          const color = getColor(d.pct);
          const isTop = i === 0;
          return (
            <div key={d.name} style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: i < 6 ? 8 : 0,
              padding: isTop ? "6px 8px" : "2px 8px",
              borderRadius: isTop ? 10 : 0,
              background: isTop ? "rgba(45,106,79,0.03)" : "transparent",
            }}>
              <span style={{
                width: 42, fontSize: 11, fontWeight: isTop ? 800 : 600,
                color: isTop ? "#2D6A4F" : "#2B2D42",
                textAlign: "right", flexShrink: 0,
              }}>{d.short}</span>

              <div style={{
                flex: 1, height: 12, borderRadius: 6,
                background: "rgba(0,0,0,0.03)", overflow: "hidden",
              }}>
                <div style={{
                  width: `${d.pct}%`, height: "100%", borderRadius: 6,
                  background: `linear-gradient(270deg, ${color}, ${color}bb)`,
                  transition: "width 0.6s ease",
                  transitionDelay: `${i * 50}ms`,
                }} />
              </div>

              <span style={{
                width: 32, fontSize: 12, fontWeight: 800, color,
                fontFamily: "'Rubik', sans-serif", textAlign: "left", flexShrink: 0,
              }}>{d.pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ OPTION B: 7 vertical mini columns ============
function OptionB() {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#8D99AE", marginBottom: 12, textAlign: "center" }}>
        Option B — أعمدة عمودية (يوم = عمود)
      </div>
      <div style={{
        background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
        borderRadius: 24, padding: "16px 10px", border: "1px solid rgba(0,0,0,0.04)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 8px", marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <M icon="date_range" size={18} color="#2D6A4F" weight={500} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2B2D42" }}>نمط الجماعة الأسبوعي</span>
          </div>
          <div style={{
            padding: "3px 10px", borderRadius: 8,
            background: "rgba(45,106,79,0.08)",
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#2D6A4F", fontFamily: "'Rubik', sans-serif" }}>{avg}%</span>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          gap: 8, height: 130, padding: "0 8px",
        }}>
          {DAYS.map((d, i) => {
            const color = getColor(d.pct);
            const h = (d.pct / 100) * 100;
            return (
              <div key={d.name} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "flex-end", height: "100%",
              }}>
                {/* Percentage */}
                <span style={{
                  fontSize: 9, fontWeight: 700, color,
                  fontFamily: "'Rubik', sans-serif", marginBottom: 4,
                }}>{d.pct}%</span>
                {/* Bar */}
                <div style={{
                  width: "100%", maxWidth: 30,
                  height: `${h}%`, borderRadius: "8px 8px 4px 4px",
                  background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                  transition: "height 0.6s ease",
                  transitionDelay: `${i * 60}ms`,
                  boxShadow: d.pct >= 90 ? `0 3px 10px ${color}30` : "none",
                }} />
              </div>
            );
          })}
        </div>

        {/* Day labels */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 8, marginTop: 8, padding: "0 8px",
        }}>
          {DAYS.map((d, i) => (
            <div key={d.name} style={{
              flex: 1, textAlign: "center",
              fontSize: 9, fontWeight: d.pct >= 90 ? 800 : 600,
              color: d.pct >= 90 ? "#2D6A4F" : "#8D99AE",
            }}>{d.short}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ OPTION C: Week calendar grid (7 colored blocks) ============
function OptionC() {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#8D99AE", marginBottom: 12, textAlign: "center" }}>
        Option C — تقويم أسبوعي ملون
      </div>
      <div style={{
        background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
        borderRadius: 24, padding: "16px 12px", border: "1px solid rgba(0,0,0,0.04)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <M icon="date_range" size={18} color="#2D6A4F" weight={500} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2B2D42" }}>نمط الجماعة الأسبوعي</span>
          </div>
          <div style={{
            padding: "3px 10px", borderRadius: 8,
            background: "rgba(45,106,79,0.08)",
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#2D6A4F", fontFamily: "'Rubik', sans-serif" }}>متوسط {avg}%</span>
          </div>
        </div>

        {/* Row 1: 4 days */}
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          {DAYS.slice(0, 4).map((d, i) => {
            const color = getColor(d.pct);
            return (
              <div key={d.name} style={{
                flex: 1, padding: "12px 6px", borderRadius: 14,
                background: color, textAlign: "center",
                boxShadow: `0 3px 10px ${color}25`,
                transition: "all 0.3s ease",
                transitionDelay: `${i * 50}ms`,
              }}>
                <div style={{
                  fontSize: 18, fontWeight: 800, color: "#fff",
                  fontFamily: "'Rubik', sans-serif", lineHeight: 1,
                }}>{d.pct}%</div>
                <div style={{
                  fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)",
                  marginTop: 6,
                }}>{d.short}</div>
              </div>
            );
          })}
        </div>
        {/* Row 2: 3 days */}
        <div style={{ display: "flex", gap: 6 }}>
          {DAYS.slice(4, 7).map((d, i) => {
            const color = getColor(d.pct);
            return (
              <div key={d.name} style={{
                flex: 1, padding: "12px 6px", borderRadius: 14,
                background: color, textAlign: "center",
                boxShadow: `0 3px 10px ${color}25`,
                transition: "all 0.3s ease",
                transitionDelay: `${(i + 4) * 50}ms`,
              }}>
                <div style={{
                  fontSize: 18, fontWeight: 800, color: "#fff",
                  fontFamily: "'Rubik', sans-serif", lineHeight: 1,
                }}>{d.pct}%</div>
                <div style={{
                  fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)",
                  marginTop: 6,
                }}>{d.short}</div>
              </div>
            );
          })}
        </div>

        {/* Scale */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 10, marginTop: 12,
        }}>
          {[
            { label: "ممتاز", color: "#2D6A4F" },
            { label: "جيد", color: "#40916C" },
            { label: "متوسط", color: "#D4A03C" },
            { label: "ضعيف", color: "#C1574E" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: 4, background: s.color }} />
              <span style={{ fontSize: 9, color: "#8D99AE", fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ OPTION D: Pill indicators per day ============
function OptionD() {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#8D99AE", marginBottom: 12, textAlign: "center" }}>
        Option D — كبسولات يومية مع مؤشر ملء
      </div>
      <div style={{
        background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
        borderRadius: 24, padding: "16px 14px", border: "1px solid rgba(0,0,0,0.04)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <M icon="date_range" size={18} color="#2D6A4F" weight={500} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2B2D42" }}>نمط الجماعة الأسبوعي</span>
          </div>
          <div style={{
            padding: "3px 10px", borderRadius: 8,
            background: "rgba(45,106,79,0.08)",
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#2D6A4F", fontFamily: "'Rubik', sans-serif" }}>{avg}%</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DAYS.map((d, i) => {
            const color = getColor(d.pct);
            const isTop = d.pct >= 90;
            return (
              <div key={d.name} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 12,
                background: `${color}08`,
                border: `1px solid ${color}12`,
              }}>
                {/* Day name */}
                <span style={{
                  width: 46, fontSize: 12, fontWeight: 700,
                  color: "#2B2D42", flexShrink: 0,
                }}>{d.short}</span>

                {/* Fill pill */}
                <div style={{
                  flex: 1, height: 24, borderRadius: 12,
                  background: "rgba(0,0,0,0.03)",
                  overflow: "hidden", position: "relative",
                }}>
                  <div style={{
                    position: "absolute", top: 0, right: 0, bottom: 0,
                    width: `${d.pct}%`, borderRadius: 12,
                    background: `linear-gradient(270deg, ${color}, ${color}cc)`,
                    transition: "width 0.6s ease",
                    transitionDelay: `${i * 50}ms`,
                    display: "flex", alignItems: "center",
                    justifyContent: d.pct > 30 ? "center" : "flex-start",
                    paddingRight: d.pct <= 30 ? 6 : 0,
                  }}>
                    {d.pct > 20 && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, color: "#fff",
                        fontFamily: "'Rubik', sans-serif",
                      }}>{d.pct}%</span>
                    )}
                  </div>
                </div>

                {/* Percentage outside if bar too small */}
                {d.pct <= 20 && (
                  <span style={{
                    fontSize: 12, fontWeight: 800, color,
                    fontFamily: "'Rubik', sans-serif", width: 32, flexShrink: 0,
                  }}>{d.pct}%</span>
                )}

                {/* Crown for top */}
                {isTop && (
                  <M icon="mosque" size={14} fill={1} color="#D4A03C" weight={500} style={{ flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function WeeklyOptions() {
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
    setTimeout(() => setMounted(true), 300);
    return () => { document.head.removeChild(link1); document.head.removeChild(link2); };
  }, []);

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: "#F5F3EF",
      fontFamily: "'Noto Kufi Arabic', 'Rubik', sans-serif",
      direction: "rtl", padding: "20px 16px 40px",
      opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease",
    }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#2B2D42", marginBottom: 4 }}>
          نمط صلاة الجماعة الأسبوعي
        </div>
        <div style={{ fontSize: 13, color: "#8D99AE", fontWeight: 500 }}>
          ٤ بدائل للشكل الدائري
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <OptionA />
        <OptionB />
        <OptionC />
        <OptionD />
      </div>
    </div>
  );
}
