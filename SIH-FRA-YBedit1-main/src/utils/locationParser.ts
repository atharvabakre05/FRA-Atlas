import * as tj from '@tmcw/togeojson';

export interface LocationData {
  latitude: number;
  longitude: number;
  trackPoints?: { lat: number; lng: number; }[];
  polygonPoints?: { lat: number; lng: number; }[];
}

export const parseLocationFile = async (file: File): Promise<LocationData | null> => {
  try {
    const text = await file.text();
    let data;

    if (file.name.toLowerCase().endsWith('.gpx')) {
      // Parse GPX file
      const parser = new DOMParser();
      const gpxDoc = parser.parseFromString(text, 'text/xml');
      data = tj.gpx(gpxDoc);
    } else if (file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.geojson')) {
      // Parse GeoJSON file
      data = JSON.parse(text);
    } else {
      throw new Error('Unsupported file format');
    }

    let mainCoordinate: { latitude: number; longitude: number; } | null = null;
    let trackPoints: { lat: number; lng: number; }[] = [];
    let polygonPoints: { lat: number; lng: number; }[] = [];

    // Process GeoJSON features
    const features = Array.isArray(data.features) ? data.features : [data];
    
    for (const feature of features) {
      const geometry = feature.geometry || feature;
      
      if (geometry.type === 'Point' && !mainCoordinate) {
        const [longitude, latitude] = geometry.coordinates;
        mainCoordinate = { latitude, longitude };
      } 
      else if (geometry.type === 'LineString') {
        trackPoints = geometry.coordinates.map(([lng, lat]: number[]) => ({
          lat,
          lng
        }));
        if (!mainCoordinate && trackPoints.length > 0) {
          mainCoordinate = {
            latitude: trackPoints[0].lat,
            longitude: trackPoints[0].lng
          };
        }
      }
      else if (geometry.type === 'Polygon') {
        // Use the first ring of the polygon (outer ring)
        polygonPoints = geometry.coordinates[0].map(([lng, lat]: number[]) => ({
          lat,
          lng
        }));
        if (!mainCoordinate && polygonPoints.length > 0) {
          mainCoordinate = {
            latitude: polygonPoints[0].lat,
            longitude: polygonPoints[0].lng
          };
        }
      }
    }

    if (!mainCoordinate && !trackPoints.length && !polygonPoints.length) {
      return null;
    }

    // If no main coordinate was found but we have other points, use the first available point
    if (!mainCoordinate) {
      const firstPoint = trackPoints[0] || polygonPoints[0];
      if (firstPoint) {
        mainCoordinate = {
          latitude: firstPoint.lat,
          longitude: firstPoint.lng
        };
      }
    }

    return {
      ...mainCoordinate!,
      trackPoints: trackPoints.length > 0 ? trackPoints : undefined,
      polygonPoints: polygonPoints.length > 0 ? polygonPoints : undefined
    };
  } catch (error) {
    console.error('Error parsing location file:', error);
    return null;
  }
};
