# SelectConnect Contracts (v2, on the DIDz engine)

> Rebuilt July 5, 2026 against the new four-pillar architecture
> (DIDz root / AgenticDID / RWAz / SelectConnect-as-product).
> See `docs/DIDz_ENGINE_INTEGRATION.md` for the full decision record.

## Live contracts (compiled on compactc 0.31.1, full ZK keys)

| Contract | What it is | Engine pattern it applies |
|---|---|---|
| `contact_grant.compact` | Cards + contact links. A link is a **scoped grant**: locked to ONE recipient, capped at a max reveal level, expiring, instantly revocable. Card deactivation cascades to all its links. | `midnight-modules/scoped-grant` v2 (counterparty lock, cascade revocation), `merkle-membership`-style level commitments |
| `abuse_escrow.compact` | The product moat: refundable bonds before contact, slashing to per-card victim safety pools, repeat-offender surcharges. | engine key-commitment identity; keeper epochs |

The relay enforces BOTH: a live contact grant AND (if the card requires it) a
live bond. Compact contracts don't call each other in v1 — the relay is the glue.

## `archive/` — the 2025 hackathon contracts (do NOT use as reference)

`SelectConnect.compact`, `SelectConnectMVP.compact`, `SelectConnectProtocol.compact`,
`AbuseEscrow.compact` predate the engine and use syntax that no longer compiles
on 0.31.1 (`let` locals, module-level `const`, tuple-valued maps, free-function
ledger ops). The v2 rewrite also fixed three real security holes:
sender-supplied reputation commitments, a caller-supplied `authorizerIsAdmin`
boolean on refunds, and one-bond-per-sender-forever bond ids.

## Compile

```bash
compact compile contracts/contact_grant.compact build/contact-grant
compact compile contracts/abuse_escrow.compact build/abuse-escrow
```
