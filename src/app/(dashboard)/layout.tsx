'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { PushRegistration } from '@/components/pwa/PushRegistration';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout, getToken } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Keep user's last known GPS location up-to-date (for radius verification eligibility).
  useEffect(() => {
    if (!user || user.role !== 'USER') return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const token = getToken();
          if (!token) return;
          await fetch('/api/users/location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          });
        } catch (_) {}
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 }
    );
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navLinks = (
    <>
      <Link
        href="/dashboard"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
        onClick={() => setMobileMenuOpen(false)}
      >
        Dashboard
      </Link>
      <Link
        href="/issues"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
        onClick={() => setMobileMenuOpen(false)}
      >
        Issues
      </Link>
      <Link
        href="/leaderboard"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
        onClick={() => setMobileMenuOpen(false)}
      >
        Leaderboard
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-lg sm:text-xl font-bold text-blue-600 shrink-0">
                Civic Platform
              </Link>
              <div className="hidden md:flex md:ml-6 md:gap-1">
                {navLinks}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-sm text-gray-600 truncate max-w-[120px] lg:max-w-none">
                {user.name} ({user.communityName})
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {user.weeklyPoints} pts
              </span>
              <Button variant="outline" onClick={logout} className="shrink-0 text-sm">
                Logout
              </Button>
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-200 flex flex-col gap-1">
              {navLinks}
              <div className="pt-2 mt-2 border-t border-gray-100 text-sm text-gray-500">
                {user.name} · {user.communityName}
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 md:pb-6">
        {children}
      </main>
      <PushRegistration />
      <BottomNav userRole={user?.role || 'USER'} />
    </div>
  );
}
