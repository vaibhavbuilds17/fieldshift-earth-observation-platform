/**
 * NASA GIBS Layer Catalog and Imagery Service Utilities
 * Uses official NASA GIBS WMTS standard in EPSG:3857 (Web Mercator / Google Maps compatible)
 * Official doc: https://nasa-gibs.github.io/gibs-api-docs/
 */

export interface GibsLayerDefinition {
  id: string;
  name: string;
  layerTag: string; // WMTS Identifier
  description: string;
  category: 'Optical Satellite' | 'Vegetation & Canopy' | 'Precipitation' | 'Thermal Anomalies';
  sourceSatellite: string;
  instrument: string;
  format: 'image/jpeg' | 'image/png';
  extension: 'jpg' | 'png';
  tileMatrixSet: string;
  maxZoom: number;
  minZoom: number;
  isTransparent: boolean;
  defaultOpacity: number;
  timeFormat: 'date' | 'default'; // 'YYYY-MM-DD' or 'default'
  historicalSupport: boolean;
  legendDescription: string;
  attribution: string;
}

export const GIBS_LAYERS: GibsLayerDefinition[] = [
  {
    id: 'modis-terra-truecolor',
    name: 'MODIS Terra True Color (Corrected Reflectance)',
    layerTag: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    description: 'Natural color daily optical satellite view from NASA Terra satellite morning pass (10:30 AM equator crossing).',
    category: 'Optical Satellite',
    sourceSatellite: 'NASA EOS Terra',
    instrument: 'MODIS (Moderate Resolution Imaging Spectroradiometer)',
    format: 'image/jpeg',
    extension: 'jpg',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    maxZoom: 9,
    minZoom: 1,
    isTransparent: false,
    defaultOpacity: 0.85,
    timeFormat: 'date',
    historicalSupport: true,
    legendDescription: 'Natural color composite (Bands 1, 4, 3) representing earth surface as human eye would see it.',
    attribution: 'NASA EOSDIS Global Imagery Browse Services (GIBS), NASA Terra / MODIS',
  },
  {
    id: 'modis-aqua-truecolor',
    name: 'MODIS Aqua True Color (Corrected Reflectance)',
    layerTag: 'MODIS_Aqua_CorrectedReflectance_TrueColor',
    description: 'Afternoon pass (1:30 PM equator crossing) optical reflectance from NASA Aqua satellite.',
    category: 'Optical Satellite',
    sourceSatellite: 'NASA EOS Aqua',
    instrument: 'MODIS',
    format: 'image/jpeg',
    extension: 'jpg',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    maxZoom: 9,
    minZoom: 1,
    isTransparent: false,
    defaultOpacity: 0.85,
    timeFormat: 'date',
    historicalSupport: true,
    legendDescription: 'Afternoon natural color composite showing cloud development and surface brightness.',
    attribution: 'NASA EOSDIS GIBS, NASA Aqua / MODIS',
  },
  {
    id: 'modis-ndvi-16day',
    name: 'MODIS Normalized Difference Vegetation Index (NDVI 16-Day)',
    layerTag: 'MODIS_Terra_L3_NDVI_16Day',
    description: 'Vegetation canopy health and chlorophyll activity index composited over 16 days to remove cloud contamination.',
    category: 'Vegetation & Canopy',
    sourceSatellite: 'NASA EOS Terra',
    instrument: 'MODIS (Product MOD13Q1)',
    format: 'image/png',
    extension: 'png',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    maxZoom: 9,
    minZoom: 1,
    isTransparent: true,
    defaultOpacity: 0.70,
    timeFormat: 'default',
    historicalSupport: true,
    legendDescription: 'Color ramp from Brown/Yellow (Bare soil/dormant, NDVI 0.0-0.2) to Deep Green (Dense canopy, NDVI > 0.7).',
    attribution: 'NASA Land Processes DAAC (LP DAAC), MODIS Science Team, GIBS',
  },
  {
    id: 'gpm-imerg-precipitation',
    name: 'GPM IMERG Near Real-Time Precipitation Rate',
    layerTag: 'IMERG_Precipitation_Rate',
    description: 'Integrated Multi-satellitE Retrievals for GPM showing instantaneous rain and snowfall rate.',
    category: 'Precipitation',
    sourceSatellite: 'NASA / JAXA Global Precipitation Measurement (GPM)',
    instrument: 'GPM Dual-frequency Precipitation Radar & Microwave Imager constellation',
    format: 'image/png',
    extension: 'png',
    tileMatrixSet: 'GoogleMapsCompatible_Level6',
    maxZoom: 6,
    minZoom: 1,
    isTransparent: true,
    defaultOpacity: 0.75,
    timeFormat: 'default',
    historicalSupport: false,
    legendDescription: 'Precipitation rate: Cyan (0.1 mm/hr) -> Blue (2 mm/hr) -> Yellow (10 mm/hr) -> Magenta (> 25 mm/hr cloudburst).',
    attribution: 'NASA Precipitation Processing System (PPS), NASA GSFC, JAXA',
  },
  {
    id: 'viirs-thermal-anomalies',
    name: 'VIIRS 375m Thermal Anomalies & Active Fires',
    layerTag: 'VIIRS_SNPP_Thermal_Anomalies_375m_All',
    description: 'High-resolution thermal detections identifying agricultural stubble fires, sugar cane trash burning, and thermal hot spots.',
    category: 'Thermal Anomalies',
    sourceSatellite: 'Suomi-NPP / JPSS',
    instrument: 'VIIRS (Visible Infrared Imaging Radiometer Suite) 375m I-Band',
    format: 'image/png',
    extension: 'png',
    tileMatrixSet: 'GoogleMapsCompatible_Level8',
    maxZoom: 8,
    minZoom: 1,
    isTransparent: true,
    defaultOpacity: 0.90,
    timeFormat: 'default',
    historicalSupport: false,
    legendDescription: 'Bright red/yellow markers signify active thermal emission detection within a 375m pixel.',
    attribution: 'NASA FIRMS, NASA EOSDIS GIBS, Suomi-NPP / VIIRS',
  },
];

/**
 * Build WMTS Tile URL for NASA GIBS
 * EPSG:3857 (Web Mercator) pattern:
 * https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{Layer}/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.{format}
 */
export function buildGibsTileUrl(
  layer: GibsLayerDefinition,
  x: number,
  y: number,
  z: number,
  targetDate?: string // 'YYYY-MM-DD'
): string {
  // If targetDate provided and layer supports date, use it; otherwise use 'default'
  const timeParam =
    layer.timeFormat === 'date' && targetDate ? targetDate : 'default';

  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer.layerTag}/default/${timeParam}/${layer.tileMatrixSet}/${z}/${y}/${x}.${layer.extension}`;
}

/**
 * Generate NASA Worldview deep link URL for a specific Maharashtra coordinate and active date
 */
export function generateWorldviewUrl(
  lat: number,
  lng: number,
  zoomLevel: number = 8,
  dateIso?: string
): string {
  // Calculate bounding box around coordinate
  const delta = 1.2;
  const v = `${(lng - delta).toFixed(3)},${(lat - delta).toFixed(3)},${(lng + delta).toFixed(3)},${(lat + delta).toFixed(3)}`;
  const dateStr = dateIso || new Date().toISOString().split('T')[0];
  const layers = 'MODIS_Terra_CorrectedReflectance_TrueColor,MODIS_Aqua_CorrectedReflectance_TrueColor,VIIRS_SNPP_Thermal_Anomalies_375m_All';

  return `https://worldview.earthdata.nasa.gov/?v=${v}&t=${dateStr}&l=${layers}`;
}
