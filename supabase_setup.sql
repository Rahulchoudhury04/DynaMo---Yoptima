-- supabase_setup.sql
-- Run this script in your Supabase SQL Editor to set up the database tables and seed data.

-- 1. Create tables
CREATE TABLE IF NOT EXISTS line_items (
    id SERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    creative_name TEXT NOT NULL,
    state TEXT NOT NULL CHECK (state IN ('active', 'paused')),
    bid DECIMAL NOT NULL,
    daily_budget DECIMAL NOT NULL,
    condition_trigger TEXT NOT NULL CHECK (condition_trigger IN ('hot', 'rainy', 'normal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS weather_cache (
    id SERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    temperature DECIMAL NOT NULL,
    humidity INTEGER NOT NULL,
    precipitation DECIMAL NOT NULL,
    rain DECIMAL NOT NULL,
    weather_code INTEGER NOT NULL,
    is_day INTEGER NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('hot', 'rainy', 'normal')),
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS transition_logs (
    id SERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    creative_name TEXT NOT NULL,
    old_state TEXT NOT NULL CHECK (old_state IN ('active', 'paused')),
    new_state TEXT NOT NULL CHECK (new_state IN ('active', 'paused')),
    reason TEXT NOT NULL,
    triggered_by TEXT NOT NULL CHECK (triggered_by IN ('system', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Seed line items safely (only if table is empty)
INSERT INTO line_items (city, creative_name, condition_trigger, bid, daily_budget, state)
SELECT city, creative_name, condition_trigger, bid, daily_budget, state
FROM (
    VALUES
        ('Mumbai', 'Beat the Heat', 'hot', 12.00, 800.00, 'paused'),
        ('Mumbai', 'Rainy Day Pick-me-up', 'rainy', 10.00, 600.00, 'paused'),
        ('Mumbai', 'Refresh Anytime', 'normal', 8.00, 500.00, 'active'),
        ('Delhi', 'Beat the Heat', 'hot', 12.00, 800.00, 'paused'),
        ('Delhi', 'Rainy Day Pick-me-up', 'rainy', 10.00, 600.00, 'paused'),
        ('Delhi', 'Refresh Anytime', 'normal', 8.00, 500.00, 'active'),
        ('Bangalore', 'Beat the Heat', 'hot', 12.00, 800.00, 'paused'),
        ('Bangalore', 'Rainy Day Pick-me-up', 'rainy', 10.00, 600.00, 'paused'),
        ('Bangalore', 'Refresh Anytime', 'normal', 8.00, 500.00, 'active'),
        ('Chennai', 'Beat the Heat', 'hot', 12.00, 800.00, 'paused'),
        ('Chennai', 'Rainy Day Pick-me-up', 'rainy', 10.00, 600.00, 'paused'),
        ('Chennai', 'Refresh Anytime', 'normal', 8.00, 500.00, 'active')
) AS seed(city, creative_name, condition_trigger, bid, daily_budget, state)
WHERE NOT EXISTS (SELECT 1 FROM line_items);

-- 3. SQL for setting up the automated 15-minute cron job (Optional)
-- Note: Requires pg_cron to be enabled in Supabase under Database -> Extensions.
-- Replace `<your-supabase-project-ref>` and `<your-anon-key>` with your actual values if calling via API.
--
-- SELECT cron.schedule(
--   'run-weather-cycle-every-15-mins',
--   '*/15 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://<your-supabase-project-ref>.supabase.co/functions/v1/weather-cycle',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer <your-anon-key>"}'::jsonb,
--     body := '{"triggered_by": "system"}'::jsonb
--   );
--   $$
-- );

-- 4. Row Level Security (RLS) policies
-- Supabase enables RLS by default. These policies allow full read/write operations for the client.
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on line_items" 
ON line_items FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on weather_cache" 
ON weather_cache FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on transition_logs" 
ON transition_logs FOR ALL 
USING (true) 
WITH CHECK (true);

