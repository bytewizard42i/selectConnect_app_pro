# SelectConnect — Ecosystem Integration Map

*SelectConnect is the universal privacy-preserving connection layer for the DIDz ecosystem. Every product that involves one person contacting, connecting with, or revealing information to another can use SelectConnect's progressive reveal, abuse bonds, and privacy routing.*

**Date**: March 22, 2026

---

## Integration Summary

| Product | Integration Type | Key Feature | Doc |
|---------|-----------------|-------------|-----|
| **DIDz.io** | Identity foundation | ZK-verified credential badges on cards, biometric anti-catfish, portable reputation | `DIDz-io/docs/SELECTCONNECT_IDENTITY_INTEGRATION.md` |
| **ProMingle** | Professional invitations | Bond-gated connection requests, conference QR networking, recruiter filtering, HuddleBridge speaker follow-up | `ProMingle/docs/SELECTCONNECT_INTEGRATION.md` |
| **SouLink** | Dating connections | Mutual progressive reveal, anti-catfish verification, breakup revocation, compatibility ZK proofs, photo watermarking | `SouLink/docs/SELECTCONNECT_INTEGRATION.md` |
| **safeHealthData** | Patient-provider contact | Progressive health data sharing, emergency disclosure | `safeHealthData/docs/SENTINELDID_EMERGENCY_PROTOCOL.md` |
| **CareToCoin** | Donor-charity communication | Privacy-preserving donor outreach, bonded charity contact | `CareToCoin/docs/MIDNIGHT_MIGRATION_ROADMAP.md` |
| **SharedScience** | Researcher collaboration | Anonymous inquiry channels, staged disclosure (already uses same 5-stage pattern) | `sharedScience_me/README.md` |
| **PopCork** | Event networking | QR check-in, speed-networking privacy routes, post-event follow-up | Via ProMingle + SouLink integrations |
| **HuddleBridge** | Video spaces | Speaker-attendee bonded networking, video date safety, soulbound participation | Via ProMingle + SouLink integrations |

---

## What SelectConnect Provides to the Ecosystem

| Feature | Circuit | Who Uses It |
|---------|---------|------------|
| **Progressive reveal** | `addRevealLevel()` + `accessNextLevel()` | All products — universal pattern for staged information sharing |
| **Abuse bonds** | `postBond()` + `slashBond()` + `refundBond()` | ProMingle (spam filtering), SouLink (harassment deterrence), CareToCoin (donor filtering) |
| **Privacy routing** | `generatePrivacyRoute()` + `accessViaPrivacyRoute()` | Conference networking (5-digit codes), event check-ins, anonymous inquiries |
| **Pseudonymous tracking** | `sender_reputation` ledger | Cross-platform repeat offender detection without revealing identity |
| **Time-limited access** | `generateAccessLink()` with TTL | Event-specific connections that auto-expire |
| **Revocable links** | `revokeLink()` | Dating breakups, ended business relationships, HIPAA access revocation |
| **Safety pool** | `safety_pools` ledger | Slashed bonds fund platform safety across all contexts |
| **Rescindable credentials** | `issueCredential()` + `rescindCredential()` | Professional certifications, medical licenses, employment verification |

---

## What the Ecosystem Provides Back to SelectConnect

| Product | What It Adds | Circuit/Feature |
|---------|-------------|----------------|
| **DIDz.io** | Verified credential badges | `proveAgeAtLeast()`, `proveKycPassed()`, `proveComposite()` |
| **KYCz** | Biometric liveness ("real human ✓") | 8-factor liveness score — anti-catfish, anti-bot |
| **GeoZ** | Location proofs ("Lives in [City] ✓") | Privacy-preserving geolocation without revealing address |
| **SentinelDID** | Emergency workforce credentials | Verified first responder/EMT for emergency health data access |
| **HuddleBridge** | Video verification + soulbound participation | Prove you attended an event/had a video call |
| **MidnightVitals** | Diagnostics | Monitor SelectConnect contract health, proof server performance |

---

## The Pattern: SelectConnect as a Protocol Layer

SelectConnect isn't just one app — it's a **protocol** that any DIDz ecosystem product can embed:

```
Any DIDz Product
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
     └── Needs to track bad actors without revealing identity?
         └── Use SelectConnect pseudonymous reputation
```

---

*Cross-pollination by: Penny 🎀*
