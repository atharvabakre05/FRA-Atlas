import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline, useMap, LayersControl, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  Map, 
  Satellite, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Navigation, 
  Download,
  RefreshCw,
  Eye,
  Target,
  Compass,
  Clock
} from 'lucide-react';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface TerrainData {
  id: string;
  type: 'forest' | 'agricultural' | 'water' | 'mountain' | 'homestead' | 'infrastructure';
  name: string;
  coordinates: [number, number][];
  area: number;
  confidence: number;
  lastUpdated: string;
  elevation?: number;
  vegetationIndex?: number;
  soilMoisture?: number;
}

interface RealTimeMapProps {
  selectedVillage: string;
  terrainData: TerrainData[];
  onTerrainSelect?: (terrain: TerrainData) => void;
  externalLayers?: {
    forest?: { id: string; name: string; geometry: any; properties: any }[];
    groundwater?: { id: string; name: string; geometry: any; properties: any }[];
    infrastructure?: { id: string; name: string; geometry: any; properties: any }[];
  };
  vectorizedFeatures?: { type: 'FeatureCollection'; features: any[] } | null;
}

// Custom control component for map controls
const MapControls: React.FC<{ onExport: () => void; onRefresh: () => void }> = ({ onExport, onRefresh }) => {
  const map = useMap();
  
  const zoomIn = () => map.zoomIn();
  const zoomOut = () => map.zoomOut();
  const resetView = () => map.setView([20.2961, 83.4906], 12);
  
  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col space-y-2">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <button
          onClick={zoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Reset View"
        >
          <Target className="h-4 w-4" />
        </button>
      </div>
      
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <button
          onClick={onExport}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Export Map"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Real-time data indicator
const RealTimeIndicator: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
      <div className="flex items-center space-x-2 text-xs text-forest-deep">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live Data</span>
      </div>
      <div className="text-xs text-forest-medium mt-1">
        Last update: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

// Terrain legend component
const TerrainLegend: React.FC<{ data: TerrainData[] }> = ({ data }) => {
  const byType = data.reduce<Record<string, { color: string; label: string; count: number; area: number }>>((acc, t) => {
    const map: Record<string, { color: string; label: string }> = {
      forest: { color: '#16a34a', label: 'Forest Cover' },
      agricultural: { color: '#eab308', label: 'Agricultural Land' },
      water: { color: '#3b82f6', label: 'Water Bodies' },
      mountain: { color: '#6b7280', label: 'Mountainous' },
      homestead: { color: '#f97316', label: 'Homestead' },
      infrastructure: { color: '#8b5cf6', label: 'Infrastructure' }
    };
    const key = t.type;
    if (!acc[key]) acc[key] = { ...map[key], count: 0, area: 0 } as any;
    acc[key].count += 1;
    acc[key].area += t.area;
    return acc;
  }, {});

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-64">
      <h4 className="text-sm font-semibold text-forest-deep mb-2 flex items-center">
        <Layers className="h-4 w-4 mr-2" />
        Terrain Summary
      </h4>
      <div className="space-y-1 text-xs">
        {Object.entries(byType).map(([type, v]) => (
          <div key={type} className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: v.color }}></div>
              <span>{v.label}</span>
            </div>
            <div className="text-forest-medium">
              {v.count} • {v.area.toFixed(1)} ha
            </div>
          </div>
        ))}
        {Object.keys(byType).length === 0 && (
          <div className="text-forest-medium">No terrain detected</div>
        )}
      </div>
    </div>
  );
};

// Animated recenter component: zooms out then in to highlight the selected location
const AnimatedRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    try {
      const initialZoom = Math.max((map as any)?.getMinZoom?.() ?? 3, 6);
      map.flyTo(center, initialZoom, { duration: 0.8 });
      const timeoutId = window.setTimeout(() => {
        map.flyTo(center, 13, { duration: 0.8 });
      }, 900);
      return () => clearTimeout(timeoutId);
    } catch {}
  }, [center, map]);
  return null;
};

// Coordinates display
const CoordinatesDisplay: React.FC<{ coordinates: [number, number] }> = ({ coordinates }) => {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
      <div className="text-xs text-forest-deep">
        <div>Lat: {coordinates[0].toFixed(4)}°N</div>
        <div>Lng: {coordinates[1].toFixed(4)}°E</div>
      </div>
    </div>
  );
};

export const RealTimeMap: React.FC<RealTimeMapProps> = ({ 
  selectedVillage, 
  terrainData, 
  onTerrainSelect,
  externalLayers,
  vectorizedFeatures
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.2961, 83.4906]);
  const [mapZoom, setMapZoom] = useState(12);
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'terrain' | 'hybrid'>('satellite');
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainData | null>(null);
  
  // Village coordinates mapping
  const villageCoordinates = {
    'village-001': [20.2961, 83.4906], // Kalahandi
    'village-002': [19.1700, 83.4200], // Rayagada
    'village-003': [18.8100, 82.7100], // Koraput
    'village-004': [18.3437, 81.8825], // Malkangiri
    'village-005': [19.2279, 82.5480], // Nabarangpur
    'village-006': [18.8154, 84.1857], // Gajapati
    'village-007': [20.4776, 84.2366], // Kandhamal
    'village-008': [19.6641, 78.5320], // Telangana - Adilabad
    'village-009': [17.2473, 80.1514], // Telangana - Khammam
    'village-010': [22.5979, 80.3714], // MP - Mandla
    'village-011': [21.9020, 77.8969], // MP - Betul
    'village-012': [23.8360, 91.9099], // Tripura - Dhalai
    'village-013': [24.3216, 92.1640], // Tripura - North Tripura
  } as Record<string, [number, number]>;
  
  // Village display names mapping (used in popup only)
  const villageNames = {
    'village-001': 'Kalahandi',
    'village-002': 'Rayagada',
    'village-003': 'Koraput',
    'village-004': 'Malkangiri',
    'village-005': 'Nabarangpur',
    'village-006': 'Gajapati',
    'village-007': 'Kandhamal',
    'village-008': 'Adilabad',
    'village-009': 'Khammam',
    'village-010': 'Mandla',
    'village-011': 'Betul',
    'village-012': 'Dhalai',
    'village-013': 'North Tripura'
  } as Record<string, string>;
  
  useEffect(() => {
    const coords = villageCoordinates[selectedVillage as keyof typeof villageCoordinates];
    if (coords) {
      setMapCenter(coords);
    }
  }, [selectedVillage]);
  
  const getTerrainColor = (type: string) => {
    const colors = {
      forest: '#16a34a',
      agricultural: '#eab308',
      water: '#3b82f6',
      mountain: '#6b7280',
      homestead: '#f97316',
      infrastructure: '#8b5cf6'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  const getDashArray = (type: string) => {
    switch (type) {
      case 'agricultural': return '4 3';
      case 'water': return '1 6';
      case 'mountain': return '6 4';
      case 'homestead': return '2 2';
      default: return undefined;
    }
  };
  
  const handleTerrainClick = (terrain: TerrainData) => {
    setSelectedTerrain(terrain);
    onTerrainSelect?.(terrain);
  };
  
  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting map data...');
  };
  
  const handleRefresh = () => {
    // Refresh data functionality would be implemented here
    console.log('Refreshing map data...');
  };
  
  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border-2 border-forest-sage/30">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <AnimatedRecenter center={mapCenter} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked={activeLayer === 'satellite'} name="Satellite View">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            {/* Optional Mapbox Satellite if token is provided via env */}
            {import.meta && (import.meta as any).env && (import.meta as any).env.VITE_MAPBOX_TOKEN && (
              <TileLayer
                attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${(import.meta as any).env.VITE_MAPBOX_TOKEN}`}
                tileSize={512}
                zoomOffset={-1}
                opacity={0.85}
              />
            )}
        </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer checked={activeLayer === 'terrain'} name="Terrain View">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer checked={activeLayer === 'hybrid'} name="Hybrid View">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.3}
            />
            {/* Optional OpenWeather layers if token provided */}
            {import.meta && (import.meta as any).env && (import.meta as any).env.VITE_OPENWEATHER_KEY && (
              <>
                <TileLayer
                  attribution='Weather &copy; <a href="https://openweathermap.org/">OpenWeather</a>'
                  url={`https://tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid=${(import.meta as any).env.VITE_OPENWEATHER_KEY}`}
                  opacity={0.5}
                />
                <TileLayer
                  attribution='Weather &copy; <a href="https://openweathermap.org/">OpenWeather</a>'
                  url={`https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=${(import.meta as any).env.VITE_OPENWEATHER_KEY}`}
                  opacity={0.4}
                />
              </>
            )}
        </LayersControl.BaseLayer>

        {/* External Data Overlays */}
        {externalLayers?.forest && (
          <LayersControl.Overlay checked name="Forest Data (FSI)">
            <>
              {externalLayers.forest.map(feature => (
                <Polygon
                  key={feature.id}
                  positions={feature.geometry.coordinates[0].map((c: [number, number]) => [c[1], c[0]]) as any}
                  color="#166534"
                  fillColor="#16a34a"
                  fillOpacity={0.25}
                >
                  <Tooltip sticky>
                    <div className="text-xs">
                      <div className="font-semibold">{feature.name}</div>
                      <div>Canopy: {feature.properties.canopy_density || 'n/a'}</div>
                      <div>Status: {feature.properties.protection_status || 'n/a'}</div>
                    </div>
                  </Tooltip>
                </Polygon>
              ))}
            </>
          </LayersControl.Overlay>
        )}

        {externalLayers?.groundwater && (
          <LayersControl.Overlay name="Groundwater (CGWB)">
            <>
              {externalLayers.groundwater.map(feature => (
                <Polygon
                  key={feature.id}
                  positions={feature.geometry.coordinates[0].map((c: [number, number]) => [c[1], c[0]]) as any}
                  color="#1e3a8a"
                  fillColor="#60a5fa"
                  fillOpacity={0.2}
                >
                  <Tooltip sticky>
                    <div className="text-xs">
                      <div className="font-semibold">{feature.name}</div>
                      <div>Water Table: {feature.properties.water_table_depth_m ?? 'n/a'} m</div>
                      <div>Recharge: {feature.properties.recharge_potential || 'n/a'}</div>
                    </div>
                  </Tooltip>
                </Polygon>
              ))}
            </>
          </LayersControl.Overlay>
        )}

        {externalLayers?.infrastructure && (
          <LayersControl.Overlay name="Infrastructure (Gati Shakti)">
            <>
              {externalLayers.infrastructure.map(feature => (
                feature.geometry.type === 'LineString' ? (
                  <Polyline
                    key={feature.id}
                    positions={feature.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]) as any}
                    color="#8b5cf6"
                    weight={4}
                  >
                    <Tooltip sticky>
                      <div className="text-xs">
                        <div className="font-semibold">{feature.name}</div>
                        <div>Status: {feature.properties.status || 'n/a'}</div>
                        <div>Width: {feature.properties.width_m ? `${feature.properties.width_m} m` : 'n/a'}</div>
                      </div>
                    </Tooltip>
                  </Polyline>
                ) : null
              ))}
            </>
          </LayersControl.Overlay>
        )}

        {/* Vectorized detections overlay */}
        {vectorizedFeatures && vectorizedFeatures.features.length > 0 && (
          <LayersControl.Overlay checked name="Detected Assets (AI)">
            <>
              {vectorizedFeatures.features.map((f: any) => (
                f.geometry?.type === 'Polygon' ? (
                  <Polygon
                    key={f.id || Math.random()}
                    positions={f.geometry.coordinates[0].map((c: [number, number]) => [c[1], c[0]]) as any}
                    color="#0ea5e9"
                    fillColor="#38bdf8"
                    fillOpacity={0.25}
                  >
                    <Tooltip sticky>
                      <div className="text-xs">
                        <div className="font-semibold capitalize">{(f.properties?.asset_type || 'asset').replace('_', ' ')}</div>
                        {typeof f.properties?.area_sqm === 'number' && (
                          <div>Area: {f.properties.area_sqm.toFixed(0)} sqm</div>
                        )}
                        {typeof f.properties?.confidence === 'number' && (
                          <div>Confidence: {(f.properties.confidence * 100).toFixed(1)}%</div>
                        )}
                      </div>
                    </Tooltip>
                  </Polygon>
                ) : null
              ))}
            </>
          </LayersControl.Overlay>
        )}
        </LayersControl>
        
        {/* Terrain polygons */}
        {terrainData.map((terrain) => (
          <Polygon
            key={terrain.id}
            positions={terrain.coordinates}
            color={getTerrainColor(terrain.type)}
            fillColor={getTerrainColor(terrain.type)}
            fillOpacity={selectedTerrain?.id === terrain.id ? 0.7 : 0.5}
            weight={selectedTerrain?.id === terrain.id ? 3 : 2}
            pathOptions={{ dashArray: getDashArray(terrain.type) as any }}
            eventHandlers={{
              click: () => handleTerrainClick(terrain)
              ,
              mouseover: (e) => {
                (e.target as any).bringToFront();
              }
            }}
          >
            <Tooltip sticky>
              <div className="text-xs">
                <div className="font-semibold">{terrain.name}</div>
                <div>Type: {terrain.type}</div>
                <div>Area: {terrain.area.toFixed(1)} ha</div>
                <div>Confidence: {(terrain.confidence * 100).toFixed(1)}%</div>
              </div>
            </Tooltip>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-forest-deep capitalize">{terrain.name}</h3>
                <p className="text-sm text-forest-medium">Type: {terrain.type}</p>
                <p className="text-sm text-forest-medium">Area: {terrain.area.toFixed(2)} hectares</p>
                <p className="text-sm text-forest-medium">Confidence: {(terrain.confidence * 100).toFixed(1)}%</p>
                {terrain.elevation && (
                  <p className="text-sm text-forest-medium">Elevation: {terrain.elevation}m</p>
                )}
                {terrain.vegetationIndex && (
                  <p className="text-sm text-forest-medium">Vegetation Index: {terrain.vegetationIndex.toFixed(3)}</p>
                )}
                {terrain.soilMoisture && (
                  <p className="text-sm text-forest-medium">Soil Moisture: {terrain.soilMoisture.toFixed(3)}</p>
                )}
                <p className="text-xs text-forest-medium mt-2">
                  Last updated: {new Date(terrain.lastUpdated).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Polygon>
        ))}
        
        {/* Village center marker */}
        <Marker position={mapCenter}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-forest-deep">
                {villageNames[selectedVillage] || 'Village'}
              </h3>
              <p className="text-sm text-forest-medium">Village Center</p>
              <p className="text-xs text-forest-medium">
                Coordinates: {mapCenter[0].toFixed(4)}°N, {mapCenter[1].toFixed(4)}°E
              </p>
            </div>
          </Popup>
        </Marker>
        
        <MapControls onExport={handleExport} onRefresh={handleRefresh} />
        <RealTimeIndicator />
        <TerrainLegend data={terrainData} />
        <CoordinatesDisplay coordinates={mapCenter} />
      </MapContainer>
      
      {/* Map info overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center space-x-2 text-sm text-forest-deep">
          <Satellite className="h-4 w-4" />
          <span>Real-time Satellite View</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
