import { EnvironmentalPointData, DataSetStatistics, MonthlyAggregate, DataQualityAudit } from '../types/nasa';

export function calculateStatistics(
  data: EnvironmentalPointData[],
  qualityAudit?: DataQualityAudit
): DataSetStatistics {
  if (!data || data.length === 0) {
    return {
      count: 0,
      validDays: 0,
      tempMean: null,
      tempMax: null,
      tempMin: null,
      tempMedian: null,
      tempStdDev: null,
      precipTotal: null,
      precipMean: null,
      precipMax: null,
      wetDaysCount: 0,
      dryDaysCount: 0,
      longestDrySpell: 0,
      solarMean: null,
      solarMax: null,
      solarMin: null,
      humidityMean: null,
      windSpeedMean: null,
      missingValuesCount: 0,
      dataQualityAudit: qualityAudit,
    };
  }

  let validDays = 0;
  let missingValuesCount = 0;

  // Temperature stats
  const validTemps: number[] = [];
  let tempMax = -Infinity;
  let tempMin = Infinity;

  // Precipitation stats
  const validPrecips: number[] = [];
  let precipTotal = 0;
  let precipMax = 0;
  let wetDaysCount = 0;
  let dryDaysCount = 0;
  let currentDrySpell = 0;
  let longestDrySpell = 0;

  // Solar stats
  const validSolars: number[] = [];
  let solarMax = -Infinity;
  let solarMin = Infinity;

  // Humidity & Wind
  const validHumidities: number[] = [];
  const validWinds: number[] = [];

  for (const day of data) {
    let dayHasValidData = false;

    // Temperature (T2M)
    if (day.temperatureMean !== null && day.temperatureMean !== undefined && !isNaN(day.temperatureMean)) {
      validTemps.push(day.temperatureMean);
      if (day.temperatureMean > tempMax) tempMax = day.temperatureMean;
      if (day.temperatureMean < tempMin) tempMin = day.temperatureMean;
      dayHasValidData = true;
    } else {
      missingValuesCount++;
    }

    // Daily max/min checks
    if (day.temperatureMax !== null && day.temperatureMax !== undefined && !isNaN(day.temperatureMax)) {
      if (day.temperatureMax > tempMax) tempMax = day.temperatureMax;
    }
    if (day.temperatureMin !== null && day.temperatureMin !== undefined && !isNaN(day.temperatureMin)) {
      if (day.temperatureMin < tempMin) tempMin = day.temperatureMin;
    }

    // Precipitation (PRECTOTCORR)
    // Note: 0.0 is a legitimate rainless day. Only null/undefined/-999 is missing!
    if (day.precipitation !== null && day.precipitation !== undefined && !isNaN(day.precipitation)) {
      const p = Math.max(0, day.precipitation);
      validPrecips.push(p);
      precipTotal += p;
      if (p > precipMax) precipMax = p;
      if (p > 1.0) {
        wetDaysCount++;
        currentDrySpell = 0;
      } else {
        dryDaysCount++;
        currentDrySpell++;
        if (currentDrySpell > longestDrySpell) {
          longestDrySpell = currentDrySpell;
        }
      }
      dayHasValidData = true;
    } else {
      missingValuesCount++;
    }

    // Solar (ALLSKY_SFC_SW_DWN)
    if (day.solarRadiation !== null && day.solarRadiation !== undefined && !isNaN(day.solarRadiation)) {
      validSolars.push(day.solarRadiation);
      if (day.solarRadiation > solarMax) solarMax = day.solarRadiation;
      if (day.solarRadiation < solarMin) solarMin = day.solarRadiation;
      dayHasValidData = true;
    } else {
      missingValuesCount++;
    }

    // Humidity (RH2M)
    if (day.relativeHumidity !== null && day.relativeHumidity !== undefined && !isNaN(day.relativeHumidity)) {
      validHumidities.push(day.relativeHumidity);
      dayHasValidData = true;
    }

    // Wind (WS2M)
    if (day.windSpeed !== null && day.windSpeed !== undefined && !isNaN(day.windSpeed)) {
      validWinds.push(day.windSpeed);
      dayHasValidData = true;
    }

    if (dayHasValidData) {
      validDays++;
    }
  }

  // Median & StdDev for Temperature
  let tempMedian: number | null = null;
  let tempStdDev: number | null = null;
  let tempMean: number | null = null;

  if (validTemps.length > 0) {
    const sum = validTemps.reduce((acc, v) => acc + v, 0);
    tempMean = sum / validTemps.length;

    const sortedTemps = [...validTemps].sort((a, b) => a - b);
    const mid = Math.floor(sortedTemps.length / 2);
    tempMedian = sortedTemps.length % 2 !== 0 ? sortedTemps[mid] : (sortedTemps[mid - 1] + sortedTemps[mid]) / 2;

    const variance = validTemps.reduce((acc, v) => acc + Math.pow(v - tempMean!, 2), 0) / validTemps.length;
    tempStdDev = Math.sqrt(variance);
  }

  const precipMean = validPrecips.length > 0 ? precipTotal / validPrecips.length : null;
  const solarMean = validSolars.length > 0 ? validSolars.reduce((acc, v) => acc + v, 0) / validSolars.length : null;
  const humidityMean = validHumidities.length > 0 ? validHumidities.reduce((acc, v) => acc + v, 0) / validHumidities.length : null;
  const windSpeedMean = validWinds.length > 0 ? validWinds.reduce((acc, v) => acc + v, 0) / validWinds.length : null;

  return {
    count: data.length,
    validDays,
    tempMean: tempMean !== null ? Number(tempMean.toFixed(2)) : null,
    tempMax: tempMax !== -Infinity ? Number(tempMax.toFixed(2)) : null,
    tempMin: tempMin !== Infinity ? Number(tempMin.toFixed(2)) : null,
    tempMedian: tempMedian !== null ? Number(tempMedian.toFixed(2)) : null,
    tempStdDev: tempStdDev !== null ? Number(tempStdDev.toFixed(2)) : null,
    precipTotal: validPrecips.length > 0 ? Number(precipTotal.toFixed(1)) : null,
    precipMean: precipMean !== null ? Number(precipMean.toFixed(2)) : null,
    precipMax: validPrecips.length > 0 ? Number(precipMax.toFixed(1)) : null,
    wetDaysCount,
    dryDaysCount,
    longestDrySpell,
    solarMean: solarMean !== null ? Number(solarMean.toFixed(2)) : null,
    solarMax: solarMax !== -Infinity ? Number(solarMax.toFixed(2)) : null,
    solarMin: solarMin !== Infinity ? Number(solarMin.toFixed(2)) : null,
    humidityMean: humidityMean !== null ? Number(humidityMean.toFixed(1)) : null,
    windSpeedMean: windSpeedMean !== null ? Number(windSpeedMean.toFixed(2)) : null,
    missingValuesCount,
    dataQualityAudit: qualityAudit,
  };
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function calculateMonthlyAggregates(data: EnvironmentalPointData[]): MonthlyAggregate[] {
  const groups: { [monthKey: string]: EnvironmentalPointData[] } = {};

  for (const day of data) {
    const monthKey = day.date.substring(0, 7); // 'YYYY-MM'
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(day);
  }

  const sortedMonthKeys = Object.keys(groups).sort();
  const aggregates: MonthlyAggregate[] = [];

  for (const key of sortedMonthKeys) {
    const days = groups[key];
    const [yearStr, monthStr] = key.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const monthName = `${MONTH_NAMES[month - 1]} ${year}`;

    const temps: number[] = [];
    let precipSum = 0;
    let validPrecipDays = 0;
    let wetDaysCount = 0;
    const solars: number[] = [];
    let maxTemp = -Infinity;
    let minTemp = Infinity;

    for (const d of days) {
      if (d.temperatureMean !== null && d.temperatureMean !== undefined && !isNaN(d.temperatureMean)) {
        temps.push(d.temperatureMean);
      }
      if (d.temperatureMax !== null && d.temperatureMax !== undefined && !isNaN(d.temperatureMax) && d.temperatureMax > maxTemp) {
        maxTemp = d.temperatureMax;
      }
      if (d.temperatureMin !== null && d.temperatureMin !== undefined && !isNaN(d.temperatureMin) && d.temperatureMin < minTemp) {
        minTemp = d.temperatureMin;
      }
      if (d.precipitation !== null && d.precipitation !== undefined && !isNaN(d.precipitation)) {
        precipSum += Math.max(0, d.precipitation);
        validPrecipDays++;
        if (d.precipitation > 1.0) {
          wetDaysCount++;
        }
      }
      if (d.solarRadiation !== null && d.solarRadiation !== undefined && !isNaN(d.solarRadiation)) {
        solars.push(d.solarRadiation);
      }
    }

    const meanTemp = temps.length > 0 ? Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2)) : null;
    const meanSolar = solars.length > 0 ? Number((solars.reduce((a, b) => a + b, 0) / solars.length).toFixed(2)) : null;

    aggregates.push({
      monthKey: key,
      monthName,
      year,
      month,
      daysCount: days.length,
      meanTemperature: meanTemp,
      maxTemperature: maxTemp !== -Infinity ? Number(maxTemp.toFixed(2)) : null,
      minTemperature: minTemp !== Infinity ? Number(minTemp.toFixed(2)) : null,
      totalPrecipitation: validPrecipDays > 0 ? Number(precipSum.toFixed(1)) : 0,
      meanDailyPrecipitation: validPrecipDays > 0 ? Number((precipSum / validPrecipDays).toFixed(2)) : 0,
      wetDaysCount,
      meanSolarRadiation: meanSolar,
    });
  }

  return aggregates;
}
