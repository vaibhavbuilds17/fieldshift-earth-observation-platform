/**
 * NASA Earthdata Common Metadata Repository (CMR) & Granule Discovery Service
 * Queries the official open NASA CMR Search API: https://cmr.earthdata.nasa.gov/search/granules.json
 * Enables real granule metadata discovery for MODIS, Landsat, GPM, and ECOSTRESS over Maharashtra.
 */

export interface CmrGranuleItem {
  id: string;
  title: string;
  collectionConceptId: string;
  datasetId: string;
  timeStart: string;
  timeEnd?: string;
  dayNightFlag?: string;
  cloudCover?: number;
  granuleSizeMb?: number;
  downloadUrl?: string;
  browseUrl?: string;
  producerGranuleId?: string;
}

export interface CmrQueryResult {
  success: boolean;
  totalHits: number;
  granules: CmrGranuleItem[];
  queriedBox: string;
  collectionShortName: string;
  errorMessage?: string;
}

/**
 * Common Earth Observation Collections relevant to agricultural science
 */
export const TARGET_COLLECTIONS = [
  {
    shortName: 'MOD13Q1',
    version: '061',
    title: 'MODIS/Terra Vegetation Indices 16-Day L3 Global 250m SIN Grid',
    sensor: 'MODIS on Terra',
    agency: 'NASA LP DAAC',
    relevance: 'NDVI & EVI vegetative vigor and greenness dynamics',
  },
  {
    shortName: 'GPM_3IMERGDF',
    version: '07',
    title: 'GPM IMERG Final Precipitation L3 1 day 0.1 degree x 0.1 degree V07',
    sensor: 'GPM Constellation',
    agency: 'NASA GES DISC',
    relevance: 'Accurate research-grade monsoon precipitation totals',
  },
  {
    shortName: 'MOD14A1',
    version: '061',
    title: 'MODIS/Terra Thermal Anomalies/Fire Daily L3 Global 1km SIN Grid',
    sensor: 'MODIS on Terra',
    agency: 'NASA LP DAAC',
    relevance: 'Agricultural crop residue burning and fire frequency',
  },
  {
    shortName: 'HLSL30',
    version: '020',
    title: 'HLS Landsat Operational Land Imager Surface Reflectance Daily Global 30m',
    sensor: 'Landsat 8/9 OLI/TIRS',
    agency: 'NASA LP DAAC / USGS',
    relevance: '30m field-scale parcel reflectance & crop boundary monitoring',
  },
];

/**
 * Query real granules from NASA CMR Search API for a coordinate point in Maharashtra.
 */
export async function queryCmrGranules(
  lat: number,
  lng: number,
  shortName: string = 'MOD13Q1',
  pageSize: number = 5
): Promise<CmrQueryResult> {
  const delta = 0.5; // ~50km window around point
  const bbox = `${(lng - delta).toFixed(2)},${(lat - delta).toFixed(2)},${(lng + delta).toFixed(2)},${(lat + delta).toFixed(2)}`;

  const url = `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=${encodeURIComponent(
    shortName
  )}&bounding_box=${bbox}&page_size=${pageSize}&sort_key[]=-start_date`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`CMR Search returned HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const hits = Number(res.headers.get('CMR-Hits') || json.feed?.entry?.length || 0);
    const rawEntries = json.feed?.entry || [];

    const granules: CmrGranuleItem[] = rawEntries.map((e: any) => {
      // Find direct data download link
      const links = e.links || [];
      const dataLink = links.find(
        (l: any) =>
          l.rel?.includes('data#') ||
          (l.href && (l.href.endsWith('.hdf') || l.href.endsWith('.nc') || l.href.endsWith('.tif')))
      );
      const browseLink = links.find((l: any) => l.rel?.includes('browse#'));

      return {
        id: e.id,
        title: e.title || e.producer_granule_id || e.id,
        collectionConceptId: e.collection_concept_id || '',
        datasetId: e.dataset_id || shortName,
        timeStart: e.time_start || '',
        timeEnd: e.time_end || '',
        dayNightFlag: e.day_night_flag,
        cloudCover: e.cloud_cover !== undefined ? Number(e.cloud_cover) : undefined,
        granuleSizeMb: e.granule_size ? Number((Number(e.granule_size)).toFixed(1)) : undefined,
        downloadUrl: dataLink?.href,
        browseUrl: browseLink?.href,
        producerGranuleId: e.producer_granule_id,
      };
    });

    return {
      success: true,
      totalHits: hits,
      granules,
      queriedBox: bbox,
      collectionShortName: shortName,
    };
  } catch (err: any) {
    return {
      success: false,
      totalHits: 0,
      granules: [],
      queriedBox: bbox,
      collectionShortName: shortName,
      errorMessage: err.message || 'Unable to connect to NASA CMR API',
    };
  }
}
