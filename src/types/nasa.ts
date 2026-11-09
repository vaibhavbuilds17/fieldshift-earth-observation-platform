/**
 * FieldShift Science Explorer - NASA Environmental Data Types
 */

export interface EnvironmentalPointData {
  date: string; // ISO date 'YYYY-MM-DD'
  dateKey: string; // NASA format 'YYYYMMDD'
  temperatureMean?: number | null; // T2M (°C)
  temperatureMax?: number | null; // T2M_MAX (°C)
  temperatureMin?: number | null; // T2M_MIN (°C)
  diurnalRange?: number | null; // T2M_MAX - T2M_MIN (°C)
  precipitation?: number | null; // PRECTOTCORR (mm/day)
  solarRadiation?: number | null; // ALLSKY_SFC_SW_DWN (MJ/m²/day)
  relativeHumidity?: number | null; // RH2M (%)
  windSpeed?: number | null; // WS2M (m/s)
}

export interface StudyLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  description: string;
  isPreset?: boolean;
  administrativeRegion?: string;
  district?: string;
  talukaOrLocality?: string;
  sourceDates?: string;
  dataResolution?: string;
  missingDataStatus?: string;
}

export type DataStatus =
  | 'idle'
  | 'loading'
  | 'live_loaded'
  | 'sample_loaded'
  | 'api_unavailable'
  | 'partial_data';

export interface ParameterMetadata {
  key: string;
  paramCode: string;
  shortName: string;
  fullName: string;
  unit: string;
  description: string;
  sourceInstrument: string;
  agriculturalRelevance: string;
}

export interface ParameterQualityMetric {
  paramCode: string;
  name: string;
  unit: string;
  validCount: number;
  missingCount: number;
  completenessPercent: number;
}

export interface DataQualityAudit {
  expectedCalendarDays: number;
  receivedDaysCount: number;
  missingDatesCount: number;
  missingDates: string[];
  duplicateDatesCount: number;
  overallCompletenessPercent: number;
  zeroRainfallDaysCount: number;
  isContinuous: boolean;
  parameterBreakdown: ParameterQualityMetric[];
}

export interface DataSetStatistics {
  count: number;
  validDays: number;
  tempMean: number | null;
  tempMax: number | null;
  tempMin: number | null;
  tempMedian: number | null;
  tempStdDev: number | null;
  precipTotal: number | null;
  precipMean: number | null;
  precipMax: number | null;
  wetDaysCount: number; // Days > 1.0mm
  dryDaysCount: number; // Days <= 1.0mm
  longestDrySpell: number; // consecutive days
  solarMean: number | null;
  solarMax: number | null;
  solarMin: number | null;
  humidityMean: number | null;
  windSpeedMean: number | null;
  missingValuesCount: number;
  dataQualityAudit?: DataQualityAudit;
}

export interface MonthlyAggregate {
  monthKey: string; // 'YYYY-MM'
  monthName: string;
  year: number;
  month: number;
  daysCount: number;
  meanTemperature: number | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  totalPrecipitation: number;
  meanDailyPrecipitation: number;
  wetDaysCount: number;
  meanSolarRadiation: number | null;
}

export interface ResearchQuestion {
  id: string;
  title: string;
  question: string;
  category: 'temperature' | 'precipitation' | 'solar' | 'adaptation' | 'methodology';
}
