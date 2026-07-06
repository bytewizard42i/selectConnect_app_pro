# SelectConnect — Punch List

> Created: July 5, 2026 (Penny session)
> Status: gaps found during demo spin-up + gap analysis

## Demo UI
- [ ] Modernize demo UI to 2026 design (glassmorphism, 3D tilt, haptics, tooltips) — still has old pre-modernization style
- [ ] Demo server runs on port 3000 (consider standardizing to demoLand port convention)

## Contracts
- [x] Verify v2 contracts compile on `compactc 0.31.1` — both compile clean (8 + 6 circuits)
- [ ] Remove or clearly label old 2025 archived contracts as stale-syntax reference hazards
- [ ] Write/verify contract tests

## House convention docs
- [x] `docs/DEMOLAND_VS_REALDEAL.md` — created
- [x] `docs/DIF_RELEVANCE.md` — already existed

## Cross-cutting
- [x] Add pointer doc to midnight-modules engine — `docs/ENGINE_REFERENCE.md` created
- [ ] Confirm `docs/DIDZ_ENGINE_INTEGRATION.md` is up to date with current engine state
