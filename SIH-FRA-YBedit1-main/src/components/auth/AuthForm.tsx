import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Shield, TreePine, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface AuthFormProps {
  userType: 'employee' | 'public';
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ userType, onSuccess }) => {
  const { login, signup } = useAuth();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    passkey: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password, userType, formData.passkey);
        setSuccess('Login successful! Redirecting...');
      } else {
        await signup(formData.email, formData.password, formData.name, userType, formData.passkey);
        setSuccess('Account created successfully! You can now login.');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '', name: '', passkey: '' }));
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

  const isEmployee = userType === 'employee';

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
            {isEmployee ? 'Employee Portal' : 'Public Portal'}
          </h1>
          <p className="text-forest-medium text-lg">
            {isEmployee 
              ? 'Access the FRA Atlas Admin Dashboard' 
              : 'Submit and track your FRA claims'
            }
          </p>
        </div>

        {/* Auth Form */}
        <div className="forest-card-elevated">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Toggle Login/Signup */}
            <div className="flex bg-forest-sage/10 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  isLogin
                    ? 'bg-forest-gradient text-white shadow-lg'
                    : 'text-forest-medium hover:text-forest-deep'
                }`}
              >
                {isEmployee ? t('auth.employeeLogin') : t('auth.signIn')}
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  !isLogin
                    ? 'bg-forest-gradient text-white shadow-lg'
                    : 'text-forest-medium hover:text-forest-deep'
                }`}
              >
                {isEmployee ? t('auth.employeeSignup') : t('auth.signUp')}
              </button>
            </div>

            {/* Name Field (Signup only) */}
            {!isLogin && (
              <div className="forest-form-group">
                <label htmlFor="name" className="forest-form-label">
                  {t('auth.name')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium pointer-events-none" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="forest-input pl-12"
                    placeholder={t('auth.enterName')}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="forest-form-group">
              <label htmlFor="email" className="forest-form-label">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  placeholder={t('auth.enterEmail')}
                  onChange={handleInputChange}
                  className="forest-input pl-12"
                  placeholder="Enter your email"
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
                  className="forest-input pl-12 pr-12"
                  placeholder="Enter your password"
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

            {/* Passkey Field (Employee only) */}
            {isEmployee && (
              <div className="forest-form-group">
                <label htmlFor="passkey" className="forest-form-label">
                  Admin Passkey
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-forest-medium pointer-events-none" />
                  <input
                    id="passkey"
                    name="passkey"
                    type={showPasskey ? 'text' : 'password'}
                    value={formData.passkey}
                    onChange={handleInputChange}
                    className="forest-input pl-12 pr-12"
                    placeholder="Enter admin passkey"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-forest-medium hover:text-forest-deep transition-colors"
                  >
                    {showPasskey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="forest-form-help">
                  Required for employee access. Contact administrator if you don't have a passkey.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="forest-alert-error">
                <p className="flex items-center">
                  <Shield className="h-5 w-5 mr-3" />
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="forest-alert-success">
                <p className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  {success}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="forest-button-primary w-full flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="forest-spinner-small"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="forest-card-elevated bg-forest-earth/10 border-forest-earth/30 mt-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-forest-earth/20 rounded-lg">
              <Shield className="h-5 w-5 text-forest-earth" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-forest-deep mb-3">Demo Credentials</h3>
              <div className="space-y-2 text-sm">
                <p className="text-forest-medium">
                  <strong>Email:</strong> admin@fra.gov.in (any email works)
                </p>
                <p className="text-forest-medium">
                  <strong>Password:</strong> Any password
                </p>
                {isEmployee && (
                  <p className="text-forest-medium">
                    <strong>Passkey:</strong> FRA2025
                  </p>
                )}
              </div>
            </div>
          </div>
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