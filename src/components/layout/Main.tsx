"use client";

import { useState, useEffect } from 'react';
import { useServerMetrics } from '@/hooks/useServerMetrics';
import { AddServerFormData } from '@/types/server';
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
import LoadingSkeleton from '@/components/subui/LoadingSkeleton';
import EmptyState from '@/components/subui/EmptyState';

const Main: React.FC = () => {
    const { servers, isLoading, addServer, refreshServer, lastRefresh } = useServerMetrics({
        refreshInterval: 3000, // Update every 3 seconds
        enabled: true,
    });

    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const selectedServer = servers.find(s => s.id === selectedServerId);

    // Auto-select first server when loaded
    useEffect(() => {
        if (servers.length > 0 && !selectedServerId) {
            setSelectedServerId(servers[0].id);
        }
    }, [servers, selectedServerId]);

    const handleRefresh = async () => {
        if (!selectedServerId) return;
        setIsRefreshing(true);
        refreshServer(selectedServerId);
        setTimeout(() => setIsRefreshing(false), 300);
    };

    const handleAddServer = async (data: AddServerFormData) => {
        const newServer = await addServer(data);
        setSelectedServerId(newServer.id);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
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

export default Main;