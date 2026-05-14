import { AssetMapping, SatelliteImageData, AIModel, AssetAnalysisResult, ExternalLayerFeature, GeoJSONFeatureCollection, GeoJSONFeature, ChangeDetectionResult } from '../types';

// Mock AI Asset Mapping Service
// In production, this would integrate with actual ML models and satellite data APIs

export class AIAssetMappingService {
  private static instance: AIAssetMappingService;
  private models: AIModel[] = [];
  private satelliteImages: SatelliteImageData[] = [];
  private assetMappings: AssetMapping[] = [];
  private analysisResults: AssetAnalysisResult[] = [];
  private externalLayers: ExternalLayerFeature[] = [];
  private vectorizedDetections: Record<string, GeoJSONFeatureCollection> = {};
  private changeDetections: Record<string, ChangeDetectionResult> = {};

  private constructor() {
    this.initializeModels();
    this.initializeSatelliteData();
    this.generateMockAssetMappings();
    this.initializeExternalLayers();
  }

  public static getInstance(): AIAssetMappingService {
    if (!AIAssetMappingService.instance) {
      AIAssetMappingService.instance = new AIAssetMappingService();
    }
    return AIAssetMappingService.instance;
  }

  private initializeExternalLayers(): void {
    const now = new Date().toISOString();
    this.externalLayers = [
      // Forest data (e.g., FSI polygons)
      {
        id: 'fsi-forest-001',
        type: 'forest',
        name: 'Reserved Forest Block',
        geometry: {
          type: 'Polygon',
          coordinates: [[[83.48,20.30],[83.52,20.30],[83.52,20.28],[83.48,20.28],[83.48,20.30]]]
        },
        properties: { canopy_density: 'dense', protection_status: 'reserved' },
        source: 'Forest Survey of India',
        updated_at: now
      },
      // Groundwater data (e.g., CGWB)
      {
        id: 'cgwb-gw-001',
        type: 'groundwater',
        name: 'Aquifer Recharge Zone',
        geometry: {
          type: 'Polygon',
          coordinates: [[[83.49,20.29],[83.51,20.29],[83.51,20.27],[83.49,20.27],[83.49,20.29]]]
        },
        properties: { water_table_depth_m: 12.5, recharge_potential: 'high' },
        source: 'CGWB',
        updated_at: now
      },
      // Infrastructure data (e.g., PM Gati Shakti)
      {
        id: 'gati-road-001',
        type: 'infrastructure',
        name: 'Planned Rural Road',
        geometry: {
          type: 'LineString',
          coordinates: [[83.47,20.285],[83.53,20.285]]
        },
        properties: { status: 'planned', width_m: 6 },
        source: 'PM Gati Shakti',
        updated_at: now
      }
    ];
  }

  private initializeModels(): void {
    this.models = [
      {
        id: 'land-classifier-v3',
        name: 'Land Use Classification Model',
        type: 'land_classification',
        version: 'v3.2.1',
        accuracy: 94.7,
        status: 'active',
        last_trained: '2024-01-15T10:30:00Z',
        processed_count: 15420,
        model_parameters: {
          algorithm: 'Random Forest',
          input_features: ['NDVI', 'NDWI', 'NDSI', 'Elevation', 'Slope', 'Aspect', 'Temperature', 'Precipitation'],
          output_classes: ['Agricultural Land', 'Forest Cover', 'Water Body', 'Homestead', 'Infrastructure', 'Barren Land'],
          training_samples: 25000,
          validation_accuracy: 94.2,
          test_accuracy: 94.7
        },
        performance_metrics: {
          precision: 0.947,
          recall: 0.943,
          f1_score: 0.945,
          confusion_matrix: [
            [1200, 45, 12, 8, 3, 2],
            [38, 1850, 15, 5, 1, 1],
            [8, 12, 890, 2, 1, 0],
            [5, 3, 1, 450, 2, 0],
            [2, 1, 0, 1, 180, 0],
            [1, 0, 0, 0, 0, 95]
          ]
        }
      },
      {
        id: 'water-detector-v2',
        name: 'Water Body Detection Model',
        type: 'water_detection',
        version: 'v2.1.3',
        accuracy: 96.3,
        status: 'active',
        last_trained: '2024-01-10T14:20:00Z',
        processed_count: 8930,
        model_parameters: {
          algorithm: 'CNN',
          input_features: ['RGB', 'NIR', 'SWIR1', 'SWIR2', 'NDWI', 'MNDWI'],
          output_classes: ['Pond', 'Stream', 'River', 'Lake', 'Reservoir', 'No Water'],
          training_samples: 15000,
          validation_accuracy: 95.8,
          test_accuracy: 96.3
        },
        performance_metrics: {
          precision: 0.961,
          recall: 0.965,
          f1_score: 0.963,
          confusion_matrix: [
            [450, 12, 8, 3, 2, 5],
            [8, 320, 15, 2, 1, 4],
            [5, 10, 180, 3, 1, 1],
            [2, 3, 2, 95, 1, 0],
            [1, 1, 1, 0, 45, 0],
            [3, 2, 1, 0, 0, 1200]
          ]
        }
      },
      {
        id: 'forest-analyzer-v4',
        name: 'Forest Analysis Model',
        type: 'forest_analysis',
        version: 'v4.0.2',
        accuracy: 92.8,
        status: 'active',
        last_trained: '2024-01-12T09:15:00Z',
        processed_count: 12350,
        model_parameters: {
          algorithm: 'U-Net',
          input_features: ['NDVI', 'EVI', 'SAVI', 'Elevation', 'Slope', 'Temperature', 'Precipitation', 'Soil Type'],
          output_classes: ['Dense Forest', 'Moderate Forest', 'Sparse Forest', 'Degraded Forest', 'Non-Forest'],
          training_samples: 20000,
          validation_accuracy: 92.1,
          test_accuracy: 92.8
        },
        performance_metrics: {
          precision: 0.925,
          recall: 0.931,
          f1_score: 0.928,
          confusion_matrix: [
            [850, 45, 12, 8, 5],
            [35, 1200, 25, 8, 2],
            [8, 20, 680, 15, 3],
            [5, 8, 12, 320, 5],
            [3, 2, 5, 8, 1200]
          ]
        }
      },
      {
        id: 'infrastructure-mapper-v1',
        name: 'Infrastructure Mapping Model',
        type: 'infrastructure_mapping',
        version: 'v1.5.0',
        accuracy: 89.4,
        status: 'active',
        last_trained: '2024-01-08T16:45:00Z',
        processed_count: 6780,
        model_parameters: {
          algorithm: 'CNN',
          input_features: ['RGB', 'NIR', 'Panchromatic', 'Elevation', 'Slope'],
          output_classes: ['Road', 'Building', 'Bridge', 'Power Line', 'Telecom Tower', 'No Infrastructure'],
          training_samples: 12000,
          validation_accuracy: 88.9,
          test_accuracy: 89.4
        },
        performance_metrics: {
          precision: 0.891,
          recall: 0.897,
          f1_score: 0.894,
          confusion_matrix: [
            [320, 15, 8, 3, 2, 12],
            [12, 450, 12, 5, 3, 8],
            [5, 8, 95, 2, 1, 4],
            [2, 3, 1, 180, 1, 3],
            [1, 2, 1, 1, 45, 0],
            [8, 5, 2, 2, 0, 1200]
          ]
        }
      },
      {
        id: 'soil-analyzer-v2',
        name: 'Soil Analysis Model',
        type: 'soil_analysis',
        version: 'v2.0.1',
        accuracy: 87.6,
        status: 'training',
        last_trained: '2024-01-14T11:30:00Z',
        processed_count: 4560,
        model_parameters: {
          algorithm: 'XGBoost',
          input_features: ['NDVI', 'NDWI', 'Temperature', 'Precipitation', 'Elevation', 'Slope', 'Aspect', 'Geology'],
          output_classes: ['Fertile Soil', 'Moderate Soil', 'Poor Soil', 'Rocky Soil', 'Sandy Soil', 'Clay Soil'],
          training_samples: 18000,
          validation_accuracy: 86.8,
          test_accuracy: 87.6
        },
        performance_metrics: {
          precision: 0.872,
          recall: 0.880,
          f1_score: 0.876,
          confusion_matrix: [
            [280, 25, 12, 8, 5, 10],
            [20, 350, 18, 5, 3, 8],
            [8, 15, 180, 12, 8, 7],
            [5, 8, 10, 95, 5, 2],
            [3, 5, 8, 8, 120, 6],
            [8, 12, 5, 2, 8, 250]
          ]
        }
      }
    ];
  }

  private initializeSatelliteData(): void {
    this.satelliteImages = [
      {
        id: 'sat-img-001',
        village_id: 'village-001',
        image_url: '/api/satellite-images/village-001-landsat8-20240115.tif',
        acquisition_date: '2024-01-15T10:30:00Z',
        resolution: 30,
        cloud_coverage: 5.2,
        sensor_type: 'Landsat',
        spectral_bands: ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'B11'],
        processing_status: 'analyzed',
        created_at: '2024-01-15T10:35:00Z',
        updated_at: '2024-01-15T12:45:00Z'
      },
      {
        id: 'sat-img-002',
        village_id: 'village-002',
        image_url: '/api/satellite-images/village-002-sentinel2-20240114.tif',
        acquisition_date: '2024-01-14T14:20:00Z',
        resolution: 10,
        cloud_coverage: 2.8,
        sensor_type: 'Sentinel',
        spectral_bands: ['B2', 'B3', 'B4', 'B8', 'B11', 'B12'],
        processing_status: 'analyzed',
        created_at: '2024-01-14T14:25:00Z',
        updated_at: '2024-01-14T16:30:00Z'
      },
      {
        id: 'sat-img-003',
        village_id: 'village-003',
        image_url: '/api/satellite-images/village-003-worldview3-20240113.tif',
        acquisition_date: '2024-01-13T09:15:00Z',
        resolution: 0.5,
        cloud_coverage: 0.0,
        sensor_type: 'WorldView',
        spectral_bands: ['Blue', 'Green', 'Red', 'NIR', 'Pan'],
        processing_status: 'analyzed',
        created_at: '2024-01-13T09:20:00Z',
        updated_at: '2024-01-13T11:45:00Z'
      }
    ];
  }

  private generateMockAssetMappings(): void {
    this.assetMappings = [
      {
        id: 'asset-001',
        claim_id: 'claim-001',
        village_id: 'village-001',
        asset_type: 'agricultural_land',
        coordinates: { lat: 20.5937, lng: 78.9629 },
        area_sqm: 25000,
        confidence_score: 0.94,
        detected_by: 'satellite_ai',
        detection_date: '2024-01-15T12:45:00Z',
        satellite_image_url: '/api/satellite-images/village-001-landsat8-20240115.tif',
        spectral_signature: [0.45, 0.52, 0.38, 0.29, 0.15, 0.08],
        vegetation_index: 0.68,
        soil_moisture_index: 0.72,
        elevation: 450,
        slope_angle: 8.5,
        aspect: 135,
        land_use_classification: 'Paddy Cultivation',
        accessibility_score: 0.85,
        economic_value_estimate: 125000,
        conservation_priority: 'medium',
        verification_status: 'verified',
        verification_date: '2024-01-16T10:30:00Z',
        verified_by: 'Dr. Rajesh Kumar',
        notes: 'High-quality agricultural land suitable for rice cultivation'
      },
      {
        id: 'asset-002',
        claim_id: 'claim-002',
        village_id: 'village-001',
        asset_type: 'forest_cover',
        coordinates: { lat: 20.5950, lng: 78.9650 },
        area_sqm: 150000,
        confidence_score: 0.92,
        detected_by: 'satellite_ai',
        detection_date: '2024-01-15T12:45:00Z',
        satellite_image_url: '/api/satellite-images/village-001-landsat8-20240115.tif',
        spectral_signature: [0.38, 0.45, 0.52, 0.68, 0.45, 0.25],
        vegetation_index: 0.85,
        soil_moisture_index: 0.65,
        elevation: 520,
        slope_angle: 15.2,
        aspect: 90,
        land_use_classification: 'Mixed Deciduous Forest',
        forest_density: 'dense',
        accessibility_score: 0.45,
        economic_value_estimate: 450000,
        conservation_priority: 'high',
        verification_status: 'verified',
        verification_date: '2024-01-16T11:15:00Z',
        verified_by: 'Dr. Priya Sharma',
        notes: 'Dense forest with high biodiversity and carbon sequestration potential'
      },
      {
        id: 'asset-003',
        claim_id: 'claim-003',
        village_id: 'village-001',
        asset_type: 'water_body',
        coordinates: { lat: 20.5920, lng: 78.9600 },
        area_sqm: 8500,
        confidence_score: 0.96,
        detected_by: 'satellite_ai',
        detection_date: '2024-01-15T12:45:00Z',
        satellite_image_url: '/api/satellite-images/village-001-landsat8-20240115.tif',
        spectral_signature: [0.12, 0.15, 0.18, 0.22, 0.35, 0.45],
        vegetation_index: 0.05,
        soil_moisture_index: 0.95,
        elevation: 420,
        slope_angle: 2.1,
        aspect: 180,
        land_use_classification: 'Natural Pond',
        water_quality_index: 0.78,
        accessibility_score: 0.90,
        economic_value_estimate: 85000,
        conservation_priority: 'high',
        verification_status: 'verified',
        verification_date: '2024-01-16T09:45:00Z',
        verified_by: 'Dr. Amit Patel',
        notes: 'Clean water body suitable for irrigation and domestic use'
      },
      {
        id: 'asset-004',
        claim_id: 'claim-004',
        village_id: 'village-002',
        asset_type: 'homestead',
        coordinates: { lat: 20.5980, lng: 78.9680 },
        area_sqm: 1200,
        confidence_score: 0.89,
        detected_by: 'satellite_ai',
        detection_date: '2024-01-14T16:30:00Z',
        satellite_image_url: '/api/satellite-images/village-002-sentinel2-20240114.tif',
        spectral_signature: [0.35, 0.42, 0.38, 0.45, 0.25, 0.15],
        vegetation_index: 0.25,
        soil_moisture_index: 0.45,
        elevation: 480,
        slope_angle: 5.8,
        aspect: 225,
        land_use_classification: 'Residential Area',
        accessibility_score: 0.95,
        economic_value_estimate: 15000,
        conservation_priority: 'low',
        verification_status: 'pending',
        notes: 'Residential homestead with basic infrastructure'
      },
      {
        id: 'asset-005',
        claim_id: 'claim-005',
        village_id: 'village-003',
        asset_type: 'infrastructure',
        coordinates: { lat: 20.6000, lng: 78.9700 },
        area_sqm: 500,
        confidence_score: 0.91,
        detected_by: 'satellite_ai',
        detection_date: '2024-01-13T11:45:00Z',
        satellite_image_url: '/api/satellite-images/village-003-worldview3-20240113.tif',
        spectral_signature: [0.25, 0.28, 0.32, 0.35, 0.45, 0.55],
        vegetation_index: 0.05,
        soil_moisture_index: 0.20,
        elevation: 465,
        slope_angle: 1.2,
        aspect: 0,
        land_use_classification: 'Road Infrastructure',
        accessibility_score: 1.0,
        economic_value_estimate: 25000,
        conservation_priority: 'low',
        verification_status: 'verified',
        verification_date: '2024-01-14T08:30:00Z',
        verified_by: 'Eng. Vikram Singh',
        notes: 'Main road connecting village to district headquarters'
      }
    ];
  }

  // Public API Methods

  public async getAIModels(): Promise<AIModel[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.models]), 500);
    });
  }

  public async getSatelliteImages(villageId?: string): Promise<SatelliteImageData[]> {
    return new Promise((resolve) => {
      const images = villageId 
        ? this.satelliteImages.filter(img => img.village_id === villageId)
        : [...this.satelliteImages];
      setTimeout(() => resolve(images), 300);
    });
  }

  public async getAssetMappings(villageId?: string, assetType?: string): Promise<AssetMapping[]> {
    return new Promise((resolve) => {
      let mappings = [...this.assetMappings];
      
      if (villageId) {
        mappings = mappings.filter(mapping => mapping.village_id === villageId);
      }
      
      if (assetType) {
        mappings = mappings.filter(mapping => mapping.asset_type === assetType);
      }
      
      setTimeout(() => resolve(mappings), 400);
    });
  }

  public async getExternalLayers(type?: 'forest' | 'groundwater' | 'infrastructure'): Promise<ExternalLayerFeature[]> {
    return new Promise((resolve) => {
      const layers = type ? this.externalLayers.filter(l => l.type === type) : [...this.externalLayers];
      setTimeout(() => resolve(layers), 200);
    });
  }

  public async analyzeVillageAssets(villageId: string): Promise<AssetAnalysisResult> {
    return new Promise((resolve) => {
      const villageAssets = this.assetMappings.filter(asset => asset.village_id === villageId);
      
      // Define realistic total area per village (sqm)
      const villageAreaSqmMap: Record<string, number> = {
        'village-001': 12000000, // 12 km^2
        'village-002': 9000000,  // 9 km^2
        'village-003': 7500000,  // 7.5 km^2
        'village-004': 15000000, // 15 km^2
        'village-005': 11000000, // 11 km^2
        'village-006': 8500000,  // 8.5 km^2
        'village-007': 10000000, // 10 km^2
        'village-008': 18000000, // 18 km^2
        'village-009': 14000000, // 14 km^2
        'village-010': 20000000, // 20 km^2
        'village-011': 13000000, // 13 km^2
        'village-012': 6000000,  // 6 km^2
        'village-013': 7000000   // 7 km^2
      };
      const villageTotalAreaSqm = villageAreaSqmMap[villageId] ?? 10000000; // default 10 km^2

      const landUseSummary = {
        agricultural_land: villageAssets.filter(a => a.asset_type === 'agricultural_land').reduce((sum, a) => sum + a.area_sqm, 0),
        forest_cover: villageAssets.filter(a => a.asset_type === 'forest_cover').reduce((sum, a) => sum + a.area_sqm, 0),
        water_bodies: villageAssets.filter(a => a.asset_type === 'water_body').reduce((sum, a) => sum + a.area_sqm, 0),
        homesteads: villageAssets.filter(a => a.asset_type === 'homestead').reduce((sum, a) => sum + a.area_sqm, 0),
        infrastructure: villageAssets.filter(a => a.asset_type === 'infrastructure').reduce((sum, a) => sum + a.area_sqm, 0),
        barren_land: 0 // Calculate based on total village area
      };

      const totalArea = Object.values(landUseSummary).reduce((sum, area) => sum + (Number.isFinite(area as number) ? (area as number) : 0), 0);
      const barrenLand = Math.max(0, villageTotalAreaSqm - totalArea);
      landUseSummary.barren_land = barrenLand;

      const safeDenom = Math.max(1, villageAssets.length);
      const environmentalIndicators = {
        vegetation_health_index: villageAssets.reduce((sum, a) => sum + (a.vegetation_index || 0), 0) / safeDenom,
        water_availability_index: villageAssets.reduce((sum, a) => sum + (a.soil_moisture_index || 0), 0) / safeDenom,
        soil_fertility_index: 0.75, // Mock calculation
        biodiversity_index: 0.82, // Mock calculation
        carbon_sequestration_potential: villageAssets.filter(a => a.asset_type === 'forest_cover').length > 0 ? 0.85 : 0.45
      };

      const developmentPotential = {
        agricultural_potential: landUseSummary.agricultural_land > 0 ? 0.88 : 0.45,
        forest_management_potential: landUseSummary.forest_cover > 0 ? 0.92 : 0.25,
        water_harvesting_potential: landUseSummary.water_bodies > 0 ? 0.78 : 0.35,
        ecotourism_potential: landUseSummary.forest_cover > 50000 ? 0.85 : 0.45,
        renewable_energy_potential: 0.65 // Mock calculation
      };

      const recommendations = this.generateRecommendations(landUseSummary, environmentalIndicators, developmentPotential);

      const result: AssetAnalysisResult = {
        village_id: villageId,
        total_area_analyzed: villageTotalAreaSqm,
        assets_detected: villageAssets,
        land_use_summary: landUseSummary,
        environmental_indicators: environmentalIndicators,
        development_potential: developmentPotential,
        analysis_date: new Date().toISOString(),
        confidence_level: 0.89,
        recommendations
      };

      setTimeout(() => resolve(result), 800);
    });
  }

  private generateRecommendations(
    landUse: any,
    environmental: any,
    development: any
  ): string[] {
    const recommendations: string[] = [];

    if (landUse.agricultural_land > 20000) {
      recommendations.push('High agricultural potential - Consider PM-KISAN scheme integration');
    }

    if (landUse.forest_cover > 100000) {
      recommendations.push('Significant forest cover - Implement CFR management and ecotourism development');
    }

    if (landUse.water_bodies > 5000) {
      recommendations.push('Water bodies present - Integrate Jal Jeevan Mission for water infrastructure');
    }

    if (environmental.vegetation_health_index > 0.7) {
      recommendations.push('Healthy vegetation - Suitable for agroforestry and sustainable agriculture');
    }

    if (development.ecotourism_potential > 0.8) {
      recommendations.push('High ecotourism potential - Develop community-based tourism initiatives');
    }

    if (development.renewable_energy_potential > 0.6) {
      recommendations.push('Renewable energy potential - Consider solar and wind energy projects');
    }

    return recommendations;
  }

  public async processSatelliteImage(imageId: string): Promise<AssetMapping[]> {
    return new Promise((resolve) => {
      // Simulate AI processing
      setTimeout(() => {
        const image = this.satelliteImages.find(img => img.id === imageId);
        if (image) {
          const newAssets = this.assetMappings.filter(asset => asset.village_id === image.village_id);
          // Generate vectorized detections for this village
          this.vectorizedDetections[image.village_id] = this.generateVectorizedDetections(image.village_id, newAssets);
          // Produce a light change detection sample (mock)
          this.changeDetections[image.village_id] = this.mockChangeDetection(image.village_id);
          resolve(newAssets);
        } else {
          resolve([]);
        }
      }, 2000);
    });
  }

  public async retrainModel(modelId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const model = this.models.find(m => m.id === modelId);
        if (model) {
          model.status = 'training';
          model.last_trained = new Date().toISOString();
          model.processed_count += 1000;
          model.accuracy += Math.random() * 2 - 1; // Simulate improvement
          resolve(true);
        } else {
          resolve(false);
        }
      }, 3000);
    });
  }

  public async getModelPerformance(modelId: string): Promise<AIModel | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const model = this.models.find(m => m.id === modelId);
        resolve(model || null);
      }, 200);
    });
  }

  // Pipeline stubs
  public async preprocessImage(imageId: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 500));
  }

  public async classifyLandUse(villageId: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 700));
  }

  public async detectAssets(villageId: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 700));
  }

  public async runChangeDetection(villageId: string): Promise<ChangeDetectionResult> {
    return new Promise((resolve) => setTimeout(() => resolve(this.mockChangeDetection(villageId)), 800));
  }

  public getVectorizedDetections(villageId: string): GeoJSONFeatureCollection | null {
    return this.vectorizedDetections[villageId] || null;
  }

  public async exportVectorized(villageId: string, format: 'geojson' | 'shp' = 'geojson'): Promise<Blob> {
    const fc = this.vectorizedDetections[villageId] || { type: 'FeatureCollection', features: [] };
    const data = JSON.stringify(fc);
    return new Blob([data], { type: format === 'geojson' ? 'application/geo+json' : 'application/octet-stream' });
  }

  private generateVectorizedDetections(villageId: string, assets: AssetMapping[]): GeoJSONFeatureCollection {
    const features: GeoJSONFeature[] = assets.map((a) => {
      const size = Math.max(0.0008, Math.min(0.004, a.area_sqm / 2_000_000));
      const ring = [
        [a.coordinates.lng - size, a.coordinates.lat - size],
        [a.coordinates.lng + size, a.coordinates.lat - size],
        [a.coordinates.lng + size, a.coordinates.lat + size],
        [a.coordinates.lng - size, a.coordinates.lat + size],
        [a.coordinates.lng - size, a.coordinates.lat - size]
      ];
      return {
        type: 'Feature',
        id: a.id,
        properties: {
          asset_type: a.asset_type,
          area_sqm: a.area_sqm,
          confidence: a.confidence_score,
          classification: a.land_use_classification
        },
        geometry: {
          type: 'Polygon',
          coordinates: [ring]
        }
      };
    });
    return { type: 'FeatureCollection', features };
  }

  private mockChangeDetection(villageId: string): ChangeDetectionResult {
    const now = new Date();
    const prev = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 180);
    const centerAsset = this.assetMappings.find(a => a.village_id === villageId) || this.assetMappings[0];
    const size = 0.0012;
    return {
      village_id: villageId,
      baseline_date: prev.toISOString(),
      comparison_date: now.toISOString(),
      changes: centerAsset ? [
        {
          id: 'chg-001',
          type: 'deforestation',
          confidence: 0.82,
          area_sqm: 12000,
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [centerAsset.coordinates.lng - size, centerAsset.coordinates.lat - size],
              [centerAsset.coordinates.lng + size, centerAsset.coordinates.lat - size],
              [centerAsset.coordinates.lng + size, centerAsset.coordinates.lat + size],
              [centerAsset.coordinates.lng - size, centerAsset.coordinates.lat + size],
              [centerAsset.coordinates.lng - size, centerAsset.coordinates.lat - size]
            ]]
          },
          properties: { note: 'Tree cover reduction likely due to clearance' }
        }
      ] : []
    };
  }
}

export const aiAssetMappingService = AIAssetMappingService.getInstance();
