const express = require('express');
const QRCode = require('qrcode');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Mock data store (in production this would be on Midnight blockchain)
const cards = new Map();
const bonds = new Map();

// Using in-memory storage for demo (Redis removed for simplicity)

// Mock NoirCard Protocol functions
class NoirCardProtocol {
  static createCard(aliasHash, requiresBond, minBondAmount, phoneCommit, emailCommit) {
    const cardId = crypto.randomUUID();
    const card = {
      id: cardId,
      aliasHash,
      requiresBond,
      minBondAmount,
      phoneCommit,
      emailCommit,
      active: true,
      revealLevels: [
        { level: 0, data: 'Name revealed' },
        { level: 1, data: 'LinkedIn revealed' },
        { level: 2, data: 'Email revealed' },
        { level: 3, data: 'Phone revealed' }
      ],
      createdAt: new Date()
    };
    cards.set(cardId, card);
    return cardId;
  }

  static postBond(cardId, amount, senderCommit) {
    const bondId = crypto.randomUUID();
    const bond = {
      id: bondId,
      cardId,
      amount,
      senderCommit,
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    bonds.set(bondId, bond);
    return bondId;
  }

  static getBondState(bondId) {
    return bonds.get(bondId) || null;
  }

  static getCard(cardId) {
    return cards.get(cardId) || null;
  }
}

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>🃏 NoirCard Demo</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: white;
            }
            .card { 
                background: #0f3460; 
                padding: 20px; 
                border-radius: 10px; 
                margin: 20px 0;
                border: 1px solid #e94560;
            }
            button { 
                background: #e94560; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 5px;
            }
            button:hover { background: #c73650; }
            input { 
                padding: 10px; 
                margin: 5px; 
                border-radius: 5px; 
                border: 1px solid #ccc;
                width: 200px;
            }
            .qr-code { text-align: center; margin: 20px 0; }
            .bond-info { 
                background: #1a1a2e; 
                padding: 15px; 
                border-radius: 8px; 
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <h1>🃏 NoirCard Protocol Demo</h1>
        <p><strong>Privacy-First Professional Networking with Abuse Protection</strong></p>
        
        <div class="card">
            <h2>Create NoirCard</h2>
            <input type="text" id="name" placeholder="Your Name" />
            <input type="text" id="email" placeholder="Email" />
            <input type="text" id="phone" placeholder="Phone" />
            <input type="number" id="bondAmount" placeholder="Required Bond (ADA)" value="3" />
            <br>
            <button onclick="createCard()">Create Card</button>
        </div>

        <div id="cardResult"></div>

        <div class="card">
            <h2>Post Abuse Bond</h2>
            <input type="text" id="contactCardId" placeholder="Card ID to contact" />
            <input type="number" id="bondValue" placeholder="Bond amount" value="3" />
            <button onclick="postBond()">Post Bond & Contact</button>
        </div>

        <div id="bondResult"></div>

        <script>
            async function createCard() {
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const bondAmount = document.getElementById('bondAmount').value;

                const response = await fetch('/api/create-card', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, bondAmount })
                });

                const result = await response.json();
                document.getElementById('cardResult').innerHTML = \`
                    <div class="card">
                        <h3>✅ NoirCard Created!</h3>
                        <p><strong>Card ID:</strong> \${result.cardId}</p>
                        <p><strong>Required Bond:</strong> \${result.bondAmount} ADA</p>
                        <div class="qr-code">
                            <img src="\${result.qrCode}" alt="QR Code" />
                            <p>Scan to contact (requires \${result.bondAmount} ADA bond)</p>
                        </div>
                        <div class="bond-info">
                            <h4>🛡️ Abuse Protection Active</h4>
                            <p>• Senders must post \${result.bondAmount} ADA bond</p>
                            <p>• Progressive reveal: Name → LinkedIn → Email → Phone</p>
                            <p>• Harassment results in bond slashing</p>
                        </div>
                    </div>
                \`;
            }

            async function postBond() {
                const cardId = document.getElementById('contactCardId').value;
                const amount = document.getElementById('bondValue').value;

                const response = await fetch('/api/post-bond', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cardId, amount })
                });

                const result = await response.json();
                document.getElementById('bondResult').innerHTML = \`
                    <div class="card">
                        <h3>\${result.success ? '✅' : '❌'} Bond Status</h3>
                        <p>\${result.message}</p>
                        \${result.success ? \`
                            <div class="bond-info">
                                <p><strong>Bond ID:</strong> \${result.bondId}</p>
                                <p><strong>Amount:</strong> \${result.amount} ADA</p>
                                <p><strong>Status:</strong> Active</p>
                                <p><strong>Expires:</strong> 24 hours</p>
                                <h4>🔓 Progressive Reveal Available</h4>
                                <p>You can now contact this person with progressive information disclosure.</p>
                            </div>
                        \` : ''}
                    </div>
                \`;
            }
        </script>
    </body>
    </html>
  `);
});

app.post('/api/create-card', async (req, res) => {
  const { name, email, phone, bondAmount } = req.body;
  
  // Create cryptographic commitments (mock)
  const phoneCommit = crypto.createHash('sha256').update(phone + 'salt').digest('hex');
  const emailCommit = crypto.createHash('sha256').update(email + 'salt').digest('hex');
  const aliasHash = crypto.createHash('sha256').update(name).digest('hex');
  
  const cardId = NoirCardProtocol.createCard(
    aliasHash, 
    true, 
    parseFloat(bondAmount), 
    phoneCommit, 
    emailCommit
  );
  
  // Generate QR code
  const qrData = JSON.stringify({
    cardId,
    bondRequired: bondAmount,
    type: 'noircard'
  });
  
  const qrCode = await QRCode.toDataURL(qrData);
  
  res.json({
    cardId,
    bondAmount,
    qrCode,
    message: 'NoirCard created successfully with abuse protection!'
  });
});

app.post('/api/post-bond', (req, res) => {
  const { cardId, amount } = req.body;
  
  const card = NoirCardProtocol.getCard(cardId);
  if (!card) {
    return res.json({ success: false, message: 'Card not found' });
  }
  
  if (parseFloat(amount) < card.minBondAmount) {
    return res.json({ 
      success: false, 
      message: `Insufficient bond. Minimum required: ${card.minBondAmount} ADA` 
    });
  }
  
  // Create sender commitment (mock)
  const senderCommit = crypto.createHash('sha256').update(cardId + Date.now()).digest('hex');
  
  const bondId = NoirCardProtocol.postBond(cardId, parseFloat(amount), senderCommit);
  
  res.json({
    success: true,
    bondId,
    amount: parseFloat(amount),
    message: 'Bond posted successfully! You can now contact this person.',
    revealLevels: card.revealLevels
  });
});

app.get('/api/card/:cardId', (req, res) => {
  const card = NoirCardProtocol.getCard(req.params.cardId);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }
  
  res.json({
    cardId: card.id,
    requiresBond: card.requiresBond,
    minBondAmount: card.minBondAmount,
    active: card.active
  });
});

app.listen(PORT, () => {
  console.log('🃏 NoirCard Demo Server Started!');
  console.log('================================');
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log('🔄 Redis: localhost:6379 (if available)');
  console.log('');
  console.log('🎯 Demo Features:');
  console.log('  • Create privacy-preserving business cards');
  console.log('  • Post abuse bonds for spam prevention');
  console.log('  • Progressive reveal system');
  console.log('  • QR code generation');
  console.log('');
  console.log('🛡️ Built for Midnight Network Privacy Challenge');
  console.log('================================');
});
