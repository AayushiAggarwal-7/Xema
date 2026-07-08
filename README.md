# Xema

**AI-prioritized oversight for district health centers.**

Xema turns scattered pharmacist and medical officer reports from Primary Health Centers (PHCs) into a real-time, ranked priority list for the District Health Officer (DHO) — so urgent stockouts, disease trends, and staffing gaps get seen and acted on immediately, instead of staying buried in daily paper logs.

---

## The Problem

A District Health Officer oversees dozens of PHCs but has no way to know which one needs attention right now:

- **Stockouts go unnoticed** — critical medicines run below threshold with no district-level alert.
- **Disease spikes are missed** — a rising fever or diarrhea trend at one PHC isn't compared week over week.
- **Staffing gaps are invisible** — a doctor absent for days at a remote PHC isn't flagged until someone visits.

## The Solution

Xema scores every PHC daily across three signals — **stock, disease trend, and staffing** — and surfaces exactly what's urgent, with a plain-language reason and a one-click recommended action.

---

## How It Works

1. **Report** — Pharmacists and Medical Officers submit daily stock, patient, and disease logs.
2. **Score** — Xema's scoring engine weighs stock, disease trend, and staffing for every PHC.
3. **Prioritize** — PHCs are ranked High / Medium / Healthy, with a plain-language reason attached.
4. **Act** — The DHO approves a recommended action, which is logged and routed automatically (e.g. a stock approval creates a pending transfer for the Pharmacist to confirm).

### What makes the scoring smart

Rather than relying purely on a weighted average — which can dilute a real outbreak signal with healthy stock/staffing scores — Xema includes an **outbreak-override rule**: if a disease's case count rises for 5+ consecutive non-decreasing days with at least a 50% total rise, that PHC is forced to **High** priority regardless of its composite score.

---

## Roles

| Role | Description |
|---|---|
| **DHO** (District Health Officer) | District-wide dashboard, AI Priorities, per-PHC report drill-down, approve/act on recommendations |
| **Medical Officer** | Submits daily patient & disease logs, staff attendance, bed/test availability |
| **Pharmacist** | Submits stock updates, manages inventory, confirms transfers |
| **MP** (Member of Parliament) | Constituency-level analytics, disease heatmap, resource utilization reports |

---

## Tech Stack

- **React** (Vite) — role-based dashboards for DHO, Medical Officer, Pharmacist, and MP
- **Firebase Authentication** — email/password login, role-based redirect
- **Firestore** — real-time data store for reports, inventory, scores, and actions
- **React Router** — role-protected routing (`ProtectedRoute`)
- **Custom scoring engine** (`src/lib/scoring.js`) — weighted + rule-based prioritization, computed live from Firestore

---

## Project Structure

```
src/
├── pages/
│   ├── dho/            # CommandCenter, AIPriorities, Reportdetail, PHCDetails, ...
│   ├── mo/              # Dashboard, DailyUpdate, StaffAttendance, ...
│   ├── pharmacist/      # InventoryDashboard, StockUpdate, TransferOrders, ...
│   └── mp/              # DistrictOverview, ConstituencyAnalytics, ...
├── hooks/
│   ├── useDistrictOverview.js
│   ├── usePriorityAlerts.js
│   └── usePHCReportDetail.js
├── lib/
│   ├── firebase.js      # Firebase client config (reads from .env)
│   └── scoring.js        # computeDistrictScores() — the scoring engine
├── context/
│   └── AuthContext.jsx
└── components/
    ├── ProtectedRoute.jsx
    └── DashboardHeader.jsx

scripts/
├── serviceAccountKey.json     # Firebase Admin credentials (not committed)
├── seed-scoring-data.cjs      # Seeds DiseaseCases + DailyReports
└── seed-reports-data.cjs      # Seeds SubmittedReports + recommendations
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` (or `.env.local`) file at the project root:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=xema-smart
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Add a Firebase service account key (for seed scripts)
Download a service account key from **Firebase Console → Project Settings → Service Accounts** and save it as:
```
scripts/serviceAccountKey.json
```

### 4. Seed demo data
```bash
node scripts/seed-scoring-data.cjs
node scripts/seed-reports-data.cjs
```

### 5. Run the app
```bash
npm run dev
```

---

## Demo Accounts

| Role | Email |
|---|---|
| DHO | `dho@xema.demo` |
| Medical Officer | `medicalofficer@xema.demo` |
| Pharmacist | `pharmacist@xema.demo` |

*(Create these in Firebase Console → Authentication → Users, and matching documents in the `Users` Firestore collection with a `role` field.)*

---

## Firestore Collections

| Collection | Purpose |
|---|---|
| `PHCs` | PHC directory (name, district) |
| `Medicines` | Medicine catalog with `reorder_threshold` |
| `Inventory` | Per-PHC medicine stock levels |
| `DiseaseCases` | Daily case counts per PHC per disease |
| `DailyReports` | Daily staffing/doctor-presence reports per PHC |
| `SubmittedReports` | Raw pharmacist/MO report submissions |
| `recommendations` | AI-generated recommended actions per district |
| `Actions` | Auditable log of DHO-approved actions |
| `Transfers` | Pending/approved inter-PHC stock transfers |
| `Users` | User accounts and roles |

---

## Team

Team Xema — 2026