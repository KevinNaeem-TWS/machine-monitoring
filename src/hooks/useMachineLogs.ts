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
      
      // Sort by timestamp descending (newest first) on client side to handle TEXT timestamps
      const sortedData = (data as MachineLog[]).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      return sortedData;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
};

export const calculateMetrics = (logs: MachineLog[]) => {
  if (!logs || logs.length === 0) {
    return {
      runningTime: 0,
      idleTime: 0,
      offTime: 0,
      uptime: 0,
    };
  }

  let runningTime = 0;
  let idleTime = 0;
  let offTime = 0;

  // Sort by timestamp ascending
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Process each log to find state transitions
  for (let i = 0; i < sortedLogs.length - 1; i++) {
    const currentLog = sortedLogs[i];
    const nextLog = sortedLogs[i + 1];
    
    const currentTime = new Date(currentLog.timestamp).getTime();
    const nextTime = new Date(nextLog.timestamp).getTime();
    const duration = nextTime - currentTime;

    const eventType = currentLog.event_type.toLowerCase();

    // Running time: from running_start to machine_off or idle_start (only "Machine became idle.")
    if (eventType === 'running_start') {
      const nextEventType = nextLog.event_type.toLowerCase();
      if (nextEventType === 'machine_off' || 
          (nextEventType === 'idle_start' && nextLog.details === 'Machine became idle.')) {
        runningTime += duration;
      }
    }

    // Idle time: from idle_start to running_start or machine_off
    if (eventType === 'idle_start') {
      const nextEventType = nextLog.event_type.toLowerCase();
      if (nextEventType === 'running_start' || nextEventType === 'machine_off') {
        idleTime += duration;
      }
    }

    // Off time: from machine_off to machine_on
    if (eventType === 'machine_off') {
      const nextEventType = nextLog.event_type.toLowerCase();
      if (nextEventType === 'machine_on') {
        offTime += duration;
      }
    }
  }

  const totalTime = runningTime + idleTime + offTime;
  const uptime = totalTime > 0 ? (runningTime / totalTime) * 100 : 0;

  return {
    runningTime,
    idleTime,
    offTime,
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
