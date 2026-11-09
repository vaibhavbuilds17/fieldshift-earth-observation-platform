import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import {
  Search,
  MapPin,
  Globe,
  Compass,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  Info,
  ChevronDown,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { StudyLocation } from '../types/nasa';
import {
  SearchScope,
  PlaceSuggestion,
  parseCoordinates,
  searchLocalDatabase,
  analyzeScientificCoverage,
} from '../services/locationSearchService';
import { isPointInsideMaharashtra, getMaharashtraAgroZone } from '../data/maharashtraBoundary';

interface DynamicLocationSearchProps {
  currentLocation: StudyLocation;
  searchScope: SearchScope;
  onChangeScope: (scope: SearchScope) => void;
  onSelectLocation: (location: StudyLocation) => void;
  onBoundaryViolation?: (message: string) => void;
}

export const DynamicLocationSearch: React.FC<DynamicLocationSearchProps> = ({
  currentLocation,
  searchScope,
  onChangeScope,
  onSelectLocation,
  onBoundaryViolation,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [placesApiError, setPlacesApiError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Google Maps Libraries
  const placesLibrary = useMapsLibrary('places');
  const geocodingLibrary = useMapsLibrary('geocoding');
  const map = useMap();

  // Autocomplete & Geocoding Services
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Initialize Google Maps Services when libraries become available
  useEffect(() => {
    if (placesLibrary) {
      try {
        autocompleteServiceRef.current = new placesLibrary.AutocompleteService();
        // Create an offscreen div for PlacesService if map isn't ready yet
        const dummyDiv = document.createElement('div');
        placesServiceRef.current = new placesLibrary.PlacesService(map || dummyDiv);
      } catch (e) {
        console.warn('Google Places library init error:', e);
      }
    }
  }, [placesLibrary, map]);

  useEffect(() => {
    if (geocodingLibrary) {
      try {
        geocoderRef.current = new geocodingLibrary.Geocoder();
      } catch (e) {
        console.warn('Google Geocoder init error:', e);
      }
    } else if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
      try {
        geocoderRef.current = new window.google.maps.Geocoder();
      } catch (e) {
        // Fallback geocoder
      }
    }
  }, [geocodingLibrary]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Coordinate check on current query
  const parsedCoord = parseCoordinates(query);

  // Debounced Search Handler
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsSearching(false);
      setPlacesApiError(null);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      const combinedSuggestions: PlaceSuggestion[] = [];

      // 1. If input is direct coordinates, insert as priority choice
      if (parsedCoord) {
        const isMh = isPointInsideMaharashtra(parsedCoord.latitude, parsedCoord.longitude);
        const agro = isMh ? getMaharashtraAgroZone(parsedCoord.latitude, parsedCoord.longitude) : null;
        combinedSuggestions.push({
          id: `coord_${parsedCoord.latitude}_${parsedCoord.longitude}`,
          name: `Coordinate: ${parsedCoord.formattedText}`,
          secondaryText: isMh
            ? `Verified in Maharashtra (${agro?.zoneName})`
            : searchScope === 'maharashtra'
            ? 'Outside Maharashtra State Boundary'
            : 'Target Coordinates',
          region: agro ? agro.zoneName : 'Custom Coordinates',
          country: isMh ? 'India' : 'Global Target',
          latitude: parsedCoord.latitude,
          longitude: parsedCoord.longitude,
          source: 'coordinates',
          isMaharashtra: isMh,
          agroZone: agro?.zoneName,
          description: `Direct coordinate entry at ${parsedCoord.formattedText}.`,
        });
      }

      // 2. Query Local Database for fast instant results
      const localMatches = searchLocalDatabase(trimmed, searchScope);
      combinedSuggestions.push(...localMatches);

      // 3. Query Google Places Autocomplete if service is available
      if (autocompleteServiceRef.current) {
        try {
          const req: google.maps.places.AutocompletionRequest = {
            input: trimmed,
          };

          // Configure restrictions based on research scope
          if (searchScope === 'maharashtra') {
            req.componentRestrictions = { country: 'in' };
            // Bias towards Maharashtra bounds
            req.locationBias = new google.maps.LatLngBounds(
              new google.maps.LatLng(15.6, 72.6),
              new google.maps.LatLng(22.1, 80.9)
            );
          } else if (searchScope === 'india') {
            req.componentRestrictions = { country: 'in' };
          }

          autocompleteServiceRef.current.getPlacePredictions(
            req,
            (predictions, status) => {
              setIsSearching(false);
              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                setPlacesApiError(null);
                const googleSuggestions: PlaceSuggestion[] = predictions.slice(0, 5).map((p) => {
                  return {
                    id: p.place_id,
                    placeId: p.place_id,
                    name: p.structured_formatting.main_text,
                    secondaryText: p.structured_formatting.secondary_text || '',
                    region: p.structured_formatting.secondary_text || 'Google Places Target',
                    country: 'India',
                    latitude: 0, // Geocoded on click
                    longitude: 0,
                    source: 'google_places',
                    isMaharashtra: true, // evaluated on selection
                    description: p.description,
                  };
                });

                // Deduplicate by name and combine
                const existingNames = new Set(combinedSuggestions.map((s) => s.name.toLowerCase()));
                for (const g of googleSuggestions) {
                  if (!existingNames.has(g.name.toLowerCase())) {
                    combinedSuggestions.push(g);
                  }
                }
                setSuggestions([...combinedSuggestions]);
              } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                // Informative banner about API key permissions, but local search still succeeds
                setPlacesApiError(
                  'Google Places API is in restricted/demo mode on this key. Full village and locality autocomplete is powered by the built-in Maharashtra & Global agricultural registry.'
                );
                setSuggestions([...combinedSuggestions]);
              } else {
                setSuggestions([...combinedSuggestions]);
              }
            }
          );
          return;
        } catch (e) {
          console.warn('Google Places Autocomplete error:', e);
        }
      }

      // If Google Places wasn't called or failed synchronously
      setIsSearching(false);
      setSuggestions(combinedSuggestions);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, searchScope, parsedCoord]);

  // Execute selection of a suggestion
  const handleSelectSuggestion = useCallback(
    async (suggestion: PlaceSuggestion) => {
      let lat = suggestion.latitude;
      let lng = suggestion.longitude;
      let resolvedName = suggestion.name;
      let resolvedRegion = suggestion.region;
      let resolvedDistrict = suggestion.district;
      let resolvedCountry = suggestion.country;
      let resolvedDesc = suggestion.description || '';

      // If selection came from Google Places without precalculated coords, resolve geometry
      if (suggestion.source === 'google_places' && suggestion.placeId && (lat === 0 || lng === 0)) {
        setIsSearching(true);
        try {
          if (placesServiceRef.current) {
            const detail = await new Promise<google.maps.places.PlaceResult | null>((resolve) => {
              placesServiceRef.current!.getDetails(
                {
                  placeId: suggestion.placeId!,
                  fields: ['geometry', 'name', 'formatted_address', 'address_components'],
                },
                (result, status) => {
                  if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                    resolve(result);
                  } else {
                    resolve(null);
                  }
                }
              );
            });

            if (detail?.geometry?.location) {
              lat = Number(detail.geometry.location.lat().toFixed(4));
              lng = Number(detail.geometry.location.lng().toFixed(4));
              resolvedName = detail.name || suggestion.name;
              resolvedDesc = detail.formatted_address || suggestion.secondaryText;

              // Extract district / state / country from address components
              if (detail.address_components) {
                const districtComp = detail.address_components.find((c) =>
                  c.types.includes('administrative_area_level_2')
                );
                const stateComp = detail.address_components.find((c) =>
                  c.types.includes('administrative_area_level_1')
                );
                const countryComp = detail.address_components.find((c) =>
                  c.types.includes('country')
                );
                if (districtComp) resolvedDistrict = districtComp.long_name;
                if (stateComp) resolvedRegion = stateComp.long_name;
                if (countryComp) resolvedCountry = countryComp.long_name;
              }
            }
          }
        } catch (err) {
          console.error('Failed to resolve place geometry:', err);
        } finally {
          setIsSearching(false);
        }
      }

      // If lat/lng could not be resolved, abort
      if (!lat && !lng) {
        return;
      }

      // Check boundary restriction if Maharashtra mode is active
      const isMh = isPointInsideMaharashtra(lat, lng);
      if (searchScope === 'maharashtra' && !isMh) {
        const msg = `Selected place "${resolvedName}" (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E) falls outside Maharashtra state boundary. Research scope is currently restricted to Maharashtra. Switch to "India" or "Worldwide" scope to analyze this location.`;
        if (onBoundaryViolation) {
          onBoundaryViolation(msg);
        }
        return;
      }

      const agro = isMh ? getMaharashtraAgroZone(lat, lng) : null;
      const coverage = analyzeScientificCoverage(lat, lng, searchScope);

      const newLocation: StudyLocation = {
        id: `search_loc_${Date.now()}`,
        name: resolvedName,
        region: resolvedDistrict
          ? `${resolvedDistrict}${agro ? ` (${agro.zoneName})` : ''}`
          : agro
          ? agro.zoneName
          : resolvedRegion,
        country: resolvedCountry || 'India',
        latitude: lat,
        longitude: lng,
        description:
          resolvedDesc ||
          (isMh && agro
            ? `Agro-climatic classification: ${agro.zoneName}. Soils: ${agro.soilType}. Typical annual rainfall: ${agro.annualRainfallMm}. Key crops: ${agro.keyCrops.join(', ')}.`
            : `Geographic target at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E. Scientific coverage: ${coverage.nasaPowerNote}`),
        isPreset: false,
      };

      setQuery('');
      setIsOpen(false);
      onSelectLocation(newLocation);
    },
    [searchScope, onBoundaryViolation, onSelectLocation]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar with Scope Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Scope Selector Pills */}
        <div className="flex items-center rounded-lg bg-slate-900/90 p-1 border border-slate-800 text-xs shrink-0 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => onChangeScope('maharashtra')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              searchScope === 'maharashtra'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Strictly enforces Maharashtra state boundary polygon"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Maharashtra (Strict)</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeScope('india')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              searchScope === 'india'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Search any location across India"
          >
            <span>India</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeScope('worldwide')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              searchScope === 'worldwide'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Global research search worldwide without Maharashtra boundary restriction"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Worldwide</span>
          </button>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (query.trim().length > 0) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                searchScope === 'maharashtra'
                  ? 'Search Maharashtra villages, talukas, landmarks, or coordinates (e.g. Sangamner, 19.76, 74.48)...'
                  : searchScope === 'india'
                  ? 'Search Indian agricultural centers, cities, or coordinates (e.g. Ludhiana, New Delhi)...'
                  : 'Search global agricultural stations or coordinates (e.g. Ames Iowa, Nairobi Kenya, 42.03, -93.63)...'
              }
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-lg shadow-inner focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-slate-100 placeholder:text-slate-500 transition-all"
            />

            {isSearching ? (
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3" />
            ) : query.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Places API Status Notice (if in demo / restricted mode) */}
      {placesApiError && isOpen && (
        <div className="mt-1 p-2 rounded bg-amber-950/40 border border-amber-800 text-amber-300 text-[11px] flex items-center gap-1.5 animate-fadeIn">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{placesApiError}</span>
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (suggestions.length > 0 || parsedCoord) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto divide-y divide-slate-800">
          <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span className="text-emerald-400">
              {searchScope === 'maharashtra'
                ? 'SEARCH SCOPE: MAHARASHTRA STATE'
                : searchScope === 'india'
                ? 'SEARCH SCOPE: INDIA NATIONAL'
                : 'SEARCH SCOPE: WORLDWIDE GLOBAL'}
            </span>
            <span className="text-slate-500">Use ↑↓ to navigate, Enter to select</span>
          </div>

          {suggestions.map((suggestion, index) => {
            const isSelected = selectedIndex === index;
            const isCoord = suggestion.source === 'coordinates';
            const isOutsideMh = searchScope === 'maharashtra' && !suggestion.isMaharashtra;

            return (
              <div
                key={suggestion.id}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-2.5 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected ? 'bg-emerald-950/70 text-emerald-100 border-l-2 border-emerald-500' : 'hover:bg-slate-800/60 text-slate-200'
                } ${isOutsideMh ? 'opacity-70 bg-amber-950/30' : ''}`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      isCoord
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : suggestion.isMaharashtra
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                    }`}
                  >
                    {isCoord ? (
                      <Compass className="w-3.5 h-3.5" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-xs sm:text-sm text-slate-100 truncate">
                        {suggestion.name}
                      </span>

                      {suggestion.agroZone && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {suggestion.agroZone.split('(')[0].trim()}
                        </span>
                      )}

                      {isCoord && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                          Direct Coordinates
                        </span>
                      )}

                      {isOutsideMh && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                          Outside Maharashtra
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {suggestion.secondaryText || suggestion.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono text-[11px] text-slate-500">
                  {suggestion.latitude !== 0 && (
                    <span>
                      {suggestion.latitude.toFixed(2)}°N, {suggestion.longitude.toFixed(2)}°E
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
