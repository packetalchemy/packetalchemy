---
title: "Understanding GTP-C Signaling in PS Core Networks"
description: "A deep dive into GTP-C (GPRS Tunneling Protocol - Control Plane) signaling, message flows, and troubleshooting in Huawei PS Core equipment."
pubDate: "2026-07-08"
tags: ["GTP", "PS Core", "Huawei", "Signaling", "Troubleshooting"]
---

# Understanding GTP-C Signaling in PS Core Networks

## What is GTP-C?

The **GPRS Tunneling Protocol - Control Plane (GTP-C)** is one of the most critical signaling protocols in mobile packet-switched networks. It runs over **UDP port 2123** and is responsible for creating, modifying, and deleting GTP tunnels between network elements.

In a typical Huawei PS Core deployment, GTP-C operates between:

- **UGW (Universal Gateway)** — the user plane gateway
- **USN (User Support Node)** — session management
- **CG (Charging Gateway)** — online/offline charging coordination
- **SGSN/MME** — mobility management

## Key GTP-C Message Types

| Message | Code | Purpose |
|---------|------|---------|
| Echo Request | 1 | Path management — keepalive |
| Echo Response | 2 | Response to echo |
| Create PDP Context Request | 16 | Establish a PDP context (2G/3G) |
| Create PDP Context Response | 17 | Accept/reject PDP creation |
| Update PDP Context Request | 18 | Modify existing PDP context |
| Delete PDP Context Request | 20 | Tear down PDP context |
| Create Session Request | 32 | **LTE** — Establish EPS bearer |
| Create Session Response | 33 | Accept/reject session creation |
| Modify Bearer Request | 34 | Modify bearer parameters |
| Delete Session Request | 36 | Delete EPS bearer |

## Typical Create Session Flow (LTE)

Here's the standard flow for a UE attaching to the network:

```
UE → eNodeB → MME → SGW → PGW/UGW

1. MME sends Create Session Request to SGW
   - IMSI, MEI, RAT type, APN, PDN type
   - Bearer QoS, Teid (S11)

2. SGW forwards to PGW/UGW
   - Adds S5/S8 specific IEs
   - PGW allocates IP address (if not static APN)

3. PGW/UGW responds with Create Session Response
   - Cause = Request Accepted
   - PDN Address Allocation (IP)
   - Bearer ID, TEID for user plane
   - APN-AMBR (Aggregate Maximum Bit Rate)

4. SGW forwards response to MME
   - MME updates location with HSS
   - MME sends Modify Bearer to SGW with eNodeB TEID
```

## Common GTP-C Issues in Huawei PS Core

### 1. Create Session Failure — Cause #26 (Insufficient Resources)

```
Symptom: UGW rejects Create Session Request
Root cause: APN configuration limits exceeded
Fix: Check APN profile on UGW — max sessions, PDN type
```

### 2. PDP Context Deactivation — Cause #36 (Regular Deactivation)

```
Symptom: Unexpected session teardown
Root cause: Inactivity timer expiry on UGW
Fix: Review inactivity timer values in APN profile
```

### 3. Echo Timeout — Path Management Failure

```
Symptom: GTP tunnel becomes stale, traffic drops
Root cause: Echo Request/Response not working
Fix: Verify UDP 2123 reachability between nodes
```

## Wireshark Filter Tips for GTP-C

```bash
# All GTP-C messages
gtp

# Only Create Session messages
gtp.msg_type == 32 || gtp.msg_type == 33

# Filter by IMSI
gtpv2.imsi == "0010112345678"

# Filter by APN
gtpv2.apn == "internet"

# GTP-C errors
gtpv2.cause_value != 16
```

## Huawei-Specific Debugging

On Huawei UGW/USN, use these commands:

```bash
# Display GTP-C statistics
display gtp statistics

# Display active PDP contexts
display gtp pdp-context all

# Debug GTP-C messages
debugging gtp message all

# Display GTP peers
display gtp peer
```

## Summary

Understanding GTP-C is fundamental for any PS Core engineer. Whether you're troubleshooting a failed session creation or optimizing bearer setup times, knowing the message flows and common failure modes will save hours of debugging.

---

*Next article: [Understanding Diameter Signaling in LTE Charging](/blog/diameter-signaling-lte-charging)*
