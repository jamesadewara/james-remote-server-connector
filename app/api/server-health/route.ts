import { NodeSSH } from 'node-ssh';
import { NextResponse } from 'next/server';

const ssh = new NodeSSH();

export async function POST(req: Request) {
    const body = await req.json();
    const { hostname, privateKey, username = 'root' } = body;

    if (!hostname || !privateKey) {
        return NextResponse.json(
            { status: 'offline', error: 'Missing hostname or privateKey' },
            { status: 400 }
        );
    }

    try {
        await ssh.connect({
            host: hostname,
            username: username,
            privateKey: privateKey,
            readyTimeout: 5000,
        });

        const healthScript = `
            IP=$(hostname -I | awk '{print $1}')
            if [ -z "$IP" ]; then
                IP=$(hostname -i | awk '{print $1}')
            fi
            
            UPTIME=$(uptime -p 2>/dev/null || uptime)

            echo "{\\"ip\\": \\"$IP\\", \\"status\\": \\"online\\", \\"uptime\\": \\"$UPTIME\\"}"
        `;

        const result = await ssh.execCommand(healthScript);

        try {
            const cleanStdout = result.stdout.trim();
            const data = JSON.parse(cleanStdout);
            ssh.dispose();
            return NextResponse.json(data);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            ssh.dispose();
            return NextResponse.json(
                { status: 'online', error: 'Failed to parse health script output', raw: result.stdout },
                { status: 200 }
            );
        }

    } catch (error: unknown) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error('SSH Connection Error:', error);
        return NextResponse.json(
            { status: 'offline', error: 'Connection Failed: ' + errorMessage },
            { status: 500 }
        );
    }
}