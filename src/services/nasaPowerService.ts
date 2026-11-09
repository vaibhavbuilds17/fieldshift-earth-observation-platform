import { EnvironmentalPointData, DataStatus, DataQualityAudit, ParameterQualityMetric } from '../types/nasa';
import { generateVerifiedMaharashtraSample } from '../data/shirdiSampleData';

export interface NasaFetchParams {
  latitude: number;
  longitude: number;
  startDate: string; // 'YYYYMMDD' or 'YYYY-MM-DD'
  endDate: string; // 'YYYYMMDD' or 'YYYY-MM-DD'
  parameters?: string[];
  community?: string;
}

export interface NasaFetchResult {
  status: DataStatus;
  data: EnvironmentalPointData[];
  sources: string[];
  apiVersion: string;
  title: string;
  retrievedAt: string;
  fillValue: number;
  elevationMeters?: number;
  resolvedCoordinates?: [number, number]; // [longitude, latitude]
  parameterMetadata?: Record<string, { units: string; longname: string }>;
  dataQualityAudit?: DataQualityAudit;
  errorMessage?: string;
  isSampleData: boolean;
}

// In-memory cache to prevent duplicate fetches for the exact same query
const responseCache = new Map<string, NasaFetchResult>();

export const DEFAULT_PARAMETERS = [
  'T2M',
  'T2M_MAX',
  'T2M_MIN',
  'PRECTOTCORR',
  'ALLSKY_SFC_SW_DWN',
  'RH2M',
  'WS2M',
];

export function sanitizeDate(dateStr: string): string {
  return dateStr.replace(/[-/]/g, '').trim();
}

export function formatDateKey(key: string): string {
  // Convert 'YYYYMMDD' to 'YYYY-MM-DD'
  if (key.length === 8) {
    return `${key.substring(0, 4)}-${key.substring(4, 6)}-${key.substring(6, 8)}`;
  }
  return key;
}

/**
 * Generates an exact, unbroken chronological list of YYYYMMDD date keys
 * between startDate and endDate to ensure parameters are joined by date
 * rather than arbitrary object insertion order.
 */
function generateChronologicalDateKeys(startClean: string, endClean: string): string[] {
  const dates: string[] = [];
  try {
    const startYear = parseInt(startClean.substring(0, 4), 10);
    const startMonth = parseInt(startClean.substring(4, 6), 10) - 1;
    const startDay = parseInt(startClean.substring(6, 8), 10);

    const endYear = parseInt(endClean.substring(0, 4), 10);
    const endMonth = parseInt(endClean.substring(4, 6), 10) - 1;
    const endDay = parseInt(endClean.substring(6, 8), 10);

    const cur = new Date(Date.UTC(startYear, startMonth, startDay));
    const end = new Date(Date.UTC(endYear, endMonth, endDay));

    // Cap sequence at 1200 days to prevent runaway loops if dates are inverted
    let count = 0;
    while (cur <= end && count < 1200) {
      const y = cur.getUTCFullYear();
      const m = String(cur.getUTCMonth() + 1).padStart(2, '0');
      const d = String(cur.getUTCDate()).padStart(2, '0');
      dates.push(`${y}${m}${d}`);
      cur.setUTCDate(cur.getUTCDate() + 1);
      count++;
    }
  } catch (e) {
    console.error('Date sequence generation error:', e);
  }
  return dates;
}

export async function fetchNasaPowerData(
  params: NasaFetchParams,
  forceSample: boolean = false
): Promise<NasaFetchResult> {
  const startClean = sanitizeDate(params.startDate);
  const endClean = sanitizeDate(params.endDate);
  const parameters = params.parameters && params.parameters.length > 0 ? params.parameters : DEFAULT_PARAMETERS;
  const community = params.community || 'AG';
  const lat = Number(params.latitude.toFixed(4));
  const lon = Number(params.longitude.toFixed(4));

  const cacheKey = `${lat}_${lon}_${startClean}_${endClean}_${[...parameters].sort().join(',')}_${forceSample}`;

  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey)!;
  }

  // If forceSample is explicitly chosen
  if (forceSample) {
    const sampleData = generateVerifiedMaharashtraSample();
    const result: NasaFetchResult = {
      status: 'sample_loaded',
      data: sampleData,
      sources: ['NASA POWER Climatology Baseline', 'MERRA-2 Model Archive', 'GPCP v2.3'],
      apiVersion: 'v2.10.0 (Synthesized Field Baseline)',
      title: 'NASA POWER Agroclimatology Reference Data (Maharashtra Pilot)',
      retrievedAt: new Date().toISOString(),
      fillValue: -999.0,
      elevationMeters: 512,
      resolvedCoordinates: [lon, lat],
      parameterMetadata: {
        T2M: { units: '°C', longname: 'Temperature at 2 Meters (Reference)' },
        PRECTOTCORR: { units: 'mm/day', longname: 'Precipitation Corrected (Reference)' },
        ALLSKY_SFC_SW_DWN: { units: 'MJ/m^2/day', longname: 'Solar Shortwave Irradiance (Reference)' },
      },
      isSampleData: true,
    };
    responseCache.set(cacheKey, result);
    return result;
  }

  // Build the official NASA POWER daily point API endpoint
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${parameters.join(
    ','
  )}&community=${community}&longitude=${lon}&latitude=${lat}&start=${startClean}&end=${endClean}&format=JSON`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    const json = await response.json();

    // Check for NASA POWER error messages returned in response body
    if (!response.ok || (json.messages && json.messages.length > 0 && (!json.properties || !json.properties.parameter)) || json.detail) {
      let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
      if (Array.isArray(json.detail) && json.detail.length > 0) {
        errorDetail = json.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
      } else if (typeof json.detail === 'string') {
        errorDetail = json.detail;
      } else if (Array.isArray(json.messages) && json.messages.length > 0) {
        errorDetail = json.messages.join('; ');
      }
      throw new Error(errorDetail);
    }

    if (!json.properties || !json.properties.parameter) {
      throw new Error('Malformed NASA POWER response: Missing parameter block.');
    }

    // Read sentinel fill_value from response header (default -999.0)
    const fillVal = typeof json.header?.fill_value === 'number' ? json.header.fill_value : -999.0;
    
    // Strict missing sentinel checker: never converts missing measurements to zero!
    const isMissing = (val: unknown): boolean => {
      if (val === null || val === undefined) return true;
      if (typeof val === 'number') {
        return val === fillVal || val <= -900 || isNaN(val);
      }
      return true;
    };

    const paramMap = json.properties.parameter;
    
    // Generate chronological date list for joining all parameters by date
    const expectedDateKeys = generateChronologicalDateKeys(startClean, endClean);

    // Also collect all date keys returned across parameters to audit missing/extra dates
    const returnedDateKeysSet = new Set<string>();
    for (const key of Object.keys(paramMap)) {
      if (paramMap[key] && typeof paramMap[key] === 'object') {
        Object.keys(paramMap[key]).forEach((d) => returnedDateKeysSet.add(d));
      }
    }

    // Determine the master list of chronological dates
    // If expected sequence is available, use it; otherwise use sorted keys from response
    const dateSequence = expectedDateKeys.length > 0 ? expectedDateKeys : Array.from(returnedDateKeysSet).sort();

    if (dateSequence.length === 0) {
      throw new Error('No observations returned for the specified location and date range.');
    }

    // Track missing dates in the sequence
    const missingDates: string[] = [];
    expectedDateKeys.forEach((dKey) => {
      if (!returnedDateKeysSet.has(dKey)) {
        missingDates.push(formatDateKey(dKey));
      }
    });

    // Per-parameter quality metrics tracking
    const paramStats: Record<string, { valid: number; missing: number; name: string; unit: string }> = {
      T2M: { valid: 0, missing: 0, name: 'Temperature at 2m', unit: '°C' },
      T2M_MAX: { valid: 0, missing: 0, name: 'Max Temperature', unit: '°C' },
      T2M_MIN: { valid: 0, missing: 0, name: 'Min Temperature', unit: '°C' },
      PRECTOTCORR: { valid: 0, missing: 0, name: 'Precipitation', unit: 'mm/day' },
      ALLSKY_SFC_SW_DWN: { valid: 0, missing: 0, name: 'Solar Radiation', unit: 'MJ/m²/day' },
      RH2M: { valid: 0, missing: 0, name: 'Relative Humidity', unit: '%' },
      WS2M: { valid: 0, missing: 0, name: 'Wind Speed', unit: 'm/s' },
    };

    let zeroRainfallDaysCount = 0;
    let hasPartialMissing = false;

    // Join all parameters by calendar date strictly
    const data: EnvironmentalPointData[] = dateSequence.map((dateKey) => {
      const tMeanRaw = paramMap.T2M ? paramMap.T2M[dateKey] : null;
      const tMaxRaw = paramMap.T2M_MAX ? paramMap.T2M_MAX[dateKey] : null;
      const tMinRaw = paramMap.T2M_MIN ? paramMap.T2M_MIN[dateKey] : null;
      const precipRaw = paramMap.PRECTOTCORR ? paramMap.PRECTOTCORR[dateKey] : null;
      const solarRaw = paramMap.ALLSKY_SFC_SW_DWN ? paramMap.ALLSKY_SFC_SW_DWN[dateKey] : null;
      const rhRaw = paramMap.RH2M ? paramMap.RH2M[dateKey] : null;
      const wsRaw = paramMap.WS2M ? paramMap.WS2M[dateKey] : null;

      // Temperature
      let tMean: number | null = null;
      if (!isMissing(tMeanRaw)) {
        tMean = Number(Number(tMeanRaw).toFixed(2));
        paramStats.T2M.valid++;
      } else {
        paramStats.T2M.missing++;
      }

      let tMax: number | null = null;
      if (!isMissing(tMaxRaw)) {
        tMax = Number(Number(tMaxRaw).toFixed(2));
        paramStats.T2M_MAX.valid++;
      } else {
        paramStats.T2M_MAX.missing++;
      }

      let tMin: number | null = null;
      if (!isMissing(tMinRaw)) {
        tMin = Number(Number(tMinRaw).toFixed(2));
        paramStats.T2M_MIN.valid++;
      } else {
        paramStats.T2M_MIN.missing++;
      }

      // Precipitation: Preserve genuine zero-rainfall days, NEVER convert missing to 0!
      let precip: number | null = null;
      if (!isMissing(precipRaw)) {
        precip = Math.max(0, Number(Number(precipRaw).toFixed(2)));
        paramStats.PRECTOTCORR.valid++;
        if (precip === 0) {
          zeroRainfallDaysCount++;
        }
      } else {
        paramStats.PRECTOTCORR.missing++;
      }

      // Solar Radiation
      let solar: number | null = null;
      if (!isMissing(solarRaw)) {
        solar = Math.max(0, Number(Number(solarRaw).toFixed(2)));
        paramStats.ALLSKY_SFC_SW_DWN.valid++;
      } else {
        paramStats.ALLSKY_SFC_SW_DWN.missing++;
      }

      // Humidity
      let rh: number | null = null;
      if (!isMissing(rhRaw)) {
        rh = Math.min(100, Math.max(0, Number(Number(rhRaw).toFixed(1))));
        paramStats.RH2M.valid++;
      } else {
        paramStats.RH2M.missing++;
      }

      // Wind Speed
      let ws: number | null = null;
      if (!isMissing(wsRaw)) {
        ws = Math.max(0, Number(Number(wsRaw).toFixed(2)));
        paramStats.WS2M.valid++;
      } else {
        paramStats.WS2M.missing++;
      }

      if (tMean === null || precip === null || solar === null) {
        hasPartialMissing = true;
      }

      let diurnal: number | null = null;
      if (tMax !== null && tMin !== null) {
        diurnal = Number((tMax - tMin).toFixed(2));
      }

      return {
        date: formatDateKey(dateKey),
        dateKey,
        temperatureMean: tMean,
        temperatureMax: tMax,
        temperatureMin: tMin,
        diurnalRange: diurnal,
        precipitation: precip,
        solarRadiation: solar,
        relativeHumidity: rh,
        windSpeed: ws,
      };
    });

    // Read coordinates and elevation from geometry.coordinates [lon, lat, elevation]
    const coords = json.geometry?.coordinates;
    const resolvedLon = Array.isArray(coords) && coords.length >= 1 ? coords[0] : lon;
    const resolvedLat = Array.isArray(coords) && coords.length >= 2 ? coords[1] : lat;
    const elevation = Array.isArray(coords) && coords.length >= 3 ? coords[2] : undefined;

    // Read parameter names, units, and descriptions from API metadata
    const parameterMetadata: Record<string, { units: string; longname: string }> = {};
    if (json.parameters && typeof json.parameters === 'object') {
      for (const [pCode, pMeta] of Object.entries(json.parameters as Record<string, any>)) {
        parameterMetadata[pCode] = {
          units: pMeta.units || '',
          longname: pMeta.longname || pCode,
        };
      }
    }

    const sources = Array.isArray(json.header?.sources)
      ? json.header.sources
      : ['NASA POWER', 'MERRA-2', 'CERES'];

    const apiVersion = json.header?.api?.version || 'v2.10.0';
    const title = json.header?.title || 'NASA POWER Daily Agroclimatology Data';

    // Compute Data Quality Audit summary
    const expectedCalendarDays = expectedDateKeys.length > 0 ? expectedDateKeys.length : dateSequence.length;
    const receivedDaysCount = returnedDateKeysSet.size;
    const totalPotentialObservations = dateSequence.length * 3; // T2M, PRECTOTCORR, ALLSKY
    const validPrimaryObservations =
      paramStats.T2M.valid + paramStats.PRECTOTCORR.valid + paramStats.ALLSKY_SFC_SW_DWN.valid;
    const overallCompleteness = Number(
      ((validPrimaryObservations / (totalPotentialObservations || 1)) * 100).toFixed(1)
    );

    const parameterBreakdown: ParameterQualityMetric[] = Object.keys(paramStats).map((code) => {
      const s = paramStats[code];
      const total = s.valid + s.missing;
      return {
        paramCode: code,
        name: parameterMetadata[code]?.longname || s.name,
        unit: parameterMetadata[code]?.units || s.unit,
        validCount: s.valid,
        missingCount: s.missing,
        completenessPercent: total > 0 ? Number(((s.valid / total) * 100).toFixed(1)) : 0,
      };
    });

    const dataQualityAudit: DataQualityAudit = {
      expectedCalendarDays,
      receivedDaysCount,
      missingDatesCount: missingDates.length,
      missingDates,
      duplicateDatesCount: 0,
      overallCompletenessPercent: overallCompleteness,
      zeroRainfallDaysCount,
      isContinuous: missingDates.length === 0,
      parameterBreakdown,
    };

    const result: NasaFetchResult = {
      status: hasPartialMissing ? 'partial_data' : 'live_loaded',
      data,
      sources,
      apiVersion,
      title,
      retrievedAt: new Date().toISOString(),
      fillValue: fillVal,
      elevationMeters: elevation,
      resolvedCoordinates: [resolvedLon, resolvedLat],
      parameterMetadata,
      dataQualityAudit,
      isSampleData: false,
    };

    responseCache.set(cacheKey, result);
    return result;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown network error';
    console.warn('NASA POWER API fetch error:', errorMsg);

    // Return explicit api_unavailable status rather than fabricating data
    const failureResult: NasaFetchResult = {
      status: 'api_unavailable',
      data: [],
      sources: ['NASA POWER Daily API'],
      apiVersion: 'v2.10.0',
      title: 'NASA POWER Daily API Request Failed',
      retrievedAt: '',
      fillValue: -999.0,
      errorMessage: `NASA POWER API Request Failed: ${errorMsg}. Verify coordinates/dates or load the verified Maharashtra baseline.`,
      isSampleData: false,
    };

    return failureResult;
  }
}
