"use client";

import { Server as ServerIcon } from 'lucide-react';

const EmptyState: React.FC = () => (
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

export default EmptyState;