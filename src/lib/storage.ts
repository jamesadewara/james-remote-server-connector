import { Server, AddServerFormData, SecurityEvent, CommandLog } from '@/types/server';
import { ServerStatus, ConnectionStatus } from '@/types/enums';

const STORAGE_KEY = 'james_servers';

interface RawServer extends Omit<Server, 'lastUpdated' | 'securityEvents' | 'commandLogs'> {
    lastUpdated: string;
    securityEvents?: (Omit<SecurityEvent, 'timestamp'> & { timestamp: string })[];
    commandLogs?: (Omit<CommandLog, 'timestamp'> & { timestamp: string })[];
}

export const LocalStorageService = {
    getServers: (): Server[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];
            const parsed = JSON.parse(data);
            // Hydrate dates
            return parsed.map((s: RawServer) => ({
                ...s,
                lastUpdated: new Date(s.lastUpdated),
                securityEvents: s.securityEvents?.map((e) => ({ ...e, timestamp: new Date(e.timestamp) })) || [],
                commandLogs: s.commandLogs?.map((l) => ({ ...l, timestamp: new Date(l.timestamp) })) || []
            }));
        } catch (e) {
            console.error('Failed to parse servers from storage', e);
            return [];
        }
    },

    saveServers: (servers: Server[]) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
    },

    addServer: (data: AddServerFormData): Server => {
        const servers = LocalStorageService.getServers();
        const newServer: Server = {
            id: crypto.randomUUID(),
            name: data.name,
            hostname: data.hostname,
            ipAddress: data.hostname, // Default to hostname until resolved
            username: data.username || 'root',
            port: data.sshPort || 22,
            privateKey: data.privateKey,
            password: data.password,
            description: data.description,
            tags: data.tags ? (data.tags.split(',').map(t => t.trim()).filter(Boolean)) : [],
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

        servers.unshift(newServer);
        LocalStorageService.saveServers(servers);
        return newServer;
    },

    updateServer: (id: string, data: Partial<AddServerFormData>): Server => {
        const servers = LocalStorageService.getServers();
        const index = servers.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Server not found');

        const updatedServer = {
            ...servers[index],
            ...data,
            port: data.sshPort ?? servers[index].port,
            tags: typeof data.tags === 'string'
                ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
                : (Array.isArray(data.tags) ? data.tags : servers[index].tags), // handle if already array
            lastUpdated: new Date()
        };

        servers[index] = updatedServer as Server; // Cast mostly safe here
        LocalStorageService.saveServers(servers);
        return updatedServer as Server;
    },

    updateServerMetrics: (id: string, metricsData: Partial<Server>) => {
        const servers = LocalStorageService.getServers();
        const index = servers.findIndex(s => s.id === id);
        if (index === -1) return;

        servers[index] = {
            ...servers[index],
            ...metricsData,
            lastUpdated: new Date()
        };
        LocalStorageService.saveServers(servers);
    },

    deleteServer: (id: string) => {
        const servers = LocalStorageService.getServers();
        const filtered = servers.filter(s => s.id !== id);
        LocalStorageService.saveServers(filtered);
    }
};
