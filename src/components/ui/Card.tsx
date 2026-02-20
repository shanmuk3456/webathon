import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md p-6 border border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
