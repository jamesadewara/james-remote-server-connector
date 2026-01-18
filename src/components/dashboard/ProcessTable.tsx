import { Cpu } from 'lucide-react';
import { Process } from '@/types/server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProcessTableProps {
  processes: Process[];
}

export const ProcessTable = ({ processes }: ProcessTableProps) => {
  const sortedProcesses = [...processes].sort((a, b) => b.cpuPercent - a.cpuPercent);

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Processes</h3>
        </div>
        <span className="text-xs text-muted-foreground">{processes.length} running</span>
      </div>

      <ScrollArea className="h-[280px]">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium text-xs uppercase">PID</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs uppercase">Name</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs uppercase text-right">CPU%</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs uppercase text-right">MEM%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProcesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No processes running
                </TableCell>
              </TableRow>
            ) : (
              sortedProcesses.map((process) => (
                <TableRow 
                  key={process.pid} 
                  className="border-border/30 hover:bg-secondary/50 transition-colors"
                >
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {process.pid}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {process.name}
                    <span className="block text-xs text-muted-foreground">{process.user}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono ${
                      process.cpuPercent >= 50 ? 'text-warning' : 
                      process.cpuPercent >= 80 ? 'text-destructive' : 
                      'text-foreground'
                    }`}>
                      {process.cpuPercent.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono ${
                      process.memPercent >= 50 ? 'text-warning' : 
                      process.memPercent >= 80 ? 'text-destructive' : 
                      'text-foreground'
                    }`}>
                      {process.memPercent.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
