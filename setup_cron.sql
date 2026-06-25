-- setup_cron.sql
-- Run this script in your Supabase SQL Editor to automate the weather sync.
-- IMPORTANT: Make sure pg_cron is enabled in Supabase under Database -> Extensions.

SELECT cron.schedule(
  'run-weather-cycle-every-15-mins',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://lmylftkenngioehzknng.supabase.co/functions/v1/run-weather-cycle',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"}'::jsonb,
    body := '{"triggered_by": "system"}'::jsonb
  );
  $$
);
