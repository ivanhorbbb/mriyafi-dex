import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yphauhvmpzklxprwakho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwaGF1aHZtcHprbHhwcndha2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODU5NTcsImV4cCI6MjA4NzE2MTk1N30.7JiXUSIZY8KlU0oEkWZs3pcMN5uBxM_X4zbnFwZmS8Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);