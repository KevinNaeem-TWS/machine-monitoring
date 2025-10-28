export interface MachineLog {
  id: number;
  machine_id: string | null;
  timestamp: string;
  event_type: string;
  details: string | null;
}
