'use client';

import { Card } from '@/components/ui/Card';
import { Users, AlertCircle, CheckCircle, TrendingUp, Clock, XCircle } from 'lucide-react';

interface CommunityAnalyticsProps {
  stats: {
    totalIssues: number;
    pendingIssues: number;
    approvedIssues: number;
    inProgressIssues: number;
    resolvedIssues: number;
    closedIssues: number;
    totalUsers: number;
    totalCivicPoints: number;
    avgCivicPoints: number;
    resolutionRate: number;
  };
}

export function CommunityAnalytics({ stats }: CommunityAnalyticsProps) {
  const statCards = [
    {
      label: 'Total Issues',
      value: stats.totalIssues,
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pending',
      value: stats.pendingIssues,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'In Progress',
      value: stats.inProgressIssues,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Resolved',
      value: stats.resolvedIssues,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Closed',
      value: stats.closedIssues,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      label: 'Resolution Rate',
      value: `${stats.resolutionRate}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        Community Analytics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-4 border border-transparent hover:border-gray-200 transition-colors`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs font-medium text-gray-700">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Members</p>
          <p className="text-xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Avg Civic Points</p>
          <p className="text-xl font-bold text-gray-900">{stats.avgCivicPoints}</p>
        </div>
      </div>
    </Card>
  );
}
