import { useState } from "react";
import { Clock, Power, PowerOff, CalendarIcon } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { LogsTable } from "@/components/LogsTable";
import { LiveMachineStatus } from "@/components/LiveMachineStatus";
import { useMachineLogs, calculateMetrics, formatDuration } from "@/hooks/useMachineLogs";
import { useLiveMachineState } from "@/hooks/useLiveMachineState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Index = () => {
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  
  const { data: allLogs = [], isLoading, error, refetch } = useMachineLogs(
    selectedMachine && selectedMachine !== "all" ? selectedMachine : undefined
  );
  const { liveStates, isLoading: liveLoading } = useLiveMachineState();
  
  // Filter logs by selected date
  const logs = allLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate.toDateString() === selectedDate.toDateString();
  });
  
  const metrics = calculateMetrics(logs);

  const handleClearFilter = () => {
    setSelectedMachine("");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Machine Monitoring
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">SCADA System Dashboard</p>
        </div>

        {/* Live Machine Status */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-xl md:text-2xl font-bold">Live Machine Status</h2>
          {liveLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading live status...</div>
          ) : (
            <LiveMachineStatus liveStates={liveStates} />
          )}
        </div>

        {/* Machine Logs */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl md:text-2xl font-bold">Machine Logs</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[200px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Machines" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All Machines</SelectItem>
                  {liveStates.map((machine) => (
                    <SelectItem key={machine.machine_id} value={machine.machine_id}>
                      Machine {machine.machine_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                {selectedMachine && selectedMachine !== "all" ? (
                  <Button onClick={handleClearFilter} variant="secondary" className="flex-1 sm:flex-none">
                    Clear Filter
                  </Button>
                ) : null}
                <Button onClick={() => refetch()} variant="outline" className="flex-1 sm:flex-none">
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading metrics...</div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Error loading data. Please check your connection.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                title="Off Time"
                value={formatDuration(metrics.offTime)}
                icon={PowerOff}
                variant="destructive"
                trend="Machine powered off"
              />
              </div>

              <div className="space-y-3 md:space-y-4">
                <p className="text-xs md:text-sm text-muted-foreground">
                  {selectedMachine && selectedMachine !== "all"
                    ? `Showing logs for Machine ${selectedMachine} on ${format(selectedDate, "PPP")}` 
                    : `Showing all machines on ${format(selectedDate, "PPP")}`}
                </p>
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  <LogsTable logs={logs} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
