#!/usr/bin/env node

/**
 * SelectConnect Protocol Demo
 * Shows the complete workflow from card creation to progressive reveal
 */

const crypto = require('crypto');
const QRCode = require('qrcode');
const fs = require('fs');

class SelectConnectDemo {
  constructor() {
    this.proofServerUrl = 'http://localhost:6300';
    this.cards = new Map();
    this.bonds = new Map();
    this.privacyRoutes = new Map();
    this.accessLinks = new Map();
  }

  // Generate cryptographic hash
  hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Generate random bytes
  randomBytes(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate commitment (hash of data + salt)
  generateCommitment(data, salt = null) {
    const s = salt || this.randomBytes();
    return {
      commitment: this.hash(data + s),
      salt: s
    };
  }

  // Simulate ZK proof generation
  async generateMockProof(circuit, witness) {
    console.log(`🔮 Generating ZK proof for circuit: ${circuit}`);
    
    // Simulate proof generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      proof: {
        a: ['0x' + this.randomBytes(32), '0x' + this.randomBytes(32)],
        b: [['0x' + this.randomBytes(32), '0x' + this.randomBytes(32)], 
            ['0x' + this.randomBytes(32), '0x' + this.randomBytes(32)]],
        c: ['0x' + this.randomBytes(32), '0x' + this.randomBytes(32)]
      },
      publicInputs: Object.values(witness).filter(v => typeof v !== 'string' || !v.startsWith('secret_')),
      success: true
    };
  }

  // Demo Step 1: Create SelectConnect Card
  async createCard(adminName, contactInfo) {
    console.log('\n🎯 STEP 1: Creating SelectConnect Card');
    console.log('=====================================');
    
    const adminSecret = 'secret_' + this.randomBytes();
    const cardId = this.hash(adminName + Date.now());
    const aliasHash = this.hash(adminName);
    
    // Generate commitments for contact info
    const phoneCommit = this.generateCommitment(contactInfo.phone);
    const emailCommit = this.generateCommitment(contactInfo.email);
    
    const witness = {
      adminSecret,
      aliasHash,
      requiresBond: true,
      minBondAmount: 3000000, // 3 ADA in lovelace
      defaultTTL: 86400, // 24 hours
      phoneCommit: phoneCommit.commitment,
      emailCommit: emailCommit.commitment
    };

    const proof = await this.generateMockProof('createCard', witness);
    
    // Store card data
    this.cards.set(cardId, {
      adminName,
      adminSecret,
      contactInfo,
      phoneCommit,
      emailCommit,
      requiresBond: true,
      minBondAmount: 3000000,
      state: 'ACTIVE',
      createdAt: Date.now()
    });

    console.log(`✅ Card created successfully!`);
    console.log(`   Card ID: ${cardId.substring(0, 16)}...`);
    console.log(`   Admin: ${adminName}`);
    console.log(`   Bond Required: 3 ADA`);
    console.log(`   Contact commitments generated`);
    
    return cardId;
  }

  // Demo Step 2: Generate Privacy Route with QR Code
  async generatePrivacyRoute(cardId, privacyLevel = 'Personal', trackable = true) {
    console.log('\n🔐 STEP 2: Generating Privacy Route');
    console.log('===================================');
    
    const card = this.cards.get(cardId);
    if (!card) throw new Error('Card not found');

    // Generate 5-digit route code
    const routeCode = String(Math.floor(Math.random() * 90000) + 10000);
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    const witness = {
      adminSecret: card.adminSecret,
      cardId,
      privacyLevel,
      ttl: 86400,
      isTrackable: trackable,
      randomValue: this.randomBytes()
    };

    const proof = await this.generateMockProof('generatePrivacyRoute', witness);
    
    // Store privacy route
    this.privacyRoutes.set(routeCode, {
      cardId,
      privacyLevel,
      expiresAt,
      isTrackable: trackable,
      createdAt: Date.now(),
      usageCount: 0
    });

    // Generate QR code
    const qrData = {
      type: 'SelectConnect',
      version: '1.0',
      routeCode: routeCode,
      network: 'testnet'
    };
    
    const qrCodePath = `./demo/qr-${routeCode}.png`;
    await QRCode.toFile(qrCodePath, JSON.stringify(qrData));

    console.log(`✅ Privacy route generated!`);
    console.log(`   Route Code: ${routeCode}`);
    console.log(`   Privacy Level: ${privacyLevel}`);
    console.log(`   Trackable: ${trackable}`);
    console.log(`   Expires: ${new Date(expiresAt).toLocaleString()}`);
    console.log(`   QR Code saved: ${qrCodePath}`);
    
    return routeCode;
  }

  // Demo Step 3: Post Bond (Sender)
  async postBond(routeCode, senderName, message) {
    console.log('\n💰 STEP 3: Posting ADA Bond');
    console.log('============================');
    
    const route = this.privacyRoutes.get(routeCode);
    if (!route) throw new Error('Privacy route not found');
    
    const card = this.cards.get(route.cardId);
    const bondId = this.hash(senderName + routeCode + Date.now());
    const senderCommit = this.generateCommitment(senderName);
    
    const witness = {
      senderSecret: 'secret_' + this.randomBytes(),
      cardId: route.cardId,
      senderCommit: senderCommit.commitment,
      amount: card.minBondAmount,
      ttl: 86400,
      currentTimestamp: Math.floor(Date.now() / 1000)
    };

    const proof = await this.generateMockProof('postBond', witness);
    
    // Store bond
    this.bonds.set(bondId, {
      cardId: route.cardId,
      senderName,
      senderCommit,
      amount: card.minBondAmount,
      message,
      postedAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000),
      state: 'ACTIVE'
    });

    // Update route usage
    route.usageCount++;

    console.log(`✅ Bond posted successfully!`);
    console.log(`   Bond ID: ${bondId.substring(0, 16)}...`);
    console.log(`   Sender: ${senderName}`);
    console.log(`   Amount: ${card.minBondAmount / 1000000} ADA`);
    console.log(`   Message: "${message}"`);
    
    return bondId;
  }

  // Demo Step 4: Generate Access Link (Progressive Reveal)
  async generateAccessLink(bondId, recipientApproval = true) {
    console.log('\n🔗 STEP 4: Generating Access Link');
    console.log('=================================');
    
    const bond = this.bonds.get(bondId);
    if (!bond) throw new Error('Bond not found');
    
    if (!recipientApproval) {
      console.log('❌ Recipient declined contact request');
      return null;
    }

    const card = this.cards.get(bond.cardId);
    const linkId = this.hash(bondId + Date.now());
    const recipientId = this.hash(card.adminName);
    
    const witness = {
      adminSecret: card.adminSecret,
      bondId,
      recipientId,
      currentTimestamp: Math.floor(Date.now() / 1000)
    };

    const proof = await this.generateMockProof('generateAccessLink', witness);
    
    // Store access link
    this.accessLinks.set(linkId, {
      bondId,
      cardId: bond.cardId,
      recipientId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      currentLevel: 0,
      isRevoked: false,
      levelData: {
        0: { type: 'company', data: card.adminName },
        1: { type: 'linkedin', data: `linkedin.com/in/${card.adminName.toLowerCase().replace(' ', '')}` },
        2: { type: 'email', data: card.contactInfo.email, salt: card.emailCommit.salt },
        3: { type: 'phone', data: card.contactInfo.phone, salt: card.phoneCommit.salt }
      }
    });

    console.log(`✅ Access link generated!`);
    console.log(`   Link ID: ${linkId.substring(0, 16)}...`);
    console.log(`   Starting at Level 0 (Company Name)`);
    console.log(`   Progressive reveal enabled`);
    
    return linkId;
  }

  // Demo Step 5: Progressive Reveal
  async accessNextLevel(linkId, requestedLevel) {
    console.log(`\n📊 STEP 5: Accessing Level ${requestedLevel}`);
    console.log('=======================================');
    
    const link = this.accessLinks.get(linkId);
    if (!link) throw new Error('Access link not found');
    
    if (link.isRevoked) throw new Error('Access link has been revoked');
    if (Date.now() > link.expiresAt) throw new Error('Access link has expired');
    if (requestedLevel > 3) throw new Error('Invalid level requested');
    
    const levelData = link.levelData[requestedLevel];
    const witness = {
      recipientSecret: 'secret_' + this.randomBytes(),
      linkId,
      requestedLevel,
      currentTimestamp: Math.floor(Date.now() / 1000)
    };

    const proof = await this.generateMockProof('accessNextLevel', witness);
    
    // Update current level
    link.currentLevel = Math.max(link.currentLevel, requestedLevel);
    
    const levelNames = ['Company', 'LinkedIn', 'Email', 'Phone'];
    console.log(`✅ Level ${requestedLevel} (${levelNames[requestedLevel]}) revealed!`);
    console.log(`   Data: ${levelData.data}`);
    
    if (requestedLevel < 3) {
      console.log(`   Next level available: Level ${requestedLevel + 1} (${levelNames[requestedLevel + 1]})`);
    } else {
      console.log(`   🎉 Full contact information revealed!`);
    }
    
    return levelData.data;
  }

  // Demo Step 6: Report Spam (Optional)
  async reportSpam(bondId, evidenceHash) {
    console.log('\n🚨 STEP 6: Reporting Spam');
    console.log('=========================');
    
    const bond = this.bonds.get(bondId);
    if (!bond) throw new Error('Bond not found');
    
    const witness = {
      adminSecret: this.cards.get(bond.cardId).adminSecret,
      bondId,
      evidenceHash,
      currentTimestamp: Math.floor(Date.now() / 1000)
    };

    const proof = await this.generateMockProof('slashBond', witness);
    
    // Slash the bond
    bond.state = 'SLASHED';
    bond.slashedAt = Date.now();
    
    console.log(`✅ Bond slashed for spam!`);
    console.log(`   Bond ID: ${bondId.substring(0, 16)}...`);
    console.log(`   Amount slashed: ${bond.amount / 1000000} ADA`);
    console.log(`   50% to safety pool, 50% burned`);
    
    return true;
  }

  // Display system status
  displayStatus() {
    console.log('\n📈 SELECTCONNECT SYSTEM STATUS');
    console.log('==============================');
    console.log(`Cards created: ${this.cards.size}`);
    console.log(`Privacy routes: ${this.privacyRoutes.size}`);
    console.log(`Active bonds: ${Array.from(this.bonds.values()).filter(b => b.state === 'ACTIVE').length}`);
    console.log(`Access links: ${this.accessLinks.size}`);
    
    // Show proof server status
    console.log(`\n🔮 Proof Server: http://localhost:6300`);
    console.log(`📊 Bull Dashboard: http://localhost:3002`);
    console.log(`🗄️  Redis: localhost:6379`);
  }
}

// Run the demo
async function runDemo() {
  console.log('🚀 SELECTCONNECT PROTOCOL DEMO');
  console.log('===============================');
  console.log('Privacy-first contact sharing with ZK proofs and economic security\n');
  
  const demo = new SelectConnectDemo();
  
  try {
    // Step 1: Create card for Alice (Conference Speaker)
    const cardId = await demo.createCard('Alice Johnson', {
      phone: '+1-555-0123',
      email: 'alice@techcorp.com'
    });
    
    // Step 2: Generate privacy route with QR code
    const routeCode = await demo.generatePrivacyRoute(cardId, 'Personal', true);
    
    // Step 3: Bob posts bond to contact Alice
    const bondId = await demo.postBond(routeCode, 'Bob Smith', 
      'Hi Alice! Great talk at DevCon. Would love to discuss the ZK privacy features you mentioned.');
    
    // Step 4: Alice approves and generates access link
    const linkId = await demo.generateAccessLink(bondId, true);
    
    // Step 5: Progressive reveal - Bob accesses each level
    await demo.accessNextLevel(linkId, 0); // Company name
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demo.accessNextLevel(linkId, 1); // LinkedIn
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demo.accessNextLevel(linkId, 2); // Email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await demo.accessNextLevel(linkId, 3); // Phone
    
    // Display final status
    demo.displayStatus();
    
    console.log('\n🎉 DEMO COMPLETED SUCCESSFULLY!');
    console.log('================================');
    console.log('✅ Privacy-preserving contact exchange');
    console.log('✅ Economic spam prevention via bonds');
    console.log('✅ Progressive trust building');
    console.log('✅ Zero-knowledge proof validation');
    console.log('\nCheck the generated QR code in ./demo/ directory!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  runDemo();
}

module.exports = SelectConnectDemo;
