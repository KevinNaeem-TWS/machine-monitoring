import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mpzqxeockltmnwssnxtr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wenF4ZW9ja2x0bW53c3NueHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDY4OTYsImV4cCI6MjA3NzIyMjg5Nn0.IORBPlkrsNdVV1XUbpG8TYt0xPHx7uFD_w1hV3SaXuY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
