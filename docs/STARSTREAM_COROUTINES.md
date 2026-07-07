# SelectConnect × Starstream Coroutines

**Date**: March 24, 2026
**Authors**: Cassie + John
**Reference**: Sebastien Guillemot (CTO, Midnight Foundation), Starstream zkVM

---

## Why Starstream Matters for SelectConnect

SelectConnect's core innovation is **progressive reveal**, anonymous parties gradually disclose identity through staged interactions, protected by abuse bonds and pseudonymous reputation. This is inherently a **multi-step, pausable workflow**, exactly what Starstream coroutines are designed for.

---

## Current Architecture vs. Starstream

### Current: Discrete State Machine

Each stage of the reveal is a separate circuit call with its own proof:

```
Circuit 1: initiateContact()     → Proof₁ on-chain
Circuit 2: respondToContact()    → Proof₂ on-chain
Circuit 3: signalInterest()      → Proof₃ on-chain
Circuit 4: revealDomain()        → Proof₄ on-chain
Circuit 5: revealCredentials()   → Proof₅ on-chain
Circuit 6: revealIdentity()      → Proof₆ on-chain
Circuit 7: fullDisclosure()      → Proof₇ on-chain

Total: 7 proofs, 7 on-chain verifications per connection
```

### Starstream: Single Coroutine with Proof Folding

```
Coroutine: ProgressiveReveal
├── PAUSE: Party A initiates (abuse bond posted)
├── RESUME: Party B responds (abuse bond posted)
├── PAUSE: Mutual interest signal
├── RESUME: Domain-level reveal
├── PAUSE: Credential exchange
├── RESUME: Identity reveal
├── COMPLETE: Full disclosure + agreement
└── FOLD: Single ~16 KB proof covers entire 7-step flow

Total: 1 folded proof, 1 on-chain verification per connection
```

### Impact

| Metric | Current | Starstream |
|--------|---------|-----------|
| On-chain proofs per connection | 7 | 1 |
| On-chain verification cost | 7× base | 1× base |
| Proof size total | ~112 KB | ~16 KB |
| Browser compatibility | Requires proof server | Native browser generation |
| Abort handling | Complex rollback logic | Coroutine cancellation + bond return |

---

## Abuse Bond Enhancement

Starstream coroutines make abuse bonds smarter:

- **Bond posted at coroutine start**, locked for the duration
- **If either party aborts mid-coroutine**, the coroutine's folded proof up to that point proves who abandoned, and the bond is forfeit
- **If both complete**, bonds return automatically at coroutine completion
- **No separate bond management circuit needed**, it's embedded in the coroutine flow

---

## Browser-Generated Proofs for SelectConnect

SelectConnect's privacy model requires that proofs are generated client-side (the relay never sees plaintext). Starstream's browser proof generation (~16 KB) eliminates the current dependency on a local proof server:

- **Current**: `start-proof-server.sh` runs a local process
- **Starstream**: Proof generation happens in the browser tab via WASM
- **Result**: SelectConnect works on any device with a modern browser, phones, tablets, Chromebooks

---

## SharedScience Integration (Starstream-Aware)

SharedScience's disclosure protocol is proposed as a thin wrapper around SelectConnect's progressive reveal (see `SELECTCONNECT_INTEGRATION.md` in SharedScience). With Starstream, both systems share the **same coroutine pattern**:

```
SelectConnect Coroutine (base layer)
└── SharedScience Disclosure Coroutine (extends with domain taxonomy + capability matching)
    └── CareToCoin Funding Coroutine (extends with milestone-linked disbursement)
```

One nested coroutine chain. One folded proof. Full lifecycle from anonymous discovery to funded research collaboration.

---

## Migration Path

1. **Now**: Current Compact v0.29.0 contracts continue to work
2. **When Starstream stabilizes**: Refactor `progressive-reveal` circuits into a single coroutine
3. **Proof folding**: Replace multi-proof verification with single folded proof
4. **Browser proofs**: Remove proof server dependency, update frontend to use WASM prover

---

*Cross-pollinated with SharedScience, CareToCoin, and health data repos, Cassie + John, March 24, 2026*
