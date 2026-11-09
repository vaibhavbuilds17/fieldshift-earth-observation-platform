import { EnvironmentalPointData, DataSetStatistics, MonthlyAggregate } from '../types/nasa';

export interface StructuredAnalysisResult {
  summary: string;
  keyFindings: string[];
  evidence: { label: string; value: string; note?: string }[];
  scientificLimitations: string[];
  suggestedAction: string;
}

export interface ResearchQuestionDef {
  id: string;
  title: string;
  question: string;
  category: 'temperature' | 'precipitation' | 'solar' | 'adaptation' | 'methodology';
  analyze: (
    data: EnvironmentalPointData[],
    stats: DataSetStatistics,
    monthly: MonthlyAggregate[]
  ) => StructuredAnalysisResult;
}

export const RESEARCH_QUESTIONS: ResearchQuestionDef[] = [
  {
    id: 'temp-variability',
    title: 'Temperature Dynamics & Extreme Bounds',
    question: 'How does temperature vary during the selected period?',
    category: 'temperature',
    analyze: (data, stats, _monthly) => {
      const validTemps = data.filter((d) => d.temperatureMean !== null).map((d) => d.temperatureMean!);
      const validDiurnals = data.filter((d) => d.diurnalRange !== null).map((d) => d.diurnalRange!);

      const avgDiurnal = validDiurnals.length > 0
        ? (validDiurnals.reduce((a, b) => a + b, 0) / validDiurnals.length).toFixed(1)
        : 'N/A';

      const tempRange = stats.tempMax !== null && stats.tempMin !== null
        ? (stats.tempMax - stats.tempMin).toFixed(1)
        : 'N/A';

      return {
        summary: `The observed mean 2-meter air temperature over ${stats.validDays} valid days is ${stats.tempMean ?? 'N/A'} °C, with a total range spread of ${tempRange} °C across seasons. Daily diurnal shifts average ${avgDiurnal} °C.`,
        keyFindings: [
          `Peak daily maximum reached ${stats.tempMax ?? 'N/A'} °C, while minimum reached ${stats.tempMin ?? 'N/A'} °C.`,
          `Standard deviation of daily mean temperatures is ${stats.tempStdDev ?? 'N/A'} °C, indicating moderate seasonal swing typical of the inland Deccan plateau.`,
          `Average day-to-night temperature swing (diurnal range) is ${avgDiurnal} °C, which strongly impacts nocturnal crop respiration.`,
        ],
        evidence: [
          { label: 'Mean Temperature', value: `${stats.tempMean ?? 'N/A'} °C`, note: 'MERRA-2 24h average' },
          { label: 'Seasonal Max', value: `${stats.tempMax ?? 'N/A'} °C`, note: 'Peak day record in period' },
          { label: 'Seasonal Min', value: `${stats.tempMin ?? 'N/A'} °C`, note: 'Coldest day record' },
          { label: 'Std. Deviation', value: `${stats.tempStdDev ?? 'N/A'} °C`, note: 'Temperature dispersion' },
          { label: 'Mean Diurnal Range', value: `${avgDiurnal} °C`, note: 'T_max minus T_min' },
        ],
        scientificLimitations: [
          '2-meter air temperature is measured in free air and may differ by 2–5°C from actual crop canopy or soil surface temperature.',
          'Atmospheric reanalysis grids (0.5°) smooth out localized valley frost pockets and concrete heat islands.',
        ],
        suggestedAction:
          'Monitor canopy temperature during flowering stages and consider shade netting or micro-sprinklers if maximum temperatures persist above crop-specific thresholds.',
      };
    },
  },
  {
    id: 'precip-variability',
    title: 'Precipitation Distribution & Rainfall Variability',
    question: 'How variable is daily precipitation across the study window?',
    category: 'precipitation',
    analyze: (data, stats, _monthly) => {
      const precips = data.filter((d) => d.precipitation !== null).map((d) => d.precipitation!);
      const wetDays = precips.filter((p) => p > 1.0);
      const totalRain = stats.precipTotal || 0;
      const wetRatio = precips.length > 0 ? ((wetDays.length / precips.length) * 100).toFixed(1) : '0';

      return {
        summary: `Precipitation shows acute temporal concentration: total accumulation of ${totalRain} mm fell across only ${stats.wetDaysCount} wet days (${wetRatio}% of the observation window), indicating high intermittency.`,
        keyFindings: [
          `Over ${stats.dryDaysCount} days had negligible rainfall (≤ 1.0 mm/day).`,
          `The single wettest day recorded ${stats.precipMax ?? 0} mm, which contributed significantly to total seasonal water volume.`,
          `Precipitation in semi-arid Maharashtra is highly episodic, driven by monsoon surges followed by multi-week dry intervals.`,
        ],
        evidence: [
          { label: 'Total Precipitation', value: `${totalRain} mm`, note: 'Cumulative over period' },
          { label: 'Wet Days (>1mm)', value: `${stats.wetDaysCount} days`, note: `${wetRatio}% of valid days` },
          { label: 'Dry Days (≤1mm)', value: `${stats.dryDaysCount} days`, note: 'Rainless or trace days' },
          { label: 'Maximum Single Day', value: `${stats.precipMax ?? 0} mm`, note: 'Peak intensity event' },
        ],
        scientificLimitations: [
          'Precipitation is derived from GPCP/IMERG gauge-calibrated satellite reanalysis. Highly localized convective cloudbursts may be under- or over-estimated.',
          'Daily precipitation totals do not reveal hourly rainfall intensity (e.g., 50 mm in 1 hour vs. 50 mm over 24 hours), which determines runoff versus soil infiltration.',
        ],
        suggestedAction:
          'Implement farm ponds (Shet Tale), contour bunding, and rainwater harvesting structures to capture intense runoff events for dry-spell deficit irrigation.',
      };
    },
  },
  {
    id: 'warmest-months',
    title: 'Seasonal Thermal Peaks & Hottest Months',
    question: 'Which months have the highest average temperatures?',
    category: 'temperature',
    analyze: (_data, _stats, monthly) => {
      if (monthly.length === 0) {
        return {
          summary: 'Insufficient monthly aggregation data.',
          keyFindings: ['At least 30 days of data are required to identify monthly trends.'],
          evidence: [],
          scientificLimitations: ['Dataset too short for monthly breakdown.'],
          suggestedAction: 'Extend the date range to encompass multiple months.',
        };
      }

      const sortedByTemp = [...monthly]
        .filter((m) => m.meanTemperature !== null)
        .sort((a, b) => (b.meanTemperature || 0) - (a.meanTemperature || 0));

      const warmest = sortedByTemp[0];
      const coolest = sortedByTemp[sortedByTemp.length - 1];

      return {
        summary: `Monthly thermal analysis identifies ${warmest ? warmest.monthName : 'N/A'} as the warmest month with a mean temperature of ${warmest?.meanTemperature ?? 'N/A'} °C (peak day ${warmest?.maxTemperature ?? 'N/A'} °C).`,
        keyFindings: [
          `The warmest period occurs in pre-monsoon spring/summer (${sortedByTemp.slice(0, 2).map((m) => m.monthName).join(', ')}).`,
          `Coolest conditions occur during ${coolest ? coolest.monthName : 'N/A'} with an average of ${coolest?.meanTemperature ?? 'N/A'} °C.`,
          `The thermal transition coincides with the onset of the Kharif planting window as monsoon rains moderate summer peaks.`,
        ],
        evidence: [
          { label: 'Warmest Month', value: warmest ? `${warmest.monthName} (${warmest.meanTemperature} °C)` : 'N/A', note: 'Highest mean' },
          { label: 'Peak Monthly Max', value: warmest ? `${warmest.maxTemperature} °C` : 'N/A', note: 'Single hottest day' },
          { label: 'Coolest Month', value: coolest ? `${coolest.monthName} (${coolest.meanTemperature} °C)` : 'N/A', note: 'Rabi winter low' },
          { label: 'Thermal Delta', value: `${((warmest?.meanTemperature || 0) - (coolest?.meanTemperature || 0)).toFixed(1)} °C`, note: 'Annual seasonal swing' },
        ],
        scientificLimitations: [
          'Monthly averages mask dangerous short-duration heat waves (3–5 consecutive days) that occur during flowering or pollination.',
        ],
        suggestedAction:
          'Plan sowing dates so sensitive grain filling or fruit set does not coincide with the historically warmest months.',
      };
    },
  },
  {
    id: 'solar-flux',
    title: 'Solar Irradiance Flux & Atmospheric Cloudiness',
    question: 'How does downward surface solar radiation vary over time?',
    category: 'solar',
    analyze: (data, stats, _monthly) => {
      const solars = data.filter((d) => d.solarRadiation !== null).map((d) => d.solarRadiation!);
      const cloudyDays = solars.filter((s) => s < 12.0).length;
      const clearSkyDays = solars.filter((s) => s > 22.0).length;

      return {
        summary: `Surface shortwave downward solar radiation averages ${stats.solarMean ?? 'N/A'} MJ/m²/day, ranging from a minimum of ${stats.solarMin ?? 'N/A'} to a clear-sky peak of ${stats.solarMax ?? 'N/A'} MJ/m²/day.`,
        keyFindings: [
          `${clearSkyDays} days exhibited high solar flux (> 22 MJ/m²/day), driving high atmospheric evaporative demand.`,
          `${cloudyDays} days had suppressed solar irradiance (< 12 MJ/m²/day), primarily corresponding with dense monsoon cloud cover.`,
          'Solar radiation patterns mirror agricultural crop water requirements: peak solar months demand up to 6–8 mm/day of evapotranspiration replenishment.',
        ],
        evidence: [
          { label: 'Mean Daily Solar', value: `${stats.solarMean ?? 'N/A'} MJ/m²/day`, note: 'CERES satellite satellite flux' },
          { label: 'Peak Daily Solar', value: `${stats.solarMax ?? 'N/A'} MJ/m²/day`, note: 'Clear sky zenith' },
          { label: 'Minimum Solar', value: `${stats.solarMin ?? 'N/A'} MJ/m²/day`, note: 'Overcast monsoon day' },
          { label: 'High Insolation Days', value: `${clearSkyDays} days`, note: '> 22 MJ/m²/day' },
        ],
        scientificLimitations: [
          'Surface solar irradiance represents total incoming shortwave flux and does not directly separate Photosynthetically Active Radiation (PAR, 400–700 nm) fraction or diffuse light penetration.',
          'Solar radiation alone cannot predict yield without knowing crop leaf area index (LAI) and canopy architecture.',
        ],
        suggestedAction:
          'Utilize solar radiation data to calculate Reference Evapotranspiration (ETo via FAO-56 Penman-Monteith) to size drip irrigation emitters accurately.',
      };
    },
  },
  {
    id: 'dry-periods',
    title: 'Extended Dry Spells & Moisture Deficit Runs',
    question: 'Are extended periods of low precipitation visible in the data?',
    category: 'precipitation',
    analyze: (_data, stats, _monthly) => {
      return {
        summary: `Yes. The observational sequence documents a maximum continuous dry spell of ${stats.longestDrySpell} days where daily precipitation remained ≤ 1.0 mm/day. Total dry days reached ${stats.dryDaysCount} out of ${stats.validDays} valid days.`,
        keyFindings: [
          `Long dry spells of ${stats.longestDrySpell} days deplete the root zone available water capacity (AWC) in shallow Deccan vertisols.`,
          'In rainfed Kharif crops (e.g. soybean, bajra, cotton), a dry spell exceeding 14–21 days during vegetative or flowering stages can trigger irreversible moisture stress.',
          'Dry spells often coincide with higher daytime temperatures, amplifying atmospheric vapor pressure deficit (VPD).',
        ],
        evidence: [
          { label: 'Longest Dry Spell', value: `${stats.longestDrySpell} days`, note: 'Consecutive days ≤ 1.0 mm' },
          { label: 'Total Dry Days', value: `${stats.dryDaysCount} days`, note: '≤ 1.0 mm / day' },
          { label: 'Total Wet Days', value: `${stats.wetDaysCount} days`, note: '> 1.0 mm / day' },
          { label: 'Dry Day Fraction', value: `${((stats.dryDaysCount / (stats.validDays || 1)) * 100).toFixed(1)} %`, note: 'Proportion of period' },
        ],
        scientificLimitations: [
          'Low precipitation does not automatically mean crop water stress if residual soil moisture or irrigation canal supply is available.',
          'Soil depth, clay content, organic matter percentage, and groundwater table depth dictate actual drought resistance.',
        ],
        suggestedAction:
          'Adopt organic mulching (trash mulching in sugarcane, straw mulch in vegetables) and drought-protective protective irrigations during dry intervals exceeding 10 days.',
      };
    },
  },
  {
    id: 'scientific-evidence',
    title: 'Investigative Methodology & Evidence Needs',
    question: 'What additional evidence would be needed to investigate agricultural impacts?',
    category: 'methodology',
    analyze: (_data, _stats, _monthly) => {
      return {
        summary:
          'NASA environmental data provides broad atmospheric drivers, but robust agricultural risk attribution requires triangulating satellite products with in-situ soil, phenology, and crop physiological measurements.',
        keyFindings: [
          'Soil physical properties (soil texture, water retention curve, infiltration rate, organic carbon) are essential to translate rainfall into available root-zone water.',
          'Crop phenological stages (sowing date, tillering, anthesis, physiological maturity) are needed to know when heat and moisture anomalies cause severe damage.',
          'Ground weather stations and farm micro-meteorology sensors validate satellite reanalysis biases in complex terrain.',
        ],
        evidence: [
          { label: 'NASA POWER Domain', value: 'Macro/Mesoscale', note: '0.5° × 0.5° gridded atmosphere' },
          { label: 'Ground Evidence Needed', value: 'Microscale', note: 'Soil probes, leaf temperature' },
          { label: 'Biological Evidence', value: 'Crop Phenology', note: 'GDD calibration, variety tolerance' },
          { label: 'Hydrological Evidence', value: 'Canal/Well Depth', note: 'Groundwater replenishment' },
        ],
        scientificLimitations: [
          'Correlations between weather variables and regional crop statistics do not prove causation without controlling for pest outbreaks, fertilizer inputs, and seed quality.',
        ],
        suggestedAction:
          'Partner with local Krishi Vigyan Kendras (KVK), deploy low-cost capacitive soil moisture probes, and record field planting dates alongside NASA environmental trends.',
      };
    },
  },
];
