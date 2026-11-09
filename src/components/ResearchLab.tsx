import React, { useState } from 'react';
import {
  Thermometer,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  HelpCircle,
  Clock,
  Database,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  FlaskConical,
  Cpu,
  Compass,
  FileText,
  Sliders,
  Play,
  RotateCcw,
  BookOpen,
  Activity,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  EnvironmentalPointData,
  DataSetStatistics,
  StudyLocation,
  DataStatus,
  MonthlyAggregate,
} from '../types/nasa';
import { RESEARCH_PROTOCOLS, ResearchProtocol, ExperimentDomain } from '../data/researchProtocols';

interface ResearchLabProps {
  location: StudyLocation;
  data: EnvironmentalPointData[];
  statistics: DataSetStatistics;
  monthlyAggregates: MonthlyAggregate[];
  dataStatus: DataStatus;
  isSampleData: boolean;
  retrievedAt: string;
  sources: string[];
  startDate: string;
  endDate: string;
  onOpenReportModal: () => void;
  onNavigateToCharts: () => void;
  onRetryFetch?: () => void;
  onLoadSample?: () => void;
}

export type LabExecutionMode = 'real_data' | 'simulation';
export type SimulationScenario = 'baseline' | 'extreme_warming' | 'megadrought' | 'deluge';

export const ResearchLab: React.FC<ResearchLabProps> = ({
  location,
  data,
  statistics,
  monthlyAggregates,
  dataStatus,
  isSampleData,
  retrievedAt,
  sources,
  startDate,
  endDate,
  onOpenReportModal,
  onNavigateToCharts,
  onRetryFetch,
  onLoadSample,
}) => {
  // Protocol Selection State (20 Experiments)
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>(RESEARCH_PROTOCOLS[0].id);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Explicit Execution Mode: Real Data Mode vs. Simulation Mode (Requirement 5)
  const [executionMode, setExecutionMode] = useState<LabExecutionMode>('real_data');
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>('extreme_warming');

  const activeProtocol: ResearchProtocol =
    RESEARCH_PROTOCOLS.find((p) => p.id === selectedProtocolId) || RESEARCH_PROTOCOLS[0];

  // Execute Analysis according to Mode
  const realAnalysisResult = activeProtocol.executeRealAnalysis(
    data,
    statistics,
    monthlyAggregates,
    location
  );

  const simulationResult = activeProtocol.executeSimulation(activeScenario, location);

  // Formatted retrieval date
  const formattedRetrieval = retrievedAt
    ? new Date(retrievedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not yet retrieved';

  // Filtered protocols list
  const filteredProtocols = RESEARCH_PROTOCOLS.filter((proto) => {
    const matchesDomain = selectedDomain === 'all' || proto.domain === selectedDomain;
    const matchesSearch =
      searchFilter === '' ||
      proto.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      proto.researchQuestion.toLowerCase().includes(searchFilter.toLowerCase()) ||
      proto.primarySensors.some((s) => s.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Laboratory Telemetry Header */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 flex-wrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>FIELD SHIFT RESEARCH LABORATORY</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 font-sans">{location.region}</span>
              <span className="text-slate-600">/</span>
              <span className="text-amber-400 font-mono">
                {executionMode === 'real_data' ? 'AUTHENTIC OBSERVATIONS' : 'SYNTHETIC SIMULATION'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
              {location.name}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Coordinates: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E • Elevation:{' '}
              {location.elevationMeters ? `${location.elevationMeters} m ASL` : 'NASA SRTM DEM'} • Interval:{' '}
              {startDate} to {endDate}
            </p>
          </div>

          {/* Mode Switcher Toggle: REAL DATA vs SIMULATION (Requirement 5) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start lg:self-auto shrink-0">
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setExecutionMode('real_data')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  executionMode === 'real_data'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Real Data Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode('simulation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  executionMode === 'simulation'
                    ? 'bg-amber-600 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Simulation Mode</span>
              </button>
            </div>

            <button
              onClick={onOpenReportModal}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Real Data vs Simulation Mode Clarification Notice */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {executionMode === 'real_data'
                ? 'REAL DATA MODE ACTIVE: Operating strictly with authentic retrieved NASA POWER atmospheric reanalysis, GPM IMERG rainfall, and MODIS sensor records.'
                : 'SIMULATION MODE ACTIVE: Operating with parameterized CMIP6 / SCS hydrological models for scenario stress-testing. Synthetic results are clearly demarcated.'}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 shrink-0 hidden md:block">
            Retrieved: {formattedRetrieval}
          </div>
        </div>
      </div>

      {/* Main Laboratory Layout: 20-Experiment Protocol Browser (Left) + Interactive Investigation Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-slate-100">
        {/* Left Column: 20 Guided Research Protocols Directory */}
        <div className="lg:col-span-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                Research Protocols (20)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {filteredProtocols.length} Available
            </span>
          </div>

          {/* Search & Domain Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search protocols, sensors, questions..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Domain filter tags */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'climatology', label: 'Climatology' },
                { id: 'hydrology', label: 'Hydrology' },
                { id: 'biosphere', label: 'Biosphere' },
                { id: 'hazards', label: 'Hazards' },
                { id: 'agriculture', label: 'Agronomy' },
                { id: 'geospatial_modeling', label: 'Geospatial' },
              ].map((dom) => (
                <button
                  key={dom.id}
                  onClick={() => setSelectedDomain(dom.id)}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer border ${
                    selectedDomain === dom.id
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {dom.label}
                </button>
              ))}
            </div>
          </div>

          {/* Protocols List */}
          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredProtocols.map((proto) => {
              const isSelected = activeProtocol.id === proto.id;
              return (
                <div
                  key={proto.id}
                  onClick={() => setSelectedProtocolId(proto.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-200 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {proto.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-white leading-tight truncate">
                        {proto.title}
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        {proto.domainLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-snug">
                    {proto.researchQuestion}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Investigation Workspace (Active Protocol) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Protocol Card Banner */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                    PROTOCOL #{activeProtocol.number} • {activeProtocol.domainLabel.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Target: {location.name}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  {activeProtocol.title}
                </h2>
              </div>

              {/* Simulation Scenario Pill Selector (Visible when Simulation Mode is on) */}
              {executionMode === 'simulation' && (
                <div className="flex items-center gap-1 bg-amber-50 p-1.5 rounded-lg border border-amber-200 text-xs">
                  <span className="text-[10px] font-mono font-bold text-amber-900 mr-1 uppercase">Scenario:</span>
                  {(['baseline', 'extreme_warming', 'megadrought', 'deluge'] as SimulationScenario[]).map((scen) => (
                    <button
                      key={scen}
                      onClick={() => setActiveScenario(scen)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                        activeScenario === scen
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {scen.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scientific Framework Guide: Question & Hypothesis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                  Core Scientific Research Question
                </span>
                <p className="font-semibold text-slate-900 leading-relaxed">
                  {activeProtocol.researchQuestion}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                  Working Scientific Hypothesis
                </span>
                <p className="font-semibold text-slate-900 leading-relaxed">
                  {activeProtocol.hypothesis}
                </p>
              </div>
            </div>

            {/* Recommended Datasets & Sensor Attribution */}
            <div className="p-3.5 rounded-lg bg-slate-900 text-white text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-bold">
                  <Database className="w-3.5 h-3.5" />
                  <span>AUTHORITATIVE SCIENTIFIC DATASETS & SENSORS</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeProtocol.scientificVariables}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[9px]">RECOMMENDED DATA SOURCES:</span>
                  <span className="text-slate-200">{activeProtocol.recommendedDatasets.join(' • ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">PRIMARY INSTRUMENTS / SENSORS:</span>
                  <span className="text-emerald-300 font-semibold">{activeProtocol.primarySensors.join(' • ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE INVESTIGATION RESULTS PANEL */}
          {executionMode === 'real_data' ? (
            /* REAL DATA MODE EXECUTION RESULTS */
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-5 animate-fadeIn text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                    Authentic Scientific Observation Findings
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800 font-semibold">
                  {isSampleData ? 'Reference Baseline Active' : 'Live NASA POWER Data'}
                </span>
              </div>

              {/* Extracted Quantitative Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {realAnalysisResult.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400 block text-[10px] uppercase truncate">{m.label}</span>
                    <span className="text-lg font-bold text-white block my-0.5">{m.value}</span>
                    <span className="text-[10px] text-emerald-400">{m.unit}</span>
                  </div>
                ))}
              </div>

              {/* Findings & Scientific Evidence */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Observed Empirical Evidence
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {realAnalysisResult.findings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scientific Conclusions */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs text-emerald-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Analytical Conclusion</span>
                </div>
                <p className="leading-relaxed">{realAnalysisResult.conclusions}</p>
              </div>

              {/* Recommended Farm/Research Actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Recommended Research & Adaptation Actions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {realAnalysisResult.recommendedActions.map((action, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* SIMULATION MODE EXECUTION RESULTS (Explicitly Labelled Synthetic) */
            <div className="bg-slate-900/80 rounded-2xl border border-amber-800/60 shadow-xl p-6 space-y-5 animate-fadeIn text-slate-100">
              <div className="flex items-center justify-between border-b border-amber-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <h3 className="text-base font-bold text-amber-200 font-['Plus_Jakarta_Sans',sans-serif]">
                    Synthetic Scientific Simulation Results
                  </h3>
                </div>
                <span className="text-xs font-mono text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800 font-bold uppercase">
                  Simulation Mode: {activeScenario}
                </span>
              </div>

              {/* Warning Banner: Never Confuse Simulation with Observations */}
              <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-800/80 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-amber-300">Notice of Simulated Model Output:</strong> The data below is generated by numerical simulation models (CMIP6 / SCS Hydrodynamics) to illustrate environmental dynamics. It is <strong>NOT</strong> an authentic sensor reading.
                </div>
              </div>

              {/* Modeled Outputs Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {simulationResult.modeledOutputs.map((out, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-amber-900/40 text-xs font-mono space-y-1">
                    <span className="text-amber-400 block text-[10px] uppercase font-bold">{out.label}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500 text-xs line-through">{out.baselineVal}</span>
                      <span className="text-base font-bold text-white">{out.projectedVal}</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-400 block text-right">{out.delta}</span>
                  </div>
                ))}
              </div>

              {/* Ecosystem Impact Summary */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 space-y-1.5">
                <strong className="block text-white font-mono uppercase text-[11px]">
                  Modeled Ecosystem Shock:
                </strong>
                <p className="leading-relaxed">{simulationResult.ecosystemImpactSummary}</p>
              </div>

              {/* Simulation Adaptation Options */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Simulation-Derived Adaptation Interventions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {simulationResult.adaptationOptions.map((opt, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scientific Methodology, Limitations & Data Provenance Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-4 text-slate-100">
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Experimental Methodology & Scientific Limitations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-300 font-mono uppercase text-[10px]">
                  Standard Operating Methodology:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 leading-relaxed">
                  {activeProtocol.methodology.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-amber-400 font-mono uppercase text-[10px]">
                  Scientific Uncertainties & Sensor Limits:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 leading-relaxed">
                  {activeProtocol.uncertaintyNotes.concat(activeProtocol.limitations).map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
