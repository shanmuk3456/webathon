import { Card } from '@/components/ui/Card';
import { LeaderboardEntry } from '@/types';
import { Trophy } from 'lucide-react';

interface LeaderboardCardProps {
  leaderboard: LeaderboardEntry[];
}

export function LeaderboardCard({ leaderboard }: LeaderboardCardProps) {
  return (
    <Card>
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-black">
        <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
        Top Contributors This Week
      </h3>
      {leaderboard.length === 0 ? (
        <p className="text-black text-xs sm:text-sm">No contributors yet</p>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className="text-lg sm:text-xl font-bold shrink-0 text-black">
                  #{entry.rank}
                </span>
                <span className="font-medium text-sm sm:text-base truncate text-black">{entry.name}</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-black shrink-0 ml-2">
                {entry.weeklyPoints} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
