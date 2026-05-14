import { supabase } from './supabaseClient';
import type { AuthUser } from '../types';

// Admin emails that have admin access
const ADMIN_EMAILS = [
  'yashsbharambe@gmail.com',
  'chinchalkarparas@gmail.com',
  'atharvabakre05@gmail.com'
];

// Admin secret code for employee login
const ADMIN_SECRET_CODE = 'FRA2025';

export class AuthService {
  // Check if user is admin based on email
  static isAdminEmail(email: string): boolean {
    return ADMIN_EMAILS.includes(email.toLowerCase());
  }

  // Validate admin secret code
  static validateAdminSecretCode(code: string): boolean {
    return code === ADMIN_SECRET_CODE;
  }

  // Sign up with email and password
  static async signUpWithEmail(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          is_admin: this.isAdminEmail(email)
        }
      }
    });

    if (error) throw error;
    return data;
  }

  // Sign in with email and password
  static async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  // Sign in with Google OAuth
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  }

  // Send OTP to email
  static async sendEmailOTP(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  }

  // Send OTP to phone
  static async sendPhoneOTP(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms'
      }
    });

    if (error) throw error;
    return data;
  }

  // Verify OTP
  static async verifyOTP(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) throw error;
    return data;
  }

  // Verify phone OTP
  static async verifyPhoneOTP(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });

    if (error) throw error;
    return data;
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Get current user
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Get current session
  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  // Convert Supabase user to our AuthUser type
  static convertToAuthUser(supabaseUser: any): AuthUser {
    const isAdmin = this.isAdminEmail(supabaseUser.email);
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      phone: supabaseUser.phone,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      provider: supabaseUser.app_metadata?.provider || 'email',
      is_admin: isAdmin,
      created_at: supabaseUser.created_at
    };
  }

  // Update user profile
  static async updateProfile(updates: {
    name?: string;
    phone?: string;
  }) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) throw error;
    return data;
  }

  // Reset password
  static async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) throw error;
    return data;
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  }
}
