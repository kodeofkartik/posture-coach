import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tzhxcdfmburlfiisruze.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aHhjZGZtYnVybGZpaXNydXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzY1OTMsImV4cCI6MjA4OTM1MjU5M30.Iu2DtxsX1N13CtrjHDrwSsHxt8rYmxmDc2BYyr6jT30';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
