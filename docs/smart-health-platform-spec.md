# Smart Health — District Health Operations Platform
### Build Spec (v1) — Google Cloud "Build with AI: Code for Communities" Hackathon, Track 3

---

## 1. Overview

An AI intelligence layer on top of India's public healthcare data (HMIS/IHIP-style), giving District Health Officers a prioritized, actionable view of medicine stock, patient load, disease trends, staffing, bed availability, and diagnostics across all PHCs in a district — with a propose → approve → execute workflow so AI assists but never acts unilaterally.

**Core loop:** PHC staff report data → AI scores & prioritizes risk across PHCs → AI generates a recommendation → DHO approves/modifies → action is dispatched to relevant PHC(s) → progress is tracked to resolution.

---

## 2. Roles

| Role | Scope | Can write? | Needs approval for |
|---|---|---|---|
| **District Health Officer (DHO)** | District-wide | Approves/allocates | — (is the approver) |
| **Medical Officer** | Own PHC only | Direct write | — |
| **Pharmacist** | Own PHC only | Direct write (routine) | Transfers between PHCs |
| **Member of Parliament (MP)** | District-wide | Read-only | N/A |

**Design rule:** every role gets a focused set of screens for its job — no shared mega-dashboard. DHO decides, Medical Officer reports/manages, Pharmacist manages inventory, MP monitors.

---

## 3. Screens by role

**DHO**
1. District Command Center (all-PHC overview, top risks)
2. AI Priorities (ranked list, one-line "why," Approve/Modify/Reject)
3. PHC Details (full drill-down per facility)
4. Resource Allocation (transfers, doctor deployment)
5. Disease Monitoring (trends, outbreak flags)
6. Notifications
7. Reports & Analytics

**Medical Officer**
1. PHC Dashboard (own facility summary)
2. Daily Health Update (patient count, disease-wise cases)
3. Staff & Attendance (doctor attendance, staff availability)
4. Bed Availability
5. Test Availability (diagnostic audit: CBC, X-ray, Malaria, etc.)
6. Requests & Issues (equipment issues, emergency requests)
7. Notifications

**Pharmacist**
1. Inventory Dashboard (stock summary, low-stock/near-expiry alerts)
2. Medicine Inventory (full stock list)
3. Stock Update (receive / dispense / mark expired / mark damaged)
4. Transfer Orders (incoming/outgoing, confirm dispatch/delivery)
5. Transaction History

**MP (read-only)**
1. District Overview
2. Constituency Health Analytics
3. Disease Heatmap
4. Resource Utilization
5. Performance Reports

**Shared entry flow:** Landing → role selector → login → role-specific dashboard (per-role protected routes, enforced both client-side for UX and server-side for security).

---

## 4. Data model

```
Districts          (id, name)
PHCs                (id, district_id, name, location_lat, location_lng)
Users               (id, name, email, password_hash, role, phc_id?)  -- phc_id null for DHO/MP

-- Daily operational reporting (Medical Officer)
DailyReports        (id, phc_id, date, patient_count, doctor_present bool,
                      staff_available_count, staff_required_count,
                      beds_total, beds_occupied, submitted_by, created_at)
DiseaseCases         (id, phc_id, date, disease_name, case_count)
TestAvailability     (id, phc_id, date, test_name, available bool)
Issues               (id, phc_id, type: equipment/emergency, description,
                       status: open/acknowledged/resolved, raised_by, created_at)

-- Inventory (Pharmacist)
Medicines            (id, name, category, unit, reorder_threshold)
Inventory            (id, phc_id, medicine_id, quantity, batch_no, expiry_date, updated_at)
Transactions         (id, phc_id, medicine_id, type: receive/dispense/expired/damaged,
                       quantity, performed_by, created_at)
Transfers            (id, medicine_id, from_phc_id, to_phc_id, quantity,
                       status: pending/approved/rejected/in_transit/completed,
                       requested_by, approved_by, requested_at, approved_at)

-- AI layer
PriorityScores       (id, phc_id, date, score, contributing_factors JSON)
Recommendations      (id, phc_id, generated_at, ai_summary_text, action_type,
                       status: pending/approved/modified/rejected, reviewed_by)
Actions              (id, recommendation_id OR transfer_id, assigned_phc_id,
                       status: pending/in_progress/resolved, created_at, resolved_at)

Notifications        (id, user_id, message, related_action_id?, read_bool, created_at)
```

**Audit principle:** no table is ever edited directly by a role's UI. Every write goes through an action/endpoint that enforces that operation's rule (direct-write vs. approval-gated) and, where relevant, writes both the state change (e.g. `Inventory.quantity`) and an audit row (`Transactions`) in the same operation.

---

## 5. Action rules (direct-write vs. approval-gated)

**Direct write (no approval needed):**
- Medical Officer: submit daily report, mark attendance, update beds/tests, raise issue
- Pharmacist: receive stock, dispense, mark expired/damaged

**Approval-gated (DHO must approve):**
- Medicine transfer between PHCs (Pharmacist/AI *requests* → DHO *approves* → Pharmacist *executes* dispatch/delivery)
- Temporary doctor deployment
- Any AI-generated recommendation with an operational side effect

Pattern: request creates a row with `status: pending` and does **not** touch the live inventory/staffing data. Only DHO approval triggers the real state change + notification to the relevant PHC(s).

---

## 6. AI layer design

- **Priority scoring:** rule-based/statistical, NOT the LLM — weighted score from stock %, disease trend delta, staffing gap, bed occupancy, diagnostic availability. Keep this transparent and auditable.
- **Recommendation text:** LLM (Gemini API) turns the structured score + contributing factors into a clear, human-readable recommendation and suggested action type. Feed it structured JSON, prompt for structured JSON output back (e.g. `{ summary, action_type, urgency, target_phc }`) so the UI can render it consistently.
- **Multilingual intake (differentiator):** Cloud Speech-to-Text + Translation API so Medical Officers/Pharmacists can report in their local language by voice — matches the challenge's "multilingual AI platform" requirement directly.
- **Outbreak/hotspot detection:** compare `DiseaseCases` week-over-week per PHC/disease; flag anomalies for the Disease Monitoring screen and MP's Disease Heatmap.

---

## 7. Recommended stack (aligned to hackathon sponsor tools)

| Layer | Choice |
|---|---|
| Frontend | React / Next.js |
| Auth + DB | Firebase (Auth + Firestore) — real-time sync is good for live-updating dashboards in the demo |
| Backend logic | Cloud Functions |
| AI | Gemini API (Vertex AI / Google AI Studio) |
| Voice/multilingual | Cloud Speech-to-Text, Translation API |
| Maps | Google Maps Platform (disease heatmap, PHC locations) |
| Hosting | Firebase Hosting |
| Optional | BigQuery for blending public datasets (NFHS/data.gov.in) into demand forecasting |

---

## 8. Build order (MVP priority)

1. Firebase project + schema above + seed data for ~10–15 PHCs
2. Auth + role-based routing (4 roles)
3. Medical Officer daily report form + Pharmacist stock forms (direct-write flows)
4. Rule-based priority scoring engine (no AI yet — get ranking working first)
5. DHO Command Center + AI Priorities screen
6. Gemini API integration for recommendation text
7. Approve/modify flow → Transfers/Actions + Notifications
8. Pharmacist transfer confirm/dispatch/deliver flow
9. MP read-only screens + disease heatmap
10. Polish: charts, multilingual voice intake if time allows
