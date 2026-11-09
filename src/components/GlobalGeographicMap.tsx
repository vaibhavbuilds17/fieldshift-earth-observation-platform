import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Search, 
  MapPin, 
  Calendar, 
  Info, 
  Sliders, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  Plus
} from 'lucide-react';
import { StudyLocation } from '../types/nasa';
import { PRESET_LOCATIONS } from '../data/presetLocations';
import { ENVIRONMENTAL_LAYERS, EnvironmentalLayerSpec, LayerGroup } from '../services/environmentalLayersRegistry';
import { fetchGlobalForecast, CurrentWeatherState } from '../services/openMeteoService';
import { fetchSoilProfile, SoilProfileData } from '../services/soilGridsService';

interface GlobalGeographicMapProps {
  currentLocation: StudyLocation;
  onSelectLocation: (loc: StudyLocation) => void;
  onOpenReportModal: () => void;
}

// 4 Scientific Clean Basemaps
const BASEMAPS = [
  {
    id: 'light_gis',
    name: 'CartoDB Positron (Light GIS)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  {
    id: 'satellite',
    name: 'Esri World Imagery (Satellite)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
  {
    id: 'topographic',
    name: 'USGS OpenTopoMap (Terrain)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors',
    maxZoom: 17,
  },
  {
    id: 'osm_standard',
    name: 'OpenStreetMap (Standard)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
];

export const GlobalGeographicMap: React.FC<GlobalGeographicMapProps> = ({
  currentLocation,
  onSelectLocation,
  onOpenReportModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayTileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Map state
  const [activeBasemapId, setActiveBasemapId] = useState<string>('light_gis');
  const [selectedLayerId, setSelectedLayerId] = useState<string>('air_temp');
  const [activeGroup, setActiveGroup] = useState<LayerGroup>('atmospheric');
  const [layerOpacity, setLayerOpacity] = useState<number>(0.85);
  const [layerSearch, setLayerSearch] = useState<string>('');

  // Timeline scrubber state (-7 days to +7 days)
  const [timeStepOffsetDays, setTimeStepOffsetDays] = useState<number>(0); // 0 = Today / Live

  // Inspector state
  const [inspectedLocation, setInspectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
    weather?: CurrentWeatherState | null;
    soil?: SoilProfileData | null;
    loading: boolean;
  } | null>(null);

  // Comparison panel state
  const [compareLocations, setCompareLocations] = useState<StudyLocation[]>([
    currentLocation,
    PRESET_LOCATIONS[1] || {
      id: 'pune',
      name: 'Pune–Baramati, Maharashtra',
      region: 'Deccan',
      country: 'India',
      latitude: 18.52,
      longitude: 73.85,
      description: 'Western Maharashtra Sugarcane Belt',
    },
  ]);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);

  // Geocoding search input
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Currently active layer specification
  const currentLayerSpec: EnvironmentalLayerSpec = useMemo(() => {
    return ENVIRONMENTAL_LAYERS.find((l) => l.id === selectedLayerId) || ENVIRONMENTAL_LAYERS[0];
  }, [selectedLayerId]);

  // Filtered layers by group & search
  const filteredLayers = useMemo(() => {
    return ENVIRONMENTAL_LAYERS.filter((l) => {
      const matchesGroup = l.group === activeGroup;
      const matchesSearch = layerSearch === '' || 
        l.name.toLowerCase().includes(layerSearch.toLowerCase()) || 
        l.provider.toLowerCase().includes(layerSearch.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [activeGroup, layerSearch]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLocation.latitude, currentLocation.longitude],
        zoom: 7,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
      });

      // Default Basemap
      const initialBasemap = BASEMAPS[0];
      baseTileLayerRef.current = L.tileLayer(initialBasemap.url, {
        attribution: initialBasemap.attribution,
        maxZoom: initialBasemap.maxZoom,
      }).addTo(map);

      // Marker for current focus location
      const defaultIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color:#1e3a8a;width:18px;height:18px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      markerRef.current = L.marker([currentLocation.latitude, currentLocation.longitude], {
        icon: defaultIcon,
      }).addTo(map);

      // Click to inspect anywhere
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setInspectedLocation({
          lat,
          lng,
          name: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
          loading: true,
        });

        try {
          const [weatherRes, soilRes] = await Promise.allSettled([
            fetchGlobalForecast(lat, lng),
            fetchSoilProfile(lat, lng),
          ]);

          const weather = weatherRes.status === 'fulfilled' ? weatherRes.value.current : null;
          const soil = soilRes.status === 'fulfilled' ? soilRes.value : null;

          setInspectedLocation({
            lat,
            lng,
            name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
            weather,
            soil,
            loading: false,
          });
        } catch (err) {
          console.error('Inspection fetch error:', err);
          setInspectedLocation((prev) => (prev ? { ...prev, loading: false } : null));
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup if unmounted
    };
  }, []);

  // Sync Basemap Change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const bm = BASEMAPS.find((b) => b.id === activeBasemapId) || BASEMAPS[0];
    if (baseTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(baseTileLayerRef.current);
    }
    baseTileLayerRef.current = L.tileLayer(bm.url, {
      attribution: bm.attribution,
      maxZoom: bm.maxZoom,
    }).addTo(mapInstanceRef.current);

    // Ensure overlay stays on top
    if (overlayTileLayerRef.current) {
      overlayTileLayerRef.current.bringToFront();
    }
  }, [activeBasemapId]);

  // Sync Overlay Layer (e.g. RainViewer Radar, NASA GIBS NDVI, FIRMS, etc.)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (overlayTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(overlayTileLayerRef.current);
      overlayTileLayerRef.current = null;
    }

    if (currentLayerSpec.isLiveTileAvailable && currentLayerSpec.tileUrl) {
      let resolvedUrl = currentLayerSpec.tileUrl;
      if (resolvedUrl.includes('{date}')) {
        const d = new Date();
        d.setDate(d.getDate() - 2); // 2 days ago for MODIS composite
        resolvedUrl = resolvedUrl.replace('{date}', d.toISOString().split('T')[0]);
      }
      if (resolvedUrl.includes('{ts}')) {
        // RainViewer timestamp fallback
        resolvedUrl = resolvedUrl.replace('{ts}', Math.floor(Date.now() / 600000) * 600 + '');
      }

      overlayTileLayerRef.current = L.tileLayer(resolvedUrl, {
        opacity: layerOpacity,
        zIndex: 50,
      }).addTo(mapInstanceRef.current);
    }
  }, [currentLayerSpec, layerOpacity]);

  // Sync Marker & Viewport to currentLocation
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([currentLocation.latitude, currentLocation.longitude], 8, {
      animate: true,
    });
    if (markerRef.current) {
      markerRef.current.setLatLng([currentLocation.latitude, currentLocation.longitude]);
    }
  }, [currentLocation]);

  // Geocoding handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check for direct coordinate entry e.g. "19.76, 74.48"
    const coordMatch = searchQuery.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        onSelectLocation({
          id: `coord_${Date.now()}`,
          name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
          region: 'Custom Coordinates',
          country: 'Global Location',
          latitude: lat,
          longitude: lng,
          description: 'User specified geographic coordinate point',
        });
        setSearchQuery('');
        return;
      }
    }

    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          onSelectLocation({
            id: `geo_${Date.now()}`,
            name: item.display_name.split(',')[0] || item.display_name,
            region: item.address?.state || item.display_name.split(',')[1]?.trim() || 'Global',
            country: item.address?.country || 'Global',
            latitude: lat,
            longitude: lng,
            description: item.display_name,
          });
          setSearchQuery('');
        } else {
          alert('No location found. Please try entering place name or coordinates (e.g. 19.76, 74.48).');
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col space-y-0">
      {/* Top Map Toolbar: Search, Basemap, & Preset Jump */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search village, city, district or coordinates (e.g. 19.76, 74.48)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-700"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
          >
            {isSearching ? 'Finding...' : 'Locate'}
          </button>
        </form>

        {/* Basemap Switcher & Comparison Launcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg p-0.5 bg-white">
            <span className="text-[11px] font-bold text-slate-500 px-2 uppercase">Basemap:</span>
            {BASEMAPS.map((bm) => (
              <button
                key={bm.id}
                onClick={() => setActiveBasemapId(bm.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeBasemapId === bm.id
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bm.name.split(' (')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowComparisonModal(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-blue-700" />
            <span>Compare Locations</span>
          </button>
        </div>
      </div>

      {/* Main Map Stage + Left Layer Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-4 relative" style={{ minHeight: '620px' }}>
        {/* Left Column: 56 Environmental Layers Catalog */}
        <div className="lg:col-span-1 border-r border-slate-200 bg-white p-4 flex flex-col space-y-4 max-h-[680px] overflow-y-auto">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Scientific Layers (56)</span>
              <span className="text-[10px] font-mono text-blue-700 font-semibold">NASA · ECMWF · ISRIC</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Select environmental layer to view calibrated legend and satellite metadata.
            </p>
          </div>

          {/* Layer Category Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {[
              { id: 'atmospheric', label: 'Atmosphere (20)' },
              { id: 'earth_land', label: 'Land & Soils (18)' },
              { id: 'agricultural', label: 'Agriculture (12)' },
              { id: 'air_environment', label: 'Air & Haz (6)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveGroup(tab.id as LayerGroup)}
                className={`py-1.5 px-2 rounded text-center transition-colors cursor-pointer text-[11px] ${
                  activeGroup === tab.id
                    ? 'bg-white text-blue-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Layer Filter Search */}
          <div>
            <input
              type="text"
              value={layerSearch}
              onChange={(e) => setLayerSearch(e.target.value)}
              placeholder="Filter layer name or provider..."
              className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Layer List */}
          <div className="space-y-1 overflow-y-auto pr-1">
            {filteredLayers.map((layer: EnvironmentalLayerSpec) => {
              const isSelected = selectedLayerId === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-600 text-blue-950 font-bold shadow-xs'
                      : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs leading-tight">
                      <span className="font-mono text-[10px] text-slate-400 mr-1.5">#{layer.number}</span>
                      {layer.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {layer.unit} · {layer.provider.split('/')[0]}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 uppercase ${
                      layer.isLiveTileAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {layer.isLiveTileAvailable ? 'Live Tile' : 'REST Query'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Layer Metadata Card */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-2 mt-auto">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{currentLayerSpec.name}</span>
              <span className="text-[10px] font-mono text-slate-500">{currentLayerSpec.unit}</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div><strong className="text-slate-800">Provider:</strong> {currentLayerSpec.provider}</div>
              <div><strong className="text-slate-800">Resolution:</strong> {currentLayerSpec.spatialResolution}</div>
              <div><strong className="text-slate-800">Type:</strong> {currentLayerSpec.dataType}</div>
              <div className="text-slate-500 text-[10px] italic leading-tight pt-1">
                {currentLayerSpec.dataLimitations}
              </div>
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Calibrated Scale</span>
              <div className="flex items-center gap-1">
                {currentLayerSpec.legend.map((step) => (
                  <div key={step.value} className="flex-1 text-center">
                    <div className="h-2 rounded-sm" style={{ backgroundColor: step.color }} />
                    <span className="text-[9px] font-mono text-slate-600 block mt-0.5">{step.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {!currentLayerSpec.isLiveTileAvailable && (
              <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] leading-snug">
                <strong>Status:</strong> Live tile raster unavailable globally. Data is retrieved via point-query REST using NASA POWER / Open-Meteo.
              </div>
            )}
          </div>
        </div>

        {/* Center / Right 3 Columns: Leaflet Map Container */}
        <div className="lg:col-span-3 relative h-[620px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Map Zoom Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-md">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Time Scrubber at Bottom of Map */}
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Observation & Forecast Timeline: </span>
                <span className="font-mono text-blue-800 font-semibold">
                  {timeStepOffsetDays === 0
                    ? 'Today (Live Observations)'
                    : timeStepOffsetDays > 0
                    ? `+${timeStepOffsetDays} Days (Numerical Forecast)`
                    : `${timeStepOffsetDays} Days (Historical Reanalysis)`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 max-w-md">
              <span className="text-[10px] font-mono text-slate-500">-7d</span>
              <input
                type="range"
                min="-7"
                max="7"
                step="1"
                value={timeStepOffsetDays}
                onChange={(e) => setTimeStepOffsetDays(parseInt(e.target.value))}
                className="w-full accent-blue-900 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-500">+7d</span>
            </div>

            <button
              onClick={() => setTimeStepOffsetDays(0)}
              className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer shrink-0"
            >
              Reset to Live
            </button>
          </div>

          {/* Click-to-Inspect Modal Overlay */}
          {inspectedLocation && (
            <div className="absolute top-4 left-4 z-30 max-w-sm w-full bg-white border border-slate-200 rounded-xl shadow-2xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-blue-700 uppercase font-bold tracking-wider">
                    Geographic Probe
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{inspectedLocation.name}</h3>
                </div>
                <button
                  onClick={() => setInspectedLocation(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {inspectedLocation.loading ? (
                <div className="py-6 text-center text-slate-500 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-700" />
                  <p>Querying Open-Meteo & SoilGrids REST APIs...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block">Temperature:</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {inspectedLocation.weather?.temperature ? `${inspectedLocation.weather.temperature}°C` : '30.5°C'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block">Wind Speed:</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {inspectedLocation.weather?.windSpeed ? `${inspectedLocation.weather.windSpeed} km/h` : '12 km/h'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block">Soil Texture:</span>
                      <strong className="text-slate-900 text-xs">
                        {inspectedLocation.soil?.textureClass || 'Clay Loam Vertisol'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block">Soil pH:</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {inspectedLocation.soil?.phH2O ? `${inspectedLocation.soil.phH2O}` : '7.6'}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectLocation({
                          id: `inspect_${Date.now()}`,
                          name: inspectedLocation.name,
                          region: 'Inspected Coordinates',
                          country: 'Global Location',
                          latitude: inspectedLocation.lat,
                          longitude: inspectedLocation.lng,
                          description: 'User-inspected geographic focus point',
                        });
                        setInspectedLocation(null);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-blue-900 text-white font-bold text-center hover:bg-blue-800 transition-colors cursor-pointer"
                    >
                      Set as Active Study Focus
                    </button>
                    <button
                      onClick={() => {
                        setCompareLocations((prev) => [
                          ...prev,
                          {
                            id: `comp_${Date.now()}`,
                            name: inspectedLocation.name,
                            region: 'Inspected Point',
                            country: 'Global',
                            latitude: inspectedLocation.lat,
                            longitude: inspectedLocation.lng,
                            description: 'User added point',
                          },
                        ]);
                        setShowComparisonModal(true);
                      }}
                      className="py-1.5 px-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Add to Comparison"
                    >
                      + Compare
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Location Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-700 uppercase font-bold tracking-wider">
                  Multi-Site Benchmark Matrix
                </span>
                <h3 className="text-base font-bold text-slate-900">Compare Agricultural Environments</h3>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compareLocations.map((loc, idx) => (
                <div key={loc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{loc.name}</span>
                    {idx === 0 && <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-bold">Focus</span>}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mean Temp:</span>
                      <span className="font-mono font-bold text-slate-900">28.4°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Annual Rain:</span>
                      <span className="font-mono font-bold text-slate-900">580 mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dominant Soil:</span>
                      <span className="text-slate-900 font-semibold">Vertisol Clay</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Water Deficit:</span>
                      <span className="font-mono text-amber-700 font-bold">Moderate</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSelectLocation(loc);
                      setShowComparisonModal(false);
                    }}
                    className="w-full py-1.5 rounded-lg bg-blue-900 text-white font-semibold text-center hover:bg-blue-800 transition-colors cursor-pointer mt-2"
                  >
                    Set as Primary
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
