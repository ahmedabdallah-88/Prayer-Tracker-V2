import { useState, useEffect } from "react";

const M = ({ icon, size = 20, weight = 400, fill = 0, color = "inherit", style = {} }) => (
  <span className="material-symbols-rounded" style={{
    fontSize: size,
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
    color, lineHeight: 1, verticalAlign: "middle", ...style,
  }}>{icon}</span>
);

const THEMES = [
  { id: "green", label: "أخضر وذهبي", colors: ["#2D6A4F", "#40916C", "#D4A03C"] },
  { id: "navy", label: "كحلي وفضي", colors: ["#1B2A4A", "#2C3E6B", "#A8B4C4"] },
  { id: "purple", label: "بنفسجي وذهبي", colors: ["#5B21B6", "#7C3AED", "#D4A03C"] },
  { id: "pink", label: "وردي", colors: ["#9D174D", "#DB2777", "#F9A8D4"] },
  { id: "sky", label: "أزرق سماوي", colors: ["#0369A1", "#0EA5E9", "#BAE6FD"] },
  { id: "dark", label: "داكن", colors: ["#1C1C1E", "#2C2C2E", "#D4A03C"] },
  { id: "olive", label: "زيتوني", colors: ["#3D5A3E", "#5A7D5B", "#C8B56E"] },
];

export default function ProfileSettings() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("main"); // main | edit | theme | data
  const [name, setName] = useState("أحمد");
  const [age, setAge] = useState("35");
  const [selectedGender, setSelectedGender] = useState("male");
  const [activeTheme, setActiveTheme] = useState("green");
  const [activeLang, setActiveLang] = useState("ar");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

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
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes checkPop { 0% { transform: scale(0); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }
      @keyframes fadeOverlay { from { opacity: 0; } to { opacity: 1; } }
      input::placeholder { color: #B8BCC8; }
      input:focus { outline: none; }
    `;
    document.head.appendChild(style);
    setTimeout(() => setMounted(true), 200);
    return () => { document.head.removeChild(link1); document.head.removeChild(link2); document.head.removeChild(style); };
  }, []);

  const SectionHeader = ({ title, onBack }) => (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "0 0 16px", marginBottom: 4,
    }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 12, border: "none",
        background: "rgba(255,255,255,0.6)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.2s",
      }}>
        <M icon="arrow_forward" size={20} color="#2B2D42" weight={500} />
      </button>
      <span style={{
        fontSize: 18, fontWeight: 700, color: "#2B2D42",
        fontFamily: "'Noto Kufi Arabic', sans-serif",
      }}>{title}</span>
    </div>
  );

  const MenuItem = ({ icon, label, sub, color, accent, onClick, trailing, danger }) => (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 16px", cursor: "pointer",
      borderRadius: 14, margin: "0 0 2px",
      transition: "background 0.15s ease",
      background: "transparent",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        background: danger ? "rgba(193,87,78,0.08)" : `${accent || color}12`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <M icon={icon} size={20} color={danger ? "#C1574E" : (accent || color)} weight={500} fill={0} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: danger ? "#C1574E" : "#2B2D42",
          fontFamily: "'Noto Kufi Arabic', sans-serif",
        }}>{label}</div>
        {sub && <div style={{
          fontSize: 11, color: "#8D99AE", fontWeight: 500, marginTop: 2,
        }}>{sub}</div>}
      </div>
      {trailing || <M icon="chevron_left" size={18} color="#C8CBD0" weight={400} />}
    </div>
  );

  const Divider = () => (
    <div style={{ height: 1, background: "rgba(0,0,0,0.05)", margin: "6px 16px" }} />
  );

  const SectionLabel = ({ label }) => (
    <div style={{
      padding: "12px 16px 6px",
      fontSize: 11, fontWeight: 700, color: "#8D99AE",
      fontFamily: "'Noto Kufi Arabic', sans-serif",
      letterSpacing: 0.3,
    }}>{label}</div>
  );

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
        position: "absolute", top: -60, right: -40, width: 200, height: 200,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(45,106,79,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ padding: "20px 16px", paddingBottom: 40 }}>

        {/* ============ MAIN SETTINGS ============ */}
        {activeSection === "main" && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "0 4px 20px",
            }}>
              <button onClick={() => {}} style={{
                width: 36, height: 36, borderRadius: 12, border: "none",
                background: "rgba(255,255,255,0.6)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <M icon="close" size={20} color="#2B2D42" weight={500} />
              </button>
              <span style={{
                fontSize: 18, fontWeight: 700, color: "#2B2D42",
              }}>الإعدادات</span>
            </div>

            {/* Profile Card */}
            <div style={{
              background: "linear-gradient(135deg, #2D6A4F, #40916C)",
              borderRadius: 20, padding: "20px",
              marginBottom: 16, position: "relative", overflow: "hidden",
              boxShadow: "0 8px 30px rgba(45,106,79,0.2)",
            }}>
              {/* Decorative circle */}
              <div style={{
                position: "absolute", top: -20, left: -20,
                width: 100, height: 100, borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }} />
              <div style={{
                position: "absolute", bottom: -30, right: -10,
                width: 80, height: 80, borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
              }} />

              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                position: "relative", zIndex: 1,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 18,
                  background: "rgba(255,255,255,0.15)",
                  border: "2px solid rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <M icon="person" size={30} fill={1} color="#fff" weight={500} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 20, fontWeight: 700, color: "#fff",
                  }}>{name}</div>
                  <div style={{
                    fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 6, marginTop: 3,
                  }}>
                    <M icon="male" size={16} color="rgba(255,255,255,0.7)" weight={400} />
                    ذكر — {age} سنة
                  </div>
                </div>
                <button onClick={() => setActiveSection("edit")} style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <M icon="edit" size={18} color="#fff" weight={400} />
                </button>
              </div>
            </div>

            {/* Menu Sections */}
            <div style={{
              background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)",
              borderRadius: 20, border: "1px solid rgba(0,0,0,0.04)",
              overflow: "hidden", marginBottom: 12,
            }}>
              <SectionLabel label="الملف الشخصي" />
              <MenuItem icon="edit" label="تعديل البيانات" sub="الاسم، العمر، الجنس" color="#2B2D42" accent="#2D6A4F" onClick={() => setActiveSection("edit")} />
              <MenuItem icon="swap_horiz" label="تبديل الملف الشخصي" color="#2B2D42" accent="#5B6B8A" onClick={() => {}} />
              <MenuItem icon="person_add" label="إضافة ملف جديد" color="#2B2D42" accent="#0EA5E9" onClick={() => {}} />
            </div>

            <div style={{
              background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)",
              borderRadius: 20, border: "1px solid rgba(0,0,0,0.04)",
              overflow: "hidden", marginBottom: 12,
            }}>
              <SectionLabel label="إدارة البيانات" />
              <MenuItem icon="upload_file" label="تصدير البيانات"
                sub="حفظ نسخة احتياطية JSON" color="#2B2D42" accent="#4A7C59"
                onClick={() => setActiveSection("data")} />
              <MenuItem icon="download" label="استيراد البيانات"
                sub="استعادة من نسخة سابقة" color="#2B2D42" accent="#5B6B8A"
                onClick={() => setActiveSection("data")} />
            </div>

            <div style={{
              background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)",
              borderRadius: 20, border: "1px solid rgba(0,0,0,0.04)",
              overflow: "hidden", marginBottom: 12,
            }}>
              <SectionLabel label="المظهر" />
              <MenuItem icon="palette" label="الألوان والثيم"
                sub={THEMES.find(t => t.id === activeTheme)?.label}
                color="#2B2D42" accent="#8B5CF6"
                onClick={() => setActiveSection("theme")}
                trailing={
                  <div style={{ display: "flex", gap: 3, marginLeft: 4 }}>
                    {THEMES.find(t => t.id === activeTheme)?.colors.map((c, i) => (
                      <div key={i} style={{ width: 14, height: 14, borderRadius: 5, background: c }} />
                    ))}
                  </div>
                }
              />
              <MenuItem icon="translate" label="اللغة"
                color="#2B2D42" accent="#0EA5E9"
                onClick={() => {}}
                trailing={
                  <div style={{
                    padding: "4px 10px", borderRadius: 8,
                    background: "rgba(14,165,233,0.08)",
                    fontSize: 12, fontWeight: 700, color: "#0EA5E9",
                  }}>{activeLang === "ar" ? "العربية" : "English"}</div>
                }
              />
            </div>

            <div style={{
              background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)",
              borderRadius: 20, border: "1px solid rgba(0,0,0,0.04)",
              overflow: "hidden", marginBottom: 12,
            }}>
              <SectionLabel label="خيارات متقدمة" />
              <MenuItem icon="notifications" label="الإشعارات"
                sub="تذكير الصلاة قبل وبعد الوقت"
                color="#2B2D42" accent="#40916C" onClick={() => {}} />
            </div>

            <div style={{
              background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)",
              borderRadius: 20, border: "1px solid rgba(0,0,0,0.04)",
              overflow: "hidden",
            }}>
              <MenuItem icon="delete_outline" label="حذف الملف الشخصي"
                sub="سيتم حذف جميع البيانات نهائياً"
                danger={true} onClick={() => setShowDeleteConfirm(true)} />
            </div>

            {/* App version */}
            <div style={{
              textAlign: "center", marginTop: 20, padding: "8px 0",
            }}>
              <div style={{
                fontSize: 11, color: "#B8BCC8", fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}>
                <M icon="mosque" size={14} color="#B8BCC8" weight={400} />
                سجل الصلوات — الإصدار ٢.٠
              </div>
            </div>
          </div>
        )}

        {/* ============ EDIT PROFILE ============ */}
        {activeSection === "edit" && (
          <div style={{ animation: "slideRight 0.3s ease" }}>
            <SectionHeader title="تعديل البيانات" onBack={() => setActiveSection("main")} />

            {/* Live Preview */}
            <div style={{
              textAlign: "center", marginBottom: 24,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 22, margin: "0 auto 12px",
                background: selectedGender === "female"
                  ? "linear-gradient(135deg, #8B5CF6, #A78BFA)"
                  : "linear-gradient(135deg, #2D6A4F, #40916C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                transition: "all 0.4s ease",
              }}>
                <M icon={parseInt(age) < 12 ? "face" : "person"} size={36} fill={1} color="#fff" weight={500} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#2B2D42" }}>
                {name || "—"}
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)",
              borderRadius: 20, padding: "20px", border: "1px solid rgba(0,0,0,0.04)",
            }}>
              {/* Name */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  fontSize: 12, fontWeight: 700, color: "#8D99AE",
                  display: "flex", alignItems: "center", gap: 5, marginBottom: 8,
                }}>
                  <M icon="badge" size={16} color="#8D99AE" weight={500} />
                  الاسم
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 12,
                    border: "1.5px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)",
                    fontSize: 15, fontWeight: 600, color: "#2B2D42",
                    fontFamily: "'Noto Kufi Arabic', sans-serif",
                    direction: "rtl", boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#2D6A4F"}
                  onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.08)"}
                />
              </div>

              {/* Age */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  fontSize: 12, fontWeight: 700, color: "#8D99AE",
                  display: "flex", alignItems: "center", gap: 5, marginBottom: 8,
                }}>
                  <M icon="cake" size={16} color="#8D99AE" weight={500} />
                  العمر
                </label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)}
                  min="1" max="120"
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 12,
                    border: "1.5px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)",
                    fontSize: 15, fontWeight: 600, color: "#2B2D42",
                    fontFamily: "'Rubik', sans-serif",
                    direction: "rtl", boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#2D6A4F"}
                  onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.08)"}
                />
              </div>

              {/* Gender */}
              <div>
                <label style={{
                  fontSize: 12, fontWeight: 700, color: "#8D99AE",
                  display: "flex", alignItems: "center", gap: 5, marginBottom: 10,
                }}>
                  <M icon="wc" size={16} color="#8D99AE" weight={500} />
                  الجنس
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { id: "male", label: "ذكر", icon: "male", gradient: "linear-gradient(135deg, #2D6A4F, #40916C)", shadow: "rgba(45,106,79,0.2)" },
                    { id: "female", label: "أنثى", icon: "female", gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)", shadow: "rgba(139,92,246,0.2)" },
                  ].map(g => {
                    const sel = selectedGender === g.id;
                    return (
                      <button key={g.id} onClick={() => setSelectedGender(g.id)} style={{
                        flex: 1, padding: "12px", borderRadius: 14,
                        border: sel ? "2px solid transparent" : "2px solid rgba(0,0,0,0.06)",
                        background: sel ? g.gradient : "rgba(255,255,255,0.6)",
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 8,
                        boxShadow: sel ? `0 4px 14px ${g.shadow}` : "none",
                        transition: "all 0.3s ease",
                      }}>
                        <M icon={g.icon} size={22} fill={sel ? 1 : 0}
                          color={sel ? "#fff" : "#8D99AE"} weight={sel ? 600 : 400} />
                        <span style={{
                          fontSize: 14, fontWeight: 700,
                          color: sel ? "#fff" : "#8D99AE",
                        }}>{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Save */}
            <button onClick={() => setActiveSection("main")} style={{
              width: "100%", padding: "15px", borderRadius: 16, border: "none",
              background: "linear-gradient(135deg, #2D6A4F, #40916C)",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Noto Kufi Arabic', sans-serif",
              boxShadow: "0 6px 20px rgba(45,106,79,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 20,
            }}>
              <M icon="check" size={20} color="#fff" weight={600} />
              حفظ التغييرات
            </button>
          </div>
        )}

        {/* ============ THEME PICKER ============ */}
        {activeSection === "theme" && (
          <div style={{ animation: "slideRight 0.3s ease" }}>
            <SectionHeader title="الألوان والثيم" onBack={() => setActiveSection("main")} />

            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {THEMES.map((theme, i) => {
                const active = activeTheme === theme.id;
                return (
                  <div key={theme.id} onClick={() => setActiveTheme(theme.id)} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 16,
                    background: active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.45)",
                    border: active ? "2px solid #2D6A4F" : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    boxShadow: active ? "0 4px 16px rgba(45,106,79,0.1)" : "none",
                    animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                  }}>
                    {/* Color swatches */}
                    <div style={{
                      display: "flex", gap: 4, flexShrink: 0,
                    }}>
                      {theme.colors.map((c, j) => (
                        <div key={j} style={{
                          width: j === 0 ? 28 : 20,
                          height: 28, borderRadius: j === 0 ? 8 : 6,
                          background: c,
                          boxShadow: `0 2px 6px ${c}40`,
                        }} />
                      ))}
                    </div>

                    <span style={{
                      flex: 1, fontSize: 14, fontWeight: 600,
                      color: active ? "#2B2D42" : "#5A5D6E",
                    }}>{theme.label}</span>

                    {active && (
                      <div style={{
                        width: 24, height: 24, borderRadius: 12,
                        background: "#2D6A4F",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        animation: "checkPop 0.3s ease",
                      }}>
                        <M icon="check" size={16} color="#fff" weight={700} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Preview hint */}
            <div style={{
              textAlign: "center", marginTop: 20,
              padding: "12px", borderRadius: 12,
              background: "rgba(45,106,79,0.05)",
            }}>
              <div style={{
                fontSize: 12, color: "#8D99AE", fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}>
                <M icon="visibility" size={16} color="#8D99AE" weight={400} />
                سيتم تطبيق الثيم فوراً
              </div>
            </div>
          </div>
        )}

        {/* ============ DATA MANAGEMENT ============ */}
        {activeSection === "data" && (
          <div style={{ animation: "slideRight 0.3s ease" }}>
            <SectionHeader title="إدارة البيانات" onBack={() => { setActiveSection("main"); setExportSuccess(false); }} />

            {/* Export Card */}
            <div style={{
              background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
              borderRadius: 20, padding: "20px", border: "1px solid rgba(0,0,0,0.04)",
              marginBottom: 12,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: "rgba(74,124,89,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <M icon="upload_file" size={24} color="#4A7C59" weight={500} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#2B2D42" }}>تصدير البيانات</div>
                  <div style={{ fontSize: 12, color: "#8D99AE", fontWeight: 500, marginTop: 2 }}>
                    حفظ جميع بيانات الملف الشخصي كملف JSON
                  </div>
                </div>
              </div>

              <div style={{
                padding: "12px 14px", borderRadius: 12,
                background: "rgba(0,0,0,0.02)", marginBottom: 14,
              }}>
                <div style={{ fontSize: 12, color: "#8D99AE", fontWeight: 600, marginBottom: 8 }}>
                  سيتم تصدير:
                </div>
                {["بيانات الصلوات (فرائض + سنن)", "بيانات الجماعة والقضاء", "الصيام (تطوع + رمضان)", "الإعفاءات وسجل الدورة", "الإعدادات والثيم"].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 0",
                  }}>
                    <M icon="check_circle" size={14} fill={1} color="#4A7C59" weight={500} />
                    <span style={{ fontSize: 12, color: "#5A5D6E", fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => {
                setExportSuccess(true);
                setTimeout(() => setExportSuccess(false), 3000);
              }} style={{
                width: "100%", padding: "13px", borderRadius: 14, border: "none",
                background: exportSuccess
                  ? "linear-gradient(135deg, #40916C, #52B788)"
                  : "linear-gradient(135deg, #2D6A4F, #40916C)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Noto Kufi Arabic', sans-serif",
                boxShadow: "0 4px 14px rgba(45,106,79,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.3s ease",
              }}>
                <M icon={exportSuccess ? "check_circle" : "download"} size={20}
                  fill={exportSuccess ? 1 : 0} color="#fff" weight={500} />
                {exportSuccess ? "تم التصدير بنجاح!" : "تصدير الآن"}
              </button>

              {exportSuccess && (
                <div style={{
                  marginTop: 10, padding: "8px 12px", borderRadius: 10,
                  background: "rgba(64,145,108,0.08)",
                  display: "flex", alignItems: "center", gap: 6,
                  animation: "fadeUp 0.3s ease",
                }}>
                  <M icon="folder" size={16} color="#40916C" weight={500} />
                  <span style={{ fontSize: 11, color: "#40916C", fontWeight: 600 }}>
                    أحمد_2026-03-24_14-30-00.json
                  </span>
                </div>
              )}
            </div>

            {/* Import Card */}
            <div style={{
              background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",
              borderRadius: 20, padding: "20px", border: "1px solid rgba(0,0,0,0.04)",
              marginBottom: 12,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: "rgba(91,107,138,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <M icon="download" size={24} color="#5B6B8A" weight={500} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#2B2D42" }}>استيراد البيانات</div>
                  <div style={{ fontSize: 12, color: "#8D99AE", fontWeight: 500, marginTop: 2 }}>
                    استعادة بيانات من نسخة احتياطية
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div style={{
                padding: "10px 14px", borderRadius: 12,
                background: "rgba(212,160,60,0.06)",
                display: "flex", alignItems: "flex-start", gap: 8,
                marginBottom: 14,
              }}>
                <M icon="warning" size={18} color="#D4A03C" weight={500} fill={1}
                  style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#8B7535", fontWeight: 500, lineHeight: 1.5 }}>
                  الاستيراد سيدمج البيانات مع البيانات الحالية. لن يتم حذف أي بيانات موجودة.
                </span>
              </div>

              {/* Drop zone */}
              <div style={{
                padding: "24px 16px", borderRadius: 14,
                border: "2px dashed rgba(91,107,138,0.2)",
                background: "rgba(91,107,138,0.02)",
                textAlign: "center", cursor: "pointer",
              }}>
                <M icon="cloud_upload" size={36} color="#8D99AE" weight={300} />
                <div style={{
                  fontSize: 13, color: "#5A5D6E", fontWeight: 600, marginTop: 8,
                }}>اضغط لاختيار ملف JSON</div>
                <div style={{
                  fontSize: 11, color: "#B8BCC8", marginTop: 4,
                }}>أو اسحب الملف هنا</div>
              </div>
            </div>

            {/* Last export info */}
            <div style={{
              padding: "12px 16px", borderRadius: 14,
              background: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(0,0,0,0.04)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <M icon="history" size={18} color="#8D99AE" weight={400} />
              <div>
                <div style={{ fontSize: 12, color: "#8D99AE", fontWeight: 600 }}>آخر تصدير</div>
                <div style={{ fontSize: 11, color: "#B8BCC8", fontWeight: 500, marginTop: 1 }}>
                  ٢٠٢٦/٠٣/٢١ — ٠١:٥٥ ص
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ DELETE CONFIRMATION ============ */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 24px",
          animation: "fadeOverlay 0.2s ease",
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            background: "#fff", borderRadius: 24, padding: "28px 24px",
            width: "100%", maxWidth: 360,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            animation: "scaleIn 0.25s ease",
            textAlign: "center",
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              width: 56, height: 56, borderRadius: 18, margin: "0 auto 16px",
              background: "rgba(193,87,78,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <M icon="delete_forever" size={30} color="#C1574E" weight={500} fill={0} />
            </div>
            <div style={{
              fontSize: 18, fontWeight: 700, color: "#2B2D42", marginBottom: 8,
            }}>حذف الملف الشخصي؟</div>
            <div style={{
              fontSize: 13, color: "#8D99AE", fontWeight: 500, lineHeight: 1.6,
              marginBottom: 24,
            }}>
              سيتم حذف جميع بيانات <strong style={{ color: "#2B2D42" }}>{name}</strong> بشكل نهائي
              <br />بما في ذلك الصلوات والصيام والإحصائيات
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{
                flex: 1, padding: "13px", borderRadius: 14,
                border: "1.5px solid rgba(0,0,0,0.08)",
                background: "#fff", color: "#2B2D42",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Noto Kufi Arabic', sans-serif",
              }}>إلغاء</button>
              <button onClick={() => setShowDeleteConfirm(false)} style={{
                flex: 1, padding: "13px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #C1574E, #D4645B)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Noto Kufi Arabic', sans-serif",
                boxShadow: "0 4px 14px rgba(193,87,78,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <M icon="delete" size={18} color="#fff" weight={500} />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
