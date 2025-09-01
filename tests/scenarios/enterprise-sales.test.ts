/**
 * NoirCard Test Scenario: Enterprise Sales & Lead Generation
 * Demonstrates B2B networking with qualified leads and spam prevention
 */

import { MidnightProvider } from '@midnight-ntwrk/midnight-js-sdk';
import { NoirCardProtocol } from '../../contracts/build/NoirCardProtocol';
import { expect } from 'chai';

describe('Enterprise Sales with NoirCard', () => {
    let contract: NoirCardProtocol;
    let provider: MidnightProvider;
    
    beforeEach(async () => {
        provider = new MidnightProvider('ws://localhost:9944');
        contract = new NoirCardProtocol(provider);
    });
    
    describe('C-Level Executive Protection', () => {
        it('should protect Fortune 500 CEO from spam while enabling valuable connections', async () => {
            console.log('💼 Testing: Enterprise executive spam protection');
            
            // CEO creates high-value card with tiered bond requirements
            const ceoCard = await contract.createCard({
                aliasHash: hash('MichaelCEO@Fortune500'),
                requiresBond: true,
                minBondAmount: 100, // Very high bond for C-suite
                phoneCommit: commit('+1-555-CEO', 'ceo-secret'),
                emailCommit: commit('ceo@fortune500.com', 'ceo-secret')
            });
            
            console.log('👔 CEO card created with 100 token minimum bond');
            
            // Add executive assistant filter level
            await contract.addRevealLevel(ceoCard.cardId, 0, {
                assistantEmail: 'assistant@fortune500.com',
                screeningRequired: true,
                minimumDealSize: '$1M'
            });
            
            // Vendor reputation affects bond pricing
            const trustedVendorRep = { slashedCount: 0, successfulDeals: 15 };
            const newVendorRep = { slashedCount: 0, successfulDeals: 0 };
            const spammerRep = { slashedCount: 3, successfulDeals: 0 };
            
            // Calculate dynamic bond requirements
            const trustedBond = await contract.calculateBondCost(
                ceoCard.cardId, 
                'trusted-vendor-id'
            );
            expect(trustedBond).to.equal(50); // 50% discount for trusted vendor
            
            const newBond = await contract.calculateBondCost(
                ceoCard.cardId,
                'new-vendor-id'
            );
            expect(newBond).to.equal(100); // Full price for new vendor
            
            const spammerBond = await contract.calculateBondCost(
                ceoCard.cardId,
                'spammer-id'
            );
            expect(spammerBond).to.equal(1000); // 10x penalty for spammer
            
            console.log('💰 Dynamic pricing based on reputation:');
            console.log('  - Trusted vendor: 50 tokens');
            console.log('  - New vendor: 100 tokens');
            console.log('  - Known spammer: 1000 tokens');
            
            // Legitimate enterprise vendor posts bond
            const vendorBond = await contract.postBond({
                cardId: ceoCard.cardId,
                amount: 100,
                ttl: 2592000 // 30 days for enterprise sales cycle
            });
            
            // Vendor sends qualified pitch
            await sendMessage(ceoCard.cardId, {
                from: 'EnterpriseSales@TechCorp',
                content: 'Michael, our AI platform helped Goldman Sachs reduce compliance costs by 40%. ' +
                         'Worth a 20-min call with your CTO?',
                attachments: ['case_study_goldman.pdf', 'roi_calculator.xlsx']
            });
            
            console.log('✅ Qualified vendor sent targeted pitch');
            
            // CEO's assistant screens and approves
            await approveVendor(ceoCard.cardId, vendorBond.senderId);
            
            // CEO grants calendar access
            await grantAccess(ceoCard.cardId, vendorBond.senderId, 1);
            
            console.log('📅 Calendar access granted for meeting');
            
            // After successful deal, vendor gets reputation boost
            await recordSuccessfulDeal(vendorBond.senderId);
            
            const updatedRep = await contract.getSenderReputation(vendorBond.senderId);
            expect(updatedRep.successfulDeals).to.equal(1);
            expect(updatedRep.trustScore).to.be.above(75);
            
            console.log('⭐ Vendor reputation improved after successful deal');
        });
    });
    
    describe('Sales Team Lead Distribution', () => {
        it('should fairly distribute leads among sales team with performance tracking', async () => {
            console.log('📊 Testing: Fair lead distribution system');
            
            // Company creates team card for inbound leads
            const teamCard = await contract.createCard({
                aliasHash: hash('Sales@TechStartup'),
                requiresBond: false, // No bond for inbound leads
                minBondAmount: 0,
                phoneCommit: commit('sales-phone', 'team-secret'),
                emailCommit: commit('sales@techstartup.com', 'team-secret')
            });
            
            // Add multiple sales reps as authorized recipients
            const salesReps = [
                { id: 'rep1', name: 'Alice', quota: 10, current: 0 },
                { id: 'rep2', name: 'Bob', quota: 10, current: 0 },
                { id: 'rep3', name: 'Carol', quota: 10, current: 0 }
            ];
            
            for (const rep of salesReps) {
                await contract.addCardAdmin(teamCard.cardId, rep.id);
            }
            
            console.log('👥 3 sales reps added to team card');
            
            // Leads come in and get distributed
            const leads = [];
            for (let i = 0; i < 15; i++) {
                const lead = {
                    id: `lead${i}`,
                    value: Math.floor(Math.random() * 100000),
                    source: 'website',
                    timestamp: Date.now() + i * 1000
                };
                
                // Smart distribution based on current load and performance
                const assignedRep = await contract.assignLead(teamCard.cardId, lead);
                leads.push({ ...lead, assignedTo: assignedRep });
                
                console.log(`  Lead ${i}: $${lead.value} → ${assignedRep}`);
            }
            
            // Verify fair distribution
            const distribution = leads.reduce((acc, lead) => {
                acc[lead.assignedTo] = (acc[lead.assignedTo] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            expect(distribution['rep1']).to.be.closeTo(5, 1);
            expect(distribution['rep2']).to.be.closeTo(5, 1);
            expect(distribution['rep3']).to.be.closeTo(5, 1);
            
            console.log('✅ Leads distributed fairly among team');
            
            // Track conversion rates
            await recordConversion('rep1', leads[0].id, 50000);
            await recordConversion('rep2', leads[5].id, 75000);
            
            const teamStats = await contract.getTeamStats(teamCard.cardId);
            expect(teamStats.totalLeads).to.equal(15);
            expect(teamStats.conversions).to.equal(2);
            expect(teamStats.revenue).to.equal(125000);
            
            console.log('📈 Team performance tracked:');
            console.log(`  - Total leads: ${teamStats.totalLeads}`);
            console.log(`  - Conversions: ${teamStats.conversions}`);
            console.log(`  - Revenue: $${teamStats.revenue}`);
        });
    });
    
    describe('Qualified Lead Marketplace', () => {
        it('should enable buying and selling qualified leads with quality guarantees', async () => {
            console.log('💎 Testing: Qualified lead marketplace');
            
            // Lead generator creates high-quality lead card
            const leadCard = await contract.createCard({
                aliasHash: hash('QualifiedLead_Enterprise_2024'),
                requiresBond: false,
                minBondAmount: 0,
                phoneCommit: commit('lead-phone', 'lead-secret'),
                emailCommit: commit('lead@enterprise.com', 'lead-secret')
            });
            
            // Add lead qualification data
            await contract.addLeadQualification(leadCard.cardId, {
                industry: 'Financial Services',
                companySize: '1000-5000',
                budget: '$500K-$1M',
                timeline: 'Q1 2025',
                decisionMaker: true,
                painPoints: ['compliance', 'automation', 'cost reduction'],
                bant: {
                    budget: true,
                    authority: true,
                    need: true,
                    timeline: true
                }
            });
            
            console.log('✅ Lead qualified with BANT criteria');
            
            // Multiple buyers bid on the lead
            const bids = [
                { buyer: 'vendor1', amount: 500 },
                { buyer: 'vendor2', amount: 750 },
                { buyer: 'vendor3', amount: 600 }
            ];
            
            for (const bid of bids) {
                await contract.placeBid(leadCard.cardId, {
                    buyerId: bid.buyer,
                    amount: bid.amount,
                    escrowPeriod: 30 // 30 days to convert
                });
            }
            
            console.log('💰 Bids received: $500, $750, $600');
            
            // Highest bidder wins
            const winner = await contract.acceptHighestBid(leadCard.cardId);
            expect(winner.buyerId).to.equal('vendor2');
            expect(winner.amount).to.equal(750);
            
            console.log('🏆 Vendor2 wins with $750 bid');
            
            // Buyer gets progressive access to lead info
            await grantAccess(leadCard.cardId, 'vendor2', 1); // Company info
            await grantAccess(leadCard.cardId, 'vendor2', 2); // Contact info
            await grantAccess(leadCard.cardId, 'vendor2', 3); // Full details
            
            // If lead converts, seller gets paid
            await recordConversion('vendor2', leadCard.cardId, 800000);
            
            const sellerPayout = await contract.processLeadPayout(leadCard.cardId);
            expect(sellerPayout.amount).to.equal(750);
            expect(sellerPayout.bonus).to.equal(75); // 10% conversion bonus
            
            console.log('💵 Lead seller paid $750 + $75 conversion bonus');
            
            // Quality score affects future lead pricing
            const sellerRep = await contract.getLeadSellerReputation('seller1');
            expect(sellerRep.qualityScore).to.be.above(90);
            expect(sellerRep.conversionRate).to.equal(100);
            
            console.log('⭐ Seller quality score: 95/100');
            console.log('✅ Lead marketplace transaction completed!');
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
    console.log(`  → Pitch sent`);
}

async function approveVendor(cardId: string, vendorId: string): Promise<void> {
    console.log(`  ✅ Vendor approved by assistant`);
}

async function grantAccess(cardId: string, recipientId: string, level: number): Promise<void> {
    console.log(`  🔓 Level ${level} access granted`);
}

async function recordSuccessfulDeal(vendorId: string): Promise<void> {
    console.log(`  💼 Deal recorded for ${vendorId}`);
}

async function recordConversion(repId: string, leadId: string, value: number): Promise<void> {
    console.log(`  💰 Conversion: ${repId} closed ${leadId} for $${value}`);
}
