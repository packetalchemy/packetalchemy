---
title: "Diameter Signaling in LTE Charging: Gx, Gy, and OCS Deep Dive"
description: "Complete guide to Diameter protocol usage in LTE networks — Gx interface for policy control, Gy for online charging, and OCS integration."
pubDate: "2026-07-07"
tags: ["Diameter", "LTE", "Charging", "OCS", "Policy Control"]
---

# Diameter Signaling in LTE Charging

## Introduction

The **Diameter protocol** is the backbone of authentication, authorization, and charging (AAA) in LTE networks. It replaced the legacy RADIUS protocol and provides more robust features including reliable transport, peer-to-peer communication, and extensible AVPs (Attribute-Value Pairs).

In Huawei PS Core networks, Diameter is used across multiple interfaces:

- **Gx** — Between PGW/UGW and PCRF (Policy and Charging Rules Function)
- **Gy** — Between PGW/UGW and OCS (Online Charging System)
- **S6a** — Between MME and HSS (Home Subscriber Server)
- **S13** — Between MME and EIR (Equipment Identity Register)

## Diameter Message Structure

Every Diameter request and response follows this structure:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         Version (1)                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Message Length                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| Command Flags |                  Command Code                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Application ID                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Hop-by-Hop ID                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        End-to-End ID                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          AVPs ...                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

## Gx Interface — Policy & Charging Control

The **Gx interface** connects the **PGW/UGW** to the **PCRF**. It's responsible for:

1. **Policy decisions** — QoS rules, bandwidth limits
2. **Charging rules** — How to charge for specific services
3. **Traffic detection** — Deep packet inspection rules

### Key Messages

| Command | Code | Direction | Purpose |
|---------|------|-----------|---------|
| CCR (Credit Control Request) | 272 | PGW → PCRF | Report usage, request rules |
| CCA (Credit Control Answer) | 272 | PCRF → PGW | Provide charging/policy rules |
| RAR (Re-Auth-Request) | 258 | PCRF → PGW | Push new rules (push mode) |
| RAA (Re-Auth-Answer) | 258 | PGW → PCRF | Acknowledge rule change |

### Typical Gx Flow

```
UE → PGW/UGW → PCRF

1. UE attaches, PGW sends CCR-I (Initial)
   - Session-Id, Subscription-Id (IMSI)
   - Framed-IP-Address
   - Called-Station-Id (APN)

2. PCRF responds with CCA-I
   - Charging-Rule-Definition
   - QoS-Information (QCI, ARP, MBR/GBR)
   - Flow-Description (IP filters)

3. UE makes data connection → PGW sends CCR-U (Update)
   - Used-Service-Unit (bytes used)
   - Rating-Group

4. PCRF responds with CCA-U
   - Updated rules (if policy changed)
```

## Gy Interface — Online Charging

The **Gy interface** connects the **PGW/UGW** to the **OCS**. It implements **online credit control** — meaning the network checks if the user has credit BEFORE allowing data usage.

### Key Messages

| Command | Code | Direction | Purpose |
|---------|------|-----------|---------|
| CCR (Credit Control Request) | 272 | PGW → OCS | Request quota |
| CCA (Credit Control Answer) | 272 | OCS → PGW | Grant/deny quota |

### Gy Flow — Quota Management

```
PGW/UGW → OCS

1. CCR-I (Initial): Request credit for new session
   - Requested-Service-Unit (RSU)
   - Used-Service-Unit (USU) = 0
   - Service-Context-Id

2. CCA-I: OCS grants initial quota
   - Granted-Service-Unit (GSU)
   - Result-Code = 2001 (SUCCESS)

3. PGW tracks usage → CCR-U when quota low
   - Used-Service-Unit = bytes consumed
   - Requested-Service-Unit = additional quota

4. CCA-U: OCS grants more quota
   - Or Result-Code = 4012 (QUOTA_EXHAUSTED)
```

## Common Diameter Issues

### 1. CCR-I Timeout

```
Symptom: PGW cannot establish charging session
Cause: OCS overloaded or unreachable
Check: TCP/SCTP port 3868 connectivity
```

### 2. Result-Code 5012 (UNABLE_TO_COMPLY)

```
Symptom: OCS rejects credit request
Cause: Missing or invalid AVP
Check: Subscription data, rating group config
```

### 3. Gx Push Failure

```
Symptom: PCRF pushes rules but PGW doesn't apply
Cause: Session-Id mismatch
Check: Diameter session state on PGW
```

## Wireshark Analysis

```bash
# All Diameter messages
diameter

# Filter CCR messages
diameter.cmd.ccr

# Filter by Result-Code
diameter.result_code == 2001

# Filter by Application-Id
diameter.application_id == 16777238  # Gx
diameter.application_id == 4          # Charging

# Show Diameter AVPs
diameter.avp
```

---

*Next article: [Wireshark Filters Every PS Core Engineer Should Know](/blog/wireshark-filters-ps-core)*
