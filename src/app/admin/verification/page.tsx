'use client';

import { useIssues } from '@/hooks/useIssues';
import { Card } from '@/components/ui/Card';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import Link from 'next/link';

export default function AdminVerificationPage() {
  const { issues: verifiedIssues } = useIssues('VERIFIED_BY_NEIGHBOR');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Verified Issues</h1>
      <p className="text-gray-600">
        Issues that have been verified by neighbors and are ready for resource allocation.
      </p>

      {verifiedIssues.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            No verified issues at the moment
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifiedIssues.map((issue: any) => (
            <Card key={issue.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    href={`/admin/issues/${issue.id}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {issue.title}
                  </Link>
                  <p className="text-gray-600 mt-1">{issue.description}</p>
                  <div className="mt-3 flex gap-4 text-sm text-gray-500">
                    <span>Reported by {issue.reporter?.name}</span>
                    {issue.verifier && (
                      <span className="text-purple-600">
                        ✓ Verified by {issue.verifier.name}
                      </span>
                    )}
                    <span>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <IssueStatusBadge status={issue.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
