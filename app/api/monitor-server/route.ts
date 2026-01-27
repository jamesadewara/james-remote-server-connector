import { NextResponse } from 'next/server';
import { NodeSSH } from 'node-ssh';

export async function POST(req: Request) {
    const ssh = new NodeSSH();

    try {
        const { server } = await req.json();

        if (!server) {
            return NextResponse.json({ error: 'Server details are required' }, { status: 400 });
        }

        if ((!server.privateKey && !server.password) || !server.hostname) {
            return NextResponse.json({ error: 'Server missing connection details (Key/Password or Hostname)' }, { status: 400 });
        }

        // Connect
        try {
            await ssh.connect({
                host: server.hostname,
                username: server.username || 'root',
                port: server.port || 22,
                privateKey: server.privateKey,
                password: server.password,
                readyTimeout: 10000,
            });
        } catch (connErr: unknown) {
            const msg = connErr instanceof Error ? connErr.message : String(connErr);
            console.error(`Connection failed for ${server.hostname}:`, msg);
            return NextResponse.json({
                error: 'Connection failed: ' + msg,
                status: 'offline'
            }, { status: 200 }); // Return 200 so frontend can handle it gracefully as "offline"
        }

        // Helper to safely execute command
        const execSafe = async (cmd: string) => {
            try {
                return await ssh.execCommand(cmd);
            } catch {
                return { stdout: '', stderr: 'Command failed' };
            }
        };

        // Commands
        const cmdCpu = `top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8}'`;
        const cmdRam = `free -m | awk '/Mem:/ {print $2 " " $3}'`;
        const cmdDisk = `df -m / | awk 'NR==2 {print $2 " " $3}'`;
        const cmdUptime = `uptime -p`;
        const cmdKernel = `uname -r`;
        const cmdOs = `grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '"'`;
        const cmdLogsText = `journalctl -t sshd -t sudo -t auth -n 5 --no-pager --reverse --output=short-iso`;
        const cmdProcesses = `ps -eo pid,comm,%cpu,%mem,user --sort=-%cpu | head -n 6`;

        const [cpuRes, ramRes, diskRes, uptimeRes, kernelRes, osRes, logsRes, procRes] = await Promise.all([
            execSafe(cmdCpu),
            execSafe(cmdRam),
            execSafe(cmdDisk),
            execSafe(cmdUptime),
            execSafe(cmdKernel),
            execSafe(cmdOs),
            execSafe(cmdLogsText),
            execSafe(cmdProcesses)
        ]);

        ssh.dispose();

        // PARSING SAFEGUARDS

        // CPU
        const cpu = parseFloat(cpuRes.stdout) || 0;

        // RAM
        const ramParts = ramRes.stdout.trim().split(' ').map(Number);
        const ramTotalMb = ramParts[0] || 0;
        const ramUsedMb = ramParts[1] || 0;
        const ramTotalGb = ramTotalMb ? ramTotalMb / 1024 : 0;
        const ramUsedGb = ramUsedMb ? ramUsedMb / 1024 : 0;
        const ramPercent = ramTotalMb ? (ramUsedMb / ramTotalMb) * 100 : 0;

        // Disk
        const diskParts = diskRes.stdout.trim().split(' ').map(Number);
        const diskTotalMb = diskParts[0] || 0;
        const diskUsedMb = diskParts[1] || 0;
        const diskTotalGb = diskTotalMb ? diskTotalMb / 1024 : 0;
        const diskUsedGb = diskUsedMb ? diskUsedMb / 1024 : 0;
        const diskPercent = diskTotalMb ? (diskUsedMb / diskTotalMb) * 100 : 0;

        // Logs
        const securityEvents = logsRes.stdout.split('\n').filter(Boolean).map((line, idx) => {
            return {
                id: `log-${Date.now()}-${idx}`,
                type: (line.includes('sshd') ? 'ssh_attempt' : 'auth_failure') as 'ssh_attempt' | 'auth_failure' | 'ufw_block' | 'port_scan',
                message: line,
                timestamp: new Date(),
                severity: (line.includes('Fail') || line.includes('error') ? 'high' : 'medium') as 'high' | 'medium' | 'low',
            };
        });

        // Processes
        const processes = procRes.stdout.split('\n').slice(1).filter(Boolean).map(line => {
            const parts = line.trim().split(/\s+/);
            return {
                pid: parseInt(parts[0]) || 0,
                name: parts[1] || '?',
                cpuPercent: parseFloat(parts[2]) || 0,
                memPercent: parseFloat(parts[3]) || 0,
                user: parts[4] || '?'
            };
        });

        const metrics = {
            cpu: Math.round(cpu * 10) / 10,
            ram: {
                used: Math.round(ramUsedGb * 10) / 10,
                total: Math.round(ramTotalGb * 10) / 10,
                percentage: Math.round(ramPercent * 10) / 10,
            },
            disk: {
                used: Math.round(diskUsedGb * 10) / 10,
                total: Math.round(diskTotalGb * 10) / 10,
                percentage: Math.round(diskPercent * 10) / 10,
            },
            uptime: uptimeRes.stdout.trim() || 'Unknown',
            loadAverage: [0, 0, 0] as [number, number, number]
        };

        return NextResponse.json({
            status: 'online',
            metrics,
            os: osRes.stdout.trim() || 'Linux',
            kernel: kernelRes.stdout.trim() || 'Unknown',
            securityEvents: securityEvents.slice(0, 10),
            processes: processes
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("Monitor Fatal Error:", message);
        ssh.dispose();
        // Even for fatal errors, return 200 so UI can show message
        return NextResponse.json({ error: message, status: 'offline' }, { status: 200 });
    }
}
