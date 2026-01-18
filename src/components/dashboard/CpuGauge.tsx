"use client";

import { Activity } from 'lucide-react';

interface CpuGaugeProps {
  percentage: number;
}

export const CpuGauge = ({ percentage }: CpuGaugeProps) => {
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 90) return 'hsl(0 84% 60%)';
    if (percentage >= 70) return 'hsl(38 92% 50%)';
    return 'hsl(43 51% 56%)';
  };

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">CPU Usage</h3>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="180" height="180" className="transform -rotate-90">
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="hsl(0 0% 15%)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${getColor()})`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">{percentage}</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};
