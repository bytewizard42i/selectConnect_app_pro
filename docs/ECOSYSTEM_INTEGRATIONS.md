# SelectConnect, Ecosystem Integration Map

> *SelectConnect is the universal privacy-preserving connection layer for the DIDz ecosystem. Every product that involves one person contacting, connecting with, or revealing information to another can use SelectConnect's progressive reveal, abuse bonds, and privacy routing.*

**Date**: March 24, 2026 (updated)  
**See also**: [VISION.md](./VISION.md), full protocol thesis, standalone MVP, market strategy, financialization

---

## Integration Summary (13 Products)

| # | Product | Integration Type | Key Feature | Integration Doc |
|---|---------|-----------------|-------------|-----------------|
| 1 | **DIDz.io** | Identity foundation | ZK-verified credential badges on cards, biometric anti-catfish, portable reputation | [`SELECTCONNECT_IDENTITY_INTEGRATION.md`](../../DIDz-io/docs/SELECTCONNECT_IDENTITY_INTEGRATION.md) |
| 2 | **ProMingle** | Professional invitations | Bond-gated connection requests, conference QR networking, recruiter filtering | [`SELECTCONNECT_INTEGRATION.md`](../../ProMingle/docs/SELECTCONNECT_INTEGRATION.md) |
| 3 | **SouLink** | Dating connections | Mutual progressive reveal, anti-catfish verification, breakup revocation, compatibility ZK proofs | [`SELECTCONNECT_INTEGRATION.md`](../../SouLink/docs/SELECTCONNECT_INTEGRATION.md) |
| 4 | **safeHealthData** | Patient-provider contact | Progressive health data sharing, referral management, emergency override | [`SELECTCONNECT_INTEGRATION.md`](../../safeHealthData/docs/SELECTCONNECT_INTEGRATION.md) |
| 5 | **AutoDiscovery** | Legal discovery contact | Attorney-witness bonded contact, expert witness discovery funnel, settlement mediation channels | [`SELECTCONNECT_INTEGRATION.md`](../../AutoDiscovery/docs/SELECTCONNECT_INTEGRATION.md) |
| 6 | **SharedScience** | Researcher collaboration | Formalize 5-stage disclosure protocol on SelectConnect base layer, anonymous inquiry channels | [`SELECTCONNECT_INTEGRATION.md`](../../sharedScience_me/docs/SELECTCONNECT_INTEGRATION.md) |
| 7 | **PopCork** | Event networking | QR check-in, speed-networking privacy routes, post-event follow-up connections | [`SELECTCONNECT_INTEGRATION.md`](../../PopCork/docs/SELECTCONNECT_INTEGRATION.md) |
| 8 | **SentinelDID** | Emergency contact | Emergency responder progressive reveal, victim data access protocol, inter-agency coordination | [`SELECTCONNECT_INTEGRATION.md`](../../SentinelDID/docs/SELECTCONNECT_INTEGRATION.md) |
| 9 | **AgenticDID** | AI agent contact | AI agent bonded outreach, trust premium economics, human-gated reveal for AI-initiated contact | [`SELECTCONNECT_INTEGRATION.md`](../../AgenticDID/docs/SELECTCONNECT_INTEGRATION.md) |
| 10 | **CareToCoin** | Donor-charity contact | Privacy-preserving donor outreach, bonded charity contact, anonymous giving channels | Referenced in [`MIDNIGHT_MIGRATION_ROADMAP.md`](../../CareToCoin/docs/MIDNIGHT_MIGRATION_ROADMAP.md) |
| 11 | **HuddleBridge** | Video spaces | Speaker-attendee bonded networking, video date safety, soulbound participation tokens | Via ProMingle + SouLink integrations |
| 12 | **petProData** | Animal care contact | Vet-owner bonded communication, rescue network progressive reveal, breeder verification | Future integration |
| 13 | **equineProData** | Equine industry contact | Buyer-seller bonded inquiry, veterinary referral chains, competition credential sharing | Future integration |

---

## What SelectConnect Provides to the Ecosystem

| Feature | Circuit | Who Uses It |
|---------|---------|------------|
| **Progressive reveal** | `addRevealLevel()` + `accessNextLevel()` | All products, universal pattern for staged information sharing |
| **Abuse bonds** | `postBond()` + `slashBond()` + `refundBond()` | ProMingle (spam filtering), SouLink (harassment deterrence), CareToCoin (donor filtering), AgenticDID (AI agent filtering) |
| **Privacy routing** | `generatePrivacyRoute()` + `accessViaPrivacyRoute()` | Conference networking (5-digit codes), event check-ins, anonymous inquiries, SharedScience channels |
| **Pseudonymous tracking** | `sender_reputation` ledger | Cross-platform repeat offender detection without revealing identity |
| **Time-limited access** | `generateAccessLink()` with TTL | Event-specific connections that auto-expire, legal discovery deadlines |
| **Revocable links** | `revokeLink()` | Dating breakups, ended business relationships, HIPAA access revocation, case closure |
| **Safety pool** | `safety_pools` ledger | Slashed bonds fund platform safety across all contexts |
| **Rescindable credentials** | `issueCredential()` + `rescindCredential()` | Professional certifications, medical licenses, employment verification, expert witness qualifications |

---

## What the Ecosystem Provides Back to SelectConnect

| Product | What It Adds | Circuit/Feature |
|---------|-------------|----------------|
| **DIDz.io** | Verified credential badges | `proveAgeAtLeast()`, `proveKycPassed()`, `proveComposite()` |
| **KYCz** | Biometric liveness ("real human ✓") | 8-factor liveness score, anti-catfish, anti-bot |
| **GeoZ** | Location proofs ("Lives in [City] ✓") | Privacy-preserving geolocation without revealing address |
| **SentinelDID** | Emergency workforce credentials | Verified first responder/EMT for emergency health data access |
| **AgenticDID** | AI agent identity proofs | Prove agent is authorized, bonded, and operating within policy |
| **AutoDiscovery** | Legal credential verification | Bar membership, expert witness qualification, court authorization |
| **HuddleBridge** | Video verification + soulbound participation | Prove you attended an event/had a video call |
| **MidnightVitals** | Diagnostics | Monitor SelectConnect contract health, proof server performance |

---

## The Pattern: SelectConnect as a Protocol Layer

SelectConnect isn't just one app, it's a **protocol** that any product (DIDz or external) can embed:

```
Any Product (DIDz or Third-Party)
     │
     ├── Needs person A to share info with person B?
     │   └── Use SelectConnect progressive reveal
     │
     ├── Needs to prevent spam/harassment?
     │   └── Use SelectConnect abuse bonds
     │
     ├── Needs event-specific temporary connections?
     │   └── Use SelectConnect privacy routes + TTL
     │
     ├── Needs verified credentials in the sharing flow?
     │   └── Use SelectConnect + DIDz credential integration
     │
     ├── Needs to track bad actors without revealing identity?
     │   └── Use SelectConnect pseudonymous reputation
     │
     ├── Needs AI agents to contact humans safely?
     │   └── Use SelectConnect + AgenticDID trust premiums
     │
     └── Needs emergency override for safety situations?
         └── Use SelectConnect + SentinelDID emergency protocol
```

### Beyond the DIDz Ecosystem

SelectConnect is designed to operate standalone as a modular SDK. See [VISION.md](./VISION.md) for:

- **`@selectconnect/sdk`**, npm package for any JavaScript app
- **`@selectconnect/react`**, drop-in React components
- **REST API**, for non-JS platforms
- **Browser extension**, bond-gate DMs on Twitter/X, LinkedIn, Instagram
- **Widget embed**, zero-code integration for any website

---

*Cross-pollination by: Penny 🎀 · Updated March 24, 2026*
