import React, { useState } from 'react';
import { 
  Mail, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  Key
} from 'lucide-react';
import { AuthService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';

interface PasswordResetProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({ onBack, onSuccess }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await AuthService.resetPassword(email);
      setEmailSent(true);
      setSuccess('Password reset email sent! Check your inbox.');
      showToast('Password reset email sent!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      showToast(err.message || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError('');
    
    try {
      await AuthService.resetPassword(email);
      setSuccess('Password reset email resent!');
      showToast('Password reset email resent!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-sky forest-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-forest-gradient rounded-3xl shadow-2xl">
              <Key className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-forest-deep mb-2">
            Reset Password
          </h1>
          <p className="text-forest-medium text-lg">
            {emailSent 
              ? 'Check your email for reset instructions'
              : 'Enter your email to receive reset instructions'
            }
          </p>
        </div>

        {/* Reset Form */}
        <div className="forest-card-elevated">
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="forest-input pl-12"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <p className="forest-form-help">
                  We'll send you a link to reset your password
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
                    <span>Sending Reset Email...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-forest-deep mb-2">
                  Email Sent!
                </h3>
                <p className="text-forest-medium">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="w-full forest-button-secondary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Resending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Resend Email</span>
                    </>
                  )}
                </button>

                {onBack && (
                  <button
                    onClick={onBack}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-forest-medium hover:text-forest-deep transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Sign In</span>
                  </button>
                )}
              </div>
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
