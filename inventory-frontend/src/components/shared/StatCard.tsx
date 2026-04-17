import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  subtitle?: string;
  trend?: number;
  onClick?: () => void;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  subtitle,
  trend,
  onClick,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/50 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-1/2" />
          <div className="h-6 bg-slate-100 dark:bg-slate-800/50 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md group flex items-start gap-4",
        onClick && "cursor-pointer active:scale-95"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
        iconColor
      )}>
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium truncate">{title}</h3>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
              trend >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            )}>
              {trend >= 0 ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
              {Math.abs(trend).toFixed(0)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{value}</p>
        {subtitle && (
          <p className="text-slate-400 text-[10px] mt-1.5 font-medium truncate uppercase tracking-wider">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;