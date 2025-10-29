import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveMachineState } from "@/types/database";
import { Activity, FileText, Package } from "lucide-react";

interface LiveMachineStatusProps {
  liveStates: LiveMachineState[];
}

export const LiveMachineStatus = ({ liveStates }: LiveMachineStatusProps) => {
  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('running')) return 'default';
    if (statusLower.includes('idle')) return 'secondary';
    if (statusLower.includes('off')) return 'destructive';
    return 'outline';
  };

  if (liveStates.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">No live machine data available</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {liveStates.map((machine) => (
        <Card key={machine.machine_id} className="p-4 md:p-6 border transition-all hover:shadow-lg">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Machine {machine.machine_id}</h3>
                <Badge variant={getStatusVariant(machine.status)} className="text-xs">
                  {machine.status}
                </Badge>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Recipe</p>
                  <p className="text-sm font-medium truncate">{machine.recipe || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Production</p>
                  <p className="text-sm font-medium font-mono-data">{machine.production.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(machine.updated_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
