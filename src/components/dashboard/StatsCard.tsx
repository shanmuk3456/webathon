import { Card } from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-black">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-black mt-1">{description}</p>
          )}
        </div>
        {icon && <div className="text-black">{icon}</div>}
      </div>
    </Card>
  );
}
