import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

export default function SelectConnectApp() {
  const [currentStep, setCurrentStep] = useState('create-card');
  const [cardData, setCardData] = useState(null);
  const [routeCode, setRouteCode] = useState(null);
  const [bondData, setBondData] = useState(null);
  const [accessLink, setAccessLink] = useState(null);
  const [revealLevel, setRevealLevel] = useState(0);
  const [proofServerStatus, setProofServerStatus] = useState('checking');

  // Check proof server status
  useEffect(() => {
    fetch('http://localhost:6300/health')
      .then(() => setProofServerStatus('online'))
      .catch(() => setProofServerStatus('offline'));
  }, []);

  const createCard = async (formData) => {
    setCurrentStep('generating-proof');
    
    // Simulate proof generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cardId = 'card_' + Math.random().toString(36).substr(2, 16);
    const newCard = {
      id: cardId,
      adminName: formData.adminName,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      minBond: 3,
      createdAt: new Date().toISOString()
    };
    
    setCardData(newCard);
    setCurrentStep('card-created');
  };

  const generateRoute = async (privacyLevel = 'Personal', trackable = true) => {
    setCurrentStep('generating-route');
    
    // Simulate proof generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const code = String(Math.floor(Math.random() * 90000) + 10000);
    setRouteCode(code);
    setCurrentStep('route-generated');
  };

  const simulateBondPosting = async () => {
    setCurrentStep('bond-posting');
    
    // Simulate bond posting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const bond = {
      id: 'bond_' + Math.random().toString(36).substr(2, 16),
      sender: 'Bob Smith',
      amount: 3,
      message: 'Hi! Great talk at DevCon. Would love to discuss the ZK privacy features.',
      postedAt: new Date().toISOString()
    };
    
    setBondData(bond);
    setCurrentStep('bond-posted');
  };

  const generateAccessLink = async () => {
    setCurrentStep('generating-access');
    
    // Simulate access link generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const link = {
      id: 'link_' + Math.random().toString(36).substr(2, 16),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    setAccessLink(link);
    setRevealLevel(0);
    setCurrentStep('progressive-reveal');
  };

  const revealNextLevel = async () => {
    if (revealLevel >= 3) return;
    
    setCurrentStep('revealing-level');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRevealLevel(revealLevel + 1);
    setCurrentStep('progressive-reveal');
  };

  const getLevelData = (level) => {
    if (!cardData) return '';
    
    const levels = [
      cardData.company || cardData.adminName,
      `linkedin.com/in/${cardData.adminName.toLowerCase().replace(' ', '')}`,
      cardData.email,
      cardData.phone
    ];
    
    return levels[level] || '';
  };

  const getLevelName = (level) => {
    return ['Company', 'LinkedIn', 'Email', 'Phone'][level];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            SelectConnect Protocol
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Privacy-first contact sharing with ZK proofs and economic security
          </p>
          
          {/* Status Indicators */}
          <div className="flex justify-center space-x-6 mb-8">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              proofServerStatus === 'online' ? 'bg-green-600' : 'bg-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                proofServerStatus === 'online' ? 'bg-green-300' : 'bg-red-300'
              }`}></div>
              <span className="text-sm">Proof Server: {proofServerStatus}</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-600">
              <div className="w-2 h-2 rounded-full bg-blue-300"></div>
              <span className="text-sm">Midnight Network: Local</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          
          {/* Step 1: Create Card */}
          {currentStep === 'create-card' && (
            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6 text-cyan-400">🎯 Step 1: Create SelectConnect Card</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                createCard({
                  adminName: formData.get('adminName'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  company: formData.get('company')
                });
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="adminName"
                    placeholder="Your Name"
                    required
                    className="px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400"
                  />
                  <input
                    name="company"
                    placeholder="Company"
                    className="px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400"
                  />
                  <input
                    name="phone"
                    placeholder="Phone"
                    required
                    className="px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all"
                >
                  Create Card with ZK Proof
                </button>
              </form>
            </div>
          )}

          {/* Generating Proof */}
          {currentStep === 'generating-proof' && (
            <div className="bg-gray-800 rounded-xl p-8 mb-8 text-center">
              <div className="animate-spin w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">🔮 Generating ZK Proof</h2>
              <p className="text-gray-300">Creating cryptographic commitments and zero-knowledge proofs...</p>
            </div>
          )}

          {/* Card Created */}
          {(currentStep === 'card-created' || currentStep === 'generating-route' || currentStep === 'route-generated' || currentStep === 'bond-posting' || currentStep === 'bond-posted' || currentStep === 'generating-access' || currentStep === 'progressive-reveal' || currentStep === 'revealing-level') && cardData && (
            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6 text-green-400">✅ SelectConnect Card Created</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-300 mb-2"><strong>Card ID:</strong> {cardData.id}</p>
                  <p className="text-gray-300 mb-2"><strong>Admin:</strong> {cardData.adminName}</p>
                  <p className="text-gray-300 mb-2"><strong>Company:</strong> {cardData.company}</p>
                  <p className="text-gray-300 mb-2"><strong>Min Bond:</strong> {cardData.minBond} ADA</p>
                  <p className="text-gray-300 mb-4"><strong>Created:</strong> {new Date(cardData.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div className="inline-block p-4 bg-green-100 rounded-lg">
                    <div className="text-green-800 text-sm mb-2">Contact commitments generated</div>
                    <div className="text-green-600 text-xs">🔒 Phone & Email hashed with salt</div>
                  </div>
                </div>
              </div>
              
              {currentStep === 'card-created' && (
                <button
                  onClick={() => generateRoute()}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  🔐 Generate Privacy Route
                </button>
              )}
            </div>
          )}

          {/* Generating Route */}
          {currentStep === 'generating-route' && (
            <div className="bg-gray-800 rounded-xl p-8 mb-8 text-center">
              <div className="animate-pulse w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">🔐 Generating Privacy Route</h2>
              <p className="text-gray-300">Creating 5-digit route code with ZK proof...</p>
            </div>
          )}

          {/* Route Generated */}
          {(currentStep === 'route-generated' || currentStep === 'bond-posting' || currentStep === 'bond-posted' || currentStep === 'generating-access' || currentStep === 'progressive-reveal' || currentStep === 'revealing-level') && routeCode && (
            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6 text-purple-400">🔐 Privacy Route Generated</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="text-6xl font-mono font-bold text-center mb-4 text-cyan-400 bg-gray-900 rounded-lg py-8">
                    {routeCode}
                  </div>
                  <p className="text-center text-gray-300 mb-4">5-Digit Privacy Route</p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>• Privacy Level: Personal</p>
                    <p>• Trackable: Yes</p>
                    <p>• Expires: 24 hours</p>
                    <p>• Bond Required: 3 ADA</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <QRCode 
                      value={JSON.stringify({
                        type: 'SelectConnect',
                        version: '1.0',
                        routeCode: routeCode,
                        network: 'testnet'
                      })}
                      size={200}
                    />
                  </div>
                  <p className="text-gray-300 mt-4">Scan to access card</p>
                </div>
              </div>
              
              {currentStep === 'route-generated' && (
                <button
                  onClick={simulateBondPosting}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  💰 Simulate Bond Posting
                </button>
              )}
            </div>
          )}

          {/* Bond Posting */}
          {currentStep === 'bond-posting' && (
            <div className="bg-gray-800 rounded-xl p-8 mb-8 text-center">
              <div className="animate-bounce w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">💰 Posting ADA Bond</h2>
              <p className="text-gray-300">Locking 3 ADA as spam prevention bond...</p>
            </div>
          )}

          {/* Bond Posted */}
          {(currentStep === 'bond-posted' || currentStep === 'generating-access' || currentStep === 'progressive-reveal' || currentStep === 'revealing-level') && bondData && (
            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6 text-yellow-400">💰 Bond Posted Successfully</h2>
              <div className="bg-gray-900 rounded-lg p-6">
                <p className="text-gray-300 mb-2"><strong>Sender:</strong> {bondData.sender}</p>
                <p className="text-gray-300 mb-2"><strong>Amount:</strong> {bondData.amount} ADA</p>
                <p className="text-gray-300 mb-4"><strong>Message:</strong></p>
                <div className="bg-gray-700 rounded-lg p-4 text-gray-200 italic">
                  "{bondData.message}"
                </div>
              </div>
              
              {currentStep === 'bond-posted' && (
                <button
                  onClick={generateAccessLink}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all"
                >
                  🔗 Generate Access Link
                </button>
              )}
            </div>
          )}

          {/* Generating Access */}
          {currentStep === 'generating-access' && (
            <div className="bg-gray-800 rounded-xl p-8 mb-8 text-center">
              <div className="animate-pulse w-16 h-16 bg-green-500 rounded-full mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">🔗 Generating Access Link</h2>
              <p className="text-gray-300">Creating progressive reveal access link...</p>
            </div>
          )}

          {/* Progressive Reveal */}
          {(currentStep === 'progressive-reveal' || currentStep === 'revealing-level') && accessLink && (
            <div className="bg-gray-800 rounded-xl p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6 text-green-400">📊 Progressive Reveal</h2>
              
              {/* Level Progress */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  {[0, 1, 2, 3].map((level) => (
                    <div key={level} className={`flex-1 text-center ${level <= revealLevel ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl ${
                        level <= revealLevel ? 'bg-green-500' : 'bg-gray-600'
                      }`}>
                        {level <= revealLevel ? '✓' : level + 1}
                      </div>
                      <p className="text-sm">{getLevelName(level)}</p>
                    </div>
                  ))}
                </div>
                
                {/* Current Level Data */}
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <h3 className="text-xl font-bold mb-4 text-cyan-400">
                    Level {revealLevel}: {getLevelName(revealLevel)}
                  </h3>
                  <div className="text-2xl font-mono bg-gray-700 rounded-lg py-4 px-6 text-green-400">
                    {getLevelData(revealLevel)}
                  </div>
                </div>
              </div>
              
              {/* Reveal Controls */}
              {currentStep === 'revealing-level' && (
                <div className="text-center">
                  <div className="animate-pulse text-cyan-400 mb-4">🔮 Generating ZK proof for level access...</div>
                </div>
              )}
              
              {currentStep === 'progressive-reveal' && revealLevel < 3 && (
                <div className="text-center">
                  <button
                    onClick={revealNextLevel}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
                  >
                    🔓 Reveal Level {revealLevel + 1} ({getLevelName(revealLevel + 1)})
                  </button>
                </div>
              )}
              
              {revealLevel === 3 && (
                <div className="text-center">
                  <div className="text-2xl text-green-400 mb-4">🎉 Full Contact Information Revealed!</div>
                  <p className="text-gray-300">Progressive trust building complete. Bond can now be refunded.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
