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
