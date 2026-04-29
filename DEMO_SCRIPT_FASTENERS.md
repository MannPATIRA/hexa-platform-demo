# Demo Script — Hexa for OEM-Industrial Fastener Distributors

**Audience:** Owner / GM / VP of Operations at an OEM-industrial fasteners distributor (auto, ag, off-highway, machinery, HVAC).

**Run time:** 20 minutes (extendable to 30).

**Pre-flight checklist:**
- Both servers running: `hexa-platform-api` (port 4000) and Next.js (port 3000).
- Hard-refresh the browser to pick up the latest data.
- Confirm sidebar shows: Call Tracker → Sales → Procurement → Claims → Suppliers → Finance → Customer Service.
- Sign-in avatar is "James Morrison — Sales Manager".

---

## 60-Second Opener

> "Most of what stops a fastener distributor from growing isn't sales. It's the operations tax — Kanban call-offs that don't trigger, AP teams reconciling 200 short-shipped bulk-box invoices a week, AR chasing 800 small overdue invoices a month, customer-service reps untangling wrong-grade RMAs, and supplier credits left on the table because nobody has time to file the OTIF claim. Hexa is one operating system that runs all of that on autopilot. I'll show you the front-of-house first — RFQ to quote — and then we'll go upstream and downstream."

---

## Run-of-Show (20 min)

| # | Time | Module | What you click |
|---|------|--------|----------------|
| 1 | 0–3 | Call Tracker | `call-1` David Patterson, Apex Seating |
| 2 | 3–6 | Sales / Orders | `ORD-2026-0052` Apex blanket release |
| 3 | 6–10 | Procurement | List view → `pi-001` M8 flange bolt → `pi-012` Huck rivets |
| 4 | 10–13 | Finance / AP | `ap-inv-001` Brighton-Best short-ship → `ap-inv-002` TR Fastenings price mismatch |
| 5 | 13–15 | Finance / AR | `ar-inv-001` Apex PPAP fee dispute |
| 6 | 15–17 | Customer Service | `tkt-010` counterfeit suspicion → `tkt-012` PPAP rejection → `tkt-015` Kanban failure |
| 7 | 17–19 | Claims | List view → `opp-1` (Brighton-Best OTIF) → `opp-6` (Würth PPAP PPM) |
| 8 | 19–20 | Wrap | "Three modules to start, full platform in 90 days" |

---

## Module-by-Module Talk Track

### 1. Call Tracker — `/calls/call-1`

**What's on screen:** David Patterson (Apex Seating Group, tier-1 auto seating) calls in with a 5-line fastener restock. AI listens live, extracts SKUs, validates against catalog.

**Talk track:**
> "Most fastener orders still come in by phone. Watch — David rattles off five line items: M8 flange bolts, conical washers, M10 SHCS, F436 washers, A325 TC-bolts. The system pulls the SKUs from your catalog as he speaks, sees the line he says needs PPAP and 3.1 mill certs, and routes that line to engineering automatically. By the time the call ends, James has a Q-number quote draft on his screen. **Your inside-sales team gets back two hours per rep per day.**"

**Things to point at:**
- Highlights in the transcript (yellow chips on prices and SKUs).
- The "Specs" field on item 3 (SHCS) showing "PPAP package + EN 10204 3.1 mill cert required".
- AI confidence bars (96-98%).

### 2. Sales / Orders — `/orders` → `ORD-2026-0052`

**What's on screen:** Apex Seating Q2 blanket release. PDF parsed into 5 lines with mixed match status: confirmed, partial (length not specified), conflict (HDG vs zinc), unmatched (M10 fine thread not stocked), confirmed with PPAP requirement.

**Talk track:**
> "Same email parsing, but for written RFQs. Real RFQs from your customers are messy — handwritten, abbreviated, sometimes contradictory. Watch how the system handles each line: line 1 is clean, line 2 it flags because the customer didn't specify a length, line 3 it sees the customer asked for HDG but the standing blanket is zinc — manual review. Line 4 it can't match because we don't stock M10 fine thread. Line 5 it routes to engineering for the PPAP package. **Your rep clicks through this in two minutes instead of forty.**"

**Things to point at:**
- The "Match Status" badges (Confirmed / Partial / Conflict / Unmatched).
- The issues list on the conflict line (HDG vs zinc).
- The PPAP/mill-cert note on the SHCS line.

### 3. Procurement — `/procurement` → `pi-001` → `pi-012`

**What's on screen:** Stock-out alerts ranked by line-side risk. Click into M8x25 flange bolt (line-side critical) to see Brighton-Best vs Earnest supplier comparison + co-order pattern (87% co-order with M8 flange nut).

**Talk track:**
> "These are the SKUs that are about to stop your customer's line. Three top items here: M8 flange bolt going line-side at Apex Wabash, Huck BOM rivet on a 12-week container reorder cycle, M6 washer dropping below safety stock. Click M8 flange bolt — you see Brighton-Best is the primary at $0.18 per unit, 5-day lead, 97% on-time — and Earnest is the backup. The system already noticed that 87% of the time you order M8 flange bolts, you also order M8 flange nuts — so it's pre-staged that as a bundle. Click Huck rivet — 12-week container lead time, sole-source from Arconic via Kanebridge, system has already started the next forward order. **This is continuous line-side risk monitoring, not a Kanban board.**"

**Things to point at:**
- Days-of-stock-remaining (red/amber/green pills).
- The supplier-history table showing reliability scores.
- Co-order patterns under "Frequently Bundled".
- Active RFQ status on `pi-002` (M10 SHCS — 2 quotes back from Bossard and Würth, evaluating).

### 4. Finance / AP — `/finance/payable` → `ap-inv-001` → `ap-inv-002`

**What's on screen:** AP queue with 12 invoices, 4 in exception state. Click bulk-pack short-ship (Brighton-Best M6 washer boxes) and price-mismatch (TR Fastenings zinc surcharge).

**Talk track ap-inv-001:**
> "Brighton-Best invoiced 10 boxes of M6 zinc washers — 100,000 washers — but the receiver only counted 8 boxes on the dock. The system caught it, drafted the supplier query email, and is holding the invoice from approval. Notice it also flagged that this is the third bulk-box short-ship from Brighton-Best in 90 days — it's surfacing a pattern the AP clerk would never catch. **At your volume that's somewhere between $50k and $200k a year you're not paying for goods you didn't receive.**"

**Talk track ap-inv-002:**
> "TR Fastenings UK passed an unannounced zinc surcharge on the M10 Grade 10.9 hex bolts — £0.42 per unit went to £0.48. Per your blanket agreement, they're required to give 30 days notice on a zinc-index pass-through. The system pulled the contract clause, drafted the dispute email with the last 6 invoices as evidence, and James sent it. Saving £1,500 on this single invoice."

**Things to point at:**
- The 3-way match diff line (PO qty × price ↔ Invoice qty × price ↔ GRN qty).
- The supplier-history-checked agent timeline event.
- The auto-drafted clarification email body.

### 5. Finance / AR — `/finance/receivable` → `ar-inv-001`

**What's on screen:** Apex Seating disputed M8 flange bolt blanket invoice — $15,115. Two voice calls logged with full transcript, partial dispute on $850 PPAP package fee.

**Talk track:**
> "The voice agent already placed two calls — listen to either one — first to log a promise-to-pay, second when the promise broke and Adam raised the dispute on the PPAP fee. The system extracted from the transcript: dispute amount $850, dispute reason 'PPAP package fee not on original part-price agreement'. The rest of the invoice — $14,265 — is cleared for partial payment this week, and James has a draft going back with the signed PPAP service quote attached. **Fastener distributors run hundreds of small invoices a month — exactly where AR automation pays off. We typically see DSO drop 7 to 12 days.**"

**Things to point at:**
- The voice-call evidence chips ("Listen — 2m 22s").
- The follow-up sequence (email day 0 → reminder day 35 → firmer reminder day 42 → voice call → 2nd voice call with dispute).
- The auto-extracted dispute reason at 96% confidence.

### 6. Customer Service — `/support` → `tkt-010` → `tkt-012` → `tkt-015`

**What's on screen:** Support inbox with 15 tickets across auto-resolved / awaiting-approval / escalated.

**Talk track:**
> "These are the eight tickets your CSRs deal with every day. Five auto-resolved in under 60 seconds because the system has live order data and pricing tiers. Show me one in each lane:"

**Pick three to demo:**

- **`tkt-010` Counterfeit suspicion (escalated):**
  > "Customer ran hardness tests on a Pacific Rim batch of Grade 8 hex bolts and found counterfeit head markings — only 4 of 6 radial lines, hardness in the Grade 5 range. The system pulled the supplier history (2 prior counterfeit flags this year), opened the supplier investigation, quarantined remaining stock, and flagged the other three customers who got the same batch for proactive recall outreach. **This is the kind of thing that loses you a customer if it leaks — caught in 30 seconds.**"

- **`tkt-012` PPAP rejection (escalated):**
  > "Apex's quality team rejected the PPAP submission on the M10 SHCS Detroit-program launch — Cpk 1.15 vs spec 1.33 on head-marking depth. Line ramp is 10 days away. The system already mapped three rerun options: Bossard 14 days (too slow), Würth 7 days, Cardinal Fastener 5 days at premium. Drafted a recovery plan to send to Apex preempting the liquidated-damages threat. **You don't lose the program.**"

- **`tkt-015` Kanban replenishment failure (in progress):**
  > "Apex's Kanban card on the M8 flange bolt didn't trigger. Bin at 12%, no PO came in, line stops in 36 hours. System flagged it, cued procurement to audit the EDI 850 trigger config, and queued a same-day expedite of 5,000 units at our cost. **Customer doesn't even know there was a problem.**"

### 7. Claims (Supplier SLA) — `/claims` → `opp-1` → `opp-6`

**What's on screen:** 10 supplier credit opportunities. Total recoverable in view ~$15-20k.

**Talk track:**
> "On a $40M fastener book you're leaving $200-400k a year in supplier credits on the table because nobody has time to file the OTIF claim. The system continuously monitors against your blanket-agreement SLAs and surfaces every breach with the timeline of evidence pre-attached. Click `opp-1`: Brighton-Best M8 flange bolt blanket — 12 days late, 5% credit, $1,250. Click `opp-6`: Würth PPAP shoulder-bolt batch came back at 850 PPM versus 200 spec — Apex rejected the lot, you're owed $3,840. The system writes the claim email with the timeline-of-evidence pre-attached. **Your buyer reviews and clicks send.**"

**Things to point at:**
- Recommendation badges (Claim / Auto-Close / Review).
- The rationale list — including the "do not claim" cases where buyer-caused or below-threshold.
- The full timeline of events on each opportunity.

---

## Anticipated Objections — Quick Answers

| Objection | Response |
|---|---|
| "We already have an ERP" | Hexa sits on top of your ERP. We pull POs, GRNs, invoices via the same connectors, but the value is what we do with that data — agentic email parsing, voice agents, auto-drafted exception emails, and 24/7 watch on every metric. ERPs don't do any of that. |
| "Our reps know our customers — AI will sound robotic" | The agent drafts; James sends. You see the email body before it goes out. The tone is calibrated to the relationship — high-DSO accounts get firmer, top-20 accounts get softer. We can also turn off auto-send entirely on any module. |
| "What about counterfeit/safety-critical parts? We can't have AI deciding" | Look at the escalation lane in customer service. Anything outside SOP is held for a human. The agent's job is to brief the human, not replace them. The goal is to give you 80% of your day back from the routine 80% of tickets so you can focus on the hard 20%. |
| "Our PPAP and 3.1 cert handling is too custom" | Show the SHCS line in the call tracker (line 3) and the procurement page for `pi-007` — PPAP packages are first-class. We attach docs to the line item and route to QA on receipt. Custom PPAP fees show up on AR invoices and the dispute flow handles them like the Apex case. |
| "We've been burned by AI integrations before" | Phase one is read-only — we shadow your processes for 30 days, you compare the agent's drafts against what your team actually sent. Phase two we turn on auto-send for the lowest-confidence-tier tickets only. Phase three we expand. You always have the kill switch. |
| "What does it cost?" | Pricing is per-seat plus a transaction fee on auto-handled events. For a $40M-revenue distributor, ROI is typically 6-9x in year one — heavy on AP recovery, AR DSO improvement, and customer-service deflection. We can scope it on the next call. |

---

## "Skip These" — Edges that still don't fully fit

A few residual non-fastener references remain on lighter list rows that we don't intend to demo. If the prospect notices them, the answer is "this demo data is being trimmed for your industry — final config will be 100% your catalog and customer mix."

- **Orders module:** `ord-call-3` (Raj Patel / Thornton Supplies — Leeds) still lists copper tube and brass compression fittings on lines 3 and 4. `ord-call-4` (Emily Watson / Barton Logistics) still has steel angle, anti-vib mounts, hose clamps, cable ties, cutting fluid. `ord-call-5` (Marcus O'Brien / Greenfield Parts — Bristol) still has D2 tool steel blank. `ord-003` (Topline Hardware) still shows brass hinges, drawer slides, cabinet knobs. `ord-demo-bom-001` (Meridian Engineering) still shows valves, pumps, and brass fittings in BOM components. **Don't click into these — stay on the top of the list.**
- **Customer Service module:** Tickets `tkt-006`, `tkt-007`, `tkt-014` are already fastener-aligned. Tickets `tkt-011`, `tkt-013` were rewritten. The remaining `tkt-016`+ entries you'll usually never get to — list scroll-off.
- **Finance / AP:** Invoices `ap-inv-007` through `ap-inv-012` had supplier names auto-mapped but currency / ship-to / agent-timeline emails on the lighter rows still reference legacy locations. Stay on `ap-inv-001`/`002`/`003`/`004`/`005`/`006`.
- **Finance / AR:** Invoices `ar-inv-003` through `ar-inv-012` had customer names mapped but ship-to / bill-to addresses on lighter rows are legacy. Stay on `ar-inv-001` and `ar-inv-002`.
- **Storefront `/storefront`:** Categories are fastener-only. Featured products are correct. The non-fastener catalog entries are still in `skuCatalog` but don't surface because they're filtered out by category. Safe to demo end-to-end.
- **Suppliers list (sidebar):** Now uses the SLA suppliers list which has been re-tailored. Each supplier deep-page renders from the same `slaSuppliers` data, so it's safe to expand the sidebar group and click any supplier.

---

## Closing — 60 seconds

> "Three things to take away. One: every module is fastener-distributor-native — Brighton-Best, Würth, TR Fastenings, Pacific Rim, mill certs, PPAP, Kanban, OTIF claims. Two: the AI doesn't replace your team, it removes the repetitive 80% so they can focus on the hard 20%. Three: ROI is heaviest on AP exception recovery, AR collections, and supplier-credit reclaim — we'd run a 30-day shadow pilot before turning on any auto-send so you can validate the math against your own data. Want me to put a pilot proposal together?"
