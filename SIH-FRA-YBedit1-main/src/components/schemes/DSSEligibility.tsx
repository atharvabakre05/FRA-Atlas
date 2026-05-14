import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Search, Filter, Award, Users, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  eligibilityCriteria: {
    minArea?: number;
    maxArea?: number;
    claimTypes?: string[];
    ageRange?: { min: number; max: number };
    incomeLimit?: number;
    specialRequirements?: string[];
  };
  benefits: string[];
  applicationProcess: string[];
  status: 'active' | 'inactive';
}

interface UserProfile {
  age: number;
  area: number;
  claimType: string;
  income: number;
  village: string;
}

const mockSchemes: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Scheme',
    description: 'Direct income support to farmers for agricultural activities',
    category: 'Agriculture',
    eligibilityCriteria: {
      minArea: 0.1,
      maxArea: 50,
      claimTypes: ['Individual', 'Community'],
      ageRange: { min: 18, max: 100 },
      incomeLimit: 200000
    },
    benefits: [
      '₹6,000 per year in 3 installments',
      'Direct bank transfer',
      'No middleman involvement'
    ],
    applicationProcess: [
      'Submit FRA claim',
      'Get land patta',
      'Register on PM-KISAN portal',
      'Link Aadhaar and bank account'
    ],
    status: 'active'
  },
  {
    id: 'mgnrega',
    name: 'MGNREGA',
    description: 'Guaranteed employment for rural households',
    category: 'Employment',
    eligibilityCriteria: {
      ageRange: { min: 18, max: 65 },
      specialRequirements: ['Rural residence', 'Job card required']
    },
    benefits: [
      '100 days guaranteed employment',
      'Minimum wage guarantee',
      'Skill development opportunities'
    ],
    applicationProcess: [
      'Apply for job card at Gram Panchayat',
      'Submit required documents',
      'Get job card within 15 days',
      'Demand work when needed'
    ],
    status: 'active'
  },
  {
    id: 'pradhan-mantri-awas',
    name: 'Pradhan Mantri Awas Yojana',
    description: 'Housing for all by 2022',
    category: 'Housing',
    eligibilityCriteria: {
      incomeLimit: 300000,
      specialRequirements: ['No pucca house', 'Land ownership']
    },
    benefits: [
      '₹1.2 lakh financial assistance',
      'Technical support',
      'Convergence with other schemes'
    ],
    applicationProcess: [
      'Submit application at Gram Panchayat',
      'Verification of documents',
      'Selection through lottery',
      'Construction and monitoring'
    ],
    status: 'active'
  },
  {
    id: 'forest-rights-act',
    name: 'Forest Rights Act Benefits',
    description: 'Comprehensive benefits for FRA title holders',
    category: 'Forest Rights',
    eligibilityCriteria: {
      claimTypes: ['Individual', 'Community', 'Community Resource Rights'],
      specialRequirements: ['FRA title holder']
    },
    benefits: [
      'Land ownership rights',
      'Access to forest resources',
      'Protection from eviction',
      'Development fund allocation'
    ],
    applicationProcess: [
      'Submit FRA claim',
      'Gram Sabha verification',
      'District Level Committee approval',
      'Title deed issuance'
    ],
    status: 'active'
  }
];

export const DSSEligibility: React.FC = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 35,
    area: 2.5,
    claimType: 'Individual',
    income: 150000,
    village: 'Poduchunapadar'
  });
  const [eligibleSchemes, setEligibleSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    checkEligibility();
  }, [userProfile]);

  useEffect(() => {
    filterSchemes();
  }, [eligibleSchemes, searchTerm, selectedCategory]);

  const checkEligibility = () => {
    const eligible = mockSchemes.filter(scheme => {
      const criteria = scheme.eligibilityCriteria;
      
      // Check area requirements
      if (criteria.minArea && userProfile.area < criteria.minArea) return false;
      if (criteria.maxArea && userProfile.area > criteria.maxArea) return false;
      
      // Check claim type
      if (criteria.claimTypes && !criteria.claimTypes.includes(userProfile.claimType)) return false;
      
      // Check age range
      if (criteria.ageRange) {
        if (userProfile.age < criteria.ageRange.min || userProfile.age > criteria.ageRange.max) return false;
      }
      
      // Check income limit
      if (criteria.incomeLimit && userProfile.income > criteria.incomeLimit) return false;
      
      return true;
    });
    
    setEligibleSchemes(eligible);
  };

  const filterSchemes = () => {
    let filtered = eligibleSchemes;
    
    if (searchTerm) {
      filtered = filtered.filter(scheme =>
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scheme => scheme.category === selectedCategory);
    }
    
    setFilteredSchemes(filtered);
  };

  const getEligibilityScore = (scheme: Scheme): number => {
    const criteria = scheme.eligibilityCriteria;
    let score = 0;
    let totalChecks = 0;
    
    if (criteria.minArea || criteria.maxArea) {
      totalChecks++;
      if ((!criteria.minArea || userProfile.area >= criteria.minArea) &&
          (!criteria.maxArea || userProfile.area <= criteria.maxArea)) {
        score++;
      }
    }
    
    if (criteria.claimTypes) {
      totalChecks++;
      if (criteria.claimTypes.includes(userProfile.claimType)) {
        score++;
      }
    }
    
    if (criteria.ageRange) {
      totalChecks++;
      if (userProfile.age >= criteria.ageRange.min && userProfile.age <= criteria.ageRange.max) {
        score++;
      }
    }
    
    if (criteria.incomeLimit) {
      totalChecks++;
      if (userProfile.income <= criteria.incomeLimit) {
        score++;
      }
    }
    
    return totalChecks > 0 ? Math.round((score / totalChecks) * 100) : 100;
  };

  const categories = ['all', ...Array.from(new Set(mockSchemes.map(s => s.category)))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="forest-card bg-gradient-to-r from-forest-sage/10 to-forest-medium/10 border-forest-medium/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-forest-dark mb-2">Decision Support System</h1>
            <p className="text-forest-medium text-lg">AI-powered scheme eligibility assessment for FRA beneficiaries</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="forest-badge-success">
              <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse mr-2"></div>
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="forest-card">
        <h3 className="text-lg font-semibold text-forest-dark mb-4">Your Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="forest-form-label">Age</label>
            <input
              type="number"
              value={userProfile.age}
              onChange={(e) => setUserProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              className="forest-input"
              min="18"
              max="100"
            />
          </div>
          <div>
            <label className="forest-form-label">Land Area (hectares)</label>
            <input
              type="number"
              step="0.1"
              value={userProfile.area}
              onChange={(e) => setUserProfile(prev => ({ ...prev, area: parseFloat(e.target.value) || 0 }))}
              className="forest-input"
              min="0"
            />
          </div>
          <div>
            <label className="forest-form-label">Claim Type</label>
            <select
              value={userProfile.claimType}
              onChange={(e) => setUserProfile(prev => ({ ...prev, claimType: e.target.value }))}
              className="forest-select"
            >
              <option value="Individual">Individual</option>
              <option value="Community">Community</option>
              <option value="Community Resource Rights">Community Resource Rights</option>
            </select>
          </div>
          <div>
            <label className="forest-form-label">Annual Income (₹)</label>
            <input
              type="number"
              value={userProfile.income}
              onChange={(e) => setUserProfile(prev => ({ ...prev, income: parseInt(e.target.value) || 0 }))}
              className="forest-input"
              min="0"
            />
          </div>
          <div>
            <label className="forest-form-label">Village</label>
            <input
              type="text"
              value={userProfile.village}
              readOnly
              className="forest-input bg-forest-sage/10"
            />
          </div>
        </div>
      </div>

      {/* Eligibility Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="forest-stat-card text-center">
          <div className="forest-stat-value text-forest-dark">{eligibleSchemes.length}</div>
          <div className="forest-stat-label">Eligible Schemes</div>
          <div className="text-xs text-forest-medium mt-1">Based on your profile</div>
        </div>
        <div className="forest-stat-card text-center">
          <div className="forest-stat-value text-green-600">
            {Math.round((eligibleSchemes.length / mockSchemes.length) * 100)}%
          </div>
          <div className="forest-stat-label">Eligibility Rate</div>
          <div className="text-xs text-forest-medium mt-1">Overall scheme coverage</div>
        </div>
        <div className="forest-stat-card text-center">
          <div className="forest-stat-value text-forest-accent">
            {categories.length - 1}
          </div>
          <div className="forest-stat-label">Categories</div>
          <div className="text-xs text-forest-medium mt-1">Available scheme types</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="forest-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-forest-medium" />
            <input
              type="text"
              placeholder="Search schemes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="forest-input pl-10"
            />
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="forest-select w-full"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Eligible Schemes */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-forest-dark">
          Eligible Schemes ({filteredSchemes.length})
        </h3>
        
        {filteredSchemes.length === 0 ? (
          <div className="forest-card text-center py-12">
            <Award className="h-12 w-12 text-forest-medium mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-forest-dark mb-2">No eligible schemes found</h3>
            <p className="text-forest-medium">Try adjusting your profile or search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSchemes.map(scheme => {
              const score = getEligibilityScore(scheme);
              return (
                <div key={scheme.id} className="forest-card hover:shadow-forest-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-forest-dark mb-1">{scheme.name}</h4>
                      <p className="text-forest-medium text-sm mb-2">{scheme.description}</p>
                      <span className="forest-badge bg-forest-sage/20 text-forest-dark">
                        {scheme.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{score}%</div>
                      <div className="text-xs text-forest-medium">Match</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Benefits */}
                    <div>
                      <h5 className="font-medium text-forest-dark mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Benefits
                      </h5>
                      <ul className="space-y-1">
                        {scheme.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-forest-medium flex items-start">
                            <span className="w-1.5 h-1.5 bg-forest-medium rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Application Process */}
                    <div>
                      <h5 className="font-medium text-forest-dark mb-2 flex items-center">
                        <Users className="h-4 w-4 text-forest-accent mr-2" />
                        Application Process
                      </h5>
                      <ol className="space-y-1">
                        {scheme.applicationProcess.map((step, index) => (
                          <li key={index} className="text-sm text-forest-medium flex items-start">
                            <span className="w-5 h-5 bg-forest-sage/20 text-forest-dark rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5 flex-shrink-0">
                              {index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-forest-sage/20">
                      <button className="w-full forest-button-primary">
                        Apply for {scheme.name}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="forest-card bg-forest-earth/10 border-forest-earth/30">
        <h3 className="text-lg font-semibold text-forest-dark mb-4">How DSS Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-forest-dark mb-2">AI-Powered Matching</h4>
            <p className="text-sm text-forest-medium">
              Our system analyzes your profile against scheme criteria to find the best matches. 
              The eligibility score shows how well you match each scheme's requirements.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-forest-dark mb-2">Real-time Updates</h4>
            <p className="text-sm text-forest-medium">
              Scheme eligibility is updated in real-time based on government notifications. 
              New schemes are automatically added to the system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
