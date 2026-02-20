import { Card } from '@/components/ui/Card';
import { IssueStatusBadge } from './IssueStatusBadge';
import { Issue } from '@/types';
import Link from 'next/link';
import { ThumbsUp } from 'lucide-react';

interface IssueCardProps {
  issue: Issue & {
    reporter?: { name: string; email: string };
    verifier?: { name: string };
  };
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {issue.imageUrl && (
        <Link href={`/issues/${issue.id}`} className="block aspect-video bg-gray-100">
          <img
            src={issue.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </Link>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/issues/${issue.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              {issue.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            {issue.urgency === 'URGENT' && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800">Urgent</span>
            )}
            <IssueStatusBadge status={issue.status} />
          </div>
        </div>
        <p className="text-black mb-3 line-clamp-2">{issue.description}</p>
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
          <div className="mt-2 text-sm text-gray-500">
            Verified by {issue.verifier.name}
          </div>
        )}
      </div>
    </Card>
  );
}
