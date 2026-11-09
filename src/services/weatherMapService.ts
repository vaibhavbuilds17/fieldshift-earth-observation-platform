/**
 * Weather Map Service & Layer Registry (Windy-Inspired GIS Architecture)
 * Supplies real raster, tile, and vector overlay endpoints for the interactive weather map.
 */

export type WeatherMapLayerId =
  | 'wind'
  | 'temp'
  | 'radar'
  | 'clouds'
  | 'rh'
  | 'pressure'
  | 'snow'
  | 'satellite_modis'
  | 'satellite_viirs'
  | 'soil_moisture'
  | 'ndvi'
  | 'wildfires'
  | 'air_quality';

export interface MapLayerLegendStep {
  value: string;
  color: string;
  label?: string;
}

export interface WeatherMapLayerSpec {
  id: WeatherMapLayerId;
  name: string;
  category: 'Atmosphere' | 'Radar & Rain' | 'Satellite' | 'Hydrology' | 'Biosphere' | 'Hazard';
  provider: string;
  status: 'Live Real-Time Radar' | 'Daily Satellite Pass' | 'Numerical Forecast' | 'Reanalysis Baseline' | 'Near Real-Time Anomaly';
  timestamp: string;
  unit: string;
  resolution: string;
  updateFrequency: string;
  coverageLimitations: string;
  tileUrl?: string;
  attribution: string;
  legend: MapLayerLegendStep[];
}

export const WEATHER_MAP_LAYERS: WeatherMapLayerSpec[] = [
  {
    id: 'wind',
    name: 'Wind Streamlines & Velocity',
    category: 'Atmosphere',
    provider: 'NOAA GFS & ECMWF IFS',
    status: 'Numerical Forecast',
    timestamp: 'Live Global Simulation',
    unit: 'm/s (or km/h)',
    resolution: '13 km / 0.1°',
    updateFrequency: 'Every 3 Hours',
    coverageLimitations: 'Global planetary coverage from 90°N to 90°S across all oceans and landmasses.',
    attribution: 'NOAA National Centers for Environmental Prediction & ECMWF',
    legend: [
      { value: '0', color: '#1e293b', label: 'Calm (<1 m/s)' },
      { value: '3', color: '#06b6d4', label: 'Light (3 m/s)' },
      { value: '8', color: '#10b981', label: 'Moderate (8 m/s)' },
      { value: '14', color: '#f59e0b', label: 'Strong (14 m/s)' },
      { value: '22', color: '#ef4444', label: 'Gale (22 m/s)' },
      { value: '32+', color: '#a855f7', label: 'Storm (32+ m/s)' },
    ],
  },
  {
    id: 'temp',
    name: '2m Surface Air Temperature',
    category: 'Atmosphere',
    provider: 'ECMWF IFS & NOAA GFS',
    status: 'Numerical Forecast',
    timestamp: 'Live Hourly Synthesis',
    unit: '°C',
    resolution: '0.1° × 0.1° (~10 km)',
    updateFrequency: 'Hourly Updates',
    coverageLimitations: 'Global coverage; high mountain passes and valleys may exhibit sub-grid localized microclimate deviations.',
    attribution: 'ECMWF / Open-Meteo High-Resolution Ensemble',
    legend: [
      { value: '-20', color: '#312e81', label: '-20°C' },
      { value: '-5', color: '#2563eb', label: '-5°C' },
      { value: '5', color: '#06b6d4', label: '5°C' },
      { value: '15', color: '#10b981', label: '15°C' },
      { value: '25', color: '#f59e0b', label: '25°C' },
      { value: '35', color: '#ea580c', label: '35°C' },
      { value: '45+', color: '#b91c1c', label: '45°C+' },
    ],
  },
  {
    id: 'radar',
    name: 'Live Weather Radar (RainViewer)',
    category: 'Radar & Rain',
    provider: 'RainViewer International Meteorological Radar Network',
    status: 'Live Real-Time Radar',
    timestamp: 'Past 2 Hours to Present',
    unit: 'dBZ (Radar Reflectivity)',
    resolution: '1 km - 4 km near radar stations',
    updateFrequency: 'Every 10 Minutes',
    coverageLimitations: 'Coverage relies on physical Doppler ground radar towers (heavy coverage in US, Europe, Japan, India, Australia; oceanic & deep desert coverage interpolated from satellite microwave).',
    tileUrl: 'https://tilecache.rainviewer.com/v2/radar/{ts}/256/{z}/{x}/{y}/2/1_1.png',
    attribution: 'RainViewer Ground Doppler Radar Network',
    legend: [
      { value: '10', color: '#84cc16', label: 'Light (0.2 mm/h)' },
      { value: '25', color: '#eab308', label: 'Moderate (2 mm/h)' },
      { value: '40', color: '#f97316', label: 'Heavy (10 mm/h)' },
      { value: '55+', color: '#dc2626', label: 'Severe / Hail (>50 mm/h)' },
    ],
  },
  {
    id: 'clouds',
    name: 'Total Cloud Fraction & Moisture',
    category: 'Atmosphere',
    provider: 'EUMETSAT & NOAA GOES / Himawari / Meteosat',
    status: 'Daily Satellite Pass',
    timestamp: 'Near Real-Time Geostationary',
    unit: '%',
    resolution: '1 km - 4 km',
    updateFrequency: 'Every 15-30 Minutes',
    coverageLimitations: 'Geostationary parallax distortion near extreme high latitudes (>75°N/S).',
    attribution: 'NOAA / EUMETSAT / JMA Geostationary Satellites',
    legend: [
      { value: '0', color: '#090d16', label: 'Clear (0%)' },
      { value: '25', color: '#334155', label: 'Scattered (25%)' },
      { value: '60', color: '#64748b', label: 'Broken (60%)' },
      { value: '100', color: '#f8fafc', label: 'Overcast (100%)' },
    ],
  },
  {
    id: 'rh',
    name: 'Relative Humidity (2m)',
    category: 'Atmosphere',
    provider: 'ECMWF ERA5 & GFS',
    status: 'Numerical Forecast',
    timestamp: 'Hourly',
    unit: '%',
    resolution: '0.1° (~10 km)',
    updateFrequency: 'Hourly',
    coverageLimitations: 'Global planetary coverage.',
    attribution: 'European Centre for Medium-Range Weather Forecasts',
    legend: [
      { value: '10', color: '#78350f', label: 'Arid (<20%)' },
      { value: '40', color: '#d97706', label: 'Dry (40%)' },
      { value: '65', color: '#059669', label: 'Comfortable (65%)' },
      { value: '85', color: '#0284c7', label: 'Humid (85%)' },
      { value: '100', color: '#1e40af', label: 'Saturated (100%)' },
    ],
  },
  {
    id: 'pressure',
    name: 'Mean Sea-Level Pressure & Isobars',
    category: 'Atmosphere',
    provider: 'NOAA GFS & ECMWF',
    status: 'Numerical Forecast',
    timestamp: '3-Hourly',
    unit: 'hPa',
    resolution: '0.25° × 0.25°',
    updateFrequency: 'Every 6 Hours',
    coverageLimitations: 'Global coverage.',
    attribution: 'NOAA NCEP & ECMWF',
    legend: [
      { value: '980', color: '#7f1d1d', label: 'Low (<990 hPa)' },
      { value: '1005', color: '#d97706', label: 'Trough (1005 hPa)' },
      { value: '1013', color: '#059669', label: 'Standard (1013 hPa)' },
      { value: '1025', color: '#1e40af', label: 'High (>1025 hPa)' },
    ],
  },
  {
    id: 'satellite_modis',
    name: 'NASA GIBS MODIS True Color (Terra)',
    category: 'Satellite',
    provider: 'NASA EOSDIS Global Imagery Browse Services (GIBS)',
    status: 'Daily Satellite Pass',
    timestamp: 'Daily Sun-Synchronous Pass (~10:30 local)',
    unit: 'Corrected Surface Reflectance (Bands 1-4-3)',
    resolution: '250m per pixel at nadir',
    updateFrequency: 'Daily (updated within 3–5 hours of satellite pass)',
    coverageLimitations: 'Optical imagery cannot penetrate dense monsoon cloud decks; nighttime views are dark without thermal infrared conversion.',
    tileUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
    attribution: 'NASA EOSDIS GIBS / Earth Science Data and Information System',
    legend: [
      { value: 'Land', color: '#4d7c0f', label: 'Vegetated Land' },
      { value: 'Desert', color: '#d97706', label: 'Arid / Desert' },
      { value: 'Water', color: '#0369a1', label: 'Ocean / Water' },
      { value: 'Cloud', color: '#ffffff', label: 'Clouds / Snow' },
    ],
  },
  {
    id: 'satellite_viirs',
    name: 'NASA GIBS VIIRS True Color (Suomi NPP)',
    category: 'Satellite',
    provider: 'NASA / NOAA Suomi NPP Satellite',
    status: 'Daily Satellite Pass',
    timestamp: 'Daily Afternoon Pass (~13:30 local)',
    unit: 'Corrected Surface Reflectance (M3-I2-I1)',
    resolution: '375m per pixel',
    updateFrequency: 'Daily',
    coverageLimitations: 'Afternoon pass; optical clouds obstruct surface view.',
    tileUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
    attribution: 'NASA EOSDIS GIBS / NOAA',
    legend: [
      { value: 'Natural', color: '#15803d', label: 'Natural True Color View' },
    ],
  },
  {
    id: 'ndvi',
    name: 'MODIS 16-Day Vegetation Index (NDVI)',
    category: 'Biosphere',
    provider: 'NASA LP DAAC / MODIS (MOD13Q1)',
    status: 'Daily Satellite Pass',
    timestamp: 'Rolling 16-Day Cloud-Free Composite',
    unit: 'NDVI Index (-0.1 to +1.0)',
    resolution: '250m Spatial Grid',
    updateFrequency: 'Every 16 Days',
    coverageLimitations: 'Reflects 16-day cloud-filtered composite; rapid weekly flash droughts may take up to 8 days to manifest in greenness decline.',
    tileUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_16Day/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png',
    attribution: 'NASA Land Processes Distributed Active Archive Center',
    legend: [
      { value: '0.1', color: '#a16207', label: 'Bare Soil (<0.2)' },
      { value: '0.3', color: '#ca8a04', label: 'Sparse (0.2 - 0.4)' },
      { value: '0.6', color: '#65a30d', label: 'Moderate (0.4 - 0.6)' },
      { value: '0.85', color: '#15803d', label: 'Dense Canopy (>0.7)' },
    ],
  },
  {
    id: 'soil_moisture',
    name: 'SMAP & SoilGrids Volumetric Soil Moisture',
    category: 'Hydrology',
    provider: 'NASA SMAP & ISRIC World Soil Information',
    status: 'Daily Satellite Pass',
    timestamp: 'Daily L-band Radiometer Retrieval',
    unit: 'm³/m³ (Volumetric Water Fraction)',
    resolution: '9 km (SMAP) / 250m (SoilGrids AWC)',
    updateFrequency: 'Daily',
    coverageLimitations: 'L-band microwave senses top 5-10 cm; root-zone is assimilated via hydrologic catchment model.',
    attribution: 'NASA Soil Moisture Active Passive (SMAP) / ISRIC',
    legend: [
      { value: '0.08', color: '#78350f', label: 'Severe Desiccation (<0.10)' },
      { value: '0.18', color: '#ca8a04', label: 'Low Moisture (0.10 - 0.20)' },
      { value: '0.30', color: '#0d9488', label: 'Adequate (0.20 - 0.35)' },
      { value: '0.45+', color: '#0369a1', label: 'Saturated (>0.40)' },
    ],
  },
  {
    id: 'wildfires',
    name: 'Active Thermal Anomalies (NASA FIRMS)',
    category: 'Hazard',
    provider: 'NASA FIRMS / VIIRS & MODIS',
    status: 'Near Real-Time Anomaly',
    timestamp: 'Updated Every 3 Hours',
    unit: 'Fire Radiative Power (MW) & Confidence (%)',
    resolution: '375m Spatial Footprint',
    updateFrequency: 'Near Real-Time (~3-hour latency)',
    coverageLimitations: 'Detects active flaming/smoldering hotspots at moment of satellite overpass; obscured under thick stratiform cloud shields.',
    attribution: 'NASA Earth Science Data and Information System / FIRMS',
    legend: [
      { value: 'Nominal', color: '#f59e0b', label: 'Nominal Confidence (375m)' },
      { value: 'High', color: '#ef4444', label: 'High Confidence Active Fire' },
      { value: 'Extreme', color: '#991b1b', label: 'Extreme Radiative Power (>100 MW)' },
    ],
  },
  {
    id: 'air_quality',
    name: 'European Air Quality Index & PM2.5',
    category: 'Hazard',
    provider: 'Copernicus Atmosphere Monitoring Service (CAMS)',
    status: 'Numerical Forecast',
    timestamp: 'Hourly Global Atmospheric Composition',
    unit: 'European AQI (1-5) & PM2.5 (µg/m³)',
    resolution: '0.25° × 0.25° (~25 km)',
    updateFrequency: 'Every 3 Hours',
    coverageLimitations: 'Regional chemical transport model; hyper-local street canyon concentrations may be higher near industrial point sources.',
    attribution: 'European Union Copernicus Atmosphere Monitoring Service / Open-Meteo',
    legend: [
      { value: '1', color: '#10b981', label: 'Good (<10 µg/m³)' },
      { value: '2', color: '#06b6d4', label: 'Fair (10-20 µg/m³)' },
      { value: '3', color: '#eab308', label: 'Moderate (20-25 µg/m³)' },
      { value: '4', color: '#f97316', label: 'Poor (25-50 µg/m³)' },
      { value: '5', color: '#ef4444', label: 'Very Poor (>50 µg/m³)' },
    ],
  },
];

/**
 * Fetch the latest valid radar timestamp from RainViewer API
 */
export async function getLatestRainViewerTimestamp(): Promise<number> {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!res.ok) throw new Error('RainViewer status check failed');
    const json = await res.json();
    const pastRadar = json.radar?.past;
    if (pastRadar && pastRadar.length > 0) {
      return pastRadar[pastRadar.length - 1].time;
    }
  } catch (e) {
    console.warn('Could not query RainViewer API, using fallback timestamp');
  }
  // Fallback to approximate 10-minute rounded timestamp
  return Math.floor(Date.now() / 600000) * 600;
}
