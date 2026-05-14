import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, Clock, FileText, MapPin, User, Calendar, Download, Filter, Search, Shield, TreePine, RefreshCw } from 'lucide-react';
import { supabaseClaimsService } from '../../services/supabaseClaimsService';
import { useAuth } from '../../contexts/AuthContext';
import { upsertClaimGeojson, hasGeojson } from '../../services/supabaseGeoService';

interface Claim {
  id?: string;
  user_id: string;
  village: string;
  area: number;
  coordinates: string;
  document_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  approved_at?: string;
  applicantName?: string;
  claimType?: string;
  documents?: string[];
  rejection_reason?: string;
  ack_id?: string;
  // Additional fields for display
  claimId?: string;
  type?: string;
  applicant?: string;
  block?: string;
  district?: string;
  state?: string;
  tribalGroup?: string;
  areaHectares?: number;
  grantDate?: string;
  documentUrl?: string;
}

export const AdminPanel: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [forwardedClaims, setForwardedClaims] = useState<Claim[]>([]);
  const { userType } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const rows = await supabaseClaimsService.listAll();
        const stageFiltered = rows.filter(r => {
          if (userType === 'gp_admin') return (r.stage ?? 'gp') === 'gp';
          if (userType === 'sdlc_admin') return r.stage === 'sdlc';
          if (userType === 'dlc_admin') return r.stage === 'dlc';
          if (userType === 'slmc_admin') return true;
          return false;
        });
        const mapped = stageFiltered.map(r => ({
          id: r.id,
          user_id: r.user_id,
          village: r.village,
          area: r.area,
          coordinates: r.coordinates,
          document_url: r.document_url ?? undefined,
          status: r.status,
          created_at: r.created_at,
          approved_at: r.approved_at ?? undefined,
          applicantName: r.applicant_name ?? undefined,
          claimType: r.claim_type ?? undefined,
          documents: r.documents ?? undefined,
          rejection_reason: r.rejection_reason ?? undefined,
          ack_id: r.ack_id ?? undefined,
          claimId: r.id || `FRA-${r.id}`,
          type: r.claim_type || 'IFR',
          applicant: r.applicant_name || 'Unknown Applicant',
          block: 'Kalahandi',
          district: 'Kalahandi',
          state: 'Odisha',
          tribalGroup: 'Gond',
          areaHectares: r.area,
          grantDate: r.approved_at ?? undefined,
          documentUrl: r.document_url ?? undefined
        }));
        setClaims(mapped);

        // Build forwarded list based on role (any claim that has been forwarded from this stage)
        const forwardedFiltered = rows.filter(r => {
          if (userType === 'gp_admin') return !!r.gp_forwarded_at;
          if (userType === 'sdlc_admin') return !!r.sdlc_forwarded_at;
          if (userType === 'dlc_admin') return false;
          if (userType === 'slmc_admin') return !!r.gp_forwarded_at || !!r.sdlc_forwarded_at;
          return false;
        });
        const forwardedMapped = forwardedFiltered.map(r => ({
          id: r.id,
          user_id: r.user_id,
          village: r.village,
          area: r.area,
          coordinates: r.coordinates,
          document_url: r.document_url ?? undefined,
          status: r.status,
          created_at: r.created_at,
          approved_at: r.approved_at ?? undefined,
          applicantName: r.applicant_name ?? undefined,
          claimType: r.claim_type ?? undefined,
          documents: r.documents ?? undefined,
          rejection_reason: r.rejection_reason ?? undefined,
          ack_id: r.ack_id ?? undefined,
          claimId: r.id || `FRA-${r.id}`,
          type: r.claim_type || 'IFR',
          applicant: r.applicant_name || 'Unknown Applicant',
          block: 'Kalahandi',
          district: 'Kalahandi',
          state: 'Odisha',
          tribalGroup: 'Gond',
          areaHectares: r.area,
          grantDate: r.approved_at ?? undefined,
          documentUrl: r.document_url ?? undefined
        }));
        setForwardedClaims(forwardedMapped);
      } catch (e) {
        console.error('Failed to load claims from Supabase', e);
      }
    })();
  }, []);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [idSearch, setIdSearch] = useState('');
  const [geojsonText, setGeojsonText] = useState<string>('');
  const [geoRequiredError, setGeoRequiredError] = useState<string | null>(null);
  // Rejection reason state
  const rejectionCategories: Record<string, string[]> = {
    'Incomplete / Incorrect Information': [
      "Claimant name missing or incorrect",
      "Father’s/Mother’s/Spouse’s name missing",
      "Gender & Age not provided or invalid",
      "Caste/Tribal Group not mentioned or invalid",
      "Village/District/State details incomplete",
      "Land claimed details missing or unclear",
      "Survey Number / GPS Coordinates missing or invalid"
    ],
    'Document Issues': [
      "Identity Proof missing",
      "Identity Proof invalid or unclear",
      "Tribe/Community Certificate missing",
      "Tribe/Community Certificate invalid or unclear",
      "FRA Claim Form (Form-A) missing",
      "FRA Claim Form (Form-A) invalid or incomplete",
      "Gram Sabha Resolution missing",
      "Gram Sabha Resolution invalid or unsigned"
    ],
    'Eligibility Issues': [
      "Claimant not belonging to a recognized Scheduled Tribe / eligible community",
      "Claimant not residing in the claimed village/district",
      "Land claimed is outside FRA eligibility area"
    ],
    'Verification Issues': [
      "Gram Sabha Resolution verification failed",
      "Claim details could not be verified locally",
      "Duplicate claim found for the same land/survey number"
    ],
    'Other Reasons': [
      'Manually specify reason'
    ]
  };
  const [rejectCategory, setRejectCategory] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectOther, setRejectOther] = useState<string>('');
  const [rejectInlineError, setRejectInlineError] = useState<string>('');
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);

  const sourceClaims = filterStatus === 'forwarded' ? forwardedClaims : claims;
  const filteredClaims = sourceClaims.filter(claim => {
    const statusMatch = filterStatus === 'all' || filterStatus === 'forwarded' || claim.status === filterStatus;
    const searchMatch = searchTerm === '' || 
      (claim.applicant && claim.applicant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      claim.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.claimId && claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()));
    const idMatch = idSearch.trim() === '' ||
      (claim.id && claim.id.toLowerCase().includes(idSearch.trim().toLowerCase())) ||
      (claim.claimId && claim.claimId.toLowerCase().includes(idSearch.trim().toLowerCase())) ||
      (claim.ack_id && claim.ack_id.toLowerCase().includes(idSearch.trim().toLowerCase()));
    
    return statusMatch && searchMatch && idMatch;
  });

  const handleStatusUpdate = async (claimId: string, newStatus: 'approved' | 'rejected') => {
    try {
      let reason: string | undefined;
      if (newStatus === 'rejected') {
        // Build reason from dropdowns / text
        const hasOther = rejectCategory === 'Other Reasons';
        const chosen = hasOther ? (rejectOther?.trim() || '') : (rejectReason?.trim() || '');
        if (!rejectCategory || !chosen) {
          setRejectInlineError('Please select a rejection category and reason (or type a custom reason).');
          return;
        }
        reason = hasOther ? chosen : `${rejectCategory} - ${chosen}`;
      }
      // Require GeoJSON before approving
      if (newStatus === 'approved') {
        const exists = await hasGeojson(claimId);
        if (!exists) {
          setGeoRequiredError('GeoJSON is required before approving. Please paste valid GeoJSON and save.');
          return;
        }
      }
      await supabaseClaimsService.updateStatus({ id: claimId, status: newStatus, rejection_reason: reason });
      // Re-fetch from DB to ensure UI reflects persisted state
      const rows = await supabaseClaimsService.listAll();
      const mapped = rows.map(r => ({
        id: r.id,
        user_id: r.user_id,
        village: r.village,
        area: r.area,
        coordinates: r.coordinates,
        document_url: r.document_url ?? undefined,
        status: r.status,
        created_at: r.created_at,
        approved_at: r.approved_at ?? undefined,
        applicantName: r.applicant_name ?? undefined,
        claimType: r.claim_type ?? undefined,
        documents: r.documents ?? undefined,
        rejection_reason: r.rejection_reason ?? undefined,
        claimId: r.id || `FRA-${r.id}`,
        type: r.claim_type || 'IFR',
        applicant: r.applicant_name || 'Unknown Applicant',
        block: 'Kalahandi',
        district: 'Kalahandi',
        state: 'Odisha',
        tribalGroup: 'Gond',
        areaHectares: r.area,
        grantDate: r.approved_at ?? undefined,
        documentUrl: r.document_url ?? undefined
      }));
      setClaims(mapped);
    } catch (e) {
      console.error('Failed to update status', e);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsModalOpen(false);
      setSelectedClaim(null);
      setGeoRequiredError(null);
      setRejectCategory('');
      setRejectReason('');
      setRejectOther('');
      setRejectInlineError('');
      setShowRejectForm(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectForm(true);
    setRejectInlineError('');
  };

  const handleConfirmReject = async () => {
    if (!selectedClaim) return;
    await handleStatusUpdate(selectedClaim.id!, 'rejected');
  };

  const openClaimModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClaim(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'forest-badge-success';
      case 'pending':
        return 'forest-badge-warning';
      case 'rejected':
        return 'forest-badge-error';
      default:
        return 'forest-badge-secondary';
    }
  };

  const getTypeColor = (type: string | undefined) => {
    switch (type) {
      case 'IFR':
        return 'forest-badge bg-forest-sky text-forest-deep';
      case 'CR':
        return 'forest-badge bg-forest-mint/20 text-forest-medium';
      case 'CFR':
        return 'forest-badge-success';
      default:
        return 'forest-badge-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-forest-fade-in relative">
      {/* Decorative Background */}
      <div className="decor-forest"></div>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{userType === 'gp_admin' ? 'Gram Sabha Admin' : userType === 'sdlc_admin' ? 'SDLC Admin' : userType === 'dlc_admin' ? 'DLC Admin' : 'SLMC Admin'}</h1>
            <p className="text-gray-500 text-sm mt-1">Review and manage claims</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                // Refresh claims data
                (async () => {
                  try {
                    const rows = await supabaseClaimsService.listAll();
                    const mapped = rows.map(r => ({
                      id: r.id,
                      user_id: r.user_id,
                      village: r.village,
                      area: r.area,
                      coordinates: r.coordinates,
                      document_url: r.document_url ?? undefined,
                      status: r.status,
                      created_at: r.created_at,
                      approved_at: r.approved_at ?? undefined,
                      applicantName: r.applicant_name ?? undefined,
                      claimType: r.claim_type ?? undefined,
                      documents: r.documents ?? undefined,
                      rejection_reason: r.rejection_reason ?? undefined,
                      claimId: r.id || `FRA-${r.id}`,
                      type: r.claim_type || 'IFR',
                      applicant: r.applicant_name || 'Unknown Applicant',
                      block: 'Kalahandi',
                      district: 'Kalahandi',
                      state: 'Odisha',
                      tribalGroup: 'Gond',
                      areaHectares: r.area,
                      grantDate: r.approved_at ?? undefined,
                      documentUrl: r.document_url ?? undefined
                    }));
                    setClaims(mapped);
                  } catch (e) {
                    console.error('Failed to refresh claims', e);
                  }
                })();
              }}
              className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <div className="px-2.5 py-1.5 rounded-full text-xs bg-gray-100 text-gray-700 border">Admin Access</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
          <div className="text-2xl font-semibold text-gray-900">{claims.length}</div>
          <div className="text-sm text-gray-500">Total Claims</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
          <div className="text-2xl font-semibold text-green-700">{claims.filter(c => c.status === 'approved').length}</div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
          <div className="text-2xl font-semibold text-forest-deep">{claims.filter(c => c.status === 'pending').length}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm card-accent">
          <div className="text-2xl font-semibold text-forest-primary">{claims.filter(c => c.status === 'rejected').length}</div>
          <div className="text-sm text-gray-500">Rejected</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="forest-form-group">
            <label className="forest-form-label">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="forest-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="forwarded">Forwarded</option>
            </select>
          </div>

          <div className="forest-form-group">
            <label className="forest-form-label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-forest-medium pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search claims..."
                className="forest-input pl-10"
              />
            </div>
          </div>

          <div className="forest-form-group">
            <label className="forest-form-label">Search by ID</label>
            <input
              type="text"
              value={idSearch}
              onChange={(e) => setIdSearch(e.target.value)}
              placeholder="Enter Claim ID or Ack ID"
              className="forest-input"
            />
          </div>

          <div className="forest-form-group">
            <label className="forest-form-label">Actions</label>
            <button className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-forest-sage/10 w-full flex items-center justify-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Claims Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 relative z-10">
        {filteredClaims.map((claim) => (
          <div key={claim.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-md ring-1 ring-inset ring-gray-200">
                  {getStatusIcon(claim.status)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{claim.applicant}</h3>
                  <p className="text-xs text-gray-500">{claim.claimId}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <span className={getStatusColor(claim.status)}>
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </span>
                <span className={getTypeColor(claim.type)}>
                  {claim.type}
                </span>
              </div>
            </div>

            {/* Claim Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{claim.village}, {claim.district}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{claim.tribalGroup} Community</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <TreePine className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{claim.areaHectares} hectares</span>
              </div>
              
              {claim.grantDate && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Granted: {new Date(claim.grantDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
              <button
              onClick={() => openClaimModal(claim)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Review Claim</span>
            </button>

            {/* Forwarded Options Dropdown - visible when filtering Forwarded */}
            {filterStatus === 'forwarded' && (
              <div className="mt-3">
                <label className="forest-form-label">Forwarded Options</label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'assign') {
                      alert('Assigning reviewer (demo only).');
                    } else if (v === 'reviewed') {
                      alert('Marked as reviewed (demo only).');
                    } else if (v === 'timeline') {
                      alert('Open processing timeline (demo only).');
                    }
                    e.currentTarget.selectedIndex = 0;
                  }}
                >
                  <option value="">Select action</option>
                  <option value="timeline">View Timeline</option>
                  <option value="assign">Assign Reviewer</option>
                  <option value="reviewed">Mark as Reviewed</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Claims Message */}
      {filteredClaims.length === 0 && (
        <div className="forest-card-elevated text-center py-16">
          <div className="p-6 bg-forest-sage/20 rounded-2xl w-fit mx-auto mb-6">
            <FileText className="h-16 w-16 text-forest-medium" />
          </div>
          <h3 className="text-2xl font-semibold text-forest-deep mb-4">No Claims Found</h3>
          <p className="text-forest-medium text-lg">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search criteria or filters.'
              : 'No claims have been submitted yet.'}
          </p>
        </div>
      )}

      {/* Claim Review Modal */}
      {isModalOpen && selectedClaim && (
        <div className="forest-modal" onClick={closeModal}>
          <div className="forest-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="forest-modal-header">
              <div>
                <h2 className="forest-modal-title">Review FRA Claim</h2>
                <p className="text-forest-medium mt-2">{selectedClaim.claimId}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-forest-medium hover:text-forest-deep rounded-lg hover:bg-forest-sage/10 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="forest-modal-body">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Claim Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-forest-gradient rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-forest-deep">Claim Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                      <span className="text-forest-medium font-medium">Applicant:</span>
                      <span className="text-forest-deep font-semibold">{selectedClaim.applicant}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                      <span className="text-forest-medium font-medium">Claim Type:</span>
                      <span className={getTypeColor(selectedClaim.type)}>{selectedClaim.type}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                      <span className="text-forest-medium font-medium">Area:</span>
                      <span className="text-forest-deep font-semibold">{selectedClaim.areaHectares} hectares</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                      <span className="text-forest-medium font-medium">Location:</span>
                      <span className="text-forest-deep font-semibold">{selectedClaim.village}, {selectedClaim.district}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                      <span className="text-forest-medium font-medium">Tribal Group:</span>
                      <span className="text-forest-deep font-semibold">{selectedClaim.tribalGroup}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-forest-sage/10 rounded-xl">
                      <span className="text-forest-medium font-medium">Coordinates:</span>
                      <span className="text-forest-deep font-semibold text-sm">{selectedClaim.coordinates}</span>
                    </div>
                  </div>
                </div>

                {/* Documents and Status */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-forest-gradient rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-forest-deep">Documents & Status</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-forest-sage/10 rounded-xl">
                      <h4 className="text-forest-deep font-semibold mb-3">Uploaded Documents:</h4>
                      <div className="space-y-2">
                        {selectedClaim.documents && selectedClaim.documents.length > 0 ? (
                          selectedClaim.documents.map((doc, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                              <FileText className="h-4 w-4 text-forest-medium" />
                              <span className="text-sm text-forest-deep">{doc}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-forest-medium text-sm">No documents uploaded</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-forest-sage/10 rounded-xl">
                      <h4 className="text-forest-deep font-semibold mb-3">Current Status:</h4>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(selectedClaim.status)}
                        <span className={getStatusColor(selectedClaim.status)}>
                          {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                        </span>
                      </div>
                      {selectedClaim.grantDate && (
                        <p className="text-forest-medium text-sm mt-2">
                          Granted on: {new Date(selectedClaim.grantDate).toLocaleDateString()}
                        </p>
                      )}
                      {selectedClaim.status === 'rejected' && selectedClaim.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 font-medium text-sm">Rejection Reason:</p>
                          <p className="text-red-600 text-sm mt-1 italic">"{selectedClaim.rejection_reason}"</p>
                        </div>
                      )}
                    </div>

                  {/* Rejection Reason Selector - Only show when admin clicks Reject */}
                  {selectedClaim.status !== 'approved' && showRejectForm && (
                    <div className="p-4 bg-forest-sage/10 rounded-xl">
                      <h4 className="text-forest-deep font-semibold mb-3">Set Rejection Reason</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="forest-form-label">Category</label>
                          <select
                            value={rejectCategory}
                            onChange={(e) => {
                              setRejectCategory(e.target.value);
                              setRejectReason('');
                              setRejectOther('');
                              setRejectInlineError('');
                            }}
                            className="forest-select w-full"
                          >
                            <option value="">Select category</option>
                            {Object.keys(rejectionCategories).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        {rejectCategory && rejectCategory !== 'Other Reasons' && (
                          <div>
                            <label className="forest-form-label">Reason</label>
                            <select
                              value={rejectReason}
                              onChange={(e) => { setRejectReason(e.target.value); setRejectInlineError(''); }}
                              className="forest-select w-full"
                            >
                              <option value="">Select reason</option>
                              {rejectionCategories[rejectCategory].map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {rejectCategory === 'Other Reasons' && (
                          <div>
                            <label className="forest-form-label">Custom Reason</label>
                            <textarea
                              value={rejectOther}
                              onChange={(e) => { setRejectOther(e.target.value); setRejectInlineError(''); }}
                              placeholder="Type rejection reason"
                              className="w-full h-20 p-2 border rounded-md text-sm"
                            />
                          </div>
                        )}
                        {rejectInlineError && (
                          <p className="text-xs text-red-600">{rejectInlineError}</p>
                        )}
                        <p className="text-xs text-forest-medium">Note: Reason will be visible to the claimant.</p>
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={handleConfirmReject}
                            disabled={!rejectCategory || (!rejectReason && rejectCategory !== 'Other Reasons') || (rejectCategory === 'Other Reasons' && !rejectOther.trim())}
                            className="forest-button-error flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Confirm Rejection</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowRejectForm(false);
                              setRejectCategory('');
                              setRejectReason('');
                              setRejectOther('');
                              setRejectInlineError('');
                            }}
                            className="forest-button-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-forest-sage/10 rounded-xl">
                    <h4 className="text-forest-deep font-semibold mb-3">Claim Boundary (GeoJSON):</h4>
                    <textarea
                      value={geojsonText}
                      onChange={(e) => setGeojsonText(e.target.value)}
                      placeholder="Paste Feature or FeatureCollection GeoJSON here"
                      className="w-full h-32 p-2 border rounded-md text-sm"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="forest-button-secondary"
                        onClick={async () => {
                          try {
                            const parsed = JSON.parse(geojsonText);
                            if (!parsed || (parsed.type !== 'Feature' && parsed.type !== 'FeatureCollection')) {
                              alert('Invalid GeoJSON. Must be Feature or FeatureCollection.');
                              return;
                            }
                            await upsertClaimGeojson(selectedClaim.id!, parsed);
                            alert('GeoJSON saved for this claim.');
                            setGeoRequiredError(null);
                          } catch (err) {
                            alert('Failed to parse/save GeoJSON.');
                          }
                        }}
                      >
                        Save GeoJSON
                      </button>
                      {geoRequiredError && (
                        <span className="text-xs text-red-600">{geoRequiredError}</span>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Role-based actions */}
            <div className="forest-modal-footer">
              <button
                onClick={closeModal}
                className="forest-button-secondary"
              >
                Close
              </button>
              {userType === 'gp_admin' && selectedClaim.status === 'pending' && (
                <>
                  <button
                    onClick={handleRejectClick}
                    className="forest-button-error flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedClaim?.id) return;
                      const exists = await hasGeojson(selectedClaim.id);
                      if (!exists) { alert('GeoJSON required before forwarding to SDLC.'); return; }
                      try { await supabaseClaimsService.forwardStage({ id: selectedClaim.id, from: 'gp' }); closeModal(); } catch { alert('Failed to forward.'); }
                    }}
                    className="forest-button-success flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Forward to SDLC</span>
                  </button>
                </>
              )}

              {userType === 'sdlc_admin' && selectedClaim.status === 'pending' && (
                <>
                  <button
                    onClick={handleRejectClick}
                    className="forest-button-error flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedClaim?.id) return;
                      try { await supabaseClaimsService.forwardStage({ id: selectedClaim.id, from: 'sdlc' }); closeModal(); } catch { alert('Failed to forward.'); }
                    }}
                    className="forest-button-success flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Forward to DLC</span>
                  </button>
                </>
              )}

              {userType === 'dlc_admin' && selectedClaim.status === 'pending' && (
                <>
                  <button
                    onClick={handleRejectClick}
                    className="forest-button-error flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedClaim?.id) return;
                      const exists = await hasGeojson(selectedClaim.id);
                      if (!exists) { alert('GeoJSON required for final approval.'); return; }
                      try { await supabaseClaimsService.finalApproveByDlc(selectedClaim.id); closeModal(); } catch { alert('Failed to approve.'); }
                    }}
                    className="forest-button-success flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Final Approve</span>
                  </button>
                </>
              )}

              {userType === 'slmc_admin' && (
                <div className="text-sm text-forest-medium">Read-only dashboard. No actions available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};