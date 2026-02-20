'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, AlertCircle, Trophy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  userRole?: 'USER' | 'ADMIN';
}

export function BottomNav({ userRole = 'USER' }: BottomNavProps) {
  const pathname = usePathname();

  if (userRole === 'ADMIN') {
    const adminLinks = [
      { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
      { href: '/admin/issues', label: 'Issues', icon: AlertCircle },
      { href: '/admin/verification', label: 'Verify', icon: Settings },
    ];

    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
        <div className="flex justify-around items-center h-16">
          {adminLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  const userLinks = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/issues', label: 'Issues', icon: AlertCircle },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {userLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
