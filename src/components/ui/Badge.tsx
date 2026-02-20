import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { IssueStatus } from '@/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | IssueStatus;
}

const statusColors: Record<IssueStatus, string> = {
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  VERIFIED_BY_NEIGHBOR: 'bg-purple-100 text-purple-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const baseStyles = 'px-2 py-1 text-xs font-semibold rounded-full';
  const variantStyles =
    variant === 'default'
      ? 'bg-gray-100 text-gray-800'
      : statusColors[variant as IssueStatus];

  return (
    <span className={cn(baseStyles, variantStyles, className)}>{children}</span>
  );
}
