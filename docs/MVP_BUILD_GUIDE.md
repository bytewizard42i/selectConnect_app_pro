# SelectConnect MVP — Build Guide

> Practical companion to [VISION.md](./VISION.md). This document maps the
> compiler-validated `SelectConnectMVP.compact` contract to the frontend,
> API, and deployment work needed to ship a standalone product.

**Date**: March 24, 2026  
**Contract status**: ✅ Passes Compact compiler (syntax-only)  
**Contract file**: `contracts/SelectConnectMVP.compact` (532 lines, 11 circuits)

---

## What We Have vs. What We Need

### Already Built (Hackathon)

| Asset | Path | Status | Reusable? |
|-------|------|--------|-----------|
| Full Compact contract (22 circuits) | `contracts/SelectConnectProtocol.compact` | ❌ Won't compile (see CONTRACT_AUDIT.md) | Reference only |
| MVP Compact contract (11 circuits) | `contracts/SelectConnectMVP.compact` | ✅ Compiles | **Ship this** |
| AbuseEscrow contract | `contracts/AbuseEscrow.compact` | ❓ Not audited | Defer to v2 |
| Next.js pages | `pages/index.js` | ⚠️ Tied to old contract | Partially — UI layout reusable |
| NoirCardApp component | `frontend/NoirCardApp.tsx` | ⚠️ 29KB, tightly coupled | Partially — card rendering reusable |
| Midnight API connector | `lib/midnight-api.ts` | ⚠️ Uses old function signatures | Needs update for `.member()`/`.lookup()` calls |
| Mesh connector | `lib/mesh-connector.ts` | ⚠️ CardanoMeshProvider | Needs update for current Midnight SDK |
| TypeScript types | `types/midnight.d.ts` | ⚠️ Old contract shape | Regenerate from MVP contract |
| Demo server | `demo/server.js` | ✅ Good reference | Keep for demo mode |
| Test scenarios | `tests/scenarios/` | ⚠️ Old contract | Update for MVP circuits |
| Docker configs | `docker-compose*.yml` | ✅ Functional | Keep |
| QR code generation | Used in demo | ✅ Works | Keep |

### Needs Building

| Component | Priority | Effort | Notes |
|-----------|----------|--------|-------|
| **Deploy MVP contract to testnet** | P0 | 1 day | Compile with ZK, deploy via `compactc` |
| **Regenerate TS types from MVP** | P0 | 1 hour | `compactc` generates contract types |
| **Update midnight-api.ts** | P0 | 2 days | Wire to new 11-circuit contract |
| **Card creation flow** | P0 | 2 days | Form → `createCard()` → QR/link |
| **Bond posting flow** | P0 | 2 days | Scan QR → `postBond()` → wait for reveal |
| **Reveal flow** | P1 | 2 days | `addRevealLevel()` + `accessNextLevel()` |
| **Slash/refund dashboard** | P1 | 1 day | Admin view → `slashBond()`/`refundBond()` |
| **Landing page** | P1 | 1 day | Marketing page explaining the product |
| **Mobile responsiveness** | P2 | 1 day | Tailwind responsive breakpoints |
| **Wallet connection (Lace)** | P0 | 1 day | Standard Midnight wallet flow |

---

## Circuit → UI Mapping

Each MVP circuit needs a corresponding frontend flow:

### Circuit 1: `createCard`

**UI**: Card creation wizard  
**Flow**: Admin fills form → connects wallet → signs transaction → gets card ID + QR code

```
[Form]                          [Contract]              [Result]
┌─────────────────┐             ┌──────────────┐        ┌──────────────┐
│ Display name     │─aliasHash─→│              │        │ Card ID      │
│ Require bond? ☑ │─reqBond───→│  createCard() │───────→│ QR Code      │
│ Min bond: $3    │─minBond───→│              │        │ Share Link   │
└─────────────────┘             └──────────────┘        └──────────────┘
```

**Existing code to reuse**: `frontend/NoirCardApp.tsx` card rendering, `pages/index.js` form layout

### Circuit 2: `postBond`

**UI**: Bond posting page (reached via QR/link scan)  
**Flow**: Visitor scans QR → sees card → connects wallet → posts bond → waits

```
[Scanned Card]                  [Contract]              [Result]
┌─────────────────┐             ┌──────────────┐        ┌──────────────┐
│ "Sarah C."      │             │              │        │ Bond ID      │
│ Bond: $3.00     │─amount────→│  postBond()   │───────→│ Status: POSTED│
│ [Post Bond]     │─ttl───────→│              │        │ Waiting...   │
└─────────────────┘             └──────────────┘        └──────────────┘
```

### Circuits 3–4: `refundBond` / `slashBond`

**UI**: Admin dashboard — pending bonds list  
**Flow**: Admin reviews bond → approves (refund) or reports (slash)

```
[Admin Dashboard]               [Contract]              [Result]
┌─────────────────┐             ┌──────────────┐        ┌──────────────┐
│ Bond from xyz   │             │ refundBond()  │───────→│ REFUNDED     │
│ Amount: $3.00   │──bondId───→│   — or —      │        │   — or —     │
│ [✓ Approve]     │             │ slashBond()   │───────→│ SLASHED      │
│ [✗ Report]      │             └──────────────┘        │ → safety pool│
└─────────────────┘                                     └──────────────┘
```

### Circuit 5: `addRevealLevel`

**UI**: Card settings — reveal level editor  
**Flow**: Admin adds levels (Name → LinkedIn → Email → Phone)

```
[Level Editor]                  [Contract]
┌─────────────────┐             ┌──────────────────┐
│ Level 1: Name   │─levelData─→│ addRevealLevel()  │
│ Level 2: LinkedIn│            │ addRevealLevel()  │
│ Level 3: Email  │            │ addRevealLevel()  │
│ [+ Add Level]   │            └──────────────────┘
└─────────────────┘
```

### Circuit 6: `accessNextLevel`

**UI**: Recipient view — progressive reveal  
**Flow**: Recipient with active link unlocks next tier

```
[Recipient View]                [Contract]              [Result]
┌─────────────────┐             ┌──────────────────┐    ┌──────────────┐
│ Level 1: ✓ Name │             │                  │    │ Level 2 data │
│ Level 2: 🔒    │──linkId───→│ accessNextLevel() │───→│ (decrypted   │
│ [Unlock Next]   │             │                  │    │  off-chain)  │
└─────────────────┘             └──────────────────┘    └──────────────┘
```

### Circuit 7: `generateAccessLink`

**UI**: Share dialog — generates link/QR for a specific recipient  
**Flow**: Admin shares card → generates time-limited link

### Circuit 8: `revokeLink`

**UI**: Admin dashboard — active links list  
**Flow**: Admin selects a link → revokes it

---

## File Structure for MVP

```
selectConnect/
├── contracts/
│   ├── SelectConnectMVP.compact     ← ✅ Ship this
│   ├── SelectConnectProtocol.compact ← Reference (won't compile)
│   ├── AbuseEscrow.compact          ← Defer to v2
│   └── SelectConnect.compact        ← Legacy
│
├── src/                              ← NEW: Clean source directory
│   ├── api/                          ← API routes (Next.js API)
│   │   ├── cards.ts                  ← createCard, getCard
│   │   ├── bonds.ts                  ← postBond, refundBond, slashBond
│   │   ├── links.ts                  ← generateAccessLink, revokeLink
│   │   └── reveal.ts                ← addRevealLevel, accessNextLevel
│   │
│   ├── components/                   ← React components
│   │   ├── CardCreator.tsx           ← Card creation wizard
│   │   ├── CardViewer.tsx            ← Public card view (for bond posting)
│   │   ├── BondManager.tsx           ← Admin bond approve/slash dashboard
│   │   ├── RevealEditor.tsx          ← Admin reveal level editor
│   │   ├── RevealViewer.tsx          ← Recipient progressive reveal
│   │   ├── LinkManager.tsx           ← Admin link management
│   │   ├── QRShare.tsx               ← QR code generation + share dialog
│   │   ├── WalletConnect.tsx         ← Lace wallet connection
│   │   └── Layout.tsx                ← Shared layout (nav, footer)
│   │
│   ├── lib/                          ← Core library
│   │   ├── contract.ts               ← MVP contract interface (auto-generated types)
│   │   ├── wallet.ts                 ← Wallet connection + transaction signing
│   │   ├── crypto.ts                 ← Off-chain encryption for reveal data
│   │   └── qr.ts                     ← QR code generation utilities
│   │
│   ├── pages/                        ← Next.js pages
│   │   ├── index.tsx                 ← Landing page
│   │   ├── create.tsx                ← Card creation
│   │   ├── card/[id].tsx             ← Public card view + bond posting
│   │   ├── dashboard.tsx             ← Admin dashboard
│   │   └── link/[id].tsx             ← Recipient progressive reveal
│   │
│   └── styles/                       ← Tailwind CSS
│       └── globals.css
│
├── docs/                             ← Documentation
│   ├── VISION.md                     ← Protocol thesis + market strategy
│   ├── ECOSYSTEM_INTEGRATIONS.md     ← DIDz ecosystem integration map
│   ├── CONTRACT_AUDIT.md             ← Full contract audit findings
│   └── MVP_BUILD_GUIDE.md           ← This file
│
├── demo/                             ← Demo mode (no wallet needed)
│   ├── server.js                     ← Existing demo server
│   └── selectconnect-demo.js         ← Existing demo script
│
├── tests/                            ← Test suites
│   ├── contract/                     ← Contract integration tests
│   │   ├── createCard.test.ts
│   │   ├── postBond.test.ts
│   │   ├── slashRefund.test.ts
│   │   └── revealFlow.test.ts
│   └── scenarios/                    ← Existing scenario tests
│
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json                     ← NEW: TypeScript config
├── .env.example
└── README.md
```

---

## Build Order

### Sprint 1: Contract Deployment (Week 1–2)

1. **Full compile** MVP contract with ZK circuit generation (`compactc --full`)
   - Requires Skylake+ CPU (NOT Chuck — use artpro or cloud)
2. **Deploy to testnet** via Midnight CLI
3. **Generate TypeScript types** from compiled contract
4. **Create `src/lib/contract.ts`** — typed wrapper around deployed contract

### Sprint 2: Core UI (Week 3–4)

1. **WalletConnect.tsx** — Lace wallet connection
2. **CardCreator.tsx** — Card creation form → `createCard()` → QR
3. **CardViewer.tsx** — Scan QR → see card → `postBond()`
4. **QRShare.tsx** — QR code generation + shareable link

### Sprint 3: Bond Management (Week 5–6)

1. **BondManager.tsx** — Admin dashboard showing pending bonds
2. Wire up `refundBond()` and `slashBond()`
3. **Safety pool display** via `getSafetyPool()`
4. **Reputation display** — show sender slash history

### Sprint 4: Progressive Reveal (Week 7–8)

1. **RevealEditor.tsx** — Admin adds reveal levels with off-chain encryption
2. **RevealViewer.tsx** — Recipient unlocks levels progressively
3. Wire up `addRevealLevel()`, `accessNextLevel()`, `generateAccessLink()`
4. **LinkManager.tsx** — Admin manages/revokes active links

### Sprint 5: Polish (Week 9–10)

1. Landing page
2. Mobile responsiveness
3. Error handling + loading states
4. Deploy frontend to Vercel/Netlify

---

## Environment Setup

```bash
# Clone and install
cd /home/js/DIDzMonolith/selectConnect
npm install

# Start local Midnight node (if available)
# Or use testnet config in .env

# Compile MVP contract (requires Skylake+ CPU)
npx compactc contracts/SelectConnectMVP.compact --output build/

# Start dev server
npm run dev
```

### Required `.env` variables

```env
# Midnight Network
MIDNIGHT_NETWORK=testnet
MIDNIGHT_NODE_URL=https://rpc.testnet.midnight.network
MIDNIGHT_INDEXER_URL=https://indexer.testnet.midnight.network

# Contract (after deployment)
CONTRACT_ADDRESS=<deployed-address>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| **Framework** | Next.js (existing) | Already set up, SSR for SEO |
| **Styling** | Tailwind CSS (existing) | Already configured |
| **Wallet** | Lace browser extension | Standard Midnight wallet |
| **QR Codes** | qrcode.react | Already in dependencies |
| **Off-chain encryption** | tweetnacl | Lightweight, for reveal data |
| **State management** | React Context + hooks | Simple for MVP, no Redux needed |
| **Contract types** | Auto-generated from compactc | Ensures type safety |

---

## Migration from Hackathon Code

The hackathon code (`pages/index.js`, `frontend/NoirCardApp.tsx`, `lib/*.ts`) was built against the old 22-circuit contract. For the MVP:

1. **Don't delete** the hackathon code — it's good reference
2. **Build new** in `src/` directory alongside existing code
3. **Update `next.config.js`** to use `src/` as the source directory
4. **Gradually migrate** reusable UI components from `frontend/` to `src/components/`

This avoids breaking the existing demo while building the new MVP.

---

*Build guide by: Penny 🎀 · March 24, 2026*
