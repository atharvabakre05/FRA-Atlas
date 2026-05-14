import { supabase } from './supabaseClient';

export interface SupabaseClaimRow {
  id: string;
  ack_id?: string | null;
  user_id: string;
  village: string;
  area: number;
  coordinates: string;
  document_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string | null;
  rejection_reason?: string | null;
  approved_by_id?: string | null;
  approved_by_name?: string | null;
  applicant_name?: string | null;
  claim_type?: string | null;
  documents?: string[] | null;
  aadhaar?: string | null;
  // Workflow fields (optional depending on DB migration)
  stage?: 'gp' | 'sdlc' | 'dlc' | 'approved' | 'rejected' | null;
  gp_forwarded_at?: string | null;
  sdlc_forwarded_at?: string | null;
  dlc_decided_at?: string | null;
  // Newly added optional fields
  parent_name?: string | null;
  gender?: string | null;
  age?: number | null;
  tribal_group?: string | null;
  district?: string | null;
  state?: string | null;
  area_unit?: string | null;
  survey_number?: string | null;
  identity_proof_url?: string | null;
  tribe_certificate_url?: string | null;
  claim_form_a_url?: string | null;
  gram_sabha_resolution_url?: string | null;
}

export type CreateClaimInput = {
  ack_id?: string | null;
  user_id: string;
  village: string;
  area: number;
  coordinates: string;
  document_url?: string | null;
  applicant_name?: string | null;
  claim_type?: string | null;
  documents?: string[] | null;
  aadhaar?: string | null;
  stage?: 'gp' | 'sdlc' | 'dlc';
  // New optional fields
  parent_name?: string | null;
  gender?: string | null;
  age?: number | null;
  tribal_group?: string | null;
  district?: string | null;
  state?: string | null;
  area_unit?: string | null;
  survey_number?: string | null;
};

export const supabaseClaimsService = {
  async create(input: CreateClaimInput): Promise<SupabaseClaimRow> {
    const { data, error } = await supabase
      .from('claims')
      .insert({
        ack_id: input.ack_id ?? null,
        user_id: input.user_id,
        village: input.village,
        area: input.area,
        coordinates: input.coordinates,
        document_url: input.document_url ?? null,
        status: 'pending',
        applicant_name: input.applicant_name ?? null,
        claim_type: input.claim_type ?? null,
        documents: input.documents ?? null,
        aadhaar: input.aadhaar ?? null,
        stage: input.stage ?? 'gp',
        parent_name: input.parent_name ?? null,
        gender: input.gender ?? null,
        age: input.age ?? null,
        tribal_group: input.tribal_group ?? null,
        district: input.district ?? null,
        state: input.state ?? null,
        area_unit: input.area_unit ?? null,
        survey_number: input.survey_number ?? null
      })
      .select()
      .single();

    if (error) throw error;
    return data as SupabaseClaimRow;
  },

  async listAll(): Promise<SupabaseClaimRow[]> {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as SupabaseClaimRow[];
  },

  async getByAckId(ackId: string): Promise<SupabaseClaimRow | null> {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('ack_id', ackId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as SupabaseClaimRow | null;
  },

  async getById(id: string): Promise<SupabaseClaimRow | null> {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as SupabaseClaimRow | null;
  },

  async deleteById(id: string): Promise<void> {
    const { error } = await supabase
      .from('claims')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateStatus(params: { id: string; status: 'approved' | 'rejected'; rejection_reason?: string | null }): Promise<void> {
    const update: Record<string, any> = { status: params.status };
    if (params.status === 'approved') {
      update.approved_at = new Date().toISOString();
      update.rejection_reason = null;
      update.stage = 'approved';
    } else if (params.status === 'rejected') {
      update.approved_at = null;
      update.rejection_reason = params.rejection_reason ?? null;
      update.stage = 'rejected';
    }
    const { error } = await supabase
      .from('claims')
      .update(update)
      .eq('id', params.id);
    if (error) throw error;
  },

  async forwardStage(params: { id: string; from: 'gp' | 'sdlc' }): Promise<void> {
    const update: Record<string, any> = {};
    if (params.from === 'gp') {
      update.stage = 'sdlc';
      update.gp_forwarded_at = new Date().toISOString();
    } else if (params.from === 'sdlc') {
      update.stage = 'dlc';
      update.sdlc_forwarded_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from('claims')
      .update(update)
      .eq('id', params.id);
    if (error) throw error;
  },

  async finalApproveByDlc(id: string): Promise<void> {
    const { error } = await supabase
      .from('claims')
      .update({ status: 'approved', approved_at: new Date().toISOString(), rejection_reason: null, stage: 'approved', dlc_decided_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  /**
   * Upload a claim document to private Storage bucket and return the stored path.
   * The object key is namespaced by user and claim id.
   */
  async uploadClaimDocument(params: {
    userId: string;
    claimId: string;
    kind: 'identity_proof' | 'tribe_certificate' | 'claim_form_a' | 'gram_sabha_resolution';
    file: File;
  }): Promise<string> {
    // Enforce max 3 MB upload size client-side
    const MAX_BYTES = 3 * 1024 * 1024;
    if (params.file.size > MAX_BYTES) {
      throw new Error('File too large. Maximum allowed size is 3 MB.');
    }
    const bucket = 'claims-docs';
    const sanitizedName = params.file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const objectKey = `${params.userId}/claims/${params.claimId}/${params.kind}_${Date.now()}_${sanitizedName}`;
    const { data, error } = await supabase.storage.from(bucket).upload(objectKey, params.file, { upsert: true });
    if (error) throw error;
    return data.path;
  },

  /** Create a short-lived signed URL for a stored private path */
  async createSignedUrl(path: string, expiresInSeconds: number = 3600): Promise<string> {
    const bucket = 'claims-docs';
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  },

  /** Update any of the *_url document fields for a claim */
  async updateDocumentUrls(claimId: string, urls: Partial<Pick<SupabaseClaimRow,
    'identity_proof_url' | 'tribe_certificate_url' | 'claim_form_a_url' | 'gram_sabha_resolution_url'>>): Promise<void> {
    const { error } = await supabase
      .from('claims')
      .update(urls)
      .eq('id', claimId);
    if (error) throw error;
  },
};


