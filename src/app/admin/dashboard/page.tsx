'use client';

import { useIssues } from '@/hooks/useIssues';
import { useAuth } from '@/hooks/useAuth';
import { AdminIssueSection } from '@/components/admin/AdminIssueSection';
import { CommunityAnalytics } from '@/components/admin/CommunityAnalytics';
import { useState, useEffect } from 'react';

interface CommunityStats {
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
}

export default function AdminDashboardPage() {
  const { user, getToken } = useAuth();
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const { issues: pendingIssues, loading: loadingPending, refetch: refetchPending } = useIssues('PENDING_APPROVAL');
  const { issues: approvedIssues, refetch: refetchApproved } = useIssues('APPROVED');
  const { issues: verifiedIssues, refetch: refetchVerified } = useIssues('VERIFIED_BY_NEIGHBOR');
  const { issues: inProgressIssues, loading: loadingInProgress, refetch: refetchInProgress } = useIssues('IN_PROGRESS');
  const { issues: resolvedIssues, loading: loadingResolved, refetch: refetchResolved } = useIssues('RESOLVED');
  const { issues: closedIssues, loading: loadingClosed, refetch: refetchClosed } = useIssues('CLOSED');

  const approvedSectionIssues = [...approvedIssues, ...verifiedIssues];

  const refetchAll = () => {
    refetchPending();
    refetchApproved();
    refetchVerified();
    refetchInProgress();
    refetchResolved();
    refetchClosed();
    fetchCommunityStats();
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

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">{user?.communityName}</p>
      </div>

      {/* Community Analytics */}
      {communityStats && (
        <CommunityAnalytics stats={communityStats} />
      )}

      {/* Pending Approvals Section - Highlighted */}
      <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
          ⚠️ Pending Approvals ({pendingIssues.length})
        </h2>
        {loadingPending ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : pendingIssues.length === 0 ? (
          <p className="text-gray-600 text-sm">No pending issues</p>
        ) : (
          <AdminIssueSection
            status="PENDING_APPROVAL"
            issues={pendingIssues}
            loading={false}
            onAction={refetchAll}
          />
        )}
      </section>

      {/* Issue Tracking Board */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
          Issue Tracking Board
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <AdminIssueSection
            status="APPROVED"
            issues={approvedSectionIssues}
            loading={false}
            onAction={refetchAll}
          />
          <AdminIssueSection
            status="IN_PROGRESS"
            issues={inProgressIssues}
            loading={loadingInProgress}
            onAction={refetchAll}
          />
          <AdminIssueSection
            status="RESOLVED"
            issues={resolvedIssues}
            loading={loadingResolved}
            onAction={refetchAll}
          />
          <AdminIssueSection
            status="CLOSED"
            issues={closedIssues}
            loading={loadingClosed}
            onAction={refetchAll}
          />
        </div>
      </div>
    </div>
  );
}
