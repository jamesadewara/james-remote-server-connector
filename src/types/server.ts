import { ServerStatus, ConnectionStatus } from './enums';

export interface ServerMetrics {
  cpu: number;
  ram: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: string;
  loadAverage: [number, number, number];
}

export interface SecurityEvent {
  id: string;
  type: 'ufw_block' | 'ssh_attempt' | 'auth_failure' | 'port_scan';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  sourceIp?: string;
}

export interface Process {
  pid: number;
  name: string;
  cpuPercent: number;
  memPercent: number;
  user: string;
}

export interface CommandLog {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  exitCode: number;
}

export interface Server {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  status: ServerStatus;
  connectionStatus?: ConnectionStatus;
  connectionError?: string;
  os: string;
  kernel: string;
  metrics: ServerMetrics;
  securityEvents: SecurityEvent[];
  processes: Process[];
  commandLogs: CommandLog[];
  lastUpdated: Date;
}

export interface AddServerFormData {
  name: string;
  hostname: string;
  ipAddress: string;
  sshPort: number;
  username: string;
  privateKey: string;
}
