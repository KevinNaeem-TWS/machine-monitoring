export interface MachineLog {
  id: number;
  machine_id: string | null;
  timestamp: string;
  event_type: string;
  details: string | null;
}

export interface LiveMachineState {
  machine_id: string;
  status: string;
  recipe: string | null;
  production: number;
  updated_at: string;
}
