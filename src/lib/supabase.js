import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chpcsanbguilerxvnrfs.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocGNzYW5iZ3VpbGVyeHZucmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTQ5NDMsImV4cCI6MjA4OTM5MDk0M30.hvX0HDTPX3mUzL2-0fTzd4EB0zjRim1ZHvy9Nw981iU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
