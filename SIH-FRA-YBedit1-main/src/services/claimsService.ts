export interface Claim {
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
  aadhaar?: string;
}

export interface ClaimWithUser extends Claim {
  user: {
    name: string;
    email: string;
  };
}

// Mock claims data
let mockClaims: Claim[] = [
  {
    id: 'claim-1',
    user_id: 'public-1',
    village: 'Poduchunapadar',
    area: 2.5,
    coordinates: '19.9067, 83.1636',
    document_url: 'https://example.com/doc1.pdf',
    status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    applicantName: 'Rajesh Kumar',
    claimType: 'Individual',
    documents: ['Identity Proof', 'Land Document', 'Village Certificate']
  },
  {
    id: 'claim-2',
    user_id: 'public-2',
    village: 'Poduchunapadar',
    area: 1.8,
    coordinates: '19.9067, 83.1636',
    document_url: 'https://example.com/doc2.pdf',
    status: 'approved',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    approved_at: new Date(Date.now() - 86400000).toISOString(),
    applicantName: 'Priya Sharma',
    claimType: 'Individual',
    documents: ['Identity Proof', 'Land Document']
  },
  {
    id: 'claim-3',
    user_id: 'public-3',
    village: 'Poduchunapadar',
    area: 3.2,
    coordinates: '19.9067, 83.1636',
    document_url: 'https://example.com/doc3.pdf',
    status: 'rejected',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    applicantName: 'Amit Singh',
    claimType: 'Community',
    documents: ['Community Certificate', 'Land Document']
  },
  {
    id: 'claim-4',
    user_id: 'public-4',
    village: 'Poduchunapadar',
    area: 4.5,
    coordinates: '19.9067, 83.1636',
    document_url: 'https://example.com/doc4.pdf',
    status: 'pending',
    created_at: new Date(Date.now() - 43200000).toISOString(),
    applicantName: 'Sita Gond',
    claimType: 'Individual',
    documents: ['Identity Proof', 'Land Document', 'Revenue Record']
  }
];

// Mock user data for claims
const mockUsers = {
  'public-1': { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com' },
  'public-2': { name: 'Priya Sharma', email: 'priya.sharma@example.com' },
  'public-3': { name: 'Amit Singh', email: 'amit.singh@example.com' },
  'public-4': { name: 'Sita Gond', email: 'sita.gond@example.com' }
};

import { dataStore } from './dataStore';
import { DbClaim } from './db';

export const claimsService = {
  // Create a new claim
  async createClaim(claimData: Omit<Claim, 'id' | 'status' | 'created_at'>): Promise<Claim> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      ...claimData,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    mockClaims.unshift(newClaim);
    // persist to IndexedDB
    const row: DbClaim = {
      id: newClaim.id!,
      userId: newClaim.user_id,
      village: newClaim.village,
      area: newClaim.area,
      coordinates: newClaim.coordinates,
      documentUrl: newClaim.document_url,
      status: newClaim.status,
      createdAt: newClaim.created_at!,
      approvedAt: newClaim.approved_at,
      applicantName: newClaim.applicantName,
      claimType: newClaim.claimType,
      documents: newClaim.documents
    };
    try { await dataStore.addClaim(row); } catch {}
    return newClaim;
  },

  // Submit a new claim (alias for createClaim with additional fields)
  async submitClaim(claimData: {
    applicantName: string;
    age: number;
    village: string;
    area: number;
    coordinates: string;
    claimType: string;
    documents: string[];
    userId: string;
    status: string;
    aadhaar?: string;
  }): Promise<Claim> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      user_id: claimData.userId,
      village: claimData.village,
      area: claimData.area,
      coordinates: claimData.coordinates,
      status: 'pending',
      created_at: new Date().toISOString(),
      applicantName: claimData.applicantName,
      claimType: claimData.claimType,
      documents: claimData.documents,
      aadhaar: claimData.aadhaar
    };
    
    mockClaims.unshift(newClaim);
    // persist to IndexedDB
    const row: DbClaim = {
      id: newClaim.id!,
      userId: newClaim.user_id,
      village: newClaim.village,
      area: newClaim.area,
      coordinates: newClaim.coordinates,
      documentUrl: newClaim.document_url,
      status: newClaim.status,
      createdAt: newClaim.created_at!,
      approvedAt: newClaim.approved_at,
      applicantName: newClaim.applicantName,
      claimType: newClaim.claimType,
      documents: newClaim.documents,
      aadhaar: newClaim.aadhaar
    };
    try { await dataStore.addClaim(row); } catch {}
    return newClaim;
  },

  // Get claims for a specific user
  async getUserClaims(userId: string): Promise<Claim[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockClaims.filter(claim => claim.user_id === userId);
  },

  // Get all claims for admin
  async getAllClaims(): Promise<ClaimWithUser[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockClaims.map(claim => ({
      ...claim,
      user: mockUsers[claim.user_id as keyof typeof mockUsers] || { name: 'Unknown User', email: 'unknown@example.com' }
    }));
  },

  // Get all claims (simple version for admin panel)
  getClaims(): Claim[] {
    return mockClaims;
  },

  // Update claim status
  async updateClaimStatus(claimId: string, status: 'approved' | 'rejected'): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const claimIndex = mockClaims.findIndex(claim => claim.id === claimId);
    if (claimIndex !== -1) {
      mockClaims[claimIndex].status = status;
    }
    try { await dataStore.updateClaimStatus(claimId, status); } catch {}
  },

  // Upload document (mock implementation)
  async uploadDocument(file: File, claimId: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock URL
    return `https://example.com/documents/${claimId}_${file.name}`;
  },

  // Get claim statistics for a user
  async getUserClaimStats(userId: string): Promise<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  }> {
    const claims = await this.getUserClaims(userId);
    
    return {
      total: claims.length,
      approved: claims.filter(c => c.status === 'approved').length,
      pending: claims.filter(c => c.status === 'pending').length,
      rejected: claims.filter(c => c.status === 'rejected').length,
    };
  }
};