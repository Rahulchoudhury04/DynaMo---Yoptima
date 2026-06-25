import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env for Supabase credentials (since Vite loads it, but node doesn't natively without dotenv)
const envLocal = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envLocal.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = envLocal.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
const CREATIVES = ['Beat the Heat', 'Rainy Day Pick-me-up', 'Refresh Anytime'];
const CONDITIONS = ['hot', 'rainy', 'normal'];

async function seedData() {
  const logs = [];
  const now = Date.now();
  
  // Seed random data over the past 40 days
  for (let i = 0; i < 200; i++) {
    // Random day between 0 and 40 days ago
    const daysAgo = Math.floor(Math.random() * 40);
    const date = new Date(now - (daysAgo * 24 * 60 * 60 * 1000));
    
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
    const creative_name = CREATIVES[Math.floor(Math.random() * CREATIVES.length)];
    
    logs.push({
      city,
      creative_name,
      condition,
      old_state: 'paused',
      new_state: 'active',
      reason: `Automated seed data for analytics testing (${condition})`,
      triggered_by: 'system',
      created_at: date.toISOString()
    });
  }

  const { data, error } = await supabase.from('transition_logs').insert(logs);
  
  if (error) {
    console.error('Error seeding data:', error);
  } else {
    console.log(`Successfully seeded ${logs.length} historical logs!`);
  }
}

seedData();
