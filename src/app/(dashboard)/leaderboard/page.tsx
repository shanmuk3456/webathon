'use client';

import { useState, useEffect } from 'react';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import { LeaderboardEntry } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/leaderboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leaderboard</h1>
      </div>

      <Card>
        <p className="text-sm sm:text-base text-black mb-4">
          Top contributors from your community this week
        </p>
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-xs sm:text-sm text-blue-800">
              Your weekly points: <span className="font-bold">{user.weeklyPoints}</span>
            </p>
          </div>
        )}
      </Card>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <div className="text-base sm:text-lg">Loading leaderboard...</div>
        </div>
      ) : (
        <LeaderboardCard leaderboard={leaderboard} />
      )}
    </div>
  );
}
