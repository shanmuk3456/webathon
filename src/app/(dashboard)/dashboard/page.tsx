'use client';

import { IssueStatusCards } from '@/components/dashboard/IssueStatusCards';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import { CivicPointsCard } from '@/components/dashboard/CivicPointsCard';
import { CommunityStatsCard } from '@/components/dashboard/CommunityStatsCard';
import { IssueStatusList } from '@/components/dashboard/IssueStatusList';
import { useIssues } from '@/hooks/useIssues';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

interface CommunityStats {
  totalIssues: number;
  totalUsers: number;
  resolutionRate: number;
  avgCivicPoints: number;
}

export default function DashboardPage() {
  const { user, getToken } = useAuth();
  const { issues } = useIssues();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    fetchCommunityStats();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = getToken();
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
      setLoadingLeaderboard(false);
    }
  };

  const fetchCommunityStats = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/community/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCommunityStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch community stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const recentIssues = issues.slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      {/* Header with Raise Complaint Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-black mt-1">{user?.communityName}</p>
        </div>
        {user?.role === 'USER' && (
          <Link href="/issues/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Raise Complaint
            </Button>
          </Link>
        )}
      </div>

      {/* Civic Points Card */}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <CivicPointsCard
            civicPoints={user.civicPoints}
            weeklyPoints={user.weeklyPoints}
          />
          {communityStats && (
            <CommunityStatsCard stats={communityStats} />
          )}
        </div>
      )}

      {/* Issue Status Cards */}
      <IssueStatusCards />

      {/* Issue Status List */}
      <IssueStatusList />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Issues */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-black">Recent Issues</h2>
            {recentIssues.length === 0 ? (
              <p className="text-black text-sm sm:text-base">No issues reported yet</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentIssues.map((issue: any) => (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="block border-b border-gray-200 pb-3 sm:pb-4 last:border-0 hover:bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 rounded transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-medium text-blue-600 hover:text-blue-800">
                          {issue.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-black mt-1 line-clamp-2">
                          {issue.description.substring(0, 100)}
                          {issue.description.length > 100 && '...'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        {issue.supportCount != null && issue.supportCount > 1 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                            {issue.supportCount} support
                          </span>
                        )}
                        <span className="text-xs text-black whitespace-nowrap">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-black">
                          {issue.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Leaderboard */}
        <div className="space-y-4 sm:space-y-6">
          {loadingLeaderboard ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-black text-sm">Loading leaderboard...</p>
            </div>
          ) : (
            <LeaderboardCard leaderboard={leaderboard} />
          )}
        </div>
      </div>
    </div>
  );
}
