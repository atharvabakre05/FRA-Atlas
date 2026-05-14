import React, { useState, memo, useCallback } from 'react';
import { TreePine, Eye, EyeOff, Loader2, Shield, ArrowLeft, Mail, Smartphone, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface EmployeeLoginProps {
  onBack: () => void;
  role: 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin';
}

export const EmployeeLogin: React.FC<EmployeeLoginProps> = memo(({ onBack, role }) => {
  const { login, loginWithGoogle, sendOTP, verifyOTP, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'otp' | 'verify-otp'>('login');
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passkey: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await login(formData.email, formData.password, role, formData.passkey);
      setSuccess('Login successful! Redirecting...');
    } catch (error) {
      setError('Invalid credentials or PassKey');
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setSuccess('');
    
    try {
      // Persist intended admin role so the auth callback can restore it
      localStorage.setItem('fra-user-type', role);
      await loginWithGoogle();
      setSuccess('Google authentication successful! Redirecting...');
    } catch (error) {
      setError('Google authentication failed');
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await sendOTP(formData.email);
      setOtpSent(true);
      setAuthMode('verify-otp');
      setSuccess('OTP sent to your email! Please check your inbox.');
    } catch (error) {
      setError('Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await verifyOTP(formData.email, formData.otp);
      setSuccess('OTP verified successfully! Redirecting...');
    } catch (error) {
      setError('OTP verification failed');
    }
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  }, []);

  return (
    <div className="min-h-screen bg-forest-sky forest-pattern flex items-center justify-center p-4 relative overflow-hidden">
      <div className="decor-forest"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-forest-medium hover:text-forest-dark transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portal</span>
        </button>

        <div className="text-center">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="p-3 bg-forest-gradient rounded-xl shadow-forest-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-forest-dark">Employee Login</h1>
          </div>
          <div className="flex justify-center items-center space-x-2 mb-6">
            <TreePine className="h-5 w-5 text-forest-medium" />
            <span className="text-sm font-semibold text-forest-medium">FRA Atlas {role === 'gp_admin' ? 'Gram Sabha' : role === 'sdlc_admin' ? 'SDLC' : role === 'dlc_admin' ? 'DLC' : 'SLMC'} Admin Portal</span>
          </div>
          <h2 className="text-2xl text-forest-dark mb-3 font-semibold">
            Access {role === 'gp_admin' ? 'Gram Sabha' : role === 'sdlc_admin' ? 'SDLC' : role === 'dlc_admin' ? 'DLC' : 'SLMC'} Admin Dashboard
          </h2>
          <p className="text-forest-medium text-base">
            Authorized FRA employees can manage claims and approvals
          </p>
        </div>

        <div className="forest-card bg-gradient-to-br from-white to-forest-sage/5 shadow-forest-xl p-8">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full mb-6 flex items-center justify-center space-x-3 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
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

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-forest-sage/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-forest-medium">Or continue with credentials</span>
            </div>
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex bg-forest-sage/10 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                authMode === 'login'
                  ? 'bg-forest-gradient text-white shadow-lg'
                  : 'text-forest-medium hover:text-forest-deep'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('otp')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                authMode === 'otp'
                  ? 'bg-forest-gradient text-white shadow-lg'
                  : 'text-forest-medium hover:text-forest-deep'
              }`}
            >
              OTP Login
            </button>
          </div>

          <>
            {/* Email/Password Form */}
            {authMode === 'login' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="forest-form-label">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="forest-input pl-14"
                      placeholder="Enter your official email"
                      style={{ paddingLeft: '3.5rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="forest-form-label">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="forest-input pl-14 pr-12"
                      placeholder="Enter your password"
                      style={{ paddingLeft: '3.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-forest-medium hover:text-forest-dark transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="passkey" className="forest-form-label">
                    PassKey
                  </label>
                  <div className="relative">
                    <input
                      id="passkey"
                      name="passkey"
                      type={showPasskey ? "text" : "password"}
                      required
                      value={formData.passkey}
                      onChange={handleChange}
                      className="forest-input pr-12"
                      placeholder="Enter your PassKey"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasskey(!showPasskey)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-forest-medium hover:text-forest-dark transition-colors"
                    >
                      {showPasskey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="forest-form-help">
                    Contact your system administrator for PassKey access
                  </p>
                </div>

                {error && (
                  <div className="forest-alert-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full forest-button-primary flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-forest-spin" />}
                  <span>{loading ? 'Signing In...' : `Sign In to ${role === 'gp_admin' ? 'Gram Sabha' : role === 'sdlc_admin' ? 'SDLC' : role === 'dlc_admin' ? 'DLC' : 'SLMC'} Admin Panel`}</span>
                </button>
              </form>
            )}

            {/* OTP Form */}
            {authMode === 'otp' && !otpSent && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-forest-sage/20 rounded-full">
                    <Mail className="h-8 w-8 text-forest-sage" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-forest-deep mb-2">
                  Admin OTP Login
                </h3>
                <p className="text-forest-medium">
                  Enter your admin email to receive a one-time password
                </p>
              </div>

              <div>
                <label htmlFor="otp-email" className="forest-form-label">
                  Admin Email Address
                </label>
                <input
                  id="otp-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="forest-input"
                  placeholder="Enter your admin email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full forest-button-primary flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-forest-spin" />}
                <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
              </button>
            </form>
          )}

          {/* OTP Verification Form */}
          {authMode === 'verify-otp' && otpSent && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-forest-sage/20 rounded-full">
                    <Smartphone className="h-8 w-8 text-forest-sage" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-forest-deep mb-2">
                  Verify Admin OTP
                </h3>
                <p className="text-forest-medium">
                  We've sent a 6-digit code to <strong>{formData.email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="forest-form-label">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={formData.otp}
                  onChange={handleChange}
                  className="forest-input text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || formData.otp.length !== 6}
                className="w-full forest-button-primary flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-forest-spin" />}
                <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setAuthMode('otp');
                    setFormData(prev => ({ ...prev, otp: '' }));
                  }}
                  className="text-forest-medium hover:text-forest-deep text-sm transition-colors"
                >
                  Didn't receive the code? Try again
                </button>
              </div>
            </form>
          )}

            {/* Success Message */}
            {success && (
              <div className="forest-alert-success mt-6">
                <p className="flex items-center">
                  <Shield className="h-5 w-5 mr-3" />
                  {success}
                </p>
              </div>
            )}
          </>

          {/* Minimal footer note, removing demo/admin details */}
          <div className="mt-6 text-center text-sm text-forest-medium">
            <Shield className="h-4 w-4 inline mr-2" />
            Secure access for authorized FRA employees only
          </div>
        </div>
      </div>
    </div>
  );
});
