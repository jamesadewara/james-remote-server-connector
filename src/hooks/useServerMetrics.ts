"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Server, AddServerFormData, SecurityEvent, Process } from '@/types/server';
import { ServerStatus, ConnectionStatus } from '@/types/enums';

interface UseServerMetricsOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface RawServerResponse {
  _id: string;
  name: string;
  hostname: string;
  ipAddress?: string;
  username?: string;
  password?: string; // Should be excluded by API but defined here for completeness if needed
  port?: number;
  status?: ServerStatus;
  description?: string;
  tags?: string[];
  updatedAt: string;
}

interface MonitorApiResponse {
  status: 'online' | 'offline';
  metrics: Server['metrics'];
  os: string;
  kernel: string;
  securityEvents: SecurityEvent[];
  processes: Process[];
  error?: string;
}

export const useServerMetrics = (options: UseServerMetricsOptions = {}) => {
  const { refreshInterval = 5000, enabled = true } = options;

  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const isPolling = useRef(false);

  // 1. Initial Fetch
  const fetchServers = async () => {
    try {
      const res = await fetch('/api/servers');
      if (!res.ok) throw new Error('Failed to fetch servers');
      const data: RawServerResponse[] = await res.json();

      const hydratedServers: Server[] = data.map((s) => ({
        id: s._id,
        name: s.name,
        hostname: s.hostname,
        ipAddress: s.ipAddress || s.hostname,
        username: s.username || 'root',
        port: s.port || 22,
        status: s.status || ServerStatus.OFFLINE,
        description: s.description,
        tags: s.tags || [],
        connectionStatus: ConnectionStatus.DISCONNECTED,
        os: 'Unknown',
        kernel: 'Unknown',
        metrics: {
          cpu: 0,
          ram: { used: 0, total: 16, percentage: 0 },
          disk: { used: 0, total: 100, percentage: 0 },
          uptime: '0d 0h 0m',
          loadAverage: [0, 0, 0]
        },
        securityEvents: [],
        processes: [],
        commandLogs: [],
        lastUpdated: new Date(s.updatedAt)
      }));

      setServers(hydratedServers);
    } catch (error) {
      console.error("Error fetching servers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  // Helper to fetch single server metrics
  const fetchSingleServerMetrics = async (server: Server): Promise<Partial<Server> | null> => {
    try {
      const res = await fetch('/api/monitor-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: server.id })
      });

      if (!res.ok) throw new Error('Poll failed');
      const data: MonitorApiResponse | { error: string } = await res.json();

      if ('error' in data && data.error) {
        throw new Error(data.error);
      }

      // Cast safely since we checked error
      const validData = data as MonitorApiResponse;

      if (validData.status === 'online') {
        return {
          id: server.id,
          status: ServerStatus.ONLINE,
          connectionStatus: ConnectionStatus.SUCCESS,
          metrics: validData.metrics,
          os: validData.os,
          kernel: validData.kernel,
          securityEvents: validData.securityEvents,
          processes: validData.processes,
          lastUpdated: new Date(),
          connectionError: undefined // Clear error on success
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      return {
        id: server.id,
        status: ServerStatus.OFFLINE,
        connectionStatus: ConnectionStatus.ERROR,
        connectionError: errorMessage
      };
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
          securityEvents: [], // Clear logs
          processes: [],      // Clear processes
          commandLogs: []
        };
      }
      return s;
    }));

    // 2. Force Reconnect / Poll
    try {
      const res = await fetch('/api/monitor-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId })
      });

      if (!res.ok) throw new Error('Refresh failed');
      const data: MonitorApiResponse = await res.json();

      setServers(prev => prev.map(s => {
        if (s.id === serverId) {
          if (data.status === 'online') {
            return {
              ...s,
              status: ServerStatus.ONLINE,
              connectionStatus: ConnectionStatus.SUCCESS,
              metrics: data.metrics,
              os: data.os,
              kernel: data.kernel,
              securityEvents: data.securityEvents,
              processes: data.processes,
              lastUpdated: new Date()
            };
          } else {
            return {
              ...s,
              status: ServerStatus.OFFLINE,
              connectionStatus: ConnectionStatus.ERROR
            };
          }
        }
        return s;
      }));

    } catch {
      setServers(prev => prev.map(s => {
        if (s.id === serverId) {
          return {
            ...s,
            status: ServerStatus.OFFLINE,
            connectionStatus: ConnectionStatus.ERROR
          };
        }
        return s;
      }));
    }

  }, []);

  // CRUD Implementations
  const addServer = useCallback(async (data: AddServerFormData) => {
    const res = await fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        hostname: data.hostname,
        privateKey: data.privateKey,
        password: data.password,
        username: data.username || 'root',
        port: data.sshPort || 22,
        description: data.description,
        tags: data.tags
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add server');
    }

    const newDbServer: RawServerResponse = await res.json();

    const newServer: Server = {
      id: newDbServer._id,
      name: newDbServer.name,
      hostname: newDbServer.hostname,
      ipAddress: newDbServer.ipAddress || newDbServer.hostname,
      username: newDbServer.username || 'root',
      port: newDbServer.port || 22,
      description: newDbServer.description,
      tags: newDbServer.tags || [],
      status: ServerStatus.OFFLINE,
      connectionStatus: ConnectionStatus.ATTEMPTING,
      os: 'Unknown',
      kernel: 'Unknown',
      metrics: {
        cpu: 0,
        ram: { used: 0, total: 0, percentage: 0 },
        disk: { used: 0, total: 0, percentage: 0 },
        uptime: '-',
        loadAverage: [0, 0, 0],
      },
      securityEvents: [],
      processes: [],
      commandLogs: [],
      lastUpdated: new Date(),
    };

    setServers(prev => [newServer, ...prev]);
    return newServer;
  }, []);

  const deleteServer = useCallback(async (serverId: string) => {
    const res = await fetch(`/api/servers/${serverId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete server');
    setServers(prev => prev.filter(s => s.id !== serverId));
  }, []);

  const updateServer = useCallback(async (serverId: string, data: Partial<AddServerFormData>) => {
    const res = await fetch(`/api/servers/${serverId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        port: data.sshPort // Map sshPort to port
      })
    });
    if (!res.ok) throw new Error('Failed to update server');
    const updatedDbServer: RawServerResponse = await res.json();

    setServers(prev => prev.map(s => {
      if (s.id === serverId) {
        return {
          ...s,
          name: updatedDbServer.name,
          hostname: updatedDbServer.hostname,
          username: updatedDbServer.username || 'root',
          port: updatedDbServer.port || 22,
          description: updatedDbServer.description,
          tags: updatedDbServer.tags || [],
        };
      }
      return s;
    }));
  }, []);

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
