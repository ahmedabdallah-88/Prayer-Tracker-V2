import { useState, useEffect } from "react";

const M = ({ icon, size = 20, weight = 400, fill = 0, color = "inherit", style = {} }) => (
  <span className="material-symbols-rounded" style={{
    fontSize: size,
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
    color, lineHeight: 1, verticalAlign: "middle", ...style,
  }}>{icon}</span>
);

const HIJRI_MONTHS = [
  { name: "محرم", greg: "يوليو ٢٠٢٥", days: 30, rate: 85, cong: 68, fasted: 0 },
  { name: "صفر", greg: "أغسطس ٢٠٢٥", days: 29, rate: 92, cong: 75, fasted: 0 },
  { name: "ربيع الأول", greg: "سبتمبر ٢٠٢٥", days: 30, rate: 78, cong: 60, fasted: 0 },
  { name: "ربيع الآخر", greg: "أكتوبر ٢٠٢٥", days: 30, rate: 95, cong: 82, fasted: 0 },
  { name: "جمادى الأولى", greg: "نوفمبر ٢٠٢٥", days: 30, rate: 88, cong: 71, fasted: 0 },
  { name: "جمادى الآخرة", greg: "ديسمبر ٢٠٢٥", days: 29, rate: 72, cong: 55, fasted: 0 },
  { name: "رجب", greg: "يناير ٢٠٢٦", days: 30, rate: 90, cong: 78, fasted: 4 },
  { name: "شعبان", greg: "فبراير ٢٠٢٦", days: 29, rate: 96, cong: 85, fasted: 6 },
  { name: "رمضان", greg: "فبراير-مارس ٢٠٢٦", days: 30, rate: 100, cong: 95, fasted: 29 },
  { name: "شوال", greg: "مارس-أبريل ٢٠٢٦", days: 29, rate: 82, cong: 70, fasted: 6, current: true },
  { name: "ذو القعدة", greg: "أبريل ٢٠٢٦", days: 30, rate: 0, cong: 0, fasted: 0, future: true },
  { name: "ذو الحجة", greg: "مايو ٢٠٢٦", days: 29, rate: 0, cong: 0, fasted: 0, future: true },
];

const PRAYERS = [
  { id: "fajr", name: "الفجر", icon: "wb_twilight", gradient: "linear-gradient(135deg, #E8B4B8, #D4A0A7)" },
  { id: "dhuhr", name: "الظهر", icon: "wb_sunny", gradient: "linear-gradient(135deg, #F0C75E, #E8B84A)" },
  { id: "asr", name: "العصر", icon: "partly_cloudy_day", gradient: "linear-gradient(135deg, #E8A849, #D4943A)" },
  { id: "maghrib", name: "المغرب", icon: "wb_twilight", gradient: "linear-gradient(135deg, #C47A5A, #B0664A)" },
  { id: "isha", name: "العشاء", icon: "dark_mode", gradient: "linear-gradient(135deg, #5B6B8A, #4A5A7A)" },
];

const STATES = ["empty", "prayed", "congregation", "qada"];

function genDayData(days, rate, congRate) {
  const data = {};
  PRAYERS.forEach(p => {
    data[p.id] = {};
    for (let d = 1; d <= days; d++) {
      if (Math.random() * 100 < rate) {
        data[p.id][d] = Math.random() * 100 < congRate ? "congregation" : "prayed";
      } else if (Math.random() > 0.85) {
        data[p.id][d] = "qada";
      } else {
        data[p.id][d] = "empty";
      }
    }
  });
  return data;
}

function MonthCard({ month, index, onClick }) {
  const rateColor = month.rate >= 90 ? "#40916C" : month.rate >= 70 ? "#D4A03C" : month.rate > 0 ? "#C1574E" : "#B8BCC8";

  return (
    <div onClick={month.future ? undefined : onClick} style={{
      padding: "16px",
      borderRadius: 18,
      background: month.current
        ? "rgba(45,106,79,0.06)"
        : "rgba(255,255,255,0.55)",
      backdropFilter: "blur(12px)",
      border: month.current
        ? "1.5px solid rgba(45,106,79,0.2)"
        : "1px solid rgba(0,0,0,0.04)",
      cursor: month.future ? "default" : "pointer",
      opacity: month.future ? 0.35 : 1,
      transition: "all 0.2s ease",
      animation: `fadeUp 0.35s ease ${index * 0.04}s both`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Current month indicator */}
      {month.current && (
        <div style={{
          position: "absolute", top: 10, left: 10,
          width: 8, height: 8, borderRadius: 4,
          background: "#40916C",
          boxShadow: "0 0 0 3px rgba(64,145,108,0.2)",
        }} />
      )}

      {/* Month name + greg */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: "#2B2D42",
          fontFamily: "'Noto Kufi Arabic', sans-serif",
          marginBottom: 3,
        }}>{month.name}</div>
        <div style={{
          fontSize: 10, color: "#8D99AE", fontWeight: 500,
        }}>{month.greg}</div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 5, borderRadius: 3,
        background: "rgba(0,0,0,0.04)",
        marginBottom: 12, overflow: "hidden",
      }}>
        <div style={{
          width: `${month.rate}%`, height: "100%", borderRadius: 3,
          background: month.rate >= 90
            ? "linear-gradient(90deg, #40916C, #52B788)"
            : month.rate >= 70
            ? "linear-gradient(90deg, #D4A03C, #E8B84A)"
            : month.rate > 0
            ? "linear-gradient(90deg, #C1574E, #D4645B)"
            : "transparent",
          transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          transitionDelay: `${index * 60}ms`,
        }} />
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          fontSize: 24, fontWeight: 800,
          color: rateColor,
          fontFamily: "'Rubik', sans-serif",
          lineHeight: 1,
        }}>{month.rate > 0 ? `${month.rate}%` : "—"}</span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {month.cong > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 3,
              padding: "3px 7px", borderRadius: 6,
              background: "rgba(212,160,60,0.08)",
            }}>
              <M icon="mosque" size={11} fill={1} color="#D4A03C" weight={500} />
              <span style={{
                fontSize: 11, color: "#D4A03C", fontWeight: 700,
                fontFamily: "'Rubik', sans-serif",
              }}>{month.cong}%</span>
            </div>
          )}
          {month.fasted > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 3,
              padding: "3px 7px", borderRadius: 6,
              background: "rgba(91,107,138,0.08)",
            }}>
              <M icon="nights_stay" size={11} fill={1} color="#5B6B8A" weight={500} />
              <span style={{
                fontSize: 11, color: "#5B6B8A", fontWeight: 700,
                fontFamily: "'Rubik', sans-serif",
              }}>{month.fasted}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MonthDetail({ month, onBack }) {
  const [dayData] = useState(() => genDayData(month.days, month.rate, month.cong));

  const DayCell = ({ day, prayer, state }) => {
    const colors = {
      empty: { bg: "transparent", border: "rgba(0,0,0,0.06)", color: "#8D99AE" },
      prayed: { bg: "#40916C", border: "#40916C", color: "#fff" },
      congregation: { bg: "#40916C", border: "#D4A03C", color: "#fff" },
      qada: { bg: "#C1574E", border: "#C1574E", color: "#fff" },
    };
    const c = colors[state];

    return (
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: state === "empty" ? c.bg
          : state === "congregation" ? "linear-gradient(135deg, #40916C, #52B788)"
          : state === "qada" ? "linear-gradient(135deg, #C1574E, #D4645B)"
          : "linear-gradient(135deg, #40916C, #52B788)",
        border: state === "congregation" ? `2px solid ${c.border}` : state === "empty" ? `1px solid ${c.border}` : "1.5px solid transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 600, color: c.color,
        fontFamily: "'Rubik', sans-serif",
        boxShadow: state === "congregation" ? "0 1px 6px rgba(212,160,60,0.3)" : "none",
        position: "relative",
      }}>
        {day}
        {state !== "empty" && (
          <div style={{
            position: "absolute", top: -3, right: -3,
            width: 10, height: 10, borderRadius: state === "congregation" ? 3 : "50%",
            background: state === "congregation" ? "#D4A03C" : state === "qada" ? "#fff" : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}>
            <M icon={state === "congregation" ? "mosque" : state === "qada" ? "schedule" : "check"}
              size={6} fill={1}
              color={state === "congregation" ? "#fff" : state === "qada" ? "#C1574E" : "#40916C"}
              weight={700} />
          </div>
        )}
      </div>
    );
  };

  const rateColor = month.rate >= 90 ? "#40916C" : month.rate >= 70 ? "#D4A03C" : "#C1574E";

  return (
    <div style={{ animation: "slideIn 0.3s ease" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 0 16px",
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 12, border: "none",
          background: "rgba(255,255,255,0.6)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <M icon="arrow_forward" size={20} color="#2B2D42" weight={500} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 18, fontWeight: 700, color: "#2B2D42",
          }}>{month.name} ١٤٤٧</div>
          <div style={{ fontSize: 12, color: "#8D99AE", fontWeight: 500, marginTop: 1 }}>
            {month.greg} — {month.days} يوم
          </div>
        </div>
        {month.current && (
          <div style={{
            padding: "4px 10px", borderRadius: 8,
            background: "rgba(45,106,79,0.08)",
            fontSize: 11, fontWeight: 700, color: "#2D6A4F",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <M icon="radio_button_checked" size={12} color="#40916C" weight={600} fill={1} />
            الشهر الحالي
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 16,
      }}>
        {[
          { icon: "verified", label: "الإنجاز", value: `${month.rate}%`, color: rateColor },
          { icon: "mosque", label: "الجماعة", value: `${month.cong}%`, color: "#D4A03C" },
          { icon: "schedule", label: "القضاء", value: `${Math.max(0, Math.floor((100 - month.rate) * month.days * 5 / 100))}`, color: "#C1574E" },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: "12px 10px",
            background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
            borderRadius: 14, border: "1px solid rgba(0,0,0,0.04)",
            textAlign: "center",
            animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
          }}>
            <M icon={s.icon} size={18} fill={1} color={s.color} weight={500} />
            <div style={{
              fontSize: 18, fontWeight: 800, color: s.color,
              fontFamily: "'Rubik', sans-serif", marginTop: 6,
            }}>{s.value}</div>
            <div style={{
              fontSize: 10, color: "#8D99AE", fontWeight: 600, marginTop: 2,
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Day-by-day grid */}
      <div style={{
        background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)",
        borderRadius: 20, padding: "16px 14px",
        border: "1px solid rgba(0,0,0,0.04)",
      }}>
        {/* Column headers — day numbers */}
        <div style={{
          display: "flex", alignItems: "center", marginBottom: 8,
          paddingRight: 72,
        }}>
          <div style={{
            display: "flex", gap: 3, flexWrap: "wrap",
          }}>
            {Array.from({ length: Math.min(month.days, 15) }, (_, i) => (
              <div key={i} style={{
                width: 28, textAlign: "center",
                fontSize: 9, fontWeight: 600, color: "#B8BCC8",
                fontFamily: "'Rubik', sans-serif",
              }}>{i + 1}</div>
            ))}
          </div>
        </div>

        {/* Prayer rows — first 15 days */}
        {PRAYERS.map((prayer, pi) => (
          <div key={prayer.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: pi < PRAYERS.length - 1 ? 6 : 0,
            animation: `fadeUp 0.3s ease ${pi * 0.05}s both`,
          }}>
            {/* Prayer label */}
            <div style={{
              width: 64, display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 7,
                background: prayer.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <M icon={prayer.icon} size={13} fill={1} color="#fff" weight={500} />
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: "#2B2D42",
              }}>{prayer.name}</span>
            </div>

            {/* Day cells — first 15 */}
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {Array.from({ length: Math.min(month.days, 15) }, (_, i) => (
                <DayCell key={i} day={i + 1} prayer={prayer.id}
                  state={dayData[prayer.id]?.[i + 1] || "empty"} />
              ))}
            </div>
          </div>
        ))}

        {/* Separator */}
        {month.days > 15 && (
          <>
            <div style={{
              height: 1, background: "rgba(0,0,0,0.04)",
              margin: "12px 0",
            }} />

            {/* Column headers — remaining days */}
            <div style={{
              display: "flex", alignItems: "center", marginBottom: 8,
              paddingRight: 72,
            }}>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {Array.from({ length: month.days - 15 }, (_, i) => (
                  <div key={i} style={{
                    width: 28, textAlign: "center",
                    fontSize: 9, fontWeight: 600, color: "#B8BCC8",
                    fontFamily: "'Rubik', sans-serif",
                  }}>{i + 16}</div>
                ))}
              </div>
            </div>

            {/* Prayer rows — remaining days */}
            {PRAYERS.map((prayer, pi) => (
              <div key={prayer.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: pi < PRAYERS.length - 1 ? 6 : 0,
              }}>
                <div style={{
                  width: 64, display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 7,
                    background: prayer.gradient,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <M icon={prayer.icon} size={13} fill={1} color="#fff" weight={500} />
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "#2B2D42",
                  }}>{prayer.name}</span>
                </div>

                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {Array.from({ length: month.days - 15 }, (_, i) => (
                    <DayCell key={i} day={i + 16} prayer={prayer.id}
                      state={dayData[prayer.id]?.[i + 16] || "empty"} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 16,
        marginTop: 14, padding: "8px 0",
      }}>
        {[
          { icon: "check", bg: "#40916C", border: "#40916C", label: "منفرد" },
          { icon: "mosque", bg: "#40916C", border: "#D4A03C", label: "جماعة" },
          { icon: "schedule", bg: "#C1574E", border: "#C1574E", label: "قضاء" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 16, height: 16, borderRadius: 5,
              background: `linear-gradient(135deg, ${item.bg}, ${item.bg}dd)`,
              border: `1.5px solid ${item.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <M icon={item.icon} size={8} fill={1} color="#fff" weight={700} />
            </div>
            <span style={{ fontSize: 10, color: "#8D99AE", fontWeight: 600 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Per-prayer stats */}
      <div style={{
        background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)",
        borderRadius: 20, padding: "16px", marginTop: 14,
        border: "1px solid rgba(0,0,0,0.04)",
      }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: "#2B2D42", marginBottom: 12,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <M icon="analytics" size={18} color="#2D6A4F" weight={500} />
          أداء كل صلاة
        </div>
        {PRAYERS.map(p => {
          const pData = dayData[p.id] || {};
          const total = Object.values(pData).filter(s => s !== "empty").length;
          const congCount = Object.values(pData).filter(s => s === "congregation").length;
          const qadaCount = Object.values(pData).filter(s => s === "qada").length;
          const pRate = Math.round((total / month.days) * 100);
          return (
            <div key={p.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 10, padding: "0 2px",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: p.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <M icon={p.icon} size={14} fill={1} color="#fff" weight={500} />
              </div>
              <span style={{
                width: 42, fontSize: 12, fontWeight: 700, color: "#2B2D42",
              }}>{p.name}</span>
              <div style={{
                flex: 1, height: 6, borderRadius: 3,
                background: "rgba(0,0,0,0.04)", overflow: "hidden",
              }}>
                <div style={{
                  width: `${pRate}%`, height: "100%", borderRadius: 3,
                  background: pRate >= 85 ? "linear-gradient(90deg, #40916C, #52B788)"
                    : pRate >= 65 ? "linear-gradient(90deg, #D4A03C, #E8B84A)"
                    : "linear-gradient(90deg, #C1574E, #D4645B)",
                }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: "#2B2D42", width: 32, textAlign: "left",
                  fontFamily: "'Rubik', sans-serif",
                }}>{pRate}%</span>
                {congCount > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 2,
                    padding: "2px 5px", borderRadius: 5,
                    background: "rgba(212,160,60,0.08)",
                  }}>
                    <M icon="mosque" size={9} fill={1} color="#D4A03C" weight={500} />
                    <span style={{ fontSize: 9, color: "#D4A03C", fontWeight: 700 }}>{congCount}</span>
                  </div>
                )}
                {qadaCount > 0 && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 2,
                    padding: "2px 5px", borderRadius: 5,
                    background: "rgba(193,87,78,0.08)",
                  }}>
                    <M icon="schedule" size={9} fill={1} color="#C1574E" weight={500} />
                    <span style={{ fontSize: 9, color: "#C1574E", fontWeight: 700 }}>{qadaCount}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function YearOverview() {
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [year, setYear] = useState(1447);

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
      @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    `;
    document.head.appendChild(style);
    setTimeout(() => setMounted(true), 200);
    return () => { document.head.removeChild(link1); document.head.removeChild(link2); document.head.removeChild(style); };
  }, []);

  // Year summary
  const completedMonths = HIJRI_MONTHS.filter(m => m.rate > 0);
  const avgRate = completedMonths.length > 0
    ? Math.round(completedMonths.reduce((s, m) => s + m.rate, 0) / completedMonths.length) : 0;
  const avgCong = completedMonths.length > 0
    ? Math.round(completedMonths.reduce((s, m) => s + m.cong, 0) / completedMonths.length) : 0;
  const bestMonth = completedMonths.reduce((best, m) => m.rate > (best?.rate || 0) ? m : best, null);

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: "#F5F3EF",
      fontFamily: "'Noto Kufi Arabic', 'Rubik', sans-serif",
      direction: "rtl", position: "relative", overflow: "hidden",
      opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease",
    }}>
      {/* Background */}
      <div style={{
        position: "absolute", top: -50, right: -30, width: 180, height: 180,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(45,106,79,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ padding: "20px 16px", paddingBottom: 40 }}>

        {selectedMonth === null ? (
          <>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20, padding: "0 4px",
              animation: "fadeUp 0.35s ease",
            }}>
              <div>
                <div style={{
                  fontSize: 22, fontWeight: 800, color: "#2B2D42",
                }}>نظرة سنوية</div>
                <div style={{
                  fontSize: 13, color: "#8D99AE", fontWeight: 500, marginTop: 3,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <M icon="date_range" size={15} color="#8D99AE" weight={400} />
                  ١٤٤٧ هـ
                </div>
              </div>

              {/* Year navigation */}
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <button onClick={() => setYear(y => y + 1)} style={{
                  width: 30, height: 30, borderRadius: 10, border: "none",
                  background: "rgba(255,255,255,0.5)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <M icon="chevron_right" size={18} color="#8D99AE" weight={500} />
                </button>
                <div style={{
                  padding: "5px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.04)",
                  fontSize: 14, fontWeight: 700, color: "#2B2D42",
                  fontFamily: "'Rubik', sans-serif",
                }}>{year}</div>
                <button onClick={() => setYear(y => y - 1)} style={{
                  width: 30, height: 30, borderRadius: 10, border: "none",
                  background: "rgba(255,255,255,0.5)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <M icon="chevron_left" size={18} color="#8D99AE" weight={500} />
                </button>
              </div>
            </div>

            {/* Year Summary */}
            <div style={{
              display: "flex", gap: 8, marginBottom: 16,
              animation: "fadeUp 0.35s ease 0.05s both",
            }}>
              <div style={{
                flex: 1, padding: "14px 12px",
                background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
                borderRadius: 16, border: "1px solid rgba(0,0,0,0.04)",
                textAlign: "center",
              }}>
                <M icon="verified" size={18} fill={1} color="#40916C" weight={500} />
                <div style={{
                  fontSize: 20, fontWeight: 800, color: "#40916C",
                  fontFamily: "'Rubik', sans-serif", marginTop: 4,
                }}>{avgRate}%</div>
                <div style={{ fontSize: 10, color: "#8D99AE", fontWeight: 600, marginTop: 2 }}>متوسط الإنجاز</div>
              </div>
              <div style={{
                flex: 1, padding: "14px 12px",
                background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
                borderRadius: 16, border: "1px solid rgba(0,0,0,0.04)",
                textAlign: "center",
              }}>
                <M icon="mosque" size={18} fill={1} color="#D4A03C" weight={500} />
                <div style={{
                  fontSize: 20, fontWeight: 800, color: "#D4A03C",
                  fontFamily: "'Rubik', sans-serif", marginTop: 4,
                }}>{avgCong}%</div>
                <div style={{ fontSize: 10, color: "#8D99AE", fontWeight: 600, marginTop: 2 }}>متوسط الجماعة</div>
              </div>
              <div style={{
                flex: 1, padding: "14px 12px",
                background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
                borderRadius: 16, border: "1px solid rgba(0,0,0,0.04)",
                textAlign: "center",
              }}>
                <M icon="emoji_events" size={18} fill={1} color="#E8B84A" weight={500} />
                <div style={{
                  fontSize: 13, fontWeight: 800, color: "#2B2D42",
                  marginTop: 6,
                }}>{bestMonth?.name || "—"}</div>
                <div style={{ fontSize: 10, color: "#8D99AE", fontWeight: 600, marginTop: 2 }}>أفضل شهر</div>
              </div>
            </div>

            {/* Month Grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
            }}>
              {HIJRI_MONTHS.map((month, i) => (
                <MonthCard key={i} month={month} index={i}
                  onClick={() => setSelectedMonth(i)} />
              ))}
            </div>
          </>
        ) : (
          <MonthDetail
            month={HIJRI_MONTHS[selectedMonth]}
            onBack={() => setSelectedMonth(null)}
          />
        )}
      </div>
    </div>
  );
}
