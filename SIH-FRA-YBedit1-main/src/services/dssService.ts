import { CSSScheme, FRARecord, VillageProfile, AssetAnalysisResult, DSSIntervention, DSSEligibilityResult } from '../types';

// DSS Service for recommending schemes based on approved claims
export class DSSService {
  private static instance: DSSService;
  private schemes: CSSScheme[] = [];

  private constructor() {
    this.initializeSchemes();
  }

  public static getInstance(): DSSService {
    if (!DSSService.instance) {
      DSSService.instance = new DSSService();
    }
    return DSSService.instance;
  }

  private initializeSchemes(): void {
    this.schemes = [
      {
        id: 'pm-kisan',
        name: 'PM-KISAN Scheme',
        ministry: 'Agriculture',
        description: 'Direct income support to farmers with small and marginal holdings',
        eligibility_criteria: [
          'Small and marginal farmers',
          'Land holding up to 2 hectares',
          'Valid land records',
          'Aadhaar linked bank account'
        ],
        target_beneficiaries: ['Farmers', 'Land holders', 'Agricultural workers'],
        funding_amount: 6000,
        application_process: 'Register on PM-KISAN portal with Aadhaar and bank details',
        status: 'active',
        applicable_states: ['All States'],
        priority_score: 9
      },
      {
        id: 'mgnrega',
        name: 'MGNREGA',
        ministry: 'Rural Development',
        description: 'Guaranteed employment for rural households',
        eligibility_criteria: [
          'Rural residence',
          'Job card required',
          'Age 18-65 years',
          'Willing to do unskilled manual work'
        ],
        target_beneficiaries: ['Rural households', 'Unemployed youth', 'Women'],
        funding_amount: 20000,
        application_process: 'Apply for job card at Gram Panchayat office',
        status: 'active',
        applicable_states: ['All States'],
        priority_score: 8
      },
      {
        id: 'pradhan-mantri-awas',
        name: 'Pradhan Mantri Awas Yojana (Gramin)',
        ministry: 'Rural Development',
        description: 'Housing for all by 2024',
        eligibility_criteria: [
          'No pucca house',
          'Land ownership or allotment',
          'BPL/APL status',
          'Valid Aadhaar'
        ],
        target_beneficiaries: ['Rural households', 'Homeless families', 'Land owners'],
        funding_amount: 120000,
        application_process: 'Submit application at Gram Panchayat with required documents',
        status: 'active',
        applicable_states: ['All States'],
        priority_score: 9
      },
      {
        id: 'jal-jeevan-mission',
        name: 'Jal Jeevan Mission',
        ministry: 'Jal Shakti',
        description: 'Functional household tap connections for all rural households',
        eligibility_criteria: [
          'Rural household',
          'No existing tap connection',
          'Valid Aadhaar',
          'Consent for water quality testing'
        ],
        target_beneficiaries: ['Rural households', 'Water scarce areas', 'Tribal communities'],
        funding_amount: 15000,
        application_process: 'Apply through Gram Panchayat or online portal',
        status: 'active',
        applicable_states: ['All States'],
        priority_score: 7
      },
      {
        id: 'forest-rights-benefits',
        name: 'Forest Rights Act Benefits',
        ministry: 'Tribal Affairs',
        description: 'Additional benefits for FRA patta holders',
        eligibility_criteria: [
          'Valid FRA patta holder',
          'Forest dwelling community',
          'Residing in forest area',
          'Community participation'
        ],
        target_beneficiaries: ['FRA patta holders', 'Forest dwelling communities', 'Tribal groups'],
        funding_amount: 50000,
        application_process: 'Automatic enrollment based on FRA patta status',
        status: 'active',
        applicable_states: ['Odisha', 'Madhya Pradesh', 'Chhattisgarh', 'Jharkhand', 'Telangana', 'Tripura'],
        priority_score: 10
      },
      {
        id: 'soil-health-card',
        name: 'Soil Health Card Scheme',
        ministry: 'Agriculture',
        description: 'Soil testing and nutrient management for sustainable agriculture',
        eligibility_criteria: [
          'Agricultural land holder',
          'Valid land records',
          'Willing to adopt soil test recommendations',
          'Aadhaar linked'
        ],
        target_beneficiaries: ['Farmers', 'Agricultural land holders', 'Cooperative societies'],
        funding_amount: 5000,
        application_process: 'Apply at Krishi Vigyan Kendra or online portal',
        status: 'active',
        applicable_states: ['All States'],
        priority_score: 6
      },
      {
        id: 'national-afforestation',
        name: 'National Afforestation Programme',
        ministry: 'Tribal Affairs',
        description: 'Afforestation and eco-restoration of degraded forest lands',
        eligibility_criteria: [
          'Community participation',
          'Degraded forest land',
          'JFM committee membership',
          'Conservation commitment'
        ],
        target_beneficiaries: ['Forest communities', 'JFM committees', 'Tribal groups'],
        funding_amount: 75000,
        application_process: 'Apply through Forest Department or Gram Sabha',
        status: 'active',
        applicable_states: ['Odisha', 'Madhya Pradesh', 'Chhattisgarh', 'Jharkhand', 'Telangana', 'Tripura'],
        priority_score: 8
      },
      {
        id: 'pradhan-mantri-kisan-sampada',
        name: 'PM Kisan SAMPADA Yojana',
        ministry: 'Agriculture',
        description: 'Integrated cold chain and value addition infrastructure',
        eligibility_criteria: [
          'Food processing unit',
          'Minimum investment capacity',
          'Valid business registration',
          'Technical feasibility'
        ],
        target_beneficiaries: ['Food processors', 'Farmers', 'Entrepreneurs'],
        funding_amount: 100000,
        application_process: 'Apply through Ministry of Food Processing Industries',
        status: 'active',
        applicable_states: ['All States'],
        priority_score: 5
      },
      // Odisha-specific
      {
        id: 'kalia-odisha',
        name: 'KALIA Scheme',
        ministry: 'Agriculture',
        description: 'Krushak Assistance for Livelihood and Income Augmentation for farmers in Odisha',
        eligibility_criteria: ['Small and marginal farmers', 'Sharecroppers', 'Landless agricultural households'],
        target_beneficiaries: ['Farmers', 'Sharecroppers', 'Landless'],
        funding_amount: 10000,
        application_process: 'Apply via Odisha KALIA portal with Aadhaar and land details',
        status: 'active',
        applicable_states: ['Odisha'],
        priority_score: 9
      },
      {
        id: 'biju-pakka-ghara-yojana-odisha',
        name: 'Biju Pucca Ghar Yojana',
        ministry: 'Rural Development',
        description: 'Housing support for rural poor households in Odisha',
        eligibility_criteria: ['No pucca house', 'Odisha resident', 'Rural poor'],
        target_beneficiaries: ['Rural households'],
        funding_amount: 130000,
        application_process: 'Apply through Gram Panchayat in Odisha',
        status: 'active',
        applicable_states: ['Odisha'],
        priority_score: 8
      },
      // Telangana-specific
      {
        id: 'rythu-bandhu-telangana',
        name: 'Rythu Bandhu',
        ministry: 'Agriculture',
        description: 'Investment support scheme for farmers in Telangana',
        eligibility_criteria: ['Land owning farmers in Telangana'],
        target_beneficiaries: ['Farmers'],
        funding_amount: 10000,
        application_process: 'Automatic based on land records in Telangana',
        status: 'active',
        applicable_states: ['Telangana'],
        priority_score: 9
      },
      {
        id: 'dalit-bandhu-telangana',
        name: 'Dalit Bandhu',
        ministry: 'Tribal Affairs',
        description: 'Financial assistance for entrepreneurship to Dalit families in Telangana',
        eligibility_criteria: ['Dalit families in Telangana'],
        target_beneficiaries: ['Dalit families'],
        funding_amount: 1000000,
        application_process: 'Apply through district level offices in Telangana',
        status: 'active',
        applicable_states: ['Telangana'],
        priority_score: 7
      },
      // Madhya Pradesh-specific
      {
        id: 'mp-sambal-yojana',
        name: 'Mukhya Mantri Jan Kalyan (Sambal) Yojana',
        ministry: 'Rural Development',
        description: 'Social security for unorganized workers in MP',
        eligibility_criteria: ['Registered unorganized workers in MP'],
        target_beneficiaries: ['Unorganized workers'],
        funding_amount: 20000,
        application_process: 'Register on MP Sambal portal',
        status: 'active',
        applicable_states: ['Madhya Pradesh'],
        priority_score: 7
      },
      {
        id: 'mp-krishi-udyami-yojana',
        name: 'MP Krishi Udyami Yojana',
        ministry: 'Agriculture',
        description: 'Support for agri-entrepreneurs in MP',
        eligibility_criteria: ['Agri entrepreneurs', 'MP residents'],
        target_beneficiaries: ['Entrepreneurs', 'Farmers'],
        funding_amount: 250000,
        application_process: 'Apply via MP agriculture department portal',
        status: 'active',
        applicable_states: ['Madhya Pradesh'],
        priority_score: 6
      },
      // Tripura-specific
      {
        id: 'tripura-rural-housing',
        name: 'Tripura Rural Housing Scheme',
        ministry: 'Rural Development',
        description: 'State housing assistance for rural families in Tripura',
        eligibility_criteria: ['Rural poor', 'No pucca house', 'Tripura resident'],
        target_beneficiaries: ['Rural households'],
        funding_amount: 120000,
        application_process: 'Apply via Gram Panchayat in Tripura',
        status: 'active',
        applicable_states: ['Tripura'],
        priority_score: 7
      },
      {
        id: 'tripura-farmer-support',
        name: 'Tripura Farmer Support Scheme',
        ministry: 'Agriculture',
        description: 'Input assistance to small and marginal farmers in Tripura',
        eligibility_criteria: ['Small and marginal farmers', 'Tripura resident'],
        target_beneficiaries: ['Farmers'],
        funding_amount: 8000,
        application_process: 'Apply via agriculture department, Tripura',
        status: 'active',
        applicable_states: ['Tripura'],
        priority_score: 6
      }
    ];
  }

  // Get recommended schemes for an approved claim
  public getRecommendedSchemes(claim: {
    claimType?: string;
    area: number;
    village: string;
    state: string;
    applicantName?: string;
  }): CSSScheme[] {
    const recommendations: CSSScheme[] = [];
    
    // Always recommend Forest Rights Act Benefits for FRA patta holders
    const fraBenefits = this.schemes.find(s => s.id === 'forest-rights-benefits');
    if (fraBenefits) {
      recommendations.push(fraBenefits);
    }

    // Recommend based on claim type
    if (claim.claimType === 'IFR' || claim.claimType === 'CR') {
      // Individual or Community Rights - recommend agricultural schemes
      const pmKisan = this.schemes.find(s => s.id === 'pm-kisan');
      const soilHealth = this.schemes.find(s => s.id === 'soil-health-card');
      
      if (pmKisan && claim.area > 0.1) recommendations.push(pmKisan);
      if (soilHealth) recommendations.push(soilHealth);
    }

    // Recommend based on area size
    if (claim.area >= 1) {
      const sampada = this.schemes.find(s => s.id === 'pradhan-mantri-kisan-sampada');
      if (sampada) recommendations.push(sampada);
    }

    // Always recommend basic schemes
    const mgnrega = this.schemes.find(s => s.id === 'mgnrega');
    const awas = this.schemes.find(s => s.id === 'pradhan-mantri-awas');
    const jalJeevan = this.schemes.find(s => s.id === 'jal-jeevan-mission');
    
    if (mgnrega) recommendations.push(mgnrega);
    if (awas) recommendations.push(awas);
    if (jalJeevan) recommendations.push(jalJeevan);

    // Add forest-related schemes for CFR claims
    if (claim.claimType === 'CFR') {
      const afforestation = this.schemes.find(s => s.id === 'national-afforestation');
      if (afforestation) recommendations.push(afforestation);
    }

    // Remove duplicates
    let uniqueRecommendations = recommendations.filter((scheme, index, self) => 
      index === self.findIndex(s => s.id === scheme.id)
    );

    // Filter by state applicability
    if (claim.state) {
      uniqueRecommendations = uniqueRecommendations.filter(s => 
        s.applicable_states.includes('All States') || s.applicable_states.includes(claim.state!)
      );
    }

    return uniqueRecommendations.sort((a, b) => b.priority_score - a.priority_score);
  }

  // Get all available schemes
  public getAllSchemes(): CSSScheme[] {
    return [...this.schemes];
  }

  // Get scheme by ID
  public getSchemeById(id: string): CSSScheme | undefined {
    return this.schemes.find(scheme => scheme.id === id);
  }

  // Get schemes by ministry
  public getSchemesByMinistry(ministry: string): CSSScheme[] {
    return this.schemes.filter(scheme => scheme.ministry === ministry);
  }

  // Get schemes by state
  public getSchemesByState(state: string): CSSScheme[] {
    return this.schemes.filter(scheme => 
      scheme.applicable_states.includes(state) || 
      scheme.applicable_states.includes('All States')
    );
  }

  // AI-enhanced eligibility for an FRA record with basic rule layering
  public getEligibilityForFRARecord(
    fra: FRARecord,
    village?: VillageProfile,
    assetAnalysis?: AssetAnalysisResult
  ): DSSEligibilityResult {
    const claimAreaHectares = fra.area_hectares || 0;
    const stateSchemes = this.getSchemesByState(fra.state);

    const eligible: CSSScheme[] = [];
    const reasoning: Record<string, string> = {};

    const pushEligible = (scheme: CSSScheme | undefined, reason: string) => {
      if (!scheme) return;
      if (eligible.find(s => s.id === scheme.id)) return;
      eligible.push(scheme);
      reasoning[scheme.id] = reason;
    };

    // Rule: FRA patta holders get FRA benefits
    pushEligible(
      stateSchemes.find(s => s.id === 'forest-rights-benefits'),
      'FRA patta holder is eligible for FRA benefits.'
    );

    // Rule: IFR/CR often align with agri support
    if (fra.claim_type === 'IFR' || fra.claim_type === 'CR') {
      pushEligible(
        stateSchemes.find(s => s.id === 'pm-kisan'),
        'Individual/Community rights with agricultural potential qualify for PM-KISAN.'
      );
      pushEligible(
        stateSchemes.find(s => s.id === 'soil-health-card'),
        'Agricultural land holder qualifies for Soil Health Card.'
      );
    }

    // Rule: Larger areas could leverage processing/value-add infra
    if (claimAreaHectares >= 1) {
      pushEligible(
        stateSchemes.find(s => s.id === 'pradhan-mantri-kisan-sampada'),
        'Area above 1 ha may benefit from value-add infrastructure (SAMPADA).'
      );
    }

    // Always useful: basic livelihood and housing
    pushEligible(
      stateSchemes.find(s => s.id === 'mgnrega'),
      'MGNREGA provides wage support for rural households.'
    );
    pushEligible(
      stateSchemes.find(s => s.id === 'pradhan-mantri-awas'),
      'PM Awas Yojana supports housing for eligible rural households.'
    );

    // Add forest-related schemes for CFR claims
    if (fra.claim_type === 'CFR') {
      pushEligible(
        stateSchemes.find(s => s.id === 'national-afforestation'),
        'CFR can align with community-based afforestation activities.'
      );
    }

    // Light AI heuristics from village/asset indicators to refine eligibility
    if (village) {
      // Low water index → elevate water-linked schemes
      if (village.water_index !== undefined && village.water_index < 0.4) {
        pushEligible(
          stateSchemes.find(s => s.id === 'jal-jeevan-mission'),
          'Village has low water index; prioritize household tap connections.'
        );
      }
      // High forest cover → elevate forest-linked supports
      if (village.forest_cover_percentage !== undefined && village.forest_cover_percentage > 40) {
        pushEligible(
          stateSchemes.find(s => s.id === 'national-afforestation'),
          'High forest cover indicates potential for afforestation and forest-based livelihoods.'
        );
      }
    }

    if (assetAnalysis) {
      // Water bodies present but low availability index → harvesting structures
      const hasWaterBodies = (assetAnalysis.land_use_summary?.water_bodies || 0) > 0;
      if (hasWaterBodies && assetAnalysis.environmental_indicators?.water_availability_index < 0.5) {
        pushEligible(
          stateSchemes.find(s => s.id === 'mgnrega'),
          'Water harvesting structures under MGNREGA can enhance water availability.'
        );
      }
    }

    // Sort by priority score
    const eligibleSorted = eligible.sort((a, b) => b.priority_score - a.priority_score);

    return {
      fra_record_id: fra.id,
      village_id: assetAnalysis?.village_id || village?.id || '',
      eligible_schemes: eligibleSorted,
      reasoning
    };
  }

  // Prioritize interventions (e.g., borewells) based on village indicators and asset analysis
  public getPrioritizedInterventions(
    village: VillageProfile,
    assetAnalysis?: AssetAnalysisResult
  ): DSSIntervention[] {
    const interventions: DSSIntervention[] = [];

    const computePriority = (score: number): 'high' | 'medium' | 'low' => {
      if (score >= 67) return 'high';
      if (score >= 34) return 'medium';
      return 'low';
    };

    // Water access intervention via Jal Shakti (borewells/harvesting)
    const waterIndex = village.water_index ?? 0.5;
    const waterScarcity = Math.max(0, 1 - waterIndex); // higher means more scarce
    let waterSignal = Math.round(waterScarcity * 100);
    if (assetAnalysis?.environmental_indicators?.water_availability_index !== undefined) {
      const aiWaterScarcity = Math.max(0, 1 - assetAnalysis.environmental_indicators.water_availability_index);
      waterSignal = Math.round((waterSignal + Math.round(aiWaterScarcity * 100)) / 2);
    }
    interventions.push({
      id: 'intervention-water-borewell',
      name: 'Village borewells and water harvesting structures',
      category: 'water',
      responsible_department: 'Jal Shakti',
      priority_score: waterSignal,
      priority: computePriority(waterSignal),
      reasoning: waterSignal > 66 ? 'Severe water scarcity indicated; immediate intervention recommended.' : (waterSignal > 33 ? 'Moderate scarcity; plan phased implementation.' : 'Relatively adequate water availability.'),
      evidence: {
        water_index: village.water_index,
        vegetation_health_index: assetAnalysis?.environmental_indicators?.vegetation_health_index,
        assets: (assetAnalysis?.assets_detected || []).filter(a => a.asset_type === 'water_body').map(a => a.id)
      },
      estimated_beneficiaries: Math.round(village.total_population * 0.8)
    });

    // Agriculture productivity support via Agriculture
    const agriPotential = assetAnalysis?.development_potential?.agricultural_potential ?? 0.5;
    const agriSignal = Math.round(agriPotential * 100);
    interventions.push({
      id: 'intervention-agri-inputs',
      name: 'Agri productivity support and soil testing drive',
      category: 'agriculture',
      responsible_department: 'Agriculture',
      priority_score: agriSignal,
      priority: computePriority(agriSignal),
      reasoning: agriSignal > 66 ? 'High potential for productivity gains; expedite inputs and soil tests.' : (agriSignal > 33 ? 'Moderate gains possible; schedule KVK camps.' : 'Limited potential; target select plots.'),
      evidence: {
        vegetation_health_index: assetAnalysis?.environmental_indicators?.vegetation_health_index,
        assets: (assetAnalysis?.assets_detected || []).filter(a => a.asset_type === 'agricultural_land').map(a => a.id)
      },
      estimated_beneficiaries: Math.round(village.total_population * 0.6)
    });

    // Forest restoration via Forest Department when high degradation signal
    const forestAreaSqm = (assetAnalysis?.land_use_summary?.forest_cover || 0);
    const forestPotential = assetAnalysis?.development_potential?.forest_management_potential ?? 0.5;
    const forestSignal = Math.round(forestPotential * 100);
    interventions.push({
      id: 'intervention-forest-restoration',
      name: 'Forest restoration and CFR-based livelihood activities',
      category: 'forest',
      responsible_department: 'Forest Department',
      priority_score: forestSignal,
      priority: computePriority(forestSignal),
      reasoning: forestSignal > 66 ? 'High potential for forest management; prioritize restoration and NTFP value chains.' : (forestSignal > 33 ? 'Moderate potential; plan phased CFR initiatives.' : 'Low immediate potential; monitor and reassess.'),
      evidence: {
        vegetation_health_index: assetAnalysis?.environmental_indicators?.vegetation_health_index,
        assets: forestAreaSqm > 0 ? ['forest_area_detected'] : []
      },
      estimated_beneficiaries: Math.round(village.tribal_population * 0.7)
    });

    // Sort by priority score desc
    return interventions.sort((a, b) => b.priority_score - a.priority_score);
  }
}

export const dssService = DSSService.getInstance();
