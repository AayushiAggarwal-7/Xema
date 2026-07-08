// src/pages/Landing.jsx
import React, { useState } from "react";
import RoleCarousel from "./RoleCarousel";

const CREAM = "#FBF8F0";
const NAVY = "#1B2A4A";

const interactionCSS = `
  .xema-cta-primary { transition: background-color 0.15s ease, transform 0.1s ease; }
  .xema-cta-primary:hover { background-color: #15213b; }
  .xema-cta-primary:active { transform: scale(0.96); }
`;

const styles = {
  page: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", padding: "24px",
    backgroundColor: CREAM, position: "relative", overflow: "hidden", userSelect: "none",
  },
  cornerBlob: (top, left, right, bottom, size, color) => ({
    position: "absolute", top, left, right, bottom,
    width: size, height: size, borderRadius: "50%",
    backgroundColor: color, opacity: 1, zIndex: 0,
  }),
  contentWrap: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "576px", gap: "32px" },
  logo: { height: "90px", marginBottom: "-8px" },
  tagline: { fontSize: "36px", fontWeight: 900, letterSpacing: "-0.5px", color: NAVY, lineHeight: 1.25, margin: 0, textAlign: "center" },
  desc: { fontSize: "16px", color: "#6B6A63", lineHeight: 1.65, maxWidth: "420px", textAlign: "center", margin: 0 },
  ctaButton: {
    backgroundColor: NAVY, color: "#FFFFFF", border: "none",
    fontSize: "14px", fontWeight: 700, padding: "16px 40px", borderRadius: "999px",
    boxShadow: "0 6px 16px rgba(27,42,74,0.3)", cursor: "pointer", letterSpacing: "0.3px",
  },
  dotWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  dotRow: { display: "flex", gap: "12px" },
  dot: (color) => ({ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color }),
  legendText: { fontSize: "12px", fontWeight: 600, color: "#A8A69C", letterSpacing: "0.5px", textTransform: "uppercase", margin: 0 },
};

export default function Landing() {
  const [view, setView] = useState("landing");

  if (view === "carousel") {
    return <RoleCarousel onReturnHome={() => setView("landing")} />;
  }

  return (
    <div style={styles.page}>
      <style>{interactionCSS}</style>
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
        <button className="xema-cta-primary" style={styles.ctaButton} onClick={() => setView("carousel")}>
          Select your role →
        </button>
        <div style={styles.dotWrap}>
          <div style={styles.dotRow}>
            <span style={styles.dot("#E0A72E")} />
            <span style={styles.dot("#14958F")} />
            <span style={styles.dot("#C87F4A")} />
            <span style={styles.dot("#1B2A4A")} />
          </div>
          <p style={styles.legendText}>Pharmacist &bull; Medical Officer &bull; MP &bull; DHO</p>
        </div>
      </div>
    </div>
  );
}