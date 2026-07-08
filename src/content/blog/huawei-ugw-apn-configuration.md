---
title: "Huawei UGW APN Configuration Best Practices"
description: "Step-by-step guide to configuring APN profiles on Huawei UGW — PDN types, QoS, charging rules, and common pitfalls."
pubDate: "2026-07-04"
tags: ["Huawei", "UGW", "APN", "Configuration", "PS Core"]
---

# Huawei UGW APN Configuration Best Practices

## Why APN Configuration Matters

The Access Point Name (APN) is the gateway between the mobile network and external data networks. A misconfigured APN causes session failures, charging errors, or data drops.

## Key APN Parameters

| Parameter | Description |
|-----------|-------------|
| **APN Name** | e.g., internet, mms, ims |
| **PDN Type** | IPv4, IPv6, IPv4v6 |
| **APN AMBR** | Aggregate Maximum Bit Rate |
| **QCI** | QoS Class Identifier (1-9) |
| **Charging Mode** | Online, Offline, Both |
| **Rating Group** | Charging classification |

## Configuration Example

```
apn profile "internet"
  apn-name internet
  pdn-type ipv4v6
  apn-ambr-ul 102400
  apn-ambr-dl 512000
  qci 9
  charging-mode online
  rating-group 1
  max-session 100000
```

## Common Pitfalls

**1. PDN Type Mismatch** — UE requests IPv4v6 but APN is IPv4 only. Result: PDP context rejected.

**2. APN AMBR Too Low** — Setting AMBR below UE capability. Throughput capped unnecessarily.

**3. Missing Rating Group** — Online charging enabled but no rating-group. CCR-I fails.

**4. Max Session Limit** — Default max-session too low for high-density APNs.

## Monitoring APN Health

```
display apn profile "internet" statistics
display gtp pdp-context apn "internet" count
display apn session statistics
```
