import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { GibsLayerDefinition, buildGibsTileUrl } from '../services/nasaGibsService';

interface GibsMapOverlayProps {
  activeLayer: GibsLayerDefinition | null;
  opacity: number;
  dateStr?: string; // 'YYYY-MM-DD'
  onError?: (err: string) => void;
  onTileLoad?: () => void;
}

/**
 * GibsMapOverlay attaches an official NASA GIBS WMTS layer to the Google Map instance
 * via google.maps.ImageMapType.
 * It respects Web Mercator coordinates (EPSG:3857 / GoogleMapsCompatible_LevelX),
 * dynamic opacity, date parameterization, and clean removal on layer toggle.
 */
export const GibsMapOverlay: React.FC<GibsMapOverlayProps> = ({
  activeLayer,
  opacity,
  dateStr,
  onError,
}) => {
  const map = useMap();
  const overlayRef = useRef<google.maps.ImageMapType | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing overlay if present
    if (overlayRef.current) {
      map.overlayMapTypes.forEach((entry: any, index: number) => {
        if (entry === overlayRef.current) {
          map.overlayMapTypes.removeAt(index);
        }
      });
      overlayRef.current = null;
    }

    if (!activeLayer) {
      return;
    }

    try {
      const gibsTileType = new google.maps.ImageMapType({
        getTileUrl: (coord: google.maps.Point, zoom: number): string | null => {
          // Check layer zoom limits
          if (zoom > activeLayer.maxZoom || zoom < activeLayer.minZoom) {
            return null;
          }

          // In Google Maps, tile coordinates at zoom z:
          // x is column [0, 2^z - 1]
          // y is row [0, 2^z - 1]
          const numTiles = 1 << zoom;
          const x = ((coord.x % numTiles) + numTiles) % numTiles;
          const y = coord.y;

          if (y < 0 || y >= numTiles) {
            return null;
          }

          return buildGibsTileUrl(activeLayer, x, y, zoom, dateStr);
        },
        tileSize: new google.maps.Size(256, 256),
        name: activeLayer.name,
        opacity: opacity,
        maxZoom: activeLayer.maxZoom,
        minZoom: activeLayer.minZoom,
      });

      overlayRef.current = gibsTileType;
      map.overlayMapTypes.push(gibsTileType);
    } catch (err: any) {
      console.error('Failed to attach NASA GIBS ImageMapType:', err);
      if (onError) onError(err.message || 'Error attaching NASA GIBS layer');
    }

    return () => {
      if (map && overlayRef.current) {
        map.overlayMapTypes.forEach((entry: any, index: number) => {
          if (entry === overlayRef.current) {
            map.overlayMapTypes.removeAt(index);
          }
        });
        overlayRef.current = null;
      }
    };
  }, [map, activeLayer, dateStr]);

  // Handle dynamic opacity updates smoothly without re-instantiating the tile set
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  return null;
};
