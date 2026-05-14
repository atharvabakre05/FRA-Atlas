import React, { useState, memo, useCallback } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Shield, TreePine, ArrowRight, CheckCircle, Smartphone, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface UserAuthFormProps {
  onSuccess?: () => void;
}

type AuthMode = 'login' | 'signup' | 'otp' | 'verify-otp';

export const UserAuthForm: React.FC<UserAuthFormProps> = memo(({ onSuccess }) => {
  const { login, signup, loginWithGoogle, sendOTP, verifyOTP } = useAuth();
  const { t } = useTranslation();
  
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    otp: ''
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  }, []);

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password, 'public');
        setSuccess('Login successful! Redirecting...');
      } else if (authMode === 'signup') {
        await signup(formData.email, formData.password, formData.name, 'public');
        setSuccess('Account created successfully! You can now login.');
        setAuthMode('login');
        setFormData(prev => ({ ...prev, password: '', name: '' }));
      }
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await loginWithGoogle();
      setSuccess('Google authentication successful! Redirecting...');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendOTP(formData.email);
      setOtpSent(true);
      setAuthMode('verify-otp');
      setSuccess('OTP sent to your email! Please check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await verifyOTP(formData.email, formData.otp);
      setSuccess('OTP verified successfully! Redirecting...');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLogin = () => {
    setAuthMode('login');
    setOtpSent(false);
    setFormData({ email: '', password: '', name: '', otp: '' });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-forest-sky forest-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-forest-gradient rounded-3xl shadow-2xl">
              <TreePine className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-forest-deep mb-2">
            FRA Atlas Portal
          </h1>
          <p className="text-forest-medium text-lg">
            Submit and track your Forest Rights Act claims
          </p>
        </div>

        {/* Auth Form */}
        <div className="forest-card-elevated">
          {/* Mode Toggle */}
          {!otpSent && (
            <div className="flex bg-forest-sage/10 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  authMode === 'login'
                    ? 'bg-forest-gradient text-white shadow-lg'
                    : 'text-forest-medium hover:text-forest-deep'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  authMode === 'signup'
                    ? 'bg-forest-gradient text-white shadow-lg'
                    : 'text-forest-medium hover:text-forest-deep'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Google OAuth Button */}
          {!otpSent && (
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full mb-6 flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          )}

          {/* Divider */}
          {!otpSent && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-forest-sage/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-forest-medium">Or continue with email</span>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          {!otpSent && (
            <form onSubmit={handleEmailPasswordAuth} className="space-y-6">
              {/* Name Field (Signup only) */}
              {authMode === 'signup' && (
                <div className="forest-form-group">
                  <label htmlFor="name" className="forest-form-label">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium pointer-events-none" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="forest-input pl-14"
                      placeholder="Enter your full name"
                      style={{ paddingLeft: '3.5rem' }}
                      required={authMode === 'signup'}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="forest-form-group">
                <label htmlFor="email" className="forest-form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    onChange={handleInputChange}
                    className="forest-input pl-14"
                    style={{ paddingLeft: '3.5rem' }}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="forest-form-group">
                <label htmlFor="password" className="forest-form-label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="forest-input pl-14 pr-12"
                    placeholder="Enter your password"
                    style={{ paddingLeft: '3.5rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-forest-medium hover:text-forest-deep transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="forest-button-primary w-full flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Form */}
          {otpSent && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-forest-sage/20 rounded-full">
                    <Smartphone className="h-8 w-8 text-forest-sage" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-forest-deep mb-2">
                  Verify Your Email
                </h3>
                <p className="text-forest-medium">
                  We've sent a 6-digit code to <strong>{formData.email}</strong>
                </p>
              </div>

              <div className="forest-form-group">
                <label htmlFor="otp" className="forest-form-label">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="forest-input text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || formData.otp.length !== 6}
                className="forest-button-primary w-full flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <CheckCircle className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setAuthMode('login');
                    setFormData(prev => ({ ...prev, otp: '' }));
                  }}
                  className="text-forest-medium hover:text-forest-deep text-sm transition-colors"
                >
                  Didn't receive the code? Try again
                </button>
              </div>
            </form>
          )}

          {/* OTP Login Option */}
          {!otpSent && authMode === 'login' && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setAuthMode('otp')}
                className="text-forest-medium hover:text-forest-deep text-sm transition-colors"
              >
                Sign in with OTP instead
              </button>
            </div>
          )}

          {/* OTP Login Form */}
          {authMode === 'otp' && !otpSent && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-forest-sage/20 rounded-full">
                    <Smartphone className="h-8 w-8 text-forest-sage" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-forest-deep mb-2">
                  Sign in with OTP
                </h3>
                <p className="text-forest-medium">
                  Enter your email to receive a one-time password
                </p>
              </div>

              <div className="forest-form-group">
                <label htmlFor="otp-email" className="forest-form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium pointer-events-none" />
                  <input
                    id="otp-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="forest-input pl-14"
                    placeholder="Enter your email"
                    style={{ paddingLeft: '3.5rem' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="forest-button-primary w-full flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="text-forest-medium hover:text-forest-deep text-sm transition-colors"
                >
                  Back to email/password login
                </button>
              </div>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className="forest-alert-error mt-6">
              <p className="flex items-center">
                <Shield className="h-5 w-5 mr-3" />
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="forest-alert-success mt-6">
              <p className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-3" />
                {success}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-forest-medium text-sm">
            Forest Rights Act Implementation Portal
          </p>
          <p className="text-forest-medium text-xs mt-1">
            Ministry of Tribal Affairs, Government of India
          </p>
        </div>
      </div>
    </div>
  );
});
