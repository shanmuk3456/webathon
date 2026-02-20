import { Card } from '@/components/ui/Card';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { Issue } from '@/types';
import Link from 'next/link';
import { ThumbsUp } from 'lucide-react';

interface AdminIssueCardProps {
  issue: Issue & {
    reporter?: { name: string; email: string };
    verifier?: { name: string };
  };
}

export function AdminIssueCard({ issue }: AdminIssueCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <Link href={`/admin/issues/${issue.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
            {issue.title}
          </h3>
        </Link>
        <IssueStatusBadge status={issue.status} />
      </div>
      <p className="text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span className="flex items-center gap-2">
          Reported by {issue.reporter?.name || 'Unknown'}
          {issue.supportCount != null && issue.supportCount > 1 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-medium">
              <ThumbsUp className="w-3 h-3" />
              {issue.supportCount} support
            </span>
          )}
        </span>
        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
      </div>
      {issue.verifier && (
        <div className="mt-2 text-sm text-purple-600 font-medium">
          ✓ Verified by {issue.verifier.name}
        </div>
      )}
    </Card>
  );
}
