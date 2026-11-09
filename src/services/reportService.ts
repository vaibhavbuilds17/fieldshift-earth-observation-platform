import { jsPDF } from 'jspdf';
import { EnvironmentalPointData, DataSetStatistics, StudyLocation } from '../types/nasa';

export interface ReportConfig {
  location: StudyLocation;
  data: EnvironmentalPointData[];
  statistics: DataSetStatistics;
  sources: string[];
  retrievedAt: string;
  isSampleData: boolean;
  heatThreshold: number;
  dryThreshold: number;
}

export function generateCsvExport(
  data: EnvironmentalPointData[],
  location: StudyLocation,
  retrievedAt: string,
  isSample: boolean
): void {
  const metaHeader = [
    `# FieldShift Science Explorer - NASA Agroclimatology Data Export`,
    `# Study Location: ${location.name} (${location.region})`,
    `# Coordinates: Latitude ${location.latitude}°N, Longitude ${location.longitude}°E`,
    `# Elevation: ${location.elevationMeters ? location.elevationMeters + ' m' : 'Estimated'}`,
    `# Retrieval Timestamp: ${retrievedAt}`,
    `# Data Status: ${isSample ? 'Verified Reference Sample' : 'Live NASA POWER API'}`,
    `# Data Source: NASA Langley Research Center POWER Project (https://power.larc.nasa.gov/)`,
    `# Disclaimer: Educational research data. Not a replacement for local meteorological warnings.`,
    ``,
  ].join('\n');

  const headers = [
    'Date (YYYY-MM-DD)',
    'NASA_DateKey',
    'T2M_Mean_DegC',
    'T2M_Max_DegC',
    'T2M_Min_DegC',
    'DiurnalRange_DegC',
    'PRECTOTCORR_Precip_mm_day',
    'ALLSKY_SFC_SW_DWN_Solar_MJ_m2_day',
    'RH2M_RelativeHumidity_pct',
    'WS2M_WindSpeed_m_s',
  ];

  const rows = data.map((d) => [
    d.date,
    d.dateKey,
    d.temperatureMean !== null && d.temperatureMean !== undefined ? d.temperatureMean : 'NaN',
    d.temperatureMax !== null && d.temperatureMax !== undefined ? d.temperatureMax : 'NaN',
    d.temperatureMin !== null && d.temperatureMin !== undefined ? d.temperatureMin : 'NaN',
    d.diurnalRange !== null && d.diurnalRange !== undefined ? d.diurnalRange : 'NaN',
    d.precipitation !== null && d.precipitation !== undefined ? d.precipitation : 'NaN',
    d.solarRadiation !== null && d.solarRadiation !== undefined ? d.solarRadiation : 'NaN',
    d.relativeHumidity !== null && d.relativeHumidity !== undefined ? d.relativeHumidity : 'NaN',
    d.windSpeed !== null && d.windSpeed !== undefined ? d.windSpeed : 'NaN',
  ]);

  const csvContent =
    metaHeader +
    headers.join(',') +
    '\n' +
    rows.map((row) => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedName = location.name.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `FieldShift_${sanitizedName}_Climate_Data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateJsonExport(
  data: EnvironmentalPointData[],
  location: StudyLocation,
  statistics: DataSetStatistics,
  retrievedAt: string
): void {
  const exportPayload = {
    metadata: {
      generator: 'FieldShift Science Explorer',
      project: 'NASA Space Apps Challenge 2026',
      studyLocation: location,
      retrievedAt,
      dataUrl: 'https://power.larc.nasa.gov/',
      observationCount: data.length,
      units: {
        temperature: '°C',
        precipitation: 'mm/day',
        solarRadiation: 'MJ/m²/day',
        relativeHumidity: '%',
        windSpeed: 'm/s',
      },
      summaryStatistics: statistics,
    },
    observations: data,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedName = location.name.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `FieldShift_${sanitizedName}_Dataset.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateScientificPdfReport(config: ReportConfig): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header band
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FIELDSHIFT SCIENCE EXPLORER', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('NASA-Powered Agricultural Environmental Research Assessment', margin, 18);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, 24);

  y = 36;

  // Study Location Banner
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`STUDY TARGET: ${config.location.name.toUpperCase()}, ${config.location.region.toUpperCase()}`, margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Coordinates: ${config.location.latitude}°N, ${config.location.longitude}°E  |  Elevation: ${config.location.elevationMeters || 512} m  |  Country: ${config.location.country}`,
    margin + 4,
    y + 13
  );

  const startDate = config.data[0]?.date || 'N/A';
  const endDate = config.data[config.data.length - 1]?.date || 'N/A';
  doc.text(
    `Date Period: ${startDate} to ${endDate} (${config.data.length} daily time steps)  |  Status: ${config.isSampleData ? 'Reference Baseline' : 'Live NASA POWER'}`,
    margin + 4,
    y + 19
  );

  y += 32;

  // Section 1: Executive Scientific Summary
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Executive Agro-Climatology Summary', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const summaryText =
    `This scientific report evaluates daily atmospheric observations and reanalysis products retrieved from the NASA Prediction of Worldwide Energy Resources (POWER) project for agro-climatic assessment. Over the ${config.data.length} recorded daily observations, the location experienced an average 2-meter air temperature of ${config.statistics.tempMean !== null ? config.statistics.tempMean + ' °C' : 'N/A'} (max ${config.statistics.tempMax ?? 'N/A'} °C, min ${config.statistics.tempMin ?? 'N/A'} °C). Cumulative precipitation reached ${config.statistics.precipTotal ?? 'N/A'} mm across ${config.statistics.wetDaysCount} wet days (>1.0 mm/day), punctuated by a maximum recorded dry spell of ${config.statistics.longestDrySpell} consecutive days. Mean incident solar irradiance measured ${config.statistics.solarMean ?? 'N/A'} MJ/m²/day.`;

  const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 4.5 + 4;

  // Section 2: Key Environmental Statistics Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Descriptive Statistical Baseline', margin, y);
  y += 6;

  // Table header
  doc.setFillColor(226, 232, 240); // slate-200
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  const colWidths = [45, 24, 24, 24, 24, 37];
  const colX = [
    margin + 2,
    margin + 47,
    margin + 71,
    margin + 95,
    margin + 119,
    margin + 143,
  ];

  doc.text('Environmental Parameter', colX[0], y + 5);
  doc.text('Mean', colX[1], y + 5);
  doc.text('Min', colX[2], y + 5);
  doc.text('Max', colX[3], y + 5);
  doc.text('Median', colX[4], y + 5);
  doc.text('Std. Dev / Total', colX[5], y + 5);
  y += 7;

  // Table Rows
  const tableData = [
    [
      'Mean Temperature (T2M)',
      `${config.statistics.tempMean ?? 'N/A'} °C`,
      `${config.statistics.tempMin ?? 'N/A'} °C`,
      `${config.statistics.tempMax ?? 'N/A'} °C`,
      `${config.statistics.tempMedian ?? 'N/A'} °C`,
      `σ = ${config.statistics.tempStdDev ?? 'N/A'} °C`,
    ],
    [
      'Precipitation (PRECTOTCORR)',
      `${config.statistics.precipMean ?? 'N/A'} mm/d`,
      '0.0 mm',
      `${config.statistics.precipMax ?? 'N/A'} mm`,
      '0.0 mm',
      `Σ = ${config.statistics.precipTotal ?? 'N/A'} mm`,
    ],
    [
      'Solar Radiation (ALLSKY_SW)',
      `${config.statistics.solarMean ?? 'N/A'} MJ/m²`,
      `${config.statistics.solarMin ?? 'N/A'} MJ/m²`,
      `${config.statistics.solarMax ?? 'N/A'} MJ/m²`,
      'N/A',
      'Solar daylight flux',
    ],
    [
      'Relative Humidity (RH2M)',
      `${config.statistics.humidityMean ?? 'N/A'} %`,
      'N/A',
      'N/A',
      'N/A',
      'Atmospheric vapor',
    ],
    [
      'Wind Speed at 2m (WS2M)',
      `${config.statistics.windSpeedMean ?? 'N/A'} m/s`,
      'N/A',
      'N/A',
      'N/A',
      'Boundary layer',
    ],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  tableData.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 6, 'F');
    }
    doc.setTextColor(51, 65, 85);
    row.forEach((cell, ci) => {
      doc.text(cell, colX[ci], y + 4.2);
    });
    y += 6;
  });

  y += 6;

  // Section 3: Agricultural Climate Risk Indicators
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. Agricultural Risk & Threshold Analysis', margin, y);
  y += 6;

  // Calculate days above user threshold
  const heatThreshold = config.heatThreshold || 38.0;
  const daysAboveHeat = config.data.filter(
    (d) => d.temperatureMax !== null && d.temperatureMax !== undefined && d.temperatureMax >= heatThreshold
  ).length;
  const heatPct = ((daysAboveHeat / (config.data.length || 1)) * 100).toFixed(1);

  const dryThreshold = config.dryThreshold || 1.0;
  const dryDays = config.data.filter(
    (d) => d.precipitation !== null && d.precipitation !== undefined && d.precipitation <= dryThreshold
  ).length;
  const dryPct = ((dryDays / (config.data.length || 1)) * 100).toFixed(1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const riskLines = [
    `• Thermal Stress (Threshold ≥ ${heatThreshold}°C): ${daysAboveHeat} days (${heatPct}% of period) exceeded critical canopy threshold. Sustained daytime heat accelerates evapotranspiration and increases floral abscission risk in flowering crops.`,
    `• Moisture Deficit & Dry Days (Precipitation ≤ ${dryThreshold} mm/day): ${dryDays} days (${dryPct}% of period) had negligible precipitation, with the longest continuous dry run reaching ${config.statistics.longestDrySpell} days. Supplementary irrigation scheduling is critical during these intervals.`,
    `• Diurnal Fluctuation: High daytime temperatures coupled with elevated nighttime minimums can inhibit dark enzymatic recovery in C3 plants like wheat and onions.`,
  ];

  riskLines.forEach((line) => {
    const splitLine = doc.splitTextToSize(line, contentWidth);
    doc.text(splitLine, margin, y);
    y += splitLine.length * 4.2 + 2;
  });

  y += 4;

  // Section 4: Scientific Limitations & Methodological Caveats
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('4. Scientific Limitations & Data Provenance', margin, y);
  y += 6;

  const limitations = [
    `1. Gridded Spatial Resolution: NASA POWER data is provided on a 0.5° × 0.5° (approx. 50 km) or 0.625° × 0.5° grid. It reflects regional atmospheric conditions rather than farm-level microclimates influenced by shelterbelts or topography.`,
    `2. Reanalysis vs Ground Instrumentation: Observations incorporate satellite retrievals (CERES, MODIS) and MERRA-2 assimilation rather than in-situ soil moisture or sap-flow probes. Ground-truth validation remains essential.`,
    `3. Educational Scope: This assessment is generated for educational research and spatial exploratory purposes. It does not replace guidance from local agricultural universities, Krishi Vigyan Kendras (KVK), or official IMD weather advisories.`,
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      // Add footer to current page
      doc.setFillColor(241, 245, 249);
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'FieldShift Science Explorer  |  NASA Space Apps Challenge 2026  |  power.larc.nasa.gov',
        margin,
        pageHeight - 5
      );
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 15, pageHeight - 5);

      doc.addPage();
      y = margin;
    }
  };

  limitations.forEach((item) => {
    const splitItem = doc.splitTextToSize(item, contentWidth);
    checkPageBreak(splitItem.length * 4 + 4);
    doc.text(splitItem, margin, y);
    y += splitItem.length * 4 + 2;
  });

  // Footer bar on first page
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'FieldShift Science Explorer  |  NASA Space Apps Challenge 2026  |  Data: NASA POWER (power.larc.nasa.gov)',
    margin,
    pageHeight - 5
  );
  doc.text('Page 1 of 1', pageWidth - margin - 15, pageHeight - 5);

  // Trigger download
  const sanitizedName = config.location.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`FieldShift_${sanitizedName}_Scientific_Report.pdf`);
}
