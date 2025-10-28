import { useState } from "react";
import { Activity, Clock, Power, Zap } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { LogsTable } from "@/components/LogsTable";
import { useMachineLogs, calculateMetrics, formatDuration } from "@/hooks/useMachineLogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [machineIdInput, setMachineIdInput] = useState<string>("");
  
  const { data: logs = [], isLoading, error, refetch } = useMachineLogs(selectedMachine || undefined);
  const metrics = calculateMetrics(logs);

  const handleFilterMachine = () => {
    setSelectedMachine(machineIdInput);
  };

  const handleClearFilter = () => {
    setSelectedMachine("");
    setMachineIdInput("");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Machine Monitoring
            </h1>
            <p className="text-muted-foreground mt-2">SCADA System Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Machine ID"
              value={machineIdInput}
              onChange={(e) => setMachineIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterMachine()}
              className="w-40"
            />
            {selectedMachine ? (
              <Button onClick={handleClearFilter} variant="secondary">
                Clear Filter
              </Button>
            ) : (
              <Button onClick={handleFilterMachine}>
                Filter
              </Button>
            )}
            <Button onClick={() => refetch()} variant="outline">
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading metrics...</div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            Error loading data. Please check your connection.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Running Time"
                value={formatDuration(metrics.runningTime)}
                icon={Power}
                variant="success"
                trend="Active operation time"
              />
              <MetricCard
                title="Idle Time"
                value={formatDuration(metrics.idleTime)}
                icon={Clock}
                variant="warning"
                trend="Inactive operation time"
              />
              <MetricCard
                title="Uptime"
                value={`${metrics.uptime.toFixed(1)}%`}
                icon={Zap}
                variant="default"
                trend="Running / Total time"
              />
              <MetricCard
                title="Total Events"
                value={metrics.totalEvents}
                icon={Activity}
                variant="default"
                trend="All recorded events"
              />
            </div>

            {/* Logs Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Event Logs</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedMachine ? `Showing logs for Machine ${selectedMachine}` : 'Showing all machines'}
                </p>
              </div>
              <LogsTable logs={logs} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
