export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'district_officer' | 'tribal_welfare' | 'forest_dept' | 'revenue_dept' | 'ngo' | 'citizen';
  department: string;
  state: 'Madhya Pradesh' | 'Tripura' | 'Odisha' | 'Telangana';
  district?: string;
  created_at: string;
  phone?: string;
  avatar_url?: string;
  provider?: 'google' | 'email' | 'phone';
  is_admin?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  provider?: 'google' | 'email' | 'phone';
  is_admin?: boolean;
  created_at: string;
}

export interface FRARecord {
  id: string;
  claim_id: string;
  patta_number?: string;
  claim_type: 'IFR' | 'CR' | 'CFR';
  status: 'pending' | 'verified' | 'granted' | 'rejected';
  applicant_name: string;
  village: string;
  block: string;
  district: string;
  state: 'Madhya Pradesh' | 'Tripura' | 'Odisha' | 'Telangana';
  tribal_group: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  area_hectares: number;
  claim_date: string;
  verification_date?: string;
  grant_date?: string;
  documents: FRADocument[];
  assets: AssetMapping[];
  eligible_schemes: string[];
  created_at: string;
}

export interface FRADocument {
  id: string;
  claim_id: string;
  name: string;
  type: 'application' | 'verification' | 'survey' | 'patta' | 'legacy';
  file_url: string;
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_entities: {
    village_names: string[];
    patta_holders: string[];
    coordinates: string[];
    claim_status: string;
    dates: string[];
  };
  uploaded_at: string;
}

export interface AssetMapping {
  id: string;
  claim_id: string;
  village_id: string;
  asset_type: 'agricultural_land' | 'forest_cover' | 'water_body' | 'homestead' | 'pond' | 'stream' | 'infrastructure' | 'mineral_deposit';
  coordinates: {
    lat: number;
    lng: number;
  };
  area_sqm: number;
  confidence_score: number;
  detected_by: 'satellite_ai' | 'ground_survey' | 'manual' | 'drone_survey';
  detection_date: string;
  satellite_image_url?: string;
  spectral_signature?: number[];
  vegetation_index?: number;
  soil_moisture_index?: number;
  elevation?: number;
  slope_angle?: number;
  aspect?: number;
  land_use_classification?: string;
  forest_density?: 'dense' | 'moderate' | 'sparse' | 'degraded';
  water_quality_index?: number;
  accessibility_score?: number;
  economic_value_estimate?: number;
  conservation_priority?: 'high' | 'medium' | 'low';
  verification_status?: 'verified' | 'pending' | 'disputed';
  verification_date?: string;
  verified_by?: string;
  notes?: string;
}

export interface SatelliteImageData {
  id: string;
  village_id: string;
  image_url: string;
  acquisition_date: string;
  resolution: number; // meters per pixel
  cloud_coverage: number; // percentage
  sensor_type: 'Landsat' | 'Sentinel' | 'MODIS' | 'WorldView' | 'Pleiades';
  spectral_bands: string[];
  processing_status: 'raw' | 'processed' | 'analyzed' | 'failed';
  analysis_results?: AssetMapping[];
  created_at: string;
  updated_at: string;
}

export interface AIModel {
  id: string;
  name: string;
  type: 'land_classification' | 'water_detection' | 'forest_analysis' | 'infrastructure_mapping' | 'soil_analysis';
  version: string;
  accuracy: number;
  status: 'active' | 'training' | 'deprecated' | 'error';
  last_trained: string;
  processed_count: number;
  model_parameters: {
    algorithm: 'Random Forest' | 'CNN' | 'SVM' | 'Random Forest' | 'XGBoost' | 'U-Net';
    input_features: string[];
    output_classes: string[];
    training_samples: number;
    validation_accuracy: number;
    test_accuracy: number;
  };
  performance_metrics: {
    precision: number;
    recall: number;
    f1_score: number;
    confusion_matrix: number[][];
  };
}

export interface AssetAnalysisResult {
  village_id: string;
  total_area_analyzed: number;
  assets_detected: AssetMapping[];
  land_use_summary: {
    agricultural_land: number;
    forest_cover: number;
    water_bodies: number;
    homesteads: number;
    infrastructure: number;
    barren_land: number;
  };
  environmental_indicators: {
    vegetation_health_index: number;
    water_availability_index: number;
    soil_fertility_index: number;
    biodiversity_index: number;
    carbon_sequestration_potential: number;
  };
  development_potential: {
    agricultural_potential: number;
    forest_management_potential: number;
    water_harvesting_potential: number;
    ecotourism_potential: number;
    renewable_energy_potential: number;
  };
  analysis_date: string;
  confidence_level: number;
  recommendations: string[];
}

export interface CSSScheme {
  id: string;
  name: string;
  ministry: 'DAJGUA' | 'Rural Development' | 'Jal Shakti' | 'Agriculture' | 'Tribal Affairs';
  description: string;
  eligibility_criteria: string[];
  target_beneficiaries: string[];
  funding_amount: number;
  application_process: string;
  deadline?: string;
  status: 'active' | 'closed' | 'upcoming';
  applicable_states: string[];
  priority_score: number;
}

export interface VillageProfile {
  id: string;
  name: string;
  block: string;
  district: string;
  state: string;
  tribal_population: number;
  total_population: number;
  fra_claims_total: number;
  fra_claims_granted: number;
  water_index: number;
  forest_cover_percentage: number;
  infrastructure_score: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  assets_summary: {
    agricultural_land: number;
    water_bodies: number;
    forest_area: number;
    homesteads: number;
  };
}

export interface DashboardStats {
  total_claims: number;
  granted_claims: number;
  pending_verification: number;
  active_schemes: number;
  states_covered: number;
  villages_mapped: number;
  claim_distribution: {
    IFR: number;
    CR: number;
    CFR: number;
  };
  state_wise_progress: {
    [state: string]: {
      total: number;
      granted: number;
      pending: number;
    };
  };
  asset_mapping_progress: {
    villages_completed: number;
    total_villages: number;
    assets_detected: number;
  };
}

export interface DSSSuggestion {
  id: string;
  village_id: string;
  scheme_id: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  estimated_beneficiaries: number;
  implementation_timeline: string;
  required_actions: string[];
  success_probability: number;
}

export interface ExternalLayerFeature {
  id: string;
  type: 'forest' | 'groundwater' | 'infrastructure';
  name: string;
  geometry: {
    type: 'Polygon' | 'MultiPolygon' | 'LineString' | 'Point';
    coordinates: any;
  };
  properties: Record<string, any>;
  source: 'Forest Survey of India' | 'CGWB' | 'PM Gati Shakti' | 'Other';
  updated_at: string;
}

// Minimal GeoJSON-like structures for mapping/export
export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon' | 'LineString' | 'Point';
  coordinates: any;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id?: string | number;
  properties: Record<string, any>;
  geometry: GeoJSONGeometry;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface ChangeDetectionResult {
  village_id: string;
  baseline_date: string;
  comparison_date: string;
  changes: Array<{
    id: string;
    type: 'deforestation' | 'new_water_body' | 'urban_expansion' | 'agri_expansion' | 'other';
    geometry: GeoJSONGeometry;
    area_sqm?: number;
    confidence: number; // 0-1
    properties?: Record<string, any>;
  }>;
}

export interface DSSIntervention {
  id: string;
  name: string;
  category: 'water' | 'agriculture' | 'forest' | 'livelihood' | 'infrastructure';
  responsible_department: 'Jal Shakti' | 'Agriculture' | 'Tribal Affairs' | 'Rural Development' | 'Forest Department';
  priority_score: number; // 0-100
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  evidence: {
    water_index?: number;
    vegetation_health_index?: number;
    assets?: string[];
  };
  estimated_beneficiaries?: number;
}

export interface DSSEligibilityResult {
  fra_record_id: string;
  village_id: string;
  eligible_schemes: CSSScheme[];
  reasoning: Record<string, string>; // schemeId -> explanation
}