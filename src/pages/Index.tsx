import { useState } from "react";
import { Clock, Power, PowerOff, CalendarIcon } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { LogsTable } from "@/components/LogsTable";
import { useMachineLogs, calculateMetrics, formatDuration } from "@/hooks/useMachineLogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Index = () => {
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [machineIdInput, setMachineIdInput] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { data: allLogs = [], isLoading, error, refetch } = useMachineLogs(selectedMachine || undefined);
  
  // Filter logs by selected date
  const logs = allLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate.toDateString() === selectedDate.toDateString();
  });
  
  const metrics = calculateMetrics(logs);

  const handleFilterMachine = () => {
    setSelectedMachine(machineIdInput);
  };

  const handleClearFilter = () => {
    setSelectedMachine("");
    setMachineIdInput("");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Machine Monitoring
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">SCADA System Dashboard</p>
          </div>
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
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Input
              placeholder="Machine ID"
              value={machineIdInput}
              onChange={(e) => setMachineIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterMachine()}
              className="w-full sm:w-40"
            />
            <div className="flex gap-2">
              {selectedMachine ? (
                <Button onClick={handleClearFilter} variant="secondary" className="flex-1 sm:flex-none">
                  Clear Filter
                </Button>
              ) : (
                <Button onClick={handleFilterMachine} className="flex-1 sm:flex-none">
                  Filter
                </Button>
              )}
              <Button onClick={() => refetch()} variant="outline" className="flex-1 sm:flex-none">
                Refresh
              </Button>
            </div>
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

            {/* Logs Table */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-xl md:text-2xl font-bold">Event Logs</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {selectedMachine 
                    ? `Showing logs for Machine ${selectedMachine} on ${format(selectedDate, "PPP")}` 
                    : `Showing all machines on ${format(selectedDate, "PPP")}`}
                </p>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <LogsTable logs={logs} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
