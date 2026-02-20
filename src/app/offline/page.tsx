'use client';

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re offline</h1>
        <p className="text-gray-600 mb-6">
          This page isn&apos;t available without a connection. Check your network and try again.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
        <p className="mt-4 text-sm text-gray-500">
          <Link href="/" className="text-blue-600 hover:underline">
            Go to home
          </Link>
        </p>
      </div>
    </div>
  );
}
