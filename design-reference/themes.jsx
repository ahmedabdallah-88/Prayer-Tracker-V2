import { useState, useEffect } from "react";

const M = ({ icon, size = 20, weight = 400, fill = 0, color = "inherit", style = {} }) => (
  <span className="material-symbols-rounded" style={{
    fontSize: size,
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
    color, lineHeight: 1, verticalAlign: "middle", ...style,
  }}>{icon}</span>
);

const THEMES = {
  emerald: {
    name: "زمردي وذهبي",
    nameEn: "Emerald & Gold",
    primary: "#2D6A4F",
    primaryMid: "#40916C",
    primaryLight: "#52B788",
    accent: "#D4A03C",
    accentLight: "#E8B84A",
    danger: "#C1574E",
    bg: "#F5F3EF",
    cardBg: "rgba(255,255,255,0.55)",
    text: "#2B2D42",
    textMuted: "#8D99AE",
    tabBg: "rgba(245,243,239,0.92)",
  },
  midnight: {
    name: "ليلي وفضي",
    nameEn: "Midnight & Silver",
    primary: "#1B2A4A",
    primaryMid: "#2C3E6B",
    primaryLight: "#4A6FA5",
    accent: "#A8B4C4",
    accentLight: "#C0CCD8",
    danger: "#C1574E",
    bg: "#F0F2F5",
    cardBg: "rgba(255,255,255,0.6)",
    text: "#1B2A4A",
    textMuted: "#7A8599",
    tabBg: "rgba(240,242,245,0.92)",
  },
  royal: {
    name: "ملكي بنفسجي",
    nameEn: "Royal Purple",
    primary: "#5B21B6",
    primaryMid: "#7C3AED",
    primaryLight: "#A78BFA",
    accent: "#D4A03C",
    accentLight: "#E8B84A",
    danger: "#C1574E",
    bg: "#F5F3F7",
    cardBg: "rgba(255,255,255,0.55)",
    text: "#2D1B69",
    textMuted: "#8B7FAE",
    tabBg: "rgba(245,243,247,0.92)",
  },
  rose: {
    name: "وردي أنيق",
    nameEn: "Elegant Rose",
    primary: "#9D174D",
    primaryMid: "#BE185D",
    primaryLight: "#EC4899",
    accent: "#D4A03C",
    accentLight: "#E8B84A",
    danger: "#B91C1C",
    bg: "#FDF2F4",
    cardBg: "rgba(255,255,255,0.55)",
    text: "#4A1D34",
    textMuted: "#A3728B",
    tabBg: "rgba(253,242,244,0.92)",
  },
  ocean: {
    name: "أزرق محيطي",
    nameEn: "Ocean Blue",
    primary: "#0C4A6E",
    primaryMid: "#0369A1",
    primaryLight: "#0EA5E9",
    accent: "#F59E0B",
    accentLight: "#FBBF24",
    danger: "#C1574E",
    bg: "#F0F7FA",
    cardBg: "rgba(255,255,255,0.55)",
    text: "#0C2D48",
    textMuted: "#6B8FA3",
    tabBg: "rgba(240,247,250,0.92)",
  },
  dark: {
    name: "داكن وذهبي",
    nameEn: "Dark & Gold",
    primary: "#D4A03C",
    primaryMid: "#E8B84A",
    primaryLight: "#F0D68A",
    accent: "#D4A03C",
    accentLight: "#E8B84A",
    danger: "#EF4444",
    bg: "#1A1A1E",
    cardBg: "rgba(40,40,44,0.8)",
    text: "#E8E6E1",
    textMuted: "#8A8A8E",
    tabBg: "rgba(26,26,30,0.95)",
  },
  olive: {
    name: "زيتوني دافئ",
    nameEn: "Warm Olive",
    primary: "#3D5A3E",
    primaryMid: "#5A7D5B",
    primaryLight: "#7A9E7B",
    accent: "#C8B56E",
    accentLight: "#D4C17A",
    danger: "#A0522D",
    bg: "#F4F2EC",
    cardBg: "rgba(255,255,255,0.5)",
    text: "#2E3A2F",
    textMuted: "#7A8A7B",
    tabBg: "rgba(244,242,236,0.92)",
  },
};

const PRAYERS = [
  { name: "الفجر", icon: "wb_twilight" },
  { name: "الظهر", icon: "wb_sunny" },
  { name: "العصر", icon: "partly_cloudy_day" },
  { name: "المغرب", icon: "wb_twilight" },
  { name: "العشاء", icon: "dark_mode" },
];

const DAYS_SAMPLE = [
  "cong", "prayed", "empty", "prayed", "cong", "cong", "prayed",
  "qada", "cong", "prayed", "prayed", "cong", "empty", "cong",
  "prayed", "cong", "cong", "prayed", "empty", "empty",
];

function ThemePreview({ themeKey, theme, isActive, onClick }) {
  const isDark = themeKey === "dark";

  return (
    <div onClick={onClick} style={{
      cursor: "pointer",
      borderRadius: 24,
      overflow: "hidden",
      border: isActive ? `3px solid ${theme.primary}` : "3px solid transparent",
      boxShadow: isActive ? `0 8px 30px ${theme.primary}30` : "0 4px 16px rgba(0,0,0,0.06)",
      transition: "all 0.3s ease",
      transform: isActive ? "scale(1.02)" : "scale(1)",
    }}>
      {/* Mini app preview */}
      <div style={{
        background: theme.bg,
        padding: "14px 12px 10px",
        minHeight: 220,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 10,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryMid})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <M icon="mosque" size={13} fill={1} color="#fff" weight={500} />
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: theme.text,
            fontFamily: "'Noto Kufi Arabic', sans-serif",
          }}>متتبع الصلاة</div>
        </div>

        {/* Prayer times mini */}
        <div style={{
          display: "flex", gap: 3, marginBottom: 10,
        }}>
          {PRAYERS.map((p, i) => (
            <div key={i} style={{
              flex: 1, padding: "4px 2px", borderRadius: 6,
              background: i === 2
                ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryMid})`
                : theme.cardBg,
              border: i !== 2 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` : "none",
              textAlign: "center",
              opacity: i < 2 ? 0.4 : 1,
            }}>
              <div style={{
                fontSize: 6, fontWeight: 600,
                color: i === 2 ? "#fff" : theme.textMuted,
              }}>{p.name}</div>
            </div>
          ))}
        </div>

        {/* Day circles mini */}
        <div style={{
          background: theme.cardBg,
          borderRadius: 12,
          padding: "8px 6px",
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
          marginBottom: 8,
        }}>
          {/* Prayer row header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            marginBottom: 6,
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: 5,
              background: `linear-gradient(135deg, #E8B4B8, #D4A0A7)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <M icon="wb_twilight" size={9} fill={1} color="#fff" weight={500} />
            </div>
            <span style={{
              fontSize: 8, fontWeight: 700, color: theme.text,
              fontFamily: "'Noto Kufi Arabic', sans-serif",
            }}>الفجر</span>
            <div style={{ flex: 1 }} />
            <div style={{
              padding: "1px 5px", borderRadius: 4,
              background: `${theme.primary}15`,
              fontSize: 7, fontWeight: 700, color: theme.primary,
            }}>85%</div>
          </div>

          {/* Mini day grid */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "flex-start",
          }}>
            {DAYS_SAMPLE.map((state, i) => {
              const colors = {
                empty: {
                  bg: "transparent",
                  border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                  textColor: theme.textMuted,
                },
                prayed: {
                  bg: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryMid})`,
                  border: "transparent",
                  textColor: "#fff",
                },
                cong: {
                  bg: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryMid})`,
                  border: theme.accent,
                  textColor: "#fff",
                },
                qada: {
                  bg: `linear-gradient(135deg, ${theme.danger}, ${theme.danger}dd)`,
                  border: "transparent",
                  textColor: "#fff",
                },
              };
              const c = colors[state];
              return (
                <div key={i} style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: c.bg,
                  border: `1.5px solid ${c.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: state === "cong" ? `0 1px 4px ${theme.accent}40` : "none",
                }}>
                  <span style={{
                    fontSize: 7, fontWeight: 700, color: c.textColor,
                    fontFamily: "'Rubik', sans-serif",
                  }}>{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini streak bar */}
        <div style={{
          display: "flex", gap: 3, alignItems: "flex-end", height: 30,
          padding: "0 4px",
        }}>
          {[65, 90, 45, 80, 70].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`, borderRadius: "4px 4px 2px 2px",
              background: `linear-gradient(180deg, ${
                [
                  "#D4A0A7", "#E8B84A", "#D4943A", "#B0664A", "#4A5A7A"
                ][i]}, ${
                [
                  "#D4A0A7", "#E8B84A", "#D4943A", "#B0664A", "#4A5A7A"
                ][i]}cc)`,
              opacity: 0.8,
            }} />
          ))}
        </div>
      </div>

      {/* Theme label */}
      <div style={{
        background: isDark ? "#2A2A2E" : "#fff",
        padding: "10px 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
      }}>
        <div>
          <div style={{
            fontSize: 13, fontWeight: 700,
            color: isDark ? "#E8E6E1" : theme.text,
            fontFamily: "'Noto Kufi Arabic', sans-serif",
          }}>{theme.name}</div>
          <div style={{
            fontSize: 10, color: isDark ? "#8A8A8E" : theme.textMuted,
            fontWeight: 500, marginTop: 1,
          }}>{theme.nameEn}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[theme.primary, theme.primaryMid, theme.accent].map((c, i) => (
            <div key={i} style={{
              width: 18, height: 18, borderRadius: 6,
              background: c,
              boxShadow: `0 2px 4px ${c}30`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FullPreview({ theme, themeKey }) {
  const isDark = themeKey === "dark";

  return (
    <div style={{
      maxWidth: 380, margin: "0 auto",
      background: theme.bg,
      borderRadius: 28,
      overflow: "hidden",
      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      border: `3px solid ${theme.primary}20`,
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 16px 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontSize: 20, fontWeight: 800, color: theme.text,
            fontFamily: "'Noto Kufi Arabic', sans-serif",
          }}>سجل الصلوات</div>
          <div style={{
            fontSize: 11, color: theme.textMuted, fontWeight: 500, marginTop: 2,
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <M icon="calendar_today" size={12} color={theme.textMuted} weight={400} />
            شوال ١٤٤٧ هـ
          </div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryMid})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 3px 10px ${theme.primary}30`,
        }}>
          <M icon="person" size={18} fill={1} color="#fff" weight={500} />
        </div>
      </div>

      {/* Segmented control */}
      <div style={{
        display: "flex", margin: "0 16px 12px",
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
        borderRadius: 10, padding: 2,
      }}>
        {["التتبع", "السنة", "الإحصائيات"].map((label, i) => (
          <div key={i} style={{
            flex: 1, padding: "6px 0", borderRadius: 8,
            background: i === 0 ? (isDark ? "rgba(255,255,255,0.1)" : "#fff") : "transparent",
            textAlign: "center",
            fontSize: 10, fontWeight: 600,
            color: i === 0 ? theme.text : theme.textMuted,
            fontFamily: "'Noto Kufi Arabic', sans-serif",
            boxShadow: i === 0 ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
          }}>{label}</div>
        ))}
      </div>

      {/* Prayer times */}
      <div style={{
        display: "flex", gap: 4, padding: "0 16px", marginBottom: 12,
      }}>
        {PRAYERS.map((p, i) => (
          <div key={i} style={{
            flex: 1, padding: "6px 3px", borderRadius: 8,
            background: i === 3
              ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryMid})`
              : theme.cardBg,
            border: i !== 3 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` : "none",
            textAlign: "center",
            opacity: i < 3 ? 0.4 : 1,
            boxShadow: i === 3 ? `0 2px 8px ${theme.primary}25` : "none",
          }}>
            <M icon={p.icon} size={14} fill={i === 3 ? 1 : 0}
              color={i === 3 ? "rgba(255,255,255,0.85)" : theme.textMuted} weight={i === 3 ? 500 : 300} />
            <div style={{
              fontSize: 8, fontWeight: 600,
              color: i === 3 ? "rgba(255,255,255,0.8)" : theme.textMuted,
              marginTop: 1,
            }}>{p.name}</div>
            <div style={{
              fontSize: 10, fontWeight: 700,
              color: i === 3 ? "#fff" : theme.text,
              fontFamily: "'Rubik', sans-serif",
            }}>{["٤:٥٢", "١٢:١٥", "٣:٣٨", "٦:٢٢", "٧:٤٢"][i]}</div>
          </div>
        ))}
      </div>

      {/* Countdown */}
      <div style={{
        margin: "0 16px 12px",
        padding: "10px 14px", borderRadius: 14,
        background: theme.cardBg,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `${theme.primary}12`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <M icon="hourglass_top" size={16} color={theme.primary} weight={500} fill={1} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: theme.textMuted, fontWeight: 600 }}>الصلاة القادمة</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>العشاء</div>
          </div>
        </div>
        <div style={{
          fontSize: 16, fontWeight: 800, color: theme.primary,
          fontFamily: "'Rubik', sans-serif",
        }}>1:20:45</div>
      </div>

      {/* Prayer grid sample */}
      <div style={{
        margin: "0 12px 12px", padding: "12px 10px",
        background: theme.cardBg,
        borderRadius: 16,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
      }}>
        {/* Prayer header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 8, padding: "6px 8px",
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.5)",
          borderRadius: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #E8B4B8, #D4A0A7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <M icon="wb_twilight" size={14} fill={1} color="#fff" weight={500} />
          </div>
          <span style={{
            fontSize: 13, fontWeight: 700, color: theme.text,
            fontFamily: "'Noto Kufi Arabic', sans-serif",
          }}>الفجر</span>
          <div style={{ flex: 1 }} />
          <div style={{
            padding: "2px 8px", borderRadius: 6,
            background: `${theme.accent}15`,
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <M icon="mosque" size={10} fill={1} color={theme.accent} weight={500} />
            <span style={{ fontSize: 10, fontWeight: 700, color: theme.accent }}>12</span>
          </div>
          <div style={{
            padding: "2px 8px", borderRadius: 6,
            background: `${theme.primary}12`,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: theme.primary }}>85%</span>
          </div>
        </div>

        {/* Day grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "0 2px" }}>
          {Array.from({ length: 20 }, (_, i) => {
            const states = ["cong", "prayed", "prayed", "cong", "cong", "empty", "prayed", "qada", "cong", "prayed",
              "cong", "prayed", "cong", "empty", "prayed", "cong", "empty", "empty", "empty", "empty"];
            const state = states[i];
            const isFuture = i >= 16;
            const isToday = i === 15;

            return (
              <div key={i} style={{
                width: 30, height: 30, borderRadius: 8,
                background: state === "empty"
                  ? (isToday ? `${theme.primary}0a` : "transparent")
                  : state === "qada"
                  ? `linear-gradient(135deg, ${theme.danger}, ${theme.danger}dd)`
                  : `linear-gradient(135deg, ${theme.primary}, ${theme.primaryMid})`,
                border: state === "cong"
                  ? `2px solid ${theme.accent}`
                  : state === "empty"
                  ? `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                  : "1.5px solid transparent",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                opacity: isFuture ? 0.2 : 1,
                boxShadow: state === "cong" ? `0 1px 6px ${theme.accent}35` : "none",
                position: "relative",
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, lineHeight: 1,
                  color: state === "empty" ? (isToday ? theme.primary : theme.text) : "#fff",
                  fontFamily: "'Rubik', sans-serif",
                }}>{i + 1}</span>
                <span style={{
                  fontSize: 6, lineHeight: 1, marginTop: 1,
                  color: state === "empty" ? theme.textMuted : "rgba(255,255,255,0.7)",
                }}>{i + 20}</span>
                {state !== "empty" && (
                  <div style={{
                    position: "absolute", top: -3, right: -3,
                    width: 11, height: 11,
                    borderRadius: state === "cong" ? 3 : "50%",
                    background: state === "cong" ? theme.accent : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}>
                    <M icon={state === "cong" ? "mosque" : state === "qada" ? "schedule" : "check"}
                      size={6} fill={1}
                      color={state === "cong" ? "#fff" : state === "qada" ? theme.danger : theme.primary}
                      weight={700} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom tab bar */}
      <div style={{
        background: theme.tabBg,
        backdropFilter: "blur(20px)",
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        display: "flex", justifyContent: "space-around",
        padding: "6px 0 14px",
      }}>
        {[
          { icon: "mosque", label: "الفرائض", active: true },
          { icon: "auto_awesome", label: "السنن" },
          { icon: "nights_stay", label: "الصيام" },
          { icon: "menu_book", label: "الأذكار" },
        ].map((tab, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "3px 10px",
          }}>
            <div style={{
              width: tab.active ? 36 : 28, height: tab.active ? 22 : 22,
              borderRadius: tab.active ? 11 : 8,
              background: tab.active ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryMid})` : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: tab.active ? `0 2px 6px ${theme.primary}30` : "none",
              transition: "all 0.2s ease",
            }}>
              <M icon={tab.icon} size={15}
                fill={tab.active ? 1 : 0}
                color={tab.active ? "#fff" : theme.textMuted}
                weight={tab.active ? 600 : 400} />
            </div>
            <span style={{
              fontSize: 8, fontWeight: tab.active ? 700 : 500,
              color: tab.active ? theme.primary : theme.textMuted,
            }}>{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ThemeShowcase() {
  const [activeTheme, setActiveTheme] = useState("emerald");
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
    style.textContent = `@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(style);
    setTimeout(() => setMounted(true), 300);
    return () => { document.head.removeChild(link1); document.head.removeChild(link2); document.head.removeChild(style); };
  }, []);

  const theme = THEMES[activeTheme];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #F5F3EF 0%, #E8E6E0 100%)",
      fontFamily: "'Noto Kufi Arabic', 'Rubik', sans-serif",
      direction: "rtl",
      padding: "20px 16px 40px",
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{
          fontSize: 24, fontWeight: 800, color: "#2B2D42",
          marginBottom: 4,
        }}>اختر ثيم التطبيق</div>
        <div style={{
          fontSize: 13, color: "#8D99AE", fontWeight: 500,
        }}>٧ ألوان مختلفة — اضغط على أي ثيم لمعاينته</div>
      </div>

      {/* Full preview */}
      <div style={{ marginBottom: 28 }}>
        <FullPreview theme={theme} themeKey={activeTheme} />
      </div>

      {/* Theme name */}
      <div style={{
        textAlign: "center", marginBottom: 16,
      }}>
        <span style={{
          fontSize: 18, fontWeight: 700, color: theme.primary,
          padding: "6px 20px", borderRadius: 12,
          background: `${theme.primary}10`,
        }}>{theme.name}</span>
      </div>

      {/* Theme grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        maxWidth: 500,
        margin: "0 auto",
      }}>
        {Object.entries(THEMES).map(([key, t], i) => (
          <div key={key} style={{
            animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
          }}>
            <ThemePreview
              themeKey={key}
              theme={t}
              isActive={activeTheme === key}
              onClick={() => setActiveTheme(key)}
            />
          </div>
        ))}
      </div>

      {/* CSS Variables output */}
      <div style={{
        marginTop: 28, padding: "16px",
        background: "rgba(255,255,255,0.6)",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.04)",
        maxWidth: 500, margin: "28px auto 0",
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "#2B2D42",
          marginBottom: 10,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <M icon="code" size={16} color="#2D6A4F" weight={500} />
          CSS Variables — {theme.name}
        </div>
        <pre style={{
          fontSize: 10, color: "#5A5D6E",
          fontFamily: "'Rubik', monospace",
          lineHeight: 1.6,
          margin: 0,
          direction: "ltr",
          textAlign: "left",
        }}>{`.theme-${activeTheme} {
  --primary: ${theme.primary};
  --primary-mid: ${theme.primaryMid};
  --primary-light: ${theme.primaryLight};
  --accent: ${theme.accent};
  --accent-light: ${theme.accentLight};
  --danger: ${theme.danger};
  --bg-main: ${theme.bg};
  --card-bg: ${theme.cardBg};
  --text-primary: ${theme.text};
  --text-muted: ${theme.textMuted};
  --tab-bg: ${theme.tabBg};
}`}</pre>
      </div>
    </div>
  );
}
