# HelixChain Integration (pointer)

**selectConnect** integrates with **HelixChain**, the ecosystem's
privacy-preserving data plane + AI agent (powered by
**DIDz + AgenticDID + RWAz + HelixChain**).

**This repo primarily writes:** `identities` (professional identity) +
`credentials` (verifiable professional claims / certifications) +
`agent_grants` (delegated matchmaking / introduction agents).

**Integration contract (summary):**
- every subject/holder is a 32-byte **commitment**, never a name
- use the identity layer (DIDz ⇄ tID swappable at runtime) — never hard-code a provider
- store **coarse** data only (categories, buckets) + a `*_hash` anchor
- pick the right class: **DIDz** identity / **VC** credential / **RWAz** asset / **AgenticDID** grant
  (a certification is a VC, not an asset)

**Canonical integration schema:** `helixchain/docs/HELIXCHAIN_INTEGRATION.md`
**Alternate-ID (tDIDz) scheme:** `helixchain/docs/IDENTITY_PLACEHOLDER_SCHEME.md`
(local pointer: `docs/TEMP_ID_PLACEHOLDER.md`)
