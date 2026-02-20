'use client';

import { Card } from '@/components/ui/Card';
import { Award, TrendingUp } from 'lucide-react';

interface CivicPointsCardProps {
  civicPoints: number;
  weeklyPoints: number;
}

export function CivicPointsCard({ civicPoints, weeklyPoints }: CivicPointsCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Civic Points</h3>
          <p className="text-sm text-black">Your contribution score</p>
        </div>
        <Award className="w-8 h-8 text-blue-600" />
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{civicPoints}</span>
            <span className="text-sm text-black">total points</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {weeklyPoints} points this week
          </span>
        </div>
      </div>
    </Card>
  );
}
