'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { PushRegistration } from '@/components/pwa/PushRegistration';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const navLinks = (
    <>
      <Link
        href="/admin/dashboard"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
        onClick={() => setMobileMenuOpen(false)}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/issues"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
        onClick={() => setMobileMenuOpen(false)}
      >
        Manage Issues
      </Link>
      <Link
        href="/admin/verification"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
        onClick={() => setMobileMenuOpen(false)}
      >
        Verifications
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-lg sm:text-xl font-bold text-blue-600 shrink-0">
                Admin Panel
              </Link>
              <div className="hidden md:flex md:ml-6 md:gap-1">
                {navLinks}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-sm text-gray-600 truncate max-w-[140px] lg:max-w-none">
                {user.name} · {user.communityName}
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
      <BottomNav userRole="ADMIN" />
    </div>
  );
}
