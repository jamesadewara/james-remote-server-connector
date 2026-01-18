import { Shield, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { SecurityEvent } from '@/types/server';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SecurityEventsProps {
  events: SecurityEvent[];
}

export const SecurityEvents = ({ events }: SecurityEventsProps) => {
  const getSeverityIcon = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'low':
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: SecurityEvent['severity']) => {
    const baseClasses = "px-2 py-0.5 rounded text-xs font-medium uppercase";
    switch (severity) {
      case 'high':
        return `${baseClasses} bg-destructive/20 text-destructive`;
      case 'medium':
        return `${baseClasses} bg-warning/20 text-warning`;
      case 'low':
        return `${baseClasses} bg-muted text-muted-foreground`;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Security Events</h3>
        </div>
        <span className="text-xs text-muted-foreground">{events.length} events</span>
      </div>

      <ScrollArea className="h-[280px] pr-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Shield className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No security events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg bg-secondary/50 border border-border/30 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(event.severity)}
                    <span className={getSeverityBadge(event.severity)}>
                      {event.severity}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground">{event.message}</p>
                {event.sourceIp && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Source: {event.sourceIp}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
