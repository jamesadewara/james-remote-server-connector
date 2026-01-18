"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-display mb-4">Something went wrong!</h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                We apologize for the inconvenience. Please try again.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>Try again</Button>
                <Button onClick={() => window.location.href = '/'}>
                    Go Home
                </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 p-4 bg-destructive/10 text-destructive rounded-md w-full max-w-2xl overflow-auto text-xs font-mono">
                    <p className="font-bold mb-2">Error Details (Dev Only):</p>
                    {error.message}
                    {error.stack && <pre className="mt-2 text-[10px]">{error.stack}</pre>}
                </div>
            )}
        </div>
    );
}
