// Mock data service to replace database functionality
export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'citizen';
  department: string;
  state: string;
  district: string;
  created_at: string;
}

export interface MockClaim {
  id: string;
  user_id: string;
  village: string;
  area_hectares: number;
  coordinates: {
    point1: { lat: number; lng: number };
    point2: { lat: number; lng: number };
    point3: { lat: number; lng: number };
    point4: { lat: number; lng: number };
  };
  document_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MockClaimWithUser extends MockClaim {
  user: {
    full_name: string;
    email: string;
  };
  admin?: {
    name: string;
  };
}

// Mock data
const mockUsers: MockUser[] = [
  {
    id: 'admin-1',
    email: 'admin@fra.gov.in',
    name: 'Admin User',
    role: 'admin',
    department: 'Ministry of Tribal Affairs',
    state: 'Odisha',
    district: 'Kalahandi',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'citizen-1',
    email: 'citizen@example.com',
    name: 'John Doe',
    role: 'citizen',
    department: 'Citizen',
    state: 'Odisha',
    district: 'Kalahandi',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockClaims: MockClaim[] = [
  {
    id: 'claim-1',
    user_id: 'citizen-1',
    village: 'Poduchunapadar',
    area_hectares: 2.5,
    coordinates: {
      point1: { lat: 19.1234, lng: 83.5678 },
      point2: { lat: 19.1235, lng: 83.5679 },
      point3: { lat: 19.1236, lng: 83.5680 },
      point4: { lat: 19.1237, lng: 83.5681 }
    },
    document_url: 'https://example.com/document1.pdf',
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'claim-2',
    user_id: 'citizen-1',
    village: 'Poduchunapadar',
    area_hectares: 1.8,
    coordinates: {
      point1: { lat: 19.2234, lng: 83.6678 },
      point2: { lat: 19.2235, lng: 83.6679 },
      point3: { lat: 19.2236, lng: 83.6680 },
      point4: { lat: 19.2237, lng: 83.6681 }
    },
    status: 'approved',
    approved_by: 'admin-1',
    approved_at: '2024-01-20T14:30:00Z',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  }
];

// Mock authentication service
export const mockAuthService = {
  async signInWithPassword(email: string, password: string): Promise<{ user: MockUser | null }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Allow any email/password combination for demo purposes
    // Check if it's an admin email pattern or create appropriate user
    const isAdminEmail = email.includes('admin') || email.includes('gov') || email.includes('employee');
    
    const user: MockUser = {
      id: `user-${Date.now()}`,
      email,
      name: isAdminEmail ? 'Admin User' : 'Citizen User',
      role: isAdminEmail ? 'admin' : 'citizen',
      department: isAdminEmail ? 'Ministry of Tribal Affairs' : 'Citizen',
      state: 'Odisha',
      district: 'Kalahandi',
      created_at: new Date().toISOString()
    };
    
    return { user };
  },

  async signUp(email: string, password: string, name: string, userType: 'employee' | 'public'): Promise<{ user: MockUser | null }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: userType === 'employee' ? 'admin' : 'citizen',
      department: userType === 'employee' ? 'Ministry of Tribal Affairs' : 'Citizen',
      state: 'Odisha',
      district: 'Kalahandi',
      created_at: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    return { user: newUser };
  },

  async signOut(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
  },

  async getSession(): Promise<{ session: { user: MockUser } | null }> {
    // Return null to simulate no active session
    return { session: null };
  },

  onAuthStateChange(callback: (event: string, session: { user: MockUser } | null) => void) {
    // Mock subscription - return unsubscribe function
    return {
      unsubscribe: () => {}
    };
  }
};

// Mock claims service
export const mockClaimsService = {
  async createClaim(claimData: Omit<MockClaim, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<MockClaim> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newClaim: MockClaim = {
      ...claimData,
      id: `claim-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockClaims.push(newClaim);
    return newClaim;
  },

  async getUserClaims(userId: string): Promise<MockClaim[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockClaims.filter(claim => claim.user_id === userId);
  },

  async getAllClaims(): Promise<MockClaimWithUser[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockClaims.map(claim => {
      const user = mockUsers.find(u => u.id === claim.user_id);
      const admin = claim.approved_by ? mockUsers.find(u => u.id === claim.approved_by) : undefined;
      
      return {
        ...claim,
        user: {
          full_name: user?.name || 'Unknown User',
          email: user?.email || 'unknown@example.com'
        },
        admin: admin ? { name: admin.name } : undefined
      };
    });
  },

  async updateClaimStatus(claimId: string, status: 'approved' | 'rejected', adminId: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const claim = mockClaims.find(c => c.id === claimId);
    if (claim) {
      claim.status = status;
      claim.approved_by = adminId;
      claim.approved_at = new Date().toISOString();
      claim.updated_at = new Date().toISOString();
    }
  },

  async uploadDocument(file: File, claimId: string): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock URL
    return `https://mock-storage.example.com/claims/${claimId}.pdf`;
  },

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
