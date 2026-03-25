import { useState, useEffect } from "react";

const M = ({ icon, size = 20, weight = 400, fill = 0, color = "inherit", style = {} }) => (
  <span className="material-symbols-rounded" style={{
    fontSize: size,
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
    color, lineHeight: 1, verticalAlign: "middle", ...style,
  }}>{icon}</span>
);

const AVATARS = {
  male: { icon: "person", gradient: "linear-gradient(135deg, #2D6A4F, #40916C)" },
  female: { icon: "person", gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)" },
  boy: { icon: "face", gradient: "linear-gradient(135deg, #0EA5E9, #38BDF8)" },
  girl: { icon: "face", gradient: "linear-gradient(135deg, #EC4899, #F472B6)" },
};

function getAvatar(gender, age) {
  if (age < 12) return gender === "male" ? AVATARS.boy : AVATARS.girl;
  return gender === "male" ? AVATARS.male : AVATARS.female;
}

const SAMPLE_PROFILES = [
  { id: 1, name: "أحمد", age: 35, gender: "male", completion: 87 },
  { id: 2, name: "فاطمة", age: 28, gender: "female", completion: 92 },
  { id: 3, name: "يوسف", age: 9, gender: "male", completion: 65 },
];

export default function ProfileScreen() {
  const [screen, setScreen] = useState("select"); // select | create
  const [profiles] = useState(SAMPLE_PROFILES);
  const [mounted, setMounted] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [showFirst, setShowFirst] = useState(false); // true = first time (no profiles)

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
      @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      input::placeholder { color: #B8BCC8; }
      input:focus { outline: none; }
    `;
    document.head.appendChild(style);
    setTimeout(() => setMounted(true), 200);
    return () => { document.head.removeChild(link1); document.head.removeChild(link2); document.head.removeChild(style); };
  }, []);

  const resetForm = () => { setName(""); setAge(""); setSelectedGender(""); };

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: "#F5F3EF",
      fontFamily: "'Noto Kufi Arabic', 'Rubik', sans-serif",
      direction: "rtl", position: "relative", overflow: "hidden",
      opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease",
    }}>
      {/* Background decorations */}
      <div style={{
        position: "absolute", top: -80, right: -60, width: 250, height: 250,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, left: -40, width: 200, height: 200,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(212,160,60,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Toggle demo button */}
      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 10,
        display: "flex", gap: 6,
      }}>
        <button onClick={() => { setShowFirst(!showFirst); setScreen("select"); resetForm(); }} style={{
          padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)",
          background: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 600,
          color: "#8D99AE", cursor: "pointer", fontFamily: "'Noto Kufi Arabic', sans-serif",
        }}>
          {showFirst ? "عرض مع ملفات" : "عرض أول استخدام"}
        </button>
      </div>

      {/* ============ FIRST TIME / NO PROFILES ============ */}
      {showFirst ? (
        <div style={{ padding: "0 24px", paddingTop: 80 }}>
          {screen === "select" ? (
            <>
              {/* Welcome illustration */}
              <div style={{
                textAlign: "center", marginBottom: 40,
                animation: "fadeUp 0.6s ease",
              }}>
                <div style={{
                  width: 120, height: 120, borderRadius: 36, margin: "0 auto 28px",
                  background: "linear-gradient(135deg, #2D6A4F, #40916C)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 12px 40px rgba(45,106,79,0.25)",
                  animation: "float 3s ease-in-out infinite",
                }}>
                  <M icon="mosque" size={56} fill={1} color="#fff" weight={400} />
                </div>
                <h1 style={{
                  fontSize: 26, fontWeight: 800, color: "#2B2D42",
                  margin: "0 0 8px", letterSpacing: -0.3,
                }}>سجل الصلوات</h1>
                <p style={{
                  fontSize: 15, color: "#8D99AE", fontWeight: 500,
                  margin: 0, lineHeight: 1.6,
                }}>تتبع صلواتك اليومية وحافظ على مواظبتك</p>
              </div>

              {/* Quran verse */}
              <div style={{
                textAlign: "center", padding: "16px 20px",
                background: "rgba(255,255,255,0.5)", borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.04)", marginBottom: 36,
                animation: "fadeUp 0.6s ease 0.1s both",
              }}>
                <p style={{
                  fontSize: 16, color: "#2B2D42", fontWeight: 600,
                  margin: 0, lineHeight: 1.8,
                  fontFamily: "'Noto Kufi Arabic', serif",
                }}>﴿ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴾</p>
                <p style={{
                  fontSize: 12, color: "#8D99AE", margin: "6px 0 0", fontWeight: 500,
                }}>النساء: ١٠٣</p>
              </div>

              {/* CTA Button */}
              <button onClick={() => setScreen("create")} style={{
                width: "100%", padding: "16px", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #2D6A4F, #40916C)",
                color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Noto Kufi Arabic', sans-serif",
                boxShadow: "0 6px 20px rgba(45,106,79,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                animation: "fadeUp 0.6s ease 0.2s both",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}>
                <M icon="person_add" size={22} fill={1} color="#fff" weight={500} />
                ابدأ بإنشاء ملفك الشخصي
              </button>

              {/* Import option */}
              <button onClick={() => {}} style={{
                width: "100%", padding: "14px", borderRadius: 16, border: "1.5px solid rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.5)", color: "#2B2D42",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Noto Kufi Arabic', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: 12,
                animation: "fadeUp 0.6s ease 0.3s both",
              }}>
                <M icon="download" size={20} color="#8D99AE" weight={500} />
                <span style={{ color: "#8D99AE" }}>استيراد بيانات سابقة</span>
              </button>
            </>
          ) : (
            /* Create Profile Form - First Time */
            <CreateProfileForm
              name={name} setName={setName}
              age={age} setAge={setAge}
              selectedGender={selectedGender} setSelectedGender={setSelectedGender}
              onBack={() => { setScreen("select"); resetForm(); }}
              onSave={() => { setScreen("select"); setShowFirst(false); resetForm(); }}
              isFirst={true}
            />
          )}
        </div>
      ) : (

      /* ============ PROFILE SELECTION (Existing Profiles) ============ */
      <div style={{ padding: "0 20px", paddingTop: 60 }}>
        {screen === "select" ? (
          <>
            {/* Header */}
            <div style={{
              textAlign: "center", marginBottom: 32,
              animation: "fadeUp 0.5s ease",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, margin: "0 auto 16px",
                background: "linear-gradient(135deg, #2D6A4F, #40916C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(45,106,79,0.2)",
              }}>
                <M icon="mosque" size={32} fill={1} color="#fff" weight={400} />
              </div>
              <h2 style={{
                fontSize: 22, fontWeight: 800, color: "#2B2D42",
                margin: "0 0 6px",
              }}>اختر ملفك الشخصي</h2>
              <p style={{
                fontSize: 13, color: "#8D99AE", fontWeight: 500, margin: 0,
              }}>اختر ملفك أو أنشئ ملفاً جديداً</p>
            </div>

            {/* Profile Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {profiles.map((profile, i) => {
                const avatar = getAvatar(profile.gender, profile.age);
                return (
                  <div key={profile.id} onClick={() => {}} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 18,
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 50, height: 50, borderRadius: 16,
                      background: avatar.gradient,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 4px 12px ${profile.gender === "female" ? "rgba(139,92,246,0.25)" : profile.age < 12 ? "rgba(14,165,233,0.25)" : "rgba(45,106,79,0.25)"}`,
                    }}>
                      <M icon={avatar.icon} size={26} fill={1} color="#fff" weight={500} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 16, fontWeight: 700, color: "#2B2D42",
                        marginBottom: 3,
                      }}>{profile.name}</div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <span style={{
                          fontSize: 12, color: "#8D99AE", fontWeight: 500,
                          display: "flex", alignItems: "center", gap: 3,
                        }}>
                          <M icon={profile.gender === "male" ? "male" : "female"} size={14} color="#8D99AE" weight={400} />
                          {profile.age < 12 ? "طفل" : profile.gender === "male" ? "ذكر" : "أنثى"} — {profile.age} سنة
                        </span>
                      </div>
                    </div>

                    <M icon="chevron_left" size={20} color="#C8CBD0" weight={400} />
                  </div>
                );
              })}
            </div>

            {/* Add Profile Button */}
            <button onClick={() => setScreen("create")} style={{
              width: "100%", padding: "14px", borderRadius: 16,
              border: "2px dashed rgba(45,106,79,0.25)",
              background: "rgba(45,106,79,0.03)",
              color: "#2D6A4F", fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Noto Kufi Arabic', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease",
              animation: "fadeUp 0.4s ease 0.3s both",
            }}>
              <M icon="add_circle" size={22} color="#2D6A4F" weight={500} fill={0} />
              إضافة ملف شخصي جديد
            </button>

            {/* Profile count */}
            <p style={{
              textAlign: "center", fontSize: 11, color: "#B8BCC8",
              marginTop: 16, fontWeight: 500,
              animation: "fadeUp 0.4s ease 0.4s both",
            }}>
              <M icon="group" size={14} color="#B8BCC8" weight={400} style={{ verticalAlign: "middle", marginLeft: 4 }} />
              {profiles.length} من ١٠ ملفات شخصية
            </p>
          </>
        ) : (
          /* Create Profile Form */
          <CreateProfileForm
            name={name} setName={setName}
            age={age} setAge={setAge}
            selectedGender={selectedGender} setSelectedGender={setSelectedGender}
            onBack={() => { setScreen("select"); resetForm(); }}
            onSave={() => { setScreen("select"); resetForm(); }}
            isFirst={false}
          />
        )}
      </div>
      )}
    </div>
  );
}

function CreateProfileForm({ name, setName, age, setAge, selectedGender, setSelectedGender, onBack, onSave, isFirst }) {
  const isChild = age && parseInt(age) < 12;
  const avatar = selectedGender ? getAvatar(selectedGender, parseInt(age) || 20) : null;
  const isValid = name.trim() && age && parseInt(age) > 0 && selectedGender;

  return (
    <div style={{ paddingTop: isFirst ? 0 : 10 }}>
      {/* Back button */}
      <button onClick={onBack} style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 4,
        padding: "8px 0", marginBottom: 16, color: "#2D6A4F",
        fontSize: 14, fontWeight: 600,
        fontFamily: "'Noto Kufi Arabic', sans-serif",
      }}>
        <M icon="arrow_forward" size={20} color="#2D6A4F" weight={500} />
        رجوع
      </button>

      {/* Header */}
      <div style={{
        textAlign: "center", marginBottom: 28,
        animation: "fadeUp 0.4s ease",
      }}>
        {/* Live Avatar Preview */}
        <div style={{
          width: 80, height: 80, borderRadius: 24, margin: "0 auto 16px",
          background: avatar ? avatar.gradient : "rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: avatar ? "0 8px 24px rgba(0,0,0,0.15)" : "none",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "scaleIn 0.4s ease",
        }}>
          <M icon={avatar ? avatar.icon : "person_add"}
            size={38} fill={avatar ? 1 : 0}
            color={avatar ? "#fff" : "#B8BCC8"} weight={500} />
        </div>
        <h2 style={{
          fontSize: 20, fontWeight: 800, color: "#2B2D42", margin: "0 0 4px",
        }}>{isFirst ? "أنشئ ملفك الشخصي" : "ملف شخصي جديد"}</h2>
        <p style={{
          fontSize: 13, color: "#8D99AE", fontWeight: 500, margin: 0,
        }}>أدخل بياناتك لتخصيص تجربتك</p>
      </div>

      {/* Form Card */}
      <div style={{
        background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)",
        borderRadius: 20, padding: "20px", border: "1px solid rgba(0,0,0,0.05)",
        animation: "fadeUp 0.4s ease 0.1s both",
      }}>
        {/* Name */}
        <div style={{ marginBottom: 18 }}>
          <label style={{
            fontSize: 13, fontWeight: 700, color: "#2B2D42",
            display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
          }}>
            <M icon="badge" size={18} color="#2D6A4F" weight={500} />
            الاسم
          </label>
          <input
            type="text" placeholder="أدخل الاسم"
            value={name} onChange={e => setName(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 12,
              border: "1.5px solid rgba(0,0,0,0.08)",
              background: "rgba(255,255,255,0.8)",
              fontSize: 15, fontWeight: 600, color: "#2B2D42",
              fontFamily: "'Noto Kufi Arabic', sans-serif",
              direction: "rtl", boxSizing: "border-box",
              transition: "border-color 0.2s ease",
            }}
            onFocus={e => e.target.style.borderColor = "#2D6A4F"}
            onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.08)"}
          />
        </div>

        {/* Age */}
        <div style={{ marginBottom: 18 }}>
          <label style={{
            fontSize: 13, fontWeight: 700, color: "#2B2D42",
            display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
          }}>
            <M icon="cake" size={18} color="#2D6A4F" weight={500} />
            العمر
          </label>
          <input
            type="number" placeholder="أدخل العمر" min="1" max="120"
            value={age} onChange={e => setAge(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 12,
              border: "1.5px solid rgba(0,0,0,0.08)",
              background: "rgba(255,255,255,0.8)",
              fontSize: 15, fontWeight: 600, color: "#2B2D42",
              fontFamily: "'Rubik', sans-serif",
              direction: "rtl", boxSizing: "border-box",
              transition: "border-color 0.2s ease",
            }}
            onFocus={e => e.target.style.borderColor = "#2D6A4F"}
            onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.08)"}
          />
          {isChild && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              marginTop: 8, padding: "6px 10px", borderRadius: 8,
              background: "rgba(14,165,233,0.08)",
            }}>
              <M icon="info" size={14} color="#0EA5E9" weight={500} />
              <span style={{ fontSize: 11, color: "#0EA5E9", fontWeight: 600 }}>
                سيتم تعيين واجهة مخصصة للأطفال
              </span>
            </div>
          )}
        </div>

        {/* Gender */}
        <div>
          <label style={{
            fontSize: 13, fontWeight: 700, color: "#2B2D42",
            display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
          }}>
            <M icon="wc" size={18} color="#2D6A4F" weight={500} />
            الجنس
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { id: "male", label: "ذكر", icon: "male", gradient: "linear-gradient(135deg, #2D6A4F, #40916C)", shadow: "rgba(45,106,79,0.25)" },
              { id: "female", label: "أنثى", icon: "female", gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)", shadow: "rgba(139,92,246,0.25)" },
            ].map(g => {
              const selected = selectedGender === g.id;
              return (
                <button key={g.id} onClick={() => setSelectedGender(g.id)} style={{
                  flex: 1, padding: "14px 12px", borderRadius: 14,
                  border: selected ? "2px solid transparent" : "2px solid rgba(0,0,0,0.06)",
                  background: selected ? g.gradient : "rgba(255,255,255,0.6)",
                  cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 6,
                  boxShadow: selected ? `0 4px 16px ${g.shadow}` : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: selected ? "scale(1.02)" : "scale(1)",
                }}>
                  <M icon={g.icon} size={28}
                    fill={selected ? 1 : 0}
                    color={selected ? "#fff" : "#8D99AE"}
                    weight={selected ? 600 : 400} />
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: selected ? "#fff" : "#8D99AE",
                    fontFamily: "'Noto Kufi Arabic', sans-serif",
                  }}>{g.label}</span>
                </button>
              );
            })}
          </div>

          {selectedGender === "female" && !isChild && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              marginTop: 10, padding: "6px 10px", borderRadius: 8,
              background: "rgba(139,92,246,0.08)",
            }}>
              <M icon="info" size={14} color="#8B5CF6" weight={500} />
              <span style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 600 }}>
                سيتم تفعيل ميزات الإعفاء (حيض/نفاس) تلقائياً
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button onClick={isValid ? onSave : undefined} style={{
        width: "100%", padding: "16px", borderRadius: 16, border: "none",
        background: isValid
          ? "linear-gradient(135deg, #2D6A4F, #40916C)"
          : "rgba(0,0,0,0.06)",
        color: isValid ? "#fff" : "#B8BCC8",
        fontSize: 16, fontWeight: 700, cursor: isValid ? "pointer" : "not-allowed",
        fontFamily: "'Noto Kufi Arabic', sans-serif",
        boxShadow: isValid ? "0 6px 20px rgba(45,106,79,0.3)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        marginTop: 20,
        transition: "all 0.3s ease",
        animation: "fadeUp 0.4s ease 0.2s both",
      }}>
        <M icon="check_circle" size={22}
          fill={isValid ? 1 : 0}
          color={isValid ? "#fff" : "#B8BCC8"} weight={500} />
        {isFirst ? "ابدأ التتبع" : "حفظ الملف الشخصي"}
      </button>
    </div>
  );
}
