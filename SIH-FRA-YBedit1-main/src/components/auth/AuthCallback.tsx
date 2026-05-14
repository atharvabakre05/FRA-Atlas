import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { AuthService } from '../../services/authService';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface AuthCallbackProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session?.user) {
          // Check if user is admin
          const isAdmin = AuthService.isAdminEmail(data.session.user.email);
          
          if (isAdmin) {
            setStatus('success');
            setMessage('Admin access granted! Redirecting...');
          } else {
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
          }

          // Call success callback after a short delay
          if (onSuccess) {
            setTimeout(() => onSuccess(), 2000);
          }
        } else {
          throw new Error('No session found');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        
        if (onError) {
          onError(error.message || 'Authentication failed');
        }
      }
    };

    handleAuthCallback();
  }, [onSuccess, onError]);

  return (
    <div className="min-h-screen bg-forest-sky forest-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="forest-card-elevated text-center">
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <div className="p-6 bg-forest-sage/20 rounded-3xl">
                <Loader2 className="h-16 w-16 text-forest-sage animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="p-6 bg-green-100 rounded-3xl">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="p-6 bg-red-100 rounded-3xl">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-forest-deep mb-4">
            {status === 'loading' && 'Processing Authentication'}
            {status === 'success' && 'Authentication Successful'}
            {status === 'error' && 'Authentication Failed'}
          </h2>
          
          <p className="text-forest-medium mb-6">
            {message}
          </p>

          {status === 'error' && (
            <button
              onClick={() => window.location.href = '/'}
              className="forest-button-primary"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};