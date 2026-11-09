import React, { useState } from 'react';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Key,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  FileCode,
  AlertTriangle,
} from 'lucide-react';
import {
  SCIENTIFIC_SOURCES_REGISTRY,
  ScientificSource,
  SourceCategory,
  IntegrationStatus,
} from '../data/scientificSourcesRegistry';
import { queryCmrGranules, TARGET_COLLECTIONS, CmrQueryResult } from '../services/cmrService';

interface ScientificSourceRegistryViewProps {
  currentLat: number;
  currentLng: number;
}

export const ScientificSourceRegistryView: React.FC<ScientificSourceRegistryViewProps> = ({
  currentLat,
  currentLng,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>('nasa-power');

  // CMR Live Granule Query Test State
  const [selectedCollection, setSelectedCollection] = useState<string>('MOD13Q1');
  const [cmrLoading, setCmrLoading] = useState<boolean>(false);
  const [cmrResult, setCmrResult] = useState<CmrQueryResult | null>(null);

  const handleRunCmrQuery = async () => {
    setCmrLoading(true);
    try {
      const res = await queryCmrGranules(currentLat, currentLng, selectedCollection, 5);
      setCmrResult(res);
    } catch (err) {
      console.error('CMR query failed:', err);
    } finally {
      setCmrLoading(false);
    }
  };

  const filteredSources = SCIENTIFIC_SOURCES_REGISTRY.filter((src) => {
    const matchesCat = selectedCategory === 'all' || src.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      src.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.leadAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      src.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Operational (Direct API / Map Overlay)
          </span>
        );
      case 'active_ready':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-cyan-50 text-cyan-800 border border-cyan-300">
            <Clock className="w-3 h-3 text-cyan-600" />
            Active Ready (Overlay Active + REST Key Ready)
          </span>
        );
      case 'auth_required':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-300">
            <Key className="w-3 h-3 text-amber-600" />
            User Auth Key Required
          </span>
        );
      case 'backend_pipeline':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-purple-50 text-purple-800 border border-purple-300">
            <Cpu className="w-3 h-3 text-purple-600" />
            Backend Pipeline Linked
          </span>
        );
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            Roadmap / Architecture Ready
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Scientific Data Sources Registry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
              Connected Earth Observation & Climate Architecture
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>Coordinates:</span>
            <span className="text-emerald-400 font-semibold">
              {currentLat.toFixed(2)}°N, {currentLng.toFixed(2)}°E
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-4xl">
          FieldShift explicitly integrates verified scientific data sources for Earth observation research. To maintain scientific integrity, we clearly distinguish between direct satellite observations, derived products, atmospheric reanalyses, and catalog discovery portals.
        </p>

        {/* Categories summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-200">
            <span className="text-emerald-400 block text-[10px] uppercase">Operational Services</span>
            <span className="text-lg font-bold">14 Sources</span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">Live Direct APIs & Overlays</span>
          </div>
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800 text-cyan-200">
            <span className="text-cyan-400 block text-[10px] uppercase">Active Ready Catalogs</span>
            <span className="text-lg font-bold">28 Sources</span>
            <span className="text-[10px] text-cyan-400/80 block mt-0.5">ESA, USGS, NOAA, JAXA, ISRO</span>
          </div>
          <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800 text-purple-200">
            <span className="text-purple-400 block text-[10px] uppercase">Soil, Forests & Bio</span>
            <span className="text-lg font-bold">8 Specialized</span>
            <span className="text-[10px] text-purple-400/80 block mt-0.5">SoilGrids, GFW, GBIF, WaPOR</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase">Geographic Coverage</span>
            <span className="text-lg font-bold text-slate-100">Global-First</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">All Continents & Oceans</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: `All ${SCIENTIFIC_SOURCES_REGISTRY.length} Sources` },
            { id: 'direct_satellite', label: 'Direct Satellite' },
            { id: 'derived_satellite', label: 'Derived Products' },
            { id: 'reanalysis_model', label: 'Atmospheric Reanalysis' },
            { id: 'soil_water_surface', label: 'Soil, Water & Oceans' },
            { id: 'biodiversity_forest', label: 'Forest & Biodiversity' },
            { id: 'catalog_portal', label: 'Granule Catalogs & Portals' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search sources, instruments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Sources Accordion List */}
      <div className="space-y-4">
        {filteredSources.map((source) => {
          const isExpanded = expandedSourceId === source.id;

          return (
            <div
              key={source.id}
              className={`bg-slate-900/80 rounded-xl border transition-all overflow-hidden ${
                isExpanded ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Row */}
              <div
                onClick={() => setExpandedSourceId(isExpanded ? null : source.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-slate-950/60 hover:bg-slate-950/90"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-800">
                    {source.number}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
                        {source.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {source.acronym}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{source.leadAgency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  {getStatusBadge(source.status)}
                  <div className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Details Body */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800 space-y-4 text-xs animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Purpose & Integration Method */}
                    <div className="space-y-3">
                      <div>
                        <span className="font-bold text-slate-200 block mb-1">Scientific Purpose:</span>
                        <p className="text-slate-400 leading-relaxed">{source.purpose}</p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-200 block mb-1">Integration Architecture in FieldShift:</span>
                        <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-950 p-2.5 rounded border border-slate-800">
                          {source.integrationMethod}
                        </p>
                      </div>

                      {source.notes && (
                        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-200 text-[11px] flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-semibold block mb-0.5 text-amber-300">Methodology & Non-Duplication Note:</strong>
                            {source.notes}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata Table */}
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 text-[11px] font-mono">
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-500">CATEGORY:</span>
                        <span className="font-semibold text-slate-300">{source.categoryLabel}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-500">COVERAGE:</span>
                        <span className="font-semibold text-slate-300">{source.coverage}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-500">SPATIAL RESOLUTION:</span>
                        <span className="font-semibold text-slate-300">{source.spatialResolution}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-500">TEMPORAL RESOLUTION:</span>
                        <span className="font-semibold text-slate-300">{source.temporalResolution}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-500">DATE RANGE:</span>
                        <span className="font-semibold text-slate-300">{source.dateRange}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-500">LICENSING / ACCESS:</span>
                        <span className="font-semibold text-slate-300">{source.licensing}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">AUTHENTICATION:</span>
                        <span className="font-semibold text-slate-300">{source.authentication}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Endpoint & Official Documentation Link */}
                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400 font-mono truncate max-w-xl">
                      <span className="text-slate-500 mr-1">Endpoint:</span>
                      <code>{source.sampleEndpointOrUrl}</code>
                    </div>

                    <a
                      href={source.officialDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors shrink-0 font-medium text-xs cursor-pointer border border-slate-700"
                    >
                      <span>Official Documentation</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive NASA CMR Live Granule Inspector */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold uppercase">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Live NASA CMR API Inspector (Source #5: Earthdata CMR)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              Query Live NASA Data Granules for Current Coordinates ({currentLat.toFixed(2)}°N, {currentLng.toFixed(2)}°E)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Directly calls cmr.earthdata.nasa.gov
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Verify live connection to NASA’s unified metadata catalog. Select an Earth science collection below to query real satellite granule passes, archive file names, and direct download links overlapping this research site.
        </p>

        {/* Collection Selector & Trigger */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex-1 min-w-[240px]">
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-emerald-500"
            >
              {TARGET_COLLECTIONS.map((col) => (
                <option key={col.shortName} value={col.shortName}>
                  {col.shortName} ({col.sensor}) — {col.relevance}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunCmrQuery}
            disabled={cmrLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cmrLoading ? 'animate-spin' : ''}`} />
            <span>{cmrLoading ? 'Querying CMR Catalog...' : 'Execute Live Catalog Query'}</span>
          </button>
        </div>

        {/* Live Query Results */}
        {cmrResult && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">
                Found <strong className="text-emerald-400">{cmrResult.totalHits}</strong> total granules for box [{cmrResult.queriedBox}]
              </span>
              <span className="text-slate-500">Displaying top 5 most recent</span>
            </div>

            {cmrResult.granules.length > 0 ? (
              <div className="space-y-2">
                {cmrResult.granules.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-bold text-slate-200 truncate max-w-lg">{g.title}</span>
                      <span className="text-slate-400 text-[10px]">
                        Pass: {g.timeStart ? new Date(g.timeStart).toLocaleString() : 'N/A'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      {g.cloudCover !== undefined && (
                        <span>Cloud: {g.cloudCover.toFixed(1)}%</span>
                      )}
                      {g.granuleSizeMb && <span>Size: {g.granuleSizeMb} MB</span>}
                      {g.dayNightFlag && <span>Pass: {g.dayNightFlag}</span>}
                    </div>

                    {g.downloadUrl && (
                      <div className="pt-1">
                        <a
                          href={g.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline font-semibold"
                        >
                          <span>Direct NASA Archive Granule URL</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
                {cmrResult.errorMessage || 'No recent granules found for this specific spatial bounding window.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
