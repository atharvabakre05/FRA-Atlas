import React, { useState } from 'react';
import { FileText, Eye, Download, MapPin, User, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { claimsService } from '../../services/claimsService';
import { OCRProcessor } from './OCRProcessor';

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

export const DocumentUpload: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'claims' | 'ocr'>('claims');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [claims] = useState<Claim[]>(() => {
    const rawClaims = claimsService.getClaims();
    return rawClaims.map(claim => ({
      ...claim,
      claimId: claim.id || `FRA-${claim.id}`,
      type: claim.claimType || 'IFR',
      applicant: claim.applicantName || 'Unknown Applicant',
      block: 'Kalahandi',
      district: 'Kalahandi',
      state: 'Odisha',
      tribalGroup: 'Gond',
      areaHectares: claim.area,
      grantDate: claim.approved_at,
      documentUrl: claim.document_url
    }));
  });

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
    <div className="space-y-8 animate-forest-fade-in">
      {/* Header */}
      <div className="forest-card-elevated bg-gradient-to-r from-forest-sage/10 to-forest-medium/10 border-forest-medium/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-forest-deep mb-3">Document Review</h1>
            <p className="text-forest-medium text-xl">Review submitted FRA claims and documents</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="forest-badge-primary">
              <FileText className="h-4 w-4 mr-2" />
              <span>Admin Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="forest-card">
        <div className="flex space-x-1 bg-forest-sage/10 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('claims')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === 'claims'
                ? 'bg-white text-forest-dark shadow-forest'
                : 'text-forest-medium hover:text-forest-dark'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Submitted Claims</span>
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === 'ocr'
                ? 'bg-white text-forest-dark shadow-forest'
                : 'text-forest-medium hover:text-forest-dark'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>OCR Processing</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'ocr' ? (
        <OCRProcessor />
      ) : (
        <div className="space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="forest-stat-card">
              <div className="forest-stat-value text-forest-deep">{claims.length}</div>
              <div className="forest-stat-label">Total Claims</div>
              <div className="text-xs text-forest-medium mt-2">All submissions</div>
            </div>
            
            <div className="forest-stat-card">
              <div className="forest-stat-value text-green-600">
                {claims.filter(c => c.status === 'approved').length}
              </div>
              <div className="forest-stat-label">Approved</div>
              <div className="text-xs text-forest-medium mt-2">With documents</div>
            </div>
            
            <div className="forest-stat-card">
              <div className="forest-stat-value text-yellow-600">
                {claims.filter(c => c.status === 'pending').length}
              </div>
              <div className="forest-stat-label">Pending Review</div>
              <div className="text-xs text-forest-medium mt-2">Awaiting decision</div>
            </div>
            
            <div className="forest-stat-card">
              <div className="forest-stat-value text-red-600">
                {claims.filter(c => c.status === 'rejected').length}
              </div>
              <div className="forest-stat-label">Rejected</div>
              <div className="text-xs text-forest-medium mt-2">Require resubmission</div>
            </div>
          </div>

          {/* Claims Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {claims.map((claim) => (
              <div key={claim.id} className="forest-card-elevated hover:shadow-2xl transition-all duration-500 group">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-forest-gradient rounded-xl shadow-lg">
                      {getStatusIcon(claim.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-forest-deep">{claim.applicant}</h3>
                      <p className="text-sm text-forest-medium">{claim.claimId}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className={getStatusColor(claim.status)}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                    <span className="forest-badge bg-forest-sky text-forest-deep">
                      {claim.type}
                    </span>
                  </div>
                </div>

                {/* Claim Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-forest-medium" />
                    <span className="text-sm text-forest-deep">{claim.village}, {claim.district}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-forest-medium" />
                    <span className="text-sm text-forest-deep">{claim.tribalGroup} Community</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-forest-medium" />
                    <span className="text-sm text-forest-deep">{claim.areaHectares} hectares</span>
                  </div>
                  
                  {claim.grantDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-forest-medium" />
                      <span className="text-sm text-forest-deep">Granted: {new Date(claim.grantDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => openClaimModal(claim)}
                  className="forest-button-primary w-full flex items-center justify-center space-x-2 group-hover:shadow-xl transition-all duration-300"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Documents</span>
                </button>
              </div>
            ))}
          </div>

          {/* No Claims Message */}
          {claims.length === 0 && (
            <div className="forest-card-elevated text-center py-16">
              <div className="p-6 bg-forest-sage/20 rounded-2xl w-fit mx-auto mb-6">
                <FileText className="h-16 w-16 text-forest-medium" />
              </div>
              <h3 className="text-2xl font-semibold text-forest-deep mb-4">No Claims Found</h3>
              <p className="text-forest-medium text-lg">
                No claims have been submitted yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Claim Review Modal */}
      {isModalOpen && selectedClaim && (
        <div className="forest-modal" onClick={closeModal}>
          <div className="forest-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="forest-modal-header">
              <div>
                <h2 className="forest-modal-title">Claim Documents</h2>
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
                      <span className="forest-badge bg-forest-sky text-forest-deep">{selectedClaim.type}</span>
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
                            <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-4 w-4 text-forest-medium" />
                                <span className="text-sm text-forest-deep">{doc}</span>
                              </div>
                              <button className="forest-button-secondary text-xs px-3 py-1">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </button>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="forest-modal-footer">
              <button
                onClick={closeModal}
                className="forest-button-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};