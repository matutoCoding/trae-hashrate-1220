import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
  className?: string;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
};

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm border border-slate-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-slate-400 ml-1">较上周</span>
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'p-3 rounded-xl',
              colorClasses[color]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
