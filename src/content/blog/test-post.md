---
title: "Understanding 5G Core Architecture"
description: "Deep dive into AMF, SMF and UPF — how the service-based 5G Core splits control and user plane, how registration and PDU sessions actually flow, and how each function maps to the EPC you already know."
pubDate: 2026-07-04
updatedDate: 2026-10-20
tags: ["5G Core", "Architecture", "AMF", "SMF", "UPF"]
---

# Understanding 5G Core Architecture

The 5G Core (5GC) is not an EPC with new names. It keeps the hard-won
lesson of CUPS — control and user plane scale separately — and rebuilds
the control plane as a set of cooperating services: the Service-Based
Architecture (SBA). If you already run an EPC, the fastest way to
understand 5GC is to see which old box each new function grew out of, and
which problems the split was designed to remove.

## The big idea: services, not boxes

In EPC, network functions talk over point-to-point Diameter and GTP
interfaces — S6a, S11, S5 — each with its own protocol and failure modes.
In 5GC, control-plane functions expose **services over HTTP/2 APIs** and
discover each other through the NRF. The user plane stays lean and fast:
the UPF forwards packets and enforces rules, nothing more.

That split buys three things:

- **Independent scaling** — grow session handling (SMF) without touching
  mobility (AMF), and place UPFs at the edge without dragging the whole
  core with them.
- **Network slicing** — the NSSF helps select a set of functions and
  resources dedicated to a slice, something EPC could only approximate
  with APN and DECOR tricks.
- **Faster evolution** — a function's service interface can be versioned
  and upgraded without re-certifying a web of point-to-point interfaces.

## The functions that matter

### AMF — Access and Mobility Management Function

The front door of the core. The AMF terminates the N1 signalling from the
UE (via the gNB over N2), runs registration and mobility, and relays NAS
messages. Think of it as the MME's mobility half — but it deliberately
knows nothing about session IP addresses. If the AMF is down, nothing
registers; if it is healthy, sessions can still fail downstream.

### SMF — Session Management Function

The MME's other half, grown up. The SMF owns PDU sessions: it allocates
UE IP addresses, selects the UPF, and programs it over **PFCP on N4** —
installing the PDRs, FARs and QERs that decide what happens to every
packet. Most "the session is up but no traffic flows" faults live on this
SMF → UPF boundary.

### UPF — User Plane Function

The only function in the data path. It matches packets against the rules
the SMF installed, enforces QoS, counts usage for charging, and anchors
the PDU session toward the data network over N6. It is the PGW-U and
SGW-U of the EPC world, minus every control-plane duty they used to
carry.

### The supporting cast

- **AUSF + UDM** — authentication and subscription data; the heirs of the
  HSS, split so authentication can scale and be shared with other access
  types.
- **PCF** — policy decisions (the PCRF's successor): QoS, gating and
  charging rules handed to the SMF.
- **NRF** — the service registry. Functions register their services here
  and discover each other dynamically — the SBA equivalent of DNS-based
  peer selection in EPC.
- **NSSF** — slice selection, helping the AMF land a UE on the right
  slice.
- **NEF** — exposes selected core capabilities to external applications
  through a controlled API.

## Registration in six steps

1. The UE sends a Registration Request through the gNB; the network
   selects an AMF.
2. The AMF runs authentication with the AUSF and UDM.
3. The UDM records the serving AMF and returns the subscription profile.
4. The AMF fetches policy (AM policy) from the PCF.
5. The UE is registered — it has reachability and mobility, but **no data
   session yet**. Registration and connectivity are separate states.
6. Only when the UE asks for a PDU session does the SMF enter the story.

That separation — registered ≠ connected — is the single biggest mental
shift from EPC, where attach bundled both into one procedure.

## PDU session establishment in five steps

1. The UE requests a PDU session (DNN, slice, type) via the AMF.
2. The AMF discovers and selects an SMF through the NRF.
3. The SMF checks the subscription with the UDM and policy with the PCF,
   then selects a UPF.
4. The SMF programs the UPF over PFCP (N4): packet detection, forwarding
   and QoS rules go in.
5. The session is accepted, the N3 tunnel between gNB and UPF is up, and
   user traffic flows.

## EPC → 5GC: the mapping that orients you

| EPC | 5G Core | What changed |
| --- | --- | --- |
| MME | AMF + SMF | Mobility and sessions split into two functions |
| SGW-C / PGW-C | SMF | Session control unified in one function |
| SGW-U / PGW-U | UPF | Pure forwarding and enforcement |
| HSS | UDM + AUSF | Data and authentication split |
| PCRF | PCF | Same role, service-based interface |
| DNS peer selection | NRF | Dynamic service discovery |

## Why this matters when something breaks

Architecture is troubleshooting strategy. A registration failure points
at the AMF, AUSF and UDM — not the SMF. A session that establishes but
passes no traffic points at the N4 contract between SMF and UPF. A
session that works in one region and not another points at UPF selection
and the NRF's view of the world. In SBA, the question is never "which box
is down" but "which service relationship is broken" — and the functions
above are the map.
