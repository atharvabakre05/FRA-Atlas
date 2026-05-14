import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseClaimsService, SupabaseClaimRow } from '../../services/supabaseClaimsService';
import { Calendar, Download, MapPin, User, ArrowLeft, CheckCircle, Award } from 'lucide-react';
import { dssService } from '../../services/dssService';

export const ClaimDetails: React.FC = () => {
  const { user } = useAuth();
  const [row, setRow] = useState<SupabaseClaimRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});
  const [selectedStep, setSelectedStep] = useState<null | { key: string; label: string; date: string | null; approver?: string | null }>(null);
  const [recommendedSchemes, setRecommendedSchemes] = useState(() => [] as ReturnType<typeof dssService.getRecommendedSchemes>);

  const claimId = useMemo(() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    // supports /claims/:id and /dashboard/claims/:id
    const idx = parts.findIndex(p => p === 'claims');
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : '';
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await supabaseClaimsService.getById(claimId);
        setRow(data);
        // compute recommendations if approved and data present
        if (data && (data.status === 'approved' || data.stage === 'approved')) {
          try {
            const recos = dssService.getRecommendedSchemes({
              claimType: (data.claim_type || undefined) as any,
              area: Number.isFinite(data.area as any) ? (data.area as number) : 0,
              village: data.village || '-',
              state: data.state || 'Odisha',
              applicantName: data.applicant_name || undefined
            });
            setRecommendedSchemes(recos);
          } catch {}
        } else {
          setRecommendedSchemes([]);
        }
        if (data) {
          const docs: Array<[string, string | null | undefined]> = [
            ['Identity Proof', data.identity_proof_url],
            ['Tribe/Community Certificate', data.tribe_certificate_url],
            ['FRA Claim Form (Form-A)', data.claim_form_a_url],
            ['Gram Sabha Resolution', data.gram_sabha_resolution_url],
          ];
          const out: Record<string, string> = {};
          await Promise.all(docs.map(async ([label, path]) => {
            if (path) {
              try {
                out[label] = await supabaseClaimsService.createSignedUrl(path, 3600);
              } catch {}
            }
          }));
          setDocUrls(out);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load claim');
      } finally {
        setLoading(false);
      }
    })();
  }, [claimId]);

  const backToDashboard = () => {
    window.location.assign('/');
  };

  const statusBadgeClass = (status: string) => {
    if (status === 'approved') return 'forest-badge forest-badge-success uppercase';
    if (status === 'pending') return 'forest-badge forest-badge-warning uppercase';
    return 'forest-badge forest-badge-error uppercase';
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-IN'); } catch { return '—'; }
  };

  const prettyStatus = (s: string) => s ? (s.charAt(0).toUpperCase() + s.slice(1)) : '—';

  if (loading) {
    return (
      <div className="forest-card">
        <div className="flex items-center justify-center py-16">
          <div className="forest-spinner"></div>
          <span className="ml-3 text-forest-medium">Loading claim...</span>
        </div>
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="forest-card">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-forest-deep">Claim Details</h1>
          <button onClick={backToDashboard} className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>
        <div className="mt-6 forest-alert-error">{error || 'Claim not found'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Claim {row.ack_id ? `(${row.ack_id})` : `#${row.id.slice(-8)}`}</h1>
            <div className="mt-2 flex items-center gap-3 flex-wrap text-sm text-gray-600">
              <span className={statusBadgeClass(row.status)}>{prettyStatus(row.status)}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {row.village}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(row.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={backToDashboard} className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50">Back to Dashboard</button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="forest-card">
        <h2 className="text-lg font-semibold text-forest-deep mb-4">Applicant & Claim Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-white/80 border border-forest-sage/30 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wide text-forest-medium">Applicant</div>
            <div className="mt-1 text-forest-deep font-semibold flex items-center gap-2"><User className="h-4 w-4" /> {row.applicant_name || 'Unknown'}</div>
          </div>
          <div className="p-3 bg-white/80 border border-forest-sage/30 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wide text-forest-medium">Claim Type</div>
            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-forest-sage/15 border border-forest-sage/30 text-forest-deep font-semibold w-max">{row.claim_type || '—'}</div>
          </div>
          <div className="p-3 bg-white/80 border border-forest-sage/30 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wide text-forest-medium">Area</div>
            <div className="mt-1 text-forest-deep font-semibold">{row.area} {row.area_unit || 'hectares'}</div>
          </div>
          <div className="p-3 bg-white/80 border border-forest-sage/30 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wide text-forest-medium">Coordinates</div>
            <div className="mt-1 text-forest-deep font-semibold">{row.coordinates}</div>
          </div>
          <div className="p-3 bg-white/80 border border-forest-sage/30 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wide text-forest-medium">Survey Number</div>
            <div className="mt-1 text-forest-deep font-semibold">{row.survey_number || '—'}</div>
          </div>
          <div className="p-3 bg-white/80 border border-forest-sage/30 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wide text-forest-medium">Location</div>
            <div className="mt-1 text-forest-deep font-semibold">{[row.district, row.state].filter(Boolean).join(', ') || '—'}</div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="forest-card">
        <h2 className="text-lg font-semibold text-forest-deep mb-4">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Identity Proof','Tribe/Community Certificate','FRA Claim Form (Form-A)','Gram Sabha Resolution'].map((label) => (
            <div key={label} className="flex items-center justify-between p-3 bg-white/80 border border-forest-sage/30 rounded-xl">
              <div className="text-forest-deep font-medium">{label}</div>
              {docUrls[label] ? (
                <a href={docUrls[label]} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-semibold rounded-md border border-forest-sage/40 hover:bg-forest-sage/10 text-forest-deep">View</a>
              ) : (
                <span className="text-xs text-forest-medium">Not uploaded</span>
              )}
            </div>
          ))}
        </div>
        {row.document_url && (
          <div className="mt-3 p-3 bg-white/80 border border-forest-sage/30 rounded-xl flex items-center justify-between">
            <div className="text-forest-deep font-medium">Primary Document</div>
            <a href={row.document_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-semibold rounded-md border border-forest-sage/40 hover:bg-forest-sage/10 text-forest-deep">
              Download
            </a>
          </div>
        )}
      </div>

      {/* Verification Timeline */}
      <div className="forest-card">
        <h2 className="text-lg font-semibold text-forest-deep mb-6">Verification Timeline</h2>
        {(() => {
          const isRejected = row.status === 'rejected' || row.stage === 'rejected';
          const isApproved = row.status === 'approved' || row.stage === 'approved';
          const steps = [
            { key: 'gp', label: 'Gram Sabha', date: row.gp_forwarded_at as string | null, approver: null as string | null },
            { key: 'sdlc', label: 'SDLC', date: row.sdlc_forwarded_at as string | null, approver: null as string | null },
            { key: 'dlc', label: 'DLC', date: row.dlc_decided_at as string | null, approver: null as string | null },
            { key: 'final', label: isRejected ? 'Rejected' : 'Final', date: (isApproved ? row.approved_at : (isRejected ? row.dlc_decided_at : null)) as string | null, approver: row.approved_by_name || null }
          ];
          const currentIndex = isRejected ? steps.findIndex(s => s.key === 'dlc') : (isApproved ? steps.length - 1 : steps.findIndex(s => !s.completed));
          return (
            <div>
              {/* Amazon-like progress bar with filled rail and icons */}
              <div className="relative px-2 mb-2">
                <div className="h-2 w-full bg-forest-sage/20 rounded-full"></div>
                <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2">
                  {(() => {
                    const total = steps.length - 1;
                    const progress = Math.max(0, Math.min(total, currentIndex));
                    const widthPct = (progress / total) * 100;
                    const barClass = (row.status === 'rejected') ? 'bg-red-500' : 'bg-forest-accent';
                    return <div className={`h-2 ${barClass} rounded-full transition-all`} style={{ width: `${widthPct}%` }}></div>;
                  })()}
                </div>
                <div className="relative z-10 mt-3 flex justify-between">
                  {steps.map((s, idx) => {
                    const isDone = idx < currentIndex || (idx === currentIndex && !!s.date && row.status !== 'rejected');
                    const isCurrent = idx === currentIndex && row.status !== 'rejected';
                    const nodeStyle = isDone ? 'bg-green-600 border-green-600 text-white' : isCurrent ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-forest-sage/40 text-forest-medium';
                    return (
                      <div key={s.key} className="flex-1 flex flex-col items-center text-center">
                        <button type="button" onClick={() => setSelectedStep({ key: s.key, label: s.label, date: s.date, approver: s.approver })} className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-sm ${nodeStyle}`} title={s.label}>
                          {isDone ? <CheckCircle className="h-4 w-4" /> : (isCurrent ? <span className="w-2 h-2 rounded-full bg-white block"></span> : <span className="w-2 h-2 rounded-full bg-forest-sage/40 block"></span>)}
                        </button>
                        <div className={`mt-2 text-xs font-semibold ${isDone ? 'text-forest-deep' : isCurrent ? 'text-amber-700' : 'text-forest-medium'}`}>{s.label}</div>
                        <div className="text-[11px] text-forest-medium">{formatDate(s.date as any)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedStep && (
                <div className="mt-4 p-3 bg-white/80 border border-forest-sage/30 rounded-xl text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-forest-deep">{selectedStep.label}</div>
                    <button type="button" onClick={() => setSelectedStep(null)} className="text-xs text-forest-medium hover:text-forest-deep">Close</button>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-forest-medium text-xs">Status</div>
                      <div className="text-forest-deep font-semibold">
                        {selectedStep.key === 'final' ? (row.status === 'approved' ? 'Approved' : (row.status === 'rejected' ? 'Rejected' : 'Pending')) : (selectedStep.date ? 'Forwarded' : 'Pending')}
                      </div>
                    </div>
                    <div>
                      <div className="text-forest-medium text-xs">Date</div>
                      <div className="text-forest-deep font-semibold">{formatDate(selectedStep.date)}</div>
                    </div>
                    <div>
                      <div className="text-forest-medium text-xs">Approved By</div>
                      <div className="text-forest-deep font-semibold">{selectedStep.approver || (selectedStep.key === 'final' && row.status === 'approved' ? (row.approved_by_name || '—') : '—')}</div>
                    </div>
                  </div>
                  {selectedStep.key === 'final' && row.status === 'rejected' && row.rejection_reason && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">Reason: <span className="italic">"{row.rejection_reason}"</span></div>
                  )}
                </div>
              )}

              {/* Rejection reason */}
              {isRejected && row.rejection_reason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                  <div className="font-semibold text-red-800 mb-1">Flow stopped due to rejection</div>
                  <div className="text-red-700">Reason: <span className="italic">"{row.rejection_reason}"</span></div>
                </div>
              )}

              {/* Approval info */}
              {isApproved && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm flex items-center justify-between">
                  <div className="text-green-800 font-semibold">Approved</div>
                  <div className="text-forest-medium text-xs">
                    {row.approved_at ? `On ${formatDate(row.approved_at)}` : ''}
                    {row.approved_by_name ? ` • By ${row.approved_by_name}` : ''}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Recommended Schemes (visible on approval) */}
      {row.status === 'approved' && (
        <div className="forest-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-forest-gradient rounded-lg"><Award className="h-4 w-4 text-white" /></div>
            <h2 className="text-lg font-semibold text-forest-deep">Recommended Schemes</h2>
          </div>
          {recommendedSchemes.length === 0 ? (
            <div className="text-sm text-forest-medium">No recommendations available for this claim.</div>
          ) : (
            <div className="space-y-3">
              {recommendedSchemes.map((scheme) => (
                <div key={scheme.id} className="p-4 bg-white/80 border border-forest-sage/30 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-forest-deep">{scheme.name}</div>
                      <div className="text-xs text-forest-medium mt-1 max-w-3xl">{scheme.description}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="forest-badge-secondary text-xs">{scheme.ministry}</span>
                        <span className="forest-badge-success text-xs">Priority {scheme.priority_score}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-forest-medium">Funding</div>
                      <div className="text-sm font-semibold text-forest-deep">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(scheme.funding_amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClaimDetails;


