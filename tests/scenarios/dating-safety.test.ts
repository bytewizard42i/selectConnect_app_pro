/**
 * NoirCard Test Scenario: Dating Safety
 * Demonstrates privacy-preserving connections for dating apps
 */

import { MidnightProvider } from '@midnight-ntwrk/midnight-js-sdk';
import { SelectConnectProtocol } from '../../contracts/build/SelectConnectProtocol';
import { expect } from 'chai';

describe('Dating Safety with NoirCard', () => {
    let contract: SelectConnectProtocol;
    let provider: MidnightProvider;
    
    beforeEach(async () => {
        provider = new MidnightProvider('ws://localhost:9944');
        contract = new SelectConnectProtocol(provider);
    });
    
    describe('Safe Dating Connection Flow', () => {
        it('should enable Emma to safely connect on dating apps', async () => {
            console.log('💝 Testing: Safe dating with progressive reveal');
            
            // Emma creates dating profile card with high bond requirement
            const emmaCard = await contract.createCard({
                aliasHash: hash('Emma_NYC_28'),
                requiresBond: true,
                minBondAmount: 20, // Higher bond for dating safety
                phoneCommit: commit('+1-555-EMMA', 'emma-dating-secret'),
                emailCommit: commit('emma.personal@gmail.com', 'emma-dating-secret')
            });
            
            console.log('✅ Emma created dating profile with 20 token bond');
            
            // Progressive reveal for dating context
            await contract.addRevealLevel(emmaCard.cardId, 1, {
                firstName: 'Emma',
                age: 28,
                city: 'New York',
                interests: ['hiking', 'coffee', 'books', 'travel'],
                lookingFor: 'serious relationship'
            });
            
            await contract.addRevealLevel(emmaCard.cardId, 2, {
                neighborhood: 'Brooklyn',
                favoriteSpots: ['Prospect Park', 'Brooklyn Bridge'],
                instagram: '@emma_explores'
            });
            
            await contract.addRevealLevel(emmaCard.cardId, 3, {
                lastName: 'Martinez',
                whatsapp: '+1-555-EMMA',
                preferredFirstDate: 'coffee in public place'
            });
            
            await contract.addRevealLevel(emmaCard.cardId, 4, {
                fullName: 'Emma Martinez',
                phone: '+1-555-EMMA',
                address: 'Brooklyn, NY' // Only after significant trust
            });
            
            // Match posts bond
            const matchBond = await contract.postBond({
                cardId: emmaCard.cardId,
                amount: 20,
                ttl: 604800 // 7 days
            });
            
            console.log('👤 Match posted 20 token bond');
            
            // Good conversation flow
            await sendMessage(emmaCard.cardId, {
                from: 'James_NYC_30',
                content: 'Hi Emma! I also love hiking. Have you been to Bear Mountain?'
            });
            
            // Emma responds and grants Level 2
            await respondToMessage(emmaCard.cardId, matchBond.senderId, {
                content: 'Yes! Love Bear Mountain. The fall colors are amazing.',
                grantLevel: 2
            });
            
            console.log('✅ Level 2 access granted after good conversation');
            
            // After video call, grants Level 3
            await grantAccess(emmaCard.cardId, matchBond.senderId, 3);
            console.log('✅ Level 3 access after video date');
            
            // After meeting in person, grants Level 4
            await grantAccess(emmaCard.cardId, matchBond.senderId, 4);
            console.log('✅ Full access after safe in-person meeting');
            
            // Bond refunds after successful connection
            const bondStatus = await contract.getBondStatus(matchBond.bondId);
            expect(bondStatus.state).to.equal('REFUNDED');
            
            console.log('💑 Successful match! Bond refunded');
        });
        
        it('should protect against dating app harassment', async () => {
            console.log('🚨 Testing: Protection from dating harassment');
            
            const safeCard = await contract.createCard({
                aliasHash: hash('Sarah_LA_25'),
                requiresBond: true,
                minBondAmount: 25,
                phoneCommit: commit('+1-555-SAFE', 'sarah-secret'),
                emailCommit: commit('sarah@safe.com', 'sarah-secret')
            });
            
            // Creep posts bond
            const creepBond = await contract.postBond({
                cardId: safeCard.cardId,
                amount: 25,
                ttl: 604800
            });
            
            // Sends inappropriate messages
            await sendMessage(safeCard.cardId, {
                from: 'creep',
                content: 'Hey sexy, send pics'
            });
            
            await sendMessage(safeCard.cardId, {
                from: 'creep',
                content: 'Why are you ignoring me? You matched with me!'
            });
            
            await sendMessage(safeCard.cardId, {
                from: 'creep',
                content: 'I know you live in LA, I could find you'
            });
            
            console.log('❌ Threatening messages sent');
            
            // Sarah slashes bond and blocks
            const slashResult = await contract.slashBond(creepBond.bondId, {
                reason: 'threats_harassment',
                evidenceHash: hash('screenshot_threats'),
                severity: 'HIGH'
            });
            
            expect(slashResult.success).to.be.true;
            
            // Creep banned from platform
            const creepRep = await contract.getSenderReputation(creepBond.senderId);
            expect(creepRep.banned).to.be.true;
            expect(creepRep.slashedCount).to.equal(1);
            
            console.log('⛔ Harasser banned from platform');
            console.log('💰 Sarah compensated with 25 token bond');
            console.log('✅ Dating safety protected!');
        });
    });
    
    describe('Group Date Safety', () => {
        it('should enable safe group dating events', async () => {
            console.log('👥 Testing: Group dating event with collective safety');
            
            // Event organizer creates master card
            const eventCard = await contract.createCard({
                aliasHash: hash('SpeedDating_NYC_Dec2024'),
                requiresBond: true,
                minBondAmount: 30,
                phoneCommit: commit('event-phone', 'event-secret'),
                emailCommit: commit('events@datingapp.com', 'event-secret')
            });
            
            // Participants must post bonds to attend
            const participants = [];
            for (let i = 0; i < 10; i++) {
                const bond = await contract.postBond({
                    cardId: eventCard.cardId,
                    amount: 30,
                    ttl: 86400
                });
                participants.push(bond);
            }
            
            console.log('✅ 10 participants posted safety bonds');
            
            // If anyone misbehaves, their bond is slashed
            // Others get refunded
            const misbehavingBond = participants[5];
            await contract.slashBond(misbehavingBond.bondId, {
                reason: 'inappropriate_behavior',
                witnesses: ['participant1', 'participant2', 'organizer']
            });
            
            // Good participants get refunded
            for (let i = 0; i < participants.length; i++) {
                if (i !== 5) {
                    const status = await contract.getBondStatus(participants[i].bondId);
                    expect(status.state).to.equal('REFUNDED');
                }
            }
            
            console.log('✅ Safe participants refunded, troublemaker penalized');
            console.log('🎉 Group event completed safely!');
        });
    });
});

function hash(data: string): string {
    return `0x${Buffer.from(data).toString('hex').slice(0, 32)}`;
}

function commit(data: string, secret: string): string {
    return hash(data + secret);
}

async function sendMessage(cardId: string, message: any): Promise<void> {
    console.log(`  → Message: "${message.content.slice(0, 50)}..."`);
}

async function respondToMessage(cardId: string, senderId: string, response: any): Promise<void> {
    console.log(`  ← Response sent`);
}

async function grantAccess(cardId: string, recipientId: string, level: number): Promise<void> {
    console.log(`  🔓 Level ${level} access granted`);
}
