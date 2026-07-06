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

// Import SelectConnectProtocol contract (when available)
class SelectConnectProtocol {
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
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>SelectConnect — Privacy-First Contact Sharing</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#0a0814;--surface:rgba(15,12,30,0.6);--border:rgba(124,58,237,0.15);--accent:#a78bfa;--accent2:#e94560;--accent3:#22d3ee;--text:#c4b8e8;--text-dim:rgba(196,184,232,0.4);--radius:16px;--blur:blur(16px)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Rajdhani',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 20% 0%,rgba(124,58,237,0.08),transparent 50%),radial-gradient(ellipse at 80% 100%,rgba(233,69,96,0.06),transparent 50%),radial-gradient(ellipse at 50% 50%,rgba(34,211,238,0.04),transparent 60%);z-index:0;animation:aurora 20s ease-in-out infinite alternate}
body::after{content:'';position:fixed;inset:0;background:linear-gradient(rgba(124,58,237,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.02) 1px,transparent 1px);background-size:40px 40px;z-index:0}
@keyframes aurora{0%{transform:translate(0,0) scale(1)}50%{transform:translate(-3%,2%) scale(1.05)}100%{transform:translate(2%,-1%) scale(0.98)}}
.header{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:14px 28px;border-bottom:1px solid var(--border);background:rgba(10,8,20,0.8);backdrop-filter:var(--blur)}
.h-left{display:flex;align-items:center;gap:10px}.h-icon{font-size:22px}.h-title{font-size:18px;font-weight:700;color:#fff;letter-spacing:1px}.h-title span{color:var(--accent)}
.demo-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;background:rgba(255,191,0,0.12);color:#ffbf00;border:1px solid rgba(255,191,0,0.25);text-transform:uppercase;letter-spacing:1px}
.main{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:28px 20px}
.glass{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);backdrop-filter:var(--blur);padding:24px;margin-bottom:20px;transition:transform .15s ease-out,box-shadow .2s;transform-style:preserve-3d;will-change:transform}
.glass:hover{box-shadow:0 8px 32px rgba(124,58,237,0.12)}
.section-title{font-size:15px;font-weight:600;color:#fff;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.section-title .icon{font-size:18px}
[data-tip]{position:relative}
[data-tip]::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);background:rgba(15,12,30,0.95);color:var(--text);padding:8px 14px;border-radius:8px;font-size:12px;font-weight:400;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;border:1px solid var(--border);z-index:100;max-width:300px;white-space:normal;text-align:center;width:max-content}
[data-tip]:hover::after{opacity:1;transform:translateX(-50%) translateY(0)}
.field-group{display:flex;flex-direction:column;gap:12px}
.field-row{display:flex;gap:12px;flex-wrap:wrap}
.input{flex:1;min-width:180px;padding:12px 16px;background:rgba(10,8,20,0.6);border:1px solid var(--border);border-radius:10px;color:#fff;font-family:inherit;font-size:14px;transition:border-color .2s,box-shadow .2s}
.input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(167,139,250,0.1)}
.input::placeholder{color:rgba(196,184,232,0.3)}
.btn{padding:12px 24px;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:transform .1s,box-shadow .2s,filter .2s;display:inline-flex;align-items:center;gap:8px}
.btn-primary{background:linear-gradient(135deg,var(--accent),#7c3aed);color:#fff;box-shadow:0 4px 16px rgba(124,58,237,0.25)}
.btn-primary:hover{filter:brightness(1.1);box-shadow:0 6px 24px rgba(124,58,237,0.35)}
.btn-primary:active{transform:scale(0.96)}
.btn-secondary{background:linear-gradient(135deg,var(--accent2),#c73650);color:#fff;box-shadow:0 4px 16px rgba(233,69,96,0.2)}
.btn-secondary:hover{filter:brightness(1.1);box-shadow:0 6px 24px rgba(233,69,96,0.3)}
.btn-secondary:active{transform:scale(0.96)}
.result-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);backdrop-filter:var(--blur);padding:24px;margin-bottom:20px;animation:fadeIn .3s ease-out}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.qr-wrap{text-align:center;margin:16px 0}.qr-wrap img{border-radius:12px;border:2px solid var(--border);background:#fff;padding:8px}
.bond-info{background:rgba(10,8,20,0.5);border:1px solid rgba(34,211,238,0.15);border-radius:12px;padding:16px;margin-top:12px}
.bond-info h4{font-size:13px;color:var(--accent3);margin-bottom:8px}
.bond-info p{font-size:13px;color:var(--text-dim);line-height:1.6}
.stat-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px}
.stat-pill{flex:1;min-width:140px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;backdrop-filter:var(--blur)}
.stat-pill .val{font-size:24px;font-weight:700;color:#fff}
.stat-pill .lbl{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--text-dim);margin-top:4px}
.reveal-steps{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.reveal-step{padding:6px 12px;border-radius:8px;font-size:11px;font-weight:600;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.15);color:var(--accent)}
.reveal-step.active{background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.2);color:#22c55e}
.footer{text-align:center;padding:24px;font-size:10px;color:var(--text-dim);text-transform:uppercase;letter-spacing:1.5px;position:relative;z-index:1}
@media(max-width:640px){.field-row{flex-direction:column}.stat-pill{min-width:100px}}
</style>
</head>
<body>
<div class="header">
<div class="h-left"><span class="h-icon">🃏</span><span class="h-title">Select<span>Connect</span></span></div>
<span class="demo-badge">🎭 Demo Mode</span>
</div>
<div class="main">
<div style="text-align:center;margin-bottom:28px">
<h1 style="font-size:28px;font-weight:700;color:#fff;margin-bottom:6px">Privacy-First Contact Sharing</h1>
<p style="font-size:14px;color:var(--text-dim)">Create cards with abuse bonds · Progressive reveal · Zero-knowledge on Midnight</p>
</div>
<div class="stat-row">
<div class="stat-pill" data-tip="Total contact cards created in this demo session"><div class="val" id="stat-cards">0</div><div class="lbl">Cards Created</div></div>
<div class="stat-pill" data-tip="Active abuse bonds posted by senders"><div class="val" id="stat-bonds">0</div><div class="lbl">Bonds Posted</div></div>
<div class="stat-pill" data-tip="Progressive reveal levels: Name → LinkedIn → Email → Phone"><div class="val">4</div><div class="lbl">Reveal Levels</div></div>
<div class="stat-pill" data-tip="Abuse bonds are slashed if the sender harasses the card owner"><div class="val">100%</div><div class="lbl">Abuse Protected</div></div>
</div>
<div class="glass" id="create-card-card">
<div class="section-title"><span class="icon">🃏</span> Create Contact Card <span style="font-size:12px;color:var(--text-dim);font-weight:400">(fields are hash-committed, never stored in plaintext on-chain)</span></div>
<div class="field-group">
<input class="input" type="text" id="name" placeholder="Your Name (hash-committed)" data-tip="Your name is stored as a cryptographic commitment, not in plaintext" />
<div class="field-row">
<input class="input" type="text" id="email" placeholder="Email (hash-committed)" data-tip="Email is committed off-chain, revealed only at level 2" />
<input class="input" type="text" id="phone" placeholder="Phone (hash-committed)" data-tip="Phone is committed off-chain, revealed only at level 3" />
</div>
<div class="field-row">
<input class="input" type="number" id="bondAmount" placeholder="Required Bond (ADA)" value="3" data-tip="Minimum abuse bond a sender must post to contact you" style="max-width:200px" />
<button class="btn btn-primary" onclick="createCard()" data-tip="Creates your card with a QR code others can scan to contact you">🃏 Create Card</button>
</div>
</div>
</div>
<div id="cardResult"></div>
<div class="glass" id="post-bond-card">
<div class="section-title"><span class="icon">🛡️</span> Post Abuse Bond & Contact <span style="font-size:12px;color:var(--text-dim);font-weight:400">(bond is staked on-chain, slashed on abuse)</span></div>
<div class="field-group">
<div class="field-row">
<input class="input" type="text" id="contactCardId" placeholder="Card ID to contact" data-tip="Paste the card ID from a QR code or shared link" />
<input class="input" type="number" id="bondValue" placeholder="Bond amount (ADA)" value="3" data-tip="Must meet or exceed the card's minimum bond requirement" style="max-width:180px" />
<button class="btn btn-secondary" onclick="postBond()" data-tip="Posts the bond and unlocks progressive reveal of contact info">🛡️ Post Bond & Contact</button>
</div>
</div>
</div>
<div id="bondResult"></div>
<div class="glass">
<div class="section-title"><span class="icon">📖</span> How It Works</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
<div style="padding:14px;background:rgba(10,8,20,0.4);border-radius:10px;border:1px solid rgba(124,58,237,0.08)"><div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:4px">1. Create Card</div><div style="font-size:12px;color:var(--text-dim);line-height:1.5">Your contact info is hash-committed. A QR code is generated for sharing.</div></div>
<div style="padding:14px;background:rgba(10,8,20,0.4);border-radius:10px;border:1px solid rgba(124,58,237,0.08)"><div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:4px">2. Sender Posts Bond</div><div style="font-size:12px;color:var(--text-dim);line-height:1.5">Sender stakes ADA on-chain. Bond is slashed if they abuse the contact.</div></div>
<div style="padding:14px;background:rgba(10,8,20,0.4);border-radius:10px;border:1px solid rgba(124,58,237,0.08)"><div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:4px">3. Progressive Reveal</div><div style="font-size:12px;color:var(--text-dim);line-height:1.5">Info unlocks gradually: Name → LinkedIn → Email → Phone.</div></div>
<div style="padding:14px;background:rgba(10,8,20,0.4);border-radius:10px;border:1px solid rgba(124,58,237,0.08)"><div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:4px">4. Zero-Knowledge</div><div style="font-size:12px;color:var(--text-dim);line-height:1.5">All proofs are ZK on Midnight. Verifiers learn the answer, never the data.</div></div>
</div>
</div>
</div>
<div class="footer">SelectConnect v1.0 · Midnight Network · Privacy-First Contact Sharing · Abuse Bond Protected</div>
<script>
let cardCount=0,bondCount=0;
function haptic(ms){navigator.vibrate&&navigator.vibrate(ms)}
function updateStats(){document.getElementById('stat-cards').textContent=cardCount;document.getElementById('stat-bonds').textContent=bondCount}
document.querySelectorAll('.glass').forEach(c=>{c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-0.5;const y=(e.clientY-r.top)/r.height-0.5;c.style.transform='perspective(800px) rotateY('+x*4+'deg) rotateX('+(-y*4)+'deg)'});c.addEventListener('mouseleave',()=>{c.style.transform=''})});
document.querySelectorAll('.btn').forEach(b=>{b.addEventListener('mouseenter',()=>haptic(8));b.addEventListener('click',()=>haptic(15))});
async function createCard(){
haptic(20);
const name=document.getElementById('name').value;const email=document.getElementById('email').value;const phone=document.getElementById('phone').value;const bondAmount=document.getElementById('bondAmount').value;
const response=await fetch('/api/create-card',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,phone,bondAmount})});
const result=await response.json();
cardCount++;updateStats();
document.getElementById('cardResult').innerHTML=\`
<div class="result-card">
<div class="section-title"><span class="icon">✅</span> Contact Card Created</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:12px"><strong style="color:#fff">Card ID:</strong> <span style="font-family:'JetBrains Mono',monospace;color:var(--accent);font-size:12px">\${result.cardId}</span></p>
<div class="qr-wrap"><img src="\${result.qrCode}" alt="QR Code" style="width:180px;height:180px"/><p style="font-size:12px;color:var(--text-dim);margin-top:8px">Scan to contact (requires \${result.bondAmount} ADA bond)</p></div>
<div class="bond-info">
<h4>🛡️ Abuse Protection Active</h4>
<p>• Senders must post <strong style="color:#fff">\${result.bondAmount} ADA</strong> bond</p>
<p>• Progressive reveal: Name → LinkedIn → Email → Phone</p>
<p>• Harassment results in bond slashing</p>
<div class="reveal-steps"><span class="reveal-step active">Name</span><span class="reveal-step">LinkedIn</span><span class="reveal-step">Email</span><span class="reveal-step">Phone</span></div>
</div>
</div>\`;
}
async function postBond(){
haptic(20);
const cardId=document.getElementById('contactCardId').value;const amount=document.getElementById('bondValue').value;
const response=await fetch('/api/post-bond',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cardId,amount})});
const result=await response.json();
if(result.success){bondCount++;updateStats();}
document.getElementById('bondResult').innerHTML=\`
<div class="result-card">
<div class="section-title"><span class="icon">\${result.success?'✅':'❌'}</span> Bond Status</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:12px">\${result.message}</p>
\${result.success?\`
<div class="bond-info">
<p><strong style="color:#fff">Bond ID:</strong> <span style="font-family:'JetBrains Mono',monospace;color:var(--accent);font-size:12px">\${result.bondId}</span></p>
<p><strong style="color:#fff">Amount:</strong> \${result.amount} ADA</p>
<p><strong style="color:#fff">Status:</strong> <span style="color:#22c55e">Active</span></p>
<p><strong style="color:#fff">Expires:</strong> 24 hours</p>
<h4 style="margin-top:12px">🔓 Progressive Reveal Available</h4>
<p>You can now contact this person with progressive information disclosure.</p>
<div class="reveal-steps"><span class="reveal-step active">Name</span><span class="reveal-step active">LinkedIn</span><span class="reveal-step">Email</span><span class="reveal-step">Phone</span></div>
</div>\`:''}
</div>\`;
}
</script>
</body>
</html>`);
});

app.post('/api/create-card', async (req, res) => {
  const { name, email, phone, bondAmount } = req.body;
  
  // Create cryptographic commitments (mock)
  const phoneCommit = crypto.createHash('sha256').update(phone + 'salt').digest('hex');
  const emailCommit = crypto.createHash('sha256').update(email + 'salt').digest('hex');
  const aliasHash = crypto.createHash('sha256').update(name).digest('hex');
  
  const cardId = SelectConnectProtocol.createCard(
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
    type: 'selectconnect'
  });
  
  const qrCode = await QRCode.toDataURL(qrData);
  
  res.json({
    cardId,
    bondAmount,
    qrCode,
    message: 'SelectConnect created successfully with abuse protection!'
  });
});

app.post('/api/post-bond', (req, res) => {
  const { cardId, amount } = req.body;
  
  const card = SelectConnectProtocol.getCard(cardId);
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
  
  const bondId = SelectConnectProtocol.postBond(cardId, parseFloat(amount), senderCommit);
  
  res.json({
    success: true,
    bondId,
    amount: parseFloat(amount),
    message: 'Bond posted successfully! You can now contact this person.',
    revealLevels: card.revealLevels
  });
});

app.get('/api/card/:cardId', (req, res) => {
  const card = SelectConnectProtocol.getCard(req.params.cardId);
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
  console.log('🃏 SelectConnect Demo Server Started!');
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
