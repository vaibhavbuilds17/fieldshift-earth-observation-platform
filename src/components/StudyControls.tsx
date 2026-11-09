import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Layers,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Database,
  Globe,
  Radio,
} from 'lucide-react';
import { StudyLocation, DataStatus } from '../types/nasa';
import { PRESET_LOCATIONS } from '../data/presetLocations';
import { NASA_PARAMETERS } from '../data/parameters';

interface StudyControlsProps {
  currentLocation: StudyLocation;
  startDate: string;
  endDate: string;
  selectedParams: string[];
  dataStatus: DataStatus;
  isSampleData: boolean;
  isLoading: boolean;
  errorMessage?: string;
  onUpdateLocation: (location: StudyLocation) => void;
  onUpdateDates: (start: string, end: string) => void;
  onToggleParam: (paramKey: string) => void;
  onRunAnalysis: (forceSample?: boolean) => void;
  onOpenMap?: () => void;
}

export const StudyControls: React.FC<StudyControlsProps> = ({
  currentLocation,
  startDate,
  endDate,
  selectedParams,
  dataStatus,
  isSampleData,
  isLoading,
  errorMessage,
  onUpdateLocation,
  onUpdateDates,
  onToggleParam,
  onRunAnalysis,
  onOpenMap,
}) => {
  const [isEditingCustom, setIsEditingCustom] = useState(!currentLocation.isPreset);
  const [customName, setCustomName] = useState(currentLocation.name);
  const [customLat, setCustomLat] = useState(String(currentLocation.latitude));
  const [customLon, setCustomLon] = useState(String(currentLocation.longitude));
  const [coordError, setCoordError] = useState<string | null>(null);

  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  const handlePresetSelect = (presetId: string) => {
    const found = PRESET_LOCATIONS.find((p) => p.id === presetId);
    if (found) {
      onUpdateLocation(found);
      setCustomName(found.name);
      setCustomLat(String(found.latitude));
      setCustomLon(String(found.longitude));
      setIsEditingCustom(false);
      setCoordError(null);
    }
  };

  const handleApplyCustomCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);

    if (isNaN(lat) || isNaN(lon)) {
      setCoordError('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }

    // Allow global coordinates (-90 to +90 lat, -180 to +180 lon)
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setCoordError(
        'Coordinates out of valid range. Latitude must be between -90° and +90°, longitude between -180° and +180°.'
      );
      return;
    }

    const isMaharashtra = lat >= 15.6 && lat <= 22.1 && lon >= 72.6 && lon <= 80.9;

    setCoordError(null);
    onUpdateLocation({
      id: `custom_${Date.now()}`,
      name: customName.trim() || `Target (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      region: isMaharashtra ? 'Maharashtra Pilot Zone' : 'Global Study Point',
      country: isMaharashtra ? 'India' : 'Global',
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      elevationMeters: undefined,
      description: `User-defined research target at ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
      isPreset: false,
    });
  };

  const handleApplyDates = () => {
    if (localStart > localEnd) {
      alert('Start date must be before or equal to End date.');
      return;
    }
    onUpdateDates(localStart, localEnd);
  };

  const getStatusBadge = () => {
    switch (dataStatus) {
      case 'live_loaded':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live NASA POWER Data
          </span>
        );
      case 'sample_loaded':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Sample Reference Baseline
          </span>
        );
      case 'partial_data':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-800">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Partial Data Available
          </span>
        );
      case 'api_unavailable':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            API Request Failed
          </span>
        );
      case 'loading':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Retrieving NASA Observations...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            Ready to Query
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl p-6 space-y-6 text-slate-100">
      {/* Top telemetry and status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>Study Location & Environmental Controls</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure geographic coordinates, observation intervals, and environmental variables for NASA POWER queries.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">{getStatusBadge()}</div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Retrieval Notice: </strong>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Preset Location Pills (Interactive segmented buttons) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Global & Maharashtra Research Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_LOCATIONS.map((preset) => {
            const isSelected = currentLocation.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
          <button
            onClick={() => setIsEditingCustom(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              isEditingCustom || !currentLocation.isPreset
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            + Custom Coordinates
          </button>

          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              title="Open Interactive Google Map with presets and satellite layer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interactive Map 📍</span>
            </button>
          )}
        </div>
      </div>

      {/* Coordinate & Location Details Form */}
      <form onSubmit={handleApplyCustomCoords} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="space-y-1 md:col-span-1">
          <label className="text-xs font-medium text-slate-400">Study Label</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g., Shirdi Pilot Farm"
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-white placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Latitude (-90 to +90)</span>
            <span className="font-mono text-[11px] text-slate-500">°N</span>
          </label>
          <input
            type="number"
            step="0.0001"
            min="-90"
            max="90"
            value={customLat}
            onChange={(e) => setCustomLat(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Longitude (-180 to +180)</span>
            <span className="font-mono text-[11px] text-slate-500">°E</span>
          </label>
          <input
            type="number"
            step="0.0001"
            min="-180"
            max="180"
            value={customLon}
            onChange={(e) => setCustomLon(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-white"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Set Coordinates
          </button>
        </div>

        {coordError && (
          <div className="md:col-span-4 text-xs text-rose-400 font-medium">
            {coordError}
          </div>
        )}
      </form>

      {/* Date Range Selection & Observation Period */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Start Date</span>
          </label>
          <input
            type="date"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>End Date</span>
          </label>
          <input
            type="date"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-white"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={handleApplyDates}
            className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
          >
            Update Time Window
          </button>
        </div>
      </div>

      {/* Environmental Variables Checklist */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active NASA POWER Environmental Variables</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {NASA_PARAMETERS.map((param) => {
            const isChecked = selectedParams.includes(param.paramCode);
            return (
              <button
                key={param.paramCode}
                type="button"
                onClick={() => onToggleParam(param.paramCode)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-white">
                    {param.paramCode}
                  </span>
                  <span
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold ${
                      isChecked
                        ? 'bg-emerald-500 text-slate-950'
                        : 'border border-slate-700 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 truncate">
                  {param.shortName}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {param.unit}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Execution Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="text-[11px] text-slate-400 max-w-xl">
          <strong className="text-slate-300">Geographic Spatial Scope:</strong> The selected point queries the NASA POWER 0.5° × 0.5° native grid (~50km) and integrates with global GIBS satellite products.
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onRunAnalysis(true)}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Load verified offline reference baseline"
          >
            Load Sample Reference
          </button>

          <button
            type="button"
            onClick={() => onRunAnalysis(false)}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Querying NASA...' : 'Fetch Live NASA Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
