# 📡 Project Beacons, Integration with EventRevolution

> **Source of truth:** [`EventRevolution/docs/PROJECT_BEACONS.md`](https://github.com/bytewizard42i/DIDzMonolith/blob/main/EventRevolution/docs/PROJECT_BEACONS.md), read that first.
>
> **Inspiration video:** [Beacon Technology, Using Beacons in Proximity Marketing](https://youtu.be/2YorsgulwdU?si=UNPxybBfCewfBZnV).
>
> **Why this matters to selectConnect:** Project Beacons are a **new handshake initiator** for selectConnect. Today selectConnect handshakes start when two attendees opt in to each other; with Project Beacons, an attendee can also opt in to a **booth**, which extends the same pseudonymous-by-default protocol to attendee-↔-organization relationships.

---

## The 30-second pitch

EventRevolution gives every conference booth a BLE beacon broadcasting its own URL. The attendee app harvests these URLs and the AI agent ranks them by relevance. When an attendee taps **"I'm interested"** on a project card, that tap initiates a **selectConnect handshake to the booth's representative**, pseudonymous on the attendee's side, opt-in disclosure if the booth chooses to follow up later.

This makes selectConnect the canonical follow-up rail for booth interactions: no more business-card piles, no LinkedIn QR awkwardness, no premature identity exposure.

---

## How Project Beacons trigger selectConnect handshakes

### Tier 0 (anonymous discovery)
Attendee walks past booth → app silently logs the URL harvest in local cache. No selectConnect activity. Booth never learns anyone passed by.

### Tier 1 (attendee taps "I'm interested")
1. App generates a fresh pseudonym scoped to this booth (per existing selectConnect ephemeral-handle scheme)
2. App fires `selectConnect.requestBoothHandshake(boothSlug, ephemeralPseudonym, optInTags?)`, booth-side service receives an opaque handshake offer
3. Booth representative gets a notification: *"Attendee `zkb-7a2f` is interested in your booth. Their declared interests: [Rust, ZK]. Tap to acknowledge."*
4. Acknowledgement creates a **bilateral pseudonymous channel** that both parties can use to schedule a meeting, share materials, or escalate to Tier 2/3 disclosure later

### Tier 2 (mutual identity exchange post-event)
Either party can invoke the existing selectConnect identity-promotion flow on the bilateral channel. Standard selectConnect rules apply: both must consent, disclosure is granular, and either side can revoke at any time.

---

## Concrete integration points with selectConnect's existing primitives

| selectConnect primitive | Project Beacon usage |
|---|---|
| **Ephemeral pseudonym generation** | Per-booth pseudonyms, same attendee gets a *different* pseudonym to each booth, preventing booth-graph correlation |
| **Bilateral handshake protocol** | Reused unchanged, booth representatives are just another endpoint type |
| **Identity-tier promotion flow** | Reused unchanged, booth → attendee identity exchange follows the same rules as attendee → attendee |
| **Revocation / channel-close** | Reused unchanged, attendees can close any booth-channel without notifying the booth |
| **DIDz / KYCz linkage** | Booth representatives sign on as a **DIDz organization** (or KYCz for regulated sponsors); attendees sign on as DIDz individuals; selectConnect bridges them |

---

## Booth representative onboarding flow

1. Sponsor registers their project in DiscoveryManagement → gets a `projectId` and `slug`
2. Sponsor authorizes 1-N booth representatives' DIDs to act on behalf of the project
3. Each rep installs the EventRevolution organizer-app variant on their phone
4. The rep's app receives push notifications when an attendee fires `requestBoothHandshake` for their booth
5. The rep can acknowledge from the booth, on the showroom floor, with one tap, bilateral selectConnect channel opens

---

## Privacy guarantees this preserves

- **Booth never sees attendee identity** unless the attendee explicitly promotes the channel to Tier 2+
- **Attendee never sees booth-staff personal identity**, they see the project's DIDz org identity until staff opt to expose themselves
- **Per-booth ephemeral pseudonyms** prevent a coalition of booths from cross-correlating an attendee's interest pattern. (This is a privacy upgrade over today's badge-scan model where every booth gets the same scan ID.)
- **Channels are revocable unilaterally**, either party can close without notifying the other; matches existing selectConnect semantics

---

## Open coordination items

- [ ] Define `requestBoothHandshake(boothSlug, ephemeralPseudonym, optInTags?)` API shape
- [ ] Define booth-acknowledgement payload (signature, ack-pseudonym, opt-in-meeting-window?)
- [ ] Decide whether `optInTags` should be a free-form list or constrained to the DiscoveryManagement tag taxonomy
- [ ] Specify the rep-authorization flow: how does a sponsor delegate booth-handshake authority to staff DIDs without exposing the master org key?

---

*Maintained by Penny. Created May 5, 2026 from John's request to cross-pollinate Project Beacon technology across the DIDzMonolith subs.*
