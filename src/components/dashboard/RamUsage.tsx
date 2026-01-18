"use client";

import { MemoryStick } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RamUsageProps {
  used: number;
  total: number;
  percentage: number;
}

export const RamUsage = ({ used, total, percentage }: RamUsageProps) => {
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-chart-ram';
  };

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <MemoryStick className="w-5 h-5 text-chart-ram" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">RAM Usage</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{percentage.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">%</span>
        </div>

        <div className="space-y-2">
          <Progress
            value={percentage}
            className="h-3 bg-muted"
            indicatorClassName={getProgressColor()}
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {used.toFixed(1)} GB used
            </span>
            <span className="text-muted-foreground">
              {total} GB total
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Available</span>
            <span className="text-foreground font-medium">{(total - used).toFixed(1)} GB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
