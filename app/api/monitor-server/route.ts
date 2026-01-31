import { NextResponse } from 'next/server';
import { NodeSSH } from 'node-ssh';

interface SecurityEvent {
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    severity: string;
}

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
                tryKeyboard: true,
                readyTimeout: 30000,
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
        // Track executed commands
        const commandLogs: { id: string; command: string; output: string; timestamp: Date; exitCode: number }[] = [];

        // Helper to safely execute command
        const execSafe = async (cmd: string) => {
            try {
                const res = await ssh.execCommand(cmd);
                commandLogs.push({
                    id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    command: cmd,
                    output: res.stdout || res.stderr || '(no output)',
                    timestamp: new Date(),
                    exitCode: res.code || 0
                });
                return res;
            } catch (err) {
                const errMsg = err instanceof Error ? err.message : 'Command failed';
                commandLogs.push({
                    id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    command: cmd,
                    output: errMsg,
                    timestamp: new Date(),
                    exitCode: 1
                });
                return { stdout: '', stderr: errMsg };
            }
        };

        // Commands
        const cmdCpu = `top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8}'`;
        const cmdRam = `free -m | awk '/Mem:/ {print $2 " " $3}'`;
        const cmdDisk = `df -m / | awk 'NR==2 {print $2 " " $3}'`;
        const cmdUptime = `uptime -p`;
        const cmdKernel = `uname -r`;
        const cmdOs = `grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '"'`;

        // Security Logs Strategy: Try journalctl -> auth.log -> last
        // specific commands are defined dynamically below based on results

        const cmdProcesses = `ps -eo pid,comm,%cpu,%mem,user --sort=-%cpu | head -n 6`;
        const cmdLoad = `cat /proc/loadavg`;

        const [cpuRes, ramRes, diskRes, uptimeRes, kernelRes, osRes, procRes, loadRes] = await Promise.all([
            execSafe(cmdCpu),
            execSafe(cmdRam),
            execSafe(cmdDisk),
            execSafe(cmdUptime),
            execSafe(cmdKernel),
            execSafe(cmdOs),
            execSafe(cmdProcesses),
            execSafe(cmdLoad)
        ]);

        // Attempt Security Logs (Sequential Fallback)
        let logsOutput = '';
        let logsCmdUsed = `journalctl -t sshd -t sudo -t auth -n 10 --no-pager --reverse --output=short-iso`;
        let logsRes = await execSafe(logsCmdUsed);

        // 2. Fallback: /var/log/auth.log (tail)
        if (!logsRes.stdout && (logsRes.stderr.includes('Permission denied') || logsRes.stderr.includes('No logs'))) {
            logsCmdUsed = `tail -n 10 /var/log/auth.log 2>/dev/null`;
            logsRes = await execSafe(logsCmdUsed);
        }

        // 3. Fallback: last -n 10
        if (!logsRes.stdout) {
            logsCmdUsed = `last -n 10`;
            logsRes = await execSafe(logsCmdUsed);
        }

        logsOutput = logsRes.stdout;


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
        let securityEvents: SecurityEvent[] = [];

        if (logsOutput) {
            const lines = logsOutput.split('\n').filter(Boolean);
            securityEvents = lines.map((line, idx) => {
                // Simple heateristic for severity
                const isHigh = line.includes('Fail') || line.includes('error') || line.includes('invalid') || line.includes('BREAK-IN');
                const type = line.includes('sshd') ? 'ssh_attempt' : 'auth_failure'; // simplified

                return {
                    id: `log-${Date.now()}-${idx}`,
                    type: type,
                    message: line.substring(0, 120), // Truncate
                    timestamp: new Date(), // We don't parse historical dates perfectly here to avoid complex regex for now
                    severity: isHigh ? 'high' : 'medium'
                };
            });
        } else {
            // If absolutely nothing, add a status event
            securityEvents.push({
                id: 'no-logs',
                type: 'auth_failure',
                message: 'Could not access system logs (Permission Denied). Try running as root or adding user to adm group.',
                timestamp: new Date(),
                severity: 'low'
            });
        }

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
            loadAverage: (loadRes.stdout.trim().split(' ').slice(0, 3).map(n => parseFloat(n) || 0) as [number, number, number]) || [0, 0, 0]
        };

        return NextResponse.json({
            status: 'online',
            metrics,
            os: osRes.stdout.trim() || 'Linux',
            kernel: kernelRes.stdout.trim() || 'Unknown',
            securityEvents: securityEvents.slice(0, 10),
            processes: processes,
            commandLogs: commandLogs.reverse().slice(0, 50)
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error("Monitor Fatal Error:", message);
        ssh.dispose();
        // Even for fatal errors, return 200 so UI can show message
        return NextResponse.json({ error: message, status: 'offline' }, { status: 200 });
    }
}
