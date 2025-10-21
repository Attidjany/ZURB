import { Feature, FeatureCollection, GeoJsonProperties, Geometry, MultiPolygon, Polygon } from 'geojson';

type MultiPolygonLike = FeatureCollection<MultiPolygon | Polygon> | Feature<MultiPolygon | Polygon> | MultiPolygon | Polygon;

function isFeatureCollection(input: MultiPolygonLike): input is FeatureCollection<Geometry> {
  return (input as FeatureCollection).type === 'FeatureCollection';
}

function isFeature(input: MultiPolygonLike): input is Feature<Geometry, GeoJsonProperties> {
  return (input as Feature).type === 'Feature';
}

function ensure4326(feature: Feature<Geometry>) {
  const crs = (feature as any).crs;
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
      ensure4326(feature as Feature<Geometry>);
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
    ensure4326(input);
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
