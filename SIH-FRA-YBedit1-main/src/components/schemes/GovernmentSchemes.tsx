import React, { useEffect, useMemo, useState } from 'react';
import { Award, Calendar, MapPin, DollarSign, Filter, ExternalLink, ListChecks, Droplets, Leaf } from 'lucide-react';
import { dssService } from '../../services/dssService';
import { FRARecord, VillageProfile, AssetAnalysisResult } from '../../types';

const mockSchemes = [
  {
    id: 1,
    name: 'PM-KISAN Scheme',
    description: 'Direct income support to farmers with small and marginal holdings',
    eligibility: ['Small farmers', 'Marginal land holders', 'Agricultural plots'],
    funding: 6000,
    deadline: '2024-03-31',
    status: 'active' as const,
    states: ['Karnataka', 'Maharashtra', 'Tamil Nadu'],
    zoneTypes: ['agricultural'],
    category: 'Income Support'
  },
  {
    id: 2,
    name: 'Forest Rights Act',
    description: 'Recognition of forest dwelling communities and their rights over forest land',
    eligibility: ['Forest dwelling communities', 'Tribal populations', 'Forest plots'],
    funding: 25000,
    deadline: '2024-06-30',
    status: 'active' as const,
    states: ['Karnataka', 'Maharashtra'],
    zoneTypes: ['forest'],
    category: 'Land Rights'
  },
  {
    id: 3,
    name: 'Watershed Development Scheme',
    description: 'Sustainable development of natural resources in watershed areas',
    eligibility: ['Water scarce areas', 'Degraded lands', 'Rural communities'],
    funding: 150000,
    deadline: '2024-12-31',
    status: 'active' as const,
    states: ['Karnataka', 'Tamil Nadu', 'Gujarat'],
    zoneTypes: ['agricultural', 'water'],
    category: 'Water Conservation'
  },
  {
    id: 4,
    name: 'Soil Health Card Scheme',
    description: 'Soil testing and nutrient management for sustainable agriculture',
    eligibility: ['All farmers', 'Agricultural land', 'Cooperative societies'],
    funding: 5000,
    deadline: '2024-04-15',
    status: 'active' as const,
    states: ['All States'],
    zoneTypes: ['agricultural'],
    category: 'Soil Management'
  },
  {
    id: 5,
    name: 'National Afforestation Programme',
    description: 'Afforestation and eco-restoration of degraded forest lands',
    eligibility: ['Degraded forest land', 'Community participation', 'JFM committees'],
    funding: 75000,
    deadline: '2024-08-31',
    status: 'upcoming' as const,
    states: ['Karnataka', 'Kerala', 'Tamil Nadu'],
    zoneTypes: ['forest', 'water'],
    category: 'Afforestation'
  }
];

export const GovernmentSchemes: React.FC = () => {
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [claimType, setClaimType] = useState<'IFR' | 'CR' | 'CFR'>('IFR');
  const [areaHectares, setAreaHectares] = useState<number>(1);
  const [recommended, setRecommended] = useState(() => [] as ReturnType<typeof dssService.getRecommendedSchemes>);

  // Minimal mocked FRA record and village context for DSS panel
  const [selectedFra, setSelectedFra] = useState<FRARecord | null>(null);
  const [villageProfile, setVillageProfile] = useState<VillageProfile | null>(null);
  const [assetAnalysis, setAssetAnalysis] = useState<AssetAnalysisResult | null>(null);

  const filteredSchemes = mockSchemes.filter(scheme => {
    const stateMatch = selectedState === 'all' || 
                     scheme.states.includes(selectedState) || 
                     scheme.states.includes('All States');
    const categoryMatch = selectedCategory === 'all' || scheme.category === selectedCategory;
    const zoneMatch = selectedZone === 'all' || scheme.zoneTypes.includes(selectedZone);
    
    return stateMatch && categoryMatch && zoneMatch;
  });

  useEffect(() => {
    // Compute DSS recommendations whenever factors change
    const stateForDss = selectedState === 'all' ? 'Odisha' : selectedState;
    const recos = dssService.getRecommendedSchemes({
      claimType,
      area: isNaN(areaHectares) ? 0 : areaHectares,
      village: '-',
      state: stateForDss,
      applicantName: undefined
    });
    setRecommended(recos);
  }, [selectedState, claimType, areaHectares]);

  // Initialize mock FRA and village context for the DSS panel
  useEffect(() => {
    const fra: FRARecord = {
      id: 'fra-demo-1',
      claim_id: 'claim-001',
      patta_number: 'FRA/OD/2024/12345',
      claim_type: claimType,
      status: 'granted',
      applicant_name: 'Demo Applicant',
      village: 'Demo Village',
      block: 'Demo Block',
      district: 'Demo District',
      state: (selectedState === 'all' ? 'Odisha' : (selectedState as any)) || 'Odisha',
      tribal_group: 'Gond',
      coordinates: { lat: 20.26, lng: 84.25 },
      area_hectares: isNaN(areaHectares) ? 0 : areaHectares,
      claim_date: new Date().toISOString(),
      documents: [],
      assets: [],
      eligible_schemes: [],
      created_at: new Date().toISOString()
    };
    setSelectedFra(fra);

    const village: VillageProfile = {
      id: 'village-001',
      name: 'Demo Village',
      block: 'Demo Block',
      district: 'Demo District',
      state: fra.state,
      tribal_population: 1200,
      total_population: 1800,
      fra_claims_total: 150,
      fra_claims_granted: 110,
      water_index: 0.32,
      forest_cover_percentage: 47,
      infrastructure_score: 0.38,
      coordinates: { lat: 20.26, lng: 84.25 },
      assets_summary: {
        agricultural_land: 350000,
        water_bodies: 42000,
        forest_area: 510000,
        homesteads: 80000
      }
    };
    setVillageProfile(village);

    const analysis: AssetAnalysisResult = {
      village_id: village.id,
      total_area_analyzed: 1000000,
      assets_detected: [],
      land_use_summary: {
        agricultural_land: 350000,
        forest_cover: 510000,
        water_bodies: 42000,
        homesteads: 80000,
        infrastructure: 18000,
        barren_land: 0
      },
      environmental_indicators: {
        vegetation_health_index: 0.58,
        water_availability_index: 0.35,
        soil_fertility_index: 0.6,
        biodiversity_index: 0.62,
        carbon_sequestration_potential: 0.7
      },
      development_potential: {
        agricultural_potential: 0.7,
        forest_management_potential: 0.76,
        water_harvesting_potential: 0.68,
        ecotourism_potential: 0.55,
        renewable_energy_potential: 0.5
      },
      analysis_date: new Date().toISOString(),
      confidence_level: 0.85,
      recommendations: []
    };
    setAssetAnalysis(analysis);
  }, [selectedState, claimType, areaHectares]);

  const eligibility = useMemo(() => {
    if (!selectedFra) return null;
    return dssService.getEligibilityForFRARecord(selectedFra, villageProfile || undefined, assetAnalysis || undefined);
  }, [selectedFra, villageProfile, assetAnalysis]);

  const interventions = useMemo(() => {
    if (!villageProfile) return [];
    return dssService.getPrioritizedInterventions(villageProfile, assetAnalysis || undefined);
  }, [villageProfile, assetAnalysis]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'forest-badge-success';
      case 'upcoming':
        return 'forest-badge bg-forest-sky text-forest-dark';
      case 'closed':
        return 'forest-badge-secondary';
      default:
        return 'forest-badge-secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 relative">
      <div className="decor-flowers"></div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Decision Support System</h1>
            <p className="text-gray-500 text-sm mt-1">AI-powered scheme eligibility assessment and discovery</p>
          </div>
          <div className="px-2.5 py-1.5 rounded-full text-xs bg-gray-100 text-gray-700 border">Schemes</div>
        </div>
      </div>

      {/* Government Schemes Content */}
      <div className="space-y-8">
          {/* DSS: Eligibility & Interventions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-forest-gradient rounded-lg"><ListChecks className="h-4 w-4 text-white" /></div>
              <h3 className="text-lg font-medium text-gray-900">DSS: Eligibility & Interventions</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Eligibility with reasoning */}
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4 text-forest-primary" />
                  <div className="font-medium text-gray-900">Eligible Schemes</div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {!eligibility || eligibility.eligible_schemes.length === 0 ? (
                    <div className="text-sm text-gray-500">No eligible schemes detected for the selected FRA record.</div>
                  ) : (
                    eligibility.eligible_schemes.map(s => (
                      <div key={s.id} className="border border-gray-200 rounded p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                            <div className="text-xs text-gray-600 mt-1">{s.description}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="forest-badge-secondary text-xs">{s.ministry}</span>
                              <span className="forest-badge-success text-xs">Priority {s.priority_score}</span>
                            </div>
                          </div>
                        </div>
                        {eligibility.reasoning[s.id] && (
                          <div className="mt-3 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">
                            <span className="font-medium">Reasoning:</span> {eligibility.reasoning[s.id]}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Interventions */}
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="h-4 w-4 text-forest-primary" />
                  <div className="font-medium text-gray-900">Prioritized Interventions</div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {interventions.length === 0 ? (
                    <div className="text-sm text-gray-500">No interventions prioritized for the selected village.</div>
                  ) : (
                    interventions.map(iv => (
                      <div key={iv.id} className="border border-gray-200 rounded p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{iv.name}</div>
                            <div className="text-xs text-gray-600 mt-1">{iv.reasoning}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="forest-badge-secondary text-xs">{iv.category}</span>
                              <span className="forest-badge text-xs">{iv.responsible_department}</span>
                              <span className={`forest-badge-success text-xs`}>Priority {iv.priority_score} ({iv.priority})</span>
                            </div>
                          </div>
                          <Leaf className="h-4 w-4 text-forest-primary" />
                        </div>
                        {typeof iv.estimated_beneficiaries === 'number' && (
                          <div className="mt-2 text-xs text-gray-700">Estimated beneficiaries: {iv.estimated_beneficiaries.toLocaleString('en-IN')}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* DSS Recommendations */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-forest-gradient rounded-lg"><Award className="h-4 w-4 text-white" /></div>
              <h3 className="text-lg font-medium text-gray-900">Recommended for you</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="forest-form-label">Claim Type</label>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value as 'IFR' | 'CR' | 'CFR')}
                  className="forest-select"
                >
                  <option value="IFR">IFR</option>
                  <option value="CR">CR</option>
                  <option value="CFR">CFR</option>
                </select>
              </div>
              <div>
                <label className="forest-form-label">Area (hectares)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={areaHectares}
                  onChange={(e) => setAreaHectares(parseFloat(e.target.value))}
                  className="forest-input"
                />
              </div>
              <div>
                <label className="forest-form-label">State for DSS</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="forest-select"
                >
                  <option value="all">Auto (defaults to Odisha)</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                </select>
              </div>
            </div>

            {recommended.length === 0 ? (
              <div className="text-sm text-gray-500">No recommendations yet. Adjust inputs above.</div>
            ) : (
              <div className="space-y-3">
                {recommended.map((scheme) => (
                  <div key={scheme.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{scheme.name}</div>
                        <div className="text-xs text-gray-600 mt-1 max-w-2xl">{scheme.description}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="forest-badge-secondary text-xs">{scheme.ministry}</span>
                          <span className="forest-badge-success text-xs">Priority {scheme.priority_score}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Funding</div>
                        <div className="text-sm font-medium text-forest-primary">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(scheme.funding_amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-forest-gradient rounded-lg"><Filter className="h-4 w-4 text-white" /></div>
              <h3 className="text-lg font-medium text-gray-900">Filter Schemes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="forest-form-label">State</label>
                <select 
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="forest-select"
                >
                  <option value="all">All States</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Kerala">Kerala</option>
                </select>
              </div>

              <div>
                <label className="forest-form-label">Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="forest-select"
                >
                  <option value="all">All Categories</option>
                  <option value="Income Support">Income Support</option>
                  <option value="Land Rights">Land Rights</option>
                  <option value="Water Conservation">Water Conservation</option>
                  <option value="Soil Management">Soil Management</option>
                  <option value="Afforestation">Afforestation</option>
                </select>
              </div>

              <div>
                <label className="forest-form-label">Zone Type</label>
                <select 
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="forest-select"
                >
                  <option value="all">All Zones</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="forest">Forest</option>
                  <option value="water">Water Bodies</option>
                  <option value="residential">Residential</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent text-center">
              <div className="text-2xl font-semibold text-gray-900">{filteredSchemes.length}</div>
              <div className="text-sm text-gray-500">Available Schemes</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent text-center">
              <div className="text-2xl font-semibold text-forest-primary">{filteredSchemes.filter(s => s.status === 'active').length}</div>
              <div className="text-sm text-gray-500">Active Schemes</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent text-center">
              <div className="text-2xl font-semibold text-forest-primary">{formatCurrency(filteredSchemes.reduce((sum, scheme) => sum + scheme.funding, 0))}</div>
              <div className="text-sm text-gray-500">Total Funding</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent text-center">
              <div className="text-2xl font-semibold text-forest-primary">47</div>
              <div className="text-sm text-gray-500">Eligible Plots</div>
            </div>
          </div>

          {/* Schemes List */}
          <div className="space-y-4 relative z-10">
            {filteredSchemes.map((scheme) => (
              <div key={scheme.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition relative overflow-hidden">
                {/* Decorative per-scheme background */}
                <div className="absolute inset-0 pointer-events-none opacity-10 select-none"
                  style={{ backgroundRepeat: 'no-repeat', backgroundPosition: 'right -10px bottom -10px', backgroundSize: '180px', backgroundImage: scheme.zoneTypes.includes('forest') ? "url('data:image/svg+xml,%3Csvg width=\\'180\\' height=\\'180\\' viewBox=\\'0 0 180 180\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg opacity=\\'0.8\\'%3E%3Cpath d=\\'M90 10 L120 70 L110 70 L130 110 L120 110 L140 150 L40 150 L60 110 L50 110 L70 70 L60 70 Z\\' fill=\\'%231B4332\\'/%3E%3Crect x=\\'85\\' y=\\'150\\' width=\\'10\\' height=\\'20\\' fill=\\'%238B5A3C\\'/%3E%3C/g%3E%3C/svg%3E')" : scheme.zoneTypes.includes('water') ? "url('data:image/svg+xml,%3Csvg width=\\'180\\' height=\\'180\\' viewBox=\\'0 0 180 180\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg opacity=\\'0.8\\'%3E%3Ccircle cx=\\'90\\' cy=\\'90\\' r=\\'50\\' fill=\\'%2395D5B2\\'/%3E%3C/g%3E%3C/svg%3E')" : "url('data:image/svg+xml,%3Csvg width=\\'180\\' height=\\'180\\' viewBox=\\'0 0 180 180\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg opacity=\\'0.8\\'%3E%3Crect x=\\'40\\' y=\\'120\\' width=\\'100\\' height=\\'40\\' fill=\\'%23D8F3DC\\'/%3E%3C/g%3E%3C/svg%3E')" }}
                />
                <div className="flex items-start justify-between mb-4 relative">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-md">
                      <Award className="h-5 w-5 text-forest-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{scheme.name}</h3>
                      <p className="text-gray-600 mt-1 max-w-2xl text-sm">{scheme.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`forest-badge capitalize ${getStatusColor(scheme.status)}`}>
                      {scheme.status}
                    </span>
                    <button className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 border transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Eligibility</h4>
                    <div className="flex flex-wrap gap-2">
                      {scheme.eligibility.map((criteria, index) => (
                        <span key={index} className="forest-badge-secondary text-xs">
                          {criteria}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Coverage</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{scheme.states.join(', ')}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scheme.zoneTypes.map((zone, index) => (
                          <span key={index} className="forest-badge-success text-xs capitalize">
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <DollarSign className="h-4 w-4 text-forest-primary" />
                        <span className="font-semibold">{formatCurrency(scheme.funding)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {new Date(scheme.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <button className="px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-forest-medium mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-forest-dark mb-2">No schemes found</h3>
              <p className="text-forest-medium">Try adjusting your filters to find relevant schemes.</p>
            </div>
          )}
      </div>
    </div>
  );
};