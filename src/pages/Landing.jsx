// src/pages/Landing.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pill, Syringe, FlaskConical, Boxes,
  ShieldCheck, MessageSquare, Cpu, ClipboardList,
  Landmark, Users, Map, Handshake,
  HeartPulse, Sprout, ShieldAlert, ClipboardCheck,
  User,
} from "lucide-react";

const ROLES = [
  {
    id: "pharmacist",
    label: "PHARMACIST",
    color: "#E0A72E",
    textColor: "#1B2A4A",
    headline: [
      [{ text: "Track every dose.", colored: false }],
      [{ text: "Move it ", colored: true }, { text: "where it's needed.", colored: false }],
    ],
    desc: "Manage stock, log transactions, and fulfill medicine transfers with full traceability.",
    illustration: "/illustrations/pharmacist.png",
    icons: [Pill, Syringe, FlaskConical, Boxes],
    demoEmail: "pharmacist.rampur@xema.demo",
  },
  {
    id: "medical_officer",
    label: "Medical Officer",
    color: "#14958F",
    textColor: "#1B2A4A",
    headline: [
      [{ text: "Report ", colored: true }, { text: "the ground", colored: false }],
      [{ text: "reality.", colored: false }],
    ],
    desc: "Update daily patient load, staff attendance, and facility status for your PHC in minutes.",
    illustration: "/illustrations/medical-officer.png",
    icons: [ShieldCheck, MessageSquare, Cpu, ClipboardList],
    demoEmail: "mo.rampur@xema.demo",
  },
  {
    id: "mp",
    label: "MP",
    color: "#C87F4A",
    textColor: "#1B2A4A",
    headline: [
      [{ text: "See ", colored: true }, { text: "the district.", colored: false }],
      [{ text: "Shape ", colored: true }, { text: "what's next.", colored: false }],
    ],
    desc: "Monitor healthcare performance across your constituency to guide policy and funding decisions.",
    illustration: "/illustrations/mp.png",
    icons: [Landmark, Users, Map, Handshake],
    demoEmail: "mp@xema.demo",
  },
  {
    id: "dho",
    label: "DHO",
    color: "#1B2A4A",
    textColor: "#FBF8F0", // light text — DHO's own color is dark navy, so it needs light text for contrast
    headline: [
      [{ text: "Command the district.", colored: false }],
      [{ text: "Decide with clarity.", colored: false }],
    ],
    desc: "Monitor every PHC, review AI-flagged risks, and approve district-wide interventions in one place.",
    illustration: "/illustrations/dho.png",
    icons: [HeartPulse, Sprout, ShieldAlert, ClipboardCheck],
    demoEmail: "dho@xema.demo",
  },
];

const CREAM = "#FBF8F0";
const NAVY = "#1B2A4A";

const styles = {
  page: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", padding: "24px",
    backgroundColor: CREAM, position: "relative", overflow: "hidden",
  },
  cornerBlob: (top, left, right, bottom, size, color) => ({
    position: "absolute", top, left, right, bottom,
    width: size, height: size, borderRadius: "50%",
    backgroundColor: color, filter: "blur(8px)", opacity: 0.85, zIndex: 0,
  }),
  contentWrap: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" },
  logo: { height: "40px", marginBottom: "32px" },
  tagline: { fontSize: "28px", fontWeight: 600, color: NAVY, lineHeight: 1.4, margin: 0, textAlign: "center" },
  desc: { fontSize: "14px", color: "#6B6A63", marginTop: "16px", lineHeight: 1.6, maxWidth: "340px", textAlign: "center" },
  ctaButton: {
    marginTop: "32px", backgroundColor: NAVY, color: CREAM, border: "none",
    fontSize: "15px", fontWeight: 500, padding: "13px 30px", borderRadius: "24px",
    boxShadow: "0 6px 16px rgba(27,42,74,0.3)", cursor: "pointer",
  },
  dotRow: { display: "flex", gap: "10px", marginTop: "36px" },
  dot: (color) => ({ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color }),
  legendText: { fontSize: "12px", color: "#A8A69C", marginTop: "8px" },

  carouselPage: { minHeight: "100vh", backgroundColor: CREAM, overflow: "hidden", display: "flex", flexDirection: "column" },
  navBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px" },
  navLogo: { height: "28px" },
  navTabs: { display: "flex", gap: "6px", backgroundColor: "#F3F1EA", borderRadius: "999px", padding: "4px", border: "1px solid #E5E1D6" },
  navTabActive: { backgroundColor: "#EDE79A", borderRadius: "999px", padding: "6px 16px", fontSize: "12px", fontWeight: 700, color: NAVY },
  navTabInactive: { padding: "6px 16px", fontSize: "12px", fontWeight: 600, color: "#8A897F" },
  profileIcon: { width: "34px", height: "34px", borderRadius: "50%", backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center" },

  mainRow: { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: "24px", padding: "0 60px", position: "relative" },
  leftCol: { zIndex: 2 },
  headlineLine: { fontSize: "38px", fontWeight: 800, lineHeight: 1.2, margin: 0, color: NAVY },
  descText: { fontSize: "15px", color: "#5B5A52", marginTop: "20px", maxWidth: "420px", lineHeight: 1.6 },
  buttonRow: { display: "flex", gap: "12px", marginTop: "28px" },
  loginBtn: (color, textColor) => ({
    backgroundColor: color, color: textColor, border: `2px solid ${NAVY}`, fontWeight: 700,
    fontSize: "15px", padding: "10px 26px", borderRadius: "999px", cursor: "pointer",
  }),
  nextBtn: {
    backgroundColor: "#FBF3D9", color: NAVY, border: `2px solid ${NAVY}`, fontWeight: 700,
    fontSize: "15px", padding: "10px 22px", borderRadius: "999px", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "6px",
  },

  rightCol: { position: "relative", height: "480px", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "20px" },
  illustrationImg: { position: "relative", zIndex: 3, maxHeight: "260px", objectFit: "contain", marginBottom: "100px" },
  roleBanner: (color, textColor) => ({
    position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)",
    backgroundColor: color, color: textColor, fontWeight: 800, fontSize: "22px",
    padding: "10px 28px", zIndex: 4, letterSpacing: "1px", opacity: 0.9, whiteSpace: "nowrap",
  }),
  iconBubble: (top, left, color) => ({
    position: "absolute", top, left, width: "44px", height: "44px", borderRadius: "50%",
    backgroundColor: `${color}33`, border: `2px solid ${color}`, display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 4,
  }),

  bottomNav: { display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", padding: "24px 0" },
  backBtn: { background: "none", border: "none", fontSize: "14px", color: "#6B6A63", cursor: "pointer" },
};

function RoleRing({ color, spinKey }) {
  return (
    <div
      key={spinKey}
      style={{
        position: "absolute", right: "-140px", top: "50%", transform: "translateY(-50%)",
        width: "520px", height: "520px", borderRadius: "50%",
        border: `36px solid ${color}`, opacity: 0.9,
        animation: "xema-ring-spin 0.9s ease-in-out",
      }}
    />
  );
}

export default function Landing() {
  const [view, setView] = useState("landing");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const active = ROLES[activeIndex];

  // Circular carousel: wraps from last back to first, and first back to last
  function goNext() {
    setActiveIndex((i) => (i + 1) % ROLES.length);
  }
  function goBack() {
    setActiveIndex((i) => (i - 1 + ROLES.length) % ROLES.length);
  }
  function handleLogin(role) {
    navigate("/login", { state: { prefillEmail: role.demoEmail } });
  }

  if (view === "landing") {
    return (
      <div style={styles.page}>
        <div style={styles.cornerBlob("-60px", "-60px", null, null, "220px", "#1B2A4A")} />
        <div style={styles.cornerBlob("-40px", null, "-70px", null, "180px", "#14958F")} />
        <div style={styles.cornerBlob(null, "-50px", null, "-70px", "200px", "#E0A72E")} />
        <div style={styles.cornerBlob(null, null, "-60px", "-50px", "170px", "#C87F4A")} />

        <div style={styles.contentWrap}>
          <img src="/logo.svg" alt="Xema" style={styles.logo} />
          <h1 style={styles.tagline}>
            Predict. <span style={{ color: "#14958F" }}>Prioritize.</span> Protect.
          </h1>
          <p style={styles.desc}>
            An AI intelligence layer that turns fragmented PHC data into
            district-wide action — before shortages and outbreaks become crises.
          </p>
          <button style={styles.ctaButton} onClick={() => setView("carousel")}>
            Select your role →
          </button>
          <div style={styles.dotRow}>
            {ROLES.map((r) => <span key={r.id} style={styles.dot(r.color)} />)}
          </div>
          <p style={styles.legendText}>Pharmacist · Medical Officer · MP · DHO</p>
        </div>
      </div>
    );
  }

  const iconPositions = [
    { top: "0%", left: "8%" }, { top: "0%", left: "78%" },
    { top: "78%", left: "8%" }, { top: "78%", left: "78%" },
  ];

  return (
    <div style={styles.carouselPage}>
      <style>{`
        @keyframes xema-ring-spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>

      <div style={styles.navBar}>
        <img src="/logo.svg" alt="Xema" style={styles.navLogo} />
        <div style={styles.navTabs}>
          <span style={styles.navTabActive}>HOME</span>
          <span style={styles.navTabInactive}>ABOUT</span>
        </div>
        <div style={styles.profileIcon}><User size={18} color={CREAM} /></div>
      </div>

      <div style={styles.mainRow}>
        <div style={styles.leftCol}>
          {active.headline.map((line, i) => (
            <h1 key={i} style={styles.headlineLine}>
              {line.map((seg, j) => (
                <span key={j} style={{ color: seg.colored ? active.color : NAVY }}>
                  {seg.text}
                </span>
              ))}
            </h1>
          ))}
          <p style={styles.descText}>{active.desc}</p>
          <div style={styles.buttonRow}>
            <button style={styles.loginBtn(active.color, active.textColor)} onClick={() => handleLogin(active)}>
              Login
            </button>
            <button style={styles.nextBtn} onClick={goNext}>Next →</button>
          </div>
        </div>

        <div style={styles.rightCol}>
          <RoleRing color={active.color} spinKey={activeIndex} />
          {active.icons.map((Icon, i) => (
            <div key={i} style={styles.iconBubble(iconPositions[i].top, iconPositions[i].left, active.color)}>
              <Icon size={20} color={active.color} />
            </div>
          ))}
          <img src={active.illustration} alt={active.label} style={styles.illustrationImg} />
          <div style={styles.roleBanner(active.color, active.textColor)}>{active.label}</div>
        </div>
      </div>

      <div style={styles.bottomNav}>
        <button style={styles.backBtn} onClick={goBack}>← Back</button>
        <div style={{ display: "flex", gap: "8px" }}>
          {ROLES.map((r, i) => (
            <span key={r.id} style={styles.dot(i === activeIndex ? r.color : "#D9D6CC")} />
          ))}
        </div>
      </div>
    </div>
  );
}