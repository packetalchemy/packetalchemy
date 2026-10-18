# PacketAlchemy Site Improvement Plan

Status: implemented on the website (2026-10-18). This plan now lives in
the website repo itself (`packetalchemy/packetalchemy`, Astro,
`packetalchemy.ir`) — the tracks below were built directly into the
site, reusing its existing layouts, components, and design tokens.
Source material lives in the notes repo
`packetalchemy/packetalchemy-telecom-notes`.

## Track 1 — Connect repo to site ✅ (done 2026-10-18)
- The site links to the notes repo where it references notes: the Notes
  index page, the Learning Paths pages (EN + FA), and the lab note all
  link to `https://github.com/packetalchemy/packetalchemy-telecom-notes`.
- Remaining: none for this batch.

## Track 2 — Instagram posts → site articles ✅ (PFCP done 2026-10-18)
- `src/content/blog/pfcp-n4-smf-controls-upf.md` — long-form PFCP article
  (N4, the five rules, lifecycle, rule-mismatch troubleshooting), with
  related links to the Gy article, the lab note, Learning Paths, and the
  Persian version. Tags/ search pick it up automatically.
- Remaining: convert the other posts (GTP-U TEID, DNS/APN, Diameter Gy)
  and keep converting new posts weekly.

## Track 3 — Learning paths ✅ (done 2026-10-18)
- `src/pages/learning-paths.astro` and `src/pages/fa/learning-paths.astro`
  present the five paths from `Course/learning-paths.md`: EPC
  Foundations, 5G Core, Troubleshooting & War Room, Roaming, Interview
  Prep. Linked from the main navigation and footer (EN + FA).
- Remaining: add a path for Charging & Policy, and quizzes per path.

## Track 4 — Persian versions ✅ (PFCP + Gy done 2026-10-18)
- `src/pages/fa/pfcp-n4.astro` and `src/pages/fa/gy-interface.astro` —
  full Persian articles following the existing fa-page pattern
  (I18nLayout, RTL), from `FA/pfcp-n4.md` and `FA/gy-interface.md`.
- `src/pages/fa/blog/index.astro` maps the PFCP article to its Persian
  title/description (Gy already mapped).
- Remaining: Persian versions for the most-read notes (OCS, GTP-U,
  DNS, S6a, PFCP follow-ups). Priority: notes that match Instagram
  posts, so bilingual readers can go deeper in Persian.

## Track 5 — Discoverability ✅ (done 2026-10-18)
- New blog article tags (5G Core, PFCP, SMF, UPF, N4) appear on the
  Tags page automatically; the Search page indexes the new article
  automatically. The lab note carries Lab/Troubleshooting/EPC/DNS/Gy/
  PFCP tags. Learning Paths is in the nav and footer.
- Remaining: add tags to every note header over time; add a
  "Recently added" section to the index on each new note.

## Track 6 — Practical section ✅ (lab done 2026-10-18)
- `src/content/notes/scenario-attach-no-data.md` — hands-on scenario
  "Attach OK, No Data" (symptoms, 5 ordered investigation steps,
  questions, answer key), from `Lab/scenario-attach-no-data.md`,
  with related links to the PFCP/Gy articles and Learning Paths.
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
