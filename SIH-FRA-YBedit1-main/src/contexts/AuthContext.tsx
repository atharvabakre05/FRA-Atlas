import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { AuthService } from '../services/authService';
import type { User, AuthUser } from '../types';

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  userType: 'public' | 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin' | null;
  login: (email: string, password: string, userType: 'public' | 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin', passkey?: string) => Promise<void>;
  signup: (email: string, password: string, name: string, userType: 'public' | 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin', passkey?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data
const mockUsers = {
  admin: {
    id: 'admin-1',
    email: 'atharvabakre05@gmail.com',
    password: '1234',
    name: 'Atharva Bakre',
    role: 'admin' as const,
    department: 'Ministry of Tribal Affairs',
    state: 'Odisha' as const,
    district: 'Kalahandi',
    created_at: new Date().toISOString()
  },
  public: [
    {
      id: 'public-1',
      email: 'rajesh.kumar@example.com',
      password: 'public123',
      name: 'Rajesh Kumar',
      role: 'citizen' as const,
      department: 'Citizen',
      state: 'Odisha' as const,
      district: 'Kalahandi',
      created_at: new Date().toISOString()
    },
    {
      id: 'public-2',
      email: 'priya.sharma@example.com',
      password: 'public123',
      name: 'Priya Sharma',
      role: 'citizen' as const,
      department: 'Citizen',
      state: 'Odisha' as const,
      district: 'Kalahandi',
      created_at: new Date().toISOString()
    },
    {
      id: 'public-3',
      email: 'amit.singh@example.com',
      password: 'public123',
      name: 'Amit Singh',
      role: 'citizen' as const,
      department: 'Citizen',
      state: 'Odisha' as const,
      district: 'Kalahandi',
      created_at: new Date().toISOString()
    }
  ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userType, setUserType] = useState<'public' | 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user) {
          const authUser = AuthService.convertToAuthUser(session.user);
          setAuthUser(authUser);
          // Preserve previously selected admin role if available
          const savedUserType = localStorage.getItem('fra-user-type') as ('public' | 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin' | null);
          if (savedUserType) {
            setUserType(savedUserType);
          } else {
            setUserType(authUser.is_admin ? 'gp_admin' : 'public');
          }
          
          // Convert to legacy User format for backward compatibility
          const legacyUser: User = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.name,
            role: authUser.is_admin ? 'admin' : 'citizen',
            department: authUser.is_admin ? 'Ministry of Tribal Affairs' : 'Citizen',
            state: 'Odisha',
            district: 'Kalahandi',
            created_at: authUser.created_at,
            phone: authUser.phone,
            avatar_url: authUser.avatar_url,
            provider: authUser.provider,
            is_admin: authUser.is_admin
          };
          setUser(legacyUser);
        } else {
          // Check localStorage for fallback
          const savedUser = localStorage.getItem('fra-user');
          const savedUserType = localStorage.getItem('fra-user-type');
          
          if (savedUser && savedUserType) {
            setUser(JSON.parse(savedUser));
            setUserType(savedUserType as 'public' | 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('fra-user');
        localStorage.removeItem('fra-user-type');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const authUser = AuthService.convertToAuthUser(session.user);
        setAuthUser(authUser);
        // Preserve selected admin role if previously stored
        const savedUserType = localStorage.getItem('fra-user-type') as ('public' | 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin' | null);
        setUserType(savedUserType || (authUser.is_admin ? 'gp_admin' : 'public'));
        
        // Convert to legacy User format
        const legacyUser: User = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          role: authUser.is_admin ? 'admin' : 'citizen',
          department: authUser.is_admin ? 'Ministry of Tribal Affairs' : 'Citizen',
          state: 'Odisha',
          district: 'Kalahandi',
          created_at: authUser.created_at,
          phone: authUser.phone,
          avatar_url: authUser.avatar_url,
          provider: authUser.provider,
          is_admin: authUser.is_admin
        };
        setUser(legacyUser);
        
        // Store in localStorage
        localStorage.setItem('fra-user', JSON.stringify(legacyUser));
        localStorage.setItem('fra-user-type', savedUserType || (authUser.is_admin ? 'gp_admin' : 'public'));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAuthUser(null);
        setUserType(null);
        localStorage.removeItem('fra-user');
        localStorage.removeItem('fra-user-type');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string, userType: 'public' | 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin', passkey?: string) => {
    setLoading(true);
    try {
      const allowedAdmins = new Set(['yashsbharambe@gmail.com', 'atharva.bakre05@gmail.com', 'chinchalkarparas@gmail.com']);
      if (userType !== 'public') {
        if (!allowedAdmins.has(email.trim().toLowerCase())) {
          throw new Error('Email not authorized for admin access');
        }
        // Validate passkey for employees
        if (!AuthService.validateAdminSecretCode(passkey || '')) {
          throw new Error('Invalid PassKey');
        }

        // Check admin credentials first (mock path)
        if (mockUsers.admin.email === email && mockUsers.admin.password === password) {
          setUser(mockUsers.admin);
          setUserType(userType);
          localStorage.setItem('fra-user', JSON.stringify(mockUsers.admin));
          localStorage.setItem('fra-user-type', userType);
          return;
        }
      }

      // Try Supabase authentication for all users
      const { data, error } = await AuthService.signInWithEmail(email, password);
      
      if (error) {
        // Fallback to mock authentication for demo purposes
        if (userType === 'public') {
          const emailKey = email.trim().toLowerCase();
          const stableId = `public-${btoa(unescape(encodeURIComponent(emailKey))).replace(/=+$/, '')}`;
          const publicUser: User = {
            id: stableId,
            email: email,
            name: email.split('@')[0] || 'Public User',
            role: 'citizen',
            department: 'Citizen',
            state: 'Odisha',
            district: 'Kalahandi',
            created_at: new Date().toISOString()
          };

          setUser(publicUser);
          setUserType('public');
          localStorage.setItem('fra-user', JSON.stringify(publicUser));
          localStorage.setItem('fra-user-type', 'public');
          return;
        }
        throw error;
      }

      // Handle successful Supabase authentication
      if (data.user) {
        const authUser = AuthService.convertToAuthUser(data.user);
        if (userType !== 'public' && !allowedAdmins.has(authUser.email.trim().toLowerCase())) {
          throw new Error('Email not authorized for admin access');
        }
        setAuthUser(authUser);
        setUserType(authUser.is_admin ? (userType !== 'public' ? userType : 'gp_admin') : 'public');
        
        const legacyUser: User = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          role: authUser.is_admin ? 'admin' : 'citizen',
          department: authUser.is_admin ? 'Ministry of Tribal Affairs' : 'Citizen',
          state: 'Odisha',
          district: 'Kalahandi',
          created_at: authUser.created_at,
          phone: authUser.phone,
          avatar_url: authUser.avatar_url,
          provider: authUser.provider,
          is_admin: authUser.is_admin
        };
        setUser(legacyUser);
        
        localStorage.setItem('fra-user', JSON.stringify(legacyUser));
        localStorage.setItem('fra-user-type', authUser.is_admin ? (userType !== 'public' ? userType : 'gp_admin') : 'public');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, userType: 'public' | 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin', passkey?: string) => {
    setLoading(true);
    try {
      const allowedAdmins = new Set(['yashsbharambe@gmail.com', 'atharva.bakre05@gmail.com', 'chinchalkarparas@gmail.com']);
      if (userType !== 'public') {
        if (!allowedAdmins.has(email.trim().toLowerCase())) {
          throw new Error('Email not authorized for admin access');
        }
        // Validate passkey for employees
        if (!AuthService.validateAdminSecretCode(passkey || '')) {
          throw new Error('Invalid PassKey');
        }
      }

      // Try Supabase signup first
      try {
        const { data, error } = await AuthService.signUpWithEmail(email, password, name);
        
        if (error) {
          throw error;
        }

        // Handle successful signup
        if (data.user) {
          const authUser = AuthService.convertToAuthUser(data.user);
          if (userType !== 'public' && !allowedAdmins.has(authUser.email.trim().toLowerCase())) {
            throw new Error('Email not authorized for admin access');
          }
          setAuthUser(authUser);
          setUserType(authUser.is_admin ? (userType !== 'public' ? userType : 'gp_admin') : 'public');
          
          const legacyUser: User = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.name,
            role: authUser.is_admin ? 'admin' : 'citizen',
            department: authUser.is_admin ? 'Ministry of Tribal Affairs' : 'Citizen',
            state: 'Odisha',
            district: 'Kalahandi',
            created_at: authUser.created_at,
            phone: authUser.phone,
            avatar_url: authUser.avatar_url,
            provider: authUser.provider,
            is_admin: authUser.is_admin
          };
          setUser(legacyUser);
          
          localStorage.setItem('fra-user', JSON.stringify(legacyUser));
          localStorage.setItem('fra-user-type', authUser.is_admin ? (userType !== 'public' ? userType : 'gp_admin') : 'public');
        }
      } catch (supabaseError: any) {
        // Fallback to mock signup for demo purposes
        if (userType === 'public') {
          // Check if email already exists
          const existingUser = mockUsers.public.find(u => u.email === email);
          if (existingUser) {
            throw new Error('User already exists');
          }

          // Create new user with stable deterministic ID from email
          const emailKey = email.trim().toLowerCase();
          const stableId = `public-${btoa(unescape(encodeURIComponent(emailKey))).replace(/=+$/, '')}`;
          const newUser: User = {
            id: stableId,
            email,
            name,
            role: 'citizen',
            department: 'Citizen',
            state: 'Odisha',
            district: 'Kalahandi',
            created_at: new Date().toISOString()
          };

          // Add to mock users
          mockUsers.public.push(newUser);

          setUser(newUser);
          setUserType('public');
          localStorage.setItem('fra-user', JSON.stringify(newUser));
          localStorage.setItem('fra-user-type', 'public');
        } else {
          throw supabaseError;
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await AuthService.signInWithGoogle();
      if (error) throw error;
      // The auth state change listener will handle the rest
    } catch (error: any) {
      throw new Error(error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendOTP = useCallback(async (email: string) => {
    setLoading(true);
    try {
      // Try Supabase OTP first
      try {
        const { data, error } = await AuthService.sendEmailOTP(email);
        if (error) throw error;
      } catch (supabaseError: any) {
        // Fallback to mock OTP for demo purposes
        console.log('Using mock OTP for demo:', email);
        
        // Store mock OTP in localStorage for demo
        const mockOTP = '123456';
        localStorage.setItem('fra-mock-otp', mockOTP);
        localStorage.setItem('fra-mock-otp-email', email);
        localStorage.setItem('fra-mock-otp-time', Date.now().toString());
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(async (email: string, token: string) => {
    setLoading(true);
    try {
      // Try Supabase OTP verification first
      try {
        const { data, error } = await AuthService.verifyOTP(email, token);
        if (error) throw error;
        
        // Handle successful OTP verification
        if (data.user) {
          const authUser = AuthService.convertToAuthUser(data.user);
          setAuthUser(authUser);
          setUserType(authUser.is_admin ? 'employee' : 'public');
          
          const legacyUser: User = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.name,
            role: authUser.is_admin ? 'admin' : 'citizen',
            department: authUser.is_admin ? 'Ministry of Tribal Affairs' : 'Citizen',
            state: 'Odisha',
            district: 'Kalahandi',
            created_at: authUser.created_at,
            phone: authUser.phone,
            avatar_url: authUser.avatar_url,
            provider: authUser.provider,
            is_admin: authUser.is_admin
          };
          setUser(legacyUser);
          
          localStorage.setItem('fra-user', JSON.stringify(legacyUser));
          localStorage.setItem('fra-user-type', authUser.is_admin ? 'employee' : 'public');
        }
      } catch (supabaseError: any) {
        // Fallback to mock OTP verification for demo purposes
        const storedOTP = localStorage.getItem('fra-mock-otp');
        const storedEmail = localStorage.getItem('fra-mock-otp-email');
        const storedTime = localStorage.getItem('fra-mock-otp-time');
        
        // Check if OTP is valid (within 5 minutes)
        const now = Date.now();
        const otpTime = storedTime ? parseInt(storedTime) : 0;
        const isExpired = (now - otpTime) > 5 * 60 * 1000; // 5 minutes
        
        if (storedOTP === token && storedEmail === email && !isExpired) {
          // Create mock user for demo
          const emailKey = email.trim().toLowerCase();
          const stableId = `public-${btoa(unescape(encodeURIComponent(emailKey))).replace(/=+$/, '')}`;
          const mockUser: User = {
            id: stableId,
            email: email,
            name: email.split('@')[0] || 'Public User',
            role: 'citizen',
            department: 'Citizen',
            state: 'Odisha',
            district: 'Kalahandi',
            created_at: new Date().toISOString()
          };
          
          setUser(mockUser);
          setUserType('public');
          localStorage.setItem('fra-user', JSON.stringify(mockUser));
          localStorage.setItem('fra-user-type', 'public');
          
          // Clear mock OTP data
          localStorage.removeItem('fra-mock-otp');
          localStorage.removeItem('fra-mock-otp-email');
          localStorage.removeItem('fra-mock-otp-time');
        } else {
          throw new Error('Invalid or expired OTP');
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
      setAuthUser(null);
      setUserType(null);
      localStorage.removeItem('fra-user');
      localStorage.removeItem('fra-user-type');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if Supabase logout fails
      setUser(null);
      setAuthUser(null);
      setUserType(null);
      localStorage.removeItem('fra-user');
      localStorage.removeItem('fra-user-type');
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);
  const isAdmin = useMemo(() => user?.is_admin || false, [user?.is_admin]);

  const contextValue = useMemo(() => ({
    user, 
    authUser, 
    userType, 
    login, 
    signup, 
    loginWithGoogle,
    sendOTP,
    verifyOTP,
    logout, 
    loading, 
    isAuthenticated, 
    isAdmin 
  }), [user, authUser, userType, login, signup, loginWithGoogle, sendOTP, verifyOTP, logout, loading, isAuthenticated, isAdmin]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};