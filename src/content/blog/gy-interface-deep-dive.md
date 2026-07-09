---
title: "Gy Interface Deep Dive: The Complete Guide to Online Charging"
description: "Master the Gy online charging interface — DCCA protocol, SCUR/ECUR/IEC modes, CCR/CCA message flows, AVP definitions, quota management, and practical troubleshooting for PGW/UGW and OCS."
pubDate: "2026-07-09"
tags: ["Gy", "Diameter", "Online Charging", "OCS", "PGW", "UGW", "DCCA", "Telecom"]
---

# Gy Interface Deep Dive: The Complete Guide to Online Charging

The **Gy interface** is the backbone of prepaid mobile data services. It connects the **PGW/UGW** (Packet/User Gateway) to the **OCS** (Online Charging System) using the **Diameter Credit Control Application (DCCA)** protocol. Every time a prepaid subscriber browses the web, streams video, or sends an MMS, the Gy interface handles the real-time credit check.

This guide covers everything you need to know — from protocol fundamentals to practical troubleshooting.

## What is the Gy Interface?

The Gy reference point is defined in **3GPP TS 32.291** and operates between the **PGW** (in EPC) or **UGW** (Huawei) and the **OCS**. It enables **online charging** — meaning the network verifies subscriber credit in real-time before granting service.

```
UE → eNodeB → SGW → PGW/UGW ←————→ OCS
                          |
                      Gy Interface
                    (Diameter DCCA)
                    TCP/SCTP:3868
                    App-ID: 4
```

### Key Characteristics

| Property | Value |
|----------|-------|
| **Protocol** | Diameter Credit Control Application (DCCA) |
| **RFC** | RFC 4006 |
| **Transport** | TCP or SCTP |
| **Port** | 3868 (IANA) |
| **Application-ID** | 4 |
| **Command-Code** | 272 (Credit-Control) |
| **3GPP Spec** | TS 32.291, TS 32.299 |

## Protocol Stack

```
┌─────────────────────────────────┐
│     DCCA (RFC 4006)             │  ← Gy Application
├─────────────────────────────────┤
│     Diameter Base (RFC 6733)    │  ← Protocol framework
├─────────────────────────────────┤
│     TCP or SCTP                 │  ← Transport (port 3868)
├─────────────────────────────────┤
│     IP                          │  ← Network layer
└─────────────────────────────────┘
```

## Diameter Message Header

Every Diameter message starts with a 20-byte header:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|    Version    |                 Message Length                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| command flags |                  Command-Code                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         Application-ID                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      Hop-by-Hop Identifier                    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      End-to-End Identifier                    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Command Flags:**

| Bit | Name | Description |
|-----|------|-------------|
| **R** | Request | 1 = Request message, 0 = Answer |
| **P** | Proxiable | May be relayed or proxied |
| **E** | Error | Protocol error in message |
| **T** | Retransmitted | Possible duplicate after failover |

## Online Charging Modes

The Gy interface supports four distinct charging modes, each suited for different service scenarios.

### SCUR — Session Charging with Unit Reservation

The **primary and most common** mode. Used for volume/time-based data charging.

```
How SCUR Works:
═══════════════

1. User starts data session
2. UGW sends CCR-I → OCS (request quota)
3. OCS reserves quota from subscriber account
4. UGW grants service → user consumes data
5. When quota runs low → UGW sends CCR-U (request more)
6. Session ends → UGW sends CCR-T (final report)
7. OCS debits exact amount from account
```

**When to use:** Data sessions, internet browsing, video streaming, any continuous data service.

### ECUR — Event Charging with Unit Reservation

Used for **event-based charging** where the outcome is a discrete event.

```
ECUR Flow:
══════════
1. Event detected → CCR-I to OCS
2. OCS grants quota for the event
3. Event completes → CCR-T reports usage
4. OCS debits or refunds accordingly
```

**When to use:** MMS send/receive, content downloads, app purchases.

### eECUR — Enhanced ECUR

The older 3GPP definition with **CC-Update** interaction during the event. Supports quota updates for long-running events.

### IEC — Immediate Event Charging

**No reservation** — OCS charges immediately. The most signaling-efficient mode.

**When to use:** SMS, USSD, any service with guaranteed outcome.

### Mode Comparison

| Mode | Session Type | Reservation | Typical Use | Signaling |
|------|-------------|-------------|-------------|-----------|
| **SCUR** | Single DCC | Yes (chunks) | Data, streaming | High |
| **ECUR** | Separate DCC | Yes (event) | MMS, downloads | Medium |
| **eECUR** | Separate DCC | Yes + Update | Long events | Medium-High |
| **IEC** | Separate DCC | No | SMS, USSD | Low |

## CCR/CCA Message Flows

### Credit-Control-Request (CCR)

Command-Code **272**, Direction **PGW/UGW → OCS**.

```
<CCR> ::= <Diameter Header: 272, REQ, PXY>
  <Session-Id>                           // Unique per session
  {Origin-Host}                           // PGW/UGW hostname
  {Origin-Realm}                          // PGW/UGW realm
  {Destination-Realm}                     // OCS realm
  {Auth-Application-Id}                   // Must be 4
  {Service-Context-Id}                    // e.g., "32260@3gpp.org"
  {CC-Request-Type}                       // 1=I, 2=U, 3=T, 4=E
  {CC-Request-Number}                     // Increments per request
  [Requested-Action]                      // For EVENT_REQUEST
  [User-Name]                             // IMSI/MSISDN
  *[Subscription-Id]                      // Subscriber identity
  [Termination-Cause]                     // Reason for session end
  [Multiple-Services-Indicator]           // MSCC support flag
  *[Multiple-Services-Credit-Control]     // Per-rating-group
  [Service-Information]                   // PS-Information
```

**CC-Request-Type Values:**

| Value | Name | When Sent |
|-------|------|-----------|
| 1 | INITIAL_REQUEST | First CCR of a new session |
| 2 | UPDATE_REQUEST | Quota threshold or exhaustion |
| 3 | TERMINATION_REQUEST | Session end |
| 4 | EVENT_REQUEST | Event-based charging |

### Credit-Control-Answer (CCA)

Command-Code **272**, Direction **OCS → PGW/UGW**.

```
<CCA> ::= <Diameter Header: 272, PXY>
  <Session-Id>
  {Result-Code}                           // 2001=SUCCESS
  {Origin-Host}                           // OCS hostname
  {Origin-Realm}
  {Auth-Application-Id}                   // 4
  {CC-Request-Type}                       // Echoes request
  {CC-Request-Number}                     // Echoes request
  [CC-Session-Failover]                   // 0=No, 1=Yes
  *[Multiple-Services-Credit-Control]     // Granted quotas
  [Credit-Control-Failure-Handling]       // 0/1/2
  [Validity-Time]                         // Quota validity
```

## Key AVPs (Attribute-Value Pairs)

### Core Session AVPs

| AVP Name | Code | Type | Description |
|----------|------|------|-------------|
| **Session-Id** | 263 | OctetString | Unique per-session identifier |
| **Auth-Application-Id** | 258 | Unsigned32 | Must be 4 for DCCA |
| **Service-Context-Id** | 461 | OctetString | Charging context identifier |
| **CC-Request-Type** | 416 | Unsigned32 | 1=I, 2=U, 3=T, 4=E |
| **CC-Request-Number** | 415 | Unsigned32 | Sequence per session |
| **Result-Code** | 268 | Unsigned32 | 2001=SUCCESS |
| **Origin-Host** | 264 | OctetString | Sender hostname |
| **Origin-State-Id** | 278 | Unsigned32 | Restart detection |

### Quota & Credit AVPs

| AVP Name | Code | Type | Description |
|----------|------|------|-------------|
| **Granted-Service-Unit** | 431 | Grouped | Quota granted by OCS |
| **Used-Service-Unit** | 446 | Grouped | Units consumed |
| **CC-Time** | 420 | Unsigned32 | Time quota (seconds) |
| **CC-Total-Octets** | 421 | Unsigned64 | Total volume quota |
| **CC-Input-Octets** | 412 | Unsigned64 | Uplink volume |
| **CC-Output-Octets** | 414 | Unsigned64 | Downlink volume |
| **Rating-Group** | 432 | Unsigned32 | Charging classification |
| **CC-Unit-Type** | 454 | Unsigned32 | 1=TIME, 2=MONEY, 4=TOTAL_OCTETS |

### Threshold & Timer AVPs

| AVP Name | Code | Description |
|----------|------|-------------|
| **Time-Quota-Threshold** | 868 | Trigger update when time remaining below threshold |
| **Volume-Quota-Threshold** | 869 | Trigger update when volume remaining below threshold |
| **Quota-Consumption-Time** | 881 | Idle timeout before quota stops (discontinuous traffic) |
| **Validity-Time** | 448 | How long granted quota remains valid |

### Failure Handling AVPs

| AVP Name | Code | Values |
|----------|------|--------|
| **CC-Session-Failover** | 418 | 0=Not Supported, 1=Supported |
| **Credit-Control-Failure-Handling** | 427 | 0=TERMINATE, 1=RETRY, 2=CONTINUE |
| **Direct-Debiting-Failure-Handling** | 428 | 0=TERMINATE_SERVICE, 1=CONTINUE_SERVICE |
| **Final-Unit-Action** | 449 | 1=TERMINATE, 2=REDIRECT, 3=RESTRICT |

## PS-Information AVP

The **Service-Information** AVP carries packet-switched charging data:

```
Service-Information ::= <AVP Header: 873>
  [PS-Information]
    [3GPP-Charging-Id]           // Bearer charging ID
    [3GPP-PDP-Type]              // IPv4/IPv6/IPv4v6
    *[PDP-Address]               // UE IP
    [Called-Station-Id]          // APN name
    [SGSN-Address]               // SGSN IP
    [GGSN-Address]               // GGSN/PGW IP
    [3GPP-IMSI-MCC-MNC]          // MCC+MNC
    [3GPP-RAT-Type]              // GERAN/UTRAN/E-UTRAN
    [3GPP-User-Location-Info]     // Cell ID, TAC
    [3GPP-MS-TimeZone]           // UTC offset
    [Charging-Rule-Base-Name]    // PCRF rule group
    [Serving-Node-Type]          // SGSN/MME/PGW
    [Start-Time]                 // Session start epoch
    [Stop-Time]                  // Session end epoch
```

## Termination-Cause Values

| Code | Name | Description |
|------|------|-------------|
| 1 | DIAMETER_LOGOUT | User disconnected |
| 2 | DIAMETER_SERVICE_NOT_PROVIDED | Pre-auth disconnect |
| 3 | DIAMETER_BAD_ANSWER | Malformed auth answer |
| 4 | DIAMETER_ADMINISTRATIVE | Admin disconnect (ASR) |
| 5 | DIAMETER_LINK_BROKEN | Transport failure |
| 6 | DIAMETER_AUTH_EXPIRED | Session time expired |
| 7 | DIAMETER_USER_MOVED | User moved to another node |
| 8 | DIAMETER_SESSION_TIMEOUT | Inactivity timeout |

## Common Result Codes

| Code | Name | Meaning |
|------|------|---------|
| **2001** | DIAMETER_SUCCESS | Request succeeded |
| 3002 | DIAMETER_UNABLE_TO_DELIVER | Cannot reach home server |
| 4012 | DIAMETER_CREDIT_LIMIT_EXCEEDED | No credit / quota exhausted |
| 4013 | DIAMETER_USER_UNKNOWN | Subscriber not found |
| 5012 | UNABLE_TO_COMPLY | OCS processing error |
| 5014 | DIAMETER_MISSING_AVP | Required AVP missing |

## Complete SCUR Call Flow

```
UE → eNodeB → SGW → UGW/PGW ←————→ OCS

Step 1: [CCR-I] UGW → OCS
  CC-Request-Type = 1 (INITIAL)
  Session-Id = "ugw.operator.com;123456;1"
  Service-Context-Id = "32260@3gpp.org"
  Subscription-Id: IMSI = 001012345678901
  Rating-Group = 1
  PS-Information: APN="internet", RAT=E-UTRAN

Step 2: [CCA-I] OCS → UGW
  Result-Code = 2001 (SUCCESS)
  Granted-Service-Unit: CC-Total-Octets = 100MB
  CC-Session-Failover = 1 (SUPPORTED)
  Volume-Quota-Threshold = 10MB

Step 3: [CCR-U] UGW → OCS  (after 90MB consumed)
  CC-Request-Type = 2 (UPDATE)
  CC-Request-Number = 1
  Used-Service-Unit: CC-Total-Octets = 90MB
  Requested-Service-Unit: CC-Total-Octets = 50MB

Step 4: [CCA-U] OCS → UGW
  Result-Code = 2001
  Granted-Service-Unit: CC-Total-Octets = 50MB

Step 5: [CCR-T] UGW → OCS  (user disconnects)
  CC-Request-Type = 3 (TERMINATION)
  CC-Request-Number = 2
  Used-Service-Unit: CC-Total-Octets = 35MB
  Termination-Cause = 1 (LOGOUT)

Step 6: [CCA-T] OCS → UGW
  Result-Code = 2001
  Total charged: 125MB
```

## Troubleshooting Guide

### Common Issues and Fixes

**1. CCR-I Timeout (no CCA response)**
- Check TCP/SCTP connectivity on port 3868
- Verify OCS is reachable and Diameter peer is up
- Check firewall rules between UGW and OCS

**2. Result-Code 4012 (CREDIT_LIMIT_EXCEEDED)**
- Subscriber has no credit or quota
- Normal for prepaid subscribers with zero balance
- UGW should deny service access

**3. Result-Code 5012 (UNABLE_TO_COMPLY)**
- OCS cannot process the request
- Check Service-Context-Id configuration
- Verify rating group exists in OCS

**4. Session Failover Not Working**
- Verify CC-Session-Failover = 1 in CCA
- Check secondary OCS is configured and reachable
- Verify Origin-State-Id increments on restart

**5. Quota Exhaustion During Active Session**
- Volume-Quota-Threshold too high — lower it (e.g., 10% of quota)
- CCR-U not being sent — check threshold configuration
- OCS not granting sufficient quota in CCA-U

### Debug Commands

```
# View active Gy sessions
display diameter session all

# Check Gy peer status  
display diameter peer all

# Monitor CCR/CCA messages
debugging diameter credit-control all

# View quota statistics
display charging quota statistics

# Check OCS connectivity
display diameter connection
```

### Wireshark Filters

```bash
# All Diameter messages
diameter

# Only CCR/CCA (Gy traffic)
diameter.cmd.ccr

# Filter by Result-Code
diameter.result_code != 2001

# Filter by Application-Id (DCCA = 4)
diameter.application_id == 4

# CCR with specific IMSI
diameter and diameter.imsi == "001012345678901"

# Quota exhaustion (Result-Code 4012)
diameter.result_code == 4012
```

## Best Practices

1. **Set appropriate quota thresholds** — Request new quota at 80-90% consumption to avoid service interruption
2. **Enable session failover** — Configure CC-Session-Failover = 1 for high availability
3. **Use Multiple-Services-Credit-Control** — Per-rating-group charging for granular billing
4. **Monitor Quota-Consumption-Time** — Set for discontinuous traffic (e.g., social media, messaging)
5. **Configure Credit-Control-Failure-Handling = 2 (CONTINUE)** — Don't drop sessions on transient OCS failures
6. **Regular DWR/DWA health checks** — Ensure Diameter peer liveness monitoring is active

## References

- **3GPP TS 32.291** — Telecommunication management; Charging management; Diameter charging application
- **3GPP TS 32.299** — Diameter charging applications
- **RFC 4006** — Diameter Credit-Control Application
- **RFC 6733** — Diameter Base Protocol
- **RFC 3588** — Diameter Base Protocol (obsoleted by 6733)
