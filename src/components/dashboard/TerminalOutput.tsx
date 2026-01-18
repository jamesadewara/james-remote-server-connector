import { Terminal } from 'lucide-react';
import { CommandLog } from '@/types/server';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TerminalOutputProps {
  logs: CommandLog[];
}

export const TerminalOutput = ({ logs }: TerminalOutputProps) => {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Command Logs</h3>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
      </div>

      <div className="terminal-box p-4">
        <ScrollArea className="h-[200px]">
          {logs.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              <span className="text-primary">$</span> No recent commands
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTimestamp(log.timestamp)}</span>
                    <span className={log.exitCode === 0 ? 'text-success' : 'text-destructive'}>
                      [exit: {log.exitCode}]
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-primary">$</span>{' '}
                    <span className="text-foreground">{log.command}</span>
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap pl-4 border-l-2 border-border/50">
                    {log.output}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
