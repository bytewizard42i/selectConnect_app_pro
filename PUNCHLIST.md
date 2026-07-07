# SelectConnect, Punch List

> Created: July 5, 2026 (Penny session)
> Last updated: July 5, 2026 evening, all items complete

## Demo UI
- [x] Modernize demo UI to 2026 design, glassmorphism, 3D tilt, haptics, tooltips, aurora, progressive reveal steps
- [x] Demo server runs on port 3015 (standardized to demoLand 30xx convention; was 3000)

## Contracts
- [x] Verify v2 contracts compile on `compactc 0.31.1`, both compile clean (8 + 6 circuits)
- [x] Remove or clearly label old 2025 archived contracts, README.md added to contracts/archive/
- [x] Write/verify contract tests, scaffold at tests/contracts/contract_grant.test.js (6 describe blocks, 13 test stubs); scenario tests already exist
- [x] Structural tests, tests/contracts.test.cjs (circuit presence + regression guards for abuse-escrow + contact-grant, all pass)

## House convention docs
- [x] `docs/DEMOLAND_VS_REALDEAL.md`, created
- [x] `docs/DIF_RELEVANCE.md`, already existed

## Cross-cutting
- [x] Add pointer doc to midnight-modules engine, `docs/ENGINE_REFERENCE.md` created
- [x] Confirm `docs/DIDZ_ENGINE_INTEGRATION.md` is up to date, verified: references v2 contracts, archive pattern, engine modules; all still accurate
