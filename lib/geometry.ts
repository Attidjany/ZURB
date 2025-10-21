import { Feature, FeatureCollection, GeoJsonProperties, Geometry, MultiPolygon, Polygon } from 'geojson';

type MultiPolygonLike = FeatureCollection<MultiPolygon | Polygon> | Feature<MultiPolygon | Polygon> | MultiPolygon | Polygon;

function isFeatureCollection(input: MultiPolygonLike): input is FeatureCollection<Geometry> {
  return (input as FeatureCollection).type === 'FeatureCollection';
}

function isFeature(input: MultiPolygonLike): input is Feature<Geometry, GeoJsonProperties> {
  return (input as Feature).type === 'Feature';
}

interface FeatureWithCrs extends Feature<Geometry, GeoJsonProperties> {
  crs?: {
    properties?: {
      name?: string;
    };
  };
}

function ensure4326(feature: FeatureWithCrs) {
  const crs = feature.crs;
  if (crs && crs.properties && crs.properties.name && crs.properties.name !== 'EPSG:4326') {
    throw new Error('GeoJSON must be in EPSG:4326.');
  }
}

export function normalizeToMultiPolygon(input: MultiPolygonLike): MultiPolygon {
  if (!input) {
    throw new Error('GeoJSON payload is empty.');
  }

  if (isFeatureCollection(input)) {
    const polygons = input.features.map((feature) => {
      ensure4326(feature as FeatureWithCrs);
      if (feature.geometry?.type === 'Polygon') {
        return {
          type: 'Polygon',
          coordinates: feature.geometry.coordinates
        } as Polygon;
      }
      if (feature.geometry?.type === 'MultiPolygon') {
        return feature.geometry as MultiPolygon;
      }
      throw new Error('Only Polygon or MultiPolygon geometries are supported.');
    });
    return {
      type: 'MultiPolygon',
      coordinates: polygons.flatMap((poly) => (poly.type === 'Polygon' ? [poly.coordinates] : poly.coordinates))
    };
  }

  if (isFeature(input)) {
    ensure4326(input as FeatureWithCrs);
    if (input.geometry?.type === 'Polygon') {
      return {
        type: 'MultiPolygon',
        coordinates: [input.geometry.coordinates]
      };
    }
    if (input.geometry?.type === 'MultiPolygon') {
      return input.geometry as MultiPolygon;
    }
  }

  if ((input as Geometry).type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [(input as Polygon).coordinates] };
  }

  if ((input as Geometry).type === 'MultiPolygon') {
    return input as MultiPolygon;
  }

  throw new Error('Unsupported GeoJSON payload. Expect Polygon or MultiPolygon.');
}
