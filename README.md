# NoirCard

Privacy-first business cards with QR codes, progressive reveal, and abuse protection on Midnight.

## 🎯 What is NoirCard?

NoirCard revolutionizes business networking by providing **privacy-preserving digital business cards** that users can share via QR codes. Built on Midnight blockchain, it enables:

- **Progressive Contact Reveal**: Share information incrementally (name → email → phone)
- **Revocable Links**: Instantly revoke access to your contact information
- **Timed Policies**: Set expiration times for shared links
- **Abuse Protection**: Economic bonds deter spam and harassment
- **Pseudonymous Safety**: Track bad actors without revealing identities

## 🏗️ Architecture

### Core Components

1. **NoirCard.compact** - Main smart contract for card creation and access management
2. **AbuseEscrow.compact** - Abuse bond system for spam/harassment protection
3. **RelayService.ts** - Off-chain relay for message forwarding and bond verification
4. **NoirCardApp.tsx** - React frontend for card management and QR scanning

### Key Features

- **QR Code Generation**: Create scannable links for instant contact sharing
- **Progressive Disclosure**: Reveal contact details in stages with time delays
- **Bond-Protected Messaging**: Require economic deposits to contact card owners
- **Privacy-Preserving Tracking**: Monitor abuse without revealing real identities
- **Venue-Specific Cards**: Create context-specific business cards

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Midnight wallet
- Compact CLI v0.16.0+

### Installation

```bash
# Clone the repository
git clone https://github.com/bytewizard42i/NoirCard_me.git
cd NoirCard_me

# Install dependencies
npm install

# Compile contracts
npm run compile-contracts

# Start development server
npm run dev
```

### Usage

1. **Create a NoirCard**
   - Set your alias and contact information
   - Configure reveal levels (name, email, phone, etc.)
   - Set policies (TTL, bond requirements, revocation)

2. **Generate QR Code**
   - Create time-limited access links
   - Share QR codes at events or meetings
   - Monitor access and revoke if needed

3. **Scan & Connect**
   - Scan someone's NoirCard QR code
   - Post bond if required (anti-spam protection)
   - Progressively reveal contact information

## 🛡️ Abuse Protection System

NoirCard includes Alice's innovative **abuse bond system**:

### How It Works

1. **Bond Requirement**: Senders post small ADA deposits to contact card owners
2. **Normal Interaction**: Bonds are auto-refunded when recipients engage positively
3. **Abuse Detection**: Harassment/spam results in bond slashing
4. **Privacy Preservation**: Track bad actors pseudonymously without doxxing

### Benefits

- **Spam Deterrence**: Economic cost makes mass spamming unviable
- **Safety for Vulnerable Users**: Women, public figures get protection
- **Compensation**: Slashed bonds fund safety pools
- **Reputation System**: Repeat offenders face higher bond requirements

## 📱 Frontend Features

- **Modern UI**: Sleek dark theme with gradient backgrounds
- **QR Code Generation**: Built-in QR code creation and display
- **Progressive Reveal Interface**: Step-by-step contact disclosure
- **Bond Management**: Easy bond posting and status tracking
- **Mobile Responsive**: Works seamlessly on all devices

## 🔧 Smart Contract API

### NoirCard Contract

```typescript
// Create new business card
function createCard(alias, contactDataHash, policy, revealLevels) -> cardId

// Generate access link for QR code
function generateAccessLink(cardId, customTTL, accessorCommit) -> linkId

// Access card with progressive reveal
function accessCard(linkId, requestedLevel, accessorCommit) -> revealedData

// Revoke access link
function revokeLink(linkId)
```

### AbuseEscrow Contract

```typescript
// Post bond to contact someone
function postBond(cardId, senderCommit, amount, ttl) -> bondId

// Refund bond after normal interaction
function refundBond(bondId)

// Slash bond for abuse
function slashBond(bondId, evidenceHash, senderNull)
```

## 🌍 Use Cases

- **Conference Networking**: Safe contact exchange at events
- **Dating Apps**: Progressive reveal with abuse protection
- **Professional Services**: Client contact with spam filtering
- **Public Figures**: Fan interaction with harassment protection
- **Enterprise**: Lead generation with quality filtering

## 🔒 Privacy & Security

- **Zero-Knowledge Proofs**: Contact data encrypted until revealed
- **Pseudonymous Tracking**: Abuse detection without identity exposure
- **Revocable Access**: Instant contact information withdrawal
- **Evidence Trails**: Harassment proof without revealing content
- **Guardian System**: Community-based abuse resolution

## 📄 License

Apache License 2.0 - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and code of conduct.

---

*"Privacy-first networking for the digital age"* 🔒⚖️
