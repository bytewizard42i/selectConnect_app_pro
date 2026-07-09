# tDIDz — Temporary Identity Placeholder (dev only)

While real Midnight **DIDz** wiring is in progress, the DIDzMonolith data plane
(HelixChain) uses a **temporary-ID authority** ("tDIDz" = temp DIDz) as a
swappable stand-in. This note exists so there is **no confusion** when you see
`TEMP-*` labels or `id_scheme = 'temp'`.

- **What it is**: a placeholder issuing labels like `TEMP-HUMAN-0001`, with
  `commitment = sha256("helix:temp:" + label)`.
- **Why**: build identity/credential/matchmaking flows now; swap to real DIDz
  with **zero business-logic changes** (runtime toggle, admin failover).
- **Not production identity.** Real DIDz commitments are non-resolvable by
  design (privacy); temp labels are a dev convenience.

## The four ecosystem classes (do NOT conflate)

Powered by **DIDz + AgenticDID + RWAz + HelixChain**:

| Class | Engine | What it is | Transferable? |
|---|---|---|---|
| Identity | **DIDz** | who/what this is | no |
| Verifiable Credential (VC) | DIDz-branch | a claim ABOUT a holder (certification, license) | no |
| Asset | **RWAz** | a thing a holder OWNS | yes |
| Grant | **AgenticDID** | what an agent may DO for you | delegated |

**Canonical spec**: `helixchain/docs/IDENTITY_PLACEHOLDER_SCHEME.md`
**Integration schema**: `helixchain/docs/HELIXCHAIN_INTEGRATION.md`
Reference implementation: `helixchain/hackathon/app/src/identity.ts`
