// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ylnvbvumkzfxbioerzgc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbnZidnVta3pmeGJpb2VyemdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTA3ODYsImV4cCI6MjA2MDgyNjc4Nn0.DcPps2zJjL4_Wsmmr-_umsYc9SuD9jR4ejMkCL3_G_4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);