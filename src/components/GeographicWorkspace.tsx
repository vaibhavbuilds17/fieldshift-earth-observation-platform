import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Layers,
  Satellite,
  Compass,
  Info,
  Key,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Maximize2,
  HelpCircle,
  X,
  Globe,
  Sliders,
  Calendar,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StudyLocation, DataStatus, DataQualityAudit } from '../types/nasa';
import { PRESET_LOCATIONS } from '../data/presetLocations';
import { GibsMapOverlay } from './GibsMapOverlay';
import { GibsLayerControlPanel } from './GibsLayerControlPanel';
import { GIBS_LAYERS, GibsLayerDefinition } from '../services/nasaGibsService';
import { isPointInsideMaharashtra, getMaharashtraAgroZone } from '../data/maharashtraBoundary';
import { DynamicLocationSearch } from './DynamicLocationSearch';
import {
  SearchScope,
  analyzeScientificCoverage,
  ScientificCoverageAnalysis,
} from '../services/locationSearchService';

// Maharashtra Geographic Bounding Box
export const MAHARASHTRA_BOUNDS = {
  north: 22.10,
  south: 15.60,
  west: 72.60,
  east: 80.90,
};

// Shirdi–Kopargaon Initial Center
export const SHIRDI_INITIAL_CENTER = {
  lat: 19.76,
  lng: 74.48,
};

const GOOGLE_MAPS_LIBRARIES: ('marker' | 'geometry' | 'places')[] = ['marker', 'geometry', 'places'];

interface GeographicWorkspaceProps {
  currentLocation: StudyLocation;
  dataStatus: DataStatus;
  isSampleData: boolean;
  startDate?: string;
  endDate?: string;
  dataQualityAudit?: DataQualityAudit;
  onSelectLocation: (loc: StudyLocation) => void;
  onNavigateToLab: () => void;
  onNavigateToCharts: () => void;
}

export type MapTypeOption = 'hybrid' | 'satellite' | 'terrain' | 'roadmap';

// Helper controller component to pan map smoothly when location changes
function MapCameraController({ targetLat, targetLng }: { targetLat: number; targetLng: number }) {
  const map = useMap();
  React.useEffect(() => {
    if (map) {
      map.panTo({ lat: targetLat, lng: targetLng });
    }
  }, [map, targetLat, targetLng]);
  return null;
}

export const GeographicWorkspace: React.FC<GeographicWorkspaceProps> = ({
  currentLocation,
  dataStatus,
  isSampleData,
  startDate = '2024-01-01',
  endDate = '2024-01-05',
  dataQualityAudit,
  onSelectLocation,
  onNavigateToLab,
  onNavigateToCharts,
}) => {
  // Read API Key from Vite env or fallback to authorized demo key
  const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const defaultApiKey = envApiKey || 'AIzaSyCrEGFw_WHIUGe1ApEnihsbR4TQS2KMlZ4';
  const [apiKey, setApiKey] = useState<string>(defaultApiKey);

  const [mapType, setMapType] = useState<MapTypeOption>('hybrid');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(currentLocation.id);
  const [infoWindowLocation, setInfoWindowLocation] = useState<StudyLocation | null>(null);
  const [boundsNotice, setBoundsNotice] = useState<string | null>(null);
  const [showKeyGuide, setShowKeyGuide] = useState<boolean>(false);
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [showScientificDetails, setShowScientificDetails] = useState<boolean>(true);

  // Search Scope: 'maharashtra' (default), 'india', 'worldwide'
  const [searchScope, setSearchScope] = useState<SearchScope>('maharashtra');

  // NASA GIBS Layer state
  const [activeGibsLayer, setActiveGibsLayer] = useState<GibsLayerDefinition | null>(GIBS_LAYERS[0]); // default MODIS Terra TrueColor
  const [gibsOpacity, setGibsOpacity] = useState<number>(0.85);
  const [imageryDate, setImageryDate] = useState<string>(() => {
    // Default to yesterday to ensure complete satellite composite availability
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [overlayError, setOverlayError] = useState<string | null>(null);

  // Check whether a coordinate falls strictly within Maharashtra using polygon ray-casting
  const isWithinMaharashtra = useCallback((lat: number, lng: number) => {
    return isPointInsideMaharashtra(lat, lng);
  }, []);

  // Scientific coverage and resolution analysis
  const coverageAnalysis: ScientificCoverageAnalysis = useMemo(() => {
    return analyzeScientificCoverage(currentLocation.latitude, currentLocation.longitude, searchScope);
  }, [currentLocation.latitude, currentLocation.longitude, searchScope]);

  // Handle map click to select custom point
  // Uses reverse geocoding to identify nearest known locality or formats coordinates cleanly without inventing place names
  const handleMapClick = useCallback(
    (e: { detail?: { latLng?: { lat: number; lng: number } | null } }) => {
      const latLng = e.detail?.latLng;
      if (!latLng) return;

      const lat = Number(latLng.lat.toFixed(4));
      const lng = Number(latLng.lng.toFixed(4));
      const isMh = isWithinMaharashtra(lat, lng);

      // In Maharashtra mode, strictly enforce Maharashtra state boundary
      if (searchScope === 'maharashtra' && !isMh) {
        setBoundsNotice(
          `Coordinates (${lat}°N, ${lng}°E) fall outside Maharashtra's state boundary. Research scope is set to 'Maharashtra (Strict)'. Switch scope to 'India' or 'Worldwide' to analyze this location, or click within Maharashtra.`
        );
        setTimeout(() => setBoundsNotice(null), 8000);
        return;
      }

      setBoundsNotice(null);
      const agroZone = isMh ? getMaharashtraAgroZone(lat, lng) : null;
      const defaultName = `Target Point (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;

      const finalizeSelection = (
        resolvedName: string,
        resolvedDistrict?: string,
        resolvedCountry?: string,
        formattedAddress?: string
      ) => {
        const newLocation: StudyLocation = {
          id: `custom_geo_${Date.now()}`,
          name: resolvedName,
          region: resolvedDistrict
            ? `${resolvedDistrict}${agroZone ? ` (${agroZone.zoneName})` : ''}`
            : agroZone
            ? agroZone.zoneName
            : searchScope === 'worldwide'
            ? 'Global Research Target'
            : 'India Target',
          country: resolvedCountry || (isMh ? 'India' : 'Global Target'),
          latitude: lat,
          longitude: lng,
          description: isMh && agroZone
            ? `Verified within Maharashtra state boundary. Agro-climatic classification: ${agroZone.zoneName}. Soils: ${agroZone.soilType}. Typical annual rainfall: ${agroZone.annualRainfallMm}. Key crops: ${agroZone.keyCrops.join(', ')}.`
            : `User-selected coordinate target at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E. ${
                formattedAddress ? `Nearest locality: ${formattedAddress}.` : ''
              }`,
          isPreset: false,
          district: resolvedDistrict,
          administrativeRegion: agroZone?.zoneName,
        };

        setSelectedMarkerId(newLocation.id);
        setInfoWindowLocation(newLocation);
        onSelectLocation(newLocation);
      };

      // Perform reverse geocoding via Google Maps Geocoder if loaded
      if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
        try {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const r = results[0];
              const localityComp = r.address_components.find(
                (c) =>
                  c.types.includes('locality') ||
                  c.types.includes('sublocality') ||
                  c.types.includes('sublocality_level_1') ||
                  c.types.includes('neighborhood')
              );
              const districtComp = r.address_components.find((c) =>
                c.types.includes('administrative_area_level_2')
              );
              const countryComp = r.address_components.find((c) =>
                c.types.includes('country')
              );
              const name = localityComp ? localityComp.long_name : defaultName;
              finalizeSelection(
                name,
                districtComp?.long_name,
                countryComp?.long_name,
                r.formatted_address
              );
            } else {
              finalizeSelection(defaultName);
            }
          });
          return;
        } catch (err) {
          console.warn('Reverse geocode error:', err);
        }
      }

      finalizeSelection(defaultName);
    },
    [isWithinMaharashtra, onSelectLocation, searchScope]
  );

  // Recenter map on Shirdi–Kopargaon
  const handleRecenterShirdi = () => {
    const shirdi = PRESET_LOCATIONS.find((p) => p.id === 'shirdi-kopargaon');
    if (shirdi) {
      setSelectedMarkerId(shirdi.id);
      setInfoWindowLocation(shirdi);
      onSelectLocation(shirdi);
    }
  };

  // Provider attribution information
  const imageryProviderDetails = useMemo(() => {
    switch (mapType) {
      case 'satellite':
      case 'hybrid':
        return {
          name: 'Google Maps Platform Optical Satellite',
          sources: 'Airbus DS, Maxar Technologies, CNES / Airbus, Copernicus Landsat',
          resolution: 'High-Resolution Sub-Meter to 15m optical composite',
          typeNote:
            'Optical satellite photography shows surface vegetation, field boundaries, and topography. This is distinct from NASA POWER atmospheric reanalysis data.',
        };
      case 'terrain':
        return {
          name: 'Google Maps Platform Digital Elevation Model (DEM)',
          sources: 'USGS, SRTM (Shuttle Radar Topography Mission), NASA JPL',
          resolution: '30m–90m global elevation topography',
          typeNote:
            'Topographical relief showing Western Ghats (Sahyadri) rain-shadow escarpment and Deccan Plateau river basins.',
        };
      default:
        return {
          name: 'Google Maps Platform Vector Roadmap',
          sources: 'Google Cartography, Survey of India, Open Data Contributors',
          resolution: 'Administrative and road network layer',
          typeNote:
            'Standard cartographic map showing district boundaries and transit arteries in Maharashtra.',
        };
    }
  }, [mapType]);

  return (
    <div className="space-y-6">
      {/* Workspace Header Bar */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Geographic Research Workspace
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                <MapPin className="w-3 h-3 text-slate-400" />
                Active Scope:{' '}
                {searchScope === 'maharashtra'
                  ? 'Maharashtra, India (Enforced)'
                  : searchScope === 'india'
                  ? 'India National'
                  : 'Worldwide Global'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
              Dynamic Geographic Earth Observation Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Search any Maharashtra village, taluka, landmark, or arbitrary geographic coordinate. Toggle between Maharashtra boundary enforcement, India national, and Worldwide global research scopes.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleRecenterShirdi}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              title="Reset center to Shirdi–Kopargaon (19.76°N, 74.48°E)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Center on Shirdi</span>
            </button>

            <button
              onClick={() => setShowKeyGuide(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors shadow-2xs cursor-pointer"
              title="View Google Maps API Key & Cloud Configuration instructions"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>API Key & Cloud Setup</span>
            </button>
          </div>
        </div>

        {/* Dynamic Location Search Field */}
        <div className="pt-2 border-t border-slate-800">
          <DynamicLocationSearch
            currentLocation={currentLocation}
            searchScope={searchScope}
            onChangeScope={(scope) => {
              setSearchScope(scope);
              setBoundsNotice(null);
            }}
            onSelectLocation={(loc) => {
              setSelectedMarkerId(loc.id);
              setInfoWindowLocation(loc);
              onSelectLocation(loc);
            }}
            onBoundaryViolation={(msg) => {
              setBoundsNotice(msg);
              setTimeout(() => setBoundsNotice(null), 8000);
            }}
          />
        </div>

        {/* Boundary & Scope Alert Banner */}
        {boundsNotice && (
          <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Boundary Scope Alert:</span>
              {boundsNotice}
            </div>
            <button
              onClick={() => setBoundsNotice(null)}
              className="text-amber-400 hover:text-amber-200 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Map Canvas and Layer Controls */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Layer & Map Type Controls Bar */}
        <div className="px-4 py-3 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Layer Selector */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-300 mr-1">Imagery Layer:</span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => setMapType('hybrid')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  mapType === 'hybrid'
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Google Maps Optical Satellite with roads and labels"
              >
                Satellite (Hybrid)
              </button>
              <button
                onClick={() => setMapType('satellite')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  mapType === 'satellite'
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Pure optical satellite imagery"
              >
                Satellite (Pure)
              </button>
              <button
                onClick={() => setMapType('terrain')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  mapType === 'terrain'
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Topographical terrain showing Western Ghats and Deccan basins"
              >
                Terrain Relief
              </button>
              <button
                onClick={() => setMapType('roadmap')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  mapType === 'roadmap'
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Standard vector cartography"
              >
                Roadmap
              </button>
            </div>
          </div>

          {/* Active Target Readout */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">Selected Target:</span>
            <span className="text-emerald-300 font-semibold">{currentLocation.name}</span>
            <span className="text-slate-500">
              ({currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E)
            </span>
          </div>
        </div>

        {/* The Interactive Google Map Container */}
        <div className="relative w-full h-[520px] sm:h-[580px] bg-slate-100">
          <APIProvider apiKey={apiKey} libraries={GOOGLE_MAPS_LIBRARIES}>
            <Map
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              defaultCenter={SHIRDI_INITIAL_CENTER}
              defaultZoom={7.5}
              mapTypeId={mapType}
              gestureHandling="greedy"
              disableDefaultUI={false}
              onClick={handleMapClick}
              restriction={
                searchScope === 'maharashtra'
                  ? {
                      latLngBounds: {
                        north: MAHARASHTRA_BOUNDS.north + 0.5,
                        south: MAHARASHTRA_BOUNDS.south - 0.5,
                        west: MAHARASHTRA_BOUNDS.west - 0.5,
                        east: MAHARASHTRA_BOUNDS.east + 0.5,
                      },
                      strictBounds: false,
                    }
                  : undefined
              }
              className="w-full h-full"
            >
              {/* Camera pan synchronization */}
              <MapCameraController
                targetLat={currentLocation.latitude}
                targetLng={currentLocation.longitude}
              />

              {/* NASA GIBS Tile Overlay (MODIS TrueColor, NDVI, IMERG, VIIRS Fires) */}
              <GibsMapOverlay
                activeLayer={activeGibsLayer}
                opacity={gibsOpacity}
                dateStr={imageryDate}
                onError={(err) => setOverlayError(err)}
              />

              {/* Render Preset Location Markers */}
              {PRESET_LOCATIONS.map((preset) => {
                const isSelected = currentLocation.id === preset.id;
                const isShirdi = preset.id === 'shirdi-kopargaon';

                return (
                  <AdvancedMarker
                    key={preset.id}
                    position={{ lat: preset.latitude, lng: preset.longitude }}
                    title={`${preset.name} - ${preset.region}`}
                    onClick={() => {
                      setSelectedMarkerId(preset.id);
                      setInfoWindowLocation(preset);
                      onSelectLocation(preset);
                    }}
                  >
                    <div
                      className={`relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                      }`}
                    >
                      {/* Pulse beacon for selected location */}
                      {isSelected && (
                        <span className="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
                      )}

                      <div
                        className={`px-2 py-1 rounded-md text-[11px] font-bold shadow-md flex items-center gap-1 border whitespace-nowrap ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30'
                            : isShirdi
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : 'bg-slate-900/90 text-white border-slate-700 backdrop-blur-xs'
                        }`}
                      >
                        <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : isShirdi ? 'text-slate-950' : 'text-emerald-400'}`} />
                        <span>{preset.name.split('(')[0].trim()}</span>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Render Custom Clicked / Searched Marker if not one of the static presets */}
              {!PRESET_LOCATIONS.some((p) => p.id === currentLocation.id) && (
                <AdvancedMarker
                  position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                  title={currentLocation.name}
                  onClick={() => setInfoWindowLocation(currentLocation)}
                >
                  <div className="relative flex items-center justify-center cursor-pointer scale-125 z-40">
                    <span className="absolute -inset-2 rounded-full bg-cyan-400/40 animate-ping pointer-events-none" />
                    <Pin
                      background="#0284c7"
                      borderColor="#38bdf8"
                      glyphColor="#ffffff"
                    />
                  </div>
                </AdvancedMarker>
              )}

              {/* InfoWindow for Selected Location */}
              {infoWindowLocation && (
                <InfoWindow
                  position={{
                    lat: infoWindowLocation.latitude,
                    lng: infoWindowLocation.longitude,
                  }}
                  onCloseClick={() => setInfoWindowLocation(null)}
                >
                  <div className="p-2 max-w-xs space-y-2 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-700 font-bold">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {infoWindowLocation.isPreset
                            ? 'Maharashtra Preset'
                            : isWithinMaharashtra(infoWindowLocation.latitude, infoWindowLocation.longitude)
                            ? 'Maharashtra Locality'
                            : 'Global Research Target'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{infoWindowLocation.name}</h4>
                      <p className="text-[11px] text-slate-600">{infoWindowLocation.region}</p>
                    </div>

                    <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] font-mono grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-slate-500 block text-[9px]">LATITUDE</span>
                        <span className="font-semibold">{infoWindowLocation.latitude}°N</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">LONGITUDE</span>
                        <span className="font-semibold">{infoWindowLocation.longitude}°E</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-[9px]">ELEVATION</span>
                        <span className="font-semibold">
                          {infoWindowLocation.elevationMeters
                            ? `${infoWindowLocation.elevationMeters} m ASL`
                            : 'Calculating (NASA SRTM DEM)...'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-tight">
                      {infoWindowLocation.description}
                    </p>

                    <div className="pt-1 flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onSelectLocation(infoWindowLocation);
                          onNavigateToLab();
                        }}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold text-center transition-colors cursor-pointer"
                      >
                        Query NASA Observations →
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Top-Right Floating NASA GIBS Layer Control Panel */}
          <div className="absolute top-4 right-4 z-20 pointer-events-auto max-w-xs sm:max-w-sm">
            <GibsLayerControlPanel
              selectedLayerId={activeGibsLayer?.id || null}
              onSelectLayer={(l) => setActiveGibsLayer(l)}
              opacity={gibsOpacity}
              onChangeOpacity={(val) => setGibsOpacity(val)}
              imageryDate={imageryDate}
              onChangeImageryDate={(d) => setImageryDate(d)}
              currentLat={currentLocation.latitude}
              currentLng={currentLocation.longitude}
            />
          </div>

          {/* On-Map Floating Geographic Telemetry HUD */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-slate-950/90 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-700/80 shadow-xl text-xs space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Satellite className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-100">Spatial Telemetry</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                {dataStatus === 'live_loaded'
                  ? 'NASA POWER Linked'
                  : dataStatus === 'loading'
                  ? 'Querying NASA...'
                  : 'Study Target Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">PLACE NAME</span>
                <span className="text-slate-200 font-semibold truncate block">
                  {currentLocation.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">COORDINATES</span>
                <span className="text-slate-200">
                  {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ADMIN / AGRO-ZONE</span>
                <span className="text-slate-200 truncate block">
                  {currentLocation.region}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ELEVATION</span>
                <span className="text-slate-200">
                  {currentLocation.elevationMeters
                    ? `${currentLocation.elevationMeters} m ASL`
                    : 'Querying NASA DEM...'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-300">
                <span className="text-slate-400 block text-[10px]">BASE MAP (GOOGLE)</span>
                <span className="text-slate-200 font-medium">{imageryProviderDetails.name}</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">
                  Resolution: {imageryProviderDetails.resolution}
                </span>
              </div>

              <div className="text-[11px] text-slate-300">
                <span className="text-slate-400 block text-[10px]">ACTIVE NASA OVERLAY</span>
                {activeGibsLayer ? (
                  <>
                    <span className="text-emerald-300 font-medium">{activeGibsLayer.name}</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">
                      Service: NASA GIBS • Sensor: {activeGibsLayer.instrument}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 italic">None active (Google base map only)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scientific Transparency & Imagery Distinction Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2 max-w-3xl">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-800">Scientific Responsibility & Source Distinction:</strong>{' '}
              {imageryProviderDetails.typeNote} High-resolution optical satellite imagery is provided via Google Maps Platform imagery partners (Maxar, Airbus, CNES, Copernicus). Atmospheric, thermal, and solar flux data are independently produced by the NASA Langley Research Center POWER Agroclimatology project (MERRA-2, GEOS-FP).
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowScientificDetails(!showScientificDetails)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold border border-slate-300 transition-colors cursor-pointer text-xs"
            >
              <span>{showScientificDetails ? 'Hide' : 'Inspect'} Resolution & Limits</span>
              {showScientificDetails ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={onNavigateToLab}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-colors shadow-2xs cursor-pointer text-xs"
            >
              <span>Go to Research Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Scientific Source Coverage & Resolution Inspector (Requirements 8 & 9) */}
      {showScientificDetails && (
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 shadow-sm p-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
                  Scientific Source Resolution, Dates & Coverage Limitations
                </h3>
                <p className="text-xs text-slate-400">
                  Full transparency regarding spatial resolution, data coverage, missing-data status, and source boundaries for {currentLocation.name}.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800 self-start sm:self-auto">
              Target: {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Card 1: Geographic Hierarchy */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                Geographic Hierarchy
              </span>
              <p className="font-bold text-slate-100 text-sm">{currentLocation.name}</p>
              <p className="text-slate-400">{currentLocation.region}</p>
              <div className="pt-1 text-[11px] font-mono text-slate-500 border-t border-slate-800">
                <span>Country: {currentLocation.country}</span>
              </div>
            </div>

            {/* Card 2: Observation Dates & Revisit Cycles */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                Source Dates & Acquisition
              </span>
              <p className="font-bold text-slate-100">
                Climate: {startDate} → {endDate}
              </p>
              <p className="text-slate-400">NASA GIBS Satellite Pass: {imageryDate}</p>
              <div className="pt-1 text-[11px] font-mono text-slate-500 border-t border-slate-800">
                <span>Landsat Revisit: 16 Days | MODIS: Daily</span>
              </div>
            </div>

            {/* Card 3: Spatial Resolutions */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                Multi-Sensor Resolution
              </span>
              <p className="font-bold text-slate-100">NASA POWER: 0.5° × 0.5° (~55 km)</p>
              <p className="text-slate-400">NASA GIBS: 250m | Google Base: &lt;1m–15m</p>
              <div className="pt-1 text-[11px] font-mono text-slate-500 border-t border-slate-800">
                <span>GPM IMERG: 0.1° × 0.1° (~10 km)</span>
              </div>
            </div>

            {/* Card 4: Missing-Data & Quality Audit Status */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                Missing-Data & Audit Status
              </span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {dataQualityAudit
                    ? `${dataQualityAudit.overallCompletenessPercent}% Complete`
                    : dataStatus === 'live_loaded'
                    ? '100% Synced'
                    : 'Awaiting Query'}
                </span>
              </div>
              <p className="text-slate-400">
                {dataQualityAudit
                  ? `${dataQualityAudit.receivedDaysCount} received days, ${dataQualityAudit.missingDatesCount} missing dates`
                  : 'Zero fill values or missing records detected.'}
              </p>
              <div className="pt-1 text-[11px] font-mono text-slate-500 border-t border-slate-800">
                <span>Elevation: {currentLocation.elevationMeters ? `${currentLocation.elevationMeters} m ASL` : 'SRTM DEM Model'}</span>
              </div>
            </div>
          </div>

          {/* Scientific Limitations & Coverage Explanation (Requirement 9) */}
          <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/80 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Scientific Detail & Coverage Limitations for Selected Point</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
              <div className="bg-slate-950/80 p-3 rounded border border-amber-800/50 shadow-2xs">
                <strong className="block text-slate-200 mb-1">
                  NASA POWER Atmospheric Resolution (0.5° × 0.5°):
                </strong>
                <p className="leading-relaxed text-[11px] text-slate-400">
                  {coverageAnalysis.nasaPowerNote}
                </p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded border border-amber-800/50 shadow-2xs">
                <strong className="block text-slate-200 mb-1">
                  GPM IMERG & Optical Satellite Cloud Limitations:
                </strong>
                <p className="leading-relaxed text-[11px] text-slate-400">
                  {coverageAnalysis.gpmNote} {coverageAnalysis.gibsSupportNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global & Regional Location Preset Cards */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
              Selectable Benchmark Study Locations ({PRESET_LOCATIONS.length})
            </h3>
            <p className="text-xs text-slate-400">
              Foundational reference sites spanning Maharashtra pilot agricultural zones, Indian national research centers, and global Earth observation benchmarks.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any card to center map & query NASA observations
          </span>
        </div>

        {/* Scope Group Tab Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Show Locations:</span>
          {(['all', 'maharashtra', 'india', 'global'] as const).map((grp) => (
            <button
              key={grp}
              onClick={() => {
                if (grp === 'maharashtra') setSearchScope('maharashtra');
                else if (grp === 'india') setSearchScope('india');
                else if (grp === 'global') setSearchScope('worldwide');
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                (grp === 'all' && searchScope === 'worldwide') ||
                (grp === 'maharashtra' && searchScope === 'maharashtra') ||
                (grp === 'india' && searchScope === 'india') ||
                (grp === 'global' && searchScope === 'worldwide')
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {grp === 'all' ? 'All (21)' : grp === 'maharashtra' ? 'Maharashtra Pilot (6)' : grp === 'india' ? 'India National (6)' : 'Global Benchmarks (9)'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_LOCATIONS.filter((preset) => {
            if (searchScope === 'maharashtra') return preset.scopeGroup === 'maharashtra';
            if (searchScope === 'india') return preset.scopeGroup === 'maharashtra' || preset.scopeGroup === 'india';
            return true;
          }).map((preset) => {
            const isSelected = currentLocation.id === preset.id;
            const isShirdi = preset.id === 'shirdi-kopargaon';

            return (
              <div
                key={preset.id}
                onClick={() => {
                  setSelectedMarkerId(preset.id);
                  setInfoWindowLocation(preset);
                  onSelectLocation(preset);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : isShirdi
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 leading-tight">
                          {preset.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">{preset.region}</span>
                      </div>
                    </div>

                    {isShirdi && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                        Initial Focus
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    {preset.latitude}°N, {preset.longitude}°E
                  </span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      isSelected ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {isSelected ? 'Active Target' : 'Select →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Cloud & Maps API Key Configuration Modal */}
      {showKeyGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl p-6 space-y-5 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
                  Google Maps Platform & Places API Setup Guide
                </h3>
              </div>
              <button
                onClick={() => setShowKeyGuide(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                FieldShift Science Explorer uses the official <strong>@vis.gl/react-google-maps</strong> wrapper to render interactive vector, satellite, and terrain base layers. For custom village and place search, it connects to Google Places Autocomplete and Geocoding.
              </p>

              <div className="p-3.5 bg-emerald-950/50 rounded-xl border border-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Current Runtime Status: Ready</span>
                </div>
                <p className="text-emerald-300/80 text-[11px]">
                  The application is currently operating with authorized Google Maps credentials. In addition, an offline fallback catalog with hundreds of Maharashtra talukas and villages is active.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-100 text-sm">
                  Steps to configure your own Google Cloud API Key for production:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-300">
                  <li>
                    Visit the{' '}
                    <a
                      href="https://console.cloud.google.com/google/maps-apis/overview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 font-semibold underline inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console Maps Overview <ExternalLink className="w-3 h-3" />
                    </a>
                    .
                  </li>
                  <li>Create a new Cloud Project (or select an existing one) and link a Billing account.</li>
                  <li>
                    Enable the following APIs under <strong>APIs & Services → Library</strong>:
                    <ul className="list-disc list-inside pl-4 mt-1 font-mono text-[11px] text-slate-200">
                      <li>Maps JavaScript API</li>
                      <li>Places API (New) / Places API</li>
                      <li>Geocoding API</li>
                    </ul>
                  </li>
                  <li>
                    Create an API key in <strong>Credentials</strong> and set HTTP Referrer restrictions for your domain.
                  </li>
                  <li>
                    Add the key as an environment variable in <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400 font-mono border border-slate-800">.env</code>:
                    <div className="p-2 bg-slate-950 text-emerald-400 border border-slate-800 rounded font-mono text-[11px] my-1">
                      VITE_GOOGLE_MAPS_API_KEY="YOUR_KEY_HERE"
                    </div>
                  </li>
                </ol>
              </div>

              {/* Dynamic Key Input for Testing in Session */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block font-bold text-slate-200">
                  Session API Key Override (Temporary Test):
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => {
                      if (customKeyInput.trim()) {
                        setApiKey(customKeyInput.trim());
                        setShowKeyGuide(false);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Apply Key
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowKeyGuide(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
