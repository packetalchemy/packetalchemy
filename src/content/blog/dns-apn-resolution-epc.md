---
title: "DNS and APN Resolution in EPC: The Lookup Behind Every Attach"
description: "Before the first bearer exists, the MME has to find a PGW — and it finds it with DNS. NAPTR, SRV and one zero-padded MNC decide whether an attach succeeds or dies with 'Missing or unknown APN'."
pubDate: "2026-10-20"
tags: ["EPC", "DNS", "APN", "PGW", "MME", "Troubleshooting"]
---

# DNS and APN Resolution in EPC: The Lookup Behind Every Attach

The UE attaches, authentication passes, and then the session dies before a
single bearer is created. Radio is fine. The HSS is fine. The PGW is up and
idle.

The problem is a lookup nobody watches: before the MME can send a Create
Session Request anywhere, it has to turn the subscriber's APN into a PGW IP
address — and in EPC, that translation is done by DNS.

## From APN to FQDN

When a UE requests a PDN connection, it sends an APN like `internet`. The
MME combines it with the operator identifiers from the IMSI to build an
APN-FQDN:

```
<APN>.apn.epc.mnc<MNC>.mcc<MCC>.3gppnetwork.org
```

For example, `internet` on PLMN 432-11 becomes:

```
internet.apn.epc.mnc011.mcc432.3gppnetwork.org
```

One detail in that string causes a classic interoperability failure: **the
MNC is always three digits, zero-padded**. A two-digit MNC of `11` must be
written `mnc011`. If one side builds `mnc11` and the DNS zone only carries
`mnc011`, resolution returns nothing and the attach fails — with both sides
insisting their configuration is "correct".

## The three-question lookup

PGW selection follows 3GPP TS 29.303 and asks DNS three questions in
sequence:

1. **NAPTR** — The MME queries the APN-FQDN for NAPTR records. The answer
   is a list of services the operator offers for that APN, such as
   `x-3gpp-pgw:x-s5-gtp` (PGW reachable over S5), `x-3gpp-pgw:x-s8-gtp`
   (S8, for roaming), or `x-3gpp-pgw:x-gn-gtp`. Order and preference fields
   rank the services, and each record points to an SRV name.
2. **SRV** — For the chosen service, the SRV query returns one or more PGW
   hostnames with priority and weight. This is where load sharing between
   PGWs is expressed: equal priority, weights proportional to capacity.
3. **A / AAAA** — Finally, the hostname resolves to the PGW's S5/S8 address,
   and the MME sends the GTP-C Create Session Request there.

The SGW is chosen the same way, from a Tracking Area Identity based FQDN,
and the MME prefers a PGW **colocated** with the selected SGW when the DNS
answers allow it — fewer hops, one site, simpler failure domain.

Nothing in this chain is hard-coded. Add a PGW, change a weight, split an
APN across two sites — all of it is DNS data, which is exactly why DNS
mistakes look like core-network failures.

## What failure looks like

- **No NAPTR answer (NXDOMAIN or empty):** the APN is not provisioned in
  DNS, the FQDN was built wrong (see the MNC padding above), or the MME is
  asking the wrong resolver. The session typically dies with ESM cause
  **#27 "Missing or unknown APN"** — even when the APN exists in the HSS.
- **NAPTR works, SRV is empty or stale:** the service name in DNS doesn't
  match what the zone publishes (a single character in `x-s5-gtp` vs
  `x-s8-gtp` changes which PGWs answer — and in roaming, which network
  you're asking).
- **It worked until the maintenance window:** PGW replaced, addresses
  changed, and the MME still holds the old answer. DNS TTL and negative
  caching mean a *fixed* zone can keep failing for as long as the cache
  lives. "We already corrected the record" and "the MME still resolves the
  old PGW" are both true at the same time.
- **Intermittent, site-specific failures:** one SGW/MME pool resolves
  correctly, another doesn't. Different resolver paths, different views of
  the zone — the fault follows the DNS path, not the subscriber.

## A field checklist

When an attach fails before any GTP reaches a PGW:

1. Reconstruct the exact APN-FQDN the MME should build — APN from the
   request, MNC zero-padded to three digits, MCC from the IMSI.
2. Query NAPTR, then SRV, then A — **from a resolver on the MME's DNS
   path**, not from your laptop. Your view of the zone is not the MME's.
3. Compare the HSS-subscribed APN with the requested APN. DNS can only
   resolve what is provisioned on both sides.
4. Check what the MME cached: TTL on the records, and whether a negative
   answer is being held from an earlier outage.
5. Capture on the DNS interface during a failing attach. If no query
   leaves the MME, the problem is local configuration, not the zone.

## The takeaway

In EPC, DNS is not an IT side-service — it is part of the call path. Every
attach, every PDN connection and every PGW reselection starts as a DNS
question. When the failure says "unknown APN" but the APN looks right,
stop reading the subscription data and start reading the resolution chain:
FQDN construction, NAPTR, SRV, cache. That is where the session actually
died.
