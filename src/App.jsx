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
  Moon,
  CloudSun,
  Clock,
  Zap,
  Rocket,
  Settings,
  HelpCircle,
  Cloud,
  Info,
  PlayCircle
} from 'lucide-react';

function getHeaderBgColor(condition, isDay) {
  const cond = condition ? String(condition).toLowerCase().trim() : 'normal';
  const day = isDay === 1 || isDay === true || String(isDay) === '1' || String(isDay) === 'true';

  if (cond === 'hot') return '#B45309';
  if (cond === 'rainy') return day ? '#1D4ED8' : '#1E3A5F';
  return day ? '#065F46' : '#1B2B4B';
}

const WEATHER_IMAGES = {
  Mumbai: {
    hot: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/mumbai-hot.jpg',
    rainy: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/mumbai-rainy.jpg',
    normal: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/mumbai-normal.jpg'
  },
  Delhi: {
    hot: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/delhi-hot.jpg',
    rainy: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/delhi-rainy.jpg',
    normal: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/delhi-normal.jpg'
  },
  Bangalore: {
    hot: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/bangalore-hot.jpg',
    rainy: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/bangalore-rainy.jpg',
    normal: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/bangalore-normal.jpg'
  },
  Chennai: {
    hot: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/chennai-hot.jpg',
    rainy: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/chennai-rainy.jpg',
    normal: 'https://ik.imagekit.io/uwe3xp8ma/DynaMo/chennai-normal.jpg'
  }
};

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
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [lastSyncedTimeAgo, setLastSyncedTimeAgo] = useState('never');
  const [lastOpenedNotificationsAt, setLastOpenedNotificationsAt] = useState(0);
  
  // Error/loading states
  const [isInitialized, setIsInitialized] = useState(false);
  const [supabaseError, setSupabaseError] = useState(false);
  const [apiErrorBanner, setApiErrorBanner] = useState(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (isInitialized) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % 3);
    }, 800);
    return () => clearInterval(interval);
  }, [isInitialized]);
  
  // Demo Mode state
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dynamo_theme');
    return saved !== 'light'; // default to true (dark)
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('dynamo_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

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
      { id: 1, city: 'Mumbai', creative_name: 'Rainy Day Pick-me-up', condition: 'rainy', old_state: 'paused', new_state: 'active', reason: 'Precipitation detected: 0.3mm in last 15 minutes', triggered_by: 'system', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: 2, city: 'Chennai', creative_name: 'Beat the Heat', condition: 'hot', old_state: 'paused', new_state: 'active', reason: 'Temperature rose to 36.5°C, above 35°C threshold', triggered_by: 'system', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: 3, city: 'Delhi', creative_name: 'Refresh Anytime', condition: 'normal', old_state: 'paused', new_state: 'active', reason: 'Conditions normal — temp 31.6°C, no precipitation detected', triggered_by: 'system', created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
      { id: 4, city: 'Bangalore', creative_name: 'Refresh Anytime', condition: 'normal', old_state: 'paused', new_state: 'active', reason: 'Conditions normal — temp 21.3°C, no precipitation detected', triggered_by: 'system', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
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
        const cityItems = updatedItems.filter(item => item.city === weather.city);
        
        // Find creative for target condition
        const activeCreative = cityItems.find(item => item.condition_trigger === targetCondition);
        if (!activeCreative) continue;

        if (activeCreative.state === 'active') {
          // No change case
          newLogs.push({
            id: Date.now() + Math.random(),
            city: weather.city,
            creative_name: activeCreative.creative_name,
            condition: targetCondition,
            old_state: 'active',
            new_state: 'active',
            reason: `No change — condition remains ${targetCondition} (${weather.temperature}°C)`,
            triggered_by: triggeredBy,
            created_at: new Date().toISOString()
          });
        } else {
          // Change case
          for (let j = 0; j < updatedItems.length; j++) {
            const item = updatedItems[j];
            if (item.city === weather.city) {
              const expectedState = item.id === activeCreative.id ? 'active' : 'paused';
              updatedItems[j] = { ...item, state: expectedState };
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

          newLogs.push({
            id: Date.now() + Math.random(),
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

  const getLogCondition = (log) => {
    if (log.condition) return log.condition;
    if (log.creative_name === 'Beat the Heat') return 'hot';
    if (log.creative_name === 'Rainy Day Pick-me-up') return 'rainy';
    return 'normal';
  };

  const getLogBorderColor = (log) => {
    if (log.old_state === 'active' && log.new_state === 'active') {
      return isDarkMode ? '#30363D' : '#D0D7DE'; // grey (no change)
    }
    const cond = getLogCondition(log).toLowerCase().trim();
    if (cond === 'hot') return '#F97316'; // hot
    if (cond === 'rainy') return '#3B82F6'; // rainy
    return '#22C55E'; // normal
  };

  const renderConditionBadge = (log) => {
    const cond = getLogCondition(log).toUpperCase().trim();
    let bg = '#D1FAE5';
    let text = '#10B981';
    if (cond === 'HOT') {
      bg = '#FEF3C7';
      text = '#D97706';
    } else if (cond === 'RAINY') {
      bg = '#DBEAFE';
      text = '#2563EB';
    }
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: bg,
        color: text,
        textAlign: 'center',
        width: '65px',
        boxSizing: 'border-box'
      }}>{cond}</span>
    );
  };

  const renderTriggerBadge = (triggeredBy) => {
    const isManual = String(triggeredBy || 'system').toLowerCase() === 'manual';
    return (
      <span style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: isManual ? '#2563EB' : (isDarkMode ? '#374151' : '#F3F4F6'),
        color: isManual ? '#FFFFFF' : (isDarkMode ? '#9CA3AF' : '#6B7280'),
        textAlign: 'center',
        width: '65px',
        boxSizing: 'border-box'
      }}>{isManual ? 'Manual' : 'System'}</span>
    );
  };

  // Filtered cities list (sorted in a fixed order: Mumbai, Delhi, Bangalore, Chennai)
  const CITY_ORDER = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
  const filteredWeather = (activeTab === 'All Cities' 
    ? weatherCache 
    : weatherCache.filter(w => w.city === activeTab))
    .slice()
    .sort((a, b) => CITY_ORDER.indexOf(a.city) - CITY_ORDER.indexOf(b.city));

  // Filter out any "paused" transition logs from the old format,
  // showing only the row that activated the new creative, or new format status entries.
  const activeLogs = transitionLogs.filter(log => log.new_state === 'active');

  // Compute stat card metrics
  const activeLineItemsCount = lineItems.filter(item => item.state === 'active').length;
  const changesTodayCount = activeLogs.filter(log => {
    const logDate = new Date(log.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const todayDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    return logDate === todayDate;
  }).length;

  // Compute unread notifications count
  const unreadCount = activeLogs.filter(
    log => new Date(log.created_at).getTime() > lastOpenedNotificationsAt
  ).length;

  // Compute today's logs by condition type for summary pills
  const todayLogs = activeLogs.filter(log => {
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

  // Supabase loading screen
  if (!isInitialized) {
    const loadingMessages = [
      "Fetching live weather across 4 cities...",
      "Evaluating campaign conditions...",
      "Loading your dashboard..."
    ];
    return (
      <div className="premium-loading-container">
        <div className="premium-loading-content">
          <div className="premium-loading-logo">
            DynaMo
            <span className="premium-loading-logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          
          <div className="premium-loading-bar-bg">
            <div className="premium-loading-bar-fill"></div>
          </div>
          
          <div className="premium-loading-text">
            {loadingMessages[loadingMsgIndex]}
          </div>
        </div>
        
        <div className="premium-loading-footer">
          A YOptima Product
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
        <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="logo" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--logo-text-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', letterSpacing: '-0.025em' }}>
            DynaMo
            <span className="logo-icon" style={{ color: '#22C55E', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </span>
          <span className="nav-separator" style={{ color: 'var(--border-light)', fontSize: '18px', fontWeight: 300 }}>/</span>
          <div className="campaign-pill">
            <GlassWater size={13} style={{ color: 'var(--campaign-pill-icon-color)' }} />
            <span>CoolSip — Summer 2026</span>
            <ChevronDown size={12} style={{ color: 'var(--navbar-icon-color)' }} />
          </div>
        </div>

        <div className="nav-right">
          {/* Apps Grid Button */}
          <button 
            className="navbar-icon-btn" 
            onClick={() => setIsNewCampaignOpen(true)}
            title="DynaMo Platform"
            aria-label="DynaMo Platform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>

          {/* Info Button */}
          <button 
            className="navbar-icon-btn" 
            onClick={() => setIsInfoModalOpen(true)}
            title="How DynaMo Works"
            aria-label="How DynaMo Works"
          >
            <Info size={20} />
          </button>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="navbar-icon-btn"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Button */}
          <button 
            className="navbar-icon-btn" 
            onClick={(e) => { e.stopPropagation(); setIsUserDropdownOpen(!isUserDropdownOpen); }}
            title="User Profile"
            aria-label="User Profile"
          >
            <User size={20} />
          </button>

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
              <span className="stat-label">Ads running</span>
              <span className="stat-value">{activeLineItemsCount}</span>
            </div>
            <div className="stat-icon-monochrome">
              <PlayCircle size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-left">
              <span className="stat-label">Cities live</span>
              <span className="stat-value">4</span>
            </div>
            <div className="stat-icon-monochrome">
              <MapPin size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-left">
              <span className="stat-label">Switches today</span>
              <span className="stat-value">{changesTodayCount}</span>
            </div>
            <div className="stat-icon-monochrome">
              <RefreshCw size={22} />
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
            <div className="stat-right-action" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
              <div className="stat-icon-monochrome">
                <Clock size={22} />
              </div>
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
                <div 
                  className="card-header" 
                  style={{ 
                    height: '160px', 
                    padding: '20px', 
                    boxSizing: 'border-box', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.15)), url(${WEATHER_IMAGES[weather.city]?.[cond] || (WEATHER_IMAGES[weather.city] ? WEATHER_IMAGES[weather.city].normal : '')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <div className="header-top" style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <span className="city-name" style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>{weather.city}</span>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '40px' }}>
                      <span className="temp-text" style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{Math.round(weather.temperature)}°C</span>
                      <span className="humidity-text" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', marginTop: '2px', fontWeight: 500 }}>
                        Humidity {weather.humidity}%
                      </span>
                    </div>
                  </div>
                  <div className="header-bottom" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', gap: '0.5rem' }}>
                    <span className={`condition-badge badge-${cond}`}>
                      {cond}
                    </span>
                    {/* Reason text below the badge */}
                    <div className="city-reason-text-new" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', textAlign: 'left', lineHeight: '1.35', fontWeight: 400 }}>
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
                        <span className="creative-name">{item.creative_name}</span>
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
              <button className="view-all-link" onClick={() => setShowAllLogs(!showAllLogs)} style={{ fontSize: '14px', fontWeight: 600, color: '#2563EB', cursor: 'pointer' }}>
                <span>{showAllLogs ? 'Show Less' : 'View All Activity →'}</span>
              </button>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              {changesTodayCount} state changes today
            </div>
          </div>
          
          <div className="activity-list">
            {activeLogs.length === 0 ? (
              <div className="activity-empty-state">
                <Clock size={16} className="empty-icon" />
                <span>No activity yet — waiting for first weather cycle</span>
              </div>
            ) : (
              (showAllLogs ? activeLogs : activeLogs.slice(0, 8)).map((log) => (
                <div 
                  key={log.id} 
                  className="activity-row"
                  style={{ borderLeft: `4px solid ${getLogBorderColor(log)}` }}
                >
                  <span className="activity-city-name">{log.city}</span>
                  <span className="activity-timestamp">{formatTime(log.created_at)}</span>
                  <div className="activity-condition-badge-wrapper">
                    {renderConditionBadge(log)}
                  </div>
                  <div className="activity-creative-flow">
                    Ad running now: <strong>{log.creative_name}</strong>
                  </div>
                  <span className="activity-reason-text" title={log.reason}>
                    {log.reason}
                  </span>
                  <div className="activity-trigger-wrapper">
                    {renderTriggerBadge(log.triggered_by)}
                  </div>
                </div>
              ))
            )}
          </div>

          {activeLogs.length > 0 && (
            <>
              <div className="activity-footer-divider"></div>
              <div className="activity-footer">
                <span className="footer-text">
                  Showing {Math.min(showAllLogs ? activeLogs.length : 8, activeLogs.length)} of {activeLogs.length} total events
                </span>
                {!showAllLogs && activeLogs.length > 8 && (
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
        <div className="modal-overlay" onClick={() => setIsNewCampaignOpen(false)}>
          <div className="platform-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="platform-close-btn" onClick={() => setIsNewCampaignOpen(false)} aria-label="Close modal">
              <X size={18} />
            </button>
            
            <div className="platform-header">
              <h2 className="platform-title">DynaMo Platform</h2>
              <p className="platform-subtitle">
                Everything your campaign stack needs — built for real-time, context-aware advertising
              </p>
              <div className="platform-status-bar">
                <span>Weather Triggers</span>
                <span className="badge-live-green">Live</span>
              </div>
            </div>
            
            <div className="platform-divider"></div>
            
            <div className="platform-modal-body">
              <div className="platform-grid">
                {[
                  {
                    icon: '📋',
                    title: 'Campaign Builder',
                    description: 'Launch a new brand campaign with custom creatives, cities, triggers and budgets. Multi-brand support with isolated workspaces.',
                    badge: 'Coming Soon',
                    type: 'coming-soon'
                  },
                  {
                    icon: '⚡',
                    title: 'Trigger Builder',
                    description: 'Build any trigger rule without code — weather, cricket scores, AQI, Nifty movements, traffic congestion, time of day.',
                    badge: 'Coming Soon',
                    type: 'coming-soon'
                  },
                  {
                    icon: '💰',
                    title: 'Budget Manager',
                    description: 'Set daily spend caps per line item, auto-pause at limits, pace budgets across dayparts, get alerts at 80% spend.',
                    badge: 'Coming Soon',
                    type: 'coming-soon'
                  },
                  {
                    icon: '🎛',
                    title: 'Manual Override',
                    description: 'Force activate or pause any line item instantly. Add a reason, set an expiry time. Full audit trail maintained.',
                    badge: 'Coming Soon',
                    type: 'coming-soon'
                  },
                  {
                    icon: '🔔',
                    title: 'Alert Center',
                    description: 'WhatsApp and email alerts when conditions change, budgets hit limits, APIs fail, or creatives have been paused too long.',
                    badge: 'Coming Soon',
                    type: 'coming-soon'
                  },
                  {
                    icon: '📊',
                    title: 'Analytics',
                    description: 'How long each creative ran, condition frequency per city, impression estimates, cost per condition, campaign ROI.',
                    badge: 'Coming Soon',
                    type: 'coming-soon'
                  },
                  {
                    icon: '🎨',
                    title: 'Creative Library',
                    description: 'Upload and manage ad creatives directly in DynaMo. Tag each creative with trigger conditions. Preview before going live.',
                    badge: 'Coming Soon',
                    type: 'coming-soon'
                  },
                  {
                    icon: '👥',
                    title: 'Team Access',
                    description: 'Invite team members with role-based permissions. CMO gets read-only view. Campaign managers get edit access. Full SSO support.',
                    badge: 'Coming Soon',
                    type: 'coming-soon'
                  },
                  {
                    icon: '🔗',
                    title: 'API & Webhooks',
                    description: 'Connect DynaMo to Google Ads, Meta, DV360. Push state changes via webhooks to your existing ad stack in real time.',
                    badge: 'Coming Soon',
                    type: 'coming-soon'
                  }
                ].map((card, idx) => (
                  <div key={idx} className="platform-card">
                    <div>
                      <div className="platform-card-icon-wrapper icon-purple">
                        {card.icon}
                      </div>
                      <h3 className="platform-card-title">{card.title}</h3>
                      <p className="platform-card-desc">{card.description}</p>
                    </div>
                    <div className="platform-card-footer">
                      <span className="badge-coming-soon">{card.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="platform-modal-footer">
              <span>Have a feature request?</span>
              <a href="#" className="feedback-link" onClick={(e) => { e.preventDefault(); alert('Feedback workspace coming soon!'); }}>
                Share feedback →
              </a>
            </div>
          </div>
        </div>
      )}

      {isInfoModalOpen && (
        <div className="modal-overlay" onClick={() => setIsInfoModalOpen(false)}>
          <div className="how-it-works-modal" onClick={(e) => e.stopPropagation()}>
            <button className="how-it-works-close-btn" onClick={() => setIsInfoModalOpen(false)} aria-label="Close modal">
              <X size={18} />
            </button>
            
            <div className="how-header">
              <h2 className="how-modal-title">How DynaMo Works</h2>
            </div>
            
            <div className="how-it-works-content">
              {/* Section 1 */}
              <div className="how-section">
                <h3 className="how-heading">What is DynaMo?</h3>
                <p className="how-text">
                  DynaMo is a context-aware ad campaign manager. It automatically activates and pauses ad creatives based on real-world conditions — starting with live weather data across Indian cities.
                </p>
              </div>
              
              <div className="how-divider"></div>
              
              {/* Section 2 */}
              <div className="how-section">
                <h3 className="how-heading">The Current Campaign</h3>
                <p className="how-text" style={{ marginBottom: '4px' }}>
                  CoolSip is running a summer campaign across Mumbai, Delhi, Bangalore and Chennai with 3 creatives.
                </p>
                <div className="creative-list-info">
                  <div className="creative-info-item">
                    <img src="https://ik.imagekit.io/uwe3xp8ma/DynaMo/ChatGPT%20Image%20Jun%2025,%202026,%2002_19_38%20AM.png" alt="Beat the Heat" className="creative-info-img" />
                    <span className="creative-info-desc"><strong>Beat the Heat</strong> — activates when temperature ≥ 35°C</span>
                  </div>
                  <div className="creative-info-item">
                    <img src="https://ik.imagekit.io/uwe3xp8ma/DynaMo/Rainy%20Day%20Pick-me-up%20creative" alt="Rainy Day Pick-me-up" className="creative-info-img" />
                    <span className="creative-info-desc"><strong>Rainy Day Pick-me-up</strong> — activates when rain is detected</span>
                  </div>
                  <div className="creative-info-item">
                    <img src="https://ik.imagekit.io/uwe3xp8ma/DynaMo/Refresh%20Anytime%20creative" alt="Refresh Anytime" className="creative-info-img" />
                    <span className="creative-info-desc"><strong>Refresh Anytime</strong> — activates during normal conditions</span>
                  </div>
                </div>
              </div>
              
              <div className="how-divider"></div>
              
              {/* Section 3 */}
              <div className="how-section">
                <h3 className="how-heading">How the system works</h3>
                <div className="flow-diagram">
                  <div className="flow-step">Open-Meteo API</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">Weather Data</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">Decision Engine</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">Line Item Update</div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">Dashboard</div>
                </div>
              </div>
              
              <div className="how-divider"></div>
              
              {/* Section 4 */}
              <div className="how-section">
                <h3 className="how-heading">Update Frequency</h3>
                <ul className="how-list">
                  <li>Weather data refreshes every 15 minutes automatically via server-side <code>pg_cron</code> scheduler.</li>
                  <li>Manual refresh available anytime via the ↻ refresh button.</li>
                  <li>All state changes logged with timestamp, reason, and trigger source.</li>
                </ul>
              </div>
              
              <div className="how-divider"></div>
              
              {/* Section 5 */}
              <div className="how-section">
                <h3 className="how-heading">Data Sources</h3>
                <div className="sources-grid">
                  <div className="source-item">
                    <strong>Weather:</strong>
                    <span>Open-Meteo API — free, no API key, global coverage</span>
                  </div>
                  <div className="source-item">
                    <strong>Database:</strong>
                    <span>Supabase PostgreSQL</span>
                  </div>
                  <div className="source-item">
                    <strong>Scheduler:</strong>
                    <span>Supabase pg_cron + Edge Functions</span>
                  </div>
                  <div className="source-item">
                    <strong>Frontend:</strong>
                    <span>React deployed on Vercel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
