import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  User, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  TreePine,
  Smartphone,
  Key
} from 'lucide-react';
import { AuthService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';

interface ModernAuthFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

type AuthMode = 'signin' | 'signup' | 'otp-email' | 'otp-phone' | 'verify-otp';

export const ModernAuthForm: React.FC<ModernAuthFormProps> = ({ onSuccess, onError }) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    otp: ''
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await AuthService.signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      onError?.(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { user } = await AuthService.signInWithEmail(formData.email, formData.password);
      const authUser = AuthService.convertToAuthUser(user);
      setSuccess('Sign in successful!');
      showToast('Welcome back!', 'success');
      onSuccess?.(authUser);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      onError?.(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { user } = await AuthService.signUpWithEmail(formData.email, formData.password, formData.name);
      setSuccess('Account created! Please check your email to verify your account.');
      showToast('Account created successfully!', 'success');
      setMode('signin');
      setFormData(prev => ({ ...prev, password: '', name: '' }));
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
      onError?.(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await AuthService.sendEmailOTP(formData.email);
      setOtpSent(true);
      setMode('verify-otp');
      setCountdown(60);
      setSuccess('OTP sent to your email!');
      showToast('OTP sent to your email', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      onError?.(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await AuthService.sendPhoneOTP(formData.phone);
      setOtpSent(true);
      setMode('verify-otp');
      setCountdown(60);
      setSuccess('OTP sent to your phone!');
      showToast('OTP sent to your phone', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      onError?.(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let user;
      if (formData.email) {
        const { user: emailUser } = await AuthService.verifyOTP(formData.email, formData.otp);
        user = emailUser;
      } else if (formData.phone) {
        const { user: phoneUser } = await AuthService.verifyPhoneOTP(formData.phone, formData.otp);
        user = phoneUser;
      }
      
      if (user) {
        const authUser = AuthService.convertToAuthUser(user);
        setSuccess('OTP verified successfully!');
        showToast('Welcome!', 'success');
        onSuccess?.(authUser);
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
      onError?.(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (formData.email) {
        await AuthService.sendEmailOTP(formData.email);
      } else if (formData.phone) {
        await AuthService.sendPhoneOTP(formData.phone);
      }
      setCountdown(60);
      setSuccess('OTP resent!');
      showToast('OTP resent successfully', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'signin':
        return (
          <form onSubmit={handleEmailSignIn} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="forest-form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="forest-input pl-12"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="forest-form-label">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="forest-input pl-12 pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-forest-medium hover:text-forest-deep"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="forest-button-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        );

      case 'signup':
        return (
          <form onSubmit={handleEmailSignUp} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="forest-form-label">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="forest-input pl-12"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="forest-form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="forest-input pl-12"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="forest-form-label">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="forest-input pl-12 pr-12"
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-forest-medium hover:text-forest-deep"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="forest-form-help">
                  Password must be at least 6 characters long
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="forest-button-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        );

      case 'otp-email':
        return (
          <form onSubmit={handleSendEmailOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="forest-form-label">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="forest-input pl-12"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="forest-button-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send OTP to Email</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        );

      case 'otp-phone':
        return (
          <form onSubmit={handleSendPhoneOTP} className="space-y-6">
            <div>
              <label htmlFor="phone" className="forest-form-label">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="forest-input pl-12"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <p className="forest-form-help">
                Include country code (e.g., +91 for India)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="forest-button-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send OTP to Phone</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        );

      case 'verify-otp':
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="forest-form-label">
                Enter OTP
              </label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium" />
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="forest-input pl-12"
                  placeholder="Enter 6-digit OTP"
                  required
                  maxLength={6}
                />
              </div>
              <p className="forest-form-help">
                OTP sent to {formData.email || formData.phone}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="forest-button-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0}
                className="text-forest-medium hover:text-forest-deep text-sm disabled:opacity-50"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-forest-sky forest-pattern flex items-center justify-center p-6 relative overflow-hidden">
      <div className="decor-forest"></div>
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-forest-gradient rounded-3xl shadow-2xl">
              <TreePine className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-forest-deep mb-2">
            FRA Atlas Portal
          </h1>
          <p className="text-forest-medium text-lg">
            Access your Forest Rights Act claims and benefits
          </p>
        </div>

        {/* Auth Form */}
        <div className="forest-card-elevated">
          {/* Mode Toggle */}
          <div className="flex bg-forest-sage/10 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                mode === 'signin'
                  ? 'bg-forest-gradient text-white shadow-lg'
                  : 'text-forest-medium hover:text-forest-deep'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-forest-gradient text-white shadow-lg'
                  : 'text-forest-medium hover:text-forest-deep'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 border-2 border-forest-sage/20 rounded-xl hover:border-forest-sage/40 transition-all duration-300 mb-6 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-forest-deep font-medium">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-forest-sage/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-forest-medium">or</span>
            </div>
          </div>

          {/* Form */}
          {renderForm()}

          {/* OTP Options */}
          {mode === 'signin' && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setMode('otp-email')}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 text-forest-medium hover:text-forest-deep transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Sign in with Email OTP</span>
              </button>
              <button
                onClick={() => setMode('otp-phone')}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 text-forest-medium hover:text-forest-deep transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                <span>Sign in with Phone OTP</span>
              </button>
            </div>
          )}

          {/* Back to Sign In */}
          {(mode === 'otp-email' || mode === 'otp-phone' || mode === 'verify-otp') && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setMode('signin');
                  setFormData(prev => ({ ...prev, otp: '' }));
                  setOtpSent(false);
                }}
                className="text-forest-medium hover:text-forest-deep text-sm"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="forest-alert-error mt-6">
              <p className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-3" />
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
};
