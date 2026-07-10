import { useState } from 'react';
import Head from 'next/head';

export default function SelectConnectLanding() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Free',
      tagline: 'Try it out',
      monthly: 0,
      yearly: 0,
      features: [
        '1 active SelectConnect card',
        'Up to 5 contacts per month',
        'Basic progressive reveal (2 levels)',
        'Community support',
      ],
      cta: 'Get Started',
      priceId: null,
      highlight: false,
    },
    {
      name: 'Pro',
      tagline: 'For active networkers',
      monthly: 19,
      yearly: 190,
      features: [
        'Unlimited SelectConnect cards',
        'Unlimited contacts',
        'Full progressive reveal (4 levels)',
        'Custom bond amounts',
        'QR code branding',
        'Priority support',
      ],
      cta: 'Upgrade to Pro',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      highlight: true,
    },
    {
      name: 'Enterprise',
      tagline: 'For teams & organizations',
      monthly: 99,
      yearly: 990,
      features: [
        'Everything in Pro',
        'Team dashboard & analytics',
        'SSO / SAML integration',
        'Custom domain & branding',
        'Audit logs & compliance reports',
        'Dedicated account manager',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      priceId: process.env.NEXT_PUBLIC_STRIPE_ENT_PRICE_ID,
      highlight: false,
    },
  ];

  const handleSubscribe = async (priceId) => {
    if (!priceId) {
      window.location.href = '/demo';
      return;
    }
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, billingCycle }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white">
      <Head>
        <title>SelectConnect — Privacy-First Contact Sharing</title>
        <meta name="description" content="Share your contact info safely with ZK proofs and economic security. Progressive reveal, bond-staking, abuse deterrence on Midnight Network." />
        <meta property="og:title" content="SelectConnect — Privacy-First Contact Sharing" />
        <meta property="og:description" content="Share contacts safely. Reveal progressively. Deter abuse with staked bonds." />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔗</span>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            SelectConnect
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="/demo" className="text-gray-300 hover:text-white transition-colors">Demo</a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
          <a
            href="/demo"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all"
          >
            Try Demo
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm mb-6">
          🔒 Powered by Midnight Network ZK proofs
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Share your contact info.
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Reveal only what feels right.
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          SelectConnect lets you share contact details through progressive disclosure —
          backed by zero-knowledge proofs and staked bonds that deter abuse.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/demo"
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all text-lg"
          >
            Try the Demo
          </a>
          <a
            href="#pricing"
            className="px-8 py-3 rounded-lg border border-gray-600 font-semibold hover:border-white transition-all text-lg"
          >
            See Pricing
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: '🎯', title: 'Create Card', desc: 'Set up your SelectConnect card with contact info you want to share.' },
            { icon: '🔐', title: 'Generate Route', desc: 'Get a 5-digit code + QR. Share it online or in person — your info stays hidden.' },
            { icon: '💰', title: 'Bond Staking', desc: 'Contacts stake ADA to reach you. Bad actors lose their bond. Good actors get it back.' },
            { icon: '📊', title: 'Progressive Reveal', desc: 'Reveal contact info one level at a time. Company → LinkedIn → Email → Phone.' },
          ].map((step, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-cyan-400">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-center text-gray-400 mb-8">Start free. Upgrade when you need more.</p>

        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-lg border border-gray-700 p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly' ? 'bg-purple-600 text-white' : 'text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'yearly' ? 'bg-purple-600 text-white' : 'text-gray-400'
              }`}
            >
              Yearly
              <span className="ml-1 text-green-400 text-xs">save ~17%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border-2 transition-all ${
                plan.highlight
                  ? 'border-purple-500 bg-purple-900/20 scale-105'
                  : 'border-gray-700 bg-gray-800/30'
              }`}
            >
              {plan.highlight && (
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.tagline}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${billingCycle === 'monthly' ? plan.monthly : plan.yearly}
                </span>
                <span className="text-gray-400 ml-1">
                  /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.priceId)}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
                    : 'border border-gray-600 hover:border-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="px-6 py-12 max-w-4xl mx-auto text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'ZK Proofs', icon: '🔒' },
            { label: 'Midnight Network', icon: '🌙' },
            { label: 'Bond-Staked', icon: '💰' },
            { label: 'Progressive Reveal', icon: '📊' },
          ].map((badge, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{badge.icon}</span>
              <span className="text-sm text-gray-400">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to connect safely?</h2>
        <p className="text-gray-400 mb-8">Try the demo — no signup required.</p>
        <a
          href="/demo"
          className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all text-lg"
        >
          Launch Demo →
        </a>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800 text-center text-sm text-gray-500">
        <p>SelectConnect Protocol — Privacy-first contact sharing on Midnight Network</p>
        <p className="mt-1">© 2026 EnterpriseZK Labs LLC. Apache 2.0 licensed.</p>
      </footer>
    </div>
  );
}
