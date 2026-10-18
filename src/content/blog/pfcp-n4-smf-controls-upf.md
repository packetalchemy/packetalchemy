---
title: "PFCP on N4: How the SMF Really Controls the UPF"
description: "The session is up in the SMF, but the UPF drops everything. PFCP is the only channel between them — and most outages are a missing or mismatched rule, not a protocol failure."
pubDate: "2026-10-18"
tags: ["5G Core", "PFCP", "SMF", "UPF", "N4"]
---

# PFCP on N4: How the SMF Really Controls the UPF

The session is up in the SMF, but the UPF drops everything. Where is the
problem?

In 5G Core, the answer is almost always the same: the SMF and the UPF
disagree about the rules. The SMF thinks it told the UPF what to do. The
UPF never got the message — or got a rule it cannot enforce. The protocol
that carries those rules is PFCP, running on the N4 reference point
between SMF and UPF.

## The split: control thinks, user plane enforces

5G Core separates control from forwarding. The SMF owns session logic:
which subscriber, which QoS, which charging. The UPF owns packets: it
matches them, forwards them, drops them, measures them. Neither can do
the other's job, and PFCP is the only channel between them.

PFCP is defined in 3GPP TS 29.244. The same protocol also runs on Sx in
EPC CUPS, between the control and user plane parts of SGW and PGW. If
you understand PFCP on N4, you understand CUPS too.

## The five rules

A PFCP session is a set of rules. The UPF installs them and enforces
them without further signalling, per packet, in real time.

**PDR — Packet Detection Rule.** Identifies traffic. Match criteria
include the F-TEID (the GTP-U tunnel endpoint), SDF filters, source
interface (access vs core side), and UE IP address. If no PDR matches, the
packet has no rule — and an unmatched packet is a dropped packet.

**FAR — Forwarding Action Rule.** Decides what happens to matched
packets: forward to a destination interface, drop, buffer, or duplicate.
The FAR carries the outer header creation info — the F-TEID the UPF must
stamp on outgoing GTP-U packets.

**QER — QoS Enforcement Rule.** Bitrate limits, gating (open/closed),
and marking (DSCP). This is where a 5QI or QoS profile becomes real
forwarding behavior.

**URR — Usage Reporting Rule.** Measures volume, time, or events for
charging. The UPF reports usage back to the SMF when thresholds are hit
or the session ends.

**BAR — Buffering Action Rule.** Buffering behavior, for example while
the UE is being paged. Buffered packets are delivered when the UE
becomes reachable, or dropped when the buffer expires.

## The session lifecycle

**Establishment.** When a PDU session is created, the SMF sends a PFCP
Session Establishment Request carrying the full rule set. The UPF
allocates resources, assigns its F-TEID, and answers. From that moment,
forwarding is the UPF's job.

**Modification.** Sessions evolve. A handover changes the path, a new QoS
flow appears, a charging event fires. The SMF sends a PFCP Session
Modification Request with updated rules. The UPF swaps them in — live,
without dropping the session.

**Deletion.** At session end, the SMF sends a PFCP Session Deletion
Request. The UPF releases the rules and sends final usage reports from
its URRs. If those reports are lost, charging has a gap.

**Node level.** Beyond sessions, PFCP carries heartbeats (node
liveness), node reports (the UPF telling the SMF about events such as
user-plane path failure), and association setup/release (the SMF–UPF
relationship itself).

## Troubleshooting: the rule-mismatch pattern

Most PFCP outages follow one pattern: a missing or mismatched rule.

- **Session up, no traffic.** Check whether the UPF actually installed
  the PDR and FAR. A missing or mismatched F-TEID in the PDR is one of
  the most common silent failures: the session exists, the radio is
  fine, and every packet is dropped.
- **Traffic flows, then stops after handover.** A stale FAR still points
  at the old path. The modification that should have updated it never
  arrived or was rejected.
- **QoS not enforced.** The QER is missing, or it does not match the
  QoS profile the SMF thinks it applied.
- **Charging gaps.** The URR was never installed, or usage reports were
  lost on session deletion.
- **Mass session loss.** Heartbeat loss makes the SMF mark the UPF down
  and re-select — tearing down sessions that were still healthy.

The diagnostic habit: correlate the SMF's view (which rules it sent)
with the UPF's view (which rules are installed). When they differ, you
have found the fault.

## Takeaway

The SMF thinks in rules, the UPF enforces them. Most PFCP outages are
a missing or mismatched rule, not a protocol failure.

---

*Related: [Gy Interface Deep Dive](/blog/gy-interface-deep-dive) · [Hands-On Lab: Attach OK, No Data](/notes/scenario-attach-no-data) · [Learning Paths](/learning-paths) · [نسخه فارسی](/fa/pfcp-n4)*
