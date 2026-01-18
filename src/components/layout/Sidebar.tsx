import { useState } from 'react';
import { Server, Plus, Menu, X, Activity } from 'lucide-react';
import { Server as ServerType } from '@/types/server';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  servers: ServerType[];
  selectedServerId: string | null;
  onSelectServer: (id: string) => void;
  onAddServer: () => void;
}

export const Sidebar = ({ servers, selectedServerId, onSelectServer, onAddServer }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusDot = (status: ServerType['status']) => {
    switch (status) {
      case 'online':
        return 'status-dot status-online';
      case 'offline':
        return 'status-dot status-offline';
      case 'warning':
        return 'status-dot bg-warning animate-pulse-slow';
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-secondary border border-border"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center gold-glow">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">ServerMon</h1>
              <p className="text-xs text-muted-foreground">Linux Monitoring</p>
            </div>
          </div>
        </div>

        {/* Server List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              All Servers
            </h2>
            <span className="text-xs text-muted-foreground">{servers.length}</span>
          </div>

          <div className="space-y-2">
            {servers.map((server) => (
              <button
                key={server.id}
                onClick={() => {
                  onSelectServer(server.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full p-3 rounded-lg flex items-center gap-3 transition-all duration-200",
                  selectedServerId === server.id
                    ? "bg-sidebar-accent border border-primary/30 gold-glow"
                    : "hover:bg-sidebar-accent/50 border border-transparent"
                )}
              >
                <div className={getStatusDot(server.status)} />
                <Server className={cn(
                  "w-4 h-4",
                  selectedServerId === server.id ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="flex-1 text-left">
                  <div className={cn(
                    "text-sm font-medium",
                    selectedServerId === server.id ? "text-primary" : "text-sidebar-foreground"
                  )}>
                    {server.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{server.ipAddress}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add Server Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button 
            onClick={onAddServer} 
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add New Server
          </Button>
        </div>
      </aside>
    </>
  );
};
