import { useState, useEffect } from 'react';
import { Server } from '@/types/server';
import { fetchServers, addServer } from '@/data/mockServers';
import { Sidebar } from '@/components/layout/Sidebar';
import { AddServerModal } from '@/components/layout/AddServerModal';
import { ServerHeader } from '@/components/dashboard/ServerHeader';
import { CpuGauge } from '@/components/dashboard/CpuGauge';
import { RamUsage } from '@/components/dashboard/RamUsage';
import { DiskSpace } from '@/components/dashboard/DiskSpace';
import { SystemUptime } from '@/components/dashboard/SystemUptime';
import { SecurityEvents } from '@/components/dashboard/SecurityEvents';
import { ProcessTable } from '@/components/dashboard/ProcessTable';
import { TerminalOutput } from '@/components/dashboard/TerminalOutput';
import { Skeleton } from '@/components/ui/skeleton';
import { Server as ServerIcon } from 'lucide-react';

const Index = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const selectedServer = servers.find(s => s.id === selectedServerId);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    setIsLoading(true);
    const data = await fetchServers();
    setServers(data);
    if (data.length > 0 && !selectedServerId) {
      setSelectedServerId(data[0].id);
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadServers();
    setIsRefreshing(false);
  };

  const handleAddServer = async (data: { name: string; hostname: string; ipAddress: string }) => {
    const newServer = await addServer(data);
    setServers(prev => [...prev, newServer]);
    setSelectedServerId(newServer.id);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        servers={servers}
        selectedServerId={selectedServerId}
        onSelectServer={setSelectedServerId}
        onAddServer={() => setIsAddModalOpen(true)}
      />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto lg:ml-0 ml-0 pt-16 lg:pt-8">
        {isLoading ? (
          <LoadingSkeleton />
        ) : selectedServer ? (
          <div className="max-w-7xl mx-auto space-y-6">
            <ServerHeader
              server={selectedServer}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <CpuGauge percentage={selectedServer.metrics.cpu} />
              <RamUsage
                used={selectedServer.metrics.ram.used}
                total={selectedServer.metrics.ram.total}
                percentage={selectedServer.metrics.ram.percentage}
              />
              <DiskSpace
                used={selectedServer.metrics.disk.used}
                total={selectedServer.metrics.disk.total}
                percentage={selectedServer.metrics.disk.percentage}
              />
              <SystemUptime
                uptime={selectedServer.metrics.uptime}
                loadAverage={selectedServer.metrics.loadAverage}
                os={selectedServer.os}
                kernel={selectedServer.kernel}
              />
            </div>

            {/* Security & Processes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SecurityEvents events={selectedServer.securityEvents} />
              <ProcessTable processes={selectedServer.processes} />
            </div>

            {/* Terminal Output */}
            <TerminalOutput logs={selectedServer.commandLogs} />
          </div>
        ) : (
          <EmptyState />
        )}
      </main>

      <AddServerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddServer}
      />
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="max-w-7xl mx-auto space-y-6">
    <div className="flex items-center gap-4 mb-6">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-lg" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Skeleton className="h-80 rounded-lg" />
      <Skeleton className="h-80 rounded-lg" />
    </div>
    <Skeleton className="h-64 rounded-lg" />
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 gold-glow">
      <ServerIcon className="w-10 h-10 text-primary" />
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-2">No Server Selected</h2>
    <p className="text-muted-foreground max-w-md">
      Select a server from the sidebar to view its metrics, or add a new server to get started.
    </p>
  </div>
);

export default Index;
