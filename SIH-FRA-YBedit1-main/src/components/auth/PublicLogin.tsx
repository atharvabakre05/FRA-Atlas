import React, { useState } from 'react';
import { TreePine, Eye, EyeOff, Loader2, Users, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PublicLoginProps {
  onBack: () => void;
}

export const PublicLogin: React.FC<PublicLoginProps> = ({ onBack }) => {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData.email, formData.password, 'public');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-forest-dark">Public Portal</h1>
          </div>
          <div className="flex justify-center items-center space-x-2 mb-6">
            <TreePine className="h-5 w-5 text-forest-medium" />
            <span className="text-sm font-semibold text-forest-medium">FRA Atlas Citizen Portal</span>
          </div>
          <h2 className="text-2xl text-forest-dark mb-3 font-semibold">
            Submit Your FRA Claim
          </h2>
          <p className="text-forest-medium text-base">
            Citizens can upload documents and claim Forest Rights Act benefits
          </p>
        </div>

        <div className="forest-card bg-gradient-to-br from-white to-forest-sage/5 shadow-forest-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="forest-form-label">
                Email Address
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
                  placeholder="Enter your email address"
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
              <span>{loading ? 'Signing In...' : 'Sign In to Submit Claim'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-forest-medium">
              <Users className="h-4 w-4 inline mr-2" />
              Open access for citizens to claim FRA rights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
