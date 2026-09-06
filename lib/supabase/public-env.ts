const FALLBACK_URL = "https://cbnncyvcpjqpibpaqoqr.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibm5jeXZjcGpxcGlicGFxb3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTgyNDMsImV4cCI6MjEwNDE5NDI0M30.j__AZPHgn1WPWtZDm4rq9TbPlV86TCjVpQSH73Ev048";

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;
}

export function hasSupabaseEnv() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
