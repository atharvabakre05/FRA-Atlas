import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: '/node_modules/leaflet/dist/images/marker-icon.png',
  shadowUrl: '/node_modules/leaflet/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationData {
  latitude: number;
  longitude: number;
  trackPoints?: { lat: number; lng: number; }[];
  polygonPoints?: { lat: number; lng: number; }[];
}

interface MapPreviewProps {
  coordinates: LocationData | null;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ coordinates }) => {
  if (!coordinates) return null;

  const position: [number, number] = [coordinates.latitude, coordinates.longitude];
  const zoom = 13;

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border-2 border-forest-sage/20">
      <MapContainer
        center={position}
        zoom={zoom}
        className="w-full h-full"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite (Esri)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Bhuvan (ISRO)">
            <TileLayer
              url="https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wmts/bhuvan_2d_map/earth/image256/{z}/{y}/{x}.png"
              attribution='Imagery &copy; NRSC/ISRO Bhuvan'
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {/* Show the main marker */}
        <Marker position={position} icon={defaultIcon} />
        
        {/* Show track points if available */}
        {coordinates.trackPoints && coordinates.trackPoints.length > 0 && (
          <Polyline 
            positions={coordinates.trackPoints}
            color="#2E7D32"
            weight={3}
            opacity={0.7}
          />
        )}

        {/* Show polygon if available */}
        {coordinates.polygonPoints && coordinates.polygonPoints.length > 0 && (
          <Polyline 
            positions={coordinates.polygonPoints}
            color="#1B5E20"
            weight={3}
            opacity={0.7}
            fill={true}
            fillColor="#2E7D32"
            fillOpacity={0.2}
          />
        )}
      </MapContainer>
    </div>
  );
};
