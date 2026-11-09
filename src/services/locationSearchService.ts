/**
 * Location Search and Reverse Geocoding Service
 *
 * Supports:
 * 1. Google Places Autocomplete & Geocoding APIs (when configured and active)
 * 2. Arbitrary coordinate string parser (decimal, DMS, hemisphere tags)
 * 3. Deep offline/fallback registry of Maharashtra talukas, villages, towns, and districts
 * 4. India national agricultural centers & Global agricultural research stations
 * 5. Scientific source coverage and spatial resolution analysis
 */

import { isPointInsideMaharashtra, getMaharashtraAgroZone } from '../data/maharashtraBoundary';
import { StudyLocation } from '../types/nasa';

export type SearchScope = 'maharashtra' | 'india' | 'worldwide';

export interface PlaceSuggestion {
  id: string;
  placeId?: string; // Google Place ID if from Google Places
  name: string;
  secondaryText: string;
  region: string;
  district?: string;
  country: string;
  latitude: number;
  longitude: number;
  source: 'google_places' | 'coordinates' | 'local_database' | 'reverse_geocode';
  isMaharashtra: boolean;
  agroZone?: string;
  description?: string;
}

export interface CoordinateParseResult {
  latitude: number;
  longitude: number;
  formattedText: string;
}

/**
 * Parses user input for geographic coordinates in diverse formats:
 * - "19.76, 74.48"
 * - "19.76°N, 74.48°E"
 * - "19.76 N 74.48 E"
 * - "19.76 -74.48"
 * - "lat: 19.76, lng: 74.48"
 */
export function parseCoordinates(input: string): CoordinateParseResult | null {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();

  // Pattern 1: Standard comma/space separated decimals with optional N/S/E/W
  const coordRegex = /^\s*([+-]?\d+(?:\.\d+)?)\s*([°'"]?\s*[NSns])?\s*[,;\s/]\s*([+-]?\d+(?:\.\d+)?)\s*([°'"]?\s*[EWew])?\s*$/;
  const match = trimmed.match(coordRegex);

  if (match) {
    let lat = parseFloat(match[1]);
    const latHemi = match[2]?.toUpperCase();
    let lng = parseFloat(match[3]);
    const lngHemi = match[4]?.toUpperCase();

    if (latHemi && latHemi.includes('S')) lat = -Math.abs(lat);
    if (latHemi && latHemi.includes('N')) lat = Math.abs(lat);
    if (lngHemi && lngHemi.includes('W')) lng = -Math.abs(lng);
    if (lngHemi && lngHemi.includes('E')) lng = Math.abs(lng);

    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        latitude: Number(lat.toFixed(4)),
        longitude: Number(lng.toFixed(4)),
        formattedText: `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`,
      };
    }
  }

  // Pattern 2: Key-value formatted e.g. "lat: 19.76, lon: 74.48"
  const kvLat = trimmed.match(/lat(?:itude)?\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i);
  const kvLng = trimmed.match(/l(?:ng|on|ongitude)?\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i);

  if (kvLat && kvLng) {
    const lat = parseFloat(kvLat[1]);
    const lng = parseFloat(kvLng[1]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        latitude: Number(lat.toFixed(4)),
        longitude: Number(lng.toFixed(4)),
        formattedText: `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`,
      };
    }
  }

  return null;
}

/**
 * Curated Maharashtra Localities, Talukas, and Agricultural Hubs
 * Provides instant suggestions for villages, small localities, and districts across Maharashtra
 */
export const MAHARASHTRA_LOCALITIES: Omit<PlaceSuggestion, 'source'>[] = [
  // Ahmednagar / Ahilyanagar District
  {
    id: 'mh_shirdi',
    name: 'Shirdi',
    secondaryText: 'Rahata Taluka, Ahilyanagar (Ahmednagar) District',
    region: 'North Maharashtra Scarcity Zone',
    district: 'Ahilyanagar',
    country: 'India',
    latitude: 19.7667,
    longitude: 74.4767,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Deccan semi-arid plateau agricultural belt known for sugarcane, onion, and pomegranate cultivation.',
  },
  {
    id: 'mh_kopargaon',
    name: 'Kopargaon',
    secondaryText: 'Kopargaon Taluka, Godavari River Basin, Ahilyanagar',
    region: 'North Maharashtra Scarcity Zone',
    district: 'Ahilyanagar',
    country: 'India',
    latitude: 19.8833,
    longitude: 74.4833,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Godavari canal irrigated tracts. Major cooperative sugar and jaggery production center.',
  },
  {
    id: 'mh_sangamner',
    name: 'Sangamner',
    secondaryText: 'Pravara Basin, Sangamner Taluka, Ahilyanagar',
    region: 'Central Maharashtra Scarcity Zone',
    district: 'Ahilyanagar',
    country: 'India',
    latitude: 19.5761,
    longitude: 74.2070,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Pravara river basin known for dairy cooperatives, tomato farming, and drought-hardy millets.',
  },
  {
    id: 'mh_rahata',
    name: 'Rahata',
    secondaryText: 'Rahata Taluka, Ahilyanagar District',
    region: 'North Maharashtra Scarcity Zone',
    district: 'Ahilyanagar',
    country: 'India',
    latitude: 19.7118,
    longitude: 74.4922,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Soybean, bajra, and guava farming belt in the vicinity of Shirdi.',
  },
  {
    id: 'mh_shrirampur',
    name: 'Shrirampur',
    secondaryText: 'Shrirampur Taluka, Pravara Canals, Ahilyanagar',
    region: 'North Maharashtra Scarcity Zone',
    district: 'Ahilyanagar',
    country: 'India',
    latitude: 19.6190,
    longitude: 74.6560,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Historic citrus (mosambi) and sugarcane agricultural research hub.',
  },
  {
    id: 'mh_akole',
    name: 'Akole',
    secondaryText: 'Western Ghats Transition Belt, Ahilyanagar',
    region: 'Ghat Foothills & Transition Zone',
    district: 'Ahilyanagar',
    country: 'India',
    latitude: 19.5441,
    longitude: 73.9997,
    isMaharashtra: true,
    agroZone: 'Transition Zone (Zone 4)',
    description: 'Bhandardara catchment, paddy terraces, and indigenous tribal pulse conservation.',
  },
  {
    id: 'mh_ahmednagar_city',
    name: 'Ahilyanagar (Ahmednagar)',
    secondaryText: 'District Headquarters, Central Deccan Plateau',
    region: 'Central Maharashtra Scarcity Zone',
    district: 'Ahilyanagar',
    country: 'India',
    latitude: 19.0948,
    longitude: 74.7480,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Central rain-shadow plateau characterized by rabi sorghum and chickpea rotation.',
  },

  // Nashik District
  {
    id: 'mh_sinnar',
    name: 'Sinnar',
    secondaryText: 'Sinnar Taluka, Nashik District',
    region: 'North Maharashtra Scarcity Zone',
    district: 'Nashik',
    country: 'India',
    latitude: 19.8456,
    longitude: 73.9986,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Rain-shadow onion and soybean cultivation corridor bordering Western Ghats.',
  },
  {
    id: 'mh_niphad',
    name: 'Niphad',
    secondaryText: 'Godavari Basin Grape Belt, Nashik',
    region: 'Western Maharashtra Transition Zone',
    district: 'Nashik',
    country: 'India',
    latitude: 20.0769,
    longitude: 74.1105,
    isMaharashtra: true,
    agroZone: 'Transition Zone (Zone 5)',
    description: 'Premier export-grade table grape vineyards and cold-storage logistics corridor.',
  },
  {
    id: 'mh_yeola',
    name: 'Yeola',
    secondaryText: 'Yeola Taluka, Eastern Nashik',
    region: 'North Maharashtra Scarcity Zone',
    district: 'Nashik',
    country: 'India',
    latitude: 20.0416,
    longitude: 74.4878,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Semi-arid agricultural zone famous for onion wholesale auctions and Paithani handlooms.',
  },
  {
    id: 'mh_malegaon',
    name: 'Malegaon',
    secondaryText: 'Girna River Basin, Malegaon Taluka, Nashik',
    region: 'North Maharashtra Semi-Arid Belt',
    district: 'Nashik',
    country: 'India',
    latitude: 20.5539,
    longitude: 74.5298,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Girna river irrigation plain with intensive cotton, pomegranate, and fodder farming.',
  },
  {
    id: 'mh_dindori',
    name: 'Dindori',
    secondaryText: 'Kadwa Basin Agro-Wine Region, Nashik',
    region: 'Western Maharashtra Transition Zone',
    district: 'Nashik',
    country: 'India',
    latitude: 20.2015,
    longitude: 73.8344,
    isMaharashtra: true,
    agroZone: 'Transition Zone (Zone 4)',
    description: 'Microclimatic wine grape terroir, tomato nurseries, and vegetable greenhouse clusters.',
  },
  {
    id: 'mh_igatpuri',
    name: 'Igatpuri',
    secondaryText: 'Western Ghats Crest (Sahyadri), Nashik',
    region: 'Western Ghats Heavy Rainfall Belt',
    district: 'Nashik',
    country: 'India',
    latitude: 19.6967,
    longitude: 73.5639,
    isMaharashtra: true,
    agroZone: 'Western Ghats (Zone 3)',
    description: 'High-rainfall Sahyadri escarpment (3000mm+), Kharif rice cultivation, and headwaters of Godavari.',
  },
  {
    id: 'mh_nashik_city',
    name: 'Nashik',
    secondaryText: 'Godavari Valley, North Maharashtra',
    region: 'Western Maharashtra Transition Zone',
    district: 'Nashik',
    country: 'India',
    latitude: 19.9975,
    longitude: 73.7898,
    isMaharashtra: true,
    agroZone: 'Transition Zone (Zone 4)',
    description: 'Major agricultural export hub, horticulture wholesale center, and wine capital of India.',
  },

  // Pune District
  {
    id: 'mh_baramati',
    name: 'Baramati',
    secondaryText: 'Nira River Basin, Pune District',
    region: 'Western Maharashtra Scarcity Belt',
    district: 'Pune',
    country: 'India',
    latitude: 18.1517,
    longitude: 74.5772,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Pioneering agricultural technology, sugar mills, and precision drip-irrigated sugarcane/grapes.',
  },
  {
    id: 'mh_indapur',
    name: 'Indapur',
    secondaryText: 'Ujani Dam Catchment, Pune District',
    region: 'Western Maharashtra Scarcity Belt',
    district: 'Pune',
    country: 'India',
    latitude: 18.1158,
    longitude: 75.0286,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Intensive sugar, banana, and inland freshwater aquaculture adjoining the Ujani reservoir.',
  },
  {
    id: 'mh_junnar',
    name: 'Junnar',
    secondaryText: 'Kukadi Basin Vegetable Belt, Pune',
    region: 'Western Maharashtra Transition Zone',
    district: 'Pune',
    country: 'India',
    latitude: 19.2081,
    longitude: 73.8767,
    isMaharashtra: true,
    agroZone: 'Transition Zone (Zone 4)',
    description: 'Leopard corridor agro-ecosystem, tomato production hub, and Kukadi canal network.',
  },
  {
    id: 'mh_shirur',
    name: 'Shirur (Ghodnadi)',
    secondaryText: 'Ghod River Basin, Pune District',
    region: 'Western Maharashtra Scarcity Belt',
    district: 'Pune',
    country: 'India',
    latitude: 18.8256,
    longitude: 74.3789,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Agrarian belt with deep black vertisol soils supporting jowar, chickpea, and dairy farming.',
  },
  {
    id: 'mh_pune_city',
    name: 'Pune',
    secondaryText: 'Mutha-Mula River Basin, Western Maharashtra',
    region: 'Western Ghats Transition Zone',
    district: 'Pune',
    country: 'India',
    latitude: 18.5204,
    longitude: 73.8567,
    isMaharashtra: true,
    agroZone: 'Transition Zone (Zone 4)',
    description: 'Metropolitan agricultural research hub housing Commissionerate of Agriculture and MPKV colleges.',
  },

  // Solapur District
  {
    id: 'mh_solapur_city',
    name: 'Solapur',
    secondaryText: 'Sina Basin, Southern Deccan Plateau',
    region: 'Scarcity Zone (Zone 6)',
    district: 'Solapur',
    country: 'India',
    latitude: 17.6599,
    longitude: 75.9064,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'National Research Centre on Pomegranate (ICAR-NRCP), rabi jowar heartland, and textile mills.',
  },
  {
    id: 'mh_pandharpur',
    name: 'Pandharpur',
    secondaryText: 'Bhima (Chandrabhaga) River Basin, Solapur',
    region: 'Scarcity Zone (Zone 6)',
    district: 'Solapur',
    country: 'India',
    latitude: 17.6775,
    longitude: 75.3267,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Major pilgrimage town and rich alluvial basin for sugarcane, pomegranate, and ber fruit.',
  },
  {
    id: 'mh_karmala',
    name: 'Karmala',
    secondaryText: 'Karmala Taluka, North Solapur',
    region: 'Scarcity Zone (Zone 6)',
    district: 'Solapur',
    country: 'India',
    latitude: 18.4111,
    longitude: 75.1978,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Deep rain-shadow belt; dryland sorghum, gram, and minor irrigation reservoirs.',
  },

  // Kolhapur & Sangli
  {
    id: 'mh_kolhapur_city',
    name: 'Kolhapur',
    secondaryText: 'Panchganga Basin, South Maharashtra',
    region: 'South Maharashtra High-Yielding Belt',
    district: 'Kolhapur',
    country: 'India',
    latitude: 16.7050,
    longitude: 74.2433,
    isMaharashtra: true,
    agroZone: 'Sub-Montane Zone (Zone 5)',
    description: 'Water-abundant Panchganga valley with top-tier sugarcane yields, jaggery, and dairy cattle.',
  },
  {
    id: 'mh_sangli_city',
    name: 'Sangli',
    secondaryText: 'Krishna River Valley, South Maharashtra',
    region: 'South Maharashtra Transition Belt',
    district: 'Sangli',
    country: 'India',
    latitude: 16.8524,
    longitude: 74.5815,
    isMaharashtra: true,
    agroZone: 'Transition Zone (Zone 5)',
    description: 'Turmeric city of India, major raisin processing hub, and Krishna lift irrigation schemes.',
  },
  {
    id: 'mh_tasgaon',
    name: 'Tasgaon',
    secondaryText: 'Tasgaon Taluka Raisin Belt, Sangli',
    region: 'South Maharashtra Scarcity Belt',
    district: 'Sangli',
    country: 'India',
    latitude: 17.0347,
    longitude: 74.6022,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Premier export-quality Thompson Seedless grape and golden raisin drying yards.',
  },

  // Satara District
  {
    id: 'mh_satara_city',
    name: 'Satara',
    secondaryText: 'Venna-Krishna Confluence, Western Maharashtra',
    region: 'Western Maharashtra Transition Zone',
    district: 'Satara',
    country: 'India',
    latitude: 17.6805,
    longitude: 73.9997,
    isMaharashtra: true,
    agroZone: 'Transition Zone (Zone 4)',
    description: 'Terraced hill agriculture, ginger, turmeric, and proximity to Kas plateau biodiversity hotspot.',
  },
  {
    id: 'mh_mahabaleshwar',
    name: 'Mahabaleshwar',
    secondaryText: 'Sahyadri Crest High-Altitude Plateau, Satara',
    region: 'Western Ghats Heavy Rainfall Belt',
    district: 'Satara',
    country: 'India',
    latitude: 17.9307,
    longitude: 73.6477,
    isMaharashtra: true,
    agroZone: 'Western Ghats (Zone 3)',
    description: 'High-altitude laterite plateau producing 85% of India strawberry crop, with 5000mm monsoon rain.',
  },
  {
    id: 'mh_phaltan',
    name: 'Phaltan',
    secondaryText: 'Banganga Basin, Eastern Satara',
    region: 'Central Maharashtra Scarcity Belt',
    district: 'Satara',
    country: 'India',
    latitude: 17.9861,
    longitude: 74.4319,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Nimbkar Agricultural Research Institute (NARI), sweet sorghum biomass, and Boer goat genetics.',
  },

  // Konkan Coastal Belt
  {
    id: 'mh_ratnagiri_city',
    name: 'Ratnagiri',
    secondaryText: 'Kajali River Estuary, Arabian Sea Coast',
    region: 'Konkan Coastal Zone (Zone 1)',
    district: 'Ratnagiri',
    country: 'India',
    latitude: 16.9902,
    longitude: 73.3120,
    isMaharashtra: true,
    agroZone: 'South Konkan Coastal Zone (Zone 1)',
    description: 'GI-tagged Alphonso (Hapus) mango orchards, cashew nut processing, and coastal lateritic soils.',
  },
  {
    id: 'mh_chiplun',
    name: 'Chiplun',
    secondaryText: 'Vashishti River Basin, North Ratnagiri',
    region: 'Konkan Coastal Zone (Zone 1)',
    district: 'Ratnagiri',
    country: 'India',
    latitude: 17.5323,
    longitude: 73.5186,
    isMaharashtra: true,
    agroZone: 'South Konkan Coastal Zone (Zone 1)',
    description: 'Deep river valley with tidal estuaries, flood-prone alluvial rice terraces, and spices.',
  },
  {
    id: 'mh_dapoli',
    name: 'Dapoli',
    secondaryText: 'Dr. BSKKV Agricultural University, Ratnagiri',
    region: 'Konkan Coastal Zone (Zone 1)',
    district: 'Ratnagiri',
    country: 'India',
    latitude: 17.7611,
    longitude: 73.1844,
    isMaharashtra: true,
    agroZone: 'South Konkan Coastal Zone (Zone 1)',
    description: 'Seat of Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth, coconut, areca nut, and spice cultivation.',
  },
  {
    id: 'mh_sawantwadi',
    name: 'Sawantwadi',
    secondaryText: 'South Sindhudurg Coastal-Ghat Belt',
    region: 'Konkan Coastal Zone (Zone 1)',
    district: 'Sindhudurg',
    country: 'India',
    latitude: 15.9056,
    longitude: 73.8206,
    isMaharashtra: true,
    agroZone: 'South Konkan Coastal Zone (Zone 1)',
    description: 'Dense tropical laterite belt bordering Goa, rich in wild spices, kokum, and bamboo.',
  },
  {
    id: 'mh_alibag',
    name: 'Alibag',
    secondaryText: 'Raigad Coastal Alluvial Plain',
    region: 'North Konkan Coastal Zone (Zone 2)',
    district: 'Raigad',
    country: 'India',
    latitude: 18.6414,
    longitude: 72.8722,
    isMaharashtra: true,
    agroZone: 'North Konkan Coastal Zone (Zone 2)',
    description: 'Saline and alluvial coastal soil, white onion cultivation, and brackish-water aquaculture.',
  },

  // Marathwada Region
  {
    id: 'mh_sambhajinagar_city',
    name: 'Chhatrapati Sambhajinagar',
    secondaryText: 'Godavari Basin / Kham River, Marathwada',
    region: 'Central Marathwada Semi-Arid Zone',
    district: 'Chhatrapati Sambhajinagar',
    country: 'India',
    latitude: 19.8762,
    longitude: 75.3433,
    isMaharashtra: true,
    agroZone: 'Assured Rainfall Zone (Zone 7)',
    description: 'Marathwada dryland agricultural center, hybrid seed production, and cotton-soybean rotations.',
  },
  {
    id: 'mh_paithan',
    name: 'Paithan',
    secondaryText: 'Jayakwadi Dam / Nath Sagar, Sambhajinagar',
    region: 'Central Marathwada Plateau',
    district: 'Chhatrapati Sambhajinagar',
    country: 'India',
    latitude: 19.4811,
    longitude: 75.3811,
    isMaharashtra: true,
    agroZone: 'Assured Rainfall Zone (Zone 7)',
    description: 'Home to the massive Jayakwadi reservoir supplying irrigation to over 250,000 hectares.',
  },
  {
    id: 'mh_jalna_city',
    name: 'Jalna',
    secondaryText: 'Kundalika Basin, Seed Capital of India',
    region: 'Marathwada Agricultural Plateau',
    district: 'Jalna',
    country: 'India',
    latitude: 19.8347,
    longitude: 75.8816,
    isMaharashtra: true,
    agroZone: 'Assured Rainfall Zone (Zone 7)',
    description: 'National hub for certified agricultural seeds (Mahyco, Bejo), sweet orange, and cotton ginning.',
  },
  {
    id: 'mh_latur_city',
    name: 'Latur',
    secondaryText: 'Manjara River Basin, Southern Marathwada',
    region: 'Southern Marathwada Scarcity Belt',
    district: 'Latur',
    country: 'India',
    latitude: 18.4088,
    longitude: 76.5604,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Leading pulse (tur/toor dal) and oilseed (soybean) commodity trading exchange in western India.',
  },
  {
    id: 'mh_nanded_city',
    name: 'Nanded',
    secondaryText: 'Godavari River Basin, East Marathwada',
    region: 'East Marathwada Assured Rainfall',
    district: 'Nanded',
    country: 'India',
    latitude: 19.1383,
    longitude: 77.3210,
    isMaharashtra: true,
    agroZone: 'Moderate Rainfall Zone (Zone 7)',
    description: 'Fertile black soil river basin, banana tissue culture plantations, and BT cotton farming.',
  },
  {
    id: 'mh_parbhani_city',
    name: 'Parbhani',
    secondaryText: 'Vasantrao Naik Marathwada Krishi Vidyapeeth (VNMKV)',
    region: 'Central Marathwada Assured Rainfall',
    district: 'Parbhani',
    country: 'India',
    latitude: 19.2608,
    longitude: 76.7748,
    isMaharashtra: true,
    agroZone: 'Moderate Rainfall Zone (Zone 7)',
    description: 'Seat of VNMKV state agricultural university, pigeonpea germplasm, and sorghum breeding.',
  },
  {
    id: 'mh_beed_city',
    name: 'Beed',
    secondaryText: 'B बिंदुsara Basin, Central Marathwada',
    region: 'Central Marathwada Scarcity Zone',
    district: 'Beed',
    country: 'India',
    latitude: 18.9891,
    longitude: 75.7601,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Drought-prone undulating basaltic topography, pearl millet (bajra), and seasonal farm migration.',
  },
  {
    id: 'mh_dharashiv_city',
    name: 'Dharashiv (Osmanabad)',
    secondaryText: 'Balaghat Plateau, South Marathwada',
    region: 'Balaghat Scarcity Belt',
    district: 'Dharashiv',
    country: 'India',
    latitude: 18.1700,
    longitude: 76.0400,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Balaghat range dryland farming, Osmanabadi goat breed conservation, and sunflower seed belt.',
  },

  // Vidarbha Region
  {
    id: 'mh_nagpur_city',
    name: 'Nagpur',
    secondaryText: 'Vidarbha Basin, Orange Capital of India',
    region: 'Vidarbha Moderate Rainfall Zone',
    district: 'Nagpur',
    country: 'India',
    latitude: 21.1458,
    longitude: 79.0882,
    isMaharashtra: true,
    agroZone: 'Moderate Rainfall Zone (Zone 7)',
    description: 'Global center for Nagpur Mandarin oranges, ICAR-CICR Central Institute for Cotton Research.',
  },
  {
    id: 'mh_amravati_city',
    name: 'Amravati',
    secondaryText: 'Purna Basin, West Vidarbha',
    region: 'West Vidarbha Assured Rainfall',
    district: 'Amravati',
    country: 'India',
    latitude: 20.9320,
    longitude: 77.7523,
    isMaharashtra: true,
    agroZone: 'Moderate Rainfall Zone (Zone 7)',
    description: 'Purna valley saline alluvial tract, soybean heartland, and cotton processing centers.',
  },
  {
    id: 'mh_akola_city',
    name: 'Akola',
    secondaryText: 'Dr. PDKV Agricultural University, West Vidarbha',
    region: 'West Vidarbha Moderate Rainfall',
    district: 'Akola',
    country: 'India',
    latitude: 20.7002,
    longitude: 77.0082,
    isMaharashtra: true,
    agroZone: 'Moderate Rainfall Zone (Zone 7)',
    description: 'Seat of Dr. Panjabrao Deshmukh Krishi Vidyapeeth, dryland research, and cotton pulse mills.',
  },
  {
    id: 'mh_yavatmal_city',
    name: 'Yavatmal',
    secondaryText: 'Cotton Belt, South-Central Vidarbha',
    region: 'Vidarbha Cotton & Soybean Belt',
    district: 'Yavatmal',
    country: 'India',
    latitude: 20.3888,
    longitude: 78.1204,
    isMaharashtra: true,
    agroZone: 'Moderate Rainfall Zone (Zone 7)',
    description: 'Core rainfed cotton farming belt vulnerable to monsoon variability and pink bollworm pests.',
  },
  {
    id: 'mh_chandrapur_city',
    name: 'Chandrapur',
    secondaryText: 'Wardha-Erai Basin, East Vidarbha',
    region: 'East Vidarbha Rice & Forest Zone',
    district: 'Chandrapur',
    country: 'India',
    latitude: 19.9615,
    longitude: 79.2961,
    isMaharashtra: true,
    agroZone: 'High Rainfall with Non-Lateritic Soils (Zone 8)',
    description: 'Transition to eastern rice-growing tracts, coalfields, and Tadoba tiger reserve forest fringe.',
  },
  {
    id: 'mh_gadchiroli_city',
    name: 'Gadchiroli',
    secondaryText: 'Wainganga Basin, Far East Vidarbha',
    region: 'East Vidarbha Heavy Forest Zone',
    district: 'Gadchiroli',
    country: 'India',
    latitude: 20.1808,
    longitude: 80.0039,
    isMaharashtra: true,
    agroZone: 'High Rainfall with Non-Lateritic Soils (Zone 8)',
    description: 'Dense deciduous forest canopy (1400mm rainfall), indigenous tribal minor forest produce, and kharif paddy.',
  },

  // Khandesh (North Maharashtra)
  {
    id: 'mh_jalgaon_city',
    name: 'Jalgaon',
    secondaryText: 'Tapi River Valley, Banana City of India',
    region: 'Tapi Basin North Maharashtra',
    district: 'Jalgaon',
    country: 'India',
    latitude: 21.0077,
    longitude: 75.5626,
    isMaharashtra: true,
    agroZone: 'Assured Rainfall Zone (Zone 7)',
    description: 'Produces over two-thirds of Maharashtra bananas, Jain Irrigation drip tech headquarters, and pulses.',
  },
  {
    id: 'mh_dhule_city',
    name: 'Dhule',
    secondaryText: 'Panzara Basin, Khandesh',
    region: 'North Maharashtra Semi-Arid Belt',
    district: 'Dhule',
    country: 'India',
    latitude: 20.9042,
    longitude: 74.7749,
    isMaharashtra: true,
    agroZone: 'Scarcity Zone (Zone 6)',
    description: 'Tapi tributary agricultural valley with groundnut, cotton, and chillies.',
  },
  {
    id: 'mh_nandurbar_city',
    name: 'Nandurbar',
    secondaryText: 'Satpura Foothills, Tribal Agricultural Belt',
    region: 'Satpura Mountain Agro-Ecology',
    district: 'Nandurbar',
    country: 'India',
    latitude: 21.3686,
    longitude: 74.2384,
    isMaharashtra: true,
    agroZone: 'Ghat Foothills & Satpura Plateau (Zone 5)',
    description: 'Chilli spice capital of western India, Satpura range biodiversity, and tribal mixed farming.',
  },
];

/**
 * National Indian Agricultural Reference Stations
 */
export const INDIA_NATIONAL_LOCALITIES: Omit<PlaceSuggestion, 'source'>[] = [
  {
    id: 'in_iari_delhi',
    name: 'New Delhi (IARI Pusa)',
    secondaryText: 'Indian Agricultural Research Institute, Delhi',
    region: 'Indo-Gangetic Plain',
    district: 'New Delhi',
    country: 'India',
    latitude: 28.6367,
    longitude: 77.1575,
    isMaharashtra: false,
    description: 'Premier national institute for agricultural research, wheat genetics, and Green Revolution origin.',
  },
  {
    id: 'in_pau_ludhiana',
    name: 'Ludhiana (Punjab PAU)',
    secondaryText: 'Punjab Agricultural University, Punjab',
    region: 'North-Western Wheat-Paddy Belt',
    district: 'Ludhiana',
    country: 'India',
    latitude: 30.9010,
    longitude: 75.8573,
    isMaharashtra: false,
    description: 'High-intensity irrigated wheat-paddy rotation and groundwater depletion monitoring station.',
  },
  {
    id: 'in_icrisat_hyderabad',
    name: 'Hyderabad (ICRISAT Patancheru)',
    secondaryText: 'International Crops Research Institute for the Semi-Arid Tropics',
    region: 'Telangana Deccan Plateau',
    district: 'Hyderabad',
    country: 'India',
    latitude: 17.5111,
    longitude: 78.2751,
    isMaharashtra: false,
    description: 'Global CGIAR center for drought-tolerant dryland crops: chickpea, pigeonpea, groundnut, sorghum.',
  },
  {
    id: 'in_tnau_coimbatore',
    name: 'Coimbatore (TNAU)',
    secondaryText: 'Tamil Nadu Agricultural University, Coimbatore',
    region: 'Southern Peninsular Agro-Climatic Zone',
    district: 'Coimbatore',
    country: 'India',
    latitude: 11.0124,
    longitude: 76.9356,
    isMaharashtra: false,
    description: 'Leading southern agricultural university in the rain-shadow of Palakkad gap.',
  },
  {
    id: 'in_aau_anand',
    name: 'Anand (Gujarat AAU & Amul)',
    secondaryText: 'Anand Agricultural University & Dairy Capital',
    region: 'Charotar Alluvial Agro-Climatic Zone',
    district: 'Anand',
    country: 'India',
    latitude: 22.5645,
    longitude: 72.9289,
    isMaharashtra: false,
    description: 'Birthplace of Operation Flood (White Revolution), tobacco, banana, and cooperative dairying.',
  },
  {
    id: 'in_bengaluru_uas',
    name: 'Bengaluru (UAS GKVK)',
    secondaryText: 'University of Agricultural Sciences, Gandhi Krishi Vigyana Kendra',
    region: 'South Deccan Dry Zone',
    district: 'Bengaluru',
    country: 'India',
    latitude: 13.0768,
    longitude: 77.5753,
    isMaharashtra: false,
    description: 'Finger millet (ragi), sericulture, and agro-forestry research campus.',
  },
];

/**
 * Global Benchmark Agricultural Research & Environmental Stations
 */
export const WORLDWIDE_BENCHMARK_LOCALITIES: Omit<PlaceSuggestion, 'source'>[] = [
  {
    id: 'world_ames_iowa',
    name: 'Ames, Iowa (US Corn Belt)',
    secondaryText: 'Iowa State University & USDA ARS National Laboratory',
    region: 'Midwest Corn-Soybean Belt',
    district: 'Story County, Iowa',
    country: 'United States',
    latitude: 42.0308,
    longitude: -93.6319,
    isMaharashtra: false,
    description: 'World benchmark for intensive rainfed corn and soybean agro-ecosystems and USDA soil moisture arrays.',
  },
  {
    id: 'world_nairobi_ilri',
    name: 'Nairobi, Kenya (ILRI / CGIAR)',
    secondaryText: 'International Livestock Research Institute, East Africa',
    region: 'East African Highland Agro-Ecology',
    district: 'Nairobi County',
    country: 'Kenya',
    latitude: -1.2921,
    longitude: 36.8219,
    isMaharashtra: false,
    description: 'CGIAR headquarters for tropical rangelands, smallholder dairy, and climate adaptation in Sub-Saharan Africa.',
  },
  {
    id: 'world_cimmyt_mexico',
    name: 'Texcoco, Mexico (CIMMYT)',
    secondaryText: 'International Maize and Wheat Improvement Center',
    region: 'Central Mexican Highlands',
    district: 'State of Mexico',
    country: 'Mexico',
    latitude: 19.5317,
    longitude: -98.8524,
    isMaharashtra: false,
    description: 'Norman Borlaug research base for global wheat rust resistance and drought-tolerant maize.',
  },
  {
    id: 'world_irri_philippines',
    name: 'Los Baños, Philippines (IRRI)',
    secondaryText: 'International Rice Research Institute, Laguna',
    region: 'Southeast Asian Wet Tropical Belt',
    district: 'Laguna Province',
    country: 'Philippines',
    latitude: 14.1706,
    longitude: 121.2543,
    isMaharashtra: false,
    description: 'Global rice germplasm bank conserving over 132,000 accessions of cultivated and wild rice.',
  },
  {
    id: 'world_wageningen_nl',
    name: 'Wageningen, Netherlands',
    secondaryText: 'Wageningen University & Research (WUR) Food Valley',
    region: 'North-West European Maritime Agro-Tech',
    district: 'Gelderland',
    country: 'Netherlands',
    latitude: 51.9851,
    longitude: 5.6637,
    isMaharashtra: false,
    description: 'Global capital for closed-loop precision greenhouses, circular agriculture, and hyperspectral plant phenotyping.',
  },
  {
    id: 'world_kyoto_japan',
    name: 'Kyoto, Japan',
    secondaryText: 'Kyoto University Graduate School of Agriculture',
    region: 'Kansai Temperate Agricultural Ecology',
    district: 'Kyoto Prefecture',
    country: 'Japan',
    latitude: 35.0270,
    longitude: 135.7831,
    isMaharashtra: false,
    description: 'Long-term agro-ecological trials on organic paddy soils, terraced tea hills (Uji), and forest watershed dynamics.',
  },
  {
    id: 'world_ribierao_brazil',
    name: 'Ribeirão Preto, Brazil (Embrapa)',
    secondaryText: 'São Paulo State Sugarcane & Agribusiness Capital',
    region: 'Cerrado-Atlantic Transition Belt',
    district: 'São Paulo',
    country: 'Brazil',
    latitude: -21.1775,
    longitude: -47.8103,
    isMaharashtra: false,
    description: 'Center for commercial biofuel sugarcane agronomy, tropical soybean genetics, and oxisol soil management.',
  },
];

/**
 * Searches the built-in catalog based on query string and active search scope
 */
export function searchLocalDatabase(
  query: string,
  scope: SearchScope = 'maharashtra'
): PlaceSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  let candidates: Omit<PlaceSuggestion, 'source'>[] = [];

  if (scope === 'maharashtra') {
    candidates = MAHARASHTRA_LOCALITIES;
  } else if (scope === 'india') {
    candidates = [...MAHARASHTRA_LOCALITIES, ...INDIA_NATIONAL_LOCALITIES];
  } else {
    candidates = [
      ...MAHARASHTRA_LOCALITIES,
      ...INDIA_NATIONAL_LOCALITIES,
      ...WORLDWIDE_BENCHMARK_LOCALITIES,
    ];
  }

  // Filter and score matches
  const results = candidates
    .filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.secondaryText.toLowerCase().includes(q) ||
        (item.district && item.district.toLowerCase().includes(q)) ||
        (item.agroZone && item.agroZone.toLowerCase().includes(q)) ||
        item.country.toLowerCase().includes(q)
      );
    })
    .map((item) => {
      const isMh = isPointInsideMaharashtra(item.latitude, item.longitude);
      return {
        ...item,
        source: 'local_database' as const,
        isMaharashtra: isMh,
        agroZone: isMh ? (item.agroZone || getMaharashtraAgroZone(item.latitude, item.longitude).zoneName) : undefined,
      };
    });

  return results.slice(0, 8);
}

/**
 * Evaluates scientific coverage and resolution limitations for any given coordinate and scope
 */
export interface ScientificCoverageAnalysis {
  isMaharashtra: boolean;
  agroZoneName: string;
  nasaPowerStatus: 'full_support' | 'grid_coarse_note';
  nasaPowerNote: string;
  gibsSupportNote: string;
  gpmImergSupport: 'covered' | 'out_of_bounds';
  gpmNote: string;
  elevationNote: string;
}

export function analyzeScientificCoverage(
  lat: number,
  lng: number,
  scope: SearchScope
): ScientificCoverageAnalysis {
  const isMh = isPointInsideMaharashtra(lat, lng);
  const agro = isMh ? getMaharashtraAgroZone(lat, lng) : null;

  // GPM IMERG operates strictly between 60°S and 60°N
  const gpmSupported = lat >= -60 && lat <= 60;

  return {
    isMaharashtra: isMh,
    agroZoneName: agro ? agro.zoneName : (scope === 'maharashtra' ? 'Outside Maharashtra Boundary' : 'Global Study Region'),
    nasaPowerStatus: 'grid_coarse_note',
    nasaPowerNote: `NASA POWER provides atmospheric reanalysis (MERRA-2) at 0.5° × 0.5° grid resolution (~55 km). The selected point (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E) is assigned to its enclosing regional grid cell. Measurements represent spatial regional averages rather than localized microclimate station sensors.`,
    gibsSupportNote: 'NASA GIBS MODIS True Color and NDVI layers offer 250m optical resolution daily/16-day composites across global landmasses, subject to local cloud cover.',
    gpmImergSupport: gpmSupported ? 'covered' : 'out_of_bounds',
    gpmNote: gpmSupported
      ? 'GPM IMERG Early/Late precipitation products provide 0.1° (~10 km) resolution at this latitude.'
      : 'GPM IMERG spatial coverage terminates at ±60° latitude. This high-latitude target falls outside GPM coverage; reanalysis precipitation must be used.',
    elevationNote: 'Elevation is extracted from NASA POWER SRTM/GEOS-FP digital elevation models at 30m–90m nominal resolution.',
  };
}
