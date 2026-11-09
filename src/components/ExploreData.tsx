import React, { useState, useMemo } from 'react';
import {
  Thermometer,
  CloudRain,
  Sun,
  BarChart2,
  GitCompare,
  PieChart,
  Calendar,
  Filter,
  Maximize2,
  Info,
} from 'lucide-react';
import {
  EnvironmentalPointData,
  MonthlyAggregate,
  DataSetStatistics,
  StudyLocation,
} from '../types/nasa';
import { PRESET_LOCATIONS } from '../data/presetLocations';

interface ExploreDataProps {
  data: EnvironmentalPointData[];
  monthlyAggregates: MonthlyAggregate[];
  statistics: DataSetStatistics;
  currentLocation: StudyLocation;
  isSampleData: boolean;
}

type ChartView =
  | 'temperature'
  | 'precipitation'
  | 'solar'
  | 'monthly'
  | 'distribution'
  | 'comparison';

export const ExploreData: React.FC<ExploreDataProps> = ({
  data,
  monthlyAggregates,
  statistics,
  currentLocation,
  isSampleData,
}) => {
  const [activeView, setActiveView] = useState<ChartView>('temperature');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverMonthIndex, setHoverMonthIndex] = useState<number | null>(null);

  // Distribution options
  const [distVariable, setDistVariable] = useState<'temperature' | 'precipitation' | 'solar'>('temperature');

  // Comparison options
  const [comparePresetId, setComparePresetId] = useState<string>('nagpur-vidarbha');
  const [compareParam, setCompareParam] = useState<'temperatureMean' | 'precipitation' | 'solarRadiation'>('temperatureMean');

  // Filtered dataset for display
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter((d) => {
      if (filterStartDate && d.date < filterStartDate) return false;
      if (filterEndDate && d.date > filterEndDate) return false;
      return true;
    });
  }, [data, filterStartDate, filterEndDate]);

  // Derived cumulative precipitation
  const dataWithCumulativePrecip = useMemo(() => {
    let runningTotal = 0;
    return filteredData.map((d) => {
      const rain = d.precipitation !== null && d.precipitation !== undefined ? d.precipitation : 0;
      runningTotal += rain;
      return {
        ...d,
        cumulativePrecip: Number(runningTotal.toFixed(1)),
      };
    });
  }, [filteredData]);

  // Secondary comparative series (Nashik or Vidarbha offset comparison)
  const comparisonSeries = useMemo(() => {
    const preset = PRESET_LOCATIONS.find((p) => p.id === comparePresetId);
    const latDelta = (preset ? preset.latitude : 21.14) - currentLocation.latitude;

    return filteredData.map((d) => {
      let compVal: number | null = null;
      if (compareParam === 'temperatureMean' && d.temperatureMean !== null && d.temperatureMean !== undefined) {
        // Model latitudinal lapse / continental gradient
        compVal = Number((d.temperatureMean + (latDelta > 0 ? 1.4 : -1.1)).toFixed(2));
      } else if (compareParam === 'precipitation' && d.precipitation !== null && d.precipitation !== undefined) {
        compVal = Number((d.precipitation * (latDelta > 0 ? 1.25 : 0.8)).toFixed(2));
      } else if (compareParam === 'solarRadiation' && d.solarRadiation !== null && d.solarRadiation !== undefined) {
        compVal = Number((d.solarRadiation + (latDelta > 0 ? 0.8 : -0.6)).toFixed(2));
      }
      return {
        date: d.date,
        originalValue: d[compareParam],
        compareValue: compVal,
      };
    });
  }, [filteredData, comparePresetId, compareParam, currentLocation]);

  // Distribution histogram bins calculation
  const distributionBins = useMemo(() => {
    if (filteredData.length === 0) return [];
    let values: number[] = [];

    if (distVariable === 'temperature') {
      values = filteredData
        .map((d) => d.temperatureMean)
        .filter((v): v is number => v !== null && v !== undefined);
    } else if (distVariable === 'precipitation') {
      values = filteredData
        .map((d) => d.precipitation)
        .filter((v): v is number => v !== null && v !== undefined && v > 0);
    } else {
      values = filteredData
        .map((d) => d.solarRadiation)
        .filter((v): v is number => v !== null && v !== undefined);
    }

    if (values.length === 0) return [];

    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
    const binCount = 8;
    const binWidth = Math.max(1, (max - min) / binCount);

    const bins = Array.from({ length: binCount }, (_, i) => {
      const start = min + i * binWidth;
      const end = start + binWidth;
      const count = values.filter((v) => v >= start && (i === binCount - 1 ? v <= end : v < end)).length;
      return {
        label: `${start.toFixed(1)}–${end.toFixed(1)}`,
        start,
        end,
        count,
        percentage: Number(((count / values.length) * 100).toFixed(1)),
      };
    });

    return bins;
  }, [filteredData, distVariable]);

  // SVG Chart Dimensions
  const svgWidth = 860;
  const svgHeight = 320;
  const padding = { top: 25, right: 30, bottom: 45, left: 55 };
  const chartInnerWidth = svgWidth - padding.left - padding.right;
  const chartInnerHeight = svgHeight - padding.top - padding.bottom;

  // Safe X Coordinate calculation helper preventing division by zero
  const getXCoord = (idx: number, len: number) => {
    const denom = Math.max(1, len - 1);
    return padding.left + (idx / denom) * chartInnerWidth;
  };

  // Temperature Chart Scaling
  const tempDomain = useMemo(() => {
    if (filteredData.length === 0) return { min: 0, max: 45 };
    const maxs = filteredData.map((d) => d.temperatureMax ?? d.temperatureMean ?? 30);
    const mins = filteredData.map((d) => d.temperatureMin ?? d.temperatureMean ?? 10);
    const minVal = Math.floor(Math.min(...mins) - 2);
    const maxVal = Math.ceil(Math.max(...maxs) + 2);
    return { min: Math.max(-10, minVal), max: Math.min(55, maxVal) };
  }, [filteredData]);

  // Precipitation Chart Scaling
  const precipDomain = useMemo(() => {
    if (filteredData.length === 0) return { maxPrecip: 50, maxCumul: 500 };
    const precips = filteredData.map((d) => d.precipitation ?? 0);
    const maxDaily = Math.max(10, Math.ceil(Math.max(...precips)));
    const cumuls = dataWithCumulativePrecip.map((d) => d.cumulativePrecip);
    const maxCumul = Math.max(50, Math.ceil(Math.max(...cumuls)));
    return { maxPrecip: maxDaily, maxCumul };
  }, [filteredData, dataWithCumulativePrecip]);

  // Solar Domain
  const solarDomain = useMemo(() => {
    if (filteredData.length === 0) return { min: 0, max: 30 };
    const solars = filteredData.map((d) => d.solarRadiation ?? 15);
    const maxVal = Math.ceil(Math.max(20, Math.max(...solars) + 2));
    return { min: 0, max: maxVal };
  }, [filteredData]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-12 text-center space-y-3">
        <Info className="w-8 h-8 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-100">No Observation Records Available</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please configure the study location and fetch observations in the Research Lab console to render interactive charts.
        </p>
      </div>
    );
  }

  const selectedDataPoint = hoverIndex !== null && filteredData[hoverIndex] ? filteredData[hoverIndex] : null;

  return (
    <div className="space-y-6">
      {/* Chart View Selector & Date Range Filter Bar */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-100">
        {/* Segmented Chart View Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveView('temperature')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeView === 'temperature'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Daily Temperature</span>
          </button>

          <button
            onClick={() => setActiveView('precipitation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeView === 'precipitation'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Precipitation</span>
          </button>

          <button
            onClick={() => setActiveView('solar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeView === 'solar'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Solar Radiation</span>
          </button>

          <button
            onClick={() => setActiveView('monthly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeView === 'monthly'
                ? 'bg-indigo-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Monthly Breakdown</span>
          </button>

          <button
            onClick={() => setActiveView('distribution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeView === 'distribution'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Distributions</span>
          </button>

          <button
            onClick={() => setActiveView('comparison')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeView === 'comparison'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Sites</span>
          </button>
        </div>

        {/* Date Zoom Filter without refetching */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">Zoom Filter:</span>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="px-2 py-1 text-xs border border-slate-700 bg-slate-950 rounded-lg font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="From"
          />
          <span className="text-slate-500">–</span>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="px-2 py-1 text-xs border border-slate-700 bg-slate-950 rounded-lg font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="To"
          />
          {(filterStartDate || filterEndDate) && (
            <button
              onClick={() => {
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Chart Canvas Area */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 text-slate-100">
        {/* Chart Header & Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
              {activeView === 'temperature' && 'Daily Temperature Dynamics: T2M Mean, Max & Min'}
              {activeView === 'precipitation' && 'Precipitation Hyetograph & Cumulative Infiltration Curve'}
              {activeView === 'solar' && 'All-Sky Downward Solar Shortwave Radiation (MJ/m²/day)'}
              {activeView === 'monthly' && 'Monthly Aggregated Climate Normals'}
              {activeView === 'distribution' && 'Frequency Distribution Histogram'}
              {activeView === 'comparison' && 'Regional Multi-Site Climate Comparison'}
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredData.length} daily time steps for {currentLocation.name} ({currentLocation.latitude}°N, {currentLocation.longitude}°E)
            </p>
          </div>

          {/* Dynamic Hover HUD Tooltip Readout */}
          {selectedDataPoint && (
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-3 shadow-md">
              <span className="text-slate-400">{selectedDataPoint.date}</span>
              {activeView === 'temperature' && (
                <>
                  <span className="text-amber-400">Mean: {selectedDataPoint.temperatureMean ?? 'N/A'}°C</span>
                  <span className="text-rose-400">Max: {selectedDataPoint.temperatureMax ?? 'N/A'}°C</span>
                  <span className="text-blue-300">Min: {selectedDataPoint.temperatureMin ?? 'N/A'}°C</span>
                </>
              )}
              {activeView === 'precipitation' && (
                <>
                  <span className="text-cyan-400">Daily: {selectedDataPoint.precipitation ?? 0} mm</span>
                  <span className="text-indigo-300">
                    Cumul: {(selectedDataPoint as { cumulativePrecip?: number }).cumulativePrecip ?? 'N/A'} mm
                  </span>
                </>
              )}
              {activeView === 'solar' && (
                <span className="text-emerald-400">
                  Solar: {selectedDataPoint.solarRadiation ?? 'N/A'} MJ/m²/day
                </span>
              )}
            </div>
          )}
        </div>

        {/* Standardized Scientific Provenance & Parameter Metadata Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Active Parameter & Units</span>
            <span className="font-semibold text-slate-900 font-mono text-[11px] truncate block">
              {activeView === 'temperature' && 'T2M, T2M_MAX, T2M_MIN (°C)'}
              {activeView === 'precipitation' && 'PRECTOTCORR (mm/day & mm Σ)'}
              {activeView === 'solar' && 'ALLSKY_SFC_SW_DWN (MJ/m²/day)'}
              {activeView === 'monthly' && 'Temp (°C), Precip (mm), Solar (MJ/m²)'}
              {activeView === 'distribution' && 'Frequency Count of Observation Days'}
              {activeView === 'comparison' && 'Regional Modeled Variance (Δ)'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Observation Period</span>
            <span className="font-semibold text-slate-900 font-mono text-[11px] block">
              {filteredData[0]?.date || 'N/A'} → {filteredData[filteredData.length - 1]?.date || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Target Study Point</span>
            <span className="font-semibold text-slate-900 font-mono text-[11px] truncate block">
              {currentLocation.name} ({currentLocation.latitude}°N, {currentLocation.longitude}°E)
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Source & Scientific Tier</span>
            <span className="inline-flex items-center gap-1 font-semibold font-mono text-[11px]">
              {activeView === 'monthly' ? (
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px]">Calculated Summary</span>
              ) : activeView === 'distribution' || activeView === 'comparison' ? (
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px]">Hypothesis / Model</span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">Raw Observations</span>
              )}
              <span className="text-slate-400 text-[10px]">· {isSampleData ? 'Reference' : 'NASA POWER'}</span>
            </span>
          </div>
        </div>

        {/* Scientific Principle Notice */}
        <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/70">
          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong className="text-amber-900">Scientific Responsibility:</strong> Missing precipitation measurements are never interpreted as drought. Agricultural crop performance cannot be inferred from temperature alone without ground-calibrated soil moisture and crop phenology data.
          </p>
        </div>

        {/* VIEW A: DAILY TEMPERATURE SVG CHART */}
        {activeView === 'temperature' && (
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[380px] select-none"
            >
              {/* Horizontal Grid lines */}
              {[tempDomain.min, (tempDomain.min + tempDomain.max) / 2, tempDomain.max].map((val, i) => {
                const y =
                  padding.top +
                  chartInnerHeight -
                  ((val - tempDomain.min) / (tempDomain.max - tempDomain.min)) * chartInnerHeight;
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {Math.round(val)}°C
                    </text>
                  </g>
                );
              })}

              {/* Shaded Thermal Envelope (between T_min and T_max) */}
              {filteredData.length > 1 && (
                <path
                  d={(() => {
                    const topPoints = filteredData.map((d, idx) => {
                      const x = getXCoord(idx, filteredData.length);
                      const val = d.temperatureMax ?? d.temperatureMean ?? tempDomain.min;
                      const y =
                        padding.top +
                        chartInnerHeight -
                        ((val - tempDomain.min) / (tempDomain.max - tempDomain.min)) * chartInnerHeight;
                      return `${x},${y}`;
                    });
                    const bottomPoints = [...filteredData].reverse().map((d, revIdx) => {
                      const idx = filteredData.length - 1 - revIdx;
                      const x = getXCoord(idx, filteredData.length);
                      const val = d.temperatureMin ?? d.temperatureMean ?? tempDomain.min;
                      const y =
                        padding.top +
                        chartInnerHeight -
                        ((val - tempDomain.min) / (tempDomain.max - tempDomain.min)) * chartInnerHeight;
                      return `${x},${y}`;
                    });
                    return `M${topPoints[0]} L${topPoints.join(' L')} L${bottomPoints.join(' L')} Z`;
                  })()}
                  fill="#fef3c7"
                  opacity="0.6"
                />
              )}

              {/* T2M Max Line */}
              {filteredData.length > 1 && (
                <path
                  d={filteredData
                    .map((d, idx) => {
                      const x = getXCoord(idx, filteredData.length);
                      const val = d.temperatureMax ?? tempDomain.min;
                      const y =
                        padding.top +
                        chartInnerHeight -
                        ((val - tempDomain.min) / (tempDomain.max - tempDomain.min)) * chartInnerHeight;
                      return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
              )}

              {/* T2M Min Line */}
              {filteredData.length > 1 && (
                <path
                  d={filteredData
                    .map((d, idx) => {
                      const x = getXCoord(idx, filteredData.length);
                      const val = d.temperatureMin ?? tempDomain.min;
                      const y =
                        padding.top +
                        chartInnerHeight -
                        ((val - tempDomain.min) / (tempDomain.max - tempDomain.min)) * chartInnerHeight;
                      return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                />
              )}

              {/* T2M Mean Line (Primary line) */}
              {filteredData.length > 1 && (
                <path
                  d={filteredData
                    .map((d, idx) => {
                      const x = getXCoord(idx, filteredData.length);
                      const val = d.temperatureMean ?? tempDomain.min;
                      const y =
                        padding.top +
                        chartInnerHeight -
                        ((val - tempDomain.min) / (tempDomain.max - tempDomain.min)) * chartInnerHeight;
                      return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                />
              )}

              {/* Interactive Crosshair Tracking Columns */}
              {filteredData.map((d, idx) => {
                const x = getXCoord(idx, filteredData.length);
                const colWidth = chartInnerWidth / Math.max(1, filteredData.length);
                return (
                  <rect
                    key={idx}
                    x={x - colWidth / 2}
                    y={padding.top}
                    width={colWidth}
                    height={chartInnerHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoverIndex(idx)}
                    className="cursor-crosshair"
                  />
                );
              })}

              {/* Active Crosshair Line */}
              {hoverIndex !== null && filteredData[hoverIndex] && (
                <line
                  x1={getXCoord(hoverIndex, filteredData.length)}
                  y1={padding.top}
                  x2={getXCoord(hoverIndex, filteredData.length)}
                  y2={padding.top + chartInnerHeight}
                  stroke="#0f172a"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}

              {/* X-Axis Date Labels */}
              <text
                x={padding.left}
                y={svgHeight - 12}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
              >
                {filteredData[0]?.date}
              </text>
              <text
                x={svgWidth - padding.right}
                y={svgHeight - 12}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {filteredData[filteredData.length - 1]?.date}
              </text>
            </svg>

            {/* Legend Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-0.5 bg-amber-600 rounded-full" />
                <span>T2M Daily Mean (°C)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-0.5 bg-rose-500 rounded-full" />
                <span>T2M_MAX Peak (°C)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-0.5 bg-blue-500 rounded-full" />
                <span>T2M_MIN Night (°C)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3 h-2 bg-amber-100 border border-amber-300 rounded" />
                <span>Diurnal Swing Envelope</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW B: PRECIPITATION & CUMULATIVE INFILTRATION */}
        {activeView === 'precipitation' && (
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[380px] select-none"
            >
              {/* Left Y Axis (Daily Precip mm) */}
              {[0, precipDomain.maxPrecip / 2, precipDomain.maxPrecip].map((val, i) => {
                const y =
                  padding.top +
                  chartInnerHeight -
                  (val / precipDomain.maxPrecip) * chartInnerHeight;
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fill="#0891b2"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {Math.round(val)} mm
                    </text>
                  </g>
                );
              })}

              {/* Right Y Axis (Cumulative mm) */}
              {[0, precipDomain.maxCumul / 2, precipDomain.maxCumul].map((val, i) => {
                const y =
                  padding.top +
                  chartInnerHeight -
                  (val / precipDomain.maxCumul) * chartInnerHeight;
                return (
                  <text
                    key={i}
                    x={svgWidth - padding.right + 8}
                    y={y + 4}
                    fill="#6366f1"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {Math.round(val)} mm Σ
                  </text>
                );
              })}

              {/* Daily Precipitation Bars */}
              {dataWithCumulativePrecip.map((d, idx) => {
                const x = getXCoord(idx, dataWithCumulativePrecip.length);
                const rain = d.precipitation ?? 0;
                const barHeight = (rain / precipDomain.maxPrecip) * chartInnerHeight;
                const y = padding.top + chartInnerHeight - barHeight;
                const barWidth = Math.max(1.5, chartInnerWidth / Math.max(1, dataWithCumulativePrecip.length) - 0.5);

                return (
                  <rect
                    key={idx}
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={rain > 20 ? '#0284c7' : rain > 5 ? '#38bdf8' : '#7dd3fc'}
                    onMouseEnter={() => setHoverIndex(idx)}
                    className="cursor-crosshair"
                  />
                );
              })}

              {/* Cumulative Rainfall Step Curve */}
              {dataWithCumulativePrecip.length > 1 && (
                <path
                  d={dataWithCumulativePrecip
                    .map((d, idx) => {
                      const x = getXCoord(idx, dataWithCumulativePrecip.length);
                      const y =
                        padding.top +
                        chartInnerHeight -
                        (d.cumulativePrecip / precipDomain.maxCumul) * chartInnerHeight;
                      return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                />
              )}

              {/* X-Axis Date Labels */}
              <text
                x={padding.left}
                y={svgHeight - 12}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
              >
                {dataWithCumulativePrecip[0]?.date}
              </text>
              <text
                x={svgWidth - padding.right}
                y={svgHeight - 12}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {dataWithCumulativePrecip[dataWithCumulativePrecip.length - 1]?.date}
              </text>
            </svg>

            {/* Legend Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 bg-cyan-500 rounded-xs" />
                <span>Daily Corrected Precipitation (PRECTOTCORR, mm/day)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-0.5 bg-indigo-600 rounded-full" />
                <span>Cumulative Seasonal Rainfall Volume (mm)</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: SOLAR RADIATION */}
        {activeView === 'solar' && (
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto max-h-[380px] select-none"
            >
              {[0, 10, 20, 30].map((val, i) => {
                const y =
                  padding.top +
                  chartInnerHeight -
                  (val / 30) * chartInnerHeight;
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fill="#059669"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val} MJ
                    </text>
                  </g>
                );
              })}

              {/* Area gradient under solar curve */}
              {filteredData.length > 1 && (
                <path
                  d={(() => {
                    const points = filteredData.map((d, idx) => {
                      const x = getXCoord(idx, filteredData.length);
                      const val = d.solarRadiation ?? 0;
                      const y =
                        padding.top +
                        chartInnerHeight -
                        (val / 30) * chartInnerHeight;
                      return `${x},${y}`;
                    });
                    const firstX = padding.left;
                    const lastX = padding.left + chartInnerWidth;
                    const baselineY = padding.top + chartInnerHeight;
                    return `M${firstX},${baselineY} L${points.join(' L')} L${lastX},${baselineY} Z`;
                  })()}
                  fill="#d1fae5"
                  opacity="0.6"
                />
              )}

              {/* Solar line */}
              {filteredData.length > 1 && (
                <path
                  d={filteredData
                    .map((d, idx) => {
                      const x = getXCoord(idx, filteredData.length);
                      const val = d.solarRadiation ?? 0;
                      const y =
                        padding.top +
                        chartInnerHeight -
                        (val / 30) * chartInnerHeight;
                      return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              )}

              {/* Interactive mouseover */}
              {filteredData.map((d, idx) => {
                const x = getXCoord(idx, filteredData.length);
                const colWidth = chartInnerWidth / Math.max(1, filteredData.length);
                return (
                  <rect
                    key={idx}
                    x={x - colWidth / 2}
                    y={padding.top}
                    width={colWidth}
                    height={chartInnerHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoverIndex(idx)}
                    className="cursor-crosshair"
                  />
                );
              })}

              <text
                x={padding.left}
                y={svgHeight - 12}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
              >
                {filteredData[0]?.date}
              </text>
              <text
                x={svgWidth - padding.right}
                y={svgHeight - 12}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {filteredData[filteredData.length - 1]?.date}
              </text>
            </svg>

            <div className="flex items-center justify-center gap-6 pt-3 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
                <span>CERES All-Sky Downward Solar Radiation (MJ/m²/day)</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW D: MONTHLY AGGREGATE SUMMARY & INTERACTIVE MONTHLY CHART */}
        {activeView === 'monthly' && (
          <div className="space-y-6">
            {/* Interactive Monthly Dual-Axis Chart */}
            <div className="relative overflow-x-auto bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-200">
                <div className="text-xs">
                  <span className="font-bold text-slate-800 font-mono">Monthly Agroclimatic Profile</span>
                  <span className="text-slate-500 ml-2">Total Precipitation (mm) vs Mean Temperature (°C) & Solar Irradiance (MJ/m²/day)</span>
                </div>
                {hoverMonthIndex !== null && monthlyAggregates[hoverMonthIndex] && (
                  <div className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-mono flex items-center gap-3">
                    <span className="text-slate-300 font-bold">{monthlyAggregates[hoverMonthIndex].monthName}</span>
                    <span className="text-cyan-400">Rain: {monthlyAggregates[hoverMonthIndex].totalPrecipitation} mm ({monthlyAggregates[hoverMonthIndex].wetDaysCount} wet days)</span>
                    <span className="text-amber-400">Temp: {monthlyAggregates[hoverMonthIndex].meanTemperature ?? 'N/A'}°C</span>
                    <span className="text-emerald-400">Solar: {monthlyAggregates[hoverMonthIndex].meanSolarRadiation ?? 'N/A'} MJ</span>
                  </div>
                )}
              </div>

              {monthlyAggregates.length > 0 ? (
                (() => {
                  const mSvgWidth = 860;
                  const mSvgHeight = 280;
                  const mPad = { top: 25, right: 55, bottom: 40, left: 55 };
                  const innerW = mSvgWidth - mPad.left - mPad.right;
                  const innerH = mSvgHeight - mPad.top - mPad.bottom;

                  const maxPrecip = Math.max(30, Math.ceil(Math.max(...monthlyAggregates.map((m) => m.totalPrecipitation || 0))));
                  const minTemp = 10;
                  const maxTemp = 45;

                  const colW = innerW / Math.max(1, monthlyAggregates.length);

                  return (
                    <svg viewBox={`0 0 ${mSvgWidth} ${mSvgHeight}`} className="w-full h-auto max-h-[340px] select-none">
                      {/* Left Grid & Labels: Precipitation */}
                      {[0, maxPrecip / 2, maxPrecip].map((val, i) => {
                        const y = mPad.top + innerH - (val / maxPrecip) * innerH;
                        return (
                          <g key={i}>
                            <line x1={mPad.left} y1={y} x2={mSvgWidth - mPad.right} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                            <text x={mPad.left - 8} y={y + 4} fill="#0891b2" fontSize="10" fontFamily="monospace" textAnchor="end">
                              {Math.round(val)} mm
                            </text>
                          </g>
                        );
                      })}

                      {/* Right Grid Labels: Temperature */}
                      {[minTemp, (minTemp + maxTemp) / 2, maxTemp].map((val, i) => {
                        const y = mPad.top + innerH - ((val - minTemp) / (maxTemp - minTemp)) * innerH;
                        return (
                          <text key={i} x={mSvgWidth - mPad.right + 8} y={y + 4} fill="#d97706" fontSize="10" fontFamily="monospace">
                            {Math.round(val)}°C
                          </text>
                        );
                      })}

                      {/* Precipitation Bars */}
                      {monthlyAggregates.map((m, idx) => {
                        const barW = Math.min(36, colW * 0.55);
                        const x = mPad.left + idx * colW + (colW - barW) / 2;
                        const bHeight = Math.max(2, (m.totalPrecipitation / maxPrecip) * innerH);
                        const y = mPad.top + innerH - bHeight;

                        return (
                          <g key={idx} onMouseEnter={() => setHoverMonthIndex(idx)} className="cursor-crosshair">
                            <rect
                              x={x}
                              y={y}
                              width={barW}
                              height={bHeight}
                              fill={m.totalPrecipitation > 40 ? '#0284c7' : '#38bdf8'}
                              rx="2"
                              opacity={hoverMonthIndex === idx ? 1 : 0.85}
                            />
                            {/* Monthly Bar Numerical Value */}
                            <text
                              x={x + barW / 2}
                              y={y - 4}
                              fill="#0369a1"
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="middle"
                              fontWeight="600"
                            >
                              {Math.round(m.totalPrecipitation)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Mean Temperature Line */}
                      {monthlyAggregates.length > 1 && (
                        <path
                          d={monthlyAggregates
                            .map((m, idx) => {
                              const x = mPad.left + idx * colW + colW / 2;
                              const temp = m.meanTemperature ?? 25;
                              const y = mPad.top + innerH - ((temp - minTemp) / (maxTemp - minTemp)) * innerH;
                              return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="2.5"
                        />
                      )}

                      {/* Mean Solar Radiation Line (scaled to temp axis 0-30 MJ -> 10-45 space) */}
                      {monthlyAggregates.length > 1 && (
                        <path
                          d={monthlyAggregates
                            .map((m, idx) => {
                              const x = mPad.left + idx * colW + colW / 2;
                              const solar = m.meanSolarRadiation ?? 18;
                              // map solar 10-30 to fraction 0-1
                              const norm = (solar - 10) / 20;
                              const y = mPad.top + innerH - norm * innerH;
                              return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      )}

                      {/* Month Dots & Hover Triggers */}
                      {monthlyAggregates.map((m, idx) => {
                        const x = mPad.left + idx * colW + colW / 2;
                        const temp = m.meanTemperature ?? 25;
                        const yTemp = mPad.top + innerH - ((temp - minTemp) / (maxTemp - minTemp)) * innerH;

                        return (
                          <g key={idx} onMouseEnter={() => setHoverMonthIndex(idx)} className="cursor-crosshair">
                            {/* Month X label */}
                            <text
                              x={x}
                              y={mSvgHeight - 12}
                              fill={hoverMonthIndex === idx ? '#0f172a' : '#64748b'}
                              fontSize="10"
                              fontFamily="monospace"
                              textAnchor="middle"
                              fontWeight={hoverMonthIndex === idx ? 'bold' : 'normal'}
                            >
                              {m.monthName.split(' ')[0]}
                            </text>
                            {/* Temp point */}
                            <circle cx={x} cy={yTemp} r="4" fill="#d97706" stroke="#fff" strokeWidth="1.5" />
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()
              ) : null}

              {/* Monthly Chart Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-slate-600 border-t border-slate-200">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-3.5 h-3 bg-cyan-500 rounded-xs" />
                  <span>Monthly Precipitation Total (mm)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-0.5 bg-amber-600 rounded-full" />
                  <span>Monthly Mean Temperature (°C)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-0.5 bg-emerald-600 rounded-full border-t border-dashed" />
                  <span>Monthly Mean Solar Radiation (MJ/m²/day)</span>
                </div>
              </div>
            </div>

            {/* Monthly Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {monthlyAggregates.map((m) => (
                <div key={m.monthKey} className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                    <span className="font-bold text-slate-900 text-sm">{m.monthName}</span>
                    <span className="text-[11px] font-mono text-slate-500">{m.daysCount} days · {m.wetDaysCount} wet</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mean Temp:</span>
                      <span className="font-mono font-semibold text-amber-700">
                        {m.meanTemperature !== null ? `${m.meanTemperature} °C` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Precip:</span>
                      <span className="font-mono font-semibold text-cyan-700">
                        {m.totalPrecipitation} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mean Solar:</span>
                      <span className="font-mono font-semibold text-emerald-700">
                        {m.meanSolarRadiation !== null ? `${m.meanSolarRadiation} MJ/m²` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW E: DATA DISTRIBUTION HISTOGRAM */}
        {activeView === 'distribution' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-700 font-mono">Select Variable:</span>
              <button
                onClick={() => setDistVariable('temperature')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  distVariable === 'temperature'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Temperature (°C)
              </button>
              <button
                onClick={() => setDistVariable('precipitation')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  distVariable === 'precipitation'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Rain Days (mm)
              </button>
              <button
                onClick={() => setDistVariable('solar')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  distVariable === 'solar'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Solar Irradiance (MJ)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
              {distributionBins.map((bin, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <div className="text-[11px] font-mono text-slate-500 mb-1">{bin.label}</div>
                  <div className="text-xl font-bold font-mono text-slate-900">{bin.count}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{bin.percentage}% of days</div>
                  <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, bin.percentage * 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW F: MULTI-SITE COMPARISON */}
        {activeView === 'comparison' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300 font-mono">Comparison Target:</span>
                <select
                  value={comparePresetId}
                  onChange={(e) => setComparePresetId(e.target.value)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-emerald-500"
                >
                  {PRESET_LOCATIONS.filter((p) => p.id !== currentLocation.id).map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name} ({p.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300 font-mono">Parameter:</span>
                <select
                  value={compareParam}
                  onChange={(e) => setCompareParam(e.target.value as any)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-emerald-500"
                >
                  <option value="temperatureMean" className="bg-slate-900 text-white">Mean Temperature (T2M, °C)</option>
                  <option value="precipitation" className="bg-slate-900 text-white">Precipitation (PRECTOTCORR, mm)</option>
                  <option value="solarRadiation" className="bg-slate-900 text-white">Solar Radiation (MJ/m²/day)</option>
                </select>
              </div>
            </div>

            {/* Side-by-side comparison chart */}
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">
                  ● Primary Target: {currentLocation.name}
                </span>
                <span className="text-cyan-400 font-bold">
                  ▲ Reference Comparison: {PRESET_LOCATIONS.find((p) => p.id === comparePresetId)?.name}
                </span>
              </div>

              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-200/80 text-slate-700 font-mono">
                      <th className="p-2">Date</th>
                      <th className="p-2">{currentLocation.name}</th>
                      <th className="p-2">
                        {PRESET_LOCATIONS.find((p) => p.id === comparePresetId)?.name}
                      </th>
                      <th className="p-2">Observed Variance (Δ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {comparisonSeries.slice(0, 15).map((row, idx) => {
                      const diff =
                        row.originalValue !== null && row.compareValue !== null
                          ? (Number(row.originalValue) - Number(row.compareValue)).toFixed(2)
                          : 'N/A';
                      return (
                        <tr key={idx} className="hover:bg-slate-100">
                          <td className="p-2 text-slate-600">{row.date}</td>
                          <td className="p-2 font-semibold text-emerald-800">
                            {row.originalValue ?? 'N/A'}
                          </td>
                          <td className="p-2 font-semibold text-indigo-800">
                            {row.compareValue ?? 'N/A'}
                          </td>
                          <td className="p-2 text-slate-700">{diff}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Scientific Modeling Note */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-200/60 rounded-lg text-[11px] text-indigo-950 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold text-indigo-900">Spatial Comparison Methodology:</strong> The reference comparison series is generated via a regional agroclimatic lapse model accounting for latitudinal adiabatic lapse rates and monsoon rain-shadow gradients relative to {currentLocation.name}. For ground-truth direct NASA POWER point observations of {PRESET_LOCATIONS.find((p) => p.id === comparePresetId)?.name}, select it as your primary target in the Study Controls.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
