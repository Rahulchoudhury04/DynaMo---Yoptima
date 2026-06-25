// supabase/functions/run-weather-cycle/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Determine triggered_by
    let triggeredBy = 'system';
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body && body.triggered_by) {
          triggeredBy = body.triggered_by;
        }
      } catch (_e) {
        // Fallback to default 'system' on parsing error
      }
    }

    // 2. Initialize Supabase Service Role client to bypass RLS and perform updates
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing in Deno env.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Define cities and coordinates
    const cities = [
      { name: 'Mumbai', lat: 19.07, lon: 72.87 },
      { name: 'Delhi', lat: 28.61, lon: 77.20 },
      { name: 'Bangalore', lat: 12.97, lon: 77.59 },
      { name: 'Chennai', lat: 13.08, lon: 80.27 }
    ];
    const rainyCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];

    // 4. Fetch weather for all 4 cities in one single API call
    const lats = cities.map(c => c.lat).join(',');
    const lons = cities.map(c => c.lon).join(',');
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,is_day&timezone=Asia/Kolkata,Asia/Kolkata,Asia/Kolkata,Asia/Kolkata`;

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Open-Meteo API returned status ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    if (!Array.isArray(weatherData)) {
      throw new Error('Invalid Open-Meteo response structure: Expected an array.');
    }

    // 5. Parse, map, and determine conditions
    const weatherCacheRows = [];
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      const raw = weatherData[i];

      if (!raw || !raw.current) {
        throw new Error(`Missing current weather details for index ${i} (${city.name})`);
      }

      const temp = raw.current.temperature_2m;
      const humidity = raw.current.relative_humidity_2m;
      const precipitation = raw.current.precipitation;
      const rain = raw.current.rain;
      const weatherCode = raw.current.weather_code;
      const isDay = raw.current.is_day;

      // Decision Logic
      let condition = 'normal';
      if (temp >= 35) {
        condition = 'hot';
      } else if (precipitation > 0 || rainyCodes.includes(weatherCode)) {
        condition = 'rainy';
      }

      weatherCacheRows.push({
        city: city.name,
        temperature: temp,
        humidity: humidity,
        precipitation: precipitation,
        rain: rain,
        weather_code: weatherCode,
        is_day: isDay,
        condition: condition,
        fetched_at: new Date().toISOString()
      });
    }

    // 6. Store weather rows in weather_cache table
    const { error: cacheError } = await supabase
      .from('weather_cache')
      .insert(weatherCacheRows);

    if (cacheError) throw cacheError;

    // 7. Evaluate and update line_items & write transition_logs
    const { data: lineItems, error: itemsError } = await supabase
      .from('line_items')
      .select('*');

    if (itemsError) throw itemsError;

    const logsToInsert = [];
    const itemsToUpdate = [];

    for (const weather of weatherCacheRows) {
      const cityItems = lineItems.filter(item => item.city === weather.city);
      const targetCondition = weather.condition;

      for (const item of cityItems) {
        const shouldBeActive = item.condition_trigger === targetCondition;
        const expectedState = shouldBeActive ? 'active' : 'paused';

        if (item.state !== expectedState) {
          itemsToUpdate.push({
            id: item.id,
            state: expectedState
          });

          // Determine log reason
          let reason = '';
          if (expectedState === 'active') {
            if (targetCondition === 'hot') {
              reason = `Temperature rose to ${weather.temperature}°C, above 35°C threshold`;
            } else if (targetCondition === 'rainy') {
              if (weather.precipitation > 0) {
                reason = `Precipitation detected: ${weather.precipitation}mm in last 15 minutes`;
              } else {
                reason = `Weather code ${weather.weather_code} detected — drizzle/rain/storm condition`;
              }
            } else {
              reason = `Conditions normal — temp ${weather.temperature}°C, no precipitation detected`;
            }
          } else {
            reason = `Paused — condition changed to ${targetCondition}`;
          }

          logsToInsert.push({
            city: item.city,
            creative_name: item.creative_name,
            old_state: item.state,
            new_state: expectedState,
            reason: reason,
            triggered_by: triggeredBy,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    // 8. Execute updates in parallel to save time
    if (itemsToUpdate.length > 0) {
      const updatePromises = itemsToUpdate.map(update =>
        supabase
          .from('line_items')
          .update({ state: update.state })
          .eq('id', update.id)
      );
      await Promise.all(updatePromises);
    }

    // 9. Execute logs insertion
    if (logsToInsert.length > 0) {
      const { error: logsError } = await supabase
        .from('transition_logs')
        .insert(logsToInsert);
      if (logsError) throw logsError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        updatedCount: itemsToUpdate.length,
        logsCount: logsToInsert.length,
        weather: weatherCacheRows,
        logs: logsToInsert
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
