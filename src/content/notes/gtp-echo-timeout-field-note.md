---
title: "GTP-C Echo Timeout: The Silent Killer of User Plane Sessions"
pubDate: 2026-07-22
tags: ["GTP", "Troubleshooting", "UGW", "Path Failure"]
source: "field"
---

Spent the morning chasing a phantom "no internet" complaint on a UGW9811 node. Users could attach, get an IP, but data stalled after ~30s.

The culprit? **GTP-C Echo (Path Failure Detection)**.

Here's what was happening:
- SGW → PGW Echo Request every 60s
- PGW answered fine for 3 cycles, then went silent
- After 3 missed echoes (N3 retry), PGW declared the path DOWN
- All GTP-U tunnels on that path got torn down → session reset

**Fix:** the PGW's loopback interface had a flapping route. One `display gtp path` + a static host route later, echoes are clean.

**Lesson:** when users "connect but can't browse," don't jump to APN or AAA. Check `display gtp echo-statistics` first — 80% of the time it's path-level, not session-level.

Quick filter if you're in Wireshark:
```
gtpv2c.message_type == 1 || gtpv2c.message_type == 2
```
(1 = Echo Request, 2 = Echo Response)

Zero responses = your path is dead. Simple as that.
