import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Satellite, 
  Map, 
  BarChart3, 
  Layers, 
  Download, 
  RefreshCw, 
  Eye, 
  TreePine,
  Droplets,
  Home,
  Route,
  Mountain,
  TrendingUp,
  Target,
  Zap,
  Leaf,
  Crop,
  XCircle
} from 'lucide-react';
import { aiAssetMappingService } from '../../services/aiAssetMappingService';
import { ExternalLayerFeature } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseClaimsService } from '../../services/supabaseClaimsService';
import { AssetMapping, SatelliteImageData, AssetAnalysisResult } from '../../types';
import { RealTimeMap } from './RealTimeMap';

export const AIAssetMapping: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'analysis' | 'overview' | 'satellite'>('analysis');
  const [loading, setLoading] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<string>('village-001');
  const [selectedAssetType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [liveAnalysis, setLiveAnalysis] = useState<boolean>(false);
  const [liveTimerId, setLiveTimerId] = useState<number | null>(null);
  
  // Data states
  const [satelliteImages, setSatelliteImages] = useState<SatelliteImageData[]>([]);
  const [assetMappings, setAssetMappings] = useState<AssetMapping[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AssetAnalysisResult | null>(null);
  const [terrainData, setTerrainData] = useState<any[]>([]);
  const [externalLayers, setExternalLayers] = useState<{ forest: ExternalLayerFeature[]; groundwater: ExternalLayerFeature[]; infrastructure: ExternalLayerFeature[] }>({ forest: [], groundwater: [], infrastructure: [] });
  const [vectorized, setVectorized] = useState<any | null>(null);
  const [changes, setChanges] = useState<any | null>(null);

  // Village registry
  const villages: { id: string; label: string; name: string; district: string }[] = [
    { id: 'village-001', label: 'Village 001 - Kalahandi', name: 'Kalahandi', district: 'Kalahandi' },
    { id: 'village-002', label: 'Village 002 - Rayagada', name: 'Rayagada', district: 'Rayagada' },
    { id: 'village-003', label: 'Village 003 - Koraput', name: 'Koraput', district: 'Koraput' },
    { id: 'village-004', label: 'Village 004 - Malkangiri', name: 'Malkangiri', district: 'Malkangiri' },
    { id: 'village-005', label: 'Village 005 - Nabarangpur', name: 'Nabarangpur', district: 'Nabarangpur' },
    { id: 'village-006', label: 'Village 006 - Gajapati', name: 'Gajapati', district: 'Gajapati' },
    { id: 'village-007', label: 'Village 007 - Kandhamal', name: 'Kandhamal', district: 'Kandhamal' },
    { id: 'village-008', label: 'Village 008 - Telangana - Adilabad', name: 'Adilabad', district: 'Adilabad' },
    { id: 'village-009', label: 'Village 009 - Telangana - Khammam', name: 'Khammam', district: 'Khammam' },
    { id: 'village-010', label: 'Village 010 - MP - Mandla', name: 'Mandla', district: 'Mandla' },
    { id: 'village-011', label: 'Village 011 - MP - Betul', name: 'Betul', district: 'Betul' },
    { id: 'village-012', label: 'Village 012 - Tripura - Dhalai', name: 'Dhalai', district: 'Dhalai' },
    { id: 'village-013', label: 'Village 013 - Tripura - North Tripura', name: 'North Tripura', district: 'North Tripura' },
  ];
  
  // Modal states
  const [selectedAsset, setSelectedAsset] = useState<AssetMapping | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analysis') {
      loadAnalysisResult();
    }
    // Update terrain data when village changes
    const sampleTerrainData = generateSampleTerrainData(selectedVillage);
    setTerrainData(sampleTerrainData);
    // Load external layers (global/static for demo)
    (async () => {
      const [forest, groundwater, infrastructure] = await Promise.all([
        aiAssetMappingService.getExternalLayers('forest'),
        aiAssetMappingService.getExternalLayers('groundwater'),
        aiAssetMappingService.getExternalLayers('infrastructure')
      ]);
      setExternalLayers({ forest, groundwater, infrastructure });
    })();
  }, [activeTab, selectedVillage]);

  // Refresh satellite images and asset mappings whenever village changes
  useEffect(() => {
    const refreshVillageData = async () => {
      const [imgs, assets] = await Promise.all([
        aiAssetMappingService.getSatelliteImages(selectedVillage),
        aiAssetMappingService.getAssetMappings(selectedVillage, selectedAssetType === 'all' ? undefined : selectedAssetType)
      ]);
      setSatelliteImages(imgs);
      setAssetMappings(assets);
    };
    refreshVillageData();
  }, [selectedVillage]);

  // Auto-select village from latest user claim
  useEffect(() => {
    const pickVillageFromLatestClaim = async () => {
      try {
        if (!user?.id) return;
        const rows = await supabaseClaimsService.listAll();
        const userRows = rows.filter(r => r.user_id === user.id);
        if (userRows.length === 0) return;
        userRows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const latest = userRows[0];
        const found = villages.find(v => v.name.toLowerCase() === (latest.village || '').toLowerCase() || v.label.toLowerCase().includes((latest.village || '').toLowerCase()));
        if (found) {
          setSelectedVillage(found.id);
        }
      } catch {}
    };
    pickVillageFromLatestClaim();
  }, [user?.id]);

  // Live analysis refresh
  useEffect(() => {
    if (liveTimerId) {
      clearInterval(liveTimerId);
      setLiveTimerId(null);
    }
    if (liveAnalysis && activeTab === 'analysis') {
      const id = window.setInterval(() => {
        // Refresh server-side analysis
        loadAnalysisResult();
        // Refresh terrain detection in real time (simulated ML pass)
        setTerrainData(generateSampleTerrainData(selectedVillage));
        // Refresh satellite images and assets to keep Overview/Satellite tabs in sync
        (async () => {
          const [imgs, assets] = await Promise.all([
            aiAssetMappingService.getSatelliteImages(selectedVillage),
            aiAssetMappingService.getAssetMappings(selectedVillage, selectedAssetType === 'all' ? undefined : selectedAssetType)
          ]);
          setSatelliteImages(imgs);
          setAssetMappings(assets);
        })();
      }, 10000);
      setLiveTimerId(id);
    }
    return () => {
      if (liveTimerId) clearInterval(liveTimerId);
    };
  }, [liveAnalysis, activeTab, selectedVillage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [imagesData, mappingsData] = await Promise.all([
        aiAssetMappingService.getSatelliteImages(),
        aiAssetMappingService.getAssetMappings()
      ]);
      
      setSatelliteImages(imagesData);
      setAssetMappings(mappingsData);
      
      // Generate sample terrain data for the map
      const sampleTerrainData = generateSampleTerrainData(selectedVillage);
      setTerrainData(sampleTerrainData);
      setVectorized(aiAssetMappingService.getVectorizedDetections(selectedVillage));
    } catch (error) {
      console.error('Failed to load AI Asset Mapping data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateSampleTerrainData = (villageId: string) => {
    // Base centers for villages (align with map centers)
    const baseCoords: Record<string, [number, number]> = {
      'village-001': [20.2961, 83.4906], // Kalahandi
      'village-002': [19.1700, 83.4200], // Rayagada
      'village-003': [18.8100, 82.7100], // Koraput
      'village-004': [18.3437, 81.8825], // Malkangiri
      'village-005': [19.2279, 82.5480], // Nabarangpur
      'village-006': [18.8154, 84.1857], // Gajapati
      'village-007': [20.4776, 84.2366], // Kandhamal
      'village-008': [19.6641, 78.5320], // Adilabad
      'village-009': [17.2473, 80.1514], // Khammam
      'village-010': [22.5979, 80.3714], // Mandla
      'village-011': [21.9020, 77.8969], // Betul
      'village-012': [23.8360, 91.9099], // Dhalai
      'village-013': [24.3216, 92.1640], // North Tripura
    };

    const [lat, lng] = baseCoords[villageId] || [20.2961, 83.4906];

    // Pseudo-ML terrain classifier seeded by village id
    const seed = parseInt(villageId.replace(/\D/g, ''), 10) || 1;
    const rand = (n: number) => ((Math.sin(seed * 9301 + n * 49297) * 233280) % 1 + 1) % 1;

    // Terrain composition ratios
    const forestRatio = 0.3 + 0.4 * rand(1);
    const agriRatio = 0.2 + 0.3 * rand(2);
    const waterRatio = 0.03 + 0.07 * rand(3);
    const homesteadRatio = 0.05 + 0.1 * rand(4);
    const mountainRatio = 0.1 + 0.2 * rand(5);
    const totalVillageAreaHectares = 500; // 5 km^2 sample extent

    const forestArea = totalVillageAreaHectares * forestRatio;
    const agriArea = totalVillageAreaHectares * agriRatio;
    const waterArea = totalVillageAreaHectares * waterRatio;
    const homeArea = totalVillageAreaHectares * homesteadRatio;
    const mountainArea = totalVillageAreaHectares * mountainRatio;

    const jitter = (i: number, j: number): [number, number] => [lat + i * 0.01 + (rand(10 + i + j) - 0.5) * 0.002, lng + j * 0.01 + (rand(20 + i + j) - 0.5) * 0.002];

    const jaggedPolygon = (center: [number, number], radius: number, points: number, noise: number): [number, number][] => {
      const [clat, clng] = center;
      const coords: [number, number][] = [];
      for (let k = 0; k < points; k++) {
        const angle = (k / points) * Math.PI * 2;
        const r = radius * (1 + (rand(100 + k) - 0.5) * noise);
        const dlat = (r * Math.cos(angle)) * 0.01;
        const dlng = (r * Math.sin(angle)) * 0.01;
        coords.push([clat + dlat, clng + dlng]);
      }
      coords.push(coords[0]);
      return coords;
    };

    const mk = [] as any[];

    if (forestArea > 1) mk.push({
      id: `${villageId}-forest-ml`,
      type: 'forest',
      name: 'Dense Forest Cluster',
      coordinates: jaggedPolygon(jitter(1, -1), 1.4, 8, 0.4),
      area: parseFloat(forestArea.toFixed(1)),
      confidence: 0.8 + 0.15 * rand(6),
      lastUpdated: new Date().toISOString(),
      elevation: Math.round(600 + 600 * rand(7)),
      vegetationIndex: parseFloat((0.6 + 0.35 * rand(8)).toFixed(3)),
      soilMoisture: parseFloat((0.4 + 0.4 * rand(9)).toFixed(3))
    });

    if (agriArea > 1) mk.push({
      id: `${villageId}-agri-ml`,
      type: 'agricultural',
      name: 'Agricultural Fields',
      coordinates: jaggedPolygon(jitter(-0.5, -1.5), 1.0, 6, 0.25),
      area: parseFloat(agriArea.toFixed(1)),
      confidence: 0.75 + 0.2 * rand(11),
      lastUpdated: new Date().toISOString(),
      elevation: Math.round(300 + 200 * rand(12)),
      vegetationIndex: parseFloat((0.4 + 0.3 * rand(13)).toFixed(3)),
      soilMoisture: parseFloat((0.6 + 0.3 * rand(14)).toFixed(3))
    });

    if (waterArea > 0.1) mk.push({
      id: `${villageId}-water-ml`,
      type: 'water',
      name: 'Water Body',
      coordinates: jaggedPolygon(jitter(-0.8, 0.8), 0.6, 10, 0.2),
      area: parseFloat(waterArea.toFixed(1)),
      confidence: 0.9 + 0.08 * rand(15),
      lastUpdated: new Date().toISOString(),
      elevation: Math.round(200 + 100 * rand(16)),
      vegetationIndex: parseFloat((0.1 + 0.1 * rand(17)).toFixed(3)),
      soilMoisture: parseFloat((0.9 + 0.1 * rand(18)).toFixed(3))
    });

    if (homeArea > 0.5) mk.push({
      id: `${villageId}-home-ml`,
      type: 'homestead',
      name: 'Homestead Zone',
      coordinates: jaggedPolygon(jitter(-1.2, -0.6), 0.8, 5, 0.15),
      area: parseFloat(homeArea.toFixed(1)),
      confidence: 0.7 + 0.2 * rand(19),
      lastUpdated: new Date().toISOString(),
      elevation: Math.round(350 + 150 * rand(20)),
      vegetationIndex: parseFloat((0.25 + 0.2 * rand(21)).toFixed(3)),
      soilMoisture: parseFloat((0.3 + 0.2 * rand(22)).toFixed(3))
    });

    if (mountainArea > 0.5) mk.push({
      id: `${villageId}-mountain-ml`,
      type: 'mountain',
      name: 'Hilly Terrain',
      coordinates: jaggedPolygon(jitter(1.2, 0.5), 1.3, 7, 0.35),
      area: parseFloat(mountainArea.toFixed(1)),
      confidence: 0.78 + 0.18 * rand(23),
      lastUpdated: new Date().toISOString(),
      elevation: Math.round(900 + 600 * rand(24)),
      vegetationIndex: parseFloat((0.3 + 0.25 * rand(25)).toFixed(3)),
      soilMoisture: parseFloat((0.25 + 0.2 * rand(26)).toFixed(3))
    });

    return mk;
  };

  const loadAnalysisResult = async () => {
    try {
      const result = await aiAssetMappingService.analyzeVillageAssets(selectedVillage);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to load analysis result:', error);
    }
  };

  const filteredAssets = assetMappings.filter(asset => {
    const matchesVillage = selectedVillage === 'all' || asset.village_id === selectedVillage;
    const matchesType = selectedAssetType === 'all' || asset.asset_type === selectedAssetType;
    const matchesSearch = !searchTerm || 
      asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.land_use_classification?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesVillage && matchesType && matchesSearch;
  });

  const getAssetIcon = (assetType: string) => {
    switch (assetType) {
      case 'agricultural_land': return <Crop className="h-5 w-5" />;
      case 'forest_cover': return <TreePine className="h-5 w-5" />;
      case 'water_body': return <Droplets className="h-5 w-5" />;
      case 'homestead': return <Home className="h-5 w-5" />;
      case 'infrastructure': return <Route className="h-5 w-5" />;
      case 'mineral_deposit': return <Mountain className="h-5 w-5" />;
      default: return <Map className="h-5 w-5" />;
    }
  };

  const getAssetColor = (assetType: string) => {
    switch (assetType) {
      case 'agricultural_land': return 'text-green-600 bg-green-50';
      case 'forest_cover': return 'text-green-700 bg-green-100';
      case 'water_body': return 'text-blue-600 bg-blue-50';
      case 'homestead': return 'text-orange-600 bg-orange-50';
      case 'infrastructure': return 'text-gray-600 bg-gray-50';
      case 'mineral_deposit': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // status icon utility not used in current UI

  const formatArea = (areaSqm: number) => {
    if (areaSqm >= 10000) {
      return `${(areaSqm / 10000).toFixed(1)} hectares`;
    }
    return `${areaSqm.toFixed(0)} sqm`;
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const openAssetModal = (asset: AssetMapping) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="forest-card">
          <div className="flex items-center justify-center py-12">
            <div className="forest-spinner"></div>
            <span className="ml-3 text-forest-medium">Loading AI Asset Mapping...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-forest-fade-in relative">
      <div className="decor-forest"></div>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">AI Asset Mapping</h1>
            <p className="text-gray-500 text-sm">Satellite-based asset detection and analysis using Computer Vision & ML</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="forest-chip"><Brain className="h-4 w-4" /> AI-Powered</div>
            <button
              onClick={loadData}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm relative z-10">
        <div className="flex space-x-1 bg-gray-50 p-1 rounded-md">
          {[
            { id: 'analysis', label: 'Village Analysis', icon: Target },
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'satellite', label: 'Satellite Data', icon: Satellite }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-forest-primary shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-forest-primary hover:bg-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 relative z-10">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
              <div className="text-2xl font-semibold text-gray-900">{satelliteImages.length}</div>
              <div className="text-sm text-gray-500">Satellite Images</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
              <div className="text-2xl font-semibold text-forest-primary">{assetMappings.length}</div>
              <div className="text-sm text-gray-500">Assets Detected</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
              <div className="text-2xl font-semibold text-forest-primary">
                {assetMappings.reduce((sum, asset) => sum + (asset.confidence_score * 100), 0).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">Avg Confidence</div>
            </div>
          </div>

          {/* Asset Types Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="forest-chart-header">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-forest-gradient rounded-lg">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <h3 className="forest-chart-title">Asset Types Distribution</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['agricultural_land', 'forest_cover', 'water_body', 'homestead', 'infrastructure', 'mineral_deposit'].map(type => {
                const count = assetMappings.filter(asset => asset.asset_type === type).length;
                const totalArea = assetMappings.filter(asset => asset.asset_type === type).reduce((sum, asset) => sum + asset.area_sqm, 0);
                
                return (
                  <div key={type} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center space-x-2 p-2 rounded-md border border-gray-200 bg-white text-forest-primary`}>
                        {getAssetIcon(type)}
                        <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <span className="text-2xl font-bold text-forest-deep">{count}</span>
                    </div>
                    <div className="text-sm text-forest-medium">
                      Total Area: {formatArea(totalArea)}
                    </div>
                    <div className="text-xs text-forest-medium mt-1">
                      Avg Confidence: {formatConfidence(
                        assetMappings.filter(asset => asset.asset_type === type).reduce((sum, asset) => sum + asset.confidence_score, 0) / count || 0
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Assets */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="forest-chart-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-forest-gradient rounded-lg">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="forest-chart-title">Recent Asset Detections</h3>
                </div>
                <div className="text-sm text-forest-medium">
                  Showing {filteredAssets.length} assets
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredAssets.slice(0, 10).map(asset => (
                <div key={asset.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-md bg-gray-50 text-forest-primary border border-gray-200`}>
                      {getAssetIcon(asset.asset_type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {asset.asset_type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {asset.land_use_classification || 'Unclassified'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{formatArea(asset.area_sqm)}</div>
                      <div className="text-xs text-gray-600">Area</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{formatConfidence(asset.confidence_score)}</div>
                      <div className="text-xs text-gray-600">Confidence</div>
                    </div>
                    <button
                      onClick={() => openAssetModal(asset)}
                      className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Village Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6 relative z-10">
          {/* Village Selector */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-forest-gradient rounded-lg"><Satellite className="h-5 w-5 text-white" /></div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Select Village</div>
                  <div className="text-xs text-gray-600">Switch context to load terrain and analysis</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <input type="checkbox" checked={liveAnalysis} onChange={(e) => setLiveAnalysis(e.target.checked)} />
                  <span>Live analysis (10s)</span>
                </label>
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    const match = villages.find(v => v.label.toLowerCase().includes(value.toLowerCase()) || v.name.toLowerCase().includes(value.toLowerCase()));
                    if (match) setSelectedVillage(match.id);
                  }}
                  placeholder="Search village name..."
                  className="forest-input w-48"
                />
                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="forest-select"
                >
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Real-time Terrain Map */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="forest-chart-header">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-forest-gradient rounded-lg">
                  <Satellite className="h-6 w-6 text-white" />
                </div>
                <h3 className="forest-chart-title">Real-time Satellite Terrain Analysis</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="forest-button-secondary"
                  onClick={async () => {
                    if (satelliteImages.length === 0) return;
                    const img = satelliteImages[0];
                    setLoading(true);
                    try {
                      await aiAssetMappingService.preprocessImage(img.id);
                      await aiAssetMappingService.classifyLandUse(selectedVillage);
                      await aiAssetMappingService.detectAssets(selectedVillage);
                      await aiAssetMappingService.processSatelliteImage(img.id);
                      const result = await aiAssetMappingService.analyzeVillageAssets(selectedVillage);
                      setAnalysisResult(result);
                      const assets = await aiAssetMappingService.getAssetMappings(selectedVillage);
                      setAssetMappings(assets);
                      setVectorized(aiAssetMappingService.getVectorizedDetections(selectedVillage));
                      const cd = await aiAssetMappingService.runChangeDetection(selectedVillage);
                      setChanges(cd);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Run Full Pipeline
                </button>
                <button
                  className="forest-button-secondary"
                  onClick={async () => {
                    const blob = await aiAssetMappingService.exportVectorized(selectedVillage, 'geojson');
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedVillage}-vectorized.geojson`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export GeoJSON
                </button>
              </div>
            </div>
            
            <RealTimeMap 
              selectedVillage={selectedVillage}
              terrainData={terrainData}
            externalLayers={externalLayers}
            vectorizedFeatures={vectorized as any}
              onTerrainSelect={(terrain) => {
                console.log('Selected terrain:', terrain);
                // Handle terrain selection
              }}
            />
          </div>

          {analysisResult && (
            <>
              {/* Analysis Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
                  <div className="text-2xl font-semibold text-gray-900">{formatArea(analysisResult.total_area_analyzed)}</div>
                  <div className="text-sm text-gray-500">Total Area</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
                  <div className="text-2xl font-semibold text-forest-primary">{analysisResult.assets_detected.length}</div>
                  <div className="text-sm text-gray-500">Assets Detected</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
                  <div className="text-2xl font-semibold text-forest-primary">{(analysisResult.confidence_level * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Confidence</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
                  <div className="text-2xl font-semibold text-forest-primary">{analysisResult.recommendations.length}</div>
                  <div className="text-sm text-gray-500">Recommendations</div>
                </div>
              </div>

              {/* Land Use Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="forest-chart-header">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-forest-gradient rounded-lg">
                      <Map className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="forest-chart-title">Land Use Summary</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysisResult.land_use_summary).map(([type, area]) => (
                    <div key={type} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 capitalize">{type.replace('_', ' ')}</span>
                        <span className="forest-chip">{formatArea(area)}</span>
                      </div>
                      <div className="w-full bg-forest-sage/20 rounded-full h-2">
                        <div 
                          className="bg-forest-gradient h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(area / analysisResult.total_area_analyzed) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Indicators */}
              <div className="forest-chart">
                <div className="forest-chart-header">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-forest-gradient rounded-lg">
                      <Leaf className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="forest-chart-title">Environmental Indicators</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(analysisResult.environmental_indicators).map(([indicator, value]) => (
                    <div key={indicator} className="p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-forest-deep capitalize">{indicator.replace('_', ' ')}</span>
                        <span className="text-lg font-bold text-forest-primary">{(value * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-forest-sage/20 rounded-full h-2">
                        <div 
                          className="bg-forest-gradient h-2 rounded-full transition-all duration-500"
                          style={{ width: `${value * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Development Potential */}
              <div className="forest-chart">
                <div className="forest-chart-header">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-forest-gradient rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="forest-chart-title">Development Potential</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(analysisResult.development_potential).map(([potential, value]) => (
                    <div key={potential} className="p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-forest-deep capitalize">{potential.replace('_', ' ')}</span>
                        <span className="text-lg font-bold text-forest-primary">{(value * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-forest-sage/20 rounded-full h-2">
                        <div 
                          className="bg-forest-gradient h-2 rounded-full transition-all duration-500"
                          style={{ width: `${value * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Change Detection (Mock) */}
              {changes && changes.changes && changes.changes.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="forest-chart-header">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-forest-gradient rounded-lg">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="forest-chart-title">Change Detection</h3>
                    </div>
                  </div>
                  <div className="text-xs text-forest-medium mb-2">
                    Baseline: {new Date(changes.baseline_date).toLocaleDateString()} → Comparison: {new Date(changes.comparison_date).toLocaleDateString()}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {changes.changes.map((c: any) => (
                      <div key={c.id} className="p-3 bg-white border border-gray-200 rounded">
                        <div className="text-sm font-semibold capitalize">{c.type.replace('_', ' ')}</div>
                        {typeof c.area_sqm === 'number' && (
                          <div className="text-xs text-forest-medium">Area affected: {c.area_sqm.toFixed(0)} sqm</div>
                        )}
                        <div className="text-xs text-forest-medium">Confidence: {(c.confidence * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="forest-chart">
                <div className="forest-chart-header">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-forest-gradient rounded-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="forest-chart-title">Development Recommendations</h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-4 bg-white/50 rounded-lg border-l-4 border-forest-primary">
                      <div className="flex items-start space-x-3">
                        <div className="p-1 bg-forest-primary rounded-full mt-1">
                          <Zap className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-forest-deep">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Satellite Data Tab */}
      {activeTab === 'satellite' && (
        <div className="space-y-6">
          <div className="forest-chart">
            <div className="forest-chart-header">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-forest-gradient rounded-lg">
                  <Satellite className="h-6 w-6 text-white" />
                </div>
                <h3 className="forest-chart-title">Satellite Imagery Data</h3>
              </div>
            </div>
            
            <div className="space-y-4">
              {satelliteImages.map(image => (
                <div key={image.id} className="p-6 bg-white/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-forest-gradient rounded-lg">
                        <Satellite className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-forest-deep">Village {image.village_id.split('-')[1]}</h4>
                        <p className="text-sm text-forest-medium">{image.sensor_type} - {image.resolution}m resolution</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        image.processing_status === 'analyzed' ? 'bg-green-100 text-green-700' :
                        image.processing_status === 'processed' ? 'bg-blue-100 text-blue-700' :
                        image.processing_status === 'raw' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {image.processing_status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{image.resolution}m</div>
                      <div className="text-sm text-forest-medium">Resolution</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{image.cloud_coverage}%</div>
                      <div className="text-sm text-forest-medium">Cloud Coverage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{image.spectral_bands.length}</div>
                      <div className="text-sm text-forest-medium">Spectral Bands</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {new Date(image.acquisition_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-forest-medium">Acquisition Date</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-forest-sage/20">
                    <div className="text-sm text-forest-medium">
                      Spectral bands: {image.spectral_bands.join(', ')}
                    </div>
                    <div className="flex space-x-2">
                      <button className="forest-button-secondary flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button className="forest-button-secondary flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Asset Detail Modal */}
      {isModalOpen && selectedAsset && (
        <div className="forest-modal" onClick={closeModal}>
          <div className="forest-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="forest-modal-header">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getAssetColor(selectedAsset.asset_type)}`}>
                  {getAssetIcon(selectedAsset.asset_type)}
                </div>
                <div>
                  <h2 className="forest-modal-title capitalize">{selectedAsset.asset_type.replace('_', ' ')}</h2>
                  <p className="text-forest-medium mt-1">{selectedAsset.land_use_classification}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-forest-medium hover:text-forest-deep rounded-lg hover:bg-forest-sage/10 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="forest-modal-body">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-forest-gradient rounded-lg">
                      <Map className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-forest-deep">Asset Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                      <span className="text-forest-medium font-medium">Area:</span>
                      <span className="text-forest-deep font-semibold">{formatArea(selectedAsset.area_sqm)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                      <span className="text-forest-medium font-medium">Confidence Score:</span>
                      <span className="text-forest-deep font-semibold">{formatConfidence(selectedAsset.confidence_score)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                      <span className="text-forest-medium font-medium">Detection Method:</span>
                      <span className="text-forest-deep font-semibold capitalize">{selectedAsset.detected_by.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                      <span className="text-forest-medium font-medium">Detection Date:</span>
                      <span className="text-forest-deep font-semibold">{new Date(selectedAsset.detection_date).toLocaleDateString()}</span>
                    </div>
                    
                    {selectedAsset.elevation && (
                      <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                        <span className="text-forest-medium font-medium">Elevation:</span>
                        <span className="text-forest-deep font-semibold">{selectedAsset.elevation}m</span>
                      </div>
                    )}
                    
                    {selectedAsset.slope_angle && (
                      <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                        <span className="text-forest-medium font-medium">Slope:</span>
                        <span className="text-forest-deep font-semibold">{selectedAsset.slope_angle}°</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-forest-gradient rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-forest-deep">AI Analysis</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedAsset.vegetation_index && (
                      <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                        <span className="text-forest-medium font-medium">Vegetation Index:</span>
                        <span className="text-forest-deep font-semibold">{selectedAsset.vegetation_index.toFixed(3)}</span>
                      </div>
                    )}
                    
                    {selectedAsset.soil_moisture_index && (
                      <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                        <span className="text-forest-medium font-medium">Soil Moisture:</span>
                        <span className="text-forest-deep font-semibold">{selectedAsset.soil_moisture_index.toFixed(3)}</span>
                      </div>
                    )}
                    
                    {selectedAsset.accessibility_score && (
                      <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                        <span className="text-forest-medium font-medium">Accessibility:</span>
                        <span className="text-forest-deep font-semibold">{(selectedAsset.accessibility_score * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    
                    {selectedAsset.economic_value_estimate && (
                      <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                        <span className="text-forest-medium font-medium">Economic Value:</span>
                        <span className="text-forest-deep font-semibold">₹{selectedAsset.economic_value_estimate.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {selectedAsset.conservation_priority && (
                      <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                        <span className="text-forest-medium font-medium">Conservation Priority:</span>
                        <span className={`font-semibold ${
                          selectedAsset.conservation_priority === 'high' ? 'text-red-600' :
                          selectedAsset.conservation_priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {selectedAsset.conservation_priority.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {selectedAsset.notes && (
                    <div className="p-4 bg-forest-sage/10 rounded-xl">
                      <h4 className="text-forest-deep font-semibold mb-2">Notes:</h4>
                      <p className="text-forest-medium text-sm">{selectedAsset.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="forest-modal-footer">
              <button
                onClick={closeModal}
                className="forest-button-secondary"
              >
                Close
              </button>
              <button
                className="forest-button-primary flex items-center space-x-2"
                onClick={async () => {
                  if (satelliteImages.length === 0) return;
                  const first = satelliteImages[0];
                  setLoading(true);
                  try {
                    await aiAssetMappingService.processSatelliteImage(first.id);
                    // refresh assets after processing
                    const assets = await aiAssetMappingService.getAssetMappings(selectedVillage, selectedAssetType === 'all' ? undefined : selectedAssetType);
                    setAssetMappings(assets);
                    await loadAnalysisResult();
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <Download className="h-4 w-4" />
                <span>Run CV Inference</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
