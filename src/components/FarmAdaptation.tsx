import React, { useState } from 'react';
import {
  ShieldCheck,
  Droplets,
  Sprout,
  Layers,
  Wind,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ADAPTATION_STRATEGIES, AdaptationStrategy } from '../data/adaptationStrategies';
import { StudyLocation } from '../types/nasa';

interface FarmAdaptationProps {
  currentLocation: StudyLocation;
  onOpenReportModal: () => void;
}

export const FarmAdaptation: React.FC<FarmAdaptationProps> = ({
  currentLocation,
  onOpenReportModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(ADAPTATION_STRATEGIES[0].id);

  const filteredStrategies = ADAPTATION_STRATEGIES.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="space-y-8 text-slate-100">
      {/* Overview Banner */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Agronomic Resilience & Adaptation</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
              Evidence-Based Farm Adaptation Pathways
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore scientific practices to mitigate climate risks identified in NASA observations for {currentLocation.name}.
            </p>
          </div>

          <div className="text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 max-w-md">
            <strong className="text-white">Agro-Ecological Principle: </strong>
            No single practice solves climate vulnerability. Resilient farming combines soil moisture preservation, crop diversification, and efficient micro-irrigation tailored to local soils.
          </div>
        </div>

        {/* Category Filters (Interactive buttons) */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            All Pathways ({ADAPTATION_STRATEGIES.length})
          </button>
          <button
            onClick={() => setSelectedCategory('water')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              selectedCategory === 'water'
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Water & Moisture Retention
          </button>
          <button
            onClick={() => setSelectedCategory('crops')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              selectedCategory === 'crops'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Crop Diversification & Millets
          </button>
          <button
            onClick={() => setSelectedCategory('soil')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              selectedCategory === 'soil'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Soil Organic Carbon
          </button>
          <button
            onClick={() => setSelectedCategory('microclimate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              selectedCategory === 'microclimate'
                ? 'bg-teal-500 text-slate-950 font-bold border-teal-400 shadow-sm'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Microclimate & Agroforestry
          </button>
        </div>
      </div>

      {/* Strategies List */}
      <div className="space-y-4">
        {filteredStrategies.map((strat) => {
          const isExpanded = expandedId === strat.id;

          return (
            <div
              key={strat.id}
              className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden transition-all text-slate-100"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : strat.id)}
                className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-emerald-400 font-semibold">{strat.tag}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{strat.focusRegion}</span>
                  </div>
                  <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                    {strat.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1">{strat.summary}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                    {isExpanded ? 'Hide Details' : 'Explore Science'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded In-Depth Details */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-3 border-t border-slate-800 bg-slate-950/60 space-y-5 text-xs">
                  {/* Scientific Mechanism */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-white uppercase font-mono text-[11px] mb-1">
                      Scientific Mechanism Behind Resilience
                    </h4>
                    <p className="text-slate-300 leading-relaxed">{strat.scientificMechanism}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Benefits */}
                    <div className="p-3.5 bg-emerald-950/30 rounded-xl border border-emerald-800/60">
                      <h4 className="font-bold text-emerald-400 uppercase font-mono text-[11px] mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Expected Agronomic Benefits</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {strat.benefits.map((b, i) => (
                          <li key={i} className="text-emerald-200 flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Trade-offs */}
                    <div className="p-3.5 bg-amber-950/30 rounded-xl border border-amber-800/60">
                      <h4 className="font-bold text-amber-400 uppercase font-mono text-[11px] mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Practical Trade-offs & Limitations</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {strat.tradeOffs.map((t, i) => (
                          <li key={i} className="text-amber-200 flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Resource Needs & KVK Questions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-white uppercase font-mono text-[11px] mb-2">
                        Resource & Equipment Needs
                      </h4>
                      <ul className="space-y-1">
                        {strat.resourceNeeds.map((r, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-1.5">
                            <span className="text-slate-500">→</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                      <h4 className="font-bold text-white uppercase font-mono text-[11px] mb-2 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Questions for Local Krishi Vigyan Kendra (KVK)</span>
                      </h4>
                      <ul className="space-y-1">
                        {strat.kvkQuestions.map((q, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-1.5">
                            <span className="text-cyan-400 font-bold">?</span>
                            <span className="italic">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Advisory Consultation Banner */}
      <div className="p-5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold font-['Plus_Jakarta_Sans',sans-serif]">
            Document These Adaptation Strategies in Your Research Report
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compile the environmental baseline data with these adaptation findings into a formatted PDF document.
          </p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Generate Report (PDF) →
        </button>
      </div>
    </div>
  );
};
