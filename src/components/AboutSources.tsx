import React from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Award,
  BookOpen,
  Code2,
  Terminal,
  Database,
  Layers,
  Globe,
} from 'lucide-react';

export const AboutSources: React.FC = () => {
  return (
    <div className="space-y-10 text-slate-100">
      {/* Banner */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-8 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Global Earth Observation Platform · NASA Space Apps 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
          About FieldShift Science Explorer
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          FieldShift is an open, global-first Earth observation and agroclimatology research platform developed for the NASA Space Apps Challenge 2026, addressing the challenge <strong className="text-white">“Field Shift: Adapting Farms with NASA Data.”</strong> It transforms spaceborne Earth observations and atmospheric reanalysis into reproducible scientific inquiries across continents, agricultural regions, and arbitrary coordinates worldwide.
        </p>
      </div>

      {/* Mission & Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Scientific Rigor</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            We avoid black-box predictive claims. Every calculation displays its underlying mathematical formula, observation counts, sentinel filtering rules, and empirical limits.
          </p>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Worldwide Planetary Scope</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Designed for arbitrary global exploration across all 7 continents, with benchmark sites from the US Corn Belt to the Cerrado, East Africa, European AgTech valleys, and Indian agro-ecological zones.
          </p>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Responsible Agronomy</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            We never deliver overconfident farm advice. We present exploratory evidence, separate simulation models from empirical observations, and articulate questions for local agronomists.
          </p>
        </div>
      </div>

      {/* Official Data Source Documentation */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Data Architecture & API Specifications
          </span>
          <h2 className="text-lg font-bold text-white mt-1">
            NASA POWER (Prediction of Worldwide Energy Resources)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational solar and meteorological datasets developed at the NASA Langley Research Center.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-300 font-mono block">Primary Endpoint:</span>
              <code className="text-[11px] text-emerald-400 font-mono break-all block mt-1">
                https://power.larc.nasa.gov/api/temporal/daily/point
              </code>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-300 font-mono block">Community:</span>
              <span className="text-cyan-400 font-mono block mt-1">
                AG (Agroclimatology Community)
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-300 font-mono block mb-1">
              Sample Request Template:
            </span>
            <pre className="text-[11px] font-mono bg-slate-950 text-emerald-400 p-3 rounded-lg overflow-x-auto border border-slate-800">
{`https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,ALLSKY_SFC_SW_DWN,RH2M,WS2M&community=AG&longitude=74.48&latitude=19.76&start=20240101&end=20241231&format=JSON`}
            </pre>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="https://power.larc.nasa.gov/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              <span>NASA POWER Official Documentation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://power.larc.nasa.gov/api/temporal/daily/point"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              <span>API Reference Endpoint</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Academic Citation Guide */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
          Suggested Academic & Research Citation
        </h3>
        <p className="text-slate-300 leading-relaxed">
          When referencing data or methodology exported from FieldShift Science Explorer in student papers or agricultural assessments, please cite:
        </p>

        <div className="p-3.5 bg-slate-950 rounded-xl font-mono text-emerald-400 text-[11px] select-all border border-slate-800">
          NASA POWER Project (2026). Daily Agroclimatology Time Series (v2.10.0). NASA Langley Research Center. Accessed via FieldShift Science Explorer. https://power.larc.nasa.gov/
        </div>
      </div>
    </div>
  );
};
