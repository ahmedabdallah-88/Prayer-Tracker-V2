import { useState, useEffect } from "react";

// Material Symbol component
const M = ({ icon, size = 20, weight = 400, fill = 0, color = "inherit", grade = 0, style = {} }) => (
  <span className="material-symbols-rounded" style={{
    fontSize: size,
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${size}`,
    color,
    lineHeight: 1,
    verticalAlign: "middle",
    ...style,
  }}>{icon}</span>
);

const PRAYERS = [
  { id: "fajr", name: "الفجر", nameEn: "Fajr", time: "٤:٥٢", period: "ص", matIcon: "wb_twilight", gradient: "linear-gradient(135deg, #E8B4B8, #D4A0A7)" },
  { id: "dhuhr", name: "الظهر", nameEn: "Dhuhr", time: "١٢:١٥", period: "م", matIcon: "wb_sunny", gradient: "linear-gradient(135deg, #F0C75E, #E8B84A)" },
  { id: "asr", name: "العصر", nameEn: "Asr", time: "٣:٣٨", period: "م", matIcon: "partly_cloudy_day", gradient: "linear-gradient(135deg, #E8A849, #D4943A)" },
  { id: "maghrib", name: "المغرب", nameEn: "Maghrib", time: "٦:٢٢", period: "م", matIcon: "wb_twilight", gradient: "linear-gradient(135deg, #C47A5A, #B0664A)" },
  { id: "isha", name: "العشاء", nameEn: "Isha", time: "٧:٤٢", period: "م", matIcon: "dark_mode", gradient: "linear-gradient(135deg, #5B6B8A, #4A5A7A)" },
];

const STATES = ["empty", "prayed", "congregation", "qada"];

const DAYS_DATA = () => {
  const d = {};
  for (let i = 1; i <= 30; i++) {
    if (i > 22) { d[i] = "empty"; continue; }
    d[i] = STATES[Math.random() > 0.25 ? (Math.random() > 0.45 ? 2 : 1) : Math.random() > 0.7 ? 3 : 0];
  }
  return d;
};

function DayCircle({ day, state, gregDay, isToday, isFuture, onClick }) {
  const base = {
    width: 36, height: 36, borderRadius: 10, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", cursor: isFuture ? "default" : "pointer",
    opacity: isFuture ? 0.2 : 1, position: "relative", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const styles = {
    empty: {
      ...base,
      background: isToday ? "rgba(45, 106, 79, 0.06)" : "transparent",
      border: isToday ? "2px solid #2D6A4F" : "1.5px solid rgba(0,0,0,0.08)",
    },
    prayed: {
      ...base,
      background: "linear-gradient(135deg, #40916C, #52B788)",
      border: "2px solid transparent",
      boxShadow: "0 2px 8px rgba(64,145,108,0.35)",
    },
    congregation: {
      ...base,
      background: "linear-gradient(135deg, #40916C, #52B788)",
      border: "2.5px solid #D4A03C",
      boxShadow: "0 2px 10px rgba(212,160,60,0.4), 0 2px 8px rgba(64,145,108,0.2)",
    },
    qada: {
      ...base,
      background: "linear-gradient(135deg, #C1574E, #D4645B)",
      border: "2px solid transparent",
      boxShadow: "0 2px 8px rgba(193,87,78,0.35)",
    },
  };

  const textColor = state === "empty"
    ? (isToday ? "#2D6A4F" : "#2B2D42")
    : "#fff";
  const subColor = state === "empty"
    ? (isToday ? "#2D6A4F" : "#8D99AE")
    : "rgba(255,255,255,0.7)";

  return (
    <div onClick={isFuture ? undefined : onClick} style={styles[state]}>
      {/* Always show date */}
      <span style={{
        fontSize: 12, fontWeight: 700, lineHeight: 1,
        color: textColor,
        fontFamily: "'Noto Kufi Arabic', 'Rubik', sans-serif",
      }}>{day}</span>
      <span style={{
        fontSize: 7.5, lineHeight: 1, marginTop: 1,
        color: subColor,
        fontVariantNumeric: "tabular-nums",
      }}>{gregDay}</span>

      {/* State indicator badge */}
      {state !== "empty" && (
        <div style={{
          position: "absolute",
          top: -4, right: -4,
          width: 14, height: 14,
          borderRadius: state === "congregation" ? 4 : "50%",
          background: state === "congregation"
            ? "linear-gradient(135deg, #D4A03C, #E8B84A)"
            : state === "qada"
            ? "#fff"
            : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          border: state === "congregation" ? "none" : "none",
        }}>
          <M
            icon={state === "congregation" ? "mosque" : state === "qada" ? "schedule" : "check"}
            size={9}
            fill={1}
            color={state === "congregation" ? "#fff" : state === "qada" ? "#C1574E" : "#40916C"}
            weight={700}
          />
        </div>
      )}
    </div>
  );
}

function PrayerRow({ prayer, data, onToggle, index }) {
  const total = Object.values(data).filter(s => s !== "empty").length;
  const cong = Object.values(data).filter(s => s === "congregation").length;
  const rate = Math.round((total / 22) * 100);

  return (
    <div style={{
      marginBottom: 6,
      animation: `fadeSlideIn 0.4s ease ${index * 0.06}s both`,
    }}>
      {/* Prayer Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px",
        background: "rgba(255,255,255,0.5)",
        borderRadius: 14,
        marginBottom: 8,
        border: "1px solid rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: prayer.gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>
            <M icon={prayer.matIcon} size={18} fill={1} color="#fff" weight={500} />
          </div>
          <div>
            <div style={{
              fontSize: 15, fontWeight: 700, color: "#2B2D42",
              fontFamily: "'Noto Kufi Arabic', sans-serif",
            }}>{prayer.name}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {cong > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 3,
              padding: "3px 8px", borderRadius: 8,
              background: "rgba(212,160,60,0.1)",
            }}>
              <M icon="mosque" size={13} fill={1} color="#D4A03C" weight={500} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#D4A03C" }}>{cong}</span>
            </div>
          )}
          <div style={{
            padding: "3px 10px", borderRadius: 8,
            background: rate >= 80 ? "rgba(64,145,108,0.1)" : rate >= 50 ? "rgba(212,160,60,0.1)" : "rgba(193,87,78,0.1)",
          }}>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: rate >= 80 ? "#40916C" : rate >= 50 ? "#D4A03C" : "#C1574E",
              fontFamily: "'Rubik', sans-serif",
            }}>{rate}%</span>
          </div>
        </div>
      </div>

      {/* Day Grid */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 4,
        justifyContent: "flex-start", padding: "0 6px 8px",
      }}>
        {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
          <DayCircle
            key={day} day={day}
            state={data[day] || "empty"}
            gregDay={day + 17}
            isToday={day === 22}
            isFuture={day > 22}
            onClick={() => onToggle(prayer.id, day)}
          />
        ))}
      </div>
    </div>
  );
}

function ProgressRing({ value, size = 72, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 80 ? "#40916C" : value >= 50 ? "#D4A03C" : "#C1574E";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        flexDirection: "column",
      }}>
        <span style={{
          fontSize: size * 0.26, fontWeight: 800, color: "#2B2D42",
          fontFamily: "'Rubik', sans-serif", lineHeight: 1,
        }}>{value}</span>
        <span style={{ fontSize: 8, color: "#8D99AE", fontWeight: 600, marginTop: 1 }}>%</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      flex: 1, padding: "14px", borderRadius: 16,
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: `${accent}15`, display: "flex",
        alignItems: "center", justifyContent: "center", marginBottom: 10,
      }}>
        <M icon={icon} size={18} fill={1} color={accent} weight={500} />
      </div>
      <div style={{ fontSize: 11, color: "#8D99AE", fontWeight: 600, marginBottom: 4,
        fontFamily: "'Noto Kufi Arabic', sans-serif",
      }}>{label}</div>
      <div style={{
        fontSize: 22, fontWeight: 800, color: "#2B2D42",
        fontFamily: "'Rubik', sans-serif", fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#8D99AE", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function MonthlyChart({ data, labels }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 110, padding: "0 2px" }}>
      {data.map((val, i) => (
        <div key={i} style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 4,
        }}>
          <div style={{
            width: "100%", maxWidth: 24,
            height: `${Math.max((val / max) * 100, 3)}%`,
            borderRadius: 6,
            background: val === 0 ? "rgba(0,0,0,0.04)"
              : val > max * 0.8 ? "linear-gradient(180deg, #40916C, #52B788)"
              : val > max * 0.5 ? "linear-gradient(180deg, #D4A03C, #E8B84A)"
              : "linear-gradient(180deg, #C1574E, #D4645B)",
            transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDelay: `${i * 40}ms`,
          }} />
          <span style={{
            fontSize: 8, color: "#8D99AE", fontWeight: 600,
            fontFamily: "'Noto Kufi Arabic', sans-serif",
          }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function PrayerTrackerV2() {
  const [activeTab, setActiveTab] = useState("fard");
  const [activeView, setActiveView] = useState("tracker");
  const [prayerData, setPrayerData] = useState({});
  const [mounted, setMounted] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Inject Material Symbols + Fonts
    const link1 = document.createElement("link");
    link1.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";
    link1.rel = "stylesheet";
    document.head.appendChild(link1);
    const link2 = document.createElement("link");
    link2.href = "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Rubik:wght@400;500;600;700;800&display=swap";
    link2.rel = "stylesheet";
    document.head.appendChild(link2);

    const d = {};
    PRAYERS.forEach(p => { d[p.id] = DAYS_DATA(); });
    setPrayerData(d);
    setTimeout(() => setMounted(true), 300);

    // Inject keyframes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(212,160,60,0.3); }
        50% { box-shadow: 0 0 0 8px rgba(212,160,60,0); }
      }
    `;
    document.head.appendChild(style);

    return () => { document.head.removeChild(link1); document.head.removeChild(link2); document.head.removeChild(style); };
  }, []);

  const toggleDay = (prayerId, day) => {
    setPrayerData(prev => {
      const next = { ...prev };
      next[prayerId] = { ...next[prayerId] };
      const cur = STATES.indexOf(next[prayerId][day] || "empty");
      next[prayerId][day] = STATES[(cur + 1) % STATES.length];
      return next;
    });
  };

  const tabs = [
    { id: "fard", label: "الفرائض", icon: "mosque" },
    { id: "sunnah", label: "السنن", icon: "auto_awesome" },
    { id: "fasting", label: "الصيام", icon: "nights_stay" },
  ];

  const views = [
    { id: "tracker", label: "التتبع", icon: "grid_view" },
    { id: "yearly", label: "السنة", icon: "calendar_month" },
    { id: "dashboard", label: "الإحصائيات", icon: "analytics" },
  ];

  const hijriMonths = ["محرم", "صفر", "ربيع١", "ربيع٢", "جمادى١", "جمادى٢", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
  const hijriMonthsFull = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
  const monthlyData = [85, 92, 78, 95, 88, 72, 90, 96, 100, 82, 0, 0];

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: "#F5F3EF",
      fontFamily: "'Noto Kufi Arabic', 'Rubik', sans-serif",
      direction: "rtl", position: "relative",
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.6s ease",
    }}>
      {/* Subtle pattern overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(45,106,79,0.03) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(212,160,60,0.03) 0%, transparent 50%)`,
      }} />

      {/* Header */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "20px 20px 12px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{
              fontSize: 24, fontWeight: 800, color: "#2B2D42",
              letterSpacing: -0.3,
            }}>سجل الصلوات</div>
            <div style={{
              fontSize: 13, color: "#8D99AE", fontWeight: 500, marginTop: 3,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <M icon="calendar_today" size={14} color="#8D99AE" weight={500} />
              شوال ١٤٤٧ هـ — مارس ٢٠٢٦
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <M icon="notifications" size={20} color="#2B2D42" weight={400} />
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "linear-gradient(135deg, #2D6A4F, #40916C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(45,106,79,0.3)",
              cursor: "pointer",
            }} onClick={() => setShowProfile(!showProfile)}>
              <M icon="person" size={20} fill={1} color="#fff" weight={500} />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings Panel */}
      {showProfile && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)",
        }} onClick={() => setShowProfile(false)}>
          <div style={{
            position: "absolute", top: 70, right: 16, left: 16,
            maxWidth: 398, marginRight: "auto",
            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
            borderRadius: 20, padding: 0,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            border: "1px solid rgba(0,0,0,0.06)",
            animation: "fadeSlideIn 0.25s ease",
            overflow: "hidden",
          }} onClick={e => e.stopPropagation()}>
            {/* Profile Header */}
            <div style={{
              padding: "20px 20px 16px",
              background: "linear-gradient(135deg, #2D6A4F, #40916C)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16,
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.3)",
              }}>
                <M icon="person" size={28} fill={1} color="#fff" weight={500} />
              </div>
              <div>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: "#fff",
                  fontFamily: "'Noto Kufi Arabic', sans-serif",
                }}>أحمد</div>
                <div style={{
                  fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <M icon="male" size={14} color="rgba(255,255,255,0.7)" weight={500} />
                  ذكر — ٣٥ سنة
                </div>
              </div>
              <div style={{ marginRight: "auto" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}>
                  <M icon="edit" size={16} color="#fff" weight={400} />
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ padding: "8px 0" }}>
              {[
                { icon: "swap_horiz", label: "تبديل الملف الشخصي", color: "#2D6A4F" },
                { icon: "person_add", label: "إضافة ملف شخصي جديد", color: "#2D6A4F" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 20px", cursor: "pointer",
                  transition: "background 0.15s ease",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: `${item.color}10`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <M icon={item.icon} size={18} color={item.color} weight={500} />
                  </div>
                  <span style={{
                    fontSize: 14, fontWeight: 600, color: "#2B2D42",
                    fontFamily: "'Noto Kufi Arabic', sans-serif",
                  }}>{item.label}</span>
                  <M icon="chevron_left" size={18} color="#8D99AE" weight={400} style={{ marginRight: "auto" }} />
                </div>
              ))}

              <div style={{
                height: 1, background: "rgba(0,0,0,0.06)",
                margin: "4px 20px",
              }} />

              {/* Export / Import Section */}
              <div style={{ padding: "8px 20px 4px" }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#8D99AE",
                  textTransform: "uppercase", letterSpacing: 0.5,
                  marginBottom: 8,
                  fontFamily: "'Noto Kufi Arabic', sans-serif",
                }}>إدارة البيانات</div>
              </div>

              {[
                { icon: "upload_file", label: "تصدير البيانات", sub: "حفظ نسخة احتياطية", color: "#4A7C59" },
                { icon: "download", label: "استيراد البيانات", sub: "استعادة من نسخة سابقة", color: "#5B6B8A" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 20px", cursor: "pointer",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: `${item.color}10`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <M icon={item.icon} size={18} color={item.color} weight={500} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: "#2B2D42",
                      fontFamily: "'Noto Kufi Arabic', sans-serif",
                    }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#8D99AE", fontWeight: 500, marginTop: 1 }}>{item.sub}</div>
                  </div>
                  <M icon="chevron_left" size={18} color="#8D99AE" weight={400} style={{ marginRight: "auto" }} />
                </div>
              ))}

              <div style={{
                height: 1, background: "rgba(0,0,0,0.06)",
                margin: "4px 20px",
              }} />

              {/* Settings */}
              {[
                { icon: "palette", label: "المظهر والألوان", color: "#8B5CF6" },
                { icon: "translate", label: "اللغة", color: "#0EA5E9" },
                { icon: "delete_outline", label: "حذف الملف الشخصي", color: "#C1574E" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 20px", cursor: "pointer",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: `${item.color}10`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <M icon={item.icon} size={18} color={item.color} weight={500} />
                  </div>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: item.color === "#C1574E" ? "#C1574E" : "#2B2D42",
                    fontFamily: "'Noto Kufi Arabic', sans-serif",
                  }}>{item.label}</span>
                  <M icon="chevron_left" size={18} color="#8D99AE" weight={400} style={{ marginRight: "auto" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Switcher */}
      <div style={{
        display: "flex", gap: 0, margin: "0 20px 14px",
        background: "rgba(43,45,66,0.06)", borderRadius: 12, padding: 3,
        position: "relative", zIndex: 1,
      }}>
        {views.map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
            background: activeView === v.id ? "#fff" : "transparent",
            color: activeView === v.id ? "#2B2D42" : "#8D99AE",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Noto Kufi Arabic', sans-serif",
            boxShadow: activeView === v.id ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.25s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            <M icon={v.icon} size={16} fill={activeView === v.id ? 1 : 0}
              color={activeView === v.id ? "#2D6A4F" : "#8D99AE"} weight={activeView === v.id ? 600 : 400} />
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        padding: "0 16px", paddingBottom: 100,
        position: "relative", zIndex: 1,
      }}>
        {activeView === "tracker" && (
          <>
            {/* Prayer Times Bar */}
            <div style={{
              display: "flex", gap: 5, marginBottom: 14,
              padding: "0 2px",
            }}>
              {PRAYERS.map((p, i) => {
                const isCurrent = p.id === "asr";
                const isPast = PRAYERS.findIndex(x => x.id === "asr") > i;
                return (
                  <div key={p.id} style={{
                    flex: 1, padding: "8px 4px", borderRadius: 12,
                    background: isCurrent ? "linear-gradient(135deg, #2D6A4F, #40916C)" : "rgba(255,255,255,0.5)",
                    border: isCurrent ? "none" : "1px solid rgba(0,0,0,0.04)",
                    textAlign: "center", opacity: isPast ? 0.45 : 1,
                    transition: "all 0.3s ease",
                    boxShadow: isCurrent ? "0 3px 12px rgba(45,106,79,0.25)" : "none",
                  }}>
                    <div style={{ marginBottom: 3 }}>
                      <M icon={p.matIcon} size={16}
                        fill={isCurrent ? 1 : 0}
                        color={isCurrent ? "rgba(255,255,255,0.85)" : "#8D99AE"}
                        weight={isCurrent ? 500 : 300} />
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 600,
                      color: isCurrent ? "rgba(255,255,255,0.8)" : "#8D99AE",
                      marginBottom: 1,
                    }}>{p.name}</div>
                    <div style={{
                      fontSize: 12, fontWeight: 700,
                      color: isCurrent ? "#fff" : "#2B2D42",
                      fontFamily: "'Rubik', sans-serif",
                      fontVariantNumeric: "tabular-nums",
                    }}>{p.time} <span style={{ fontSize: 9, opacity: 0.7 }}>{p.period}</span></div>
                  </div>
                );
              })}
            </div>

            {/* Next Prayer Card */}
            <div style={{
              padding: "12px 16px", borderRadius: 16, marginBottom: 14,
              background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,0,0,0.04)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(45,106,79,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <M icon="hourglass_top" size={18} color="#2D6A4F" weight={500} fill={1} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#8D99AE", fontWeight: 600 }}>الصلاة القادمة</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#2B2D42" }}>المغرب</div>
                </div>
              </div>
              <div style={{
                fontSize: 20, fontWeight: 800, color: "#2D6A4F",
                fontFamily: "'Rubik', sans-serif", fontVariantNumeric: "tabular-nums",
                letterSpacing: 1,
              }}>2:44:12</div>
            </div>

            {/* Month Navigation */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 12, padding: "0 4px",
            }}>
              <button style={{
                width: 30, height: 30, borderRadius: 10, border: "none",
                background: "rgba(255,255,255,0.5)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <M icon="chevron_right" size={20} color="#8D99AE" weight={500} />
              </button>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{
                  fontSize: 16, fontWeight: 700, color: "#2B2D42",
                }}>شوال ١٤٤٧</span>
                <div style={{
                  padding: "2px 8px", borderRadius: 6,
                  background: "rgba(43,45,66,0.06)",
                  fontSize: 11, color: "#8D99AE", fontWeight: 700,
                  fontFamily: "'Rubik', sans-serif",
                }}>30</div>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: "rgba(43,45,66,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}>
                  <M icon="settings" size={14} color="#8D99AE" weight={400} />
                </div>
              </div>
              <button style={{
                width: 30, height: 30, borderRadius: 10, border: "none",
                background: "rgba(255,255,255,0.5)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <M icon="chevron_left" size={20} color="#8D99AE" weight={500} />
              </button>
            </div>

            {/* Prayer Grids */}
            <div style={{
              background: "rgba(255,255,255,0.4)", backdropFilter: "blur(12px)",
              borderRadius: 20, padding: "12px 10px", border: "1px solid rgba(0,0,0,0.04)",
            }}>
              {PRAYERS.map((prayer, i) => (
                <PrayerRow key={prayer.id} prayer={prayer} index={i}
                  data={prayerData[prayer.id] || {}} onToggle={toggleDay} />
              ))}
            </div>

            {/* Legend */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 20,
              marginTop: 12, padding: "8px 0",
            }}>
              {[
                { icon: "check", bg: "#40916C", border: "#40916C", label: "منفرد" },
                { icon: "mosque", bg: "#40916C", border: "#D4A03C", label: "جماعة" },
                { icon: "schedule", bg: "#C1574E", border: "#C1574E", label: "قضاء" },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 6,
                    background: `linear-gradient(135deg, ${item.bg}, ${item.bg}dd)`,
                    border: `2px solid ${item.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <M icon={item.icon} size={10} fill={1} color="#fff" weight={600} />
                  </div>
                  <span style={{ fontSize: 11, color: "#8D99AE", fontWeight: 600 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeView === "dashboard" && (
          <>
            {/* Stats Row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <StatCard icon="verified" label="نسبة الإنجاز" value="٨٧٪" accent="#40916C" />
              <StatCard icon="mosque" label="صلاة الجماعة" value="١٤٢" sub="من ١٦٥" accent="#D4A03C" />
            </div>

            {/* Progress Card */}
            <div style={{
              padding: "18px", borderRadius: 20,
              background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,0,0,0.04)",
              marginBottom: 12, display: "flex", alignItems: "center", gap: 18,
            }}>
              <ProgressRing value={87} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#8D99AE", fontWeight: 600, marginBottom: 4 }}>التقدم السنوي</div>
                <div style={{
                  fontSize: 22, fontWeight: 800, color: "#2B2D42",
                  fontFamily: "'Rubik', sans-serif",
                }}>١٬٢٣٥ <span style={{ fontSize: 13, fontWeight: 500, color: "#8D99AE" }}>/ ١٬٤٢٠</span></div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 3, marginTop: 4,
                }}>
                  <M icon="trending_up" size={14} color="#40916C" weight={600} />
                  <span style={{ fontSize: 12, color: "#40916C", fontWeight: 700 }}>٥٪ عن الشهر الماضي</span>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div style={{
              padding: "16px", borderRadius: 20,
              background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,0,0,0.04)",
              marginBottom: 12, display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "linear-gradient(135deg, #D4A03C, #E8B84A)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 14px rgba(212,160,60,0.3)",
              }}>
                <M icon="local_fire_department" size={26} fill={1} color="#fff" weight={500} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#8D99AE", fontWeight: 600 }}>سلسلة المواظبة</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
                  <span style={{
                    fontSize: 28, fontWeight: 800, color: "#D4A03C",
                    fontFamily: "'Rubik', sans-serif",
                  }}>56</span>
                  <span style={{ fontSize: 13, color: "#8D99AE", fontWeight: 500 }}>يوم متتالي</span>
                </div>
              </div>
              <div style={{
                textAlign: "center", padding: "8px 14px",
                background: "rgba(43,45,66,0.04)", borderRadius: 12,
              }}>
                <div style={{ fontSize: 9, color: "#8D99AE", fontWeight: 600, marginBottom: 2 }}>الأفضل</div>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: "#2B2D42",
                  fontFamily: "'Rubik', sans-serif",
                }}>89</div>
              </div>
            </div>

            {/* Monthly Chart */}
            <div style={{
              padding: "16px 14px", borderRadius: 20,
              background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,0,0,0.04)", marginBottom: 12,
            }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: "#2B2D42", marginBottom: 14,
                padding: "0 2px",
              }}>التقدم الشهري</div>
              <MonthlyChart data={monthlyData} labels={hijriMonths} />
            </div>

            {/* Prayer Performance */}
            <div style={{
              padding: "16px 14px", borderRadius: 20,
              background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: "#2B2D42",
                marginBottom: 14, padding: "0 2px",
              }}>أداء كل صلاة</div>
              {PRAYERS.map(p => {
                const rate = 65 + Math.floor(Math.random() * 35);
                return (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    marginBottom: 12, padding: "0 2px",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: p.gradient,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <M icon={p.matIcon} size={14} fill={1} color="#fff" weight={500} />
                    </div>
                    <span style={{
                      width: 45, fontSize: 12, fontWeight: 700, color: "#2B2D42",
                    }}>{p.name}</span>
                    <div style={{
                      flex: 1, height: 6, borderRadius: 3,
                      background: "rgba(0,0,0,0.04)", overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${rate}%`, height: "100%", borderRadius: 3,
                        background: rate >= 85 ? "linear-gradient(90deg, #40916C, #52B788)"
                          : rate >= 65 ? "linear-gradient(90deg, #D4A03C, #E8B84A)"
                          : "linear-gradient(90deg, #C1574E, #D4645B)",
                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      }} />
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: "#2B2D42",
                      width: 36, textAlign: "left",
                      fontFamily: "'Rubik', sans-serif",
                    }}>{rate}%</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeView === "yearly" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {hijriMonthsFull.map((month, i) => {
              const rate = monthlyData[i];
              const cong = rate > 0 ? Math.floor(rate * 0.8) : 0;
              return (
                <div key={i} style={{
                  padding: "14px", borderRadius: 16,
                  background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  cursor: rate > 0 ? "pointer" : "default",
                  opacity: rate === 0 ? 0.35 : 1,
                  transition: "transform 0.2s ease",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 10,
                  }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: "#2B2D42",
                    }}>{month}</span>
                    {cong > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <M icon="mosque" size={11} fill={1} color="#D4A03C" weight={500} />
                        <span style={{ fontSize: 10, color: "#D4A03C", fontWeight: 700 }}>{cong}%</span>
                      </div>
                    )}
                  </div>
                  <div style={{
                    height: 5, borderRadius: 3,
                    background: "rgba(0,0,0,0.04)", marginBottom: 8, overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${rate}%`, height: "100%", borderRadius: 3,
                      background: rate >= 90 ? "#40916C" : rate >= 70 ? "#D4A03C" : "#C1574E",
                    }} />
                  </div>
                  <span style={{
                    fontSize: 22, fontWeight: 800,
                    color: rate >= 90 ? "#40916C" : rate >= 70 ? "#D4A03C" : rate > 0 ? "#C1574E" : "#8D99AE",
                    fontFamily: "'Rubik', sans-serif",
                  }}>{rate > 0 ? `${rate}%` : "—"}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "rgba(245,243,239,0.92)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        display: "flex", justifyContent: "space-around",
        padding: "6px 0 22px",
      }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "6px 20px",
              transition: "all 0.2s ease",
            }}>
              <div style={{
                width: active ? 48 : 36, height: active ? 28 : 28,
                borderRadius: active ? 14 : 10,
                background: active ? "linear-gradient(135deg, #2D6A4F, #40916C)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: active ? "0 2px 8px rgba(45,106,79,0.3)" : "none",
              }}>
                <M icon={tab.icon} size={20}
                  fill={active ? 1 : 0}
                  color={active ? "#fff" : "#8D99AE"}
                  weight={active ? 600 : 400} />
              </div>
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                color: active ? "#2D6A4F" : "#8D99AE",
                transition: "color 0.2s ease",
              }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
