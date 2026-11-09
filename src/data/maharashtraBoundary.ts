/**
 * Maharashtra Boundary Validation & Agro-Climatic Zoning
 * Provides polygon ray-casting boundary validation for Maharashtra state
 * to ensure selections are strictly verified against actual geographic borders,
 * not just an arbitrary loose bounding box.
 */

// Approximate boundary vertices of Maharashtra, India (clockwise polygon)
export const MAHARASHTRA_POLYGON_VERTICES: [number, number][] = [
  // [latitude, longitude]
  [20.15, 72.80], // Daman / Palghar coast
  [19.00, 72.75], // Mumbai coastal fringe
  [18.50, 72.90], // Alibaug / Raigad coast
  [17.50, 73.15], // Ratnagiri coast
  [16.00, 73.45], // Sindhudurg / Malvan coast
  [15.65, 73.70], // Goa-Maharashtra southern border
  [15.75, 74.25], // South Kolhapur border
  [16.80, 74.80], // Sangli southern border
  [17.10, 75.80], // Solapur-Karnataka border
  [17.65, 76.50], // Solapur-Telangana transition
  [18.25, 77.20], // Osmanabad / Latur border
  [18.60, 77.80], // Nanded southern border
  [18.85, 78.50], // Telangana border south of Chandrapur
  [19.10, 79.90], // Gadchiroli southern border with Telangana/Chhattisgarh
  [19.40, 80.85], // Extreme South-East Gadchiroli border
  [20.40, 80.50], // Gadchiroli-Chhattisgarh border
  [21.20, 80.20], // Gondia eastern border
  [21.65, 79.80], // North Bhandara border
  [21.50, 79.10], // North Nagpur border with MP
  [21.60, 78.30], // North Amravati border with MP
  [21.50, 77.20], // Melghat border
  [21.30, 76.20], // North Jalgaon border
  [21.80, 75.00], // North Dhule border
  [22.02, 74.30], // Extreme North-West Nandurbar border with Gujarat
  [21.60, 73.80], // Nandurbar-Gujarat border
  [20.70, 73.40], // Nashik northwest border with Gujarat
  [20.25, 73.00], // Palghar border
];

/**
 * Point-in-polygon algorithm (Ray-casting) to verify if lat/lng is genuinely inside Maharashtra.
 */
export function isPointInsideMaharashtra(lat: number, lng: number): boolean {
  // First, fast bounding box pre-filter
  if (lat < 15.60 || lat > 22.10 || lng < 72.60 || lng > 80.90) {
    return false;
  }

  const poly = MAHARASHTRA_POLYGON_VERTICES;
  let inside = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];

    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Determine which Maharashtra Agro-Climatic Zone a coordinate belongs to.
 */
export function getMaharashtraAgroZone(lat: number, lng: number): {
  zoneName: string;
  soilType: string;
  annualRainfallMm: string;
  keyCrops: string[];
} {
  if (lng < 73.8) {
    return {
      zoneName: 'Konkan Coastal Zone & Western Ghats Foothills',
      soilType: 'Lateritic and coastal alluvium',
      annualRainfallMm: '2,000 – 3,500 mm',
      keyCrops: ['Rice', 'Mango (Alphonso)', 'Cashew', 'Coconut', 'Betel nut'],
    };
  } else if (lat > 20.0 && lng > 77.0) {
    return {
      zoneName: 'Vidarbha Assured Rainfall & Central Plateau Zone',
      soilType: 'Deep black cotton soils (Vertisols)',
      annualRainfallMm: '900 – 1,400 mm',
      keyCrops: ['Cotton', 'Soybean', 'Nagpur Mandarin Orange', 'Pigeon Pea (Tur)', 'Gram'],
    };
  } else if (lat < 20.2 && lng > 75.0 && lng <= 77.5) {
    return {
      zoneName: 'Marathwada Drought-Prone Rain-Shadow Zone',
      soilType: 'Medium to deep black soils, calcareous',
      annualRainfallMm: '600 – 800 mm (High coefficient of variation)',
      keyCrops: ['Rainfed Cotton', 'Soybean', 'Jowar (Sorghum)', 'Bajra (Pearl Millet)', 'Sweet Lime (Mosambi)'],
    };
  } else if (lat >= 19.3 && lat <= 20.3 && lng >= 73.8 && lng <= 75.2) {
    return {
      zoneName: 'Deccan Transition & Godavari Basin Agri-Cluster (Shirdi–Kopargaon–Nashik)',
      soilType: 'Alluvial riverine soils and medium black clay',
      annualRainfallMm: '500 – 650 mm (Canal and groundwater irrigated)',
      keyCrops: ['Sugarcane', 'Pomegranate', 'Guava', 'Table Grapes', 'Onions', 'Rabi Jowar'],
    };
  } else {
    return {
      zoneName: 'Western Maharashtra Scarcity / Sub-Tropical River Valley Zone (Pune–Kolhapur)',
      soilType: 'Mixed black and reddish-brown loam',
      annualRainfallMm: '600 – 1,200 mm',
      keyCrops: ['Sugarcane', 'Dairy fodder', 'Turmeric', 'Vegetables', 'Wheat'],
    };
  }
}
