"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Server, AddServerFormData } from '@/types/server';
import { ServerStatus, ConnectionStatus } from '@/types/enums';
import { LocalStorageService } from '@/lib/storage';

interface UseServerMetricsOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface MonitorApiResponse {
  status: 'online' | 'offline';
  metrics: Server['metrics'];
  os: string;
  kernel: string;
  securityEvents: Server['securityEvents'];
  processes: Server['processes'];
  commandLogs: Server['commandLogs'];
  error?: string;
}

export const useServerMetrics = (options: UseServerMetricsOptions = {}) => {
  const { refreshInterval = 5000, enabled = true } = options;

  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const isPolling = useRef(false);

  // 1. Initial Fetch
  const fetchServers = useCallback(() => {
    try {
      const storedServers = LocalStorageService.getServers();
      setServers(storedServers);
    } catch (error) {
      console.error("Error fetching servers:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  // Helper to fetch single server metrics
  const fetchSingleServerMetrics = async (server: Server): Promise<Partial<Server> | null> => {
    try {
      // Send FULL server object (including secrets) to the stateless monitor API
      const res = await fetch('/api/monitor-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server })
      });

      if (!res.ok) throw new Error('Poll failed');
      const data: MonitorApiResponse | { error: string } = await res.json();

      if ('error' in data && data.error) {
        throw new Error(data.error);
      }

      // Cast safely since we checked error
      const validData = data as MonitorApiResponse;

      if (validData.status === 'online') {
        const update = {
          status: ServerStatus.ONLINE,
          connectionStatus: ConnectionStatus.SUCCESS,
          metrics: validData.metrics,
          os: validData.os,
          kernel: validData.kernel,
          securityEvents: validData.securityEvents,
          processes: validData.processes,
          commandLogs: validData.commandLogs,
          lastUpdated: new Date(),
          connectionError: undefined // Clear error on success
        };
        // Update storage silently
        LocalStorageService.updateServerMetrics(server.id, update);
        return { id: server.id, ...update };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      const update = {
        status: ServerStatus.OFFLINE,
        connectionStatus: ConnectionStatus.ERROR,
        connectionError: errorMessage
      };
      // Update storage silently
      LocalStorageService.updateServerMetrics(server.id, update);
      return { id: server.id, ...update };
    }
    return null;
  };

  // 2. Poll Metrics
  const pollMetrics = useCallback(async () => {
    if (servers.length === 0 || isPolling.current) return;

    isPolling.current = true;

    try {
      const updates = await Promise.all(servers.map(async (server) => {
        return fetchSingleServerMetrics(server);
      }));

      setServers(prev => prev.map(s => {
        const update = updates.find(u => u && u.id === s.id);
        if (update) {
          return { ...s, ...update };
        }
        return s;
      }));

      setLastRefresh(new Date());

    } catch (err) {
      console.error("Polling error", err);
    } finally {
      isPolling.current = false;
    }
  }, [servers]);

  // 3. Refresh Server (Manual)
  const refreshServer = useCallback(async (serverId: string) => {
    // 1. "Disconnect" / Clear State
    const serverToRefresh = servers.find(s => s.id === serverId);
    if (!serverToRefresh) return;

    setServers(prev => prev.map(s => {
      if (s.id === serverId) {
        return {
          ...s,
          status: ServerStatus.UNKNOWN,
          connectionStatus: ConnectionStatus.ATTEMPTING,
          metrics: {
            cpu: 0,
            ram: { used: 0, total: 0, percentage: 0 },
            disk: { used: 0, total: 0, percentage: 0 },
            uptime: 'Resyncing...',
            loadAverage: [0, 0, 0],
          },
          securityEvents: [],
          processes: [],
          commandLogs: []
        };
      }
      return s;
    }));

    // 2. Force Reconnect
    try {
      // Use the LATEST server state from state/storage
      const res = await fetch('/api/monitor-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server: serverToRefresh })
      });

      if (!res.ok) throw new Error('Refresh failed');
      const data: MonitorApiResponse = await res.json();

      setServers(prev => prev.map(s => {
        if (s.id === serverId) {
          if (data.status === 'online') {
            const update = {
              status: ServerStatus.ONLINE,
              connectionStatus: ConnectionStatus.SUCCESS,
              metrics: data.metrics,
              os: data.os,
              kernel: data.kernel,
              securityEvents: data.securityEvents,
              processes: data.processes,
              lastUpdated: new Date()
            };
            LocalStorageService.updateServerMetrics(serverId, update);
            return { ...s, ...update };
          } else {
            const update = {
              status: ServerStatus.OFFLINE,
              connectionStatus: ConnectionStatus.ERROR
            };
            LocalStorageService.updateServerMetrics(serverId, update);
            return { ...s, ...update };
          }
        }
        return s;
      }));

    } catch {
      setServers(prev => prev.map(s => {
        if (s.id === serverId) {
          const update = {
            status: ServerStatus.OFFLINE,
            connectionStatus: ConnectionStatus.ERROR
          };
          LocalStorageService.updateServerMetrics(serverId, update);
          return { ...s, ...update };
        }
        return s;
      }));
    }

  }, [servers]);

  // CRUD Implementations
  const addServer = useCallback(async (data: AddServerFormData) => {
    const newServer = LocalStorageService.addServer(data);
    setServers(prev => [newServer, ...prev]);
    // Trigger immediate poll
    setTimeout(() => refreshServer(newServer.id), 100);
    return newServer;
  }, [refreshServer]);

  const deleteServer = useCallback(async (serverId: string) => {
    LocalStorageService.deleteServer(serverId);
    setServers(prev => prev.filter(s => s.id !== serverId));
  }, []);

  const updateServer = useCallback(async (serverId: string, data: Partial<AddServerFormData>) => {
    const updated = LocalStorageService.updateServer(serverId, data);
    setServers(prev => prev.map(s => s.id === serverId ? updated : s));
    // Trigger check with new details
    setTimeout(() => refreshServer(serverId), 100);
  }, [refreshServer]);

  useEffect(() => {
    if (!enabled || isLoading) return;
    const interval = setInterval(pollMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [enabled, isLoading, refreshInterval, pollMetrics]);

  return {
    servers,
    isLoading,
    lastRefresh,
    addServer,
    deleteServer,
    updateServer,
    refreshServer,
  };
};

