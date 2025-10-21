'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { LngLatBoundsLike, LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapViewProps {
  geojson?: GeoJSON.FeatureCollection;
}

type NestedCoordinates = GeoJSON.Position | NestedCoordinates[];

function collectPositions(coords: NestedCoordinates): GeoJSON.Position[] {
  if (!Array.isArray(coords) || coords.length === 0) {
    return [];
  }

  if (typeof coords[0] === 'number') {
    return [coords as GeoJSON.Position];
  }

  return (coords as NestedCoordinates[]).flatMap(collectPositions);
}

export function MapView({ geojson }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0] as LngLatLike,
      zoom: 2
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojson) {
      return;
    }

    if (map.getSource('site')) {
      map.removeLayer('site-line');
      map.removeSource('site');
    }

    map.addSource('site', {
      type: 'geojson',
      data: geojson
    });

    map.addLayer({
      id: 'site-line',
      source: 'site',
      type: 'line',
      paint: {
        'line-color': '#ef4444',
        'line-width': 3
      }
    });

    const bbox = new maplibregl.LngLatBounds();
    geojson.features.forEach((feature) => {
      const coordinates =
        feature.geometry && 'coordinates' in feature.geometry ? feature.geometry.coordinates : null;

      if (!coordinates) {
        return;
      }

      collectPositions(coordinates as NestedCoordinates).forEach((coord) =>
        bbox.extend(coord as [number, number])
      );
    });

    if (bbox.isEmpty()) {
      map.setCenter([0, 0]);
      map.setZoom(2);
    } else {
      map.fitBounds(bbox as LngLatBoundsLike, { padding: 40, maxZoom: 16 });
    }
  }, [geojson]);

  return <div ref={containerRef} style={{ width: '100%', height: '400px', borderRadius: '0.75rem', overflow: 'hidden' }} />;
}
