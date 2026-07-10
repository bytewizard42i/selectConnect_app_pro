import Head from 'next/head';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white flex items-center justify-center">
      <Head>
        <title>Subscription Active — SelectConnect</title>
      </Head>
      <div className="text-center max-w-md mx-auto px-6">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-4">Welcome to SelectConnect Pro!</h1>
        <p className="text-gray-300 mb-8">
          Your subscription is now active. You&apos;ll receive a confirmation email shortly.
        </p>
        <a
          href="/demo"
          className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all"
        >
          Start Using SelectConnect →
        </a>
      </div>
    </div>
  );
}
