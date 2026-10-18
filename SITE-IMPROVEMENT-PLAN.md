# PacketAlchemy Site Improvement Plan

Status: in progress (started 2026-10-18). The website `packetalchemy.ir`
is a separate codebase from this repo — this plan builds everything
site-ready inside this repo (index, paths, articles, Persian versions,
labs). If direct edits to the website itself are wanted, share the
website repo.

## Track 1 — Connect repo to site ✅ (foundation done)
- `INDEX.md` lists every note with tags, one-line descriptions and
  related-note links. The site can link to it or generate pages from it.
- Remaining: point the website at this index (needs the website repo).

## Track 2 — Instagram posts → site articles 🔄 (started)
- `Articles/` holds long-form site-ready articles converted from
  Instagram posts (PFCP done first). Each article expands the post with
  full explanation, diagrams references and troubleshooting.
- Remaining: convert the other posts (GTP-U TEID, DNS/APN, Diameter Gy)
  and keep converting new posts weekly.

## Track 3 — Learning paths ✅ (foundation done)
- `Course/learning-paths.md` orders the notes into paths: EPC
  Foundations, 5G Core, Troubleshooting & War Room, Roaming.
- Remaining: add a path for Charging & Policy, and quizzes per path.

## Track 4 — Persian versions 🔄 (started)
- `FA/` holds Persian versions of key notes (PFCP, Gy done first).
- Remaining: Persian versions for the most-read notes (OCS, GTP-U,
  DNS, S6a, PFCP follow-ups). Priority: notes that match Instagram
  posts, so bilingual readers can go deeper in Persian.

## Track 5 — Discoverability ✅ (foundation done)
- `INDEX.md` = tags + search-by-topic entry point. Each note's
  "Related Interfaces / Related Notes" section links sideways.
- Remaining: add tags to every note header over time; add a
  "Recently added" section to the index on each new note.

## Track 6 — Practical section 🔄 (started)
- `Lab/` holds hands-on scenarios with symptoms, investigation steps,
  questions and an answer key (attach-no-data scenario done first).
- Remaining: more scenarios (Gy quota exhaustion, PFCP rule mismatch,
  roaming no-data), plus PCAP-based exercises.

## Operating rules
- Every new note/article is checked against `INDEX.md` first: no
  duplicate topics.
- Repo notes stay short (~2-3 KB). Site articles are long-form.
- No invented personal experiences, real incidents, or confidential
  operator information anywhere.
- The twice-weekly note schedule (`packetalchemy-repo-notes-twice-weekly`)
  keeps adding notes; tracks 2, 4 and 6 advance with it.
