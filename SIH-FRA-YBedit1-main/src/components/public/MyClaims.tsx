import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, XCircle, MapPin, Calendar, Download, Search, Trash2, Award, ExternalLink, Star } from 'lucide-react';
import { supabaseClaimsService, SupabaseClaimRow } from '../../services/supabaseClaimsService';
import { deleteGeojsonByClaimId } from '../../services/supabaseGeoService';
import { useAuth } from '../../contexts/AuthContext';
import { Claim } from '../../services/claimsService';
import { dssService } from '../../services/dssService';
import { CSSScheme } from '../../types';

type ClaimWithAck = Claim & {
  ack_id?: string | null;
  rejection_reason?: string | null;
  stage?: 'gp' | 'sdlc' | 'dlc' | 'approved' | 'rejected' | null;
  gp_forwarded_at?: string | null;
  sdlc_forwarded_at?: string | null;
  dlc_decided_at?: string | null;
};

export const MyClaims: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ClaimWithAck[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [ackSearch, setAckSearch] = useState('');
  const [ackResult, setAckResult] = useState<Claim | null>(null);
  const [ackRow, setAckRow] = useState<SupabaseClaimRow | null>(null);
  const [ackLoading, setAckLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [recommendedSchemes, setRecommendedSchemes] = useState<Record<string, CSSScheme[]>>({});
  const [expandedRecommendations, setExpandedRecommendations] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    if (user?.id) {
      loadClaims();
    }
  }, [user?.id]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      // fetch from Supabase, filter by user_id
      const rows = await supabaseClaimsService.listAll();
      const userRows = rows.filter(r => r.user_id === user!.id);
      const userClaims: ClaimWithAck[] = userRows.map(r => ({
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
        ack_id: r.ack_id ?? undefined,
        rejection_reason: r.rejection_reason ?? undefined,
        stage: r.stage ?? null,
        gp_forwarded_at: r.gp_forwarded_at ?? null,
        sdlc_forwarded_at: r.sdlc_forwarded_at ?? null,
        dlc_decided_at: r.dlc_decided_at ?? null,
      }));
      const userStats = {
        total: userClaims.length,
        approved: userClaims.filter(c => c.status === 'approved').length,
        pending: userClaims.filter(c => c.status === 'pending').length,
        rejected: userClaims.filter(c => c.status === 'rejected').length,
      };
      
      setClaims(userClaims);
      setStats(userStats);
      
      // Generate scheme recommendations for approved claims
      const schemes: Record<string, CSSScheme[]> = {};
      userClaims.forEach(claim => {
        if (claim.status === 'approved') {
          schemes[claim.id!] = dssService.getRecommendedSchemes({
            claimType: claim.claimType,
            area: claim.area,
            village: claim.village,
            state: (ackRow?.state as string) || (claim as any).state || 'Odisha',
            applicantName: claim.applicantName
          });
        }
      });
      setRecommendedSchemes(schemes);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressTracker = (claim: ClaimWithAck) => {
    const stage = claim.stage || 'gp';
    const isRejected = claim.status === 'rejected' || stage === 'rejected';
    const isApproved = claim.status === 'approved' || stage === 'approved';

    type Step = {
      key: 'gp' | 'sdlc' | 'dlc' | 'final';
      label: string;
      status: 'Pending' | 'Approved' | 'Rejected' | 'Forwarded' | 'Current';
      active: boolean;
      completed: boolean;
      rejected: boolean;
    };

    const steps: Step[] = [
      {
        key: 'gp',
        label: 'Gram Sabha',
        status:
          stage === 'gp' && !isRejected && !isApproved ? 'Current' :
          (claim.gp_forwarded_at || stage === 'sdlc' || stage === 'dlc' || isApproved || isRejected) ? 'Forwarded' : 'Pending',
        active: stage === 'gp' && !isRejected && !isApproved,
        completed: !!claim.gp_forwarded_at || stage !== 'gp',
        rejected: false,
      },
      {
        key: 'sdlc',
        label: 'SDLC',
        status:
          stage === 'sdlc' && !isRejected && !isApproved ? 'Current' :
          (claim.sdlc_forwarded_at || stage === 'dlc' || isApproved || isRejected) ? 'Forwarded' :
          (stage === 'gp' ? 'Pending' : 'Pending'),
        active: stage === 'sdlc' && !isRejected && !isApproved,
        completed: !!claim.sdlc_forwarded_at || stage === 'dlc' || isApproved || isRejected,
        rejected: false,
      },
      {
        key: 'dlc',
        label: 'DLC',
        status:
          stage === 'dlc' && !isRejected && !isApproved ? 'Current' :
          isApproved ? 'Approved' :
          isRejected ? 'Rejected' :
          (stage === 'sdlc' ? 'Pending' : (stage === 'gp' ? 'Pending' : 'Forwarded')),
        active: stage === 'dlc' && !isRejected && !isApproved,
        completed: isApproved || isRejected,
        rejected: isRejected,
      },
      {
        key: 'final',
        label: 'Final',
        status: isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending',
        active: false,
        completed: isApproved || isRejected,
        rejected: isRejected,
      },
    ];

    const stepColor = (s: Step) => {
      if (s.rejected) return 'bg-red-600 border-red-600 text-white';
      if (s.status === 'Approved') return 'bg-green-600 border-green-600 text-white';
      if (s.status === 'Forwarded') return 'bg-blue-600 border-blue-600 text-white';
      if (s.active || s.status === 'Current') return 'bg-amber-500 border-amber-500 text-white';
      return 'bg-gray-200 border-gray-300 text-gray-700';
    };

    const connectorColor = (from: Step, to: Step) => {
      if (isRejected) return 'bg-red-200';
      if (to.completed || to.active) return 'bg-blue-200';
      if (from.completed) return 'bg-amber-200';
      return 'bg-gray-200';
    };

    return (
      <div className="mt-4">
        <div className="hidden md:flex items-center">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center w-full">
              <div className={`flex flex-col items-center`} style={{ minWidth: 0 }}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold ${stepColor(s)}`}>
                  {i + 1}
                </div>
                <div className="mt-2 text-xs text-forest-deep font-medium text-center whitespace-nowrap">
                  {s.label}
                </div>
                <div className="text-[10px] text-forest-medium mt-0.5">{s.status}</div>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded ${connectorColor(steps[i], steps[i + 1])}`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="md:hidden grid grid-cols-1 gap-3">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-semibold ${stepColor(s)}`}>{i + 1}</div>
              <div className="ml-3">
                <div className="text-xs font-semibold text-forest-deep">{s.label}</div>
                <div className="text-[11px] text-forest-medium">{s.status}</div>
              </div>
            </div>
          ))}
        </div>

        {isRejected && claim.rejection_reason && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-semibold mb-1">Flow stopped due to rejection</p>
            <p className="text-sm text-red-700">Reason: <span className="italic">"{claim.rejection_reason}"</span></p>
          </div>
        )}
      </div>
    );
  };

  const trackByAck = async () => {
    if (!ackSearch.trim()) return;
    try {
      setAckLoading(true);
      setAckResult(null);
      const row = await supabaseClaimsService.getByAckId(ackSearch.trim());
      if (row) {
        const mapped: Claim = {
          id: row.id,
          user_id: row.user_id,
          village: row.village,
          area: row.area,
          coordinates: row.coordinates,
          document_url: row.document_url ?? undefined,
          status: row.status,
          created_at: row.created_at,
          approved_at: row.approved_at ?? undefined,
          applicantName: row.applicant_name ?? undefined,
          claimType: row.claim_type ?? undefined,
          documents: row.documents ?? undefined,
        };
        setAckResult(mapped);
        setAckRow(row);
      } else {
        setAckResult(null);
        setAckRow(null);
      }
    } catch (e) {
      console.error('Ack lookup failed', e);
      setAckResult(null);
    } finally {
      setAckLoading(false);
    }
  };

  const deleteClaim = async (id: string) => {
    if (!confirm('Are you sure you want to delete this claim? This action cannot be undone.')) return;
    try {
      setDeletingId(id);
      console.log('Deleting claim with ID:', id);
      
      // Remove any FRA Atlas geometry first to keep data consistent
      await deleteGeojsonByClaimId(id);
      console.log('Deleted GeoJSON for claim:', id);
      
      // Delete the claim from database
      await supabaseClaimsService.deleteById(id);
      console.log('Successfully deleted claim from database:', id);
      
      // Optimistically update UI
      setClaims(prev => prev.filter(c => c.id !== id));
      setStats(prev => ({
        total: prev.total - 1,
        approved: prev.approved - (claims.find(c => c.id === id)?.status === 'approved' ? 1 : 0),
        pending: prev.pending - (claims.find(c => c.id === id)?.status === 'pending' ? 1 : 0),
        rejected: prev.rejected - (claims.find(c => c.id === id)?.status === 'rejected' ? 1 : 0),
      }));
      
      alert('Claim successfully deleted from database and FRA Atlas.');
    } catch (e) {
      console.error('Delete failed', e);
      alert(`Failed to delete the claim: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-forest-accent" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-forest-medium" />;
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="forest-card">
          <div className="flex items-center justify-center py-12">
            <div className="forest-spinner"></div>
            <span className="ml-3 text-forest-medium">Loading your claims...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Welcome {user?.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your FRA claims and track their status</p>
          </div>
          <div className="px-2.5 py-1.5 rounded-full text-xs bg-gray-100 text-gray-700 border">Poduchunapadar, Odisha</div>
        </div>
      </div>

      {/* Track Status */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-forest-medium" />
            <h3 className="text-gray-900 font-medium">Track your claim</h3>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              value={ackSearch}
              onChange={(e) => setAckSearch(e.target.value)}
              placeholder="Enter Acknowledgment ID (e.g., FRA-240926-ABCD)"
              className="flex-1 md:w-96 px-3 py-2 border rounded-md focus:outline-none focus:border-gray-900 text-sm"
            />
            <button onClick={trackByAck} disabled={ackLoading} className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50">
              {ackLoading ? 'Searching…' : 'Check Status'}
            </button>
          </div>
        </div>
        {ackResult && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-forest-medium font-medium">Village</span>
              <p className="text-forest-deep font-semibold">{ackResult.village}</p>
            </div>
            <div>
              <span className="text-forest-medium font-medium">Submitted</span>
              <p className="text-forest-deep font-semibold">{formatDate(ackResult.created_at!)}</p>
            </div>
            <div>
              <span className="text-forest-medium font-medium">Status</span>
              <p className="text-forest-deep font-semibold">{ackResult.status.charAt(0).toUpperCase() + ackResult.status.slice(1)}</p>
            </div>
          </div>
        )}
        {ackRow && (
          <div className="mt-6">
            <h4 className="text-forest-deep font-semibold mb-3">Processing Timeline</h4>
            <div className="flex flex-col md:flex-row md:items-stretch gap-3">
              <div className={`flex-1 p-3 rounded-lg border ${ackRow.stage === 'gp' || ackRow.stage === 'sdlc' || ackRow.stage === 'dlc' || ackRow.stage === 'approved' ? 'bg-green-50 border-green-200' : 'bg-white border-forest-sage/30'}`}>
                <div className="text-xs text-forest-medium">Step 1</div>
                <div className="font-semibold text-forest-deep">Gram Sabha</div>
                <div className="text-xs text-forest-medium mt-1">{ackRow.gp_forwarded_at ? `Forwarded on ${new Date(ackRow.gp_forwarded_at).toLocaleDateString()}` : 'Pending'}</div>
              </div>
              <div className={`flex-1 p-3 rounded-lg border ${ackRow.stage === 'sdlc' || ackRow.stage === 'dlc' || ackRow.stage === 'approved' ? 'bg-green-50 border-green-200' : 'bg-white border-forest-sage/30'}`}>
                <div className="text-xs text-forest-medium">Step 2</div>
                <div className="font-semibold text-forest-deep">SDLC</div>
                <div className="text-xs text-forest-medium mt-1">{ackRow.sdlc_forwarded_at ? `Forwarded on ${new Date(ackRow.sdlc_forwarded_at).toLocaleDateString()}` : (ackRow.stage === 'gp' ? 'Waiting for Gram Sabha' : 'Pending')}</div>
              </div>
              <div className={`flex-1 p-3 rounded-lg border ${ackRow.stage === 'dlc' || ackRow.stage === 'approved' ? 'bg-green-50 border-green-200' : 'bg-white border-forest-sage/30'}`}>
                <div className="text-xs text-forest-medium">Step 3</div>
                <div className="font-semibold text-forest-deep">DLC</div>
                <div className="text-xs text-forest-medium mt-1">{ackRow.dlc_decided_at ? `Decided on ${new Date(ackRow.dlc_decided_at).toLocaleDateString()}` : (ackRow.stage === 'sdlc' ? 'Waiting for SDLC' : 'Pending')}</div>
              </div>
              <div className={`flex-1 p-3 rounded-lg border ${ackRow.stage === 'approved' ? 'bg-green-50 border-green-200' : ackRow.stage === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-white border-forest-sage/30'}`}>
                <div className="text-xs text-forest-medium">Step 4</div>
                <div className="font-semibold text-forest-deep">Final Status</div>
                <div className="text-xs text-forest-medium mt-1">{ackRow.stage === 'approved' ? 'Approved' : ackRow.stage === 'rejected' ? 'Rejected' : 'In Progress'}</div>
              </div>
            </div>
          </div>
        )}
        {ackResult === null && ackSearch && !ackLoading && (
          <div className="mt-3 text-sm text-forest-medium">No claim found for the provided acknowledgment ID.</div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Claims</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-semibold text-green-700">{stats.approved}</div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-semibold text-amber-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-semibold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-500">Rejected</div>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Your FRA Claims</h3>
          <div className="mt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="text-sm text-gray-500">
              Showing {statusFilter === 'all' ? claims.length : claims.filter(c => c.status === statusFilter).length} claim{(statusFilter === 'all' ? claims.length : claims.filter(c => c.status === statusFilter).length) !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2">
              {(['all','approved','pending','rejected'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    statusFilter === s
                      ? 'bg-forest-gradient text-white border-transparent'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-12 bg-white/80 border border-green-100 rounded-xl">
            <FileText className="h-12 w-12 text-forest-medium mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-forest-deep mb-2">No claims submitted yet</h3>
            <p className="text-forest-medium">Submit your first FRA claim to get started.</p>
          </div>
        ) : (
          <div className="space-y-4 px-3 md:px-5">
            {(statusFilter === 'all' ? claims : claims.filter(c => c.status === statusFilter)).map((claim) => (
              <div
                key={claim.id}
                className={`p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow relative ${
                  claim.status === 'approved' ? 'border-l-4 border-l-green-500' :
                  claim.status === 'pending' ? 'border-l-4 border-l-amber-500' :
                  'border-l-4 border-l-red-500'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-md">
                      {getStatusIcon(claim.status)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Claim #{claim.id?.slice(-8)}
                      </h4>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{claim.village}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(claim.created_at!)}</span>
                        </div>
                        {claim.ack_id && (
                          <span className="px-2 py-0.5 rounded-full border bg-gray-50 text-gray-800 text-xs font-medium">
                            Ack: {claim.ack_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`forest-badge ${getStatusColor(claim.status)} uppercase`}>{claim.status}</span>
                    {claim.document_url && (
                      <a
                        href={claim.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 border transition-colors"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    <a
                      href={`/claims/${claim.id}`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700"
                      title="View Details"
                    >
                      View Details
                    </a>
                    <a
                      href={`/dashboard/claims/${claim.id}`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md border border-forest-sage/40 hover:bg-forest-sage/10 text-forest-deep"
                      title="Open Dashboard"
                    >
                      Open Dashboard
                    </a>
                    <button
                      onClick={() => deleteClaim(claim.id!)}
                      className="p-2 text-red-600 hover:text-white rounded-md hover:bg-red-600 border border-red-200 transition-colors"
                      title="Delete Claim"
                      disabled={deletingId === claim.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Tracker */}
                {renderProgressTracker(claim)}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Area:</span>
                    <p className="text-gray-900 font-semibold">{claim.area} hectares</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Coordinates:</span>
                    <p className="text-gray-900 font-semibold">
                      {claim.coordinates}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Status:</span>
                    <p className="text-gray-900 font-semibold">
                      {claim.status === 'approved' && claim.approved_at
                        ? `Approved on ${formatDate(claim.approved_at)}`
                        : claim.status.charAt(0).toUpperCase() + claim.status.slice(1)
                      }
                    </p>
                  </div>
                </div>

                {claim.status === 'rejected' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-semibold mb-2">
                      This claim was rejected.
                    </p>
                    {claim.rejection_reason && (
                      <div className="mt-2">
                        <p className="text-sm text-red-700 font-medium">Reason for rejection:</p>
                        <p className="text-sm text-red-600 mt-1 italic">"{claim.rejection_reason}"</p>
                      </div>
                    )}
                    <p className="text-sm text-red-700 mt-2">
                      Please review the requirements and submit a new claim.
                    </p>
                  </div>
                )}

                {claim.status === 'approved' && recommendedSchemes[claim.id!] && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Award className="h-5 w-5 text-green-600" />
                      <h4 className="text-sm font-semibold text-green-800">Recommended Government Schemes</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Based on your approved claim, you may be eligible for these schemes:
                    </p>
                    <div className="space-y-3">
                      {(expandedRecommendations[claim.id!] ? recommendedSchemes[claim.id!] : recommendedSchemes[claim.id!].slice(0, 3)).map((scheme, index) => (
                        <div key={scheme.id} className="p-3 bg-white/80 rounded-lg border border-green-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="text-sm font-semibold text-green-800">{scheme.name}</h5>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < Math.floor(scheme.priority_score / 2) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-green-700 mb-2">{scheme.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-green-600">
                                <span className="flex items-center space-x-1">
                                  <span className="font-medium">Ministry:</span>
                                  <span>{scheme.ministry}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <span className="font-medium">Funding:</span>
                                  <span>₹{scheme.funding_amount.toLocaleString()}</span>
                                </span>
                              </div>
                            </div>
                            <button className="ml-2 p-1 text-green-600 hover:text-green-800 transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {recommendedSchemes[claim.id!].length > 3 && !expandedRecommendations[claim.id!] && (
                        <div className="text-center">
                          <button
                            onClick={() => setExpandedRecommendations(prev => ({ ...prev, [claim.id!]: true }))}
                            className="text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            View all {recommendedSchemes[claim.id!].length} recommendations →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="forest-card bg-forest-dark text-white">
        <div className="text-center py-6">
          <h3 className="text-lg font-semibold mb-2">Currently showing data for Poduchunapadar – 100% Mapping Success</h3>
          <p className="text-forest-sage">
            Forest Rights Act Implementation Portal • Ministry of Tribal Affairs
          </p>
        </div>
      </div>
    </div>
  );
};
