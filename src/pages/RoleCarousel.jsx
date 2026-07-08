import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Pill, Syringe, FlaskConical, Boxes,
    ShieldCheck, MessageSquare, Cpu, ClipboardList,
    Landmark, Users, Map, Handshake,
    HeartPulse, Sprout, ShieldAlert, ClipboardCheck,
    ArrowRight, User,
} from "lucide-react";

const CREAM = "#FBF8F0";
const PANEL = "#F1F0EA"; // light gray-ish right-half panel color
const NAVY = "#1B2A4A";
const STAGE = 460; // fixed square size shared by ring, icons, illustration, banner

const ROLES = [
    {
        id: "pharmacist", label: "PHARMACIST", color: "#E0A72E", textColor: NAVY,
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
        id: "medical_officer", label: "Medical Officer", color: "#14958F", textColor: NAVY,
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
        id: "mp", label: "MP", color: "#C87F4A", textColor: NAVY,
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
        id: "dho", label: "DHO", color: NAVY, textColor: "#FFFFFF",
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

const interactionCSS = `
  @keyframes xema-ring-spin-once {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .xema-ring-spinning { animation: xema-ring-spin-once 1.1s cubic-bezier(0.4, 0, 0.2, 1); }
  .xema-cta-outline { transition: filter 0.15s ease, transform 0.1s ease; }
  .xema-cta-outline:hover { filter: brightness(0.95); }
  .xema-cta-outline:active { transform: scale(0.96); }
  .xema-nav-clickable { transition: opacity 0.15s ease, transform 0.15s ease; }
  .xema-nav-clickable:hover { opacity: 0.75; transform: scale(1.03); }
`;

const styles = {
    // Split background: cream on the left half, light gray panel on the right half,
    // meeting at a hard edge down the center — this also removes the need to
    // scroll, since everything below is sized to fit inside 100vh.
    page: {
        height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", userSelect: "none",
        background: `linear-gradient(to right, ${CREAM} 50%, ${PANEL} 50%)`,
    },
    navBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px" },
    navLogo: { height: "24px", cursor: "pointer" },
    navTabs: {
        display: "flex", gap: "4px", backgroundColor: "transparent", borderRadius: "999px",
        padding: "3px", border: "1.5px solid #D9D6CC",
    },
    navTabActive: { backgroundColor: "#EDE79A", borderRadius: "999px", padding: "6px 16px", fontSize: "11.5px", fontWeight: 700, color: NAVY, cursor: "pointer" },
    navTabInactive: { padding: "6px 16px", fontSize: "11.5px", fontWeight: 600, color: "#8A897F" },
    // Plain silhouette icon, no filled circle background — matches target
    profileIcon: { display: "flex", alignItems: "center", justifyContent: "center" },

    mainRow: { flex: 1, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "16px", padding: "0 40px 0 22px", position: "relative", minHeight: 0 },
    leftCol: { zIndex: 2, maxWidth: "440px" },
    headlineLine: { fontSize: "36px", fontWeight: 800, lineHeight: 1.16, margin: 0, color: NAVY },
    descText: { fontSize: "13.5px", color: "#5B5A52", marginTop: "12px", maxWidth: "400px", lineHeight: 1.55 },
    buttonRow: { display: "flex", gap: "12px", marginTop: "18px" },
    loginBtn: (color, textColor) => ({
        backgroundColor: color, color: textColor, border: `2px solid ${NAVY}`, fontWeight: 700,
        fontSize: "13.5px", padding: "10px 26px", borderRadius: "999px", cursor: "pointer",
    }),
    nextBtn: (disabled) => ({
        backgroundColor: "#FBF3D9", color: NAVY, border: `2px solid ${NAVY}`, fontWeight: 700,
        fontSize: "13.5px", padding: "10px 22px", borderRadius: "999px",
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1,
        display: "flex", alignItems: "center", gap: "6px",
    }),

    // Fixed width matching STAGE exactly — this is what prevents the grid
    // track from ever squeezing narrower than the ring's actual diameter,
    // which was causing it to get clipped by the page's overflow: hidden.
    rightCol: { position: "relative", width: `${STAGE}px`, height: `${STAGE}px`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    stage: { position: "relative", width: `${STAGE}px`, height: `${STAGE}px`, flexShrink: 0 },
    illustrationImg: { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 3, maxHeight: "280px", maxWidth: "280px", objectFit: "contain" },
    // Underline-accent label instead of a solid filled block — sits just
    // under the illustration with a tinted background and a bottom border.
    roleBanner: (color, textColor) => ({
        position: "absolute", bottom: "8%", left: "50%", transform: "translateX(-50%)",
        backgroundColor: `${color}26`, color: textColor, fontWeight: 800, fontSize: "16px",
        padding: "6px 20px", zIndex: 4, letterSpacing: "0.5px", whiteSpace: "nowrap",
        borderBottom: `3px solid ${color}`,
    }),
    iconBubble: (top, left, color) => ({
        position: "absolute", top, left, transform: "translate(-50%, -50%)",
        width: "38px", height: "38px", borderRadius: "50%",
        backgroundColor: `${color}33`, border: `2px solid ${color}`, display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 5,
    }),

    bottomNav: { display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", padding: "14px 0" },
    backBtn: { background: "none", border: "none", fontSize: "13px", color: "#6B6A63", cursor: "pointer" },
    dot: (color) => ({ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: color }),
};

// Icon positions as {top%, left%} of the shared STAGE square —
// placed just outside the ring's outer edge, at the four diagonals.
const ICON_POSITIONS = [
    { top: "6%", left: "10%" }, { top: "6%", left: "90%" },
    { top: "82%", left: "6%" }, { top: "68%", left: "92%" },
];

// The ring is drawn as a DASHED arc (not a solid uniform circle) —
// a solid circle looks identical at every rotation angle, so spinning
// it is invisible. The dashes make rotation visually obvious.
function RingSVG({ color, spinning }) {
    const r = STAGE * 0.44;
    const cx = STAGE / 2;
    const cy = STAGE / 2;
    const circumference = 2 * Math.PI * r;
    return (
        <svg
            width={STAGE}
            height={STAGE}
            style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "visible" }}
            className={spinning ? "xema-ring-spinning" : ""}
        >
            <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={color}
                strokeWidth={28}
                strokeLinecap="round"
                strokeDasharray={`${circumference * 0.62} ${circumference * 0.1}`}
                transform={`rotate(-90 ${cx} ${cy})`}
                opacity={0.9}
            />
        </svg>
    );
}

export default function RoleCarousel({ onReturnHome }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const navigate = useNavigate();
    const timers = useRef([]);
    const active = ROLES[activeIndex];

    function clearTimers() {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    }

    function step(direction) {
        if (isSpinning) return;
        setIsSpinning(true);
        timers.current.push(
            setTimeout(() => {
                setActiveIndex((i) => (i + direction + ROLES.length) % ROLES.length);
            }, 260)
        );
        timers.current.push(setTimeout(() => setIsSpinning(false), 1100));
    }
    function goNext() { step(1); }
    function goBack() { step(-1); }
    function handleLogin(role) {
        navigate("/login", { state: { email: role.demoEmail, color: role.color, label: role.label } });
    }

    React.useEffect(() => () => clearTimers(), []);
    return (
        <div style={styles.page}>
            <style>{interactionCSS}</style>

            <div style={styles.navBar}>
                <img className="xema-nav-clickable" src="/logo.svg" alt="Xema" style={styles.navLogo} onClick={onReturnHome} title="Back to home" />
                <div style={styles.navTabs}>
                    <span className="xema-nav-clickable" style={styles.navTabActive} onClick={onReturnHome} title="Back to home">HOME</span>
                    <span className="xema-nav-clickable" style={styles.navTabInactive} onClick={() => navigate("/about")} title="About Xema">ABOUT</span>
                </div>
                <div style={styles.profileIcon}><User size={20} color={NAVY} /></div>
            </div>

            <div style={styles.mainRow}>
                <div style={styles.leftCol}>
                    {active.headline.map((line, i) => (
                        <h1 key={i} style={styles.headlineLine}>
                            {line.map((seg, j) => (
                                <span key={j} style={{ color: seg.colored ? active.color : NAVY }}>{seg.text}</span>
                            ))}
                        </h1>
                    ))}
                    <p style={styles.descText}>{active.desc}</p>
                    <div style={styles.buttonRow}>
                        <button className="xema-cta-outline" style={styles.loginBtn(active.color, active.textColor)} onClick={() => handleLogin(active)}>
                            Login
                        </button>
                        <button className="xema-cta-outline" style={styles.nextBtn(isSpinning)} onClick={goNext} disabled={isSpinning}>
                            Next <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div style={styles.rightCol}>
                    <div style={styles.stage}>
                        <RingSVG color={active.color} spinning={isSpinning} />
                        {active.icons.map((Icon, i) => (
                            <div key={i} style={styles.iconBubble(ICON_POSITIONS[i].top, ICON_POSITIONS[i].left, active.color)}>
                                <Icon size={18} color={active.color} />
                            </div>
                        ))}
                        <img src={active.illustration} alt={active.label} style={styles.illustrationImg} />
                        <div style={styles.roleBanner(active.color, active.textColor)}>{active.label}</div>
                    </div>
                </div>
            </div>

            <div style={styles.bottomNav}>
                <button className="xema-nav-clickable" style={styles.backBtn} onClick={goBack}>← Back</button>
                <div style={{ display: "flex", gap: "8px" }}>
                    {ROLES.map((r, i) => (
                        <span key={r.id} style={styles.dot(i === activeIndex ? r.color : "#D9D6CC")} />
                    ))}
                </div>
            </div>
        </div>
    );
}