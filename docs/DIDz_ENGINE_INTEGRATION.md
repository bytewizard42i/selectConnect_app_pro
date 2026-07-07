# SelectConnect on the DIDz Engine

> **Status**: Decision record + build path, July 5, 2026
> **Question answered**: "Do we already have the engine for SelectConnect in
> DIDz / AgenticDID / RWAz, or should we build it separately?"

## Verdict

**The engine already exists. Do not rebuild it. Do not merge SelectConnect into
the protocol repos either.** SelectConnect stays in its own repo as the first
paying consumer product of the DIDz engine, importing `midnight-modules` and
keeping only its product-specific differentiators.

A SelectConnect contact link IS a scoped grant:

```text
SelectConnect concept          DIDz engine primitive (midnight-modules)
---------------------          -----------------------------------------
contact card                   identity anchor (DIDz; later full DIDzIdentity)
access link for one person     scoped-grant: scope=contact:reveal,
                               counterparty-locked to that person,
                               expiring, revocable
"revoke this creep's access"   revoke_grant (cascades if they re-shared)
progressive reveal levels      merkle-membership (already used) + per-level
                               scopes (contact:reveal:L1, :L2, ...)
one-time access codes          commitment-nullifier
admin control of a card        access-control ownership pattern
abuse bond / slashing          SelectConnect-SPECIFIC (its moat, keep here)
relay + reputation             SelectConnect-SPECIFIC (off-chain, keep here)
```

## What this means for the existing contracts

The four current contracts (`SelectConnect.compact`, `SelectConnectMVP.compact`,
`SelectConnectProtocol.compact`, `AbuseEscrow.compact`) predate the engine and
reimplement link issuance/expiry/revocation by hand (and use older syntax, e.g.
`let`, that no longer compiles on 0.31.1). The refactor path:

1. **Keep**: `AbuseEscrow` economics, progressive-reveal UX, relay service,
   the product surface. This is the moat and the monetization.
2. **Replace**: hand-rolled link lifecycle with `scoped-grant` v2 ,
   per-accessor links become counterparty-locked grants; card policy knobs
   (bond required, reveal delay) ride the custom-constraints extension slot.
3. **Adopt later, incrementally**: full DIDz identity anchoring (cards bound to
   a DIDz), KYCz credentials for verified-human cards, AgenticDID for
   agent-mediated introductions, POL freshness for high-trust contexts.

## Why this is the profitable finite path

- **Smallest possible build**: SelectConnect ships on proven, compiled engine
  modules instead of maintaining ~1,900 lines of bespoke contract code.
- **Revenue first**: bonds, premium cards, and event/enterprise deals monetize
  now and help finance the larger DIDz protocol.
- **Upgrade optionality**: because links are grants, every future DIDz
  capability (credentials, POL, agent delegation) plugs in without re-architecting.
- **Ecosystem flywheel**: the same grant engine powers EventRevolution
  (attendee access), ProMingle and SouLink (introduction/disclosure grants) ,
  SelectConnect is the beachhead product that proves it in market.

## Order of work

1. `contact_grant.compact` in this repo: thin wrapper over `scoped-grant` v2
   semantics for contact links (compile-validated on 0.31.1).
2. Port `AbuseEscrow` to current syntax; wire bond-required as a critical
   custom constraint on the grant.
3. Retire `SelectConnectMVP` / `SelectConnectProtocol` to an `archive/`
   folder (history preserved, not deleted).
4. Demo flow: create card -> issue counterparty-locked contact grant ->
   progressive reveal -> revoke.

## Sources of truth used

- `midnight-modules/modules/scoped-grant/` (engine v2, compiled 0.31.1, full ZK keys)
- `midnight-expert` compact-core skills (syntax/patterns verification)
- docs.midnight.network (Compact reference)
- Beware stale local docs: the pre-2026 SelectConnect contracts and tutorials
  in this repo use deprecated syntax and should not be treated as reference.
