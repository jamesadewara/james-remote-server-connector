"use client";

import { useState, useEffect, useCallback } from 'react';
import { Server } from '@/types/server';
import { ServerStatus, ConnectionStatus } from '@/types/enums';
import { mockServers } from '@/data/mockServers';

// Simulate real-time metric fluctuations
const simulateMetricChange = (current: number, min: number, max: number, variance: number): number => {
  const change = (Math.random() - 0.5) * variance * 2;
  const newValue = current + change;
  return Math.max(min, Math.min(max, newValue));
};

const generateSecurityEvent = (serverId: string) => {
  const events = [
    { type: 'ufw_block' as const, message: 'Blocked incoming connection', severity: 'low' as const },
    { type: 'ssh_attempt' as const, message: 'Failed SSH login attempt', severity: 'medium' as const },
    { type: 'port_scan' as const, message: 'Port scan detected', severity: 'high' as const },
    { type: 'auth_failure' as const, message: 'Authentication failure', severity: 'medium' as const },
  ];
  const event = events[Math.floor(Math.random() * events.length)];
  const randomIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

  return {
    id: `s${Date.now()}`,
    type: event.type,
    message: `${event.message} from ${randomIp}`,
    timestamp: new Date(),
    severity: event.severity,
    sourceIp: randomIp,
  };
};

const updateServerMetrics = (server: Server): Server => {
  if (server.status === 'offline') return server;

  const newCpu = simulateMetricChange(server.metrics.cpu, 5, 95, 8);
  const newRamUsed = simulateMetricChange(server.metrics.ram.used, 1, server.metrics.ram.total * 0.95, 2);
  const newDiskUsed = simulateMetricChange(server.metrics.disk.used, server.metrics.disk.used * 0.99, server.metrics.disk.total * 0.95, 0.5);

  // Update processes with fluctuating CPU/MEM
  const updatedProcesses = server.processes.map(proc => ({
    ...proc,
    cpuPercent: Math.max(0.1, simulateMetricChange(proc.cpuPercent, 0, 100, 3)),
    memPercent: Math.max(0.1, simulateMetricChange(proc.memPercent, 0, 100, 1)),
  }));

  // Occasionally add a new security event (10% chance)
  const shouldAddEvent = Math.random() < 0.1;
  const securityEvents = shouldAddEvent
    ? [generateSecurityEvent(server.id), ...server.securityEvents.slice(0, 9)]
    : server.securityEvents;

  return {
    ...server,
    metrics: {
      ...server.metrics,
      cpu: Math.round(newCpu * 10) / 10,
      ram: {
        ...server.metrics.ram,
        used: Math.round(newRamUsed * 10) / 10,
        percentage: Math.round((newRamUsed / server.metrics.ram.total) * 1000) / 10,
      },
      disk: {
        ...server.metrics.disk,
        used: Math.round(newDiskUsed * 10) / 10,
        percentage: Math.round((newDiskUsed / server.metrics.disk.total) * 1000) / 10,
      },
      loadAverage: [
        Math.round(simulateMetricChange(server.metrics.loadAverage[0], 0, 10, 0.3) * 100) / 100,
        Math.round(simulateMetricChange(server.metrics.loadAverage[1], 0, 10, 0.2) * 100) / 100,
        Math.round(simulateMetricChange(server.metrics.loadAverage[2], 0, 10, 0.1) * 100) / 100,
      ] as [number, number, number],
    },
    processes: updatedProcesses,
    securityEvents,
    lastUpdated: new Date(),
  };
};

interface UseServerMetricsOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

export const useServerMetrics = (options: UseServerMetricsOptions = {}) => {
  const { refreshInterval = 3000, enabled = true } = options;

  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      // Simulate initial fetch delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setServers([...mockServers]);
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!enabled || isLoading) return;

    const interval = setInterval(() => {
      setServers(currentServers =>
        currentServers.map(server => updateServerMetrics(server))
      );
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enabled, isLoading, refreshInterval]);

  const addServer = useCallback(async (data: { name: string; hostname: string; ipAddress: string; sshPort: number; username: string; privateKey: string }) => {
    // Initial state: Attempting connection
    const newServerId = String(Date.now());
    const newServer: Server = {
      id: newServerId,
      name: data.name,
      hostname: data.hostname,
      ipAddress: data.ipAddress,
      status: ServerStatus.OFFLINE, // Start offline until connected
      connectionStatus: ConnectionStatus.ATTEMPTING,
      os: 'Unknown',
      kernel: 'Unknown',
      metrics: {
        cpu: 0,
        ram: { used: 0, total: 0, percentage: 0 },
        disk: { used: 0, total: 0, percentage: 0 },
        uptime: '0d 0h 0m',
        loadAverage: [0, 0, 0],
      },
      securityEvents: [],
      processes: [],
      commandLogs: [],
      lastUpdated: new Date(),
    };

    setServers(prev => [...prev, newServer]);

    // Simulate SSH Handshake (2.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Success Simulation
    setServers(currentServers =>
      currentServers.map(server => {
        if (server.id === newServerId) {
          return {
            ...server,
            status: ServerStatus.ONLINE,
            connectionStatus: ConnectionStatus.SUCCESS, // Briefly show success
            os: 'Ubuntu 22.04 LTS',
            kernel: '5.15.0-generic',
            metrics: {
              cpu: Math.random() * 50 + 10,
              ram: { used: 4, total: 16, percentage: 25 },
              disk: { used: 50, total: 200, percentage: 25 },
              uptime: '0d 0h 1m',
              loadAverage: [0.5, 0.3, 0.2],
            },
            processes: [
              { pid: Math.floor(Math.random() * 10000), name: 'systemd', cpuPercent: 0.5, memPercent: 1.2, user: 'root' },
              { pid: Math.floor(Math.random() * 10000), name: 'sshd', cpuPercent: 0.1, memPercent: 0.5, user: 'root' },
            ],
            commandLogs: [
              { id: `c${Date.now()}`, command: 'uname -a', output: 'Linux ' + data.hostname + ' 5.15.0-generic', timestamp: new Date(), exitCode: 0 },
            ],
            lastUpdated: new Date(),
          };
        }
        return server;
      })
    );

    // Clear connection status after a delay
    setTimeout(() => {
      setServers(currentServers =>
        currentServers.map(server =>
          server.id === newServerId ? { ...server, connectionStatus: undefined } : server
        )
      );
    }, 2000);

    return newServer;
  }, []);

  const refreshServer = useCallback((serverId: string) => {
    setServers(currentServers =>
      currentServers.map(server =>
        server.id === serverId ? updateServerMetrics(server) : server
      )
    );
  }, []);

  return {
    servers,
    isLoading,
    lastRefresh,
    addServer,
    refreshServer,
  };
};
