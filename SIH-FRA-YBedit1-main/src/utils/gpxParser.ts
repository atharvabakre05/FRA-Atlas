import * as tj from '@tmcw/togeojson';

export interface GPXCoordinates {
  latitude: number;
  longitude: number;
  trackPoints?: { lat: number; lng: number; }[];
}

export const parseGPXFile = async (file: File): Promise<GPXCoordinates | null> => {
  try {
    const text = await file.text();
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(text, 'text/xml');
    
    // Convert GPX to GeoJSON
    const geoJSON = tj.gpx(gpxDoc);
    
    let mainCoordinate: { latitude: number; longitude: number; } | null = null;
    let trackPoints: { lat: number; lng: number; }[] = [];
    
    // Process GeoJSON features
    for (const feature of geoJSON.features) {
      if (feature.geometry.type === 'Point' && !mainCoordinate) {
        const [longitude, latitude] = feature.geometry.coordinates;
        mainCoordinate = { latitude, longitude };
      } 
      else if (feature.geometry.type === 'LineString') {
        trackPoints = feature.geometry.coordinates.map(([lng, lat]: number[]) => ({
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
    }

    if (!mainCoordinate && trackPoints.length === 0) {
      return null;
    }

    // If no main coordinate was found but we have track points, use the first track point
    if (!mainCoordinate && trackPoints.length > 0) {
      mainCoordinate = {
        latitude: trackPoints[0].lat,
        longitude: trackPoints[0].lng
      };
    }

    return {
      ...mainCoordinate!,
      trackPoints: trackPoints.length > 0 ? trackPoints : undefined
    };
  } catch (error) {
    console.error('Error parsing GPX file:', error);
    return null;
  }
};
