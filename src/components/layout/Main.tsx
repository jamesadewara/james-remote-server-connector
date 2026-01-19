"use client";

import { useState } from 'react';
import { useServerMetrics } from '@/hooks/useServerMetrics';
import { AddServerFormData, Server } from '@/types/server';
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
import { toast } from 'sonner';

const Main: React.FC = () => {
    const { servers, isLoading, addServer, deleteServer, updateServer, refreshServer } = useServerMetrics({
        refreshInterval: 5000,
        enabled: true,
    });

    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Edit Mode State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [serverToEdit, setServerToEdit] = useState<Server | null>(null);

    // Derived state
    // If selected ID is valid, use it. Else fallback to first. 
    // Need to ensure selectedId actually exists in list (deletion safety)
    const activeServerId = (selectedServerId && servers.find(s => s.id === selectedServerId))
        ? selectedServerId
        : servers[0]?.id ?? null;

    const selectedServer = servers.find(s => s.id === activeServerId);

    const handleRefresh = async () => {
        if (!activeServerId) return;
        setIsRefreshing(true);
        refreshServer(activeServerId);
        setTimeout(() => setIsRefreshing(false), 300);
    };

    const handleAddServer = async (data: AddServerFormData) => {
        const newServer = await addServer(data);
        setSelectedServerId(newServer.id);
    };

    const handleEditServerTrigger = (server: Server) => {
        setServerToEdit(server);
        setIsEditModalOpen(true);
    };

    const handleEditServerSubmit = async (data: AddServerFormData) => {
        if (!serverToEdit) return;
        await updateServer(serverToEdit.id, data);
        setServerToEdit(null);
        // Toast is handled in Modal, but we wait here implicitly
    };

    const handleDeleteServer = async (id: string) => {
        if (confirm('Are you sure you want to delete this server?')) {
            try {
                await deleteServer(id);
                toast.success('Server deleted');
                if (selectedServerId === id) {
                    setSelectedServerId(null);
                }
            } catch {
                toast.error('Failed to delete server');
            }
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar
                servers={servers}
                selectedServerId={activeServerId}
                onSelectServer={setSelectedServerId}
                onAddServer={() => setIsAddModalOpen(true)}
                onEditServer={handleEditServerTrigger}
                onDeleteServer={handleDeleteServer}
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

            {/* Add Modal */}
            <AddServerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddServer}
            />

            {/* Edit Modal (Reusing AddServerModal) */}
            <AddServerModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setServerToEdit(null);
                }}
                onAdd={handleEditServerSubmit}
                isEditing={true}
                initialData={serverToEdit ? {
                    name: serverToEdit.name,
                    hostname: serverToEdit.hostname,
                    ipAddress: serverToEdit.ipAddress,
                    privateKey: '', // Intentionally empty
                    username: serverToEdit.username || 'root',
                    sshPort: serverToEdit.port || 22,
                    description: serverToEdit.description,
                    tags: serverToEdit.tags.join(', ')
                } : undefined}
            />
        </div>
    );
};

export default Main;