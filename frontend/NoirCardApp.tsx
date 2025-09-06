import React, { useState, useEffect, useRef } from 'react';
import { MidnightProvider, Contract } from '@midnight-ntwrk/midnight-js-sdk';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

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

// Types for our SelectConnect data structure
interface SelectConnectData {
  id: string;
  alias: string;
  phone?: string;
  email?: string;
  requiresBond: boolean;
  minBondAmount: string;
  isActive: boolean;
  createdAt: Date;
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
  const [activeCard, setActiveCard] = useState<any>(null);
  const [qrData, setQrData] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [bondAmount, setBondAmount] = useState<string>('3');
  
  // Privacy routing states
  const [privacyLevel, setPrivacyLevel] = useState<'Company' | 'Personal' | 'Both' | 'Trusted' | 'Custom'>('Personal');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isTrackable, setIsTrackable] = useState<boolean>(false);
  const [qrCodeType, setQrCodeType] = useState<'standard' | 'trusted'>('standard');
  
  // Mobile QR display states
  const [showMobileQR, setShowMobileQR] = useState<boolean>(false);
  const [mobileQRData, setMobileQRData] = useState<string>('');
  const [displayMode, setDisplayMode] = useState<'card' | 'mobile'>('card');
  const [provider, setProvider] = useState<MidnightProvider | null>(null);
  const [signer, setSigner] = useState<MidnightSigner | null>(null);
  const [selectConnectContract, setSelectConnectContract] = useState<MidnightContract | null>(null);
  const [abuseEscrowContract, setAbuseEscrowContract] = useState<MidnightContract | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);

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
    // Implementation would interact with SelectConnect contract
    // to access the next reveal level
    console.log('Accessing card data:', linkId, level);
  };

  const generatePrivacyCode = async () => {
    if (!activeCard || !selectConnectContract) return;
    
    try {
      const ttl = 86400; // 24 hours
      const routeCode = await selectConnectContract.call('generatePrivacyRoute', [
        activeCard.id,
        privacyLevel,
        ttl,
        isTrackable
      ]);
      
      // Convert to 5-digit display format
      const codeNum = parseInt(routeCode.slice(-5), 16) % 90000 + 10000;
      setGeneratedCode(codeNum.toString());
      
      console.log(`Generated ${privacyLevel} code: ${codeNum}`);
    } catch (error) {
      console.error('Failed to generate privacy code:', error);
    }
  };

  const generateMobileQR = async () => {
    if (!activeCard) return;
    
    try {
      // Generate account-level QR that works with any privacy code
      const accountQR = `selectconnect://account/${activeCard.id}`;
      setMobileQRData(accountQR);
      setShowMobileQR(true);
    } catch (error) {
      console.error('Failed to generate mobile QR:', error);
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

            {/* Card Display Options */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-white">
                📱 Card Display Options
              </h3>
              
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setDisplayMode('card')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    displayMode === 'card'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🎴 Physical Cards
                </button>
                <button
                  onClick={() => setDisplayMode('mobile')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    displayMode === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📱 Mobile Display
                </button>
              </div>
              
              <p className="text-gray-400 text-sm">
                {displayMode === 'card' 
                  ? 'Design and preview your physical business cards'
                  : 'Show QR code on your phone when you run out of physical cards'
                }
              </p>
            </div>

            {/* Privacy Code Generation Section */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 text-white">
                🎯 Generate Privacy Code
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Privacy Level Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Privacy Level
                  </label>
                  <select
                    value={privacyLevel}
                    onChange={(e) => setPrivacyLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="Personal">👤 Personal Only</option>
                    <option value="Company">🏢 Company Only</option>
                    <option value="Both">🔄 Both Personal & Company</option>
                    <option value="Trusted">🔒 Trusted (Trackable)</option>
                    <option value="Custom">⚙️ Custom Settings</option>
                  </select>
                </div>
                
                {/* QR Code Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    QR Code Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="standard"
                        checked={qrCodeType === 'standard'}
                        onChange={(e) => {
                          setQrCodeType('standard');
                          setIsTrackable(false);
                        }}
                        className="mr-2"
                      />
                      <span className="text-white">⚫ Standard (Private)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="trusted"
                        checked={qrCodeType === 'trusted'}
                        onChange={(e) => {
                          setQrCodeType('trusted');
                          setIsTrackable(true);
                        }}
                        className="mr-2"
                      />
                      <span className="text-red-400">🔴 Trusted (Trackable)</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Generate Button */}
              <button
                onClick={generatePrivacyCode}
                disabled={!activeCard}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Generate 5-Digit Code
              </button>
              
              {/* Generated Code Display */}
              {generatedCode && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg border-2 border-dashed border-gray-500">
                  <div className="text-center">
                    <p className="text-gray-300 mb-2">Your 5-Digit Privacy Code:</p>
                    <div className="text-4xl font-mono font-bold text-green-400 mb-2">
                      {generatedCode}
                    </div>
                    <p className="text-sm text-gray-400">
                      {qrCodeType === 'trusted' ? '🔴 Trackable for spam prevention' : '⚫ Private interaction'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Valid for 24 hours • {privacyLevel} privacy level
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* QR Scanner */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">QR Scanner</h2>
              
              {showScanner && (
                <div className="mb-4">
                  <video 
                    ref={videoRef}
                    className="w-full max-w-md mx-auto rounded-lg"
                    autoPlay
                    playsInline
                  />
                </div>
              )}
              
              <div className="space-y-4">
                {/* QR Scanner */}
                <div className="border-t border-gray-700 pt-6 mt-6">
                  <button 
                    className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    onClick={() => setShowScanner(true)}
                  >
                    📷 Scan QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Card Preview (Conditional based on display mode) */}
        {displayMode === 'card' ? (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-white">
              🎴 Business Card Preview
            </h3>
            
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800">Your Name</h4>
                  <p className="text-gray-600">Your Title</p>
                  <p className="text-gray-600">Your Company</p>
                </div>
                <div className="text-right">
                  <div className={`w-20 h-20 ${qrCodeType === 'trusted' ? 'bg-red-200' : 'bg-gray-200'} rounded flex items-center justify-center`}>
                    <span className="text-xs text-gray-600">QR</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Privacy Code:</span>
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-8 h-8 border-2 border-gray-400 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">_</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {qrCodeType === 'trusted' ? 'Red QR = Trackable interactions' : 'Standard QR = Private by default'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Mobile QR Display Interface
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-white">
              📱 Mobile QR Display
            </h3>
            
            <div className="text-center mb-6">
              <p className="text-gray-300 mb-4">
                When you run out of physical cards, show this QR code on your phone
              </p>
              
              <button
                onClick={generateMobileQR}
                disabled={!activeCard}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200"
              >
                📱 Show Mobile QR Code
              </button>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">How it works:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Generate your privacy code as usual</li>
                <li>• Tap "Show Mobile QR Code" above</li>
                <li>• Show your phone screen to the person</li>
                <li>• Tell them the 5-digit code verbally</li>
                <li>• Same privacy controls as physical cards</li>
              </ul>
            </div>
          </div>
        )}

        {/* Mobile QR Full-Screen Modal */}
        {showMobileQR && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">SelectConnect</h3>
              
              {/* Large QR Code Display */}
              <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <div className="text-center">
                  <div className="text-6xl mb-2">📱</div>
                  <p className="text-gray-600 text-sm">QR Code</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {qrCodeType === 'trusted' ? '🔴 Trackable' : '⚫ Private'}
                  </p>
                </div>
              </div>
              
              {/* Generated Code Display */}
              {generatedCode && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-2">Tell them this code:</p>
                  <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
                    {generatedCode}
                  </div>
                  <p className="text-xs text-gray-500">
                    {privacyLevel} • Valid 24hrs
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMobileQR(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(mobileQRData);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bond Posting Interface */}
        {/* This would be a modal/overlay in a real implementation */}
      </div>
    </div>
  );
};

export default SelectConnectApp;
