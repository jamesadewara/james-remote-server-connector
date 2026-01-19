export enum ServerStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    WARNING = 'warning',
    UNKNOWN = 'unknown', // Added UNKNOWN as it is used in hook
}

export enum ConnectionStatus {
    ATTEMPTING = 'attempting',
    SUCCESS = 'success',
    HANDSHAKE_FAILED = 'handshake_failed',
    DISCONNECTED = 'disconnected',
    ERROR = 'error',
}
