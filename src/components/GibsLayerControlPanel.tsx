import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Calendar,
  Sliders,
  ExternalLink,
  Info,
  Flame,
  CloudRain,
  Sprout,
  Sun,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { GIBS_LAYERS, GibsLayerDefinition, generateWorldviewUrl } from '../services/nasaGibsService';

interface GibsLayerControlPanelProps {
  selectedLayerId: string | null;
  onSelectLayer: (layer: GibsLayerDefinition | null) => void;
  opacity: number;
  onChangeOpacity: (val: number) => void;
  imageryDate: string;
  onChangeImageryDate: (date: string) => void;
  currentLat: number;
  currentLng: number;
}

export const GibsLayerControlPanel: React.FC<GibsLayerControlPanelProps> = ({
  selectedLayerId,
  onSelectLayer,
  opacity,
  onChangeOpacity,
  imageryDate,
  onChangeImageryDate,
  currentLat,
  currentLng,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const activeLayer = GIBS_LAYERS.find((l) => l.id === selectedLayerId) || null;

  const getLayerIcon = (category: GibsLayerDefinition['category']) => {
    switch (category) {
      case 'Optical Satellite':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'Vegetation & Canopy':
        return <Sprout className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Precipitation':
        return <CloudRain className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Thermal Anomalies':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 rounded-xl shadow-xl overflow-hidden max-w-sm w-full text-xs transition-all duration-200">
      {/* Header bar */}
      <div className="px-3.5 py-2.5 bg-slate-950 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-100">NASA GIBS Satellite Overlays</span>
        </div>
        <div className="flex items-center gap-2">
          {activeLayer && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
              Active
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            title={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3.5 space-y-3.5">
          {/* Layer Selector Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Select NASA Observation Layer:</span>
              {activeLayer && (
                <button
                  onClick={() => onSelectLayer(null)}
                  className="text-rose-400 hover:underline cursor-pointer flex items-center gap-1 text-[10px]"
                >
                  <EyeOff className="w-3 h-3" /> Turn Off Overlay
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {GIBS_LAYERS.map((layer) => {
                const isSelected = layer.id === selectedLayerId;
                return (
                  <button
                    key={layer.id}
                    onClick={() => onSelectLayer(isSelected ? null : layer)}
                    className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-start gap-2 ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-xs'
                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getLayerIcon(layer.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-[11px] truncate">{layer.name}</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700 shrink-0">
                          {layer.sourceSatellite.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {layer.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Layer Details, Opacity & Date Controls */}
          {activeLayer ? (
            <div className="pt-2 border-t border-slate-800 space-y-3 animate-fadeIn">
              {/* Opacity Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-slate-400" /> Layer Opacity
                  </span>
                  <span className="font-mono text-emerald-400">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Imagery Date selector for truecolor layers */}
              {activeLayer.historicalSupport && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" /> Observation Date
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">YYYY-MM-DD</span>
                  </div>
                  <input
                    type="date"
                    value={imageryDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => onChangeImageryDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Layer Legend & Scientific Interpretation */}
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-[10px] space-y-1.5">
                <div className="text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-emerald-400" />
                  <span className="font-semibold text-slate-300">Observation Legend:</span>
                </div>
                <p className="text-slate-300 leading-normal">{activeLayer.legendDescription}</p>
                <div className="text-[9px] text-slate-500 font-mono">
                  Attribution: {activeLayer.attribution}
                </div>
              </div>

              {/* Worldview Direct Deep Link */}
              <div className="pt-1">
                <a
                  href={generateWorldviewUrl(currentLat, currentLng, 8, imageryDate)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                  title="Inspect this coordinate in NASA Worldview full-screen browser"
                >
                  <span>Open in NASA Worldview Inspector</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Base map is Google Maps optical/hybrid. Toggle any NASA GIBS layer above to overlay genuine NASA satellite observations over Maharashtra.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
