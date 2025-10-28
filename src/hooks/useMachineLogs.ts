import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MachineLog } from "@/types/database";

export const useMachineLogs = (machineId?: string) => {
  return useQuery({
    queryKey: ['machine-logs', machineId],
    queryFn: async () => {
      let query = supabase
        .from('machine_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (machineId) {
        query = query.eq('machine_id', machineId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MachineLog[];
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
};

export const calculateMetrics = (logs: MachineLog[]) => {
  if (!logs || logs.length === 0) {
    return {
      runningTime: 0,
      idleTime: 0,
      totalEvents: 0,
      uptime: 0,
    };
  }

  let runningTime = 0;
  let idleTime = 0;
  let lastTimestamp: Date | null = null;
  let lastState: string | null = null;

  // Sort by timestamp ascending
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  sortedLogs.forEach((log, index) => {
    const currentTimestamp = new Date(log.timestamp);
    
    if (lastTimestamp && lastState) {
      const duration = currentTimestamp.getTime() - lastTimestamp.getTime();
      
      if (lastState.toLowerCase().includes('start') || lastState.toLowerCase().includes('running')) {
        runningTime += duration;
      } else if (lastState.toLowerCase().includes('stop') || lastState.toLowerCase().includes('idle')) {
        idleTime += duration;
      }
    }
    
    lastTimestamp = currentTimestamp;
    lastState = log.event_type;
  });

  // If last state is running, add time until now
  if (lastState && lastTimestamp) {
    const now = new Date();
    const duration = now.getTime() - lastTimestamp.getTime();
    
    if (lastState.toLowerCase().includes('start') || lastState.toLowerCase().includes('running')) {
      runningTime += duration;
    } else if (lastState.toLowerCase().includes('stop') || lastState.toLowerCase().includes('idle')) {
      idleTime += duration;
    }
  }

  const totalTime = runningTime + idleTime;
  const uptime = totalTime > 0 ? (runningTime / totalTime) * 100 : 0;

  return {
    runningTime,
    idleTime,
    totalEvents: logs.length,
    uptime,
  };
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};
