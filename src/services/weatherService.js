// src/services/weatherService.js
import { supabase } from '../supabaseClient';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'];

/**
 * Seeds the 12 line items if the database table is empty.
 */
export async function seedLineItemsIfEmpty() {
  if (!supabase) return;
  try {
    const { count, error } = await supabase
      .from('line_items')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    if (count === 0) {
      console.log('Seeding line items...');
      const seedData = [];
      const creatives = [
        { name: 'Beat the Heat', trigger: 'hot', bid: 12.00, budget: 800.00, state: 'paused' },
        { name: 'Rainy Day Pick-me-up', trigger: 'rainy', bid: 10.00, budget: 600.00, state: 'paused' },
        { name: 'Refresh Anytime', trigger: 'normal', bid: 8.00, budget: 500.00, state: 'active' }
      ];

      for (const city of CITIES) {
        for (const creative of creatives) {
          seedData.push({
            city: city,
            creative_name: creative.name,
            condition_trigger: creative.trigger,
            bid: creative.bid,
            daily_budget: creative.budget,
            state: creative.state
          });
        }
      }

      const { error: insertError } = await supabase
        .from('line_items')
        .insert(seedData);

      if (insertError) throw insertError;
      console.log('Successfully seeded 12 line items!');
    }
  } catch (err) {
    console.error('Failed to check/seed line items:', err);
  }
}

/**
 * Triggers manual refresh by calling the Supabase Edge Function 'run-weather-cycle'.
 */
export async function triggerManualRefresh() {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check your environment variables.');
  }

  // Invoke the edge function with triggered_by = 'manual'
  const { data, error } = await supabase.functions.invoke('run-weather-cycle', {
    method: 'POST',
    body: { triggered_by: 'manual' }
  });

  if (error) {
    throw error;
  }

  if (data && data.success === false) {
    throw new Error(data.error || 'Edge Function execution failed');
  }

  return data;
}

/**
 * Fetches weather directly from Open-Meteo API, updates Supabase weather_cache,
 * evaluates line item states, updates line_items and inserts transition logs.
 * Used as a fallback if the Edge Function is unavailable.
 */
export async function syncWeatherDirectly(triggeredBy = 'system') {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  const cities = [
    { name: 'Mumbai', lat: 19.07, lon: 72.87 },
    { name: 'Delhi', lat: 28.61, lon: 77.20 },
    { name: 'Bangalore', lat: 12.97, lon: 77.59 },
    { name: 'Chennai', lat: 13.08, lon: 80.27 }
  ];
  const rainyCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];

  // 1. Fetch weather from Open-Meteo API
  const lats = cities.map(c => c.lat).join(',');
  const lons = cities.map(c => c.lon).join(',');
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,is_day&timezone=Asia/Kolkata,Asia/Kolkata,Asia/Kolkata,Asia/Kolkata`;

  const response = await fetch(weatherUrl);
  if (!response.ok) {
    throw new Error(`Open-Meteo API returned status ${response.status}`);
  }
  const weatherData = await response.json();

  const weatherCacheRows = [];
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const raw = weatherData[i];
    const temp = raw.current.temperature_2m;
    const humidity = raw.current.relative_humidity_2m;
    const precipitation = raw.current.precipitation;
    const rain = raw.current.rain;
    const weatherCode = raw.current.weather_code;
    const isDay = raw.current.is_day;

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

  // 2. Insert weather cache rows into Supabase
  const { error: cacheError } = await supabase
    .from('weather_cache')
    .insert(weatherCacheRows);
  if (cacheError) throw cacheError;

  // 3. Fetch current line items to transition
  const { data: lineItems, error: itemsError } = await supabase
    .from('line_items')
    .select('*');
  if (itemsError) throw itemsError;

  const logsToInsert = [];
  const itemsToUpdate = [];

  for (const weather of weatherCacheRows) {
    const targetCondition = weather.condition;
    const cityItems = lineItems.filter(item => item.city === weather.city);

    // Find the creative that matches the target condition
    const activeCreative = cityItems.find(item => item.condition_trigger === targetCondition);
    
    if (!activeCreative) continue;

    if (activeCreative.state === 'active') {
      // No change case
      let reason = `No change — condition remains ${targetCondition} (${weather.temperature}°C)`;
      logsToInsert.push({
        city: weather.city,
        creative_name: activeCreative.creative_name,
        condition: targetCondition,
        old_state: 'active',
        new_state: 'active',
        reason: reason,
        triggered_by: triggeredBy,
        created_at: new Date().toISOString()
      });
    } else {
      // Change case
      for (const item of cityItems) {
        const expectedState = item.id === activeCreative.id ? 'active' : 'paused';
        if (item.state !== expectedState) {
          itemsToUpdate.push({ id: item.id, state: expectedState });
        }
      }

      // Determine log reason
      let reason = '';
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

      logsToInsert.push({
        city: weather.city,
        creative_name: activeCreative.creative_name,
        condition: targetCondition,
        old_state: 'paused',
        new_state: 'active',
        reason: reason,
        triggered_by: triggeredBy,
        created_at: new Date().toISOString()
      });
    }
  }

  // 4. Update changed items in parallel
  if (itemsToUpdate.length > 0) {
    const updatePromises = itemsToUpdate.map(update =>
      supabase
        .from('line_items')
        .update({ state: update.state })
        .eq('id', update.id)
    );
    await Promise.all(updatePromises);
  }

  // 5. Insert transition logs
  if (logsToInsert.length > 0) {
    const { error: logsError } = await supabase
      .from('transition_logs')
      .insert(logsToInsert);
    if (logsError) throw logsError;
  }

  return { weather: weatherCacheRows, logs: logsToInsert };
}

