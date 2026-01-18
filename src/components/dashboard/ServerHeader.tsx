import { Server as ServerType } from '@/types/server';
import { Server, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServerHeaderProps {
  server: ServerType;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const ServerHeader = ({ server, onRefresh, isRefreshing }: ServerHeaderProps) => {
  const getStatusBadge = () => {
    switch (server.status) {
      case 'online':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30">
            <Wifi className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">Online</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/30">
            <WifiOff className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Offline</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/30">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">Warning</span>
          </div>
        );
    }
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center gold-glow">
          <Server className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{server.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{server.hostname}</span>
            <span>•</span>
            <span className="font-mono">{server.ipAddress}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {getStatusBadge()}
        <div className="hidden sm:block text-right">
          <div className="text-xs text-muted-foreground">Last Updated</div>
          <div className="text-sm text-foreground">{formatLastUpdated(server.lastUpdated)}</div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="border-border hover:bg-secondary hover:border-primary"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
};
