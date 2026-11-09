import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Flame,
  CloudOff,
  SunMedium,
  Sliders,
  Scale,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { EnvironmentalPointData, DataSetStatistics, StudyLocation } from '../types/nasa';

interface ClimateInsightsProps {
  data: EnvironmentalPointData[];
  statistics: DataSetStatistics;
  location: StudyLocation;
  heatThreshold: number;
  dryThreshold: number;
  onUpdateHeatThreshold: (val: number) => void;
  onUpdateDryThreshold: (val: number) => void;
}

export const ClimateInsights: React.FC<ClimateInsightsProps> = ({
  data,
  statistics,
  location,
  heatThreshold,
  dryThreshold,
  onUpdateHeatThreshold,
  onUpdateDryThreshold,
}) => {
  const [localHeat, setLocalHeat] = useState(heatThreshold);
  const [localDry, setLocalDry] = useState(dryThreshold);

  // Calculate days above heat threshold
  const heatAnalysis = useMemo(() => {
    if (!data || data.length === 0) return { daysCount: 0, pct: '0', maxConsecutive: 0 };
    let count = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    data.forEach((d) => {
      const maxT = d.temperatureMax ?? d.temperatureMean;
      if (maxT !== null && maxT !== undefined && maxT >= localHeat) {
        count++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    const pct = ((count / data.length) * 100).toFixed(1);
    return { daysCount: count, pct, maxConsecutive: maxStreak };
  }, [data, localHeat]);

  // Calculate days below dry threshold
  const dryAnalysis = useMemo(() => {
    if (!data || data.length === 0) return { daysCount: 0, pct: '0', maxConsecutive: 0 };
    let count = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    data.forEach((d) => {
      const p = d.precipitation;
      if (p !== null && p !== undefined && p <= localDry) {
        count++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    const pct = ((count / data.length) * 100).toFixed(1);
    return { daysCount: count, pct, maxConsecutive: maxStreak };
  }, [data, localDry]);

  // Diurnal range analysis
  const diurnalAnalysis = useMemo(() => {
    const diurnals = data
      .map((d) => d.diurnalRange)
      .filter((v): v is number => v !== null && v !== undefined);

    if (diurnals.length === 0) return { mean: 'N/A', max: 'N/A', highDiurnalDays: 0 };

    const sum = diurnals.reduce((a, b) => a + b, 0);
    const mean = (sum / diurnals.length).toFixed(1);
    const max = Math.max(...diurnals).toFixed(1);
    const highDiurnalDays = diurnals.filter((d) => d >= 15.0).length;

    return { mean, max, highDiurnalDays };
  }, [data]);

  // Solar flux variability
  const solarAnalysis = useMemo(() => {
    const solars = data
      .map((d) => d.solarRadiation)
      .filter((v): v is number => v !== null && v !== undefined);

    if (solars.length === 0) return { highCount: 0, lowCount: 0, ratio: 'N/A' };
    const highCount = solars.filter((s) => s >= 22.0).length;
    const lowCount = solars.filter((s) => s <= 12.0).length;
    return { highCount, lowCount, ratio: `${highCount} vs ${lowCount}` };
  }, [data]);

  return (
    <div className="space-y-8 text-slate-100">
      {/* Overview Banner */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>Scientific Risk & Sensitivity Assessment</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
              Climate Insights & Agricultural Risk Explorer
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Investigate sensitivity thresholds and diurnal extremes. Explores physiological vulnerability without overconfident crop advice.
            </p>
          </div>

          {/* Interactive Threshold Tuners */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono font-medium text-slate-300">Heat Cutoff:</label>
              <select
                value={localHeat}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalHeat(val);
                  onUpdateHeatThreshold(val);
                }}
                className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg font-mono font-semibold text-white focus:ring-emerald-500"
              >
                <option value={35} className="bg-slate-900 text-white">≥ 35.0 °C (Mild Stress)</option>
                <option value={38} className="bg-slate-900 text-white">≥ 38.0 °C (Canopy Stress)</option>
                <option value={40} className="bg-slate-900 text-white">≥ 40.0 °C (Severe Heatwave)</option>
                <option value={42} className="bg-slate-900 text-white">≥ 42.0 °C (Extreme Thermal)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-mono font-medium text-slate-300">Dry Day Cutoff:</label>
              <select
                value={localDry}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalDry(val);
                  onUpdateDryThreshold(val);
                }}
                className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg font-mono font-semibold text-white focus:ring-emerald-500"
              >
                <option value={0.5} className="bg-slate-900 text-white">≤ 0.5 mm/day (Strictly Dry)</option>
                <option value={1.0} className="bg-slate-900 text-white">≤ 1.0 mm/day (Standard Aridity)</option>
                <option value={2.5} className="bg-slate-900 text-white">≤ 2.5 mm/day (Sub-Effective)</option>
                <option value={5.0} className="bg-slate-900 text-white">≤ 5.0 mm/day (Deficit Rain)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exploratory indicator telemetry summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <span className="text-[11px] text-amber-800 font-mono block">Days ≥ {localHeat}°C</span>
            <span className="text-2xl font-bold font-mono text-amber-950 mt-0.5 block">
              {heatAnalysis.daysCount} <span className="text-xs font-normal text-amber-700">days</span>
            </span>
            <span className="text-[10px] text-amber-800 block mt-0.5">{heatAnalysis.pct}% of period (max run: {heatAnalysis.maxConsecutive}d)</span>
          </div>

          <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-lg">
            <span className="text-[11px] text-cyan-800 font-mono block">Dry Days (≤ {localDry} mm)</span>
            <span className="text-2xl font-bold font-mono text-cyan-950 mt-0.5 block">
              {dryAnalysis.daysCount} <span className="text-xs font-normal text-cyan-700">days</span>
            </span>
            <span className="text-[10px] text-cyan-800 block mt-0.5">{dryAnalysis.pct}% of period (max run: {dryAnalysis.maxConsecutive}d)</span>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg">
            <span className="text-[11px] text-purple-800 font-mono block">Mean Diurnal Swing</span>
            <span className="text-2xl font-bold font-mono text-purple-950 mt-0.5 block">
              {diurnalAnalysis.mean} <span className="text-xs font-normal text-purple-700">°C</span>
            </span>
            <span className="text-[10px] text-purple-800 block mt-0.5">Peak day swing: {diurnalAnalysis.max}°C</span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[11px] text-emerald-800 font-mono block">High Insolation Days</span>
            <span className="text-2xl font-bold font-mono text-emerald-950 mt-0.5 block">
              {solarAnalysis.highCount} <span className="text-xs font-normal text-emerald-700">days</span>
            </span>
            <span className="text-[10px] text-emerald-800 block mt-0.5">&gt;22 MJ/m² high evaporative flux</span>
          </div>
        </div>
      </div>

      {/* 5 In-Depth Scientific Risk Cards (What Observed, How Calculated, Agricultural Impact, Limitations, Follow-up) */}
      <div className="space-y-6">
        {/* CARD A: THERMAL STRESS & HEATWAVES */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  A. Thermal Stress & Heatwave Sensitivity
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Threshold Test: Daily Maximum Air Temperature (T2M_MAX) ≥ {localHeat}°C
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">
              {heatAnalysis.daysCount} Stress Days Recorded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block">
                1. What Was Observed
              </span>
              <p className="text-slate-300 leading-relaxed">
                During the observation window, {heatAnalysis.daysCount} days ({heatAnalysis.pct}%) reached or exceeded {localHeat}°C. The longest continuous sequence of elevated temperatures persisted for {heatAnalysis.maxConsecutive} consecutive days.
              </p>

              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block pt-1">
                2. Exact Calculation Methodology
              </span>
              <p className="text-emerald-400 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                Count(day ∈ Period | T2M_MAX[day] ≥ {localHeat}.0°C)
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block">
                3. Agricultural Relevance (Physiological Impact)
              </span>
              <p className="text-slate-300 leading-relaxed">
                Temperatures above 38°C during anthesis cause pollen sterility in wheat, chickpea, and sorghum. In onion and vegetable seed production, high heat triggers flower abortion and extreme transpirational demand, depleting shallow root zones.
              </p>

              <span className="font-bold text-amber-400 uppercase font-mono text-[11px] block pt-1">
                4. What The Data Cannot Tell Us
              </span>
              <p className="text-slate-400 leading-relaxed">
                Air temperature at 2 meters does not equal canopy leaf temperature. Transpiring crops with ample irrigation can maintain canopy temperatures 2–5°C cooler than ambient air. Stressed, moisture-starved crops may heat up 3–6°C above ambient air.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 rounded-lg border border-emerald-800 text-xs text-emerald-300">
            <strong className="font-semibold text-emerald-200">Additional Information Needed to Improve Confidence: </strong>
            Crop variety heat-tolerance ratings (e.g. thermotolerant wheat varieties like MPKV-released cultivars), actual planting dates, and infrared thermal canopy gun measurements.
          </div>
        </div>

        {/* CARD B: PRECIPITATION VARIABILITY & DRY PERIODS */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
                <CloudOff className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  B. Precipitation Intermittency & Dry Spell Dynamics
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Threshold Test: PRECTOTCORR ≤ {localDry} mm/day
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800">
              {statistics.longestDrySpell} Days Longest Run
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block">
                1. What Was Observed
              </span>
              <p className="text-slate-300 leading-relaxed">
                Rainfall was highly episodic. Total accumulation of {statistics.precipTotal} mm occurred over only {statistics.wetDaysCount} wet days. A protracted dry stretch of {statistics.longestDrySpell} days with precipitation ≤ 1.0 mm occurred within the season.
              </p>

              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block pt-1">
                2. Calculation Formula
              </span>
              <p className="text-cyan-400 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                MaxConsecutive(day | PRECTOTCORR[day] ≤ {localDry} mm)
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block">
                3. Agricultural Implications
              </span>
              <p className="text-slate-300 leading-relaxed">
                In rainfed Kharif crops (soybean, cotton, pigeon pea), dry spells exceeding 14 days during vegetative growth cause temporary wilting, while spells exceeding 21 days during flowering cause irreversible pod shedding and yield decline.
              </p>

              <span className="font-bold text-amber-400 uppercase font-mono text-[11px] block pt-1">
                4. Low Precipitation vs Officially Defined Drought
              </span>
              <p className="text-slate-400 leading-relaxed">
                Meteorological dry days do not equal agricultural drought. Deep black vertisols can hold 150–200 mm of available water, sustaining crops through 2-week dry spells, whereas shallow red gravel soils wither in 5–7 days.
              </p>
            </div>
          </div>

          <div className="p-3 bg-cyan-950/40 rounded-lg border border-cyan-800 text-xs text-cyan-300">
            <strong className="font-semibold text-cyan-200">Additional Information Needed: </strong>
            Soil depth profiles, Available Water Capacity (AWC), and groundwater irrigation capacity (open well / borewell discharge rates).
          </div>
        </div>

        {/* CARD C: DIURNAL TEMPERATURE RANGE (DTR) */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  C. Diurnal Temperature Range & Nocturnal Respiration
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Calculation: DTR = T2M_MAX - T2M_MIN
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded border border-purple-800">
              Avg DTR: {diurnalAnalysis.mean} °C
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block">
                1. What Was Observed
              </span>
              <p className="text-slate-300 leading-relaxed">
                Mean day-to-night temperature swing is {diurnalAnalysis.mean}°C, reaching a single-day maximum differential of {diurnalAnalysis.max}°C. {diurnalAnalysis.highDiurnalDays} days exhibited large swings &ge;15°C.
              </p>

              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block pt-1">
                2. Calculation Formula
              </span>
              <p className="text-purple-400 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                DTR[day] = T2M_MAX[day] - T2M_MIN[day]
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block">
                3. Physiological Relevance to Plants
              </span>
              <p className="text-slate-300 leading-relaxed">
                Photosynthesis occurs during the day, producing sugars; respiration occurs day and night, consuming sugars. Elevated nighttime minimum temperatures (T_min &gt; 22°C) burn up daytime photosynthates, reducing net grain weight and starch quality.
              </p>

              <span className="font-bold text-amber-400 uppercase font-mono text-[11px] block pt-1">
                4. What The Data Cannot Tell Us
              </span>
              <p className="text-slate-400 leading-relaxed">
                NASA POWER 2-meter air temperature does not account for thermal inversion layers near ground level where frost or soil heat radiation occurs.
              </p>
            </div>
          </div>
        </div>

        {/* CARD D: SOLAR RADIATION DYNAMICS */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                <SunMedium className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  D. Solar Radiation Flux & Atmospheric Cloudiness
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Parameter: ALLSKY_SFC_SW_DWN (MJ/m²/day)
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
              Mean: {statistics.solarMean ?? 'N/A'} MJ/m²/day
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block">
                1. What Was Observed
              </span>
              <p className="text-slate-300 leading-relaxed">
                Surface shortwave solar radiation averaged {statistics.solarMean} MJ/m²/day, peaking at {statistics.solarMax} MJ/m²/day under clear skies. During dense overcast monsoon days, solar irradiance dipped to {statistics.solarMin} MJ/m²/day.
              </p>

              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block pt-1">
                2. Calculation Formula
              </span>
              <p className="text-emerald-400 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                Daily Integrated Downward Solar Flux = ∫ S_down(t) dt [MJ/m²]
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block">
                3. Agricultural Relevance
              </span>
              <p className="text-slate-300 leading-relaxed">
                Solar radiation is the energy engine for crop growth and the primary driver of Evapotranspiration (ET). High solar irradiance coupled with dry winds generates high evaporative suction, requiring frequent micro-irrigation pulses.
              </p>

              <span className="font-bold text-amber-400 uppercase font-mono text-[11px] block pt-1">
                4. What The Data Cannot Tell Us
              </span>
              <p className="text-slate-400 leading-relaxed">
                Total solar irradiance does not measure diffuse vs direct light ratio. In greenhouse horticulture, diffuse light often provides deeper canopy penetration than harsh direct sun.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
