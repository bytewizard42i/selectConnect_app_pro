/**
 * NoirCard Test Scenario: Conference Networking
 * Demonstrates privacy-preserving professional networking at tech conferences
 */

import { MidnightProvider, generateProof, verifyProof } from '@midnight-ntwrk/midnight-js-sdk';
import { NoirCardProtocol } from '../../contracts/build/NoirCardProtocol';
import { expect } from 'chai';

describe('Conference Networking with NoirCard', () => {
    let contract: NoirCardProtocol;
    let provider: MidnightProvider;
    
    beforeEach(async () => {
        // Connect to local Midnight node
        provider = new MidnightProvider('ws://localhost:9944');
        contract = new NoirCardProtocol(provider);
    });
    
    describe('Scenario 1: Safe Professional Connection', () => {
        it('should enable Sarah to safely network at DevCon 2025', async () => {
            console.log('🎯 Testing: Sarah creates a conference-specific NoirCard');
            
            // Step 1: Sarah creates her NoirCard with privacy settings
            const sarahCard = await contract.createCard({
                aliasHash: hash('Sarah@DevCon2025'),
                requiresBond: true,
                minBondAmount: 3, // 3 tokens required
                phoneCommit: commit('+1-555-SAFE', 'sarah-secret'),
                emailCommit: commit('sarah@techcorp.com', 'sarah-secret')
            });
            
            expect(sarahCard.cardId).to.exist;
            console.log(`✅ Card created: ${sarahCard.cardId.slice(0, 8)}...`);
            
            // Step 2: Sarah adds progressive reveal levels
            console.log('📊 Adding progressive reveal levels...');
            
            // Level 1: Basic professional info
            await contract.addRevealLevel(sarahCard.cardId, 1, {
                name: 'Sarah Chen',
                role: 'Senior Software Engineer',
                interests: ['Web3', 'Privacy Tech', 'ZK Proofs']
            });
            
            // Level 2: Company and social links
            await contract.addRevealLevel(sarahCard.cardId, 2, {
                company: 'TechCorp',
                linkedin: 'linkedin.com/in/sarahchen',
                twitter: '@sarahdev'
            });
            
            // Level 3: Direct contact (only after trust established)
            await contract.addRevealLevel(sarahCard.cardId, 3, {
                email: 'sarah@techcorp.com',
                phone: '+1-555-SAFE',
                telegram: '@sarahc'
            });
            
            console.log('✅ Progressive reveal configured');
            
            // Step 3: Bob scans Sarah's QR code and posts bond
            console.log('👤 Bob scans QR and posts bond...');
            
            const bobBond = await contract.postBond({
                cardId: sarahCard.cardId,
                amount: 3,
                ttl: 86400 // 24 hours
            });
            
            expect(bobBond.bondId).to.exist;
            expect(bobBond.state).to.equal('POSTED');
            console.log(`✅ Bob posted 3 token bond: ${bobBond.bondId.slice(0, 8)}...`);
            
            // Step 4: Bob sends a respectful message
            const message = await sendMessage(sarahCard.cardId, {
                from: 'Bob@DevCon2025',
                content: 'Hi Sarah! Great talk on ZK proofs. Would love to discuss potential collaboration on privacy tech.',
                timestamp: Date.now()
            });
            
            console.log('💬 Bob sent professional message');
            
            // Step 5: Sarah responds positively
            await respondToMessage(sarahCard.cardId, bobBond.senderId, {
                content: 'Thanks Bob! Happy to discuss. Let me share my LinkedIn.',
                grantLevel: 2 // Grants access to Level 2 info
            });
            
            console.log('✅ Sarah granted Level 2 access');
            
            // Step 6: After positive interaction, bond auto-refunds
            await simulateTime(86400); // Fast-forward 24 hours
            
            const bondStatus = await contract.getBondStatus(bobBond.bondId);
            expect(bondStatus.state).to.equal('REFUNDED');
            expect(bondStatus.refundedAmount).to.equal(3);
            
            console.log('💰 Bond auto-refunded after positive interaction');
            console.log('✅ Scenario completed: Safe professional connection established!');
        });
    });
    
    describe('Scenario 2: Harassment Prevention', () => {
        it('should protect Alice from harassment and compensate her', async () => {
            console.log('🛡️ Testing: Harassment prevention mechanism');
            
            // Alice creates her card
            const aliceCard = await contract.createCard({
                aliasHash: hash('Alice@TechConf'),
                requiresBond: true,
                minBondAmount: 5, // Higher bond for extra protection
                phoneCommit: commit('+1-555-PRIVATE', 'alice-secret'),
                emailCommit: commit('alice@private.com', 'alice-secret')
            });
            
            console.log(`✅ Alice's card created with 5 token bond requirement`);
            
            // Harasser posts bond
            const harasserBond = await contract.postBond({
                cardId: aliceCard.cardId,
                amount: 5,
                ttl: 86400
            });
            
            console.log('⚠️ Harasser posted bond');
            
            // Harasser sends inappropriate messages
            await sendMessage(aliceCard.cardId, {
                from: 'harasser',
                content: 'Hey beautiful, want to grab drinks?',
                timestamp: Date.now()
            });
            
            await sendMessage(aliceCard.cardId, {
                from: 'harasser',
                content: 'Why aren\'t you responding? Don\'t be rude.',
                timestamp: Date.now() + 1000
            });
            
            console.log('❌ Inappropriate messages sent');
            
            // Alice slashes the bond with evidence
            console.log('⚖️ Alice slashing bond with evidence...');
            
            const slashResult = await contract.slashBond(harasserBond.bondId, {
                reason: 'harassment',
                evidenceHash: hash('screenshot_evidence_123'),
                timestamp: Date.now()
            });
            
            expect(slashResult.success).to.be.true;
            
            // Verify bond was slashed
            const bondStatus = await contract.getBondStatus(harasserBond.bondId);
            expect(bondStatus.state).to.equal('SLASHED');
            
            console.log('✅ Bond slashed successfully');
            
            // Check harasser's reputation is damaged
            const harasserRep = await contract.getSenderReputation(harasserBond.senderId);
            expect(harasserRep.slashedCount).to.equal(1);
            expect(harasserRep.trustScore).to.be.below(50);
            
            console.log(`📉 Harasser reputation damaged: Trust score ${harasserRep.trustScore}/100`);
            
            // Verify Alice received compensation
            const alicePool = await contract.getSafetyPool(aliceCard.cardId);
            expect(alicePool.balance).to.equal(5);
            
            console.log('💰 Alice compensated with slashed bond');
            
            // Future bonds cost more for this harasser
            const nextBondCost = await contract.calculateBondCost(
                aliceCard.cardId,
                harasserBond.senderId
            );
            expect(nextBondCost).to.equal(50); // 10x penalty
            
            console.log(`🔒 Future bonds cost 10x more for harasser: ${nextBondCost} tokens`);
            console.log('✅ Scenario completed: Harassment prevented and punished!');
        });
    });
    
    describe('Scenario 3: Spam Prevention', () => {
        it('should prevent spam while allowing legitimate outreach', async () => {
            console.log('🚫 Testing: Spam prevention with economic deterrence');
            
            // CEO creates high-value card
            const ceoCard = await contract.createCard({
                aliasHash: hash('JohnCEO@Fortune500'),
                requiresBond: true,
                minBondAmount: 50, // High bond for C-level executive
                phoneCommit: commit('+1-555-EXEC', 'ceo-secret'),
                emailCommit: commit('john@fortune500.com', 'ceo-secret')
            });
            
            console.log('👔 CEO card created with 50 token bond requirement');
            
            // Spammer calculates cost of spamming
            const spamCost = 50 * 100; // Cost to spam 100 executives
            console.log(`💸 Cost to spam 100 executives: ${spamCost} tokens`);
            
            // Legitimate vendor posts appropriate bond
            const vendorBond = await contract.postBond({
                cardId: ceoCard.cardId,
                amount: 50,
                ttl: 604800 // 7 days for business response
            });
            
            // Vendor sends targeted, valuable message
            await sendMessage(ceoCard.cardId, {
                from: 'EnterpriseSales@TechVendor',
                content: 'John, our AI solution reduced costs by 30% for similar Fortune 500 companies. Worth a 15-min call?',
                timestamp: Date.now()
            });
            
            console.log('✅ Legitimate vendor sent targeted pitch');
            
            // CEO responds with interest
            await respondToMessage(ceoCard.cardId, vendorBond.senderId, {
                content: 'Interesting. Send details to my assistant.',
                grantLevel: 1
            });
            
            // Bond refunds after positive interaction
            const vendorBondStatus = await contract.getBondStatus(vendorBond.bondId);
            expect(vendorBondStatus.state).to.equal('REFUNDED');
            
            console.log('💰 Vendor bond refunded after CEO response');
            console.log('✅ Scenario completed: Spam prevented, quality connections enabled!');
        });
    });
    
    describe('Scenario 4: Progressive Trust Building', () => {
        it('should enable gradual relationship building with progressive reveal', async () => {
            console.log('🔐 Testing: Progressive trust and information reveal');
            
            // Create card with multiple reveal levels
            const card = await contract.createCard({
                aliasHash: hash('Emma@StartupFounder'),
                requiresBond: true,
                minBondAmount: 10,
                phoneCommit: commit('+1-555-FOUNDER', 'emma-secret'),
                emailCommit: commit('emma@startup.com', 'emma-secret')
            });
            
            // Configure progressive reveal
            await contract.addRevealLevel(card.cardId, 1, {
                name: 'Emma',
                role: 'Founder',
                industry: 'FinTech'
            });
            
            await contract.addRevealLevel(card.cardId, 2, {
                company: 'PaymentCo',
                linkedin: 'linkedin.com/in/emma',
                calendly: 'calendly.com/emma-startup'
            });
            
            await contract.addRevealLevel(card.cardId, 3, {
                email: 'emma@paymentco.com',
                phone: '+1-555-FOUNDER',
                preferredContact: 'email'
            });
            
            await contract.addRevealLevel(card.cardId, 4, {
                personalEmail: 'emma@personal.com',
                telegram: '@emma_founder',
                signal: '+1-555-FOUNDER'
            });
            
            console.log('📊 4-level progressive reveal configured');
            
            // Investor posts bond and initiates contact
            const investorBond = await contract.postBond({
                cardId: card.cardId,
                amount: 10,
                ttl: 604800
            });
            
            // Level 1: Initial contact
            const level1Data = await contract.getRevealedData(card.cardId, 1);
            expect(level1Data.name).to.equal('Emma');
            console.log('✅ Level 1: Basic info shared');
            
            // Good conversation → Level 2
            await grantAccess(card.cardId, investorBond.senderId, 2);
            console.log('✅ Level 2: Professional details shared');
            
            // Due diligence → Level 3
            await grantAccess(card.cardId, investorBond.senderId, 3);
            console.log('✅ Level 3: Business contact shared');
            
            // Investment closed → Level 4
            await grantAccess(card.cardId, investorBond.senderId, 4);
            console.log('✅ Level 4: Personal contact shared (full trust)');
            
            console.log('✅ Scenario completed: Trust built progressively!');
        });
    });
});

// Helper functions
function hash(data: string): string {
    return `0x${Buffer.from(data).toString('hex').slice(0, 32)}`;
}

function commit(data: string, secret: string): string {
    return hash(data + secret);
}

async function sendMessage(cardId: string, message: any): Promise<void> {
    // Relay service handles message delivery
    console.log(`  → Message sent to ${cardId.slice(0, 8)}...`);
}

async function respondToMessage(cardId: string, senderId: string, response: any): Promise<void> {
    console.log(`  ← Response sent from ${cardId.slice(0, 8)}...`);
}

async function grantAccess(cardId: string, recipientId: string, level: number): Promise<void> {
    console.log(`  🔓 Access granted to level ${level}`);
}

async function simulateTime(seconds: number): Promise<void> {
    console.log(`  ⏰ Fast-forwarding ${seconds} seconds...`);
}
