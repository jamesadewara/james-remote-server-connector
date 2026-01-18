import { Server } from '@/types/server';

export const mockServers: Server[] = [
  {
    id: '1',
    name: 'Production Web',
    hostname: 'prod-web-01',
    ipAddress: '192.168.1.100',
    status: 'online',
    os: 'Ubuntu 22.04 LTS',
    kernel: '5.15.0-91-generic',
    metrics: {
      cpu: 42,
      ram: { used: 12.4, total: 32, percentage: 38.75 },
      disk: { used: 256, total: 500, percentage: 51.2 },
      uptime: '45d 12h 34m',
      loadAverage: [1.23, 0.98, 0.76],
    },
    securityEvents: [
      { id: 's1', type: 'ufw_block', message: 'Blocked incoming connection from 45.33.32.156', timestamp: new Date(Date.now() - 1000 * 60 * 5), severity: 'low', sourceIp: '45.33.32.156' },
      { id: 's2', type: 'ssh_attempt', message: 'Failed SSH login attempt for user root', timestamp: new Date(Date.now() - 1000 * 60 * 15), severity: 'medium', sourceIp: '103.45.67.89' },
      { id: 's3', type: 'port_scan', message: 'Port scan detected from 91.134.45.23', timestamp: new Date(Date.now() - 1000 * 60 * 30), severity: 'high', sourceIp: '91.134.45.23' },
      { id: 's4', type: 'auth_failure', message: 'Authentication failure for service nginx', timestamp: new Date(Date.now() - 1000 * 60 * 45), severity: 'medium' },
    ],
    processes: [
      { pid: 1234, name: 'nginx', cpuPercent: 12.5, memPercent: 4.2, user: 'www-data' },
      { pid: 2345, name: 'node', cpuPercent: 8.3, memPercent: 15.7, user: 'node' },
      { pid: 3456, name: 'postgres', cpuPercent: 5.1, memPercent: 8.9, user: 'postgres' },
      { pid: 4567, name: 'redis-server', cpuPercent: 2.4, memPercent: 3.1, user: 'redis' },
      { pid: 5678, name: 'docker', cpuPercent: 6.7, memPercent: 12.3, user: 'root' },
    ],
    commandLogs: [
      { id: 'c1', command: 'systemctl status nginx', output: '● nginx.service - A high performance web server\n   Loaded: loaded\n   Active: active (running)', timestamp: new Date(Date.now() - 1000 * 60 * 2), exitCode: 0 },
      { id: 'c2', command: 'df -h', output: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       500G  256G  244G  52% /', timestamp: new Date(Date.now() - 1000 * 60 * 5), exitCode: 0 },
      { id: 'c3', command: 'top -bn1 | head -5', output: 'top - 14:32:15 up 45 days, 12:34,  2 users,  load average: 1.23, 0.98, 0.76', timestamp: new Date(Date.now() - 1000 * 60 * 10), exitCode: 0 },
    ],
    lastUpdated: new Date(),
  },
  {
    id: '2',
    name: 'Database Master',
    hostname: 'db-master-01',
    ipAddress: '192.168.1.101',
    status: 'online',
    os: 'Debian 12',
    kernel: '6.1.0-17-amd64',
    metrics: {
      cpu: 67,
      ram: { used: 58.2, total: 64, percentage: 90.9 },
      disk: { used: 1200, total: 2000, percentage: 60 },
      uptime: '120d 8h 15m',
      loadAverage: [2.45, 2.12, 1.89],
    },
    securityEvents: [
      { id: 's5', type: 'auth_failure', message: 'Multiple auth failures for postgres user', timestamp: new Date(Date.now() - 1000 * 60 * 10), severity: 'high' },
      { id: 's6', type: 'ufw_block', message: 'Blocked connection attempt on port 5432', timestamp: new Date(Date.now() - 1000 * 60 * 25), severity: 'medium', sourceIp: '178.62.43.21' },
    ],
    processes: [
      { pid: 7890, name: 'postgres', cpuPercent: 45.2, memPercent: 62.1, user: 'postgres' },
      { pid: 8901, name: 'postgres-wal', cpuPercent: 12.3, memPercent: 8.5, user: 'postgres' },
      { pid: 9012, name: 'pg_dump', cpuPercent: 5.6, memPercent: 4.2, user: 'postgres' },
    ],
    commandLogs: [
      { id: 'c4', command: 'pg_isready', output: '/var/run/postgresql:5432 - accepting connections', timestamp: new Date(Date.now() - 1000 * 60 * 1), exitCode: 0 },
    ],
    lastUpdated: new Date(),
  },
  {
    id: '3',
    name: 'Staging API',
    hostname: 'staging-api-01',
    ipAddress: '192.168.1.102',
    status: 'warning',
    os: 'CentOS Stream 9',
    kernel: '5.14.0-362.el9',
    metrics: {
      cpu: 89,
      ram: { used: 14.8, total: 16, percentage: 92.5 },
      disk: { used: 180, total: 200, percentage: 90 },
      uptime: '7d 3h 45m',
      loadAverage: [4.56, 3.89, 3.21],
    },
    securityEvents: [
      { id: 's7', type: 'ssh_attempt', message: 'Brute force SSH attack detected', timestamp: new Date(Date.now() - 1000 * 60 * 2), severity: 'high', sourceIp: '45.155.205.233' },
    ],
    processes: [
      { pid: 1111, name: 'java', cpuPercent: 65.4, memPercent: 72.3, user: 'app' },
      { pid: 2222, name: 'tomcat', cpuPercent: 18.9, memPercent: 15.6, user: 'tomcat' },
    ],
    commandLogs: [
      { id: 'c5', command: 'journalctl -u app.service -n 5', output: 'Jan 15 14:30:12 staging-api app[1111]: Warning: High memory usage detected', timestamp: new Date(Date.now() - 1000 * 60 * 3), exitCode: 0 },
    ],
    lastUpdated: new Date(),
  },
  {
    id: '4',
    name: 'Backup Server',
    hostname: 'backup-01',
    ipAddress: '192.168.1.103',
    status: 'offline',
    os: 'Rocky Linux 9',
    kernel: '5.14.0-284.el9',
    metrics: {
      cpu: 0,
      ram: { used: 0, total: 8, percentage: 0 },
      disk: { used: 3500, total: 4000, percentage: 87.5 },
      uptime: '0d 0h 0m',
      loadAverage: [0, 0, 0],
    },
    securityEvents: [],
    processes: [],
    commandLogs: [
      { id: 'c6', command: 'ping -c 1 backup-01', output: 'Request timeout for icmp_seq 0', timestamp: new Date(Date.now() - 1000 * 60 * 60), exitCode: 1 },
    ],
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60),
  },
];

// Simulated API functions - replace these with actual SSH-based API calls
export const fetchServers = async (): Promise<Server[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockServers;
};

export const fetchServerById = async (id: string): Promise<Server | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockServers.find(server => server.id === id);
};

export const addServer = async (data: { name: string; hostname: string; ipAddress: string }): Promise<Server> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newServer: Server = {
    id: String(Date.now()),
    name: data.name,
    hostname: data.hostname,
    ipAddress: data.ipAddress,
    status: 'online',
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
  mockServers.push(newServer);
  return newServer;
};
