# SelectConnect, demoLand vs realDeal

> **CONVENTION UPDATED Aug 2, 2026 — now THREE stages:**
> **DemoLand → TestWired → RealDeal.** TestWired = the same product wired
> to TEST infrastructure (Midnight localnet/preprod contracts, test-mode
> APIs) with real transactions and proofs against test tokens; RealDeal is
> then mostly a configuration change. Canonical definition:
> `DIDzMonolith-docs/standards/BUILD_STAGES.md` — it supersedes the
> two-stage framing below (kept for the mode details it documents).

> Convention: every DIDzMonolith product ships two modes.
> Canonical spec: `~/PixyPi/docs/DEMOLAND_AUTH_STANDARD.md`

## demoLand (current)

- **Port**: 3000
- **Server**: `demo/server.js` (Express + QRCode generation)
- **Chain**: simulated, mock cards, bonds, and progressive reveal
- **Auth**: 7-method standard (see canonical doc)
- **No Docker required**, just `npm install && npm start`
- **Safe to record**, deterministic, no network calls

## realDeal (planned)

- **Chain**: Midnight (undeployed localnet → testnet → mainnet)
- **Contracts**: `contact_grant.compact` + `abuse_escrow.compact` v2 (engine-based)
- **Proof server**: `midnightnetwork/proof-server` via Docker
- **Node + indexer**: via `undeployed-compose.yml` pattern
- **Abuse bond staking**: real on-chain escrow with progressive reveal

## Rules

1. Shared pipeline logic written ONCE, both sides are thin orchestrators
2. The UI must never know which mode it's in (provider context switch)
3. demoLand must show the amber `🎭 DEMO MODE` banner
4. Auth must implement the 7-method standard
