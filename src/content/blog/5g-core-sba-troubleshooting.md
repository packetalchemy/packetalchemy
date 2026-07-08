---
title: "5G Core SBA: Troubleshooting Service-Based Architecture"
description: "Practical guide to troubleshooting 5G Core SBA — NRF discovery, HTTP/2 failures, and AMF/SMF/UPF issues."
pubDate: "2026-07-05"
tags: ["5G Core", "SBA", "Troubleshooting", "HTTP/2", "NRF"]
---

# 5G Core SBA: Troubleshooting Guide

## What is SBA?

The Service-Based Architecture (SBA) is the defining feature of 5G Core. Network functions communicate via HTTP/2 REST APIs over a service bus, replacing legacy point-to-point interfaces.

## Key Network Functions

| NF | Role |
|----|------|
| **NRF** | Service discovery and registration |
| **AMF** | Access and Mobility Management |
| **SMF** | Session Management |
| **UPF** | User Plane Function |
| **UDM** | Unified Data Management |
| **PCF** | Policy Control Function |

## Common SBA Issues

### 1. NRF Discovery Failure

AMF cannot discover SMF. Check NRF database for registration. Verify SMF startup config and NRF URL.

### 2. HTTP/2 Connection Errors

Intermittent 503 errors. Usually TLS cert issues. Check cert validity and NTP sync.

### 3. Service Mesh Latency

PDU Session establishment takes too long. Trace HTTP/2 chain with tcpdump.

## Debug Commands

```
display nrf nf-registration all
display amf peer-nf all
debugging http2 message all
```

## Wireshark Filters

```
http2
http2.headers.path contains "/nsmf"
http2 || pfcp || ngap
```
