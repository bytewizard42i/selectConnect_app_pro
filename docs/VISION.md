# SelectConnect — Vision & Strategy

> **One primitive. Infinite applications.**
> *"Person A wants to contact Person B. B sets the rules. A puts skin in the game."*

**Version**: 1.0  
**Date**: March 24, 2026  
**Authors**: John ([@bytewizard42i](https://github.com/bytewizard42i)) · Penny 🎀 (AI Assistant)

---

## Table of Contents

1. [The Core Insight](#1-the-core-insight)
2. [What SelectConnect Really Is](#2-what-selectconnect-really-is)
3. [The Standalone MVP](#3-the-standalone-mvp)
4. [Market Strategy](#4-market-strategy)
5. [Revenue & Financialization](#5-revenue--financialization)
6. [The Module Play: Bootstrapping Everything](#6-the-module-play-bootstrapping-everything)
7. [Competitive Landscape](#7-competitive-landscape)
8. [Build Priority & Roadmap](#8-build-priority--roadmap)
9. [Why This Wins](#9-why-this-wins)

---

## 1. The Core Insight

Every digital interaction between strangers has the same unsolved problem:

**The person being contacted bears 100% of the cost.**

- They get the spam.
- They get the harassment.
- They waste time screening.
- They risk their safety.

The person *initiating* contact pays nothing. Zero skin in the game.

SelectConnect flips this with one simple rule: **the initiator stakes value before contact is made.** If the interaction is genuine, they get it back. If it's abuse, they lose it.

That's not a feature. That's a **protocol primitive** — as fundamental as HTTP is to the web. Every platform that involves strangers contacting each other needs this.

---

## 2. What SelectConnect Really Is

### Not an App. A Protocol Layer.

Strip away the DIDz ecosystem, the hackathon polish, the 22 ZK circuits. At its core, SelectConnect is three things:

| Primitive | What It Does | Why It Matters |
|-----------|-------------|----------------|
| **Bonded Contact** | Initiator stakes value to request contact | Eliminates spam economically — not with filters, not with AI, but with money |
| **Progressive Reveal** | Recipient controls what info is shared and when | Replaces the binary "share everything or nothing" with granular control |
| **Pseudonymous Reputation** | Track behavior patterns without revealing identity | Bad actors get caught without anyone getting doxxed |

These three primitives compose into every contact scenario that exists:

```
Bonded Contact + Progressive Reveal = Safe networking
Bonded Contact + Reputation = Spam-proof DMs
Progressive Reveal + Reputation = Trust-building dating
All three = SelectConnect Protocol
```

### Why Zero-Knowledge Proofs Matter Here

ZK isn't a buzzword for SelectConnect — it's structurally necessary:

- **Bonds** need to be verifiable without revealing who posted them
- **Reputation** needs to track patterns without linking to real identity
- **Progressive reveal** needs cryptographic guarantees that data isn't leaked early
- **Slashing** needs provable evidence without exposing private messages

Midnight's dual-ledger (public + private) is uniquely suited: bond amounts are public (verifiable), but who bonded whom is private.

---

## 3. The Standalone MVP

### What Ships First

The smallest useful product that proves the thesis. No DIDz dependency. No ecosystem complexity. Just the core loop:

```
Create Card → Share Link/QR → Someone Bonds → You Reveal (or don't) → Bond Resolves
```

### MVP Feature Set

**For the Card Creator (Recipient):**
- Sign in with Midnight wallet (Lace)
- Create a contact card with a display name
- Set bond amount (suggested: $1–$5 equivalent in tDUST/ADA)
- Configure 2–3 reveal levels (e.g., Name → LinkedIn → Email → Phone)
- Get a shareable link + QR code
- Dashboard showing: pending requests, active connections, bond income from slashes

**For the Contactor (Initiator):**
- Click/scan the link
- See the card (display name + bond requirement)
- Connect wallet, post bond
- See Level 1 info immediately
- Request next levels (card owner approves/denies)
- Bond auto-refunds after 30 days if no issues

**For Disputes:**
- Card owner can slash a bond (with evidence hash)
- Slashed funds go to safety pool
- Initiator's pseudonymous reputation takes a hit
- Repeat offenders face escalating bond requirements automatically

### MVP Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Smart Contract** | Compact on Midnight | Core bond + reveal logic (trim to ~300 lines from current 900+) |
| **Frontend** | React + Vite + Tailwind | Fast, modern, mobile-responsive |
| **Wallet** | Lace browser extension | Standard Midnight wallet |
| **QR Codes** | qrcode.react | Already in the repo |
| **Hosting** | Vercel or Netlify | Free tier handles MVP traffic |

### What Gets Cut from Current Repo

The current `SelectConnectProtocol.compact` has 22 circuits. The MVP needs **8**:

| Keep | Circuit | Purpose |
|------|---------|---------|
| ✅ | `createCard` | Create a contact card |
| ✅ | `postBond` | Stake value to request contact |
| ✅ | `refundBond` | Return bond after good interaction |
| ✅ | `slashBond` | Penalize abuse |
| ✅ | `addRevealLevel` | Configure progressive reveal |
| ✅ | `accessNextLevel` | Unlock next reveal tier |
| ✅ | `generateAccessLink` | Create shareable link with TTL |
| ✅ | `revokeLink` | Cut off access |

**Cut for MVP** (add back in v2):
- Privacy routing (5-digit codes) — nice to have, not essential
- Credential management — requires DIDz integration
- Card suspension/reactivation — just use revoke for now
- Pseudonym updates — edge case
- Spam reporting via routes — MVP uses direct slashing

### MVP Contract: ~300 Lines

A lean version of the contract focusing only on the 8 essential circuits, with simplified state. No credential management, no privacy routing, no card lifecycle beyond create/revoke.

---

## 4. Market Strategy

### Beachhead: Conference Networking

**Why conferences first:**
- **Acute pain point**: 60% of women report post-conference harassment
- **Concentrated users**: 500–5,000 people in one place for 3 days
- **Built-in virality**: "Scan my SelectConnect" replaces "here's my card"
- **Easy partnership**: Conference organizers are desperate for safety solutions
- **Time-boxed**: Cards expire after the event — low commitment for first-time users

**Go-to-market:**
1. Partner with 3–5 tech conferences (DevCon, Consensus, Midnight Vegas)
2. Offer free SelectConnect cards to all attendees
3. Conference sponsors subsidize bonds (their logo on the card = advertising)
4. Post-conference report: "X connections made, Y harassment attempts blocked, Z bonds slashed"

**Unit economics at a conference:**
- 2,000 attendees, 30% adoption = 600 users
- Average 5 connections each = 3,000 bond transactions
- Average bond: $2.00
- Platform fee: 5% = $0.10 per transaction
- Revenue per conference: **$300** (tiny, but the data and brand value are enormous)

### Expansion Path

| Phase | Market | Why Now | Bond Range |
|-------|--------|---------|-----------|
| **1** | Tech conferences | Acute pain, concentrated users, built-in virality | $1–$5 |
| **2** | Creator/influencer DMs | Creators drowning in DMs, willing to pay for filtering | $2–$20 |
| **3** | Dating safety | Post-Tinder safety anxiety, regulatory pressure on platforms | $3–$10 |
| **4** | Professional services intake | Lawyers, doctors, consultants screening clients | $10–$50 |
| **5** | Social media DM filtering | Platform-level integration, billions of DMs per day | $0.10–$5 |
| **6** | Enterprise sales | Lead qualification, account-based marketing | $25–$100 |

### The Network Effect

SelectConnect gets more valuable with adoption:

```
More users → More reputation data → Better spam detection → Safer platform → More users
     ↑                                                                              │
     └──────────────────────────────────────────────────────────────────────────────┘
```

**Cross-platform reputation** is the killer feature. A harasser slashed at a conference carries that reputation hit to dating, to DMs, to professional outreach. They can't just create a new account — their pseudonymous fingerprint follows them within contexts.

---

## 5. Revenue & Financialization

### Revenue Model: Multi-Layer

#### Layer 1: Transaction Fees (Core)

| Fee Type | Rate | When | Volume Driver |
|----------|------|------|--------------|
| Bond processing | 3–5% | Every bond posted | Scales with user growth |
| Slash distribution | 10% | Bond slashed (rest goes to safety pool) | Scales with bad actors |
| Premium bonds | 5% | Higher-value professional bonds | Enterprise market |

**Example**: 100,000 active users × 10 bonds/month × $3 average × 4% fee = **$120,000/month**

#### Layer 2: Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 1 card, 3 reveal levels, basic dashboard |
| **Pro** | $9/month | 5 cards, unlimited reveal levels, analytics, custom branding, priority support |
| **Creator** | $19/month | Unlimited cards, audience management, bulk QR generation, webhook integrations, DM filtering API |
| **Enterprise** | $99/month | Team accounts, API access, white-label embedding, compliance reporting, SLA |

#### Layer 3: API & SDK Licensing

This is the big one. Social media platforms pay to embed SelectConnect:

| Integration | Model | Revenue Potential |
|-------------|-------|------------------|
| **SDK embed** | Per-transaction fee (1–2%) | Massive at scale — millions of DMs |
| **White-label** | Annual license ($10K–$100K/yr) | Conference platforms, dating apps |
| **API access** | Usage-based ($0.01–$0.05 per call) | Any platform integrating bond logic |

#### Layer 4: Safety Pool Treasury

Slashed bonds accumulate in the safety pool. This creates a treasury that can:
- Fund victim compensation programs
- Subsidize bonds for vulnerable populations (DV survivors, at-risk youth)
- Earn yield in DeFi (Midnight ecosystem staking)
- Fund platform development and safety research

**This is not just revenue — it's a social impact narrative that attracts grants, press, and ESG investors.**

### Financial Projections (Conservative)

| Year | Users | Monthly Revenue | Annual Revenue |
|------|-------|----------------|---------------|
| Year 1 | 10,000 | $15,000 | $180,000 |
| Year 2 | 100,000 | $150,000 | $1,800,000 |
| Year 3 | 500,000 | $600,000 | $7,200,000 |
| Year 4+ | 2,000,000+ | $2,000,000+ | $24,000,000+ |

*These are conservative. A single platform integration (e.g., a dating app with 5M users) could 10x these numbers overnight.*

---

## 6. The Module Play: Bootstrapping Everything

### The Vision: SelectConnect as Infrastructure

Just like Stripe made payments a module you embed, SelectConnect makes **safe contact** a module you embed.

```
┌─────────────────────────────────────────────────────┐
│                   YOUR PLATFORM                      │
│                                                      │
│   ┌─────────────────────────────────────────────┐   │
│   │          SelectConnect SDK                    │   │
│   │                                              │   │
│   │  bondedContact()  progressiveReveal()        │   │
│   │  checkReputation()  slashAbuse()             │   │
│   │  generateQR()  verifyBond()                  │   │
│   │                                              │   │
│   └──────────────────┬──────────────────────────┘   │
│                      │                               │
└──────────────────────┼───────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  Midnight Network │
              │  (ZK + Ledger)    │
              └──────────────────┘
```

### SDK Architecture

#### JavaScript/TypeScript SDK (`@selectconnect/sdk`)

The core module. Any web app can `npm install @selectconnect/sdk` and have bonded contact in minutes.

```typescript
import { SelectConnect } from '@selectconnect/sdk';

// Initialize with your platform API key
const sc = new SelectConnect({
  apiKey: 'sc_live_...',
  network: 'mainnet', // or 'testnet'
});

// Create a bonded contact card for a user
const card = await sc.createCard({
  displayName: 'Sarah Chen',
  bondAmount: 2.00, // USD equivalent
  revealLevels: [
    { level: 1, data: { name: 'Sarah C.' } },
    { level: 2, data: { name: 'Sarah Chen', linkedin: '...' } },
    { level: 3, data: { name: 'Sarah Chen', email: '...', phone: '...' } },
  ],
  expiresIn: '7d',
});

// Generate shareable link or QR
const link = card.getShareableLink();
const qr = card.getQRCode({ size: 256 });

// Check if someone has a bad reputation before allowing contact
const rep = await sc.checkReputation(senderPseudonym);
if (rep.slashRate > 0.1) {
  // This sender has been slashed >10% of the time — require higher bond
  card.setBondMultiplier(3);
}
```

#### React Component Library (`@selectconnect/react`)

Drop-in components for React apps:

```tsx
import { ContactCard, BondGate, RevealFlow } from '@selectconnect/react';

// Embed a contact card anywhere
<ContactCard
  userId={user.id}
  bondAmount={3.00}
  revealLevels={3}
  theme="dark"
  onBondPosted={(bond) => console.log('New contact request!')}
  onSlash={(bond) => console.log('Abuser penalized')}
/>

// Gate any content behind a bond
<BondGate amount={5.00} recipientId={creator.id}>
  <DirectMessage recipient={creator} />
</BondGate>

// Progressive reveal flow
<RevealFlow
  cardId={card.id}
  currentLevel={1}
  onReveal={(level, data) => updateUI(data)}
/>
```

#### REST API (for non-JS platforms)

```
POST   /api/v1/cards              Create a contact card
GET    /api/v1/cards/:id          Get card details
POST   /api/v1/bonds              Post a bond
DELETE /api/v1/bonds/:id          Refund a bond
POST   /api/v1/bonds/:id/slash    Slash a bond
GET    /api/v1/reputation/:id     Check sender reputation
POST   /api/v1/reveal/:cardId     Request next reveal level
```

#### Browser Extension

A browser extension that adds SelectConnect to ANY website:

- **Twitter/X DMs**: Bond-gate your DMs. Anyone can still see your tweets, but DMing costs a bond.
- **LinkedIn messages**: Filter InMail spam with economic barriers.
- **Instagram DMs**: Creators set bond requirements for fan messages.
- **Email**: Chrome extension that adds bond verification to Gmail.

This is the "Trojan horse" strategy — users install the extension, it works everywhere, platforms eventually integrate natively because their users are already using it.

#### Widget / Embed (Zero Code)

For non-developers:

```html
<!-- Drop this on any website -->
<script src="https://cdn.selectconnect.pro/widget.js"></script>
<div
  data-selectconnect
  data-user="your-wallet-address"
  data-bond="3.00"
  data-levels="3"
  data-theme="dark"
></div>
```

A Squarespace user, a WordPress blogger, a Shopify merchant — anyone can add bonded contact to their site with zero code.

### Platform Integration Playbook

| Platform Type | Integration Method | Value Proposition |
|--------------|-------------------|-------------------|
| **Social media** | SDK + API | "Eliminate DM spam without losing real connections" |
| **Dating apps** | SDK + React components | "Make your platform the safest place to date online" |
| **Conference apps** | White-label embed | "Every attendee gets safe networking built in" |
| **Creator platforms** | Browser extension + widget | "Creators monetize access while staying safe" |
| **Professional networks** | API + enterprise tier | "Qualify leads automatically with economic signals" |
| **Email providers** | Browser extension | "Bond-verified senders skip the spam filter" |
| **Messaging apps** | SDK | "Add abuse deterrence to any chat feature" |

---

## 7. Competitive Landscape

### What Exists Today

| Solution | Approach | Why It Fails |
|----------|---------|-------------|
| **Spam filters** | AI/ML classification | False positives, arms race with spammers, no deterrence |
| **CAPTCHA** | Prove you're human | Doesn't stop humans who harass, terrible UX |
| **Block/report** | Reactive moderation | Damage already done, slow response, whack-a-mole |
| **Verified badges** | Identity verification | Doesn't prevent bad behavior, just makes it traceable |
| **Paid messaging** | Pay-to-DM (Elon's X) | Money goes to platform, not victim; no refund for good actors |
| **Privacy apps** | Signal, etc. | Great encryption, zero spam prevention |

### SelectConnect's Moat

1. **Economic deterrence** — not a filter that can be bypassed, but a cost that can't be faked
2. **Refund for good actors** — unlike pay-to-DM, genuine people get their money back
3. **Pseudonymous reputation** — cross-platform tracking without doxxing (only possible with ZK)
4. **Safety pool** — slashed bonds fund safety, creating a virtuous cycle
5. **Progressive reveal** — cryptographic guarantees, not pinky promises
6. **Open protocol** — platforms integrate SelectConnect; they don't compete with it

### Why X's "Pay to DM" Proves the Market

Elon Musk's X (Twitter) introduced paid DMs in 2023. The thesis was correct: economic barriers reduce spam. But the execution was wrong:

- Money goes to X, not to the recipient
- No refund for genuine messages
- No reputation tracking
- No progressive reveal
- Centralized (X controls everything)

SelectConnect is what pay-to-DM *should have been*. The fact that X tried this validates the entire market thesis.

---

## 8. Build Priority & Roadmap

### Phase 1: Standalone MVP (6–8 weeks)

| Week | Deliverable |
|------|------------|
| 1–2 | Trim contract to MVP 8 circuits, compile, deploy to testnet |
| 3–4 | React frontend: card creation, QR generation, bond posting, reveal flow |
| 5–6 | Dashboard: pending requests, active connections, slash management |
| 7–8 | Polish, mobile responsiveness, landing page, deploy to Vercel |

**Exit criteria**: A working app where you can create a card, share a QR, someone bonds, you reveal info, you can slash bad actors. Works on mobile. Looks good.

### Phase 2: Conference Pilot (4 weeks)

| Week | Deliverable |
|------|------------|
| 9–10 | Conference-specific features: event cards, expiring links, batch QR |
| 11–12 | Partner with 1 conference, onboard 100+ users, collect data |

### Phase 3: SDK & API (6 weeks)

| Week | Deliverable |
|------|------------|
| 13–14 | Extract core logic into `@selectconnect/sdk` npm package |
| 15–16 | Build REST API + API key management |
| 17–18 | React component library + widget embed |

### Phase 4: Browser Extension (4 weeks)

| Week | Deliverable |
|------|------------|
| 19–20 | Chrome extension: bond-gate DMs on Twitter/X |
| 21–22 | Expand to LinkedIn, Instagram |

### Phase 5: Scale & Ecosystem (Ongoing)

- Platform partnerships
- Enterprise sales
- Full DIDz ecosystem integration (DIDz.io credentials, KYCz verification, SentinelDID emergency override)
- International expansion

---

## 9. Why This Wins

### The Timing Is Perfect

1. **Post-Tinder safety anxiety** — dating apps under regulatory pressure for user safety
2. **Creator economy explosion** — 50M+ creators drowning in DMs, willing to pay for filtering
3. **X's pay-to-DM precedent** — the market has been educated that economic barriers work
4. **ZK maturity** — Midnight makes privacy-preserving economic protocols actually buildable
5. **Regulatory tailwind** — EU Digital Services Act, UK Online Safety Bill — platforms MUST address harassment

### The Numbers That Matter

| Metric | Value | Source |
|--------|-------|--------|
| Global DMs sent daily | 1.6 billion+ | Platform reports |
| Women harassed via DMs | 1 in 3 | Pew Research |
| Creator time on DM management | 2+ hrs/day | Creator Economy Survey |
| Enterprise lead qualification cost | $15–$50/lead | Salesforce Research |
| Anti-harassment market (2025) | $3.2B | Grand View Research |

### The Unfair Advantage

John — you're building this on Midnight. That's not incidental. The ZK infrastructure required for pseudonymous reputation tracking, private bond management, and cryptographic progressive reveal **does not exist on any other chain in a developer-friendly form.**

Ethereum has ZK rollups for scaling. Midnight has ZK proofs for **privacy as a first-class feature**. That's a different thing entirely.

Anyone can build pay-to-DM on Ethereum. Only on Midnight can you build **private, pseudonymous, refundable, reputation-tracking bonded contact**.

---

## Appendix: DIDz Ecosystem Synergies

When SelectConnect operates standalone, it's a great product. When it plugs into the DIDz ecosystem, it becomes transformative:

| Ecosystem Product | What It Adds to SelectConnect |
|------------------|------------------------------|
| **DIDz.io** | Verified credential badges on cards ("KYC verified ✓", "Licensed attorney ✓") |
| **KYCz** | Biometric liveness — anti-catfish, anti-bot |
| **GeoZ** | Location proofs without revealing address ("Lives in Boise ✓") |
| **SentinelDID** | Emergency override for safety situations |
| **ProMingle** | Conference-native integration |
| **SouLink** | Dating-native integration with mutual progressive reveal |
| **safeHealthData** | HIPAA-compliant patient-provider contact |
| **SharedScience** | Anonymous researcher collaboration channels |
| **AgenticDID** | AI agent bonded contact (stop AI spam) |

These integrations are optional add-ons — SelectConnect works without them, but each one makes it more powerful. This is the **platform flywheel**: every new DIDz product increases SelectConnect's value, and SelectConnect increases every DIDz product's value.

---

*"Stripe didn't build e-commerce. Stripe made payments so easy that everyone else could build e-commerce. SelectConnect doesn't build social networks. SelectConnect makes safe contact so easy that every social network becomes safer."*

— Penny 🎀 & John, March 2026

---

## Document Status

| Section | Status |
|---------|--------|
| Core thesis | ✅ Complete |
| Standalone MVP spec | ✅ Complete |
| Market strategy | ✅ Complete |
| Revenue model | ✅ Complete |
| Module/SDK architecture | ✅ Complete |
| Competitive analysis | ✅ Complete |
| Build roadmap | ✅ Complete |
| Financial projections | ✅ Complete — conservative |

**Next steps**: Audit the existing Compact contract, trim to MVP 8 circuits, scaffold the standalone project.
