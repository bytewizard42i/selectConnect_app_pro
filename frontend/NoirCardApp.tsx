import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { Camera } from 'lucide-react';

// Midnight SDK types (placeholders until SDK is available)
interface MidnightProvider {
  getContract(address: string): Promise<MidnightContract>;
  getSigner(): Promise<MidnightSigner>;
}

interface MidnightSigner {
  getAddress(): Promise<string>;
  signMessage(message: string): Promise<string>;
}

interface MidnightContract {
  call(method: string, args: any[]): Promise<any>;
}

// Declare global Midnight wallet
declare global {
  interface Window {
    midnight?: {
      provider: MidnightProvider;
    };
  }
}

interface SelectConnectData {
  cardId: string;
  alias: string;
  card_admin: string;
  active: boolean;
  policy: CardPolicy;
  revealLevels: RevealLevel[];
}

interface CardPolicy {
  requiresBond: boolean;
  bondAmount: string;
  revealDelay: number;
  linkTTL: number;
  allowRevocation: boolean;
  maxReveals: number;
}

interface RevealLevel {
  level: number;
  dataType: string;
  encryptedData: string;
  requiresApproval: boolean;
}

interface AccessLink {
  linkId: string;
  cardId: string;
  expiresAt: number;
  currentLevel: number;
  revoked: boolean;
}

export const SelectConnectApp: React.FC = () => {
  const [cards, setCards] = useState<SelectConnectData[]>([]);
  const [activeCard, setActiveCard] = useState<SelectConnectData | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [scannedData, setScannedData] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [provider, setProvider] = useState<MidnightProvider | null>(null);
  const [signer, setSigner] = useState<MidnightSigner | null>(null);
  const [selectConnectContract, setSelectConnectContract] = useState<MidnightContract | null>(null);
  const [abuseEscrowContract, setAbuseEscrowContract] = useState<MidnightContract | null>(null);

  // Initialize wallet connection
  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    if (typeof window !== 'undefined' && window.midnight) {
      const provider = window.midnight.provider;
      const signer = await provider.getSigner();
      setProvider(provider);
      setSigner(signer);
      
      // Initialize contracts with environment variables or defaults
      const selectConnectAddress = typeof window !== 'undefined' 
        ? (window as any).NEXT_PUBLIC_SELECTCONNECT_ADDRESS || '0x...' 
        : '0x...';
      const abuseEscrowAddress = typeof window !== 'undefined' 
        ? (window as any).NEXT_PUBLIC_ABUSE_ESCROW_ADDRESS || '0x...' 
        : '0x...';
      
      const selectConnect = await provider.getContract(selectConnectAddress);
      const abuseEscrow = await provider.getContract(abuseEscrowAddress);
      setSelectConnectContract(selectConnect);
      setAbuseEscrowContract(abuseEscrow);
      
      // Load user's cards
      await loadUserCards(signer);
    }
  };

  const loadUserCards = async (signer: MidnightSigner) => {
    // Implementation would load cards from contract
    // Mock data for now
    const mockCards: SelectConnectData[] = [
      {
        cardId: '0x123...',
        alias: 'John Doe - SelectConnect Profile',
        card_admin: await signer.getAddress(),
        active: true,
        policy: {
          requiresBond: true,
          bondAmount: '3000000',
          revealDelay: 300,
          linkTTL: 604800,
          allowRevocation: true,
          maxReveals: 3
        },
        revealLevels: [
          { level: 1, dataType: 'name', encryptedData: 'encrypted_name_data', requiresApproval: false },
          { level: 2, dataType: 'email', encryptedData: 'encrypted_email_data', requiresApproval: false },
          { level: 3, dataType: 'phone', encryptedData: 'encrypted_phone_data', requiresApproval: true }
        ]
      }
    ];
    setCards(mockCards);
  };

  const createNewCard = async (cardData: {
    alias: string;
    contactData: any;
    policy: CardPolicy;
    revealLevels: RevealLevel[];
  }) => {
    if (!signer) return;

    try {
      // Hash contact data using crypto module (server-side) or Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(cardData.contactData));
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const contactDataHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Call Midnight contract to create card
      if (selectConnectContract) {
        await selectConnectContract.call('createCard', [
          cardData.alias,
          contactDataHash,
          cardData.policy,
          cardData.revealLevels
        ]);
      }

      // Reload cards
      await loadUserCards(signer);
    } catch (error) {
      console.error('Failed to create card:', error);
    }
  };

  const generateQRLink = async (cardId: string, customTTL?: number) => {
    if (!signer) return;

    try {
      // Generate recipient commitment using Web Crypto API
      const encoder = new TextEncoder();
      const commitData = encoder.encode(`recipient_${Date.now()}`);
      const commitBuffer = await crypto.subtle.digest('SHA-256', commitData);
      const recipientCommit = Array.from(new Uint8Array(commitBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Call Midnight contract to generate link
      if (selectConnectContract) {
        const result = await selectConnectContract.call('generateAccessLink', [
          cardId, 
          customTTL || 0, 
          recipientCommit
        ]);
        // Handle result to get linkId
      }

      // Mock link generation
      const linkId = `link_${Date.now()}`;
      const baseUrl = window.location.origin;
      const qrUrl = `${baseUrl}/card/${linkId}`;
      
      setGeneratedLink(qrUrl);
    } catch (error) {
      console.error('Failed to generate QR link:', error);
    }
  };

  const scanQRCode = async (qrData: string) => {
    try {
      // Parse QR data to extract link ID
      const url = new URL(qrData);
      const linkId = url.pathname.split('/').pop();
      
      if (!linkId) throw new Error('Invalid QR code');

      // Check if bond is required
      const bondInfo = await checkBondRequirement(linkId);
      
      if (bondInfo.required) {
        // Show bond posting interface
        await handleBondPosting(linkId, bondInfo.amount);
      } else {
        // Direct access
        await accessCardData(linkId, 1);
      }
    } catch (error) {
      console.error('Failed to scan QR code:', error);
    }
  };

  const checkBondRequirement = async (linkId: string) => {
    // Implementation would check contract
    return { required: true, amount: '3000000' }; // 3 ADA
  };

  const handleBondPosting = async (linkId: string, bondAmount: string) => {
    if (!signer) return;

    try {
      // Generate sender commitment for privacy
      const encoder = new TextEncoder();
      const senderData = encoder.encode(`sender_${await signer.getAddress()}_${Date.now()}`);
      const commitBuffer = await crypto.subtle.digest('SHA-256', senderData);
      const senderCommit = Array.from(new Uint8Array(commitBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Post bond to AbuseEscrow contract
      if (abuseEscrowContract) {
        await abuseEscrowContract.call('postBond', [
          linkId, // Use linkId to derive cardId
          senderCommit,
          bondAmount
        ]);
      }

      // After bond is posted, access the card
      await accessCardData(linkId, 1);
    } catch (error) {
      console.error('Failed to post bond:', error);
    }
  };

  const accessCardData = async (linkId: string, level: number) => {
    if (!signer) return;

    try {
      // Generate recipient commitment for per-link access (card_recipient)
      const encoder = new TextEncoder();
      const recipientData = encoder.encode(`recipient_${await signer.getAddress()}`);
      const commitBuffer = await crypto.subtle.digest('SHA-256', recipientData);
      const recipientCommit = Array.from(new Uint8Array(commitBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Call Midnight contract to access card
      if (selectConnectContract) {
        const revealedData = await selectConnectContract.call('accessCard', [
          linkId, 
          level, 
          recipientCommit
        ]);
        
        // Process revealed data
        setScannedData({
          level: level,
          dataType: revealedData.dataType,
          data: revealedData.decryptedData
        });
        return;
      }
      
      // Mock revealed data
      const mockData = {
        level: level,
        dataType: level === 1 ? 'name' : level === 2 ? 'email' : 'phone',
        data: level === 1 ? 'John Doe' : level === 2 ? 'john@example.com' : '+1-555-0123'
      };
      
      setScannedData(mockData);
    } catch (error) {
      console.error('Failed to access card data:', error);
    }
  };

  const progressiveReveal = async (linkId: string, nextLevel: number) => {
    await accessCardData(linkId, nextLevel);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">SelectConnect</h1>
          <p className="text-gray-300">Privacy-first contact sharing with progressive reveal</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Management */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">My Cards</h2>
            
            {cards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No cards created yet</p>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
                  onClick={() => {/* Open create card modal */}}
                >
                  Create First Card
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cards.map((card) => (
                  <div 
                    key={card.cardId} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      activeCard?.cardId === card.cardId 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setActiveCard(card)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{card.alias}</h3>
                        <p className="text-sm text-gray-400">
                          {card.revealLevels.length} reveal levels
                        </p>
                        {card.policy.requiresBond && (
                          <span className="inline-block bg-yellow-600 text-xs px-2 py-1 rounded mt-2">
                            Bond Required: {(parseInt(card.policy.bondAmount) / 1000000).toFixed(2)} ADA
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        card.active ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {card.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR Generation & Scanning */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">QR Code</h2>
            
            {activeCard ? (
              <div className="space-y-6">
                {generatedLink ? (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg inline-block mb-4">
                      <QRCode value={generatedLink} size={200} />
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      Scan to access: {activeCard.alias}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button 
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
                        onClick={() => navigator.clipboard.writeText(generatedLink)}
                      >
                        Copy Link
                      </button>
                      <button 
                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
                        onClick={() => setGeneratedLink('')}
                      >
                        New QR
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
                      onClick={() => generateQRLink(activeCard.cardId)}
                    >
                      Generate QR Code
                    </button>
                  </div>
                )}

                {/* Card Details */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="font-semibold mb-3">Card Settings</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Link TTL:</span>
                      <span>{Math.floor(activeCard.policy.linkTTL / 3600)} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reveal Delay:</span>
                      <span>{activeCard.policy.revealDelay}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revocable:</span>
                      <span>{activeCard.policy.allowRevocation ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Select a card to generate QR code</p>
              </div>
            )}

            {/* QR Scanner */}
            <div className="border-t border-gray-700 pt-6 mt-6">
              <button 
                className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                onClick={() => setShowScanner(true)}
              >
                <Camera size={20} />
                Scan QR Code
              </button>
            </div>
          </div>
        </div>

        {/* Scanned Data Display */}
        {scannedData && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Level {scannedData.level}:</span>
                <span className="text-sm bg-blue-600 px-2 py-1 rounded">{scannedData.dataType}</span>
              </div>
              <p className="text-lg">{scannedData.data}</p>
            </div>
            
            {scannedData.level < 3 && (
              <button 
                className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
                onClick={() => progressiveReveal('current_link', scannedData.level + 1)}
              >
                Reveal More (Level {scannedData.level + 1})
              </button>
            )}
          </div>
        )}

        {/* Bond Posting Interface */}
        {/* This would be a modal/overlay in a real implementation */}
      </div>
    </div>
  );
};

export default SelectConnectApp;
