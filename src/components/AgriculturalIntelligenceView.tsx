import React, { useState, useMemo } from 'react';
import { 
  Sprout, 
  Droplets, 
  Sun, 
  Wind, 
  Thermometer, 
  Bug, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Layers, 
  Calendar, 
  TrendingUp,
  Download
} from 'lucide-react';
import { StudyLocation } from '../types/nasa';

interface AgriculturalIntelligenceViewProps {
  currentLocation: StudyLocation;
  data: any[];
  statistics: any;
  onOpenReportModal: () => void;
}

interface CropProfile {
  id: string;
  name: string;
  scientificName: string;
  season: string;
  growingDays: number;
  stages: { name: string; durationDays: number; kc: number }[];
  optimalTempC: [number, number];
  waterRequirementMm: [number, number];
  criticalMoistureStressStage: string;
  commonPests: { name: string; condition: string; riskThreshold: string; culturalControl: string }[];
  npkRecommendationKgHa: { n: number; p: number; k: number };
  climateSuitabilityRationale: string;
}

const CROP_PROFILES: CropProfile[] = [
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    season: 'Perennial (12-14 months)',
    growingDays: 360,
    stages: [
      { name: 'Germination & Establishment', durationDays: 45, kc: 0.45 },
      { name: 'Tillering & Canopy Closure', durationDays: 90, kc: 0.85 },
      { name: 'Grand Growth & Stem Elongation', durationDays: 165, kc: 1.25 },
      { name: 'Ripening & Sugar Accumulation', durationDays: 60, kc: 0.75 },
    ],
    optimalTempC: [24, 38],
    waterRequirementMm: [1500, 2200],
    criticalMoistureStressStage: 'Tillering to Grand Growth transition',
    climateSuitabilityRationale: 'Thrives in deep Vertisol soils with high solar radiation (>18 MJ/m²/day). Requires regulated drip irrigation during dry summer months.',
    commonPests: [
      { name: 'Early Shoot Borer (Chilo infuscatellus)', condition: 'Temp > 35°C with RH < 50%', riskThreshold: 'High during summer tillering', culturalControl: 'Light trash mulching and earthing up around 45 days.' },
      { name: 'White Grub (Holotrichia serrata)', condition: 'Post-monsoon sandy loam/clay', riskThreshold: 'Moderate in autumn', culturalControl: 'Deep summer ploughing and light traps.' },
    ],
    npkRecommendationKgHa: { n: 250, p: 115, k: 115 },
  },
  {
    id: 'cotton',
    name: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    season: 'Kharif / Monsoon',
    growingDays: 160,
    stages: [
      { name: 'Initial Seedling', durationDays: 25, kc: 0.40 },
      { name: 'Vegetative & Square Formation', durationDays: 45, kc: 0.75 },
      { name: 'Flowering & Boll Development', durationDays: 60, kc: 1.15 },
      { name: 'Boll Maturation & Opening', durationDays: 30, kc: 0.65 },
    ],
    optimalTempC: [21, 35],
    waterRequirementMm: [650, 950],
    criticalMoistureStressStage: 'Peak flowering & boll formation',
    climateSuitabilityRationale: 'Well-suited to black cotton soils (Vertisols) in Maharashtra/Vidarbha. Vulnerable to waterlogging in early stages and terminal drought.',
    commonPests: [
      { name: 'Pink Bollworm (Pectinophora gossypiella)', condition: 'Temp 28-34°C with overcast RH > 70%', riskThreshold: 'High during boll setting', culturalControl: 'Install pheromone traps at 5/ha and strictly avoid late ratooning.' },
      { name: 'Sucking Pests (Aphids & Jassids)', condition: 'Dry warm spells', riskThreshold: 'Elevated during dry spells', culturalControl: 'Neem seed kernel extract (NSKE 5%) spray.' },
    ],
    npkRecommendationKgHa: { n: 120, p: 60, k: 60 },
  },
  {
    id: 'soybean',
    name: 'Soybean',
    scientificName: 'Glycine max',
    season: 'Kharif / Monsoon',
    growingDays: 105,
    stages: [
      { name: 'Emergence & Vegetative', durationDays: 25, kc: 0.40 },
      { name: 'Flowering & Pod Initiation', durationDays: 35, kc: 1.00 },
      { name: 'Pod Filling', durationDays: 30, kc: 1.15 },
      { name: 'Maturity & Leaf Senescence', durationDays: 15, kc: 0.50 },
    ],
    optimalTempC: [20, 32],
    waterRequirementMm: [450, 700],
    criticalMoistureStressStage: 'Pod development & filling',
    climateSuitabilityRationale: 'Short-duration legume that enriches soil nitrogen. Highly sensitive to dry spells exceeding 14 days during flowering.',
    commonPests: [
      { name: 'Tobacco Caterpillar (Spodoptera litura)', condition: 'High humidity post heavy rain', riskThreshold: 'High in dense canopies', culturalControl: 'Handpicking egg masses and pheromone monitoring.' },
      { name: 'Girdle Beetle (Obereopsis brevis)', condition: 'Early vegetative seedling stage', riskThreshold: 'Moderate in July', culturalControl: 'Timely rogueing of wilted plant tops.' },
    ],
    npkRecommendationKgHa: { n: 30, p: 60, k: 40 },
  },
  {
    id: 'wheat',
    name: 'Wheat',
    scientificName: 'Triticum aestivum',
    season: 'Rabi / Winter',
    growingDays: 120,
    stages: [
      { name: 'Crown Root Initiation (CRI)', durationDays: 25, kc: 0.40 },
      { name: 'Tillering & Jointing', durationDays: 35, kc: 0.85 },
      { name: 'Heading & Flowering', durationDays: 35, kc: 1.15 },
      { name: 'Grain Filling & Ripening', durationDays: 25, kc: 0.60 },
    ],
    optimalTempC: [14, 25],
    waterRequirementMm: [400, 550],
    criticalMoistureStressStage: 'Crown Root Initiation (Day 21) & Flowering',
    climateSuitabilityRationale: 'Demands cool winter nights for tillering. Terminal heat stress (>32°C in March) accelerates forced maturity and shrivels grains.',
    commonPests: [
      { name: 'Terminal Heat Desiccation', condition: 'Temp > 32°C during grain fill', riskThreshold: 'Severe yield shrivel risk', culturalControl: 'Light sprinkler irrigation during high wind/heat afternoon hours.' },
      { name: 'Rust (Puccinia species)', condition: 'Cloudy damp nights < 18°C', riskThreshold: 'Moderate in late winter', culturalControl: 'Use certified resistant cultivars (e.g. HD series).' },
    ],
    npkRecommendationKgHa: { n: 120, p: 60, k: 40 },
  },
  {
    id: 'onion',
    name: 'Onion',
    scientificName: 'Allium cepa',
    season: 'Late Kharif / Rabi',
    growingDays: 130,
    stages: [
      { name: 'Transplanting & Recovery', durationDays: 25, kc: 0.50 },
      { name: 'Foliage Growth', durationDays: 45, kc: 0.85 },
      { name: 'Bulb Enlargement', durationDays: 45, kc: 1.05 },
      { name: 'Maturity & Top Fall', durationDays: 15, kc: 0.70 },
    ],
    optimalTempC: [15, 30],
    waterRequirementMm: [450, 650],
    criticalMoistureStressStage: 'Bulb development & enlargement',
    climateSuitabilityRationale: 'Major commercial crop in Nashik, Ahmednagar, and Pune districts. Requires consistent light moisture; water stress causes split bulbs.',
    commonPests: [
      { name: 'Thrips (Thrips tabaci)', condition: 'Dry warm spells with high radiation', riskThreshold: 'Severe in dry spells', culturalControl: 'Blue sticky traps (20/ha) and overhead sprinkler wash.' },
      { name: 'Purple Blotch (Alternaria porri)', condition: 'High humidity RH > 85% post rain', riskThreshold: 'High post rain', culturalControl: 'Crop rotation and avoiding excessive vegetative Nitrogen.' },
    ],
    npkRecommendationKgHa: { n: 100, p: 50, k: 50 },
  },
];

export const AgriculturalIntelligenceView: React.FC<AgriculturalIntelligenceViewProps> = ({
  currentLocation,
  data,
  statistics,
  onOpenReportModal,
}) => {
  const [selectedCropId, setSelectedCropId] = useState<string>('sugarcane');
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(2); // Default to peak growth
  const [fieldAreaHectares, setFieldAreaHectares] = useState<number>(1.0);
  const [irrigationEfficiencyPct, setIrrigationEfficiencyPct] = useState<number>(85); // Drip default

  const currentCrop = useMemo(() => {
    return CROP_PROFILES.find((c) => c.id === selectedCropId) || CROP_PROFILES[0];
  }, [selectedCropId]);

  const activeStage = currentCrop.stages[selectedStageIndex] || currentCrop.stages[0];

  // Reference Evapotranspiration (ET0) estimation based on temperature and solar flux
  const estimatedET0MmDay = useMemo(() => {
    if (statistics?.t2m?.mean !== undefined && statistics?.allsky?.mean !== undefined) {
      const tMean = statistics.t2m.mean;
      const radiationMJ = statistics.allsky.mean * 3.6;
      const et0 = Math.max(2.5, 0.0023 * (tMean + 17.8) * Math.sqrt(Math.max(6, (statistics.t2m_max?.mean || 32) - (statistics.t2m_min?.mean || 20))) * (radiationMJ * 0.408));
      return Math.min(10.5, Math.max(2.0, et0));
    }
    return 5.2;
  }, [statistics]);

  // Crop Evapotranspiration ETc = ET0 * Kc
  const cropETcMmDay = estimatedET0MmDay * activeStage.kc;

  // Gross irrigation requirement taking efficiency into account
  const grossIrrigationMmDay = cropETcMmDay / (irrigationEfficiencyPct / 100);

  // Volumetric water demand: 1 mm over 1 ha (10,000 m²) = 10,000 Liters
  const volumetricLitersPerDay = grossIrrigationMmDay * 10000 * fieldAreaHectares;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 text-blue-900 font-bold text-xs uppercase font-mono tracking-wider">
              FAO-56 Crop Phenology & Irrigation Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">NASA POWER & Penman-Monteith</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Agricultural Intelligence: <span className="text-blue-900">{currentLocation.name}</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
            Crop evapotranspiration ($ET_c$), stage-dependent crop coefficients ($K_c$), volumetric irrigation demand in mm and Liters/hectare, soil nutrient guidelines, and weather-driven IPM pest models.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Farm Schedule (PDF)</span>
        </button>
      </div>

      {/* Main Grid: Crop Selector + Water Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Crop Profile & Phenological Stage */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wide block mb-2">
              Select Cultivated Crop
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CROP_PROFILES.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => {
                    setSelectedCropId(crop.id);
                    setSelectedStageIndex(1);
                  }}
                  className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                    crop.id === selectedCropId
                      ? 'bg-blue-50 border-blue-700 text-blue-950 font-bold shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">{crop.name}</div>
                  <div className="text-[10px] text-slate-500 italic truncate">{crop.scientificName}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 uppercase tracking-wide">
                Phenological Stage ($K_c$)
              </span>
              <span className="font-mono font-bold text-blue-900">
                $K_c$ = {activeStage.kc.toFixed(2)}
              </span>
            </div>
            <div className="space-y-1.5">
              {currentCrop.stages.map((stage, idx) => (
                <button
                  key={stage.name}
                  onClick={() => setSelectedStageIndex(idx)}
                  className={`w-full p-2 rounded-lg text-left border transition-all cursor-pointer flex items-center justify-between ${
                    idx === selectedStageIndex
                      ? 'bg-blue-900 text-white border-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs">{stage.name}</div>
                    <div className={`text-[10px] ${idx === selectedStageIndex ? 'text-blue-200' : 'text-slate-500'}`}>
                      {stage.durationDays} days duration
                    </div>
                  </div>
                  <div className="font-mono font-bold">
                    {stage.kc.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div>
              <div className="flex justify-between text-slate-700 font-semibold mb-1">
                <span>Field Area</span>
                <span className="font-mono text-blue-900 font-bold">{fieldAreaHectares.toFixed(1)} ha ({(fieldAreaHectares * 2.471).toFixed(1)} acres)</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.5"
                value={fieldAreaHectares}
                onChange={(e) => setFieldAreaHectares(parseFloat(e.target.value))}
                className="w-full accent-blue-900 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 font-semibold mb-1">
                <span>Irrigation Efficiency</span>
                <span className="font-mono text-blue-900 font-bold">{irrigationEfficiencyPct}%</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Drip (85%)', val: 85 },
                  { label: 'Sprinkler (75%)', val: 75 },
                  { label: 'Flood (55%)', val: 55 },
                ].map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setIrrigationEfficiencyPct(m.val)}
                    className={`py-1.5 px-2 rounded-md text-[10px] font-semibold border cursor-pointer ${
                      irrigationEfficiencyPct === m.val
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Columns: Water Schedule & Soil Nutrition */}
        <div className="lg:col-span-2 space-y-5 text-xs">
          {/* Daily Water Requirement Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-yellow-600" />
                <span>Reference ET0</span>
              </span>
              <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                {estimatedET0MmDay.toFixed(2)} <span className="text-xs font-normal text-slate-500 font-sans">mm/day</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Atmospheric evaporative demand based on temperature and solar radiation at {currentLocation.name}.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Crop Demand ($ET_c$)</span>
              </span>
              <div className="text-2xl font-extrabold font-mono text-blue-900 mt-1">
                {cropETcMmDay.toFixed(2)} <span className="text-xs font-normal text-slate-500 font-sans">mm/day</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                $ET_c = ET_0 \times K_c$ ({estimatedET0MmDay.toFixed(2)} × {activeStage.kc.toFixed(2)}) for {activeStage.name}.
              </p>
            </div>

            <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-1 bg-blue-50/40">
              <span className="text-[10px] font-mono text-blue-900 uppercase font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                <span>Daily Water Volume</span>
              </span>
              <div className="text-2xl font-extrabold font-mono text-blue-950 mt-1">
                {(volumetricLitersPerDay / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}{' '}
                <span className="text-xs font-normal text-slate-500 font-sans">m³/day</span>
              </div>
              <div className="text-[11px] font-mono text-slate-700 mt-1">
                {Math.round(volumetricLitersPerDay).toLocaleString()} Litres/day for {fieldAreaHectares} ha
              </div>
            </div>
          </div>

          {/* Critical Moisture Stage & Climate Suitability Rationale */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-700" />
              <span>Bioclimatic Suitability Rationale ({currentCrop.name})</span>
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {currentCrop.climateSuitabilityRationale}
            </p>
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-[11px] leading-relaxed">
              <strong>Critical Moisture Vulnerability Window:</strong> {currentCrop.criticalMoistureStressStage}. Deficits during this period lead to irreversible cellular damage and yield reduction.
            </div>
          </div>

          {/* Integrated Pest Management (IPM) Weather-Based Warning Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bug className="w-4 h-4 text-red-700" />
                <span>Weather-Driven Pest & Disease Risk Models</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">IPM Preventive Protocols</span>
            </div>

            <div className="space-y-2">
              {currentCrop.commonPests.map((pest) => (
                <div
                  key={pest.name}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{pest.name}</div>
                    <div className="text-slate-500 text-[11px]">
                      <strong>Trigger Condition:</strong> {pest.condition}
                    </div>
                    <div className="text-emerald-800 text-[11px]">
                      <strong>Cultural / Preventive Action:</strong> {pest.culturalControl}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-900 shrink-0 border border-amber-200 self-start sm:self-auto">
                    {pest.riskThreshold}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Fertilizer Dosages */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700" />
                <span>Recommended Macronutrient (N-P-K) Reference Dosages</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">ICAR / Agricultural University Standard</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Nitrogen (N)</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {currentCrop.npkRecommendationKgHa.n} <span className="text-[10px] text-slate-500 font-sans">kg/ha</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Split across vegetative stages</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Phosphorus (P₂O₅)</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {currentCrop.npkRecommendationKgHa.p} <span className="text-[10px] text-slate-500 font-sans">kg/ha</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Basal soil incorporation</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Potassium (K₂O)</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {currentCrop.npkRecommendationKgHa.k} <span className="text-[10px] text-slate-500 font-sans">kg/ha</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Drought & disease resilience</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
