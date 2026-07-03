# Xema — Seed Data Plan
### For `scripts/seed.ts` — hand this doc + the platform spec to Antigravity

This doc is the single source of truth for fake data. Field names below match `smart-health-platform-spec.md` exactly — no translation needed when writing the seed script.

---

## 1. District

```
District: Kaushal District (fictional)
```

---

## 2. PHCs (12 total)

12 gives you enough spread to look realistic without being excessive to seed/render. 3 are engineered crises, 2 are "moderate/watch" (mildly concerning but not flagged), 7 are healthy baseline — this contrast is what proves your scoring engine actually discriminates, instead of flagging everything.

| # | PHC Name | Status | Notes |
|---|---|---|---|
| 1 | PHC Rampur | 🔴 Crisis A — Stock | See Section 4 |
| 2 | PHC Sitapur | 🔴 Crisis B — Disease spike | See Section 4 |
| 3 | PHC Devgaon | 🔴 Crisis C — Staffing gap | See Section 4 |
| 4 | PHC Kishanpur | 🟡 Moderate — stock at 35%, trending down slowly | Watch, not flagged |
| 5 | PHC Amarganj | 🟡 Moderate — 1 bed short of capacity most days | Watch, not flagged |
| 6 | PHC Lalganj | 🟢 Healthy | Stable baseline |
| 7 | PHC Narayanpur | 🟢 Healthy | Stable baseline |
| 8 | PHC Chandpur | 🟢 Healthy | Stable baseline |
| 9 | PHC Bhagwanpur | 🟢 Healthy | Stable baseline |
| 10 | PHC Manikpur | 🟢 Healthy | Stable baseline |
| 11 | PHC Fatehganj | 🟢 Healthy | Stable baseline |
| 12 | PHC Govindpur | 🟢 Healthy | Stable baseline |

**Location fields:** you don't need real coordinates tonight. If Antigravity needs `location_lat`/`location_lng` for the map feature later, use any cluster of nearby fake coordinates (e.g. scattered within a 30km radius) — this is a day-9+ feature, not urgent.

---

## 3. Medicines (20 total)

Standard PHC essential-drug-list style, matches `Medicines` table (`name, category, unit, reorder_threshold`):

| # | Medicine | Category | Unit | Reorder Threshold |
|---|---|---|---|---|
| 1 | Paracetamol 500mg | Analgesic | strip | 50 |
| 2 | ORS Sachets | Rehydration | sachet | 100 |
| 3 | Amoxicillin 500mg | Antibiotic | strip | 40 |
| 4 | Ciprofloxacin 500mg | Antibiotic | strip | 40 |
| 5 | Metronidazole 400mg | Antibiotic | strip | 30 |
| 6 | Azithromycin 500mg | Antibiotic | strip | 30 |
| 7 | Iron & Folic Acid Tablets | Supplement | strip | 60 |
| 8 | Vitamin A Syrup | Supplement | bottle | 20 |
| 9 | Albendazole 400mg | Antiparasitic | tablet | 50 |
| 10 | Cough Syrup | Respiratory | bottle | 25 |
| 11 | Antacid Tablets | Gastro | strip | 40 |
| 12 | Oral Rehydration Salts (Paediatric) | Rehydration | sachet | 50 |
| 13 | Insulin (Human, Regular) | Diabetes | vial | 15 |
| 14 | Chloroquine (Anti-malarial) | Antimalarial | strip | 30 |
| 15 | Artemisinin Combination Therapy (ACT) | Antimalarial | strip | 30 |
| 16 | Anti-TB Drugs (Category I Kit) | TB Treatment | kit | 10 |
| 17 | Diazepam Injection | Sedative/Emergency | vial | 10 |
| 18 | Adrenaline Injection | Emergency | vial | 10 |
| 19 | Normal Saline IV | IV Fluid | bottle | 40 |
| 20 | Oxytocin Injection | Maternal Care | vial | 15 |

Every PHC gets stock entries for all 20 medicines — quantities vary per PHC per the scenarios below.

---

## 4. Crisis scenarios (the demo's hero moments — build these on purpose)

### 🔴 Crisis A — PHC Rampur — Medicine stock crisis
- **What's wrong:** Antibiotic stock (Amoxicillin, Ciprofloxacin) has declined sharply; now critically low.
- **Trend pattern (14 days):** Amoxicillin stock declines steadily — Day -14: 80 strips → Day -7: 45 strips → Day 0 (today): **8 strips** (below reorder threshold of 40). Ciprofloxacin follows a similar decline, Day -14: 70 → Day 0: **12 strips**.
- **Everything else at this PHC:** normal (patient load steady, staffing normal, beds normal) — this isolates stock as the *only* red flag, so it's obvious in the demo that the AI caught a specific, real problem.
- **Expected system behavior:** Priority score flags Rampur as high-urgency; Gemini recommendation should suggest a transfer of antibiotics from a well-stocked PHC (e.g. Lalganj or Narayanpur — make sure at least one healthy PHC has surplus Amoxicillin/Ciprofloxacin, e.g. 120+ strips, so a transfer recommendation is logically possible).

### 🔴 Crisis B — PHC Sitapur — Disease spike
- **What's wrong:** Fever and diarrhea cases have doubled in the last few days — potential outbreak signal.
- **Trend pattern (14 days), `DiseaseCases` table:**
  - Fever: flat around 4–6 cases/day from Day -14 to Day -5, then rises — Day -4: 8 → Day -3: 12 → Day -2: 18 → Day -1: 24 → Day 0: **28 cases**
  - Diarrhea: flat around 2–3 cases/day until Day -4, then similar rise to **15 cases** by Day 0
- **Everything else:** stock and staffing normal — isolates disease trend as the flag.
- **Expected system behavior:** Priority score flags Sitapur for outbreak risk; Gemini recommendation should mention possible water contamination/seasonal outbreak and suggest urgent medical team review — do NOT let Gemini invent a false certainty ("this is cholera") — the recommendation should stay in the range of "flag for investigation," not a diagnosis.

### 🔴 Crisis C — PHC Devgaon — Staffing gap
- **What's wrong:** The PHC's doctor has been absent for 4 consecutive days.
- **Trend pattern (14 days), `DailyReports` table:**
  - `doctor_present`: `true` from Day -14 to Day -5, then `false` for Day -4, Day -3, Day -2, Day -1, Day 0 (5 consecutive days of absence as of today)
  - `staff_available_count`: drops from 6 to 4 over the same window (`staff_required_count` stays at 6, so the gap is visible)
- **Everything else:** stock and disease trends normal.
- **Expected system behavior:** Priority score flags Devgaon for staffing risk; Gemini recommendation should suggest temporary doctor deployment from a nearby PHC with adequate staffing.

---

## 5. Moderate / watch PHCs (realism, not flagged as crisis)

- **PHC Kishanpur:** stock hovering around 35% across most medicines, slowly declining but not below threshold — should score as "moderate," not top-priority. Good for testing that your scoring engine has more than 2 tiers (not just "fine" vs "critical").
- **PHC Amarganj:** `beds_occupied` consistently 1 below `beds_total` (e.g. 19/20 occupied most days) — mild bed pressure, not a crisis.

---

## 6. Healthy baseline PHCs (7 total: Lalganj, Narayanpur, Chandpur, Bhagwanpur, Manikpur, Fatehganj, Govindpur)

- Stock: all medicines between 60–100% of a reasonable max (e.g. 60–120 units depending on medicine), flat or very slight natural fluctuation over 14 days
- Disease cases: flat, low, boring numbers (2–6 cases/day, no upward trend)
- Staffing: `doctor_present: true` every day, `staff_available_count` = `staff_required_count`
- Beds: `beds_occupied` comfortably below `beds_total` (e.g. 12/20)
- **Important:** give **Lalganj and Narayanpur specifically** healthy surplus stock of Amoxicillin and Ciprofloxacin (120+ strips each) — these become the "transfer FROM" PHCs when the DHO approves Rampur's stock transfer recommendation. Don't leave this to chance; if no PHC has surplus, your transfer demo has nowhere to pull stock from.

---

## 7. Test availability data (`TestAvailability` table)

Keep this simple — for all 12 PHCs, mark these as generally `available: true`, except make **2 healthy PHCs** (e.g. Chandpur, Manikpur) missing one test each (e.g. X-ray unavailable) so the Test Availability Audit screen has *something* to show besides all-green:

```
Tests per PHC: CBC, X-ray, Malaria Rapid Test, Blood Sugar, Urine Routine
Chandpur: X-ray → available: false
Manikpur: Malaria Rapid Test → available: false
All others: all tests → available: true
```

---

## 8. Demo login accounts (4 total)

Same password across all for hackathon simplicity — do not overthink security here.

```
dho@xema.demo           — District Health Officer (district-wide, no phc_id)
mo.rampur@xema.demo     — Medical Officer, assigned to PHC Rampur
pharmacist.rampur@xema.demo — Pharmacist, assigned to PHC Rampur
mp@xema.demo            — Member of Parliament (district-wide, read-only, no phc_id)

Password (all 4): Xema@2026
```

**Why Medical Officer + Pharmacist are both assigned to Rampur specifically:** this lets you demo the full Crisis A story end-to-end through ONE PHC's login — log in as Rampur's Pharmacist, show the low stock, log in as DHO, show the AI flagged it and approve a transfer, log in back as Pharmacist, confirm receipt. Clean, coherent demo narrative instead of jumping between random PHCs.

*(Optional, only if you have time: add a second Medical Officer/Pharmacist pair for Sitapur or Devgaon, so you can also walk through Crisis B or C live if a judge asks "show me another example." Not required for the core demo.)*

---

## 9. What to hand Antigravity tomorrow

Give it, in this order:
1. `smart-health-platform-spec.md`
2. This doc (`xema-seed-data-plan.md`)
3. Instruction: *"Write `scripts/seed.ts` that populates Firestore with this exact data — 12 PHCs, 20 medicines, 14 days of historical DailyReports/DiseaseCases/Inventory per PHC following the trend patterns described, and the 4 demo user accounts in Firebase Auth + a matching Users collection doc for each."*

That's the whole handoff — nothing left to interpret on the fly.
