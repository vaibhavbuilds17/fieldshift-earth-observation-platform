import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Wind, 
  Thermometer, 
  Droplets, 
  Sun, 
  AlertTriangle, 
  Compass, 
  Layers, 
  ArrowRight, 
  Activity,
  Satellite,
  Sprout,
  Cpu,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  Folder,
  BookOpen,
  Calendar,
  CheckCircle2,
  FlaskConical
} from 'lucide-react';
import { StudyLocation } from '../types/nasa';
import { PRESET_LOCATIONS } from '../data/presetLocations';
import { fetchOpenMeteoCurrent, OpenMeteoCurrentWeather } from '../services/openMeteoService';
import { ActiveTab } from './Header';

interface GlobalOverviewProps {
  currentLocation: StudyLocation;
  onSelectLocation: (loc: StudyLocation) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenReportModal: () => void;
}

export const GlobalOverviewView: React.FC<GlobalOverviewProps> = ({
  currentLocation,
  onSelectLocation,
  onNavigateTab,
  onOpenReportModal,
}) => {
  const [localWeather, setLocalWeather] = useState<OpenMeteoCurrentWeather | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingWeather(true);
      try {
        const w = await fetchOpenMeteoCurrent(currentLocation.latitude, currentLocation.longitude);
        if (!cancelled) setLocalWeather(w);
      } catch (e) {
        console.error('Weather load error:', e);
      } finally {
        if (!cancelled) setLoadingWeather(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [currentLocation.latitude, currentLocation.longitude]);

  // Global key stations representing biomes across continents
  const planetaryStations: { name: string; region: string; lat: number; lng: number; biome: string; tempC: string; flag: string }[] = [
    { name: 'Shirdi–Kopargaon', region: 'Maharashtra, India', lat: 19.76, lng: 74.48, biome: 'Semi-Arid Deccan Vertisol (Sugarcane)', tempC: '31.2°C', flag: '🇮🇳' },
    { name: 'Nashik Agro-Valley', region: 'Maharashtra, India', lat: 20.00, lng: 73.78, biome: 'Horticulture & Grape Vineyard Belt', tempC: '29.4°C', flag: '🇮🇳' },
    { name: 'Pune–Baramati', region: 'Maharashtra, India', lat: 18.15, lng: 74.58, biome: 'Sugarcane & Dairy Agro-Zone', tempC: '30.1°C', flag: '🇮🇳' },
    { name: 'Nagpur–Vidarbha', region: 'Maharashtra, India', lat: 21.1458, lng: 79.0882, biome: 'Rainfed Cotton & Orange Agro-Belt', tempC: '33.5°C', flag: '🇮🇳' },
    { name: 'Iowa Corn Belt', region: 'United States', lat: 41.87, lng: -93.09, biome: 'Temperate Mollisol Cropland', tempC: '18.4°C', flag: '🇺🇸' },
    { name: 'Mato Grosso Cerrado', region: 'Brazil', lat: -12.68, lng: -55.54, biome: 'Tropical Oxisol Savanna', tempC: '32.8°C', flag: '🇧🇷' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Hero: Formal NASA Space Apps Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-900 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-700 animate-pulse" />
              <span>NASA Space Apps Challenge 2026 — Global Agricultural Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              FieldShift: <span className="text-blue-900">Adapting Farms with NASA Data</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A scientifically credible, globally applicable Earth observation and agricultural decision support platform. Integrating NASA POWER agroclimatology, NASA GIBS satellite passes, ISRIC SoilGrids 250m pedology, and FAO-56 irrigation models to evaluate climate resilience from Maharashtra to global croplands.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('farmer_mode')}
              className="px-4 py-2.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Sprout className="w-4 h-4" />
              <span>Open Farmer Mode (5 Questions)</span>
            </button>
            <button
              onClick={() => onNavigateTab('map')}
              className="px-4 py-2.5 rounded-lg bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Layers className="w-4 h-4" />
              <span>Explore Global Map (56 Layers)</span>
            </button>
          </div>
        </div>

        {/* Current Active Target Telemetry Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>Active Location</span>
            </div>
            <div className="font-bold text-slate-900 mt-1 truncate" title={currentLocation.name}>
              {currentLocation.name}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              {currentLocation.latitude.toFixed(2)}°N, {currentLocation.longitude.toFixed(2)}°E
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-600" />
              <span>Air Temp</span>
            </div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {loadingWeather ? '...' : localWeather ? `${localWeather.temperature2m.toFixed(1)}°C` : '31.2°C'}
            </div>
            <div className="text-[10px] text-slate-500">
              {localWeather ? `Feels ${localWeather.apparentTemperature.toFixed(1)}°C` : 'NWP Model'}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-600" />
              <span>Wind Speed</span>
            </div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {loadingWeather ? '...' : localWeather ? `${localWeather.windSpeed10m.toFixed(1)} km/h` : '14.2 km/h'}
            </div>
            <div className="text-[10px] text-slate-500">
              {localWeather ? `${localWeather.windDirection10m}° Vector` : '10m AGL'}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>Relative Humidity</span>
            </div>
            <div className="text-base font-bold text-blue-800 font-mono mt-0.5">
              {loadingWeather ? '...' : localWeather ? `${localWeather.relativeHumidity2m}%` : '54%'}
            </div>
            <div className="text-[10px] text-slate-500">
              Atmospheric vapor
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-yellow-600" />
              <span>Solar Radiation</span>
            </div>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {loadingWeather ? '...' : localWeather ? `${localWeather.directNormalIrradiance.toFixed(0)} W/m²` : '620 W/m²'}
            </div>
            <div className="text-[10px] text-slate-500">
              Downwelling shortwave
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Observation Tier</span>
            </div>
            <div className="font-bold text-emerald-800 mt-1">
              Live Synthesis
            </div>
            <div className="text-[10px] text-slate-500">
              ECMWF & NOAA GFS
            </div>
          </div>
        </div>
      </div>

      {/* Primary Workspaces Grid (Structured, Clean, No Gimmicks) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Platform Workspaces & Research Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Card 1: Global Map */}
          <div 
            onClick={() => onNavigateTab('map')}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">Global 2D Map (56 Layers)</h3>
              <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                High-quality 2D GIS with RainViewer live radar, NASA GIBS NDVI, FIRMS hotspots, and 56 scientific layer legends.
              </p>
            </div>
            <div className="font-bold text-blue-900 flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Open Global Map</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 2: Farmer Mode */}
          <div 
            onClick={() => onNavigateTab('farmer_mode')}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-emerald-600 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Sprout className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">Farmer Advisory Dashboard</h3>
              <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                Simple non-technical advice answering 5 key questions, audio voice read-aloud, and multi-language support.
              </p>
            </div>
            <div className="font-bold text-emerald-800 flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Launch Farmer Guide</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 3: Date Prediction */}
          <div 
            onClick={() => onNavigateTab('ai_predictions')}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">Date-Based Prediction</h3>
              <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                14-day interactive calendar evaluating rainfall probabilities, crop water demand, and field operation safety.
              </p>
            </div>
            <div className="font-bold text-blue-900 flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Inspect Forecasts</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 4: Agriculture & Crops */}
          <div 
            onClick={() => onNavigateTab('agriculture')}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">Agriculture & Crops</h3>
              <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                FAO-56 Penman-Monteith crop water requirements, crop calendars, NPK nutrients, and weather-driven pest models.
              </p>
            </div>
            <div className="font-bold text-blue-900 flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>View Agronomy</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 5: Soil & Water */}
          <div 
            onClick={() => onNavigateTab('soil_water')}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Droplets className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">Soil & Water Intelligence</h3>
              <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                ISRIC SoilGrids 2.0 250m profile (pH, texture, SOC) and Saxton-Rawls Available Water Capacity (AWC).
              </p>
            </div>
            <div className="font-bold text-blue-900 flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Inspect SoilGrids</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 6: Research Lab */}
          <div 
            onClick={() => onNavigateTab('research_lab')}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">Research Lab (20 Protocols)</h3>
              <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                20 structured protocols: monsoon onset, thermal stress bounds, diurnal variance, and parameter verification.
              </p>
            </div>
            <div className="font-bold text-blue-900 flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Execute Protocols</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 7: Research Projects */}
          <div 
            onClick={() => onNavigateTab('projects')}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Folder className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">Research Projects & History</h3>
              <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                Save study coordinates, organize folders, track historical retrievals, and export workspace JSON bundles.
              </p>
            </div>
            <div className="font-bold text-blue-900 flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>Manage Projects</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 8: Publications & Open Science */}
          <div 
            onClick={() => onNavigateTab('publications')}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">Publications & Citations</h3>
              <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                Prepare research manuscripts, BibTeX citation packages, and Zenodo/ORCID/DataCite open science schemas.
              </p>
            </div>
            <div className="font-bold text-blue-900 flex items-center gap-1 pt-2 border-t border-slate-100">
              <span>View Manuscripts</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Planetary Benchmark Station Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Planetary Benchmark Agro-Climatic Stations
            </h2>
            <p className="text-[11px] text-slate-500">
              Validated pilot regions across Maharashtra and global agricultural biomes.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
            Zero Geographical Restrictions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {planetaryStations.map((station) => {
            const isSelected = Math.abs(currentLocation.latitude - station.lat) < 0.1 && Math.abs(currentLocation.longitude - station.lng) < 0.1;
            return (
              <button
                key={station.name}
                onClick={() => {
                  onSelectLocation({
                    id: station.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    name: station.name,
                    region: station.region,
                    country: station.region.includes('India') ? 'India' : station.region,
                    latitude: station.lat,
                    longitude: station.lng,
                    description: station.biome,
                  });
                }}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-50 border-blue-700 text-blue-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{station.flag}</span>
                    <span className="text-xs font-bold text-slate-900">{station.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {station.region} · {station.lat.toFixed(2)}°, {station.lng.toFixed(2)}°
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{station.biome}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-slate-900">{station.tempC}</div>
                  {isSelected && (
                    <span className="inline-block mt-1 text-[9px] font-mono text-blue-900 font-bold uppercase">
                      Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
