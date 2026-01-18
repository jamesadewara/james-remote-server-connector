"use client";

import { Skeleton } from '@/components/ui/skeleton';

const LoadingSkeleton: React.FC = () => (
    <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-80 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
    </div>
);

export default LoadingSkeleton;