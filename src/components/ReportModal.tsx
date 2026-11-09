import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Database,
  Layers,
} from 'lucide-react';
import {
  EnvironmentalPointData,
  DataSetStatistics,
  StudyLocation,
} from '../types/nasa';
import { generateScientificPdfReport } from '../services/reportService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: StudyLocation;
  data: EnvironmentalPointData[];
  statistics: DataSetStatistics;
  sources: string[];
  retrievedAt: string;
  isSampleData: boolean;
  heatThreshold: number;
  dryThreshold: number;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  location,
  data,
  statistics,
  sources,
  retrievedAt,
  isSampleData,
  heatThreshold,
  dryThreshold,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      generateScientificPdfReport({
        location,
        data,
        statistics,
        sources,
        retrievedAt,
        isSampleData,
        heatThreshold,
        dryThreshold,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Could not generate PDF. Please try printing the on-screen preview.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPreview = () => {
    window.print();
  };

  const startDate = data[0]?.date || 'N/A';
  const endDate = data[data.length - 1]?.date || 'N/A';

  const daysAboveHeat = data.filter(
    (d) => (d.temperatureMax ?? d.temperatureMean ?? 0) >= heatThreshold
  ).length;

  const daysDry = data.filter((d) => (d.precipitation ?? 0) <= dryThreshold).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                Scientific Research Report Generator
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Agroclimatology Assessment · NASA Space Apps Challenge 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPreview}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Print formatted preview"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-50 text-emerald-800 text-xs px-6 py-2.5 border-b border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Scientific PDF successfully generated and downloaded to your device!
            </span>
          </div>
        )}

        {/* Scrollable Printable Document Preview */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
          {/* Document Header Band */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 font-bold">
                  NASA-POWER AGROCLIMATOLOGY ASSESSMENT REPORT
                </span>
                <h1 className="text-2xl font-black text-slate-950 mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                  FieldShift Science Explorer Report
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  An Independent Research Investigation Inspired by NASA Space Apps Challenge 2026
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-500">
                <div>Date: {new Date().toLocaleDateString()}</div>
                <div>Status: {isSampleData ? 'Reference Sample' : 'Live NASA API'}</div>
              </div>
            </div>
          </div>

          {/* Study Target & Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">STUDY LOCATION</span>
              <strong className="text-slate-900 text-sm">{location.name}</strong>
              <div className="text-slate-600 mt-0.5">{location.region}, {location.country}</div>
              <div className="text-slate-500 mt-0.5">
                Latitude: {location.latitude}°N · Longitude: {location.longitude}°E
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">TEMPORAL BOUNDARY</span>
              <strong className="text-slate-900 text-sm">{startDate} to {endDate}</strong>
              <div className="text-slate-600 mt-0.5">
                Total Steps: {data.length} daily observations ({statistics.validDays} valid)
              </div>
              <div className="text-slate-500 mt-0.5">
                Data Source: NASA Langley Research Center POWER Project (v2.10.0)
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              1. Executive Environmental Summary
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              This agroclimatological evaluation investigates daily atmospheric and solar products for <strong className="text-slate-900">{location.name}</strong> over {statistics.validDays} valid observation days. The location registered an average 2-meter air temperature of <strong className="font-mono">{statistics.tempMean ?? 'N/A'} °C</strong>, reaching a peak daily maximum of <strong className="font-mono">{statistics.tempMax ?? 'N/A'} °C</strong>. Cumulative precipitation reached <strong className="font-mono">{statistics.precipTotal ?? 'N/A'} mm</strong> across {statistics.wetDaysCount} wet days, with an observed longest dry stretch of <strong className="font-mono">{statistics.longestDrySpell} days</strong>. Solar irradiance averaged <strong className="font-mono">{statistics.solarMean ?? 'N/A'} MJ/m²/day</strong>.
            </p>
          </div>

          {/* Section 2: Descriptive Statistics Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              2. Descriptive Statistics Baseline
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-mono border-b border-slate-200">
                    <th className="p-2.5">Parameter</th>
                    <th className="p-2.5">Mean</th>
                    <th className="p-2.5">Min</th>
                    <th className="p-2.5">Max</th>
                    <th className="p-2.5">Median</th>
                    <th className="p-2.5">Dispersion / Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  <tr>
                    <td className="p-2.5 text-slate-900 font-semibold font-sans">
                      Temperature at 2m (T2M)
                    </td>
                    <td className="p-2.5">{statistics.tempMean ?? 'N/A'} °C</td>
                    <td className="p-2.5">{statistics.tempMin ?? 'N/A'} °C</td>
                    <td className="p-2.5">{statistics.tempMax ?? 'N/A'} °C</td>
                    <td className="p-2.5">{statistics.tempMedian ?? 'N/A'} °C</td>
                    <td className="p-2.5">σ = {statistics.tempStdDev ?? 'N/A'} °C</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-900 font-semibold font-sans">
                      Precipitation (PRECTOTCORR)
                    </td>
                    <td className="p-2.5">{statistics.precipMean ?? 'N/A'} mm/d</td>
                    <td className="p-2.5">0.0 mm</td>
                    <td className="p-2.5">{statistics.precipMax ?? 'N/A'} mm</td>
                    <td className="p-2.5">0.0 mm</td>
                    <td className="p-2.5">Σ = {statistics.precipTotal ?? 'N/A'} mm</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-900 font-semibold font-sans">
                      Solar Radiation (ALLSKY_SW)
                    </td>
                    <td className="p-2.5">{statistics.solarMean ?? 'N/A'} MJ/m²</td>
                    <td className="p-2.5">{statistics.solarMin ?? 'N/A'} MJ/m²</td>
                    <td className="p-2.5">{statistics.solarMax ?? 'N/A'} MJ/m²</td>
                    <td className="p-2.5">N/A</td>
                    <td className="p-2.5">CERES Satellite</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-900 font-semibold font-sans">
                      Relative Humidity (RH2M)
                    </td>
                    <td className="p-2.5">{statistics.humidityMean ?? 'N/A'} %</td>
                    <td className="p-2.5">N/A</td>
                    <td className="p-2.5">N/A</td>
                    <td className="p-2.5">N/A</td>
                    <td className="p-2.5">MERRA-2 2m Vapor</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-900 font-semibold font-sans">
                      Wind Speed at 2m (WS2M)
                    </td>
                    <td className="p-2.5">{statistics.windSpeedMean ?? 'N/A'} m/s</td>
                    <td className="p-2.5">N/A</td>
                    <td className="p-2.5">N/A</td>
                    <td className="p-2.5">N/A</td>
                    <td className="p-2.5">Boundary Layer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Risk & Thresholds */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
              3. Agricultural Threshold & Vulnerability Findings
            </h3>
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <p>
                • <strong>Thermal Stress Threshold (≥ {heatThreshold}°C):</strong> {daysAboveHeat} days recorded maximum temperatures surpassing {heatThreshold}°C. Sustained periods of high afternoon heat elevate vapor pressure deficit (VPD) and reduce pollen viability.
              </p>
              <p>
                • <strong>Precipitation Deficit (≤ {dryThreshold} mm/day):</strong> {daysDry} days recorded minimal or zero precipitation, with the longest continuous dry spell lasting {statistics.longestDrySpell} days.
              </p>
              <p>
                • <strong>Diurnal Temperature Range:</strong> Significant day-to-night temperature differentials can suppress net carbon assimilation if warm nights increase dark respiration rates.
              </p>
            </div>
          </div>

          {/* Section 4: Scientific Limitations & Educational Scope */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5 text-amber-950">
            <h4 className="font-bold uppercase font-mono text-[11px] flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>4. Scientific Limitations & Data Provenance Notice</span>
            </h4>
            <p className="leading-relaxed">
              1. <strong>Gridded Reanalysis Resolution:</strong> NASA POWER values represent a 0.5° × 0.5° (approx. 50 km) or 0.625° × 0.5° grid box and do not capture micro-topographical thermal inversion or localized canal valley cooling.
            </p>
            <p className="leading-relaxed">
              2. <strong>Ground Instrumentation Triangulation:</strong> Satellite retrievals (MODIS, CERES) and numerical model assimilation (MERRA-2) must be cross-verified with on-farm tensiometers, soil moisture probes, and local weather stations.
            </p>
            <p className="leading-relaxed">
              3. <strong>Educational Research Statement:</strong> FieldShift is an educational research tool. This report does not replace certified agronomic advice, soil testing laboratory analyses, or official meteorological alerts from the India Meteorological Department (IMD).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
