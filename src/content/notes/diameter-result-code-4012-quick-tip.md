---
title: "Diameter Result-Code 4012 in 10 Seconds"
pubDate: 2026-08-19
tags: ["Diameter", "OCS", "Troubleshooting", "Result-Code"]
source: "telegram"
---

Quick one from a Telegram question today:

**Result-Code 4012 = DIAMETER_CREDIT_LIMIT_EXCEEDED**

This is the OCS telling the PGW/UGW: *"this subscriber has no credit left."* It's not a fault — it's a business decision.

What to check:
- Is it **all** subscribers or just one? → If all: OCS balance pool exhausted or rating config broken.
- Just one? → Subscriber out of quota. Normal for prepaid.
- Comes back right after top-up? → Working as designed.

Wireshark filter to isolate it:
```
diameter.result_code == 4012
```

Don't waste time on GTP tunnels when the OCS already said "no money." Check the result-code first.
