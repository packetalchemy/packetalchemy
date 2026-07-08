---
title: "Wireshark Filters Every PS Core Engineer Should Know"
description: "Essential Wireshark display filters for troubleshooting GTP, Diameter, PFCP, and common PS Core signaling issues."
pubDate: "2026-07-06"
tags: ["Wireshark", "PS Core", "Troubleshooting", "Packet Analysis"]
---

# Wireshark Filters Every PS Core Engineer Should Know

## Why Wireshark?

Wireshark is the single most powerful tool in a PS Core engineer's arsenal. Whether you're debugging a failed PDP context activation or tracing a Diameter CCR timeout, the right filter saves hours of manual packet inspection.

## Essential Filters by Protocol

### GTP-C (Control Plane)

```bash
# All GTP messages
gtp

# GTP-C only (exclude GTP-U user plane)
gtpv2

# Create Session Request/Response
gtpv2.msg_type == 32 || gtpv2.msg_type == 33

# Filter by IMSI
gtpv2.imsi == "0010112345678"

# Filter by APN name
gtpv2.apn == "internet"

# GTP-C errors (non-zero cause)
gtpv2.cause_value != 16
```

### GTP-U (User Plane)

```bash
# User plane tunnel traffic
gtpu

# Specific TEID
gtpu.teid == 0x12345678

# Traffic from specific UE IP
ip.addr == 10.0.0.5 && gtpu
```

### Diameter

```bash
# All Diameter messages
diameter

# CCR (Credit Control Request/Answer)
diameter.cmd.ccr

# Only Diameter errors
diameter.result_code != 2001

# Filter by Application-Id
diameter.application_id == 16777238  # Gx
diameter.application_id == 4         # Common Charging

# Filter specific AVP
diameter.avp 3/1 = "internet"  # APN AVP
```

### PFCP (5G Core)

```bash
# All PFCP messages
pfcp

# Session Establishment Request
pfcp.msg_type == 1

# PFCP errors
pfcp.cause != 1
```

### Combined Filters

```bash
# UE attach flow: GTP + Diameter together
(gtpv2 || diameter) && ip.addr == 192.168.1.100

# All signaling (exclude pure user plane)
gtpv2 || diameter || pfcp || s1ap || ngap

# Time window for specific incident
frame.time >= "2026-07-06 10:00:00" && frame.time <= "2026-07-06 10:05:00"
```

## Pro Tips

### 1. Follow the Stream

Right-click any packet → Follow → TCP/UDP Stream. This is invaluable for seeing the full Diameter or GTP-C conversation in human-readable form.

### 2. Coloring Rules

Create custom coloring rules for critical protocols:
- GTP-C errors → **Red background**
- Diameter CCR → **Blue background**
- PFCP → **Green background**

### 3. Statistics → Flow Graph

Generate a sequence diagram from any conversation:
- Statistics → Flow Graph
- Select the conversation you want
- Generates a visual message flow

### 4. Export Filtered Packets

After filtering down to the problem packets:
- File → Export Specified Packets
- Save as `.pcap` for documentation

---

*Back to: [Understanding GTP-C Signaling](/blog/gtp-c-signaling-ps-core)*
