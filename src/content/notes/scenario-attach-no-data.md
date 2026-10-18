---
title: "Hands-On Scenario: Attach OK, No Data"
pubDate: "2026-10-18"
tags: ["Lab", "Troubleshooting", "EPC", "DNS", "Gy", "PFCP"]
source: "field"
---

## 🎯 Scenario

A subscriber attaches successfully and gets an IP address. Signal is
good. But no application works: no browsing, no messaging, no ping
replies. The radio team says "radio is fine". It is your case.

## 📋 Symptoms (given)

- Attach Accept received, default bearer is up.
- UE has an IP address from the PGW.
- Downlink and uplink packet counters on the UPF are near zero.
- No attach rejects, no alarms on the MME.
- Other subscribers on the same eNodeB work fine.

## 🔍 Investigation Steps

Work in order. Do not skip ahead.

### Step 1 — Confirm the bearer is really up

Check the default bearer in the MME and SGW. Is it Active, or stuck in
a transitional state? Which APN did the UE actually get?

### Step 2 — Check DNS

From the UE's perspective: does DNS resolve? Query the APN's DNS
records (NAPTR/SRV) from the MME side. A failed, stale, or wrong APN
DNS record is the classic "full bars, zero data" fault.

### Step 3 — Check the PGW and charging

Is the session alive in the PGW? Did the OCS answer the Gy CCR, or is
the session blocked on credit (Result-Code 4012)? Check the Gy
exchange and the FUI action if quota is exhausted.

### Step 4 — Check the user plane path

In the UPF (or SGW-U/PGW-U): are the PDR/FAR rules installed for this
session? Is the F-TEID in the PDR correct? A missing or mismatched
F-TEID drops packets silently.

### Step 5 — Check policy

Did the PCRF/PCF return a policy that gates or blocks this APN or
subscriber? Compare the policy the SMF/PGW received with what is
enforced.

## ❓ Questions

1. At which step did the chain break, and what evidence proves it?
2. If DNS is the fault, what exactly is wrong: missing record, stale
   record, or wrong priority?
3. If Gy is the fault, what did the OCS answer, and what should the
   PGW do with the bearer?
4. If PFCP is the fault, which rule is missing or mismatched?

## ✅ Answer Key

- **Most likely fault:** DNS APN resolution (Step 2) or Gy credit
  block (Step 3). Both produce "attach OK, no data" with a clean
  radio picture.
- **DNS evidence:** the MME's APN lookup fails, returns a stale
  record, or points at a decommissioned PGW.
- **Gy evidence:** CCA with Result-Code 4012, or FUI = Terminate /
  Redirect. If FUI is Redirect, the UE should reach the top-up
  server and nothing else.
- **PFCP evidence:** session exists in the SMF but the UPF has no
  matching PDR/FAR, or the F-TEID is wrong. Fix: re-establish or
  modify the PFCP session with correct rules.
- **Rule:** find the first step that broke. Everything after it is
  noise.

## 🧠 PacketAlchemy Note

"Attach OK, no data" is not one fault. It is a symptom with at
least four different causes. The skill is not knowing the answer —
it is working the chain in order until the first break appears.

---

*Related: [PFCP on N4: How the SMF Really Controls the UPF](/blog/pfcp-n4-smf-controls-upf) · [Gy Interface Deep Dive](/blog/gy-interface-deep-dive) · [Learning Paths](/learning-paths) · [Source notes on GitHub](https://github.com/packetalchemy/packetalchemy-telecom-notes)*
