import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://goshpitwxgukegtvnnhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvc2hwaXR3eGd1a2VndHZubmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMDA5MjMsImV4cCI6MjA2NTg3NjkyM30.tMxsodaiBioT8hogh2xLJTA83hXGobiVvxA1bzeX478';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
