import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Sun, 
  CloudRain, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { StudyLocation } from '../types/nasa';
import { fetchGlobalForecast, GlobalForecastData, CurrentWeatherState } from '../services/openMeteoService';

interface DatePredictionViewProps {
  currentLocation: StudyLocation;
  data: any[];
  statistics: any;
  onOpenReportModal: () => void;
}

export const DatePredictionView: React.FC<DatePredictionViewProps> = ({
  currentLocation,
  data,
  statistics,
  onOpenReportModal,
}) => {
  const [forecastDays, setForecastDays] = useState<number>(14);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [forecastData, setForecastData] = useState<GlobalForecastData | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchGlobalForecast(currentLocation.latitude, currentLocation.longitude);
        if (!cancelled) {
          setForecastData(res.forecast);
          setCurrentWeather(res.current);
        }
      } catch (e) {
        console.error('Forecast retrieval error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [currentLocation.latitude, currentLocation.longitude]);

  // Daily records list
  const dailyTimeline = useMemo(() => {
    if (!forecastData || !forecastData.time) return [];
    return forecastData.time.slice(0, forecastDays).map((dateStr, i) => {
      const tMax = forecastData.temperature_2m_max[i] ?? 32;
      const tMin = forecastData.temperature_2m_min[i] ?? 20;
      const rainMm = forecastData.precipitation[i] ?? 0;
      const rainProb = forecastData.precipitation_probability[i] ?? 10;
      const windSpeed = forecastData.windspeed_10m[i] ?? 12;
      const et0 = forecastData.et0_fao_evapotranspiration[i] ?? 4.8;
      const uv = forecastData.uv_index_max[i] ?? 6;

      // Agronomic risk indicators
      const isExcessiveHeat = tMax >= 38.0;
      const isHighRainRisk = rainProb >= 60 || rainMm >= 15.0;
      const isSprayingSafe = windSpeed <= 14 && rainProb < 35;
      const isIrrigationRequired = rainMm < 2.0 && et0 >= 4.0;

      return {
        dateStr,
        dayName: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        tMax,
        tMin,
        tMean: Number(((tMax + tMin) / 2).toFixed(1)),
        rainMm,
        rainProb,
        windSpeed,
        et0,
        uv,
        isExcessiveHeat,
        isHighRainRisk,
        isSprayingSafe,
        isIrrigationRequired,
      };
    });
  }, [forecastData, forecastDays]);

  const activeDay = dailyTimeline[selectedDayIndex] || dailyTimeline[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 text-blue-900 font-bold text-xs uppercase font-mono tracking-wider">
              14-Day Numerical Prediction Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">ECMWF IFS & NOAA GFS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Agricultural Forecast & Advisory: <span className="text-blue-900">{currentLocation.name}</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            Date-specific weather probabilities, FAO-56 crop water demand, thermal stress, and field operation safety windows.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-100 text-xs font-semibold">
            {[7, 14].map((days) => (
              <button
                key={days}
                onClick={() => setForecastDays(days)}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  forecastDays === days
                    ? 'bg-white text-blue-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors cursor-pointer shadow-sm"
          >
            Export Forecast
          </button>
        </div>
      </div>

      {/* Horizontal Interactive Calendar Scrubber */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-blue-700" />
            <span>Select Date to Inspect Conditions</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Click any day box below to view detailed hourly breakdown
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 overflow-x-auto pb-1">
          {dailyTimeline.map((item, idx) => {
            const isSelected = idx === selectedDayIndex;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className={`text-[10px] uppercase font-bold ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                    {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : item.dayName.split(',')[0]}
                  </div>
                  <div className="text-xs font-bold mt-0.5 truncate">{item.dayName}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-base font-extrabold font-mono leading-none">
                    {Math.round(item.tMax)}° <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-300' : 'text-slate-400'}`}>{Math.round(item.tMin)}°</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={item.rainProb > 40 ? (isSelected ? 'text-blue-200 font-bold' : 'text-blue-700 font-bold') : isSelected ? 'text-slate-300' : 'text-slate-500'}>
                      💧 {item.rainProb}%
                    </span>
                    <span className={isSelected ? 'text-blue-200' : 'text-slate-500'}>
                      {item.rainMm > 0 ? `${item.rainMm.toFixed(1)}mm` : 'Dry'}
                    </span>
                  </div>
                </div>

                {/* Status Dot */}
                <div className="pt-1 border-t border-slate-200/40 flex items-center gap-1 text-[9px] font-semibold">
                  {item.isExcessiveHeat ? (
                    <span className={`flex items-center gap-0.5 ${isSelected ? 'text-amber-300' : 'text-amber-700'}`}>
                      <AlertTriangle className="w-2.5 h-2.5" /> Heat
                    </span>
                  ) : item.isHighRainRisk ? (
                    <span className={`flex items-center gap-0.5 ${isSelected ? 'text-blue-300' : 'text-blue-700'}`}>
                      <CloudRain className="w-2.5 h-2.5" /> Rain
                    </span>
                  ) : (
                    <span className={`flex items-center gap-0.5 ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      <CheckCircle2 className="w-2.5 h-2.5" /> Optimal
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day In-Depth Investigation Panel */}
      {activeDay && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Key Parameters for Chosen Day */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-700 uppercase font-bold">Selected Date Target</span>
                <h3 className="text-base font-bold text-slate-900">{activeDay.dayName}</h3>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                {selectedDayIndex === 0 ? 'Today' : `Day +${selectedDayIndex}`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Day Peak (Tmax)</span>
                <span className="text-xl font-extrabold font-mono text-slate-900">{activeDay.tMax}°C</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Min: {activeDay.tMin}°C</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Rain Probability</span>
                <span className="text-xl font-extrabold font-mono text-blue-800">{activeDay.rainProb}%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Vol: {activeDay.rainMm.toFixed(1)} mm</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Evapotranspiration</span>
                <span className="text-xl font-extrabold font-mono text-teal-800">{activeDay.et0.toFixed(1)} mm</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">FAO-56 reference</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Max Wind Gust</span>
                <span className="text-xl font-extrabold font-mono text-slate-900">{activeDay.windSpeed} km/h</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">10m AGL vector</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-900">Forecast Uncertainty & Model Boundaries:</div>
              <p className="text-[11px] leading-relaxed">
                Short-term forecasts (Days 1–3) carry &gt;85% skill score. Predictions beyond Day 7 are ensemble probabilistic tendencies and should be rechecked before major financial or planting commitments.
              </p>
            </div>
          </div>

          {/* Right 2 Columns: Practical Agronomic Field Operations Advice */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-700" />
              <span>Agronomic Field Operations Feasibility for {activeDay.dayName}</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Irrigation Advice */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                activeDay.isIrrigationRequired
                  ? 'bg-blue-50/50 border-blue-200 text-blue-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <Droplets className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">
                    {activeDay.isIrrigationRequired ? 'Irrigation Recommended' : 'Irrigation Likely Postponable'}
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Atmospheric water demand is {activeDay.et0.toFixed(1)} mm with {activeDay.rainMm.toFixed(1)} mm expected precipitation. 
                    {activeDay.isIrrigationRequired
                      ? ' High evaporative draw will deplete topsoil moisture. Run scheduled drip cycles in early morning.'
                      : ' Expected rainfall will satisfy near-surface moisture. Check soil tensiometer before pumping.'}
                  </p>
                </div>
              </div>

              {/* Chemical / Bio-Spray Window */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                activeDay.isSprayingSafe
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/50 border-amber-200 text-amber-950'
              }`}>
                <Sun className={`w-5 h-5 shrink-0 mt-0.5 ${activeDay.isSprayingSafe ? 'text-emerald-700' : 'text-amber-700'}`} />
                <div>
                  <div className="font-bold text-sm">
                    {activeDay.isSprayingSafe ? 'Favorable Spraying Window' : 'Exercise Caution When Spraying'}
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Wind speed at {activeDay.windSpeed} km/h and rain probability at {activeDay.rainProb}%. 
                    {activeDay.isSprayingSafe
                      ? ' Calm morning winds reduce drift hazard. Foliar nutrients or registered biological pest controls can be safely applied.'
                      : ' Higher wind speeds increase chemical drift risk onto non-target crops and nearby water bodies.'}
                  </p>
                </div>
              </div>

              {/* Thermal Exposure & Sowing Feasibility */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                activeDay.isExcessiveHeat
                  ? 'bg-red-50/50 border-red-200 text-red-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${activeDay.isExcessiveHeat ? 'text-red-700' : 'text-slate-600'}`} />
                <div>
                  <div className="font-bold text-sm">
                    {activeDay.isExcessiveHeat ? 'Extreme Thermal Exposure Alert' : 'Normal Temperature Range'}
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Peak daytime temperature reaching {activeDay.tMax}°C. 
                    {activeDay.isExcessiveHeat
                      ? ' Anthesis and pollen fertility in wheat, pulses, and vegetables are at severe risk. Ensure canopy cooling and adequate soil hydration.'
                      : ' Temperatures remain well within safe physiological boundaries for active vegetative growth.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
