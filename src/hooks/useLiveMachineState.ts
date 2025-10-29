import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LiveMachineState } from "@/types/database";

export const useLiveMachineState = (machineId?: string) => {
  const [liveStates, setLiveStates] = useState<LiveMachineState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLiveStates = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('live_machine_state').select('*');
        
        if (machineId) {
          query = query.eq('machine_id', machineId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setLiveStates(data as LiveMachineState[]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveStates();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('live-machine-state-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_machine_state',
          ...(machineId && { filter: `machine_id=eq.${machineId}` })
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setLiveStates(prev => {
              const newState = payload.new as LiveMachineState;
              const exists = prev.findIndex(s => s.machine_id === newState.machine_id);
              
              if (exists >= 0) {
                const updated = [...prev];
                updated[exists] = newState;
                return updated;
              }
              return [...prev, newState];
            });
          } else if (payload.eventType === 'DELETE') {
            setLiveStates(prev => 
              prev.filter(s => s.machine_id !== (payload.old as LiveMachineState).machine_id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [machineId]);

  return { liveStates, isLoading, error };
};
