import { supabase } from './supabaseClient';

export interface ClaimGeoRow {
  id: string; // row id
  claim_id: string; // references claims.id
  geojson: any; // GeoJSON Feature or FeatureCollection
  created_at: string;
}

export async function upsertClaimGeojson(claimId: string, geojson: any): Promise<void> {
  const { error } = await supabase
    .from('claim_geojson')
    .upsert({ claim_id: claimId, geojson }, { onConflict: 'claim_id' });
  if (error) throw error;
}

export async function hasGeojson(claimId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('claim_geojson')
    .select('id')
    .eq('claim_id', claimId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function deleteGeojsonByClaimId(claimId: string): Promise<void> {
  const { error } = await supabase
    .from('claim_geojson')
    .delete()
    .eq('claim_id', claimId);
  if (error) throw error;
}

export interface GeoWithStatus {
  claim_id: string;
  status: 'pending' | 'approved' | 'rejected';
  geojson: any;
  applicant_name?: string | null;
  area?: number | null;
}

export async function listGeojsonWithStatus(): Promise<GeoWithStatus[]> {
  // Fetch geojson rows and join status from claims
  const { data, error } = await supabase
    .from('claim_geojson')
    .select('claim_id, geojson, claims!inner(status, applicant_name, area)');
  if (error) throw error;
  return (data as any[]).map(r => ({
    claim_id: r.claim_id,
    status: r.claims.status,
    geojson: r.geojson,
    applicant_name: r.claims.applicant_name ?? null,
    area: r.claims.area ?? null,
  }));
}


