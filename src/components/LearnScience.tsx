import React, { useState } from 'react';
import {
  Satellite,
  Layers,
  Thermometer,
  CloudRain,
  Sun,
  Droplets,
  Wind,
  Info,
  BookOpen,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { NASA_PARAMETERS } from '../data/parameters';
import { ActiveTab } from './Header';

interface LearnScienceProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const LearnScience: React.FC<LearnScienceProps> = ({ onSelectTab }) => {
  const [selectedParam, setSelectedParam] = useState<string>(NASA_PARAMETERS[0].paramCode);

  const activeParam = NASA_PARAMETERS.find((p) => p.paramCode === selectedParam) || NASA_PARAMETERS[0];

  return (
    <div className="space-y-12">
      {/* Hero Header for Science Section */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-8 sm:p-12 overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Satellite className="w-3.5 h-3.5" />
              <span>NASA SATELLITE EARTH OBSERVATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              The Science Behind NASA Environmental Data
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Understand how spaceborne sensors, atmospheric assimilation models, and surface energy balance algorithms translate satellite photons into daily agricultural parameters.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSelectTab('lab')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                <span>Launch Analysis in Research Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl aspect-[4/3]">
              <img
                src="/src/assets/images/nasa_earth_satellite_1792427795573.jpg"
                alt="NASA Earth observation satellite monitoring agricultural continents"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Parameter Deep-Dive Explorer */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 shadow-sm space-y-6 text-slate-100">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Variable Documentation & Physical Meaning</span>
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
            Deep Dive into NASA POWER Parameters
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an atmospheric variable to examine its sensor origin, measurement elevation, unit conventions, and agricultural significance.
          </p>
        </div>

        {/* Parameter Selector Pills (interactive tabs) */}
        <div className="flex flex-wrap gap-2">
          {NASA_PARAMETERS.map((p) => {
            const isSelected = selectedParam === p.paramCode;
            return (
              <button
                key={p.paramCode}
                onClick={() => setSelectedParam(p.paramCode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.paramCode} ({p.unit})
              </button>
            );
          })}
        </div>

        {/* Selected Parameter Scientific Card */}
        <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Parameter Code: {activeParam.paramCode}
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                {activeParam.fullName} ({activeParam.shortName})
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">Standard Unit</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{activeParam.unit}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block mb-1">
                  Physical Definition & Measurement
                </span>
                <p className="text-slate-300 leading-relaxed">{activeParam.description}</p>
              </div>

              <div>
                <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block mb-1">
                  Source Instrument & Satellite System
                </span>
                <p className="text-emerald-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
                  {activeParam.sourceInstrument}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-emerald-300 uppercase font-mono text-[11px] block mb-1">
                  Agronomic Significance
                </span>
                <p className="text-emerald-200 leading-relaxed bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/80">
                  {activeParam.agriculturalRelevance}
                </p>
              </div>

              <div>
                <span className="font-bold text-amber-400 uppercase font-mono text-[11px] block mb-1">
                  Resolution & Representation Caveat
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Values represent an area-weighted spatial average over the grid box rather than an in-situ point station reading. Soil surface temperatures in direct sunlight will typically exceed 2-meter air temperature by 5–15°C.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gridded vs Station Climatology Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 shadow-sm space-y-3 text-slate-100">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">
            Gridded Reanalysis (0.5° × 0.5° Spatial Grid)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            NASA POWER provides continuous global coverage by assimilating satellite radiometric soundings, radar altimetry, and atmospheric models (MERRA-2) into structured grid cells (~50 km × 50 km). This ensures complete, unbroken spatial records where ground stations do not exist.
          </p>
          <div className="text-[11px] text-cyan-300 bg-cyan-950/40 p-2.5 rounded border border-cyan-800">
            <strong className="text-cyan-200">Key Benefit:</strong> Consistent multi-decadal time series without missing data gaps common to rural rain gauges.
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 shadow-sm space-y-3 text-slate-100">
          <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">
            In-Situ Ground Weather Stations
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Physical automated weather stations (AWS) measure conditions at a specific point on the farm. While highly precise for that exact plot, they reflect localized shelter from trees or buildings and are prone to sensor drift, power outages, and communication gaps.
          </p>
          <div className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2.5 rounded border border-emerald-800">
            <strong className="text-emerald-200">Best Scientific Practice:</strong> Use NASA POWER for regional macro-trends and baseline climatology, validated by ground probes for micro-irrigation scheduling.
          </div>
        </div>
      </div>
    </div>
  );
};
