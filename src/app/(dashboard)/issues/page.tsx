'use client';

import { useIssues } from '@/hooks/useIssues';
import { IssueCard } from '@/components/issues/IssueCard';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function IssuesPage() {
  const { user } = useAuth();
  const { issues, loading, error } = useIssues();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading issues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Community Issues</h1>
        {user?.role === 'USER' && (
          <Link href="/issues/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Report New Issue
            </Button>
          </Link>
        )}
      </div>

      {issues.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No issues reported yet</p>
          {user?.role === 'USER' && (
            <Link href="/issues/new">
              <Button>Report Your First Issue</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue: any) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
