'use client';

import { Card } from '@/components/ui/Card';
import { Users, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface CommunityStatsCardProps {
  stats: {
    totalIssues: number;
    totalUsers: number;
    resolutionRate: number;
    avgCivicPoints: number;
  };
}

export function CommunityStatsCard({ stats }: CommunityStatsCardProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
        <Users className="w-5 h-5 text-blue-600" />
        Community Stats
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-black" />
            <span className="text-xs text-black">Total Issues</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalIssues}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-black" />
            <span className="text-xs text-black">Members</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-black">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.resolutionRate}%</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-black">Avg Points</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgCivicPoints}</p>
        </div>
      </div>
    </Card>
  );
}
