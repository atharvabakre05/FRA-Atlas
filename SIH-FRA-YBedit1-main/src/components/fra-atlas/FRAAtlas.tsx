import React, { useEffect, useRef, useState, memo } from 'react';
import { Download, Satellite, Layers, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { listGeojsonWithStatus } from '../../services/supabaseGeoService';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mockFRAData = [
  {
    id: 'FRA-OD-001',
    claimId: 'IFR/2024/OD/KAL/001',
    type: 'IFR',
    status: 'granted',
    applicant: 'Ramesh Gond',
    village: 'Poduchunapadar',
    block: 'Kalahandi',
    district: 'Kalahandi',
    state: 'Odisha',
    tribalGroup: 'Gond',
    areaHectares: 2.5,
    coordinates: { lat: 19.9067, lng: 83.1636 },
    grantDate: '2024-01-15',
    documentUrl: 'https://example.com/documents/ramesh_gond_claim.pdf'
  },
  {
    id: 'FRA-OD-002',
    claimId: 'CFR/2024/OD/KAL/002',
    type: 'CFR',
    status: 'pending',
    applicant: 'Poduchunapadar Tribal Committee',
    village: 'Poduchunapadar',
    block: 'Kalahandi',
    district: 'Kalahandi',
    state: 'Odisha',
    tribalGroup: 'Kandha',
    areaHectares: 45.8,
    coordinates: { lat: 19.9067, lng: 83.1636 },
    grantDate: null,
    documentUrl: 'https://example.com/documents/tribal_committee_claim.pdf'
  },
  {
    id: 'FRA-OD-003',
    claimId: 'CR/2024/OD/KAL/003',
    type: 'CR',
    status: 'granted',
    applicant: 'Poduchunapadar Community',
    village: 'Poduchunapadar',
    block: 'Kalahandi',
    district: 'Kalahandi',
    state: 'Odisha',
    tribalGroup: 'Gond',
    areaHectares: 12.3,
    coordinates: { lat: 19.9067, lng: 83.1636 },
    grantDate: '2024-01-10',
    documentUrl: 'https://example.com/documents/community_rights_claim.pdf'
  },
  {
    id: 'FRA-OD-004',
    claimId: 'IFR/2024/OD/KAL/004',
    type: 'IFR',
    status: 'rejected',
    applicant: 'Lakshman Gond',
    village: 'Poduchunapadar',
    block: 'Kalahandi',
    district: 'Kalahandi',
    state: 'Odisha',
    tribalGroup: 'Gond',
    areaHectares: 1.8,
    coordinates: { lat: 19.9067, lng: 83.1636 },
    grantDate: null,
    documentUrl: 'https://example.com/documents/lakshman_gond_claim.pdf'
  },
  {
    id: 'FRA-OD-005',
    claimId: 'IFR/2024/OD/KAL/005',
    type: 'IFR',
    status: 'granted',
    applicant: 'Sita Gond',
    village: 'Poduchunapadar',
    block: 'Kalahandi',
    district: 'Kalahandi',
    state: 'Odisha',
    tribalGroup: 'Gond',
    areaHectares: 3.2,
    coordinates: { lat: 19.9067, lng: 83.1636 },
    grantDate: '2024-02-01',
    documentUrl: 'https://example.com/documents/sita_gond_claim.pdf'
  }
];

// Simple Map Controls Component
const MapControls: React.FC<{ 
  mapRef: React.MutableRefObject<L.Map | null>;
  isSatelliteView: boolean;
  onToggleSatellite: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}> = memo(({ mapRef, isSatelliteView, onToggleSatellite, onResetView, onToggleFullscreen, isFullscreen }) => {
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col space-y-2">
      {/* Satellite Toggle */}
      <button
        onClick={onToggleSatellite}
        className={`p-2 rounded border transition-colors ${
          isSatelliteView 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        title={isSatelliteView ? 'Switch to Street View' : 'Switch to Satellite View'}
      >
        <Satellite className="h-4 w-4" />
      </button>

      {/* Zoom Controls */}
      <div className="flex flex-col space-y-1">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* Reset View */}
      <button
        onClick={onResetView}
        className="p-2 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50"
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={onToggleFullscreen}
        className="p-2 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
});

export const FRAAtlas: React.FC = memo(() => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    ifr: true,
    cr: true,
    cfr: true,
    forestCover: true,
    waterBodies: true,
    farmland: true
  });

  const [geoLayers, setGeoLayers] = useState<{ claim_id: string; status: 'pending' | 'approved' | 'rejected'; geojson: any; applicant_name?: string | null; area?: number | null }[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const [visibleGeoClaims, setVisibleGeoClaims] = useState<{ claim_id: string; status: 'pending' | 'approved' | 'rejected'; geojson: any; applicant_name?: string | null; area?: number | null }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await listGeojsonWithStatus();
        setGeoLayers(rows);
      } catch {}
    })();
  }, []);

  // Center map around Poduchunapadar, Odisha
  const defaultCenter: [number, number] = [19.427051848890738, 83.27881023459298];
  const defaultZoom = 14;

  // Fit bounds to all geo layers when available
  useEffect(() => {
    if (!mapRef.current || geoLayers.length === 0) return;
    try {
      const features: any[] = [];
      geoLayers.forEach(layer => {
        if (layer.geojson?.type === 'FeatureCollection') {
          features.push(...layer.geojson.features);
        } else if (layer.geojson?.type === 'Feature') {
          features.push(layer.geojson);
        }
      });
      if (features.length > 0) {
        const fc = { type: 'FeatureCollection', features } as any;
        const bounds = L.geoJSON(fc as any).getBounds();
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds.pad(0.1));
        }
      }
    } catch {}
  }, [geoLayers]);

  // Derive visible claims on map based on current bounds and selectedStatus filter
  const updateVisibleClaims = () => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    const withinView = geoLayers.filter(layer => {
      try {
        const layerBounds = L.geoJSON(layer.geojson as any).getBounds();
        return bounds.intersects(layerBounds);
      } catch {
        return false;
      }
    }).filter(layer => {
      if (selectedStatus === 'all') return true;
      if (selectedStatus === 'granted') return layer.status === 'approved';
      return layer.status === (selectedStatus as any);
    });
    setVisibleGeoClaims(withinView);
  };

  useEffect(() => {
    if (!mapRef.current) return;
    updateVisibleClaims();
    const map = mapRef.current;
    const handler = () => updateVisibleClaims();
    map.on('moveend', handler);
    return () => {
      map.off('moveend', handler);
    };
  }, [geoLayers, selectedStatus]);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const toggleSatelliteView = () => {
    setIsSatelliteView(!isSatelliteView);
  };

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.setView(defaultCenter, defaultZoom);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Get the appropriate tile layer based on view mode
  const getTileLayer = () => {
    if (isSatelliteView) {
      return (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />
      );
    } else {
      return (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      );
    }
  };

  const handleDownloadData = () => {
    const dataToDownload = visibleGeoClaims.map(claim => ({
      'Claim ID': claim.claim_id,
      'Applicant Name': claim.applicant_name || 'N/A',
      'Status': claim.status,
      'Area (Hectares)': claim.area ?? 'N/A'
    }));

    const csvContent = [
      Object.keys(dataToDownload[0]).join(','),
      ...dataToDownload.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'fra_claims_visible_on_map.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : 'p-4'} relative`}>
      <div className="decor-forest"></div>
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">FRA Atlas</h1>
              <div className="mt-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse"></div>
                <span className="text-gray-600 text-sm">Poduchunapadar, Kalahandi, Odisha</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1.5 rounded-full text-xs bg-gray-100 text-gray-700 border">Live Map</div>
              <button 
                onClick={handleDownloadData}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Simple Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-forest-gradient rounded-lg">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-forest-primary focus:border-forest-primary"
            >
              <option value="all">All Types</option>
              <option value="IFR">Individual Forest Rights</option>
              <option value="CR">Community Rights</option>
              <option value="CFR">Community Forest Resource Rights</option>
            </select>
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-forest-primary focus:border-forest-primary"
            >
              <option value="all">All Status</option>
              <option value="granted">Granted</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            </div>
          </div>
        </div>
        
      {/* Map Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative z-0">
        <div className="relative h-[600px]">
          <MapContainer 
            center={defaultCenter} 
            zoom={defaultZoom} 
            ref={(map: L.Map) => { mapRef.current = map; }} 
            className="w-full h-full"
            style={{ zIndex: 1 }}
          >
            {getTileLayer()}
            {geoLayers.map(layer => (
              <GeoJSON 
                key={layer.claim_id} 
                data={layer.geojson} 
                style={() => ({
                  color: layer.status === 'approved' ? '#16a34a' : layer.status === 'rejected' ? '#dc2626' : '#ca8a04',
                  weight: 2,
                  fillOpacity: 0.2,
                })}
                onEachFeature={(_, leafletLayer) => {
                  let hoverTimer: any;
                  const status = layer.status;
                  const applicant = layer.applicant_name ?? 'Unknown claimant';
                  const area = layer.area != null ? `${layer.area}` : 'N/A';
                  const tooltipHtml = `
                    <div style="font-family: system-ui; font-size: 12px;">
                      <div style="font-weight: 600; margin-bottom: 4px;">Claim Info</div>
                      <div><b>Status:</b> ${status}</div>
                      <div><b>Area:</b> ${area}</div>
                      <div><b>Claimant:</b> ${applicant}</div>
                    </div>
                  `;
                  leafletLayer.on('mouseover', (e: any) => {
                    hoverTimer = setTimeout(() => {
                      leafletLayer.bindTooltip(tooltipHtml, { sticky: true, direction: 'top', opacity: 0.95 }).openTooltip(e.latlng);
                    }, 2000);
                  });
                  leafletLayer.on('mouseout', () => {
                    if (hoverTimer) {
                      clearTimeout(hoverTimer);
                      hoverTimer = null;
                    }
                    if ((leafletLayer as any).closeTooltip) {
                      (leafletLayer as any).closeTooltip();
                    }
                  });
                  leafletLayer.on('click', (e: any) => {
                    leafletLayer.bindTooltip(tooltipHtml, { sticky: true, direction: 'top', opacity: 0.95 }).openTooltip(e.latlng);
                  });
                }}
              />
            ))}
          </MapContainer>

          {/* Map Controls */}
          <MapControls
            mapRef={mapRef}
            isSatelliteView={isSatelliteView}
            onToggleSatellite={toggleSatelliteView}
            onResetView={resetView}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />

          {/* Layer Toggle Panel */}
          <div className="absolute top-4 left-4 z-50 bg-white border border-gray-200 rounded p-3 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Layers className="h-4 w-4 text-forest-primary" />
              <span className="text-sm font-medium text-gray-800">Layers</span>
  </div>
            <div className="space-y-1">
              {Object.entries(activeLayers).map(([layer, isActive]) => (
                <label key={layer} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleLayer(layer as keyof typeof activeLayers)}
                    className="w-3 h-3 text-forest-primary border-gray-300 rounded focus:ring-forest-primary"
                  />
                  <span className="text-xs text-gray-600 capitalize">{layer.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
  </div>
        </div>

          {/* Statistics Panel */}
          <div className="absolute bottom-4 right-4 z-50 bg-white border border-gray-200 rounded p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse"></div>
              <span>Statistics</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-gray-900">{visibleGeoClaims.length}</div>
                <div className="text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-forest-primary">{visibleGeoClaims.filter(c => c.status === 'approved').length}</div>
                <div className="text-gray-500">Granted</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-forest-primary">{visibleGeoClaims.filter(c => c.status === 'pending').length}</div>
                <div className="text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-forest-primary">{visibleGeoClaims.filter(c => c.status === 'rejected').length}</div>
                <div className="text-gray-500">Rejected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Data - only claims currently visible on map */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Claims Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Claim ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Area (Ha)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleGeoClaims.map((claim) => (
                <tr key={claim.claim_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{claim.claim_id}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{claim.applicant_name ?? 'Unknown'}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`forest-badge ${
                      claim.status === 'approved' ? 'forest-badge-success' :
                      claim.status === 'pending' ? 'forest-badge-warning' :
                      'forest-badge-error'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{claim.area ?? 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-forest-primary">
                    <button className="underline" onClick={() => {
                      try {
                        const bounds = L.geoJSON(claim.geojson as any).getBounds();
                        if (mapRef.current && bounds.isValid()) {
                          mapRef.current.fitBounds(bounds.pad(0.1));
                        }
                      } catch {}
                    }}>Zoom to claim</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
});