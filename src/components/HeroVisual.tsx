import React from 'react';
import {
  Compass,
  ArrowRight,
  Database,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  MapPin,
  Thermometer,
  CloudRain,
  Sun,
  Layers,
  Sparkles,
  Satellite,
} from 'lucide-react';
import { ActiveTab } from './Header';
import { StudyLocation, DataSetStatistics, DataStatus } from '../types/nasa';

interface HeroVisualProps {
  onSelectTab: (tab: ActiveTab) => void;
  currentLocation: StudyLocation;
  onSetPreset: (presetId: string) => void;
  statistics: DataSetStatistics;
  dataStatus: DataStatus;
  isSampleData: boolean;
}

export const HeroVisual: React.FC<HeroVisualProps> = ({
  onSelectTab,
  currentLocation,
  onSetPreset,
  statistics,
  dataStatus,
  isSampleData,
}) => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white border-b border-slate-800">
        {/* Subtle background mesh and orbital arc */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="uppercase">NASA Space Apps Challenge 2026</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-300">Agricultural Adaptation</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                Every Farm Has a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Climate Story.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Explore NASA environmental data to investigate temperature, rainfall, solar energy, and agricultural resilience. Turn observations into questions, evidence, and research.
              </p>

              {/* Three Primary Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onSelectTab('map')}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Interactive Map Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectTab('lab')}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-900 text-slate-100 border border-slate-700/80 font-medium text-sm hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Open Research Lab</span>
                </button>

                <button
                  onClick={() => onSelectTab('explore')}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-900 text-slate-100 border border-slate-700/80 font-medium text-sm hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Explore NASA Data</span>
                </button>

                <button
                  onClick={() => onSelectTab('science')}
                  className="px-4 py-3 text-slate-400 hover:text-white font-medium text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Learn How It Works →
                </button>
              </div>

              {/* Live study location breadcrumb */}
              <div className="pt-4 flex items-center gap-2 text-xs text-slate-400 font-mono">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Target:</span>
                <span className="text-slate-200 font-medium">{currentLocation.name}</span>
                <span>({currentLocation.latitude}°N, {currentLocation.longitude}°E)</span>
              </div>
            </div>

            {/* Right Column: Agricultural Landscape Connected to Climate Observations */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 shadow-2xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src="/src/assets/images/hero_agricultural_earth_1792427794591.jpg"
                    alt="Agricultural landscape in Maharashtra with agro-meteorological monitoring and canal irrigation"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      // Styled CSS Fallback container if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle Gradient Scrim for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Connected Climate Telemetry Overlay - Computed from actual data */}
                  <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
                    <div className="bg-slate-950/85 backdrop-blur-md rounded-lg p-2.5 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-mono">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>TEMP (T2M)</span>
                      </div>
                      <div className="text-base font-bold font-mono text-white mt-0.5">
                        {statistics.tempMean !== null ? (
                          <>
                            {statistics.tempMean} <span className="text-xs font-normal text-slate-400">°C</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">Awaiting data</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {statistics.tempMean !== null ? 'Period Mean' : 'MERRA-2 Model'}
                      </div>
                    </div>

                    <div className="bg-slate-950/85 backdrop-blur-md rounded-lg p-2.5 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-mono">
                        <CloudRain className="w-3.5 h-3.5" />
                        <span>RAIN (PRECIP)</span>
                      </div>
                      <div className="text-base font-bold font-mono text-white mt-0.5">
                        {statistics.precipTotal !== null ? (
                          <>
                            {statistics.precipTotal} <span className="text-xs font-normal text-slate-400">mm</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">Awaiting data</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {statistics.precipTotal !== null ? `${statistics.wetDaysCount} Wet Days` : 'GPCP Corrected'}
                      </div>
                    </div>

                    <div className="bg-slate-950/85 backdrop-blur-md rounded-lg p-2.5 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
                        <Sun className="w-3.5 h-3.5" />
                        <span>SOLAR (SW)</span>
                      </div>
                      <div className="text-base font-bold font-mono text-white mt-0.5">
                        {statistics.solarMean !== null ? (
                          <>
                            {statistics.solarMean} <span className="text-xs font-normal text-slate-400">MJ</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">Awaiting data</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {statistics.solarMean !== null ? 'Daily Mean Irradiance' : 'CERES Satellite'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtitle footer inside visual card with real provenance */}
                <div className="px-4 py-3 bg-slate-950 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    {dataStatus === 'live_loaded' ? (
                      <span className="text-emerald-400 font-medium">NASA POWER Live Data ({statistics.validDays} days)</span>
                    ) : isSampleData ? (
                      <span className="text-amber-400 font-medium">Reference Baseline (Maharashtra)</span>
                    ) : (
                      <span>NASA POWER Agroclimatology</span>
                    )}
                  </span>
                  <span className="text-slate-500 font-mono">0.5° × 0.5° Native Grid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Core Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-semibold">
            Laboratory Capabilities
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Turn Environmental Data Into Scientific Investigation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card A: Explore Real Data */}
          <div
            onClick={() => onSelectTab('lab')}
            className="group p-6 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-slate-700 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Explore Real Data
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Investigate environmental observations from NASA POWER, including temperature, precipitation, and solar radiation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:gap-2 transition-all">
              <span>Open data console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card B: Discover Climate Patterns */}
          <div
            onClick={() => onSelectTab('explore')}
            className="group p-6 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-slate-700 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Discover Climate Patterns
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Compare trends, seasonal variation, monthly distributions, and unusual climatic spikes across multiple time windows.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:gap-2 transition-all">
              <span>Analyze charts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card C: Investigate Farm Risks */}
          <div
            onClick={() => onSelectTab('insights')}
            className="group p-6 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-slate-700 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Investigate Farm Risks
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Explore potential agricultural implications of heat stress thresholds, rainfall variability, and prolonged dry spells.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:gap-2 transition-all">
              <span>Inspect risk models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card D: Create Research Reports */}
          <div
            onClick={() => onSelectTab('adaptation')}
            className="group p-6 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-slate-700 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Create Research Reports
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Export verified data as CSV, download structured scientific PDF reports, and document research findings with source attribution.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:gap-2 transition-all">
              <span>View exports & reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Scientific Workflow */}
      <section className="bg-slate-950 border-y border-slate-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Scientific Methodology
            </h2>
            <h3 className="mt-1 text-2xl font-bold text-slate-100">
              From Environmental Data to Agricultural Questions
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              A disciplined, reproducible four-step workflow connecting spaceborne Earth observation to on-the-ground farming inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 shadow-lg relative">
              <div className="text-2xl font-mono font-bold text-slate-700 mb-2">01.</div>
              <h4 className="text-base font-bold text-slate-100 mb-2">Select a Location</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter precise geographic coordinates or choose from planetary benchmark stations worldwide to define your spatial study unit.
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 shadow-lg relative">
              <div className="text-2xl font-mono font-bold text-slate-700 mb-2">02.</div>
              <h4 className="text-base font-bold text-slate-100 mb-2">Retrieve Observations</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fetch daily time-series from the NASA POWER API, parsing temperature, precipitation, and solar irradiance while flagging fill-value sentinels.
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 shadow-lg relative">
              <div className="text-2xl font-mono font-bold text-slate-700 mb-2">03.</div>
              <h4 className="text-base font-bold text-slate-100 mb-2">Analyze Patterns & Uncertainty</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compute statistical distributions, test sensitivity thresholds, and investigate the variance and limitations of gridded models.
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 shadow-lg relative">
              <div className="text-2xl font-mono font-bold text-slate-100 mb-2">04.</div>
              <h4 className="text-base font-bold text-slate-100 mb-2">Investigate Adaptation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluate practical agronomic pathways—mulching, drip scheduling, crop diversification—weighing trade-offs with local extension experts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Start with Maharashtra Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl border border-slate-800 p-8 sm:p-12 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>PILOT STUDY FOCUS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                Start with Maharashtra
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Our initial study region focuses around <strong className="text-white">Shirdi and Kopargaon</strong> (Latitude 19.76°N, Longitude 74.48°E) in the Godavari canal valley of Ahmednagar District. This tract faces acute agro-climatic contrasts: scorching summer heatwaves, erratic monsoon dry spells, and heavy dependency on groundwater for sugarcane, onion, and pomegranate cultivation.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => onSetPreset('shirdi-kopargaon')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                >
                  Shirdi–Kopargaon (19.76°, 74.48°)
                </button>
                <button
                  onClick={() => onSetPreset('nashik-godavari')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Nashik (19.99°, 73.79°)
                </button>
                <button
                  onClick={() => onSetPreset('pune-baramati')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Pune–Baramati (18.15°, 74.57°)
                </button>
                <button
                  onClick={() => onSetPreset('nagpur-vidarbha')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Nagpur–Vidarbha (21.14°, 79.08°)
                </button>
                <button
                  onClick={() => onSetPreset('sambhajinagar-marathwada')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Chhatrapati Sambhajinagar (19.87°, 75.34°)
                </button>
                <button
                  onClick={() => onSetPreset('kolhapur-panchganga')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Kolhapur (16.70°, 74.24°)
                </button>
              </div>
            </div>

            {/* Geographic Evidence Card (Genuine satellite & coordinate telemetry, no AI generated photos) */}
            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900/90 p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Satellite className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Geographic Study Area</span>
                      <span className="text-[10px] font-mono text-emerald-400">Maharashtra, India (15.6°N–22.1°N)</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    6 Presets
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 font-mono space-y-1.5">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Primary Station:</span>
                      <span className="text-white font-semibold">Shirdi–Kopargaon</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Target Coordinates:</span>
                      <span className="text-emerald-400 font-semibold">19.7600°N, 74.4800°E</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Basin & Elevation:</span>
                      <span className="text-slate-300">Godavari Canal / ~512 m</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-200">Satellite Imagery Service:</strong> Integrated Google Maps Platform high-resolution satellite tiles (Maxar / Airbus / CNES / Copernicus).
                  </div>
                </div>

                <button
                  onClick={() => onSelectTab('map')}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Launch Interactive Maharashtra Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Project Note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 sm:p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold text-amber-900 block mb-0.5">Project Note & Scientific Responsibility:</span>
            FieldShift is an independent educational research project. It uses publicly available environmental data and does not replace local agricultural expertise, official weather warnings, or field measurements. Always verify field decisions with local agronomists and regional Krishi Vigyan Kendras (KVK).
          </div>
        </div>
      </section>
    </div>
  );
};
