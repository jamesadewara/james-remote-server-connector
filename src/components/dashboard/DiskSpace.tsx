"use client";

import { HardDrive } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DiskSpaceProps {
  used: number;
  total: number;
  percentage: number;
}

export const DiskSpace = ({ used, total, percentage }: DiskSpaceProps) => {
  const formatSize = (gb: number) => {
    if (gb >= 1000) return `${(gb / 1000).toFixed(1)} TB`;
    return `${gb} GB`;
  };

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-chart-disk';
  };

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <HardDrive className="w-5 h-5 text-chart-disk" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Disk Space</h3>
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
            <span className="text-muted-foreground">{formatSize(used)} used</span>
            <span className="text-muted-foreground">{formatSize(total)} total</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Free Space</span>
            <span className="text-foreground font-medium">{formatSize(total - used)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
