import { MachineLog } from "@/types/database";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface LogsTableProps {
  logs: MachineLog[];
}

export const LogsTable = ({ logs }: LogsTableProps) => {
  const getEventBadgeVariant = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes('start') || type.includes('running')) return 'default';
    if (type.includes('stop') || type.includes('idle')) return 'secondary';
    if (type.includes('error') || type.includes('fault')) return 'destructive';
    if (type.includes('warning')) return 'outline';
    return 'secondary';
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold whitespace-nowrap">Machine ID</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Event Type</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Timestamp</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Time Ago</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono-data font-medium text-primary">
                  {log.machine_id || 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={getEventBadgeVariant(log.event_type)}>
                    {log.event_type}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono-data text-sm">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                  {log.details || '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
};
