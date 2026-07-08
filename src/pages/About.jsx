import React from "react";
import { useNavigate } from "react-router-dom";

const CREAM = "#FBF8F0";
const NAVY = "#1B2A4A";
const TEAL = "#14958F";

const styles = {
    page: { minHeight: "100vh", backgroundColor: CREAM, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px" },
    navBar: { width: "100%", maxWidth: "900px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", marginBottom: "48px" },
    navLogo: { height: "28px", cursor: "pointer" },
    navTabs: { display: "flex", gap: "4px", borderRadius: "999px", padding: "3px", border: "1.5px solid #D9D6CC" },
    navTabInactive: { padding: "6px 16px", fontSize: "11.5px", fontWeight: 600, color: "#8A897F", cursor: "pointer", borderRadius: "999px" },
    navTabActive: { backgroundColor: "#EDE79A", borderRadius: "999px", padding: "6px 16px", fontSize: "11.5px", fontWeight: 700, color: NAVY, cursor: "pointer" },

    content: { maxWidth: "700px", width: "100%" },
    heading: { fontSize: "32px", fontWeight: 900, color: NAVY, marginBottom: "12px" },
    subheading: { fontSize: "15px", color: "#6B6A63", marginBottom: "40px", lineHeight: 1.6 },
    section: { marginBottom: "32px" },
    sectionTitle: { fontSize: "16px", fontWeight: 700, color: TEAL, marginBottom: "8px" },
    sectionText: { fontSize: "14px", color: "#5B5A52", lineHeight: 1.7 },
    backLink: { marginTop: "24px", fontSize: "13.5px", fontWeight: 600, color: NAVY, cursor: "pointer", textDecoration: "none" },
};

export default function About() {
    const navigate = useNavigate();

    return (
        <div style={styles.page}>
            <div style={styles.navBar}>
                <img src="/logo.svg" alt="Xema" style={styles.navLogo} onClick={() => navigate("/")} />
                <div style={styles.navTabs}>
                    <span style={styles.navTabInactive} onClick={() => navigate("/")}>HOME</span>
                    <span style={styles.navTabActive}>ABOUT</span>
                </div>
            </div>

            <div style={styles.content}>
                <h1 style={styles.heading}>About Xema</h1>
                <p style={styles.subheading}>
                    An AI intelligence layer that turns fragmented PHC data into district-wide action —
                    before shortages and outbreaks become crises.
                </p>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>The Problem</div>
                    <p style={styles.sectionText}>
                        A District Health Officer oversees dozens of Primary Health Centers, but has no
                        way to know which one needs attention right now. Stockouts go unnoticed, disease
                        spikes are missed, and staffing gaps stay invisible until someone happens to visit.
                    </p>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>The Solution</div>
                    <p style={styles.sectionText}>
                        Xema scores every PHC daily across three signals — stock, disease trend, and
                        staffing — then surfaces exactly what's urgent, with a plain-language reason and
                        a one-click recommended action. An outbreak-override rule ensures a real, sustained
                        disease trend is never diluted by an otherwise-healthy composite score.
                    </p>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Who It's For</div>
                    <p style={styles.sectionText}>
                        Pharmacists and Medical Officers submit daily ground-level reports. District Health
                        Officers get a prioritized, district-wide view and can approve action in one click.
                        MPs get constituency-level visibility to guide policy and funding decisions.
                    </p>
                </div>

                <a style={styles.backLink} onClick={() => navigate("/")}>&larr; Back to Home</a>
            </div>
        </div>
    );
}