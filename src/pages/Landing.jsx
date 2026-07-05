// src/pages/Landing.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
  {
    id: "dho",
    title: "District Health Officer (DHO)",
    desc: "District-wide health system administration. Review AI priority alerts, allocate emergency resources, and approve temporary medical officer re-deployments.",
    badges: ["District Access", "AI Insights", "Resource Transfers", "Approver Mode"],
    color: "#1B2A4A",
    demoEmail: "dho@xema.demo",
  },
  {
    id: "medical_officer",
    title: "Medical Officer (MO)",
    desc: "Facility operations and clinical reporting. Log daily patient volume, update staff attendance, audit bed and test availability, and submit infrastructure issues.",
    badges: ["PHC Head", "Daily Logs", "Bed Tracker", "Diagnostic Status"],
    color: "#14958F",
    demoEmail: "mo.rampur@xema.demo",
  },
  {
    id: "pharmacist",
    title: "Pharmacist",
    desc: "Facility-level pharmacy operations. Log stock arrivals and dispensations, track expiry dates, and execute approved inter-PHC medicine transfer dispatches.",
    badges: ["Stock Manager", "Dispense Logs", "Expiry Monitor", "Transfer Orders"],
    color: "#E0A72E",
    demoEmail: "pharmacist.rampur@xema.demo",
  },
  {
    id: "mp",
    title: "Member of Parliament (MP)",
    desc: "District-wide public health oversight. Read-only constituency dashboard containing health performance scores, resource utilization charts, and seasonal disease heatmaps.",
    badges: ["District Monitor", "Read-only", "Disease Heatmap", "Audit Reports"],
    color: "#F5D96B",
    demoEmail: "mp@xema.demo",
  },
];

export default function Landing() {
  const [view, setView] = useState("landing"); // 'landing' | 'carousel'
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const active = ROLES[activeIndex];

  function goNext() {
    setActiveIndex((i) => Math.min(i + 1, ROLES.length - 1));
  }
  function goBack() {
    setActiveIndex((i) => Math.max(i - 1, 0));
  }
  function handleLogin(role) {
    // Role selection is cosmetic only — it does NOT grant access.
    // We only pass the demo email as a convenience prefill; the actual
    // role is always determined by Firestore after real authentication.
    navigate("/login", { state: { prefillEmail: role.demoEmail } });
  }

  if (view === "landing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F0] p-6">
        <div className="text-center max-w-md">
          <img src="/logo.svg" alt="Xema" className="h-10 mx-auto mb-8" />
          <h1 className="text-2xl md:text-3xl font-semibold text-[#1B2A4A] leading-snug">
            Predict. <span className="text-[#14958F]">Prioritize.</span> Protect.
          </h1>
          <p className="text-sm text-[#6B6A63] mt-4 leading-relaxed">
            An AI intelligence layer that turns fragmented PHC data into
            district-wide action — before shortages and outbreaks become crises.
          </p>
          <button
            onClick={() => setView("carousel")}
            className="mt-8 bg-[#1B2A4A] text-[#FBF8F0] text-sm font-medium px-8 py-3 rounded-full shadow-lg"
          >
            Select your role →
          </button>
          <div className="flex justify-center gap-2 mt-10">
            {ROLES.map((r) => (
              <span
                key={r.id}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: r.color }}
              />
            ))}
          </div>
          <p className="text-xs text-[#A8A69C] mt-2">
            DHO · Medical Officer · Pharmacist · MP
          </p>
        </div>
      </div>
    );
  }

  // Carousel view — one role card at a time
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: "#FBF8F0" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-xl bg-white border-2"
        style={{ borderColor: active.color }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: active.color }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: active.color }}
          >
            {active.id.replace("_", " ")}
          </span>
        </div>

        <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">{active.title}</h2>
        <p className="text-sm text-[#6B6A63] mb-4 leading-relaxed">{active.desc}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {active.badges.map((b) => (
            <span
              key={b}
              className="text-xs px-3 py-1 rounded-full bg-[#F3F1EA] text-[#4A4A45]"
            >
              {b}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleLogin(active)}
            className="flex-1 text-white text-sm font-semibold py-3 rounded-full"
            style={{ backgroundColor: active.color }}
          >
            Login
          </button>
          {activeIndex < ROLES.length - 1 && (
            <button
              onClick={goNext}
              className="px-4 py-3 rounded-full bg-[#F3F1EA] text-[#1B2A4A] text-sm font-medium"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        {activeIndex > 0 && (
          <button onClick={goBack} className="text-sm text-[#6B6A63]">
            ← Back
          </button>
        )}
        <div className="flex gap-2">
          {ROLES.map((r, i) => (
            <span
              key={r.id}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: i === activeIndex ? r.color : "#D9D6CC",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}