import { Clock, Server } from 'lucide-react';

interface SystemUptimeProps {
  uptime: string;
  loadAverage: [number, number, number];
  os: string;
  kernel: string;
}

export const SystemUptime = ({ uptime, loadAverage, os, kernel }: SystemUptimeProps) => {
  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Uptime</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{uptime}</span>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Operating System</div>
              <div className="text-sm font-medium text-foreground">{os}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Kernel</div>
            <div className="text-sm font-mono text-muted-foreground">{kernel}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Load Average</div>
            <div className="flex gap-3">
              {['1m', '5m', '15m'].map((label, idx) => (
                <div key={label} className="flex-1 text-center">
                  <div className="text-lg font-semibold text-foreground">{loadAverage[idx].toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
