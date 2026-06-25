// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { seedLineItemsIfEmpty, triggerManualRefresh, syncWeatherDirectly } from './services/weatherService';
import { 
  GlassWater, 
  ChevronDown, 
  Bell, 
  Plus, 
  FileText, 
  RefreshCw, 
  MapPin, 
  TrendingUp, 
  Activity, 
  X, 
  AlertTriangle,
  LogOut,
  User,
  ExternalLink,
  Flame,
  CloudRain,
  Sun,
  CloudSun,
  Clock,
  Zap,
  Rocket,
  Settings,
  HelpCircle,
  Cloud
} from 'lucide-react';

function getHeaderBgColor(condition, isDay) {
  const cond = condition ? String(condition).toLowerCase().trim() : 'normal';
  const day = isDay === 1 || isDay === true || String(isDay) === '1' || String(isDay) === 'true';

  if (cond === 'hot') return '#B45309';
  if (cond === 'rainy') return day ? '#1D4ED8' : '#1E3A5F';
  return day ? '#065F46' : '#1B2B4B';
}

function ImageThumbnail({ creativeName, conditionTrigger }) {
  const [hasError, setHasError] = useState(false);

  const urls = {
    'Beat the Heat': 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/ChatGPT%20Image%20Jun%2025,%202026,%2002_19_38%20AM.png',
    'Rainy Day Pick-me-up': 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/Rainy%20Day%20Pick-me-up%20creative',
    'Refresh Anytime': 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/Refresh%20Anytime%20creative'
  };

  const src = urls[creativeName];

  if (!src || hasError) {
    const placeholderColors = {
      hot: { bg: '#FEF3C7', icon: '#B45309' },
      rainy: { bg: '#DBEAFE', icon: '#1D4ED8' },
      normal: { bg: '#D1FAE5', icon: '#065F46' }
    };
    const colors = placeholderColors[conditionTrigger] || placeholderColors.normal;
    const PlaceholderIcon = conditionTrigger === 'hot' ? Flame : conditionTrigger === 'rainy' ? CloudRain : Sun;
    return (
      <div className="thumbnail-placeholder" style={{ backgroundColor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PlaceholderIcon size={22} style={{ color: colors.icon, opacity: 0.7 }} />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={creativeName} 
      className="thumbnail-img" 
      onError={() => setHasError(true)} 
    />
  );
}

function WeatherScene({ condition, isDay }) {
  const cond = condition ? String(condition).toLowerCase().trim() : 'normal';
  const day = isDay === 1 || isDay === true || String(isDay) === '1' || String(isDay) === 'true';

  if (cond === 'hot') {
    return (
      <div className="scene scene-hot">
        <div className="sun-glow"></div>
        <div className="sun-body">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`sun-ray ray-${i}`} style={{ transform: `rotate(${i * 45}deg)` }} />
          ))}
        </div>
        <div className="heat-shimmer">
          <div className="shimmer-line line-1"></div>
          <div className="shimmer-line line-2"></div>
          <div className="shimmer-line line-3"></div>
        </div>
      </div>
    );
  }

  if (cond === 'rainy') {
    return (
      <div className={`scene scene-rainy ${day ? 'day' : 'night'}`}>
        {!day && (
          <div className="moon-crescent"></div>
        )}
        
        <div className="clouds-container">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
        </div>

        <div className="rain-container">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className={`rain-drop drop-${i}`} 
              style={{
                left: `${5 + i * 4.8}%`,
                animationDelay: `${(i % 5) * 0.2}s`,
                animationDuration: `${0.8 + (i % 3) * 0.15}s`
              }} 
            />
          ))}
        </div>

        {!day && (
          <div className="city-lights">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`city-light light-${i}`} 
                style={{
                  left: `${15 + i * 10}%`,
                  bottom: `${5 + (i % 2) * 4}px`,
                  animationDelay: `${i * 0.3}s`
                }} 
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // normal condition
  if (day) {
    return (
      <div className="scene scene-normal-day">
        <div className="sun-peeking"></div>
        
        <div className="drifting-cloud cloud-1"></div>
        <div className="drifting-cloud cloud-2"></div>

        <div className="birds-container">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className={`bird bird-${i}`} 
              style={{
                animationDelay: `${i * 2}s`
              }} 
            />
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="scene scene-normal-night">
        <div className="moon-crescent"></div>

        <div className="stars-container">
          {[...Array(12)].map((_, i) => {
            const x = [12, 35, 50, 78, 85, 22, 60, 45, 70, 92, 10, 55][i];
            const y = [15, 25, 45, 15, 55, 30, 20, 65, 35, 40, 50, 60][i];
            return (
              <div 
                key={i} 
                className={`star star-${i}`} 
                style={{
                  left: `${x}%`,
                  top: `${y}px`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${1.2 + (i % 3) * 0.4}s`
                }} 
              />
            );
          })}
        </div>

        <div className="skyline">
          <div className="building b-1"></div>
          <div className="building b-2"></div>
          <div className="building b-3"></div>
          <div className="building b-4"></div>
          <div className="building b-5"></div>
          <div className="building b-6"></div>
          <div className="building b-7"></div>
        </div>
      </div>
    );
  }
}

export default function App() {
  // Data states
  const [lineItems, setLineItems] = useState([]);
  const [weatherCache, setWeatherCache] = useState([]);
  const [transitionLogs, setTransitionLogs] = useState([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('dynamo_active_tab') || 'All Cities';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [lastSyncedTimeAgo, setLastSyncedTimeAgo] = useState('never');
  const [lastOpenedNotificationsAt, setLastOpenedNotificationsAt] = useState(0);
  
  // Error/loading states
  const [isInitialized, setIsInitialized] = useState(false);
  const [supabaseError, setSupabaseError] = useState(false);
  const [apiErrorBanner, setApiErrorBanner] = useState(null);
  
  // Demo Mode state
  const [isDemoMode, setIsDemoMode] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch all necessary data from Supabase
  const fetchData = async () => {
    if (isDemoMode) return null;
    if (!supabase) {
      setSupabaseError(true);
      return null;
    }
    try {
      // 1. Fetch line items
      const { data: items, error: itemsError } = await supabase
        .from('line_items')
        .select('*')
        .order('id', { ascending: true });

      if (itemsError) throw itemsError;
      setLineItems(items || []);

      // 2. Fetch recent weather cache (fetch latest 40 rows to extract latest per city)
      const { data: cache, error: cacheError } = await supabase
        .from('weather_cache')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(40);

      if (cacheError) throw cacheError;
      
      // Deduplicate to get the latest weather cache for each of the 4 cities
      const latestWeather = [];
      const seenCities = new Set();
      if (cache) {
        for (const row of cache) {
          if (!seenCities.has(row.city)) {
            seenCities.add(row.city);
            latestWeather.push(row);
          }
        }
      }
      
      // Always set weatherCache, even if empty, so the UI state is updated
      setWeatherCache(latestWeather);

      // 3. Fetch transition logs (limit to 100 for "View All")
      const { data: logs, error: logsError } = await supabase
        .from('transition_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setTransitionLogs(logs || []);

      setSupabaseError(false);
      return { latestWeather, items, logs };
    } catch (err) {
      console.error('Supabase connection/fetch error:', err);
      setSupabaseError(true);
      throw err;
    }
  };

  // Run initialization on mount
  useEffect(() => {
    const initializeApp = async () => {
      if (!supabase) {
        console.warn("Supabase not initialized, entering Demo Mode automatically.");
        startDemoMode();
        setApiErrorBanner("Supabase URL and Key missing. Running in Demo Mode (Mock data).");
        return;
      }
      try {
        // Seed if table is empty, then load data
        await seedLineItemsIfEmpty();
        await fetchData();
      } catch (err) {
        console.error("Failed to initialize app from Supabase, entering Demo Mode:", err);
        startDemoMode();
        setApiErrorBanner("Database connection failed. Running in Demo Mode (Mock data).");
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Set up 60-second polling interval for live state updates (non-demo mode)
  useEffect(() => {
    if (!isInitialized || supabaseError || isDemoMode) return;

    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, [isInitialized, supabaseError, isDemoMode]);

  // Calculate Last Synced relative time dynamically
  useEffect(() => {
    if (weatherCache.length === 0) {
      setLastSyncedTimeAgo('never');
      return;
    }

    const updateTimeAgo = () => {
      // Find the latest fetched_at timestamp
      const timestamps = weatherCache.map(w => new Date(w.fetched_at).getTime());
      const latestTime = Math.max(...timestamps);
      const diffMs = Date.now() - latestTime;
      const diffMin = Math.floor(diffMs / 60000);

      if (diffMin <= 0) {
        setLastSyncedTimeAgo('just now');
      } else {
        setLastSyncedTimeAgo(`${diffMin} min ago`);
      }
    };

    updateTimeAgo();
    const timeInterval = setInterval(updateTimeAgo, 30000); // update every 30 seconds

    return () => clearInterval(timeInterval);
  }, [weatherCache]);

  // Launch Demo Mode
  const startDemoMode = () => {
    setIsDemoMode(true);
    setSupabaseError(false);

    // Initial mock weather representing a standard state
    const initialWeather = [
      { id: 1, city: 'Mumbai', temperature: 25.3, humidity: 93, precipitation: 0.3, rain: 0.3, weather_code: 55, is_day: 0, condition: 'rainy', fetched_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
      { id: 2, city: 'Delhi', temperature: 31.6, humidity: 52, precipitation: 0, rain: 0, weather_code: 0, is_day: 1, condition: 'normal', fetched_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
      { id: 3, city: 'Bangalore', temperature: 21.3, humidity: 86, precipitation: 0, rain: 0, weather_code: 1, is_day: 1, condition: 'normal', fetched_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
      { id: 4, city: 'Chennai', temperature: 36.5, humidity: 77, precipitation: 0, rain: 0, weather_code: 0, is_day: 1, condition: 'hot', fetched_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() }
    ];

    // Seeding line items matched to current weather conditions
    const initialItems = [
      { id: 1, city: 'Mumbai', creative_name: 'Beat the Heat', condition_trigger: 'hot', bid: 12.00, daily_budget: 800.00, state: 'paused' },
      { id: 2, city: 'Mumbai', creative_name: 'Rainy Day Pick-me-up', condition_trigger: 'rainy', bid: 10.00, daily_budget: 600.00, state: 'active' },
      { id: 3, city: 'Mumbai', creative_name: 'Refresh Anytime', condition_trigger: 'normal', bid: 8.00, daily_budget: 500.00, state: 'paused' },
      
      { id: 4, city: 'Delhi', creative_name: 'Beat the Heat', condition_trigger: 'hot', bid: 12.00, daily_budget: 800.00, state: 'paused' },
      { id: 5, city: 'Delhi', creative_name: 'Rainy Day Pick-me-up', condition_trigger: 'rainy', bid: 10.00, daily_budget: 600.00, state: 'paused' },
      { id: 6, city: 'Delhi', creative_name: 'Refresh Anytime', condition_trigger: 'normal', bid: 8.00, daily_budget: 500.00, state: 'active' },
      
      { id: 7, city: 'Bangalore', creative_name: 'Beat the Heat', condition_trigger: 'hot', bid: 12.00, daily_budget: 800.00, state: 'paused' },
      { id: 8, city: 'Bangalore', creative_name: 'Rainy Day Pick-me-up', condition_trigger: 'rainy', bid: 10.00, daily_budget: 600.00, state: 'paused' },
      { id: 9, city: 'Bangalore', creative_name: 'Refresh Anytime', condition_trigger: 'normal', bid: 8.00, daily_budget: 500.00, state: 'active' },
      
      { id: 10, city: 'Chennai', creative_name: 'Beat the Heat', condition_trigger: 'hot', bid: 12.00, daily_budget: 800.00, state: 'active' },
      { id: 11, city: 'Chennai', creative_name: 'Rainy Day Pick-me-up', condition_trigger: 'rainy', bid: 10.00, daily_budget: 600.00, state: 'paused' },
      { id: 12, city: 'Chennai', creative_name: 'Refresh Anytime', condition_trigger: 'normal', bid: 8.00, daily_budget: 500.00, state: 'paused' }
    ];

    // Transition logs matching initial seed
    const initialLogs = [
      { id: 1, city: 'Mumbai', creative_name: 'Rainy Day Pick-me-up', old_state: 'paused', new_state: 'active', reason: 'Precipitation detected: 0.3mm in last 15 minutes', triggered_by: 'system', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: 2, city: 'Mumbai', creative_name: 'Refresh Anytime', old_state: 'active', new_state: 'paused', reason: 'Paused — condition changed to rainy', triggered_by: 'system', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: 3, city: 'Chennai', creative_name: 'Beat the Heat', old_state: 'paused', new_state: 'active', reason: 'Temperature rose to 36.5°C, above 35°C threshold', triggered_by: 'system', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: 4, city: 'Chennai', creative_name: 'Refresh Anytime', old_state: 'active', new_state: 'paused', reason: 'Paused — condition changed to hot', triggered_by: 'system', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: 5, city: 'Delhi', creative_name: 'Refresh Anytime', old_state: 'paused', new_state: 'active', reason: 'Conditions normal — temp 31.6°C, no precipitation detected', triggered_by: 'system', created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
      { id: 6, city: 'Bangalore', creative_name: 'Refresh Anytime', old_state: 'paused', new_state: 'active', reason: 'Conditions normal — temp 21.3°C, no precipitation detected', triggered_by: 'system', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
    ];

    setWeatherCache(initialWeather);
    setLineItems(initialItems);
    setTransitionLogs(initialLogs);
    setIsInitialized(true);
  };

  // Local Weather Sync cycle in Demo Mode
  const runDemoWeatherCycle = async (triggeredBy = 'manual') => {
    try {
      const cities = [
        { name: 'Mumbai', lat: 19.07, lon: 72.87 },
        { name: 'Delhi', lat: 28.61, lon: 77.20 },
        { name: 'Bangalore', lat: 12.97, lon: 77.59 },
        { name: 'Chennai', lat: 13.08, lon: 80.27 }
      ];
      const rainyCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];

      const lats = cities.map(c => c.lat).join(',');
      const lons = cities.map(c => c.lon).join(',');
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,is_day&timezone=Asia/Kolkata,Asia/Kolkata,Asia/Kolkata,Asia/Kolkata`;

      const response = await fetch(weatherUrl);
      if (!response.ok) throw new Error('API fetch failed');
      const data = await response.json();

      const newWeather = [];
      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const raw = data[i];
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

        newWeather.push({
          id: i + 1,
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

      // Evaluate logic and transition states locally
      const updatedItems = [...lineItems];
      const newLogs = [];

      for (const weather of newWeather) {
        const targetCondition = weather.condition;
        
        for (let j = 0; j < updatedItems.length; j++) {
          const item = updatedItems[j];
          if (item.city === weather.city) {
            const shouldBeActive = item.condition_trigger === targetCondition;
            const expectedState = shouldBeActive ? 'active' : 'paused';

            if (item.state !== expectedState) {
              const oldState = item.state;
              updatedItems[j] = { ...item, state: expectedState };

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

              newLogs.push({
                id: Date.now() + j,
                city: item.city,
                creative_name: item.creative_name,
                old_state: oldState,
                new_state: expectedState,
                reason: reason,
                triggered_by: triggeredBy,
                created_at: new Date().toISOString()
              });
            }
          }
        }
      }

      setWeatherCache(newWeather);
      setLineItems(updatedItems);
      // Prepend logs in reverse order so latest shows at top
      setTransitionLogs(prev => [...newLogs.reverse(), ...prev]);
      setApiErrorBanner(null);
    } catch (err) {
      console.error(err);
      throw new Error('Local Open-Meteo refresh failed');
    }
  };

  // Handler for manual refresh button click
  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setApiErrorBanner(null);

    try {
      if (isDemoMode) {
        await runDemoWeatherCycle('manual');
      } else {
        try {
          await triggerManualRefresh();
          await fetchData();
        } catch (edgeError) {
          console.warn('Edge function failed during manual refresh, falling back to direct Open-Meteo:', edgeError);
          await syncWeatherDirectly('manual');
          setApiErrorBanner('Edge Function is unavailable. Fell back to direct Open-Meteo sync.');
        }
      }
    } catch (err) {
      console.error('Manual refresh failed:', err);
      let lastFetchedTimestamp = '';
      if (weatherCache.length > 0) {
        const timestamps = weatherCache.map(w => new Date(w.fetched_at).getTime());
        const latestTime = Math.max(...timestamps);
        lastFetchedTimestamp = new Date(latestTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      } else {
        lastFetchedTimestamp = 'unknown';
      }
      setApiErrorBanner(`Weather data sync failed: ${err.message || 'unknown error'}. Showing last known state as of ${lastFetchedTimestamp}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper formats
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'unknown';
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch (e) {
      return 'unknown';
    }
  };

  const getExactLastSyncedTime = () => {
    if (weatherCache.length === 0) return '';
    try {
      const timestamps = weatherCache.map(w => w && w.fetched_at ? new Date(w.fetched_at).getTime() : NaN).filter(t => !isNaN(t));
      if (timestamps.length === 0) return 'never';
      const latestTime = Math.max(...timestamps);
      const date = new Date(latestTime);
      if (isNaN(date.getTime())) return 'never';
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch (e) {
      console.error("Error formatting sync time:", e);
      return 'unknown';
    }
  };

  const formatNotificationTimeAgo = (isoString) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'unknown';
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin <= 0) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return date.toLocaleDateString('en-IN', { dateStyle: 'short' });
    } catch (e) {
      return 'unknown';
    }
  };

  const getLogDotColor = (log) => {
    if (log.new_state === 'paused') return 'paused-dot';
    if (log.creative_name === 'Beat the Heat') return 'hot-dot';
    if (log.creative_name === 'Rainy Day Pick-me-up') return 'rainy-dot';
    return 'normal-dot';
  };


  const getCityCondition = (weather) => {
    if (!weather) return 'normal';
    if (weather.condition) return String(weather.condition).toLowerCase().trim();
    
    // Fallback logic
    const temp = Number(weather.temperature || 0);
    const precip = Number(weather.precipitation || 0);
    const code = Number(weather.weather_code || 0);
    const rainyCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];
    
    if (temp >= 35) return 'hot';
    if (precip > 0 || rainyCodes.includes(code)) return 'rainy';
    return 'normal';
  };

  const getCityIsDay = (weather) => {
    if (!weather) return true;
    if (weather.is_day !== undefined && weather.is_day !== null) {
      const val = weather.is_day;
      return val === 1 || val === true || String(val) === '1' || String(val) === 'true';
    }
    const hr = new Date().getHours();
    return hr >= 6 && hr < 18;
  };

  const getCityCardStripe = (weather) => {
    const cond = getCityCondition(weather);
    const day = getCityIsDay(weather);
    if (cond === 'hot') return 'stripe-hot';
    if (cond === 'rainy') return day ? 'stripe-rainy-day' : 'stripe-rainy-night';
    return day ? 'stripe-normal-day' : 'stripe-normal-night';
  };

  const getCityCardHeaderClass = (weather) => {
    const cond = getCityCondition(weather);
    const day = getCityIsDay(weather);
    if (cond === 'hot') return 'bg-hot-day';
    if (cond === 'rainy') return day ? 'bg-rainy-day' : 'bg-rainy-night';
    return day ? 'bg-normal-day' : 'bg-normal-night';
  };

  const getDefaultReason = (weather) => {
    const cond = getCityCondition(weather);
    if (cond === 'hot') {
      return `Temperature rose to ${weather.temperature}°C, above 35°C threshold`;
    } else if (cond === 'rainy') {
      if (weather.precipitation > 0) {
        return `Precipitation detected: ${weather.precipitation}mm in last 15 minutes`;
      } else {
        return `Weather code ${weather.weather_code} detected — drizzle/rain/storm condition`;
      }
    } else {
      return `Conditions normal — temp ${weather.temperature}°C, no precipitation detected`;
    }
  };

  // Filtered cities list
  const filteredWeather = activeTab === 'All Cities' 
    ? weatherCache 
    : weatherCache.filter(w => w.city === activeTab);

  // Compute stat card metrics
  const activeLineItemsCount = lineItems.filter(item => item.state === 'active').length;
  const changesTodayCount = transitionLogs.filter(log => {
    const logDate = new Date(log.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const todayDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    return logDate === todayDate;
  }).length;

  // Compute unread notifications count
  const unreadCount = transitionLogs.filter(
    log => new Date(log.created_at).getTime() > lastOpenedNotificationsAt
  ).length;

  // Compute today's logs by condition type for summary pills
  const todayLogs = transitionLogs.filter(log => {
    const logDate = new Date(log.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const todayDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    return logDate === todayDate;
  });

  const rainyEventsCount = todayLogs.filter(log => log.creative_name === 'Rainy Day Pick-me-up').length;
  const hotEventsCount = todayLogs.filter(log => log.creative_name === 'Beat the Heat').length;
  const normalEventsCount = todayLogs.filter(log => log.creative_name === 'Refresh Anytime').length;

  const getLogAccentClass = (log) => {
    if (log.new_state === 'paused') return 'accent-paused';
    if (log.creative_name === 'Beat the Heat') return 'accent-hot';
    if (log.creative_name === 'Rainy Day Pick-me-up') return 'accent-rainy';
    return 'accent-normal';
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setIsNotificationDropdownOpen(prev => {
      const next = !prev;
      if (next) {
        setLastOpenedNotificationsAt(Date.now());
        setIsUserDropdownOpen(false);
      }
      return next;
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('dynamo_active_tab', tab);
  };

  const handleViewAllActivity = (e) => {
    e.stopPropagation();
    setIsNotificationDropdownOpen(false);
    setShowAllLogs(true);
    setTimeout(() => {
      const element = document.getElementById('recent-activity');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // Supabase error screen
  if (!isInitialized) {
    return (
      <div className="fullscreen-error-container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <RefreshCw className="spinning" size={40} style={{ color: 'var(--primary-navy)' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Initializing DynaMo Control Plane...</p>
        </div>
      </div>
    );
  }

  if (supabaseError && !isDemoMode) {
    return (
      <div className="fullscreen-error-container">
        <div className="error-card">
          <div className="error-icon-wrapper">
            <AlertTriangle size={32} />
          </div>
          <h1>Database Connection Failed</h1>
          <p>
            DynaMo could not establish a connection to your Supabase instance. 
            Please check that your environment variables (<strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong>) are set correctly and that your database setup has been executed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <button className="btn-retry" style={{ width: '100%' }} onClick={() => { setIsInitialized(false); fetchData(); }}>
              Retry Connection
            </button>
            <button 
              className="btn-retry" 
              style={{ width: '100%', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }} 
              onClick={startDemoMode}
            >
              Explore in Demo Mode (In-Memory Mock)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Yellow Warning Banner */}
      {apiErrorBanner && (
        <div className="warning-banner">
          <AlertTriangle size={18} />
          <span>{apiErrorBanner}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <span className="logo" style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A2D', display: 'flex', alignItems: 'center', gap: '0.25rem', letterSpacing: '-0.025em' }}>
            DynaMo
            <span className="logo-icon" style={{ color: '#10B981', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </span>
        </div>

        <div className="nav-center">
          <div className="campaign-pill">
            <GlassWater size={15} style={{ color: '#2D2D8F' }} />
            <span>CoolSip — Summer 2026</span>
            <ChevronDown size={14} style={{ color: '#9CA3AF' }} />
          </div>
        </div>

        <div className="nav-right" style={{ gap: '16px' }}>
          <button className="btn-new-campaign" onClick={() => setIsNewCampaignOpen(true)}>
            <Plus size={16} />
            <span>New Campaign</span>
          </button>

          {/* Notification bell dropdown wrapper */}
          <div className="notification-wrapper" ref={notificationRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div className="notification-container" onClick={toggleNotifications}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </div>

            {isNotificationDropdownOpen && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <span>Notifications</span>
                  <button 
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); setLastOpenedNotificationsAt(Date.now()); }}
                  >
                    Mark all read
                  </button>
                </div>
                <div className="notifications-list">
                  {transitionLogs.slice(0, 8).map((log) => (
                    <div key={log.id} className="notification-item">
                      {/* Left: Simplified text format "City: Creative name → Active/Paused" */}
                      <span className="notification-desc">
                        {log.city}: {log.creative_name} → {log.new_state === 'active' ? 'Active' : 'Paused'}
                      </span>
                      
                      {/* Right: Time ago */}
                      <span className="notification-time">
                        {formatNotificationTimeAgo(log.created_at)}
                      </span>
                    </div>
                  ))}
                  {transitionLogs.slice(0, 8).length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      No notifications yet
                    </div>
                  )}
                </div>
                {/* Bottom link */}
                <div className="notifications-footer">
                  <button 
                    className="btn-view-all-activity"
                    onClick={handleViewAllActivity}
                  >
                    View all activity →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="user-avatar-trigger" onClick={(e) => { e.stopPropagation(); setIsUserDropdownOpen(!isUserDropdownOpen); setIsNotificationDropdownOpen(false); }}>
            <div className="avatar-circle">RC</div>
          </div>

          {/* User profile dropdown card */}
          {isUserDropdownOpen && (
            <div className="profile-dropdown" ref={dropdownRef}>
              <div className="profile-header-new">
                <div className="profile-avatar-large">RC</div>
                <div className="profile-info-new">
                  <span className="profile-name-bold">Rahul Choudhury</span>
                  <span className="profile-role-muted">Campaign Manager</span>
                  <span className="profile-email-small">rahulchouhdury.official@gmail.com</span>
                </div>
              </div>
              <div className="profile-divider"></div>
              <div className="profile-menu">
                <div className="profile-menu-item" onClick={() => alert('My Profile clicked')}>
                  <User size={16} className="menu-icon" />
                  <span>My Profile</span>
                </div>
                <div className="profile-menu-item" onClick={() => alert('Settings clicked')}>
                  <Settings size={16} className="menu-icon" />
                  <span>Settings</span>
                </div>
                <div className="profile-menu-item" onClick={() => alert('Help clicked')}>
                  <HelpCircle size={16} className="menu-icon" />
                  <span>Help</span>
                </div>
              </div>
              <div className="profile-divider"></div>
              <button className="btn-signout-new" onClick={() => alert('Sign out option clicked. (Assessment Mock)')}>
                <LogOut size={16} className="logout-icon" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* 4 Stat Cards */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-left">
              <span className="stat-label">Active line items</span>
              <span className="stat-value">{activeLineItemsCount}</span>
            </div>
            <div className="stat-icon-wrapper circle-green">
              <FileText size={20} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-left">
              <span className="stat-label">Cities monitored</span>
              <span className="stat-value">4</span>
            </div>
            <div className="stat-icon-wrapper circle-blue">
              <MapPin size={20} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-left">
              <span className="stat-label">Changes today</span>
              <span className="stat-value">{changesTodayCount}</span>
            </div>
            <div className="stat-icon-wrapper circle-amber">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-left">
              <span className="stat-label">Last synced</span>
              <div className="stat-value-container">
                <span className="stat-value success-text">{lastSyncedTimeAgo}</span>
                <span className="pulse-dot" title="Live monitoring active"></span>
              </div>
              {weatherCache.length > 0 && (
                <span className="stat-exact-time">
                  Last synced at {getExactLastSyncedTime()}
                </span>
              )}
            </div>
            <div className="stat-right-action">
              <button 
                className={`btn-refresh-stat ${isRefreshing ? 'spinning' : ''}`} 
                onClick={handleManualRefresh}
                title="Refresh weather data now"
                disabled={isRefreshing}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* City Filter Tabs */}
        <section className="tabs-container">
          {['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </section>

        {/* City Cards Grid - changes layout dynamically if filtered */}
        <section className={activeTab === 'All Cities' ? 'cards-grid' : 'single-card-container'}>
          {filteredWeather.map((weather) => {
            const cityItems = lineItems.filter(item => item.city === weather.city);
            // Fetch most recent transition log reason for this city
            const cityLogs = transitionLogs.filter(log => log.city === weather.city);
            const latestCityLog = cityLogs.length > 0 ? cityLogs[0] : null;
            const reasonText = latestCityLog ? latestCityLog.reason : getDefaultReason(weather);
            const cond = getCityCondition(weather);

            return (
              <div 
                key={weather.id || weather.city} 
                className={`city-card ${getCityCardStripe(weather)}`}
              >
                {/* Header */}
                <div className="card-header" style={{ height: '160px', padding: '20px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', backgroundColor: getHeaderBgColor(cond, getCityIsDay(weather)) }}>
                  <WeatherScene condition={cond} isDay={getCityIsDay(weather)} />

                  <div className="header-top" style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <span className="city-name" style={{ fontSize: '20px', fontWeight: 700 }}>{weather.city}</span>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '40px' }}>
                      <span className="temp-text" style={{ fontSize: '24px', fontWeight: 700 }}>{Math.round(weather.temperature)}°C</span>
                      <span className="humidity-text" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px', fontWeight: 500 }}>
                        Humidity {weather.humidity}%
                      </span>
                    </div>
                  </div>
                  <div className="header-bottom" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', gap: '0.5rem' }}>
                    <span className={`condition-badge badge-${cond}`}>
                      {cond}
                    </span>
                    {/* Reason text below the badge */}
                    <div className="city-reason-text-new" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', textAlign: 'left', lineHeight: '1.35', fontWeight: 400 }}>
                      {reasonText}
                    </div>
                  </div>
                </div>

                {/* Body - 3 Line Items */}
                <div className="card-body" style={{ padding: 0 }}>
                  {cityItems.map((item) => (
                    <div key={item.id} className={`line-item-row ${item.state === 'active' ? `active-row active-${cond}` : ''}`}>
                      <div className="line-item-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ImageThumbnail creativeName={item.creative_name} conditionTrigger={item.condition_trigger} />
                        <span className="creative-name" style={{ fontSize: '14px', color: '#374151', fontWeight: 400 }}>{item.creative_name}</span>
                      </div>
                      <span className={`status-pill ${item.state}`}>
                        {item.state}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Recent Activity Log */}
        <section id="recent-activity" className="activity-section">
          <div className="activity-header" style={{ padding: '20px 24px 12px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <h2 className="activity-title" style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111827' }}>Recent Activity</h2>
              <button className="view-all-link" onClick={() => setShowAllLogs(!showAllLogs)} style={{ fontSize: '14px', fontWeight: 600, color: '#2D2D8F', cursor: 'pointer' }}>
                <span>{showAllLogs ? 'Show Less' : 'View All Activity →'}</span>
              </button>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              {changesTodayCount} state changes today
            </div>
          </div>
          
          <div className="header-divider"></div>

          <div className="activity-list">
            {transitionLogs.length === 0 ? (
              <div className="activity-empty-state">
                <Clock size={16} className="empty-icon" />
                <span>No activity yet — waiting for first weather cycle</span>
              </div>
            ) : (
              (showAllLogs ? transitionLogs : transitionLogs.slice(0, 8)).map((log) => (
                <div key={log.id} className="activity-row">
                  {/* Col 1: Left accent bar */}
                  <div className={`activity-left-accent ${getLogAccentClass(log)}`}></div>
                  
                  {/* Col 2: Spacer */}
                  <div></div>
                  
                  {/* Col 3: City name */}
                  <span className="activity-city-name">{log.city}</span>
                  
                  {/* Col 4: Timestamp */}
                  <span className="activity-timestamp">{formatTime(log.created_at)}</span>
                  
                  {/* Col 5: Creative name + arrow + state */}
                  <div className="activity-creative-flow">
                    <span className="activity-creative-name">{log.creative_name}</span>
                    <span className="activity-flow-arrow">→</span>
                    <span className={`activity-state-label state-${log.new_state}`}>
                      {log.new_state === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  
                  {/* Col 6: Reason text */}
                  <span className="activity-reason-text">{log.reason}</span>
                  
                  {/* Col 7: Trigger pill */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className={`trigger-tag tag-${log.triggered_by || 'system'}`}>
                      {log.triggered_by || 'system'}
                    </span>
                  </div>
                  
                  {/* Col 8: Spacer */}
                  <div></div>
                </div>
              ))
            )}
          </div>

          {transitionLogs.length > 0 && (
            <>
              <div className="activity-footer-divider"></div>
              <div className="activity-footer">
                <span className="footer-text">
                  Showing {Math.min(showAllLogs ? transitionLogs.length : 8, transitionLogs.length)} of {transitionLogs.length} total events
                </span>
                {!showAllLogs && transitionLogs.length > 8 && (
                  <button className="btn-load-more" onClick={() => setShowAllLogs(true)}>
                    Load More
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* New Campaign Modal */}
      {isNewCampaignOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-close" onClick={() => setIsNewCampaignOpen(false)}>
              <X size={14} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div className="modal-illustration">
                <Rocket size={48} style={{ color: '#2D2D8F' }} />
              </div>
              <h2 className="modal-title" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                Coming Soon
              </h2>
              <p className="modal-desc" style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
                This feature is coming soon. DynaMo will support multiple brand campaigns and automated custom triggers in the next release.
              </p>
              <button className="btn-notify-me" onClick={() => { alert('Thank you! We will notify you when this feature launches.'); setIsNewCampaignOpen(false); }}>
                Notify me
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
